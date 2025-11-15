'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  generatePracticeTest,
  type GeneratePracticeTestOutput,
} from '@/ai/flows/practice-test-generator';
import {
  generatePracticeTestForChild,
  type GeneratePracticeTestForChildOutput,
} from '@/ai/flows/practice-test-generator';
import { evaluateAnswer } from '@/ai/flows/evaluate-answer';


import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  FileText,
  ArrowRight,
  KeyRound,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useUser } from '@/hooks/use-user-role';
import { Textarea } from '../ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useHistory } from '@/hooks/use-history';

const studentFormSchema = z
  .object({
    board: z.string().min(1, { message: 'Please select a board.' }),
    class: z.string().min(1, { message: 'Please select a class.' }),
    subject: z
      .string()
      .min(1, { message: 'Please select or enter a subject.' }),
    customSubject: z.string().optional(),
    topic: z.string().min(2, { message: 'Topic must be at least 2 characters.' }),
    numberOfQuestions: z.number().min(1).max(20),
  })
  .refine(
    (data) => {
      if (data.subject === 'other') {
        return data.customSubject && data.customSubject.length > 0;
      }
      return true;
    },
    {
      message: 'Please specify the subject.',
      path: ['customSubject'],
    }
  );

const parentFormSchema = z.object({
  studentId: z.string().min(1, { message: 'Please enter a student UID.' }),
  topic: z.string().min(3, { message: 'Please enter a topic.' }),
  numberOfQuestions: z.number().min(1).max(20),
  timeLimit: z.number().min(5).max(120),
});

type TestOutput = (
  | GeneratePracticeTestOutput
  | GeneratePracticeTestForChildOutput
) & { answerKey?: { question: string; answer: string }[] };

type StudentAnswers = { [key: number]: string };
type AnswerCorrectness = { [key: number]: boolean };

const subjectMap: Record<string, string[]> = {
    '6th Grade': ['Mathematics', 'Science', 'English', 'History', 'Geography'],
    '7th Grade': ['Mathematics', 'Science', 'English', 'History', 'Geography'],
    '8th Grade': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Civics'],
    '9th Grade': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Economics'],
    '10th Grade': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Economics', 'Computer Science'],
    '11th Grade': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'English', 'Accountancy', 'Business Studies', 'Economics'],
    '12th Grade': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'English', 'Accountancy', 'Business Studies', 'Economics'],
    'Undergraduate': ['Computer Science', 'Engineering', 'Medicine', 'Business', 'Arts', 'Law'],
  };

export function TestGenerator() {
  const { userRole } = useUser();
  if (userRole === 'Parent') {
    return <ParentTestGenerator />;
  }
  return <StudentTestGenerator />;
}

function StudentTestGenerator() {
  const { toast } = useToast();
  const { addHistoryItem } = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [test, setTest] = useState<GeneratePracticeTestOutput | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswers>({});
  const [answersSubmitted, setAnswersSubmitted] = useState(false);
  const [answerCorrectness, setAnswerCorrectness] = useState<AnswerCorrectness>({});
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [formValues, setFormValues] = useState<z.infer<typeof studentFormSchema> | null>(null);


  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (startTime && !endTime) {
      timer = setInterval(() => {
        setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }, 1000);
    } else if (endTime) {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [startTime, endTime]);


  const form = useForm<z.infer<typeof studentFormSchema>>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      board: 'CBSE',
      class: '10th Grade',
      subject: 'Mathematics',
      customSubject: '',
      topic: 'Algebra',
      numberOfQuestions: 5,
    },
  });

  const watchClass = form.watch('class');
  const watchSubject = form.watch('subject');
  const [availableSubjects, setAvailableSubjects] = useState(subjectMap[form.getValues('class')] || []);

  useEffect(() => {
    const selectedClass = form.getValues('class');
    const newSubjects = subjectMap[selectedClass] || [];
    setAvailableSubjects(newSubjects);
    // Reset subject if it's not in the new list
    if (!newSubjects.includes(form.getValues('subject')) && form.getValues('subject') !== 'other') {
      form.setValue('subject', newSubjects[0] || '');
    }
  }, [watchClass, form]);


  async function onSubmit(values: z.infer<typeof studentFormSchema>) {
    setIsLoading(true);
    setTest(null);
    setStudentAnswers({});
    setAnswersSubmitted(false);
    setScore(0);
    setAnswerCorrectness({});
    setStartTime(null);
    setEndTime(null);
    setElapsedTime(0);
    
    const finalSubject = values.subject === 'other' ? values.customSubject! : values.subject;
    setFormValues({...values, subject: finalSubject});


    try {
      const result = await generatePracticeTest({
        class: `${values.class} (${values.board})`,
        subject: finalSubject,
        topic: values.topic,
        numberOfQuestions: values.numberOfQuestions,
      });
      setTest(result);
      setStartTime(new Date());

      toast({
        title: 'Practice Test Generated!',
        description: 'Your custom test is ready to go. The timer has started.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Generating Test',
        description: 'There was an issue creating your test. Please try again.',
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAnswerChange = (index: number, value: string) => {
    setStudentAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const handleSubmitAnswers = async () => {
    if (!test?.answerKey || !formValues) return;
    setIsSubmitting(true);
    const submissionTime = new Date();
    setEndTime(submissionTime);
    const finalElapsedTime = Math.floor((submissionTime.getTime() - (startTime?.getTime() ?? submissionTime.getTime())) / 1000);
    setElapsedTime(finalElapsedTime);


    let correctAnswers = 0;
    const correctness: AnswerCorrectness = {};

    for (let i = 0; i < test.answerKey.length; i++) {
        const item = test.answerKey[i];
        const studentAnswer = studentAnswers[i] || '';

        try {
            const evaluation = await evaluateAnswer({
                question: item.question,
                studentAnswer: studentAnswer,
                correctAnswer: item.answer,
            });
            correctness[i] = evaluation.isCorrect;
            if (evaluation.isCorrect) {
                correctAnswers++;
            }
        } catch (error) {
            console.error(`Error evaluating answer for question ${i + 1}:`, error);
            // Fallback to simple check on error
            correctness[i] = studentAnswer.trim().toLowerCase() === item.answer.trim().toLowerCase();
            if (correctness[i]) {
                correctAnswers++;
            }
        }
    }

    setAnswerCorrectness(correctness);
    setScore(correctAnswers);
    setAnswersSubmitted(true);
    setIsSubmitting(false);

    addHistoryItem({
        type: 'Practice Test',
        title: `Test on: ${formValues.topic}`,
        content: test.answerKey,
        score: correctAnswers,
        duration: finalElapsedTime,
        subject: formValues.subject,
        topic: formValues.topic,
    });

    toast({
      title: 'Answers Submitted!',
      description: 'You can now view the answer key and your results.',
    });
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  }

  const isCorrect = (index: number) => {
    return answerCorrectness[index] === true;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-accent" />
          Generate a Practice Test
        </CardTitle>
        <CardDescription>
          Select your board, class, subject, and topic to generate a custom
          test.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="board"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Board</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a board" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CBSE">CBSE</SelectItem>
                        <SelectItem value="ICSE">ICSE</SelectItem>
                        <SelectItem value="State Board">State Board</SelectItem>
                        <SelectItem value="IB">
                          IB (International Baccalaureate)
                        </SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="6th Grade">6th Grade</SelectItem>
                        <SelectItem value="7th Grade">7th Grade</SelectItem>
                        <SelectItem value="8th Grade">8th Grade</SelectItem>
                        <SelectItem value="9th Grade">9th Grade</SelectItem>
                        <SelectItem value="10th Grade">10th Grade</SelectItem>
                        <SelectItem value="11th Grade">11th Grade</SelectItem>
                        <SelectItem value="12th Grade">12th Grade</SelectItem>
                        <SelectItem value="Undergraduate">
                          Undergraduate
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableSubjects.map((subject) => (
                            <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchSubject === 'other' && (
                <FormField
                  control={form.control}
                  name="customSubject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter a subject" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 'Algebra', 'Thermodynamics', or 'The Cold War'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="numberOfQuestions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Questions: {field.value}</FormLabel>
                  <FormControl>
                    <Slider
                      min={1}
                      max={20}
                      step={1}
                      defaultValue={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate Test
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      {test && test.answerKey && (
        <CardFooter
          className={cn(
            'transition-all duration-500 ease-in-out',
            test ? 'opacity-100' : 'opacity-0'
          )}
        >
          <Card className="w-full bg-muted/50">
            <CardHeader>
                <div className='flex justify-between items-start'>
                    <div>
                        <CardTitle>Your Practice Test</CardTitle>
                        <CardDescription>
                            Enter your answers below and submit to see the answer key.
                        </CardDescription>
                    </div>
                     <div className="flex items-center gap-2 text-lg font-semibold text-muted-foreground">
                        <Clock className="h-5 w-5" />
                        <span>{formatTime(elapsedTime)}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {test.answerKey.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-start gap-4">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mt-1">
                      {index + 1}
                    </span>
                    <p className="flex-1 font-medium">{item.question}</p>
                  </div>
                  <div className="pl-10">
                    <Textarea
                      placeholder="Type your answer here..."
                      value={studentAnswers[index] || ''}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      disabled={answersSubmitted || isSubmitting}
                    />
                  </div>
                </div>
              ))}
              <Button onClick={handleSubmitAnswers} disabled={answersSubmitted || isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Evaluating...
                    </>
                ) : (
                    <>
                        <Upload className="mr-2 h-4 w-4" />
                        Submit Your Answers
                    </>
                )}
              </Button>
            </CardContent>
            {answersSubmitted && (
              <CardFooter className="flex-col items-start gap-4">
                 <Card className='w-full'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-xl'>
                            <BarChart3 className="h-5 w-5" />
                            Test Analytics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='flex gap-8'>
                        <div>
                            <p className='text-sm text-muted-foreground'>Score</p>
                            <p className='text-2xl font-bold'>{score} / {test.answerKey.length}</p>
                        </div>
                         <div>
                            <p className='text-sm text-muted-foreground'>Percentage</p>
                            <p className='text-2xl font-bold'>{((score / test.answerKey.length) * 100).toFixed(0)}%</p>
                        </div>
                        <div>
                            <p className='text-sm text-muted-foreground'>Time Taken</p>
                            <p className='text-2xl font-bold'>{formatTime(elapsedTime)}</p>
                        </div>
                    </CardContent>
                </Card>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Show Answer Key & Compare</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-6 mt-4">
                        {test.answerKey.map((item, index) => (
                          <li key={index}>
                            <p className="font-semibold">
                              {index + 1}. {item.question}
                            </p>
                            <div className="mt-2 p-3 rounded-md bg-background/50 border border-input relative">
                               <div className='absolute top-2 right-2'>
                                  {isCorrect(index) ? (
                                        <Badge variant="secondary" className='bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'>
                                            <CheckCircle className="mr-1 h-3 w-3" />
                                            Correct
                                        </Badge>
                                  ) : (
                                        <Badge variant="destructive">
                                            <XCircle className="mr-1 h-3 w-3" />
                                            Incorrect
                                        </Badge>
                                  )}
                               </div>

                              <p className="text-sm font-medium">Your Answer:</p>
                              <p className="text-sm text-muted-foreground pr-20">
                                {studentAnswers[index] || 'No answer provided.'}
                              </p>
                            </div>
                            {!isCorrect(index) && (
                                <div className="mt-2 p-3 rounded-md bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
                                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                    Correct Answer:
                                </p>
                                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                    {item.answer}
                                 </p>
                                </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardFooter>
            )}
          </Card>
        </CardFooter>
      )}
    </Card>
  );
}

function ParentTestGenerator() {
  const { toast } = useToast();
  const { addHistoryItem } = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [test, setTest] = useState<TestOutput | null>(null);

  const form = useForm<z.infer<typeof parentFormSchema>>({
    resolver: zodResolver(parentFormSchema),
    defaultValues: {
      studentId: 'user-123',
      topic: 'Algebra Basics',
      numberOfQuestions: 5,
      timeLimit: 30,
    },
  });

  async function onSubmit(values: z.infer<typeof parentFormSchema>) {
    setIsLoading(true);
    setTest(null);
    try {
      const result = await generatePracticeTestForChild(values);
      setTest(result);
      addHistoryItem({
        type: 'Practice Test',
        title: `Test for ${values.studentId} on: ${values.topic}`,
        content: result.answerKey,
      });
      toast({
        title: 'Practice Test Generated!',
        description: `A test on ${values.topic} has been created for your child.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Generating Test',
        description: 'There was an issue creating the test. Please try again.',
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-accent" />
          Generate a Practice Test for Your Child
        </CardTitle>
        <CardDescription>
          Create a timed test with an answer key on a specific topic for your
          child.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student User ID</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="e.g., user-123"
                        {...field}
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Topic</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 'Fractions' or 'World War II'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timeLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Limit (minutes): {field.value}</FormLabel>
                  <FormControl>
                    <Slider
                      min={5}
                      max={120}
                      step={5}
                      defaultValue={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numberOfQuestions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Questions: {field.value}</FormLabel>
                  <FormControl>
                    <Slider
                      min={1}
                      max={20}
                      step={1}
                      defaultValue={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate Test
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      {test && test.answerKey && (
        <CardFooter>
          <Card className="w-full bg-muted/50">
            <CardHeader>
              <CardTitle>Generated Practice Test</CardTitle>
              <CardDescription>
                Time Limit: {form.getValues('timeLimit')} minutes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-4">Questions</h3>
              <ul className="space-y-4 mb-6">
                {test.answerKey.map((item, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mt-1">
                      {index + 1}
                    </span>
                    <p className="flex-1">{item.question}</p>
                  </li>
                ))}
              </ul>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Show Answer Key</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-4 mt-4">
                      {test.answerKey.map((item, index) => (
                        <li key={index}>
                          <p className="font-semibold">
                            {index + 1}. {item.question}
                          </p>
                          <p className="text-emerald-600 dark:text-emerald-400 pl-6">
                            Answer: {item.answer}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </CardFooter>
      )}
    </Card>
  );
}

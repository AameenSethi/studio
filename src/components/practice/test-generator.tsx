'use client';

import { useState } from 'react';
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
import { Loader2, FileText, ArrowRight, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useUser } from '@/hooks/use-user-role';

const studentFormSchema = z.object({
    board: z.string().min(1, { message: 'Please select a board.' }),
    class: z.string().min(1, { message: 'Please select a class.' }),
    subject: z.string().min(1, { message: 'Please select or enter a subject.' }),
    customSubject: z.string().optional(),
    topic: z.string().min(2, { message: 'Topic must be at least 2 characters.' }),
    numberOfQuestions: z.number().min(1).max(20),
  }).refine(data => {
      if (data.subject === 'other') {
          return data.customSubject && data.customSubject.length > 0;
      }
      return true;
  }, {
      message: 'Please specify the subject.',
      path: ['customSubject'],
  });

const parentFormSchema = z.object({
    studentId: z.string().min(1, { message: 'Please enter a student UID.' }),
    topic: z.string().min(3, { message: 'Please enter a topic.' }),
    numberOfQuestions: z.number().min(1).max(20),
    timeLimit: z.number().min(5).max(120),
});

type TestOutput = (GeneratePracticeTestOutput | GeneratePracticeTestForChildOutput) & { answerKey?: { question: string, answer: string }[] };

export function TestGenerator() {
    const { userRole } = useUser();
    if (userRole === 'Parent') {
        return <ParentTestGenerator />;
    }
    return <StudentTestGenerator />;
}

function StudentTestGenerator() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [test, setTest] = useState<GeneratePracticeTestOutput | null>(null);

  const form = useForm<z.infer<typeof studentFormSchema>>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      board: 'CBSE',
      class: '10th Grade',
      subject: 'Mathematics',
      customSubject: '',
      topic: 'Algebra',
      numberOfQuestions: 10,
    },
  });

  const watchSubject = form.watch('subject');

  async function onSubmit(values: z.infer<typeof studentFormSchema>) {
    setIsLoading(true);
    setTest(null);

    const subject = values.subject === 'other' ? values.customSubject! : values.subject;

    try {
      const result = await generatePracticeTest({
          class: `${values.class} (${values.board})`,
          subject: subject,
          topic: values.topic,
          numberOfQuestions: values.numberOfQuestions,
      });
      setTest(result);
      toast({
        title: 'Practice Test Generated!',
        description: 'Your custom test is ready to go.',
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-accent" />
          Generate a Practice Test
        </CardTitle>
        <CardDescription>
          Select your board, class, subject, and topic to generate a custom test.
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select a board" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="CBSE">CBSE</SelectItem>
                            <SelectItem value="ICSE">ICSE</SelectItem>
                            <SelectItem value="State Board">State Board</SelectItem>
                            <SelectItem value="IB">IB (International Baccalaureate)</SelectItem>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <SelectItem value="Undergraduate">Undergraduate</SelectItem>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Mathematics">Mathematics</SelectItem>
                            <SelectItem value="Physics">Physics</SelectItem>
                            <SelectItem value="Chemistry">Chemistry</SelectItem>
                            <SelectItem value="Biology">Biology</SelectItem>
                            <SelectItem value="Science">Science</SelectItem>
                            <SelectItem value="History">History</SelectItem>
                            <SelectItem value="Geography">Geography</SelectItem>
                            <SelectItem value="Civics">Civics</SelectItem>
                            <SelectItem value="Economics">Economics</SelectItem>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Computer Science">Computer Science</SelectItem>
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
      {test && test.testQuestions.length > 0 && (
        <CardFooter
          className={cn(
            'transition-all duration-500 ease-in-out',
            test ? 'opacity-100' : 'opacity-0'
          )}
        >
          <Card className="w-full bg-muted/50">
            <CardHeader>
              <CardTitle>Your Practice Test</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {test.testQuestions.map((q, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mt-1">
                      {index + 1}
                    </span>
                    <p className="flex-1">{q}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </CardFooter>
      )}
    </Card>
  );
}

function ParentTestGenerator() {
    const { toast } = useToast();
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
                    Create a timed test with an answer key on a specific topic for your child.
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
                                            <Input placeholder="e.g., user-123" {...field} className="pl-10" />
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
                                        <Input placeholder="e.g., 'Fractions' or 'World War II'" {...field} />
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
                            <CardDescription>Time Limit: {form.getValues('timeLimit')} minutes</CardDescription>
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
                                                <p className="font-semibold">{index + 1}. {item.question}</p>
                                                <p className="text-emerald-600 dark:text-emerald-400 pl-6">Answer: {item.answer}</p>
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

    
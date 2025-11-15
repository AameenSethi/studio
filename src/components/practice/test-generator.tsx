'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  generatePracticeTest,
  type GeneratePracticeTestOutput,
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  studyPlan: z.string().min(10, {
    message: 'Please provide some study plan details.',
  }),
  learningHistory: z.string().min(10, {
    message: 'Please provide some learning history.',
  }),
  numberOfQuestions: z.number().min(1).max(20),
});

export function TestGenerator() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [test, setTest] = useState<GeneratePracticeTestOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studyPlan: 'Focus on advanced calculus, specifically differentiation and integration techniques. Review linear algebra basics.',
      learningHistory: 'Scored well on differentiation quizzes, but struggled with integration by parts. Has not studied linear algebra recently.',
      numberOfQuestions: 10,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setTest(null);
    try {
      const result = await generatePracticeTest(values);
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
          The AI will generate questions based on your study plan and past performance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="studyPlan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Study Plan Focus</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What topics are you focusing on?"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="learningHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Learning History / Weaknesses</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What have you struggled with recently?"
                      className="resize-none"
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

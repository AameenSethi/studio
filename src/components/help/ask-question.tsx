'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  askQuestion,
  type AskQuestionOutput,
} from '@/ai/flows/ask-a-question';

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
import { useToast } from '@/hooks/use-toast';
import { Loader2, HelpCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';


const formSchema = z.object({
  question: z.string().min(5, {
    message: 'Please ask a question that is at least 5 characters long.',
  }),
});

const AnswerDisplay = ({ text }: { text: string }) => {
    const elements: JSX.Element[] = [];
    const lines = text.split('\n');
    let currentList: string[] = [];

    const renderList = () => {
        if (currentList.length > 0) {
            elements.push(
                <ul key={`ul-${elements.length}`} className="list-disc pl-6 my-2 space-y-1">
                    {currentList.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            );
            currentList = [];
        }
    };

    lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
            renderList();
            elements.push(<h3 key={`h3-${index}`} className="text-lg font-semibold mt-4 mb-2 text-primary">{trimmedLine.replace(/\*\*/g, '')}</h3>);
        } else if (trimmedLine.startsWith('* ')) {
            currentList.push(trimmedLine.substring(2));
        } else if (trimmedLine === '') {
            renderList();
            if (elements.length > 0 && lines[index-1]?.trim() !== '') {
                elements.push(<div key={`br-${index}`} className="h-4" />);
            }
        } else {
            renderList();
            elements.push(<p key={`p-${index}`} className="leading-relaxed">{trimmedLine}</p>);
        }
    });

    renderList();
    return <div className="prose prose-sm max-w-none dark:prose-invert">{elements}</div>;
};

export function AskQuestion() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AskQuestionOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await askQuestion(values);
      setResult(response);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Getting Answer',
        description: 'There was an issue getting an answer. Please try again.',
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
          <HelpCircle className="h-6 w-6 text-accent" />
          Ask a Question
        </CardTitle>
        <CardDescription>
          Have a question about StudyPal? Ask our AI assistant for help.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Your Question</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 'How do I see my practice test history?'"
                      {...field}
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
                  Thinking...
                </>
              ) : (
                <>
                  Get Answer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      {(isLoading || result) && (
        <CardFooter
          className={cn(
            'transition-all duration-500 ease-in-out',
            (isLoading || result) ? 'opacity-100' : 'opacity-0'
          )}
        >
          <Card className="w-full bg-muted/50">
            <CardHeader>
              <CardTitle>Answer</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex items-center space-x-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Finding the best answer for you...</span>
                </div>
              )}
              {result && (
                <AnswerDisplay text={result.answer} />
              )}
            </CardContent>
          </Card>
        </CardFooter>
      )}
    </Card>
  );
}

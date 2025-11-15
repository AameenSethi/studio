'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  intelligentExplanation,
  type IntelligentExplanationOutput,
} from '@/ai/flows/intelligent-explanations';
import {
  textToSpeech,
  type TextToSpeechOutput,
} from '@/ai/flows/text-to-speech';

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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lightbulb, ArrowRight, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHistory } from '@/hooks/use-history';

const formSchema = z.object({
  topic: z.string().min(5, {
    message: 'Please describe the topic in at least 5 characters.',
  }),
});

export function ExplanationGenerator() {
  const { toast } = useToast();
  const { addHistoryItem } = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [explanation, setExplanation] =
    useState<IntelligentExplanationOutput | null>(null);
  const [audioData, setAudioData] = useState<TextToSpeechOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setExplanation(null);
    setAudioData(null);
    try {
      const result = await intelligentExplanation(values);
      setExplanation(result);
      addHistoryItem({
        type: 'Explanation',
        title: `Explanation of: ${values.topic}`,
        content: result.explanation,
      });
      toast({
        title: 'Explanation Ready!',
        description: `We've broken down ${values.topic} for you.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Generating Explanation',
        description: 'There was an issue creating the explanation. Please try again.',
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTextToSpeech() {
    if (!explanation) return;
    setIsGeneratingSpeech(true);
    setAudioData(null);
    try {
      const result = await textToSpeech({ text: explanation.explanation });
      setAudioData(result);
      toast({
        title: 'Audio Ready!',
        description: 'The explanation is ready to be played.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Generating Audio',
        description: 'There was an issue creating the audio. Please try again.',
      });
      console.error(error);
    } finally {
      setIsGeneratingSpeech(false);
    }
  }

  const ExplanationDisplay = ({ text }: { text: string }) => {
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        {text.split('\n\n').map((paragraph, i) => {
            const lines = paragraph.split('\n').map((line, j) => {
                 if (line.startsWith('**') && line.endsWith('**')) {
                    return <h3 key={j} className="text-xl font-semibold mt-4 mb-2 text-primary">{line.replace(/\*\*/g, '')}</h3>
                }
                if (line.startsWith('* ')) {
                    return <li key={j} className="ml-4 list-disc">{line.substring(2)}</li>
                }
                return <span key={j}>{line}<br /></span>
            })
            return <p key={i}>{lines}</p>
        })}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-accent" />
          Explanation Generator
        </CardTitle>
        <CardDescription>
          Enter a topic you want to understand better.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic to Explain</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 'Quantum Entanglement' or 'The Krebs Cycle'"
                      className="resize-none"
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
                  Generating...
                </>
              ) : (
                <>
                  Explain Topic
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      {explanation && (
        <CardFooter
          className={cn(
            'transition-all duration-500 ease-in-out',
            explanation ? 'opacity-100' : 'opacity-0'
          )}
        >
          <Card className="w-full bg-muted/50">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Here&apos;s the Breakdown</CardTitle>
              <Button onClick={handleTextToSpeech} disabled={isGeneratingSpeech} variant="outline" size="sm">
                {isGeneratingSpeech ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Volume2 className="mr-2 h-4 w-4" />
                )}
                Listen
              </Button>
            </CardHeader>
            <CardContent>
                <ExplanationDisplay text={explanation.explanation} />
                {audioData?.audio && (
                  <div className="mt-4">
                    <audio controls src={audioData.audio} className="w-full" />
                  </div>
                )}
            </CardContent>
          </Card>
        </CardFooter>
      )}
    </Card>
  );
}

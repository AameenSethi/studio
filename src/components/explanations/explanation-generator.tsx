'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Image from 'next/image';
import {
  intelligentExplanation,
  type IntelligentExplanationOutput,
} from '@/ai/flows/intelligent-explanations';

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lightbulb, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const formSchema = z.object({
  topic: z.string().min(5, {
    message: 'Please describe the topic in at least 5 characters.',
  }),
  learningFormat: z.enum(['text', 'video', 'diagrams'], {
    required_error: 'You need to select a learning format.',
  }),
});

export function ExplanationGenerator() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] =
    useState<IntelligentExplanationOutput | null>(null);
  const [submittedFormat, setSubmittedFormat] = useState<string | null>(null);
  const diagramImage = PlaceHolderImages.find(
    (img) => img.id === 'explanation-diagram'
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setExplanation(null);
    setSubmittedFormat(values.learningFormat);
    try {
      const result = await intelligentExplanation(values);
      setExplanation(result);
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

  const ExplanationContent = () => {
    if (!explanation) return null;

    if (submittedFormat === 'diagrams' && diagramImage) {
      return (
        <>
          <div className="prose prose-sm max-w-none dark:prose-invert mb-4">
            <ExplanationDisplay text={explanation.explanation} />
          </div>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
            <Image
              src={diagramImage.imageUrl}
              alt={diagramImage.description}
              layout="fill"
              objectFit="cover"
              data-ai-hint={diagramImage.imageHint}
            />
          </div>
        </>
      );
    }

    if (submittedFormat === 'video') {
      return (
        <>
          <div className="prose prose-sm max-w-none dark:prose-invert mb-4">
            <ExplanationDisplay text={explanation.explanation} />
          </div>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-slate-800 flex items-center justify-center">
            <div className="text-white text-center">
              <p>Video explanation placeholder</p>
              <p className="text-sm text-slate-400">
                Content would be loaded here.
              </p>
            </div>
          </div>
        </>
      );
    }

    return <ExplanationDisplay text={explanation.explanation} />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-accent" />
          Explanation Generator
        </CardTitle>
        <CardDescription>
          Enter a topic you want to understand better and choose your preferred learning style.
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
            <FormField
              control={form.control}
              name="learningFormat"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Preferred Learning Format</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col sm:flex-row gap-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="text" />
                        </FormControl>
                        <FormLabel className="font-normal">Text</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="video" />
                        </FormControl>
                        <FormLabel className="font-normal">Video</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="diagrams" />
                        </FormControl>
                        <FormLabel className="font-normal">Diagrams</FormLabel>
                      </FormItem>
                    </RadioGroup>
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
            <CardHeader>
              <CardTitle>Here&apos;s the Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
                <ExplanationContent />
            </CardContent>
          </Card>
        </CardFooter>
      )}
    </Card>
  );
}

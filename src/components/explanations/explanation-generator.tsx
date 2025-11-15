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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lightbulb, ArrowRight, Volume2, Download, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHistory } from '@/hooks/use-history';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const formSchema = z.object({
  topic: z.string().min(1, {
    message: 'Please enter a topic.',
  }),
  explanationLevel: z.enum(['Simple', 'Detailed', 'Expert']),
});

export function ExplanationGenerator() {
  const { toast } = useToast();
  const { addHistoryItem } = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [explanation, setExplanation] =
    useState<IntelligentExplanationOutput | null>(null);
  const [audioData, setAudioData] = useState<TextToSpeechOutput | null>(null);
  const [formValues, setFormValues] = useState<z.infer<typeof formSchema> | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        topic: '',
        explanationLevel: 'Detailed',
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setExplanation(null);
    setAudioData(null);
    setFormValues(values);
    try {
      const result = await intelligentExplanation(values);
      setExplanation(result);
      addHistoryItem({
        type: 'Explanation',
        title: `Explanation of: ${values.topic}`,
        content: result, // Store the full object
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
        const fullText = `${explanation.summary}\n\n${explanation.detailedExplanation}\n\nAnalogy: ${explanation.analogy}`;
      const result = await textToSpeech({ text: fullText });
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

  const handleDownload = () => {
    if (!explanation || !formValues) return;

    const textContent = `Topic: ${formValues.topic}\nLevel: ${formValues.explanationLevel}\n\n--- SUMMARY ---\n${explanation.summary}\n\n--- DETAILED EXPLANATION ---\n${explanation.detailedExplanation}\n\n--- ANALOGY ---\n${explanation.analogy}`;

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formValues.topic.replace(/ /g, '_')}_explanation.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  const ExplanationDisplay = ({ text }: { text: string }) => {
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        {text.split('\n\n').map((paragraph, i) => (
          <p key={i}>
            {paragraph.split('\n').map((line, j) => {
              if (line.startsWith('**') && line.endsWith('**')) {
                return (
                  <h3
                    key={j}
                    className="text-xl font-semibold mt-4 mb-2 text-primary"
                  >
                    {line.replace(/\*\*/g, '')}
                  </h3>
                );
              }
              if (line.startsWith('* ')) {
                return (
                  <ul key={j} className="list-disc pl-5">
                    <li>{line.substring(2)}</li>
                  </ul>
                );
              }
              return (
                <span key={j}>
                  {line}
                  <br />
                </span>
              );
            })}
          </p>
        ))}
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
            <FormField
                control={form.control}
                name="explanationLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level of Detail</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a level of detail" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Simple">Simple</SelectItem>
                        <SelectItem value="Detailed">Detailed</SelectItem>
                        <SelectItem value="Expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
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
              <TooltipProvider>
                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={handleTextToSpeech} disabled={isGeneratingSpeech} variant="outline" size="sm">
                          {isGeneratingSpeech ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                              <Volume2 className="mr-2 h-4 w-4" />
                          )}
                          Listen
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Listen to the explanation</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={handleDownload} variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download as .txt</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-background/50 border italic">
                    <p>{explanation.summary}</p>
                </div>
                <div className='p-4 rounded-lg bg-background/50 border'>
                    <ExplanationDisplay text={explanation.detailedExplanation} />
                </div>
                <Card className="bg-background/50">
                    <CardHeader className="flex-row items-center gap-2 pb-2">
                        <Quote className="h-5 w-5 text-accent"/>
                        <CardTitle className="text-lg">Analogy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{explanation.analogy}</p>
                    </CardContent>
                </Card>
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

'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  generatePersonalizedStudyPlan,
  type PersonalizedStudyPlanOutput,
} from '@/ai/flows/personalized-study-plan';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  goals: z.string().min(10, {
    message: 'Please describe your goals in at least 10 characters.',
  }),
  deadline: z.string().min(3, {
    message: 'Please provide a deadline.',
  }),
  learningPace: z.enum(['slow', 'moderate', 'fast']),
});

export function PersonalizedStudyPlan() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [studyPlan, setStudyPlan] =
    useState<PersonalizedStudyPlanOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goals: '',
      deadline: '',
      learningPace: 'moderate',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setStudyPlan(null);
    try {
      const result = await generatePersonalizedStudyPlan(values);
      setStudyPlan(result);
      toast({
        title: 'Study Plan Generated!',
        description: 'Your personalized study plan is ready.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Generating Plan',
        description:
          'There was an issue creating your study plan. Please try again.',
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const PlanDisplay = ({ plan }: { plan: string }) => {
    // Simple markdown-like parsing
    const lines = plan.split('\n').map((line, index) => {
        if (line.startsWith('**') && line.endsWith('**')) {
            return <h3 key={index} className="text-xl font-semibold mt-4 mb-2 text-primary">{line.replace(/\*\*/g, '')}</h3>
        }
        if (line.startsWith('* ')) {
            return <li key={index} className="ml-4 list-disc">{line.substring(2)}</li>
        }
        return <p key={index} className="mb-2">{line}</p>
    })

    return <>{lines}</>
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-accent" />
          Create Your Personalized Study Plan
        </CardTitle>
        <CardDescription>
          Let our AI craft the perfect study schedule to help you achieve your
          goals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>What are your learning goals?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'Pass the calculus final exam' or 'Learn the basics of React'"
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
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What is your deadline?</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 'In 3 weeks' or 'By December 15th'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="learningPace"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Learning Pace</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a pace" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="slow">Slow & Steady</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="fast">Fast-paced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate Plan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      {studyPlan && (
        <CardFooter
          className={cn(
            'transition-all duration-500 ease-in-out',
            studyPlan ? 'opacity-100' : 'opacity-0'
          )}
        >
          <Card className="w-full bg-muted/50">
            <CardHeader>
              <CardTitle>Your Custom Study Plan</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <PlanDisplay plan={studyPlan.studyPlan} />
            </CardContent>
          </Card>
        </CardFooter>
      )}
    </Card>
  );
}

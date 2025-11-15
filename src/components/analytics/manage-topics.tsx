'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTrackedTopics } from '@/hooks/use-tracked-topics';
import {
  Card,
  CardContent,
  CardDescription,
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
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ListChecks } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';

const formSchema = z.object({
  topic: z.string().min(2, {
    message: 'Topic must be at least 2 characters.',
  }),
});

export function ManageTopics() {
  const { toast } = useToast();
  const { trackedTopics, addTopic, removeTopic } = useTrackedTopics();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      addTopic(values.topic);
      toast({
        title: 'Topic Added',
        description: `"${values.topic}" is now being tracked for mastery.`,
      });
      form.reset();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to Add Topic',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleDelete = (topic: string) => {
    removeTopic(topic);
    toast({
      title: 'Topic Removed',
      description: `"${topic}" is no longer being tracked.`,
    });
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks />
          Manage Tracked Topics
        </CardTitle>
        <CardDescription>
          Add or remove subjects or topics to customize your analytics dashboard. Performance
          is automatically tracked for these items.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-4 items-start mb-6">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormLabel className="sr-only">New Topic</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 'Mathematics', 'Calculus', or 'World History'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </form>
        </Form>
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Currently Tracked Items:</h4>
          {trackedTopics.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {trackedTopics.map((topic) => (
                <Badge key={topic} variant="secondary" className="pl-3 pr-1 py-1 text-sm">
                  {topic}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-1 rounded-full"
                    onClick={() => handleDelete(topic)}
                  >
                    <Trash2 className="h-3 w-3" />
                    <span className="sr-only">Remove {topic}</span>
                  </Button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No items are being tracked. Add one above to get started!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

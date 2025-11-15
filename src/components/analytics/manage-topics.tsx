'use client';

import { useState } from 'react';
import { useTrackedTopics } from '@/hooks/use-tracked-topics';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, X, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ManageTrackedTopics() {
  const { trackedTopics, addTrackedTopic, removeTrackedTopic } = useTrackedTopics();
  const [newTopic, setNewTopic] = useState('');
  const { toast } = useToast();

  const handleAddTopic = () => {
    if (newTopic.trim()) {
      try {
        addTrackedTopic(newTopic.trim());
        setNewTopic('');
        toast({
          title: 'Topic Added',
          description: `"${newTopic.trim()}" is now being tracked.`,
        });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message,
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List />
          Manage Tracked Topics
        </CardTitle>
        <CardDescription>
          Add or remove topics to display in your analytics charts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="e.g., Algebra"
          />
          <Button onClick={handleAddTopic} size="icon">
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {trackedTopics.length > 0 ? (
            trackedTopics.map((topic) => (
              <Badge key={topic} variant="secondary" className="flex items-center gap-1">
                {topic}
                <button onClick={() => removeTrackedTopic(topic)}>
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No topics tracked yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

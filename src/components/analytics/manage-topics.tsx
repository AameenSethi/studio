
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
  const [newSubject, setNewSubject] = useState('');
  const { toast } = useToast();

  const handleAddTopic = () => {
    if (newTopic.trim() && newSubject.trim()) {
      try {
        addTrackedTopic({ topic: newTopic.trim(), subject: newSubject.trim() });
        setNewTopic('');
        setNewSubject('');
        toast({
          title: 'Topic Added',
          description: `"${newTopic.trim()}" is now being tracked under "${newSubject.trim()}".`,
        });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message,
        });
      }
    } else {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: 'Please provide both a topic and a subject.',
          });
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
        <div className="flex flex-col gap-2 mb-4">
            <div className="flex gap-2">
                <Input
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="e.g., Algebra"
                />
                <Input
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Subject (e.g., Math)"
                />
                <Button onClick={handleAddTopic} size="icon">
                    <PlusCircle className="h-4 w-4" />
                </Button>
            </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {trackedTopics.length > 0 ? (
            trackedTopics.map((item, index) => (
              <Badge key={`${item.topic}-${item.subject}-${index}`} variant="secondary" className="flex items-center gap-1 pr-1">
                {item.topic} <span className="text-muted-foreground/70 text-xs ml-1 mr-1">({item.subject})</span>
                <button onClick={() => removeTrackedTopic(item.topic)} className='rounded-full hover:bg-muted-foreground/20 p-0.5'>
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

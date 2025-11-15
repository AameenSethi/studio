import AppLayout from '@/components/layout/app-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { History } from 'lucide-react';

export default function HistoryPage() {
  return (
    <AppLayout>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            Action History
          </h2>
          <p className="text-muted-foreground">
            A log of all your recent AI-powered activities.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <History className="h-6 w-6" />
            Recent Actions
          </CardTitle>
          <CardDescription>
            Here are the study plans, explanations, and tests you've generated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Your history is currently empty.</p>
            <p className="text-sm text-muted-foreground">
              Generated content will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

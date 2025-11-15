'use client';

import AppLayout from '@/components/layout/app-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useHistory } from '@/hooks/use-history';
import { History, Wand2, Lightbulb, FileText } from 'lucide-react';
import { format } from 'date-fns';

const iconMap = {
  'Study Plan': <Wand2 className="h-5 w-5 text-accent" />,
  'Explanation': <Lightbulb className="h-5 w-5 text-accent" />,
  'Practice Test': <FileText className="h-5 w-5 text-accent" />,
};

export default function HistoryPage() {
  const { history } = useHistory();

  const renderContent = (item: any) => {
    switch (item.type) {
      case 'Study Plan':
        return <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: item.content.replace(/\n/g, '<br />') }} />;
      case 'Explanation':
        return <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: item.content.replace(/\n/g, '<br />') }} />;
      case 'Practice Test':
        return (
          <ul className="space-y-4">
            {item.content.map((qa: any, index: number) => (
              <li key={index}>
                <p className="font-semibold">{index + 1}. {qa.question}</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 pl-2">Answer: {qa.answer}</p>
              </li>
            ))}
          </ul>
        );
      default:
        return <p>{JSON.stringify(item.content)}</p>;
    }
  };

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
          <CardTitle className="flex items-center gap-2">
            <History className="h-6 w-6" />
            Recent Actions
          </CardTitle>
          <CardDescription>
            Here are the study plans, explanations, and tests you've generated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <Accordion type="multiple" className="w-full">
              {history.map((item) => (
                <AccordionItem value={item.id} key={item.id}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-4">
                      {iconMap[item.type]}
                      <div className="flex flex-col items-start">
                        <span className="font-semibold">{item.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(item.timestamp), "PPP p")}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card className="bg-background/50">
                        <CardHeader>
                            <CardTitle className="text-lg">{item.type}</CardTitle>
                            <CardDescription>{item.title}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {renderContent(item)}
                        </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">
                Your history is currently empty.
              </p>
              <p className="text-sm text-muted-foreground">
                Generated content will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}

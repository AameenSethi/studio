'use client';

import { useState } from 'react';
import {
  generateWeeklyProgressReport,
  type WeeklyProgressReportOutput,
} from '@/ai/flows/weekly-progress-report';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, TrendingUp, ArrowRight, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';

export function ReportGenerator() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<WeeklyProgressReportOutput | null>(
    null
  );

  const learningData = `
    - Topics Studied: Calculus (4 hours), Linear Algebra (2.5 hours), Statistics (3 hours)
    - Practice Test Scores: Calculus Test 1 (78%), Calculus Test 2 (85%), Statistics Quiz (92%)
    - Time Spent: 9.5 hours total
    - Areas of struggle: Integration by parts in Calculus, matrix determinants in Linear Algebra.
    `;

  async function handleGenerateReport() {
    setIsLoading(true);
    setReport(null);
    try {
      const today = new Date();
      const lastWeek = subDays(today, 7);

      const result = await generateWeeklyProgressReport({
        userId: 'user-123',
        startDate: format(lastWeek, 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
        learningData: learningData,
      });

      setReport(result);
      toast({
        title: 'Report Generated!',
        description: 'Your weekly progress report is ready.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Generating Report',
        description:
          'There was an issue creating your report. Please try again.',
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const ReportDisplay = ({ reportText }: { reportText: string }) => {
    return (
        <div className="prose prose-sm max-w-none dark:prose-invert">
        {reportText.split('\n\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
        ))}
        </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-accent" />
          Generate Weekly Report
        </CardTitle>
        <CardDescription>
          Click the button to generate an AI-powered analysis of your learning
          progress from the past week.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleGenerateReport} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              Generate This Week&apos;s Report
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardContent>
      {report && (
        <CardFooter
          className={cn(
            'transition-all duration-500 ease-in-out',
            report ? 'opacity-100' : 'opacity-0'
          )}
        >
          <Card className="w-full bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Your Weekly Progress Report</CardTitle>
                <CardDescription>Summary of your activities and performance.</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </CardHeader>
            <CardContent>
              <ReportDisplay reportText={report.report} />
            </CardContent>
          </Card>
        </CardFooter>
      )}
    </Card>
  );
}

'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  generateWeeklyProgressReport,
  type WeeklyProgressReportOutput,
  WeeklyProgressReportInput,
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, TrendingUp, ArrowRight, Download, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays, parseISO } from 'date-fns';
import { useUser } from '@/hooks/use-user-role';
import { useHistory } from '@/hooks/use-history';

const formSchema = z.object({
  studentId: z.string().min(1, {
    message: 'Please enter a student UID.',
  }),
});

const generateDynamicReportData = (history: any[], forStudentId?: string): Omit<WeeklyProgressReportInput, 'userId' | 'startDate' | 'endDate'> => {
  const today = new Date();
  const lastWeek = subDays(today, 7);

  const weeklyHistory = history.filter(item => {
    const itemDate = parseISO(item.timestamp);
    return itemDate >= lastWeek && itemDate <= today;
  });

  const subjectData: { [key: string]: any } = {};
  let totalTime = 0; // for now, we don't have this data.

  weeklyHistory.forEach(item => {
    if (item.type === 'Practice Test') {
      // Assuming test title is in format: "Test on: Algebra"
      const topicMatch = item.title.match(/Test on: (.*)/);
      const topic = topicMatch ? topicMatch[1] : 'General';
      const subject = "General"; // Or derive from topic if possible

      if (!subjectData[subject]) {
        subjectData[subject] = {
          subject: subject,
          topicsStudied: new Set(),
          timeSpent: "N/A",
          practiceTestScores: [],
        };
      }
      subjectData[subject].topicsStudied.add(topic);
      const scorePercentage = (item.score / item.content.length) * 100;
      subjectData[subject].practiceTestScores.push({
        testName: item.title,
        score: `${scorePercentage.toFixed(0)}%`,
      });
    } else if (item.type === 'Explanation') {
        const topicMatch = item.title.match(/Explanation of: (.*)/);
        const topic = topicMatch ? topicMatch[1] : 'General';
        const subject = "General"; // Or derive from topic if possible

         if (!subjectData[subject]) {
            subjectData[subject] = {
                subject: subject,
                topicsStudied: new Set(),
                timeSpent: "N/A",
                practiceTestScores: [],
            };
        }
        subjectData[subject].topicsStudied.add(topic);

    } else if (item.type === 'Study Plan') {
        const goalMatch = item.title.match(/For: (.*)/);
        const goal = goalMatch ? goalMatch[1] : 'General Goal';
        const subject = "Planning";

        if (!subjectData[subject]) {
            subjectData[subject] = {
                subject: subject,
                topicsStudied: new Set(),
                timeSpent: "N/A",
                practiceTestScores: [],
            };
        }
        subjectData[subject].topicsStudied.add(goal);
    }
  });


  const learningData = Object.values(subjectData).map(data => ({
    ...data,
    topicsStudied: Array.from(data.topicsStudied),
  }));

  const overallSummary = {
    totalTimeSpent: "Not tracked",
    generalObservations: weeklyHistory.length > 0 ? "Activity detected this week." : "No activity recorded this week.",
  };

  return { learningData, overallSummary };
}

export function ReportGenerator() {
  const { userRole } = useUser();

  if (userRole === 'Student') {
    return <StudentReportViewer />;
  }
  return <TeacherParentReportGenerator />;
}

function StudentReportViewer() {
  const { toast } = useToast();
  const { history } = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<WeeklyProgressReportOutput | null>(null);

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setReport(null);
    try {
      const today = new Date();
      const lastWeek = subDays(today, 7);
      const studentId = 'user-123'; // Hardcoded for student's own report

      const { learningData, overallSummary } = generateDynamicReportData(history);

      if (learningData.length === 0) {
        toast({
            variant: 'destructive',
            title: 'No Data Available',
            description: 'There is no learning activity recorded in the last 7 days to generate a report.',
        });
        setIsLoading(false);
        return;
      }

      const result = await generateWeeklyProgressReport({
        userId: studentId,
        startDate: format(lastWeek, 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
        learningData: learningData,
        overallSummary: overallSummary,
      });

      setReport(result);
      toast({
        title: 'Report Generated!',
        description: `Your weekly progress report is ready.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Generating Report',
        description: 'There was an issue creating your report. Please try again.',
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-accent" />
          My Weekly Progress Report
        </CardTitle>
        <CardDescription>
          Here is an AI-powered analysis of your learning progress from the
          past week.
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
              Generate My Report
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardContent>
      {report && (
        <CardFooter>
          <ReportDisplayCard report={report} studentId={'user-123'} />
        </CardFooter>
      )}
    </Card>
  );
}

function TeacherParentReportGenerator() {
  const { toast } = useToast();
  const { history } = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<WeeklyProgressReportOutput | null>(
    null
  );
  const [generatedForId, setGeneratedForId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: 'user-123',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setReport(null);
    setGeneratedForId(null);
    try {
      const today = new Date();
      const lastWeek = subDays(today, 7);

      const { learningData, overallSummary } = generateDynamicReportData(history, values.studentId);

      if (learningData.length === 0) {
        toast({
            variant: 'destructive',
            title: 'No Data Available',
            description: `There is no learning activity for student ${values.studentId} in the last 7 days.`,
        });
        setIsLoading(false);
        return;
      }

      const result = await generateWeeklyProgressReport({
        userId: values.studentId,
        startDate: format(lastWeek, 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
        learningData: learningData,
        overallSummary: overallSummary,
      });

      setReport(result);
      setGeneratedForId(values.studentId);
      toast({
        title: 'Report Generated!',
        description: `Progress report for student ${values.studentId} is ready.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Generating Report',
        description:
          'There was an issue creating the report. Please try again.',
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-accent" />
          Generate Student Report
        </CardTitle>
        <CardDescription>
          Enter a student UID to generate an AI-powered analysis of their
          learning progress from the past week.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student User ID</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="e.g., user-123"
                        {...field}
                        className="pl-10"
                      />
                    </div>
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
                  Generate Report
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      {report && generatedForId && (
        <CardFooter
          className={cn(
            'transition-all duration-500 ease-in-out',
            report ? 'opacity-100' : 'opacity-0'
          )}
        >
          <ReportDisplayCard report={report} studentId={generatedForId} />
        </CardFooter>
      )}
    </Card>
  );
}

function ReportDisplayCard({
  report,
  studentId,
}: {
  report: WeeklyProgressReportOutput;
  studentId: string;
}) {
  const ReportDisplay = ({ reportText }: { reportText: string }) => {
    // Simple markdown-like parsing
    const lines = reportText.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <h3
            key={index}
            className="text-xl font-semibold mt-4 mb-2 text-primary"
          >
            {line.replace(/\*\*/g, '')}
          </h3>
        );
      }
      if (line.startsWith('* ')) {
        return (
          <li key={index} className="ml-4 list-disc">
            {line.substring(2)}
          </li>
        );
      }
      return (
        <p key={index} className="mb-2">
          {line}
        </p>
      );
    });

    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        {lines}
      </div>
    );
  };

  return (
    <Card className="w-full bg-muted/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Weekly Report for Student: {studentId}</CardTitle>
          <CardDescription>
            Summary of activities and performance.
          </CardDescription>
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
  );
}

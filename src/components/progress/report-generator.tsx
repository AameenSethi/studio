'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import { format, subDays } from 'date-fns';
import { useUser } from '@/hooks/use-user-role';

const formSchema = z.object({
  studentId: z.string().min(1, {
    message: "Please enter a student UID.",
  }),
});

const learningData = `
    - Topics Studied: Calculus (4 hours), Linear Algebra (2.5 hours), Statistics (3 hours)
    - Practice Test Scores: Calculus Test 1 (78%), Calculus Test 2 (85%), Statistics Quiz (92%)
    - Time Spent: 9.5 hours total
    - Areas of struggle: Integration by parts in Calculus, matrix determinants in Linear Algebra.
    `;

export function ReportGenerator() {
  const { userRole } = useUser();

  if (userRole === 'Student') {
    return <StudentReportViewer />;
  }
  return <TeacherParentReportGenerator />;
}

function StudentReportViewer() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [report, setReport] = useState<WeeklyProgressReportOutput | null>(null);

    const handleGenerateReport = async () => {
        setIsLoading(true);
        setReport(null);
        try {
            const today = new Date();
            const lastWeek = subDays(today, 7);
            const studentId = 'user-123'; // Hardcoded for student's own report

            const result = await generateWeeklyProgressReport({
                userId: studentId,
                startDate: format(lastWeek, 'yyyy-MM-dd'),
                endDate: format(today, 'yyyy-MM-dd'),
                learningData: learningData,
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
    }

    return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-accent" />
          My Weekly Progress Report
        </CardTitle>
        <CardDescription>
          Here is an AI-powered analysis of your learning progress from the past week.
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
          <ReportDisplayCard report={report} studentId={'user-123'}/>
        </CardFooter>
      )}
    </Card>
    )
}

function TeacherParentReportGenerator() {
  const { toast } = useToast();
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

      const result = await generateWeeklyProgressReport({
        userId: values.studentId,
        startDate: format(lastWeek, 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
        learningData: learningData,
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
          Enter a student UID to generate an AI-powered analysis of their learning progress from the past week.
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
                            <Input placeholder="e.g., user-123" {...field} className="pl-10" />
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

function ReportDisplayCard({ report, studentId }: { report: WeeklyProgressReportOutput, studentId: string }) {
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
        <Card className="w-full bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Weekly Report for Student: {studentId}</CardTitle>
                <CardDescription>Summary of activities and performance.</CardDescription>
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
    )
}

'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  generateWeeklyProgressReport,
  type WeeklyProgressReportOutput,
  type WeeklyProgressReportInput,
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
import { Loader2, TrendingUp, ArrowRight, Download, KeyRound, CheckCircle, Target, Trophy, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays, parseISO } from 'date-fns';
import { useUser } from '@/hooks/use-user-role';
import { useHistory, type HistoryItem } from '@/hooks/use-history';
import { Separator } from '../ui/separator';

const formSchema = z.object({
  studentId: z.string().min(1, {
    message: 'Please enter a student UID.',
  }),
});

const generateDynamicReportData = (history: HistoryItem[], studentId?: string): Omit<WeeklyProgressReportInput, 'userId' | 'startDate' | 'endDate'> => {
  const today = new Date();
  const lastWeek = subDays(today, 7);

  // In a real application, you would fetch the history for the given studentId.
  // For this simulation, if a studentId is provided, we'll use a subset of the global history.
  // If no studentId is provided (for a student's own report), we use all their history.
  let studentHistory = history;
  if (studentId) {
      const studentHash = studentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      studentHistory = history.filter((_, index) => (index + studentHash) % 4 === 0); // Simulate different data per student
  }

  const weeklyHistory = studentHistory.filter(item => {
    const itemDate = parseISO(item.timestamp);
    return itemDate >= lastWeek && itemDate <= today;
  });

  const subjectData: { [key: string]: any } = {};

  weeklyHistory.forEach(item => {
    let subject: string | undefined;
    let topic: string | undefined;
    let timeSpentSeconds = 0;

    if (item.type === 'Practice Test') {
      subject = item.subject || 'General Knowledge';
      topic = item.topic || item.title;
      timeSpentSeconds = item.duration || 0;

      if (!subjectData[subject]) {
        subjectData[subject] = {
          subject: subject,
          topicsStudied: new Set(),
          timeSpent: 0,
          practiceTestScores: [],
        };
      }
      if (topic) subjectData[subject].topicsStudied.add(topic);
      subjectData[subject].timeSpent += timeSpentSeconds;

      const scorePercentage = (item.score! / item.content.length) * 100;
      subjectData[subject].practiceTestScores.push({
        testName: item.title,
        score: `${scorePercentage.toFixed(0)}%`,
      });
    } else if (item.type === 'Explanation') {
        const topicMatch = item.title.match(/Explanation of: (.*)/);
        topic = topicMatch ? topicMatch[1] : 'General Study';
        subject = "General Study";
        timeSpentSeconds = 600; // Approx. 10 mins per explanation

         if (!subjectData[subject]) {
            subjectData[subject] = {
                subject: subject,
                topicsStudied: new Set(),
                timeSpent: 0,
                practiceTestScores: [],
            };
        }
        if (topic) subjectData[subject].topicsStudied.add(topic);
        subjectData[subject].timeSpent += timeSpentSeconds;

    } else if (item.type === 'Study Plan') {
        const goalMatch = item.title.match(/For: (.*)/);
        topic = goalMatch ? goalMatch[1] : 'General Goal';
        subject = "Planning & Organization";
        timeSpentSeconds = 300; // Approx. 5 mins per plan

        if (!subjectData[subject]) {
            subjectData[subject] = {
                subject: subject,
                topicsStudied: new Set(),
                timeSpent: 0, 
                practiceTestScores: [],
            };
        }
        if (topic) subjectData[subject].topicsStudied.add(topic);
        subjectData[subject].timeSpent += timeSpentSeconds;
    }
  });


  const learningData = Object.values(subjectData).map(data => {
    const totalMinutes = Math.round(data.timeSpent / 60);
    return {
      ...data,
      topicsStudied: Array.from(data.topicsStudied),
      timeSpent: `${totalMinutes} minutes`,
    }
  });
  
  const totalTimeSpentSeconds = Object.values(subjectData).reduce((total, current) => total + current.timeSpent, 0);
  const totalTimeSpentMinutes = Math.round(totalTimeSpentSeconds / 60);

  const overallSummary = {
    totalTimeSpent: `${totalTimeSpentMinutes} minutes`,
    generalObservations: weeklyHistory.length > 0 ? `The user engaged in ${weeklyHistory.length} activities this week, spending a total of ${totalTimeSpentMinutes} minutes.` : "No activity was recorded in the last 7 days.",
  };

  return { learningData, overallSummary };
}

interface ReportGeneratorProps {
    studentId?: string;
}

export function ReportGenerator({ studentId }: ReportGeneratorProps) {
  const { userRole } = useUser();

  if (studentId) {
      return <StudentReportViewer studentId={studentId} />;
  }

  if (userRole === 'Student') {
    return <StudentReportViewer />;
  }
  
  return <TeacherParentReportGenerator />;
}

function StudentReportViewer({ studentId }: { studentId?: string}) {
  const { toast } = useToast();
  const { history, addHistoryItem } = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<WeeklyProgressReportOutput | null>(null);
  const effectiveStudentId = studentId || 'user-123'; // Default to own ID if not provided

  useEffect(() => {
    // If a specific studentId is provided, generate the report automatically on mount.
    // Otherwise, find the most recent progress report from history on mount for the logged-in student.
    if (studentId) {
        handleGenerateReport(true); // `true` to suppress toast on initial load
    } else {
        const lastReport = history.find(item => item.type === 'Progress Report');
        if (lastReport) {
            setReport(lastReport.content);
        }
    }
  }, [history, studentId]);

  const handleGenerateReport = async (isInitialLoad = false) => {
    setIsLoading(true);
    setReport(null);
    try {
      const today = new Date();
      const lastWeek = subDays(today, 7);

      const { learningData, overallSummary } = generateDynamicReportData(history, studentId);

      if (learningData.length === 0) {
        if (!isInitialLoad) {
            toast({
                variant: 'destructive',
                title: 'No Data Available',
                description: 'There is no learning activity recorded in the last 7 days to generate a report.',
            });
        }
        setIsLoading(false);
        return;
      }

      const result = await generateWeeklyProgressReport({
        userId: effectiveStudentId,
        startDate: format(lastWeek, 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
        learningData: learningData,
        overallSummary: overallSummary,
      });

      setReport(result);
      if (!studentId) { // Only add to history if it's the student generating their own report
          addHistoryItem({
            type: 'Progress Report',
            title: `Weekly Report for ${effectiveStudentId}`,
            content: result,
          });
      }
      if (!isInitialLoad) {
          toast({
            title: 'Report Generated!',
            description: `Weekly progress report is ready.`,
          });
      }
    } catch (error) {
        if (!isInitialLoad) {
            toast({
                variant: 'destructive',
                title: 'Error Generating Report',
                description: 'There was an issue creating your report. Please try again.',
            });
        }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const cardTitle = studentId ? "AI-Generated Weekly Report" : "My Weekly Progress Report";
  const cardDescription = studentId 
    ? "An AI-powered analysis of this student's learning progress from the past week."
    : "Click the button to generate an AI-powered analysis of your learning progress from the past week. Your last generated report is shown below.";


  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-accent" />
          {cardTitle}
        </CardTitle>
        <CardDescription>{cardDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => handleGenerateReport()} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              {studentId ? 'Refresh Report' : 'Generate New Report'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardContent>
      {isLoading && (
          <CardFooter>
              <div className="w-full text-center p-8 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  Generating report...
              </div>
          </CardFooter>
      )}
      {!isLoading && report && (
        <CardFooter>
          <ReportDisplayCard report={report} studentId={effectiveStudentId} title={studentId ? "" : "Last Generated Report"} />
        </CardFooter>
      )}
      {!isLoading && !report && (
        <CardFooter>
            <div className="w-full text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
                No report generated. Click the button above to create one.
            </div>
        </CardFooter>
      )}
    </Card>
  );
}

function TeacherParentReportGenerator() {
  const { toast } = useToast();
  const { history, addHistoryItem } = useHistory();
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
      addHistoryItem({
        type: 'Progress Report',
        title: `Generated report for ${values.studentId}`,
        content: result,
      });
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

export function ReportDisplayCard({
  report,
  studentId,
  title,
}: {
  report: WeeklyProgressReportOutput;
  studentId: string;
  title?: string;
}) {
  const handleDownload = () => {
    if (!report) return;

    let textContent = `Progress Report for: ${studentId}\n`;
    textContent += `Date: ${new Date().toLocaleDateString()}\n\n`;
    
    textContent += "--- OVERALL SUMMARY ---\n";
    textContent += `${report.overallSummary}\n\n`;

    textContent += "--- SUBJECT ANALYSIS ---\n";
    report.subjectAnalyses.forEach(sub => {
        textContent += `Subject: ${sub.subject}\n`;
        textContent += `Analysis: ${sub.analysis}\n\n`;
    });

    textContent += "--- KEY STRENGTHS ---\n";
    report.keyStrengths.forEach(strength => {
        textContent += `- ${strength}\n`;
    });
    textContent += "\n";

    textContent += "--- FOCUS AREAS FOR NEXT WEEK ---\n";
    report.focusAreas.forEach(area => {
        textContent += `- ${area}\n`;
    });
    textContent += "\n";

    textContent += `--- FINAL SUMMARY ---\n${report.finalSummary}\n`;


    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progress_report_${studentId}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="w-full bg-muted/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title || `Weekly Report for Student: ${studentId}`}</CardTitle>
          <CardDescription>
            Summary of activities and performance for the last 7 days.
          </CardDescription>
        </div>
        <Button onClick={handleDownload} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card className="bg-background/70">
            <CardHeader className="flex-row items-center gap-2 pb-2">
                <Info className="h-5 w-5 text-accent"/>
                <CardTitle className="text-lg">Overall Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{report.overallSummary}</p>
            </CardContent>
        </Card>

        <div>
            <h3 className="text-lg font-semibold mb-2 text-primary">Subject-by-Subject Analysis</h3>
            <div className="space-y-4">
                {report.subjectAnalyses.map((sub, index) => (
                    <Card key={index} className="bg-background/70">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-md">{sub.subject}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{sub.analysis}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>

        <Separator />

        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <h3 className='text-lg font-semibold flex items-center gap-2 text-green-600 dark:text-green-400'>
                    <Trophy className="h-5 w-5" />
                    Key Strengths
                </h3>
                <ul className='space-y-2'>
                    {report.keyStrengths.map((highlight, index) => (
                        <li key={index} className='flex items-start gap-2'>
                            <CheckCircle className="h-4 w-4 mt-1 text-green-500"/>
                            <span className="text-sm text-muted-foreground">{highlight}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="space-y-2">
                <h3 className='text-lg font-semibold flex items-center gap-2 text-amber-600 dark:text-amber-400'>
                    <Target className="h-5 w-5" />
                    Focus Areas
                </h3>
                <ul className='space-y-2'>
                    {report.focusAreas.map((area, index) => (
                        <li key={index} className='flex items-start gap-2'>
                            <ArrowRight className="h-4 w-4 mt-1 text-amber-500"/>
                            <span className="text-sm text-muted-foreground">{area}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

        <Separator />
        
        <p className='text-center text-muted-foreground italic pt-4'>{report.finalSummary}</p>
      </CardContent>
    </Card>
  );
}

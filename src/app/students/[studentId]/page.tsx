
'use client';

import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import { getStudentById, studentData } from '@/lib/student-data';
import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, BookOpen } from 'lucide-react';
import { ReportGenerator } from '@/components/progress/report-generator';
import { History, Wand2, Lightbulb, FileText, Clock, CheckCircle, Quote } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { useHistory } from '@/hooks/use-history';
import { format } from 'date-fns';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import {
  StudyTimeChart,
  TopicMasteryChart,
  PerformanceByTopic,
} from '@/components/analytics/charts';
import { TrackedTopicsProvider } from '@/hooks/use-tracked-topics';
import { useStudents } from '@/hooks/use-students';


export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { history } = useHistory();
  const { students } = useStudents();
  const studentId = params.studentId as string;
  const [student, setStudent] = useState(getStudentById(studentId, students));
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const currentStudent = getStudentById(studentId, students);
    setStudent(currentStudent);
    if (!currentStudent) {
      // In a real app, you might fetch student data here if not found
      // or redirect if the ID is invalid.
      console.warn(`Student with ID ${studentId} not found.`);
    }
  }, [studentId, students]);
  
  const studentHistory = useMemo(() => {
      // In a real app with a backend, you'd fetch history for this specific student.
      // For this simulation, we'll use a portion of the global history for the student.
      if (!student) return [];
      const studentHash = student.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return history.filter((_, index) => (index + studentHash) % (students.length || 1) === 0);
  }, [history, student, students]);


  if (!isClient) {
    return null; // Or a loading skeleton
  }

  if (!student) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full text-center">
          <h2 className="text-2xl font-bold">Student Not Found</h2>
          <p className="text-muted-foreground">The student with ID '{studentId}' could not be found.</p>
          <Button onClick={() => router.push('/students')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Roster
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2);
  };
  
  const iconMap = {
    'Study Plan': <Wand2 className="h-5 w-5 text-accent" />,
    'Explanation': <Lightbulb className="h-5 w-5 text-accent" />,
    'Practice Test': <FileText className="h-5 w-5 text-accent" />,
    'Progress Report': <History className="h-5 w-5 text-accent" />,
  };
  
  const formatDuration = (seconds?: number) => {
    if (seconds === undefined) return '';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  }
  
  const ExplanationDisplay = ({ text }: { text: string }) => {
    const elements: JSX.Element[] = [];
    const lines = text.split('\n');
    let currentList: string[] = [];

    const renderList = () => {
        if (currentList.length > 0) {
            elements.push(
                <ul key={`ul-${elements.length}`} className="list-disc pl-6 my-2 space-y-1">
                    {currentList.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            );
            currentList = [];
        }
    };

    lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
            renderList();
            elements.push(<h3 key={`h3-${index}`} className="text-lg font-semibold mt-4 mb-2 text-primary">{trimmedLine.replace(/\*\*/g, '')}</h3>);
        } else if (trimmedLine.startsWith('* ')) {
            currentList.push(trimmedLine.substring(2));
        } else if (trimmedLine === '') {
            renderList();
            if (elements.length > 0 && lines[index-1]?.trim() !== '') {
                elements.push(<div key={`br-${index}`} className="h-4" />);
            }
        } else {
            renderList();
            elements.push(<p key={`p-${index}`} className="leading-relaxed">{trimmedLine}</p>);
        }
    });

    renderList();
    return <div className="prose prose-sm max-w-none dark:prose-invert">{elements}</div>;
  };
  
  const renderContent = (item: any) => {
    switch (item.type) {
        case 'Study Plan':
            if (!item.content || !item.content.weeklySchedule) {
                return <p>Study plan data is not available in the expected format.</p>;
            }
            return (
                <div className="space-y-6">
                     <div>
                        <h3 className='text-lg font-semibold mb-2 text-primary'>Key Highlights</h3>
                        <ul className='space-y-2'>
                            {item.content.keyHighlights.map((highlight: string, index: number) => (
                                <li key={index} className='flex items-start gap-2'>
                                    <CheckCircle className="h-4 w-4 mt-1 text-green-500"/>
                                    <span>{highlight}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className='text-lg font-semibold mb-2 text-primary'>Weekly Schedule</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className='w-[120px]'>Day</TableHead>
                                    <TableHead>Focus Topics</TableHead>
                                    <TableHead className='w-[150px] text-right'>Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {item.content.weeklySchedule.map((day: any) => (
                                    <TableRow key={day.day}>
                                        <TableCell className='font-medium'>{day.day}</TableCell>
                                        <TableCell>{day.focusTopics.join(', ')}</TableCell>
                                        <TableCell className='text-right'>{day.estimatedTime}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <p className='text-center text-muted-foreground italic pt-4'>{item.content.finalSummary}</p>
                </div>
            );
        case 'Explanation':
            if (typeof item.content === 'string') {
                return <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: item.content.replace(/\n/g, '<br />') }} />;
            }
            return (
                <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-background/50 border italic">
                        <p>{item.content.summary}</p>
                    </div>
                    <div className='p-4 rounded-lg bg-background/50 border'>
                        <ExplanationDisplay text={item.content.detailedExplanation} />
                    </div>
                    <Card className="bg-background/50">
                        <CardHeader className="flex-row items-center gap-2 pb-2">
                            <Quote className="h-5 w-5 text-accent"/>
                            <CardTitle className="text-lg">Analogy</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{item.content.analogy}</p>
                        </CardContent>
                    </Card>
                </div>
            );
        case 'Practice Test':
            return (
              <div>
                <div className="flex gap-4 mb-4">
                    {item.score !== undefined && <Badge>Score: {item.score} / {item.content.length}</Badge>}
                    {item.duration !== undefined && <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3"/>{formatDuration(item.duration)}</Badge>}
                </div>
                <ul className="space-y-4">{item.content.map((qa: any, index: number) => (<li key={index}><p className="font-semibold">{index + 1}. {qa.question}</p><p className="text-sm text-emerald-600 dark:text-emerald-400 pl-2">Answer: {qa.answer}</p></li>))}</ul>
              </div>
            );
        default:
            return <p>{JSON.stringify(item.content)}</p>;
    }
  };


  return (
    <AppLayout>
        <div className="space-y-8">
            <div className='flex items-center justify-between'>
                <div className="flex items-center gap-4">
                    <Avatar className='h-20 w-20 border-2 border-primary'>
                        <AvatarImage src={student.avatarUrl} alt={student.name} />
                        <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight font-headline">{student.name}</h2>
                        <p className="text-muted-foreground">{student.class} | Student ID: {student.id}</p>
                    </div>
                </div>
                 <Button onClick={() => router.push('/students')} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Roster
                </Button>
            </div>
            
            <ReportGenerator studentId={studentId} />
            
            <TrackedTopicsProvider>
                <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Study Time Analysis</CardTitle>
                            <CardDescription>Total study hours over the past month.</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <StudyTimeChart />
                        </CardContent>
                    </Card>
                    <TopicMasteryChart />
                </div>
                <PerformanceByTopic />
            </TrackedTopicsProvider>

            <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <History className="h-6 w-6" />
                Student Activity History
                </CardTitle>
                <CardDescription>
                A log of this student's recent activities.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {studentHistory.length > 0 ? (
                <Accordion type="multiple" className="w-full">
                    {studentHistory.map((item) => (
                    <AccordionItem value={item.id} key={item.id}>
                        <AccordionTrigger>
                        <div className="flex items-center gap-4 w-full">
                            {iconMap[item.type as keyof typeof iconMap]}
                            <div className="flex flex-col items-start">
                            <span className="font-semibold">{item.title}</span>
                            <span className="text-xs text-muted-foreground">
                                {format(new Date(item.timestamp), "PPP p")}
                            </span>
                            </div>
                            {item.type === 'Practice Test' && item.score !== undefined && (
                            <div className="ml-auto pr-4 flex items-center gap-4">
                                {item.duration !== undefined && <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3"/>{formatDuration(item.duration)}</Badge>}
                                <Badge variant="outline">{((item.score / item.content.length) * 100).toFixed(0)}%</Badge>
                            </div>
                            )}
                        </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <Card className="bg-muted/50">
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
                    <p className="text-muted-foreground">No activity history for this student.</p>
                </div>
                )}
            </CardContent>
            </Card>
        </div>
    </AppLayout>
  );
}

    
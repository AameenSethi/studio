
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import AppLayout from '@/components/layout/app-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, FileText, ArrowRight, History, User, X, Wand2, Clock, CheckCircle, Quote, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { WeeklyProgressChart } from '@/components/dashboard/overview-cards';
import { useUser } from '@/hooks/use-user-role';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useHistory, type HistoryItem } from '@/hooks/use-history';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReportDisplayCard } from '@/components/progress/report-generator';

const motivationalQuotes = [
  "The secret to getting ahead is getting started.",
  "Believe you can and you're halfway there.",
  "Don't watch the clock; do what it does. Keep going.",
  "The expert in anything was once a beginner.",
  "The beautiful thing about learning is that no one can take it away from you.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "The only way to learn mathematics is to do mathematics.",
  "Strive for progress, not perfection.",
  "Your only limit is your mind."
];

// Re-using rendering components from History page for consistency
const iconMap = {
    'Study Plan': <Wand2 className="h-5 w-5 text-accent" />,
    'Explanation': <Lightbulb className="h-5 w-5 text-accent" />,
    'Practice Test': <FileText className="h-5 w_5 text-accent" />,
    'Progress Report': <TrendingUp className="h-5 w-5 text-accent" />,
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
        elements.push(
            <h3
            key={`h3-${index}`}
            className="text-lg font-semibold mt-4 mb-2 text-primary"
            >
            {trimmedLine.replace(/\*\*/g, '')}
            </h3>
        );
        } else if (trimmedLine.startsWith('* ')) {
        currentList.push(trimmedLine.substring(2));
        } else if (trimmedLine === '') {
        renderList();
        if (elements.length > 0 && lines[index-1]?.trim() !== '') {
            elements.push(<div key={`br-${index}`} className="h-4" />);
        }
        } else {
        renderList();
        elements.push(
            <p key={`p-${index}`} className="leading-relaxed">
            {trimmedLine}
            </p>
        );
        }
    });

    renderList();
    return <div className="prose prose-sm max-w-none dark:prose-invert">{elements}</div>;
};

const renderContent = (item: any) => {
    switch (item.type) {
      case 'Study Plan':
        if (typeof item.content === 'string' || !item.content.weeklySchedule) {
            return <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: (item.content.toString()).replace(/\n/g, '<br />') }} />;
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
                {item.isComplete && item.score !== undefined && (
                    <Badge>Score: {item.score} / {item.content.length}</Badge>
                )}
                {item.isComplete && item.duration !== undefined && (
                    <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3"/>
                        {formatDuration(item.duration)}
                    </Badge>
                )}
                {!item.isComplete && item.studentId && (
                     <Badge variant="secondary">Assigned to: {item.studentId}</Badge>
                )}
            </div>
          <ul className="space-y-4">
            {item.content.map((qa: any, index: number) => (
              <li key={index}>
                <p className="font-semibold">{index + 1}. {qa.question}</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 pl-2">Answer: {qa.answer}</p>
              </li>
            ))}
          </ul>
          </div>
        );
    case 'Progress Report':
        return <ReportDisplayCard report={item.content} studentId={item.title.split(' ').pop() || 'user'} />
    default:
        return <p>{JSON.stringify(item.content)}</p>;
    }
  };


export default function DashboardPage() {
  const { userName } = useUser();
  const { history } = useHistory();
  const [quote, setQuote] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const heroImage = PlaceHolderImages.find((img) => img.id === 'login-hero');
  const dailyHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Select a random quote on the client-side to avoid hydration mismatch
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setQuote(randomQuote);
  }, []);

  useEffect(() => {
    if (selectedDate && dailyHistoryRef.current) {
      setTimeout(() => {
        dailyHistoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [selectedDate]);
  
  const dailyHistory = useMemo(() => {
    if (!selectedDate) return [];
    return history.filter(item => format(parseISO(item.timestamp), 'yyyy-MM-dd') === selectedDate);
  }, [selectedDate, history]);

  const handleBarClick = (date: string) => {
    setSelectedDate(date);
  }

  const handleCloseDailyHistory = () => {
    setSelectedDate(null);
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">
              Welcome back, {userName.split(' ')[0]}!
            </h2>
            {quote && (
              <p className="text-sm text-muted-foreground italic mt-2">
                &quot;{quote}&quot;
              </p>
            )}
          </div>
        </div>
        
        <Card className="relative overflow-hidden">
          {heroImage && (
              <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  layout="fill"
                  objectFit="cover"
                  className="opacity-10 dark:opacity-5"
                  data-ai-hint={heroImage.imageHint}
              />
          )}
          <div className="relative z-10 p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="col-span-1 lg:col-span-2 bg-background/70 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Weekly Progress</CardTitle>
                    <CardDescription>
                        Your study activities over the last 7 days. Click a bar to see details.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <WeeklyProgressChart onBarClick={handleBarClick} />
                </CardContent>
                </Card>
                <Card className="col-span-1 lg:col-span-2 flex flex-col bg-background/70 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                    Jump right back into your learning journey.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-center gap-4">
                    <Link href="/explanations" passHref>
                    <Button variant="outline" className="w-full justify-start">
                        <Lightbulb className="mr-2 h-4 w-4" />
                        Explain a Complex Topic
                        <ArrowRight className="ml-auto h-4 w-4" />
                    </Button>
                    </Link>
                    <Link href="/practice" passHref>
                    <Button variant="outline" className="w-full justify-start">
                        <FileText className="mr-2 h-4 w-4" />
                        Generate a Practice Test
                        <ArrowRight className="ml-auto h-4 w-4" />
                    </Button>
                    </Link>
                    <Link href="/history" passHref>
                    <Button variant="outline" className="w-full justify-start">
                        <History className="mr-2 h-4 w-4" />
                        View Action History
                        <ArrowRight className="ml-auto h-4 w-4" />
                    </Button>
                    </Link>
                    <Link href="/profile" passHref>
                    <Button variant="outline" className="w-full justify-start">
                        <User className="mr-2 h-4 w-4" />
                        Edit Your Profile
                        <ArrowRight className="ml-auto h-4 w-4" />
                    </Button>
                    </Link>
                </CardContent>
                </Card>
            </div>
          </div>
        </Card>

        {selectedDate && (
          <div ref={dailyHistoryRef}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Activities for {format(parseISO(selectedDate), 'PPP')}</CardTitle>
                  <CardDescription>A log of your activities on this day.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={handleCloseDailyHistory}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </CardHeader>
              <CardContent>
                {dailyHistory.length > 0 ? (
                  <div className="space-y-4">
                    {dailyHistory.map((item) => (
                      <Card key={item.id} className="bg-muted/50">
                          <CardHeader>
                              <CardTitle className="text-lg flex items-center gap-2">
                                  {iconMap[item.type as keyof typeof iconMap]}
                                  {item.title}
                              </CardTitle>
                              <CardDescription>
                                  {format(parseISO(item.timestamp), 'p')}
                              </CardDescription>
                          </CardHeader>
                          <CardContent>
                              {renderContent(item)}
                          </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No activities recorded on this day.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/app-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, FileText, ArrowRight, History, User, ListTodo } from 'lucide-react';
import Link from 'next/link';
import { PersonalizedStudyPlan } from '@/components/dashboard/personalized-study-plan';
import { WeeklyProgressChart } from '@/components/dashboard/overview-cards';
import { useUser } from '@/hooks/use-user-role';
import { useHistory } from '@/hooks/use-history';
import { TestGenerator } from '@/components/practice/test-generator';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';

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

export default function DashboardPage() {
  const { userRole, userName, userId } = useUser();
  const { history } = useHistory();
  const [quote, setQuote] = useState('');
  const [activeTest, setActiveTest] = useState<string | null>(null);

  const assignedTests = history.filter(item => 
    item.type === 'Practice Test' && 
    item.studentId === userId && // Use the logged-in student's ID
    !item.isComplete
  );

  useEffect(() => {
    // Select a random quote on the client-side to avoid hydration mismatch
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setQuote(randomQuote);
  }, []);
  
  const selectedTest = history.find(item => item.id === activeTest);

  if (activeTest && selectedTest) {
    return (
        <AppLayout>
            <Button variant="outline" onClick={() => setActiveTest(null)} className="mb-4">
                <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                Back to Dashboard
            </Button>
            <TestGenerator assignedTest={selectedTest} />
        </AppLayout>
    );
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
        
        {userRole === 'Student' && (
            <Tabs defaultValue="overview" className="w-full">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="assignments">
                        Assigned Tests
                        {assignedTests.length > 0 && <Badge className="ml-2">{assignedTests.length}</Badge>}
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Card className="col-span-1 lg:col-span-2">
                        <CardHeader>
                          <CardTitle>Weekly Progress</CardTitle>
                          <CardDescription>
                            Your study activities over the last 7 days.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                          <WeeklyProgressChart />
                        </CardContent>
                      </Card>
                      <Card className="col-span-1 lg:col-span-2 flex flex-col">
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
                </TabsContent>
                <TabsContent value="assignments">
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <ListTodo />
                                Your Assignments
                            </CardTitle>
                            <CardDescription>Tests assigned to you by your teacher. Click one to start.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {assignedTests.length > 0 ? (
                                <div className="space-y-4">
                                    {assignedTests.map(test => (
                                        <Button
                                            key={test.id}
                                            variant="secondary"
                                            className="w-full justify-start h-auto py-4"
                                            onClick={() => setActiveTest(test.id)}
                                        >
                                            <FileText className="mr-4 h-5 w-5" />
                                            <div className='text-left'>
                                                <p className='font-semibold'>{test.title}</p>
                                                <p className='text-sm text-muted-foreground'>Topic: {test.topic}</p>
                                            </div>
                                            <ArrowRight className="ml-auto h-4 w-4" />
                                        </Button>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg">
                                    <p className="text-muted-foreground">You have no pending assignments.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        )}
        
        {userRole !== 'Student' && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Weekly Progress</CardTitle>
                        <CardDescription>Your study activities over the last 7 days.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2"><WeeklyProgressChart /></CardContent>
                </Card>
                <Card className="col-span-1 lg:col-span-2 flex flex-col">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Jump right back into your journey.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-center gap-4">
                        {userRole === 'Teacher' && (
                            <Link href="/explanations" passHref><Button variant="outline" className="w-full justify-start"><Lightbulb className="mr-2 h-4 w-4" />Explain a Complex Topic<ArrowRight className="ml-auto h-4 w-4" /></Button></Link>
                        )}
                        <Link href="/practice" passHref><Button variant="outline" className="w-full justify-start"><FileText className="mr-2 h-4 w-4" />Assign a Practice Test<ArrowRight className="ml-auto h-4 w-4" /></Button></Link>
                        <Link href="/history" passHref><Button variant="outline" className="w-full justify-start"><History className="mr-2 h-4 w-4" />View Action History<ArrowRight className="ml-auto h-4 w-4" /></Button></Link>
                        <Link href="/profile" passHref><Button variant="outline" className="w-full justify-start"><User className="mr-2 h-4 w-4" />Edit Your Profile<ArrowRight className="ml-auto h-4 w-4" /></Button></Link>
                    </CardContent>
                </Card>
            </div>
        )}

        <PersonalizedStudyPlan />
      </div>
    </AppLayout>
  );
}

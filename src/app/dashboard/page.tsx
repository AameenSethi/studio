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
import { Lightbulb, FileText, ArrowRight, History, User } from 'lucide-react';
import Link from 'next/link';
import { PersonalizedStudyPlan } from '@/components/dashboard/personalized-study-plan';
import { WeeklyProgressChart } from '@/components/dashboard/overview-cards';
import { useUser } from '@/hooks/use-user-role';

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
  const { userName } = useUser();
  const [quote, setQuote] = useState('');

  useEffect(() => {
    // Select a random quote on the client-side to avoid hydration mismatch
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setQuote(randomQuote);
  }, []);

  return (
    <AppLayout>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            Welcome back, {userName.split(' ')[0]}!
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s your learning snapshot for today.
          </p>
          {quote && (
            <p className="text-sm text-muted-foreground italic mt-2">
              &quot;{quote}&quot;
            </p>
          )}
        </div>
      </div>
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

      <PersonalizedStudyPlan />
    </AppLayout>
  );
}

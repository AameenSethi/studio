'use client';

import AppLayout from '@/components/layout/app-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { PersonalizedStudyPlan } from '@/components/dashboard/personalized-study-plan';
import { WeeklyProgressChart } from '@/components/dashboard/overview-cards';
import { useUser } from '@/hooks/use-user-role';

export default function DashboardPage() {
  const { userName } = useUser();

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
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>
              Your study time over the last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <WeeklyProgressChart />
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-2 flex flex-col bg-accent/80 text-accent-foreground">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription className="text-accent-foreground/80">
              Jump right back into your learning journey.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-center gap-4">
            <Link href="/explanations" passHref>
              <Button variant="outline" className="w-full justify-start bg-accent-foreground/10 hover:bg-accent-foreground/20 border-accent-foreground/30 text-accent-foreground">
                <Lightbulb className="mr-2 h-4 w-4" />
                Explain a Complex Topic
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>
            <Link href="/practice" passHref>
              <Button variant="outline" className="w-full justify-start bg-accent-foreground/10 hover:bg-accent-foreground/20 border-accent-foreground/30 text-accent-foreground">
                <FileText className="mr-2 h-4 w-4" />
                Generate a Practice Test
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

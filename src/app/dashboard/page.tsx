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

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            Welcome back, Learner!
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
          </CardContent>
        </Card>
      </div>

      <PersonalizedStudyPlan />
    </AppLayout>
  );
}

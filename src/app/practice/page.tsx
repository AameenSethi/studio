
'use client';

import AppLayout from '@/components/layout/app-layout';
import { TestGenerator } from '@/components/practice/test-generator';
import { useUser } from '@/hooks/use-user-role';

export default function PracticePage() {
  const { userRole } = useUser();
  const pageTitle = userRole === 'Student' ? 'Practice Test Generator' : 'Assign a Practice Test';
  const pageDescription = userRole === 'Student'
    ? 'Create custom quizzes and exams to test your knowledge.'
    : 'Create and assign a timed test for a specific student.';

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">
              {pageTitle}
            </h2>
            <p className="text-muted-foreground">
              {pageDescription}
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:gap-8">
          <TestGenerator />
        </div>
      </div>
    </AppLayout>
  );
}

import AppLayout from '@/components/layout/app-layout';
import { StudentRoster } from '@/components/students/student-roster';

export default function StudentsPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">
              Student Roster
            </h2>
            <p className="text-muted-foreground">
              An overview of all students and their performance.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:gap-8">
          <StudentRoster />
        </div>
      </div>
    </AppLayout>
  );
}

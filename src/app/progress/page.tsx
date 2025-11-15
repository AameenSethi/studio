import AppLayout from '@/components/layout/app-layout';
import { ReportGenerator } from '@/components/progress/report-generator';

export default function ProgressPage() {
  return (
    <AppLayout>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            Weekly Progress Report
          </h2>
          <p className="text-muted-foreground">
            Generate an AI-powered summary of your weekly learning.
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:gap-8">
        <ReportGenerator />
      </div>
    </AppLayout>
  );
}

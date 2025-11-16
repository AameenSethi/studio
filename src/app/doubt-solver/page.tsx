import AppLayout from '@/components/layout/app-layout';
import { DoubtSolver } from '@/components/doubt-solver/doubt-solver';

export default function DoubtSolverPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">
              Doubt Solver
            </h2>
            <p className="text-muted-foreground">
              Ask any academic question and get a clear, step-by-step answer from our AI tutor.
            </p>
          </div>
        </div>
        <DoubtSolver />
      </div>
    </AppLayout>
  );
}

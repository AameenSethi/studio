'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { studentData, type Student } from '@/lib/student-data';
import { useHistory } from '@/hooks/use-history';
import { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function StudentRoster() {
  const { history } = useHistory();
  const router = useRouter();

  const studentPerformance = useMemo(() => {
    const performanceMap = new Map<string, { totalTests: number; totalScore: number; totalQuestions: number }>();

    history.forEach(item => {
      if (item.type === 'Practice Test' && item.score !== undefined) {
        // In a real app, we'd filter by student ID from the item.
        // For this simulation, we apply test scores to all students for demonstration.
        studentData.forEach(student => {
            const studentId = student.id;
            if (!performanceMap.has(studentId)) {
                performanceMap.set(studentId, { totalTests: 0, totalScore: 0, totalQuestions: 0 });
            }
            const current = performanceMap.get(studentId)!;
            current.totalTests += 1;
            current.totalScore += item.score!;
            current.totalQuestions += item.content.length;
        });
      }
    });

    const averagePerformance = new Map<string, number>();
    performanceMap.forEach((data, studentId) => {
      const avg = data.totalQuestions > 0 ? (data.totalScore / data.totalQuestions) * 100 : 0;
      averagePerformance.set(studentId, Math.round(avg));
    });

    return averagePerformance;
  }, [history]);

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2);
  };
  
  const handleRowClick = (studentId: string) => {
    router.push(`/students/${studentId}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Students</CardTitle>
        <CardDescription>Click on a student to view their detailed progress.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Class</TableHead>
              <TableHead className="text-center">Avg. Performance</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {studentData.map((student) => {
              const performance = studentPerformance.get(student.id) ?? 0;
              return (
                <TableRow key={student.id} onClick={() => handleRowClick(student.id)} className="cursor-pointer">
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={student.avatarUrl} alt={student.name} />
                        <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{student.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${performance}%` }}
                        />
                      </div>
                      <span>{performance}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

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
import { useHistory } from '@/hooks/use-history';
import { useMemo, useState } from 'react';
import { ChevronRight, Trash2, UserPlus, KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStudents, type Student } from '@/hooks/use-students';
import { useToast } from '@/hooks/use-toast';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';


const addStudentSchema = z.object({
    id: z.string().min(1, 'UID is required.'),
    name: z.string().min(2, 'Name is required.'),
    class: z.string().min(1, 'Class is required.'),
});

export function StudentRoster() {
  const { history } = useHistory();
  const router = useRouter();
  const { students, addStudent, removeStudent } = useStudents();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof addStudentSchema>>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
        id: '',
        name: '',
        class: '',
    },
  });

  const onSubmit = (values: z.infer<typeof addStudentSchema>) => {
    try {
        const newStudent: Student = {
            ...values,
            avatarUrl: `https://i.pravatar.cc/150?u=${values.id}`,
        };
        addStudent(newStudent);
        toast({
            title: 'Student Added',
            description: `${values.name} has been added to the roster.`,
        });
        form.reset();
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message,
        });
    }
  }

  const studentPerformance = useMemo(() => {
    const performanceMap = new Map<string, { totalTests: number; totalScore: number; totalQuestions: number }>();

    history.forEach(item => {
      if (item.type === 'Practice Test' && item.score !== undefined) {
        // In a real app, we'd filter by student ID from the item.
        // For this simulation, we apply test scores to all students for demonstration.
        students.forEach(student => {
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
  }, [history, students]);

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
    <>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <UserPlus />
            Add New Student
        </CardTitle>
        <CardDescription>
          Enter the student's details to add them to the roster.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-4 gap-4 items-start">
                <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Student UID</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="e.g., user-202" {...field} className="pl-10" />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Jane Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="class"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Class</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., 10th Grade" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="self-end">Add Student</Button>
            </form>
        </Form>
      </CardContent>
    </Card>
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => {
              const performance = studentPerformance.get(student.id) ?? 0;
              return (
                <TableRow key={student.id} >
                  <TableCell onClick={() => handleRowClick(student.id)} className="cursor-pointer">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={student.avatarUrl} alt={student.name} />
                        <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{student.name}</span>
                    </div>
                  </TableCell>
                  <TableCell onClick={() => handleRowClick(student.id)} className="cursor-pointer">{student.class}</TableCell>
                  <TableCell onClick={() => handleRowClick(student.id)} className="text-center cursor-pointer">
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
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently remove {student.name} from the roster.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => {
                                        removeStudent(student.id);
                                        toast({
                                            title: 'Student Removed',
                                            description: `${student.name} has been removed from the roster.`,
                                        });
                                    }}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Remove
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button variant="ghost" size="icon" onClick={() => handleRowClick(student.id)}>
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
    </>
  );
}

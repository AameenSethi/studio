'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { defaultStudentData, type Student } from '@/lib/student-data';

export type { Student };

interface StudentsContextType {
  students: Student[];
  addStudent: (student: Student) => void;
  removeStudent: (studentId: string) => void;
}

const StudentsContext = createContext<StudentsContextType | undefined>(undefined);

const getInitialStudents = (): Student[] => {
  if (typeof window === 'undefined') {
    return defaultStudentData;
  }
  try {
    const item = window.localStorage.getItem('studentRoster');
    return item ? JSON.parse(item) : defaultStudentData;
  } catch (error) {
    console.error('Error reading students from localStorage', error);
    return defaultStudentData;
  }
};

export const StudentsProvider = ({ children }: { children: ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [students, setStudents] = useState<Student[]>(getInitialStudents);

  useEffect(() => {
    setIsMounted(true);
    setStudents(getInitialStudents());
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        window.localStorage.setItem('studentRoster', JSON.stringify(students));
      } catch (error) {
        console.error('Error saving students to localStorage', error);
      }
    }
  }, [students, isMounted]);

  const addStudent = (student: Student) => {
    if (students.find(s => s.id === student.id)) {
      throw new Error(`Student with UID "${student.id}" already exists.`);
    }
    setStudents(prevStudents => [student, ...prevStudents]);
  };

  const removeStudent = (studentId: string) => {
    setStudents(prevStudents => prevStudents.filter(s => s.id !== studentId));
  };

  if (!isMounted) {
    return null;
  }

  return (
    <StudentsContext.Provider value={{ students, addStudent, removeStudent }}>
      {children}
    </StudentsContext.Provider>
  );
};

export const useStudents = () => {
  const context = useContext(StudentsContext);
  if (context === undefined) {
    throw new Error('useStudents must be used within a StudentsProvider');
  }
  return context;
};

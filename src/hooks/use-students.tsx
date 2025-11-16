
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

export const StudentsProvider = ({ children }: { children: ReactNode }) => {
  const [students, setStudents] = useState<Student[]>(defaultStudentData);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const item = window.localStorage.getItem('studentRoster');
      if (item) {
        setStudents(JSON.parse(item));
      }
    } catch (error) {
      console.error('Error reading students from localStorage', error);
      setStudents(defaultStudentData);
    }
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
  
  const value = { students, addStudent, removeStudent };

  if (!isMounted) {
    const defaultContext: StudentsContextType = {
        students: defaultStudentData,
        addStudent: () => {},
        removeStudent: () => {},
    }
    return (
        <StudentsContext.Provider value={defaultContext}>
            {children}
        </StudentsContext.Provider>
    )
  }

  return (
    <StudentsContext.Provider value={value}>
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

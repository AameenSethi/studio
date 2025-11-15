'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Role = 'Student' | 'Teacher' | 'Parent';

interface UserContextType {
  userRole: Role;
  setUserRole: (role: Role) => void;
  userName: string;
  setUserName: (name: string) => void;
  userEmail: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userRole, setUserRole] = useState<Role>('Student');
  const [userName, setUserName] = useState<string>('Valeriy Trubnikov');
  const userEmail = 'learner@example.com';

  return (
    <UserContext.Provider value={{ userRole, setUserRole, userName, setUserName, userEmail }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

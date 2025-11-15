'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type Role = 'Student' | 'Teacher' | 'Parent';

interface UserContextType {
  userRole: Role;
  setUserRole: (role: Role) => void;
  userName: string;
  setUserName: (name: string) => void;
  userEmail: string;
  userAvatar: string | undefined;
  setUserAvatar: (avatar: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userRole, setUserRole] = useState<Role>('Student');
  const [userName, setUserName] = useState<string>('Valeriy Trubnikov');
  const userEmail = 'learner@example.com';
  const [userAvatar, setUserAvatar] = useState<string | undefined>(PlaceHolderImages.find((img) => img.id === 'user-avatar')?.imageUrl);


  return (
    <UserContext.Provider value={{ userRole, setUserRole, userName, setUserName, userEmail, userAvatar, setUserAvatar }}>
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

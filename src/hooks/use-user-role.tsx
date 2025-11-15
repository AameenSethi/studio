'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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
  userId: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Helper to get initial state from localStorage
const getInitialState = () => {
  if (typeof window === 'undefined') {
    return {
      role: 'Student' as Role,
      name: 'Valeriy Trubnikov',
      avatar: PlaceHolderImages.find((img) => img.id === 'user-avatar')?.imageUrl,
    };
  }
  try {
    const storedRole = localStorage.getItem('userRole');
    const storedName = localStorage.getItem('userName');
    const storedAvatar = localStorage.getItem('userAvatar');

    return {
      role: (storedRole ? JSON.parse(storedRole) : 'Student') as Role,
      name: storedName ? JSON.parse(storedName) : 'Valeriy Trubnikov',
      avatar: storedAvatar ? JSON.parse(storedAvatar) : PlaceHolderImages.find((img) => img.id === 'user-avatar')?.imageUrl,
    };
  } catch (error) {
    console.error("Failed to parse from localStorage", error);
    return {
      role: 'Student' as Role,
      name: 'Valeriy Trubnikov',
      avatar: PlaceHolderImages.find((img) => img.id === 'user-avatar')?.imageUrl,
    };
  }
};


export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);
  const initialState = getInitialState();

  const [userRole, setUserRole] = useState<Role>(initialState.role);
  const [userName, setUserName] = useState<string>(initialState.name);
  const userEmail = 'learner@example.com';
  const [userAvatar, setUserAvatar] = useState<string | undefined>(initialState.avatar);
  const userId = 'current-user-01'; // Simulating a fixed ID for the logged-in user

  useEffect(() => {
    setIsMounted(true);
    const savedState = getInitialState();
    setUserRole(savedState.role);
    setUserName(savedState.name);
    setUserAvatar(savedState.avatar);
  }, []);

  useEffect(() => {
    if (isMounted) {
        try {
            localStorage.setItem('userRole', JSON.stringify(userRole));
        } catch (error) {
            console.error("Failed to save role to localStorage", error);
        }
    }
  }, [userRole, isMounted]);

  useEffect(() => {
    if (isMounted) {
        try {
            localStorage.setItem('userName', JSON.stringify(userName));
        } catch (error) {
            console.error("Failed to save name to localStorage", error);
        }
    }
  }, [userName, isMounted]);

  useEffect(() => {
    if (isMounted) {
        try {
            localStorage.setItem('userAvatar', JSON.stringify(userAvatar));
        } catch (error) {
            console.error("Failed to save avatar to localStorage", error);
        }
    }
  }, [userAvatar, isMounted]);

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <UserContext.Provider value={{ userRole, setUserRole, userName, setUserName, userEmail, userAvatar, setUserAvatar, userId }}>
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

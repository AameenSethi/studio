'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type Role = 'Student';

interface UserContextType {
  userRole: Role;
  setUserRole: (role: Role) => void;
  userName: string;
  setUserName: (name: string) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  userAvatar: string | undefined;
  setUserAvatar: (avatar: string) => void;
  userId: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Helper to get initial state from localStorage
const getInitialState = () => {
    const defaultStudent = {
      role: 'Student' as Role,
      name: 'Alex Johnson',
      avatar: 'https://i.pravatar.cc/150?u=student-007',
      email: 'student@example.com',
      id: 'student-007',
    };

  if (typeof window === 'undefined') {
    return defaultStudent;
  }
  try {
    const storedRole = localStorage.getItem('userRole');
    const storedName = localStorage.getItem('userName');
    const storedAvatar = localStorage.getItem('userAvatar');
    const storedEmail = localStorage.getItem('userEmail');
    const storedId = localStorage.getItem('userId');
    
    return {
      role: (storedRole ? JSON.parse(storedRole) : defaultStudent.role) as Role,
      name: storedName ? JSON.parse(storedName) : defaultStudent.name,
      avatar: storedAvatar ? JSON.parse(storedAvatar) : defaultStudent.avatar,
      email: storedEmail ? JSON.parse(storedEmail) : defaultStudent.email,
      id: storedId ? JSON.parse(storedId) : defaultStudent.id,
    };
  } catch (error) {
    console.error("Failed to parse from localStorage", error);
    return defaultStudent;
  }
};


export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);
  
  const initialState = getInitialState();

  const [userRole, setUserRole] = useState<Role>(initialState.role);
  const [userName, setUserName] = useState<string>(initialState.name);
  const [userAvatar, setUserAvatar] = useState<string | undefined>(initialState.avatar);
  const [userId, setUserId] = useState<string>(initialState.id);
  const [userEmail, setUserEmailState] = useState<string>(initialState.email);

  const setUserEmail = (email: string) => {
    const state = getInitialState();
    setUserEmailState(email);
    setUserRole(state.role);
    setUserName(state.name);
    setUserAvatar(state.avatar);
    setUserId(state.id);
  }

  useEffect(() => {
    setIsMounted(true);
    const state = getInitialState();
    setUserEmailState(state.email);
    setUserRole(state.role);
    setUserName(state.name);
    setUserAvatar(state.avatar);
    setUserId(state.id);
  }, []);

  useEffect(() => {
    if (isMounted) {
        try {
            localStorage.setItem('userRole', JSON.stringify(userRole));
            localStorage.setItem('userName', JSON.stringify(userName));
            localStorage.setItem('userAvatar', JSON.stringify(userAvatar));
            localStorage.setItem('userEmail', JSON.stringify(userEmail));
            localStorage.setItem('userId', JSON.stringify(userId));
        } catch (error) {
            console.error("Failed to save to localStorage", error);
        }
    }
  }, [userRole, userName, userAvatar, userEmail, userId, isMounted]);

  const value = { userRole, setUserRole, userName, setUserName, userEmail, setUserEmail, userAvatar, setUserAvatar, userId };

  if (!isMounted) {
    // On the server or first render, you might want to return a default context
    // or null, depending on your app's needs. Returning null will cause consumers
    // to throw an error if not handled, which can be useful for debugging.
    const defaultContextValue = {
        userRole: 'Student' as Role,
        setUserRole: () => {},
        userName: 'Student',
        setUserName: () => {},
        userEmail: '',
        setUserEmail: () => {},
        userAvatar: '',
        setUserAvatar: () => {},
        userId: '',
    };
    return (
        <UserContext.Provider value={defaultContextValue}>
          {children}
        </UserContext.Provider>
      );
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    // This is a fallback for server-side rendering or if context is not ready
    return {
      userRole: 'Student' as Role,
      setUserRole: (role: Role) => {},
      userName: 'Student',
      setUserName: (name: string) => {},
      userEmail: '',
      setUserEmail: (email: string) => {},
      userAvatar: undefined,
      setUserAvatar: (avatar: string) => {},
      userId: 'student-007',
    };
  }
  return context;
};

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
  setUserEmail: (email: string) => void;
  userAvatar: string | undefined;
  setUserAvatar: (avatar: string) => void;
  userId: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Helper to get initial state from localStorage
const getInitialState = (email?: string) => {
  const isTeacher = email?.includes('teacher');
  const defaultStudent = {
    role: 'Student' as Role,
    name: 'Alex Johnson',
    avatar: 'https://i.pravatar.cc/150?u=user-123',
    email: 'student@example.com',
    id: 'user-123',
  };
  const defaultTeacher = {
    role: 'Teacher' as Role,
    name: 'Valeriy Trubnikov',
    avatar: PlaceHolderImages.find((img) => img.id === 'user-avatar')?.imageUrl,
    email: 'teacher@example.com',
    id: 'valeriy-trubnikov-01',
  };

  const selectedUser = isTeacher ? defaultTeacher : defaultStudent;

  if (typeof window === 'undefined') {
    return selectedUser;
  }
  try {
    const storedRole = localStorage.getItem('userRole');
    const storedName = localStorage.getItem('userName');
    const storedAvatar = localStorage.getItem('userAvatar');
    const storedEmail = localStorage.getItem('userEmail');
    const storedId = localStorage.getItem('userId');

    return {
      role: (storedRole ? JSON.parse(storedRole) : selectedUser.role) as Role,
      name: storedName ? JSON.parse(storedName) : selectedUser.name,
      avatar: storedAvatar ? JSON.parse(storedAvatar) : selectedUser.avatar,
      email: storedEmail ? JSON.parse(storedEmail) : selectedUser.email,
      id: storedId ? JSON.parse(storedId) : selectedUser.id,
    };
  } catch (error) {
    console.error("Failed to parse from localStorage", error);
    return selectedUser;
  }
};


export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);
  
  const [userEmail, setUserEmailState] = useState<string>(() => getInitialState().email);
  
  const initialState = getInitialState(userEmail);

  const [userRole, setUserRole] = useState<Role>(initialState.role);
  const [userName, setUserName] = useState<string>(initialState.name);
  const [userAvatar, setUserAvatar] = useState<string | undefined>(initialState.avatar);
  const [userId, setUserId] = useState<string>(initialState.id);

  const setUserEmail = (email: string) => {
    const isTeacher = email.toLowerCase().includes('teacher');
    const newState = getInitialState(email);
    
    setUserEmailState(email);
    setUserRole(newState.role);
    setUserName(newState.name);
    setUserAvatar(newState.avatar);
    setUserId(newState.id);
  }

  useEffect(() => {
    setIsMounted(true);
    const savedEmail = localStorage.getItem('userEmail');
    const state = getInitialState(savedEmail ? JSON.parse(savedEmail) : undefined);
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

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <UserContext.Provider value={{ userRole, setUserRole, userName, setUserName, userEmail, setUserEmail, userAvatar, setUserAvatar, userId }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    return {
        userRole: 'Student' as Role,
        setUserRole: () => {},
        userName: 'Guest',
        setUserName: () => {},
        userEmail: '',
        setUserEmail: () => {},
        userAvatar: undefined,
        setUserAvatar: () => {},
        userId: '',
    };
  }
  return context;
};

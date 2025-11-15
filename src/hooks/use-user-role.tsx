'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Simplified to only have 'Student' role
type Role = 'Student';

interface UserContextType {
  userRole: Role;
  userName: string;
  setUserName: (name: string) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  userAvatar: string | undefined;
  setUserAvatar: (avatar: string) => void;
  userId: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// This now always returns the same default student.
const getInitialState = () => {
    const defaultUser = {
      role: 'Student' as Role,
      name: 'Alex Johnson',
      avatar: `https://i.pravatar.cc/150?u=student-007`,
      email: 'student@example.com',
      id: 'student-007',
    };
    
    if (typeof window === 'undefined') {
        return defaultUser;
    }

    try {
        const storedName = localStorage.getItem('userName');
        const storedAvatar = localStorage.getItem('userAvatar');
        const storedEmail = localStorage.getItem('userEmail');
        const storedId = localStorage.getItem('userId');

        return {
            role: 'Student' as Role,
            name: storedName ? JSON.parse(storedName) : defaultUser.name,
            avatar: storedAvatar ? JSON.parse(storedAvatar) : defaultUser.avatar,
            email: storedEmail ? JSON.parse(storedEmail) : defaultUser.email,
            id: storedId ? JSON.parse(storedId) : defaultUser.id,
        }
    } catch (error) {
        console.error("Failed to parse from localStorage", error);
        return defaultUser;
    }
};


export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);
  
  const initialState = getInitialState();

  const [userRole] = useState<Role>(initialState.role);
  const [userName, setUserName] = useState<string>(initialState.name);
  const [userAvatar, setUserAvatar] = useState<string | undefined>(initialState.avatar);
  const [userId] = useState<string>(initialState.id);
  const [userEmail, setUserEmailState] = useState<string>(initialState.email);

  const setUserEmail = (email: string) => {
    setUserEmailState(email);
  }

  useEffect(() => {
    setIsMounted(true);
    const state = getInitialState();
    setUserEmailState(state.email);
    setUserName(state.name);
    setUserAvatar(state.avatar);
  }, []);

  useEffect(() => {
    if (isMounted) {
        try {
            localStorage.setItem('userName', JSON.stringify(userName));
            localStorage.setItem('userAvatar', JSON.stringify(userAvatar));
            localStorage.setItem('userEmail', JSON.stringify(userEmail));
            localStorage.setItem('userId', JSON.stringify(userId));
        } catch (error) {
            console.error("Failed to save to localStorage", error);
        }
    }
  }, [userName, userAvatar, userEmail, userId, isMounted]);

  const value = { userRole, userName, setUserName, userEmail, setUserEmail, userAvatar, setUserAvatar, userId };

  if (!isMounted) {
    const defaultContextValue = {
        userRole: 'Student' as Role,
        setUserName: () => {},
        userName: 'Student',
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
    return {
      userRole: 'Student' as Role,
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

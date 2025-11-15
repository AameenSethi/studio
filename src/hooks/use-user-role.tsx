'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
  userClass: string;
  setUserClass: (userClass: string) => void;
  userInstitution: string;
  setUserInstitution: (userInstitution: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const getInitialState = () => {
  const defaultUser = {
    role: 'Student' as Role,
    name: 'Alex Johnson',
    avatar: `https://i.pravatar.cc/150?u=student-007`,
    email: 'student@example.com',
    id: 'student-007',
    userClass: '10th Grade',
    userInstitution: 'State University',
  };

  if (typeof window === 'undefined') {
    return defaultUser;
  }

  try {
    const storedName = localStorage.getItem('userName');
    const storedAvatar = localStorage.getItem('userAvatar');
    const storedEmail = localStorage.getItem('userEmail');
    const storedId = localStorage.getItem('userId');
    const storedClass = localStorage.getItem('userClass');
    const storedInstitution = localStorage.getItem('userInstitution');

    return {
      role: 'Student' as Role,
      name: storedName ? JSON.parse(storedName) : defaultUser.name,
      avatar: storedAvatar ? JSON.parse(storedAvatar) : defaultUser.avatar,
      email: storedEmail ? JSON.parse(storedEmail) : defaultUser.email,
      id: storedId ? JSON.parse(storedId) : defaultUser.id,
      userClass: storedClass ? JSON.parse(storedClass) : defaultUser.userClass,
      userInstitution: storedInstitution ? JSON.parse(storedInstitution) : defaultUser.userInstitution,
    };
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
  const [userClass, setUserClassState] = useState<string>(initialState.userClass);
  const [userInstitution, setUserInstitutionState] = useState<string>(initialState.userInstitution);

  const setUserEmail = (email: string) => {
    setUserEmailState(email);
  };

  const setUserClass = (userClass: string) => {
    setUserClassState(userClass);
  }

  const setUserInstitution = (userInstitution: string) => {
    setUserInstitutionState(userInstitution);
  }

  useEffect(() => {
    setIsMounted(true);
    const state = getInitialState();
    setUserEmailState(state.email);
    setUserName(state.name);
    setUserAvatar(state.avatar);
    setUserClassState(state.userClass);
    setUserInstitutionState(state.userInstitution);
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('userName', JSON.stringify(userName));
        localStorage.setItem('userAvatar', JSON.stringify(userAvatar));
        localStorage.setItem('userEmail', JSON.stringify(userEmail));
        localStorage.setItem('userId', JSON.stringify(userId));
        localStorage.setItem('userClass', JSON.stringify(userClass));
        localStorage.setItem('userInstitution', JSON.stringify(userInstitution));
      } catch (error) {
        console.error("Failed to save to localStorage", error);
      }
    }
  }, [userName, userAvatar, userEmail, userId, userClass, userInstitution, isMounted]);

  const value: UserContextType = {
    userRole,
    userName,
    setUserName,
    userEmail,
    setUserEmail,
    userAvatar,
    setUserAvatar,
    userId,
    userClass,
    setUserClass,
    userInstitution,
    setUserInstitution,
  };

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
      userClass: '',
      setUserClass: () => {},
      userInstitution: '',
      setUserInstitution: () => {},
    };
    return (
      <UserContext.Provider value={defaultContextValue}>
        {children}
      </UserContext.Provider>
    );
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    // This can happen on the server, so we return a default state.
    return {
      userRole: 'Student' as Role,
      userName: 'Student',
      setUserName: (name: string) => {},
      userEmail: '',
      setUserEmail: (email: string) => {},
      userAvatar: undefined,
      setUserAvatar: (avatar: string) => {},
      userId: 'student-007',
      userClass: '10th Grade',
      setUserClass: (userClass: string) => {},
      userInstitution: 'State University',
      setUserInstitution: (userInstitution: string) => {},
    };
  }
  return context;
};

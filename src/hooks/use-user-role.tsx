
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Role = 'Student';

interface UserProfile {
  role: Role;
  name: string;
  email: string;
  avatar: string | undefined;
  id: string;
  class: string;
  field: string;
  institution: string;
}

interface UserContextType {
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  loadUserByEmail: (email: string) => void;
  // For convenience, we can keep some direct accessors if needed elsewhere
  userName: string;
  userEmail: string;
  userAvatar: string | undefined;
  userId: string;
  userClass: string;
  userField: string;
  userInstitution: string;
  // Deprecated setters, replaced by updateUser
  setUserName: (name: string) => void;
  setUserEmail: (email: string) => void;
  setUserAvatar: (avatar: string) => void;
  setUserClass: (userClass: string) => void;
  setUserField: (userField: string) => void;
  setUserInstitution: (userInstitution: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const defaultUser: UserProfile = {
    role: 'Student',
    name: 'Alex Johnson',
    avatar: `https://i.pravatar.cc/150?u=student-007`,
    email: 'alex@example.com',
    id: 'student-007',
    class: '10th Grade',
    field: '',
    institution: 'State University',
};

const mockUserDatabase: { [email: string]: UserProfile } = {
    'alex@example.com': defaultUser,
    'student@example.com': {
        role: 'Student',
        name: 'Jane Doe',
        avatar: `https://i.pravatar.cc/150?u=student-008`,
        email: 'student@example.com',
        id: 'student-008',
        class: '12th Grade',
        field: 'Science',
        institution: 'Community College',
    }
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const item = window.localStorage.getItem('userProfile');
      if (item) {
        const storedUser = JSON.parse(item);
        // Ensure the stored user is still valid, otherwise fallback
        if (storedUser && storedUser.email) {
            setUser(storedUser);
        }
      }
    } catch (error) {
      console.error("Failed to parse from localStorage", error);
      setUser(defaultUser);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        // Also update our mock DB so new users can "log in" again
        if (user && user.email) {
            mockUserDatabase[user.email] = user;
        }
        localStorage.setItem('userProfile', JSON.stringify(user));
      } catch (error) {
        console.error("Failed to save to localStorage", error);
      }
    }
  }, [user, isMounted]);

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser(prevUser => {
        const newUser = { ...prevUser, ...updates };
        if (updates.email) {
            mockUserDatabase[updates.email] = newUser;
        }
        return newUser;
    });
  };

  const loadUserByEmail = (email: string) => {
    const foundUser = mockUserDatabase[email.toLowerCase()];
    if (foundUser) {
        setUser(foundUser);
    } else {
        // Fallback to default if something goes wrong, though login form should prevent this
        setUser(defaultUser);
    }
  }
  
  // Legacy setters for backward compatibility, now use updateUser
  const setUserName = (name: string) => updateUser({ name });
  const setUserEmail = (email: string) => updateUser({ email });
  const setUserAvatar = (avatar: string) => updateUser({ avatar });
  const setUserClass = (userClass: string) => updateUser({ class: userClass });
  const setUserField = (userField: string) => updateUser({ field: userField });
  const setUserInstitution = (userInstitution: string) => updateUser({ institution: userInstitution });

  const value: UserContextType = {
    user,
    updateUser,
    loadUserByEmail,
    userName: user.name,
    userEmail: user.email,
    userAvatar: user.avatar,
    userId: user.id,
    userClass: user.class,
    userField: user.field,
    userInstitution: user.institution,
    setUserName,
    setUserEmail,
    setUserAvatar,
    setUserClass,
    setUserField,
    setUserInstitution
  };
  
  if (!isMounted) {
    const defaultContext: UserContextType = {
        user: defaultUser,
        updateUser: () => {},
        loadUserByEmail: () => {},
        userName: defaultUser.name,
        userEmail: defaultUser.email,
        userAvatar: defaultUser.avatar,
        userId: defaultUser.id,
        userClass: defaultUser.class,
        userField: defaultUser.field,
        userInstitution: defaultUser.institution,
        setUserName: () => {},
        setUserEmail: () => {},
        setUserAvatar: () => {},
        setUserClass: () => {},
        setUserField: () => {},
        setUserInstitution: () => {},
    };
    return (
        <UserContext.Provider value={defaultContext}>
            {children}
        </UserContext.Provider>
    )
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

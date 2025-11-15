'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type HistoryItem = {
  id: string;
  type: 'Study Plan' | 'Explanation' | 'Practice Test' | 'Progress Report';
  title: string;
  content: any; // Can be string or object with questions/answers
  timestamp: string;
  score?: number; // Add score for practice tests
  duration?: number; // Add duration for practice tests in seconds
  subject?: string;
  topic?: string;
};

interface HistoryContextType {
  history: HistoryItem[];
  addHistoryItem: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

const getInitialHistory = (): HistoryItem[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const item = window.localStorage.getItem('actionHistory');
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error('Error reading history from localStorage', error);
    return [];
  }
};

export const HistoryProvider = ({ children }: { children: ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(getInitialHistory);

  useEffect(() => {
    setIsMounted(true);
    setHistory(getInitialHistory());
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        window.localStorage.setItem('actionHistory', JSON.stringify(history));
      } catch (error) {
        console.error('Error saving history to localStorage', error);
      }
    }
  }, [history, isMounted]);

  const addHistoryItem = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: new Date().toISOString() + Math.random().toString(),
      timestamp: new Date().toISOString(),
    };
    setHistory(prevHistory => [newItem, ...prevHistory]);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <HistoryContext.Provider value={{ history, addHistoryItem, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};

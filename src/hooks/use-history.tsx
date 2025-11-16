
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

export const HistoryProvider = ({ children }: { children: ReactNode }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const item = window.localStorage.getItem('actionHistory');
      if (item) {
        setHistory(JSON.parse(item));
      }
    } catch (error) {
      console.error('Error reading history from localStorage', error);
      setHistory([]);
    }
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
    const newItem = {
      ...item,
      id: new Date().toISOString() + Math.random().toString(),
      timestamp: new Date().toISOString(),
    };
    setHistory(prevHistory => [newItem, ...prevHistory]);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const value = { history, addHistoryItem, clearHistory };

  if (!isMounted) {
    const defaultContext: HistoryContextType = {
        history: [],
        addHistoryItem: () => {},
        clearHistory: () => {},
    }
    return (
        <HistoryContext.Provider value={defaultContext}>
            {children}
        </HistoryContext.Provider>
    )
  }

  return (
    <HistoryContext.Provider value={value}>
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

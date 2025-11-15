'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

const defaultTopics = ['Algebra', 'Calculus', 'Physics'];

interface TrackedTopicsContextType {
  trackedTopics: string[];
  addTrackedTopic: (topic: string) => void;
  removeTrackedTopic: (topic: string) => void;
}

const TrackedTopicsContext = createContext<TrackedTopicsContextType | undefined>(undefined);

const getInitialTopics = (): string[] => {
  if (typeof window === 'undefined') {
    return defaultTopics;
  }
  try {
    const item = window.localStorage.getItem('trackedTopics');
    return item ? JSON.parse(item) : defaultTopics;
  } catch (error) {
    console.error('Error reading topics from localStorage', error);
    return defaultTopics;
  }
};

export const TrackedTopicsProvider = ({ children }: { children: ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [trackedTopics, setTrackedTopics] = useState<string[]>(getInitialTopics);

  useEffect(() => {
    setIsMounted(true);
    setTrackedTopics(getInitialTopics());
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        window.localStorage.setItem('trackedTopics', JSON.stringify(trackedTopics));
      } catch (error) {
        console.error('Error saving topics to localStorage', error);
      }
    }
  }, [trackedTopics, isMounted]);

  const addTrackedTopic = (topic: string) => {
    if (trackedTopics.find(t => t.toLowerCase() === topic.toLowerCase())) {
        throw new Error(`Topic "${topic}" is already being tracked.`);
    }
    setTrackedTopics(prevTopics => [...prevTopics, topic]);
  };

  const removeTrackedTopic = (topic: string) => {
    setTrackedTopics(prevTopics => prevTopics.filter(t => t !== topic));
  };
  
  if (!isMounted) {
    return (
        <TrackedTopicsContext.Provider value={{ trackedTopics: defaultTopics, addTrackedTopic: ()=>{}, removeTrackedTopic: ()=>{} }}>
            {children}
        </TrackedTopicsContext.Provider>
    );
  }

  return (
    <TrackedTopicsContext.Provider value={{ trackedTopics, addTrackedTopic, removeTrackedTopic }}>
      {children}
    </TrackedTopicsContext.Provider>
  );
};

export const useTrackedTopics = () => {
  const context = useContext(TrackedTopicsContext);
  if (context === undefined) {
    // This can happen on the server or if the provider is missing.
    // We return a default state to prevent crashing, but functionality will be limited.
    return {
        trackedTopics: defaultTopics,
        addTrackedTopic: (topic: string) => {},
        removeTrackedTopic: (topic: string) => {},
    };
  }
  return context;
};

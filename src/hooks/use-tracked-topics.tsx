'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface TrackedTopicsContextType {
  trackedTopics: string[];
  addTopic: (topic: string) => void;
  removeTopic: (topic: string) => void;
  clearTopics: () => void;
}

const TrackedTopicsContext = createContext<TrackedTopicsContextType | undefined>(undefined);

const getInitialTopics = (): string[] => {
  if (typeof window === 'undefined') {
    return ['Algebra', 'Physics']; // Default topics
  }
  try {
    const item = window.localStorage.getItem('trackedTopics');
    // If nothing is in local storage, start with some defaults
    return item ? JSON.parse(item) : ['Algebra', 'Physics', 'History'];
  } catch (error) {
    console.error('Error reading tracked topics from localStorage', error);
    return ['Algebra', 'Physics', 'History'];
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
        console.error('Error saving tracked topics to localStorage', error);
      }
    }
  }, [trackedTopics, isMounted]);

  const addTopic = (topic: string) => {
    if (!topic.trim()) {
        throw new Error("Topic cannot be empty.");
    }
    const formattedTopic = topic.trim();
    if (trackedTopics.find(t => t.toLowerCase() === formattedTopic.toLowerCase())) {
        throw new Error(`Topic "${formattedTopic}" is already being tracked.`);
    }
    setTrackedTopics(prevTopics => [...prevTopics, formattedTopic]);
  };

  const removeTopic = (topicToRemove: string) => {
    setTrackedTopics(prevTopics => prevTopics.filter(topic => topic !== topicToRemove));
  };

  const clearTopics = () => {
    setTrackedTopics([]);
  };

  if (!isMounted) {
    // Return null or a loader on the server/first render to avoid hydration mismatch
    // The context will not be available, so children components might need to handle this.
    return null;
  }

  return (
    <TrackedTopicsContext.Provider value={{ trackedTopics, addTopic, removeTopic, clearTopics }}>
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
        trackedTopics: [],
        addTopic: () => { throw new Error('useTrackedTopics must be used within a TrackedTopicsProvider'); },
        removeTopic: () => { throw new Error('useTrackedTopics must be used within a TrackedTopicsProvider'); },
        clearTopics: () => { throw new Error('useTrackedTopics must be used within a TrackedTopicsProvider'); },
    };
  }
  return context;
};

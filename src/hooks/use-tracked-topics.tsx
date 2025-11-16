
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type TrackedTopic = {
  topic: string;
  subject: string;
};

const defaultTopics: TrackedTopic[] = [
    { topic: 'Algebra', subject: 'Mathematics' },
    { topic: 'Calculus', subject: 'Mathematics' },
    { topic: 'Thermodynamics', subject: 'Physics' },
];

interface TrackedTopicsContextType {
  trackedTopics: TrackedTopic[];
  addTrackedTopic: (topic: TrackedTopic) => void;
  removeTrackedTopic: (topic: string) => void;
}

const TrackedTopicsContext = createContext<TrackedTopicsContextType | undefined>(undefined);

export const TrackedTopicsProvider = ({ children }: { children: ReactNode }) => {
  const [trackedTopics, setTrackedTopics] = useState<TrackedTopic[]>(defaultTopics);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const item = window.localStorage.getItem('trackedTopics');
      if (item) {
          setTrackedTopics(JSON.parse(item));
      }
    } catch (error) {
      console.error('Error reading topics from localStorage', error);
      setTrackedTopics(defaultTopics);
    }
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

  const addTrackedTopic = (topic: TrackedTopic) => {
    setTrackedTopics(prevTopics => {
        if (prevTopics.find(t => t.topic.toLowerCase() === topic.topic.toLowerCase())) {
            return prevTopics;
        }
        return [...prevTopics, topic];
    });
  };

  const removeTrackedTopic = (topicToRemove: string) => {
    setTrackedTopics(prevTopics => prevTopics.filter(t => t.topic !== topicToRemove));
  };
  
  const value = { trackedTopics, addTrackedTopic, removeTrackedTopic };

  if (!isMounted) {
    const defaultContext: TrackedTopicsContextType = {
        trackedTopics: defaultTopics,
        addTrackedTopic: () => {},
        removeTrackedTopic: () => {},
    };
    return (
        <TrackedTopicsContext.Provider value={defaultContext}>
            {children}
        </TrackedTopicsContext.Provider>
    );
  }

  return (
    <TrackedTopicsContext.Provider value={value}>
      {children}
    </TrackedTopicsContext.Provider>
  );
};

export const useTrackedTopics = () => {
  const context = useContext(TrackedTopicsContext);
  if (context === undefined) {
    throw new Error('useTrackedTopics must be used within a TrackedTopicsProvider');
  }
  return context;
};

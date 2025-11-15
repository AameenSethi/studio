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

const getInitialTopics = (): TrackedTopic[] => {
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
  const [trackedTopics, setTrackedTopics] = useState<TrackedTopic[]>(getInitialTopics);

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

  const addTrackedTopic = (topic: TrackedTopic) => {
    if (trackedTopics.find(t => t.topic.toLowerCase() === topic.topic.toLowerCase())) {
        throw new Error(`Topic "${topic.topic}" is already being tracked.`);
    }
    setTrackedTopics(prevTopics => [...prevTopics, topic]);
  };

  const removeTrackedTopic = (topicToRemove: string) => {
    setTrackedTopics(prevTopics => prevTopics.filter(t => t.topic !== topicToRemove));
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
        addTrackedTopic: (topic: TrackedTopic) => {},
        removeTrackedTopic: (topic: string) => {},
    };
  }
  return context;
};

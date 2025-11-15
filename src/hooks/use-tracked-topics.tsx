'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { useHistory } from './use-history';

interface TrackedTopicsContextType {
  trackedTopics: string[];
}

const TrackedTopicsContext = createContext<TrackedTopicsContextType | undefined>(undefined);

export const TrackedTopicsProvider = ({ children }: { children: ReactNode }) => {
  const { history } = useHistory();

  const trackedTopics = useMemo(() => {
    const testHistory = history.filter(item => item.type === 'Practice Test');
    const topics = new Set<string>();
    testHistory.forEach(item => {
      const name = item.topic || item.subject;
      if (name) {
        topics.add(name);
      }
    });
    return Array.from(topics);
  }, [history]);

  return (
    <TrackedTopicsContext.Provider value={{ trackedTopics }}>
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
    };
  }
  return context;
};

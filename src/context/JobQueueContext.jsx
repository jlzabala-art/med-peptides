"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const JobQueueContext = createContext();

export function JobQueueProvider({ children }) {
  const [jobs, setJobs] = useState([]); // { id, title, status: 'running' | 'success' | 'error', progress: 0-100 }

  const addJob = useCallback((job) => {
    const id = job.id || `job_${Date.now()}`;
    setJobs((prev) => [...prev, { ...job, id, status: 'running', progress: 0 }]);
    return id;
  }, []);

  const updateJob = useCallback((id, updates) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates } : j)));
  }, []);

  const removeJob = useCallback((id) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setJobs((prev) => prev.filter((j) => j.status === 'running'));
  }, []);

  const value = useMemo(() => ({
    jobs,
    addJob,
    updateJob,
    removeJob,
    clearCompleted
  }), [jobs, addJob, updateJob, removeJob, clearCompleted]);

  return (
    <JobQueueContext.Provider value={value}>
      {children}
    </JobQueueContext.Provider>
  );
}

export function useJobQueue() {
  const ctx = useContext(JobQueueContext);
  if (!ctx) throw new Error('useJobQueue must be used within a JobQueueProvider');
  return ctx;
}

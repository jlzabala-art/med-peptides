"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useJobQueue } from '../../context/JobQueueContext';
import { Loader, CheckCircle, XCircle, Activity, ChevronDown } from 'lucide-react';

export default function JobQueueWidget() {
  const { jobs, clearCompleted } = useJobQueue();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const runningJobs = jobs.filter(j => j.status === 'running');
  const isRunning = runningJobs.length > 0;

  if (jobs.length === 0) return null;

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      {/* Widget Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 0.8rem',
          borderRadius: '20px',
          border: '1px solid',
          borderColor: isRunning ? '#bae6fd' : '#e2e8f0',
          backgroundColor: isRunning ? '#f0f9ff' : '#f8fafc',
          color: isRunning ? '#0284c7' : '#64748b',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontSize: '0.8rem',
          fontWeight: 600
        }}
      >
        {isRunning ? (
          <Loader size={14} className="animate-spin" />
        ) : (
          <Activity size={14} />
        )}
        <span>{isRunning ? `${runningJobs.length} active` : 'No active jobs'}</span>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 10px)',
          right: 0,
          width: '320px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          zIndex: 1000,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ 
            padding: '1rem', 
            borderBottom: '1px solid #e2e8f0', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc'
          }}>
            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>Background Operations</h4>
            {jobs.length > 0 && !isRunning && (
              <button 
                onClick={clearCompleted}
                style={{ fontSize: '0.75rem', color: '#0369a1', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Clear All
              </button>
            )}
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {jobs.slice().reverse().map(job => (
              <div key={job.id} style={{
                padding: '1rem',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}>
                <div style={{ marginTop: '2px' }}>
                  {job.status === 'running' && <Loader size={16} color="#0ea5e9" className="animate-spin" />}
                  {job.status === 'success' && <CheckCircle size={16} color="#10b981" />}
                  {job.status === 'error' && <XCircle size={16} color="#ef4444" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                    {job.title}
                  </div>
                  {job.status === 'running' && job.progress !== undefined && (
                    <div style={{ width: '100%', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', marginTop: '0.5rem' }}>
                      <div style={{ 
                        height: '100%', 
                        backgroundColor: '#0ea5e9', 
                        borderRadius: '2px',
                        width: `${Math.max(5, job.progress)}%`,
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  )}
                  {job.status === 'error' && job.error && (
                    <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>{job.error}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

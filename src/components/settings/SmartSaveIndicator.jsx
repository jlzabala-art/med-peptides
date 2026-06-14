import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';




export default function SmartSaveIndicator() {
  const [saveState, setSaveState] = useState('idle'); // idle, saving, saved, error
  const [lastSaved, setLastSaved] = useState(null);
  const [displayTime, setDisplayTime] = useState('');

  useEffect(() => {
    const handleSaving = () => setSaveState('saving');
    const handleSaved = (e) => {
      setSaveState('saved');
      setLastSaved(e.detail.time);
    };
    const handleError = () => setSaveState('error');

    window.addEventListener('settings:saving', handleSaving);
    window.addEventListener('settings:saved', handleSaved);
    window.addEventListener('settings:saveError', handleError);

    return () => {
      window.removeEventListener('settings:saving', handleSaving);
      window.removeEventListener('settings:saved', handleSaved);
      window.removeEventListener('settings:saveError', handleError);
    };
  }, []);

  useEffect(() => {
    if (!lastSaved) return;
    const updateTime = () => {
      setDisplayTime(`Saved ${formatDistanceToNow(lastSaved, { addSuffix: true })}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, [lastSaved]);

  if (saveState === 'idle' && !lastSaved) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      right: '1rem',
      backgroundColor: 'white',
      padding: '0.75rem 1rem',
      borderRadius: '99px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      border: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      zIndex: 50,
      fontSize: '0.8rem',
      fontWeight: 600,
      color: 'var(--text-main)',
      transition: 'all 0.3s'
    }}>
      {saveState === 'saving' && (
        <>
          <Loader2 size={16} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
          <span>Saving...</span>
        </>
      )}
      {saveState === 'saved' && (
        <>
          <CheckCircle2 size={16} color="var(--success)" />
          <span style={{ color: 'var(--text-muted)' }}>{displayTime}</span>
        </>
      )}

      {saveState === 'error' && (
        <>
          <AlertCircle size={16} color="var(--error)" />
          <span style={{ color: 'var(--error)' }}>Failed to save</span>
        </>
      )}
    </div>
  );
}
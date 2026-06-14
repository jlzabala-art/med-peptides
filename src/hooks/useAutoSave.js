import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function useAutoSave(initialData, saveFn, delay = 1000) {
  const [data, setData] = useState(initialData);
  const [saveState, setSaveState] = useState('idle'); // idle, saving, saved, error
  const [lastSaved, setLastSaved] = useState(null);
  
  const timerRef = useRef(null);
  const isFirstRender = useRef(true);

  // Update internal data when initialData changes externally (e.g. from fetch)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setData(initialData);
  }, [initialData]);

  const updateField = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
    setSaveState('saving');
    
    if (timerRef.current) clearTimeout(timerRef.current);
    
    timerRef.current = setTimeout(async () => {
      try {
        await saveFn({ [field]: value });
        setSaveState('saved');
        setLastSaved(new Date());
        
        // Dispatch event for UI indicator
        window.dispatchEvent(new CustomEvent('settings:saved', { detail: { time: new Date() } }));
      } catch (err) {
        console.error('AutoSave Error:', err);
        setSaveState('error');
        toast.error('Failed to save changes');
        window.dispatchEvent(new CustomEvent('settings:saveError'));
      }
    }, delay);
  };

  return { data, updateField, saveState, lastSaved };
}

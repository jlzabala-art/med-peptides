import { useState, useEffect } from 'react';
import { useGlobalStore } from '../../../../stores/globalStore';

/**
 * Custom Hook: useProtocolManager
 * Centralizes the state, UI logic, and saving functions for the Protocol Hub Dashboard.
 */
export function useProtocolManager({ initialProtocol, onSave, onClose, onChange }) {
  const [activeTab, setActiveTab] = useState('clinical');
  const [editedProtocol, setEditedProtocol] = useState({ ...initialProtocol });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const initializeGlobalData = useGlobalStore(state => state.initializeGlobalData);

  useEffect(() => {
    initializeGlobalData();
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initializeGlobalData]);

  // Deep update handler for the protocol
  const handleUpdate = (updates) => {
    setEditedProtocol(prev => {
      const next = { ...prev, ...updates };
      if (onChange) onChange(next);
      return next;
    });
    setHasUnsavedChanges(true);
  };

  const handleSaveAll = async () => {
    if (onSave) {
      await onSave(editedProtocol);
      setHasUnsavedChanges(false);
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      // Optional: Add warning dialog logic here if needed
      // Currently, it just closes, but we track the boolean for future UX
    }
    if (onClose) onClose();
  };

  return {
    activeTab,
    setActiveTab,
    editedProtocol,
    isMobile,
    hasUnsavedChanges,
    handleUpdate,
    handleSaveAll,
    handleClose,
  };
}

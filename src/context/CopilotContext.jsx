/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

const CopilotContext = createContext(null);

export function useCopilot() {
  return useContext(CopilotContext);
}

export function CopilotProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState('context'); // 'compact', 'context', 'full'
  const [mode, setMode] = useState('operations'); // operations, medical, commercial, executive, personal
  const [contextData, setContextData] = useState({
    entityType: 'Module', // e.g., 'Patient', 'Clinic', 'Physician', 'Module'
    entityId: null,
    entityName: 'Overview',
    workflow: 'General',
    category: 'All',
    results: 0,
    filters: {}
  });

  const toggleCopilot = () => {
    setIsOpen(prev => {
      if (!prev) setPanelWidth('context');
      return !prev;
    });
  };
  const openCopilot = () => setIsOpen(true);
  const closeCopilot = () => setIsOpen(false);

  const toggleCommandBar = () => setIsCommandBarOpen(prev => !prev);

  // Global listener for CMD+K or CTRL+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      // CMD+K (Mac) or CTRL+K (Windows)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandBar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const value = {
    isOpen,
    toggleCopilot,
    openCopilot,
    closeCopilot,
    isCommandBarOpen,
    setIsCommandBarOpen,
    toggleCommandBar,
    panelWidth,
    setPanelWidth,
    mode,
    setMode,
    contextData,
    setContextData
  };

  return (
    <CopilotContext.Provider value={value}>
      {children}
    </CopilotContext.Provider>
  );
}

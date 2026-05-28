import React, { createContext, useContext, useState, useCallback } from 'react';

const HeaderContext = createContext(null);

export function HeaderProvider({ children }) {
  const [headerContent, setHeaderContent] = useState(null);

  const setHeader = useCallback((content) => {
    setHeaderContent(content);
  }, []);

  const clearHeader = useCallback(() => {
    setHeaderContent(null);
  }, []);

  return (
    <HeaderContext.Provider value={{ headerContent, setHeader, clearHeader }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeaderContext() {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeaderContext must be used within a HeaderProvider');
  }
  return context;
}

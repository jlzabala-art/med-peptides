import React, { createContext, useContext, useState, useCallback } from 'react';

const AIContext = createContext(null);

/**
 * AIProvider
 * 
 * Replaces the window.dispatchEvent anti-pattern for passing page context
 * to the Atlas AI assistant. Wrap the admin dashboard tree with this provider
 * so that any child component can call `setPageContext()` to update the context
 * that Atlas AI uses to answer user queries.
 */
export function AIProvider({ children }) {
  const [pageContext, setPageContextState] = useState(null);

  const setPageContext = useCallback((ctx) => {
    setPageContextState(prev => ({
      ...prev,
      ...ctx,
    }));
  }, []);

  const clearPageContext = useCallback(() => {
    setPageContextState(null);
  }, []);

  return (
    <AIContext.Provider value={{ pageContext, setPageContext, clearPageContext }}>
      {children}
    </AIContext.Provider>
  );
}

/**
 * useAIContext
 * 
 * Consume the AI page context from any component in the tree.
 * Returns `{ pageContext, setPageContext, clearPageContext }`.
 */
export function useAIContext() {
  const ctx = useContext(AIContext);
  if (!ctx) {
    // Gracefully degrade — some components may render outside the provider
    // (e.g. story-book, unit tests). Return a no-op version.
    return {
      pageContext: null,
      setPageContext: () => {},
      clearPageContext: () => {},
    };
  }
  return ctx;
}

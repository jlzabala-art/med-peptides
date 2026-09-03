"use client";
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const DrawerContext = createContext(null);

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within a DrawerProvider');
  }
  return context;
};

export function DrawerProvider({ children }) {
  const [drawers, setDrawers] = useState([]);

  /**
   * type: 'patient' | 'prescription' | 'order' | 'product'
   * id: the document ID
   * data: pre-fetched data (optional)
   */
  const openDrawer = useCallback((type, id, data = null) => {
    setDrawers(prev => {
      // Prevent opening the exact same resource multiple times
      if (prev.some(d => d.type === type && d.resourceId === id)) {
        return prev;
      }
      
      const drawerId = `${type}_${id}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      return [...prev, { id: drawerId, type, resourceId: id, data }];
    });
  }, []);

  const closeDrawer = useCallback((drawerId) => {
    setDrawers(prev => prev.filter(d => d.id !== drawerId));
  }, []);

  const closeAllDrawers = useCallback(() => {
    setDrawers([]);
  }, []);

  const value = useMemo(() => ({
    drawers,
    openDrawer,
    closeDrawer,
    closeAllDrawers
  }), [drawers, openDrawer, closeDrawer, closeAllDrawers]);

  return (
    <DrawerContext.Provider value={value}>
      {children}
    </DrawerContext.Provider>
  );
}

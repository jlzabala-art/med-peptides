import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ClinicalCartContext = createContext();

export function ClinicalCartProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [patient, setPatient] = useState(null);
  const [items, setItems] = useState([]);
  
  // Load state from localStorage on mount (for persistence across reloads)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('clinical_cart_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.patient) setPatient(parsed.patient);
        if (parsed.items) setItems(parsed.items);
      }
    } catch (e) {
      console.warn("Failed to load clinical cart state");
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('clinical_cart_state', JSON.stringify({ patient, items }));
  }, [patient, items]);

  const toggleCart = useCallback(() => setIsOpen(prev => !prev), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const selectPatient = useCallback((p) => {
    setPatient(p);
    openCart();
  }, [openCart]);

  const addItem = useCallback((item) => {
    setItems(prev => {
      // Check if it's already in the cart
      const existingIdx = prev.findIndex(i => i.id === item.id || i.objectID === item.objectID);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity = (updated[existingIdx].quantity || 1) + (item.quantity || 1);
        return updated;
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
    openCart();
  }, [openCart]);

  const addProtocol = useCallback((protocol) => {
    // A protocol can be added as a composite item, or we can explode its items.
    // For now, let's add it as a single composite item.
    setItems(prev => {
      const existingIdx = prev.findIndex(i => i.id === protocol.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity = (updated[existingIdx].quantity || 1) + 1;
        return updated;
      }
      return [...prev, { ...protocol, isProtocol: true, quantity: 1 }];
    });
    openCart();
  }, [openCart]);

  const updateQuantity = useCallback((id, delta) => {
    setItems(prev => prev.map(item => {
      if (item.id === id || item.objectID === id) {
        const newQty = (item.quantity || 1) + delta;
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    }));
  }, []);

  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id && item.objectID !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setPatient(null);
  }, []);

  const contextValue = {
    isOpen,
    toggleCart,
    openCart,
    closeCart,
    patient,
    selectPatient,
    items,
    addItem,
    addProtocol,
    updateQuantity,
    removeItem,
    clearCart
  };

  return (
    <ClinicalCartContext.Provider value={contextValue}>
      {children}
    </ClinicalCartContext.Provider>
  );
}

export function useClinicalCart() {
  const context = useContext(ClinicalCartContext);
  if (context === undefined) {
    throw new Error('useClinicalCart must be used within a ClinicalCartProvider');
  }
  return context;
}

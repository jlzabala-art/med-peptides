import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ModalContext = createContext(null);

/**
 * ModalProvider
 * Global provider for managing a stack of modals.
 * Enables intercepting the mobile back button to close modals instead of navigating back.
 */
export function ModalProvider({ children }) {
  const [modals, setModals] = useState([]);

  // Close the topmost modal
  const closeModal = useCallback((modalId) => {
    setModals((prev) => {
      // If modalId is provided, close that specific modal, otherwise close the top one
      if (modalId) {
        return prev.filter((m) => m.id !== modalId);
      }
      return prev.slice(0, -1);
    });
  }, []);

  // Open a new modal and push to history state
  const openModal = useCallback((id, component, props = {}) => {
    setModals((prev) => {
      // Avoid duplicates
      if (prev.find((m) => m.id === id)) return prev;

      // Push state so the browser back button can be intercepted
      if (typeof window !== 'undefined') {
        window.history.pushState({ modalId: id }, '', window.location.pathname);
      }

      return [...prev, { id, component, props }];
    });
  }, []);

  // Handle hardware back button / browser back button
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = (event) => {
      // If there are open modals, popping the state means the user pressed back.
      // We should close the top modal.
      setModals((prev) => {
        if (prev.length > 0) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <ModalContext.Provider value={{ modals, openModal, closeModal }}>
      {children}
      {/* Render all active modals */}
      {modals.map((modal, index) => {
        const Component = modal.component;
        return (
          <div key={modal.id} style={{ zIndex: 1000 + index, position: 'relative' }}>
            <Component
              {...modal.props}
              onClose={() => {
                // If closing manually via a button, we also need to back out of the history state
                if (typeof window !== 'undefined') {
                  // We go back in history to consume the state we pushed
                  window.history.back();
                } else {
                  closeModal(modal.id);
                }
              }}
            />
          </div>
        );
      })}
    </ModalContext.Provider>
  );
}

/**
 * useModalStack
 * Hook to access the global modal context.
 */
export function useModalStack() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModalStack must be used within a ModalProvider');
  }
  return context;
}

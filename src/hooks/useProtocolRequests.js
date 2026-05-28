 
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'mp_protocol_requests';

/**
 * Manages a separate list of protocol bundle requests, independent of the
 * individual-product cart. Protocols are stored by their Firestore ID so no
 * item-level extraction is needed.
 *
 * Shape of each entry:
 * {
 *   id:            string   – Firestore protocol document ID
 *   name:          string   – display name
 *   goal:          string   – clinical goal / formData.goal
 *   phases:        number   – number of phases
 *   products:      string[] – agent names (top-level list, no dosage needed here)
 *   estimatedCost: number   – USD total from cost_summary
 *   addedAt:       string   – ISO timestamp
 * }
 */
export function useProtocolRequests() {
  const [protocolRequests, setProtocolRequests] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(protocolRequests));
    } catch (e) {
      console.warn('Could not save protocol requests:', e);
    }
  }, [protocolRequests]);

  const addProtocolRequest = (entry) => {
    setProtocolRequests(prev => {
      // Avoid exact duplicate (same Firestore ID)
      if (prev.some(p => p.id === entry.id)) return prev;
      return [...prev, { ...entry, addedAt: new Date().toISOString() }];
    });
  };

  const removeProtocolRequest = (id) => {
    setProtocolRequests(prev => prev.filter(p => p.id !== id));
  };

  const clearProtocolRequests = () => setProtocolRequests([]);

  return {
    protocolRequests,
    addProtocolRequest,
    removeProtocolRequest,
    clearProtocolRequests,
    protocolRequestCount: protocolRequests.length,
  };
}

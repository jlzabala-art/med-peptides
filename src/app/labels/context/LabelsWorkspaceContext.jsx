'use client';

import React, { createContext, useContext } from 'react';

const LabelsWorkspaceContext = createContext(null);

/**
 * LabelsWorkspaceProvider
 * ─────────────────────────────────────────────────────────────────────────────
 * Eliminates prop-drilling across LabelsHeader, LabelsHomeView, LabelsMetaStrip,
 * LabelsPreflightBar, and embedded label portals (/pharmacy/labels, /rx/[code]/labels).
 */
export function LabelsWorkspaceProvider({ value, children }) {
  return (
    <LabelsWorkspaceContext.Provider value={value}>
      {children}
    </LabelsWorkspaceContext.Provider>
  );
}

export function useLabelsWorkspace() {
  return useContext(LabelsWorkspaceContext);
}

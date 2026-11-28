'use client';

import React from 'react';
import GcpSideDrawer from './GcpSideDrawer';

/**
 * HighDensityDrawer
 * Backward-compatible wide preset alias delegating to canonical GcpSideDrawer.
 */
export default function HighDensityDrawer({
  isOpen,
  onClose,
  children,
  width = 'min(1200px, calc(100vw - 280px))',
  title = '',
  hideHeader = true,
  zIndex = 9999,
}) {
  return (
    <GcpSideDrawer
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      width={width}
      title={title}
      hideHeader={hideHeader}
      bodyPadding="0"
      expandable={false}
      zIndex={zIndex}
      ariaLabel="High density workspace drawer"
    >
      {children}
    </GcpSideDrawer>
  );
}

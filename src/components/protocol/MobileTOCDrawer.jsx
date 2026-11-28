'use client';

import React, { useState } from 'react';
import { List } from '@/lib/icons';
import UnifiedMobileSidebarDrawer from '@/components/shared/public/UnifiedMobileSidebarDrawer';

export default function MobileTOCDrawer({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mobile-toc-fab gcp-btn-primary"
        aria-label="Open Table of Contents"
        style={{
          position: 'fixed',
          bottom: 'calc(20px + env(safe-area-inset-bottom))',
          right: '20px',
          zIndex: 99,
          borderRadius: '50%',
          width: '52px',
          height: '52px',
          padding: 0,
          boxShadow: '0 4px 12px rgba(26, 115, 232, 0.28)',
        }}
      >
        <List size={22} />
      </button>

      <UnifiedMobileSidebarDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Table of Contents"
        icon={<List size={16} />}
      >
        <div onClick={() => setIsOpen(false)}>{children}</div>
      </UnifiedMobileSidebarDrawer>
    </>
  );
}

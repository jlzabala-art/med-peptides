"use client";

import React from 'react';
import UniversalShareDrawer from '@/components/ui/UniversalShareDrawer';

/**
 * ShareIntakeWhatsAppModal
 * 
 * Reusable adapter that forwards to UniversalShareDrawer (entityType="prescription").
 * Consolidates multipart clinical summaries, Fagron genetics, and posology schedules
 * into the centralized UniversalShareDrawer.
 */
export default function ShareIntakeWhatsAppModal({ isOpen, onClose, rx = null }) {
  return (
    <UniversalShareDrawer
      isOpen={isOpen}
      onClose={onClose}
      entityType="prescription"
      entity={rx}
    />
  );
}

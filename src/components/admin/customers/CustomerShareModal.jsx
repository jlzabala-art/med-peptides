"use client";

import React from 'react';
import UniversalShareDrawer from '@/components/ui/UniversalShareDrawer';

/**
 * CustomerShareModal
 * 
 * Reusable adapter that forwards to UniversalShareDrawer (entityType="wholesaler").
 * Consolidates B2B wholesale pricing, /vials?ref=[id] link tracking, 
 * and commission structures into the centralized UniversalShareDrawer.
 */
export default function CustomerShareModal({
  isOpen,
  onClose,
  customer,
  customerType = 'wholesaler',
  onSuccess,
  onShareGenerated,
}) {
  return (
    <UniversalShareDrawer
      isOpen={isOpen}
      onClose={onClose}
      entityType="wholesaler"
      entity={customer}
      onSuccess={onSuccess || onShareGenerated}
    />
  );
}

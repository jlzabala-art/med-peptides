"use client";

import React from 'react';
import UniversalShareDrawer from '@/components/ui/UniversalShareDrawer';

/**
 * DoctorAccessLinkModal
 * 
 * Reusable adapter that forwards to UniversalShareDrawer (entityType="doctor").
 * Eliminates duplicate code and consolidates public URL, 1-Tap Access, 
 * and WhatsApp / Email templates into UniversalShareDrawer.
 */
export default function DoctorAccessLinkModal({
  isOpen,
  onClose,
  doctor,
}) {
  return (
    <UniversalShareDrawer
      isOpen={isOpen}
      onClose={onClose}
      entityType="doctor"
      entity={doctor}
    />
  );
}

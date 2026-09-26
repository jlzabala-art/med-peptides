"use client";

import React from 'react';
import StandardDrawer from '@/components/ui/StandardDrawer';
import UserProfileTab from './UserProfileTab';

/**
 * UserProfileDrawer
 *
 * Normalized responsive drawer for personal profile editing (auto-save inline).
 * - Side-over on Laptop / Desktop (fluid clamp width)
 * - Native Bottom Sheet on Mobile
 */
export default function UserProfileDrawer({ isOpen, onClose }) {
  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="My Profile"
      subtitle="Personal identity, phone prefix, specialty & credentials"
      width="560px"
      bodyPadding="0"
      disableBodyScroll={true}
      expandable={false}
      zIndex={99999}
    >
      <UserProfileTab inDrawer={true} onClose={onClose} />
    </StandardDrawer>
  );
}

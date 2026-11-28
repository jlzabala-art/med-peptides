'use client';

import React from 'react';
import GcpSideDrawer from './GcpSideDrawer';

/**
 * StandardDrawer
 * Backward-compatible thin alias delegating to canonical GcpSideDrawer.
 */
export default function StandardDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  headerContent,
  children,
  footer,
  actions,
  width = '560px',
  bodyPadding = '1.5rem',
  fullWorkspace = false,
  expandable = true,
  hideHeader = false,
  disableBodyScroll = false,
  zIndex = 9999,
  preserveSidebar = false,
  status = null,
  statusLabel = '',
  copyId = '',
}) {
  return (
    <GcpSideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      headerContent={headerContent}
      footer={footer}
      actions={actions}
      width={width}
      bodyPadding={bodyPadding}
      fullWorkspace={fullWorkspace}
      expandable={expandable}
      hideHeader={hideHeader}
      disableBodyScroll={disableBodyScroll}
      zIndex={zIndex}
      preserveSidebar={preserveSidebar}
      status={status}
      statusLabel={statusLabel}
      copyId={copyId}
    >
      {children}
    </GcpSideDrawer>
  );
}

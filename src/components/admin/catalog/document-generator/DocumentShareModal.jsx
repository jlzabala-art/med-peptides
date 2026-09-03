'use client';
import React from 'react';
import UniversalShareDrawer from '@/components/ui/UniversalShareDrawer';

/**
 * DocumentShareModal
 * Thin wrapper delegating to UniversalShareDrawer for seamless backward compatibility.
 */
export default function DocumentShareModal({
  isOpen,
  onClose,
  pdfUrl,
  docType = 'pricelist',
  variantCount = 0,
  recipientName = '',
  recipientEmail = '',
  recipientPhone = '',
  accountManagerName = 'Atlas Commercial Desk',
  accountManagerEmail = 'orders@atlas-solutions.com',
  logId = null,
  isMobile = false,
}) {
  const isWebCatalog = pdfUrl?.includes('/shared/catalog/');
  
  return (
    <UniversalShareDrawer
      isOpen={isOpen}
      onClose={onClose}
      shareUrl={pdfUrl}
      docType={docType}
      title={isWebCatalog ? '🌐 Share Web Catalog' : 'Share Commercial Document'}
      subtitle={isWebCatalog ? 'Client-facing responsive catalog link with custom pricing tier.' : 'Share this generated PDF directly with clients or colleagues.'}
      itemCount={variantCount}
      recipientName={recipientName}
      recipientEmail={recipientEmail}
      recipientPhone={recipientPhone}
      accountManagerName={accountManagerName}
      accountManagerEmail={accountManagerEmail}
      logId={logId}
      isMobile={isMobile}
      allowedRoles={['doctor', 'wholeseller', 'account_manager', 'patient', 'custom']}
    />
  );
}

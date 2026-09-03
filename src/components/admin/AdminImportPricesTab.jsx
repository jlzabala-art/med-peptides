"use client";

import React from 'react';
import ScanPriceListWidget from './ScanPriceListWidget';

export default function AdminImportPricesTab() {
  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main, #1e293b)' }}>
          Import Supplier Price List
        </h1>
        <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Upload supplier PDFs, images, or price sheets to automatically scan, match, and update variant prices in your catalog.
        </p>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid var(--color-border, #e2e8f0)', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <ScanPriceListWidget onClose={() => {}} onScanComplete={() => {}} isEmbedded={true} />
      </div>
    </div>
  );
}

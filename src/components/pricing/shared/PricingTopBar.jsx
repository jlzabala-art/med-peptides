'use client';

import React from 'react';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import {
  Download,
  FileText,
  MessageCircle,
} from 'lucide-react';

/**
 * PricingTopBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Thin adapter over PublicUnifiedHeader for all ModularPriceSchedule routes
 * (/pricing/colway, /pricing/colway-qatar, /pricing/colway-hair, /pricing/24genetics).
 * Ensures every pricing schedule inherits the canonical Atlas Public Header,
 * unified Atlas AI trigger, ⌘K search, and standardized action button order.
 */
export default function PricingTopBar({
  sectionLabel = 'B2B Wholesale',
  currentLabel = 'Price Schedule',
  loginRedirect = '/pricing',
  currency,
  setCurrency,
  availableCurrencies = ['AED', 'USD', 'EUR'],
  onWhatsAppShare,
  onOpenExport,
  onPrint,
}) {
  const extraActions = (
    <div className="no-print" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      {onWhatsAppShare && (
        <button
          type="button"
          onClick={onWhatsAppShare}
          className="puh-btn puh-btn-ghost"
          title="Share via WhatsApp"
        >
          <MessageCircle size={14} />
          <span className="puh-btn-label">Share</span>
        </button>
      )}

      {onOpenExport && (
        <button
          type="button"
          onClick={onOpenExport}
          className="puh-btn puh-btn-ghost"
          title="Export in PDF or Excel / CSV format"
        >
          <Download size={14} />
          <span className="puh-btn-label">Export</span>
        </button>
      )}

      {onPrint && (
        <button
          type="button"
          onClick={onPrint}
          className="puh-btn"
          style={{
            background: '#2563eb',
            border: '1px solid #1d4ed8',
            color: '#ffffff',
            fontWeight: 600,
          }}
          title="Preview & Download Official PDF"
        >
          <FileText size={14} />
          <span className="puh-btn-label">Preview PDF</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="no-print">
      <PublicUnifiedHeader
        brandHref="/"
        loginRedirect={loginRedirect}
        currency={currency}
        onCurrencyChange={setCurrency}
        hideCurrencySelector={!setCurrency || availableCurrencies.length === 0}
        hideContactButton={true}
        hideAccountManager={true}
        extraActions={extraActions}
        breadcrumb={[
          { label: sectionLabel, href: '/pricing' },
          { label: currentLabel },
        ]}
      />
    </div>
  );
}

'use client';

import React from 'react';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import { MessageCircle } from 'lucide-react';

/**
 * PricingTopBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Thin adapter over PublicUnifiedHeader for all ModularPriceSchedule routes
 * (/pricing/colway, /pricing/colway-qatar, /pricing/colway-hair, /pricing/24genetics).
 * Export CSV and Preview PDF live exclusively in GlobalBottomStickyBar to avoid
 * duplicating the primary CTA between header and bottom dock.
 */
export default function PricingTopBar({
  sectionLabel = 'B2B Wholesale',
  currentLabel = 'Price Schedule',
  loginRedirect = '/pricing',
  currency,
  setCurrency,
  availableCurrencies = ['AED', 'USD', 'EUR'],
  onWhatsAppShare,
}) {
  const extraActions = onWhatsAppShare ? (
    <div className="no-print" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <button
        type="button"
        onClick={onWhatsAppShare}
        className="puh-btn puh-btn-ghost"
        title="Share via WhatsApp"
      >
        <MessageCircle size={14} />
        <span className="puh-btn-label">Share</span>
      </button>
    </div>
  ) : null;

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

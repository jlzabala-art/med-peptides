'use client';

import React from 'react';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';

/**
 * PeptidesTopAppBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Clean Google Cloud Console standard global navigation bar:
 *  - Primary brand & product track identity
 *  - Global ⌘K search
 *  - Currency & language controls
 *  - Help & User Profile
 * Page-specific actions (Inquire, Tarifa PDF, Share) are reserved exclusively
 * for the PageHeroCard action toolbar to prevent double-clutter.
 */
export default function PeptidesTopAppBar({
  setIsNavDrawerOpen,
  lang = 'en',
  handleLanguageChange,
  currency = 'USD',
  handleCurrencyChange,
}) {
  const isEs = lang === 'es';

  return (
    <div className="no-print">
      <PublicUnifiedHeader
        brandHref="/"
        loginRedirect="/pricing/peptides"
        lang={lang}
        onLangChange={handleLanguageChange}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        hideAccountManager={true}
        hideContactButton={true}
        hideCopyButton={true}
        hideAiButton={true}
        extraActions={null}
        breadcrumb={[
          { label: isEs ? 'Precios B2B' : 'B2B Pricing', href: '/pricing' },
          { label: isEs ? 'Péptidos Clínicos' : 'Clinical Peptides' },
        ]}
      />
    </div>
  );
}

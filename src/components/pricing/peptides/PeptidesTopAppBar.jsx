'use client';

import React from 'react';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import {
  Menu,
  Eye,
  Share2,
  Check,
} from 'lucide-react';

/**
 * PeptidesTopAppBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified over PublicUnifiedHeader so /pricing/peptides shares the exact same
 * top navigation bar, Atlas AI trigger, ⌘K search, currency/language controls,
 * and action button order as all other public pricing and catalog pages.
 */
export default function PeptidesTopAppBar({
  setIsNavDrawerOpen,
  lang = 'en',
  handleLanguageChange,
  setIsAtlasAiOpen,
  currency = 'USD',
  handleCurrencyChange,
  setIsPdfPreviewOpen,
  handleShareSchedule,
  copied = false,
  setInquiryProductContext,
  setIsInquiryDrawerOpen,
}) {
  const isEs = lang === 'es';

  const extraActions = (
    <div className="no-print" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      {setIsNavDrawerOpen && (
        <button
          type="button"
          onClick={() => setIsNavDrawerOpen(true)}
          className="puh-btn puh-btn-ghost lg:hidden"
          title={isEs ? 'Menú de categorías' : 'Category Menu'}
          aria-label={isEs ? 'Abrir menú' : 'Open menu'}
        >
          <Menu size={14} />
          <span className="puh-btn-label">{isEs ? 'Secciones' : 'Sections'}</span>
        </button>
      )}

      {handleShareSchedule && (
        <button
          type="button"
          onClick={handleShareSchedule}
          className="puh-btn puh-btn-ghost hide-on-mobile-header"
          title={isEs ? 'Compartir lista' : 'Share schedule'}
        >
          {copied ? <Check size={14} /> : <Share2 size={14} />}
          <span className="puh-btn-label">
            {copied ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Compartir' : 'Share')}
          </span>
        </button>
      )}

      {setIsPdfPreviewOpen && (
        <button
          type="button"
          onClick={() => setIsPdfPreviewOpen(true)}
          className="puh-btn hide-on-mobile-header"
          style={{
            background: '#2563eb',
            border: '1px solid #1d4ed8',
            color: '#ffffff',
            fontWeight: 600,
          }}
          title={isEs ? 'Vista previa PDF' : 'Preview Official PDF'}
        >
          <Eye size={14} />
          <span className="puh-btn-label">{isEs ? 'Vista PDF' : 'Preview PDF'}</span>
        </button>
      )}
    </div>
  );

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
        onOpenAi={setIsAtlasAiOpen ? () => setIsAtlasAiOpen(true) : null}
        onOpenInquiry={
          setIsInquiryDrawerOpen
            ? () => {
                setInquiryProductContext?.(null);
                setIsInquiryDrawerOpen(true);
              }
            : null
        }
        extraActions={extraActions}
        breadcrumb={[
          { label: isEs ? 'Precios B2B' : 'B2B Pricing', href: '/pricing' },
          { label: isEs ? 'Péptidos Clínicos' : 'Clinical Peptides' },
        ]}
      />
    </div>
  );
}

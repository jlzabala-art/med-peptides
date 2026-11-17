'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import { MessageCircle, ExternalLink, Layers } from 'lucide-react';

const PRICING_WORKSPACE_ITEMS = [
  { id: 'hub', label: 'B2B Hub', href: '/pricing', match: (p) => p === '/pricing' },
  {
    id: 'hormones',
    label: 'Hormones (Pharmapolis)',
    href: '/pricing/nplab-hormones',
    catalogHref: '/collection/hormones',
    match: (p) => p.startsWith('/pricing/nplab-hormones'),
  },
  {
    id: 'peptides',
    label: 'Peptides',
    href: '/pricing/peptides',
    catalogHref: '/collection/peptides',
    match: (p) => p.startsWith('/pricing/peptides'),
  },
  {
    id: '24genetics',
    label: '24Genetics (AED)',
    href: '/pricing/24genetics',
    catalogHref: '/collection/24genomics',
    match: (p) => p === '/pricing/24genetics',
  },
  {
    id: '24genomics-qatar',
    label: '24Genomics Qatar',
    href: '/pricing/24genomics-qatar',
    catalogHref: '/collection/24genomics',
    match: (p) => p.startsWith('/pricing/24genomics-qatar'),
  },
  {
    id: 'colway',
    label: 'Colway',
    href: '/pricing/colway',
    catalogHref: '/collection/colway',
    match: (p) => p === '/pricing/colway' || p.startsWith('/pricing/colway-hair'),
  },
  {
    id: 'colway-qatar',
    label: 'Colway Qatar',
    href: '/pricing/colway-qatar',
    catalogHref: '/collection/colway',
    match: (p) => p.startsWith('/pricing/colway-qatar'),
  },
];

/**
 * PricingTopBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Thin adapter over PublicUnifiedHeader for all ModularPriceSchedule routes
 * with a GCP Block 4 horizontal workspace switcher bar.
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
  const pathname = usePathname() || '/pricing';
  const activeItem =
    PRICING_WORKSPACE_ITEMS.find((item) => item.match(pathname)) || PRICING_WORKSPACE_ITEMS[0];

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
      <div
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #dadce0',
          padding: '0 16px',
        }}
      >
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            minHeight: '42px',
            flexWrap: 'wrap',
          }}
        >
          <nav
            aria-label="B2B Price Schedules Switcher"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              overflowX: 'auto',
              padding: '4px 0',
            }}
          >
            {PRICING_WORKSPACE_ITEMS.map((item) => {
              const isActive = item.id === activeItem.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 11px',
                    borderRadius: '6px',
                    fontSize: '0.76rem',
                    fontWeight: isActive ? 700 : 600,
                    color: isActive ? '#1967d2' : '#5f6368',
                    background: isActive ? '#e8f0fe' : 'transparent',
                    border: isActive ? '1px solid #d2e3fc' : '1px solid transparent',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {activeItem?.catalogHref && (
            <Link
              href={activeItem.catalogHref}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#003666',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              <Layers size={13} />
              <span>Visual Catalog</span>
              <ExternalLink size={12} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

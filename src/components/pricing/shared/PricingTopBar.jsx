'use client';

import React from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/common/BrandLogo';
import GcpUserBadge from '@/components/shared/GcpUserBadge';
import {
  Check,
  Copy,
  Download,
  MessageCircle,
  Printer,
} from 'lucide-react';

export default function PricingTopBar({
  sectionLabel = 'B2B Wholesale',
  currentLabel = 'Price Schedule',
  loginRedirect = '/pricing',
  currency,
  setCurrency,
  availableCurrencies = ['AED', 'USD', 'EUR'],
  copied = false,
  onCopyLink,
  onWhatsAppShare,
  onOpenExport,
  onPrint,
}) {
  return (
    <nav className="screen-nav-bar no-print">
      <div className="nav-container">
        <div className="nav-left">
          <Link
            href="/"
            className="nav-brand"
            style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
            title="Atlas Health Services"
          >
            <BrandLogo variant="light" size="compact" />
          </Link>
          <span className="nav-divider">/</span>
          <Link href="/pricing" className="nav-section" style={{ textDecoration: 'none', color: 'inherit' }}>
            {sectionLabel}
          </Link>
          <span className="nav-divider">/</span>
          <span className="nav-current">{currentLabel}</span>
        </div>

        <div className="nav-actions">
          <div className="currency-selector">
            <span className="control-label">Currency:</span>
            <div className="pill-group">
              {availableCurrencies.map((cur) => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => setCurrency(cur)}
                  className={`pill-btn ${currency === cur ? 'pill-active' : ''}`}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onCopyLink}
            className="action-btn action-ghost"
            title="Copy shareable link"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            <span>{copied ? 'Copied' : 'Copy Link'}</span>
          </button>

          <button
            type="button"
            onClick={onWhatsAppShare}
            className="action-btn action-whatsapp"
            title="Share via WhatsApp"
          >
            <MessageCircle size={16} />
            <span>Share</span>
          </button>

          <button
            type="button"
            onClick={onOpenExport}
            className="action-btn action-export"
            title="Export in PDF or Excel / CSV format"
          >
            <Download size={16} />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="action-btn action-primary"
            title="Print this Price Sheet"
          >
            <Printer size={16} />
            <span>Print</span>
          </button>

          <GcpUserBadge variant="dark" loginRedirect={loginRedirect} />
        </div>
      </div>
    </nav>
  );
}

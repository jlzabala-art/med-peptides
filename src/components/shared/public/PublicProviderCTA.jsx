"use client";

import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from '@/lib/icons';

/**
 * PublicProviderCTA
 * Standardized Provider / Medical Clinic Access CTA used in Tier 2 navigation and headers.
 */
export default function PublicProviderCTA({
  message,
  ctaLabel = 'Provider Access →',
  ctaHref,
  ctaOnClick,
  className = '',
  icon: Icon = ShieldCheck
}) {
  return (
    <div className={`pds-provider-cta ${className}`}>
      <span className="pds-provider-cta-msg">
        <Icon size={14} style={{ color: '#38bdf8', flexShrink: 0 }} />
        <span>{message}</span>
      </span>
      {ctaLabel && (
        ctaHref ? (
          <Link href={ctaHref} className="pds-provider-cta-btn">
            <span>{ctaLabel}</span>
          </Link>
        ) : (
          <button
            type="button"
            className="pds-provider-cta-btn"
            onClick={ctaOnClick}
          >
            <span>{ctaLabel}</span>
          </button>
        )
      )}
    </div>
  );
}

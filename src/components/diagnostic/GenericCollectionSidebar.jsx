"use client";

import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  Microscope,
  Copy,
  Check,
  Mail,
  FlaskConical,
  Lock,
  Sparkles
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import { triggerHaptic } from '../../utils/haptics';

export default function GenericCollectionSidebar({
  brandSlug = 'peptides',
  config,
  categories = [],
  selectedCategory = 'all',
  onSelectCategory = () => { },
  totalCount = 0,
  onOpenInquiry = null,
  activePriceTier = 'clinic',
  onSelectPriceTier = null,
  userRole = 'clinic',
  isAuthenticated = false,
  onUnlockRequest = null
}) {
  const [copied, setCopied] = useState(false);
  const canonicalUrl = `https://www.atlashealth-services.com/collection/${brandSlug}`;

  const isAdmin = userRole === 'admin' || userRole === 'medical_director';
  const isWholesaler = userRole === 'wholesaler';

  const handleCopyLink = async () => {
    triggerHaptic('selection');
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(canonicalUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = canonicalUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      toast.success('Collection link copied to clipboard ✓');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const isPeptides = brandSlug === 'peptides';
  const isHairTreatments = ['hair-treatments', 'hair-treatment', 'trichology', 'hair', 'trichotest'].includes(brandSlug);

  // Filter out 'all' category (GCP UX standard: categories should only be specific lines)
  const displayCategories = categories.filter(c => c.id !== 'all' && c.id !== 'all-peptides' && c.id !== 'all-formulations' && !c.label?.toLowerCase().includes('all peptides'));

  return (
    <aside
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        position: 'sticky',
        top: '90px'
      }}
    >
      {/* ── 1. Category Navigation Card (Primary Sidebar Filter) ── */}
      {displayCategories.length > 0 && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.80rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isHairTreatments ? 'Trichology Sections' : 'Categories'}
            </span>
            <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 600 }}>
              {totalCount} Total
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {displayCategories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const accent = config?.accentColor || '#003666';
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isSelected ? `${accent}12` : 'transparent',
                    color: isSelected ? accent : '#334155',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 750 : 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.12s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span>{cat.label}</span>
                  {cat.count > 0 && (
                    <span
                      style={{
                        fontSize: '0.66rem',
                        padding: '1px 6px',
                        borderRadius: '9999px',
                        background: isSelected ? accent : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#64748b',
                        fontWeight: 700
                      }}
                    >
                      {cat.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 2. B2B Pricing Profile or Locked State (Golden Rule: NO LOGIN, NO PRECIO) ── */}
      {!isAuthenticated ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #cbd5e1',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              backgroundColor: 'rgba(13, 148, 136, 0.12)',
              color: '#0d9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Lock size={14} />
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              B2B Pricing Locked
            </span>
          </div>
          <p style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
            Wholesale tiers, distributor rates, and magistral compounding costs are reserved for verified medical clinics and authorized prescribers.
          </p>
          <button
            type="button"
            onClick={onUnlockRequest}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.76rem',
              fontWeight: 750,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(13, 148, 136, 0.25)'
            }}
          >
            <Sparkles size={13} />
            <span>Quick 1-Click Sign In →</span>
          </button>
        </div>
      ) : onSelectPriceTier && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.6rem' }}>
            B2B Pricing Profile (Cost-Plus)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { id: 'wholesaler', label: 'Wholesaler (+20% on cost)', sub: 'Distributors & Bulk Buyers', color: '#c2410c', bg: '#fff7ed', border: '#fed7aa', visible: true },
              { id: 'clinic', label: 'Clinic / Doctor (+30% on cost)', sub: 'Prescribers & Trichology Clinics', color: '#0d9488', bg: '#f0fdfa', border: '#99f6e4', visible: true },
              { id: 'cost', label: 'Base Cost Price', sub: 'Net Registered Cost (Internal)', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', visible: isAdmin }
            ].filter(t => t.visible).map((tier) => {
              const isActive = activePriceTier === tier.id;
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => onSelectPriceTier(tier.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: isActive ? `1.5px solid ${tier.color}` : '1px solid #e2e8f0',
                    background: isActive ? tier.bg : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '0.78rem', fontWeight: 750, color: isActive ? tier.color : '#1e293b' }}>
                    {tier.label}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    {tier.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}



      {/* ── 3. Institutional Inquiry & Share CTA ── */}
      <div
        style={{
          background: '#f8fafc',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <button
          type="button"
          onClick={onOpenInquiry}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '8px',
            background: config?.accentColor || '#003666',
            color: '#ffffff',
            border: 'none',
            fontSize: '0.80rem',
            fontWeight: 750,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
          }}
        >
          <Mail size={14} />
          <span>Institutional Inquiry / Quote</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          style={{
            width: '100%',
            padding: '8px 14px',
            borderRadius: '8px',
            background: '#ffffff',
            color: '#334155',
            border: '1px solid #cbd5e1',
            fontSize: '0.76rem',
            fontWeight: 650,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          {copied ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
          <span>{copied ? 'Copied to Clipboard ✓' : 'Share Collection Link'}</span>
        </button>
      </div>
    </aside>
  );
}

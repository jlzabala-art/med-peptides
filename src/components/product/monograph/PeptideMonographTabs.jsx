"use client";

import React from 'react';
import { LayoutTemplate, FlaskConical, Droplet, ShieldCheck, BookOpen } from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';

/**
 * PeptideMonographTabs
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console style top-level navigation tabs for Peptide Monograph.
 * 5 distinct logical workspaces: OVERVIEW, PROTOCOLS, PREPARATION & ADMINISTRATION,
 * QUALITY & BATCH, REFERENCES.
 */
export default function PeptideMonographTabs({
  activeTab = 'overview',
  onTabChange,
  protocolCount = 3,
  className = ''
}) {
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutTemplate,
      tooltip: 'Clinical identity, available presentations table & indications'
    },
    {
      id: 'protocols',
      label: 'Protocols',
      icon: FlaskConical,
      count: protocolCount,
      tooltip: 'Dedicated clinical protocol workspace & treatment planning'
    },
    {
      id: 'preparation',
      label: 'Preparation & Administration',
      icon: Droplet,
      tooltip: 'Reconstitution calculation, U-100 syringe units & step-by-step handling'
    },
    {
      id: 'quality',
      label: 'Quality & Batch',
      icon: ShieldCheck,
      tooltip: 'Verified batch analysis, HPLC purity, MS confirmation & CoA records'
    },
    {
      id: 'references',
      label: 'References',
      icon: BookOpen,
      tooltip: 'FDA reference dossiers, receptor pharmacology & PubMed literature'
    }
  ];

  return (
    <nav
      className={`pds-gcp-tab-bar ${className}`}
      role="tablist"
      aria-label="Monograph Top-Level Navigation"
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #cbd5e1',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        padding: '0 1.5rem',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
      }}
    >
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'stretch',
        gap: '0.25rem',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              title={tab.tooltip}
              onClick={() => {
                if (isActive) return;
                triggerHaptic('selection');
                onTabChange?.(tab.id);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.85rem 1rem',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: isActive ? 800 : 600,
                color: isActive ? '#003666' : '#64748b',
                borderBottom: isActive ? '2.5px solid #003666' : '2.5px solid transparent',
                marginBottom: '-1px',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                outline: 'none',
                letterSpacing: '0.01em'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#0f172a';
                  e.currentTarget.style.borderBottom = '2.5px solid #cbd5e1';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#64748b';
                  e.currentTarget.style.borderBottom = '2.5px solid transparent';
                }
              }}
            >
              <Icon size={15} color={isActive ? '#003666' : '#94a3b8'} />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span style={{
                  background: isActive ? '#003666' : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#64748b',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: '10px'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

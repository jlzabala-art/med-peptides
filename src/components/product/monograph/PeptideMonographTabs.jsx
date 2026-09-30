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
    >
      <div className="pds-gcp-tab-scroll">
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
              className={`pds-gcp-tab-btn ${isActive ? 'is-active' : ''}`}
            >
              <Icon size={16} color={isActive ? '#003666' : '#94a3b8'} style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span
                  className="pds-gcp-tab-badge"
                  style={{
                    background: isActive ? '#003666' : '#f1f5f9',
                    color: isActive ? '#ffffff' : '#64748b',
                  }}
                >
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

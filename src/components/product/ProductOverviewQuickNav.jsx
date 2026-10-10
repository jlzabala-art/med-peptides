"use client";

import React from 'react';
import { Layers, ChevronRight } from '@/lib/icons';

/**
 * ProductOverviewQuickNav
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console UX-compliant sub-navigation strip for Overview pages.
 * - Desktop: Sleek, low-profile quick-jump chips in a clean horizontal layout.
 * - Mobile: Single-line horizontal scrollable rail (zero line-wrapping or viewport clutter).
 * - Avoids bulky duplicate UI while providing instant 1-click access to all technical sections.
 */
export default function ProductOverviewQuickNav({
  sections = [],
  activeSection = 'overview',
  onSelectSection = null,
  lang = 'en'
}) {
  const isEs = lang === 'es';

  // Exclude overview from destination chips
  const targetSections = sections.filter(s => s && s.id && s.id !== 'overview');

  if (!targetSections.length || !onSelectSection) return null;

  return (
    <nav 
      className="gcp-quicknav-strip"
      aria-label={isEs ? 'Navegación rápida de secciones' : 'Quick section navigation'}
    >
      <style>{`
        .gcp-quicknav-strip {
          margin-top: 1.25rem;
          margin-bottom: 1rem;
          padding: 10px 14px;
          background: #ffffff;
          border: 1px solid #dadce0;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-shadow: 0 1px 2px rgba(60,64,67,0.05);
        }
        .gcp-quicknav-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 6px;
        }
        .gcp-quicknav-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #202124;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .gcp-quicknav-sub {
          font-size: 0.68rem;
          color: #5f6368;
        }
        .gcp-quicknav-rail {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .gcp-quicknav-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 11px;
          border-radius: 4px;
          background: #f8fafd;
          border: 1px solid #dadce0;
          color: #1a73e8;
          font-size: 0.74rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
          text-decoration: none;
        }
        .gcp-quicknav-chip:hover {
          background: #e8f0fe;
          border-color: #aecbfa;
          color: #174ea6;
        }
        @media (max-width: 768px) {
          .gcp-quicknav-strip {
            padding: 8px 10px !important;
            margin-top: 0.85rem !important;
            margin-bottom: 0.85rem !important;
            border-radius: 6px !important;
          }
          .gcp-quicknav-sub {
            display: none !important;
          }
          /* On mobile: single horizontal scroll rail so it NEVER wraps or clutters the vertical screen */
          .gcp-quicknav-rail {
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            scrollbar-width: none !important;
            padding-bottom: 2px !important;
          }
          .gcp-quicknav-rail::-webkit-scrollbar {
            display: none !important;
          }
          .gcp-quicknav-chip {
            padding: 5px 9px !important;
            font-size: 0.70rem !important;
            flex-shrink: 0 !important;
          }
        }
      `}</style>

      <div className="gcp-quicknav-header">
        <div className="gcp-quicknav-title">
          <Layers size={13} color="#1a73e8" />
          <span>{isEs ? 'Secciones de la Ficha:' : 'Monograph Sections:'}</span>
        </div>
        <span className="gcp-quicknav-sub">
          {isEs ? 'Acceso directo con un clic' : 'Direct 1-click access'}
        </span>
      </div>

      <div className="gcp-quicknav-rail" role="tablist">
        {targetSections.map((sec) => {
          const IconComp = sec.icon;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => onSelectSection(sec.id)}
              className="gcp-quicknav-chip"
              title={sec.label}
              role="tab"
            >
              {IconComp && <IconComp size={12} />}
              <span>{sec.label}</span>
              <ChevronRight size={11} style={{ opacity: 0.6 }} />
            </button>
          );
        })}
      </div>
    </nav>
  );
}

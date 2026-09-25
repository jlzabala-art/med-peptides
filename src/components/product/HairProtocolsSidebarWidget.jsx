"use client";

import React from 'react';
import Link from 'next/link';
import {
  Scissors, ChevronRight, Sparkles, CheckCircle2, Clock, Zap
} from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';
import './HairProtocolsSidebarWidget.css';

/**
 * HairProtocolsSidebarWidget
 * ─────────────────────────────────────────────────────────────────────────────
 * Sidebar widget that surfaces hair-loss clinical protocols associated with a
 * cosmetic hair product. Styled in the GCP-inspired Atlas Design System.
 */
export default function HairProtocolsSidebarWidget({
  protocols = [],
  lang = 'en'
}) {
  const isEs = lang === 'es';

  const fallbackProtocols = [
    {
      id: 'hair-loss-androgenic-alopecia',
      slug: 'hair-loss-androgenic-alopecia',
      name: 'Androgenic Alopecia — Tirzepatide & DHT Protocol',
      category: 'Hair Loss',
      duration: '16 Weeks',
      isPrimary: true,
      tagline: 'Multi-modal: DHT blockade + follicular peptides'
    },
    {
      id: 'ghk-cu-hair-regeneration',
      slug: 'ghk-cu-hair-regeneration',
      name: 'GHK-Cu Hair Follicle Regeneration Protocol',
      category: 'Hair Regeneration',
      duration: '12 Weeks',
      tagline: 'Copper peptide · Stem cell activation · Anagen extension'
    },
    {
      id: 'pt-141-hair-scalp-circulation',
      slug: 'epithalon-longevity-hair',
      name: 'Epithalon Anti-Aging & Hair Cycle Restoration',
      category: 'Longevity & Hair',
      duration: '20 Days',
      tagline: 'Telomere extension · Follicular rhythm reset'
    }
  ];

  const displayProtocols = (Array.isArray(protocols) && protocols.length > 0)
    ? protocols
    : fallbackProtocols;

  return (
    <div className="hsw-root">
      <div className="hsw-header">
        <div className="hsw-header-left">
          <div className="hsw-icon-wrap">
            <Scissors size={13} className="hsw-icon" />
          </div>
          <div>
            <div className="hsw-title">
              {isEs ? 'PROTOCOLOS CAÍDA DE CABELLO' : 'HAIR LOSS PROTOCOLS'}
            </div>
            <div className="hsw-subtitle">
              {isEs ? 'Vías clínicas integradas' : 'Integrated clinical pathways'}
            </div>
          </div>
        </div>
        <span className="hsw-count-badge">{displayProtocols.length}</span>
      </div>

      <p className="hsw-intro">
        {isEs
          ? 'Este producto forma parte de protocolos clínicos verificados para el tratamiento de la alopecia y la pérdida de cabello.'
          : 'This product is part of verified clinical protocols for hair loss, androgenic alopecia, and follicular regeneration.'}
      </p>

      <div className="hsw-list">
        {displayProtocols.map((p) => {
          const protoSlug = p.slug || p.id;
          const name = p.name || 'Clinical Protocol';
          const duration = p.duration || `${p.durationWeeks || 12} ${isEs ? 'Semanas' : 'Weeks'}`;
          const isPrimary = Boolean(p.isPrimary);
          const tagline = p.tagline || p.category || '';

          return (
            <Link
              key={protoSlug}
              href={`/proto/${protoSlug}`}
              onClick={() => triggerHaptic('selection')}
              className={`hsw-item ${isPrimary ? 'hsw-item--primary' : ''}`}
              title={name}
            >
              <div className="hsw-item-icon">
                {isPrimary
                  ? <Sparkles size={12} />
                  : <Zap size={12} />
                }
              </div>
              <div className="hsw-item-content">
                <div className="hsw-item-top">
                  <span className={`hsw-tag ${isPrimary ? 'hsw-tag--primary' : ''}`}>
                    {isPrimary
                      ? (isEs ? '⭐ Vía Principal' : '⭐ Primary Pathway')
                      : (isEs ? 'Protocolo Clínico' : 'Clinical Protocol')}
                  </span>
                  <span className="hsw-duration">
                    <Clock size={9} style={{ marginRight: 3 }} />
                    {duration}
                  </span>
                </div>
                <div className="hsw-item-name">{name}</div>
                {tagline && (
                  <div className="hsw-item-tagline">{tagline}</div>
                )}
              </div>
              <ChevronRight size={13} className="hsw-arrow" />
            </Link>
          );
        })}
      </div>

      <div className="hsw-footer">
        <Link href="/proto?category=hair" className="hsw-see-all">
          <CheckCircle2 size={11} />
          {isEs ? 'Ver todos los protocolos de cabello →' : 'View all hair protocols →'}
        </Link>
      </div>
    </div>
  );
}

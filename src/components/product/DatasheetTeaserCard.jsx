"use client";

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, FileText, ArrowRight } from '@/lib/icons';

/**
 * DatasheetTeaserCard
 * ─────────────────────────────────────────────────────────────────────────────
 * Compact, institutional teaser banner displayed on the Product Detail Page.
 * Gives immediate 1-click access to the analytical datasheet & HPLC certificate
 * without overloading the commercial product page.
 */
export default function DatasheetTeaserCard({ product, lang = 'en' }) {
  if (!product) return null;

  const targetSlug = product.slug || product.id || '';
  if (!targetSlug) return null;

  const isSpanish = lang === 'es';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
      padding: '12px 16px',
      backgroundColor: '#f0f9ff',
      border: '1px solid #bae6fd',
      borderRadius: '12px',
      marginTop: '12px',
      marginBottom: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          backgroundColor: '#0284c7',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <FileText size={18} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontSize: '0.70rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#0369a1',
              backgroundColor: '#e0f2fe',
              padding: '1px 6px',
              borderRadius: '4px'
            }}>
              RP-HPLC ≥ 99.0%
            </span>
            <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <ShieldCheck size={12} color="#0284c7" />
              {isSpanish ? 'Trazabilidad de Lote' : 'Verified Batch Standards'}
            </span>
          </div>
          <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
            {isSpanish ? 'Monografía Analítica y Guía de Reconstitución' : 'Clinical Technical Datasheet & Reconstitution'}
          </div>
        </div>
      </div>

      <Link
        href={`/p/${targetSlug}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '7px 14px',
          backgroundColor: '#0284c7',
          color: '#ffffff',
          borderRadius: '8px',
          fontSize: '0.82rem',
          fontWeight: 700,
          textDecoration: 'none',
          boxShadow: '0 1px 2px rgba(2, 132, 199, 0.2)',
          transition: 'all 0.15s ease',
          flexShrink: 0
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#0369a1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#0284c7';
        }}
      >
        <span>{isSpanish ? 'Ver Ficha Técnica' : 'View Technical Datasheet'}</span>
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}

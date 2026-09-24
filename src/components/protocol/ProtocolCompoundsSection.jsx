"use client";

import React from 'react';
import Link from 'next/link';
import { FlaskConical, FileText, ArrowRight } from '@/lib/icons';
import PublicSectionCard from '@/components/shared/public/PublicSectionCard';

export default function ProtocolCompoundsSection({ items = [], lang = 'en' }) {
  if (!items || items.length === 0) return null;

  return (
    <PublicSectionCard
      id="included-compounds"
      icon={FlaskConical}
      category={lang === 'es' ? 'FORMULACIONES ACTIVAS' : 'THERAPEUTIC FORMULATIONS'}
      badge={`${items.length} ${lang === 'es' ? 'Compuestos Activos' : 'Active Agents'}`}
      badgeVariant="cyan"
      title={lang === 'es' ? 'Péptidos & Compuestos Activos Incluidos' : 'Included Therapeutic Compounds'}
      rightAction={
        <span style={{ fontSize: '0.74rem', color: '#93c5fd', fontWeight: 600 }}>
          {lang === 'es' ? 'Estándares Analíticos Atlas' : 'Atlas Analytical Standards'}
        </span>
      }
    >
      <div className="proto-compounds-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem' }}>
        {items.map((item, idx) => {
          const itemSlug = item.slug || item.productId || item.productSlug || (item.id && !item.id.startsWith('item-') ? item.id : null);
          const itemName = item.product_name || item.name || item.title || 'Compound';
          const itemDosage = item.dosage || item.dose || (item.quantity ? `${item.quantity} ${item.unit || (lang === 'es' ? 'Viales' : 'Vials')}` : null);
          return (
            <div key={idx} className="proto-compound-card" style={{
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.25rem',
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              transition: 'border-color 0.15s ease'
            }}>
              <div>
                <div className="proto-compound-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <strong style={{ color: '#0f172a', fontSize: '1.05rem', fontWeight: 800 }}>
                    {itemName}
                  </strong>
                  {itemDosage && (
                    <span className="proto-compound-dosage-badge" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d9488', background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '2px 8px', borderRadius: '6px' }}>
                      {itemDosage}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
                  <span style={{ fontSize: '0.72rem', color: '#475569', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                    {item.format || (lang === 'es' ? 'Polvo Liofilizado' : 'Lyophilized Powder')}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                    • {item.route || (lang === 'es' ? 'Subcutánea (SubQ)' : 'Subcutaneous (SubQ)')}
                  </span>
                </div>

                <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 1rem 0', lineHeight: 1.55 }}>
                  {item.timing || item.schedule || item.instructions || (lang === 'es' ? 'Administrar según el cronograma de titulación por fases.' : 'Administer according to phased titration schedule.')}
                </p>
              </div>

              {itemSlug && (
                <Link 
                  href={`/p/${itemSlug}`}
                  target="_blank"
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#0284c7',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '0.75rem'
                  }}
                >
                  <FileText size={14} />
                  <span>{lang === 'es' ? 'Ver Ficha Técnica del Péptido' : 'View Technical Monograph'}</span>
                  <ArrowRight size={12} />
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </PublicSectionCard>
  );
}

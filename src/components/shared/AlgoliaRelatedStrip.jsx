'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, FlaskConical } from 'lucide-react';
import { getRelatedProducts } from '@/services/algoliaRecommendService';
import { trackSearchClick } from '@/services/algoliaInsights';

/**
 * AlgoliaRelatedStrip
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable Algolia Recommend ("related-products" + clinical facet fallback)
 * strip for monograph, injectable, cosmetic, and patient guide pages.
 */
export default function AlgoliaRelatedStrip({
  objectID,
  category = '',
  goal = '',
  title = '',
  subtitle = '',
  lang = 'en',
  patientView = false,
  maxItems = 4,
}) {
  const [items, setItems] = useState([]);
  const isEs = (lang || '').startsWith('es');

  useEffect(() => {
    if (!objectID) return;
    let active = true;
    getRelatedProducts({
      objectID: String(objectID),
      category: category || undefined,
      goal: goal || undefined,
      maxRecommendations: maxItems,
    })
      .then((hits) => {
        if (!active || !Array.isArray(hits)) return;
        const filtered = hits.filter((h) => {
          const id = String(h.objectID || h.id || h.slug || '');
          return id && id !== String(objectID);
        });
        setItems(filtered.slice(0, maxItems));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [objectID, category, goal, maxItems]);

  if (!items.length) return null;

  const heading =
    title ||
    (patientView
      ? isEs
        ? 'Formulaciones Relacionadas para Pacientes'
        : 'Related Patient Guides'
      : isEs
        ? 'Formulaciones Clínicas Relacionadas'
        : 'Clinically Paired & Related Formulations');

  const sub =
    subtitle ||
    (isEs
      ? 'Sugerencias clínicas basadas en afinidad terapéutica y co-prescripción'
      : 'Powered by Algolia Recommend · Clinical synergy & category matching');

  return (
    <section
      className="no-print"
      aria-label={heading}
      style={{
        marginTop: '2rem',
        padding: '1.25rem',
        borderRadius: '14px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.9rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1a73e8', marginBottom: '2px' }}>
            <Sparkles size={13} />
            <span>Algolia Recommend</span>
          </div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{heading}</h3>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>{sub}</p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '0.75rem',
        }}
      >
        {items.map((hit, idx) => {
          const slug = hit.slug || hit.objectID || hit.id;
          const name = hit.canonicalName || hit.name || hit.title || slug;
          const href = patientView
            ? `/p/${encodeURIComponent(slug)}?view=patient`
            : `/p/${encodeURIComponent(slug)}`;

          return (
            <Link
              key={hit.objectID || slug}
              href={href}
              onClick={() => {
                if (hit.objectID) {
                  trackSearchClick({
                    indexName: 'products',
                    objectID: hit.objectID,
                    position: idx + 1,
                    eventName: 'Algolia Recommend Card Clicked',
                  });
                }
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.5rem',
                padding: '0.85rem',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                textDecoration: 'none',
                color: '#0f172a',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <FlaskConical size={13} color="#1a73e8" />
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#475569' }}>
                    {hit.category || 'Formulation'}
                  </span>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                  {name}
                </div>
                {hit.subtitle && (
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px', lineHeight: 1.35 }}>
                    {hit.subtitle}
                  </div>
                )}
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', fontWeight: 600, color: '#1a73e8' }}>
                <span>{patientView ? (isEs ? 'Ver guía' : 'Open guide') : (isEs ? 'Ver monografía' : 'View monograph')}</span>
                <ArrowRight size={12} />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

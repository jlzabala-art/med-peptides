"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ChevronRight, TestTube, Pill, Package, Activity } from '@/lib/icons';
import { getRelatedProducts } from '../../services/algoliaRecommendService';
import { triggerHaptic } from '../../utils/haptics';

export default function RelatedProductsCarousel({
  productId,
  category = '',
  goals = [],
  title = 'Compuestos Sinergicos y Relacionados',
  subtitle = 'Recomendaciones clínicas basadas en mecanismos de acción complementarios',
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const items = await getRelatedProducts({
          objectID: productId,
          category,
          goals,
          maxRecommendations: 4,
        });
        if (isMounted) setRecommendations(items);
      } catch (e) {
        console.warn('[RelatedProductsCarousel] Failed to load:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    if (productId) load();
    return () => { isMounted = false; };
  }, [productId, category, JSON.stringify(goals)]);

  if (!loading && recommendations.length === 0) return null;

  return (
    <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#003666', fontWeight: 700, fontSize: '1.05rem' }}>
            <Sparkles size={18} color="#d97706" />
            <span>{title}</span>
          </div>
          {subtitle && (
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Cards Scroll Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                height: '140px',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                animation: 'pulse 1.5s infinite',
              }}
            />
          ))
        ) : (
          recommendations.map((item) => {
            const slug = item.slug || item.id || item.objectID;
            const name = item.name || item.title || 'Compuesto';
            const cat = item.categoryId || item.category || 'Peptide';
            const itemGoals = Array.isArray(item.goals) ? item.goals.slice(0, 2) : [];

            return (
              <Link
                key={item.objectID || item.id}
                href={`/p/${slug}`}
                onClick={() => triggerHaptic('light')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#003666';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,54,102,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: '#003666',
                        background: '#f0f7ff',
                        padding: '2px 7px',
                        borderRadius: '6px',
                      }}
                    >
                      {cat}
                    </span>
                    <ChevronRight size={14} color="#94a3b8" />
                  </div>

                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                    {name}
                  </div>
                </div>

                {itemGoals.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.6rem' }}>
                    {itemGoals.map((g, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.65rem',
                          background: '#f1f5f9',
                          color: '#475569',
                          padding: '1px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ChevronRight, TestTube, Pill, Package, Activity } from '@/lib/icons';
import { getRelatedProducts } from '../../services/algoliaRecommendService';
import { triggerHaptic } from '../../utils/haptics';

export default function RelatedProductsCarousel({
  productId,
  productObjectID,
  category = '',
  goals = [],
  title = 'Synergistic & Related Compounds',
  subtitle = 'Clinical recommendations based on complementary mechanisms of action',
  maxItems = 4,
  maxRecommendations,
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const effectiveId = productId || productObjectID;
  const effectiveMax = maxRecommendations || maxItems || 4;

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const items = await getRelatedProducts({
          objectID: effectiveId,
          category,
          goals,
          maxRecommendations: effectiveMax,
        });
        if (isMounted) setRecommendations(items);
      } catch (e) {
        console.warn('[RelatedProductsCarousel] Failed to load:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    if (effectiveId) load();
    return () => { isMounted = false; };
  }, [effectiveId, category, JSON.stringify(goals), effectiveMax]);

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

      {/* Responsive Cards Container: Horizontal Scroll-Snap on Mobile, Grid on Laptop */}
      <div className="recommend-cards-container">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="recommend-card-skeleton"
            />
          ))
        ) : (
          recommendations.map((item) => {
            const slug = item.slug || item.id || item.objectID;
            const name = item.name || item.title || 'Compound';
            const cat = item.categoryId || item.category || 'Peptide';
            const dose = item.dosage || item.dose || item.presentation || null;
            const itemGoals = Array.isArray(item.goals) ? item.goals.slice(0, 2) : [];

            return (
              <Link
                key={item.objectID || item.id}
                href={`/p/${slug}`}
                onClick={() => triggerHaptic('light')}
                className="recommend-card"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                    <span className="recommend-category-pill">
                      {cat}
                    </span>
                    {dose && (
                      <span className="recommend-dose-pill">
                        {dose}
                      </span>
                    )}
                    <ChevronRight size={14} color="#94a3b8" style={{ marginLeft: 'auto' }} />
                  </div>

                  <div className="recommend-card-title">
                    {name}
                  </div>
                </div>

                <div style={{ marginTop: '0.75rem' }}>
                  {itemGoals.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
                      {itemGoals.map((g, idx) => (
                        <span
                          key={idx}
                          className="recommend-goal-pill"
                        >
                          {String(g).replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="recommend-cta-label">
                    <span>Clinical Profile</span>
                    <ChevronRight size={13} />
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      <style>{`
        .recommend-cards-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.1rem;
        }

        .recommend-card-skeleton {
          height: 145px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          animation: pulse 1.5s infinite;
        }

        .recommend-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: #ffffff !important;
          border: 1px solid #cbd5e1 !important;
          border-radius: 12px !important;
          padding: 1.15rem !important;
          text-decoration: none !important;
          color: inherit !important;
          min-height: 135px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
          -webkit-tap-highlight-color: transparent;
        }

        .recommend-card:hover {
          border-color: #003666 !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(0, 54, 102, 0.12) !important;
        }

        .recommend-category-pill {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: #003666;
          background: #f0f7ff;
          padding: 2px 7px;
          border-radius: 6px;
        }

        .recommend-dose-pill {
          font-size: 0.66rem;
          font-weight: 600;
          color: #0d9488;
          background: #f0fdfa;
          padding: 2px 6px;
          border-radius: 6px;
          margin-left: 0.35rem;
        }

        .recommend-card-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.35;
          margin-top: 0.2rem;
        }

        .recommend-goal-pill {
          font-size: 0.65rem;
          text-transform: capitalize;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #475569;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .recommend-cta-label {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 0.72rem;
          font-weight: 600;
          color: #0284c7;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .recommend-cards-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .recommend-cards-container {
            display: flex !important;
            overflow-x: auto !important;
            scroll-snap-type: x mandatory !important;
            -webkit-overflow-scrolling: touch !important;
            padding-bottom: 0.75rem !important;
            margin: 0 -1rem !important;
            padding-left: 1rem !important;
            padding-right: 1rem !important;
            gap: 0.85rem !important;
            scrollbar-width: none !important;
          }
          .recommend-cards-container::-webkit-scrollbar {
            display: none !important;
          }
          .recommend-card,
          .recommend-card-skeleton {
            flex: 0 0 250px !important;
            scroll-snap-align: start !important;
            min-height: 130px !important;
          }
        }
      `}</style>
    </div>
  );
}

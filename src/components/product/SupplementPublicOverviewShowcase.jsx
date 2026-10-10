"use client";

import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  Layers, 
  CheckCircle2, 
  FlaskConical
} from '@/lib/icons';

/**
 * SupplementPublicOverviewShowcase
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console UX-compliant clinical showcase for Ultra-Person oral supplements.
 * Clean, elevated neutral surface (#ffffff) with subtle borders and high-contrast typography,
 * perfectly optimized for mobile (single-column card stack) and desktop (3-column balanced grid).
 */
export default function SupplementPublicOverviewShowcase({
  product = {},
  lang = 'en',
  onSelectSection = null
}) {
  const isEs = lang === 'es';

  return (
    <div className="up-showcase-wrapper">
      <style>{`
        .up-showcase-wrapper {
          width: 100%;
          margin-top: 1.25rem;
          margin-bottom: 1.5rem;
        }
        .up-showcase-card {
          background: #ffffff;
          border: 1px solid #dadce0;
          border-radius: 12px;
          padding: 1.25rem;
          box-shadow: 0 1px 3px rgba(60,64,67,0.06);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .up-showcase-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid #f1f3f4;
        }
        .up-showcase-title-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .up-showcase-icon-badge {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: #e6f4ea;
          color: #137333;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .up-showcase-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: #202124;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin: 0;
        }
        .up-showcase-badges {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        .up-badge-primary {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #f1f3f4;
          color: #3c4043;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 0.72rem;
          font-weight: 600;
          border: 1px solid #e8eaed;
        }
        .up-badge-compliance {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #e6f4ea;
          color: #137333;
          border: 1px solid #ceead6;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 0.72rem;
          font-weight: 600;
        }
        .up-showcase-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .up-spec-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: border-color 0.15s ease;
        }
        .up-spec-card:hover {
          border-color: #cbd5e1;
        }
        .up-spec-top {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .up-spec-icon-box {
          width: 24px;
          height: 24px;
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .up-spec-tag {
          font-size: 0.68rem;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.03em;
        }
        .up-spec-title {
          font-size: 0.90rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          line-height: 1.25;
        }
        .up-spec-desc {
          font-size: 0.75rem;
          margin: 0;
          color: #475569;
          line-height: 1.4;
        }
        @media (max-width: 768px) {
          .up-showcase-card {
            padding: 1rem !important;
            border-radius: 10px !important;
          }
          .up-showcase-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
          }
          .up-showcase-badges {
            width: 100% !important;
          }
          .up-showcase-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .up-spec-card {
            padding: 10px 12px !important;
          }
          .up-spec-title {
            font-size: 0.88rem !important;
          }
        }
      `}</style>

      <div className="up-showcase-card">
        {/* Header with Title and GCP Badges */}
        <div className="up-showcase-header">
          <div className="up-showcase-title-group">
            <div className="up-showcase-icon-badge">
              <FlaskConical size={15} />
            </div>
            <h4 className="up-showcase-title">
              {isEs ? 'Compendio Clínico Ultra-Person' : 'Ultra-Person Clinical Compendium'}
            </h4>
          </div>

          <div className="up-showcase-badges">
            <span className="up-badge-primary">
              <Sparkles size={12} color="#003666" />
              <span>{isEs ? 'Fórmula Nutracéutica Avanzada' : 'Advanced Nutraceutical Matrix'}</span>
            </span>
            <span className="up-badge-compliance">
              <ShieldCheck size={12} />
              <span>EU GMP · Ph. Eur. Directiva 2002/46/CE</span>
            </span>
          </div>
        </div>

        {/* 3 Balanced Spec Cards (Stacked on Mobile, 3-Cols on Desktop) */}
        <div className="up-showcase-grid">
          {/* Card 1: Delivery Technology */}
          <div className="up-spec-card">
            <div className="up-spec-top">
              <div className="up-spec-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
                <Layers size={14} />
              </div>
              <span className="up-spec-tag" style={{ color: '#059669' }}>
                {isEs ? 'Tecnología de Liberación' : 'Delivery Technology'}
              </span>
            </div>
            <h5 className="up-spec-title">
              {isEs ? 'Cápsula HPMC Gastrorresistente' : 'Acid-Resistant HPMC Capsule'}
            </h5>
            <p className="up-spec-desc">
              {isEs 
                ? 'Protección contra pH estomacal <2.0; liberación duodenal para absorción intacta de bioactivos.' 
                : 'Resists gastric acid pH <2.0; delivers intact actives directly to the duodenum.'}
            </p>
          </div>

          {/* Card 2: Target Biological Axis */}
          <div className="up-spec-card">
            <div className="up-spec-top">
              <div className="up-spec-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <Activity size={14} />
              </div>
              <span className="up-spec-tag" style={{ color: '#2563eb' }}>
                {isEs ? 'Dianas Bioquímicas' : 'Target Biological Axis'}
              </span>
            </div>
            <h5 className="up-spec-title">
              {isEs ? 'Respiración Mitocondrial & ATP' : 'Mitochondrial Respiration & ATP'}
            </h5>
            <p className="up-spec-desc">
              {isEs 
                ? 'Activación de la vía AMPK y sirtuinas para eficiencia metabólica y vitalidad celular.' 
                : 'Modulation of AMPK and sirtuin pathways for metabolic efficiency and stamina.'}
            </p>
          </div>

          {/* Card 3: Clean Label Standard */}
          <div className="up-spec-card">
            <div className="up-spec-top">
              <div className="up-spec-icon-box" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                <CheckCircle2 size={14} />
              </div>
              <span className="up-spec-tag" style={{ color: '#16a34a' }}>
                {isEs ? 'Estándar Clean Label' : 'Clean Label Standard'}
              </span>
            </div>
            <h5 className="up-spec-title">
              100% Vegan & Non-GMO
            </h5>
            <p className="up-spec-desc">
              {isEs 
                ? 'Sin dióxido de titanio, sin gluten, sin lactosa y testado para metales pesados.' 
                : 'Titanium dioxide free, allergen-free, independently tested for heavy metals.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Droplets,
  Activity,
  Award,
  Zap,
  ExternalLink,
  ChevronRight,
  ZoomIn,
  Clock,
  Layers,
  Leaf
} from '@/lib/icons';
import ImageModal from '@/snippets/ImageModal';

export default function McgTrichologyProcapilShowcase({ lang = 'en' }) {
  const isEs = lang === 'es';
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

  const bannerSrc = '/images/products/mcg/kapigen-spray.svg';

  return (
    <section style={{
      background: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      marginBottom: '2rem',
      boxShadow: '0 4px 20px -4px rgba(0,0,0,0.05)',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* ── 1. Hero Showcase Graphic ── */}
      <div
        onClick={() => setIsBannerModalOpen(true)}
        role="button"
        tabIndex={0}
        title={isEs ? 'Haz clic para ampliar la imagen del producto' : 'Click to inspect packaging artwork'}
        style={{
          position: 'relative',
          width: '100%',
          maxHeight: '380px',
          overflow: 'hidden',
          cursor: 'zoom-in',
          background: '#041722',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <img
          src={bannerSrc}
          alt="MCG Kapigen 5% Procapil Anti-Hair Loss Spray - Double Advantage Pack"
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '380px',
            objectFit: 'contain',
            transition: 'transform 0.3s ease'
          }}
        />

        {/* Floating pill tag */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          color: '#2dd4bf',
          padding: '6px 12px',
          borderRadius: '99px',
          fontSize: '0.72rem',
          fontWeight: 700,
          border: '1px solid rgba(45, 212, 191, 0.35)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <Sparkles size={12} />
          <span>{isEs ? 'MONOGRAFÍA CLÍNICA DE PROCAPIL® AL 5%' : '5.0% PROCAPIL® CLINICAL TRICHOLOGY MONOGRAPH'}</span>
        </div>

        <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(15, 23, 42, 0.75)',
          color: '#e2e8f0',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '0.68rem',
          fontWeight: 600
        }}>
          <ZoomIn size={12} />
          <span>{isEs ? 'Ampliar gráfico' : 'Click to Zoom'}</span>
        </div>
      </div>

      {/* ── 2. Header and Value Proposition ── */}
      <div style={{ padding: '1.75rem 2rem 1.25rem', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#0d9488',
            background: '#f0fdfa',
            border: '1px solid #99f6e4',
            padding: '3px 8px',
            borderRadius: '6px'
          }}>
            McG Medical Cosmeceutical Group
          </span>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: '#0284c7',
            background: '#e0f2fe',
            border: '1px solid #bae6fd',
            padding: '3px 8px',
            borderRadius: '6px'
          }}>
            ISO 22716 · EU (EC) 1223/2009 & FDA Compliant
          </span>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: '#b45309',
            background: '#fef3c7',
            border: '1px solid #fde68a',
            padding: '3px 8px',
            borderRadius: '6px'
          }}>
            0% Minoxidil Dependency
          </span>
        </div>

        <h3 style={{
          fontSize: '1.35rem',
          fontWeight: 800,
          color: '#0f172a',
          margin: '0 0 0.5rem 0',
          lineHeight: 1.3
        }}>
          {isEs 
            ? 'Complejo Bioactivo Procapil® al 5%: Bloqueo de DHT y Anclaje Folicular en Fase Anágena' 
            : '5% Procapil® Multi-Active Peptide Matrix: DHT Miniaturization Blockade & Follicular Anchoring'}
        </h3>
        <p style={{
          fontSize: '0.88rem',
          color: '#475569',
          lineHeight: 1.6,
          margin: 0
        }}>
          {isEs
            ? 'MCG Kapigen combina una concentración clínica del 5% de Procapil® (Biotinil-GHK, Ácido Oleanólico y Apigenina) con D-Biotina, Provitamina B5, fitoqueratina y L-mentol para reactivar el ciclo folicular capilar, inhibir la 5α-reductasa local y fortalecer el anclaje radicular sin provocar efecto rebote tras la suspensión.'
            : 'MCG Kapigen combines a therapeutic 5% clinical dose of patented Procapil® (Biotinyl-GHK, Oleanolic Acid, and Apigenin) with D-Biotin, Provitamin B5, phytokeratin, and natural menthol to reactivate dormant follicle stem cells, suppress local 5α-reductase, and maximize root anchoring without rebound shedding.'}
        </p>
      </div>

      {/* ── 3. Four Core Mechanism Columns ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        padding: '1.5rem 2rem',
        background: '#f8fafc'
      }}>
        {/* Pillar 1 */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '1.1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#f0fdfa',
              color: '#0d9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0d9488' }}>MEC-01 • PEPTIDE SIGNAL</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Biotinyl-GHK</div>
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
            {isEs 
              ? 'Estimula la síntesis de Laminina-5 y Colágeno IV en la lámina basal de la vaina radicular, incrementando el anclaje del cabello en un +46%.' 
              : 'Stimulates the synthesis of Laminin-5 and Collagen IV in the outer root sheath basement membrane, boosting follicular anchoring resistance by +46%.'}
          </p>
        </div>

        {/* Pillar 2 */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '1.1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#dc2626' }}>MEC-02 • DHT BLOCKER</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Oleanolic Acid</div>
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
            {isEs 
              ? 'Triterpeno botánico de hojas de olivo que inhibe competitivamente las enzimas 5α-reductasa tipo I y II, frenando la miniaturización folicular.' 
              : 'Natural olive-leaf triterpenoid that competitively blocks 5α-reductase Types I and II, neutralizing local DHT-induced miniaturization.'}
          </p>
        </div>

        {/* Pillar 3 */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '1.1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Droplets size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#2563eb' }}>MEC-03 • MICROCIRCULATION</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Apigenin & Menthol</div>
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
            {isEs 
              ? 'Bioflavonoide cítrico combinado con mentol natural para activar la vasodilatación perifolicular (+28% flujo sanguíneo) y la oxigenación papilar.' 
              : 'Citrus bioflavonoid synergized with natural L-menthol to induce perifollicular vasodilation (+28% capillary flow) and nourish matrix cells.'}
          </p>
        </div>

        {/* Pillar 4 */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '1.1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#faf5ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Leaf size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#7c3aed' }}>MEC-04 • REPAIR</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Phytokeratin & Biotin</div>
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
            {isEs 
              ? 'Fitoqueratina vegetal y D-Biotina que reparan la cutícula dañada (+22% elasticidad a la tracción) y calman el cuero cabelludo sensible.' 
              : 'Low-MW plant peptides and D-Biotin that restore cortical disulfide bonds (+22% tensile strength) and soothe reactive scalp skin.'}
          </p>
        </div>
      </div>

      {/* ── 4. Key Clinical Trial Results Strip ── */}
      <div style={{
        padding: '1.25rem 2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1.5rem',
        borderTop: '1px solid #e2e8f0',
        background: '#ffffff'
      }}>
        <div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0d9488', letterSpacing: '-0.02em' }}>+46%</div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a' }}>{isEs ? 'Anclaje Folicular en Raíz' : 'Follicular Root Anchoring'}</div>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{isEs ? 'Laminina-5 y Colágeno IV' : 'Laminin-5 & Collagen IV ECM'}</div>
        </div>
        <div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#dc2626', letterSpacing: '-0.02em' }}>−58%</div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a' }}>{isEs ? 'Conversión a DHT Folicular' : 'Local DHT Conversion'}</div>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{isEs ? 'Inhibición de 5α-reductasa I/II' : '5α-Reductase I/II blockade'}</div>
        </div>
        <div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#2563eb', letterSpacing: '-0.02em' }}>68%</div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a' }}>{isEs ? 'Respuesta Anágena en Ensayos' : 'Clinical Trial Anagen Response'}</div>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{isEs ? 'Aumento activo de densidad' : 'Documented density increase'}</div>
        </div>
        <div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#d97706', letterSpacing: '-0.02em' }}>0%</div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a' }}>{isEs ? 'Efecto Rebote o Dependencia' : 'Rebound Shedding / Dependency'}</div>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{isEs ? 'Seguro post-trasplante (Día 14+)' : 'Safe post-hair transplant (Day 14+)'}</div>
        </div>
      </div>

      {isBannerModalOpen && (
        <ImageModal
          src={bannerSrc}
          alt="MCG Kapigen 5% Procapil Scalp Spray"
          onClose={() => setIsBannerModalOpen(false)}
        />
      )}
    </section>
  );
}

"use client";

import React, { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  Info, 
  Layers, 
  Droplets,
  Package,
  ArrowRight
} from '@/lib/icons';
import PublicSectionCard from '@/components/shared/public/PublicSectionCard';
import PublicSegmentedControl from '@/components/shared/public/PublicSegmentedControl';

/**
 * ProtocolPosologyConsole
 * ─────────────────────────────────────────────────────────────────────────────
 * Clean clinical administration and posology console for protocols that do NOT
 * use injectable/lyophilized vials (oral nutricosmetics, capsules, topicals, cosmeceuticals).
 * Replaces the syringe / reconstitution console with realistic dosing schedules,
 * application rituals, and physiological absorption kinetics.
 */
export default function ProtocolPosologyConsole({
  items = [],
  phases = [],
  _protocol = null,
  lang = 'en'
}) {
  const isEs = lang === 'es';
  const [selectedPhaseIdx, setSelectedPhaseIdx] = useState(0);

  const activePhase = phases[selectedPhaseIdx] || phases[0] || {
    name: isEs ? 'Fase Activa' : 'Active Phase',
    durationWeeks: 4
  };

  return (
    <PublicSectionCard
      id="posology-console"
      icon={Sparkles}
      category={isEs ? 'PAUTA & RITUAL DE APLICACIÓN' : 'POSOLOGY & APPLICATION RITUAL'}
      title={isEs ? 'Consola de Posología & Vía de Administración' : 'Clinical Posology & Administration Console'}
      badge={isEs ? 'Oral / Tópico No Inyectable' : 'Oral / Topical Non-Injectable'}
      badgeVariant="green"
      rightAction={
        phases.length > 1 ? (
          <PublicSegmentedControl
            size="sm"
            items={phases.map((ph, idx) => ({
              id: idx,
              label: ph.name || (isEs ? `Fase ${idx + 1}` : `Phase ${idx + 1}`)
            }))}
            activeId={selectedPhaseIdx}
            onChange={setSelectedPhaseIdx}
          />
        ) : null
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* ── TOP BANNER: Clinical Bioavailability & Non-Invasive Delivery Standard ── */}
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#166534' }}>
                {isEs ? 'Régimen Terapéutico No Inyectable' : 'Non-Invasive Therapeutic Regimen'}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#15803d', marginTop: '2px' }}>
                {isEs
                  ? 'No requiere reconstitución con agua bacteriostática ni punción subcutánea. Administración enteral y tópica cutánea.'
                  : 'No bacteriostatic reconstitution or subcutaneous needle required. Standardized oral nutricosmetic & dermal delivery.'}
              </div>
            </div>
          </div>

          <div style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            background: '#ffffff',
            border: '1px solid #86efac',
            color: '#166534',
            padding: '4px 10px',
            borderRadius: '6px'
          }}>
            {activePhase.durationWeeks ? `${activePhase.durationWeeks} ${isEs ? 'Semanas por fase' : 'Weeks / Phase'}` : (isEs ? 'Ciclo Continuo' : 'Continuous')}
          </div>
        </div>

        {/* ── ACTIVE ITEMS POSOLOGY LIST (HORIZONTAL CARDS) ── */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {items.map((item, idx) => {
            const rawFormat = (item.format || item.presentation || item.dosageForm || '').toLowerCase();
            const isOral = rawFormat.includes('caps') || rawFormat.includes('oral') || rawFormat.includes('supplement') || item.is_supplement || item.id?.includes('colvita');

            return (
              <div
                key={idx}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem 1.5rem',
                  display: 'grid',
                  gridTemplateColumns: 'minmax(240px, 1.2fr) minmax(200px, 1fr) minmax(260px, 1.5fr)',
                  gap: '1.5rem',
                  alignItems: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                }}
                className="posology-horizontal-card"
              >
                {/* Column 1: Identity & Volume */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      background: isOral ? '#eff6ff' : '#f0fdfa',
                      color: isOral ? '#1d4ed8' : '#0f766e',
                      border: `1px solid ${isOral ? '#bfdbfe' : '#99f6e4'}`,
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}>
                      {isOral ? (isEs ? 'Vía Oral / Nutricosmético' : 'Oral Route / Nutricosmetic') : (isEs ? 'Vía Tópica / Dérmica' : 'Topical Route / Dermal')}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                      {item.volume || item.presentation || (isOral ? '60 / 120 Caps' : 'Formulación Tópica')}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>
                    {item.name || item.product_name || 'Compound'}
                  </h4>
                </div>

                {/* Column 2: Dose & Timing Box */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  border: '1px solid #f1f5f9'
                }}>
                  <div>
                    <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                      {isEs ? 'Posología' : 'Daily Dose'}
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                      {item.dosage || item.dose || (isOral ? '2 cápsulas / día' : '1–2 aplicaciones / día')}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                      {isEs ? 'Momento' : 'Timing'}
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 800, color: isOral ? '#1d4ed8' : '#0d9488', marginTop: '2px' }}>
                      {item.timing || (isOral ? (isEs ? 'Con comida' : 'With meal') : (isEs ? 'Mañana / Noche' : 'AM / PM'))}
                    </div>
                  </div>
                </div>

                {/* Column 3: Clinical Application Ritual Instructions & Storage */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.45 }}>
                    <strong style={{ color: '#0f172a' }}>{isEs ? 'Ritual de Aplicación:' : 'Application Ritual:'} </strong>
                    {isOral
                      ? (isEs
                          ? 'Ingerir con un vaso completo de agua mineral templada. No masticar. La vitamina C optimiza la absorción entérica de oligopéptidos de tropocolágeno.'
                          : 'Swallow with room temperature water. Do not chew. Dietary vitamin C synergizes enteric absorption of intact tropocollagen oligopeptides.')
                      : (isEs
                          ? 'Aplicar con movimientos circulares ascendentes sobre la piel limpia y ligeramente humedecida para optimizar la biodisponibilidad transepidérmica.'
                          : 'Apply in gentle upward circular motions onto freshly cleansed, damp skin to enhance transepidermal delivery.')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.70rem', color: '#64748b' }}>
                    <Clock size={12} color="#94a3b8" />
                    <span>
                      {isOral
                        ? (isEs ? 'Conservar en lugar fresco y seco (<25°C). Proteger de la luz solar directa.' : 'Store below 25°C in a dry place. Protect from direct solar exposure.')
                        : (isEs ? 'Mantener envase cerrado herméticamente tras cada aplicación.' : 'Keep dispenser hermetically sealed after use.')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PublicSectionCard>
  );
}

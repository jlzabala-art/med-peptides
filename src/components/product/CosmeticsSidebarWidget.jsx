"use client";

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck, Sparkles, CheckCircle2, ChevronRight,
  Clock, Package, Leaf, Droplets, Check, ExternalLink,
  Award, RefreshCcw, Mail
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';

/**
 * CosmeticsSidebarWidget
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console compliant sticky sidebar widget for Colway Hair System
 * and professional cosmeceuticals.
 * 
 * Features:
 *  1. Colway 2-Step Synergy Ecosystem switcher (Step 1 Shampoo <-> Step 2 Conditioner)
 *     with "Active Monograph" marker and single-click switching.
 *  2. Dwell Time & Application Protocol guidance.
 *  3. "Inquire 2-Step Routine System" Institutional CTA.
 *  4. Clinical Purity & Regulatory Compliance verification card (0% Bovine, EU 1223/2009).
 */
export default function CosmeticsSidebarWidget({
  currentSlug = '',
  lang = 'en',
  onInquireRoutine = null
}) {
  const isEs = lang === 'es';
  const isShampoo = currentSlug.includes('shampoo');
  const isConditioner = currentSlug.includes('conditioner');

  const products = [
    {
      slug: 'colway-strengthening-shampoo',
      step: isEs ? 'Paso 1' : 'Step 1',
      name: isEs ? 'Champú Fortalecedor' : 'Strengthening Shampoo',
      action: isEs ? 'Detox Cuero Cabelludo & Bloqueo DHT' : 'Scalp Detox & DHT Inhibition',
      actives: 'Diosmina Micronizada · Biotina · Hesperidina',
      volume: '200 mL',
      dwell: isEs ? '3 min en cuero cabelludo' : '3 min scalp dwell',
      icon: '🧴',
      stepColor: '#2563eb'
    },
    {
      slug: 'colway-strengthening-conditioner',
      step: isEs ? 'Paso 2' : 'Step 2',
      name: isEs ? 'Acondicionador Fortalecedor' : 'Strengthening Conditioner',
      action: isEs ? 'Reconstrucción de Córtex & Sellado Cuticular' : 'Cortex Repair & Cuticle Sealing',
      actives: 'Tropocolágeno Nativo · Queratina · Aceite de Argán',
      volume: '200 mL',
      dwell: isEs ? '5–10 min saturación cutícula' : '5–10 min cuticle dwell',
      icon: '💧',
      stepColor: '#0d9488'
    }
  ];

  const complianceBadges = [
    {
      label: isEs ? '0% Fuente Bovina' : '0% Bovine Source',
      detail: isEs ? '100% Tropocolágeno de Pez de Agua Dulce (Triple Hélice Intacta)' : '100% Freshwater Fish Tropocollagen (Intact Triple Helix)',
      icon: Award,
      badgeColor: '#0d9488'
    },
    {
      label: isEs ? 'Registro CPNP Europeo' : 'EU CPNP Registered',
      detail: isEs ? 'Conforme Reglamento UE 1223/2009 (Dossier de Seguridad PIF)' : 'Compliant with EU Reg. 1223/2009 (PIF Safety Dossier)',
      icon: ShieldCheck,
      badgeColor: '#16a34a'
    },
    {
      label: isEs ? 'Sin Sulfatos ni Parabenos' : 'SLS / SLES & Paraben Free',
      detail: isEs ? 'Fórmula no citotóxica para folículo piloso y post-injerto' : 'Non-cytotoxic formulation for follicular bulb & post-transplant',
      icon: Leaf,
      badgeColor: '#0284c7'
    },
    {
      label: isEs ? 'Fabricación UE · GMP ISO 22716' : 'Made in EU · GMP ISO 22716',
      detail: isEs ? 'Colway Laboratories · Control por lote con trazabilidad' : 'Colway Laboratories · Batch traceability & stability verified',
      icon: CheckCircle2,
      badgeColor: '#6366f1'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
      
      {/* ── CARD 1: COLWAY 2-STEP ROUTINE ECOSYSTEM ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        {/* Header */}
        <div style={{
          padding: '0.65rem 0.85rem',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderBottom: '2px solid #0d9488',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#e2e8f0', letterSpacing: '0.06em' }}>
              {isEs ? 'SISTEMA CAPILAR COLWAY' : 'COLWAY HAIR SYSTEM'}
            </div>
            <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '1px' }}>
              {isEs ? 'Protocolo cosmeceútico sinérgico en 2 pasos' : '2-step synergistic cosmeceutical protocol'}
            </div>
          </div>
          <span style={{
            fontSize: '0.58rem',
            fontWeight: 800,
            color: '#99f6e4',
            background: 'rgba(13, 148, 136, 0.25)',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid rgba(13, 148, 136, 0.4)'
          }}>
            2-STEP SYNERGY
          </span>
        </div>

        {/* 2 Products List */}
        <div style={{ padding: '0.35rem 0' }}>
          {products.map((p) => {
            const isCurrent = currentSlug.includes(p.slug) || (isShampoo && p.slug.includes('shampoo')) || (isConditioner && p.slug.includes('conditioner'));

            if (isCurrent) {
              return (
                <div
                  key={p.slug}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '0.65rem 0.85rem',
                    background: '#f0fdfa',
                    borderLeft: '3px solid #0d9488',
                    borderBottom: '1px solid #f1f5f9'
                  }}
                >
                  <span style={{ fontSize: '1.25rem', lineHeight: 1, marginTop: '2px', flexShrink: 0 }}>
                    {p.icon}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.58rem',
                        fontWeight: 800,
                        color: p.stepColor,
                        background: `${p.stepColor}15`,
                        padding: '1px 5px',
                        borderRadius: '3px',
                        letterSpacing: '0.03em'
                      }}>
                        {p.step}
                      </span>
                      <span style={{
                        fontSize: '0.56rem',
                        fontWeight: 700,
                        color: '#0f766e',
                        background: '#ccfbf1',
                        padding: '1px 6px',
                        borderRadius: '99px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#0d9488' }} />
                        {isEs ? 'ESTÁS AQUÍ' : 'ACTIVE MONOGRAPH'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', marginTop: '3px' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '1px' }}>
                      {p.action}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#0d9488', fontWeight: 600, marginTop: '2px' }}>
                      ⏱️ {p.dwell}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={p.slug}
                href={`/p/${p.slug}`}
                onClick={() => triggerHaptic('selection')}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '0.65rem 0.85rem',
                  textDecoration: 'none',
                  borderLeft: '3px solid transparent',
                  borderBottom: '1px solid #f1f5f9',
                  transition: 'background 0.15s ease'
                }}
                className="hsw-link-hover"
              >
                <span style={{ fontSize: '1.25rem', lineHeight: 1, marginTop: '2px', flexShrink: 0 }}>
                  {p.icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontSize: '0.58rem',
                      fontWeight: 800,
                      color: p.stepColor,
                      background: `${p.stepColor}15`,
                      padding: '1px 5px',
                      borderRadius: '3px',
                      letterSpacing: '0.03em'
                    }}>
                      {p.step}
                    </span>
                    <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>
                      {p.volume}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', marginTop: '3px' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '1px' }}>
                    {p.action}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#2563eb', fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {isEs ? 'Ver ficha del producto' : 'Switch monograph'} →
                  </div>
                </div>
                <ChevronRight size={13} style={{ color: '#94a3b8', marginTop: '6px', flexShrink: 0 }} />
              </Link>
            );
          })}
        </div>

        {/* Synergy Frequency Footer */}
        <div style={{
          padding: '0.6rem 0.85rem',
          background: '#f8fafc',
          borderTop: '1px solid #f1f5f9',
          fontSize: '0.67rem',
          color: '#475569',
          lineHeight: 1.45
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
            <Sparkles size={11} style={{ color: '#0d9488' }} />
            {isEs ? 'Pauta de Aplicación Combinada' : 'Dual-Step Synergistic Protocol'}
          </div>
          <div>
            {isEs
              ? 'Aplicar juntos 3–4× por semana. Tiempo total en ducha: ~10 minutos para absorción folicular óptima.'
              : 'Use both products 3–4×/week. Total shower dwell time: ~10 minutes for optimal cortical bio-absorption.'}
          </div>
        </div>

        {/* Institutional Inquiry Action Button */}
        {onInquireRoutine && (
          <div style={{ padding: '0.6rem 0.85rem', borderTop: '1px solid #e2e8f0', background: '#ffffff' }}>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                onInquireRoutine();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: '6px',
                background: '#0d9488',
                color: '#ffffff',
                fontSize: '0.74rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(13,148,136,0.25)',
                transition: 'background 0.15s ease'
              }}
            >
              <Mail size={12} />
              <span>{isEs ? 'Cotizar Rutina Completa 2 Pasos' : 'Inquire Complete 2-Step Routine'}</span>
            </button>
          </div>
        )}
      </div>

      {/* ── CARD 2: CLINICAL PURITY & COMPLIANCE (GCP STYLE) ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        padding: '0.75rem 0.85rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '0.55rem',
          paddingBottom: '0.45rem',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <ShieldCheck size={14} style={{ color: '#0d9488' }} />
          <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#334155', letterSpacing: '0.06em' }}>
            {isEs ? 'PUREZA CLÍNICA Y REGULACIÓN' : 'CLINICAL PURITY & COMPLIANCE'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {complianceBadges.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  background: `${b.badgeColor}12`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '1px'
                }}>
                  <Icon size={11} style={{ color: b.badgeColor }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a' }}>
                    {b.label}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#64748b', lineHeight: 1.35, marginTop: '1px' }}>
                    {b.detail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

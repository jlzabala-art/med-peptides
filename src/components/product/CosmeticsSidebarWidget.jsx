"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, Sparkles, CheckCircle2, ChevronRight,
  Leaf, Award, Mail, Layers, LayoutGrid, FileText
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';

/**
 * CosmeticsSidebarWidget
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console compliant sticky sidebar widget for Colway cosmeceuticals
 * and hair/skin systems.
 * 
 * Dynamically adapts according to the active product lineage:
 *  - Blue Diamond Line: Blue Diamond Peeling <-> Blue Diamond Cream (Cellular & ECM Renewal)
 *  - Hair Restoration: Strengthening Shampoo <-> Strengthening Conditioner (Follicular Synergy)
 *  - Vege Line: Hydrolipid Wash Gel <-> Collagen Vege (100% Plant-Derived Restoration)
 */
export default function CosmeticsSidebarWidget({
  currentSlug = '',
  lang = 'en',
  onInquireRoutine = null
}) {
  const isEs = lang === 'es';
  const slugLower = (currentSlug || '').toLowerCase();

  const isHair = slugLower.includes('shampoo') || slugLower.includes('conditioner') || slugLower.includes('hair');
  const isVege = slugLower.includes('vege') || slugLower.includes('wash-gel');
  const isColvita = slugLower.includes('colvita');
  // If not hair, not vege, and not colvita, it belongs to the Blue Diamond cellular line
  const isBlueDiamond = !isHair && !isVege && !isColvita;

  const associatedProtocol = useMemo(() => {
    if (isBlueDiamond) {
      return {
        title: isEs ? 'Protocolo Blue Diamond Neo-Colagénesis' : 'Blue Diamond Neo-Collagenesis Protocol',
        subtitle: isEs ? 'Pauta clínica de 2 pasos AM/PM' : '2-Step Clinical AM/PM Protocol',
        url: '/collection/colway?cat=epigenetic',
        color: '#2563eb'
      };
    }
    if (isHair) {
      return {
        title: isEs ? 'Protocolo Folicular Anticaída' : 'Follicular Hair Restoration Protocol',
        subtitle: isEs ? 'Anclaje capilar Baicapil™ + Diosmina' : 'Baicapil™ + Diosmin Root Anchorage',
        url: '/collection/colway?cat=trichology',
        color: '#0d9488'
      };
    }
    if (isColvita) {
      return {
        title: isEs ? 'Protocolo Inside-Out Neo-Colagénesis' : 'Inside-Out Neocollagenesis Protocol',
        subtitle: isEs ? 'Sinergia oral Colvita + colágeno tópico' : 'Oral Colvita + Topical Tropocollagen Synergy',
        url: '/collection/colway?cat=nutricosmetics',
        color: '#16a34a'
      };
    }
    return {
      title: isEs ? 'Protocolo Barrera Hidrolipídica' : 'Native Dermal Barrier Shield Protocol',
      subtitle: isEs ? 'Regeneración y protección celular CPNP' : 'CPNP Cellular Barrier Restoration',
      url: '/collection/colway?cat=native-dermal',
      color: '#0284c7'
    };
  }, [isBlueDiamond, isHair, isColvita, isEs]);

  // Configuration according to active product ecosystem
  let systemConfig;

  if (isBlueDiamond) {
    systemConfig = {
      title: isEs ? 'LÍNEA BLUE DIAMOND REGENERACIÓN' : 'BLUE DIAMOND SYSTEM',
      subtitle: isEs ? 'Protocolo epigenético y de renovación dérmica en 2 pasos' : '2-step synergistic cellular & ECM renewal protocol',
      badge: 'DIAMOND SYNERGY',
      headerGradient: 'linear-gradient(135deg, #091e3a 0%, #172554 100%)',
      accentColor: '#2563eb',
      badgeBg: 'rgba(37, 99, 235, 0.25)',
      badgeBorder: 'rgba(37, 99, 235, 0.4)',
      badgeColor: '#bfdbfe',
      products: [
        {
          slug: 'colway-blue-diamond-peeling',
          step: isEs ? 'Paso 1' : 'Step 1',
          name: isEs ? 'Peeling Blue Diamond' : 'Blue Diamond Peeling',
          action: isEs ? 'Microcristales de Diamante & Peeling Enzimático' : 'Diamond Dust Micro-Exfoliation & Enzymatic Prep',
          actives: 'Polvo de Diamante · Subtilisina · Tropocolágeno Nativo',
          volume: '75 mL',
          dwell: isEs ? '2× por semana · Masaje 2 min y aclarar' : '2× weekly · 2 min massage & rinse',
          icon: '💎',
          stepColor: '#0284c7'
        },
        {
          slug: 'colway-blue-diamond-cream',
          step: isEs ? 'Paso 2' : 'Step 2',
          name: isEs ? 'Crema Blue Diamond' : 'Blue Diamond Cream',
          action: isEs ? 'Péptidos Biomiméticos Progeline & Renovación ECM' : 'Progeline Biomimetic Peptides & ECM Renewal',
          actives: 'Progeline™ · Tropocolágeno · Ácido Hialurónico · CoQ10',
          volume: '50 mL',
          dwell: isEs ? 'Diario AM / PM sobre rostro y cuello' : 'Daily AM / PM on clean face & neck',
          icon: '✨',
          stepColor: '#2563eb'
        }
      ],
      protocolTitle: isEs ? 'Pauta Sinérgica Blue Diamond' : 'Blue Diamond Synergistic Protocol',
      protocolDesc: isEs
        ? 'El Peeling (2×/sem) retira queratinocitos senescentes y optimiza la permeabilidad cutánea, multiplicando la penetración de los péptidos Progeline de la Crema Blue Diamond (diaria AM/PM).'
        : 'The Peeling (2×/wk) removes senescent corneocytes and enhances barrier permeability, multiplying bio-absorption of Progeline peptides in Blue Diamond Cream (daily AM/PM).',
      complianceBadges: [
        {
          label: isEs ? '0% Fuente Bovina' : '0% Bovine Source',
          detail: isEs ? '100% Tropocolágeno de Pez de Agua Dulce (Triple Hélice Intacta)' : '100% Freshwater Fish Tropocollagen (Intact Triple Helix)',
          icon: Award,
          badgeColor: '#2563eb'
        },
        {
          label: isEs ? 'Registro CPNP Europeo' : 'EU CPNP Registered',
          detail: isEs ? 'Conforme Reglamento UE 1223/2009 (Dossier de Seguridad PIF)' : 'Compliant with EU Reg. 1223/2009 (PIF Safety Dossier)',
          icon: ShieldCheck,
          badgeColor: '#16a34a'
        },
        {
          label: isEs ? 'Microcristales & Péptidos Progeline™' : 'Diamond Dust & Progeline™ Peptides',
          detail: isEs ? 'Acción epigenética biomimética para restaurar la síntesis de colágeno' : 'Epigenetic biomimetic matrix activation to restore dermal tension',
          icon: Sparkles,
          badgeColor: '#0284c7'
        },
        {
          label: isEs ? 'Fabricación UE · GMP ISO 22716' : 'Made in EU · GMP ISO 22716',
          detail: isEs ? 'Colway Laboratories · Control por lote con trazabilidad' : 'Colway Laboratories · Batch traceability & stability verified',
          icon: CheckCircle2,
          badgeColor: '#6366f1'
        }
      ]
    };
  } else if (isVege) {
    systemConfig = {
      title: isEs ? 'LÍNEA COLWAY VEGE' : 'COLWAY VEGE SYSTEM',
      subtitle: isEs ? 'Protocolo dérmico 100% vegetal sinérgico en 2 pasos' : '2-step 100% plant-derived synergistic skin protocol',
      badge: '100% VEGAN',
      headerGradient: 'linear-gradient(135deg, #06241b 0%, #064e3b 100%)',
      accentColor: '#059669',
      badgeBg: 'rgba(5, 150, 105, 0.25)',
      badgeBorder: 'rgba(5, 150, 105, 0.4)',
      badgeColor: '#a7f3d0',
      products: [
        {
          slug: 'colway-cellular-collagen-wash-gel',
          step: isEs ? 'Paso 1' : 'Step 1',
          name: isEs ? 'Gel Limpiador Hidrolipídico' : 'Hydrolipid Cleansing Gel',
          action: isEs ? 'Higiene Celular & Protección de Barrera' : 'Cellular Cleansing & Hydrolipid Barrier',
          actives: 'Colágeno Vegetal · Aloe Vera · D-Pantenol',
          volume: '250 mL',
          dwell: isEs ? 'Diario AM / PM con agua tibia' : 'Daily AM / PM with warm water',
          icon: '🧼',
          stepColor: '#059669'
        },
        {
          slug: 'colway-collagen-vege',
          step: isEs ? 'Paso 2' : 'Step 2',
          name: isEs ? 'Colágeno Vege' : 'Collagen Vege',
          action: isEs ? 'Hidratación Profunda & Firmeza Vegetal' : 'Deep Hydration & Plant Firmness',
          actives: 'Fitocolágeno · Ácido Fólico · Ácido Hialurónico',
          volume: '45 mL',
          dwell: isEs ? 'Aplicar tras la limpieza sobre piel húmeda' : 'Apply after cleansing on damp skin',
          icon: '🌱',
          stepColor: '#10b981'
        }
      ],
      protocolTitle: isEs ? 'Pauta Sinérgica Vege' : 'Vege Synergistic Protocol',
      protocolDesc: isEs
        ? 'Limpiar primero con el Gel Hidrolipídico respetando el microbioma y aplicar el Colágeno Vege con la piel ligeramente húmeda para maximizar la hidratación.'
        : 'First cleanse with Hydrolipid Gel respecting the microbiome, then apply Collagen Vege on slightly damp skin for maximal hydration.',
      complianceBadges: [
        {
          label: isEs ? '100% Origen Vegetal' : '100% Plant-Derived',
          detail: isEs ? 'Fito-complejo botánico libre de ingredientes de origen animal' : 'Botanical phyto-complex free from animal-derived materials',
          icon: Leaf,
          badgeColor: '#059669'
        },
        {
          label: isEs ? 'Registro CPNP Europeo' : 'EU CPNP Registered',
          detail: isEs ? 'Conforme Reglamento UE 1223/2009 (Dossier de Seguridad PIF)' : 'Compliant with EU Reg. 1223/2009 (PIF Safety Dossier)',
          icon: ShieldCheck,
          badgeColor: '#16a34a'
        },
        {
          label: isEs ? 'Sin Sulfatos ni Parabenos' : 'SLS / SLES & Paraben Free',
          detail: isEs ? 'Hipoalergénico y testado en pieles sensibles' : 'Hypoallergenic and dermatologically tested on sensitive skin',
          icon: CheckCircle2,
          badgeColor: '#0284c7'
        },
        {
          label: isEs ? 'Fabricación UE · GMP ISO 22716' : 'Made in EU · GMP ISO 22716',
          detail: isEs ? 'Colway Laboratories · Control por lote con trazabilidad' : 'Colway Laboratories · Batch traceability & stability verified',
          icon: Award,
          badgeColor: '#6366f1'
        }
      ]
    };
  } else if (isColvita) {
    systemConfig = {
      title: isEs ? 'LÍNEA NUTRICOSMÉTICA COLWAY' : 'COLWAY NUTRICOSMETICS SYSTEM',
      subtitle: isEs ? 'Tropocolágeno nativo puro liofilizado + algas marinas' : 'Pure lyophilized native fish tropocollagen + marine algae',
      badge: 'SYSTEMIC TROPOCOLLAGEN',
      headerGradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      accentColor: '#6366f1',
      badgeBg: 'rgba(99, 102, 241, 0.25)',
      badgeBorder: 'rgba(99, 102, 241, 0.4)',
      badgeColor: '#c7d2fe',
      products: [
        {
          slug: 'colway-colvita',
          step: isEs ? 'Ingesta Diaria' : 'Daily Intake',
          name: isEs ? 'Colvita Colágeno Liofilizado' : 'Colvita Bioactive Collagen',
          action: isEs ? 'Estimulación Sistémica de Fibroblastos' : 'Systemic Fibroblast Neo-Collagenesis',
          actives: isEs ? 'Tropocolágeno Liofilizado · Algas Fucus · Vitamina E' : 'Freeze-Dried Tropocollagen · Fucus Algae · Vitamin E',
          volume: '60 / 120 Caps',
          dwell: isEs ? '2 cápsulas al día con comidas' : '2 capsules daily with meals',
          icon: '💊',
          stepColor: '#6366f1'
        }
      ],
      protocolTitle: isEs ? 'Pauta Nutricosmética Celular' : 'Cellular Nutricosmetic Regimen',
      protocolDesc: isEs
        ? 'Aporta péptidos de tropocolágeno intactos (triple hélice) y yodo orgánico de algas Fucus para estimular la síntesis endógena de colágeno desde el interior.'
        : 'Supplies intact tropocollagen triple-helix peptides and organic Fucus algae trace minerals to upregulate endogenous collagen synthesis from within.',
      complianceBadges: [
        {
          label: isEs ? '100% Colágeno Liofilizado' : '100% Freeze-Dried Collagen',
          detail: isEs ? 'Triple hélice intacta de pez de agua dulce (no desnaturalizado)' : 'Intact triple-helix native freshwater fish collagen (non-denatured)',
          icon: Award,
          badgeColor: '#6366f1'
        },
        {
          label: isEs ? 'Conforme EFSA y Directiva UE' : 'EFSA & EU Directive Compliant',
          detail: isEs ? 'Conforme Directiva 2002/46/CE y Reglamento 1169/2011' : 'Compliant with Directive 2002/46/EC & Reg. 1169/2011',
          icon: ShieldCheck,
          badgeColor: '#16a34a'
        },
        {
          label: isEs ? 'Cápsulas 100% Gelatina de Pez' : '100% Fish Gelatin Capsules',
          detail: isEs ? '0% gelatina bovina o porcina · Libre de gluten y OGM' : '0% bovine or porcine gelatin · Gluten-free & Non-GMO',
          icon: CheckCircle2,
          badgeColor: '#0284c7'
        },
        {
          label: isEs ? 'Fabricación UE · GMP ISO 22716' : 'Made in EU · GMP ISO 22716',
          detail: isEs ? 'Colway Laboratories · Control por lote con trazabilidad' : 'Colway Laboratories · Batch traceability & stability verified',
          icon: CheckCircle2,
          badgeColor: '#6366f1'
        }
      ]
    };
  } else {
    // Hair System
    systemConfig = {
      title: isEs ? 'SISTEMA CAPILAR COLWAY' : 'COLWAY HAIR SYSTEM',
      subtitle: isEs ? 'Protocolo cosmeceútico sinérgico en 2 pasos' : '2-step synergistic cosmeceutical protocol',
      badge: '2-STEP SYNERGY',
      headerGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      accentColor: '#0d9488',
      badgeBg: 'rgba(13, 148, 136, 0.25)',
      badgeBorder: 'rgba(13, 148, 136, 0.4)',
      badgeColor: '#99f6e4',
      products: [
        {
          slug: 'colway-strengthening-shampoo',
          step: isEs ? 'Paso 1' : 'Step 1',
          name: isEs ? 'Champú Fortalecedor' : 'Strengthening Shampoo',
          action: isEs ? 'Detox Cuero Cabelludo & Bloqueo DHT' : 'Scalp Detox & DHT Inhibition',
          actives: 'Diosmina Micronizada · Biotina · Hesperidina',
          volume: '250 mL',
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
          volume: '250 mL',
          dwell: isEs ? '5–10 min saturación cutícula' : '5–10 min cuticle dwell',
          icon: '💧',
          stepColor: '#0d9488'
        }
      ],
      protocolTitle: isEs ? 'Pauta de Aplicación Combinada' : 'Dual-Step Synergistic Protocol',
      protocolDesc: isEs
        ? 'Aplicar juntos 3–4× por semana. Tiempo total en ducha: ~10 minutos para absorción folicular óptima.'
        : 'Use both products 3–4×/week. Total shower dwell time: ~10 minutes for optimal cortical bio-absorption.',
      complianceBadges: [
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
      ]
    };
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
      
      {/* ── CARD 1: 2-STEP SYNERGY ECOSYSTEM ── */}
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
          background: systemConfig.headerGradient,
          borderBottom: `2px solid ${systemConfig.accentColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#e2e8f0', letterSpacing: '0.06em' }}>
              {systemConfig.title}
            </div>
            <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '1px' }}>
              {systemConfig.subtitle}
            </div>
          </div>
          <span style={{
            fontSize: '0.58rem',
            fontWeight: 800,
            color: systemConfig.badgeColor,
            background: systemConfig.badgeBg,
            padding: '2px 6px',
            borderRadius: '4px',
            border: `1px solid ${systemConfig.badgeBorder}`
          }}>
            {systemConfig.badge}
          </span>
        </div>

        {/* 2 Products List */}
        <div style={{ padding: '0.35rem 0' }}>
          {systemConfig.products.map((p) => {
            const isCurrent = slugLower === p.slug || slugLower.includes(p.slug) || p.slug.includes(slugLower);

            if (isCurrent) {
              return (
                <div
                  key={p.slug}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '0.65rem 0.85rem',
                    background: '#f8fafc',
                    borderLeft: `3px solid ${systemConfig.accentColor}`,
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
                        color: systemConfig.accentColor,
                        background: `${systemConfig.accentColor}18`,
                        padding: '1px 6px',
                        borderRadius: '99px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: systemConfig.accentColor }} />
                        {isEs ? 'ESTÁS AQUÍ' : 'ACTIVE MONOGRAPH'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', marginTop: '3px' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '1px' }}>
                      {p.action}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: systemConfig.accentColor, fontWeight: 600, marginTop: '2px' }}>
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
                  <div style={{ fontSize: '0.62rem', color: systemConfig.accentColor, fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '2px' }}>
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
            <Sparkles size={11} style={{ color: systemConfig.accentColor }} />
            {systemConfig.protocolTitle}
          </div>
          <div>
            {systemConfig.protocolDesc}
          </div>
        </div>

        {onInquireRoutine && (
          <div style={{ padding: '0.5rem 0.85rem', background: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('impactLight');
                onInquireRoutine();
              }}
              style={{
                width: '100%',
                padding: '6px 12px',
                borderRadius: '6px',
                border: `1px solid ${systemConfig.accentColor}30`,
                background: `${systemConfig.accentColor}0a`,
                color: systemConfig.accentColor,
                fontSize: '0.67rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <Mail size={12} />
              {isEs ? 'Consultar protocolo completo' : 'Inquire full routine protocol'}
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
          <ShieldCheck size={14} style={{ color: systemConfig.accentColor }} />
          <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#334155', letterSpacing: '0.06em' }}>
            {isEs ? 'PUREZA CLÍNICA Y REGULACIÓN' : 'CLINICAL PURITY & COMPLIANCE'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {systemConfig.complianceBadges.map((b, i) => {
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

      {/* ── CARD 3: COLLECTION & PROTOCOLS NAVIGATION (GCP CONSOLE STANDARD) ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        padding: '0.75rem 0.85rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '0.45rem',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={13} style={{ color: '#0d9488' }} />
            <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#334155', letterSpacing: '0.06em' }}>
              {isEs ? 'NAVEGACIÓN & PROTOCOLOS' : 'COLLECTION & PROTOCOLS'}
            </span>
          </div>
          <span style={{
            fontSize: '0.60rem',
            fontWeight: 700,
            color: '#0d9488',
            background: '#f0fdfa',
            padding: '1px 6px',
            borderRadius: '4px',
            border: '1px solid #ccfbf1'
          }}>
            Colway®
          </span>
        </div>

        {/* 1. Link to Colway Collection */}
        <Link
          href="/collection/colway"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            borderRadius: '8px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            textDecoration: 'none',
            color: '#0f172a',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: '#0d948815',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <LayoutGrid size={12} style={{ color: '#0d9488' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                {isEs ? 'Colección Colway®' : 'Colway® Collection'}
              </div>
              <div style={{ fontSize: '0.62rem', color: '#64748b', lineHeight: 1.2, marginTop: '2px' }}>
                {isEs ? 'Explorar las 9 formulaciones' : 'Explore all 9 formulations'}
              </div>
            </div>
          </div>
          <ChevronRight size={13} style={{ color: '#0d9488', flexShrink: 0 }} />
        </Link>

        {/* 2. Associated Clinical Protocol Link */}
        {associatedProtocol && (
          <Link
            href={associatedProtocol.url}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              textDecoration: 'none',
              color: '#0f172a',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: `${associatedProtocol.color || '#2563eb'}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FileText size={12} style={{ color: associatedProtocol.color || '#2563eb' }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                  {associatedProtocol.title}
                </div>
                <div style={{ fontSize: '0.62rem', color: '#64748b', lineHeight: 1.2, marginTop: '2px' }}>
                  {associatedProtocol.subtitle}
                </div>
              </div>
            </div>
            <ChevronRight size={13} style={{ color: associatedProtocol.color || '#2563eb', flexShrink: 0 }} />
          </Link>
        )}
      </div>

    </div>
  );
}

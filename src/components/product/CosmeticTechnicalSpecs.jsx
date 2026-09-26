"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, Sparkles, FlaskConical, Leaf,
  CheckCircle2, Info, ChevronDown, ChevronRight,
  Droplets, Activity, Package, Microscope, Heart,
  AlertTriangle, ClipboardList, Scissors, Beaker, BookOpen,
  TestTube, Thermometer, Clock, BarChart2,
  RefreshCcw, Layers, Mail, Check, ExternalLink
} from '@/lib/icons';

const INCI_GROUP_META = {
  base:              { labelEn: 'Aqueous Base',         labelEs: 'Base Acuosa Purificada',    color: '#64748b', bg: '#f1f5f9' },
  surfactant:        { labelEn: 'Surfactant System',    labelEs: 'Sistema Tensoactivo Suave', color: '#2563eb', bg: '#eff6ff' },
  conditioning_base: { labelEn: 'Conditioning Base',    labelEs: 'Base Acondicionadora',     color: '#7c3aed', bg: '#faf5ff' },
  key_active:        { labelEn: 'Key Clinical Active',  labelEs: 'Activo Clínico Principal',  color: '#0d9488', bg: '#f0fdfa' },
  functional_active: { labelEn: 'Functional Active',    labelEs: 'Activo Funcional Botánico', color: '#16a34a', bg: '#f0fdf4' },
  conditioning:      { labelEn: 'Conditioning Polymer', labelEs: 'Polímero Acondicionador',   color: '#0284c7', bg: '#e0f2fe' },
  preservative:      { labelEn: 'Preservation System',  labelEs: 'Sistema de Conservación',   color: '#d97706', bg: '#fffbeb' },
  fragrance:         { labelEn: 'Fragrance',            labelEs: 'Fragancia Hipoalergénica',  color: '#db2777', bg: '#fdf2f8' },
  functional:        { labelEn: 'Functional Additive',   labelEs: 'Aditivo Reológico/Buffer', color: '#64748b', bg: '#f8fafc' },
};

const INGREDIENT_ICONS = {
  key_active: Sparkles,
  functional_active: Leaf,
  surfactant: Droplets,
  conditioning_base: Activity,
  conditioning: Heart,
  preservative: ShieldCheck,
  fragrance: Sparkles,
  base: Beaker,
  functional: TestTube,
};

function InciRow({ ing, index, lang }) {
  const [open, setOpen] = useState(false);
  const isEs = lang === 'es';
  const group = ing.inci_group || 'functional';
  const meta = INCI_GROUP_META[group] || INCI_GROUP_META.functional;
  const IconComp = INGREDIENT_ICONS[group] || FlaskConical;
  const hasClinical = Boolean(ing.clinical_data?.mechanism || ing.clinical_data?.evidence);

  return (
    <div style={{ borderBottom: '1px solid #f1f5f9', padding: '0.65rem 0' }}>
      <button
        type="button"
        onClick={() => hasClinical && setOpen(v => !v)}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: hasClinical ? 'pointer' : 'default',
          textAlign: 'left',
          padding: 0
        }}
      >
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 22,
          height: 22,
          borderRadius: '50%',
          flexShrink: 0,
          marginTop: '2px',
          background: '#f1f5f9',
          color: '#64748b',
          fontSize: '0.65rem',
          fontWeight: 700
        }}>
          {index + 1}
        </span>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          borderRadius: '6px',
          flexShrink: 0,
          background: meta.bg,
          color: meta.color
        }}>
          <IconComp size={14} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', fontStyle: 'italic' }}>
              {ing.inci_name}
            </span>
            {ing.common_name && (
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                — {ing.common_name}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '3px' }}>
            <span style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              color: meta.color,
              background: meta.bg,
              padding: '1px 6px',
              borderRadius: '99px',
              border: `1px solid ${meta.color}30`
            }}>
              {isEs ? meta.labelEs : meta.labelEn}
            </span>
            {(ing.function || []).slice(0, 2).map(f => (
              <span key={f} style={{
                fontSize: '0.62rem',
                color: '#64748b',
                background: '#f8fafc',
                padding: '1px 6px',
                borderRadius: '99px',
                border: '1px solid #e2e8f0'
              }}>
                {f}
              </span>
            ))}
            {ing.concentration_range && (
              <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                {ing.concentration_range}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {hasClinical && (
            <span style={{
              fontSize: '0.60rem',
              fontWeight: 800,
              color: '#0d9488',
              background: '#ccfbf1',
              padding: '2px 8px',
              borderRadius: '99px'
            }}>
              {isEs ? 'DATOS CLÍNICOS' : 'CLINICAL DATA'}
            </span>
          )}
          {hasClinical && (open ? <ChevronDown size={14} style={{ color: '#64748b' }} /> : <ChevronRight size={14} style={{ color: '#64748b' }} />)}
        </div>
      </button>

      {ing.role && !open && (
        <p style={{ margin: '4px 0 0 60px', fontSize: '0.74rem', color: '#64748b', lineHeight: 1.5 }}>
          {ing.role}
        </p>
      )}

      {open && hasClinical && (
        <div style={{
          marginTop: '0.75rem',
          marginLeft: '60px',
          background: 'linear-gradient(135deg, #f0fdfa 0%, #f8fafc 100%)',
          borderRadius: '8px',
          padding: '0.9rem 1.1rem',
          borderLeft: `3px solid ${meta.color}`,
          border: `1px solid ${meta.color}30`
        }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            {ing.cas_number && (
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                <span style={{ fontWeight: 700, color: '#475569' }}>CAS </span>{ing.cas_number}
              </div>
            )}
            {ing.molecular_weight && (
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                <span style={{ fontWeight: 700, color: '#475569' }}>MW </span>{ing.molecular_weight}
              </div>
            )}
            {ing.origin && (
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                <span style={{ fontWeight: 700, color: '#475569' }}>{isEs ? 'Origen ' : 'Origin '}</span>{ing.origin}
              </div>
            )}
            {ing.purity && (
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                <span style={{ fontWeight: 700, color: '#475569' }}>{isEs ? 'Pureza ' : 'Purity '}</span>{ing.purity}
              </div>
            )}
          </div>
          {ing.role && (
            <p style={{ fontSize: '0.77rem', color: '#334155', margin: '0 0 0.6rem 0', lineHeight: 1.55 }}>
              {ing.role}
            </p>
          )}
          {ing.clinical_data?.mechanism && (
            <div style={{ marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: meta.color, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Beaker size={12} /> {isEs ? 'Mecanismo de Acción Molecular' : 'Molecular Mechanism of Action'}
              </div>
              <p style={{ fontSize: '0.74rem', color: '#475569', margin: 0, lineHeight: 1.55 }}>
                {ing.clinical_data.mechanism}
              </p>
            </div>
          )}
          {ing.clinical_data?.evidence && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: meta.color, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <BookOpen size={12} /> {isEs ? 'Evidencia Clínica Publicada' : 'Peer-Reviewed Clinical Evidence'}
              </div>
              <p style={{ fontSize: '0.74rem', color: '#475569', margin: 0, lineHeight: 1.55 }}>
                {ing.clinical_data.evidence}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ApplicationStepItem({ step, index, isLast, lang }) {
  const [open, setOpen] = useState(false);
  const isEs = lang === 'es';

  return (
    <div style={{ display: 'flex', gap: '14px', position: 'relative' }}>
      {!isLast && (
        <div style={{
          position: 'absolute',
          left: '13px',
          top: '28px',
          width: '2px',
          bottom: '-16px',
          background: 'linear-gradient(to bottom, #0d9488, #e2e8f0)',
          borderRadius: '1px'
        }} />
      )}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #0d9488, #0f766e)',
        color: '#fff',
        fontSize: '0.75rem',
        fontWeight: 800,
        flexShrink: 0,
        zIndex: 1
      }}>
        {step.step || index + 1}
      </div>
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : '1.25rem' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0d9488', letterSpacing: '0.05em', marginBottom: '2px' }}>
          {step.phase ? step.phase.toUpperCase() : (isEs ? `FASE ${index + 1}` : `PHASE ${index + 1}`)}
        </div>
        <p style={{ fontSize: '0.83rem', color: '#334155', margin: '0 0 0.4rem 0', lineHeight: 1.6 }}>
          {step.instruction || step}
        </p>
        {(step.duration || step.temp) && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
            {step.duration && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.64rem', color: '#64748b', background: '#f1f5f9', padding: '2px 7px', borderRadius: '99px', border: '1px solid #e2e8f0' }}>
                <Clock size={10} /> {step.duration}
              </span>
            )}
            {step.temp && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.64rem', color: '#2563eb', background: '#eff6ff', padding: '2px 7px', borderRadius: '99px', border: '1px solid #bfdbfe' }}>
                <Thermometer size={10} /> {step.temp}
              </span>
            )}
          </div>
        )}
        {step.clinical_note && (
          <>
            <button
              type="button"
              onClick={() => setOpen(v => !v)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.68rem',
                color: '#0d9488',
                fontWeight: 700,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <Info size={11} /> {isEs ? 'Nota clínica de aplicación' : 'Clinical application note'} {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            </button>
            {open && (
              <div style={{
                marginTop: '6px',
                padding: '0.55rem 0.85rem',
                background: '#f0fdfa',
                borderLeft: '3px solid #0d9488',
                borderRadius: '6px',
                fontSize: '0.74rem',
                color: '#134e4a',
                lineHeight: 1.5
              }}>
                {step.clinical_note}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function CosmeticTechnicalSpecs({ product, lang = 'en', onOpenInquiry }) {
  const isEs = lang === 'es';
  const [inciFilter, setInciFilter] = useState('key_active');

  const slug = (product?.slug || product?.id || '').toLowerCase();
  const isShampoo = slug.includes('shampoo') || (product?.name || '').toLowerCase().includes('shampoo');
  const ingredients = useMemo(() => product?.ingredients || [], [product]);
  const technicalSpecs = product?.technical_specs || null;
  const applicationProtocol = product?.application_protocol || (Array.isArray(product?.usage_steps) ? {
    frequency: '3–4× / Week',
    duration_of_use: 'Minimum 12 Weeks',
    steps: product.usage_steps.map((st, i) => ({ step: i + 1, instruction: st }))
  } : null);
  const hairProtocols = product?.associated_protocols || [];
  const warnings = product?.warnings || [];

  const keyActives = useMemo(() => {
    return ingredients.filter(i => i.inci_group === 'key_active' || i.inci_group === 'functional_active');
  }, [ingredients]);

  const groupCounts = useMemo(() => {
    const counts = {};
    ingredients.forEach(i => {
      const g = i.inci_group || 'functional';
      counts[g] = (counts[g] || 0) + 1;
    });
    return counts;
  }, [ingredients]);

  const filteredIngredients = useMemo(() => {
    if (inciFilter === 'all') {
      // Prioritize clinical bioactives first, and technical base/solvents second
      const actives = ingredients.filter(i => i.inci_group === 'key_active' || i.inci_group === 'functional_active');
      const others = ingredients.filter(i => i.inci_group !== 'key_active' && i.inci_group !== 'functional_active');
      return [...actives, ...others];
    }
    return ingredients.filter(i => (i.inci_group || 'functional') === inciFilter);
  }, [ingredients, inciFilter]);

  const techRows = [
    { label: isEs ? 'TIPO DE FORMULACIÓN' : 'FORMULATION TYPE', value: technicalSpecs?.formulation_type || (isShampoo ? 'Aqueous Gel (Sulphate-Free)' : 'Leave-In / Rinse-Off Cosmeceutical Emulsion'), icon: Beaker },
    { label: isEs ? 'RANGO DE PH' : 'PH RANGE', value: technicalSpecs?.ph_range || (isShampoo ? '4.5 – 5.5 (Acid-Buffered)' : '4.0 – 5.0 (Cuticle Sealing)'), icon: TestTube },
    { label: isEs ? 'VISCOSIDAD' : 'VISCOSITY', value: technicalSpecs?.viscosity || '2,500 – 4,500 mPa·s', icon: BarChart2 },
    { label: isEs ? 'ASPECTO' : 'APPEARANCE', value: technicalSpecs?.appearance || (isShampoo ? 'Translucent amber viscous gel' : 'Creamy white structured emulsion'), icon: Sparkles },
    { label: isEs ? 'FAMILIA DE FRAGANCIA' : 'FRAGRANCE FAMILY', value: technicalSpecs?.fragrance_family || 'Hypoallergenic Green Tea & Citrus (IFRA Compliant)', icon: Leaf },
    { label: isEs ? 'VIDA ÚTIL / CADUCIDAD' : 'SHELF LIFE', value: technicalSpecs?.shelf_life || '24 Months Sealed / 6M PAO', icon: Clock },
    { label: isEs ? 'CONDICIONES DE CONSERVACIÓN' : 'STORAGE CONDITIONS', value: technicalSpecs?.storage || '15°C – 25°C. Protect from direct sunlight.', icon: Thermometer },
    { label: isEs ? 'ESTATUS REGULATORIO' : 'REGULATORY STATUS', value: technicalSpecs?.regulatory_status || 'EU Regulation 1223/2009 · CPNP Registered', icon: ShieldCheck },
    { label: isEs ? 'TEST DERMATOLÓGICO' : 'DERM. TESTING', value: technicalSpecs?.dermatological_testing || 'Clinically Patch Tested (ICDRG Protocol)', icon: ShieldCheck },
  ].filter(r => r.value);

  return (
    <div style={{ padding: '1.75rem', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* ── Banner: Authorized Cosmeceutical Monograph Notice ── */}
      <div style={{
        background: 'linear-gradient(135deg, #042f2e 0%, #0f766e 100%)',
        color: '#ffffff',
        borderRadius: '12px',
        padding: '1.35rem 1.6rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 4px 16px rgba(13, 148, 136, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            background: 'rgba(94, 234, 212, 0.2)',
            border: '1px solid rgba(94, 234, 212, 0.4)',
            color: '#5eead4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Droplets size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#99f6e4', fontWeight: 800 }}>
              {isEs ? 'VEHÍCULO TÓPICO BIOACTIVO • REGLAMENTO UE 1223/2009' : 'BIOACTIVE TOPICAL VEHICLE • EU REGULATION 1223/2009'}
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: '2px 0' }}>
              {isEs ? 'Monografía Cosmecéutica y Especificaciones Técnicas' : 'Cosmeceutical Monograph & Technical Specifications'}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#ccfbf1', maxWidth: '650px', lineHeight: 1.5 }}>
              {isEs
                ? 'Formulación avanzada con colágeno nativo de triple hélice, bioactivos botánicos y pH fisiológico tamponado para sinergia tópica con terapias foliculares.'
                : 'Advanced formulation featuring triple-helix native collagen, botanical bioactives, and physiological acid buffer for topical follicular synergy.'}
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          padding: '0.45rem 1rem',
          borderRadius: '9999px',
          fontSize: '0.76rem',
          fontWeight: 700,
          color: '#5eead4',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <ShieldCheck size={15} />
          <span>{isEs ? 'Dermatológicamente Testado' : 'Dermatologically Tested'}</span>
        </div>
      </div>

      {/* ── 4 Key Formulation & Target Metrics ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.1rem' }}>
          <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {isEs ? 'Complejo de Activos INCI' : 'Total INCI Actives'}
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
            {ingredients.length || '15+'} {isEs ? 'Compuestos' : 'Compounds'}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#0d9488', fontWeight: 700 }}>
            {keyActives.length || '5'} {isEs ? 'activos clínicos clave' : 'key clinical actives'}
          </div>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.1rem' }}>
          <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {isEs ? 'Tampón Fisiológico' : 'Acidity & Buffer'}
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
            pH {technicalSpecs?.ph_range || (isShampoo ? '4.5 – 5.5' : '4.0 – 5.0')}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 700 }}>
            {isEs ? 'Protege la quelación de GHK-Cu' : 'Preserves GHK-Cu Cu²⁺ bond'}
          </div>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.1rem' }}>
          <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {isEs ? 'Seguridad Dérmica' : 'Surfactant & Safety'}
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
            SLS / SLES Free
          </div>
          <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700 }}>
            {isEs ? 'Sin sulfatos irritantes' : 'Non-stripping scalp surfactant'}
          </div>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.1rem' }}>
          <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {isEs ? 'Diana Folicular Primaria' : 'Primary Target Axis'}
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
            {isEs ? 'DHT Folicular' : 'Follicular DHT'}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#7c3aed', fontWeight: 700 }}>
            {isEs ? 'Prolongación fase anágena' : 'Anagen phase prolongation'}
          </div>
        </div>
      </div>

      {/* ── Technical Specifications Grid ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.85rem' }}>
          <Beaker size={18} style={{ color: '#0d9488' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {isEs ? 'Dossier de Especificaciones Físico-Químicas' : 'Physicochemical Technical Dossier'}
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.65rem' }}>
          {techRows.map(r => {
            const Icon = r.icon;
            return (
              <div key={r.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '0.75rem 0.95rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <Icon size={16} style={{ color: '#0d9488', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.04em', marginBottom: '2px' }}>
                    {r.label}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 600, lineHeight: 1.4 }}>
                    {r.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SECTION: Clinical Evidence & Trichology Targets (#clinical-evidence) ── */}
      <div id="clinical-evidence" style={{ scrollMarginTop: '90px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} style={{ color: '#0d9488' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {isEs ? 'Evidencia Clínica y Dianas Moleculares Mapeadas' : 'Evidence-Mapped Trichology & Follicular Research'}
            </h3>
          </div>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0d9488', background: '#ccfbf1', padding: '3px 9px', borderRadius: '99px' }}>
            {isEs ? 'Datos Indexados en PubMed' : 'Peer-Reviewed Data'}
          </span>
        </div>
        <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6, marginBottom: '1rem' }}>
          {isEs
            ? 'Cada compuesto activo en este cosmecéutico cuenta con respaldo en dermatología y tricología molecular con dianas documentadas en el folículo piloso y la matriz dérmica del cuero cabelludo.'
            : 'Every active compound in this cosmeceutical is backed by peer-reviewed dermatology and trichology research with documented molecular targets across the hair follicle and scalp dermal matrix.'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { target: isEs ? 'Inhibición DHT' : 'DHT Inhibition', compound: 'Zinc PCA', mechanism: '5α-Reductase Blockade', outcome: isEs ? 'Suprime la miniaturización folicular en la papila dérmica reduciendo la DHT lipofílica sebácea.' : 'Suppresses follicular miniaturisation at dermal papilla by lowering lipophilic sebum dihydrotestosterone.', stat: '−65% Sebum DHT', pmid: '21514542' },
            { target: isEs ? 'Extensión Fase Anágena' : 'Anagen Extension', compound: isShampoo ? 'Caffeine' : 'Diosmin Complex', mechanism: 'Adenosine Antagonism / IGF-1', outcome: isEs ? 'Contrarresta el arresto del crecimiento inducido por andrógenos; estimula señalización IGF-1 en queratinocitos.' : 'Counters testosterone-induced growth arrest; upregulates IGF-1 signaling in matrix keratinocytes.', stat: '+32% Anagen Lifespan', pmid: '17214716' },
            { target: isEs ? 'Resistencia a Tracción' : 'Tensile Strength', compound: isEs ? 'Tropocolágeno Nativo de Pescado' : 'Native Freshwater Fish Tropocollagen', mechanism: 'Perifollicular ECM Support', outcome: isEs ? 'Aporta andamiaje fisiológico a la vaina folicular, reforzando la elasticidad y anclaje de la raíz (0% bovino).' : 'Provides physiological scaffolding to follicular sheath, reinforcing dermal papilla elasticity (0% bovine).', stat: '+24% Fiber Strength', pmid: '31574672' },
            { target: isEs ? 'Flujo Microvascular' : 'Microvascular Flow', compound: 'Niacinamide / Diosmin', mechanism: 'VEGF Upregulation', outcome: isEs ? 'Mejora la perfusión capilar del cuero cabelludo y el aporte de oxígeno y nutrientes al folículo anágeno.' : 'Enhances scalp microcirculation and oxygen-nutrient delivery to active anagen follicles.', stat: '+21% Follicular Density', pmid: '16029679' },
            { target: isEs ? 'Sellado de Cutícula' : 'Cuticle Integrity', compound: 'Keratin Hydrolysate', mechanism: 'Cortical Micro-Fissure Repair', outcome: isEs ? 'Rellena microfisuras en el córtex expuesto, protegiendo contra la rotura mecánica durante el cepillado.' : 'Fills structural cortex gaps in newly emerged anagen hair, protecting against mechanical breakage.', stat: '−47% Combing Force', pmid: '29744921' },
          ].map(item => (
            <div
              key={item.target}
              style={{
                padding: '0.95rem 1.25rem',
                background: '#ffffff',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    color: '#0d9488',
                    letterSpacing: '0.05em',
                    background: '#f0fdfa',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid #ccfbf1'
                  }}>
                    {item.target.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                    {item.compound}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {item.pmid && (
                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/${item.pmid}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '0.64rem',
                        fontWeight: 700,
                        color: '#0284c7',
                        background: '#eff6ff',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        border: '1px solid #bfdbfe',
                        textDecoration: 'none'
                      }}
                      title="View PubMed Reference"
                    >
                      <span>PMID: {item.pmid}</span>
                      <ExternalLink size={9} />
                    </a>
                  )}
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#16a34a',
                    background: '#f0fdf4',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: '1px solid #bbf7d0'
                  }}>
                    {item.stat}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                {isEs ? 'Diana Molecular: ' : 'Molecular Mechanism: '}<span style={{ color: '#475569' }}>{item.mechanism}</span>
              </div>

              <div style={{ fontSize: '0.80rem', color: '#334155', lineHeight: 1.55 }}>
                {item.outcome}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION: Full INCI Composition (#inci-dossier) ── */}
      <div id="inci-dossier" style={{ scrollMarginTop: '90px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Microscope size={18} style={{ color: '#0d9488' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {isEs ? 'Composición INCI Declarada y Análisis Clínico' : 'Full INCI Composition & Clinical Analysis'}
            </h3>
          </div>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#166534', background: '#f0fdf4', padding: '3px 9px', borderRadius: '99px', border: '1px solid #bbf7d0' }}>
            {ingredients.length} {isEs ? 'Ingredientes Declarados' : 'Declared Ingredients'}
          </span>
        </div>
        <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.85rem', lineHeight: 1.6 }}>
          {isEs
            ? 'Declaración completa bajo Nomenclatura Internacional de Ingredientes Cosméticos (INCI) conforme al Reglamento Europeo 1223/2009. Los activos clínicos y péptidos se priorizan al inicio para evaluación médica de dianas.'
            : 'Complete International Nomenclature of Cosmetic Ingredients (INCI) declaration as per EU Cosmetics Regulation 1223/2009. Key clinical bioactives and peptides are prioritized first for medical evaluation.'}
        </p>

        {/* INCI Filters (Horizontally scrollable on mobile) */}
        <div style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          flexWrap: 'nowrap',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          paddingBottom: '6px',
          marginBottom: '0.85rem'
        }}>
          <button
            type="button"
            onClick={() => setInciFilter('key_active')}
            style={{
              flexShrink: 0,
              fontSize: '0.66rem',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: '99px',
              border: '1.5px solid',
              cursor: 'pointer',
              background: inciFilter === 'key_active' ? '#0d9488' : '#f0fdfa',
              color: inciFilter === 'key_active' ? '#ffffff' : '#0d9488',
              borderColor: '#0d9488'
            }}
          >
            ⭐ {isEs ? 'Activos Clínicos Clave' : 'Key Clinical Actives'} ({keyActives.length})
          </button>
          <button
            type="button"
            onClick={() => setInciFilter('all')}
            style={{
              flexShrink: 0,
              fontSize: '0.66rem',
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: '99px',
              border: '1.5px solid',
              cursor: 'pointer',
              background: inciFilter === 'all' ? '#0f172a' : '#ffffff',
              color: inciFilter === 'all' ? '#ffffff' : '#64748b',
              borderColor: inciFilter === 'all' ? '#0f172a' : '#e2e8f0'
            }}
          >
            {isEs ? 'Todos los Ingredientes' : 'All Ingredients'} ({ingredients.length})
          </button>
          {Object.entries(groupCounts)
            .filter(([group]) => group !== 'key_active')
            .map(([group, count]) => {
              const meta = INCI_GROUP_META[group] || INCI_GROUP_META.functional;
              return (
                <button
                  key={group}
                  type="button"
                  onClick={() => setInciFilter(group)}
                  style={{
                    flexShrink: 0,
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: '99px',
                    border: '1.5px solid',
                    cursor: 'pointer',
                    background: inciFilter === group ? meta.color : meta.bg,
                    color: inciFilter === group ? '#ffffff' : meta.color,
                    borderColor: meta.color
                  }}
                >
                  {isEs ? meta.labelEs : meta.labelEn} ({count})
                </button>
              );
            })}
        </div>

        <div>
          {filteredIngredients.map((ing, i) => (
            <InciRow
              key={ing.inci_name || i}
              ing={ing}
              index={inciFilter === 'all' ? i : ingredients.indexOf(ing)}
              lang={lang}
            />
          ))}
        </div>

        <div style={{ marginTop: '1rem', padding: '0.65rem 0.85rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.70rem', color: '#64748b', lineHeight: 1.5 }}>
          <strong style={{ color: '#475569' }}>{isEs ? 'Aviso Regulatorio UE:' : 'EU Regulatory Notice:'}</strong>{' '}
          {isEs
            ? 'Declaración completa bajo el Artículo 19(1)(g) del Reglamento CE 1223/2009. Registro en CPNP activo. Alérgenos de fragancia declarados individualmente a concentraciones ≥0.001% (enjuague) / ≥0.0001% (leave-on).'
            : 'Full INCI declared per Article 19(1)(g) of EU Cosmetics Regulation 1223/2009. CPNP notified. Fragrance allergens at ≥0.001% (rinse-off) / ≥0.0001% (leave-on) individually declared.'}
        </div>
      </div>

      {/* ── SECTION: Clinical Application Protocol (#application-protocol) ── */}
      <div id="application-protocol" style={{ scrollMarginTop: '90px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardList size={18} style={{ color: '#0d9488' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {isEs ? 'Protocolo de Aplicación y Pautas Clínicas' : 'Clinical Application Protocol & Guidelines'}
            </h3>
          </div>
          {applicationProtocol?.frequency && (
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0f766e', background: '#ccfbf1', padding: '3px 9px', borderRadius: '99px' }}>
              {applicationProtocol.frequency}
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ padding: '0.75rem 0.95rem', background: '#f0fdfa', borderRadius: '8px', border: '1px solid #99f6e4' }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#0d9488', marginBottom: '2px' }}>
              {isEs ? 'FRECUENCIA DE USO' : 'FREQUENCY OF USE'}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
              {applicationProtocol?.frequency || '3–4× / Week'}
            </div>
          </div>
          <div style={{ padding: '0.75rem 0.95rem', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#2563eb', marginBottom: '2px' }}>
              {isEs ? 'DURACIÓN MÍNIMA RECOMENDADA' : 'RECOMMENDED CYCLE DURATION'}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
              {applicationProtocol?.duration_of_use || (isEs ? 'Mínimo 12 Semanas' : 'Minimum 12 Weeks')}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {(applicationProtocol?.steps || [
            { step: 1, instruction: isEs ? 'Aplicar sobre el cuero cabelludo húmedo tras lavado inicial.' : 'Apply generously to wet scalp following initial wash.', phase: isEs ? 'APLICACIÓN' : 'APPLICATION' },
            { step: 2, instruction: isEs ? 'Masajear suavemente con las yemas de los dedos durante 2–3 minutos para estimular la microcirculación.' : 'Massage gently into scalp for 2–3 minutes to promote microvascular flow.', phase: isEs ? 'MASAJE' : 'MASSAGE', duration: '2–3 min' },
            { step: 3, instruction: isEs ? 'Dejar actuar entre 3 y 5 minutos antes de aclarar para permitir la penetración de los activos biológicos.' : 'Leave in contact for 3–5 minutes for trans-epidermal bio-active delivery.', phase: isEs ? 'TIEMPO DE ACCIÓN' : 'DWELL TIME', duration: '3–5 min' },
            { step: 4, instruction: isEs ? 'Aclarar abundantemente con agua tibia o fresca (≤38°C) para favorecer el sellado de la cutícula capilar.' : 'Rinse thoroughly with lukewarm or cool water (≤38°C) to seal hair cuticles.', phase: isEs ? 'ACLARADO' : 'RINSE', temp: '≤38°C' }
          ]).map((step, i, arr) => (
            <ApplicationStepItem
              key={step.step || i}
              step={step}
              index={i}
              isLast={i === (arr.length - 1)}
              lang={lang}
            />
          ))}
        </div>

        {applicationProtocol?.professional_notes?.length > 0 && (
          <div style={{ marginTop: '1.25rem', padding: '0.9rem 1.1rem', background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', borderRadius: '10px' }}>
            <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
              {isEs ? 'NOTAS CLÍNICAS PARA EL TRICÓLOGO / DERMATÓLOGO' : 'PROFESSIONAL / TRICHOLOGIST CLINICAL NOTES'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {applicationProtocol.professional_notes.map((note, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <CheckCircle2 size={13} style={{ color: '#0d9488', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>{note}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION: Complete Colway Hair System (#colway-system) ── */}
      <div id="colway-system" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1a2e4a 100%)',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.15)'
      }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#5eead4', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {isEs ? 'COMPLETA EL SISTEMA INTEGRAL COLWAY' : 'COMPLETE THE COLWAY 2-STEP SYSTEM'}
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '3px 0' }}>
            {isShampoo
              ? (isEs ? 'Paso 2: Acondicionador Fortalecedor con Colágeno Nativo' : 'Step 2: Strengthening Conditioner with Native Collagen')
              : (isEs ? 'Paso 1: Champú Densificante con Diosmina y Cafeína' : 'Step 1: Densifying Shampoo with Diosmin & Caffeine')}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.5 }}>
            {isEs
              ? 'Aplicados de forma coordinada 3–4×/semana potencian el anclaje folicular en cuero cabelludo y el sellado de cutícula en el tallo expuesto.'
              : 'Used synergistically 3–4×/week to synchronize dermal follicular stimulation with shaft cortex repair.'}
          </div>
        </div>
        <Link
          href={`/p/${isShampoo ? 'colway-strengthening-conditioner' : 'colway-strengthening-shampoo'}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 18px',
            borderRadius: '8px',
            background: '#0d9488',
            color: '#ffffff',
            fontSize: '0.80rem',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(13, 148, 136, 0.3)'
          }}
        >
          {isEs ? 'Ver Monografía Complementaria' : 'View Companion Monograph'} <ChevronRight size={14} />
        </Link>
      </div>

      {/* ── SECTION: Clinical Safety & Patch Testing (#contraindications-section) ── */}
      <div id="contraindications-section" style={{ scrollMarginTop: '90px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.85rem' }}>
          <AlertTriangle size={18} style={{ color: '#d97706' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {isEs ? 'Seguridad Clínica, Precauciones y Test de Parche' : 'Clinical Safety, Precautions & Patch Testing'}
          </h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {(warnings.length > 0 ? warnings : [
            isEs ? 'Uso exclusivo externo/tópico. Evitar contacto directo con los ojos; en caso de contacto accidental, aclarar inmediatamente con abundante agua.' : 'For external topical use only. Avoid contact with eyes; rinse immediately with copious water if contact occurs.',
            isEs ? 'Se aconseja realizar un test epicutáneo de parche (patch test) 48 horas antes de la primera aplicación en pacientes con terreno atópico o cuero cabelludo sensible.' : 'Perform an occlusive 48-hour patch test prior to first application in patients with sensitive scalp or history of contact allergy.',
            isEs ? 'No aplicar sobre cuero cabelludo con heridas abiertas, dermatitis seborreica en fase exudativa aguda o placas psoriásicas no controladas.' : 'Do not apply to scalps with open lesions, active acute eczema, or severe uncontrolled psoriatic plaques without dermatologist clearance.',
            isEs ? 'Mantener fuera del alcance de niños menores de 3 años. Conservar en lugar fresco protegido de la luz solar directa.' : 'Keep out of reach of children under 3 years. Store in a cool dry place protected from direct heat.',
            isEs ? 'Suspender la aplicación si se manifiesta eritema persistente, prurito severo o signos de dermatitis de contacto.' : 'Discontinue use if persistent erythema, severe pruritus, or signs of allergic contact dermatitis develop.'
          ]).map((w, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <AlertTriangle size={14} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.80rem', color: '#374151', lineHeight: 1.55 }}>
                {typeof w === 'string' ? w : w.text}
              </span>
            </div>
          ))}
        </div>

        {/* Dermatological Patch Test Protocol (ICDRG) */}
        <div style={{ marginTop: '1.25rem', padding: '0.9rem 1.15rem', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#d97706', marginBottom: '0.45rem', letterSpacing: '0.04em' }}>
            {isEs ? 'PROTOCOLO DE TEST DE PARCHE EPICUTÁNEO (ICDRG)' : 'DERMATOLOGICAL EPICUTANEOUS PATCH TEST PROTOCOL (ICDRG)'}
          </div>
          {[
            isEs ? 'Aplicar 0.05 mL del producto sobre piel sana del antebrazo interno (área de 2×2 cm).' : 'Apply 0.05 mL of product to healthy inner forearm skin (2×2 cm test site).',
            isEs ? 'Mantener bajo oclusión durante 48 horas sin mojar el área de prueba.' : 'Keep under occlusion for 48 hours without washing the test area.',
            isEs ? 'Efectuar lecturas a las 48 horas y 72 horas (o 96h si se sospecha reacción retardada).' : 'Read reaction at 48 hours and 72 hours (or 96 hours if delayed sensitivity suspected).',
            isEs ? 'Graduación según escala ICDRG: 0 (negativo) → 3+ (reacción ampollar/positiva fuerte). Contraindicado si ≥1+.' : 'Score per ICDRG scale: 0 (negative) → 3+ (vesicular strong positive). Contraindicated if score ≥1+.'
          ].map((pt, i) => (
            <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#d97706', flexShrink: 0 }}>{i + 1}.</span>
              <span style={{ fontSize: '0.74rem', color: '#92400e', lineHeight: 1.5 }}>{pt}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

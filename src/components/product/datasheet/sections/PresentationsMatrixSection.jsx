"use client";

import React from 'react';
import { 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  ChevronDown, 
  ArrowUpRight, 
  FlaskConical 
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';

export default function PresentationsMatrixSection({
  product,
  slug,
  lang,
  t,
  isCorporateService,
  isDiagnosticKit,
  isSolventProduct,
  isSupplementProduct,
  isCosmeticProduct,
  isPenOrCart,
  isSprayFormat,
  isCartridgeFormat,
  isPenFormat,
  isPenAndCartridgeEcosystem,
  distinctCartridgeFmt,
  distinctPenFmt,
  isMultiSupplierMode,
  suppliersList,
  activeSupplierId,
  setActiveSupplierId,
  availableFormats,
  activeFormatId,
  setActiveFormatId,
  rawFormats,
  filteredStrengths,
  sortedStrengths,
  selectedStrengthId,
  setSelectedStrengthId,
  selectedStrength,
  packUnits,
  setPackUnits,
  realKitSavings,
  displaySupplierName,
  matrixRows,
  getReconstitutionVolume
}) {
  if (isCorporateService) return null;

  return (
    <>
      {/* ── Multi-Formulation / Laboratory Switcher (Golden Rule #28 & #4) ── */}
      {!product?.isSingleSupplierLocked && Array.isArray(product?.availableSuppliers) && product.availableSuppliers.length > 1 && (
        <div style={{
          margin: '0 0 1.25rem 0',
          padding: '12px 16px',
          borderRadius: '10px',
          background: 'var(--surface-alt, #f8fafc)',
          border: '1px solid var(--border, #e2e8f0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FlaskConical size={16} color="#003666" />
            <span style={{ fontSize: '0.80rem', fontWeight: 800, color: 'var(--text-main, #0f172a)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {lang === 'es' ? 'Presentaciones de Laboratorio Certificadas:' : 'Certified Laboratory Formulations:'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {product.availableSuppliers.map(supp => {
              const isCurrent = (product.activeSupplierId || '').includes(supp.id.replace('supplier-', '')) || (product.supplierId || '').includes(supp.id.replace('supplier-', ''));
              const label = supp.isPen
                ? (lang === 'es' ? '🖊️ Bolígrafo Precargado SubQ (Magenta)' : '🖊️ Pre-filled SubQ Pen (Magenta)')
                : supp.isSpray
                  ? (lang === 'es' ? '👃 Spray Nasal Dosificado' : '👃 Metered Nasal Spray')
                  : (lang === 'es' ? '💉 Vial Liofilizado SubQ' : '💉 Lyophilized SubQ Vial');
              return (
                <a
                  key={supp.id}
                  href={`/p/${encodeURIComponent(slug || product?.slug || '')}?supplier=${supp.id}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '0.80rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                    background: isCurrent ? '#003666' : '#ffffff',
                    color: isCurrent ? '#ffffff' : '#334155',
                    border: isCurrent ? '1px solid #003666' : '1px solid #cbd5e1',
                    boxShadow: isCurrent ? '0 2px 4px rgba(0,54,102,0.15)' : 'none'
                  }}
                >
                  {label}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Block 1: Batch Availability & Presentations Matrix (Harmonized Navy Header) ── */}
      <section id="presentations-matrix" className="pds-section-card">
        <div className="pds-section-header">
          <div className="pds-section-header-left">
            <div className="pds-section-header-shield">
              <Layers size={22} />
            </div>
            <div className="pds-section-header-titles">
              <div className="pds-section-header-meta-row">
                <span className="pds-section-header-category">
                  {lang === 'es' ? 'DISPONIBILIDAD DE LOTE Y PRESENTACIONES' : 'BATCH AVAILABILITY & PRESENTATIONS'}
                </span>
                <span className="pds-section-badge">
                  <CheckCircle2 size={11} /> {t?.clinicalCompendium || (lang === 'es' ? 'COMPENDIO CLÍNICO' : 'CLINICAL COMPENDIUM')}
                </span>
              </div>
              <h3 className="pds-section-header-title">
                {t?.presentationsMatrix || 'Batch Availability & Presentations Matrix'}
              </h3>
            </div>
          </div>

          <div className="pds-section-header-right">
            <div className="pds-section-cert-badge">
              <Sparkles size={14} color="#38bdf8" />
              <span>{t?.allApprovedPresentations || 'All Verified Presentations & Formats'}</span>
            </div>
          </div>
        </div>

        <div className="pds-section-card-body">

          {/* Multi-Supplier Laboratory Selector (Rendered ONLY if product has multiple verified suppliers) */}
          {isMultiSupplierMode && (
            <div className="pds-lab-filter-wrap" style={{ marginBottom: '18px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={15} color="#003666" />
                  {t?.verifiedLaboratories || 'Verified Manufacturing Laboratories:'}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {suppliersList.length} {t?.verifiedSourcesAvailable || 'verified sources available'}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setActiveSupplierId('all')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: activeSupplierId === 'all' ? 700 : 500,
                    background: activeSupplierId === 'all' ? '#003666' : '#ffffff',
                    color: activeSupplierId === 'all' ? '#ffffff' : '#334155',
                    border: activeSupplierId === 'all' ? '1px solid #003666' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  🌐 {t?.allLaboratoriesOverview || 'All Laboratories (Overview)'}
                </button>

                {suppliersList.map(s => {
                  const isSelected = activeSupplierId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setActiveSupplierId(s.id);
                        const suppFormatIds = Array.isArray(s.formats) ? s.formats : [];
                        const compatFormats = rawFormats.filter(f => suppFormatIds.includes(f.id));
                        if (compatFormats.length > 0 && !compatFormats.some(f => f.id === activeFormatId)) {
                          setActiveFormatId(compatFormats[0].id);
                        }
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: isSelected ? 700 : 500,
                        background: isSelected ? '#003666' : '#ffffff',
                        color: isSelected ? '#ffffff' : '#334155',
                        border: isSelected ? '1px solid #003666' : '1px solid #cbd5e1',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Administration Format Tabs */}
          <div className="pds-format-selector-field">
            <label className="pds-format-selector-label" htmlFor="format-select">
              {t?.selectFormat || 'Presentation Format'}
            </label>
            <div className="pds-format-selector-wrap">
              <span className="pds-format-selector-icon" aria-hidden="true">
                {(() => {
                  const af = availableFormats.find(f => f.id === activeFormatId);
                  if (!af) return '🧪';
                  if (af.id.includes('spray')) return '💨';
                  if (af.id.includes('pen')) return '🖊️';
                  if (af.id.includes('cartridge')) return '💉';
                  if (af.id.includes('capsule') || af.id.includes('tablet')) return '💊';
                  if (af.id.includes('test') || af.id.includes('blood')) return '🩸';
                  if (isCosmeticProduct) return af.id.includes('bottle') ? '🧴' : af.id.includes('tube') ? '🧲' : '🧪';
                  return '🧪';
                })()}
              </span>
              <select
                id="format-select"
                className="pds-format-select-native"
                value={activeFormatId}
                onChange={(e) => {
                  const newFmtId = e.target.value;
                  setActiveFormatId(newFmtId);
                  const fmt = availableFormats.find(f => f.id === newFmtId);
                  if (fmt) {
                    const compat = sortedStrengths.filter(s => !fmt.strengths || fmt.strengths.includes(s.id));
                    if (compat.length > 0 && !compat.some(s => s.id === selectedStrengthId)) {
                      setSelectedStrengthId(compat[0].id);
                    }
                  }
                  triggerHaptic('selection');
                }}
              >
                {availableFormats.map(fmt => {
                  const isPen = fmt.id.includes('pen');
                  const isCart = fmt.id.includes('cartridge');
                  const isSpray = fmt.id.includes('spray');
                  const isCapsule = fmt.id.includes('capsule') || fmt.id.includes('tablet');
                  const isDiag = fmt.id.includes('test') || fmt.id.includes('blood');
                  let subtitle = t?.formatSubVial || 'Lyophilized SubQ Cake';
                  if (isCosmeticProduct) {
                    subtitle = (fmt.volume || product?.volume || '250 mL') + ' — Topical';
                  } else if (isDiag) {
                    subtitle = 'DBS Diagnostic Kit';
                  } else if (isPen) {
                    subtitle = t?.formatSubPen || 'Multi-Dose Dial Device';
                  } else if (isCart) {
                    subtitle = t?.formatSubCart || '3 mL Refill Cartridge';
                  } else if (isSpray) {
                    subtitle = t?.formatSubSpray || 'Intranasal Spray Device';
                  } else if (isCapsule) {
                    subtitle = t?.formatSubOral || 'Oral Formulation';
                  }

                  return (
                    <option key={fmt.id} value={fmt.id}>
                      {fmt.name} — {subtitle}
                    </option>
                  );
                })}
              </select>
              <ChevronDown size={16} className="pds-format-select-chevron" />
            </div>
            {availableFormats.length > 1 && (
              <span className="pds-format-count-hint">
                {availableFormats.length} {t?.formatsAvailable || 'formats available'}
              </span>
            )}
          </div>

          {/* Strengths Chips */}
          <div className="pds-strengths-wrapper">
            <div className="pds-strengths-label-row">
              <span className="pds-sublabel">
                {isDiagnosticKit 
                  ? (lang === 'es' ? 'Presentación de Kit / Unidades:' : 'Kit Format / Sample Units:') 
                  : (t?.selectAvailableStrength || 'Select Available Strength / Dose:')}
              </span>
              <span className="pds-count-badge">{filteredStrengths.length} {t?.optionsAvailable || 'options available'}</span>
            </div>

            <div className="pds-strength-chips">
              {filteredStrengths.map(st => {
                const isSelected = st.id === selectedStrengthId;
                return (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStrengthId(st.id)}
                    className={`pds-strength-chip ${isSelected ? 'selected' : ''}`}
                  >
                    <span className="pds-chip-dot" />
                    <strong>{st.name}</strong>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Packaging / Volume Tier Selector */}
          {!isDiagnosticKit && !isSolventProduct && !isSupplementProduct && (
            <div className="pds-pack-tier-section" style={{
              marginTop: '1.15rem',
              padding: '0.95rem 1rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.8) 100%)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {lang === 'es' ? '📦 Formato de Presentación y Suministro:' : '📦 Packaging Tier & Batch Sizing:'}
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '6px' }}>
                  {packUnits === 10 ? (
                    realKitSavings?.hasDiscount 
                      ? (isPenOrCart
                          ? (lang === 'es' ? `Caja 10 Unidades (Ahorro Real -${realKitSavings.discountPct}%)` : `10-Unit Box (Verified Save -${realKitSavings.discountPct}%)`)
                          : (lang === 'es' ? `Caja 10 Viales (Ahorro Real -${realKitSavings.discountPct}%)` : `10-Vial Kit (Verified Save -${realKitSavings.discountPct}%)`))
                      : (isPenOrCart
                          ? (lang === 'es' ? 'Caja 10 Unidades (Kit Suministro B2B)' : '10-Unit Delivery Box (B2B Kit)')
                          : (lang === 'es' ? 'Caja 10 Viales (Kit Mayorista B2B)' : '10-Vial Box (Wholesale Kit)'))
                  ) : (
                    isPenOrCart
                      ? (lang === 'es' ? 'Dispositivo / Cartucho Individual' : 'Single Device / Refill')
                      : (lang === 'es' ? 'Unidad Individual' : 'Single Unit')
                  )}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {[
                  { 
                    count: 1, 
                    label: lang === 'es' ? '1 Unidad' : '1 Unit', 
                    badge: null, 
                    sub: isPenFormat
                      ? (lang === 'es' ? 'Bolígrafo Inyector Multidosis' : 'Multi-Dose Pen Device')
                      : isCartridgeFormat
                        ? (lang === 'es' ? 'Cartucho de Recambio 3 mL' : '3 mL Refill Cartridge')
                        : (lang === 'es' ? 'Vial Individual Liofilizado' : 'Standard Single Lyophilized Vial')
                  },
                  { 
                    count: 10, 
                    label: lang === 'es' ? 'Caja 10 Unidades' : '10 Units Box', 
                    badge: realKitSavings?.hasDiscount ? `-${realKitSavings.discountPct}%` : (lang === 'es' ? 'Kit B2B' : 'B2B Kit'), 
                    sub: realKitSavings?.hasDiscount 
                      ? (lang === 'es' ? 'Ahorro real de escala' : 'Verified bulk savings')
                      : (isPenOrCart
                          ? (lang === 'es' ? 'Kit Completo de 10 Unidades' : 'Full 10-Unit Supply Box')
                          : (lang === 'es' ? 'Kit Completo de 10 Viales' : 'Full 10-Vial Kit Box'))
                  }
                ].map(tier => {
                  const isSelected = packUnits === tier.count;
                  return (
                    <button
                      key={tier.count}
                      type="button"
                      onClick={() => {
                        setPackUnits(tier.count);
                        triggerHaptic('selection');
                      }}
                      style={{
                        padding: '0.75rem 0.65rem',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #003666' : '1px solid #cbd5e1',
                        background: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                        boxShadow: isSelected ? '0 4px 12px rgba(0, 54, 102, 0.12)' : 'none',
                        cursor: 'pointer',
                        textAlign: 'center',
                        position: 'relative',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {tier.badge && (
                        <span style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '8px',
                          background: '#2563eb',
                          color: '#ffffff',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '1px 7px',
                          borderRadius: '10px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.12)'
                        }}>
                          {tier.badge}
                        </span>
                      )}
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: isSelected ? '#003666' : '#1e293b' }}>
                        {tier.label}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: isSelected ? '#2563eb' : '#64748b', marginTop: '3px', fontWeight: 600 }}>
                        {tier.sub}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Verified Batch Quality note */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.72rem',
                color: '#64748b',
                marginTop: '0.65rem',
                paddingTop: '0.5rem',
                borderTop: '1px dashed #cbd5e1'
              }}>
                <span>
                  <strong>{lang === 'es' ? 'Especificación de Lote:' : 'Batch Specification:'}</strong>{' '}
                  {packUnits === 10 
                    ? (isPenOrCart
                        ? (lang === 'es' ? 'Caja institucional de 10 unidades multidosis selladas' : 'Institutional kit of 10 sealed multi-dose units')
                        : (lang === 'es' ? 'Caja institucional de 10 viales liofilizados al vacío' : 'Institutional kit of 10 vacuum-sealed lyophilized vials'))
                    : (isPenOrCart
                        ? (lang === 'es' ? 'Dispositivo clínico multidosis / cartucho 3 mL sellado' : 'Clinical multi-dose dial device / sealed 3 mL cartridge')
                        : (lang === 'es' ? 'Vial clínico individual liofilizado' : 'Individual clinical lyophilized vial'))}
                </span>
                <span style={{ color: '#0f172a', fontWeight: 700 }}>
                  Dual RP-HPLC ≥ 99.0% Verified
                </span>
              </div>
            </div>
          )}

          {/* Refill Cross-Format Callouts */}
          {isPenAndCartridgeEcosystem && distinctCartridgeFmt && activeFormatId !== distinctCartridgeFmt.id && (
            <div className="pds-refill-callout pds-refill-to-cartridge">
              <div className="pds-refill-callout-icon">💡</div>
              <div className="pds-refill-callout-content">
                <strong>{lang === 'es' ? '¿Ya dispones del aplicador Dial Pen?' : 'Already have the reusable Dial Pen device?'}</strong>
                <p>
                  {lang === 'es'
                    ? 'Ahorra en tus ciclos adquiriendo exclusivamente el Cartucho de Recambio (Refill 3 mL). El dispositivo aplicador es reutilizable y compatible con los recambios.'
                    : 'Save on ongoing therapy by purchasing the 3 mL Refill Cartridge. The pen device is fully reusable and accepts replacement cartridges.'}
                </p>
              </div>
              <button
                type="button"
                className="pds-refill-switch-btn"
                onClick={() => {
                  setActiveFormatId(distinctCartridgeFmt.id);
                  triggerHaptic('selection');
                }}
              >
                <span>{lang === 'es' ? 'Ver Cartucho de Recambio' : 'Switch to Refill Cartridge'}</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          )}

          {isPenAndCartridgeEcosystem && distinctPenFmt && activeFormatId !== distinctPenFmt.id && (
            <div className="pds-refill-callout pds-refill-to-pen">
              <div className="pds-refill-callout-icon">🔄</div>
              <div className="pds-refill-callout-content">
                <strong>{lang === 'es' ? 'Cartucho de Recambio 3 mL (Refill)' : '3 mL Replacement Cartridge (Refill)'}</strong>
                <p>
                  {lang === 'es'
                    ? 'Este cartucho de vidrio pre-llenado requiere un bolígrafo dosificador compatible para su administración. Si es tu primer tratamiento o no tienes el aplicador, selecciona el Pen completo.'
                    : 'This pre-filled glass cartridge requires a compatible reusable dial pen for administration. If this is your first cycle or you need the device, select the Pre-filled Pen.'}
                </p>
              </div>
              <button
                type="button"
                className="pds-refill-switch-btn"
                onClick={() => {
                  setActiveFormatId(distinctPenFmt.id);
                  triggerHaptic('selection');
                }}
              >
                <span>{lang === 'es' ? 'Ver Bolígrafo Completo' : 'View Complete Pen Device'}</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          )}

          {/* Intranasal Spray Callout */}
          {isSprayFormat && (
            <div className="pds-spray-callout">
              <div className="pds-spray-callout-icon">💨</div>
              <div className="pds-spray-callout-content">
                <strong>{lang === 'es' ? 'Sistema de Atomización Mucosal Intranasal (Sin Agujas)' : 'Intranasal Mucosal Atomization System (Needle-Free)'}</strong>
                <p>
                  {lang === 'es'
                    ? 'Formulación líquida isotónica calibrada para absorción directa a través de la mucosa nasal (vía olfatoria y trigémino direct-to-brain). Válvula dosificadora de 0.1 mL por spray. Cero reconstitución BAC.'
                    : 'Calibrated isotonic formulation engineered for direct mucosal absorption (olfactory and trigeminal direct-to-brain pathway). Sterile metered pump delivers 0.1 mL per spray. Zero BAC mixing required.'}
                </p>
              </div>
              <div className="pds-spray-callout-badge">
                <span>{lang === 'es' ? '0.1 mL / spray calibrado' : '0.1 mL metered puff'}</span>
              </div>
            </div>
          )}

          {/* Active Specification Detail Box */}
          <div className="pds-selected-detail-card">
            <div className="pds-detail-grid">
              <div className="pds-detail-col">
                <span className="pds-dlabel">{isDiagnosticKit ? (lang === 'es' ? 'Contenido del Kit' : 'Kit Contents') : isCosmeticProduct ? (lang === 'es' ? 'Volumen y Envase' : 'Volume & Packaging') : isSupplementProduct ? (lang === 'es' ? 'Contenido Neto / Envase' : 'Net Content / Packaging') : (t?.activeContent || 'Active Content')}</span>
                <span className="pds-dval font-bold text-sky-950">
                  {selectedStrength?.name || (isCosmeticProduct ? '250 mL' : isSolventProduct ? '30 mL' : isDiagnosticKit ? '1 Test / Kit' : isSupplementProduct ? '60 Cápsulas HPMC' : '10 mg')}
                </span>
              </div>
              <div className="pds-detail-col">
                <span className="pds-dlabel">{isDiagnosticKit ? (lang === 'es' ? 'Toma de Muestra' : 'Sample Collection') : isSupplementProduct ? (lang === 'es' ? 'Vía y Posología' : 'Route & Administration') : (t?.adminRoute || 'Administration Route')}</span>
                <span className="pds-dval">
                  {isCosmeticProduct
                    ? (lang === 'es' ? 'Uso Tópico Capilar (Cuero Cabelludo y Tallo)' : 'Topical Cosmeceutical (Scalp & Hair Shaft)')
                    : isSolventProduct 
                    ? (lang === 'es' ? 'Vehículo de Reconstitución (No Inyección Directa)' : 'Reconstitution Vehicle (Not for Direct Injection)')
                    : isDiagnosticKit
                      ? (lang === 'es' ? 'Punción Capilar en Dedo (3 gotas en tarjeta DBS)' : 'Capillary Fingerstick (3 spots on DBS Card)')
                      : isSupplementProduct
                        ? (lang === 'es' ? 'Vía Oral · Ingesta con Agua (Junto a comidas)' : 'Oral Route · Take with Water (With meals)')
                        : isSprayFormat
                          ? (lang === 'es' ? 'Atomización Transmucosa Intranasal (Sin Agujas)' : 'Intranasal Transmucosal Atomization (Needle-Free)')
                          : isCartridgeFormat
                            ? (lang === 'es' ? 'Cartucho de Recambio 3 mL (Bolígrafo Reutilizable)' : '3 mL Refill Cartridge (Reusable Dial Pen)')
                            : isPenFormat
                              ? (lang === 'es' ? 'Inyección Subcutánea Micro-Dial (Selector Clics)' : 'Subcutaneous Micro-Dial Injection (Click Dial)')
                              : (t?.subqPeriumbilical || 'Subcutaneous (SubQ) Periumbilical')}
                </span>
              </div>
              <div className="pds-detail-col">
                <span className="pds-dlabel">
                  {isCosmeticProduct
                    ? (lang === 'es' ? 'Mecanismo y Modo de Empleo' : 'Mechanism & Contact Time')
                    : isSolventProduct 
                    ? (lang === 'es' ? 'Función Diluyente' : 'Diluent Function')
                    : isDiagnosticKit
                      ? (lang === 'es' ? 'Metodología Analítica' : 'Analytical Methodology')
                      : isSupplementProduct
                        ? (lang === 'es' ? 'Formato y Liberación' : 'Capsule Delivery')
                        : isSprayFormat
                          ? (lang === 'es' ? 'Mecanismo de Atomización' : 'Atomization Mechanism')
                          : isCartridgeFormat
                            ? (lang === 'es' ? 'Compatibilidad de Recambio' : 'Refill Compatibility')
                            : isPenFormat
                              ? (t?.deviceDelivery || 'Device Delivery') 
                              : (t?.recommendedRecon || 'Recommended Reconstitution')}
                </span>
                <span className="pds-dval">
                  {isCosmeticProduct ? (
                    <>
                      {lang === 'es' ? 'Inhibición DHT + Aporte Colágeno Nativo' : 'DHT Inhibition + Native Collagen Scaffolding'}
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        → {lang === 'es' ? 'Aplicar en cabello húmedo · Dejar actuar 3–5 min · Aclarar ≤38°C' : 'Apply to wet scalp · 3–5 min contact time · Rinse ≤38°C'}
                      </span>
                    </>
                  ) : isSolventProduct ? (
                    <>
                      {lang === 'es' ? 'Solvente de Reconstitución Multidosis' : 'Universal Multi-Dose Peptide Diluent'}
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        → {lang === 'es' ? 'Diluir 1.0 – 3.0 mL en viales liofilizados' : 'Dilute 1.0 – 3.0 mL into lyophilized vials'}
                      </span>
                    </>
                  ) : isDiagnosticKit ? (
                    <>
                      {lang === 'es' ? 'Ensayo Cíclico Enzimático (Espectrofotometría)' : 'Enzymatic Cyclic Assay (Spectrophotometry)'}
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        → {lang === 'es' ? 'Rango Lineal 5.0–60.0 µmol/L · LoD: 0.23 µmol/L' : 'Linear Range 5.0–60.0 µmol/L · LoD: 0.23 µmol/L'}
                      </span>
                    </>
                  ) : isSupplementProduct ? (
                    <>
                      {lang === 'es' ? 'Cápsulas Gastrorresistentes HPMC' : 'Acid-Resistant Delayed-Release HPMC'}
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        → {lang === 'es' ? 'Sin reconstitución · Absorción entérica protegida' : 'Zero reconstitution · Enteric protected absorption'}
                      </span>
                    </>
                  ) : isSprayFormat ? (
                    <>
                      {lang === 'es' ? 'Válvula Dosificadora 0.1 mL / spray' : 'Metered Mucosal Pump (0.1 mL / spray)'}
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        → {lang === 'es' ? 'Absorción directa Nose-to-Brain (Sin dilución BAC)' : 'Direct Nose-to-Brain Pathway (No BAC mixing)'}
                      </span>
                    </>
                  ) : isCartridgeFormat ? (
                    <>
                      {lang === 'es' ? 'Cartucho Sellado de Recambio 3 mL' : 'Pre-dissolved 3 mL Refill Cartridge'}
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        → {lang === 'es' ? 'Inserción directa en bolígrafo dosificador (0% mezcla BAC)' : 'Direct insertion into dial pen (Zero BAC mixing)'}
                      </span>
                    </>
                  ) : isPenFormat ? (
                    <>
                      {t?.preDissolvedLiquid || 'Pre-dissolved SubQ Liquid (Ready to Use)'}
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        → {t?.directDialInjection || 'Direct multi-dose dial injection (no BAC reconstitution required)'}
                      </span>
                    </>
                  ) : (
                    <>
                      {getReconstitutionVolume(selectedStrength?.name).volume} mL Bacteriostatic Water (BAC)
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        → {getReconstitutionVolume(selectedStrength?.name).concentration} mg/mL {t?.finalConcentration || 'final concentration'}
                      </span>
                    </>
                  )}
                </span>
              </div>
              <div className="pds-detail-col">
                <span className="pds-dlabel">{isDiagnosticKit ? (lang === 'es' ? 'Regulación y Calidad' : 'Regulatory Standard') : isSupplementProduct ? (lang === 'es' ? 'Excipientes y Pureza' : 'Vehicle & Quality') : (t?.lyophilizationExcipient || 'Lyophilization / Excipient')}</span>
                <span className="pds-dval">
                  {isSolventProduct
                    ? '0.9% Benzyl Alcohol USP (Antimicrobial Preservative)'
                    : isDiagnosticKit
                      ? 'CE-IVDR (UE 2017/746) · ISO 15189'
                      : isSupplementProduct
                        ? (lang === 'es' ? '100% Vegano · Sin Gluten · Sin Lactosa' : '100% Vegan · Gluten-Free · Lactose-Free')
                        : isSprayFormat
                          ? (lang === 'es' ? 'Solución Tamponada Isotónica Estéril (pH 6.8–7.4)' : 'Sterile Buffered Isotonic Solution (pH 6.8–7.4)')
                          : isCartridgeFormat
                            ? (lang === 'es' ? 'Vidrio Borosilicato Tipo I · Émbolo Teflón' : 'Type I Borosilicate Glass · Teflon Plunger')
                            : isPenFormat
                              ? (t?.sterileIsotonicSolution || 'Sterile Isotonic Solution (pH 6.8–7.4)')
                              : (t?.dMannitol || 'D-Mannitol (USP / EP Grade)')}
                </span>
              </div>
              <div className="pds-detail-col">
                <span className="pds-dlabel">{isDiagnosticKit ? (lang === 'es' ? 'Laboratorio Analítico' : 'Testing Laboratory') : (t?.sourcingBatchRelease || 'Sourcing & Batch Release')}</span>
                <span className="pds-dval">
                  {isDiagnosticKit ? 'LifeLab1 (Vilna, Lituania) / Bloodo' : `${displaySupplierName} (${t?.verifiedClinicalQuality || 'Verified Clinical Quality'})`}
                </span>
              </div>
              <div className="pds-detail-col">
                <span className="pds-dlabel">{isDiagnosticKit ? (lang === 'es' ? 'Precisión Analítica' : 'Analytical Precision') : (t?.analyticalPurity || 'Analytical Purity')}</span>
                <span className="pds-dval font-bold text-sky-950">
                  {isSolventProduct ? 'USP Pharmacopeia (Sterile, Non-Pyrogenic)' : isDiagnosticKit ? 'CV ≤ 6.6% (Validado)' : `≥ 99.0% (${t?.rpHplcVerified || 'RP-HPLC Verified'})`}
                </span>
              </div>
            </div>
          </div>

          {/* ── Complete Formulations & Strengths Subpanel ── */}
          <div className="pds-table-subpanel">
            <div className="pds-table-subpanel-header">
              <div className="pds-table-subpanel-titles">
                <span className="pds-subpanel-label">
                  {t?.analyticalMatrixSection || 'ANALYTICAL MATRIX & CLINICAL SPECIFICATIONS'}
                </span>
                <h4 className="pds-subpanel-title">
                  {t?.completeFormulationsMatrix || 'Complete Formulations & Strengths Matrix'}
                </h4>
              </div>
              <span className="pds-subpanel-badge">
                <Layers size={12} />
                {matrixRows.length} {t?.verifiedPresentationsFound || 'verified presentations found'}
              </span>
            </div>

            <div className="pds-table-container">
              <table className="pds-matrix-table" aria-label="Available Presentations and Analytical Specs">
                <thead>
                  <tr>
                    <th scope="col">{isDiagnosticKit ? (lang === 'es' ? 'Formato de Kit' : 'Kit Format') : (t?.activePresentationDose || 'Strength / Dose')}</th>
                    <th scope="col">{t?.deliveryDevice || 'Format'}</th>
                    <th scope="col">{isDiagnosticKit ? (lang === 'es' ? 'Toma de Muestra' : 'Sample Collection') : (t?.reconstitutionSolvent || 'Reconstitution')}</th>
                    <th scope="col" className="pds-conc-col">{isDiagnosticKit ? (lang === 'es' ? 'Rango Analítico' : 'Linear Range') : (t?.reconConcentration || 'Concentration')}</th>
                    <th scope="col">{isDiagnosticKit ? (lang === 'es' ? 'Metodología' : 'Methodology') : (t?.primaryAdministrationRoute || 'Administration')}</th>
                    <th scope="col" className="pds-purity-col">{isDiagnosticKit ? (lang === 'es' ? 'Acreditación' : 'Accreditation') : (t?.analyticalGrade || 'Analytical Grade')}</th>
                    <th scope="col">{t?.manufacturingSource || 'Verified Source'}</th>
                  </tr>
                </thead>
                <tbody>
                  {matrixRows.map(row => {
                    return (
                      <tr
                        key={row.id}
                        className={row.isCurrentlyActive ? "pds-matrix-row-selected" : ""}
                        onClick={() => {
                          if (row.formatId && row.formatId !== activeFormatId) {
                            setActiveFormatId(row.formatId);
                          }
                          if (row.strengthId && row.strengthId !== selectedStrengthId) {
                            setSelectedStrengthId(row.strengthId);
                          }
                          triggerHaptic('light');
                        }}
                        style={{ cursor: 'pointer' }}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (row.formatId && row.formatId !== activeFormatId) {
                              setActiveFormatId(row.formatId);
                            }
                            if (row.strengthId && row.strengthId !== selectedStrengthId) {
                              setSelectedStrengthId(row.strengthId);
                            }
                            triggerHaptic('light');
                          }
                        }}
                      >
                        <td data-label="Strength / Dose">
                          <div className="pds-strength-cell">
                            <span
                              className={row.isCurrentlyActive ? "pds-active-dot" : "pds-inactive-dot"}
                              aria-label={row.isCurrentlyActive ? "Active Presentation" : "Select Presentation"}
                            />
                            <span className="pds-strength-name">{row.strengthName}</span>
                          </div>
                          {row.isCurrentlyActive && (
                            <span className="pds-mobile-active-tag">
                              {lang === 'es' ? 'Seleccionada' : 'Selected'}
                            </span>
                          )}
                        </td>
                        <td data-label="Presentation Format">
                          <span className={`pds-format-pill pds-format-${row.formatId}`}>
                            {row.formatName}
                          </span>
                        </td>
                        <td data-label="Reconstitution Diluent">{row.diluentText}</td>
                        <td data-label="Solution Concentration (mg/mL)" className="pds-conc-cell">
                          {row.recon.volume > 0 && !row.isPenOrCart && !row.isOral && !row.isSpray && !isSolventProduct ? (
                            <span className="pds-conc-badge font-mono">
                              {row.concText}
                            </span>
                          ) : (
                            row.concText
                          )}
                        </td>
                        <td data-label="Administration">{row.adminText}</td>
                        <td data-label="Analytical Grade" className="pds-purity-cell">
                          {row.purity}
                        </td>
                        <td data-label="Laboratory Verification">{row.supplierName}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

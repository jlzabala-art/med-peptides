'use client';

import React from 'react';
import {
  Dna, Pill, AlertTriangle, CheckCircle2, TrendingUp,
  Award, ShieldCheck, Send, Download, Link2, Sparkles, Sun, Moon, Bookmark
} from '@/lib/icons';
import { MAX_ACTIVES } from '@/data/compoundingKnowledge';
import { triggerHaptic } from '@/utils/haptics';

export default function GalenicSummaryPanel({
  t,
  lang,
  embedded,
  showPricing,
  items,
  formulaName,
  setFormulaName,
  displayName,
  activeGeneticProfile,
  onClearGeneticProfile,
  galenics,
  isSplitProtocol,
  splitData,
  splitGalenics,
  capsPerBottle,
  costEstimate,
  pricingChannel,
  setPricingChannel,
  isIssuingPrescription,
  isExporting,
  aiContextQuery,
  savedFormulas,
  onSaveFormula,
  onLoadSavedFormula,
  onRemoveSavedFormula,
  onIssueDoctorPrescription,
  onRequest,
  onExportPdf,
  onCopyLink
}) {
  return (
    <aside id="cmp-summary-panel" className="cmp-card cmp-summary" aria-labelledby="cmp-step3">
      <div className="cmp-step-head">
        <span className="cmp-step-num">3</span>
        <div>
          <h2 id="cmp-step3">{t.step3}</h2>
          <p>{t.step3Hint}</p>
        </div>
      </div>

      <label className="cmp-label" htmlFor="cmp-name">{t.formulaName}</label>
      <input
        id="cmp-name"
        className="cmp-name-input"
        value={formulaName}
        maxLength={80}
        placeholder={t.formulaNamePh}
        onChange={(e) => setFormulaName(e.target.value)}
      />

      {activeGeneticProfile && (
        <div className="cmp-dna-card">
          <div className="cmp-dna-head">
            <div className="cmp-dna-title">
              <Dna size={15} color="#16a34a" />
              <strong>
                {lang === 'es'
                  ? `Perfil 24Genetics: ${activeGeneticProfile.patientName} (${activeGeneticProfile.sampleCode})`
                  : `24Genetics DNA Profile: ${activeGeneticProfile.patientName} (${activeGeneticProfile.sampleCode})`}
              </strong>
            </div>
            <button type="button" className="cmp-dna-remove" onClick={onClearGeneticProfile}>
              {lang === 'es' ? 'Quitar' : 'Remove'}
            </button>
          </div>
          <div className="cmp-dna-desc">
            {lang === 'es'
              ? `Fórmula calibrada para dieta ${activeGeneticProfile.dietAndWeight?.effectiveDietType?.toUpperCase()}, sensibilidad a carbohidratos ${activeGeneticProfile.dietAndWeight?.carbSensitivity} y metabolismo de cafeína ${activeGeneticProfile.metabolism?.caffeineMetabolism}.`
              : `Formula tuned for ${activeGeneticProfile.dietAndWeight?.effectiveDietType?.toUpperCase()} diet, ${activeGeneticProfile.dietAndWeight?.carbSensitivity} carb sensitivity and ${activeGeneticProfile.metabolism?.caffeineMetabolism} caffeine metabolism.`}
          </div>
        </div>
      )}

      {galenics ? (
        <>
          {/* Single-phase OR Dual-phase AM/PM Galenic Breakdown */}
          {isSplitProtocol && splitData && splitGalenics ? (
            <div className="cmp-split-summary">
              <div className="cmp-split-summary-title">
                {lang === 'es' ? 'Galénica Dual Día / Noche (2 Frascos)' : 'Dual-Phase Day / Night Galenics (2 Bottles)'}
              </div>

              {[
                { key: 'p1', label: t.phase1Title, icon: Sun, iconColor: '#ea580c', phaseItems: splitData.phase1, g: splitGalenics.phase1 },
                { key: 'p2', label: t.phase2Title, icon: Moon, iconColor: '#6366f1', phaseItems: splitData.phase2, g: splitGalenics.phase2 }
              ].map(({ key, label, icon: PhaseIcon, iconColor, phaseItems, g }) => (
                <div key={key} className="cmp-split-phase-box">
                  <div className="cmp-split-phase-head">
                    <span className="cmp-split-phase-name">
                      <PhaseIcon size={13} color={iconColor} />
                      <strong>{label}</strong>
                    </span>
                    {g && <span className="cmp-split-phase-cap">{g.size.size} · {g.capsPerDay} {t.capsDay}</span>}
                  </div>
                  <div className="cmp-split-phase-items">
                    {phaseItems.map(i => `${i.name} (${i.doseMg}mg)`).join(', ') || '—'}
                  </div>
                  {g && (
                    <div className="cmp-split-phase-meta">
                      <span>{g.totalMg} mg/day · {g.mgPerCap} mg/cap ({g.fillPct}% {t.fill})</span>
                      <span>{g.supplyDays} {t.days}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="cmp-capsule" style={{ '--cap-color': galenics.size.badgeColor }}>
                <div className="cmp-capsule-visual" aria-hidden="true">
                  <div className="cmp-capsule-shell">
                    <div className="cmp-capsule-fill" style={{ width: `${galenics.fillPct}%` }} />
                  </div>
                </div>
                <div className="cmp-capsule-meta">
                  <strong>{t.capsule} {galenics.size.size} · Vegan HPMC</strong>
                  <span>{galenics.mgPerCap} mg {t.perCapsule} · {t.fill} {galenics.fillPct}%</span>
                </div>
              </div>

              <dl className="cmp-specs">
                <div><dt>{t.totalDaily}</dt><dd>{galenics.totalMg} mg</dd></div>
                <div><dt>{t.dailyIntake}</dt><dd>{galenics.capsPerDay} {t.capsDay}</dd></div>
                <div><dt>{t.supply}</dt><dd>{galenics.supplyDays} {t.days}</dd></div>
                <div><dt>{t.actives}</dt><dd>{items.length} / {MAX_ACTIVES}</dd></div>
              </dl>
            </>
          )}

          {galenics.tooMany ? (
            <div className="cmp-alert is-warn"><AlertTriangle size={15} /> <span>{t.warnTooMany}</span></div>
          ) : (
            <div className="cmp-alert is-ok"><CheckCircle2 size={15} /> <span>{t.ok}</span></div>
          )}

          {/* Channel Pricing Switcher (restricted to professional/embedded view) */}
          {showPricing && costEstimate && (
            <div className="cmp-pricing-card">
              <div className="cmp-channel-switch" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={pricingChannel === 'b2b'}
                  className={`cmp-channel-btn ${pricingChannel === 'b2b' ? 'is-active' : ''}`}
                  onClick={() => { setPricingChannel('b2b'); triggerHaptic('selection'); }}
                >
                  {t.channelB2B}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={pricingChannel === 'patient_rrp'}
                  className={`cmp-channel-btn ${pricingChannel === 'patient_rrp' ? 'is-active' : ''}`}
                  onClick={() => { setPricingChannel('patient_rrp'); triggerHaptic('selection'); }}
                >
                  {t.channelRRP}
                </button>
              </div>

              <div className="cmp-pricing-row">
                <div>
                  <div className="cmp-pricing-desc">
                    {pricingChannel === 'b2b' ? t.b2bDesc : t.rrpDesc}
                  </div>
                  <div className="cmp-pricing-sub">
                    {capsPerBottle} caps · ~€{((pricingChannel === 'b2b' ? costEstimate.finalPricing.netPerCapEur : costEstimate.finalPricing.netPerCapEur * 1.85) * galenics.capsPerDay).toFixed(2)}/{lang === 'es' ? 'día' : 'day'}
                  </div>
                </div>
                <div className="cmp-pricing-val-wrap">
                  <div className="cmp-pricing-val">
                    €{(pricingChannel === 'b2b' ? costEstimate.finalPricing.netSellingPriceEur : costEstimate.finalPricing.netSellingPriceEur * 1.85).toFixed(2)}
                  </div>
                  <div className="cmp-pricing-vat">
                    {costEstimate.isDualBottle
                      ? (lang === 'es' ? 'pack 2 frascos (sin IVA)' : '2-bottle pack (ex. VAT)')
                      : (lang === 'es' ? 'por frasco (sin IVA)' : 'per bottle (ex. VAT)')}
                  </div>
                </div>
              </div>

              {pricingChannel === 'patient_rrp' && (
                <div className="cmp-pricing-margin">
                  <span>
                    <TrendingUp size={12} />
                    {t.marginLabel}
                  </span>
                  <span>+€{(costEstimate.finalPricing.netSellingPriceEur * 0.85).toFixed(2)} (+46%)</span>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="cmp-empty is-compact">
          <Pill size={22} />
          <span>{t.emptySub}</span>
        </div>
      )}

      <p className="cmp-price-note"><Award size={13} /> {t.priceNote}</p>

      <div className="cmp-actions">
        {embedded ? (
          <button
            type="button"
            className="cmp-primary-btn is-doctor"
            onClick={onIssueDoctorPrescription}
            disabled={!items.length || isIssuingPrescription}
          >
            <ShieldCheck size={16} />
            <span>
              {isIssuingPrescription
                ? (lang === 'es' ? 'Emitiendo prescripción…' : 'Issuing prescription…')
                : (lang === 'es' ? 'Emitir Prescripción Oficial Certificada' : 'Issue Certified Official Prescription')}
            </span>
          </button>
        ) : (
          <button type="button" className="cmp-primary-btn" onClick={onRequest} disabled={!items.length}>
            <Send size={15} /> {t.request}
          </button>
        )}

        <button type="button" className="cmp-secondary-btn" onClick={onExportPdf} disabled={!items.length || isExporting}>
          <Download size={14} /> {isExporting ? (lang === 'es' ? 'Generando…' : 'Generating…') : t.pdf}
        </button>

        <div className="cmp-actions-split">
          <button type="button" className="cmp-secondary-btn" onClick={onCopyLink} disabled={!items.length}>
            <Link2 size={14} /> {t.copy}
          </button>
          <button type="button" className="cmp-secondary-btn" onClick={onSaveFormula} disabled={!items.length}>
            <Bookmark size={14} /> {t.saveFormula}
          </button>
        </div>
      </div>

      {/* Saved Formulas Quick-Compare */}
      {savedFormulas.length > 0 && (
        <div className="cmp-saved-box">
          <div className="cmp-saved-head">{t.savedFormulasTitle} ({savedFormulas.length}/3)</div>
          <div className="cmp-saved-list">
            {savedFormulas.map(sf => (
              <div key={sf.id} className="cmp-saved-item">
                <div className="cmp-saved-info">
                  <strong>{sf.name}</strong>
                  <small>{sf.items.length} {t.actives} · {sf.capsuleSize} · {sf.capsPerDay} {t.capsDay}</small>
                </div>
                <div className="cmp-saved-btns">
                  <button type="button" className="cmp-saved-load" onClick={() => onLoadSavedFormula(sf)}>
                    {t.loadSaved}
                  </button>
                  <button type="button" className="cmp-saved-del" onClick={() => onRemoveSavedFormula(sf.id)} aria-label="Delete saved formula">
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p
        className="cmp-ai-hint"
        onClick={() => {
          triggerHaptic('selection');
          window.dispatchEvent(new CustomEvent('open-public-atlas-ai', {
            detail: {
              productName: displayName,
              category: 'compounding',
              initialQuery: aiContextQuery
            }
          }));
        }}
        title={lang === 'es' ? 'Abrir Atlas AI' : 'Open Atlas AI'}
      >
        <Sparkles size={13} /> {t.ai} → <em>Atlas AI</em>
      </p>
    </aside>
  );
}

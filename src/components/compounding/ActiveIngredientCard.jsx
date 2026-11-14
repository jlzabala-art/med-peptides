'use client';

import React from 'react';
import { Minus, Plus, Trash2, CheckCircle2, AlertTriangle } from '@/lib/icons';
import { getDoseAssessment } from '@/data/clinicalDosageRegistry';
import {
  MIN_DOSE,
  MAX_DOSE,
  MAX_MG_PER_CAP,
  getTherapeuticRange
} from '@/data/compoundingKnowledge';

export default function ActiveIngredientCard({
  item,
  index,
  lang,
  t,
  totalMg,
  onStepDose,
  onUpdateDose,
  onCommitDose,
  onRemove
}) {
  const range = getTherapeuticRange(item.name);
  const assessment = getDoseAssessment(item.name, item.doseMg, lang);
  const doseNum = Number(item.doseMg) || 0;
  const capSharePct = Math.min(100, Math.round((doseNum / MAX_MG_PER_CAP) * 100));
  const formulaSharePct = totalMg > 0 ? Math.round((doseNum / totalMg) * 100) : 0;

  return (
    <li className="cmp-item">
      <span className="cmp-item-idx">{index + 1}</span>

      <div className="cmp-item-info">
        <div className="cmp-item-title-row">
          <strong>{item.name}</strong>
          <span
            className="cmp-cap-share-pill"
            title={lang === 'es' ? '% de capacidad de 1 cápsula Size 00 (750 mg)' : '% of one Size 00 capsule (750 mg)'}
          >
            {formulaSharePct}% {lang === 'es' ? 'fórmula' : 'blend'} · {capSharePct}% cap
          </span>
        </div>
        <small>{item.spec}</small>
      </div>

      <div className="cmp-dose">
        <button type="button" onClick={() => onStepDose(item.apiId, -1)} aria-label="Decrease dose">
          <Minus size={14} />
        </button>
        <input
          type="number"
          inputMode="decimal"
          min={MIN_DOSE}
          max={MAX_DOSE}
          step="any"
          value={item.doseMg}
          onChange={(e) => onUpdateDose(item.apiId, e.target.value)}
          onBlur={() => onCommitDose(item.apiId)}
          aria-label={`${item.name} ${t.perDay}`}
        />
        <button type="button" onClick={() => onStepDose(item.apiId, 1)} aria-label="Increase dose">
          <Plus size={14} />
        </button>
        <span className="cmp-dose-unit">{t.perDay}</span>
      </div>

      <button
        type="button"
        className="cmp-item-remove"
        onClick={() => onRemove(item.apiId)}
        aria-label={`Remove ${item.name}`}
      >
        <Trash2 size={15} />
      </button>

      {/* Therapeutic Range Slider & Presets */}
      <div className="cmp-item-slider-wrap">
        <div className="cmp-dose-slider-row">
          <input
            type="range"
            min={range.min}
            max={range.max}
            step={range.step}
            value={doseNum || range.standard}
            onChange={(e) => onUpdateDose(item.apiId, Number(e.target.value))}
            className="cmp-dose-slider"
            aria-label={`${item.name} dosage range slider`}
          />
          <div className="cmp-dose-presets">
            <button
              type="button"
              className={`cmp-dose-preset-btn ${doseNum === range.min ? 'is-active' : ''}`}
              onClick={() => onUpdateDose(item.apiId, range.min)}
              title={lang === 'es' ? 'Dosis Mínima Eficaz' : 'Minimum Effective Dose'}
            >
              Min ({range.min}mg)
            </button>
            <button
              type="button"
              className={`cmp-dose-preset-btn cmp-dose-preset-std ${doseNum === range.standard ? 'is-active' : ''}`}
              onClick={() => onUpdateDose(item.apiId, range.standard)}
              title={lang === 'es' ? 'Dosis Clínica Recomendada' : 'Standard Clinical Dose'}
            >
              ⭐ Std ({range.standard}mg)
            </button>
            <button
              type="button"
              className={`cmp-dose-preset-btn ${doseNum === range.max ? 'is-active' : ''}`}
              onClick={() => onUpdateDose(item.apiId, range.max)}
              title={lang === 'es' ? 'Dosis Terapéutica Máxima' : 'Maximum Therapeutic Dose'}
            >
              Max ({range.max}mg)
            </button>
          </div>
        </div>

        {/* Clinical Smart Dose Advice Strip */}
        <div className="cmp-dose-advice-row">
          <div className="cmp-dose-advice-top">
            <div className="cmp-dose-advice-badges">
              <span
                className="cmp-dose-status-badge"
                style={{
                  background: `${assessment.color}15`,
                  color: assessment.color,
                  borderColor: `${assessment.color}35`
                }}
              >
                {assessment.status === 'optimal' ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                {assessment.badgeText}
              </span>
              {range.indication && (
                <span className="cmp-dose-indication">
                  • {range.indication[lang] || range.indication.es || range.indication.en}
                </span>
              )}
            </div>
            {doseNum !== range.standard && (
              <button
                type="button"
                className="cmp-dose-apply-std"
                onClick={() => onUpdateDose(item.apiId, range.standard)}
              >
                {lang === 'es' ? `Sugerir ${range.standard} mg` : `Apply ${range.standard} mg`}
              </button>
            )}
          </div>

          <p className="cmp-dose-rationale">
            {range.clinicalRationale
              ? (range.clinicalRationale[lang] || range.clinicalRationale.es || range.clinicalRationale.en)
              : assessment.message}
          </p>

          {range.yieldNote && (
            <div className="cmp-dose-yield">
              💡 {range.yieldNote[lang] || range.yieldNote.es || range.yieldNote.en}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

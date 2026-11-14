'use client';

import React from 'react';
import { Sparkles, Sliders, CheckCircle2 } from '@/lib/icons';
import { BLUEPRINTS } from '@/data/compoundingKnowledge';
import { triggerHaptic } from '@/utils/haptics';

export default function BlueprintSelector({
  t,
  lang,
  activeBlueprint,
  itemsCount,
  blueprintViewMode,
  onToggleViewMode,
  onOpenWizard,
  onSelectBlueprint
}) {
  const activeBp = BLUEPRINTS.find(b => b.id === activeBlueprint);

  return (
    <section className="cmp-card" aria-labelledby="cmp-step1">
      <div className="cmp-step-head">
        <span className="cmp-step-num">1</span>
        <div className="cmp-step-head-text">
          <h2 id="cmp-step1">{t.step1}</h2>
          <p>{t.step1Hint}</p>
        </div>
        <div className="cmp-step-head-actions">
          <button
            type="button"
            className="cmp-goals-wizard-btn"
            onClick={() => {
              triggerHaptic('selection');
              onOpenWizard();
            }}
          >
            <Sparkles size={14} />
            <span>{t.goalsWizardBtn}</span>
          </button>
          <button
            type="button"
            className="cmp-ghost-btn cmp-view-toggle-btn"
            onClick={onToggleViewMode}
          >
            <Sliders size={12} />
            <span>
              {blueprintViewMode === 'chips'
                ? (lang === 'es' ? 'Ver Tarjetas' : 'View Grid')
                : (lang === 'es' ? 'Ver Chips' : 'View Chips')}
            </span>
          </button>
        </div>
      </div>

      {blueprintViewMode === 'chips' ? (
        <div>
          <div className="cmp-bp-chips">
            {BLUEPRINTS.map(bp => {
              const Icon = bp.icon;
              const isActive = activeBlueprint === bp.id;
              return (
                <button
                  key={bp.id}
                  type="button"
                  className={`cmp-bp-chip ${isActive ? 'is-active' : ''}`}
                  style={{ '--bp-color': bp.color }}
                  onClick={() => onSelectBlueprint(bp)}
                  aria-pressed={isActive}
                >
                  <span className="cmp-bp-chip-icon"><Icon size={14} /></span>
                  <span>{bp.label[lang] || bp.label.en}</span>
                  {isActive && <CheckCircle2 size={13} />}
                </button>
              );
            })}
          </div>
          {activeBlueprint && activeBlueprint !== 'blank' && activeBp && (
            <div className="cmp-bp-active-callout">
              <span>
                <strong>{activeBp.label[lang] || activeBp.label.en}:</strong>{' '}
                {activeBp.desc[lang] || activeBp.desc.en}
              </span>
              <span className="cmp-bp-count">
                {itemsCount} {t.actives}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="cmp-blueprints">
          {BLUEPRINTS.map(bp => {
            const Icon = bp.icon;
            const isActive = activeBlueprint === bp.id;
            return (
              <button
                key={bp.id}
                type="button"
                className={`cmp-bp ${isActive ? 'is-active' : ''}`}
                style={{ '--bp-color': bp.color }}
                onClick={() => onSelectBlueprint(bp)}
                aria-pressed={isActive}
              >
                <span className="cmp-bp-icon"><Icon size={18} /></span>
                <span className="cmp-bp-text">
                  <strong>{bp.label[lang] || bp.label.en}</strong>
                  <small>{bp.desc[lang] || bp.desc.en}</small>
                </span>
                {isActive && <CheckCircle2 size={16} className="cmp-bp-check" />}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Users from "lucide-react/dist/esm/icons/users";
import Clock from "lucide-react/dist/esm/icons/clock";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
/* eslint-disable no-unused-vars */
import React from 'react';





import OutcomeProgressBar from './OutcomeProgressBar';

/**
 * ProtocolOutcomesSection — Highly visual expected outcomes section.
 * Renders qualitative goals, quantitative milestone ranges with visual progress bars,
 * and high-impact responder/onset metrics.
 */
export default function ProtocolOutcomesSection({ expectedOutcomes, accentColor = 'var(--color-success)' }) {
  if (!expectedOutcomes) return null;

  const eo = expectedOutcomes;

  // 1. Parse general qualitative outcomes
  let generalOutcomes = [];
  if (typeof eo === 'string') {
    generalOutcomes = eo.split(/[;\n\r]+/).map(s => s.trim()).filter(Boolean);
  } else if (Array.isArray(eo)) {
    generalOutcomes = eo;
  } else if (eo && typeof eo === 'object') {
    const rawQual = eo.qualitative || eo.general;
    generalOutcomes = Array.isArray(rawQual) ? rawQual : (rawQual ? [rawQual] : []);
  }

  // 2. Parse quantitative ranges
  const qr = typeof eo === 'object' && eo !== null ? (eo.quantitative_ranges || {}) : {};
  let normalizedRanges = [];
  if (Array.isArray(qr)) {
    normalizedRanges = [{
      label: "Projected Clinical Benchmarks",
      items: qr.map((item, idx) => ({
        metric: `Target ${idx + 1}`,
        value: typeof item === 'string' ? item : JSON.stringify(item)
      }))
    }];
  } else if (typeof qr === 'object' && qr !== null) {
    const entries = Object.entries(qr);
    if (entries.length > 0) {
      const isNested = entries.some(([_, val]) => val && typeof val === 'object' && !Array.isArray(val));
      if (isNested) {
        normalizedRanges = entries.map(([key, val]) => {
          const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          let items = [];
          if (typeof val === 'object' && val !== null) {
            items = Object.entries(val).map(([metric, range]) => ({
              metric: metric.replace(/_/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase()),
              value: typeof range === 'object' && range !== null
                ? `${range.min ?? ''}–${range.max ?? ''} ${range.unit ?? ''}`.trim()
                : String(range)
            }));
          } else {
            items = [{ metric: "Target", value: String(val) }];
          }
          return { label, items };
        });
      } else {
        normalizedRanges = [{
          label: "Projected Clinical Benchmarks",
          items: entries.map(([metric, range]) => ({
            metric: metric.replace(/_/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase()),
            value: typeof range === 'object' && range !== null
              ? `${range.min ?? ''}–${range.max ?? ''} ${range.unit ?? ''}`.trim()
              : String(range)
          }))
        }];
      }
    }
  }

  // 3. Responder rate & Onset time
  const responder = eo && typeof eo === 'object' && !Array.isArray(eo) ? eo.responder_rate_pct : null;
  const onset = eo && typeof eo === 'object' && !Array.isArray(eo) ? eo.time_to_onset_weeks : null;

  const hasContent = generalOutcomes.length > 0 || normalizedRanges.length > 0 || responder || onset;
  if (!hasContent) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Upper Grid: Qualitative Goals + Quantitative Ranges */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.25rem',
      }}>
        {/* Left Column: Qualitative Clinical Goals */}
        {generalOutcomes.length > 0 && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.02)',
            border: '1px solid rgba(16, 185, 129, 0.12)',
            borderRadius: 16,
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'rgba(16, 185, 129, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Sparkles size={16} color="var(--color-success)" />
              </div>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#047857' }}>
                Primary Therapeutic Outcomes
              </span>
            </div>
            <ul style={{
              margin: 0,
              padding: 0,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
            }}>
              {generalOutcomes.map((item, i) => (
                <li key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  fontSize: '0.88rem',
                  color: 'var(--color-text-primary)',
                  lineHeight: 1.45,
                }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: '0.12rem' }} />
                  <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Right Column: Quantitative Milestones with Progress Bars */}
        {normalizedRanges.length > 0 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            borderRadius: 16,
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: `${accentColor}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <TrendingUp size={16} color={accentColor} />
              </div>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-secondary)' }}>
                Quantitative Milestones
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {normalizedRanges.map((block, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {normalizedRanges.length > 1 && (
                    <div style={{
                      fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-text-secondary)',
                      borderBottom: '1px solid rgba(0,0,0,0.04)', paddingBottom: '0.25rem',
                    }}>
                      {block.label}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
                    {block.items.map((item, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1.5rem',
                        borderBottom: i < block.items.length - 1 ? '1px dashed rgba(0,0,0,0.04)' : 'none',
                        paddingBottom: i < block.items.length - 1 ? '0.6rem' : 0,
                      }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 550, color: 'var(--color-text-secondary)' }}>
                          {item.metric}
                        </span>
                        <OutcomeProgressBar value={item.value} accentColor={accentColor} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lower Row: High-Impact Clinical Efficiency Cards */}
      {(responder || onset) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
        }}>
          {/* Responder Rate Card */}
          {responder && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.02)',
              border: '1px solid rgba(16, 185, 129, 0.12)',
              borderRadius: 16,
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(16, 185, 129, 0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <Users size={22} color="var(--color-success)" />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <span style={{ fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#047857' }}>
                  Patient Responder Rate
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                    {responder}
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                  Expected positive clinical response rate in evaluated patient cohort.
                </span>
              </div>
            </div>
          )}

          {/* Time to Onset Card */}
          {onset && (
            <div style={{
              background: 'rgba(59, 130, 246, 0.02)',
              border: '1px solid rgba(59, 130, 246, 0.12)',
              borderRadius: 16,
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(59, 130, 246, 0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <Clock size={22} color="var(--color-primary)" />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <span style={{ fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary-hover)' }}>
                  Expected Time to Onset
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                    {String(onset).includes('week') ? onset : `~${onset} Weeks`}
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                  Average interval prior to initial systemic activity observation.
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
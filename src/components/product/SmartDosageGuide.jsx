"use client";

/* eslint-disable no-unused-vars */
import { useMemo, useState } from 'react';







import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { getPeptidePK } from '../../data/peptidePharmacokinetics';
import { Clock, Zap, AlertTriangle, ChevronDown, ChevronUp, Info, GraduationCap } from '@/lib/icons';

/**
 * SmartDosageGuide
 * Reads product.pharmacokinetics.half_life and generates a science-backed
 * dosing frequency suggestion for the researcher, complete with a Recharts decay curve.
 *
 * Props:
 *  - product        {object} — full product record (must have .pharmacokinetics)
 *  - selectedVariant {object|null} — currently selected variant (for dosage label)
 */
export default function SmartDosageGuide({ product, selectedVariant }) {
  const [expanded, setExpanded] = useState(false);

  const pk = product?.pharmacokinetics || {};
  const scientificPK = useMemo(() => getPeptidePK(product?.slug), [product?.slug]);

  // ── Parse half-life string → numeric hours ──────────────────────────────
  const halfLifeHours = useMemo(() => {
    const raw = (scientificPK?.halfLife || pk?.half_life || '').toLowerCase();
    if (!raw) return null;

    // Patterns: "2-4 hours", "30 minutes", "~6h", "24h", "1–2 days"
    const minuteMatch = raw.match(/(\d+(?:\.\d+)?)\s*(?:min|minute)/);
    if (minuteMatch) return parseFloat(minuteMatch[1]) / 60;

    const dayMatch = raw.match(/(\d+(?:\.\d+)?)\s*(?:-|–)?\s*(\d+(?:\.\d+)?)?\s*day/);
    if (dayMatch) {
      const lo = parseFloat(dayMatch[1]);
      const hi = dayMatch[2] ? parseFloat(dayMatch[2]) : lo;
      return ((lo + hi) / 2) * 24;
    }

    const hourMatch = raw.match(/(\d+(?:\.\d+)?)\s*(?:-|–)\s*(\d+(?:\.\d+)?)\s*h/);
    if (hourMatch) {
      return (parseFloat(hourMatch[1]) + parseFloat(hourMatch[2])) / 2;
    }

    const singleHour = raw.match(/(\d+(?:\.\d+)?)\s*h/);
    if (singleHour) return parseFloat(singleHour[1]);

    return null;
  }, [pk?.half_life, scientificPK]);

  // ── Derive dosing frequency recommendation ───────────────────────────────
  const recommendation = useMemo(() => {
    if (!halfLifeHours) return null;

    if (halfLifeHours < 1) {
      return {
        label: 'Multiple times a day',
        detail: 'Very short half-life (< 1 hour). Research protocols typically study continuous infusions or divided doses.',
        icon: '⚡',
        severity: 'caution',
      };
    } else if (halfLifeHours < 6) {
      return {
        label: 'Two to three times a day (BID/TID)',
        detail: `With a half-life of ~${halfLifeHours.toFixed(1)}h, most research protocols divide doses to maintain stable concentrations.`,
        icon: '⏱',
        severity: 'info',
      };
    } else if (halfLifeHours < 24) {
      return {
        label: 'Once a day (QD)',
        detail: `The half-life of ~${halfLifeHours.toFixed(1)}h suggests a single daily administration for typical physiological oscillations.`,
        icon: '🌅',
        severity: 'good',
      };
    } else if (halfLifeHours < 72) {
      return {
        label: 'Every other day or spaced',
        detail: `The prolonged half-life (~${halfLifeHours.toFixed(0)}h) allows dosing every other day, minimizing excessive plasma peaks.`,
        icon: '📅',
        severity: 'good',
      };
    } else {
      return {
        label: 'Weekly or Bi-weekly',
        detail: `The half-life exceeds 72h. Weekly or bi-weekly administrations are standard in clinical literature.`,
        icon: '🗓',
        severity: 'good',
      };
    }
  }, [halfLifeHours]);

  // Generate Recharts pharmacokinetics decay curve
  const chartData = useMemo(() => {
    if (!halfLifeHours) return [];
    const points = [];
    const steps = 15;
    const maxTime = Math.max(halfLifeHours * 4, 12); // Display up to 4 half-lives
    const isDays = maxTime > 36;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * maxTime;
      const concentration = Math.round(100 * Math.pow(0.5, t / halfLifeHours));
      const timeLabel = isDays 
        ? `${(t / 24).toFixed(1)}d`
        : `${Math.round(t)}h`;
      points.push({
        time: t,
        concentration,
        timeLabel
      });
    }
    return points;
  }, [halfLifeHours]);

  if ((!pk?.half_life && !scientificPK) || !recommendation) return null;

  const SEVERITY_COLORS = {
    caution: { bg: '#fff8f0', border: '#f59e0b', text: '#92400e', badge: '#f59e0b' },
    info:    { bg: 'rgba(0,163,224,0.04)', border: 'rgba(0,163,224,0.3)', text: 'var(--secondary)', badge: 'var(--secondary)' },
    good:    { bg: 'rgba(16,185,129,0.04)', border: 'rgba(16,185,129,0.3)', text: '#065f46', badge: 'var(--color-success)' },
  };

  const colors = SEVERITY_COLORS[recommendation.severity];

  return (
    <div style={{
      border: `1.5px solid ${colors.border}`,
      borderRadius: '16px',
      overflow: 'hidden',
      backgroundColor: colors.bg,
      transition: 'box-shadow 0.2s ease',
      color: 'var(--text-main)',
    }}>
      {/* ── Collapsed Header ── */}
      <div
        onClick={() => setExpanded(p => !p)}
        style={{
          padding: '0.9rem 1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{
          width: '34px', height: '34px', borderRadius: '10px',
          backgroundColor: `${colors.badge}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Clock size={17} color={colors.badge} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary)' }}>
              Smart Dosing Insight
            </span>
            <span style={{
              fontSize: '0.6rem', fontWeight: 900,
              background: colors.badge, color: 'white',
              padding: '0.1rem 0.4rem', borderRadius: '4px',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {scientificPK ? 'Engine Verified' : 'PK-Based'}
            </span>
          </div>
          <div style={{ fontSize: '0.76rem', color: colors.text, fontWeight: 600, marginTop: '0.1rem' }}>
            {recommendation.icon} {recommendation.label}
          </div>
        </div>

        {expanded
          ? <ChevronUp size={16} color="var(--text-muted)" />
          : <ChevronDown size={16} color="var(--text-muted)" />
        }
      </div>

      {/* ── Expanded Content ── */}
      {expanded && (
        <div style={{
          borderTop: `1px solid ${colors.border}`,
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          animation: 'sdg-slide-down 0.2s ease-out both',
        }}>
          <style>{`
            @keyframes sdg-slide-down {
              from { opacity: 0; transform: translateY(-6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Main recommendation */}
          <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-main)', lineHeight: 1.6, fontWeight: 500 }}>
            {recommendation.detail}
          </p>

          {/* Recharts Pharmacokinetics Curve */}
          {chartData.length > 0 && (
            <div style={{ 
              background: '#FFFFFF', 
              borderRadius: '12px', 
              padding: '1rem',
              border: '1px solid var(--border-light)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)'
            }}>
              <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                Estimated Plasma Clearance Curve (Half-life)
              </h5>
              <div style={{ width: '100%', height: 140 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="timeLabel" stroke="var(--text-muted)" fontSize={9} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={9} domain={[0, 100]} unit="%" tickLine={false} />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Concentration']}
                      labelFormatter={(label) => `Time: ${label}`}
                      contentStyle={{ background: '#0A1626', border: 'none', borderRadius: '8px', color: '#FFF', fontSize: '0.75rem' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="concentration" 
                      stroke="var(--secondary)" 
                      fill="rgba(0, 209, 255, 0.12)" 
                      strokeWidth={2.5} 
                    />
                    <ReferenceLine y={50} stroke="rgba(0,163,224,0.25)" strokeDasharray="3 3" label={{ value: 'T1/2 (50%)', position: 'right', fill: 'var(--secondary)', fontSize: 8, fontWeight: 700 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* PK data table */}
          <div style={{
            background: 'rgba(255,255,255,0.7)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            {[
              { label: 'Half-life', value: scientificPK?.halfLife || pk.half_life, scientific: !!scientificPK },
              { label: 'Steady State', value: scientificPK?.steadyState || 'N/A', scientific: !!scientificPK },
              pk.route && { label: 'Route of Administration', value: Array.isArray(pk.route) ? pk.route.join(', ') : pk.route },
              pk.bioavailability && { label: 'Bioavailability', value: pk.bioavailability },
            ].filter(Boolean).map((row, i, arr) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                padding: '0.5rem 0.75rem',
                borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                gap: '1rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {row.label}
                  </span>
                  {row.scientific && (
                    <GraduationCap size={10} color="var(--secondary)" />
                  )}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, textAlign: 'right' }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Scientific Notes */}
          {scientificPK?.notes && (
            <div style={{
              padding: '0.75rem',
              background: 'rgba(0,163,224,0.06)',
              borderRadius: '10px',
              border: '1px solid rgba(0,163,224,0.1)',
            }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                 <GraduationCap size={12} color="var(--secondary)" />
                 <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>Scientific Notes</span>
               </div>
               <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                 {scientificPK.notes}
               </p>
            </div>
          )}

          {/* Disclaimer */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.4rem',
            padding: '0.5rem 0.6rem',
            backgroundColor: 'rgba(0,0,0,0.03)',
            borderRadius: '8px',
          }}>
            <Info size={11} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Recommendations derived from scientific literature. Strictly for in-vitro research use only.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
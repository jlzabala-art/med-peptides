/* eslint-disable no-undef, no-unused-vars */
import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import {
  buildChartDataV2,
  computeTotals,
  getCompoundColor,
  getPhaseShadeColor,
  getPhaseAtWeek,
  buildClinicalEvents,
  interpolateDose,
  buildWeeklyCsv,
  computeCostBreakdown,
} from './ProtocolComputationEngine';
import { getPeptidePK } from '../../data/peptidePharmacokinetics';
import { toPng } from 'html-to-image';

// Phase-colors fallback (for phase band stripes — not in engine)
const PHASE_COLORS = ['#38bdf8', '#34d399', '#a78bfa', '#fb923c', '#f87171'];

// ── SVG Dose Escalation Chart (interactive) ───────────────────────────────────
// zoomedPhase: { startWeek, endWeek } | null — restricts the visible X window
function DoseEscalationChart({ compounds, totalWeeks, maxDose, phaseBlocks, doseUnit = 'mg', isIntensityMode = false, hoveredPhase, onPhaseHover, focusedCompound, zoomedPhase }) {
  const W = 400, H = 160;
  const pad = { top: 22, right: 16, bottom: 32, left: 38 };
  const iW  = W - pad.left - pad.right;
  const iH  = H - pad.top  - pad.bottom;
  const wrapRef = useRef(null);

  const [tooltip, setTooltip] = useState(null); // { x, y, week, phase, hoveredCompound, dose }
  const TOOLTIP_W = 230; // keep in sync with minWidth below

  // ── Phase 3: zoom window ──────────────────────────────────────────────────
  const xStart = zoomedPhase ? zoomedPhase.startWeek : 0;
  const xEnd   = zoomedPhase ? zoomedPhase.endWeek   : totalWeeks;
  const xRange = Math.max(1, xEnd - xStart);

  const toX = w => pad.left + ((w - xStart) / xRange) * iW;
  const toY = d => pad.top  + iH - (d / maxDose) * iH;

  const step   = xRange <= 8 ? 1 : xRange <= 16 ? 2 : 4;
  const xTicks = [];
  for (let w = xStart; w <= xEnd; w += step) xTicks.push(w);
  const yTicks = [0, Math.round(maxDose / 2), Math.round(maxDose)];

  const handleEnter = useCallback((e, compound, week, dose) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const phase = getPhaseAtWeek(phaseBlocks || [], week);
    if (onPhaseHover) onPhaseHover(phase?.name || null);
    const rawX = e.clientX - rect.left;
    const clampedX = Math.min(rawX, rect.width - TOOLTIP_W - 8);
    // Total weekly dose — sum of all visible compound doses at this week
    const totalWeeklyDose = compounds
      .filter(c => c.visible !== false)
      .reduce((sum, c) => sum + interpolateDose(c.points, week), 0);
    // Remaining weeks in current phase
    const remainingWeeks = phase
      ? Math.max(0, phase.startWeek + phase.durationWeeks - week)
      : null;
    setTooltip({
      x: Math.max(4, clampedX),
      y: e.clientY - rect.top,
      week,
      dose,
      hoveredCompound: compound,
      phase,
      totalWeeklyDose: +totalWeeklyDose.toFixed(2),
      remainingWeeks,
    });
  }, [phaseBlocks, compounds, TOOLTIP_W]);

  const handleMove = useCallback((e) => {
    if (!tooltip) return;
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const rawX = e.clientX - rect.left;
    const clampedX = Math.min(rawX, rect.width - TOOLTIP_W - 8);
    setTooltip(prev => prev ? { ...prev, x: Math.max(4, clampedX), y: e.clientY - rect.top } : null);
  }, [tooltip, TOOLTIP_W]);

  const handleLeave = useCallback(() => { setTooltip(null); if (onPhaseHover) onPhaseHover(null); }, [onPhaseHover]);

  return (
    <div ref={wrapRef} style={{
      position: 'relative',
      background: '#060b14',
      borderRadius: 10,
      border: '1px solid rgba(255,255,255,0.1)',
      padding: '4px 0 2px',
    }} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <svg viewBox={'0 0 ' + W + ' ' + H} style={{ width: '100%', height: 'auto', display: 'block', fontFamily: '"JetBrains Mono", "Fira Mono", monospace' }}>
        <defs>
          <clipPath id="phc-plot-clip">
            <rect x={pad.left} y={pad.top} width={iW} height={iH} />
          </clipPath>
        </defs>
        {/* Chart background */}
        <rect x={0} y={0} width={W} height={H} fill="#060b14" />
        {/* Inner plot background */}
        <rect x={pad.left} y={pad.top} width={iW} height={iH} fill="#0d1526" rx={2} />
        {/* Horizontal gridlines — high contrast */}
        {yTicks.map(t => (
          <line key={t} x1={pad.left} y1={toY(t)} x2={pad.left + iW} y2={toY(t)}
            stroke={t === 0 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'}
            strokeWidth={t === 0 ? 1 : 0.75} />
        ))}
        {/* X tick marks */}
        {xTicks.map(w => (
          <g key={w}>
            <line x1={toX(w)} y1={pad.top + iH} x2={toX(w)} y2={pad.top + iH + 4}
              stroke="rgba(255,255,255,0.2)" strokeWidth={0.75} />
            <text x={toX(w)} y={pad.top + iH + 13} fontSize={7.5} fill="var(--color-text-secondary)" textAnchor="middle"
              fontFamily='"JetBrains Mono",monospace' letterSpacing="0.03em">
              {w === 0 ? '' : 'W' + w}
            </text>
          </g>
        ))}
        {/* Y axis labels */}
        {yTicks.map(t => (
          <text key={t} x={pad.left - 5} y={toY(t) + 3} fontSize={7} fill="var(--color-text-secondary)" textAnchor="end"
            fontFamily='"JetBrains Mono",monospace'>
            {t >= 0 ? `${t}` : ''}
          </text>
        ))}
        {/* Axes */}
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + iH} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
        <line x1={pad.left} y1={pad.top + iH} x2={pad.left + iW} y2={pad.top + iH} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />

        {/* ── Phase background bands — semantic shading + focus highlight ── */}
        {(phaseBlocks || []).map((ph, i) => {
          // Only render if band overlaps the zoom window
          const bandStart = Math.max(ph.startWeek, xStart);
          const bandEnd   = Math.min(ph.startWeek + ph.durationWeeks, xEnd);
          if (bandEnd <= bandStart) return null;

          const x1 = toX(bandStart);
          const x2 = toX(bandEnd);
          const bw = x2 - x1;
          const shadeColor = getPhaseShadeColor(ph.name);
          const labelX = x1 + bw / 2;
          const transitionWeek = ph.startWeek + ph.durationWeeks;
          const isActive = !hoveredPhase || normalizePhaseLabel(ph.name) === normalizePhaseLabel(hoveredPhase);
          const bandOpacity = hoveredPhase ? (isActive ? 0.18 : 0.03) : 0.08;
          return (
            <g key={'phase-band-' + i}>
              {/* Semantic shaded band — highlights on hover */}
              <rect
                x={x1} y={pad.top}
                width={bw} height={iH}
                fill={shadeColor} opacity={bandOpacity}
                style={{ transition: 'opacity 0.2s' }}
              />
              {/* Vertical dashed transition line + week label (skip last phase) */}
              {i < (phaseBlocks.length - 1) && bandEnd >= ph.startWeek + ph.durationWeeks && (
                <g>
                  <line
                    x1={x2} y1={pad.top} x2={x2} y2={pad.top + iH}
                    stroke={shadeColor} strokeWidth={0.9}
                    strokeDasharray="4,3" opacity={0.6}
                  />
                  <text
                    x={x2} y={pad.top - 2}
                    fontSize={6} fill={shadeColor}
                    textAnchor="middle" fontWeight="700" opacity={0.8}
                  >
                    W{transitionWeek}
                  </text>
                </g>
              )}
              {/* Phase label centered in band */}
              {bw > 30 && (
                <text
                  x={labelX} y={pad.top + 8}
                  fontSize={5} fill={shadeColor}
                  textAnchor="middle" fontWeight="700"
                  opacity={0.65} letterSpacing="0.08em"
                >
                  {normalizePhaseLabel(ph.name).toUpperCase()}
                </text>
              )}
              {/* Phase duration label below name */}
              {bw > 50 && (
                <text
                  x={labelX} y={pad.top + 15}
                  fontSize={4.5} fill={shadeColor}
                  textAnchor="middle" fontWeight="500" opacity={0.45}
                >
                  {ph.durationWeeks}wk
                </text>
              )}
            </g>
          );
        })}

        {/* ── Phase 6: Clinical event markers ── */}
        {buildClinicalEvents(phaseBlocks)
          .filter(ev => ev.week >= xStart && ev.week <= xEnd)
          .map((ev, ei) => {
          const ex = toX(ev.week);
          return (
            <g key={'ev-' + ei} style={{ pointerEvents: 'none' }}>
              <line
                x1={ex} y1={pad.top} x2={ex} y2={pad.top + iH}
                stroke={ev.color} strokeWidth={0.8}
                strokeDasharray="2,4" opacity={0.5}
              />
              <circle cx={ex} cy={pad.top - 5} r={4.5} fill={ev.color} opacity={0.85} />
              <text x={ex} y={pad.top - 1} fontSize={5} fill="white" textAnchor="middle" fontWeight="800">
                {ev.icon}
              </text>
              <title>{ev.label} (W{ev.week})</title>
            </g>
          );
        })}

        {compounds.map(c => {
          if (!c.visible) return null;
          if (!c.points.length) return null;

          // ── 1. Generate weekly stepped points ──
          const xStartLocal = Math.floor(xStart);
          const xEndLocal   = Math.ceil(xEnd);
          const pathPts = [];
          for (let w = xStartLocal; w <= xEndLocal; w++) {
            pathPts.push({ week: w, dose: interpolateDose(c.points, w, 'step') });
          }

          let pathD = '';
          pathPts.forEach((pt, i) => {
            if (i === 0) {
              pathD = `M ${toX(pt.week).toFixed(1)},${toY(pt.dose).toFixed(1)}`;
            } else {
              const prev = pathPts[i - 1];
              // Horizontal step first, then vertical jump
              pathD += ` L ${toX(pt.week).toFixed(1)},${toY(prev.dose).toFixed(1)} L ${toX(pt.week).toFixed(1)},${toY(pt.dose).toFixed(1)}`;
            }
          });

          const areaD = pathD + ` L ${toX(pathPts[pathPts.length - 1].week).toFixed(1)},${toY(0).toFixed(1)} L ${toX(pathPts[0].week).toFixed(1)},${toY(0).toFixed(1)} Z`;

          // ── 2. Generate administration dots (Frequency / Rest Days) ──
          const adminDots = [];
          for (let w = xStartLocal; w < xEndLocal; w++) {
            const dose = interpolateDose(c.points, w, 'step');
            if (dose <= 0) continue;
            
            // Find injections per week for this week
            const phaseFreq = (c.frequencies || []).find(f => w >= f.week && w < f.week + f.duration);
            const n = phaseFreq?.injectionsPerWeek || 1;
            
            for (let i = 0; i < n; i++) {
              const offset = (i + 0.5) / n;
              adminDots.push({ week: w + offset, dose });
            }
          }

          // Phase 10: focus mode — dim non-focused compounds
          const isFocused = !focusedCompound || c.name === focusedCompound;
          const lineOpacity = isFocused ? 1 : 0.12;
          const areaOpacity = isFocused ? 0.12 : 0.02;

          return (
            <g key={c.name} style={{ transition: 'opacity 0.25s', opacity: lineOpacity }} clipPath="url(#phc-plot-clip)">
              <path d={areaD} fill={c.color} opacity={areaOpacity} />
              <path d={pathD} fill="none" stroke={c.color} strokeWidth={isFocused ? 2.5 : 1.5} strokeLinecap="round" strokeLinejoin="round" />
              
              {/* Weekly step markers */}
              {pathPts.map((pt, i) => (
                <circle
                  key={'step-' + i}
                  cx={toX(pt.week)} cy={toY(pt.dose)} r={isFocused ? 3 : 2}
                  fill={c.color}
                  style={{ cursor: 'crosshair', transition: 'r 0.2s' }}
                  onMouseEnter={(e) => handleEnter(e, c, pt.week, pt.dose)}
                />
              ))}

              {/* Administration frequency dots (Rest Day visualization) */}
              {isFocused && adminDots.map((dot, i) => (
                <circle
                  key={'admin-' + i}
                  cx={toX(dot.week)} cy={toY(dot.dose)} r={1.5}
                  fill="white" opacity={0.8}
                  style={{ pointerEvents: 'none' }}
                />
              ))}
            </g>
          );
        })}

        {/* ── Phase 9: Hover week guideline ── */}
        {tooltip && (
          <line
            x1={toX(tooltip.week)} y1={pad.top}
            x2={toX(tooltip.week)} y2={pad.top + iH}
            stroke="rgba(255,255,255,0.35)"
            strokeWidth={1}
            strokeDasharray="4,3"
            pointerEvents="none"
          />
        )}

        <text x={pad.left + iW / 2} y={H - 2} fontSize={7.5} fill="var(--color-text-tertiary)" textAnchor="middle">Weeks</text>
        <text x={7} y={pad.top + iH / 2} fontSize={7.5} fill="var(--color-text-tertiary)" textAnchor="middle"
          transform={'rotate(-90, 7, ' + (pad.top + iH / 2) + ')'}>{isIntensityMode ? 'Intensity (1-5)' : `Dose (${doseUnit})`}</text>
      </svg>

      {/* ── Clinical tooltip — shows all phase compounds ── */}
      {tooltip && (
        <div style={{
          position: 'absolute',
          left: tooltip.x + 10,
          top: Math.max(4, tooltip.y - 24),
          pointerEvents: 'none',
          zIndex: 50,
          background: 'rgba(8,15,30,0.92)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderRadius: 12,
          padding: '0.65rem 0.9rem',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.55)',
          minWidth: TOOLTIP_W,
          maxWidth: TOOLTIP_W,
        }}>
          {/* Week + Phase header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.07em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
              Week {tooltip.week}
            </span>
            {tooltip.phase && (
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#60a5fa', background: 'rgba(96,165,250,0.12)', borderRadius: 20, padding: '0.1rem 0.45rem' }}>
                {normalizePhaseLabel(tooltip.phase.name)}
              </span>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: '0.45rem' }} />

          {/* All compounds in this phase */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {(tooltip.phase?.drugs || []).length > 0
              ? (tooltip.phase.drugs).map((drug, di) => {
                  // find matching compound color
                  const compMatch = compounds.find(c => c.name === drug.name);
                  const dotColor = compMatch?.color || tooltip.hoveredCompound.color;
                  const isHovered = drug.name === tooltip.hoveredCompound.name;
                  return (
                    <div key={di} style={{ opacity: isHovered ? 1 : 0.7 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
                        <span style={{ width: 7, height: 7, borderRadius: 2, background: dotColor, flexShrink: 0, display: 'inline-block', boxShadow: isHovered ? `0 0 5px ${dotColor}` : 'none' }} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isHovered ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.75)' }}>{drug.name}</span>
                      </div>
                      <div style={{ fontSize: '0.63rem', color: 'rgba(255,255,255,0.5)', paddingLeft: '1.1rem', lineHeight: 1.6 }}>
                        {(drug.startDose != null) && <div>{drug.isIntensityBased ? `Level ${drug.startDose}${drug.endDose !== drug.startDose ? ` → ${drug.endDose}` : ''}` : `${drug.startDose}${drug.endDose !== drug.startDose ? ` → ${drug.endDose}` : ''} ${drug.doseUnit}`}</div>}
                        {drug.frequency && <div>{drug.frequency}</div>}
                        {drug.route && <div style={{ textTransform: 'capitalize' }}>{drug.route}</div>}
                      </div>
                    </div>
                  );
                })
              : (
                /* fallback: just show hovered compound */
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
                    <span style={{ width: 7, height: 7, borderRadius: 2, background: tooltip.hoveredCompound.color, flexShrink: 0, display: 'inline-block' }} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{tooltip.hoveredCompound.name}</span>
                  </div>
                  {(tooltip.dose != null) && <div style={{ fontSize: '0.63rem', color: 'rgba(255,255,255,0.5)', paddingLeft: '1.1rem' }}>{isIntensityMode ? `Level ${tooltip.dose}` : `${tooltip.dose} mg`}</div>}
                </div>
              )
            }
          </div>

          {/* ── Total weekly dose + phase remaining ── */}
          {(tooltip.totalWeeklyDose > 0 || tooltip.remainingWeeks != null) && (
            <>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0.45rem 0 0.4rem' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                {tooltip.totalWeeklyDose > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                    <span style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.07em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>Total / Week</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#22d3ee', fontFamily: '"JetBrains Mono",monospace' }}>
                      {tooltip.totalWeeklyDose} <span style={{ fontSize: '0.58rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>{isIntensityMode ? 'lvl' : 'mg'}</span>
                    </span>
                  </div>
                )}
                {tooltip.remainingWeeks != null && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', textAlign: 'right' }}>
                    <span style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.07em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>Phase Remaining</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a78bfa', fontFamily: '"JetBrains Mono",monospace' }}>
                      {tooltip.remainingWeeks} <span style={{ fontSize: '0.58rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>wk</span>
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Normalize phase name labels ────────────────────────────────────────────────
function normalizePhaseLabel(raw = '') {
  const s = raw.toLowerCase().replace(/[_-]/g, ' ').trim();
  if (s.includes('initiat'))  return 'Initiation';
  if (s.includes('escal'))    return 'Escalation';
  if (s.includes('stabili'))  return 'Stabilization';
  if (s.includes('mainten'))  return 'Maintenance';
  if (s.includes('taper'))    return 'Taper';
  if (s.includes('peak'))     return 'Peak';
  // phase_1 / phase 1 → "Phase 1"
  const m = s.match(/phase\s*(\d+)/);
  if (m) return 'Phase ' + m[1];
  // fallback: Title-case the raw name
  return raw.replace(/\b\w/g, c => c.toUpperCase());
}

// ── Phase Duration Bar ────────────────────────────────────────────────────────
function PhaseDurationBar({ phaseBlocks, totalWeeks }) {
  return (
    <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', height: 22 }}>
      {phaseBlocks.map((ph, i) => {
        const pct = ((ph.durationWeeks / totalWeeks) * 100).toFixed(1);
        const label = normalizePhaseLabel(ph.name);
        return (
          <div
            key={ph.name + i}
            title={label + ' · ' + ph.durationWeeks + 'wk'}
            style={{
              width: pct + '%',
              background: PHASE_COLORS[i % PHASE_COLORS.length],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.6rem', fontWeight: 800, color: 'white',
              letterSpacing: '0.05em', whiteSpace: 'nowrap',
              overflow: 'hidden', textOverflow: 'ellipsis',
              padding: '0 0.35rem',
            }}
          >
            {parseFloat(pct) > 18 ? label : ''}
          </div>
        );
      })}
    </div>
  );
}

// ── Compound color legend: click=toggle · double-click=isolate ────────────────
function CompoundLegend({ compounds, onToggle, onIsolate, onResetAll }) {
  return (
    <div style={{ marginTop: '0.6rem' }}>
      {/* Hint row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: '0.56rem', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.04em' }}>
          Click to show/hide · Double-click to isolate
        </span>
        {compounds.some(c => !c.visible) && (
          <button
            onClick={onResetAll}
            style={{
              fontSize: '0.58rem', color: 'rgba(255,255,255,0.45)', background: 'none',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: 5,
              padding: '0.1rem 0.45rem', cursor: 'pointer',
            }}
          >Reset all</button>
        )}
      </div>
      {/* Compound pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 0.7rem' }}>
        {compounds.map(c => {
          const isIsolated = compounds.filter(x => x.visible).length === 1 && c.visible;
          return (
            <button
              key={c.name}
              onClick={() => onToggle(c.name)}
              onDoubleClick={(e) => { e.preventDefault(); onIsolate(c.name); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                background: c.visible ? `${c.color}15` : 'rgba(255,255,255,0.04)',
                border: c.visible ? `1px solid ${c.color}45` : '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer', padding: '0.2rem 0.5rem',
                borderRadius: 6,
                opacity: c.visible ? 1 : 0.38,
                transition: 'all 0.18s ease',
                boxShadow: isIsolated ? `0 0 10px ${c.color}50` : 'none',
              }}
              title={c.visible ? `Hide ${c.name} (double-click to isolate)` : `Show ${c.name}`}
            >
              <span style={{
                display: 'inline-block', width: 9, height: 9, borderRadius: 2, flexShrink: 0,
                background: c.visible ? c.color : 'var(--color-text-primary)',
                boxShadow: isIsolated ? `0 0 5px ${c.color}` : 'none',
                transition: 'background 0.18s',
              }} />
              <span style={{
                fontSize: '0.7rem', fontWeight: isIsolated ? 700 : 600,
                color: c.visible ? (isIsolated ? c.color : 'rgba(255,255,255,0.85)') : 'rgba(255,255,255,0.3)',
                transition: 'color 0.18s',
              }}>
                {c.name}
              </span>
              {isIsolated && (
                <span style={{ fontSize: '0.5rem', color: c.color, fontWeight: 800, letterSpacing: '0.06em' }}>SOLO</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}


// ── Phase 8: Cost Breakdown Panel ─────────────────────────────────────────────
const COST_TABS = ['Compound', 'Phase', 'Week'];

function CostBreakdownPanel({ protocol, phaseBlocks, open, onClose }) {
  const [tab, setTab] = useState(0);

  const breakdown = useMemo(
    () => computeCostBreakdown(protocol, phaseBlocks),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [protocol?.id, phaseBlocks.length],
  );

  if (!open) return null;

  const { byCompound, byPhase, byWeek, pricePerVial } = breakdown;
  const hasData = byCompound.some(c => c.cost > 0) || byPhase.some(p => p.cost > 0);

  // Mini bar chart helper — returns width% relative to max value
  const barPct = (val, arr, key) => {
    const max = Math.max(...arr.map(r => r[key] || 0), 1);
    return Math.round((val / max) * 100);
  };

  const rowStyle = { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' };
  const labelStyle = { fontSize: '0.65rem', color: 'rgba(255,255,255,0.75)', fontWeight: 600, minWidth: 80, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
  const valueStyle = { fontSize: '0.65rem', fontWeight: 800, color: '#facc15', fontFamily: '"JetBrains Mono",monospace', minWidth: 56, textAlign: 'right' };
  const barBg = { flex: 1, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(2px)',
        }}
      />
      {/* Panel */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        zIndex: 1001,
        width: 'min(440px, 96vw)',
        background: '#080d18',
        border: '1px solid rgba(250,204,21,0.25)',
        borderBottom: 'none',
        borderRadius: '14px 14px 0 0',
        padding: '1.1rem 1.25rem 1.5rem',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(250,204,21,0.08)',
        animation: 'phc-slide-up 0.22s ease',
      }}>
        <style>{`@keyframes phc-slide-up { from { transform: translateX(-50%) translateY(100%); } to { transform: translateX(-50%) translateY(0); } }`}</style>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.9rem' }}>
          <span style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#facc15', fontFamily: '"JetBrains Mono",monospace' }}>
            COST BREAKDOWN
          </span>
          {pricePerVial > 0 && (
            <span style={{ marginLeft: '0.5rem', fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
              ${pricePerVial}/vial
            </span>
          )}
          <button
            onClick={onClose}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem', cursor: 'pointer', lineHeight: 1 }}
          >✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.85rem' }}>
          {COST_TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} style={{
              fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.07em',
              textTransform: 'uppercase', fontFamily: '"JetBrains Mono",monospace',
              padding: '0.2rem 0.6rem', borderRadius: 5, cursor: 'pointer',
              border: `1px solid ${tab === i ? '#facc15' : 'rgba(255,255,255,0.1)'}`,
              background: tab === i ? 'rgba(250,204,21,0.12)' : 'transparent',
              color: tab === i ? '#facc15' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.15s ease',
            }}>{t}</button>
          ))}
        </div>

        {/* No-price notice */}
        {!hasData && (
          <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: '1rem' }}>
            Cost data unavailable — add <code>cost_per_vial</code> to the protocol.
          </p>
        )}

        {/* Tab 0 — By Compound */}
        {tab === 0 && hasData && (
          <div>
            {byCompound.map(c => (
              <div key={c.name} style={rowStyle}>
                <span style={labelStyle} title={c.name}>{c.name}</span>
                <div style={barBg}>
                  <div style={{ width: `${barPct(c.cost, byCompound, 'cost')}%`, height: '100%', background: 'linear-gradient(90deg,#facc15,#fb923c)', borderRadius: 3, transition: 'width 0.4s ease' }} />
                </div>
                <span style={valueStyle}>{c.cost > 0 ? `$${c.cost.toLocaleString()}` : `${c.mg}mg`}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tab 1 — By Phase */}
        {tab === 1 && hasData && (
          <div>
            {byPhase.map((p, i) => (
              <div key={p.name + i} style={rowStyle}>
                <span style={labelStyle} title={p.name}>{p.name} <span style={{ opacity: 0.45, fontSize: '0.55rem' }}>({p.weeks}wk)</span></span>
                <div style={barBg}>
                  <div style={{ width: `${barPct(p.cost || p.mg, byPhase, p.cost ? 'cost' : 'mg')}%`, height: '100%', background: 'linear-gradient(90deg,#34d399,#38bdf8)', borderRadius: 3, transition: 'width 0.4s ease' }} />
                </div>
                <span style={valueStyle}>{p.cost > 0 ? `$${p.cost.toLocaleString()}` : `${p.mg}mg`}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2 — By Week (sparkline style) */}
        {tab === 2 && (
          <div>
            {byWeek.length === 0 && (
              <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>No weekly data</p>
            )}
            {/* Mini sparkline SVG */}
            {byWeek.length > 0 && (() => {
              const vals = byWeek.map(w => w.cost || w.mg);
              const maxV = Math.max(...vals, 1);
              const W = 380, H = 64, padL = 4, padR = 4, padT = 6, padB = 4;
              const iW = W - padL - padR;
              const iH = H - padT - padB;
              const pts = byWeek.map((w, i) => ({
                x: padL + (i / Math.max(byWeek.length - 1, 1)) * iW,
                y: padT + iH - (vals[i] / maxV) * iH,
              }));
              const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
              const area = `${path} L${pts[pts.length-1].x},${padT+iH} L${pts[0].x},${padT+iH} Z`;
              return (
                <div>
                  <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H, display: 'block', marginBottom: '0.5rem' }}>
                    <defs>
                      <linearGradient id="phc-wk-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#facc15" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#facc15" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    <path d={area} fill="url(#phc-wk-grad)" />
                    <path d={path} fill="none" stroke="#facc15" strokeWidth="1.5" strokeLinejoin="round" />
                    {pts.filter((_, i) => i % Math.ceil(byWeek.length / 6) === 0).map((p, i) => (
                      <text key={i} x={p.x} y={H - 1} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.3)">
                        W{byWeek[i * Math.ceil(byWeek.length / 6)]?.week}
                      </text>
                    ))}
                  </svg>
                  {/* Top 5 peak weeks */}
                  <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.35rem', fontFamily: '"JetBrains Mono",monospace' }}>PEAK WEEKS</div>
                  {[...byWeek].sort((a, b) => (b.cost || b.mg) - (a.cost || a.mg)).slice(0, 5).map(w => (
                    <div key={w.week} style={rowStyle}>
                      <span style={{ ...labelStyle, minWidth: 44 }}>Week {w.week}</span>
                      <div style={barBg}>
                        <div style={{ width: `${barPct(w.cost || w.mg, byWeek, w.cost ? 'cost' : 'mg')}%`, height: '100%', background: '#facc15', borderRadius: 3 }} />
                      </div>
                      <span style={valueStyle}>{w.cost > 0 ? `$${w.cost.toFixed(2)}` : `${w.mg}mg`}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </>
  );
}


// ── Pharmacokinetics Simulator Engine & Component ─────────────────────────────
function runPKSimulation(compounds, totalWeeks) {
  const hoursPerWeek = 168;
  const totalHours = totalWeeks * hoursPerWeek;
  const dt = 4; // 4h step
  const steps = Math.ceil(totalHours / dt);

  const compoundsData = compounds.map(c => {
    let pk = getPeptidePK(c.name);
    if (!pk) {
      const nameLower = c.name.toLowerCase();
      if (nameLower.includes('bpc')) pk = getPeptidePK('bpc-157');
      else if (nameLower.includes('tb')) pk = getPeptidePK('tb-500');
      else if (nameLower.includes('tirz')) pk = getPeptidePK('tirzepatide');
      else if (nameLower.includes('sema')) pk = getPeptidePK('semaglutide');
      else if (nameLower.includes('reta')) pk = getPeptidePK('retatrutide');
      else if (nameLower.includes('ipam')) pk = getPeptidePK('ipamorelin');
      else if (nameLower.includes('cjc') && nameLower.includes('dac')) pk = getPeptidePK('cjc-1295-dac');
      else if (nameLower.includes('cjc')) pk = getPeptidePK('cjc-1295-no-dac');
      else if (nameLower.includes('ghk')) pk = getPeptidePK('ghk-cu');
      else if (nameLower.includes('serm')) pk = getPeptidePK('sermorelin');
      else if (nameLower.includes('epith')) pk = getPeptidePK('epithalon');
      else if (nameLower.includes('sela')) pk = getPeptidePK('selank');
      else if (nameLower.includes('semax')) pk = getPeptidePK('semax');
      else if (nameLower.includes('aod')) pk = getPeptidePK('aod-9604');
      else if (nameLower.includes('hgh')) pk = getPeptidePK('hgh');
    }
    const halfLifeHours = pk ? pk.halfLifeHours : 24;

    const injections = [];
    for (let week = 1; week <= totalWeeks; week++) {
      const weeklyDose = interpolateDose(c.points, week);
      if (weeklyDose <= 0) continue;

      let injPerWeek = 1;
      if (c.frequencies) {
        const f = c.frequencies.find(fr => week >= fr.week && week < fr.week + fr.duration);
        if (f) injPerWeek = f.injectionsPerWeek;
      }

      const dosePerInj = weeklyDose / injPerWeek;
      for (let i = 0; i < injPerWeek; i++) {
        const dayOffset = (i / injPerWeek) * 7;
        const hourOfInjection = (week - 1) * hoursPerWeek + dayOffset * 24;
        injections.push({
          t: hourOfInjection,
          dose: dosePerInj
        });
      }
    }

    return {
      name: c.name,
      color: c.color,
      unit: c.unit,
      halfLifeHours,
      notes: pk ? pk.notes : 'Biological clearance rate modeled on standard compartments.',
      steadyState: pk ? pk.steadyState : 'N/A',
      injections,
      visible: c.visible !== false
    };
  });

  const points = [];
  for (let i = 0; i <= steps; i++) {
    const t = i * dt;
    const week = 1 + t / hoursPerWeek; // start from week 1 to match DoseEscalationChart
    const item = { t, week };

    compoundsData.forEach(cd => {
      if (!cd.visible) {
        item[cd.name] = 0;
        return;
      }
      let concentration = 0;
      const absorptionHalfLife = Math.min(2, cd.halfLifeHours * 0.1);
      const ka = Math.log(2) / absorptionHalfLife;
      const ke = Math.log(2) / cd.halfLifeHours;

      cd.injections.forEach(inj => {
        const th = t - inj.t;
        if (th >= 0 && th < cd.halfLifeHours * 8) {
          let val = 0;
          if (Math.abs(ka - ke) < 0.0001) {
            val = inj.dose * ka * th * Math.exp(-ka * th);
          } else {
            val = inj.dose * (ka / (ka - ke)) * (Math.exp(-ke * th) - Math.exp(-ka * th));
          }
          concentration += val;
        }
      });
      item[cd.name] = concentration;
    });
    points.push(item);
  }

  return { compoundsData, points };
}

function PharmacokineticsChart({ compounds, totalWeeks, phaseBlocks, hoveredPhase, onPhaseHover, zoomedPhase }) {
  const W = 400, H = 160;
  const pad = { top: 22, right: 16, bottom: 32, left: 38 };
  const iW  = W - pad.left - pad.right;
  const iH  = H - pad.top  - pad.bottom;
  const wrapRef = useRef(null);

  const [tooltip, setTooltip] = useState(null);
  const TOOLTIP_W = 230;

  const { compoundsData, points } = useMemo(() => runPKSimulation(compounds, totalWeeks), [compounds, totalWeeks]);

  const maxConc = useMemo(() => {
    let maxVal = 0.01;
    points.forEach(pt => {
      compoundsData.forEach(cd => {
        if (pt[cd.name] > maxVal) maxVal = pt[cd.name];
      });
    });
    return maxVal * 1.05; // 5% padding at top
  }, [points, compoundsData]);

  const xStart = zoomedPhase ? zoomedPhase.startWeek : 1;
  const xEnd   = zoomedPhase ? zoomedPhase.endWeek   : totalWeeks;
  const xRange = Math.max(1, xEnd - xStart);

  const toX = w => pad.left + ((w - xStart) / xRange) * iW;
  const toY = conc => pad.top + iH - (conc / maxConc) * iH;

  const step   = xRange <= 8 ? 1 : xRange <= 16 ? 2 : 4;
  const xTicks = [];
  for (let w = xStart; w <= xEnd; w += step) xTicks.push(w);

  // Generate Y axis ticks (0, 50%, 100% of max)
  const yTicks = [0, maxConc / 2, maxConc];

  const handleMouseMove = useCallback((e) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const rawX = e.clientX - rect.left;
    if (rawX < pad.left || rawX > pad.left + iW) {
      setTooltip(null);
      if (onPhaseHover) onPhaseHover(null);
      return;
    }

    const xPct = (rawX - pad.left) / iW;
    const targetWeek = xStart + xPct * xRange;

    let bestPt = points[0];
    let bestDist = Infinity;
    points.forEach(pt => {
      const dist = Math.abs(pt.week - targetWeek);
      if (dist < bestDist) {
        bestDist = dist;
        bestPt = pt;
      }
    });

    const phase = getPhaseAtWeek(phaseBlocks || [], Math.floor(bestPt.week));
    if (onPhaseHover) onPhaseHover(phase?.name || null);

    const values = compoundsData
      .filter(cd => cd.visible)
      .map(cd => ({
        name: cd.name,
        color: cd.color,
        concentration: bestPt[cd.name] || 0,
        unit: cd.unit
      }));

    const clampedX = Math.min(rawX, rect.width - TOOLTIP_W - 8);
    setTooltip({
      x: Math.max(4, clampedX),
      y: e.clientY - rect.top,
      week: bestPt.week.toFixed(1),
      day: Math.floor(((bestPt.t) % 168) / 24) + 1,
      hour: Math.floor(bestPt.t % 24),
      values
    });
  }, [points, compoundsData, xStart, xRange, phaseBlocks, TOOLTIP_W, onPhaseHover]);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
    if (onPhaseHover) onPhaseHover(null);
  }, [onPhaseHover]);

  return (
    <div ref={wrapRef} style={{
      position: 'relative',
      background: '#060b14',
      borderRadius: 10,
      border: '1px solid rgba(255,255,255,0.1)',
      padding: '4px 0 2px',
    }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <svg viewBox={'0 0 ' + W + ' ' + H} style={{ width: '100%', height: 'auto', display: 'block', fontFamily: '"JetBrains Mono", "Fira Mono", monospace' }}>
        <defs>
          <clipPath id="pk-plot-clip">
            <rect x={pad.left} y={pad.top} width={iW} height={iH} />
          </clipPath>
        </defs>
        {/* Chart background */}
        <rect x={0} y={0} width={W} height={H} fill="#060b14" />
        {/* Inner plot background */}
        <rect x={pad.left} y={pad.top} width={iW} height={iH} fill="#0d1526" rx={2} />

        {/* Horizontal gridlines */}
        {yTicks.map((t, idx) => (
          <line key={idx} x1={pad.left} y1={toY(t)} x2={pad.left + iW} y2={toY(t)}
            stroke={t === 0 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'}
            strokeWidth={t === 0 ? 1 : 0.75} />
        ))}

        {/* X tick marks */}
        {xTicks.map(w => (
          <g key={w}>
            <line x1={toX(w)} y1={pad.top + iH} x2={toX(w)} y2={pad.top + iH + 4}
              stroke="rgba(255,255,255,0.2)" strokeWidth={0.75} />
            <text x={toX(w)} y={pad.top + iH + 13} fontSize={7.5} fill="var(--color-text-secondary)" textAnchor="middle"
              fontFamily='"JetBrains Mono",monospace' letterSpacing="0.03em">
              {'W' + Math.floor(w)}
            </text>
          </g>
        ))}

        {/* Y axis label - dynamic concentration */}
        <text x={pad.left - 5} y={pad.top - 6} fontSize={6.5} fill="var(--color-text-secondary)" textAnchor="start" fontWeight={700}>
          CONC (A.U.)
        </text>

        {/* Axes */}
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + iH} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
        <line x1={pad.left} y1={pad.top + iH} x2={pad.left + iW} y2={pad.top + iH} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />

        {/* Phase background bands */}
        {(phaseBlocks || []).map((ph, i) => {
          const bandStart = Math.max(ph.startWeek, xStart);
          const bandEnd   = Math.min(ph.startWeek + ph.durationWeeks, xEnd);
          if (bandStart >= bandEnd) return null;

          const bx = toX(bandStart);
          const bw = toX(bandEnd) - bx;
          const isHovered = hoveredPhase === ph.name;

          return (
            <rect key={ph.name + i} x={bx} y={pad.top} width={Math.max(0, bw)} height={iH}
              fill={getPhaseShadeColor(ph.name)}
              opacity={isHovered ? 0.08 : 0.02}
              style={{ transition: 'opacity 0.15s ease' }}
              clipPath="url(#pk-plot-clip)" />
          );
        })}

        {/* PK Curves (Area & Stroke) */}
        {compoundsData.map((cd, ci) => {
          if (!cd.visible) return null;

          const visiblePts = points.filter(pt => pt.week >= xStart && pt.week <= xEnd);
          if (visiblePts.length === 0) return null;

          let linePath = '';
          let areaPath = '';

          visiblePts.forEach((pt, idx) => {
            const x = toX(pt.week);
            const y = toY(pt[cd.name]);

            if (idx === 0) {
              linePath += `M ${x} ${y}`;
              areaPath += `M ${x} ${toY(0)} L ${x} ${y}`;
            } else {
              linePath += ` L ${x} ${y}`;
              areaPath += ` L ${x} ${y}`;
            }
          });

          areaPath += ` L ${toX(visiblePts[visiblePts.length - 1].week)} ${toY(0)} Z`;

          return (
            <g key={cd.name} clipPath="url(#pk-plot-clip)">
              {/* Gradient Fill under curve */}
              <path d={areaPath} fill={cd.color} opacity={0.06} />
              {/* Stroke */}
              <path d={linePath} fill="none" stroke={cd.color} strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          );
        })}

        {/* Hover vertical timeline cursor */}
        {tooltip && (
          <line x1={tooltip.x} y1={pad.top} x2={tooltip.x} y2={pad.top + iH}
            stroke="rgba(255,255,255,0.25)" strokeWidth={0.75} strokeDasharray="3 3"
            clipPath="url(#pk-plot-clip)" />
        )}
      </svg>

      {/* High-fidelity custom tooltip */}
      {tooltip && (
        <div style={{
          position: 'absolute',
          left: tooltip.x,
          top: tooltip.y - 10,
          transform: 'translate(-50%, -100%)',
          background: 'rgba(10, 17, 32, 0.95)',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: 8,
          padding: '0.5rem 0.65rem',
          pointerEvents: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          minWidth: TOOLTIP_W,
          zIndex: 10,
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: '0.62rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)',
            fontFamily: '"JetBrains Mono",monospace', borderBottom: '1px solid rgba(255,255,255,0.08)',
            paddingBottom: '0.25rem', marginBottom: '0.35rem'
          }}>
            <span>WEEK {tooltip.week}</span>
            <span>DAY {tooltip.day} · {tooltip.hour.toString().padStart(2, '0')}:00</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {tooltip.values.map(val => (
              <div key={val.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: val.color, display: 'inline-block' }} />
                  {val.name}
                </span>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, color: val.color, fontFamily: '"JetBrains Mono",monospace' }}>
                  {val.concentration.toFixed(3)} <span style={{ fontSize: '0.5rem', opacity: 0.6 }}>A.U.</span>
                </span>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: '0.4rem', paddingTop: '0.3rem', borderTop: '1px solid rgba(255,255,255,0.06)',
            fontSize: '0.52rem', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', textAlign: 'center'
          }}>
            Bateman Pharmacokinetic Simulation (1-Compartment)
          </div>
        </div>
      )}
    </div>
  );
}

function PKLegendPanel({ compounds }) {
  return (
    <div style={{ marginTop: '0.85rem' }}>
      <div style={{
        fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
        fontFamily: '"JetBrains Mono",monospace', marginBottom: '0.5rem',
      }}>PHARMACOKINETICS PARAMETERS</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {compounds.map((c, i) => {
          let pk = getPeptidePK(c.name);
          if (!pk) {
            const nameLower = c.name.toLowerCase();
            if (nameLower.includes('bpc')) pk = getPeptidePK('bpc-157');
            else if (nameLower.includes('tb')) pk = getPeptidePK('tb-500');
            else if (nameLower.includes('tirz')) pk = getPeptidePK('tirzepatide');
            else if (nameLower.includes('sema')) pk = getPeptidePK('semaglutide');
            else if (nameLower.includes('reta')) pk = getPeptidePK('retatrutide');
            else if (nameLower.includes('ipam')) pk = getPeptidePK('ipamorelin');
            else if (nameLower.includes('cjc') && nameLower.includes('dac')) pk = getPeptidePK('cjc-1295-dac');
            else if (nameLower.includes('cjc')) pk = getPeptidePK('cjc-1295-no-dac');
            else if (nameLower.includes('ghk')) pk = getPeptidePK('ghk-cu');
            else if (nameLower.includes('serm')) pk = getPeptidePK('sermorelin');
            else if (nameLower.includes('epith')) pk = getPeptidePK('epithalon');
            else if (nameLower.includes('sela')) pk = getPeptidePK('selank');
            else if (nameLower.includes('semax')) pk = getPeptidePK('semax');
            else if (nameLower.includes('aod')) pk = getPeptidePK('aod-9604');
            else if (nameLower.includes('hgh')) pk = getPeptidePK('hgh');
          }

          const halfLife = pk ? pk.halfLife : 'N/A';
          const steadyState = pk ? pk.steadyState : 'N/A';
          const notes = pk ? pk.notes : 'Biological clearance rate modeled standard 24h compartments.';

          return (
            <div key={c.name + i} style={{
              padding: '0.6rem 0.85rem',
              borderRadius: 8,
              background: `${c.color}0d`,
              border: `1px solid ${c.color}25`,
              borderLeft: `3px solid ${c.color}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: c.color }}>
                  {c.name}
                </span>
                <span style={{
                  fontSize: '0.58rem', fontWeight: 700, padding: '0.1rem 0.45rem',
                  borderRadius: 12, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)',
                  fontFamily: '"JetBrains Mono",monospace'
                }}>
                  t½: {halfLife}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>Steady State:</span> {steadyState}
                </div>
                <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.68)', lineHeight: 1.45, marginTop: '0.15rem' }}>
                  {notes}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Phase 7: Export Bar ───────────────────────────────────────────────────────
function ExportBar({ protocol, compounds, phaseBlocks, chartRef }) {
  const [exporting, setExporting] = useState(null); // 'csv'|'pdf'|'png'|null

  const downloadCsv = useCallback(() => {
    setExporting('csv');
    try {
      const csv  = buildWeeklyCsv(protocol, phaseBlocks, compounds);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `${protocol?.name || 'protocol'}_schedule.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('CSV export failed', e);
    } finally {
      setTimeout(() => setExporting(null), 600);
    }
  }, [protocol, phaseBlocks, compounds]);

  const downloadPdf = useCallback(async () => {
    setExporting('pdf');
    try {
      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc   = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const name  = protocol?.name || 'Protocol';
      const id    = protocol?.protocol_id || protocol?.id || '';

      // Header
      doc.setFontSize(16);
      doc.setTextColor(56, 189, 248);
      doc.text(name, 40, 40);
      if (id) {
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(`ID: ${id}`, 40, 56);
      }

      // Weekly dose table
      const csv    = buildWeeklyCsv(protocol, phaseBlocks, compounds);
      const lines  = csv.split('\n');
      const head   = [lines[0].split(',')];
      const body   = lines.slice(1).map(r => r.split(',').map(c => c.replace(/^"|"$/g, '')));
      autoTable(doc, {
        startY: 70,
        head,
        body,
        styles: { fontSize: 7.5, cellPadding: 3, textColor: [220, 220, 220], fillColor: [8, 13, 24] },
        headStyles: { fillColor: [14, 26, 54], textColor: [56, 189, 248], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [13, 21, 38] },
      });

      // Phase summary table
      if (phaseBlocks.length) {
        const lastY = doc.lastAutoTable?.finalY || 200;
        doc.setFontSize(10);
        doc.setTextColor(52, 211, 153);
        doc.text('Phase Summary', 40, lastY + 20);
        autoTable(doc, {
          startY: lastY + 30,
          head: [['Phase', 'Start Week', 'Duration (wk)', 'Compounds']],
          body: phaseBlocks.map(ph => [
            ph.name,
            ph.startWeek,
            ph.durationWeeks,
            ph.drugs.map(d => d.name).join(', '),
          ]),
          styles: { fontSize: 7.5, cellPadding: 3, textColor: [220, 220, 220], fillColor: [8, 13, 24] },
          headStyles: { fillColor: [14, 26, 54], textColor: [52, 211, 153], fontStyle: 'bold' },
        });
      }

      doc.save(`${name.replace(/\s+/g, '_')}_protocol.pdf`);
    } catch (e) {
      console.error('PDF export failed', e);
    } finally {
      setTimeout(() => setExporting(null), 800);
    }
  }, [protocol, phaseBlocks, compounds]);

  const downloadPng = useCallback(async () => {
    if (!chartRef?.current) return;
    setExporting('png');
    try {
      const dataUrl = await toPng(chartRef.current, {
        backgroundColor: '#060b14', // Match the sleek dark theme background
        style: {
          borderRadius: '10px',
        },
        pixelRatio: 2, // retina quality
      });
      
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${protocol?.name || 'protocol'}_chart.png`;
      a.click();
    } catch (e) {
      console.error('PNG export failed', e);
    } finally {
      setExporting(null);
    }
  }, [chartRef, protocol]);

  const EXPORT_BTNS = [
    {
      key: 'csv',
      label: 'CSV',
      icon: '⬇',
      hint: 'Download weekly dose schedule',
      accent: '#22d3ee',
      glow: 'rgba(34,211,238,0.18)',
      border: 'rgba(34,211,238,0.35)',
      onClick: downloadCsv,
    },
    {
      key: 'pdf',
      label: 'PDF',
      icon: '⬇',
      hint: 'Download full protocol report',
      accent: '#a78bfa',
      glow: 'rgba(167,139,250,0.18)',
      border: 'rgba(167,139,250,0.35)',
      onClick: downloadPdf,
    },
    {
      key: 'png',
      label: 'Chart PNG',
      icon: '⬇',
      hint: 'Download dose chart image',
      accent: '#fb923c',
      glow: 'rgba(251,146,60,0.18)',
      border: 'rgba(251,146,60,0.35)',
      onClick: downloadPng,
    },
  ];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      padding: '0.55rem 0.85rem',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: 10,
      border: '1px solid rgba(255,255,255,0.09)',
      marginBottom: '1rem',
      flexWrap: 'wrap',
    }}>
      <span style={{
        fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.12em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)',
        fontFamily: '"JetBrains Mono",monospace', marginRight: '0.4rem',
        flexShrink: 0,
      }}>⬇ Export</span>
      <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)', marginRight: '0.25rem' }} />
      {EXPORT_BTNS.map(btn => {
        const active = exporting === btn.key;
        const dimmed = exporting && !active;
        return (
          <button
            key={btn.key}
            onClick={btn.onClick}
            disabled={!!exporting}
            title={btn.hint}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontFamily: '"JetBrains Mono",monospace',
              padding: '0.35rem 0.9rem',
              borderRadius: 7,
              cursor: exporting ? 'wait' : 'pointer',
              border: `1px solid ${active ? btn.border : 'rgba(255,255,255,0.13)'}`,
              background: active ? btn.glow : 'rgba(255,255,255,0.055)',
              color: active ? btn.accent : 'rgba(255,255,255,0.78)',
              boxShadow: active ? `0 0 10px ${btn.glow}` : 'none',
              transition: 'all 0.18s ease',
              opacity: dimmed ? 0.35 : 1,
            }}
          >
            <span style={{ fontSize: '0.7rem', color: active ? btn.accent : btn.accent, opacity: dimmed ? 0.4 : 0.9 }}>{btn.icon}</span>
            {active ? 'Saving…' : btn.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProtocolHeaderCharts({ protocol, onChartRef }) {
  // Phase 6 — memoize chart data; key on protocol to handle updates correctly
  const data = useMemo(() => {
    return buildChartDataV2(protocol);
  }, [protocol]);

  const [visibility,     setVisibility]     = useState({});
  const [hoveredPhase,   setHoveredPhase]   = useState(null);
  const [focusedCompound,setFocusedCompound]= useState(null);
  const [zoomedPhase,    setZoomedPhase]    = useState(null); // Phase 3
  const [viewMode,       setViewMode]       = useState('peptide'); // 'peptide' | 'phase'
  const chartRef = useRef(null); // Phase 7: for PNG export
  // Expose chartRef to parent so it can capture the SVG for PDF embedding.
  // useLayoutEffect fires after DOM mutations, guaranteeing chartRef.current is set.
  useEffect(() => {
    if (onChartRef) onChartRef(chartRef);
  }, [onChartRef]); // chartRef is stable — only re-run if the callback changes

  // costOpen / CostBreakdownPanel removed — Est. Cost tile removed to avoid
  // conflict with real catalog pricing in ProtocolSupplyEngine.

  if (!data || !data.phaseBlocks.length) return null;


  const { compounds: rawCompounds, phaseBlocks, totalWeeks, maxDose, dominantUnit, isIntensityMode = false } = data;
  // Apply visibility state (default all visible)
  const compounds = rawCompounds.map(c => ({
    ...c,
    visible: visibility[c.name] !== false,
  }));
  const hasDoseData = compounds.some(c => c.points.some(p => p.dose > 0));

  // Phase 2 handlers
  const toggleCompound  = useCallback((name) =>
    setVisibility(prev => ({ ...prev, [name]: prev[name] === false ? true : false })), []);
  const isolateCompound = useCallback((name) =>
    setVisibility(() => Object.fromEntries(rawCompounds.map(c => [c.name, c.name === name]))), [rawCompounds]);
  const resetAllCompounds = useCallback(() => setVisibility({}), []);

  // Phase 3 handlers — zoom to a phase or reset
  const handlePhaseZoom = useCallback((ph) => {
    setZoomedPhase(prev =>
      prev && prev.startWeek === ph.startWeek
        ? null  // toggle off (same phase clicked twice)
        : { startWeek: ph.startWeek, endWeek: ph.startWeek + ph.durationWeeks, name: ph.name }
    );
  }, []);
  const resetZoom = useCallback(() => setZoomedPhase(null), []);

  return (
    <div style={{
      marginTop: '1.25rem',
      background: '#080d18',
      borderRadius: 14,
      padding: '1.1rem 1.35rem',
      border: '1px solid rgba(255,255,255,0.12)',
      boxShadow: '0 0 0 1px rgba(56,189,248,0.06), 0 8px 32px rgba(0,0,0,0.55)',
      animation: 'phc-chart-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards'
    }}>
      {/* Phase 9 — Responsive styles */}
      <style>{`
        @keyframes phc-chart-reveal {
          0% { opacity: 0; transform: translateY(20px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .phc-snap-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
        }
        @media (max-width: 480px) {
          .phc-snap-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
      {/* Protocol Snapshot — Phase 4: includes Total mg / vials / cost row */}
      {(() => {
        // Phase 5 — delegate all totals computation to the engine
        const { totalMg, totalVials, totalCost, compoundCount, dominantFreq } =
          computeTotals(protocol, phaseBlocks, compounds);
        const freq = dominantFreq;

        const snapItems = [
          { value: `${totalWeeks}`, unit: 'WK', label: 'Duration', accent: '#38bdf8' },
          { value: `${phaseBlocks.length}`, unit: '', label: 'Phases', accent: '#34d399' },
          { value: freq.split(' ')[0], unit: '', label: 'Dosing', accent: '#a78bfa' },
          { value: `${compoundCount}`, unit: '', label: 'Compounds', accent: '#fb923c' },
        ];

        // secondary computed row (only render items with non-zero values)
        // Note: Est. Cost is intentionally excluded — the rough cost_per_vial heuristic
        // conflicts with real per-compound catalog pricing in ProtocolSupplyEngine below.
        const secItems = [
          totalVials > 0 ? { value: `${totalVials}`,    unit: 'vials', label: 'Total Vials', accent: '#4ade80' } : null,
        ].filter(Boolean);

        return (
          <>
            <div className="phc-snap-grid" style={{ marginBottom: secItems.length ? '0.5rem' : '1rem' }}>
              {snapItems.map(s => (
                <div key={s.label} style={{
                  display: 'flex', flexDirection: 'column', justifyContent: 'center',
                  padding: '0.5rem 0.7rem 0.5rem 0.85rem',
                  borderRadius: 8,
                  background: '#0d1526',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderLeft: `3px solid ${s.accent}`,
                }}>
                  <span style={{
                    fontSize: '1rem', fontWeight: 800, lineHeight: 1,
                    fontFamily: '"JetBrains Mono","Fira Mono",monospace',
                    color: 'rgba(255,255,255,0.95)',
                    letterSpacing: '-0.01em',
                  }}>
                    {s.value}<span style={{ fontSize: '0.6rem', color: s.accent, marginLeft: 2, fontWeight: 700 }}>{s.unit}</span>
                  </span>
                  <span style={{
                    fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
                    marginTop: '0.2rem',
                    fontFamily: '"JetBrains Mono","Fira Mono",monospace',
                  }}>{s.label}</span>
                </div>
              ))}
            </div>
            {secItems.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {secItems.map(s => {
                  const isCost = s.label === 'Est. Cost';
                  return (
                    <div
                      key={s.label}
                      onClick={isCost ? () => setCostOpen(true) : undefined}
                      title={isCost ? 'Click for cost breakdown' : undefined}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.3rem 0.75rem',
                        borderRadius: 20,
                        background: `${s.accent}10`,
                        border: `1px solid ${s.accent}30`,
                        cursor: isCost ? 'pointer' : 'default',
                        transition: isCost ? 'background 0.18s ease, border-color 0.18s ease' : 'none',
                        ...(isCost ? { ':hover': { background: `${s.accent}20` } } : {}),
                      }}
                    >
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: s.accent, fontFamily: '"JetBrains Mono",monospace' }}>
                        {s.value}{s.unit && <span style={{ fontSize: '0.55rem', marginLeft: 2, opacity: 0.7 }}>{s.unit}</span>}
                      </span>
                      <span style={{ fontSize: '0.58rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        {s.label}
                      </span>
                      {isCost && (
                        <span style={{ fontSize: '0.6rem', color: `${s.accent}80`, lineHeight: 1 }}>↗</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        );
      })()}

      {/* Phase 7 — Export bar: shown right after metrics for easy discoverability */}
      <ExportBar
        protocol={protocol}
        compounds={compounds}
        phaseBlocks={phaseBlocks}
        chartRef={chartRef}
      />

      {/* Clinical Objectives */}
      {(() => {
        const rawObjectives =
          protocol?.clinical_objectives ||
          protocol?.goals ||
          protocol?.objectives ||
          [];
        const objectives = Array.isArray(rawObjectives)
          ? rawObjectives.slice(0, 3)
          : typeof rawObjectives === 'string'
            ? rawObjectives.split(/[,;]/).map(s => s.trim()).filter(Boolean).slice(0, 3)
            : [];
        if (!objectives.length) return null;
        return (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#34d399',
              fontFamily: '"JetBrains Mono",monospace',
              marginBottom: '0.5rem',
            }}>
              <span style={{ width: 14, height: 1.5, background: '#34d399', display: 'inline-block', borderRadius: 2 }} />
              CLINICAL OBJECTIVES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {objectives.map((obj, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 6,
                  background: 'rgba(52,211,153,0.06)',
                  border: '1px solid rgba(52,211,153,0.18)',
                  borderLeft: '2px solid #34d399',
                }}>
                  <span style={{ color: '#34d399', fontSize: '0.6rem', lineHeight: 1.6, flexShrink: 0, fontWeight: 800, fontFamily: 'monospace' }}>▶</span>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.82)', fontWeight: 500, lineHeight: 1.5 }}>
                    {typeof obj === 'string' ? obj : obj.objective || obj.goal || obj.description || JSON.stringify(obj)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── VIEW MODE SWITCHER — By Peptide / By Phase ──────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        marginBottom: '1rem',
        padding: '0.5rem 0.65rem',
        background: '#0a1020',
        borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <span style={{
          fontSize: '0.56rem', fontWeight: 800, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
          fontFamily: '"JetBrains Mono",monospace', whiteSpace: 'nowrap',
        }}>View results by</span>
        <div style={{ display: 'flex', gap: '0.35rem', flex: 1 }}>
          {[
            { id: 'peptide', label: '💊 By Peptide', hint: "See each compound's dose curve individually", accent: '#38bdf8' },
            { id: 'pk',      label: '📈 PK Simulator', hint: 'See simulated hourly blood concentration curves', accent: '#ec4899' },
            { id: 'phase',   label: '📋 By Phase',   hint: 'See how compounds are grouped per protocol phase', accent: '#34d399' },
          ].map(opt => {
            const active = viewMode === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setViewMode(opt.id)}
                title={opt.hint}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  flex: 1, justifyContent: 'center',
                  fontSize: '0.68rem', fontWeight: active ? 800 : 600,
                  padding: '0.45rem 0.9rem',
                  borderRadius: 7, cursor: 'pointer',
                  border: `1px solid ${active ? opt.accent : 'rgba(255,255,255,0.1)'}`,
                  background: active ? `${opt.accent}18` : 'rgba(255,255,255,0.03)',
                  color: active ? opt.accent : 'rgba(255,255,255,0.45)',
                  boxShadow: active ? `0 0 12px ${opt.accent}30, inset 0 0 0 1px ${opt.accent}25` : 'none',
                  transition: 'all 0.18s ease',
                  letterSpacing: '0.02em',
                }}
              >
                {opt.label}
                {active && (
                  <span style={{
                    display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                    background: opt.accent, marginLeft: 2,
                    boxShadow: `0 0 6px ${opt.accent}`,
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Phase summary — compact, clickable pills → Phase 3 zoom */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {phaseBlocks.map((ph, i) => {
          const color   = PHASE_COLORS[i % PHASE_COLORS.length];
          const isZoomed = zoomedPhase?.startWeek === ph.startWeek;
          return (
            <button
              key={ph.name + i}
              onClick={() => handlePhaseZoom(ph)}
              title={isZoomed ? 'Click to reset zoom' : `Zoom to ${normalizePhaseLabel(ph.name)}`}
              style={{
                fontSize: '0.62rem', fontWeight: 700,
                color: color,
                background: isZoomed ? `${color}30` : `${color}18`,
                border: `1px solid ${isZoomed ? color : color + '35'}`,
                borderRadius: 20, padding: '0.15rem 0.55rem',
                cursor: 'pointer',
                boxShadow: isZoomed ? `0 0 8px ${color}60` : 'none',
                transition: 'all 0.18s ease',
              }}
            >
              {normalizePhaseLabel(ph.name)} · {ph.durationWeeks}wk
              {isZoomed && <span style={{ marginLeft: '0.3rem', fontSize: '0.5rem', fontWeight: 800 }}>🔍</span>}
            </button>
          );
        })}
        <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {zoomedPhase && (
            <button
              onClick={resetZoom}
              style={{
                fontSize: '0.58rem', color: 'rgba(255,255,255,0.45)', background: 'none',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: 5,
                padding: '0.1rem 0.45rem', cursor: 'pointer',
              }}
            >Reset zoom</button>
          )}
          {totalWeeks}wk total
        </span>
      </div>

      {/* Dose escalation / PK chart */}
      {hasDoseData && (
        <div className="proto-header-chart__dose-section" ref={chartRef}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: viewMode === 'phase' ? '#34d399' : viewMode === 'pk' ? '#ec4899' : '#38bdf8',
            fontFamily: '"JetBrains Mono",monospace',
            marginBottom: '0.5rem',
          }}>
            <span style={{ width: 14, height: 1.5, background: viewMode === 'phase' ? '#34d399' : viewMode === 'pk' ? '#ec4899' : '#38bdf8', display: 'inline-block', borderRadius: 2 }} />
            {viewMode === 'phase' ? 'PROTOCOL PHASES — DOSE OVERVIEW' : viewMode === 'pk' ? 'BLOOD CONCENTRATION SIMULATOR' : 'DOSE ESCALATION SCHEDULE'}
            <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.25)', fontSize: '0.55rem', fontWeight: 600 }}>
              {viewMode === 'phase'
                ? `${phaseBlocks.length} phases · ${totalWeeks}wk`
                : viewMode === 'pk'
                  ? 'Bateman 1-Compartment Model'
                  : (isIntensityMode ? 'INTENSITY SCALE 1-5' : dominantUnit)}
            </span>
          </div>
          {viewMode === 'pk' ? (
            <PharmacokineticsChart
              compounds={compounds}
              totalWeeks={totalWeeks}
              phaseBlocks={phaseBlocks}
              hoveredPhase={hoveredPhase}
              onPhaseHover={setHoveredPhase}
              zoomedPhase={zoomedPhase}
            />
          ) : (
            <DoseEscalationChart
              compounds={compounds}
              totalWeeks={totalWeeks}
              maxDose={maxDose}
              phaseBlocks={phaseBlocks}
              doseUnit={dominantUnit}
              isIntensityMode={isIntensityMode}
              hoveredPhase={hoveredPhase}
              onPhaseHover={setHoveredPhase}
              focusedCompound={viewMode === 'phase' ? null : focusedCompound}
              zoomedPhase={zoomedPhase}
            />
          )}

          {/* By Phase: phase breakdown table */}
          {viewMode === 'phase' && (
            <div style={{ marginTop: '0.85rem' }}>
              <div style={{
                fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
                fontFamily: '"JetBrains Mono",monospace', marginBottom: '0.5rem',
              }}>PHASE BREAKDOWN</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {phaseBlocks.map((ph, i) => {
                  const color = PHASE_COLORS[i % PHASE_COLORS.length];
                  const phDrugs = ph.drugs || [];
                  return (
                    <div key={ph.name + i} style={{
                      padding: '0.55rem 0.8rem',
                      borderRadius: 8,
                      background: `${color}0d`,
                      border: `1px solid ${color}28`,
                      borderLeft: `3px solid ${color}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: phDrugs.length ? '0.4rem' : 0 }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color, fontFamily: '"JetBrains Mono",monospace' }}>
                          {normalizePhaseLabel(ph.name)}
                        </span>
                        <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
                          Wk {ph.startWeek}–{ph.startWeek + ph.durationWeeks} · {ph.durationWeeks}wk
                        </span>
                      </div>
                      {phDrugs.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem 0.6rem' }}>
                          {phDrugs.map((drug, di) => {
                            const compMatch = compounds.find(c => c.name === drug.name);
                            const dot = compMatch?.color || color;
                            return (
                              <span key={di} style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                fontSize: '0.63rem', color: 'rgba(255,255,255,0.75)', fontWeight: 600,
                              }}>
                                <span style={{ width: 7, height: 7, borderRadius: 2, background: dot, display: 'inline-block', flexShrink: 0 }} />
                                {drug.name}
                                {drug.startDose != null && (
                                  <span style={{ fontSize: '0.57rem', color: 'rgba(255,255,255,0.38)', fontFamily: 'monospace' }}>
                                    {drug.isIntensityBased
                                      ? `lvl ${drug.startDose}${drug.endDose !== drug.startDose ? `→${drug.endDose}` : ''}`
                                      : `${drug.startDose}${drug.endDose !== drug.startDose ? `→${drug.endDose}` : ''} ${drug.doseUnit || ''}`
                                    }
                                  </span>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* By Peptide: compound legend */}
          {viewMode === 'peptide' && (
            <CompoundLegend compounds={compounds} onToggle={toggleCompound} onIsolate={isolateCompound} onResetAll={resetAllCompounds} />
          )}

          {/* PK Legend Panel */}
          {viewMode === 'pk' && (
            <PKLegendPanel compounds={compounds} />
          )}
        </div>
      )}

      {/* Cost Breakdown Panel removed — pricing is handled by ProtocolSupplyEngine */}
    </div>
  );
}

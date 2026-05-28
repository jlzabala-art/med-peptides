/* eslint-disable no-unused-vars */
import React, { useMemo, useState } from 'react';
import { ArrowRight, AlertTriangle, TrendingUp, TrendingDown, PlusCircle, MinusCircle, Filter, Copy, Check, DollarSign } from 'lucide-react';

// Helper for compact date format
const formatCompactDateRange = (dateLabel) => {
  if (!dateLabel) return '';
  const parts = dateLabel.split(' - ');
  if (parts.length !== 2) return dateLabel;

  const [start, end] = parts;
  const startParts = start.split(' ');
  const endParts = end.split(' ');

  if (startParts.length < 2 || endParts.length < 2) return dateLabel;

  const startMonth = startParts[0];
  const startDay = startParts[1];
  const endMonth = endParts[0];
  const endDay = parseInt(endParts[1]);

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}–${endDay}`;
  }
  return `${startMonth} ${startDay}–${endMonth} ${endDay}`;
};

// Pure helper – no JSX, safe for useMemo
const computeMedChanges = (currentWeek, prevWeek) => {
  if (!prevWeek) return {};
  const changes = {};

  const currMeds = currentWeek.events
    ? currentWeek.events.filter(e => e.type === 'medication')
    : (currentWeek.medications || []);
  const prevMeds = prevWeek.events
    ? prevWeek.events.filter(e => e.type === 'medication')
    : (prevWeek.medications || []);

  currMeds.forEach(med => {
    const title = med.title || med.name;
    const pm = prevMeds.find(p => (p.title || p.name) === title);
    if (!pm) {
      changes[title] = { type: 'new' };
    } else {
      const cv = parseFloat(med.dose);
      const pv = parseFloat(pm.dose);
      if (!isNaN(cv) && !isNaN(pv)) {
        if (cv > pv) changes[title] = { type: 'up' };
        else if (cv < pv) changes[title] = { type: 'down' };
      }
    }
  });

  // Detect removed meds
  prevMeds.forEach(med => {
    const title = med.title || med.name;
    const cm = currMeds.find(c => (c.title || c.name) === title);
    if (!cm) {
      changes[title] = { type: 'removed' };
    }
  });

  return changes;
};

// Change badge icon renderer (kept outside render to avoid recreating)
const ChangeIcon = ({ type, isActive }) => {
  const color = isActive ? 'white' : (
    type === 'new' ? '#10B981' :
    type === 'up'  ? '#f59e0b' :
    type === 'down'? 'var(--color-primary)' :
                     'var(--color-danger)'
  );
  const label = type === 'new' ? 'New' : type === 'up' ? 'Increase' : type === 'down' ? 'Decrease' : 'Removed';
  const Icon = type === 'new' ? PlusCircle : type === 'up' ? TrendingUp : type === 'down' ? TrendingDown : MinusCircle;

  return (
    <span style={{
      display: 'flex',
      alignItems: 'center',
      gap: '2px',
      fontSize: '0.65rem',
      color,
      opacity: 0.9,
      marginLeft: '2px'
    }}>
      <Icon size={10} /> {label}
    </span>
  );
};

// ─── Investment Mini-Chart ─────────────────────────────────────────────────
const InvestmentMiniChart = ({ before, after, currency = '$' }) => {
  if (!before || !after || before <= 0 || after <= 0) return null;

  const max = Math.max(before, after);
  const beforePct = (before / max) * 100;
  const afterPct  = (after  / max) * 100;
  const delta     = after - before;
  const deltaPct  = ((delta / before) * 100).toFixed(1);
  const isOptimized = after < before;

  const fmt = (v) => `${currency}${v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div style={{
      marginBottom: '1rem',
      padding: '0.75rem',
      backgroundColor: 'var(--color-bg-app)',
      borderRadius: '10px',
      border: '1px solid var(--border)',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
          <DollarSign size={12} /> INVESTMENT COMPARISON
        </div>
        {/* Cost delta badge */}
        <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 10px',
          borderRadius: '20px',
          fontSize: '0.7rem',
          fontWeight: 800,
          backgroundColor: isOptimized ? '#d1fae5' : '#fef3c7',
          color: isOptimized ? 'var(--color-success)' : 'var(--color-warning)',
        }}>
          {isOptimized ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
          {isOptimized ? 'Optimized' : 'Increased Investment'}&nbsp;
          <span style={{ opacity: 0.75 }}>{isOptimized ? '-' : '+'}{Math.abs(deltaPct)}%</span>
        </span>
      </div>

      {/* Bars */}
      {[{ label: 'Before', value: before, pct: beforePct, color: 'var(--color-text-tertiary)' },
        { label: 'After',  value: after,  pct: afterPct,  color: isOptimized ? 'var(--color-success)' : '#f59e0b' }]
        .map(({ label, value, pct, color }) => (
          <div key={label} style={{ marginBottom: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>{label}</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-main)' }}>{fmt(value)}</span>
            </div>
            <div style={{ height: '8px', borderRadius: '4px', backgroundColor: 'var(--color-border)', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${pct}%`,
                borderRadius: '4px',
                backgroundColor: color,
                transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
              }} />
            </div>
          </div>
        ))
      }

      {/* Absolute delta */}
      <div style={{ textAlign: 'right', marginTop: '4px', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>
        Net change:&nbsp;
        <span style={{ color: isOptimized ? 'var(--color-success)' : 'var(--color-warning)', fontWeight: 900 }}>
          {isOptimized ? '-' : '+'}{fmt(Math.abs(delta))}
        </span>
      </div>
    </div>
  );
};

export default function ClinicalTimeline({ timeline, activeWeek, onWeekSelect, costComparison }) {
  const [onlyChanges, setOnlyChanges]   = useState(false);
  const [copied,      setCopied]         = useState(false);

  // ─── 1. Memoized phase grouping ───────────────────────────────────────────
  const phases = useMemo(() => {
    if (!timeline || timeline.length === 0) return [];

    const result = [];
    let currentPhase = null;

    timeline.forEach(weekData => {
      const wPhaseName = weekData.phase_name || weekData.phaseName || 'Protocol Phase';
      if (!currentPhase || currentPhase.name !== wPhaseName) {
        if (currentPhase) result.push(currentPhase);

        const pName = wPhaseName.toLowerCase();
        let pColor = 'var(--color-text-tertiary)';
        if (pName.includes('initiation'))  pColor = 'var(--primary)';
        else if (pName.includes('escalation'))  pColor = '#f59e0b';
        else if (pName.includes('maintenance')) pColor = 'var(--color-success)';

        currentPhase = {
          name: wPhaseName,
          dateLabel: weekData.date_range || weekData.phaseDateLabel || '',
          color: pColor,
          weeks: []
        };
      }
      currentPhase.weeks.push(weekData);
    });
    if (currentPhase) result.push(currentPhase);
    return result;
  }, [timeline]);

  // ─── 2. Memoized per-week change maps ────────────────────────────────────
  // Flat array: { phase, week, changes, hasSafetyIssue }
  const weekChangeMaps = useMemo(() => {
    const map = new Map(); // key: w.week → changes object

    phases.forEach((phase, pIdx) => {
      phase.weeks.forEach((w, wIdx) => {
        const prevWeek = wIdx > 0
          ? phase.weeks[wIdx - 1]
          : (pIdx > 0 ? phases[pIdx - 1].weeks[phases[pIdx - 1].weeks.length - 1] : null);

        map.set(w.week, computeMedChanges(w, prevWeek));
      });
    });

    return map;
  }, [phases]);

  // ─── 3. Memoized Change Impact Summary ───────────────────────────────────
  const impactSummary = useMemo(() => {
    let newCount = 0;
    let increaseCount = 0;
    let decreaseCount = 0;
    let removedCount = 0;

    weekChangeMaps.forEach(changes => {
      Object.values(changes).forEach(c => {
        if (c.type === 'new')     newCount++;
        else if (c.type === 'up')   increaseCount++;
        else if (c.type === 'down') decreaseCount++;
        else if (c.type === 'removed') removedCount++;
      });
    });

    const total = newCount + increaseCount + decreaseCount + removedCount;
    return { newCount, increaseCount, decreaseCount, removedCount, total };
  }, [weekChangeMaps]);

  // ─── 5. Memoized plain-text summary for clipboard ────────────────────────
  const summaryText = useMemo(() => {
    const lines = ['=== Protocol Change Summary ==='];
    if (impactSummary.newCount)      lines.push(`• ${impactSummary.newCount} new compound(s) introduced`);
    if (impactSummary.increaseCount) lines.push(`• ${impactSummary.increaseCount} dose increase(s)`);
    if (impactSummary.decreaseCount) lines.push(`• ${impactSummary.decreaseCount} dose decrease(s)`);
    if (impactSummary.removedCount)  lines.push(`• ${impactSummary.removedCount} compound(s) removed`);
    if (costComparison?.before && costComparison?.after) {
      const delta = costComparison.after - costComparison.before;
      const sign  = delta < 0 ? '-' : '+';
      const pct   = Math.abs((delta / costComparison.before) * 100).toFixed(1);
      const cur   = costComparison.currency ?? '$';
      lines.push(`• Investment: ${cur}${costComparison.before.toLocaleString()} → ${cur}${costComparison.after.toLocaleString()} (${sign}${pct}%)`);
    }
    lines.push(`Total protocol changes: ${impactSummary.total}`);
    return lines.join('\n');
  }, [impactSummary, costComparison]);

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ─── 4. Memoized filtered phases (Only Changes toggle) ───────────────────
  const filteredPhases = useMemo(() => {
    if (!onlyChanges) return phases;
    return phases
      .map(phase => ({
        ...phase,
        weeks: phase.weeks.filter(w => {
          const changes = weekChangeMaps.get(w.week) || {};
          return Object.keys(changes).length > 0;
        })
      }))
      .filter(phase => phase.weeks.length > 0);
  }, [phases, weekChangeMaps, onlyChanges]);

  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="clinical-timeline" style={{ padding: '0.25rem' }}>

      {/* ── Investment Mini-Chart ─────────────────────────────────────────── */}
      {costComparison && (
        <InvestmentMiniChart
          before={costComparison.before}
          after={costComparison.after}
          currency={costComparison.currency}
        />
      )}

      {/* ── Change Impact Summary Bar ──────────────────────────────────────── */}
      {impactSummary.total > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.4rem',
          marginBottom: '1rem',
          padding: '0.6rem 0.75rem',
          backgroundColor: 'var(--color-bg-app)',
          borderRadius: '10px',
          border: '1px solid var(--border)',
          fontSize: '0.7rem',
          fontWeight: 700,
        }}>
          <span style={{ color: 'var(--text-muted)', marginRight: '0.25rem', alignSelf: 'center' }}>CHANGES:</span>
          {impactSummary.newCount > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#10B981', backgroundColor: '#d1fae5', padding: '2px 8px', borderRadius: '20px' }}>
              <PlusCircle size={10} /> {impactSummary.newCount} new
            </span>
          )}
          {impactSummary.increaseCount > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f59e0b', backgroundColor: '#fef3c7', padding: '2px 8px', borderRadius: '20px' }}>
              <TrendingUp size={10} /> {impactSummary.increaseCount} increase
            </span>
          )}
          {impactSummary.decreaseCount > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--color-primary)', backgroundColor: '#dbeafe', padding: '2px 8px', borderRadius: '20px' }}>
              <TrendingDown size={10} /> {impactSummary.decreaseCount} decrease
            </span>
          )}
          {impactSummary.removedCount > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--color-danger)', backgroundColor: '#fee2e2', padding: '2px 8px', borderRadius: '20px' }}>
              <MinusCircle size={10} /> {impactSummary.removedCount} removed
            </span>
          )}

          {/* Copy Summary button — right-aligned */}
          <button
            onClick={handleCopySummary}
            title="Copy summary to clipboard"
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 10px',
              fontSize: '0.65rem',
              fontWeight: 800,
              borderRadius: '20px',
              border: `1.5px solid ${copied ? '#10B981' : 'var(--border)'}`,
              backgroundColor: copied ? '#d1fae5' : 'white',
              color: copied ? 'var(--color-success)' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? 'Copied!' : 'Copy Summary'}
          </button>
        </div>
      )}

      {/* ── Only Changes Toggle ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
        <button
          onClick={() => setOnlyChanges(prev => !prev)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 12px',
            fontSize: '0.7rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            borderRadius: '20px',
            border: `1.5px solid ${onlyChanges ? 'var(--primary)' : 'var(--border)'}`,
            backgroundColor: onlyChanges ? 'var(--primary)' : 'white',
            color: onlyChanges ? 'white' : 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: onlyChanges ? '0 3px 10px rgba(0,163,224,0.3)' : 'none',
          }}
        >
          <Filter size={11} />
          ONLY CHANGES
          {onlyChanges && (
            <span style={{
              backgroundColor: 'rgba(255,255,255,0.3)',
              borderRadius: '10px',
              padding: '0 5px',
              fontSize: '0.65rem',
            }}>
              {impactSummary.total}
            </span>
          )}
        </button>
      </div>

      {/* ── Phase + Week Rows ─────────────────────────────────────────────── */}
      {filteredPhases.length === 0 && onlyChanges && (
        <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
          No weeks with protocol changes detected.
        </div>
      )}

      {filteredPhases.map((phase, pIdx) => (
        <div key={pIdx} style={{ marginBottom: '1.25rem' }}>
          {/* Sticky Phase Header */}
          <div style={{
            position: 'sticky',
            top: '0',
            zIndex: 10,
            backgroundColor: 'var(--background)',
            padding: '0.5rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: phase.color, boxShadow: `0 0 10px ${phase.color}40` }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '0.05em' }}>
                {phase.name.toUpperCase()}
              </h4>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{phase.dateLabel}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingLeft: '0.5rem', borderLeft: `1.5px solid ${phase.color}20` }}>
            {phase.weeks.map((w, wIdx) => {
              const isActive = activeWeek === w.week;
              const changes = weekChangeMaps.get(w.week) || {};
              const hasSafetyIssue = w.safety_alerts && w.safety_alerts.length > 0;
              const hasAnyChange = Object.keys(changes).length > 0;

              const meds = w.events
                ? w.events.filter(e => e.type === 'medication')
                : (w.medications || []);

              return (
                <div
                  key={w.week}
                  onClick={() => onWeekSelect(w.week)}
                  style={{
                    position: 'relative',
                    padding: '0.65rem 1rem',
                    backgroundColor: isActive ? 'var(--primary)' : 'white',
                    border: `1.5px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isActive ? '0 6px 16px rgba(0, 163, 224, 0.3)' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transform: isActive ? 'translateX(4px)' : 'none',
                    zIndex: isActive ? 2 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                      color: isActive ? 'white' : 'var(--text-muted)',
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 900
                    }}>
                      {w.week}
                    </div>
                    <div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{
                          fontSize: '0.85rem',
                          fontWeight: 900,
                          color: isActive ? 'white' : 'var(--text-main)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          Week {w.week}
                          {hasSafetyIssue && <AlertTriangle size={14} color={isActive ? 'white' : 'var(--color-danger)'} />}
                        </div>
                        <div style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
                          textTransform: 'uppercase'
                        }}>
                          {formatCompactDateRange(w.date_range || w.dateLabel)}
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        marginTop: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: isActive ? 'rgba(255,255,255,0.9)' : 'var(--text-muted)',
                      }}>
                        {meds.slice(0, 3).map((m, mIdx) => {
                          const title = m.title || m.name;
                          const change = changes[title];
                          return (
                            <div key={mIdx} style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                              <span style={{ fontSize: '0.5rem', opacity: 0.5 }}>●</span>
                              <span>{title}</span>
                              {change && <ChangeIcon type={change.type} isActive={isActive} />}
                            </div>
                          );
                        })}

                        {!hasAnyChange && meds.length > 0 && (
                          <div style={{ fontSize: '0.65rem', opacity: 0.6, fontStyle: 'italic', marginTop: '2px' }}>
                            No change
                          </div>
                        )}

                        {meds.length > 3 && (
                          <div style={{ fontSize: '0.7rem', fontWeight: 800, paddingLeft: '11px', color: isActive ? 'white' : 'var(--primary)', opacity: 0.8 }}>
                            +{meds.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={16} color={isActive ? 'white' : 'var(--border)'} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

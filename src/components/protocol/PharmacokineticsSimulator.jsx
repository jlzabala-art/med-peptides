/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import { Activity, Clock, Heart, Sparkles, TrendingUp, Info, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPeptidePK } from '../../data/peptidePharmacokinetics';

export default function PharmacokineticsSimulator({ compounds = [] }) {
  // Extract unique and valid compounds from the active protocol
  const validCompounds = useMemo(() => {
    return (compounds || [])
      .filter((c) => c && (c.name || c.product_name || c.compound || c.product_slug || c.product_title || c.product_id))
      .map((c) => {
        const rawName = c.product_title || c.name || c.product_name || c.compound || c.product_slug || c.product_id || '';
        const name = rawName.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
        const slug = (c.product_slug || c.product_id || rawName)
          .toLowerCase()
          .replace(/^prd_/, '')
          .replace(/[^a-z0-9-]/g, '');
        const pk = getPeptidePK(slug) || {
          halfLife: '24 hours',
          halfLifeHours: 24,
          steadyState: 'Reached in 5 days',
          notes: 'Standard clearance profile. Consistent administration is recommended to avoid deep troughs in concentration.'
        };
        
        // Parse dosage
        const weeklyDose = c.weekly_dose_amount || parseFloat(c.weekly_dose || c.dose) || 1;
        
        // Parse frequency
        const freqText = (c.dose_logic?.administration_frequency || c.frequency || 'Weekly')
          .toLowerCase()
          .replace(/_/g, ' ');
        let frequencyDays = 7;
        if (freqText.includes('daily')) frequencyDays = 1;
        else if (freqText.includes('every other day') || freqText.includes('eod')) frequencyDays = 2;
        else if (freqText.includes('twice') || freqText.includes('2x')) frequencyDays = 3.5;
        else if (freqText.includes('3x')) frequencyDays = 2.3;
        
        return {
          id: slug,
          name,
          slug,
          halfLife: pk.halfLife,
          halfLifeHours: pk.halfLifeHours,
          steadyState: pk.steadyState,
          notes: pk.notes,
          defaultWeeklyDose: weeklyDose,
          defaultFrequencyDays: frequencyDays,
          defaultFrequencyText: freqText
        };
      });
  }, [compounds]);

  if (!validCompounds.length) return null;

  // Active compound tab state
  const [activeIdx, setActiveIdx] = useState(0);
  const activeCompound = validCompounds[activeIdx];

  // Custom simulation overrides
  const [selectedFreq, setSelectedFreq] = useState(null); // days interval
  const [doseMultiplier, setDoseMultiplier] = useState(1); // 1 = standard
  const [simulationDays, setSimulationDays] = useState(14); // 7, 14, 28
  const [plotMode, setPlotMode] = useState('single'); // 'single' | 'overlay'

  // Calculate current effective simulation values
  const currentInterval = selectedFreq !== null ? selectedFreq : activeCompound.defaultFrequencyDays;
  const halfLifeHours = activeCompound.halfLifeHours || 24;
  const halfLifeDays = halfLifeHours / 24;

  // Generate Single Simulation Points (for active compound)
  const simulationData = useMemo(() => {
    const pointsCount = 120; // Resolution of the curve
    const dataPoints = [];
    const totalDays = simulationDays;
    const ke = Math.LN2 / halfLifeDays;
    
    // Determine dose schedule times
    const doseTimes = [];
    for (let t = 0; t <= totalDays; t += currentInterval) {
      doseTimes.push(t);
    }

    for (let i = 0; i <= pointsCount; i++) {
      const t = (totalDays * i) / pointsCount;
      let concentration = 0;
      
      // Accumulate concentration from all previous doses
      doseTimes.forEach((doseTime) => {
        if (t >= doseTime) {
          // Assume rapid absorption phase (Bateman biexponential equation)
          const ka = 10;
          const timeSinceDose = t - doseTime;
          const term = Math.exp(-ke * timeSinceDose) - Math.exp(-ka * timeSinceDose);
          concentration += Math.max(0, term * doseMultiplier * 100);
        }
      });

      dataPoints.push({
        day: parseFloat(t.toFixed(1)),
        value: parseFloat(concentration.toFixed(1))
      });
    }

    return dataPoints;
  }, [currentInterval, halfLifeDays, doseMultiplier, simulationDays]);

  // Generate All Curves Points (for Overlay Mode)
  const curvesData = useMemo(() => {
    const pointsCount = 120;
    const totalDays = simulationDays;

    return validCompounds.map((comp) => {
      const compInterval = selectedFreq !== null ? selectedFreq : comp.defaultFrequencyDays;
      const compHalfLifeDays = comp.halfLifeHours / 24;
      const ke = Math.LN2 / compHalfLifeDays;
      const ka = 10;

      const doseTimes = [];
      for (let t = 0; t <= totalDays; t += compInterval) {
        doseTimes.push(t);
      }

      const points = [];
      for (let i = 0; i <= pointsCount; i++) {
        const t = (totalDays * i) / pointsCount;
        let concentration = 0;
        
        doseTimes.forEach((doseTime) => {
          if (t >= doseTime) {
            const timeSinceDose = t - doseTime;
            const term = Math.exp(-ke * timeSinceDose) - Math.exp(-ka * timeSinceDose);
            concentration += Math.max(0, term * doseMultiplier * 100);
          }
        });

        points.push({
          day: parseFloat(t.toFixed(1)),
          value: parseFloat(concentration.toFixed(1))
        });
      }

      return {
        compound: comp,
        points
      };
    });
  }, [validCompounds, selectedFreq, doseMultiplier, simulationDays]);

  // Derive useful metrics with robust multi-curve support
  const globalMaxVal = useMemo(() => {
    if (plotMode === 'single') {
      return Math.max(...simulationData.map((d) => d.value), 1);
    }
    let max = 1;
    curvesData.forEach((curve) => {
      curve.points.forEach((p) => {
        if (p.value > max) max = p.value;
      });
    });
    return max;
  }, [plotMode, simulationData, curvesData]);

  // Legacy compatibility alias
  const maxVal = globalMaxVal;

  const lastPoints = simulationData.slice(-10);
  const steadyStateFluctuation = useMemo(() => {
    if (lastPoints.length < 2) return 0;
    const vals = lastPoints.map((p) => p.value);
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    if (max === 0) return 0;
    return Math.round(((max - min) / max) * 100);
  }, [lastPoints]);

  // Convert SVG coordinates
  const width = 600;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const pathString = useMemo(() => {
    return simulationData
      .map((d, i) => {
        const x = paddingLeft + (d.day / simulationDays) * chartWidth;
        const y = height - paddingBottom - (d.value / globalMaxVal) * chartHeight;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [simulationData, simulationDays, globalMaxVal, chartWidth, chartHeight]);

  const areaString = useMemo(() => {
    if (!pathString) return '';
    const startX = paddingLeft;
    const startY = height - paddingBottom;
    const endX = paddingLeft + chartWidth;
    const endY = height - paddingBottom;
    
    const curvePoints = simulationData.map((d) => {
        const x = paddingLeft + (d.day / simulationDays) * chartWidth;
        const y = height - paddingBottom - (d.value / globalMaxVal) * chartHeight;
        return `L ${x} ${y}`;
    }).join(' ');

    return `M ${startX} ${startY} ${curvePoints} L ${endX} ${endY} Z`;
  }, [simulationData, simulationDays, globalMaxVal, chartWidth, chartHeight]);

  // Helper colors based on compounds
  const getThemeColor = (slug) => {
    const s = slug.toLowerCase();
    if (s.includes('bpc') || s.includes('157')) return { main: '#6366f1', soft: '#eef2ff' };
    if (s.includes('tb') || s.includes('thymosin') || s.includes('500')) return { main: '#ec4899', soft: '#fdf2f8' };
    if (s.includes('tirz') || s.includes('sema') || s.includes('retat') || s.includes('glp')) return { main: 'var(--color-success)', soft: '#ecfdf5' };
    if (s.includes('mots') || s.includes('ss-31') || s.includes('mitochondrial')) return { main: '#eab308', soft: '#fef9c3' };
    if (s.includes('ghk') || s.includes('copper')) return { main: '#8b5cf6', soft: '#f5f3ff' };
    return { main: '#0ea5e9', soft: '#f0f9ff' };
  };

  const activeTheme = getThemeColor(activeCompound.slug);

  return (
    <div className="pk-sim-card">
      <style>{`
        .pk-sim-card {
          font-family: 'Inter', system-ui, sans-serif;
          background: #ffffff;
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 16px;
          padding: 1.5rem;
          margin-top: 1.5rem;
          box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
          transition: box-shadow 0.3s ease;
        }
        .pk-sim-title-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }
        .pk-sim-icon-box {
          background: #f0fdf4;
          color: #16a34a;
          padding: 0.5rem;
          border-radius: 10px;
          display: flex;
          align-items: center;
        }
        .pk-sim-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .pk-sim-subtitle {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0.2rem 0 0 0;
          font-weight: 500;
        }
        .pk-tabs {
          display: flex;
          gap: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 0.75rem;
          margin-bottom: 1.25rem;
          overflow-x: auto;
        }
        .pk-tab-btn {
          border: none;
          background: none;
          padding: 0.4rem 0.8rem;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .pk-tab-btn--active {
          background: var(--theme-soft);
          color: var(--theme-main);
        }
        .pk-tab-btn--inactive {
          color: #64748b;
        }
        .pk-tab-btn--inactive:hover {
          background: #f8fafc;
          color: #0f172a;
        }
        .pk-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 768px) {
          .pk-grid {
            grid-template-columns: 1fr;
          }
        }
        .pk-chart-container {
          background: #fafafa;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 0.75rem;
          position: relative;
        }
        .pk-controls {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .pk-control-group {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1rem;
        }
        .pk-control-label {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #475569;
          margin-bottom: 0.6rem;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .pk-freq-options {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.4rem;
        }
        .pk-freq-btn {
          border: 1px solid #cbd5e1;
          background: #fff;
          padding: 0.35rem 0;
          font-size: 0.68rem;
          font-weight: 700;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: center;
        }
        .pk-freq-btn--active {
          border-color: var(--theme-main);
          background: var(--theme-soft);
          color: var(--theme-main);
        }
        .pk-freq-btn:hover:not(.pk-freq-btn--active) {
          background: #f1f5f9;
        }
        .pk-info-banner {
          background: #f8fafc;
          border-left: 4px solid var(--theme-main);
          padding: 0.75rem 1rem;
          border-radius: 0 10px 10px 0;
          margin-top: 1rem;
        }
        .pk-info-text {
          font-size: 0.75rem;
          line-height: 1.5;
          color: #334155;
          margin: 0;
        }
        .pk-stat-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        .pk-stat-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.5rem;
          text-align: center;
        }
        .pk-stat-val {
          font-size: 0.9rem;
          font-weight: 800;
          color: #0f172a;
          font-family: 'JetBrains Mono', monospace;
        }
        .pk-stat-lbl {
          font-size: 0.58rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 0.15rem;
        }
        .pk-badge-ai {
          display: inline-flex;
          align-items: center;
          gap: 0.2rem;
          font-size: 0.58rem;
          font-weight: 800;
          background: #f3e8ff;
          color: #7c3aed;
          padding: 0.15rem 0.45rem;
          border-radius: 20px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-left: auto;
        }
      `}</style>

      {/* Header */}
      <div className="pk-sim-title-group">
        <div className="pk-sim-icon-box">
          <Activity size={18} />
        </div>
        <div>
          <h3 className="pk-sim-title">Pharmacokinetic Simulation Engine</h3>
          <p className="pk-sim-subtitle">Interactive plasma concentration and biological residence time modeling</p>
        </div>
        <span className="pk-badge-ai">
          <Sparkles size={9} />
          Simulation Active
        </span>
      </div>

      {/* Tabs */}
      {validCompounds.length > 1 && plotMode === 'single' && (
        <div className="pk-tabs">
          {validCompounds.map((c, i) => {
            const theme = getThemeColor(c.slug);
            const isActive = activeIdx === i;
            return (
              <button
                key={c.id}
                className={`pk-tab-btn ${isActive ? 'pk-tab-btn--active' : 'pk-tab-btn--inactive'}`}
                style={{
                  '--theme-soft': theme.soft,
                  '--theme-main': theme.main
                }}
                onClick={() => {
                  setActiveIdx(i);
                  setSelectedFreq(null); // Reset overrides
                }}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid */}
      <div
        className="pk-grid"
        style={{
          '--theme-soft': activeTheme.soft,
          '--theme-main': activeTheme.main
        }}
      >
        {/* Left column: SVG Chart */}
        <div className="pk-chart-container">
          <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="auto">
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = paddingTop + ratio * chartHeight;
              const concentrationPct = Math.round((1 - ratio) * 100);
              return (
                <g key={ratio} opacity="0.15">
                  <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="var(--color-text-secondary)" strokeWidth="0.5" strokeDasharray="3,3" />
                  <text x={paddingLeft - 8} y={y + 3} fill="var(--color-text-secondary)" fontSize="7" fontWeight="bold" textAnchor="end">{concentrationPct}%</text>
                </g>
              );
            })}

            {/* Vertical Time Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const x = paddingLeft + ratio * chartWidth;
              const currentDay = Math.round(ratio * simulationDays);
              return (
                <g key={ratio} opacity="0.15">
                  <line x1={x} y1={paddingTop} x2={x} y2={height - paddingBottom} stroke="var(--color-text-secondary)" strokeWidth="0.5" />
                  <text x={x} y={height - paddingBottom + 12} fill="var(--color-text-secondary)" fontSize="7" fontWeight="bold" textAnchor="middle">Day {currentDay}</text>
                </g>
              );
            })}

            {/* Shaded Steady State Window */}
            {simulationDays >= 14 && plotMode === 'single' && (
              <rect
                x={paddingLeft + chartWidth * 0.5}
                y={paddingTop}
                width={chartWidth * 0.5}
                height={chartHeight}
                fill={activeTheme.main}
                opacity="0.03"
              />
            )}

            {/* Therapeutic Range Band */}
            <rect
              x={paddingLeft}
              y={paddingTop + chartHeight * 0.3}
              width={chartWidth}
              height={chartHeight * 0.45}
              fill="var(--color-success)"
              fillOpacity="0.04"
              stroke="var(--color-success)"
              strokeOpacity="0.1"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
            <text
              x={paddingLeft + 8}
              y={paddingTop + chartHeight * 0.52 + 3}
              fill="var(--color-success)"
              fillOpacity="0.5"
              fontSize="7"
              fontWeight="bold"
              letterSpacing="0.05em"
            >
              RANGO TERAPÉUTICO ÓPTIMO
            </text>

            {/* Concentration Curve Fill(s) */}
            {plotMode === 'single' ? (
              areaString && (
                <motion.path
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, d: areaString }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  fill={`url(#areaGrad-${activeCompound.slug})`}
                />
              )
            ) : (
              curvesData.map((curve) => {
                const theme = getThemeColor(curve.compound.slug);
                const startX = paddingLeft;
                const startY = height - paddingBottom;
                const endX = paddingLeft + chartWidth;
                const endY = height - paddingBottom;

                const curvePts = curve.points
                  .map((d) => {
                    const x = paddingLeft + (d.day / simulationDays) * chartWidth;
                    const y = height - paddingBottom - (d.value / globalMaxVal) * chartHeight;
                    return `L ${x} ${y}`;
                  })
                  .join(' ');
                
                const areaStr = `M ${startX} ${startY} ${curvePts} L ${endX} ${endY} Z`;
                
                return (
                  <motion.path
                    key={`area-${curve.compound.slug}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.12, d: areaStr }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    fill={`url(#areaGrad-${curve.compound.slug})`}
                  />
                );
              })
            )}

            {/* Concentration Curve Path(s) */}
            {plotMode === 'single' ? (
              pathString && (
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1, d: pathString }}
                  transition={{ duration: 0.75, ease: 'easeInOut' }}
                  fill="none"
                  stroke={activeTheme.main}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )
            ) : (
              curvesData.map((curve) => {
                const theme = getThemeColor(curve.compound.slug);
                const ptsString = curve.points
                  .map((d, i) => {
                    const x = paddingLeft + (d.day / simulationDays) * chartWidth;
                    const y = height - paddingBottom - (d.value / globalMaxVal) * chartHeight;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .join(' ');
                
                return (
                  <motion.path
                    key={`line-${curve.compound.slug}`}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1, d: ptsString }}
                    transition={{ duration: 0.75, ease: 'easeInOut' }}
                    fill="none"
                    stroke={theme.main}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })
            )}

            {/* Dose Marks timeline spikes (single compound) */}
            {plotMode === 'single' && (
              (() => {
                const compInterval = selectedFreq !== null ? selectedFreq : activeCompound.defaultFrequencyDays;
                const doseTimes = [];
                for (let t = 0; t <= simulationDays; t += compInterval) {
                  doseTimes.push(t);
                }
                return doseTimes.map((t, idx) => {
                  const x = paddingLeft + (t / simulationDays) * chartWidth;
                  return (
                    <g key={idx}>
                      <line
                        x1={x}
                        y1={height - paddingBottom}
                        x2={x}
                        y2={height - paddingBottom - 4}
                        stroke={activeTheme.main}
                        strokeWidth="1.5"
                      />
                      <circle
                        cx={x}
                        cy={height - paddingBottom - 4}
                        r="2.5"
                        fill={activeTheme.main}
                        stroke="var(--color-bg-surface)"
                        strokeWidth="0.5"
                      />
                    </g>
                  );
                });
              })()
            )}

            {/* Legend Overlay when in Multi Mode */}
            {plotMode === 'overlay' && (
              <g transform={`translate(${paddingLeft + 12}, ${paddingTop + 10})`}>
                {validCompounds.map((c, i) => {
                  const theme = getThemeColor(c.slug);
                  const y = i * 14;
                  return (
                    <g key={c.id} transform={`translate(0, ${y})`}>
                      <rect x="0" y="-1" width="8" height="8" rx="2" fill={theme.main} />
                      <text x="14" y="6" fill="var(--color-text-secondary)" fontSize="7" fontWeight="800">{c.name}</text>
                    </g>
                  );
                })}
              </g>
            )}

            {/* Chart Frame Border */}
            <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={height - paddingBottom} stroke="var(--color-border)" strokeWidth="1" />
            <line x1={paddingLeft} y1={height - paddingBottom} x2={width - paddingRight} y2={height - paddingBottom} stroke="var(--color-border)" strokeWidth="1" />

            {/* Gradients */}
            <defs>
              {validCompounds.map((comp) => {
                const theme = getThemeColor(comp.slug);
                return (
                  <linearGradient key={`grad-${comp.slug}`} id={`areaGrad-${comp.slug}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={theme.main} stopOpacity="0.22" />
                    <stop offset="100%" stopColor={theme.main} stopOpacity="0.0" />
                  </linearGradient>
                );
              })}
            </defs>
          </svg>

          {/* Dynamic PK statistics row */}
          <div className="pk-stat-row">
            <div className="pk-stat-box">
              <div className="pk-stat-val" style={{ color: activeTheme.main }}>{activeCompound.halfLife}</div>
              <div className="pk-stat-lbl">Half-Life</div>
            </div>
            <div className="pk-stat-box">
              <div className="pk-stat-val">{activeCompound.steadyState.replace('Reached in', '').trim()}</div>
              <div className="pk-stat-lbl">To Steady State</div>
            </div>
            <div className="pk-stat-box">
              <div className="pk-stat-val">{steadyStateFluctuation}%</div>
              <div className="pk-stat-lbl">Fluctuation Index</div>
            </div>
          </div>
        </div>

        {/* Right column: Controls & Interactive Info */}
        <div className="pk-controls">
          {/* Visual Mode Selector Toggle */}
          {validCompounds.length > 1 && (
            <div className="pk-control-group">
              <span className="pk-control-label">
                <Sparkles size={11} color="#7c3aed" /> Modalidad del Gráfico
              </span>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  onClick={() => setPlotMode('single')}
                  style={{
                    flex: 1,
                    border: '1px solid #e2e8f0',
                    background: plotMode === 'single' ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' : 'var(--color-bg-surface)',
                    color: plotMode === 'single' ? 'var(--color-bg-surface)' : 'var(--color-text-secondary)',
                    borderColor: plotMode === 'single' ? '#7c3aed' : 'var(--color-border)',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '0.45rem 0',
                    borderRadius: 8,
                    cursor: 'pointer',
                    boxShadow: plotMode === 'single' ? '0 4px 12px rgba(124,58,237,0.18)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Individual
                </button>
                <button
                  onClick={() => setPlotMode('overlay')}
                  style={{
                    flex: 1,
                    border: '1px solid #e2e8f0',
                    background: plotMode === 'overlay' ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' : 'var(--color-bg-surface)',
                    color: plotMode === 'overlay' ? 'var(--color-bg-surface)' : 'var(--color-text-secondary)',
                    borderColor: plotMode === 'overlay' ? '#7c3aed' : 'var(--color-border)',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '0.45rem 0',
                    borderRadius: 8,
                    cursor: 'pointer',
                    boxShadow: plotMode === 'overlay' ? '0 4px 12px rgba(124,58,237,0.18)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Superponer Todos
                </button>
              </div>
            </div>
          )}

          <div className="pk-control-group">
            <span className="pk-control-label">
              <Clock size={11} /> Frecuencia de Dosificación
            </span>
            <div className="pk-freq-options">
              {[
                { label: 'Daily', val: 1 },
                { label: 'EOD', val: 2 },
                { label: '2x/Wk', val: 3.5 },
                { label: 'Weekly', val: 7 }
              ].map((opt) => {
                const isActive = currentInterval === opt.val;
                return (
                  <button
                    key={opt.label}
                    className={`pk-freq-btn ${isActive ? 'pk-freq-btn--active' : ''}`}
                    onClick={() => setSelectedFreq(opt.val)}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                <span>Rango de Simulación</span>
                <span>{simulationDays} Días</span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {[7, 14, 28].map((days) => (
                  <button
                    key={days}
                    onClick={() => setSimulationDays(days)}
                    style={{
                      flex: 1,
                      border: '1px solid #cbd5e1',
                      background: simulationDays === days ? 'var(--color-text-secondary)' : 'var(--color-bg-surface)',
                      color: simulationDays === days ? 'var(--color-bg-surface)' : 'var(--color-text-secondary)',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '0.25rem 0',
                      borderRadius: 4,
                      cursor: 'pointer'
                    }}
                  >
                    {days}D
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pk-info-banner">
            <p className="pk-info-text">
              <strong>Clinical Rationale:</strong> {activeCompound.notes}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

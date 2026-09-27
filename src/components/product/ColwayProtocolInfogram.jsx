"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles, Droplets, Thermometer, Clock, ShieldCheck,
  Activity, CheckCircle2, AlertTriangle, ChevronRight,
  Layers, Microscope, Zap, ArrowRight, RefreshCw, Scissors, Info, Beaker
} from 'lucide-react';

/**
 * ColwayProtocolInfogram
 * Visual trichology infographic & professional application protocol for Colway Hair System
 * Covers both Colway Strengthening Shampoo & Strengthening Conditioner.
 */
export default function ColwayProtocolInfogram({
  currentProduct = 'shampoo', // 'shampoo' | 'conditioner'
  lang = 'en',
  onSelectProduct
}) {
  const isDefaultShampoo = currentProduct?.toLowerCase().includes('shampoo');
  const [activeTab, setActiveTab] = useState(isDefaultShampoo ? 'shampoo' : 'conditioner');
  const [hoveredZone, setHoveredZone] = useState(null);

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
      marginBottom: '1.5rem'
    }}>
      {/* Top Banner & Tab Controls */}
      <div style={{
        background: 'linear-gradient(135deg, #071e3d 0%, #003666 50%, #0d9488 100%)',
        padding: '1.25rem 1.5rem',
        color: '#ffffff',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.66rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
              padding: '3px 10px',
              borderRadius: '99px',
              marginBottom: '6px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Microscope size={12} color="#5eead4" />
              <span>Trichology Mechanism &amp; Application Protocol</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: '#ffffff', letterSpacing: '-0.02em' }}>
              Colway Dual-Action Hair Strengthening System
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#cbd5e1', maxWidth: '640px', lineHeight: 1.45 }}>
              Biological action infographic mapping active penetration at the scalp microenvironment, follicular papilla, and cortical hair shaft.
            </p>
          </div>

          {/* Tab Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(15, 23, 42, 0.45)',
            padding: '3px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            gap: '3px'
          }}>
            <button
              type="button"
              onClick={() => setActiveTab('shampoo')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '0.74rem',
                fontWeight: 700,
                borderRadius: '7px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: activeTab === 'shampoo' ? '#0d9488' : 'transparent',
                color: activeTab === 'shampoo' ? '#ffffff' : '#cbd5e1'
              }}
            >
              <Droplets size={13} />
              <span>1. Shampoo (Scalp &amp; Bulge)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('conditioner')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '0.74rem',
                fontWeight: 700,
                borderRadius: '7px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: activeTab === 'conditioner' ? '#0284c7' : 'transparent',
                color: activeTab === 'conditioner' ? '#ffffff' : '#cbd5e1'
              }}
            >
              <Sparkles size={13} />
              <span>2. Conditioner (Fiber &amp; Cuticle)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('synergy')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '0.74rem',
                fontWeight: 700,
                borderRadius: '7px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: activeTab === 'synergy' ? '#7c3aed' : 'transparent',
                color: activeTab === 'synergy' ? '#ffffff' : '#cbd5e1'
              }}
            >
              <Layers size={13} />
              <span>Dual-Action Routine</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Infographic Area */}
      <div style={{ padding: '1.25rem 1.5rem' }}>

        {/* ============================================================== */}
        {/* TAB 1: SHAMPOO INFOGRAM (SCALP & FOLLICULAR PENETRATION)        */}
        {/* ============================================================== */}
        {activeTab === 'shampoo' && (
          <div>
            {/* Quick Metrics Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '10px',
              marginBottom: '1.25rem'
            }}>
              <div style={{ padding: '10px 12px', background: '#f0fdfa', borderRadius: '8px', border: '1px solid #ccfbf1' }}>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase' }}>Target Zone</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>Scalp &amp; Dermal Papilla</div>
              </div>
              <div style={{ padding: '10px 12px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>Pre-Wash Water Temp</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>36°C – 38°C (Warm)</div>
              </div>
              <div style={{ padding: '10px 12px', background: '#faf5ff', borderRadius: '8px', border: '1px solid #e9d5ff' }}>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' }}>Active Dwell Time</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>3 – 5 Minutes</div>
              </div>
              <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Physiological pH</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>pH 4.8 – 5.2 (Acid Mantle)</div>
              </div>
            </div>

            {/* Visual Biological Scalp Cross-Section SVG Diagram */}
            <div style={{
              background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.25rem',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={16} color="#0d9488" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                    Follicular Influx &amp; 5α-Reductase Blockade Diagram
                  </span>
                </div>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                  Hover over or review layers below to inspect cellular actions
                </span>
              </div>

              {/* Scalp & Follicle Anatomy Vector Illustration */}
              <div style={{ width: '100%', overflowX: 'auto' }}>
                <svg
                  viewBox="0 0 800 320"
                  style={{ width: '100%', minWidth: '640px', height: 'auto', display: 'block', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                >
                  <defs>
                    <linearGradient id="shampooWaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0.05" />
                    </linearGradient>
                    <linearGradient id="epidermisGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#fef3c7" />
                      <stop offset="100%" stopColor="#fde68a" />
                    </linearGradient>
                    <linearGradient id="dermisGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#fed7aa" />
                      <stop offset="100%" stopColor="#fdba74" />
                    </linearGradient>
                    <linearGradient id="hairBulbGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#0284c7" />
                      <stop offset="100%" stopColor="#0369a1" />
                    </linearGradient>
                    <linearGradient id="activeBeam" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#0d9488" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>

                  {/* Zone 1: Scalp Surface / Water lather */}
                  <rect x="0" y="0" width="800" height="55" fill="url(#shampooWaterGrad)" />
                  <line x1="0" y1="55" x2="800" y2="55" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" />
                  <text x="25" y="24" fill="#0369a1" fontSize="11" fontWeight="700">ZONE 1: SCALP STRATUM CORNEUM (pH 4.8–5.2)</text>
                  <text x="25" y="42" fill="#0284c7" fontSize="10">Mild Cleansing (SCI) • Sebum Dissolution • Zinc PCA Acid Mantle Protection</text>

                  {/* Surface foam bubbles */}
                  <circle cx="280" cy="28" r="6" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.5" />
                  <circle cx="295" cy="22" r="9" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.5" />
                  <circle cx="312" cy="30" r="5" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.5" />
                  <circle cx="325" cy="24" r="8" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.5" />

                  {/* Zone 2: Epidermis & Sebaceous Layer */}
                  <rect x="0" y="55" width="800" height="70" fill="url(#epidermisGrad)" opacity="0.65" />
                  <text x="25" y="78" fill="#92400e" fontSize="11" fontWeight="700">ZONE 2: FOLLICULAR INFUNDIBULUM &amp; SEBACEOUS GLAND</text>
                  <text x="25" y="96" fill="#b45309" fontSize="10">Sebum plug cleared by lukewarm 36–38°C water • Zinc PCA suppresses 5α-reductase type II</text>

                  {/* Zone 3: Dermis & Connective Tissue */}
                  <rect x="0" y="125" width="800" height="195" fill="url(#dermisGrad)" opacity="0.5" />
                  <text x="25" y="150" fill="#9a3412" fontSize="11" fontWeight="700">ZONE 3: DERMAL PAPILLA &amp; FOLLICULAR BULGE (STEM CELLS)</text>
                  <text x="25" y="168" fill="#c2410c" fontSize="10">Caffeine 120s rapid penetration → ↑ cAMP → IGF-1 stimulation • Baicapil™ extends Anagen phase</text>

                  {/* Hair Follicle Channel & Shaft */}
                  {/* Follicle invagination background */}
                  <path d="M 400 55 C 400 110, 420 220, 440 250 C 450 265, 470 270, 480 250 C 500 220, 520 110, 520 55 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />

                  {/* Active Penetration Flow Beam */}
                  <path d="M 420 55 C 420 110, 435 210, 445 235 C 455 250, 465 250, 475 235 C 485 210, 500 110, 500 55 Z" fill="url(#activeBeam)" />

                  {/* Hair Shaft Emerging */}
                  <rect x="445" y="0" width="30" height="240" rx="3" fill="#1e293b" />
                  <rect x="449" y="0" width="22" height="240" fill="#334155" opacity="0.5" />

                  {/* Hair Bulb */}
                  <ellipse cx="460" cy="250" rx="22" ry="20" fill="url(#hairBulbGrad)" />
                  <circle cx="460" cy="254" r="8" fill="#0f766e" />

                  {/* Capillary Blood Supply Loop */}
                  <path d="M 430 295 C 440 275, 455 265, 460 265 C 465 265, 480 275, 490 295" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                  <line x1="430" y1="295" x2="430" y2="315" stroke="#ef4444" strokeWidth="2.5" />
                  <line x1="490" y1="295" x2="490" y2="315" stroke="#ef4444" strokeWidth="2.5" />
                  <text x="500" y="300" fill="#dc2626" fontSize="9" fontWeight="700">Perifollicular Capillaries</text>
                  <text x="500" y="312" fill="#991b1b" fontSize="8.5">Niacinamide + Massage dilates VEGF flow</text>

                  {/* Sebaceous Gland graphic */}
                  <ellipse cx="375" cy="100" rx="18" ry="12" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
                  <ellipse cx="365" cy="112" rx="14" ry="10" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
                  <text x="260" y="112" fill="#b45309" fontSize="9" fontWeight="700">Sebaceous Gland</text>
                  <line x1="345" y1="108" x2="360" y2="108" stroke="#b45309" strokeWidth="1" strokeDasharray="2 2" />

                  {/* Active Compound Badges Floating In Shaft Channel */}
                  {/* Caffeine */}
                  <g transform="translate(535, 115)">
                    <rect x="0" y="0" width="135" height="24" rx="12" fill="#0f766e" />
                    <text x="10" y="16" fill="#ffffff" fontSize="9.5" fontWeight="700">⚡ Caffeine (120s Influx)</text>
                  </g>
                  {/* Baicapil */}
                  <g transform="translate(535, 145)">
                    <rect x="0" y="0" width="145" height="24" rx="12" fill="#0284c7" />
                    <text x="10" y="16" fill="#ffffff" fontSize="9.5" fontWeight="700">🛡️ Baicapil™ (Anti-DHT)</text>
                  </g>
                  {/* Native Tropocollagen */}
                  <g transform="translate(535, 175)">
                    <rect x="0" y="0" width="155" height="24" rx="12" fill="#7c3aed" />
                    <text x="10" y="16" fill="#ffffff" fontSize="9.5" fontWeight="700">🧬 Fish Tropocollagen</text>
                  </g>
                  {/* Zinc PCA */}
                  <g transform="translate(205, 75)">
                    <rect x="0" y="0" width="125" height="22" rx="11" fill="#d97706" />
                    <text x="10" y="15" fill="#ffffff" fontSize="9" fontWeight="700">⚖️ Zinc PCA (Sebostatic)</text>
                  </g>
                </svg>
              </div>
            </div>

            {/* 4 Step Sequential Process Protocol for Shampoo */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#0d9488', color: '#fff', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>Pre-Wash Thermal Prep</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.74rem', color: '#475569', lineHeight: 1.5 }}>
                  Rinse scalp thoroughly with warm water (<strong>36–38°C</strong>) for 60 seconds. Opens follicular ostia and dissolves excess sebum plugs without irritating sensitive dermis.
                </p>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#0d9488', color: '#fff', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>Scalp-First Emulsification</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.74rem', color: '#475569', lineHeight: 1.5 }}>
                  Dispense 5–10 mL. Emulsify between palms for 10 seconds. Apply directly to the <strong>scalp crown &amp; vertex first</strong>, rather than hair tips, to focus active concentration.
                </p>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#0d9488', color: '#fff', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>2–3 Min Circular Massage</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.74rem', color: '#475569', lineHeight: 1.5 }}>
                  Use fingertip pads in slow circular pulses. Stimulates perifollicular capillary vasodilation (VEGF) and increases caffeine follicular penetration by up to <strong>+40%</strong>.
                </p>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#0d9488', color: '#fff', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>3–5 Min Active Dwell</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.74rem', color: '#475569', lineHeight: 1.5 }}>
                  Leave foam on scalp for 3 to 5 minutes before rinsing. Mandatory contact window for Caffeine &amp; Baicalin receptor binding at the dermal papilla. Rinse ≤38°C.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: CONDITIONER INFOGRAM (HAIR FIBER & CUTICLE BIOSEAL)      */}
        {/* ============================================================== */}
        {activeTab === 'conditioner' && (
          <div>
            {/* Quick Metrics Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '10px',
              marginBottom: '1.25rem'
            }}>
              <div style={{ padding: '10px 12px', background: '#e0f2fe', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>Target Zone</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>Hair Shaft &amp; Cuticle (Lengths)</div>
              </div>
              <div style={{ padding: '10px 12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>Final Cold Lock Rinse</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>18°C – 22°C (Cool Rinse)</div>
              </div>
              <div style={{ padding: '10px 12px', background: '#faf5ff', borderRadius: '8px', border: '1px solid #e9d5ff' }}>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' }}>Tensile Reinforcement</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>+24% Fiber Breakage Resistance</div>
              </div>
              <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Acidic Sealing pH</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>pH 4.0 – 4.5 (Cuticle Closes)</div>
              </div>
            </div>

            {/* Visual Biological Hair Fiber Cross-Section SVG Diagram */}
            <div style={{
              background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="#0284c7" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                    Hair Shaft Structural Microarchitecture &amp; Cuticular Bioseal Diagram
                  </span>
                </div>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                  Tropocollagen triple helix matrix &amp; hydrophobic F-layer restoration
                </span>
              </div>

              {/* Vector diagram of Hair Cuticle & Cortex Layers */}
              <div style={{ width: '100%', overflowX: 'auto' }}>
                <svg
                  viewBox="0 0 800 320"
                  style={{ width: '100%', minWidth: '640px', height: 'auto', display: 'block', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                >
                  <defs>
                    <linearGradient id="cortexGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f3e8ff" />
                      <stop offset="50%" stopColor="#e9d5ff" />
                      <stop offset="100%" stopColor="#d8b4fe" />
                    </linearGradient>
                    <linearGradient id="cuticleScaleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#0284c7" />
                      <stop offset="100%" stopColor="#0369a1" />
                    </linearGradient>
                    <linearGradient id="flayerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>

                  {/* Left Column: Cortex Core */}
                  <rect x="40" y="30" width="220" height="260" rx="8" fill="url(#cortexGrad)" stroke="#c084fc" strokeWidth="1.5" />
                  <text x="55" y="58" fill="#581c87" fontSize="12" fontWeight="800">1. CORTEX INTERIOR</text>
                  <text x="55" y="76" fill="#7e22ce" fontSize="9.5" fontWeight="600">Native Collagen &amp; Keratin Core</text>

                  {/* Keratin microfibril bundles */}
                  <g fill="#a855f7" opacity="0.3">
                    <circle cx="80" cy="110" r="14" /><circle cx="115" cy="110" r="14" /><circle cx="150" cy="110" r="14" />
                    <circle cx="97" cy="138" r="14" /><circle cx="132" cy="138" r="14" /><circle cx="167" cy="138" r="14" />
                    <circle cx="80" cy="166" r="14" /><circle cx="115" cy="166" r="14" /><circle cx="150" cy="166" r="14" />
                    <circle cx="97" cy="194" r="14" /><circle cx="132" cy="194" r="14" />
                  </g>

                  {/* Collagen Triple Helix Overlay Lines */}
                  <path d="M 60 230 Q 110 215 160 230 T 240 230" fill="none" stroke="#7c3aed" strokeWidth="3" />
                  <path d="M 60 240 Q 110 255 160 240 T 240 240" fill="none" stroke="#9333ea" strokeWidth="2.5" strokeDasharray="3 3" />
                  <text x="55" y="272" fill="#6b21a8" fontSize="9">Intact Gly-Pro-Hyp Triple Helix</text>
                  <text x="55" y="284" fill="#581c87" fontSize="8.5">+24% Tensile Elasticity (PMID: 36585145)</text>

                  {/* Middle Column: Cuticle Scales (Overlapping shingles) */}
                  <g transform="translate(290, 30)">
                    <rect x="0" y="0" width="220" height="260" rx="8" fill="#f0f9ff" stroke="#bae6fd" strokeWidth="1.5" />
                    <text x="15" y="28" fill="#0369a1" fontSize="12" fontWeight="800">2. CUTICLE LAMELLAE</text>
                    <text x="15" y="46" fill="#0284c7" fontSize="9.5" fontWeight="600">Acidic Realignment &amp; Cationic Seal</text>

                    {/* Shingle overlapping scales */}
                    {[0, 35, 70, 105, 140, 175].map((yOffset, idx) => (
                      <path
                        key={idx}
                        d={`M 15 ${65 + yOffset} L 195 ${60 + yOffset} L 185 ${80 + yOffset} L 25 ${85 + yOffset} Z`}
                        fill="#0284c7"
                        opacity={0.85 - idx * 0.08}
                        stroke="#0369a1"
                        strokeWidth="1"
                      />
                    ))}
                    <text x="25" y="260" fill="#0284c7" fontSize="8.5">BTMS-50 neutralizes -60mV charge</text>
                    <text x="25" y="272" fill="#0369a1" fontSize="8.5">Silk Amino Acids (Ra −34% roughness)</text>
                  </g>

                  {/* Right Column: Outer F-Layer Lipid Shield */}
                  <g transform="translate(540, 30)">
                    <rect x="0" y="0" width="220" height="260" rx="8" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1.5" />
                    <text x="15" y="28" fill="#166534" fontSize="12" fontWeight="800">3. 18-MEA LIPID SHIELD</text>
                    <text x="15" y="46" fill="#15803d" fontSize="9.5" fontWeight="600">Virgin Argan Oil &amp; Cool Rinse</text>

                    {/* Hydrophobic lipid protective coating barrier */}
                    <rect x="15" y="65" width="190" height="15" rx="7.5" fill="#10b981" />
                    <text x="25" y="76" fill="#ffffff" fontSize="8.5" fontWeight="700">18-MEA Hydrophobic Coating</text>

                    <circle cx="50" cy="120" r="16" fill="#ecfdf5" stroke="#10b981" strokeWidth="2" />
                    <text x="44" y="124" fill="#047857" fontSize="12">💧</text>
                    <text x="75" y="118" fill="#166534" fontSize="9" fontWeight="700">Water Repellent Barrier</text>
                    <text x="75" y="130" fill="#15803d" fontSize="8">Hydrophobic contact angle &gt; 95°</text>

                    <circle cx="50" cy="165" r="16" fill="#fffbeb" stroke="#f59e0b" strokeWidth="2" />
                    <text x="44" y="170" fill="#b45309" fontSize="12">🛡️</text>
                    <text x="75" y="163" fill="#92400e" fontSize="9" fontWeight="700">Thermal Defense (230°C)</text>
                    <text x="75" y="175" fill="#b45309" fontSize="8">α-Tocopherols absorb free radicals</text>

                    <circle cx="50" cy="210" r="16" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2" />
                    <text x="44" y="215" fill="#1d4ed8" fontSize="12">❄️</text>
                    <text x="75" y="208" fill="#1e40af" fontSize="9" fontWeight="700">Cold Water Lock (18–22°C)</text>
                    <text x="75" y="220" fill="#2563eb" fontSize="8">Shrinks cuticle cells shut</text>
                  </g>

                  {/* Connective Arrows across stages */}
                  <path d="M 265 160 L 285 160" stroke="#0284c7" strokeWidth="2" markerEnd="url(#arrow)" />
                  <path d="M 515 160 L 535 160" stroke="#16a34a" strokeWidth="2" markerEnd="url(#arrow)" />
                </svg>
              </div>
            </div>

            {/* 4 Step Sequential Process Protocol for Conditioner */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#0284c7', color: '#fff', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>Towel Press Excess Moisture</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.74rem', color: '#475569', lineHeight: 1.5 }}>
                  Gently press excess water using a microfiber towel until hair is <strong>~70% damp</strong>. Never rub vigorously, which fractures open wet cuticles.
                </p>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#0284c7', color: '#fff', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>Lengths &amp; Ends (Avoid Scalp)</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.74rem', color: '#475569', lineHeight: 1.5 }}>
                  Apply 5–8 mL starting <strong>5 cm below roots down to the tips</strong>. Never apply directly to scalp to prevent clogging newly opened follicular ostia.
                </p>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#0284c7', color: '#fff', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>Wide-Tooth Section Detangle</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.74rem', color: '#475569', lineHeight: 1.5 }}>
                  Distribute using a wide-tooth comb from tips upward. Ensures even BTMS-50 lipid deposition and reduces wet comb drag force by <strong>−62%</strong>.
                </p>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#0284c7', color: '#fff', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>18–22°C Cold Cuticle Lock</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.74rem', color: '#475569', lineHeight: 1.5 }}>
                  Rinse with <strong>cool/cold water (18–22°C) for 30–45s</strong>. Cold thermal stimulus contracts cuticle scales flat, sealing inside the collagen peptides &amp; gloss lipids.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: DUAL-ACTION SYNERGY (THE COMPLETE COLWAY SYSTEM)        */}
        {/* ============================================================== */}
        {activeTab === 'synergy' && (
          <div>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                <Layers size={18} color="#7c3aed" />
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                  The 2-Phase Trichology Synergy System
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                When applied in sequence, the Shampoo and Conditioner create a complementary inside-out biological cascade: Phase 1 reactivates the dermal root and neutralizes DHT; Phase 2 locks the cortex and coats the fiber against environmental trauma.
              </p>

              {/* Dual System Comparison Columns */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                {/* Shampoo Column */}
                <div style={{
                  background: '#ffffff',
                  border: '1.5px solid #ccfbf1',
                  borderRadius: '10px',
                  padding: '1rem',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0d9488', background: '#f0fdfa', padding: '2px 8px', borderRadius: '99px' }}>
                      STEP 1 · SCALP &amp; ROOT
                    </span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b' }}>pH 4.8 – 5.2</span>
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                    Colway Strengthening Shampoo
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.74rem', color: '#334155', lineHeight: 1.6 }}>
                    <li><strong>Target:</strong> Scalp epidermis, follicular ostia, dermal papilla.</li>
                    <li><strong>Cleansing:</strong> Sulfate-free SCI surfactant protects scalp acid mantle.</li>
                    <li><strong>DHT Blockade:</strong> Zinc PCA + Baicalin arrest 5α-reductase activity.</li>
                    <li><strong>Follicular Influx:</strong> Caffeine penetrates to root within 120s, elevating cAMP &amp; IGF-1.</li>
                  </ul>
                </div>

                {/* Conditioner Column */}
                <div style={{
                  background: '#ffffff',
                  border: '1.5px solid #bae6fd',
                  borderRadius: '10px',
                  padding: '1rem',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '99px' }}>
                      STEP 2 · SHAFT &amp; CUTICLE
                    </span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b' }}>pH 4.0 – 4.5</span>
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                    Colway Strengthening Conditioner
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.74rem', color: '#334155', lineHeight: 1.6 }}>
                    <li><strong>Target:</strong> Cortical macrofibrils, cuticle scales, 18-MEA lipid layer.</li>
                    <li><strong>Cortex Matrix:</strong> Native Fish Tropocollagen deposits triple-helix scaffolding.</li>
                    <li><strong>Cuticle Realignment:</strong> Cationic BTMS-50 + Silk Amino Acids smooth scales.</li>
                    <li><strong>Cold Lock (18–22°C):</strong> Physical closing of cuticular shingles locks moisture in.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Clinical Mesotherapy / GHK-Cu Pairing Box */}
            <div style={{
              background: 'linear-gradient(135deg, #f0fdfa 0%, #eff6ff 100%)',
              border: '1px solid #99f6e4',
              borderRadius: '10px',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: '8px',
                background: '#0d9488',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Zap size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f766e', marginBottom: '2px' }}>
                  Adjunct Integration with GHK-Cu &amp; Mesotherapy Protocols
                </div>
                <p style={{ margin: 0, fontSize: '0.74rem', color: '#334155', lineHeight: 1.55 }}>
                  The Colway Hair System is clinically paired as a <strong>topical homecare adjunct</strong> with clinical hair restoration protocols. For patients undergoing scalp microneedling or subcutaneous GHK-Cu / PTD-DBM peptide therapy: resume Colway Shampoo washing 24 hours post-procedure once microchannels have re-epithelialized.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Trichologist Guidelines & Professional Precautions Footer */}
        <div style={{
          marginTop: '1.25rem',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="#16a34a" />
            <span style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 600 }}>
              EU Regulation 1223/2009 Compliant · CPNP Registered · 0% Bovine Collagen
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Frequency:</span>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#0d9488',
              background: '#f0fdfa',
              padding: '2px 8px',
              borderRadius: '99px',
              border: '1px solid #ccfbf1'
            }}>
              3–4× Weekly (Min. 8 Weeks)
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

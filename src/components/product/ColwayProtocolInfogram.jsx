"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles, Droplets, Thermometer, Clock, ShieldCheck,
  Activity, CheckCircle2, AlertTriangle, ChevronRight,
  Layers, Microscope, Zap, ArrowRight, RefreshCw, Scissors, Info, Beaker,
  Compass, Check
} from 'lucide-react';

/**
 * ColwayProtocolInfogram
 * Photorealistic medical trichology infographic & professional application protocol
 * Covers both Colway Strengthening Shampoo & Strengthening Conditioner.
 * Fully responsive for mobile (iOS/Android) and desktop/laptop screens.
 */
export default function ColwayProtocolInfogram({
  currentProduct = 'shampoo',
  lang = 'en'
}) {
  const isDefaultShampoo = currentProduct?.toLowerCase().includes('shampoo');
  const [activeTab, setActiveTab] = useState(isDefaultShampoo ? 'shampoo' : 'conditioner');
  const [activeZone, setActiveZone] = useState('papilla'); // for interactive zone exploration
  const [activeCondZone, setActiveCondZone] = useState('cortex');

  return (
    <div className="cpi-root-container" style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
      marginBottom: '1.75rem'
    }}>
      <style>{`
        .cpi-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          font-size: 0.76rem;
          font-weight: 700;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #94a3b8;
          background: transparent;
          white-space: nowrap;
        }
        .cpi-tab-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
        }
        .cpi-tab-btn.active-shampoo {
          background: #0d9488;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(13, 148, 136, 0.35);
        }
        .cpi-tab-btn.active-cond {
          background: #0284c7;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(2, 132, 199, 0.35);
        }
        .cpi-tab-btn.active-synergy {
          background: #7c3aed;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(124, 58, 237, 0.35);
        }
        .cpi-infogram-layout {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 1.25rem;
          align-items: start;
        }
        .cpi-zone-card {
          padding: 12px 14px;
          border-radius: 10px;
          border: 1.5px solid #e2e8f0;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .cpi-zone-card:hover {
          border-color: #0d9488;
          background: #fcfdfd;
          transform: translateY(-1px);
        }
        .cpi-zone-card.active-zone {
          border-color: #0d9488;
          background: #f0fdfa;
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.12);
        }
        .cpi-cond-card.active-cond-zone {
          border-color: #0284c7;
          background: #f0f9ff;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.12);
        }
        @media (max-width: 900px) {
          .cpi-infogram-layout {
            grid-template-columns: 1fr;
          }
          .cpi-tabs-scroll {
            width: 100%;
            overflow-x: auto;
            padding-bottom: 4px;
            scrollbar-width: none;
          }
          .cpi-tabs-scroll::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>

      {/* Top Banner & Tab Controls */}
      <div style={{
        background: 'linear-gradient(135deg, #071e3d 0%, #003666 45%, #0d9488 100%)',
        padding: '1.25rem 1.5rem',
        color: '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.66rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: 'rgba(255, 255, 255, 0.14)',
              backdropFilter: 'blur(8px)',
              padding: '3px 10px',
              borderRadius: '99px',
              marginBottom: '6px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Microscope size={12} color="#5eead4" />
              <span>Realistic Trichology Anatomy &amp; Cellular Pharmacodynamics</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: '#ffffff', letterSpacing: '-0.02em' }}>
              Colway Hair Strengthening System — Biological Infogram
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#cbd5e1', maxWidth: '680px', lineHeight: 1.45 }}>
              Realistic clinical cross-sections illustrating targeted transfollicular diffusion, 5α-reductase enzymatic blockade, and triple-helix cuticle reconstruction.
            </p>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="cpi-tabs-scroll">
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'rgba(15, 23, 42, 0.55)',
              padding: '4px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              gap: '4px'
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('shampoo')}
                className={`cpi-tab-btn ${activeTab === 'shampoo' ? 'active-shampoo' : ''}`}
              >
                <Droplets size={14} />
                <span>1. Shampoo: Scalp &amp; Papilla Influx</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('conditioner')}
                className={`cpi-tab-btn ${activeTab === 'conditioner' ? 'active-cond' : ''}`}
              >
                <Sparkles size={14} />
                <span>2. Conditioner: Fiber &amp; Cuticle Bioseal</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('synergy')}
                className={`cpi-tab-btn ${activeTab === 'synergy' ? 'active-synergy' : ''}`}
              >
                <Layers size={14} />
                <span>3. Dual-Action Synergy System</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Infographic Body */}
      <div style={{ padding: '1.25rem 1.5rem' }}>

        {/* ============================================================== */}
        {/* TAB 1: SHAMPOO — SCALP & FOLLICULAR INFUSION INFOGRAM          */}
        {/* ============================================================== */}
        {activeTab === 'shampoo' && (
          <div>
            {/* Clinical Parameter Summary Gauges */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '10px',
              marginBottom: '1.25rem'
            }}>
              <div style={{ padding: '10px 12px', background: '#f0fdfa', borderRadius: '10px', border: '1px solid #ccfbf1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase' }}>
                  <Compass size={11} /> Primary Target
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>Dermal Papilla &amp; Bulge</div>
                <div style={{ fontSize: '0.67rem', color: '#64748b' }}>Scalp microenvironment</div>
              </div>
              <div style={{ padding: '10px 12px', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
                  <Thermometer size={11} /> Pre-Wash Water Temp
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>36°C – 38°C (Warm)</div>
                <div style={{ fontSize: '0.67rem', color: '#64748b' }}>Opens follicular ostia</div>
              </div>
              <div style={{ padding: '10px 12px', background: '#faf5ff', borderRadius: '10px', border: '1px solid #e9d5ff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase' }}>
                  <Clock size={11} /> Active Contact Dwell
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>3 – 5 Minutes</div>
                <div style={{ fontSize: '0.67rem', color: '#64748b' }}>Caffeine 120s influx peak</div>
              </div>
              <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                  <Beaker size={11} /> Physiological pH
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>pH 4.8 – 5.2</div>
                <div style={{ fontSize: '0.67rem', color: '#16a34a', fontWeight: 600 }}>Protects acid mantle</div>
              </div>
            </div>

            {/* Side-by-Side: Realistic Scalp Illustration + Interactive Clinical Cards */}
            <div className="cpi-infogram-layout">
              {/* Left Column: Photorealistic Vector Scalp Anatomy */}
              <div style={{
                background: 'linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%)',
                borderRadius: '14px',
                border: '1px solid #cbd5e1',
                padding: '1rem',
                position: 'relative',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#003666', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Follicular Cross-Section &amp; Active Influx Pathway
                  </span>
                  <span style={{ fontSize: '0.62rem', color: '#64748b', background: '#ffffff', padding: '2px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    Tap layers to inspect
                  </span>
                </div>

                <div style={{ position: 'relative', width: '100%' }}>
                  <svg
                    viewBox="0 0 520 480"
                    style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '10px', background: '#ffffff', border: '1px solid #e2e8f0' }}
                  >
                    <defs>
                      {/* Realistic tissue and follicle gradients */}
                      <linearGradient id="scalpSurfGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
                      </linearGradient>
                      <linearGradient id="stratumGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#fed7aa" />
                        <stop offset="100%" stopColor="#fdba74" />
                      </linearGradient>
                      <linearGradient id="dermisTissueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#fff7ed" />
                        <stop offset="40%" stopColor="#ffedd5" />
                        <stop offset="100%" stopColor="#fed7aa" />
                      </linearGradient>
                      <linearGradient id="hairShaft3D" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#1e293b" />
                        <stop offset="35%" stopColor="#475569" />
                        <stop offset="70%" stopColor="#334155" />
                        <stop offset="100%" stopColor="#0f172a" />
                      </linearGradient>
                      <linearGradient id="follicleSheathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ccfbf1" />
                        <stop offset="50%" stopColor="#f0fdfa" />
                        <stop offset="100%" stopColor="#99f6e4" />
                      </linearGradient>
                      <radialGradient id="bulbRadial" cx="50%" cy="40%" r="60%">
                        <stop offset="0%" stopColor="#0d9488" />
                        <stop offset="70%" stopColor="#0f766e" />
                        <stop offset="100%" stopColor="#115e59" />
                      </radialGradient>
                      <radialGradient id="papillaGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                        <stop offset="70%" stopColor="#b91c1c" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#991b1b" stopOpacity="0.6" />
                      </radialGradient>
                      <linearGradient id="sebumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fef08a" />
                        <stop offset="100%" stopColor="#eab308" />
                      </linearGradient>
                      <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" />
                      </filter>
                    </defs>

                    {/* Zone 1: Scalp Water Layer & Lather */}
                    <rect x="0" y="0" width="520" height="45" fill="url(#scalpSurfGrad)" />
                    {/* Microbubbles */}
                    <circle cx="160" cy="22" r="7" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.2" />
                    <circle cx="178" cy="18" r="10" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.2" />
                    <circle cx="198" cy="25" r="6" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.2" />
                    <circle cx="320" cy="22" r="8" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.2" />
                    <circle cx="338" cy="16" r="11" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.2" />

                    {/* Stratum Corneum & Epidermis Base */}
                    <rect x="0" y="45" width="520" height="24" fill="url(#stratumGrad)" />
                    <line x1="0" y1="45" x2="520" y2="45" stroke="#f97316" strokeWidth="1.5" strokeDasharray="3 3" />

                    {/* Dermis Connective Tissue Base */}
                    <rect x="0" y="69" width="520" height="411" fill="url(#dermisTissueGrad)" opacity="0.6" />

                    {/* Collagen fiber bundles in extracellular matrix */}
                    <g stroke="#fed7aa" strokeWidth="1.5" strokeOpacity="0.5" fill="none">
                      <path d="M 30 110 Q 70 90 120 115" /><path d="M 40 180 Q 90 160 140 190" />
                      <path d="M 380 120 Q 430 100 480 130" /><path d="M 370 210 Q 420 190 490 220" />
                      <path d="M 20 280 Q 80 250 140 290" /><path d="M 390 320 Q 450 300 500 330" />
                    </g>

                    {/* Arrector Pili Muscle */}
                    <path d="M 330 180 C 370 160, 420 120, 450 70" fill="none" stroke="#e11d48" strokeWidth="4.5" strokeLinecap="round" opacity="0.75" />
                    <text x="390" y="115" fill="#be123c" fontSize="9" fontWeight="700">Arrector Pili</text>

                    {/* Sebaceous Gland Multi-acinar Organ */}
                    <g transform="translate(145, 120)" filter="url(#shadowFilter)" onClick={() => setActiveZone('sebum')} style={{ cursor: 'pointer' }}>
                      <ellipse cx="25" cy="20" rx="20" ry="16" fill="url(#sebumGrad)" stroke="#ca8a04" strokeWidth="1.5" />
                      <ellipse cx="10" cy="35" rx="16" ry="14" fill="url(#sebumGrad)" stroke="#ca8a04" strokeWidth="1.5" />
                      <ellipse cx="32" cy="40" rx="15" ry="13" fill="url(#sebumGrad)" stroke="#ca8a04" strokeWidth="1.5" />
                      {/* Lipid droplets inside duct */}
                      <circle cx="22" cy="20" r="3" fill="#ffffff" opacity="0.6" />
                      <circle cx="12" cy="34" r="2.5" fill="#ffffff" opacity="0.6" />
                      <circle cx="32" cy="38" r="2.5" fill="#ffffff" opacity="0.6" />
                      <path d="M 35 25 Q 55 22 75 35" fill="none" stroke="#ca8a04" strokeWidth="2.5" strokeDasharray="2 2" />
                    </g>

                    {/* Hair Follicle Channel (Infundibulum to Bulb) */}
                    <path
                      d="M 210 45 C 210 90, 225 240, 240 340 C 245 375, 240 405, 260 415 C 280 405, 275 375, 280 340 C 295 240, 310 90, 310 45 Z"
                      fill="url(#follicleSheathGrad)"
                      stroke="#0d9488"
                      strokeWidth="2"
                    />

                    {/* Glowing Active Diffusion Wave from Surface down to Bulb */}
                    <path
                      d="M 220 45 C 220 110, 235 250, 245 340 C 250 370, 250 395, 260 405 C 270 395, 270 370, 275 340 C 285 250, 300 110, 300 45 Z"
                      fill="#14b8a6"
                      opacity="0.22"
                    />

                    {/* Emerging Hair Shaft (Shaded 3D Cylinder) */}
                    <rect x="247" y="0" width="26" height="340" rx="4" fill="url(#hairShaft3D)" />
                    {/* Cuticle micro-shingle ridges on shaft */}
                    {[20, 50, 80, 110, 140, 170, 200, 230, 260, 290].map(y => (
                      <line key={y} x1="247" y1={y} x2="273" y2={y + 3} stroke="#64748b" strokeWidth="0.8" opacity="0.6" />
                    ))}

                    {/* Hair Bulb (Cell Matrix & Melanocytes) */}
                    <ellipse cx="260" cy="370" rx="28" ry="32" fill="url(#bulbRadial)" filter="url(#shadowFilter)" onClick={() => setActiveZone('papilla')} style={{ cursor: 'pointer' }} />
                    <ellipse cx="260" cy="385" rx="16" ry="14" fill="#042f2e" opacity="0.4" />

                    {/* Dermal Papilla Invagination */}
                    <path d="M 252 402 C 252 380, 268 380, 268 402 Z" fill="url(#papillaGlow)" />

                    {/* Perifollicular Capillary Loops (Arteriole & Venule) */}
                    {/* Red Arteriole */}
                    <path d="M 235 460 C 240 430, 252 410, 258 392" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                    {/* Blue Venule */}
                    <path d="M 285 460 C 280 430, 268 410, 262 392" fill="none" stroke="#3b82f6" strokeWidth="2.8" strokeLinecap="round" />
                    {/* Micro-anastomosis loop */}
                    <path d="M 258 392 C 260 388, 260 388, 262 392" fill="none" stroke="#9333ea" strokeWidth="2.5" />

                    {/* Interactive Clickable Hotspot Markers */}
                    {/* Hotspot 1: Stratum Corneum */}
                    <g transform="translate(60, 38)" onClick={() => setActiveZone('surface')} style={{ cursor: 'pointer' }}>
                      <rect x="0" y="0" width="130" height="22" rx="6" fill="#0369a1" />
                      <text x="8" y="15" fill="#ffffff" fontSize="9" fontWeight="700">① Stratum Corneum</text>
                    </g>

                    {/* Hotspot 2: Sebaceous Gland */}
                    <g transform="translate(45, 150)" onClick={() => setActiveZone('sebum')} style={{ cursor: 'pointer' }}>
                      <rect x="0" y="0" width="130" height="22" rx="6" fill="#ca8a04" />
                      <text x="8" y="15" fill="#ffffff" fontSize="9" fontWeight="700">② Sebaceous Acini</text>
                    </g>

                    {/* Hotspot 3: Bulge Stem Cells */}
                    <g transform="translate(335, 230)" onClick={() => setActiveZone('bulge')} style={{ cursor: 'pointer' }}>
                      <rect x="0" y="0" width="145" height="22" rx="6" fill="#0d9488" />
                      <text x="8" y="15" fill="#ffffff" fontSize="9" fontWeight="700">③ Stem Cell Bulge</text>
                    </g>

                    {/* Hotspot 4: Dermal Papilla */}
                    <g transform="translate(325, 375)" onClick={() => setActiveZone('papilla')} style={{ cursor: 'pointer' }}>
                      <rect x="0" y="0" width="155" height="22" rx="6" fill="#dc2626" />
                      <text x="8" y="15" fill="#ffffff" fontSize="9" fontWeight="700">④ Dermal Papilla Bulb</text>
                    </g>
                  </svg>
                </div>
              </div>

              {/* Right Column: Responsive Clinical Mechanism Cards (Zero Cutoff) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={15} color="#0d9488" />
                  <span>Cellular Pharmacodynamics by Anatomical Layer</span>
                </div>

                {/* Layer 1 */}
                <div
                  className={`cpi-zone-card ${activeZone === 'surface' ? 'active-zone' : ''}`}
                  onClick={() => setActiveZone('surface')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#0369a1', background: '#e0f2fe', padding: '2px 8px', borderRadius: '99px' }}>
                      LAYER 1 · SCALP STRATUM CORNEUM
                    </span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b' }}>pH 4.8 – 5.2</span>
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    Micro-Cleansing &amp; Acid Mantle Integrity
                  </div>
                  <p style={{ margin: 0, fontSize: '0.73rem', color: '#475569', lineHeight: 1.5 }}>
                    <strong>Sodium Cocoyl Isethionate (SCI)</strong> removes oxidized sebum and environmental particulate matter without disrupting the intercellular lipid bilayer. Prevents transepidermal water loss (TEWL −40% vs. SLS).
                  </p>
                </div>

                {/* Layer 2 */}
                <div
                  className={`cpi-zone-card ${activeZone === 'sebum' ? 'active-zone' : ''}`}
                  onClick={() => setActiveZone('sebum')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#b45309', background: '#fef3c7', padding: '2px 8px', borderRadius: '99px' }}>
                      LAYER 2 · INFUNDIBULUM &amp; SEBACEOUS DUCT
                    </span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#16a34a' }}>Sebostatic Action</span>
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    Zinc PCA 5α-Reductase Type II Inhibition
                  </div>
                  <p style={{ margin: 0, fontSize: '0.73rem', color: '#475569', lineHeight: 1.5 }}>
                    Zinc ions chelate the catalytic active center of intrafollicular <strong>5α-reductase</strong>, reducing the conversion of testosterone into DHT right at the sebaceous-follicular junction while reducing hyperseborrhea by <strong>−31%</strong>.
                  </p>
                </div>

                {/* Layer 3 */}
                <div
                  className={`cpi-zone-card ${activeZone === 'bulge' ? 'active-zone' : ''}`}
                  onClick={() => setActiveZone('bulge')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#0d9488', background: '#ccfbf1', padding: '2px 8px', borderRadius: '99px' }}>
                      LAYER 3 · FOLLICULAR BULGE (STEM CELLS)
                    </span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0d9488' }}>Wnt / β-Catenin</span>
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    Baicapil™ (Scutellaria) Anagen Induction
                  </div>
                  <p style={{ margin: 0, fontSize: '0.73rem', color: '#475569', lineHeight: 1.5 }}>
                    Flavonoids (Baicalin) stimulate dormant stem cells at the follicle bulge, promoting early telogen-to-anagen transition. Clinically proven to reduce hair shedding by <strong>−60.6%</strong> after 90 days.
                  </p>
                </div>

                {/* Layer 4 */}
                <div
                  className={`cpi-zone-card ${activeZone === 'papilla' ? 'active-zone' : ''}`}
                  onClick={() => setActiveZone('papilla')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#dc2626', background: '#fee2e2', padding: '2px 8px', borderRadius: '99px' }}>
                      LAYER 4 · DERMAL PAPILLA &amp; CAPILLARY BED
                    </span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#dc2626' }}>cAMP / IGF-1 / VEGF</span>
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    Caffeine 120s Rapid Influx &amp; Microvascular Perfusion
                  </div>
                  <p style={{ margin: 0, fontSize: '0.73rem', color: '#475569', lineHeight: 1.5 }}>
                    <strong>Caffeine (194 Da)</strong> traverses follicular barriers in 120s, blocking phosphodiesterase to elevate intracellular cAMP and stimulate <strong>IGF-1</strong>. Supported by <strong>Niacinamide</strong>, promoting VEGF microcapillary angiogenesis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: CONDITIONER — FIBER & CUTICLE BIOSEAL INFOGRAM          */}
        {/* ============================================================== */}
        {activeTab === 'conditioner' && (
          <div>
            {/* Clinical Parameter Summary Gauges */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '10px',
              marginBottom: '1.25rem'
            }}>
              <div style={{ padding: '10px 12px', background: '#e0f2fe', borderRadius: '10px', border: '1px solid #bae6fd' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
                  <Compass size={11} /> Primary Target
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>Cortex &amp; Cuticle (Lengths)</div>
                <div style={{ fontSize: '0.67rem', color: '#64748b' }}>Avoid direct scalp contact</div>
              </div>
              <div style={{ padding: '10px 12px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>
                  <Thermometer size={11} /> Cryo Cuticle Lock Rinse
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>18°C – 22°C (Cool Rinse)</div>
                <div style={{ fontSize: '0.67rem', color: '#16a34a', fontWeight: 600 }}>Mechanical scale closure</div>
              </div>
              <div style={{ padding: '10px 12px', background: '#faf5ff', borderRadius: '10px', border: '1px solid #e9d5ff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase' }}>
                  <Activity size={11} /> Tensile Strength Gain
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>+24% Fiber Break Resistance</div>
                <div style={{ fontSize: '0.67rem', color: '#64748b' }}>Fish Tropocollagen matrix</div>
              </div>
              <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                  <Beaker size={11} /> Acidic Sealing pH
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>pH 4.0 – 4.5</div>
                <div style={{ fontSize: '0.67rem', color: '#0284c7', fontWeight: 600 }}>Tightens cuticular tiles</div>
              </div>
            </div>

            {/* Side-by-Side: Realistic Hair Fiber Anatomy + Interactive Cards */}
            <div className="cpi-infogram-layout">
              {/* Left Column: 3D Hair Fiber Cutaway Vector Illustration */}
              <div style={{
                background: 'linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%)',
                borderRadius: '14px',
                border: '1px solid #cbd5e1',
                padding: '1rem',
                position: 'relative',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#003666', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    3D Hair Shaft Microarchitecture &amp; Bioseal
                  </span>
                  <span style={{ fontSize: '0.62rem', color: '#64748b', background: '#ffffff', padding: '2px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    Concentric layer cutaway
                  </span>
                </div>

                <div style={{ position: 'relative', width: '100%' }}>
                  <svg
                    viewBox="0 0 520 480"
                    style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '10px', background: '#ffffff', border: '1px solid #e2e8f0' }}
                  >
                    <defs>
                      {/* Realistic Fiber Gradients */}
                      <linearGradient id="fiberOuterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0f172a" />
                        <stop offset="30%" stopColor="#334155" />
                        <stop offset="60%" stopColor="#1e293b" />
                        <stop offset="100%" stopColor="#0f172a" />
                      </linearGradient>
                      <linearGradient id="cortexCutawayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#e9d5ff" />
                        <stop offset="60%" stopColor="#d8b4fe" />
                        <stop offset="100%" stopColor="#c084fc" />
                      </linearGradient>
                      <linearGradient id="cuticleScaleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0284c7" />
                        <stop offset="50%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#0369a1" />
                      </linearGradient>
                      <linearGradient id="lipidShieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                      <radialGradient id="medullaGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#cbd5e1" />
                        <stop offset="100%" stopColor="#64748b" />
                      </radialGradient>
                    </defs>

                    {/* Outer Cylindrical Fiber Outline */}
                    {/* Top Elliptical Cross-Section Face */}
                    <ellipse cx="260" cy="110" rx="190" ry="60" fill="url(#fiberOuterGrad)" stroke="#475569" strokeWidth="2" />

                    {/* Concentric Layer 1: Cuticle Ring */}
                    <ellipse cx="260" cy="110" rx="180" ry="55" fill="#0284c7" opacity="0.3" stroke="#0284c7" strokeWidth="1.5" />

                    {/* Concentric Layer 2: Cortex Core */}
                    <ellipse cx="260" cy="110" rx="145" ry="42" fill="url(#cortexCutawayGrad)" stroke="#a855f7" strokeWidth="2" />

                    {/* Keratin Macrofibril Bundles in Cortex face */}
                    <g fill="#7e22ce" opacity="0.5">
                      <circle cx="210" cy="100" r="10" /><circle cx="235" cy="95" r="11" /><circle cx="260" cy="92" r="12" /><circle cx="285" cy="95" r="11" /><circle cx="310" cy="100" r="10" />
                      <circle cx="195" cy="112" r="9" /><circle cx="220" cy="112" r="10" /><circle cx="245" cy="110" r="11" /><circle cx="275" cy="110" r="11" /><circle cx="300" cy="112" r="10" /><circle cx="325" cy="112" r="9" />
                      <circle cx="210" cy="122" r="10" /><circle cx="235" cy="124" r="11" /><circle cx="260" cy="125" r="12" /><circle cx="285" cy="124" r="11" /><circle cx="310" cy="122" r="10" />
                    </g>

                    {/* Concentric Layer 3: Central Medulla */}
                    <ellipse cx="260" cy="110" rx="40" ry="14" fill="url(#medullaGrad)" stroke="#475569" strokeWidth="1" />
                    <text x="242" y="113" fill="#0f172a" fontSize="8" fontWeight="800">MEDULLA</text>

                    {/* Longitudinal Shaft Body Dropping Down */}
                    <path d="M 70 110 L 70 420 C 70 455, 450 455, 450 420 L 450 110" fill="url(#fiberOuterGrad)" opacity="0.95" />

                    {/* Longitudinal Cutaway Window Revealing Cortex & Collagen Spiral */}
                    <path
                      d="M 140 180 Q 260 210 380 180 L 380 390 Q 260 420 140 390 Z"
                      fill="url(#cortexCutawayGrad)"
                      stroke="#9333ea"
                      strokeWidth="2"
                    />

                    {/* Macrofibril lines along vertical cutaway */}
                    <g stroke="#9333ea" strokeWidth="1.2" strokeOpacity="0.4" strokeDasharray="6 3">
                      <line x1="170" y1="190" x2="170" y2="395" />
                      <line x1="205" y1="196" x2="205" y2="402" />
                      <line x1="240" y1="200" x2="240" y2="406" />
                      <line x1="275" y1="200" x2="275" y2="406" />
                      <line x1="310" y1="196" x2="310" y2="402" />
                      <line x1="345" y1="190" x2="345" y2="395" />
                    </g>

                    {/* 3D Native Tropocollagen Triple-Helix Spring Overlay (Gly-Pro-Hyp) */}
                    <path
                      d="M 235 220 Q 285 240 235 260 T 235 300 T 235 340 T 235 380"
                      fill="none"
                      stroke="#6b21a8"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 255 220 Q 205 240 255 260 T 255 300 T 255 340 T 255 380"
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 245 225 Q 265 245 245 265 T 245 305 T 245 345 T 245 385"
                      fill="none"
                      stroke="#e9d5ff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Cuticle Surface Scales on Left and Right flanks */}
                    {/* Realistic overlapping shingle scales */}
                    {[130, 165, 200, 235, 270, 305, 340, 375].map((y, idx) => (
                      <g key={idx}>
                        {/* Left flank scale */}
                        <path
                          d={`M 70 ${y} Q 105 ${y - 8} 140 ${y + 5} L 140 ${y + 24} Q 105 ${y + 16} 70 ${y + 24} Z`}
                          fill="url(#cuticleScaleGrad)"
                          stroke="#0369a1"
                          strokeWidth="1.2"
                          opacity={0.9}
                        />
                        {/* Right flank scale */}
                        <path
                          d={`M 380 ${y + 5} Q 415 ${y - 8} 450 ${y} L 450 ${y + 24} Q 415 ${y + 16} 380 ${y + 24} Z`}
                          fill="url(#cuticleScaleGrad)"
                          stroke="#0369a1"
                          strokeWidth="1.2"
                          opacity={0.9}
                        />
                      </g>
                    ))}

                    {/* Outer 18-MEA Lipid Protective Membrane (Glowing Green Sheen on Outer Cuticle) */}
                    <path d="M 68 115 L 68 420" stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" opacity="0.9" />
                    <path d="M 452 115 L 452 420" stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" opacity="0.9" />

                    {/* Water Droplet Deflecting from 18-MEA Barrier (Hydrophobic Contact Angle > 95°) */}
                    <g transform="translate(30, 230)">
                      <circle cx="20" cy="20" r="14" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
                      <path d="M 20 6 C 20 6 32 18 32 24 C 32 30 26 34 20 34 C 14 34 8 30 8 24 C 8 18 20 6 20 6 Z" fill="#e0f2fe" opacity="0.7" />
                      <line x1="36" y1="20" x2="52" y2="18" stroke="#10b981" strokeWidth="2" strokeDasharray="3 2" />
                      <text x="-15" y="48" fill="#0369a1" fontSize="8.5" fontWeight="700">Hydrophobic Rebound</text>
                    </g>

                    {/* Interactive Clickable Hotspots */}
                    <g transform="translate(160, 26)" onClick={() => setActiveCondZone('cortex')} style={{ cursor: 'pointer' }}>
                      <rect x="0" y="0" width="200" height="24" rx="6" fill="#7c3aed" />
                      <text x="12" y="16" fill="#ffffff" fontSize="9.5" fontWeight="700">① Cortex Tropocollagen Core</text>
                    </g>

                    <g transform="translate(15, 140)" onClick={() => setActiveCondZone('cuticle')} style={{ cursor: 'pointer' }}>
                      <rect x="0" y="0" width="130" height="22" rx="6" fill="#0284c7" />
                      <text x="8" y="15" fill="#ffffff" fontSize="8.5" fontWeight="700">② Cuticle Scale Shingles</text>
                    </g>

                    <g transform="translate(370, 250)" onClick={() => setActiveCondZone('flayer')} style={{ cursor: 'pointer' }}>
                      <rect x="0" y="0" width="140" height="22" rx="6" fill="#059669" />
                      <text x="8" y="15" fill="#ffffff" fontSize="8.5" fontWeight="700">③ 18-MEA Lipid Shield</text>
                    </g>
                  </svg>
                </div>
              </div>

              {/* Right Column: Responsive Clinical Cards for Conditioner (Zero Cutoff) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={15} color="#0284c7" />
                  <span>Fiber Structural Remodeling by Microarchitectural Zone</span>
                </div>

                {/* Zone 1: Cortex */}
                <div
                  className={`cpi-zone-card cpi-cond-card ${activeCondZone === 'cortex' ? 'active-cond-zone' : ''}`}
                  onClick={() => setActiveCondZone('cortex')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#7c3aed', background: '#faf5ff', padding: '2px 8px', borderRadius: '99px' }}>
                      ZONE 1 · CORTICAL MACROFIBRILS
                    </span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#7c3aed' }}>+24% Tensile Elasticity</span>
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    Native Fish Tropocollagen &amp; Hydrolyzed Keratin Scaffolding
                  </div>
                  <p style={{ margin: 0, fontSize: '0.73rem', color: '#475569', lineHeight: 1.5 }}>
                    Under acidic pH 4.0–4.5, intact <strong>triple-helix tropocollagen (Gly-Pro-Hyp repeats)</strong> penetrates cortical microvoids created by bleach or thermal fatigue. Enzymatic keratin fragments (MW 500–1,500 Da) crosslink disulfide bonds (-S-S-), arresting fiber split-ends.
                  </p>
                </div>

                {/* Zone 2: Cuticle Lamellae */}
                <div
                  className={`cpi-zone-card cpi-cond-card ${activeCondZone === 'cuticle' ? 'active-cond-zone' : ''}`}
                  onClick={() => setActiveCondZone('cuticle')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '99px' }}>
                      ZONE 2 · CUTICULAR SCALES (EXOCUTICLE)
                    </span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0284c7' }}>−62% Combing Friction</span>
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    Cationic Charge Neutralization &amp; Silk β-Sheet Film
                  </div>
                  <p style={{ margin: 0, fontSize: '0.73rem', color: '#475569', lineHeight: 1.5 }}>
                    Rapeseed-derived <strong>BTMS-50</strong> electrostatically neutralizes the negative surface zeta potential (−60 mV). <strong>Silk Amino Acids (Bombyx mori)</strong> self-assemble into an ultra-smooth lamellar β-sheet protein film, dropping surface roughness (Ra) by <strong>34%</strong>.
                  </p>
                </div>

                {/* Zone 3: 18-MEA Epicuticle Lipid Shield */}
                <div
                  className={`cpi-zone-card cpi-cond-card ${activeCondZone === 'flayer' ? 'active-cond-zone' : ''}`}
                  onClick={() => setActiveCondZone('flayer')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#16a34a', background: '#f0fdf4', padding: '2px 8px', borderRadius: '99px' }}>
                      ZONE 3 · 18-MEA LIPID LAYER (EPICUTICLE)
                    </span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#16a34a' }}>230°C Heat Defense</span>
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    Virgin Argan Oil Barrier &amp; 18–22°C Cryo-Lock
                  </div>
                  <p style={{ margin: 0, fontSize: '0.73rem', color: '#475569', lineHeight: 1.5 }}>
                    Cold water rinse (<strong>18–22°C</strong>) triggers hydrogen-bond contraction, tightening cuticular tiles over the cortex. <strong>Virgin Argan Oil</strong> restores the hydrophobic 18-methyl eicosanoic acid (18-MEA) film, preventing moisture loss and resisting thermal styling damage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: DUAL-ACTION SYNERGY — COMBINED ROUTINE & MESOTHERAPY    */}
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
                  The 2-Phase Trichological Synergy System
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0 0 1rem 0', lineHeight: 1.55 }}>
                When applied in sequence, the Shampoo and Conditioner create a complementary inside-out biological cascade: Phase 1 reactivates the dermal root and neutralizes DHT; Phase 2 locks the cortex and coats the fiber against environmental trauma.
              </p>

              {/* Side-by-side Dual Phase Comparison Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                {/* Shampoo Phase */}
                <div style={{
                  background: '#ffffff',
                  border: '1.5px solid #ccfbf1',
                  borderRadius: '10px',
                  padding: '1rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0d9488', background: '#f0fdfa', padding: '2px 8px', borderRadius: '99px' }}>
                      STEP 1 · SCALP &amp; ROOT INFLUX
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

                {/* Conditioner Phase */}
                <div style={{
                  background: '#ffffff',
                  border: '1.5px solid #bae6fd',
                  borderRadius: '10px',
                  padding: '1rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '99px' }}>
                      STEP 2 · SHAFT &amp; CUTICLE BIOSEAL
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

            {/* Mesotherapy / Peptide Adjunct Protocol Guidance */}
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
                width: 36,
                height: 36,
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
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f766e', marginBottom: '2px' }}>
                  Adjunct Integration with GHK-Cu &amp; Scalp Mesotherapy Protocols
                </div>
                <p style={{ margin: 0, fontSize: '0.74rem', color: '#334155', lineHeight: 1.55 }}>
                  The Colway Hair System is clinically formulated as a <strong>topical homecare adjunct</strong> alongside regenerative hair protocols (e.g. GHK-Cu, PTD-DBM, PRP, and exosome mesotherapy). For patients receiving in-clinic scalp microneedling or injections, resume Colway washing <strong>24 to 48 hours post-procedure</strong> once cutaneous microchannels have completely closed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Trichology Standards & Regulatory Badges */}
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
              EU Cosmetics Regulation 1223/2009 Compliant · CPNP Registered · 0% Bovine (Fish Tropocollagen)
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

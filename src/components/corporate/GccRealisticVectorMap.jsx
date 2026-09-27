"use client";

import React, { useState } from 'react';
import { ShieldCheck, Truck, Plane, Building2, MapPin, ThermometerSnowflake, CheckCircle2 } from 'lucide-react';

/**
 * GccRealisticVectorMap
 * ─────────────────────────────────────────────────────────────────────────────
 * Cartographically realistic SVG vector map of the Arabian Peninsula & GCC
 * for MediLuxe / Med-Peptides corporate logistics & cold-chain distribution.
 *
 * Features:
 * - True geographic silhouettes: Arabian Peninsula, Arabian Gulf, Qatar, Strait of Hormuz, Red Sea
 * - Dedicated country geometries for UAE (HQ), Qatar, Kuwait, Saudi Arabia, Oman, Bahrain
 * - Animated cold-chain logistics arcs with active flow indicators (+2°C to +8°C & -20°C)
 * - Concentric radar pulse on Abu Dhabi Headquarters & Central Vault
 * - Interactive node inspection with transit SLAs and regulatory clearances
 */

const HUBS = [
  {
    id: 'abudhabi',
    name: 'Abu Dhabi (HQ)',
    sub: 'Central Cold-Chain Vault · Est. 2011',
    country: 'United Arab Emirates',
    x: 602,
    y: 178,
    type: 'hq',
    tempRange: '+2°C to +8°C & -20°C Cryo',
    transit: 'Hub Origin · Immediate Dispatch',
    compliance: 'UAE MOHAP & HAAD Certified',
    flag: '🇦🇪',
    details: 'Primary corporate operations, sterile cold-chain warehouse, and regulatory liaison headquarters.'
  },
  {
    id: 'dubai',
    name: 'Dubai Logistics Hub',
    sub: 'Direct Clinic Express Branch · 2024',
    country: 'United Arab Emirates',
    x: 636,
    y: 152,
    type: 'branch',
    tempRange: '+2°C to +8°C Refrigerated',
    transit: 'Same-Day (2-4 hrs direct delivery)',
    compliance: 'DHA Licensed Facility',
    flag: '🇦🇪',
    details: 'Strategic forward operating depot serving specialized aesthetic, longevity, and dermatology clinics.'
  },
  {
    id: 'qatar',
    name: 'Doha Clinical Corridor',
    sub: 'Authorized Medical Distribution',
    country: 'Qatar',
    x: 536,
    y: 145,
    type: 'partner',
    tempRange: '+2°C to +8°C Cold-Chain',
    transit: '24-48 Hours Express Route',
    compliance: 'MOPH Qatar Regulatory Liaison',
    flag: '🇶🇦',
    details: 'Seamless overland and air distribution network for hospital systems and VIP wellness practices.'
  },
  {
    id: 'kuwait',
    name: 'Kuwait City Hub',
    sub: 'Aesthetics & Longevity Alliances',
    country: 'Kuwait',
    x: 445,
    y: 82,
    type: 'partner',
    tempRange: '-20°C / +2°C to +8°C',
    transit: '24-48 Hours Air Cargo',
    compliance: 'Kuwait MOH Authorized Channel',
    flag: '🇰🇼',
    details: 'Dedicated cold storage delivery partnerships with key clinical centers and genetic test distributors.'
  },
  {
    id: 'riyadh',
    name: 'Riyadh Distribution Node',
    sub: 'Central & Eastern Province Network',
    country: 'Saudi Arabia',
    x: 432,
    y: 185,
    type: 'partner',
    tempRange: '+2°C to +8°C & -20°C',
    transit: '24-72 Hours Overland & Air',
    compliance: 'SFDA Compliant Temperature Log',
    flag: '🇸🇦',
    details: 'Fast-expanding supply channel serving premier regenerative medicine clinics in Riyadh and Khobar.'
  }
];

export default function GccRealisticVectorMap() {
  const [activeHub, setActiveHub] = useState(HUBS[0]); // Default to Abu Dhabi HQ
  const [hoveredHub, setHoveredHub] = useState(null);

  const displayHub = hoveredHub || activeHub;

  return (
    <div className="mediluxe-gcc-map-container" style={{ width: '100%', position: 'relative' }}>
      <style>{`
        @keyframes gccPulseWave {
          0% {
            r: 10;
            opacity: 0.8;
            stroke-width: 2.5;
          }
          50% {
            opacity: 0.4;
          }
          100% {
            r: 32;
            opacity: 0;
            stroke-width: 0.5;
          }
        }
        @keyframes gccFlowDash {
          0% {
            stroke-dashoffset: 40;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        .gcc-pulse-ring-1 {
          animation: gccPulseWave 2.8s cubic-bezier(0.2, 0.8, 0.4, 1) infinite;
        }
        .gcc-pulse-ring-2 {
          animation: gccPulseWave 2.8s cubic-bezier(0.2, 0.8, 0.4, 1) infinite 1.4s;
        }
        .gcc-route-overland {
          stroke: #003666;
          stroke-width: 2;
          stroke-dasharray: 6 4;
          animation: gccFlowDash 1.6s linear infinite;
        }
        .gcc-route-air {
          stroke: #0d9488;
          stroke-width: 2;
          stroke-dasharray: 4 4;
          animation: gccFlowDash 2.2s linear infinite;
        }
        .gcc-hub-pin {
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .gcc-hub-pin:hover {
          transform: scale(1.15);
        }
      `}</style>

      {/* SVG Realistic Cartographic Map */}
      <div style={{
        background: 'linear-gradient(180deg, #f0fdfa 0%, #f8fafc 40%, #ffffff 100%)',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1.25rem',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Top Floating Control Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1rem',
          paddingBottom: '0.85rem',
          borderBottom: '1px solid #edf2f7'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '7px',
              backgroundColor: '#003666',
              color: '#ffffff'
            }}>
              <ThermometerSnowflake size={15} />
            </span>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#003666', letterSpacing: '-0.01em' }}>
                GCC Cold-Chain Real-Time Matrix
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Continuous Temperature-Controlled Corridors (+2°C to +8°C / -20°C Cryo)
              </div>
            </div>
          </div>

          {/* Quick Hub Filter Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
            {HUBS.map(hub => {
              const isSelected = displayHub.id === hub.id;
              return (
                <button
                  key={hub.id}
                  type="button"
                  onClick={() => setActiveHub(hub)}
                  onMouseEnter={() => setHoveredHub(hub)}
                  onMouseLeave={() => setHoveredHub(null)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    fontSize: '0.74rem',
                    fontWeight: isSelected ? 700 : 500,
                    borderRadius: '6px',
                    border: isSelected ? '1px solid #003666' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#003666' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 1px 3px rgba(0,54,102,0.2)' : 'none'
                  }}
                >
                  <span>{hub.flag}</span>
                  <span>{hub.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* The Realistic Map Viewport */}
        <div style={{ position: 'relative', width: '100%', height: 'auto', minHeight: '340px' }}>
          <svg
            viewBox="0 0 860 460"
            width="100%"
            height="auto"
            style={{ display: 'block', overflow: 'visible' }}
          >
            <defs>
              {/* Radial Gradient for Arabian Gulf Waters */}
              <radialGradient id="gulfWaterGradient" cx="65%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#e0f2fe" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f0f9ff" stopOpacity="0.05" />
              </radialGradient>

              {/* Red Sea Gradient */}
              <linearGradient id="redSeaGradient" x1="0%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.15" />
              </linearGradient>

              {/* UAE Highlighting Gradient */}
              <linearGradient id="uaeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#003666" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#0d9488" stopOpacity="0.9" />
              </linearGradient>

              {/* Dropshadow filter for pins */}
              <filter id="hubPinShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.2" />
              </filter>
            </defs>

            {/* 1. Subtle Cartographic Lat/Long Coordinates Grid (Graticule) */}
            <g stroke="#cbd5e1" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.45">
              {/* Latitude Lines */}
              <line x1="60" y1="100" x2="800" y2="100" />
              <line x1="60" y1="200" x2="800" y2="200" />
              <line x1="60" y1="300" x2="800" y2="300" />
              <line x1="60" y1="400" x2="800" y2="400" />
              {/* Longitude Lines */}
              <line x1="200" y1="40" x2="200" y2="430" />
              <line x1="350" y1="40" x2="350" y2="430" />
              <line x1="500" y1="40" x2="500" y2="430" />
              <line x1="650" y1="40" x2="650" y2="430" />
            </g>

            {/* 2. Red Sea Water Body (Western Flank) */}
            <path
              d="M 60 40 L 95 75 Q 150 130 205 180 Q 250 235 300 290 Q 345 360 375 415 L 320 440 L 220 380 Q 140 280 80 180 L 40 100 Z"
              fill="url(#redSeaGradient)"
            />
            <text x="140" y="240" fill="#94a3b8" fontSize="11" fontStyle="italic" opacity="0.6" transform="rotate(-40 140 240)">
              Red Sea (Al Bahr Al Ahmar)
            </text>

            {/* 3. Arabian Gulf / Persian Gulf Water Body (Northeastern Basin) */}
            <path
              d="M 430 80 Q 456 110 490 142 Q 505 155 510 168 Q 518 128 525 120 Q 532 130 536 145 Q 538 180 575 183 Q 618 162 634 150 Q 648 136 656 122 Q 662 108 668 118 L 730 80 Q 680 40 560 30 Q 470 40 430 80 Z"
              fill="url(#gulfWaterGradient)"
            />
            <text x="560" y="90" fill="#0284c7" fontSize="12" fontWeight="700" opacity="0.75" letterSpacing="0.05em">
              Arabian Gulf (Al Khaleej)
            </text>

            {/* 4. Gulf of Oman & Arabian Sea (East & South) */}
            <path
              d="M 668 118 Q 695 178 745 205 Q 725 248 690 290 Q 630 340 530 385 Q 430 420 375 415 L 430 455 Q 600 450 720 380 Q 820 280 800 160 L 668 118 Z"
              fill="url(#gulfWaterGradient)"
            />
            <text x="730" y="270" fill="#94a3b8" fontSize="11" fontStyle="italic" opacity="0.6" transform="rotate(35 730 270)">
              Arabian Sea / Gulf of Oman
            </text>

            {/* 5. Realistic Arabian Peninsula Master Landmass */}
            {/* Outline follows true geography: Aqaba -> Jordan/Iraq borders -> Kuwait -> Eastern Province -> UAE -> Musandam -> Oman -> Yemen -> Red Sea coast */}
            <path
              d="
                M 100 70 
                Q 160 60 240 50 
                Q 320 50 390 60 
                L 415 65 
                L 435 68 
                Q 430 80 445 82 
                L 452 98 
                Q 456 110 470 128 
                Q 490 142 495 155 
                L 510 168 
                Q 518 128 525 120 
                Q 532 130 536 145 
                Q 535 158 528 172 
                Q 538 180 575 183 
                Q 598 176 618 162 
                Q 634 150 648 136 
                Q 656 122 662 108 
                Q 668 118 664 140 
                Q 675 165 695 178 
                L 715 185 
                Q 745 205 735 230 
                Q 725 248 690 290 
                Q 630 340 610 350 
                Q 530 385 430 420 
                L 375 415 
                Q 365 395 345 360 
                Q 320 320 300 290 
                Q 275 260 250 235 
                Q 230 205 205 180 
                Q 175 155 150 130 
                Q 120 100 95 75 
                Z
              "
              fill="#f1f5f9"
              stroke="#cbd5e1"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* 6. Oman Southeastern Sector */}
            <path
              d="
                M 662 108 Q 668 118 664 140 Q 675 165 695 178 L 715 185 Q 745 205 735 230 Q 725 248 690 290 Q 630 340 610 350 
                L 580 300 Q 610 240 645 195 L 660 155 L 662 108 Z
              "
              fill="#e2e8f0"
              stroke="#cbd5e1"
              strokeWidth="1.5"
              opacity="0.8"
            />
            <text x="680" y="240" fill="#64748b" fontSize="12" fontWeight="700" letterSpacing="0.08em">
              OMAN
            </text>

            {/* 7. Yemen Southern Sector */}
            <path
              d="
                M 610 350 Q 530 385 430 420 L 375 415 Q 365 395 345 360 L 320 320 
                Q 420 325 500 325 L 580 300 L 610 350 Z
              "
              fill="#e2e8f0"
              stroke="#cbd5e1"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <text x="440" y="375" fill="#94a3b8" fontSize="11" fontWeight="700" letterSpacing="0.08em">
              YEMEN
            </text>

            {/* 8. Saudi Arabia Landmass Label & Territory */}
            <text x="320" y="195" fill="#475569" fontSize="14" fontWeight="800" letterSpacing="0.1em">
              SAUDI ARABIA
            </text>
            <text x="320" y="210" fill="#94a3b8" fontSize="10" fontWeight="600">
              Kingdom of Saudi Arabia (SFDA Territory)
            </text>

            {/* 9. Kuwait (Individual Highlighted Polygon) */}
            <path
              d="M 415 65 L 435 68 Q 430 80 445 82 L 452 98 Q 435 98 420 88 Z"
              fill={displayHub.id === 'kuwait' ? '#0d9488' : '#ccfbf1'}
              stroke="#0f766e"
              strokeWidth="2"
              style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
              onClick={() => setActiveHub(HUBS.find(h => h.id === 'kuwait'))}
            />

            {/* 10. Bahrain Island */}
            <ellipse
              cx="502"
              cy="148"
              rx="4"
              ry="7"
              fill={displayHub.id === 'qatar' ? '#0284c7' : '#94a3b8'}
              stroke="#0369a1"
              strokeWidth="1"
            />
            <text x="490" y="142" fill="#64748b" fontSize="8" fontWeight="700">Bahrain</text>

            {/* 11. Qatar Peninsula (Individual Highlighted Polygon) */}
            <path
              d="M 510 168 Q 512 145 518 128 Q 522 120 525 120 Q 532 130 536 145 Q 535 158 528 172 Z"
              fill={displayHub.id === 'qatar' ? '#0284c7' : '#bae6fd'}
              stroke="#0369a1"
              strokeWidth="2"
              style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
              onClick={() => setActiveHub(HUBS.find(h => h.id === 'qatar'))}
            />

            {/* 12. United Arab Emirates (Individual Hero Highlighted Territory) */}
            <path
              d="
                M 540 180 
                Q 568 184 598 176 
                Q 618 162 634 150 
                Q 648 136 656 122 
                L 664 140 
                L 660 155 
                Q 652 180 645 195 
                Q 610 220 580 225 
                Q 555 210 540 180 
                Z
              "
              fill={displayHub.country === 'United Arab Emirates' ? 'url(#uaeGradient)' : '#003666'}
              stroke="#00274a"
              strokeWidth="2.5"
              style={{ transition: 'all 0.25s ease', cursor: 'pointer' }}
              onClick={() => setActiveHub(HUBS.find(h => h.id === 'abudhabi'))}
            />
            <text x="590" y="210" fill="#ffffff" fontSize="10" fontWeight="800" letterSpacing="0.05em">
              U.A.E. (HQ)
            </text>

            {/* 13. Active Cold-Chain Supply Routes (Bezier Arcs) */}
            {/* Route A: Abu Dhabi HQ -> Dubai Hub (Overland Express +2°C to +8°C) */}
            <path
              d="M 602 178 Q 620 162 636 152"
              fill="none"
              className="gcc-route-overland"
            />

            {/* Route B: Abu Dhabi HQ -> Doha (Overland / Air +2°C to +8°C) */}
            <path
              d="M 602 178 Q 570 152 536 145"
              fill="none"
              className="gcc-route-overland"
            />

            {/* Route C: Abu Dhabi HQ -> Riyadh (Air & Overland -20°C / +2°C to +8°C) */}
            <path
              d="M 602 178 Q 515 170 432 185"
              fill="none"
              className="gcc-route-air"
            />

            {/* Route D: Abu Dhabi HQ -> Kuwait City (Air Freight Cryo -20°C) */}
            <path
              d="M 602 178 Q 510 110 445 82"
              fill="none"
              className="gcc-route-air"
            />

            {/* Route E: Dubai Hub -> Riyadh (Commercial Feeder) */}
            <path
              d="M 636 152 Q 530 145 432 185"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />

            {/* 14. Abu Dhabi HQ Concentric Radar Wave (Origin Animation) */}
            <circle cx="602" cy="178" r="10" fill="none" stroke="#003666" className="gcc-pulse-ring-1" />
            <circle cx="602" cy="178" r="10" fill="none" stroke="#0d9488" className="gcc-pulse-ring-2" />

            {/* 15. Geographic Hub Nodes & Badges */}

            {/* RIYADH NODE */}
            <g
              className="gcc-hub-pin"
              onClick={() => setActiveHub(HUBS.find(h => h.id === 'riyadh'))}
              onMouseEnter={() => setHoveredHub(HUBS.find(h => h.id === 'riyadh'))}
              onMouseLeave={() => setHoveredHub(null)}
            >
              <circle cx="432" cy="185" r="7" fill="#0284c7" stroke="#ffffff" strokeWidth="2" filter="url(#hubPinShadow)" />
              <circle cx="432" cy="185" r="3" fill="#ffffff" />
              <rect x="365" y="152" width="75" height="18" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" filter="url(#hubPinShadow)" />
              <text x="402" y="164" fill="#0f172a" fontSize="9" fontWeight="700" textAnchor="middle">🇸🇦 Riyadh</text>
            </g>

            {/* KUWAIT NODE */}
            <g
              className="gcc-hub-pin"
              onClick={() => setActiveHub(HUBS.find(h => h.id === 'kuwait'))}
              onMouseEnter={() => setHoveredHub(HUBS.find(h => h.id === 'kuwait'))}
              onMouseLeave={() => setHoveredHub(null)}
            >
              <circle cx="445" cy="82" r="7" fill="#0d9488" stroke="#ffffff" strokeWidth="2" filter="url(#hubPinShadow)" />
              <circle cx="445" cy="82" r="3" fill="#ffffff" />
              <rect x="385" y="52" width="70" height="18" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" filter="url(#hubPinShadow)" />
              <text x="420" y="64" fill="#0f172a" fontSize="9" fontWeight="700" textAnchor="middle">🇰🇼 Kuwait</text>
            </g>

            {/* QATAR NODE */}
            <g
              className="gcc-hub-pin"
              onClick={() => setActiveHub(HUBS.find(h => h.id === 'qatar'))}
              onMouseEnter={() => setHoveredHub(HUBS.find(h => h.id === 'qatar'))}
              onMouseLeave={() => setHoveredHub(null)}
            >
              <circle cx="536" cy="145" r="7" fill="#0284c7" stroke="#ffffff" strokeWidth="2" filter="url(#hubPinShadow)" />
              <circle cx="536" cy="145" r="3" fill="#ffffff" />
              <rect x="548" y="136" width="60" height="18" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" filter="url(#hubPinShadow)" />
              <text x="578" y="148" fill="#0f172a" fontSize="9" fontWeight="700" textAnchor="middle">🇶🇦 Qatar</text>
            </g>

            {/* DUBAI HUB NODE */}
            <g
              className="gcc-hub-pin"
              onClick={() => setActiveHub(HUBS.find(h => h.id === 'dubai'))}
              onMouseEnter={() => setHoveredHub(HUBS.find(h => h.id === 'dubai'))}
              onMouseLeave={() => setHoveredHub(null)}
            >
              <circle cx="636" cy="152" r="8" fill="#0d9488" stroke="#ffffff" strokeWidth="2.5" filter="url(#hubPinShadow)" />
              <circle cx="636" cy="152" r="3.5" fill="#ffffff" />
              <rect x="650" y="143" width="95" height="18" rx="4" fill="#ffffff" stroke="#0d9488" strokeWidth="1.2" filter="url(#hubPinShadow)" />
              <text x="697" y="155" fill="#0d9488" fontSize="9" fontWeight="800" textAnchor="middle">🇦🇪 Dubai (2024)</text>
            </g>

            {/* ABU DHABI HQ (MASTER PIN) */}
            <g
              className="gcc-hub-pin"
              onClick={() => setActiveHub(HUBS.find(h => h.id === 'abudhabi'))}
              onMouseEnter={() => setHoveredHub(HUBS.find(h => h.id === 'abudhabi'))}
              onMouseLeave={() => setHoveredHub(null)}
            >
              <circle cx="602" cy="178" r="11" fill="#003666" stroke="#ffffff" strokeWidth="3" filter="url(#hubPinShadow)" />
              <circle cx="602" cy="178" r="5" fill="#38bdf8" />
              <rect x="525" y="240" width="154" height="28" rx="6" fill="#003666" stroke="#ffffff" strokeWidth="1.5" filter="url(#hubPinShadow)" />
              <text x="602" y="254" fill="#ffffff" fontSize="10" fontWeight="900" textAnchor="middle">🏢 ABU DHABI (HQ)</text>
              <text x="602" y="264" fill="#93c5fd" fontSize="8" fontWeight="600" textAnchor="middle">Central Cold-Chain Vault</text>
              {/* Leader Line to Abu Dhabi pin */}
              <line x1="602" y1="190" x2="602" y2="240" stroke="#003666" strokeWidth="1.5" strokeDasharray="2 2" />
            </g>
          </svg>
        </div>

        {/* Dynamic Detail Card of Selected / Hovered Hub */}
        <div style={{
          marginTop: '1rem',
          padding: '1rem 1.25rem',
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '12px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '1.25rem' }}>{displayHub.flag}</span>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#003666' }}>
                {displayHub.name}
              </h3>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: displayHub.type === 'hq' ? '#003666' : '#0d9488',
                backgroundColor: displayHub.type === 'hq' ? '#eff6ff' : '#f0fdf4',
                padding: '2px 8px',
                borderRadius: '999px',
                border: displayHub.type === 'hq' ? '1px solid #bfdbfe' : '1px solid #bbf7d0'
              }}>
                {displayHub.type === 'hq' ? 'Primary Vault & HQ' : (displayHub.type === 'branch' ? 'Forward Hub' : 'Partner Corridor')}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
              {displayHub.details}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#334155' }}>
              <ThermometerSnowflake size={14} style={{ color: '#0284c7', flexShrink: 0 }} />
              <span><b>Temperature Range:</b> {displayHub.tempRange}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#334155' }}>
              <Truck size={14} style={{ color: '#0d9488', flexShrink: 0 }} />
              <span><b>Service SLA:</b> {displayHub.transit}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#334155' }}>
              <ShieldCheck size={14} style={{ color: '#003666', flexShrink: 0 }} />
              <span><b>Regulatory Status:</b> {displayHub.compliance}</span>
            </div>
          </div>
        </div>

        {/* Legend bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginTop: '0.85rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid #edf2f7',
          fontSize: '0.72rem',
          color: '#64748b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#003666' }} />
              <b>HQ Vault:</b> Abu Dhabi
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0d9488' }} />
              <b>Direct Hub:</b> Dubai (2024)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0284c7' }} />
              <b>Regional Nodes:</b> Riyadh, Doha, Kuwait
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ display: 'inline-block', width: '18px', height: '2px', backgroundColor: '#003666', borderTop: '2px dashed #003666' }} />
              Overland Fleet (+2°C to +8°C)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ display: 'inline-block', width: '18px', height: '2px', backgroundColor: '#0d9488', borderTop: '2px dashed #0d9488' }} />
              Air Express (-20°C Cryo)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

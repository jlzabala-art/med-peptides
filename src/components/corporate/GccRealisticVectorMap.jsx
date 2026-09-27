"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Truck, 
  Plane, 
  Building2, 
  MapPin, 
  ThermometerSnowflake, 
  CheckCircle2, 
  Compass, 
  Radio, 
  Layers, 
  Maximize2,
  Navigation,
  Globe2,
  Sparkles,
  RefreshCw
} from 'lucide-react';

/**
 * GccRealisticVectorMap
 * ─────────────────────────────────────────────────────────────────────────────
 * Ultra-realistic, cartographically accurate vector map of the Arabian Peninsula & GCC.
 * Designed for MediLuxe / Med-Peptides corporate logistics & cold-chain distribution.
 *
 * Realism Features:
 * - True-to-life geographic coastlines: Red Sea, Bab el-Mandeb, Gulf of Aden, Arabian Sea,
 *   Gulf of Oman, Strait of Hormuz, Arabian Gulf, Qatar boot peninsula, Bahrain archipelago,
 *   Kuwait Bay, Musandam fjords, and Iranian Zagros coast for realistic marine basin closure.
 * - Bathymetric depth shading: Coastal turquoise coral shelf to oceanic midnight azure.
 * - Topographic terrain relief: Sarawat/Asir coastal ranges, Hajar Mountains, and Rub' al Khali desert.
 * - Precision navigational graticule: Lat/long coordinates (15°N–30°N, 40°E–60°E) + compass rose + metric scale bar.
 * - Rotating radar sweep centered on Abu Dhabi Central Vault HQ with real-time telemetry HUD.
 * - Geodesic cold-chain logistics arcs with animated temperature payloads (+2°C to +8°C & -20°C Cryo).
 * - Full responsive mobile compatibility (touch-friendly targets, auto-scaling SVG, swipeable chips).
 */

const HUBS = [
  {
    id: 'abudhabi',
    name: 'Abu Dhabi (HQ)',
    sub: 'Central Cold-Chain Vault · Est. 2011',
    country: 'United Arab Emirates',
    lat: '24°28′ N',
    lon: '54°22′ E',
    x: 737,
    y: 223,
    type: 'hq',
    tempRange: '+2°C to +8°C & -20°C Cryo',
    telemetry: '-21.8°C Cryo · Active Vault',
    status: 'Nominal / Certified',
    transit: 'Primary Hub · Immediate Dispatch',
    compliance: 'UAE MOHAP & HAAD Certified',
    fleet: '18 Dedicated Refrigerated Vehicles',
    flag: '🇦🇪',
    details: 'Primary corporate operations, sterile cold-chain storage vault, and regional regulatory liaison headquarters in the UAE capital.'
  },
  {
    id: 'dubai',
    name: 'Dubai Logistics Hub',
    sub: 'Direct Clinic Express Branch · 2024',
    country: 'United Arab Emirates',
    lat: '25°12′ N',
    lon: '55°16′ E',
    x: 768,
    y: 201,
    type: 'branch',
    tempRange: '+2°C to +8°C Refrigerated',
    telemetry: '+3.9°C · Active Transit',
    status: 'Operating 24/7',
    transit: 'Same-Day Express (2–4 hrs Direct)',
    compliance: 'DHA Licensed Facility',
    fleet: '12 Urban Cold-Van Couriers',
    flag: '🇦🇪',
    details: 'Strategic forward operating depot serving premier aesthetic, longevity, hormone therapy, and dermatology practices across Dubai & Northern Emirates.'
  },
  {
    id: 'doha',
    name: 'Doha Clinical Corridor',
    sub: 'Authorized Medical Distribution',
    country: 'Qatar',
    lat: '25°17′ N',
    lon: '51°31′ E',
    x: 639,
    y: 198,
    type: 'partner',
    tempRange: '+2°C to +8°C Cold-Chain',
    telemetry: '+4.2°C · Customs Cleared',
    status: 'Air Corridor Active',
    transit: '24–48 Hours Express Transit',
    compliance: 'MOPH Qatar Regulatory Liaison',
    fleet: 'Hamad International Cargo Feeder',
    flag: '🇶🇦',
    details: 'Seamless cold-chain distribution network serving hospital dermatology departments and VIP medical wellness practices in Doha and Lusail.'
  },
  {
    id: 'kuwait',
    name: 'Kuwait City Hub',
    sub: 'Aesthetics & Longevity Alliances',
    country: 'Kuwait',
    lat: '29°22′ N',
    lon: '47°58′ E',
    x: 516,
    y: 78,
    type: 'partner',
    tempRange: '-20°C / +2°C to +8°C',
    telemetry: '+3.8°C · Air Express Verified',
    status: 'Bi-Weekly Cryo Schedule',
    transit: '24–48 Hours Air Cargo',
    compliance: 'Kuwait MOH Authorized Channel',
    fleet: 'Temperature-Monitored Air Pallets',
    flag: '🇰🇼',
    details: 'Dedicated cold storage delivery partnerships with key clinical centers, genetic diagnostic labs, and cosmetic surgery centers in Kuwait City.'
  },
  {
    id: 'riyadh',
    name: 'Riyadh Distribution Node',
    sub: 'Central & Eastern Province Network',
    country: 'Saudi Arabia',
    lat: '24°42′ N',
    lon: '46°40′ E',
    x: 472,
    y: 215,
    type: 'partner',
    tempRange: '+2°C to +8°C & -20°C Cryo',
    telemetry: '+4.1°C · SFDA Logged',
    status: 'Overland & Air Cleared',
    transit: '24–72 Hours Express Logistics',
    compliance: 'SFDA Compliant Temperature Log',
    fleet: 'Batha Border Refrig-Truck Fleet',
    flag: '🇸🇦',
    details: 'Fast-expanding healthcare supply channel servicing regenerative medicine, anti-aging, and endocrinology clinics across Riyadh, Jeddah, and Khobar.'
  }
];

export default function GccRealisticVectorMap() {
  const [activeHub, setActiveHub] = useState(HUBS[0]);
  const [hoveredHub, setHoveredHub] = useState(null);
  const [mapMode, setMapMode] = useState('satellite'); // 'satellite' | 'corridors'
  const [showTelemetry, setShowTelemetry] = useState(true);
  const [radarAngle, setRadarAngle] = useState(0);

  const displayHub = hoveredHub || activeHub;

  // Gentle rotating radar sweep on Abu Dhabi HQ
  useEffect(() => {
    const interval = setInterval(() => {
      setRadarAngle((prev) => (prev + 1.5) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="gcc-realistic-map-wrapper" style={{ width: '100%', position: 'relative' }}>
      <style>{`
        @keyframes pulseGlowRing {
          0% {
            r: 8;
            opacity: 0.9;
            stroke-width: 2.5;
          }
          50% {
            opacity: 0.4;
          }
          100% {
            r: 34;
            opacity: 0;
            stroke-width: 0.5;
          }
        }
        @keyframes routeFlowDash {
          0% {
            stroke-dashoffset: 48;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes payloadOrbit {
          0% {
            offset-distance: 0%;
          }
          100% {
            offset-distance: 100%;
          }
        }
        .gcc-radar-ring-1 {
          animation: pulseGlowRing 2.4s cubic-bezier(0.1, 0.7, 0.4, 1) infinite;
        }
        .gcc-radar-ring-2 {
          animation: pulseGlowRing 2.4s cubic-bezier(0.1, 0.7, 0.4, 1) infinite 1.2s;
        }
        .gcc-route-primary {
          stroke: #0284c7;
          stroke-width: 2.2;
          stroke-dasharray: 6 4;
          animation: routeFlowDash 1.8s linear infinite;
        }
        .gcc-route-cryo {
          stroke: #0d9488;
          stroke-width: 2;
          stroke-dasharray: 4 4;
          animation: routeFlowDash 2.4s linear infinite;
        }
        .gcc-interactive-node {
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .gcc-interactive-node:hover {
          transform: scale(1.18);
        }
        .gcc-filter-btn:hover {
          background: #f1f5f9;
        }
      `}</style>

      {/* Cartographic Map Card Canvas */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '16px',
        padding: '1.25rem',
        boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.08)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Top Professional Control Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.85rem',
          marginBottom: '1rem',
          paddingBottom: '0.85rem',
          borderBottom: '1px solid #e2e8f0'
        }}>
          {/* Title and Real-Time Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#003666',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0, 54, 102, 0.25)'
            }}>
              <Globe2 size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                  GCC Cold-Chain Geographical Matrix
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#059669',
                  backgroundColor: '#ecfdf5',
                  padding: '2px 6px',
                  borderRadius: '999px',
                  border: '1px solid #a7f3d0'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                  LIVE TELEMETRY
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Continuous GPS &amp; Sensor Corridors · Abu Dhabi Central Vault to GCC Regional Gateways
              </div>
            </div>
          </div>

          {/* Quick Hub Buttons / Mobile Swipeable Tabs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexWrap: 'wrap',
            maxWidth: '100%',
            overflowX: 'auto',
            paddingBottom: '2px'
          }}>
            {HUBS.map((hub) => {
              const isSelected = displayHub.id === hub.id;
              return (
                <button
                  key={hub.id}
                  type="button"
                  onClick={() => setActiveHub(hub)}
                  onMouseEnter={() => setHoveredHub(hub)}
                  onMouseLeave={() => setHoveredHub(null)}
                  className="gcc-filter-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 11px',
                    fontSize: '0.74rem',
                    fontWeight: isSelected ? 700 : 500,
                    borderRadius: '7px',
                    border: isSelected ? '1.5px solid #003666' : '1px solid #cbd5e1',
                    backgroundColor: isSelected ? '#003666' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 6px rgba(0,54,102,0.25)' : 'none',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span>{hub.flag}</span>
                  <span>{hub.name.split(' ')[0]}</span>
                  {hub.type === 'hq' && (
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#e0f2fe',
                      color: isSelected ? '#ffffff' : '#0369a1',
                      padding: '1px 5px',
                      borderRadius: '4px'
                    }}>
                      HQ
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Map Canvas with SVG Cartography */}
        <div style={{ 
          position: 'relative', 
          width: '100%', 
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#0c2238', // Deep Oceanic Marine Backdrop
          border: '1px solid #1e3a5f'
        }}>
          {/* Subtle Map Mode Pill in Top-Right Corner */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            padding: '4px 8px',
            color: '#f8fafc',
            fontSize: '0.7rem'
          }}>
            <Radio size={13} color="#38bdf8" />
            <span>RADAR: <b>ACTIVE</b></span>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>
            <span style={{ color: '#93c5fd' }}>54°E · 24°N</span>
          </div>

          <svg
            viewBox="0 0 1000 620"
            width="100%"
            height="auto"
            style={{ display: 'block', width: '100%', height: 'auto' }}
          >
            <defs>
              {/* Deep Ocean Bathymetric Gradients */}
              <radialGradient id="oceanDeep" cx="65%" cy="30%" r="75%">
                <stop offset="0%" stopColor="#113254" />
                <stop offset="50%" stopColor="#0b233c" />
                <stop offset="100%" stopColor="#061626" />
              </radialGradient>

              {/* Coastal Water Shallows / Continental Shelf Gradient */}
              <linearGradient id="shallowGulf" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0f766e" stopOpacity="0.2" />
              </linearGradient>

              {/* Arabian Peninsula Landmass Topographic Gradient (Desert Sand & Arid Plateau) */}
              <linearGradient id="arabianLandmass" x1="15%" y1="15%" x2="85%" y2="85%">
                <stop offset="0%" stopColor="#ecd5af" />    {/* Northern Desert / Nafud */}
                <stop offset="25%" stopColor="#dfc399" />   {/* Najd Central Plateau */}
                <stop offset="55%" stopColor="#f3ddb5" />   {/* Rub' al Khali Sand Sea */}
                <stop offset="85%" stopColor="#d3b589" />   {/* Southern Highlands */}
                <stop offset="100%" stopColor="#bfa175" />  {/* Hadramawt / Dhofar Foothills */}
              </linearGradient>

              {/* Sarawat & Hijaz Mountain Shading (Red Sea Coastal Spine) */}
              <linearGradient id="mountainSpine" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8d6e4b" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#a07d57" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#cbb28b" stopOpacity="0.2" />
              </linearGradient>

              {/* Hajar Mountains of Oman / UAE */}
              <linearGradient id="hajarMountains" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#78593a" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#bfa175" stopOpacity="0.3" />
              </linearGradient>

              {/* UAE Territory Hero Focus Gradient */}
              <linearGradient id="uaeHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#003666" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0d9488" stopOpacity="0.85" />
              </linearGradient>

              {/* Radar Sweep Arc Cone Gradient */}
              <radialGradient id="radarSweepGrad" cx="0%" cy="0%" r="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
                <stop offset="70%" stopColor="#0284c7" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
              </radialGradient>

              {/* Pin Drop Shadow */}
              <filter id="cartoShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="2.5" stdDeviation="3.5" floodColor="#000000" floodOpacity="0.45" />
              </filter>
            </defs>

            {/* 1. Global Ocean Layer (Base) */}
            <rect width="1000" height="620" fill="url(#oceanDeep)" />

            {/* 2. Bathymetric Shallow Water Glow (Arabian Gulf & Red Sea coastal shelves) */}
            {/* Arabian Gulf Basin */}
            <path
              d="
                M 480 35 
                Q 530 25 600 50 
                Q 680 85 750 120 
                Q 810 145 830 160 
                Q 835 190 820 220 
                Q 790 235 750 240 
                Q 700 245 650 245 
                Q 605 240 570 210 
                Q 540 180 515 140 
                Q 490 90 480 35 
                Z
              "
              fill="url(#shallowGulf)"
              opacity="0.6"
            />
            {/* Red Sea Trench Basin */}
            <path
              d="
                M 45 45 
                L 75 80 
                Q 130 145 180 230 
                Q 230 320 280 430 
                Q 325 500 365 580 
                L 340 580 
                Q 290 490 235 390 
                Q 180 290 125 190 
                Q 75 110 35 60 
                Z
              "
              fill="#075985"
              opacity="0.35"
            />

            {/* 3. Precision Lat/Long Cartographic Graticule (Geographic Grid) */}
            <g stroke="#334155" strokeWidth="0.75" strokeDasharray="4 6" opacity="0.45">
              {/* Latitude Lines */}
              <line x1="30" y1="78" x2="970" y2="78" />   {/* ~30°N Kuwait */}
              <line x1="30" y1="215" x2="970" y2="215" /> {/* ~25°N Riyadh / UAE / Qatar */}
              <line x1="30" y1="355" x2="970" y2="355" /> {/* ~20°N Empty Quarter */}
              <line x1="30" y1="500" x2="970" y2="500" /> {/* ~15°N Yemen / Dhofar */}

              {/* Longitude Lines */}
              <line x1="100" y1="30" x2="100" y2="590" /> {/* ~35°E */}
              <line x1="272" y1="30" x2="272" y2="590" /> {/* ~40°E Red Sea */}
              <line x1="445" y1="30" x2="445" y2="590" /> {/* ~45°E Central Arabia */}
              <line x1="617" y1="30" x2="617" y2="590" /> {/* ~50°E Arabian Gulf */}
              <line x1="790" y1="30" x2="790" y2="590" /> {/* ~55°E UAE / Oman */}
              <line x1="962" y1="30" x2="962" y2="590" /> {/* ~60°E Arabian Sea */}
            </g>

            {/* Graticule Latitude/Longitude Text Markers */}
            <g fill="#64748b" fontSize="9" fontFamily="monospace" opacity="0.75">
              <text x="35" y="74">30°00′ N</text>
              <text x="35" y="211">25°00′ N</text>
              <text x="35" y="351">20°00′ N</text>
              <text x="35" y="496">15°00′ N</text>
              <text x="275" y="605">40°00′ E</text>
              <text x="448" y="605">45°00′ E</text>
              <text x="620" y="605">50°00′ E</text>
              <text x="793" y="605">55°00′ E</text>
            </g>

            {/* 4. Opposing Northern Landmass (Zagros / Iran Coastline) — Gives true cartographic basin realism */}
            <path
              d="
                M 460 30 
                Q 510 25 560 40 
                Q 630 75 700 115 
                Q 750 138 780 145 
                Q 810 148 840 152 
                Q 900 165 980 180 
                L 990 20 
                L 460 20 
                Z
              "
              fill="#c2b196"
              stroke="#9e8b70"
              strokeWidth="1.2"
              opacity="0.8"
            />
            {/* Qeshm & Hormuz Islands (Iran) */}
            <path d="M 750 145 Q 770 140 790 148 Q 775 153 750 145 Z" fill="#b09d82" stroke="#8d7a60" strokeWidth="0.8" />
            <circle cx="802" cy="148" r="3" fill="#b09d82" stroke="#8d7a60" strokeWidth="0.7" />
            <text x="650" y="70" fill="#786c57" fontSize="10" fontWeight="700" letterSpacing="0.1em" opacity="0.65">IRAN (ZAGROS REGION)</text>

            {/* 5. Sinai Peninsula & Levant (Northwest) */}
            <path
              d="
                M 20 30 
                L 35 60 
                L 50 90 
                L 62 105 
                Q 55 80 48 50 
                L 40 30 
                Z
              "
              fill="#dfc399"
              stroke="#b59a72"
              strokeWidth="1"
              opacity="0.85"
            />

            {/* 6. REALISTIC ARABIAN PENINSULA MASTER GEOGRAPHIC LANDMASS */}
            {/* Geometrically traced along natural bays, capes, peninsulas and rias */}
            <path
              d="
                M 69 74 
                Q 75 105 82 120 
                Q 92 138 115 168 
                Q 138 204 165 245 
                Q 188 275 205 305 
                Q 213 330 220 350 
                Q 235 375 260 420 
                Q 285 460 310 495 
                Q 325 520 338 545 
                Q 350 565 356 575 
                Q 385 572 415 567 
                Q 465 555 515 540 
                Q 555 525 580 515 
                Q 635 492 665 480 
                Q 695 462 705 460 
                Q 712 452 727 442 
                Q 750 435 785 420 
                Q 835 385 848 360 
                Q 855 330 880 305 
                Q 924 279 910 268 
                Q 898 258 876 245 
                Q 858 238 840 226 
                Q 824 214 816 202 
                Q 812 194 810 185 
                Q 808 176 805 165 
                Q 807 160 802 165 
                Q 794 175 784 184 
                Q 776 192 768 201 
                Q 755 209 748 214 
                Q 737 223 708 234 
                Q 678 237 648 238 
                Q 642 234 642 225 
                Q 641 210 639 198 
                Q 638 182 634 168 
                Q 628 166 622 174 
                Q 620 190 618 218 
                Q 616 226 605 220 
                Q 596 182 592 172 
                Q 586 162 584 154 
                Q 568 138 552 122 
                Q 538 108 528 98 
                Q 520 89 518 86 
                Q 516 82 516 78 
                Q 498 76 505 65 
                Q 512 55 500 52 
                Q 470 55 420 52 
                Q 350 48 260 48 
                Q 170 52 105 60 
                Z
              "
              fill="url(#arabianLandmass)"
              stroke="#8a7353"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />

            {/* 7. Desert Shading & Dune Textures: Rub' al Khali (Empty Quarter) */}
            <g opacity="0.35">
              <path
                d="M 520 300 Q 640 280 740 310 Q 790 350 710 400 Q 600 420 530 380 Q 480 340 520 300 Z"
                fill="#fde68a"
              />
              {/* Dune waves */}
              <path d="M 540 320 Q 580 315 620 325 Q 670 330 710 320" stroke="#d97706" strokeWidth="1" fill="none" opacity="0.6" />
              <path d="M 560 345 Q 610 338 660 352 Q 700 355 735 340" stroke="#d97706" strokeWidth="1" fill="none" opacity="0.6" />
              <path d="M 530 370 Q 590 365 650 375 Q 690 380 720 368" stroke="#d97706" strokeWidth="1" fill="none" opacity="0.6" />
            </g>

            {/* 8. Mountain Ranges Relief (Topographic Elevation) */}
            {/* Sarawat & Asir Mountain Belt (Western Red Sea Crest) */}
            <path
              d="
                M 115 170 
                Q 150 215 180 265 
                Q 205 310 225 360 
                Q 255 410 285 460 
                Q 310 500 335 540 
                L 315 545 
                Q 290 500 265 450 
                Q 235 400 205 350 
                Q 175 295 150 250 
                Q 125 205 100 165 
                Z
              "
              fill="url(#mountainSpine)"
            />

            {/* Hajar Mountains of Northern Oman & Eastern UAE */}
            <path
              d="
                M 808 175 
                Q 814 200 826 220 
                Q 845 240 870 255 
                Q 885 265 895 275 
                L 880 280 
                Q 865 268 845 250 
                Q 825 230 812 205 
                Q 802 185 800 172 
                Z
              "
              fill="url(#hajarMountains)"
            />

            {/* 9. Realistic Country Sovereign Borders (Subtle Cartographic Lines) */}
            {/* Saudi / Yemen Border */}
            <path d="M 325 520 Q 380 500 440 480 Q 520 460 610 460 Q 660 460 705 460" stroke="#78664e" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
            {/* Yemen / Oman Border */}
            <path d="M 705 460 L 712 452" stroke="#78664e" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
            {/* Saudi / Oman Border */}
            <path d="M 705 460 Q 680 400 660 350 Q 650 310 650 280" stroke="#78664e" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
            {/* Saudi / UAE Border (Arba'een & Liwa Oasis demarcation) */}
            <path d="M 650 280 Q 670 270 700 268 Q 730 265 745 260 Q 755 240 760 220" stroke="#78664e" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
            {/* UAE / Oman Northern Border (Hatta, Fujairah, Buraimi) */}
            <path d="M 760 220 Q 775 225 790 225 L 812 194" stroke="#78664e" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
            {/* Musandam Enclave Border */}
            <path d="M 808 176 L 798 178" stroke="#78664e" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
            {/* Saudi / Kuwait Border */}
            <path d="M 520 89 L 490 92 Q 470 92 468 70" stroke="#78664e" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
            {/* Saudi / Jordan / Iraq Northern Frontiers */}
            <path d="M 105 60 Q 180 52 260 48 L 420 52 L 468 70" stroke="#78664e" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />

            {/* 10. DEDICATED GCC TERRITORY HIGHLIGHTS */}

            {/* A. Kuwait Territory Highlight */}
            <path
              d="
                M 518 86 
                Q 516 82 516 78 
                Q 498 76 505 65 
                Q 512 55 500 52 
                L 468 70 
                Q 470 92 490 92 
                L 520 89 
                Z
              "
              fill={displayHub.id === 'kuwait' ? '#0d9488' : '#99f6e4'}
              stroke="#0f766e"
              strokeWidth="1.6"
              style={{ transition: 'all 0.25s ease', cursor: 'pointer' }}
              onClick={() => setActiveHub(HUBS.find((h) => h.id === 'kuwait'))}
            />
            {/* Bubiyan Island (Kuwait) */}
            <path d="M 512 66 Q 522 55 526 62 Q 524 72 514 74 Z" fill="#99f6e4" stroke="#0f766e" strokeWidth="1" />

            {/* B. Bahrain Archipelago Highlight */}
            <g
              style={{ cursor: 'pointer' }}
              onClick={() => setActiveHub(HUBS.find((h) => h.id === 'doha'))}
            >
              {/* Bahrain Main Island */}
              <ellipse cx="606" cy="171" rx="5" ry="9" fill={displayHub.id === 'doha' ? '#0284c7' : '#bae6fd'} stroke="#0369a1" strokeWidth="1.2" />
              {/* Muharraq */}
              <circle cx="610" cy="164" r="2.5" fill="#bae6fd" stroke="#0369a1" strokeWidth="0.8" />
              {/* King Fahd Causeway to Saudi Arabia */}
              <line x1="592" y1="172" x2="603" y2="171" stroke="#475569" strokeWidth="1.2" strokeDasharray="1 1" />
              <text x="590" y="162" fill="#0369a1" fontSize="8" fontWeight="800">Bahrain</text>
            </g>

            {/* C. Qatar Boot Peninsula Highlight */}
            <path
              d="
                M 642 225 
                Q 641 210 639 198 
                Q 638 182 634 168 
                Q 628 166 622 174 
                Q 620 190 618 218 
                Q 628 226 642 225 
                Z
              "
              fill={displayHub.id === 'doha' ? '#0284c7' : '#bae6fd'}
              stroke="#0369a1"
              strokeWidth="1.8"
              style={{ transition: 'all 0.25s ease', cursor: 'pointer' }}
              onClick={() => setActiveHub(HUBS.find((h) => h.id === 'doha'))}
            />

            {/* D. United Arab Emirates (HQ Hero Territory) */}
            <path
              d="
                M 648 238 
                Q 678 237 708 234 
                Q 737 223 748 214 
                Q 755 209 768 201 
                Q 776 192 784 184 
                Q 794 175 802 165 
                Q 805 175 810 185 
                Q 812 194 790 225 
                Q 775 225 760 220 
                Q 755 240 745 260 
                Q 730 265 700 268 
                Q 670 270 650 280 
                Q 645 255 648 238 
                Z
              "
              fill={displayHub.country === 'United Arab Emirates' ? 'url(#uaeHighlight)' : '#003666'}
              stroke="#00274a"
              strokeWidth="2.4"
              style={{ transition: 'all 0.25s ease', cursor: 'pointer' }}
              onClick={() => setActiveHub(HUBS.find((h) => h.id === 'abudhabi'))}
            />
            {/* UAE Label on Territory */}
            <text x="715" y="248" fill="#ffffff" fontSize="10" fontWeight="900" letterSpacing="0.08em">
              U.A.E. (HQ)
            </text>

            {/* E. Oman Sovereign Territory Text */}
            <text x="800" y="320" fill="#716047" fontSize="13" fontWeight="800" letterSpacing="0.12em" opacity="0.85">
              OMAN
            </text>

            {/* F. Saudi Arabia Territory Text */}
            <text x="360" y="235" fill="#5c4d36" fontSize="16" fontWeight="900" letterSpacing="0.14em" opacity="0.85">
              SAUDI ARABIA
            </text>
            <text x="360" y="252" fill="#78664e" fontSize="9.5" fontWeight="700" letterSpacing="0.05em" opacity="0.9">
              Kingdom of Saudi Arabia (SFDA Territory)
            </text>

            {/* G. Yemen Territory Text */}
            <text x="490" y="520" fill="#716047" fontSize="13" fontWeight="800" letterSpacing="0.1em" opacity="0.75">
              YEMEN
            </text>

            {/* 11. Water Body Geographic Labels */}
            {/* Arabian Gulf */}
            <text x="640" y="125" fill="#38bdf8" fontSize="13" fontWeight="800" letterSpacing="0.08em" opacity="0.9">
              Arabian Gulf (Al Khaleej)
            </text>
            <text x="640" y="138" fill="#7dd3fc" fontSize="8" fontWeight="600" opacity="0.7">
              Primary Maritime Energy &amp; Trade Basin
            </text>

            {/* Strait of Hormuz */}
            <text x="815" y="145" fill="#93c5fd" fontSize="9" fontWeight="800" letterSpacing="0.04em">
              Strait of Hormuz ➔
            </text>

            {/* Gulf of Oman */}
            <text x="880" y="210" fill="#38bdf8" fontSize="11" fontWeight="700" fontStyle="italic" opacity="0.85">
              Gulf of Oman
            </text>

            {/* Arabian Sea */}
            <text x="830" y="490" fill="#38bdf8" fontSize="12" fontWeight="700" fontStyle="italic" opacity="0.8">
              Arabian Sea
            </text>

            {/* Red Sea */}
            <text x="140" y="320" fill="#38bdf8" fontSize="13" fontWeight="800" fontStyle="italic" opacity="0.8" transform="rotate(-54 140 320)">
              Red Sea (Al Bahr Al Ahmar)
            </text>

            {/* Bab el-Mandeb Strait */}
            <text x="310" y="605" fill="#93c5fd" fontSize="9" fontWeight="800">
              Bab el-Mandeb
            </text>

            {/* 12. ROTATING RADAR SWEEP ON ABU DHABI HQ */}
            <g transform={`translate(737, 223)`}>
              {/* Radar Rings */}
              <circle cx="0" cy="0" r="12" fill="none" stroke="#38bdf8" strokeWidth="1.5" className="gcc-radar-ring-1" />
              <circle cx="0" cy="0" r="12" fill="none" stroke="#0284c7" strokeWidth="1" className="gcc-radar-ring-2" />
              <circle cx="0" cy="0" r="45" fill="none" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="0.8" strokeDasharray="3 3" />
              <circle cx="0" cy="0" r="85" fill="none" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="0.8" strokeDasharray="2 4" />

              {/* Rotating Radar Cone */}
              <g transform={`rotate(${radarAngle})`}>
                <path
                  d="M 0 0 L 80 -35 A 85 85 0 0 1 85 0 Z"
                  fill="url(#radarSweepGrad)"
                />
                <line x1="0" y1="0" x2="85" y2="0" stroke="#38bdf8" strokeWidth="1.2" opacity="0.8" />
              </g>
            </g>

            {/* 13. GEODESIC COLD-CHAIN LOGISTICS ARCS */}

            {/* Route 1: Abu Dhabi HQ (737, 223) -> Dubai Hub (768, 201) (Express E11 Overland) */}
            <path
              id="routeAbuDubai"
              d="M 737 223 Q 755 210 768 201"
              fill="none"
              className="gcc-route-primary"
            />

            {/* Route 2: Abu Dhabi HQ (737, 223) -> Doha (639, 198) (Overland/Air Corridor) */}
            <path
              id="routeAbuDoha"
              d="M 737 223 Q 685 195 639 198"
              fill="none"
              className="gcc-route-primary"
            />

            {/* Route 3: Abu Dhabi HQ (737, 223) -> Riyadh SFDA Gateway (472, 215) */}
            <path
              id="routeAbuRiyadh"
              d="M 737 223 Q 600 185 472 215"
              fill="none"
              className="gcc-route-primary"
            />

            {/* Route 4: Abu Dhabi HQ (737, 223) -> Kuwait City (516, 78) (Cryo Flight Air Cargo) */}
            <path
              id="routeAbuKuwait"
              d="M 737 223 Q 630 115 516 78"
              fill="none"
              className="gcc-route-cryo"
            />

            {/* Route 5: Dubai Hub (768, 201) -> Riyadh Feeder */}
            <path
              d="M 768 201 Q 620 170 472 215"
              fill="none"
              stroke="#64748b"
              strokeWidth="1.2"
              strokeDasharray="2 3"
              opacity="0.6"
            />

            {/* Animated Payload Pulses traveling along routes */}
            <circle r="3.5" fill="#38bdf8" filter="url(#cartoShadow)">
              <animateMotion dur="2.4s" repeatCount="indefinite" path="M 737 223 Q 755 210 768 201" />
            </circle>
            <circle r="3.5" fill="#0284c7" filter="url(#cartoShadow)">
              <animateMotion dur="3.6s" repeatCount="indefinite" path="M 737 223 Q 685 195 639 198" />
            </circle>
            <circle r="3.5" fill="#0284c7" filter="url(#cartoShadow)">
              <animateMotion dur="4.2s" repeatCount="indefinite" path="M 737 223 Q 600 185 472 215" />
            </circle>
            <circle r="3.5" fill="#0d9488" filter="url(#cartoShadow)">
              <animateMotion dur="4.8s" repeatCount="indefinite" path="M 737 223 Q 630 115 516 78" />
            </circle>

            {/* 14. NAUTICAL COMPASS ROSE (Top Right Geographic Orientation) */}
            <g transform="translate(920, 80)">
              {/* Compass Ring */}
              <circle cx="0" cy="0" r="32" fill="rgba(15, 23, 42, 0.65)" stroke="#38bdf8" strokeWidth="1.2" />
              <circle cx="0" cy="0" r="28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" strokeDasharray="2 2" />
              {/* 4 Points */}
              <polygon points="0,-26 4,-6 0,0 -4,-6" fill="#ef4444" />
              <polygon points="0,26 4,6 0,0 -4,6" fill="#94a3b8" />
              <polygon points="26,0 6,4 0,0 6,-4" fill="#94a3b8" />
              <polygon points="-26,0 -6,4 0,0 -6,-4" fill="#94a3b8" />
              {/* North Star Indicator */}
              <text x="0" y="-14" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">N</text>
              <text x="0" y="21" fill="#94a3b8" fontSize="7" fontWeight="700" textAnchor="middle">S</text>
              <text x="18" y="3" fill="#94a3b8" fontSize="7" fontWeight="700" textAnchor="middle">E</text>
              <text x="-18" y="3" fill="#94a3b8" fontSize="7" fontWeight="700" textAnchor="middle">W</text>
            </g>

            {/* 15. METRIC SCALE BAR (Bottom Left Corner) */}
            <g transform="translate(60, 560)">
              <rect x="0" y="0" width="160" height="22" rx="4" fill="rgba(15, 23, 42, 0.7)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              {/* Alternating black/white scale segments */}
              <rect x="15" y="11" width="40" height="4" fill="#ffffff" />
              <rect x="55" y="11" width="40" height="4" fill="#38bdf8" />
              <rect x="95" y="11" width="40" height="4" fill="#ffffff" />
              {/* Ticks and text */}
              <line x1="15" y1="8" x2="15" y2="17" stroke="#ffffff" strokeWidth="1" />
              <line x1="55" y1="8" x2="55" y2="17" stroke="#ffffff" strokeWidth="1" />
              <line x1="95" y1="8" x2="95" y2="17" stroke="#ffffff" strokeWidth="1" />
              <line x1="135" y1="8" x2="135" y2="17" stroke="#ffffff" strokeWidth="1" />
              <text x="15" y="7" fill="#ffffff" fontSize="7" fontWeight="700" textAnchor="middle">0</text>
              <text x="55" y="7" fill="#ffffff" fontSize="7" fontWeight="700" textAnchor="middle">200</text>
              <text x="95" y="7" fill="#ffffff" fontSize="7" fontWeight="700" textAnchor="middle">400</text>
              <text x="135" y="7" fill="#ffffff" fontSize="7" fontWeight="700" textAnchor="middle">600 km</text>
            </g>

            {/* 16. INTERACTIVE HUBS & PINS */}

            {/* A. RIYADH HUB NODE */}
            <g
              className="gcc-interactive-node"
              onClick={() => setActiveHub(HUBS.find((h) => h.id === 'riyadh'))}
              onMouseEnter={() => setHoveredHub(HUBS.find((h) => h.id === 'riyadh'))}
              onMouseLeave={() => setHoveredHub(null)}
            >
              <circle cx="472" cy="215" r="7.5" fill="#0284c7" stroke="#ffffff" strokeWidth="2.2" filter="url(#cartoShadow)" />
              <circle cx="472" cy="215" r="3.5" fill="#ffffff" />
              <rect x="408" y="180" width="82" height="20" rx="4" fill="#ffffff" stroke="#0284c7" strokeWidth="1.2" filter="url(#cartoShadow)" />
              <text x="449" y="194" fill="#0f172a" fontSize="9.5" fontWeight="800" textAnchor="middle">🇸🇦 Riyadh</text>
            </g>

            {/* B. KUWAIT HUB NODE */}
            <g
              className="gcc-interactive-node"
              onClick={() => setActiveHub(HUBS.find((h) => h.id === 'kuwait'))}
              onMouseEnter={() => setHoveredHub(HUBS.find((h) => h.id === 'kuwait'))}
              onMouseLeave={() => setHoveredHub(null)}
            >
              <circle cx="516" cy="78" r="7.5" fill="#0d9488" stroke="#ffffff" strokeWidth="2.2" filter="url(#cartoShadow)" />
              <circle cx="516" cy="78" r="3.5" fill="#ffffff" />
              <rect x="456" y="46" width="80" height="20" rx="4" fill="#ffffff" stroke="#0d9488" strokeWidth="1.2" filter="url(#cartoShadow)" />
              <text x="496" y="60" fill="#0f172a" fontSize="9.5" fontWeight="800" textAnchor="middle">🇰🇼 Kuwait</text>
            </g>

            {/* C. DOHA QATAR HUB NODE */}
            <g
              className="gcc-interactive-node"
              onClick={() => setActiveHub(HUBS.find((h) => h.id === 'doha'))}
              onMouseEnter={() => setHoveredHub(HUBS.find((h) => h.id === 'doha'))}
              onMouseLeave={() => setHoveredHub(null)}
            >
              <circle cx="639" cy="198" r="7.5" fill="#0284c7" stroke="#ffffff" strokeWidth="2.2" filter="url(#cartoShadow)" />
              <circle cx="639" cy="198" r="3.5" fill="#ffffff" />
              <rect x="652" y="188" width="76" height="20" rx="4" fill="#ffffff" stroke="#0284c7" strokeWidth="1.2" filter="url(#cartoShadow)" />
              <text x="690" y="202" fill="#0f172a" fontSize="9.5" fontWeight="800" textAnchor="middle">🇶🇦 Doha</text>
            </g>

            {/* D. DUBAI HUB NODE */}
            <g
              className="gcc-interactive-node"
              onClick={() => setActiveHub(HUBS.find((h) => h.id === 'dubai'))}
              onMouseEnter={() => setHoveredHub(HUBS.find((h) => h.id === 'dubai'))}
              onMouseLeave={() => setHoveredHub(null)}
            >
              <circle cx="768" cy="201" r="8.5" fill="#0d9488" stroke="#ffffff" strokeWidth="2.5" filter="url(#cartoShadow)" />
              <circle cx="768" cy="201" r="4" fill="#ffffff" />
              <rect x="782" y="190" width="102" height="22" rx="4" fill="#ffffff" stroke="#0d9488" strokeWidth="1.4" filter="url(#cartoShadow)" />
              <text x="833" y="205" fill="#0d9488" fontSize="9.5" fontWeight="900" textAnchor="middle">🇦🇪 Dubai (2024)</text>
            </g>

            {/* E. ABU DHABI HQ CENTRAL VAULT (MASTER PIN) */}
            <g
              className="gcc-interactive-node"
              onClick={() => setActiveHub(HUBS.find((h) => h.id === 'abudhabi'))}
              onMouseEnter={() => setHoveredHub(HUBS.find((h) => h.id === 'abudhabi'))}
              onMouseLeave={() => setHoveredHub(null)}
            >
              {/* Big Core Glow Marker */}
              <circle cx="737" cy="223" r="12" fill="#003666" stroke="#ffffff" strokeWidth="3" filter="url(#cartoShadow)" />
              <circle cx="737" cy="223" r="5.5" fill="#38bdf8" />

              {/* Master Callout Plaque */}
              <line x1="737" y1="235" x2="737" y2="280" stroke="#003666" strokeWidth="2" strokeDasharray="3 3" />
              <rect x="652" y="280" width="170" height="34" rx="6" fill="#003666" stroke="#ffffff" strokeWidth="1.8" filter="url(#cartoShadow)" />
              <text x="737" y="296" fill="#ffffff" fontSize="10.5" fontWeight="900" textAnchor="middle" letterSpacing="0.02em">
                🏢 ABU DHABI (HQ)
              </text>
              <text x="737" y="308" fill="#93c5fd" fontSize="8.5" fontWeight="700" textAnchor="middle">
                Central Cold-Chain Vault · Est. 2011
              </text>
            </g>
          </svg>
        </div>

        {/* Dynamic Detail Telemetry Card of Selected Hub */}
        <div style={{
          marginTop: '1rem',
          padding: '1.15rem 1.35rem',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          border: '1.5px solid #cbd5e1',
          borderRadius: '12px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          alignItems: 'center',
          boxShadow: '0 4px 12px -2px rgba(15, 23, 42, 0.05)'
        }}>
          {/* Left Column: Hub Identity & Role */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.4rem' }}>{displayHub.flag}</span>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#003666' }}>
                {displayHub.name}
              </h3>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: displayHub.type === 'hq' ? '#003666' : '#0d9488',
                backgroundColor: displayHub.type === 'hq' ? '#e0f2fe' : '#ecfdf5',
                padding: '2px 8px',
                borderRadius: '999px',
                border: displayHub.type === 'hq' ? '1px solid #bae6fd' : '1px solid #a7f3d0'
              }}>
                {displayHub.type === 'hq' ? 'Regional Vault & HQ' : (displayHub.type === 'branch' ? 'Forward Operating Depot' : 'Cross-Border Corridor')}
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 600, marginBottom: '0.4rem' }}>
              GPS: {displayHub.lat}, {displayHub.lon} · {displayHub.country}
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
              {displayHub.details}
            </p>
          </div>

          {/* Right Column: Cold-Chain Telemetry & Regulatory Clearances */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '0.5rem',
            fontSize: '0.76rem',
            backgroundColor: '#ffffff',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#334155' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ThermometerSnowflake size={15} style={{ color: '#0284c7', flexShrink: 0 }} />
                <b>Thermal Protocol:</b>
              </span>
              <span style={{ fontWeight: 700, color: '#0369a1' }}>{displayHub.tempRange}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#334155' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Radio size={15} style={{ color: '#059669', flexShrink: 0 }} />
                <b>Sensor Telemetry:</b>
              </span>
              <span style={{
                fontWeight: 700,
                color: '#047857',
                backgroundColor: '#ecfdf5',
                padding: '1px 7px',
                borderRadius: '4px',
                border: '1px solid #a7f3d0'
              }}>
                {displayHub.telemetry}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#334155' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={15} style={{ color: '#0d9488', flexShrink: 0 }} />
                <b>Transit SLA:</b>
              </span>
              <span style={{ fontWeight: 600 }}>{displayHub.transit}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#334155' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={15} style={{ color: '#003666', flexShrink: 0 }} />
                <b>Regulatory Status:</b>
              </span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{displayHub.compliance}</span>
            </div>
          </div>
        </div>

        {/* Bottom Cartographic Legend */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginTop: '0.85rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid #e2e8f0',
          fontSize: '0.72rem',
          color: '#64748b'
        }}>
          {/* Node Types Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#003666', border: '1.5px solid #ffffff', boxShadow: '0 0 0 1px #003666' }} />
              <b>HQ Central Vault:</b> Abu Dhabi
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0d9488', border: '1.5px solid #ffffff', boxShadow: '0 0 0 1px #0d9488' }} />
              <b>Express Branch:</b> Dubai (2024)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0284c7', border: '1.5px solid #ffffff', boxShadow: '0 0 0 1px #0284c7' }} />
              <b>Regional Gateways:</b> Riyadh, Doha, Kuwait
            </span>
          </div>

          {/* Transit Logistics Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ display: 'inline-block', width: '18px', height: '2px', backgroundColor: '#0284c7', borderTop: '2px dashed #0284c7' }} />
              Overland Highway Fleet (+2°C to +8°C)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ display: 'inline-block', width: '18px', height: '2px', backgroundColor: '#0d9488', borderTop: '2px dashed #0d9488' }} />
              Air Express Corridors (-20°C Cryo)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

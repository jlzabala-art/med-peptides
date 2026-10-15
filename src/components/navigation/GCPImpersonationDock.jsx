"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sliders,
  ExternalLink,
  User,
  Stethoscope,
  FlaskConical,
  Globe,
  ChevronDown,
  X,
  Search,
  Zap,
  ArrowRight,
  ShieldCheck,
  Minimize2,
  Maximize2
} from '@/lib/icons';
import { triggerHaptic } from '../../utils/haptics';

export default function GCPImpersonationDock() {
  const pathname = usePathname();
  const router = useRouter();

  const [isActive, setIsActive] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null); // 'doctors' | 'patients' | 'products' | null

  // Activate AM session if visiting /account-manager or /tools, or if stored in sessionStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (pathname?.startsWith('/account-manager') || pathname?.startsWith('/tools')) {
      sessionStorage.setItem('atlas_am_session', 'active');
      setIsActive(true);
    } else {
      const stored = sessionStorage.getItem('atlas_am_session');
      if (stored === 'active') {
        setIsActive(true);
      }
    }
  }, [pathname]);

  // Close menus on outside click or navigation
  useEffect(() => {
    setActiveMenu(null);
  }, [pathname]);

  if (!isActive) return null;

  // Detect current context
  let currentContext = 'Pantalla Pública';
  let contextColor = '#38bdf8';
  if (pathname?.startsWith('/dr/')) {
    const slug = pathname.replace('/dr/', '').split('/')[0];
    currentContext = `Portal Médico: Dr. ${slug.replace(/-/g, ' ')}`;
    contextColor = '#34d399';
  } else if (pathname?.startsWith('/doctor')) {
    currentContext = 'Workspace Médico';
    contextColor = '#34d399';
  } else if (pathname?.startsWith('/rx/')) {
    const code = pathname.replace('/rx/', '').split('/')[0];
    currentContext = `Receta Paciente: ${code}`;
    contextColor = '#a78bfa';
  } else if (pathname?.startsWith('/lab/')) {
    const code = pathname.replace('/lab/', '').split('/')[0];
    currentContext = `Lab Paciente: ${code}`;
    contextColor = '#a78bfa';
  } else if (pathname?.startsWith('/p/')) {
    const slug = pathname.replace('/p/', '').split('/')[0];
    currentContext = `Monografía: ${slug.toUpperCase()}`;
    contextColor = '#fbbf24';
  } else if (pathname?.startsWith('/account-manager') || pathname?.startsWith('/tools')) {
    currentContext = 'Consola Principal de Account Manager';
    contextColor = '#38bdf8';
  }

  const quickDoctors = [
    { name: 'Dr. Raffanie Lucenio (Qatar 🇶🇦)', url: '/dr/raffanie-lucenio' },
    { name: 'Dr. Çağatay Sezgin (Dubai 🇦🇪)', url: '/dr/dr-cagatay-sezgin' },
    { name: 'Dr. M Jay Alkhatib (YDL Dubai 🇦🇪)', url: '/dr/dr-jay-alkhatib' },
    { name: 'Dr. Sobia Mirza (MLSC Dubai 🇦🇪)', url: '/dr/dr-sobia-mirza' },
    { name: 'Dra. Haydee Camacho (Madrid 🇪🇸)', url: '/dr/haydee-camacho' },
    { name: 'Dr. Carlos Méndez (Barcelona 🇪🇸)', url: '/dr/carlos-mendez' },
    { name: 'Dr. Frank Silva (London 🇬🇧)', url: '/dr/frank-silva' }
  ];

  const quickPatients = [
    { name: 'Turky Al-Shahwani (Qatar 🇶🇦)', url: '/rx/RX-BOX02574AATRI' },
    { name: 'Aisha Alsulaiti (Qatar 🇶🇦)', url: '/rx/RX-BOX02550AATRI' },
    { name: 'Maryam Al-Sulaiti (Qatar 🇶🇦)', url: '/rx/RX-BOX02571AATRI' },
    { name: 'Rashid Malalla (Dubai 🇦🇪)', url: '/rx/RX-BOX03484AATRI' },
    { name: 'Abdulrahman Fakhro (Qatar 🇶🇦)', url: '/rx/RX-BOX03054AATRI' },
    { name: 'Mohammed Al-Khulaifi (Qatar 🇶🇦)', url: '/rx/RX-BOX03044AATRI' },
    { name: 'Moza Almatwi (Qatar 🇶🇦)', url: '/rx/RX-BOX03041AATRI' },
    { name: 'Salwa Alkubaisi (Qatar 🇶🇦)', url: '/rx/RX-BOX03055AATRI' },
    { name: 'Saadat Valiyeva (YDL 🇦🇪)', url: '/rx/RX-FAG-YDL-001' }
  ];

  const quickProducts = [
    { name: 'Retatrutide 10mg (Triple Agonist)', url: '/p/retatrutide' },
    { name: 'Tirzepatide 15mg (Dual Agonist)', url: '/p/tirzepatide' },
    { name: 'Semaglutide 5mg (GLP-1 RA)', url: '/p/semaglutide' },
    { name: 'BPC-157 & TB-500 Blend (10mg)', url: '/p/bpc-157-tb-500' },
    { name: 'NAD+ Pure API (1000mg)', url: '/p/nad-plus' },
    { name: 'GHK-Cu Copper Tripeptide', url: '/p/ghk-cu' },
    { name: 'Epithalon Tetrapeptide (10mg)', url: '/p/epithalon' },
    { name: 'Colway Stem Cell Trichology', url: '/p/colway-trichology' }
  ];

  const handleOpenCommandPalette = () => {
    triggerHaptic('selection');
    window.dispatchEvent(new CustomEvent('open-gcp-command-palette'));
  };

  const handleExitAMMode = () => {
    triggerHaptic('impact');
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('atlas_am_session');
    }
    setIsActive(false);
  };

  // Minimized Floating Pill
  if (isMinimized) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 99990,
          background: '#0f172a',
          color: '#ffffff',
          borderRadius: '999px',
          padding: '8px 16px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.4)',
          border: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.78rem',
          fontWeight: 700,
          cursor: 'pointer'
        }}
        onClick={() => { triggerHaptic('selection'); setIsMinimized(false); }}
      >
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
        <span>👤 Account Manager Dock</span>
        <Maximize2 size={13} style={{ color: '#94a3b8' }} />
      </div>
    );
  }

  return (
    <aside
      aria-label="Account Manager Impersonation Dock"
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99990,
        width: 'calc(100% - 32px)',
        maxWidth: '1180px',
        background: 'rgba(15, 23, 42, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '14px',
        padding: '8px 14px',
        color: '#ffffff',
        boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        
        {/* Left: Status & Context */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#94a3b8' }}>
              Account Manager
            </span>
          </div>

          <div style={{ width: 1, height: 16, background: '#334155' }} />

          <div style={{ fontSize: '0.8rem', fontWeight: 650, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: contextColor }}>●</span>
            <span style={{ maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentContext}
            </span>
          </div>
        </div>

        {/* Center: 1-Click Fast Jump Menus (Sin Password) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
          
          {/* Public Views */}
          <Link
            href="/catalog"
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#e2e8f0',
              fontSize: '0.74rem',
              fontWeight: 650,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Globe size={12} color="#38bdf8" />
            <span>Pública</span>
          </Link>

          {/* Doctors Menu */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => { triggerHaptic('selection'); setActiveMenu(activeMenu === 'doctors' ? null : 'doctors'); }}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                background: activeMenu === 'doctors' ? '#059669' : 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#e2e8f0',
                fontSize: '0.74rem',
                fontWeight: 650,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Stethoscope size={12} color="#34d399" />
              <span>Doctores</span>
              <ChevronDown size={11} />
            </button>

            {activeMenu === 'doctors' && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 8px)',
                  left: 0,
                  width: '260px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  padding: '6px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  zIndex: 99999
                }}
              >
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', padding: '4px 8px', textTransform: 'uppercase' }}>
                  Portales Médicos Directos (Sin Password)
                </div>
                {quickDoctors.map((doc, idx) => (
                  <Link
                    key={idx}
                    href={doc.url}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '6px',
                      color: '#e2e8f0',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>{doc.name}</span>
                    <ExternalLink size={11} color="#94a3b8" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Patients Menu */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => { triggerHaptic('selection'); setActiveMenu(activeMenu === 'patients' ? null : 'patients'); }}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                background: activeMenu === 'patients' ? '#7c3aed' : 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#e2e8f0',
                fontSize: '0.74rem',
                fontWeight: 650,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <User size={12} color="#a78bfa" />
              <span>Pacientes</span>
              <ChevronDown size={11} />
            </button>

            {activeMenu === 'patients' && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 8px)',
                  left: 0,
                  width: '260px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  padding: '6px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  zIndex: 99999
                }}
              >
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', padding: '4px 8px', textTransform: 'uppercase' }}>
                  Recetas & Dossiers Directos (Sin Password)
                </div>
                {quickPatients.map((pt, idx) => (
                  <Link
                    key={idx}
                    href={pt.url}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '6px',
                      color: '#e2e8f0',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>{pt.name}</span>
                    <ExternalLink size={11} color="#94a3b8" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Products Menu */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => { triggerHaptic('selection'); setActiveMenu(activeMenu === 'products' ? null : 'products'); }}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                background: activeMenu === 'products' ? '#d97706' : 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#e2e8f0',
                fontSize: '0.74rem',
                fontWeight: 650,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <FlaskConical size={12} color="#fbbf24" />
              <span>Productos</span>
              <ChevronDown size={11} />
            </button>

            {activeMenu === 'products' && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 8px)',
                  left: 0,
                  width: '270px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  padding: '6px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  zIndex: 99999
                }}
              >
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', padding: '4px 8px', textTransform: 'uppercase' }}>
                  Monografías & Viales (HPLC & CoA)
                </div>
                {quickProducts.map((pr, idx) => (
                  <Link
                    key={idx}
                    href={pr.url}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '6px',
                      color: '#e2e8f0',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>{pr.name}</span>
                    <ExternalLink size={11} color="#94a3b8" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Command Palette Trigger */}
          <button
            type="button"
            onClick={handleOpenCommandPalette}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              background: '#0284c7',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
            title="Abrir GCP Command Palette (⌘K)"
          >
            <Search size={12} />
            <span>⌘K</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Link
            href="/account-manager"
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.12)',
              color: '#ffffff',
              fontSize: '0.74rem',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Sliders size={12} />
            <span>Consola AM ⎋</span>
          </Link>

          <button
            type="button"
            onClick={() => { triggerHaptic('selection'); setIsMinimized(true); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Minimizar dock"
          >
            <Minimize2 size={14} />
          </button>

          <button
            type="button"
            onClick={handleExitAMMode}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Salir del modo Account Manager"
          >
            <X size={14} />
          </button>
        </div>

      </div>
    </aside>
  );
}

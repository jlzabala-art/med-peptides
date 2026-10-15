"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Globe,
  Stethoscope,
  User,
  FlaskConical,
  Sliders,
  ExternalLink,
  RefreshCw,
  Tag,
  ArrowRight,
  Shield,
  X
} from '@/lib/icons';
import { triggerHaptic } from '../../utils/haptics';
import { toast } from 'react-hot-toast';

export default function GCPCommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Global Keydown Listener for ⌘K / Ctrl+K and ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        triggerHaptic('selection');
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-gcp-command-palette', handleCustomOpen);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-gcp-command-palette', handleCustomOpen);
    };
  }, [isOpen]);

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Master Indexed Resources (0ms RAM lookup)
  const allResources = useMemo(() => [
    // 1. Core Portals & Console
    {
      id: 'am-console',
      title: 'Account Manager Console (Operations Hub)',
      subtitle: 'Consola de control comercial y clínico sin contraseñas',
      category: 'Account Manager',
      url: '/account-manager',
      icon: Sliders,
      badge: 'Hub'
    },
    {
      id: 'pub-home',
      title: 'Storefront & Página Principal',
      subtitle: 'Portal institucional público de Atlas Health',
      category: 'Pública',
      url: '/',
      icon: Globe,
      badge: 'Public'
    },
    {
      id: 'pub-catalog',
      title: 'Catálogo de Péptidos & Formulaciones',
      subtitle: 'Catálogo general de péptidos y activos de investigación',
      category: 'Pública',
      url: '/catalog',
      icon: FlaskConical,
      badge: 'Public'
    },
    {
      id: 'pub-protocols',
      title: 'Biblioteca de Protocolos Clínicos',
      subtitle: 'Protocolos combinados y dosificaciones por fases',
      category: 'Pública',
      url: '/protocols',
      icon: FlaskConical,
      badge: 'Public'
    },
    {
      id: 'pub-b2b',
      title: 'B2B Showcase & Portales Corporativos',
      subtitle: 'Presentaciones comerciales para clínicas y distribuidores',
      category: 'Pública',
      url: '/b2b/corporate-wellness',
      icon: Globe,
      badge: 'B2B'
    },
    {
      id: 'pub-verify',
      title: 'Verificador de Lotes y Códigos QR',
      subtitle: 'Auditoría analítica de pureza HPLC y certificados CoA',
      category: 'Pública',
      url: '/verify/RP-LOT-RT10-2609',
      icon: Globe,
      badge: 'CoA'
    },
    {
      id: 'pub-intake',
      title: 'Formulario de Ingesta de Pacientes',
      subtitle: 'Alta digital para nuevos pacientes referidos',
      category: 'Pública',
      url: '/rx/intake',
      icon: User,
      badge: 'Intake'
    },

    // 2. Doctors
    {
      id: 'doc-raffanie',
      title: 'Dr. Raffanie Lucenio (Doha, Qatar 🇶🇦)',
      subtitle: 'The Masters Medical Center · Dermatología & Tricología',
      category: 'Doctores',
      url: '/dr/raffanie-lucenio',
      icon: Stethoscope,
      badge: 'Dermatology'
    },
    {
      id: 'doc-sezgin',
      title: 'Dr. Çağatay Sezgin (Dubai, EAU 🇦🇪)',
      subtitle: 'Hortman Clinics / Novomed · Hair Restoration & Longevity',
      category: 'Doctores',
      url: '/dr/dr-cagatay-sezgin',
      icon: Stethoscope,
      badge: 'Surgeon'
    },
    {
      id: 'doc-alkhatib',
      title: 'Dr. M Jay Alkhatib (Dubai, EAU 🇦🇪)',
      subtitle: 'York Diagnostic Laboratories (YDL) · Lab Medicine',
      category: 'Doctores',
      url: '/dr/dr-jay-alkhatib',
      icon: Stethoscope,
      badge: 'Lab Director'
    },
    {
      id: 'doc-sobia',
      title: 'Dr. Sobia Mirza (Dubai, EAU 🇦🇪)',
      subtitle: 'My London Skin Clinic (MLSC) · Aesthetic & Longevity',
      category: 'Doctores',
      url: '/dr/dr-sobia-mirza',
      icon: Stethoscope,
      badge: 'Aesthetic'
    },
    {
      id: 'doc-camacho',
      title: 'Dra. Haydee Camacho (Madrid, España 🇪🇸)',
      subtitle: 'Clínica Dra. Haydee Camacho · Medicina Regenerativa',
      category: 'Doctores',
      url: '/dr/haydee-camacho',
      icon: Stethoscope,
      badge: 'Regenerative'
    },
    {
      id: 'doc-mendez',
      title: 'Dr. Carlos Méndez (Barcelona, España 🇪🇸)',
      subtitle: 'Clínica Regenerativa Capilar · Tricología Médica',
      category: 'Doctores',
      url: '/dr/carlos-mendez',
      icon: Stethoscope,
      badge: 'Trichology'
    },
    {
      id: 'doc-silva',
      title: 'Dr. Frank Silva (London, UK 🇬🇧)',
      subtitle: 'Silva Longevity Institute · Optimización Celular',
      category: 'Doctores',
      url: '/dr/frank-silva',
      icon: Stethoscope,
      badge: 'Longevity'
    },

    // 3. Patients
    {
      id: 'pt-turky',
      title: 'Turky Bakhit S A Al-shahwani (Qatar 🇶🇦)',
      subtitle: 'RX-BOX02574AATRI · Dr. Raffanie Lucenio (TrichoTest)',
      category: 'Pacientes',
      url: '/rx/RX-BOX02574AATRI',
      icon: User,
      badge: 'TrichoTest'
    },
    {
      id: 'pt-aisha',
      title: 'Aisha Mohammed Alsulaiti (Qatar 🇶🇦)',
      subtitle: 'RX-BOX02550AATRI · Dr. Raffanie Lucenio (TrichoTest)',
      category: 'Pacientes',
      url: '/rx/RX-BOX02550AATRI',
      icon: User,
      badge: 'TrichoTest'
    },
    {
      id: 'pt-maryam',
      title: 'Maryam Mohammed Al-Sulaiti (Qatar 🇶🇦)',
      subtitle: 'RX-BOX02571AATRI · Dr. Raffanie Lucenio (TrichoTest)',
      category: 'Pacientes',
      url: '/rx/RX-BOX02571AATRI',
      icon: User,
      badge: 'TrichoTest'
    },
    {
      id: 'pt-rashid',
      title: 'Rashid Shahin Malalla (Dubai 🇦🇪)',
      subtitle: 'RX-BOX03484AATRI · Dr. Çağatay Sezgin (TrichoTest)',
      category: 'Pacientes',
      url: '/rx/RX-BOX03484AATRI',
      icon: User,
      badge: 'TrichoTest'
    },
    {
      id: 'pt-fakhro',
      title: 'Abdulrahman Darwish Fakhro (Qatar 🇶🇦)',
      subtitle: 'RX-BOX03054AATRI · Dr. Raffanie Lucenio (TrichoTest)',
      category: 'Pacientes',
      url: '/rx/RX-BOX03054AATRI',
      icon: User,
      badge: 'TrichoTest'
    },
    {
      id: 'pt-alkhulaifi',
      title: 'Mohammed Yousuf Al-khulaifi (Qatar 🇶🇦)',
      subtitle: 'RX-BOX03044AATRI · Dr. Raffanie Lucenio (TrichoTest)',
      category: 'Pacientes',
      url: '/rx/RX-BOX03044AATRI',
      icon: User,
      badge: 'TrichoTest'
    },
    {
      id: 'pt-almatwi',
      title: 'Moza Ahmad Almatwi (Qatar 🇶🇦)',
      subtitle: 'RX-BOX03041AATRI · Dr. Raffanie Lucenio (TrichoTest)',
      category: 'Pacientes',
      url: '/rx/RX-BOX03041AATRI',
      icon: User,
      badge: 'TrichoTest'
    },
    {
      id: 'pt-alkubaisi',
      title: 'Salwa Saeed Alkubaisi (Qatar 🇶🇦)',
      subtitle: 'RX-BOX03055AATRI · Dr. Raffanie Lucenio (TrichoTest)',
      category: 'Pacientes',
      url: '/rx/RX-BOX03055AATRI',
      icon: User,
      badge: 'TrichoTest'
    },
    {
      id: 'pt-saadat',
      title: 'Saadat Valiyeva (Dubai 🇦🇪)',
      subtitle: 'RX-FAG-YDL-001 · Dr. M Jay Alkhatib (YDL TrichoTest)',
      category: 'Pacientes',
      url: '/rx/RX-FAG-YDL-001',
      icon: User,
      badge: 'TrichoTest'
    },
    {
      id: 'pt-rouba',
      title: 'Rouba Aref Akiki (Dubai 🇦🇪)',
      subtitle: 'RX-FAG-YDL-002 · Dr. M Jay Alkhatib (YDL TrichoTest)',
      category: 'Pacientes',
      url: '/rx/RX-FAG-YDL-002',
      icon: User,
      badge: 'TrichoTest'
    },
    {
      id: 'pt-melissa',
      title: 'Melissa Nel (Dubai 🇦🇪)',
      subtitle: 'RX-BOX03531AATEL · Dr. Sobia Mirza (TeloTest)',
      category: 'Pacientes',
      url: '/rx/RX-BOX03531AATEL',
      icon: User,
      badge: 'TeloTest'
    },

    // 4. Products
    {
      id: 'prod-retatrutide',
      title: 'Retatrutide 10mg (Triple Agonist GLP-1/GIP/GCG)',
      subtitle: 'RP-LOT-RT10-2609 · HPLC 99.6% · Vial liofilizado',
      category: 'Productos',
      url: '/p/retatrutide',
      icon: FlaskConical,
      badge: '99.6% HPLC'
    },
    {
      id: 'prod-tirzepatide',
      title: 'Tirzepatide 15mg (Dual Incretin GLP-1/GIP)',
      subtitle: 'RP-LOT-TZ15-2611 · HPLC 99.4% · Vial liofilizado',
      category: 'Productos',
      url: '/p/tirzepatide',
      icon: FlaskConical,
      badge: '99.4% HPLC'
    },
    {
      id: 'prod-semaglutide',
      title: 'Semaglutide 5mg (Selective GLP-1 RA)',
      subtitle: 'RP-LOT-SM05-2608 · HPLC 99.5% · Vial liofilizado',
      category: 'Productos',
      url: '/p/semaglutide',
      icon: FlaskConical,
      badge: '99.5% HPLC'
    },
    {
      id: 'prod-bpctb',
      title: 'BPC-157 & TB-500 Synergistic Healing Blend',
      subtitle: 'RP-LOT-BPCTB-2610 · HPLC 99.7% · Regeneración tisular',
      category: 'Productos',
      url: '/p/bpc-157-tb-500',
      icon: FlaskConical,
      badge: '99.7% HPLC'
    },
    {
      id: 'prod-nad',
      title: 'NAD+ Pure API (1000mg Infusion Grade)',
      subtitle: 'RP-LOT-NAD1000-2607 · HPLC 99.8% · Optimización mitocondrial',
      category: 'Productos',
      url: '/p/nad-plus',
      icon: FlaskConical,
      badge: '99.8% HPLC'
    },
    {
      id: 'prod-ghk',
      title: 'GHK-Cu Pure Copper Tripeptide-1 (50mg)',
      subtitle: 'RP-LOT-GHK50-2605 · HPLC 99.3% · Remodelación folicular',
      category: 'Productos',
      url: '/p/ghk-cu',
      icon: FlaskConical,
      badge: '99.3% HPLC'
    },
    {
      id: 'prod-colway',
      title: 'Colway Trichology Stem Cell Scalp Complex',
      subtitle: 'Baicapil™ 2% + Liposomal Stem Cells · Monografía oficial',
      category: 'Productos',
      url: '/p/colway-trichology',
      icon: FlaskConical,
      badge: 'Stem Cells'
    },

    // 5. Operations
    {
      id: 'op-labels',
      title: 'Generador de Etiquetas de Vial 300 DPI',
      subtitle: 'Formato estándar 50x25mm con micro QR para viales',
      category: 'Operaciones',
      url: '/labels',
      icon: Tag,
      badge: 'Print'
    }
  ], []);

  // Filtered Results
  const filtered = useMemo(() => {
    if (!query.trim()) return allResources.slice(0, 12);
    const q = query.toLowerCase().trim();
    return allResources.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.subtitle.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
    );
  }, [allResources, query]);

  // Handle Keyboard Selection
  const handleKeyDownList = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filtered[selectedIndex];
      if (selected) {
        handleSelect(selected);
      }
    }
  };

  const handleSelect = (item) => {
    triggerHaptic('impact');
    setIsOpen(false);
    if (item.url) {
      router.push(item.url);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        paddingLeft: '1rem',
        paddingRight: '1rem'
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          background: '#0f172a',
          borderRadius: '16px',
          border: '1px solid #334155',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          color: '#ffffff'
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDownList}
      >
        {/* Search Input Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem 1.25rem', borderBottom: '1px solid #1e293b' }}>
          <Search size={20} color="#38bdf8" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Buscar doctor, paciente, receta, producto o comando GCP..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '1.05rem',
              color: '#ffffff',
              fontWeight: 500
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          )}
          <kbd style={{ fontSize: '0.72rem', background: '#1e293b', padding: '3px 6px', borderRadius: '4px', color: '#94a3b8', border: '1px solid #334155' }}>
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          style={{
            maxHeight: '420px',
            overflowY: 'auto',
            padding: '8px'
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
              No se encontraron recursos que coincidan con &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item, index) => {
              const isSelected = index === selectedIndex;
              const IconComp = item.icon || Globe;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                    border: isSelected ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                    transition: 'background 0.1s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      background: isSelected ? '#0284c7' : '#1e293b',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <IconComp size={16} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 650, color: isSelected ? '#38bdf8' : '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '4px', background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}>
                      {item.category}
                    </span>
                    {isSelected && (
                      <ArrowRight size={13} color="#38bdf8" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hints */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          background: '#090d16',
          borderTop: '1px solid #1e293b',
          fontSize: '0.72rem',
          color: '#64748b'
        }}>
          <div>
            Navega con <kbd style={{ background: '#1e293b', padding: '1px 5px', borderRadius: '3px' }}>↑</kbd> <kbd style={{ background: '#1e293b', padding: '1px 5px', borderRadius: '3px' }}>↓</kbd> · Presiona <kbd style={{ background: '#1e293b', padding: '1px 5px', borderRadius: '3px' }}>↵</kbd> para saltar sin contraseña
          </div>
          <div style={{ color: '#10b981', fontWeight: 600 }}>
            ● GCP Command Mode Active
          </div>
        </div>

      </div>
    </div>
  );
}

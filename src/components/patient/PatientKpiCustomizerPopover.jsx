'use client';

import React, { useRef, useEffect } from 'react';
import SlidersHorizontal from 'lucide-react/dist/esm/icons/sliders-horizontal';
import Check from 'lucide-react/dist/esm/icons/check';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Pill from 'lucide-react/dist/esm/icons/pill';
import Activity from 'lucide-react/dist/esm/icons/activity';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import Truck from 'lucide-react/dist/esm/icons/truck';
import Dna from 'lucide-react/dist/esm/icons/dna';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Flame from 'lucide-react/dist/esm/icons/flame';
import HeartPulse from 'lucide-react/dist/esm/icons/heart-pulse';
import Moon from 'lucide-react/dist/esm/icons/moon';
import Scale from 'lucide-react/dist/esm/icons/scale';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import X from 'lucide-react/dist/esm/icons/x';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';

import { PATIENT_KPI_CATALOG, PATIENT_KPI_PRESETS } from '../../hooks/usePatientKpis';

const ICON_MAP = {
  Pill,
  Activity,
  RefreshCw,
  Truck,
  Dna,
  Clock,
  Flame,
  HeartPulse,
  Moon,
  Scale,
  Calendar,
  Sparkles,
};

export default function PatientKpiCustomizerPopover({
  isOpen,
  onClose,
  selectedIds,
  onToggle,
  onApplyPreset,
  onReset,
  activePreset,
  maxAllowed = 4,
}) {
  const popoverRef = useRef(null);

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        ref={popoverRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="kpi-customizer-title"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 54, 102, 0.35)',
          border: '1px solid #cbd5e1',
          overflow: 'hidden',
          animation: 'fadeIn 0.15s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #003666 0%, #0a4d8c 100%)',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SlidersHorizontal size={20} color="#38bdf8" />
            </div>
            <div>
              <h3
                id="kpi-customizer-title"
                style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.01em', color: '#ffffff' }}
              >
                Personalizar Tarjetas de Salud · Atlas KPI Grid
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#bae6fd' }}>
                Selecciona hasta 4 métricas prioritarias para tu pantalla de inicio
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Selection Counter */}
            <span
              style={{
                padding: '4px 10px',
                borderRadius: '20px',
                backgroundColor: selectedIds.length === maxAllowed ? '#10b981' : '#38bdf8',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.02em',
              }}
            >
              {selectedIds.length} / {maxAllowed} Activas
            </span>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar personalizador"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#ffffff',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Quick Presets by Health Goal */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Plantillas Rápidas por Objetivo
              </span>
              <button
                type="button"
                onClick={onReset}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0284c7',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0,
                }}
              >
                <RotateCcw size={12} />
                <span>Restablecer por Defecto</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
              {PATIENT_KPI_PRESETS.map((preset) => {
                const isSelected = activePreset === preset.id;
                const PresetIcon = ICON_MAP[preset.icon] || Sparkles;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onApplyPreset(preset.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? '#f0f9ff' : '#f8fafc',
                      color: isSelected ? '#0369a1' : '#334155',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        color: isSelected ? '#0284c7' : '#64748b',
                        marginTop: '2px',
                        flexShrink: 0,
                      }}
                    >
                      <PresetIcon size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>{preset.name}</div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px', lineHeight: 1.25 }}>
                        {preset.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Metric Catalog Selection Grid */}
          <div>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
              Catálogo de Métricas y Biomarcadores ({PATIENT_KPI_CATALOG.length} Disponibles)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
              {PATIENT_KPI_CATALOG.map((kpi) => {
                const isSelected = selectedIds.includes(kpi.id);
                const IconComponent = ICON_MAP[kpi.icon] || Activity;

                return (
                  <div
                    key={kpi.id}
                    onClick={() => onToggle(kpi.id)}
                    role="checkbox"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        onToggle(kpi.id);
                      }
                    }}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #003666' : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? '#ffffff' : '#f8fafc',
                      boxShadow: isSelected ? '0 4px 12px rgba(0, 54, 102, 0.08)' : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {/* Top Row: Category + Check Indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: kpi.color,
                          backgroundColor: `${kpi.color}15`,
                          padding: '2px 6px',
                          borderRadius: '6px',
                        }}
                      >
                        {kpi.category}
                      </span>

                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '6px',
                          backgroundColor: isSelected ? '#003666' : '#ffffff',
                          border: isSelected ? 'none' : '2px solid #cbd5e1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                        }}
                      >
                        {isSelected && <Check size={13} strokeWidth={3} />}
                      </div>
                    </div>

                    {/* Mid Row: Title + Live Preview Value */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          backgroundColor: `${kpi.color}18`,
                          color: kpi.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <IconComponent size={15} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {kpi.title}
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 900, color: kpi.color, marginTop: '1px' }}>
                          {kpi.value}{' '}
                          <span style={{ fontSize: '0.68rem', fontWeight: 500, color: '#64748b' }}>
                            {kpi.unit}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Description */}
                    <div style={{ fontSize: '0.7rem', color: '#64748b', lineHeight: 1.3, marginTop: '4px' }}>
                      {kpi.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#64748b' }}>
            <ShieldCheck size={14} color="#10b981" />
            <span>Sincronizado automáticamente en tu dispositivo y perfil médico</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              backgroundColor: '#003666',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 54, 102, 0.2)',
            }}
          >
            Guardar y Aplicar ({selectedIds.length} métricas)
          </button>
        </div>
      </div>
    </div>
  );
}

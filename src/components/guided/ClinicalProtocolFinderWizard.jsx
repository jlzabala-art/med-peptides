"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Navigation,
  Activity,
  Heart,
  Brain,
  Shield,
  Sparkles,
  Zap,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  TestTube,
} from '@/lib/icons';
import { useAlgoliaSearch } from '../../hooks/data/useAlgoliaSearch';
import { triggerHaptic } from '../../utils/haptics';

const GOALS = [
  { id: 'anti_aging', label: 'Longevidad & Anti-Aging', icon: Heart, desc: 'Epithalon, NAD+, GHK-Cu, FOXO4' },
  { id: 'fat_loss', label: 'Metabolismo & Pérdida de Grasa', icon: Zap, desc: 'Tirzepatide, Retatrutide, AOD-9604, MOTS-c' },
  { id: 'recovery', label: 'Recuperación Tisular & Articular', icon: Activity, desc: 'BPC-157, TB-500, KPV, Pentosan' },
  { id: 'cognitive', label: 'Neuroplasticidad & Cognición', icon: Brain, desc: 'Semax, Selank, Dihexa, Cerebrolysin' },
  { id: 'immune', label: 'Inmunomodulación & Vitalidad', icon: Shield, desc: 'Thymosin Alpha-1, LL-37, TA-1' },
];

const ROUTES = [
  { id: 'all', label: 'Cualquier Vía de Administración' },
  { id: 'subcutaneous', label: 'Inyectable Subcutáneo (Mayor Biodisponibilidad)' },
  { id: 'nasal', label: 'Spray Nasal (Acceso Directo SNC)' },
  { id: 'oral', label: 'Oral / Cápsulas Entéricas' },
];

export default function ClinicalProtocolFinderWizard({ onSelectProtocol = null }) {
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState('all');

  // Search protocols in Algolia using the selected goal as filter
  const searchQuery = selectedGoal ? selectedGoal.label.split(' ')[0] : '';
  const searchParams = React.useMemo(() => {
    const params = { hitsPerPage: 6 };
    if (selectedGoal) {
      params.optionalFilters = [
        `goals:${selectedGoal.id}`,
        `category:${selectedGoal.id}`,
      ];
    }
    return params;
  }, [selectedGoal]);

  const { hits, loading } = useAlgoliaSearch('protocols', searchQuery, searchParams);

  const handleSelectGoal = (goal) => {
    triggerHaptic('selection');
    setSelectedGoal(goal);
    setStep(2);
  };

  const handleSelectRoute = (routeId) => {
    triggerHaptic('selection');
    setSelectedRoute(routeId);
    setStep(3);
  };

  const handleReset = () => {
    triggerHaptic('tap');
    setStep(1);
    setSelectedGoal(null);
    setSelectedRoute('all');
  };

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '1.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      {/* Wizard Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ background: '#003666', color: '#fff', borderRadius: '8px', padding: '6px' }}>
            <Navigation size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>
              Buscador Guiado de Protocolos y Péptidos
            </h3>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
              Paso {step} de 3 — Algolia Clinical Guided Discovery
            </p>
          </div>
        </div>

        {step > 1 && (
          <button
            onClick={handleReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              border: 'none',
              background: '#f1f5f9',
              color: '#475569',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={13} /> Reiniciar
          </button>
        )}
      </div>

      {/* STEP 1: Select Health Goal */}
      {step === 1 && (
        <div>
          <h4 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: '#334155' }}>
            1. Selecciona el objetivo clínico primordial del paciente:
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {GOALS.map((goal) => {
              const Icon = goal.icon;
              return (
                <div
                  key={goal.id}
                  onClick={() => handleSelectGoal(goal)}
                  role="button"
                  tabIndex={0}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    background: '#fafafa',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#003666';
                    e.currentTarget.style.background = '#f0f7ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.background = '#fafafa';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <Icon size={18} color="#003666" />
                    <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{goal.label}</strong>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{goal.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: Preferred Route */}
      {step === 2 && (
        <div>
          <div style={{ marginBottom: '1rem', padding: '0.6rem 0.9rem', background: '#f0f7ff', borderRadius: '8px', fontSize: '0.82rem', color: '#003666' }}>
            Objetivo seleccionado: <strong>{selectedGoal?.label}</strong>
          </div>
          <h4 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: '#334155' }}>
            2. Vía de administración preferida:
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {ROUTES.map((route) => (
              <div
                key={route.id}
                onClick={() => handleSelectRoute(route.id)}
                role="button"
                tabIndex={0}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  border: '1.5px solid #e2e8f0',
                  cursor: 'pointer',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#003666';
                  e.currentTarget.style.background = '#f0f7ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.background = '#ffffff';
                }}
              >
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>{route.label}</span>
                <ArrowRight size={16} color="#003666" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: Results from Algolia */}
      {step === 3 && (
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span style={{ background: '#f0f7ff', color: '#003666', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 }}>
              {selectedGoal?.label}
            </span>
            <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem' }}>
              Vía: {selectedRoute}
            </span>
          </div>

          <h4 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: '#334155' }}>
            Protocolos clínicos sugeridos para este perfil:
          </h4>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Buscando en Algolia...</div>
          ) : hits.length === 0 ? (
            <div style={{ padding: '1.5rem', background: '#fffbeb', borderRadius: '10px', color: '#92400e', fontSize: '0.85rem' }}>
              No se encontraron protocolos exactos para esta combinación. Puedes explorar el catálogo general o crear un protocolo personalizado.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {hits.map((proto) => {
                const slug = proto.slug || proto.protocol_slug || proto.id || proto.objectID;
                const name = proto.name || proto.title || 'Protocolo Clínico';
                const desc = proto.description || proto.overview_summary || '';

                return (
                  <div
                    key={proto.objectID || proto.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      background: '#ffffff',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#003666', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.4rem' }}>
                        <TestTube size={16} />
                        <span>{name}</span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.8rem', lineHeight: 1.4 }}>
                        {desc.substring(0, 95)}...
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <Link
                        href={`/proto/${slug}`}
                        style={{
                          flex: 1,
                          textAlign: 'center',
                          padding: '7px 12px',
                          borderRadius: '8px',
                          background: '#003666',
                          color: '#ffffff',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                        }}
                      >
                        Ver Ficha Clínica →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Zap,
  Pill,
  ExternalLink,
  CheckCircle2,
  BookOpen,
  Info,
  ChevronRight,
  Filter,
  Search,
  Check,
  Stethoscope,
  FlaskConical
} from '@/lib/icons';
import { MEDICAL_SPECIALTIES, CURATED_PRODUCTS } from '../../../data/doctorSpecialtyCatalog';
import StatusBadge from '../../ui/StatusBadge';
import CopyableId from '../../ui/CopyableId';

export default function DoctorCuratedProductsSection({
  doctorSpecialty = 'Dermatologist & Trichologist',
  onQuickPrescribe,
  onOpenMonograph,
}) {
  // Determine default specialty based on doctor profile
  const initialSpecialty = useMemo(() => {
    const s = (doctorSpecialty || '').toLowerCase();
    if (s.includes('derm') || s.includes('trich') || s.includes('capilar') || s.includes('piel')) {
      return 'dermatology_trichology';
    }
    if (s.includes('sport') || s.includes('deport') || s.includes('trauma') || s.includes('ortho')) {
      return 'sports_musculoskeletal';
    }
    if (s.includes('meta') || s.includes('endo') || s.includes('obes') || s.includes('weight')) {
      return 'metabolism_weight';
    }
    return 'dermatology_trichology';
  }, [doctorSpecialty]);

  const [activeSpecialty, setActiveSpecialty] = useState(initialSpecialty);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductForModal, setSelectedProductForModal] = useState(null);

  const filteredProducts = useMemo(() => {
    return CURATED_PRODUCTS.filter((item) => {
      const matchesSpecialty = activeSpecialty === 'all' || item.specialtyId === activeSpecialty;
      if (!matchesSpecialty) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.clinicalIndication.toLowerCase().includes(q) ||
        item.whyRecommended.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q)
      );
    });
  }, [activeSpecialty, searchQuery]);

  const currentSpecialtyMeta = MEDICAL_SPECIALTIES.find((s) => s.id === activeSpecialty) || MEDICAL_SPECIALTIES[0];

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '1.25rem',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <style>{`
        .specialty-chip-btn {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.8125rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          border: 1px solid transparent;
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .specialty-chip-btn.is-active {
          background-color: #003666;
          color: #ffffff;
          box-shadow: 0 2px 6px rgba(0, 54, 102, 0.2);
        }
        .specialty-chip-btn:not(.is-active) {
          background-color: #f8fafc;
          border-color: #e2e8f0;
          color: #475569;
        }
        .specialty-chip-btn:not(.is-active):hover {
          background-color: #f1f5f9;
          color: #0f172a;
        }
        .curated-card {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1rem 1.15rem;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          transition: all 0.2s ease;
          position: relative;
        }
        .curated-card:hover {
          border-color: #0d9488;
          box-shadow: 0 4px 16px rgba(13, 148, 136, 0.08);
          transform: translateY(-2px);
        }
      `}</style>

      {/* Header section with badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#f0fdf4',
              color: '#0d9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #bbf7d0',
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                Formulario Clínico Curado por Especialidad
              </h3>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#eff6ff',
                  color: '#0284c7',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  border: '1px solid #bae6fd',
                }}
              >
                1-Click Prescriptions
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#64748b' }}>
              Fórmulas avaladas por literatura clínica, con dosificación estándar preconfigurada para tu consulta
            </p>
          </div>
        </div>

        {/* Mini search input inside formulary */}
        <div style={{ position: 'relative', minWidth: '220px' }}>
          <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          <input
            type="text"
            placeholder="Buscar por molécula o indicación..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '34px',
              paddingLeft: '30px',
              paddingRight: '10px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.8rem',
              color: '#0f172a',
              outline: 'none',
              backgroundColor: '#f8fafc',
            }}
          />
        </div>
      </div>

      {/* Specialty Selector Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '2px',
          scrollbarWidth: 'none',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveSpecialty('all')}
          className={`specialty-chip-btn ${activeSpecialty === 'all' ? 'is-active' : ''}`}
        >
          <span>🌐 Todas las Especialidades</span>
        </button>
        {MEDICAL_SPECIALTIES.map((spec) => {
          const isActive = activeSpecialty === spec.id;
          return (
            <button
              key={spec.id}
              type="button"
              onClick={() => setActiveSpecialty(spec.id)}
              className={`specialty-chip-btn ${isActive ? 'is-active' : ''}`}
            >
              <span>{spec.emoji} {spec.name}</span>
            </button>
          );
        })}
      </div>

      {/* Specialty Focus Summary Banner */}
      {activeSpecialty !== 'all' && (
        <div
          style={{
            backgroundColor: currentSpecialtyMeta.badgeBg,
            border: `1px solid ${currentSpecialtyMeta.badgeColor}30`,
            borderRadius: '8px',
            padding: '0.65rem 0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.78rem',
            color: '#334155',
          }}
        >
          <Info size={15} color={currentSpecialtyMeta.badgeColor} style={{ flexShrink: 0 }} />
          <span>
            <strong>Enfoque clínico:</strong> {currentSpecialtyMeta.description}
          </span>
        </div>
      )}

      {/* Product Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '12px',
        }}
      >
        {filteredProducts.map((product) => (
          <div key={product.id} className="curated-card">
            <div>
              {/* Category & Evidence Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '8px' }}>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: '#0d9488',
                    letterSpacing: '0.04em',
                  }}
                >
                  {product.categoryName}
                </span>

                <a
                  href={product.pubMedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.70rem',
                    fontWeight: 700,
                    color: '#0284c7',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    backgroundColor: '#f0f9ff',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid #bae6fd',
                  }}
                >
                  <span>{product.evidenceBadge}</span>
                  <ExternalLink size={10} />
                </a>
              </div>

              {/* Product Title & Format */}
              <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
                {product.name}
              </h4>
              <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', marginTop: '2px', marginBottom: '8px' }}>
                {product.format}
              </span>

              {/* Clinical Indication */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  marginBottom: '10px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>
                  🎯 Indicación Clínica Principal:
                </div>
                <div style={{ fontSize: '0.78rem', color: '#1e293b', lineHeight: 1.35 }}>
                  {product.clinicalIndication}
                </div>
              </div>

              {/* Standard Suggested Posology */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Pill size={12} color="#0d9488" />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#334155' }}>
                  <strong>Pauta sugerida:</strong> {product.standardDose}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr',
                gap: '8px',
                paddingTop: '10px',
                borderTop: '1px solid #f1f5f9',
              }}
            >
              <button
                type="button"
                onClick={() => onQuickPrescribe && onQuickPrescribe(product.prefillOrderPayload)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(13, 148, 136, 0.2)',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <Zap size={13} />
                <span>Prescribir 1-Clic</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedProductForModal(product);
                  if (onOpenMonograph) onOpenMonograph(product);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <BookOpen size={13} />
                <span>Monografía</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Monograph / Clinical Dossier Modal */}
      {selectedProductForModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                backgroundColor: '#003666',
                color: '#ffffff',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#93c5fd', fontWeight: 800 }}>
                  Ficha Técnica & Evidencia Clínica
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: '1.15rem', fontWeight: 900 }}>
                  {selectedProductForModal.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProductForModal(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div
              style={{
                padding: '1.5rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Presentación & Pureza</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                  {selectedProductForModal.format} • Pureza HPLC ≥ 99.2%
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>¿Por qué lo recomendamos a tu especialidad?</div>
                <div style={{ fontSize: '0.85rem', color: '#1e293b', marginTop: '2px', lineHeight: 1.4 }}>
                  {selectedProductForModal.whyRecommended}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Protocolo de Posología y Vía de Administración</div>
                <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600, marginTop: '2px' }}>
                  {selectedProductForModal.posologyDetails}
                </div>
              </div>

              <div style={{ backgroundColor: '#f0fdf4', padding: '10px 12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a' }}>💡 Perla de Adherencia Clínica:</div>
                <div style={{ fontSize: '0.80rem', color: '#14532d', marginTop: '2px' }}>
                  {selectedProductForModal.complianceTip}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Literatura y Ensayos Clínicos Indexados</div>
                <a
                  href={selectedProductForModal.pubMedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.82rem',
                    color: '#0284c7',
                    fontWeight: 700,
                    textDecoration: 'none',
                    marginTop: '4px',
                  }}
                >
                  <span>Consultar artículo en PubMed ({selectedProductForModal.evidenceBadge})</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '8px',
                backgroundColor: '#f8fafc',
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedProductForModal(null)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={() => {
                  const payload = selectedProductForModal.prefillOrderPayload;
                  setSelectedProductForModal(null);
                  if (onQuickPrescribe) onQuickPrescribe(payload);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(13, 148, 136, 0.25)',
                }}
              >
                <Zap size={14} />
                <span>Prescribir Esta Fórmula (1-Clic)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

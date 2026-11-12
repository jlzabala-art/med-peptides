'use client';

import React from 'react';
import { Sparkles, X, Layers } from 'lucide-react';
import {
  CATEGORY_ORDER,
  CATEGORY_MAP,
  FDA_FILTERS,
  DOSAGE_STRENGTHS,
  getCategoryIcon
} from '@/constants/peptideCategories';

/**
 * PeptidesNavDrawer
 * Left-sliding mobile navigation drawer with categories, FDA regulatory statuses,
 * and strength filter pills.
 */
export default function PeptidesNavDrawer({
  isNavDrawerOpen = false,
  setIsNavDrawerOpen,
  selectedCategory = 'all',
  setSelectedCategory,
  selectedFdaStatus = 'all',
  setSelectedFdaStatus,
  selectedStrength = 'all',
  setSelectedStrength,
  searchQuery = '',
  setSearchQuery,
  processedProducts = [],
  isEs = false
}) {
  if (!isNavDrawerOpen) return null;

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedFdaStatus !== 'all' ||
    selectedStrength !== 'all' ||
    Boolean(searchQuery);

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        animation: 'fadeIn 0.18s ease'
      }}
      onClick={() => setIsNavDrawerOpen(false)}
    >
      <div
        style={{
          width: '320px',
          maxWidth: '85vw',
          height: '100%',
          background: '#ffffff',
          boxShadow: '4px 0 24px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInLeft 0.22s ease-out'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '14px 16px',
            background: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} className="text-sky-400" />
            <span style={{ fontWeight: 800, fontSize: '0.90rem', letterSpacing: '-0.01em' }}>
              {isEs ? 'Navegación & Filtros' : 'Navigation & Filters'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsNavDrawerOpen(false)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '6px',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Quick Reset bar if any filter active */}
        {hasActiveFilters && (
          <div
            style={{
              padding: '8px 16px',
              background: '#fef2f2',
              borderBottom: '1px solid #fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ fontSize: '0.72rem', color: '#991b1b', fontWeight: 600 }}>
              {isEs ? 'Filtros activos' : 'Active filters'}
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedFdaStatus('all');
                setSelectedStrength('all');
                if (setSearchQuery) setSearchQuery('');
              }}
              style={{
                border: 'none',
                background: 'none',
                color: '#dc2626',
                fontSize: '0.72rem',
                fontWeight: 750,
                cursor: 'pointer'
              }}
            >
              {isEs ? 'Limpiar todo ×' : 'Reset all ×'}
            </button>
          </div>
        )}

        {/* Drawer Body (Scrollable) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          {/* 1. Peptide Categories */}
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#5f6368',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '8px',
              padding: '0 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span>🧬</span>
            <span>{isEs ? 'Categorías de Péptidos' : 'Peptide Categories'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setIsNavDrawerOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 14px',
                borderRadius: '0 4px 4px 0',
                border: 'none',
                borderLeft: selectedCategory === 'all' ? '3px solid #1a73e8' : '3px solid transparent',
                background: selectedCategory === 'all' ? '#e8f0fe' : 'transparent',
                color: selectedCategory === 'all' ? '#1a73e8' : '#3c4043',
                fontSize: '0.80rem',
                fontWeight: selectedCategory === 'all' ? 700 : 500,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={14} color={selectedCategory === 'all' ? '#1a73e8' : '#5f6368'} />
                <span>{isEs ? 'Todas las Formulaciones' : 'All Formulations'}</span>
              </div>
              <span
                style={{
                  fontSize: '0.70rem',
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                  background: selectedCategory === 'all' ? '#1a73e8' : '#e8eaed',
                  color: selectedCategory === 'all' ? '#ffffff' : '#3c4043',
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}
              >
                {processedProducts.length}
              </span>
            </button>

            {CATEGORY_ORDER.map(key => {
              const meta = CATEGORY_MAP[key];
              if (!meta) return null;
              const count = processedProducts.filter(p => p.categoryKey === key).length;
              if (count === 0) return null;
              const isSelected = selectedCategory === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(key);
                    setIsNavDrawerOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 14px',
                    borderRadius: '0 4px 4px 0',
                    border: 'none',
                    borderLeft: isSelected ? `3px solid ${meta.color || '#1a73e8'}` : '3px solid transparent',
                    background: isSelected ? meta.bg : 'transparent',
                    color: isSelected ? meta.color : '#3c4043',
                    fontSize: '0.80rem',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px' }}>
                      {getCategoryIcon(key, 14)}
                    </span>
                    <span>{isEs ? meta.labelEs : meta.labelEn}</span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.70rem',
                      fontWeight: 600,
                      fontVariantNumeric: 'tabular-nums',
                      background: isSelected ? meta.color || '#1a73e8' : '#e8eaed',
                      color: isSelected ? '#ffffff' : '#3c4043',
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: '#e2e8f0', margin: '14px 0' }} />

          {/* 2. FDA Regulatory Status */}
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#5f6368',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '8px',
              padding: '0 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span>⚖️</span>
            <span>{isEs ? 'Estatus Regulatorio FDA' : 'FDA Regulatory Status'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginBottom: '16px' }}>
            {FDA_FILTERS.map(f => {
              const isSelected = selectedFdaStatus === f.id;
              const count =
                f.id === 'all'
                  ? processedProducts.length
                  : processedProducts.filter(p => p.fdaBucket === f.id).length;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setSelectedFdaStatus(f.id);
                    setIsNavDrawerOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 14px',
                    borderRadius: '0 4px 4px 0',
                    border: 'none',
                    borderLeft: isSelected ? `3px solid ${f.color || '#1a73e8'}` : '3px solid transparent',
                    background: isSelected
                      ? f.id === 'all'
                        ? '#e8f0fe'
                        : f.id === 'fda_503a'
                        ? '#ecfdf5'
                        : f.id === 'fda_approved'
                        ? '#eff6ff'
                        : f.id === 'clinical_ind'
                        ? '#fffbeb'
                        : '#f1f5f9'
                      : 'transparent',
                    color: isSelected ? (f.id === 'all' ? '#1a73e8' : f.color || '#3c4043') : '#3c4043',
                    fontSize: '0.80rem',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <span style={{ fontSize: '0.82rem', flexShrink: 0 }}>{f.icon}</span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {isEs ? f.labelEs : f.labelEn}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.70rem',
                      fontWeight: 600,
                      fontVariantNumeric: 'tabular-nums',
                      background: isSelected ? (f.id === 'all' ? '#1a73e8' : f.color || '#5f6368') : '#e8eaed',
                      color: isSelected ? '#ffffff' : '#3c4043',
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: '#e2e8f0', margin: '14px 0' }} />

          {/* 3. Strength Filter */}
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              color: '#5f6368',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '8px',
              padding: '0 14px'
            }}
          >
            {isEs ? 'Concentración / Dosis' : 'Filter Strength'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '0 14px' }}>
            {DOSAGE_STRENGTHS.map(st => {
              const isSelected = selectedStrength === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    setSelectedStrength(st.id);
                    setIsNavDrawerOpen(false);
                  }}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '16px',
                    fontSize: '0.74rem',
                    fontWeight: isSelected ? 750 : 600,
                    border: '1px solid',
                    cursor: 'pointer',
                    background: isSelected ? '#0284c7' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#475569',
                    borderColor: isSelected ? '#0284c7' : '#cbd5e1'
                  }}
                >
                  {st.id === 'all' ? (isEs ? 'Todas' : 'All') : st.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

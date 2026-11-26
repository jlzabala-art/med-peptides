'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Layers, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import {
  CATEGORY_ORDER,
  CATEGORY_MAP,
  FDA_FILTERS,
  SHIPPING_DESTINATIONS,
  DOSAGE_STRENGTHS,
  getCategoryIcon
} from '@/constants/peptideCategories';

/**
 * PeptidesFilterSheets
 * Google Cloud-style unified bottom sheet for Mobile Filters:
 * - Therapeutic Categories
 * - FDA Compounding & Regulatory Status
 * - Shipping Corridor & Dosage Strength
 * Includes Reset & Apply CTA footer.
 */
export default function PeptidesFilterSheets({
  isCategorySheetOpen = false,
  setIsCategorySheetOpen,
  isFdaSheetOpen = false,
  setIsFdaSheetOpen,
  selectedCategory = 'all',
  setSelectedCategory,
  selectedFdaStatus = 'all',
  setSelectedFdaStatus,
  shippingDest = 'EU Stock',
  setShippingDest,
  selectedStrength = 'all',
  setSelectedStrength,
  groupByCategory = true,
  setGroupByCategory,
  processedProducts = [],
  filteredCount,
  isEs = false
}) {
  const isOpen = Boolean(isCategorySheetOpen || isFdaSheetOpen);

  const [activeTab, setActiveTab] = useState('category');

  useEffect(() => {
    if (isFdaSheetOpen && !isCategorySheetOpen) {
      setActiveTab('fda');
    } else if (isCategorySheetOpen) {
      setActiveTab('category');
    }
  }, [isCategorySheetOpen, isFdaSheetOpen]);

  const closeBoth = () => {
    if (setIsCategorySheetOpen) setIsCategorySheetOpen(false);
    if (setIsFdaSheetOpen) setIsFdaSheetOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeBoth();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const countDisplay = typeof filteredCount === 'number' ? filteredCount : processedProducts.length;

  const handleResetFilters = () => {
    if (setSelectedCategory) setSelectedCategory('all');
    if (setSelectedFdaStatus) setSelectedFdaStatus('all');
    if (setSelectedStrength) setSelectedStrength('all');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1250,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        animation: 'fadeIn 0.18s ease'
      }}
      onClick={closeBoth}
    >
      <div
        style={{
          background: '#ffffff',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '84vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.20)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sheet Handle */}
        <div style={{ padding: '8px 16px 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '36px', height: '4px', background: '#cbd5e1', borderRadius: '2px' }} />
        </div>

        {/* Header with Title & Close Button */}
        <div
          style={{
            padding: '10px 16px 8px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.90rem', fontWeight: 750, color: '#1e293b' }}>
              {isEs ? 'Filtros de Catálogo B2B' : 'B2B Catalog Filters'}
            </div>
            <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
              {isEs
                ? 'Selecciona categoría, estatus regulatorio o corredor de entrega'
                : 'Select therapeutic category, regulatory status or shipping corridor'}
            </div>
          </div>
          <button
            type="button"
            onClick={closeBoth}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              cursor: 'pointer',
              flexShrink: 0
            }}
            aria-label="Cerrar filtros"
          >
            <X size={16} />
          </button>
        </div>

        {/* Segmented Filter Mode Tabs */}
        <div
          style={{
            display: 'flex',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            padding: '6px 12px',
            gap: '6px'
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('category')}
            style={{
              flex: 1,
              padding: '6px 8px',
              borderRadius: '6px',
              border: activeTab === 'category' ? '1px solid #cbd5e1' : '1px solid transparent',
              background: activeTab === 'category' ? '#ffffff' : 'transparent',
              color: activeTab === 'category' ? '#003666' : '#64748b',
              fontWeight: activeTab === 'category' ? 750 : 600,
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              boxShadow: activeTab === 'category' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <Layers size={13} />
            <span>{isEs ? 'Categorías' : 'Categories'}</span>
            {selectedCategory !== 'all' && (
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1a73e8' }} />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fda')}
            style={{
              flex: 1,
              padding: '6px 8px',
              borderRadius: '6px',
              border: activeTab === 'fda' ? '1px solid #cbd5e1' : '1px solid transparent',
              background: activeTab === 'fda' ? '#ffffff' : 'transparent',
              color: activeTab === 'fda' ? '#003666' : '#64748b',
              fontWeight: activeTab === 'fda' ? 750 : 600,
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              boxShadow: activeTab === 'fda' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <ShieldCheck size={13} />
            <span>{isEs ? 'Estatus FDA' : 'FDA Status'}</span>
            {selectedFdaStatus !== 'all' && (
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1a73e8' }} />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shipping')}
            style={{
              flex: 1,
              padding: '6px 8px',
              borderRadius: '6px',
              border: activeTab === 'shipping' ? '1px solid #cbd5e1' : '1px solid transparent',
              background: activeTab === 'shipping' ? '#ffffff' : 'transparent',
              color: activeTab === 'shipping' ? '#003666' : '#64748b',
              fontWeight: activeTab === 'shipping' ? 750 : 600,
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              boxShadow: activeTab === 'shipping' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <Truck size={13} />
            <span>{isEs ? 'Envío / Dosis' : 'Shipping / Dose'}</span>
            {selectedStrength !== 'all' && (
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1a73e8' }} />
            )}
          </button>
        </div>

        {/* Tab Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
          {/* TAB 1: Categories */}
          {activeTab === 'category' && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 16px',
                  minHeight: '44px',
                  border: 'none',
                  borderBottom: '1px solid #f1f5f9',
                  borderLeft: selectedCategory === 'all' ? '3px solid #1a73e8' : '3px solid transparent',
                  background: selectedCategory === 'all' ? '#e8f0fe' : '#ffffff',
                  color: selectedCategory === 'all' ? '#1a73e8' : '#1e293b',
                  fontWeight: selectedCategory === 'all' ? 750 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Layers size={16} color={selectedCategory === 'all' ? '#1a73e8' : '#64748b'} />
                  <span>{isEs ? 'Todas las Categorías' : 'All Categories'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.74rem', fontFamily: 'monospace', fontWeight: 650, color: selectedCategory === 'all' ? '#1a73e8' : '#64748b' }}>
                    {processedProducts.length}
                  </span>
                  {selectedCategory === 'all' && <Check size={16} color="#1a73e8" strokeWidth={2.5} />}
                </div>
              </button>

              {CATEGORY_ORDER.map((key) => {
                const meta = CATEGORY_MAP[key];
                if (!meta) return null;
                const count = processedProducts.filter((p) => p.categoryKey === key).length;
                if (count === 0) return null;
                const isSelected = selectedCategory === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedCategory(key)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 16px',
                      minHeight: '44px',
                      border: 'none',
                      borderBottom: '1px solid #f1f5f9',
                      borderLeft: isSelected ? `3px solid ${meta.color || '#1a73e8'}` : '3px solid transparent',
                      background: isSelected ? '#e8f0fe' : '#ffffff',
                      color: isSelected ? '#1a73e8' : '#1e293b',
                      fontWeight: isSelected ? 750 : 500,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '18px' }}>
                        {getCategoryIcon(key, 15)}
                      </span>
                      <span>{isEs ? (meta.labelEs || meta.label) : (meta.labelEn || meta.label)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.74rem', fontFamily: 'monospace', fontWeight: 650, color: isSelected ? '#1a73e8' : '#64748b' }}>
                        {count}
                      </span>
                      {isSelected && <Check size={16} color="#1a73e8" strokeWidth={2.5} />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 2: FDA Status */}
          {activeTab === 'fda' && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {FDA_FILTERS.map((f) => {
                const isSelected = selectedFdaStatus === f.id;
                const count = f.id === 'all'
                  ? processedProducts.length
                  : processedProducts.filter((p) => {
                      const s = p.compoundingStatus || p.fdaStatus || '';
                      return s.toLowerCase().includes(f.id.toLowerCase());
                    }).length;

                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFdaStatus(f.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 16px',
                      minHeight: '44px',
                      border: 'none',
                      borderBottom: '1px solid #f1f5f9',
                      borderLeft: isSelected ? `3px solid ${f.color || '#1a73e8'}` : '3px solid transparent',
                      background: isSelected ? '#e8f0fe' : '#ffffff',
                      color: isSelected ? '#1a73e8' : '#1e293b',
                      fontWeight: isSelected ? 750 : 500,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.84rem' }}>{f.icon}</span>
                      <div>
                        <div>{isEs ? (f.labelEs || f.label) : (f.labelEn || f.label)}</div>
                        <div style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 400 }}>
                          {isEs ? f.tooltipEs : f.tooltipEn}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.74rem', fontFamily: 'monospace', fontWeight: 650, color: isSelected ? '#1a73e8' : '#64748b' }}>
                        {count}
                      </span>
                      {isSelected && <Check size={16} color="#1a73e8" strokeWidth={2.5} />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 3: Shipping Corridor & Dosage */}
          {activeTab === 'shipping' && (
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Shipping Corridor */}
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 750, color: '#1e293b', marginBottom: '6px' }}>
                  {isEs ? 'Corredor Logístico y Almacén' : 'Logistics Corridor & Warehouse'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  {SHIPPING_DESTINATIONS.map((dest) => {
                    const isSelected = shippingDest === dest.label || shippingDest === dest.id;
                    return (
                      <button
                        key={dest.id}
                        type="button"
                        onClick={() => setShippingDest && setShippingDest(dest.label)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: isSelected ? '1px solid #1a73e8' : '1px solid #e2e8f0',
                          background: isSelected ? '#e8f0fe' : '#ffffff',
                          color: isSelected ? '#1a73e8' : '#334155',
                          fontSize: '0.74rem',
                          fontWeight: isSelected ? 750 : 600,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px'
                        }}
                      >
                        <span style={{ fontSize: '1rem' }}>{dest.flag}</span>
                        <span>{dest.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dosage Strength */}
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 750, color: '#1e293b', marginBottom: '6px' }}>
                  {isEs ? 'Concentración / Dosis' : 'Strength / Dosage'}
                </label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {DOSAGE_STRENGTHS.map((str) => {
                    const isSelected = selectedStrength === str.id;
                    return (
                      <button
                        key={str.id}
                        type="button"
                        onClick={() => setSelectedStrength && setSelectedStrength(str.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '999px',
                          border: isSelected ? '1px solid #1a73e8' : '1px solid #e2e8f0',
                          background: isSelected ? '#e8f0fe' : '#ffffff',
                          color: isSelected ? '#1a73e8' : '#475569',
                          fontSize: '0.74rem',
                          fontWeight: isSelected ? 750 : 600,
                          cursor: 'pointer'
                        }}
                      >
                        {isEs && str.id === 'all' ? 'Todas las Dosis' : str.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grouping View */}
              {setGroupByCategory && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <span style={{ fontSize: '0.76rem', fontWeight: 650, color: '#334155' }}>
                    {isEs ? 'Agrupar por categoría terapéutica' : 'Group by therapeutic category'}
                  </span>
                  <input
                    type="checkbox"
                    checked={groupByCategory}
                    onChange={(e) => setGroupByCategory(e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Action Footer */}
        <div
          style={{
            padding: '10px 16px max(14px, env(safe-area-inset-bottom))',
            borderTop: '1px solid #e2e8f0',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}
        >
          <button
            type="button"
            onClick={handleResetFilters}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontSize: '0.76rem',
              fontWeight: 650,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RotateCcw size={13} />
            <span>{isEs ? 'Limpiar filtros' : 'Reset filters'}</span>
          </button>

          <button
            type="button"
            onClick={closeBoth}
            style={{
              flex: 1,
              padding: '9px 16px',
              borderRadius: '8px',
              border: 'none',
              background: '#003666',
              color: '#ffffff',
              fontSize: '0.80rem',
              fontWeight: 750,
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            {isEs
              ? `Ver resultados (${countDisplay})`
              : `View results (${countDisplay})`}
          </button>
        </div>
      </div>
    </div>
  );
}

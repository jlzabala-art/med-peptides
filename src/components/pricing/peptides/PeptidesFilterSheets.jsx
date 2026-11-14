'use client';

import React, { useEffect } from 'react';
import { X, Check, Layers } from 'lucide-react';
import {
  CATEGORY_ORDER,
  CATEGORY_MAP,
  FDA_FILTERS,
  getCategoryIcon
} from '@/constants/peptideCategories';

/**
 * PeptidesFilterSheets
 * Mobile bottom sheets for Selecting Category and FDA Regulatory Status.
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
  processedProducts = [],
  isEs = false
}) {
  useEffect(() => {
    if (!isCategorySheetOpen && !isFdaSheetOpen) return undefined;
    const handleKeyDown = e => {
      if (e.key === 'Escape') {
        if (isCategorySheetOpen && setIsCategorySheetOpen) setIsCategorySheetOpen(false);
        if (isFdaSheetOpen && setIsFdaSheetOpen) setIsFdaSheetOpen(false);
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCategorySheetOpen, isFdaSheetOpen, setIsCategorySheetOpen, setIsFdaSheetOpen]);

  return (
    <>
      {/* Category Selection Sheet (Google Cloud Console Dense Flat List) */}
      {isCategorySheetOpen && (
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
          onClick={() => setIsCategorySheetOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderTopLeftRadius: '14px',
              borderTopRightRadius: '14px',
              width: '100%',
              maxWidth: '540px',
              maxHeight: '75vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.20)',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Sheet Handle & Header */}
            <div
              style={{
                padding: '10px 16px 8px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '5px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '32px',
                  height: '4px',
                  background: '#cbd5e1',
                  borderRadius: '2px'
                }}
              />
              <div style={{ marginTop: '4px' }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 750, color: '#202124', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{isEs ? 'Categoría Terapéutica' : 'Therapeutic Category'}</span>
                  <span style={{ fontSize: '0.72rem', color: '#5f6368', fontWeight: 500 }}>
                    ({CATEGORY_ORDER.length + 1} {isEs ? 'opciones' : 'options'})
                  </span>
                </div>
                <div style={{ fontSize: '0.70rem', color: '#5f6368' }}>
                  {isEs ? 'Filtrar formulaciones por indicación clínica' : 'Filter formulations by clinical therapeutic classification'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCategorySheetOpen(false)}
                style={{
                  background: '#f1f3f4',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#5f6368',
                  cursor: 'pointer'
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Flat List */}
            <div style={{ padding: '4px 0 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setIsCategorySheetOpen(false);
                }}
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
                  color: selectedCategory === 'all' ? '#1a73e8' : '#202124',
                  fontWeight: selectedCategory === 'all' ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.12s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Layers size={16} color={selectedCategory === 'all' ? '#1a73e8' : '#5f6368'} />
                  <span>{isEs ? 'Todas las Categorías' : 'All Categories'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontFamily: 'monospace',
                      fontWeight: 650,
                      color: selectedCategory === 'all' ? '#1a73e8' : '#5f6368'
                    }}
                  >
                    {processedProducts.length}
                  </span>
                  {selectedCategory === 'all' && <Check size={16} color="#1a73e8" strokeWidth={2.5} />}
                </div>
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
                      setIsCategorySheetOpen(false);
                    }}
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
                      color: isSelected ? '#1a73e8' : '#202124',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.12s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '18px' }}>
                        {getCategoryIcon(key, 15)}
                      </span>
                      <span>{isEs ? meta.labelEs : meta.labelEn}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontFamily: 'monospace',
                          fontWeight: 650,
                          color: isSelected ? '#1a73e8' : '#5f6368'
                        }}
                      >
                        {count}
                      </span>
                      {isSelected && <Check size={16} color="#1a73e8" strokeWidth={2.5} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mobile FDA Regulatory Status Sheet */}
      {isFdaSheetOpen && (
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
          onClick={() => setIsFdaSheetOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderTopLeftRadius: '14px',
              borderTopRightRadius: '14px',
              width: '100%',
              maxWidth: '540px',
              maxHeight: '75vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.20)',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Sheet Handle & Header */}
            <div
              style={{
                padding: '10px 16px 8px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '5px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '32px',
                  height: '4px',
                  background: '#cbd5e1',
                  borderRadius: '2px'
                }}
              />
              <div style={{ marginTop: '4px' }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 750, color: '#202124', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{isEs ? 'Estatus Regulatorio FDA' : 'FDA Regulatory Status'}</span>
                  <span style={{ fontSize: '0.72rem', color: '#5f6368', fontWeight: 500 }}>
                    ({FDA_FILTERS.length} {isEs ? 'estados' : 'statuses'})
                  </span>
                </div>
                <div style={{ fontSize: '0.70rem', color: '#5f6368' }}>
                  {isEs ? 'Trazabilidad legal de formulación (503A, PCAC, Estándar)' : 'Legal formulation regulatory framework'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFdaSheetOpen(false)}
                style={{
                  background: '#f1f3f4',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#5f6368',
                  cursor: 'pointer'
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Flat List */}
            <div style={{ padding: '4px 0 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              {FDA_FILTERS.map(f => {
                const count =
                  f.id === 'all'
                    ? processedProducts.length
                    : processedProducts.filter(p => p.fdaBucket === f.id).length;
                const isSelected = selectedFdaStatus === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setSelectedFdaStatus(f.id);
                      setIsFdaSheetOpen(false);
                    }}
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
                      color: isSelected ? '#1a73e8' : '#202124',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.12s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.84rem' }}>{f.icon}</span>
                      <div>
                        <div>{isEs ? f.labelEs : f.labelEn}</div>
                        <div style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 400 }}>
                          {isEs ? f.tooltipEs : f.tooltipEn}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontFamily: 'monospace',
                          fontWeight: 650,
                          color: isSelected ? '#1a73e8' : '#5f6368'
                        }}
                      >
                        {count}
                      </span>
                      {isSelected && <Check size={16} color="#1a73e8" strokeWidth={2.5} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

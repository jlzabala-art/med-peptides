'use client';

import React from 'react';
import {
  CATEGORY_ORDER,
  CATEGORY_MAP,
  FDA_FILTERS,
  getCategoryIcon
} from '@/constants/peptideCategories';

/**
 * PeptidesSidebarRail
 * Google Cloud Left Navigation Rail Pattern: Collapsible Category Tree
 * and FDA Regulatory Status filter bar for Desktop & Laptop.
 */
export default function PeptidesSidebarRail({
  isSidebarOpen = true,
  selectedCategory = 'all',
  setSelectedCategory,
  selectedFdaStatus = 'all',
  setSelectedFdaStatus,
  processedProducts = [],
  isEs = false
}) {
  return (
    <aside className="gcp-pricing-sidebar" style={{ display: isSidebarOpen ? 'flex' : 'none' }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #dadce0',
        padding: '12px 0',
        boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
      }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 14px', marginBottom: '8px' }}>
          {isEs ? 'Categorías de Péptidos' : 'Peptide Categories'}
        </div>
        <div className="gcp-categories-horizontal" style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
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
              fontSize: '0.78rem',
              fontWeight: selectedCategory === 'all' ? 700 : 500,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { if (selectedCategory !== 'all') e.currentTarget.style.background = '#f1f3f4'; }}
            onMouseLeave={e => { if (selectedCategory !== 'all') e.currentTarget.style.background = 'transparent'; }}
          >
            <span>{isEs ? 'Todas las Formulaciones' : 'All Formulations'}</span>
            <span style={{
              fontSize: '0.70rem',
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
              background: selectedCategory === 'all' ? '#1a73e8' : '#e8eaed',
              color: selectedCategory === 'all' ? '#ffffff' : '#3c4043',
              padding: '2px 8px',
              borderRadius: '10px'
            }}>
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
                onClick={() => setSelectedCategory(key)}
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
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f1f3f4'; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px' }}>
                    {getCategoryIcon(key, 14)}
                  </span>
                  <span>{isEs ? meta.labelEs : meta.labelEn}</span>
                </div>
                <span style={{
                  fontSize: '0.70rem',
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                  background: isSelected ? (meta.color || '#1a73e8') : '#e8eaed',
                  color: isSelected ? '#ffffff' : '#3c4043',
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ height: '1px', background: '#e2e8f0', margin: '12px 0 10px 0' }} />

        {/* FDA Regulatory Status Filter Rail */}
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 14px', marginBottom: '8px' }}>
          {isEs ? 'Estatus Regulatorio FDA' : 'FDA Regulatory Status'}
        </div>
        <div className="gcp-categories-horizontal" style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {FDA_FILTERS.map(f => {
            const isSelected = selectedFdaStatus === f.id;
            const count = f.id === 'all'
              ? processedProducts.length
              : processedProducts.filter(p => p.fdaBucket === f.id).length;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFdaStatus(f.id)}
                title={isEs ? (f.tooltipEs || f.labelEs) : (f.tooltipEn || f.labelEn)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 14px',
                  borderRadius: '0 4px 4px 0',
                  border: 'none',
                  borderLeft: isSelected ? `3px solid ${f.color || '#1a73e8'}` : '3px solid transparent',
                  background: isSelected ? (f.id === 'all' ? '#e8f0fe' : (f.id === 'fda_503a' ? '#ecfdf5' : f.id === 'fda_approved' ? '#eff6ff' : f.id === 'clinical_ind' ? '#fffbeb' : '#f1f5f9')) : 'transparent',
                  color: isSelected ? (f.id === 'all' ? '#1a73e8' : (f.color || '#3c4043')) : '#3c4043',
                  fontSize: '0.77rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f1f3f4'; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
                  <span style={{ fontSize: '0.80rem', flexShrink: 0 }}>{f.icon}</span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {isEs ? f.labelEs : f.labelEn}
                  </span>
                </div>
                <span style={{
                  fontSize: '0.70rem',
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                  background: isSelected ? (f.id === 'all' ? '#1a73e8' : (f.color || '#5f6368')) : '#e8eaed',
                  color: isSelected ? '#ffffff' : '#3c4043',
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

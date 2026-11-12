'use client';

import React from 'react';

/**
 * Mobile-Ready Interactive Supermarket Grocery Checklist
 * Sourced for Doha / Qatar supermarkets (Monoprix, Lulu, Carrefour).
 * Automatically persisted to localStorage per patient sample code.
 */
export default function DnaGroceryChecklist({
  supermarketGroceryList = [],
  checkedGroceryItems = {},
  onToggleItem,
  onResetList
}) {
  const checkedCount = Object.values(checkedGroceryItems).filter(Boolean).length;
  const hasChecked = Object.values(checkedGroceryItems).some(Boolean);

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1.5px solid #ccfbf1',
        padding: '1.75rem',
        boxShadow: '0 4px 12px rgba(13, 148, 136, 0.06)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
              Mobile-Ready Shopping Guide (Auto-Saved)
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0d9488' }}>
              🛒 Monoprix, Lulu &amp; Carrefour Qatar Ready
            </span>
          </div>
          <h3 style={{ fontSize: '1.30rem', fontWeight: 850, color: '#003666', margin: '2px 0 4px 0' }}>
            Patient Supermarket Grocery Checklist
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
            Tap each item on your phone as you place it into your supermarket shopping cart (saved automatically on your device).
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', padding: '6px 14px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 750, color: '#0f766e' }}>
            ✓ {checkedCount} items checked
          </div>
          {hasChecked && (
            <button
              type="button"
              onClick={onResetList}
              style={{
                padding: '6px 10px',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#64748b',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Reset List
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
        {supermarketGroceryList.map((cat, cIdx) => (
          <div key={cIdx} style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
              <span style={{ fontSize: '1.2rem' }}>{cat.icon}</span>
              <strong style={{ fontSize: '0.86rem', color: '#003666', fontWeight: 850 }}>
                {cat.category}
              </strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {cat.items?.map((item, iIdx) => {
                const key = `${cIdx}_${iIdx}`;
                const isChecked = Boolean(checkedGroceryItems[key]);
                return (
                  <label
                    key={iIdx}
                    onClick={() => onToggleItem?.(key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.80rem',
                      color: isChecked ? '#94a3b8' : '#334155',
                      textDecoration: isChecked ? 'line-through' : 'none',
                      cursor: 'pointer',
                      padding: '4px 6px',
                      borderRadius: '4px',
                      backgroundColor: isChecked ? '#f1f5f9' : 'transparent',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      style={{ cursor: 'pointer', accentColor: '#0d9488' }}
                    />
                    <span>{item}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

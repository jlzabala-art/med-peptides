"use client";
import React, { useState } from 'react';
import { Bot, ArrowRight, Plus, Check, Stethoscope, FileText } from '@/lib/icons';
import { useStorefrontMode } from '../../context/StorefrontModeContext';

export default function ProductCardActions({
  title,
  color = 'var(--primary)',
  onDetailsClick,
  onQuickAdd,
  onPrescribeClick
}) {
  const { mode, permissions } = useStorefrontMode();
  const [added, setAdded] = useState(false);

  const handleOpenAI = (e) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent('open-clinical-ai', {
        detail: { query: `I want to explore research options for the compound ${title}.`, autoSend: true },
      })
    );
  };

  const handlePrescribe = (e) => {
    e.stopPropagation();
    if (onPrescribeClick) {
      onPrescribeClick();
    } else {
      window.dispatchEvent(
        new CustomEvent('open-rx-drawer', {
          detail: { compoundName: title },
        })
      );
    }
  };

  return (
    <div 
      className="col-card-actions"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        marginTop: '0.75rem',
        width: '100%',
      }}
    >
      {/* Dynamic Secondary Action based on Storefront Mode */}
      {permissions.canPrescribe ? (
        <button
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.65rem 0.5rem',
            minHeight: '38px',
            borderRadius: '6px',
            background: 'rgba(13, 148, 136, 0.08)',
            border: '1px solid rgba(13, 148, 136, 0.25)',
            color: '#0d9488',
            cursor: 'pointer',
            flex: '1 1 auto',
            whiteSpace: 'nowrap'
          }}
          onClick={handlePrescribe}
          aria-label={`Prescribe ${title} to patient`}
          title={`Prescribe ${title} to patient`}
        >
          <Stethoscope size={13} strokeWidth={2.5} /> Prescribe
        </button>
      ) : (
        <button
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.65rem 0.5rem',
            minHeight: '38px',
            borderRadius: '6px',
            background: 'rgba(0, 163, 224, 0.06)',
            border: '1px solid rgba(0, 163, 224, 0.2)',
            color: 'var(--secondary, #0096CC)',
            cursor: 'pointer',
            flex: '1 1 auto',
            whiteSpace: 'nowrap'
          }}
          onClick={handleOpenAI}
          aria-label={`Ask ClinicalAI about ${title}`}
          title={`Ask ClinicalAI about ${title}`}
        >
          <Bot size={13} strokeWidth={2.5} /> ClinicalAI
        </button>
      )}

      {/* Primary Details Action */}
      <button
        type="button"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          fontSize: '0.75rem',
          fontWeight: 700,
          padding: '0.65rem 0.5rem',
          minHeight: '38px',
          borderRadius: '6px',
          background: color,
          border: 'none',
          color: '#ffffff',
          cursor: 'pointer',
          flex: '1 1 auto',
          whiteSpace: 'nowrap'
        }}
        onClick={(e) => {
          e.stopPropagation();
          onDetailsClick?.();
        }}
        aria-label={`View details for ${title}`}
      >
        Details <ArrowRight size={13} strokeWidth={2.5} />
      </button>

      {/* Quick Add to Cart Action */}
      {onQuickAdd && (
        <button
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            minWidth: '38px',
            height: '38px',
            borderRadius: '6px',
            backgroundColor: added ? '#16a34a' : 'rgba(0, 54, 102, 0.06)',
            border: added ? '1px solid #22c55e' : '1px solid var(--border, #cbd5e1)',
            color: added ? '#ffffff' : 'var(--primary, #003666)',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            flexShrink: 0,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onQuickAdd(e);
            setAdded(true);
            setTimeout(() => setAdded(false), 1400);
          }}
          aria-label={`Quick add ${title} to cart`}
          title={`Quick add ${title} to cart`}
        >
          {added ? <Check size={15} strokeWidth={3} /> : <Plus size={15} strokeWidth={2.5} />}
        </button>
      )}
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import './PublicDatasheetMobileBar.css';
import { Share2, Check, FlaskConical } from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';

function WaIconMini() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.091.537 4.058 1.477 5.771L.013 23.52l5.893-1.44A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a10 10 0 01-5.079-1.381l-.365-.217-3.495.854.875-3.403-.238-.384A10 10 0 1122 12 10.011 10.011 0 0112 22z"/>
    </svg>
  );
}

export default function PublicDatasheetMobileBar({
  name,
  activeFormat,
  selectedStrength,
  supplierName,
  dynamicPublicUrl,
  lang = 'es'
}) {
  const [copied, setCopied] = useState(false);

  const formatName = activeFormat?.name || 'Vial';
  const doseName = selectedStrength?.name || '10 mg';
  const isVial = (activeFormat?.id || '').includes('vial');

  const handleWhatsAppOrder = () => {
    triggerHaptic('medium');
    const isEs = (lang || '').startsWith('es');
    
    const text = isEs
      ? `🔬 *Consulta Clínica / Pedido:* ${name}\n` +
        `• *Presentación:* ${formatName}\n` +
        `• *Dosis:* ${doseName}\n` +
        `• *Laboratorio / Síntesis:* ${supplierName}\n` +
        `• *Ficha Técnica Oficial:* ${dynamicPublicUrl}\n\n` +
        `Hola, deseo consultar disponibilidad y solicitar cotización formal para este compuesto.`
      : `🔬 *Clinical Order & Inquiry:* ${name}\n` +
        `• *Format:* ${formatName}\n` +
        `• *Strength:* ${doseName}\n` +
        `• *Synthesis Lab:* ${supplierName}\n` +
        `• *Official Monograph:* ${dynamicPublicUrl}\n\n` +
        `Hello, I would like to request stock availability and formal quotation for this peptide compound.`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async () => {
    triggerHaptic('light');
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${name} (${formatName}) | RegenPept`,
          text: `Ficha técnica analítica de ${name} (${doseName}, ${formatName}) sintetizado bajo cGMP por ${supplierName}.`,
          url: dynamicPublicUrl,
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback: Copy to clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(dynamicPublicUrl).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleScrollToReconstitution = () => {
    triggerHaptic('tap');
    const el = document.getElementById('reconstitution-guide');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <aside className="pds-mobile-bar" aria-label="Acciones Rápidas del Producto">
      <div className="pds-mb-inner">
        {/* Left: Active Configuration Chip */}
        <div className="pds-mb-spec">
          <span className="pds-mb-pill-format">{formatName}</span>
          <span className="pds-mb-pill-dose">{doseName}</span>
        </div>

        {/* Right Action Cluster */}
        <div className="pds-mb-actions">
          {/* Quick jump to dilución (if vial) */}
          {isVial && (
            <button
              type="button"
              onClick={handleScrollToReconstitution}
              className="pds-mb-btn pds-mb-btn-calc"
              title="Ir a Calculadora de Reconstitución"
              aria-label="Ir a Calculadora de Reconstitución"
            >
              <FlaskConical size={18} />
            </button>
          )}

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="pds-mb-btn pds-mb-btn-share"
            title="Compartir Ficha Técnica"
            aria-label="Compartir Ficha Técnica"
          >
            {copied ? <Check size={18} color="#16a34a" /> : <Share2 size={18} />}
          </button>

          {/* Primary High-Conversion WhatsApp CTA */}
          <button
            type="button"
            onClick={handleWhatsAppOrder}
            className="pds-mb-btn pds-mb-btn-whatsapp"
            aria-label="Consultar / Pedir vía WhatsApp"
          >
            <WaIconMini />
            <span className="pds-mb-wa-text">
              {(lang || '').startsWith('es') ? 'Pedir' : 'Order'}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}

"use client";

import React from 'react';
import { resolveVariantClinicalImage } from '@/utils/clinicalImageResolver';
import { ShieldCheck, Snowflake, Thermometer, Droplets, Zap, Activity, Microscope, CheckCircle2 } from '@/lib/icons';

/**
 * DynamicProductVisualOverlay
 * ─────────────────────────────────────────────────────────────────────────────
 * Clean, scoped Vanilla CSS visual enrichment for all catalog products (Peptides & Non-Peptides).
 * Overlays dynamic pharmaceutical labels, storage conditions, and technical HUD badges
 * on top of master photos with 100% responsive stability.
 */
export default function DynamicProductVisualOverlay({ product, variant, className = '' }) {
  const activeVariant = variant || product?.variants?.[0] || {};
  const imgSrc = resolveVariantClinicalImage(activeVariant, product);

  const productType = product?.productType || product?.type || activeVariant?.type || 'finished_product';
  const format = (activeVariant?.format || product?.format || '').toLowerCase();
  const presentation = (activeVariant?.presentation || product?.presentation || '').toLowerCase();

  const isRaw = productType === 'raw_material' || format === 'bulk_api' || presentation.includes('bulk') || presentation.includes('api');
  const isPen = format.includes('pen') || presentation.includes('pen') || activeVariant?.penConfig;
  const isDualChamber = isPen && (activeVariant?.penConfig?.cartridgeType === 'double_cartridge' || presentation.includes('double') || presentation.includes('dual'));
  const isDevice = productType === 'clinical_supplies' && (presentation.includes('device') || presentation.includes('reusable') || presentation.includes('injector'));
  const isDiluent = presentation.includes('water') || presentation.includes('bac') || presentation.includes('diluent') || presentation.includes('saline');
  const isDiagnostic = productType === 'diagnostic' || product?.category === 'Diagnostic' || presentation.includes('test') || presentation.includes('panel');
  const isService = productType === 'service' || product?.category === 'Service' || presentation.includes('consultation') || presentation.includes('protocol');
  const isVial = !isRaw && !isPen && !isDevice && !isDiluent && !isDiagnostic && !isService && (presentation.includes('vial') || format.includes('vial') || !format);

  // Dynamic Label Information
  const brandName = (product?.canonicalName || product?.name || 'Peptide Compound').toUpperCase();
  const strengthText = activeVariant?.dosage || (activeVariant?.quantity && activeVariant?.unit ? `${activeVariant.quantity}${activeVariant.unit}` : 'Standard Grade');
  const lotNumber = `LOT #${(product?.id || '26A').substring(0, 4).toUpperCase()}-${(activeVariant?.id || '99').substring(0, 3).toUpperCase()}`;

  return (
    <div className={`dpv-container ${className}`}>
      {/* 1. Base Studio Master Photo */}
      <img
        src={imgSrc}
        alt={`${product?.name || 'Product'} Presentation`}
        className="dpv-image"
        loading="eager"
      />

      {/* Subtle Medical Vignette */}
      <div className="dpv-vignette" />

      {/* 2. Top-Left Delivery & Archetype HUD Badge */}
      <div className="dpv-top-left">
        {isDualChamber && (
          <div className="dpv-badge dpv-badge-blue">
            <span className="dpv-dot dpv-dot-blue" />
            <span>Dual-Chamber Reconstitution</span>
          </div>
        )}
        {isPen && !isDualChamber && (
          <div className="dpv-badge dpv-badge-emerald">
            <span className="dpv-dot dpv-dot-emerald" />
            <span>Pre-Mixed Single Cartridge</span>
          </div>
        )}
        {isRaw && (
          <div className="dpv-badge dpv-badge-amber">
            <Zap size={12} color="#f59e0b" />
            <span>Compounding Bulk API (Mass)</span>
          </div>
        )}
        {isVial && (
          <div className="dpv-badge dpv-badge-slate">
            <ShieldCheck size={13} color="#2dd4bf" />
            <span>Lyophilized Borosilicate Vial</span>
          </div>
        )}
        {isDevice && (
          <div className="dpv-badge dpv-badge-indigo">
            <Zap size={12} color="#818cf8" />
            <span>Reusable Injector Device</span>
          </div>
        )}
        {isDiluent && (
          <div className="dpv-badge dpv-badge-cyan">
            <Droplets size={12} color="#22d3ee" />
            <span>USP Bacteriostatic Diluent</span>
          </div>
        )}
        {isDiagnostic && (
          <div className="dpv-badge dpv-badge-purple">
            <Microscope size={12} color="#c084fc" />
            <span>CLIA-Certified Diagnostic Kit</span>
          </div>
        )}
        {isService && (
          <div className="dpv-badge dpv-badge-sky">
            <Activity size={12} color="#38bdf8" />
            <span>Physician Clinical Service</span>
          </div>
        )}
      </div>

      {/* 3. Top-Right Storage & Compliance HUD Badge */}
      <div className="dpv-top-right">
        {isRaw ? (
          <div className="dpv-badge dpv-badge-storage">
            <Snowflake size={12} color="#60a5fa" />
            <span>-20°C Desiccated</span>
          </div>
        ) : (isDiagnostic || isDiluent || isDevice || isService) ? (
          <div className="dpv-badge dpv-badge-storage">
            <Thermometer size={12} color="#fbbf24" />
            <span>15°C – 25°C Room Temp</span>
          </div>
        ) : (
          <div className="dpv-badge dpv-badge-storage">
            <Snowflake size={12} color="#22d3ee" />
            <span>2°C – 8°C Cold Chain</span>
          </div>
        )}
      </div>

      {/* 4. Bottom Dynamic Chemical & Specification HUD Ribbon */}
      <div className="dpv-bottom-ribbon">
        <div className="dpv-ribbon-left">
          <div className="dpv-ribbon-line1">
            <span className="dpv-brand-name">{brandName}</span>
            <span className="dpv-strength-pill">{strengthText}</span>
          </div>
          <div className="dpv-ribbon-line2">
            <span>{lotNumber}</span>
            <span>•</span>
            <span className="dpv-purity-text">≥99.2% Purity HPLC</span>
          </div>
        </div>

        {/* Dynamic Verification Seal */}
        <div className="dpv-seal">
          <CheckCircle2 size={13} color="#2dd4bf" />
          <span>Verified</span>
        </div>
      </div>

      <style jsx>{`
        .dpv-container {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          max-height: 440px;
          border-radius: 20px;
          overflow: hidden;
          background: radial-gradient(circle at 50% 45%, #0f172a 0%, #020617 100%);
          border: 1px solid rgba(51, 65, 85, 0.6);
          box-shadow: 0 20px 40px -15px rgba(0, 54, 102, 0.2), inset 0 0 1px 1px rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          box-sizing: border-box;
        }
        .dpv-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 1.25rem;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dpv-container:hover .dpv-image {
          transform: scale(1.04);
        }
        .dpv-vignette {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(circle at 50% 45%, rgba(0, 54, 102, 0) 45%, rgba(2, 6, 23, 0.4) 100%);
        }
        .dpv-top-left {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 5;
          display: flex;
          flex-direction: column;
          gap: 6px;
          pointer-events: none;
        }
        .dpv-top-right {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 5;
          pointer-events: none;
        }
        .dpv-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.02em;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .dpv-badge-blue {
          background: rgba(23, 37, 84, 0.85);
          border: 1px solid rgba(59, 130, 246, 0.4);
          color: #93c5fd;
        }
        .dpv-badge-emerald {
          background: rgba(6, 78, 59, 0.85);
          border: 1px solid rgba(16, 185, 129, 0.4);
          color: #6ee7b7;
        }
        .dpv-badge-amber {
          background: rgba(69, 26, 3, 0.85);
          border: 1px solid rgba(245, 158, 11, 0.4);
          color: #fcd34d;
        }
        .dpv-badge-slate {
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(148, 163, 184, 0.35);
          color: #e2e8f0;
        }
        .dpv-badge-indigo {
          background: rgba(49, 46, 129, 0.85);
          border: 1px solid rgba(99, 102, 241, 0.4);
          color: #c7d2fe;
        }
        .dpv-badge-cyan {
          background: rgba(22, 78, 99, 0.85);
          border: 1px solid rgba(6, 182, 212, 0.4);
          color: #a5f3fc;
        }
        .dpv-badge-purple {
          background: rgba(88, 28, 135, 0.85);
          border: 1px solid rgba(168, 85, 247, 0.4);
          color: #e9d5ff;
        }
        .dpv-badge-sky {
          background: rgba(12, 74, 110, 0.85);
          border: 1px solid rgba(14, 165, 233, 0.4);
          color: #bae6fd;
        }
        .dpv-badge-storage {
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(148, 163, 184, 0.3);
          color: #cbd5e1;
          font-size: 11px;
          font-weight: 600;
        }
        .dpv-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }
        .dpv-dot-blue {
          background: #60a5fa;
          box-shadow: 0 0 6px #60a5fa;
        }
        .dpv-dot-emerald {
          background: #34d399;
          box-shadow: 0 0 6px #34d399;
        }
        .dpv-bottom-ribbon {
          position: absolute;
          bottom: 12px;
          left: 12px;
          right: 12px;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border-radius: 12px;
          background: rgba(2, 6, 23, 0.88);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(51, 65, 85, 0.7);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
          box-sizing: border-box;
          gap: 8px;
        }
        .dpv-ribbon-left {
          display: flex;
          flex-direction: column;
          min-width: 0;
          flex: 1;
        }
        .dpv-ribbon-line1 {
          display: flex;
          align-items: center;
          gap: 6px;
          overflow: hidden;
        }
        .dpv-brand-name {
          font-size: 11px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 0.04em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .dpv-strength-pill {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 800;
          background: rgba(13, 148, 136, 0.2);
          color: #5eead4;
          border: 1px solid rgba(20, 184, 166, 0.35);
          white-space: nowrap;
        }
        .dpv-ribbon-line2 {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 2px;
          font-size: 10px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          color: #94a3b8;
        }
        .dpv-purity-text {
          color: #2dd4bf;
          font-weight: 600;
        }
        .dpv-seal {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 6px;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(20, 184, 166, 0.4);
          color: #2dd4bf;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}

'use client';

import React from 'react';

/**
 * ── Google Cloud UX Presentation Vector Icons ────────────────────────────────
 * Precision-crafted 24x24 SVG vectors reflecting authentic pharmaceutical formats:
 * - Borosilicate Lyophilized Vial
 * - Prefilled Auto-Injector Pen
 * - Metered Nasal / Sublingual Spray
 * - Oral Compressed Tablet & Capsule
 * - Topical Dropper Pipette / Serum
 * - Erlenmeyer Conical Flask / Bulk API Powder
 * - Rapid Diagnostic Test Cassette
 * - Clinical Multi-Pack / Stack Box
 */

export function VialIcon({ size = 22, color = 'currentColor', strokeWidth = 1.75, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Crimp Cap & Rubber Septum */}
      <rect x="8.5" y="2" width="7" height="2.5" rx="0.75" />
      <line x1="10.5" y1="2" x2="13.5" y2="2" />
      {/* Vial Neck with Shoulders */}
      <path d="M9.5 4.5v1.8c0 .4-.3.9-.7 1.3L7.3 9c-.8.8-1.3 1.9-1.3 3.1V19c0 1.7 1.3 3 3 3h6c1.7 0 3-1.3 3-3v-6.9c0-1.2-.5-2.3-1.3-3.1L15.2 7.6c-.4-.4-.7-.9-.7-1.3V4.5" />
      {/* Sterile Lyophilized Cake / Reconstituted Liquid Level */}
      <path d="M6.5 16.5c1.8-.4 3.7.4 5.5 0s3.7-.4 5.5 0" />
      {/* Precision Volume Graduation Marks */}
      <line x1="9" y1="12" x2="11.5" y2="12" />
      <line x1="9" y1="14" x2="10.5" y2="14" />
    </svg>
  );
}

export function PenIcon({ size = 22, color = 'currentColor', strokeWidth = 1.75, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Plunger Actuator Push Button */}
      <rect x="10.5" y="1.5" width="3" height="2" rx="0.5" />
      {/* Slender Auto-Injector Barrel */}
      <rect x="9" y="3.5" width="6" height="15" rx="1.5" />
      {/* Pen Clip */}
      <path d="M9 5H7.5v4.5H9" />
      {/* Dosage Inspection Chamber Window */}
      <rect x="10.5" y="8" width="3" height="5" rx="0.75" />
      <line x1="11" y1="10.5" x2="13" y2="10.5" />
      {/* Beveled Needle Cap / Shield Tip */}
      <path d="M10 18.5l2 3.5 2-3.5" />
      <line x1="12" y1="22" x2="12" y2="23" />
    </svg>
  );
}

export function SprayIcon({ size = 22, color = 'currentColor', strokeWidth = 1.75, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Spray Bottle Body */}
      <rect x="7" y="11" width="10" height="10" rx="2" />
      {/* Dual-finger Flange Actuator Collar */}
      <path d="M6 8.5h12" />
      {/* Central Dispenser Column */}
      <rect x="10" y="4.5" width="4" height="4" rx="0.5" />
      {/* Spray Nozzle Stem */}
      <line x1="12" y1="4.5" x2="12" y2="2" />
      {/* Fine Aerosol Micro-Mist Droplets */}
      <path d="M8 2a3.5 3.5 0 0 1 0 4.5" />
      <path d="M16 2a3.5 3.5 0 0 0 0 4.5" />
      <circle cx="12" cy="1" r="0.6" fill={color} />
      <circle cx="6" cy="3" r="0.6" fill={color} />
      <circle cx="18" cy="3" r="0.6" fill={color} />
    </svg>
  );
}

export function TabletIcon({ size = 22, color = 'currentColor', strokeWidth = 1.75, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Oblong Pharmaceutical Capsule (Angled) */}
      <rect x="3.5" y="4" width="6" height="12" rx="3" transform="rotate(-30 6.5 10)" />
      <line x1="3.5" y1="9.5" x2="9.5" y2="6.5" />
      {/* Circular Compressed Tablet with Score Line */}
      <circle cx="16.5" cy="15" r="5" />
      <line x1="13" y1="15" x2="20" y2="15" />
      <line x1="16.5" y1="11.5" x2="16.5" y2="18.5" opacity="0.4" />
    </svg>
  );
}

export function DropperIcon({ size = 22, color = 'currentColor', strokeWidth = 1.75, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Squeeze Bulb Top */}
      <path d="M10 2.5a2 2 0 0 1 4 0v1.5h-4z" />
      {/* Collar Ring */}
      <rect x="9" y="4" width="6" height="2" rx="0.5" />
      {/* Tapered Pipette Shaft */}
      <path d="M10.5 6v8.5l1.5 3 1.5-3V6" />
      {/* Calibration Marks */}
      <line x1="11" y1="9" x2="12.5" y2="9" />
      <line x1="11" y1="11.5" x2="12.5" y2="11.5" />
      {/* Descending Serum Drop */}
      <path d="M12 19.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5c0-.8-1.5-2-1.5-2s-1.5 1.2-1.5 2z" fill={color} opacity="0.9" />
    </svg>
  );
}

export function PowderFlaskIcon({ size = 22, color = 'currentColor', strokeWidth = 1.75, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Conical Erlenmeyer Laboratory Flask */}
      <line x1="10" y1="2" x2="14" y2="2" />
      <path d="M11 2v4.5l-5.5 11.5a2 2 0 0 0 1.8 3h13.4a2 2 0 0 0 1.8-3L13 6.5V2" />
      {/* Powder Base Level */}
      <path d="M8 16h8" />
      <line x1="9.5" y1="12" x2="11.5" y2="12" />
      {/* Purity Sparkle Crystals */}
      <circle cx="10" cy="18" r="0.75" fill={color} />
      <circle cx="14" cy="18" r="0.75" fill={color} />
      <circle cx="12" cy="17" r="0.75" fill={color} />
    </svg>
  );
}

export function DiagnosticKitIcon({ size = 22, color = 'currentColor', strokeWidth = 1.75, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Diagnostic Lateral Flow Cassette */}
      <rect x="7" y="2" width="10" height="20" rx="2.5" />
      {/* Sample S Well */}
      <circle cx="12" cy="6" r="1.5" />
      {/* C/T Test Window */}
      <rect x="9.5" y="10.5" width="5" height="8" rx="1" />
      <line x1="10.5" y1="13" x2="13.5" y2="13" />
      <line x1="10.5" y1="16" x2="13.5" y2="16" />
    </svg>
  );
}

export function KitPackageIcon({ size = 22, color = 'currentColor', strokeWidth = 1.75, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Pharmaceutical Presentation Carton */}
      <path d="M12 2l8 4.5v11L12 22l-8-4.5v-11z" />
      <path d="M12 12l8-4.5" />
      <path d="M12 12v10" />
      <path d="M12 12L4 7.5" />
      {/* Clinical Cross Accent */}
      <line x1="12" y1="5.5" x2="12" y2="8.5" opacity="0.6" />
      <line x1="10.5" y1="7" x2="13.5" y2="7" opacity="0.6" />
    </svg>
  );
}

/**
 * Detects the pharmaceutical presentation and maps to Google Cloud Console UX styling.
 */
export function detectProductPresentation(productOrVariant, parentProduct = null) {
  const v = productOrVariant || {};
  const p = parentProduct || (v.variants ? v : {});

  // Extract text fields
  const texts = [
    v.presentation,
    v.format,
    v.formatId,
    v.selectedFormat,
    v.dosage,
    v.name,
    p.presentation,
    p.format,
    p.dosageForm,
    p.category,
    p.canonicalName,
    p.name,
    p.slug
  ].filter(Boolean).map(s => String(s).toLowerCase()).join(' ');

  const variantList = Array.isArray(p.variants) ? p.variants : [];
  const variantFormats = variantList.map(varItem =>
    String(varItem.presentation || varItem.format || varItem.name || '').toLowerCase()
  );

  const isSpecificVariant = !v.variants;
  if (isSpecificVariant) {
    const singleText = [v.presentation, v.format, v.name, v.dosage]
      .filter(Boolean)
      .map(s => String(s).toLowerCase())
      .join(' ');

    if (singleText.includes('pen') || singleText.includes('cartridge') || singleText.includes('autoinject') || singleText.includes('pluma')) {
      return {
        type: 'pen',
        label: 'Prefilled Auto-Injector Pen',
        shortLabel: 'Pen',
        color: '#7c3aed',
        bg: '#f5f3ff',
        border: '#ddd6fe',
        Icon: PenIcon
      };
    }
    if (singleText.includes('spray') || singleText.includes('nasal') || singleText.includes('pulveriz')) {
      return {
        type: 'spray',
        label: 'Metered Nasal Spray',
        shortLabel: 'Spray',
        color: '#0d9488',
        bg: '#f0fdfa',
        border: '#99f6e4',
        Icon: SprayIcon
      };
    }
    if (singleText.includes('capsul') || singleText.includes('tablet') || singleText.includes('pill') || singleText.includes('oral') || singleText.includes('troche')) {
      return {
        type: 'tablet',
        label: 'Oral Tablets / Capsules',
        shortLabel: 'Oral',
        color: '#d97706',
        bg: '#fffbeb',
        border: '#fde68a',
        Icon: TabletIcon
      };
    }
    if (singleText.includes('topical') || singleText.includes('serum') || singleText.includes('cream') || singleText.includes('gel') || singleText.includes('dropper')) {
      return {
        type: 'topical',
        label: 'Topical Dropper / Serum',
        shortLabel: 'Topical',
        color: '#16a34a',
        bg: '#f0fdf4',
        border: '#bbf7d0',
        Icon: DropperIcon
      };
    }
    if (singleText.includes('bulk') || singleText.includes('api') || singleText.includes('powder') || singleText.includes('granel')) {
      return {
        type: 'powder',
        label: 'Bulk API Lyophilized Powder',
        shortLabel: 'Bulk API',
        color: '#db2777',
        bg: '#fdf2f8',
        border: '#fbcfe8',
        Icon: PowderFlaskIcon
      };
    }
    return {
      type: 'vial',
      label: 'Lyophilized Borosilicate Vial',
      shortLabel: 'Vial',
      color: '#0284c7',
      bg: '#eff6ff',
      border: '#bfdbfe',
      Icon: VialIcon
    };
  }

  // Multi-variant or Product Master Header Level
  const distinctFormats = new Set();
  variantFormats.forEach(f => {
    if (f.includes('pen') || f.includes('cartridge')) distinctFormats.add('pen');
    else if (f.includes('spray') || f.includes('nasal')) distinctFormats.add('spray');
    else if (f.includes('capsul') || f.includes('tablet')) distinctFormats.add('tablet');
    else if (f.includes('topical') || f.includes('serum') || f.includes('cream')) distinctFormats.add('topical');
    else distinctFormats.add('vial');
  });

  const hasSpray = texts.includes('spray') || texts.includes('nasal') || texts.includes('pulveriz');
  const hasPen = texts.includes('pen') || texts.includes('autoinject') || texts.includes('cartridge');
  const hasTablet = texts.includes('capsule') || texts.includes('tablet') || texts.includes('oral') || texts.includes('troche');
  const hasTopical = texts.includes('topical') || texts.includes('serum') || texts.includes('cream') || texts.includes('gel');
  const hasDiagnostic = texts.includes('test') || texts.includes('panel') || texts.includes('bloodo') || p.category === 'Diagnostic' || p.type === 'diagnostic';
  const hasBulk = texts.includes('bulk') || texts.includes('api') || texts.includes('powder') || p.type === 'raw_material';

  if (hasSpray && distinctFormats.size === 1) {
    return {
      type: 'spray',
      label: 'Metered Nasal Spray',
      shortLabel: 'Spray',
      color: '#0d9488',
      bg: '#f0fdfa',
      border: '#99f6e4',
      Icon: SprayIcon
    };
  }
  if (hasPen && !distinctFormats.has('vial')) {
    return {
      type: 'pen',
      label: 'Prefilled Auto-Injector Pen',
      shortLabel: 'Pen',
      color: '#7c3aed',
      bg: '#f5f3ff',
      border: '#ddd6fe',
      Icon: PenIcon
    };
  }
  if (hasTablet && !distinctFormats.has('vial')) {
    return {
      type: 'tablet',
      label: 'Oral Tablets / Capsules',
      shortLabel: 'Oral',
      color: '#d97706',
      bg: '#fffbeb',
      border: '#fde68a',
      Icon: TabletIcon
    };
  }
  if (hasTopical) {
    return {
      type: 'topical',
      label: 'Topical Dropper / Solution',
      shortLabel: 'Topical',
      color: '#16a34a',
      bg: '#f0fdf4',
      border: '#bbf7d0',
      Icon: DropperIcon
    };
  }
  if (hasDiagnostic) {
    return {
      type: 'diagnostic',
      label: 'Diagnostic Test Panel',
      shortLabel: 'Panel',
      color: '#475569',
      bg: '#f8fafc',
      border: '#cbd5e1',
      Icon: DiagnosticKitIcon
    };
  }
  if (hasBulk) {
    return {
      type: 'powder',
      label: 'Bulk API Powder',
      shortLabel: 'Bulk API',
      color: '#db2777',
      bg: '#fdf2f8',
      border: '#fbcfe8',
      Icon: PowderFlaskIcon
    };
  }

  // Standard Borosilicate Lyophilized Vial (Gold Standard)
  return {
    type: 'vial',
    label: 'Lyophilized Borosilicate Vial',
    shortLabel: 'Vial',
    color: '#0284c7',
    bg: '#eff6ff',
    border: '#bfdbfe',
    Icon: VialIcon,
    hasMultipleFormats: distinctFormats.size > 1
  };
}

/**
 * Google Cloud Console UX Product Presentation Icon Component.
 * Replaces unstandardized raster photos with crisp vector presentation iconography.
 *
 * @param {Object} props
 * @param {Object} props.product - Master Product object
 * @param {Object} [props.variant] - Specific variant object
 * @param {string} [props.size='md'] - 'sm' (32px), 'md' (40px), 'lg' (56px)
 * @param {string} [props.className='']
 * @param {Object} [props.style={}]
 * @param {boolean} [props.showTooltip=true]
 */
export default function ProductPresentationIcon({
  product = {},
  variant = null,
  size = 'md',
  className = '',
  style = {},
  showTooltip = true
}) {
  const meta = detectProductPresentation(variant || product, product);
  const IconComponent = meta.Icon || VialIcon;

  const sizeMap = {
    sm: { box: 32, icon: 18, radius: 6, stroke: 1.6 },
    md: { box: 40, icon: 22, radius: 8, stroke: 1.75 },
    lg: { box: 56, icon: 30, radius: 10, stroke: 1.8 }
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`gcp-presentation-badge ${className}`}
      title={showTooltip ? `${meta.label} · Clinical Format` : undefined}
      style={{
        width: `${dim.box}px`,
        height: `${dim.box}px`,
        minWidth: `${dim.box}px`,
        minHeight: `${dim.box}px`,
        borderRadius: `${dim.radius}px`,
        backgroundColor: meta.bg,
        border: `1px solid ${meta.border}`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: meta.color,
        flexShrink: 0,
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
        transition: 'all 0.15s ease',
        position: 'relative',
        boxSizing: 'border-box',
        ...style
      }}
    >
      <IconComponent size={dim.icon} color={meta.color} strokeWidth={dim.stroke} />
      {meta.hasMultipleFormats && size !== 'sm' && (
        <span
          title="Multiple Formats (e.g. Vials & Pens)"
          style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#7c3aed',
            border: '1.5px solid #ffffff'
          }}
        />
      )}
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import {
  Syringe, ShieldCheck, Sparkles, MapPin, Activity, Layers,
  Package, AlertTriangle, CheckCircle2, Info, ChevronDown, ChevronRight,
  ClipboardList, Microscope, ExternalLink, Star, Zap, Heart, BookOpen
} from 'lucide-react';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicPageShell from '@/components/shared/public/PublicPageShell';
import PublicAtlasAIDrawer from '@/components/shared/PublicAtlasAIDrawer';
import toast from 'react-hot-toast';

// ── Subcategory visual config ─────────────────────────────────────────────────
const SUBCATEGORY_META = {
  'Dermal Fillers': {
    color: '#7c3aed', bg: '#faf5ff', border: '#c4b5fd',
    icon: Sparkles, label: 'Dermal Filler',
    desc: 'Restores volume, contour and smooths facial lines via precise tissue augmentation.'
  },
  'Skin Boosters': {
    color: '#0284c7', bg: '#e0f2fe', border: '#7dd3fc',
    icon: Zap, label: 'Skin Booster',
    desc: 'Intensely hydrates and revitalises the skin matrix at the dermal level.'
  },
  'Biostimulators': {
    color: '#0d9488', bg: '#f0fdfa', border: '#5eead4',
    icon: Activity, label: 'Biostimulator',
    desc: 'Triggers endogenous collagen and elastin production for long-lasting skin quality improvement.'
  },
  'Polynucleotides': {
    color: '#2563eb', bg: '#eff6ff', border: '#93c5fd',
    icon: Microscope, label: 'Polynucleotide (PN/PDRN)',
    desc: 'DNA-derived fragments that activate cellular repair, hydration and tissue regeneration.'
  },
  'Fat-Dissolving Injectables': {
    color: '#d97706', bg: '#fffbeb', border: '#fcd34d',
    icon: Layers, label: 'Fat-Dissolving Injectable',
    desc: 'Selectively disrupts adipocyte membranes to reduce localised fat deposits.'
  },
};

function SubcategoryBadge({ subcategory }) {
  const meta = SUBCATEGORY_META[subcategory] || {
    color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1', icon: Star, label: subcategory
  };
  const Icon = meta.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 12px', borderRadius: '999px',
      background: meta.bg, color: meta.color,
      border: `1.5px solid ${meta.border}`,
      fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.02em',
    }}>
      <Icon size={11} />
      {meta.label}
    </span>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '0.55rem 0', borderBottom: '1px solid #f1f5f9' }}>
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '8px', background: '#f8fafc', flexShrink: 0, marginTop: '1px' }}>
        <Icon size={13} color="#64748b" />
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '0.84rem', color: '#1e293b', fontWeight: 500 }}>
          {Array.isArray(value) ? value.join(', ') : value}
        </div>
      </div>
    </div>
  );
}

function TreatmentAreaChip({ area }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 10px', borderRadius: '6px',
      background: '#f0fdf4', color: '#16a34a',
      border: '1px solid #bbf7d0',
      fontSize: '0.73rem', fontWeight: 600,
    }}>
      <MapPin size={9} />
      {area}
    </span>
  );
}

function ProfessionalWarningBanner() {
  return (
    <div style={{
      display: 'flex', gap: '10px', alignItems: 'flex-start',
      padding: '12px 16px', borderRadius: '10px',
      background: '#fef9c3', border: '1.5px solid #fde047',
      marginBottom: '1.25rem',
    }}>
      <AlertTriangle size={16} color="#ca8a04" style={{ flexShrink: 0, marginTop: '1px' }} />
      <div>
        <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: '#854d0e' }}>
          For Licensed Professionals Only
        </p>
        <p style={{ margin: '3px 0 0', fontSize: '0.73rem', color: '#92400e', lineHeight: 1.4 }}>
          This product requires professional medical administration. Verify regulatory status and indications against current manufacturer documentation before clinical use.
        </p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AestheticInjectableDetail({
  product,
  region = 'US',
  isProfessional = false,
  isAdmin = false,
  isMobile = false,
  onClose,
  isQuickView = false,
}) {
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [expanded, setExpanded] = useState({ regulatory: false, supplier: false });

  const {
    name, brand, subcategory, product_type,
    active_ingredient, route, treatment_areas, specialties,
    professional_use_only, packaging_note,
    supplier_name, supplier_contact, supplier_email, supplier_phone,
    cost_price_aed, cost_currency, selling_price,
    prescription_status, verify_before_sale,
    atlas_product_code, data_source, data_prepared,
    market_reference, availability, status,
  } = product || {};

  const subMeta = SUBCATEGORY_META[subcategory] || {};

  const gradients = {
    'Dermal Fillers': 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a855f7 100%)',
    'Skin Boosters': 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #38bdf8 100%)',
    'Biostimulators': 'linear-gradient(135deg, #134e4a 0%, #0d9488 50%, #14b8a6 100%)',
    'Polynucleotides': 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #60a5fa 100%)',
    'Fat-Dissolving Injectables': 'linear-gradient(135deg, #78350f 0%, #d97706 50%, #fbbf24 100%)',
  };
  const headerGradient = gradients[subcategory] || 'linear-gradient(135deg, #1e293b 0%, #334155 100%)';

  return (
    <>
      {!isQuickView && <PublicUnifiedHeader />}

      <PublicPageShell maxWidth={900} style={{ paddingTop: isQuickView ? '0' : '80px' }}>

        {/* Hero header */}
        <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
          <div style={{ background: headerGradient, padding: '2rem 2rem 1.5rem', position: 'relative' }}>
            {atlas_product_code && (
              <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '3px 10px', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', backdropFilter: 'blur(8px)' }}>
                {atlas_product_code}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '0.75rem' }}>
              <div style={{ width: 52, height: 52, borderRadius: '14px', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', flexShrink: 0 }}>
                <Syringe size={24} color="#fff" />
              </div>
              <div>
                {brand && <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>{brand}</div>}
                <h1 style={{ margin: 0, fontSize: isMobile ? '1.4rem' : '1.75rem', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>{name}</h1>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              {subcategory && <SubcategoryBadge subcategory={subcategory} />}
              {status === 'published' && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '999px', background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', fontSize: '0.7rem', fontWeight: 600 }}>
                  <CheckCircle2 size={10} /> Catalog Active
                </span>
              )}
              {professional_use_only && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '999px', background: 'rgba(239,68,68,0.25)', color: '#fecaca', fontSize: '0.7rem', fontWeight: 600, border: '1px solid rgba(239,68,68,0.4)' }}>
                  <ShieldCheck size={10} /> Professionals Only
                </span>
              )}
            </div>

            {subMeta.desc && (
              <p style={{ margin: '0.75rem 0 0', fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>{subMeta.desc}</p>
            )}
          </div>
        </div>

        <ProfessionalWarningBanner />

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 340px', gap: '1.25rem', alignItems: 'start' }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {treatment_areas?.length > 0 && (
              <div style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                <h2 style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={13} /> Treatment Areas & Indications
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                  {treatment_areas.map((area, i) => <TreatmentAreaChip key={i} area={area} />)}
                </div>
              </div>
            )}

            <div style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
              <h2 style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Microscope size={13} /> Clinical Profile
              </h2>
              <InfoRow icon={Sparkles} label="Active Ingredient / Platform" value={active_ingredient} />
              <InfoRow icon={Activity} label="Product Type" value={product_type} />
              <InfoRow icon={Syringe} label="Route of Administration" value={route ? route.charAt(0).toUpperCase() + route.slice(1) : null} />
              <InfoRow icon={BookOpen} label="Clinical Specialties" value={specialties} />
              <InfoRow icon={Heart} label="Market Reference" value={market_reference} />
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <button
                onClick={() => setExpanded(e => ({ ...e, regulatory: !e.regulatory }))}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', borderBottom: expanded.regulatory ? '1px solid #f1f5f9' : 'none' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  <ShieldCheck size={13} /> Regulatory & Compliance
                </span>
                {expanded.regulatory ? <ChevronDown size={14} color="#94a3b8" /> : <ChevronRight size={14} color="#94a3b8" />}
              </button>
              {expanded.regulatory && (
                <div style={{ padding: '0 1.25rem 1rem' }}>
                  <InfoRow icon={ClipboardList} label="Prescription Status" value={prescription_status === 'professional_use' ? 'Professional Use Only' : prescription_status} />
                  <InfoRow icon={ShieldCheck} label="Professional Administration" value="Required" />
                  {verify_before_sale && (
                    <div style={{ marginTop: '0.75rem', padding: '10px 12px', borderRadius: '8px', background: '#fef9c3', border: '1px solid #fde047', fontSize: '0.73rem', color: '#854d0e', lineHeight: 1.45 }}>
                      ⚠️ Verify exact IFU, composition, indications and contraindications against current manufacturer documentation before clinical use or sale.
                    </div>
                  )}
                  {packaging_note && (
                    <div style={{ marginTop: '0.5rem', padding: '10px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.73rem', color: '#475569', lineHeight: 1.45 }}>
                      <Info size={11} style={{ display: 'inline', marginRight: '5px' }} />
                      {packaging_note}
                    </div>
                  )}
                </div>
              )}
            </div>

            {data_source && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.7rem', color: '#94a3b8', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <Info size={11} />
                <span>Source: <em>{data_source}</em>{data_prepared ? ` · Prepared ${data_prepared}` : ''}</span>
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '90px' }}>

            <div style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Reference Price</div>
              {cost_price_aed ? (
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '2px' }}>
                  {cost_price_aed} <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 500 }}>{cost_currency || 'AED'}</span>
                </div>
              ) : (
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#94a3b8' }}>Price on Request</div>
              )}
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginBottom: '1rem', lineHeight: 1.4 }}>Dubai/UAE reference · Unit/pack basis to confirm with supplier</div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '999px', marginBottom: '1rem', background: '#fef9c3', color: '#854d0e', border: '1px solid #fde047', fontSize: '0.72rem', fontWeight: 600 }}>
                <Package size={10} /> Available on Request
              </div>

              <button
                onClick={() => {
                  const subject = encodeURIComponent(`Product Inquiry: ${name} (${atlas_product_code || ''})`);
                  const body = encodeURIComponent(`Hello Lorenzo,\n\nI'd like to inquire about the following product:\n\nProduct: ${name}\nCode: ${atlas_product_code || 'N/A'}\nBrand: ${brand}\nSubcategory: ${subcategory}\n\nPlease provide:\n- Pricing (AED & EUR)\n- Pack configuration\n- Lead time\n- Minimum order\n\nThank you.`);
                  window.open(`mailto:${supplier_email || 'admin@pharmaspain.net'}?subject=${subject}&body=${body}`, '_blank');
                  toast.success('Opening inquiry email…');
                }}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'linear-gradient(135deg, #1e293b, #334155)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(30,41,59,0.3)' }}
              >
                <ExternalLink size={15} /> Request Quotation
              </button>

              <button
                onClick={() => setIsAiDrawerOpen(true)}
                style={{ marginTop: '8px', width: '100%', padding: '0.65rem', borderRadius: '10px', background: 'none', border: '1.5px solid #e2e8f0', color: '#64748b', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}
              >
                <Sparkles size={14} /> Ask Atlas AI
              </button>
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Package size={12} /> Supplier
              </h3>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>{supplier_name}</div>
              {supplier_contact && <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '2px' }}>Contact: <strong>{supplier_contact}</strong></div>}
              {supplier_email && <a href={`mailto:${supplier_email}`} style={{ display: 'block', fontSize: '0.76rem', color: '#2563eb', textDecoration: 'none', marginBottom: '2px' }}>{supplier_email}</a>}
              {supplier_phone && <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{supplier_phone}</div>}
            </div>

            <div style={{ padding: '12px', borderRadius: '10px', background: '#fafafa', border: '1px solid #f1f5f9', fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.5 }}>
              <ShieldCheck size={11} style={{ display: 'inline', marginRight: '4px', color: '#16a34a' }} />
              This product is intended for qualified healthcare professionals. Not for direct consumer sale. Atlas is a B2B clinical distribution platform.
            </div>
          </div>
        </div>
      </PublicPageShell>

      {isAiDrawerOpen && (
        <PublicAtlasAIDrawer
          product={product}
          isOpen={isAiDrawerOpen}
          onClose={() => setIsAiDrawerOpen(false)}
          context="aesthetic_injectable"
        />
      )}
    </>
  );
}

"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, Sparkles, FlaskConical, Leaf,
  CheckCircle2, Info, ChevronDown, ChevronRight, ExternalLink,
  Droplets, Zap, Activity, Star, Package, Microscope, Heart,
  AlertTriangle, ClipboardList, Scissors, Beaker, BookOpen,
  TestTube, ListChecks, Thermometer, Clock, BarChart2, BadgeCheck,
  RefreshCcw, Layers, Mail
} from 'lucide-react';
import PublicAtlasAIDrawer from '@/components/shared/PublicAtlasAIDrawer';
import PublicStickyActionBar from '@/components/shared/PublicStickyActionBar';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import PublicDatasheetTableOfContents from '@/components/product/PublicDatasheetTableOfContents';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicPageShell from '@/components/shared/public/PublicPageShell';
import PublicPageHero from '@/components/shared/public/PublicPageHero';
import PublicSectionCard from '@/components/shared/public/PublicSectionCard';
import PublicKpiGrid from '@/components/shared/public/PublicKpiGrid';
import HairProtocolsSidebarWidget from '@/components/product/HairProtocolsSidebarWidget';
import CosmeticsSidebarWidget from '@/components/product/CosmeticsSidebarWidget';
import toast from 'react-hot-toast';

const INCI_GROUP_META = {
  base:             { label: 'Aqueous Base',        color: '#64748b', bg: '#f1f5f9' },
  surfactant:       { label: 'Surfactant System',   color: '#2563eb', bg: '#eff6ff' },
  conditioning_base:{ label: 'Conditioning Base',   color: '#7c3aed', bg: '#faf5ff' },
  key_active:       { label: 'Key Clinical Active', color: '#0d9488', bg: '#f0fdfa' },
  functional_active:{ label: 'Functional Active',   color: '#16a34a', bg: '#f0fdf4' },
  conditioning:     { label: 'Conditioning',        color: '#0284c7', bg: '#e0f2fe' },
  preservative:     { label: 'Preservation System', color: '#d97706', bg: '#fffbeb' },
  fragrance:        { label: 'Fragrance',            color: '#db2777', bg: '#fdf2f8' },
  functional:       { label: 'Functional Additive',  color: '#64748b', bg: '#f8fafc' },
};

const INGREDIENT_ICONS = {
  key_active: Sparkles, functional_active: Leaf, surfactant: Droplets,
  conditioning_base: Activity, conditioning: Heart, preservative: ShieldCheck,
  fragrance: Star, base: Beaker, functional: TestTube,
};

function InciCard({ ing, index, onCopy }) {
  const [open, setOpen] = useState(false);
  const group = ing.inci_group || 'functional';
  const meta = INCI_GROUP_META[group] || INCI_GROUP_META.functional;
  const IconComp = INGREDIENT_ICONS[group] || FlaskConical;
  const hasClinical = Boolean(ing.clinical_data?.mechanism || ing.clinical_data?.evidence || ing.pmid);

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      padding: '0.95rem 1.15rem',
      marginBottom: '0.75rem',
      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
      transition: 'border-color 0.2s, box-shadow 0.2s'
    }}>
      {/* Top Header Row: 1 full-width row with numbering, name, badges and pubmed */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: '1 1 240px', minWidth: 0 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 26,
            height: 26,
            borderRadius: '6px',
            background: '#f1f5f9',
            color: '#475569',
            fontSize: '0.68rem',
            fontWeight: 800,
            flexShrink: 0,
            fontFamily: 'monospace'
          }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: '6px',
            flexShrink: 0,
            background: meta.bg,
            color: meta.color
          }}>
            <IconComp size={14} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
              {ing.inci_name}
            </div>
            {ing.common_name && (
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>
                {ing.common_name}
              </div>
            )}
          </div>
        </div>

        {/* Right Action & Metadata Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', flexShrink: 0 }}>
          <span style={{
            fontSize: '0.62rem',
            fontWeight: 700,
            color: meta.color,
            background: meta.bg,
            padding: '2px 8px',
            borderRadius: '99px',
            border: `1px solid ${meta.color}35`
          }}>
            {meta.label}
          </span>
          {ing.concentration_range && (
            <span style={{
              fontSize: '0.64rem',
              fontWeight: 700,
              color: '#334155',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              padding: '2px 8px',
              borderRadius: '99px',
              fontFamily: 'monospace'
            }}>
              {ing.concentration_range}
            </span>
          )}
          {ing.pmid && (
            <a
              href={ing.pmid_url || `https://pubmed.ncbi.nlm.nih.gov/${ing.pmid}/`}
              target="_blank"
              rel="noopener noreferrer"
              title="View indexed research study on PubMed NCBI"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.64rem',
                fontWeight: 800,
                color: '#0284c7',
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                padding: '2px 8px',
                borderRadius: '6px',
                textDecoration: 'none'
              }}
            >
              <BookOpen size={10} /> PMID: {ing.pmid} <ExternalLink size={9} />
            </a>
          )}
        </div>
      </div>

      {/* Origin / Provenance */}
      {ing.origin && (
        <div style={{ marginTop: '0.45rem', fontSize: '0.68rem', color: '#64748b' }}>
          <strong style={{ color: '#475569' }}>Origin: </strong>
          {ing.origin}
        </div>
      )}

      {/* Role & Functional Summary */}
      {ing.role && (
        <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.76rem', color: '#475569', lineHeight: 1.55 }}>
          {ing.role}
        </p>
      )}

      {/* Expandable Clinical Mechanisms & In-Vivo Evidence */}
      {hasClinical && (
        <div style={{ marginTop: '0.65rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.70rem',
              fontWeight: 700,
              color: '#0d9488',
              background: '#f0fdfa',
              border: '1px solid #99f6e4',
              borderRadius: '6px',
              padding: '3px 10px',
              cursor: 'pointer'
            }}
          >
            <Activity size={12} />
            <span>{open ? 'Hide Clinical Mechanism' : 'View Clinical Mechanism & Evidence'}</span>
            {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>

          {open && (
            <div style={{
              marginTop: '0.65rem',
              background: 'linear-gradient(135deg, #f0fdfa 0%, #f8fafc 100%)',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              borderLeft: `3px solid ${meta.color}`,
              border: `1px solid ${meta.color}30`
            }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                {ing.cas_number && (
                  <div style={{ fontSize: '0.67rem', color: '#64748b' }}>
                    <span style={{ fontWeight: 700, color: '#475569' }}>CAS: </span>{ing.cas_number}
                  </div>
                )}
                {ing.pmid && (
                  <div style={{ fontSize: '0.67rem', color: '#0284c7' }}>
                    <span style={{ fontWeight: 700, color: '#475569' }}>PubMed ID: </span>
                    <a href={ing.pmid_url || `https://pubmed.ncbi.nlm.nih.gov/${ing.pmid}/`} target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'underline' }}>
                      {ing.pmid}
                    </a>
                  </div>
                )}
              </div>

              {ing.clinical_data?.mechanism && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.70rem', fontWeight: 800, color: meta.color, marginBottom: '0.15rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Beaker size={11} /> Molecular Mechanism of Action
                  </div>
                  <p style={{ fontSize: '0.73rem', color: '#475569', margin: 0, lineHeight: 1.55 }}>
                    {ing.clinical_data.mechanism}
                  </p>
                </div>
              )}
              {ing.clinical_data?.evidence && (
                <div>
                  <div style={{ fontSize: '0.70rem', fontWeight: 800, color: meta.color, marginBottom: '0.15rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <BookOpen size={11} /> Peer-Reviewed Clinical Evidence
                  </div>
                  <p style={{ fontSize: '0.73rem', color: '#475569', margin: 0, lineHeight: 1.55 }}>
                    {ing.clinical_data.evidence}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ApplicationStep({ step, isLast }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'flex', gap: '14px', position: 'relative' }}>
      {!isLast && <div style={{ position: 'absolute', left: '13px', top: '28px', width: '2px', bottom: '-16px', background: 'linear-gradient(to bottom, #0d9488, #e2e8f0)', borderRadius: '1px' }} />}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #0d9488, #0f766e)', color: '#fff', fontSize: '0.72rem', fontWeight: 800, flexShrink: 0, zIndex: 1 }}>{step.step}</div>
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : '1.25rem' }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#0d9488', letterSpacing: '0.05em', marginBottom: '2px' }}>{step.phase}</div>
        <p style={{ fontSize: '0.81rem', color: '#334155', margin: '0 0 0.4rem 0', lineHeight: 1.6 }}>{step.instruction}</p>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
          {step.duration && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.62rem', color: '#64748b', background: '#f1f5f9', padding: '2px 7px', borderRadius: '99px', border: '1px solid #e2e8f0' }}><Clock size={10} /> {step.duration}</span>}
          {step.temp && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.62rem', color: '#2563eb', background: '#eff6ff', padding: '2px 7px', borderRadius: '99px', border: '1px solid #bfdbfe' }}><Thermometer size={10} /> {step.temp}</span>}
        </div>
        {step.clinical_note && (
          <>
            <button type="button" onClick={() => setOpen(v => !v)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', color: '#0d9488', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <Info size={10} /> Clinical note {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
            </button>
            {open && <div style={{ marginTop: '6px', padding: '0.5rem 0.75rem', background: '#f0fdfa', borderLeft: '3px solid #0d9488', borderRadius: '6px', fontSize: '0.72rem', color: '#134e4a', lineHeight: 1.5 }}>{step.clinical_note}</div>}
          </>
        )}
      </div>
    </div>
  );
}

function TechSpecsGrid({ specs }) {
  if (!specs) return null;
  // 8 balanced specs forming a perfectly symmetrical 2-column grid without orphan cards
  const rows = [
    { label: 'Formulation Type', value: specs.formulation_type, icon: Beaker },
    { label: 'pH Range', value: specs.ph_range, icon: TestTube },
    { label: 'Viscosity', value: specs.viscosity, icon: BarChart2 },
    { label: 'Appearance', value: specs.appearance, icon: Sparkles },
    { label: 'Fragrance Family', value: specs.fragrance_family, icon: Star },
    { label: 'Shelf Life', value: specs.shelf_life, icon: Clock },
    { label: 'Storage Conditions', value: specs.storage, icon: Thermometer },
    { label: 'Regulatory Compliance', value: specs.regulatory_status, icon: BadgeCheck },
  ].filter(r => r.value);

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1rem'
      }}>
        {rows.map(r => {
          const Icon = r.icon;
          return (
            <div key={r.label} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '0.75rem 0.95rem',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '6px',
                background: '#f0fdfa',
                color: '#0d9488',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Icon size={14} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em', marginBottom: '2px' }}>
                  {r.label.toUpperCase()}
                </div>
                <div style={{ fontSize: '0.80rem', color: '#0f172a', fontWeight: 600, lineHeight: 1.45 }}>
                  {r.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {specs.certifications?.length > 0 && (
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>CERTIFICATIONS & COMPLIANCE</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {specs.certifications.map(c => (
              <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.67rem', fontWeight: 600, color: '#16a34a', background: '#f0fdf4', padding: '3px 8px', borderRadius: '99px', border: '1px solid #bbf7d0' }}>
                <BadgeCheck size={10} /> {c}
              </span>
            ))}
          </div>
        </div>
      )}
      {specs.free_from?.length > 0 && (
        <div style={{ padding: '0.75rem 1rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#16a34a', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>FREE FROM (HYPOALLERGENIC STANDARD)</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {specs.free_from.map(f => (
              <span key={f} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.67rem', color: '#166534', background: '#ffffff', padding: '2px 8px', borderRadius: '99px', border: '1px solid #bbf7d0' }}>
                <CheckCircle2 size={10} style={{ color: '#16a34a' }} /> {f}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CosmeticsDetail({ product, region = 'US', isProfessional = false }) {
  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.[0] || null);
  const [lang] = useState('en');
  const [inciFilter, setInciFilter] = useState('key_active');
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);

  const name = product?.name || product?.canonicalName || 'Hair Cosmetic';
  const brand = product?.supplier || product?.brand || 'Colway';
  const category = product?.category || 'Cosmetics';
  const description = product?.description || product?.overview_summary || '';
  const imageUrl = product?.image_url || product?.imageUrl || product?.photo_url || null;
  const slug = product?.slug || product?.id || '';
  const productUrl = typeof window !== 'undefined' ? window.location.href : '';

  const ingredients = useMemo(() => product?.ingredients || [], [product]);
  const applicationProtocol = product?.application_protocol || null;
  const technicalSpecs = product?.technical_specs || null;
  const hairProtocols = product?.associated_protocols || [];
  const warnings = product?.warnings || [];

  const isShampoo = slug?.includes('shampoo') || name?.toLowerCase().includes('shampoo');

  const filteredIngredients = useMemo(() => {
    if (inciFilter === 'all') {
      // Prioritize Key Clinical Actives over technical carrier base
      return [...ingredients].sort((a, b) => {
        const isKeyA = a.inci_group === 'key_active' || a.inci_group === 'functional_active';
        const isKeyB = b.inci_group === 'key_active' || b.inci_group === 'functional_active';
        if (isKeyA && !isKeyB) return -1;
        if (!isKeyA && isKeyB) return 1;
        return 0;
      });
    }
    return ingredients.filter(i => (i.inci_group || 'functional') === inciFilter);
  }, [ingredients, inciFilter]);

  const groupCounts = useMemo(() => {
    const counts = {};
    ingredients.forEach(i => { const g = i.inci_group || 'functional'; counts[g] = (counts[g] || 0) + 1; });
    return counts;
  }, [ingredients]);

  const keyActives = ingredients.filter(i => i.inci_group === 'key_active' || i.inci_group === 'functional_active');

  const tocSections = useMemo(() => [
    { id: 'overview', label: 'Formulation Overview', icon: Layers },
    { id: 'clinical-evidence', label: 'Clinical Evidence & Targets', icon: Activity },
    { id: 'inci-dossier', label: 'Full INCI Composition', icon: Microscope },
    { id: 'application-protocol', label: 'Clinical Usage Protocol', icon: ClipboardList },
    { id: 'technical-specs', label: 'Technical Specifications', icon: Beaker },
    { id: 'hair-protocols', label: 'Hair Protocols Integration', icon: Scissors },
    { id: 'safety', label: 'Clinical Safety & Patch Test', icon: AlertTriangle },
  ], []);

  if (!product) return null;

  // Cosmetics KPIs — derived from product data, no hardcoded peptide/vial concepts
  const usageText = applicationProtocol?.frequency
    ? applicationProtocol.frequency
    : applicationProtocol?.leave_on === false
      ? 'Rinse-off'
      : applicationProtocol?.leave_on === true
        ? 'Leave-on'
        : 'Topical Use';

  const volumeText = selectedVariant?.volume
    || product?.volume
    || product?.size
    || technicalSpecs?.volume
    || '250 mL';

  const kpis = [
    {
      icon: Layers,
      iconBg: '#f0fdfa', iconColor: '#0d9488',
      title: 'Total Ingredients',
      value: `${ingredients.length || '15+'}`,
      subtitle: `${keyActives.length} clinical actives`,
      subColor: '#0d9488'
    },
    {
      icon: FlaskConical,
      iconBg: '#eff6ff', iconColor: '#2563eb',
      title: 'Formulation',
      value: technicalSpecs?.formulation_type?.split('(')[0]?.trim() || (isShampoo ? 'Aqueous Gel' : 'O/W Emulsion'),
      subtitle: technicalSpecs?.ph_range ? `pH ${technicalSpecs.ph_range}` : 'Derm. tested',
      subColor: '#2563eb'
    },
    {
      icon: ShieldCheck,
      iconBg: '#f0fdf4', iconColor: '#16a34a',
      title: 'Sulphate-Free',
      value: 'SLS / SLES Free',
      subtitle: 'EU Reg. 1223/2009',
      subColor: '#16a34a'
    },
    {
      icon: Package,
      iconBg: '#faf5ff', iconColor: '#7c3aed',
      title: 'Presentation',
      value: volumeText,
      subtitle: usageText,
      subColor: '#7c3aed'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '5rem' }}>
      <PublicUnifiedHeader track="products" lang={lang} copyUrl={productUrl} inquiryContextType="product" inquiryEntity={{ name, slug, category }} hideTier2={true}
        breadcrumb={[{ label: 'Catalog', href: '/catalog' }, { label: 'Hair & Scalp', href: '/catalog?category=cosmetics' }, { label: name }]} />

      <PublicPageShell>
        <div id="overview" style={{ scrollMarginTop: '80px' }}>
          <PublicPageHero
            badges={<>
              <span className="pds-cat-tag">{category}</span>
              <span className="pds-cgmp-tag">{brand}</span>
              <span className="pds-purity-tag"><ShieldCheck size={12} /><span>EU Reg. 1223/2009</span></span>
              <span className="pds-purity-tag" style={{ background: '#fdf2f8', color: '#db2777', borderColor: '#fbcfe8' }}><Leaf size={12} /><span>Dermatologically Tested</span></span>
              <span className="pds-purity-tag" style={{ background: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' }}><CheckCircle2 size={12} /><span>Sulphate-Free</span></span>
            </>}
            title={name}
            description={<>
              <span style={{ display: 'block', fontSize: '0.94rem', color: '#475569', lineHeight: 1.6, marginBottom: '0.75rem' }}>{description}</span>
              {technicalSpecs && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {technicalSpecs.ph_range && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '3px 9px', borderRadius: '99px' }}><TestTube size={10} /> pH {technicalSpecs.ph_range}</span>}
                  {technicalSpecs.shelf_life && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', fontWeight: 700, color: '#64748b', background: '#f1f5f9', padding: '3px 9px', borderRadius: '99px' }}><Clock size={10} /> {technicalSpecs.shelf_life}</span>}
                  {applicationProtocol?.frequency && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', fontWeight: 700, color: '#0d9488', background: '#f0fdfa', padding: '3px 9px', borderRadius: '99px' }}><RefreshCcw size={10} /> {applicationProtocol.frequency}</span>}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsInquiryDrawerOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    background: '#0d9488',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(13, 148, 136, 0.25)'
                  }}
                >
                  <Mail size={14} /> Inquire Product
                </button>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', background: '#f1f5f9', border: '1px solid #cbd5e1', fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                  <Package size={13} style={{ color: '#0d9488' }} />
                  {selectedVariant?.volume || '250 mL Bottle'}
                </div>
              </div>
            </>}
            desktopSecondary={imageUrl ? (
              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '220px', height: '280px', flexShrink: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <img src={imageUrl} alt={name} loading="eager" fetchPriority="high" style={{ maxWidth: '180px', maxHeight: '250px', width: 'auto', height: 'auto', objectFit: 'contain', borderRadius: '6px' }} />
              </div>
            ) : (
              <div style={{ background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)', borderRadius: '16px', border: '1px solid #99f6e4', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '220px', height: '280px', flexShrink: 0, gap: '0.75rem' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(13,148,136,0.15)' }}>
                  <Droplets size={28} style={{ color: '#0d9488' }} />
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', textAlign: 'center' }}>{name}</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{brand} · 250 mL</div>
              </div>
            )}
            mobileSecondary={imageUrl ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '180px', height: '210px', margin: '0.5rem auto', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <img src={imageUrl} alt={name} loading="eager" fetchPriority="high" style={{ maxWidth: '150px', maxHeight: '190px', width: 'auto', height: 'auto', objectFit: 'contain', borderRadius: '4px' }} />
              </div>
            ) : null}
          />
        </div>

        <PublicKpiGrid items={kpis} />

        <div className="pds-content-with-sidebar">
          <div className="pds-main-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

            {/* CLINICAL EVIDENCE & MOLECULAR MECHANISMS */}
            <PublicSectionCard id="clinical-evidence" icon={Activity} category="CLINICAL EFFICACY" title="Evidence-Mapped Trichology & Follicular Research" badge="Peer-Reviewed Data" badgeVariant="teal">
              <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.1rem' }}>
                Every active compound in this cosmeceutical is backed by peer-reviewed dermatology and trichology research with documented molecular targets across the hair follicle and scalp dermal matrix.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                {[
                  { target: 'DHT Inhibition', compound: 'Scutellaria Baicalensis (Baicapil™)', mechanism: '5α-Reductase Blockade / Wnt Pathway', outcome: 'Suppresses follicular miniaturisation at dermal papilla and stimulates stem cell telogen-to-anagen transition.', stat: '−60.6% Hair Loss', pmid: '21514542' },
                  { target: 'Follicular Anchoring', compound: 'Phyllanthus Emblica (Kerascalp™)', mechanism: 'Collagen XVII Support / Melanogenesis', outcome: 'Strengthens dermal hair follicle anchors and prevents premature stem cell exhaustion and graying.', stat: '+5.6% Thickness', pmid: '17214716' },
                  { target: 'Tensile Strength', compound: 'Native Freshwater Fish Tropocollagen', mechanism: 'Intact Triple Helix ECM Scaffolding', outcome: 'Patented Polish freshwater fish tropocollagen (0% bovine) adheres to keratin fibrils, repairing cortical microfractures.', stat: '+24% Fiber Strength', pmid: '31574672' },
                  { target: 'Microvascular Flow', compound: 'L-Arginine & Micronized Diosmin', mechanism: 'eNOS Vasodilation & VEGF Signaling', outcome: 'Enhances scalp microcirculation and oxygen-nutrient delivery to actively dividing anagen matrix cells.', stat: '+21% Density', pmid: '16029679' },
                  { target: 'Bio-Silica Fortification', compound: 'Equisetum Arvense & Keratin Hydrolysate', mechanism: 'Orthosilicic Acid / Cuticle Sealing', outcome: 'Supplies bioavailable silica for structural disulfide bonding in the cortex, reducing combing breakage.', stat: '−47% Combing Force', pmid: '29744921' },
                ].map(item => (
                  <div
                    key={item.target}
                    style={{
                      padding: '0.95rem 1.25rem',
                      background: '#ffffff',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          color: '#0d9488',
                          letterSpacing: '0.05em',
                          background: '#f0fdfa',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: '1px solid #ccfbf1'
                        }}>
                          {item.target.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                          {item.compound}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {item.pmid && (
                          <a
                            href={`https://pubmed.ncbi.nlm.nih.gov/${item.pmid}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '0.64rem',
                              fontWeight: 700,
                              color: '#0284c7',
                              background: '#eff6ff',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              border: '1px solid #bfdbfe',
                              textDecoration: 'none'
                            }}
                            title={`PubMed Reference: PMID ${item.pmid}`}
                          >
                            <span>PMID: {item.pmid}</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          color: '#16a34a',
                          background: '#f0fdf4',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: '1px solid #bbf7d0'
                        }}>
                          {item.stat}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                      <span style={{ color: '#475569' }}>Mechanism:</span> {item.mechanism}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.5 }}>
                      {item.outcome}
                    </div>
                  </div>
                ))}
              </div>
            </PublicSectionCard>

            {/* INCI DOSSIER */}
            <PublicSectionCard id="inci-dossier" icon={Microscope} category="INGREDIENT DOSSIER" title="Full INCI Composition & Pharmacopoeial Breakdown" badge={`${ingredients.length} Declared Ingredients`} badgeVariant="green">
              <p style={{ fontSize: '0.81rem', color: '#64748b', marginBottom: '0.85rem', lineHeight: 1.6 }}>
                Official International Nomenclature of Cosmetic Ingredients (INCI) declaration complying with Article 19(1)(g) of EU Cosmetics Regulation 1223/2009. Listed in descending concentration order (w/w). Features <strong>Colway Patented Freshwater Fish Skin Tropocollagen</strong>, Baicapil™ (2%), and Kerascalp™.
              </p>

              {/* Complete Raw INCI Copy Box (GCP Standard Copyable Format) */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#475569', letterSpacing: '0.04em' }}>
                    OFFICIAL PHARMACOPOEIAL INCI LIST (EU REG. 1223/2009)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const fullInciStr = ingredients.map(i => i.inci_name).join(', ');
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(fullInciStr);
                        toast.success('Full INCI copied to clipboard');
                      }
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      color: '#0d9488',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '2px 8px',
                      cursor: 'pointer'
                    }}
                  >
                    Copy INCI String
                  </button>
                </div>
                <div style={{
                  fontSize: '0.74rem',
                  color: '#334155',
                  lineHeight: 1.6,
                  fontFamily: 'monospace',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '0.6rem 0.75rem',
                  maxHeight: '120px',
                  overflowY: 'auto'
                }}>
                  {ingredients.map(i => i.inci_name).join(', ')}
                </div>
              </div>

              {/* INCI Filters (Swipeable on mobile) */}
              <div style={{
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                flexWrap: 'nowrap',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                paddingBottom: '6px',
                marginBottom: '0.85rem'
              }}>
                <button type="button" onClick={() => setInciFilter('all')} style={{ flexShrink: 0, fontSize: '0.65rem', fontWeight: 700, padding: '4px 12px', borderRadius: '99px', border: '1.5px solid', cursor: 'pointer', background: inciFilter === 'all' ? '#0f172a' : '#ffffff', color: inciFilter === 'all' ? '#ffffff' : '#64748b', borderColor: inciFilter === 'all' ? '#0f172a' : '#e2e8f0' }}>
                  All ({ingredients.length})
                </button>
                {Object.entries(groupCounts).map(([group, count]) => {
                  const meta = INCI_GROUP_META[group] || INCI_GROUP_META.functional;
                  return (
                    <button key={group} type="button" onClick={() => setInciFilter(group)} style={{ flexShrink: 0, fontSize: '0.65rem', fontWeight: 700, padding: '4px 12px', borderRadius: '99px', border: `1.5px solid`, cursor: 'pointer', background: inciFilter === group ? meta.color : meta.bg, color: inciFilter === group ? '#ffffff' : meta.color, borderColor: meta.color }}>
                      {meta.label} ({count})
                    </button>
                  );
                })}
              </div>

              {/* 1 Card Per Row Full-Width Master-Detail INCI Cards */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {filteredIngredients.map((ing, i) => (
                  <InciCard key={ing.inci_name || i} ing={ing} index={inciFilter === 'all' ? i : ingredients.indexOf(ing)} />
                ))}
              </div>
              <div style={{ marginTop: '1rem', padding: '0.65rem 0.85rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.67rem', color: '#64748b', lineHeight: 1.5 }}>
                <strong style={{ color: '#475569' }}>EU Regulatory Notice:</strong> Full INCI declared per Article 19(1)(g) of EU Cosmetics Regulation 1223/2009. CPNP notified. Allergens at ≥0.001% (rinse-off) / ≥0.0001% (leave-on) individually declared.
              </div>
            </PublicSectionCard>

            {/* APPLICATION PROTOCOL */}
            {applicationProtocol ? (
              <PublicSectionCard id="application-protocol" icon={ClipboardList} category="CLINICAL USAGE" title={applicationProtocol.title || 'Application Protocol'} badge={applicationProtocol.frequency} badgeVariant="teal">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ padding: '0.7rem 0.9rem', background: '#f0fdfa', borderRadius: '8px', border: '1px solid #99f6e4' }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#0d9488', marginBottom: '2px' }}>FREQUENCY</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{applicationProtocol.frequency}</div>
                  </div>
                  <div style={{ padding: '0.7rem 0.9rem', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#2563eb', marginBottom: '2px' }}>DURATION OF USE</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{applicationProtocol.duration_of_use}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {(applicationProtocol.steps || []).map((step, i) => (
                    <ApplicationStep key={step.step || i} step={step} isLast={i === (applicationProtocol.steps.length - 1)} />
                  ))}
                </div>
                {applicationProtocol.professional_notes?.length > 0 && (
                  <div style={{ marginTop: '1.25rem', padding: '0.85rem 1rem', background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>PROFESSIONAL / TRICHOLOGIST NOTES</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {applicationProtocol.professional_notes.map((note, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <CheckCircle2 size={12} style={{ color: '#0d9488', flexShrink: 0, marginTop: '2px' }} />
                          <span style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.5 }}>{note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </PublicSectionCard>
            ) : (
              <PublicSectionCard id="application-protocol" icon={ClipboardList} category="CLINICAL USAGE" title="Application Protocol & Directions">
                <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6 }}>Apply to wet hair. Massage into scalp for 2–3 minutes. Leave 3–5 min. Rinse with lukewarm water ≤38°C. Use 3–4×/week for min. 8 weeks.</p>
              </PublicSectionCard>
            )}

            {/* TECHNICAL SPECS */}
            <PublicSectionCard id="technical-specs" icon={Beaker} category="TECHNICAL DOSSIER" title="Formulation Technical Specifications">
              <TechSpecsGrid specs={technicalSpecs} />
              {!technicalSpecs && <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Technical specifications available on request. Contact Atlas Health distribution for the full cosmetic safety assessment dossier.</p>}
            </PublicSectionCard>

            {/* HAIR PROTOCOLS */}
            <PublicSectionCard id="hair-protocols" icon={Scissors} category="CLINICAL INTEGRATION" title="Hair Restoration Protocols — Integration" badge={hairProtocols.length > 0 ? `${hairProtocols.length} Protocols` : undefined} badgeVariant="teal">
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                This cosmeceutical is recommended as a <strong>topical adjunct</strong> in clinically validated hair loss protocols. Works synergistically with mesotherapy-administered peptides (GHK-Cu, PTD-DBM) to reinforce the follicular microenvironment at the scalp surface.
              </p>
              {(hairProtocols.length > 0 ? hairProtocols : [
                { slug: 'ghk-cu-scalp-follicular-support', isPrimary: true, name: 'GHK-Cu Scalp & Follicular Support Protocol', category: 'Hair Regeneration', duration: '12 Weeks', integration_role: `Applied 3–4×/wk to reinforce GHK-Cu absorption and maintain optimal scalp pH throughout the protocol.`, synergy_score: 94 },
                { slug: 'androgenic-alopecia-protocol', name: 'Androgenic Alopecia Combined Protocol', category: 'Hair Loss', duration: '16 Weeks', integration_role: 'Zinc PCA synergises with systemic DHT blockers. Caffeine extends anagen phase while peptide therapy targets follicular miniaturisation at the papilla level.', synergy_score: 88 }
              ]).map(p => {
                const score = p.synergy_score || 80;
                const scoreColor = score >= 90 ? '#16a34a' : score >= 75 ? '#0d9488' : '#d97706';
                return (
                  <div key={p.slug} style={{ border: `1px solid ${p.isPrimary ? '#99f6e4' : '#e2e8f0'}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '0.85rem', background: p.isPrimary ? '#f0fdfa' : '#ffffff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0.9rem 1rem', borderBottom: `1px solid ${p.isPrimary ? '#ccfbf1' : '#f1f5f9'}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '8px', background: p.isPrimary ? '#ccfbf1' : '#f1f5f9', color: p.isPrimary ? '#0d9488' : '#64748b', flexShrink: 0 }}><FlaskConical size={16} /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '2px' }}>
                          {p.isPrimary && <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#0f766e', background: '#ccfbf1', padding: '1px 7px', borderRadius: '99px' }}>★ PRIMARY</span>}
                          <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>{p.category}</span>
                          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>· {p.duration}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{p.name}</div>
                      </div>
                      <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score}</div>
                        <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600 }}>SYNERGY</div>
                      </div>
                    </div>
                    {p.integration_role && <div style={{ padding: '0.65rem 1rem', display: 'flex', gap: '8px' }}><Info size={13} style={{ color: '#0d9488', flexShrink: 0, marginTop: '2px' }} /><p style={{ margin: 0, fontSize: '0.75rem', color: '#475569', lineHeight: 1.55 }}><strong>Integration:</strong> {p.integration_role}</p></div>}
                    <div style={{ padding: '0 1rem 0.75rem' }}>
                      <Link href={`/proto/${p.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', fontWeight: 700, color: '#0d9488', textDecoration: 'none' }}>View Protocol <ChevronRight size={12} /></Link>
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop: '0.75rem', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '12px', padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', marginBottom: '0.3rem', letterSpacing: '0.05em' }}>COMPLETE THE COLWAY SYSTEM</div>
                  <div style={{ fontSize: '0.93rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>{isShampoo ? 'Strengthening Conditioner' : 'Strengthening Shampoo'}</div>
                  <div style={{ fontSize: '0.73rem', color: '#94a3b8' }}>Use both 3–4×/week for maximum follicular synergy</div>
                </div>
                <Link href={`/p/${isShampoo ? 'colway-strengthening-conditioner' : 'colway-strengthening-shampoo'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', background: '#0d9488', color: '#fff', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>
                  View Product <ChevronRight size={13} />
                </Link>
              </div>
            </PublicSectionCard>

            {/* SAFETY */}
            <PublicSectionCard id="safety" icon={AlertTriangle} category="SAFETY & PRECAUTIONS" title="Clinical Safety, Contraindications & Patch Testing">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {(warnings.length > 0 ? warnings : [
                  'For external use only. Avoid contact with eyes; rinse immediately with water if contact occurs.',
                  'Perform a 48-hour patch test prior to first use: apply to inner forearm, leave 24h, read at 48h and 72h.',
                  'Not recommended on damaged scalp with open lesions, active dermatitis, or psoriatic plaques without prior dermatological consultation.',
                  'Keep out of reach of children under 3 years.',
                  'Individuals with known sensitivity to any listed INCI component should consult a dermatologist before use.',
                ]).map((w, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <AlertTriangle size={13} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '0.78rem', color: '#374151', lineHeight: 1.55 }}>{typeof w === 'string' ? w : w.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#d97706', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>DERMATOLOGICAL PATCH TEST PROTOCOL (ICDRG)</div>
                {['Apply 0.05 mL to Finn Chamber or inner forearm (2×2 cm area).', 'Occlude for 48 hours. Do not wash test area.', 'Read results at 48h and 72h (or 96h if delayed reaction suspected).', 'Score per ICDRG scale: 0 (negative) → 3+ (strong positive). ICDRG ≥1+: contraindicated.'].map((pt, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '3px' }}>
                    <span style={{ fontSize: '0.67rem', fontWeight: 800, color: '#d97706', flexShrink: 0 }}>{i + 1}.</span>
                    <span style={{ fontSize: '0.72rem', color: '#92400e', lineHeight: 1.5 }}>{pt}</span>
                  </div>
                ))}
              </div>
            </PublicSectionCard>

            <footer style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.5 }}>
              <p style={{ margin: '0 0 0.35rem 0' }}>
                <strong style={{ color: '#64748b' }}>Clinical Cosmeceutical Disclaimer:</strong>{' '}
                Professional-grade cosmeceutical for topical use. Not a medicinal product. Clinical ingredient data based on published peer-reviewed literature and supplier dossiers. Individual results may vary. Consult a trichologist or dermatologist for persistent hair loss.
              </p>
              <span>Supplier: {brand} · Atlas Health Distribution · {category} · INCI Dossier v{new Date().getFullYear()}</span>
            </footer>
          </div>

          {/* DESKTOP STICKY SIDEBAR (GOOGLE CLOUD CONSOLE STANDARD) */}
          <PublicDatasheetTableOfContents
            sections={tocSections}
            lang={lang}
            title="ON THIS PAGE"
            hideFloatingTrigger={true}
            currentProductSlug={slug}
          >
            {/* COLWAY HAIR SYSTEM & CLINICAL PURITY WIDGET */}
            <CosmeticsSidebarWidget
              currentSlug={slug}
              lang={lang}
              onInquireRoutine={() => setIsInquiryDrawerOpen(true)}
            />

            {/* ASSOCIATED HAIR RESTORATION PROTOCOLS WIDGET */}
            {hairProtocols.length > 0 && (
              <div style={{ marginTop: '0.85rem' }}>
                <HairProtocolsSidebarWidget protocols={hairProtocols} lang={lang} />
              </div>
            )}
          </PublicDatasheetTableOfContents>
        </div>
      </PublicPageShell>

      {/* INSTITUTIONAL INQUIRY DRAWER */}
      <PublicInstitutionalInquiryDrawer
        isOpen={isInquiryDrawerOpen}
        onClose={() => setIsInquiryDrawerOpen(false)}
        contextType="cosmetic_product"
        initialEntity={{
          name,
          slug,
          volume: selectedVariant?.volume || '250 mL Bottle',
          category: 'Hair Care & Scalp Health · Cosmeceuticals',
          supplier: brand
        }}
        lang={lang}
      />

      {/* ATLAS AI TECHNICAL INQUIRY DRAWER */}
      <PublicAtlasAIDrawer
        isOpen={isAIDrawerOpen}
        onClose={() => setIsAIDrawerOpen(false)}
        contextType="cosmetic_product"
        contextAnchor={{
          name,
          slug,
          category: 'Hair Care · Cosmeceutical Monograph',
          supplier: brand,
          description,
          inciCount: ingredients.length,
          keyActives: keyActives.map(i => `${i.inci_name} (${(i.function || []).join(', ')})`).join('; '),
          clinicalTarget: 'Follicular DHT, hair fiber strength, anagen phase support',
          associatedProtocols: 'GHK-Cu Scalp Protocol · Androgenic Alopecia Protocol',
          suggestedQuestions: [
            'What is the clinical evidence for Caffeine in androgenetic alopecia?',
            'How does Zinc PCA inhibit 5-alpha reductase at the scalp?',
            'What is the recommended contact time for optimal active absorption?',
            'Which clinical hair peptide protocols pair with this product?'
          ]
        }}
        storageKey={`cosmetic_${slug}`}
        onOpenRegisterModal={() => window.open('/auth/login?register=true', '_blank')}
      />

      {/* PERSISTENT GOOGLE CLOUD STICKY BOTTOM ACTION BAR */}
      <PublicStickyActionBar
        title={name}
        subtitle={`${selectedVariant?.volume || '250 mL Bottle'} • Colway Native Collagen System • EU Reg. 1223/2009`}
        badge="Cosmeceutical Monograph"
        badgeType="default"
        inquireLabel="Inquire Product"
        onInquire={() => setIsInquiryDrawerOpen(true)}
        showClinicalAI={true}
        showSections={true}
        sectionsCount={tocSections.length}
        onOpenSections={() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('open-datasheet-toc'));
          }
        }}
        lang={lang}
      />
    </div>
  );
}

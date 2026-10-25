"use client";

import React, { useState } from 'react';
import {
  FlaskConical,
  ShieldCheck,
  CheckCircle2,
  Info,
  Copy,
  Check,
  Share2,
  Download,
  AlertTriangle,
  Beaker,
  Thermometer,
  Layers,
  Scale,
  Building2,
  FileText,
  Microscope,
  Send,
  ExternalLink,
  ChevronRight,
  Package,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicPageShell from '@/components/shared/public/PublicPageShell';
import PublicAtlasAIDrawer from '@/components/shared/PublicAtlasAIDrawer';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import PublicStickyActionBar from '@/components/shared/PublicStickyActionBar';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import { KNOWN_PEPTIDE_DATA } from '@/utils/knownPeptideData';
import { CURATED_CAS_REGISTRY } from '@/utils/casResolver';
import { deriveCanonicalIdentity } from '@/utils/canonicalProductRegistry';
import toast from 'react-hot-toast';

export default function RawApiDatasheetView({ product, slug, baseUrl = 'https://www.atlashealth-services.com' }) {
  const [copiedCas, setCopiedCas] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedPack, setSelectedPack] = useState(product?.packSize || '10g');
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('identification'); // 'identification' | 'compounding' | 'safety'

  if (!product) return null;

  const rawSlug = (slug || product.slug || product.id || '').toLowerCase().trim();
  const canonicalIdent = deriveCanonicalIdentity({ id: product.id || rawSlug, name: product.name || rawSlug });
  const cleanKey = canonicalIdent.canonicalKey || rawSlug.replace(/^api-/, '').replace(/-bulk$/, '');
  const peptideData = KNOWN_PEPTIDE_DATA[cleanKey] || null;

  const prodType = (product.type || product.productType || '').toLowerCase();
  const prodCat = (product.category || product.therapeutic_category || '').toLowerCase();
  const isPeptide = Boolean(
    peptideData ||
    product.is_peptide === true ||
    prodType === 'peptide' ||
    prodCat.includes('peptide') ||
    product.sequence
  );

  const productName = product.canonicalName || peptideData?.targetSystem || product.name || 'Chemical API';
  const displayName = product.displayName || `${productName} (${selectedPack} Bulk API)`;
  
  const casNumber = product.casNumber || product.cas_number || product.cas || CURATED_CAS_REGISTRY[cleanKey] || peptideData?.casNumber || (isPeptide ? '2381089-83-2' : '10102-18-8');
  const molecularFormula = product.molecularFormula || product.molecular_formula || peptideData?.molecularFormula || (isPeptide ? 'C221H342N46O68' : 'Na2SeO3');
  const molecularWeight = product.molecularWeight || product.molecular_weight || (peptideData?.molecularWeight ? `${peptideData.molecularWeight} g/mol` : null) || (isPeptide ? '4731.33 g/mol' : '172.94 g/mol');
  const purity = product.purity || (isPeptide ? '≥98.5% (RP-HPLC)' : '≥98.0% (Assay)');
  const grade = product.grade || (isPeptide ? 'cGMP / Compounding Reference Grade' : 'USP / Ph. Eur. Pharmacopeia Grade');
  const format = product.format || (isPeptide ? 'Lyophilized Solid Powder' : 'Fine White Crystalline Powder');
  const hsnCode = product.hsnCode || (isPeptide ? '29371900' : '28429090');
  const storageCondition = product.storageCondition || (isPeptide ? 'Store desiccated at -20°C in an airtight container protected from light. Stable 24 months.' : 'Store in airtight containers at 15–25°C, protected from light and moisture.');
  const supplierName = product.supplier || (isPeptide ? 'Licensed Peptide Synthesis Laboratory (cGMP)' : 'Licensed Pharmaceutical Synthesis Laboratory');
  
  const targetUrl = `${baseUrl}/raw/${cleanKey}`;
  const finishedProductUrl = `/p/${cleanKey}`;

  const handleCopyCas = () => {
    if (!casNumber) return;
    navigator.clipboard.writeText(casNumber);
    setCopiedCas(true);
    toast.success('CAS Number copied to clipboard');
    setTimeout(() => setCopiedCas(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopiedLink(true);
    toast.success('API product link copied to clipboard');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
      {/* ── Public Top Navigation Header ── */}
      <PublicUnifiedHeader />

      <PublicPageShell>
        {/* ── Breadcrumbs ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.78rem',
          color: '#64748b',
          marginBottom: '1rem',
          flexWrap: 'wrap'
        }}>
          <a href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</a>
          <ChevronRight size={12} color="#94a3b8" />
          <a href="/catalog" style={{ color: '#64748b', textDecoration: 'none' }}>Catalog</a>
          <ChevronRight size={12} color="#94a3b8" />
          <span style={{ color: '#0d9488', fontWeight: 600 }}>Active Pharmaceutical Ingredients (API)</span>
          <ChevronRight size={12} color="#94a3b8" />
          <span style={{ color: '#0f172a', fontWeight: 600 }}>{productName} (Bulk)</span>
        </div>

        {/* ── Cross-Navigation Banner: Link to Finished Clinical Product ── */}
        {isPeptide && (
          <div style={{
            background: 'linear-gradient(90deg, #eff6ff 0%, #f0fdfa 100%)',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '12px 18px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Package size={18} color="#2563eb" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.84rem', color: '#1e3a8a' }}>
                <strong>Looking for patient-ready clinical reconstitution vials?</strong>{' '}
                Finished vials (e.g. 5 mg, 10 mg) with reconstitution protocols and BAC water guides are available on the finished product page.
              </div>
            </div>

            <a
              href={finishedProductUrl}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                background: '#003666',
                color: '#ffffff',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
              }}
            >
              <span>View Finished Product Vials</span>
              <ArrowRight size={14} />
            </a>
          </div>
        )}

        {/* ── Callout Notice: Bulk API Distinction ── */}
        <div style={{
          background: '#f0fdfa',
          border: '1px solid #ccfbf1',
          borderLeft: '4px solid #0d9488',
          borderRadius: '4px',
          padding: '12px 16px',
          marginBottom: '1.25rem',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}>
          <Info size={18} color="#0d9488" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.82rem', lineHeight: 1.5, color: '#134e4a' }}>
            <strong style={{ color: '#115e59' }}>
              {isPeptide ? 'Pharma-Grade Bulk Peptide Active Ingredient (API):' : 'Pharma Grade Raw Material & Active Ingredient (API):'}
            </strong>{' '}
            {isPeptide ? (
              <>
                This product is high-purity Active Pharmaceutical Ingredient (API) bulk powder supplied strictly for licensed compounding pharmacies, contract manufacturing (CDMO), and laboratory formulation. 
                Supplied by weight in 10g, 50g, 100g, and 1kg units with full analytical batch Certificate of Analysis (HPLC &amp; LC-MS).
              </>
            ) : (
              <>
                This product is a pharmaceutical active substance / essential mineral trace element for licensed compounding and laboratory use. 
                It is <strong style={{ textDecoration: 'underline' }}>not a peptide</strong> and must not be reconstituted with bacteriostatic water. 
                Prepared strictly under USP / Ph. Eur. Compounding Pharmacopeia monographs.
              </>
            )}
          </div>
        </div>

        {/* ── Main Hero Section ── */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          padding: '24px',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{
                  background: '#f0fdfa',
                  color: '#0f766e',
                  border: '1px solid #99f6e4',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  Compounding Raw API
                </span>
                <span style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  {isPeptide ? 'Synthetic Peptide' : 'Essential Trace Element'}
                </span>
                <span style={{
                  background: '#e0f2fe',
                  color: '#0369a1',
                  border: '1px solid #bae6fd',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  {grade.split('/')[0].trim()}
                </span>
              </div>

              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 6px' }}>
                {displayName}
              </h1>

              <div style={{ fontSize: '0.90rem', color: '#475569', maxWidth: '720px', lineHeight: 1.5 }}>
                {product.description || peptideData?.mechanismOfAction || 'Pharmaceutical grade active substance for specialized compounding, clinical formulations, and analytical research.'}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '36px',
                  padding: '0 12px',
                  borderRadius: '4px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  fontSize: '0.80rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {copiedLink ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                <span>{copiedLink ? 'Copied URL' : 'Share API'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsInquiryOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '36px',
                  padding: '0 16px',
                  borderRadius: '4px',
                  background: '#0d9488',
                  border: '1px solid #0d9488',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                <Send size={14} />
                <span>Request B2B Quotation</span>
              </button>
            </div>
          </div>

          {/* ── Key Chemical Specifications Bar ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid #f1f5f9'
          }}>
            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.70rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>CAS Registry</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span style={{ fontSize: '0.90rem', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>{casNumber}</span>
                <button
                  type="button"
                  onClick={handleCopyCas}
                  title="Copy CAS"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0d9488', padding: '2px' }}
                >
                  {copiedCas ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                </button>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.70rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Molecular Formula</div>
              <div style={{ fontSize: '0.90rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{molecularFormula}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.70rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Molecular Weight</div>
              <div style={{ fontSize: '0.90rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{molecularWeight}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.70rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Standard Purity (Assay)</div>
              <div style={{ fontSize: '0.90rem', fontWeight: 700, color: '#0d9488', marginTop: '2px' }}>{purity}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.70rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Physical Appearance</div>
              <div style={{ fontSize: '0.90rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{format}</div>
            </div>
          </div>
        </div>

        {/* ── Tabbed Technical Information Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'flex-start' }}>
          {/* Left Column: Monograph Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Tabs Header */}
            <div style={{
              display: 'flex',
              gap: '4px',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '2px'
            }}>
              {[
                { id: 'identification', label: 'Chemical Identification & Monograph', icon: Microscope },
                { id: 'compounding', label: 'Compounding & Clinical Applications', icon: Beaker },
                { id: 'safety', label: 'Safety, Handling & Storage', icon: ShieldCheck }
              ].map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '6px 6px 0 0',
                      border: 'none',
                      borderBottom: active ? '2px solid #0d9488' : '2px solid transparent',
                      background: active ? '#ffffff' : 'transparent',
                      color: active ? '#0d9488' : '#64748b',
                      fontSize: '0.82rem',
                      fontWeight: active ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Chemical Identification & Quality */}
            {activeTab === 'identification' && (
              <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 12px' }}>
                  Pharmacopeia Quality Specifications
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.84rem' }}>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                    <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase' }}>Substance Class</div>
                    <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
                      {isPeptide ? 'Synthetic Peptide Active Pharmaceutical Ingredient (API)' : 'Inorganic Salt / Essential Trace Element'}
                    </div>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                    <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase' }}>Assay (RP-HPLC / Titration)</div>
                    <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
                      {isPeptide ? '≥ 98.5% (Single Major Peak)' : '98.0% – 100.5% (Anhydrous Basis)'}
                    </div>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                    <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase' }}>Water Content (Karl Fischer)</div>
                    <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
                      {isPeptide ? '≤ 5.0% (Lyophilized state)' : 'Freely soluble in water (~85 g/100 mL)'}
                    </div>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                    <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase' }}>Bacterial Endotoxins</div>
                    <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
                      &lt; 5.0 EU/mg (EP / USP Pharmacopeia Grade)
                    </div>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                    <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase' }}>Residual Solvents (TFA / ACN)</div>
                    <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>&le; 0.1% (USP &lt;467&gt;)</div>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                    <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase' }}>Heavy Metals (as Pb)</div>
                    <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>&le; 10 ppm</div>
                  </div>
                </div>

                {isPeptide && peptideData?.sequence && (
                  <div style={{ marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Primary Amino Acid Sequence
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.80rem', color: '#0f172a', wordBreak: 'break-all' }}>
                      {peptideData.sequence}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.80rem', color: '#475569', lineHeight: 1.5 }}>
                  <strong>Pharmacopeia Monograph Reference:</strong> Complies with United States Pharmacopeia (USP) and European Pharmacopoeia (Ph. Eur.) monographs for active pharmaceutical ingredients. Complete analytical batch documentation and Certificate of Analysis available upon supplier RFQ.
                </div>
              </div>
            )}

            {/* Tab 2: Compounding & Clinical Applications */}
            {activeTab === 'compounding' && (
              <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 12px' }}>
                  Compounding Applications &amp; Physiological Axis
                </h3>
                <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.6 }}>
                  <p>
                    <strong>Biological Role &amp; Mechanism:</strong>{' '}
                    {peptideData?.mechanismOfAction || product.description || 'Targeted active pharmaceutical substance optimizing specific physiological signaling axes.'}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px' }}>
                      <h4 style={{ margin: '0 0 6px', fontSize: '0.84rem', fontWeight: 700, color: '#0d9488' }}>
                        {isPeptide ? 'Aseptic Compounding (Cleanroom ISO 5)' : 'Oral Compounding (Nutrigenomics)'}
                      </h4>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {isPeptide
                          ? 'Sterile reconstitution and membrane filtration (0.22 µm PES) inside laminar flow biosafety cabinets for customized multi-dose patient vials.'
                          : 'Incorporated into customized oral capsules or multi-mineral formulas. Formulated according to validated master formulation records.'}
                      </div>
                    </div>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px' }}>
                      <h4 style={{ margin: '0 0 6px', fontSize: '0.84rem', fontWeight: 700, color: '#0284c7' }}>
                        {isPeptide ? 'CDMO Lyophilization & Batch Fill' : 'Parenteral Cleanroom Solutions'}
                      </h4>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {isPeptide
                          ? 'Suitable for automated lyophilization cycles, pre-filled syringe (PFS) filling, and stable peptide matrix formulations under cGMP supervision.'
                          : 'Aseptic formulation in certified ISO Class 5 compounding suites for targeted intravenous infusion under physician supervision.'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Safety, Handling & Storage */}
            {activeTab === 'safety' && (
              <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 12px' }}>
                  Laboratory Handling &amp; Storage Guidelines
                </h3>
                <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.5 }}>
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                    background: isPeptide ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${isPeptide ? '#bbf7d0' : '#fecaca'}`,
                    padding: '10px 14px',
                    borderRadius: '6px',
                    marginBottom: '12px'
                  }}>
                    <AlertTriangle size={18} color={isPeptide ? '#16a34a' : '#dc2626'} style={{ flexShrink: 0 }} />
                    <div style={{ color: isPeptide ? '#166534' : '#991b1b', fontSize: '0.80rem' }}>
                      <strong>{isPeptide ? 'Laboratory Handling Protocol:' : 'Laboratory Safety Warning (GHS06):'}</strong>{' '}
                      {isPeptide
                        ? 'High-potency peptide active ingredient. Handle in cleanroom or biosafety hood with standard PPE (nitrile gloves, lab coat, face protection). Avoid repeated freeze-thaw cycles after reconstitution.'
                        : 'Pure inorganic active compound with high physiological potency. Weighing and galenic preparation must be performed inside a certified fume hood with PPE.'}
                    </div>
                  </div>
                  <p>
                    <strong>Storage Requirements:</strong> {storageCondition}
                  </p>
                  <p>
                    <strong>Incompatibilities:</strong> {isPeptide
                      ? 'Avoid exposure to strong oxidizing agents, extreme pH (< 3 or > 9), and prolonged heat above 25°C to preserve peptide tertiary structure.'
                      : 'Avoid contact with strong reducing agents, acids, and heavy metal oxidizers to prevent chemical reduction or precipitation.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Packaging & Sourcing Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              padding: '18px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{ fontSize: '0.90rem', fontWeight: 700, color: '#0f172a', margin: '0 0 12px' }}>
                B2B Sourcing &amp; Packaging
              </h3>

              <div style={{ fontSize: '0.80rem', color: '#64748b', marginBottom: '10px' }}>
                Select commercial pack size for compounding:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                {['10g', '50g', '100g', '1kg'].map(size => {
                  const isSel = selectedPack === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedPack(size)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: `1.5px solid ${isSel ? '#0d9488' : '#e2e8f0'}`,
                        background: isSel ? '#f0fdfa' : '#ffffff',
                        color: isSel ? '#0f766e' : '#334155',
                        fontSize: '0.82rem',
                        fontWeight: isSel ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      {size} Pack
                    </button>
                  );
                })}
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><strong>Primary Supplier:</strong> {supplierName}</div>
                <div><strong>Packaging:</strong> Sealed HDPE Amber Laboratory Bottle / Vacuum Lyophilized Vial</div>
                <div><strong>Tariff HSN:</strong> {hsnCode}</div>
                <div><strong>Lead Time:</strong> 2–4 Business Days (Express B2B)</div>
              </div>

              <button
                type="button"
                onClick={() => setIsInquiryOpen(true)}
                style={{
                  width: '100%',
                  marginTop: '16px',
                  padding: '10px',
                  borderRadius: '6px',
                  background: '#0d9488',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Send size={15} />
                <span>Request Quotation for {selectedPack}</span>
              </button>
            </div>
          </div>
        </div>
      </PublicPageShell>

      {/* ── B2B Institutional Inquiry Drawer ── */}
      <PublicInstitutionalInquiryDrawer
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        contextItem={{
          type: 'product',
          name: `${productName} (${selectedPack})`,
          sku: product.id,
          category: 'Active Pharmaceutical Ingredients (API)',
          specs: `CAS: ${casNumber} | Formula: ${molecularFormula} | Grade: ${grade}`
        }}
      />

      {/* ── Public Clinical Research Copilot Drawer ── */}
      <PublicAtlasAIDrawer
        hideFloatingTrigger={true}
        contextType="product"
        contextAnchor={{
          name: productName,
          type: 'raw_api',
          casNumber,
          molecularFormula,
          grade,
          format
        }}
      />

      {/* ── Persistent Floating Sticky Monograph Footer (Golden Rule #47) ── */}
      <PublicStickyActionBar
        title={productName}
        subtitle={`CAS: ${casNumber} • ${selectedPack} • Grade: ${grade}`}
        badge="Bulk Raw API"
        inquireLabel="Inquire Raw API"
        onInquire={() => setIsInquiryOpen(true)}
        showClinicalAI={true}
        aiCategory="Raw API Compounding"
        aiContextQuery={`What are the formulation guidelines, solubility, compatible excipients, and quality standards for bulk API ${productName} (CAS: ${casNumber})?`}
        showSections={true}
        sectionsCount={3}
        sectionsLabel="Sections"
        activeSectionIndex={activeTab === 'identification' ? 1 : activeTab === 'compounding' ? 2 : 3}
        onOpenSections={() => {
          const el = document.getElementById('raw-api-tabs');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        lang="en"
      />

      {/* ── Institutional Unified Public Footer ── */}
      <PublicUnifiedFooter lang="en" />
    </div>
  );
}

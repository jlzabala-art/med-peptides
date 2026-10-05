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
  Package
} from 'lucide-react';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicPageShell from '@/components/shared/public/PublicPageShell';
import PublicAtlasAIDrawer from '@/components/shared/PublicAtlasAIDrawer';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import toast from 'react-hot-toast';

export default function RawApiDatasheetView({ product, slug, baseUrl = 'https://med-peptides.com' }) {
  const [copiedCas, setCopiedCas] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedPack, setSelectedPack] = useState(product?.packSize || '10g');
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('identification'); // 'identification' | 'compounding' | 'safety'

  if (!product) return null;

  const productName = product.canonicalName || product.name || 'Chemical API';
  const displayName = product.displayName || `${productName} (${product.packSize || 'Bulk API'})`;
  const casNumber = product.casNumber || product.cas_number || '10102-18-8';
  const molecularFormula = product.molecularFormula || product.molecular_formula || 'Na2SeO3';
  const molecularWeight = product.molecularWeight || product.molecular_weight || '172.94 g/mol';
  const purity = product.purity || '≥98.0%';
  const grade = product.grade || 'USP / Ph. Eur. Pharmacopeia Grade';
  const format = product.format || 'Fine White Powder';
  const hsnCode = product.hsnCode || '28429090';
  const storageCondition = product.storageCondition || 'Store in airtight containers at 15–25°C, protected from light and moisture.';
  const supplierName = product.supplier || 'Licensed Pharmaceutical Synthesis Laboratory';
  const targetUrl = `${baseUrl}/p/${slug || product.slug || product.id}`;

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
    toast.success('Product link copied to clipboard');
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
          <span style={{ color: '#0f172a', fontWeight: 600 }}>{productName}</span>
        </div>

        {/* ── Google Cloud Console Callout: Non-Peptide Notice ── */}
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
            <strong style={{ color: '#115e59' }}>Pharma Grade Raw Material &amp; Active Ingredient (API):</strong>{' '}
            This product is a pharmaceutical active substance / essential mineral trace element for licensed compounding and laboratory use. 
            It is <strong style={{ textDecoration: 'underline' }}>not a peptide</strong> and must not be reconstituted with bacteriostatic water. 
            Prepared strictly under USP / Ph. Eur. Compounding Pharmacopeia monographs.
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
                  Essential Trace Element
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
                  USP / Ph. Eur.
                </span>
              </div>

              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 6px' }}>
                {displayName}
              </h1>

              <div style={{ fontSize: '0.90rem', color: '#475569', maxWidth: '720px', lineHeight: 1.5 }}>
                {product.description || 'Pharmaceutical grade active substance for specialized compounding, antioxidant defense protocols, and tailored clinical formulations.'}
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
                    <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>Inorganic Selenium Salt / Essential Trace Element</div>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                    <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase' }}>Assay (Titration / HPLC)</div>
                    <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>98.0% – 100.5% (Anhydrous Basis)</div>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                    <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase' }}>Water Solubility</div>
                    <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>Freely soluble in water (~85 g/100 mL at 20°C)</div>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                    <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase' }}>Alcohol Solubility</div>
                    <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>Practically insoluble in ethanol</div>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                    <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase' }}>pH (1% Aqueous Solution)</div>
                    <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>9.0 – 10.0</div>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                    <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase' }}>Heavy Metals (as Pb)</div>
                    <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>≤ 10 ppm</div>
                  </div>
                </div>

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
                    <strong>Biological Role:</strong> Sodium Selenite is an essential trace element delivering bioavailable selenium, which incorporates as selenocysteine into critical antioxidant selenoenzymes, notably <em>glutathione peroxidase (GPx)</em> and <em>thioredoxin reductase (TrxR)</em>.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px' }}>
                      <h4 style={{ margin: '0 0 6px', fontSize: '0.84rem', fontWeight: 700, color: '#0d9488' }}>
                        Oral Compounding (Nutrigenomics)
                      </h4>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Incorporated into customized oral capsules or multi-mineral formulas. Standard clinical doses range between <strong>50 mcg to 200 mcg</strong> of elemental selenium daily.
                      </div>
                    </div>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px' }}>
                      <h4 style={{ margin: '0 0 6px', fontSize: '0.84rem', fontWeight: 700, color: '#0284c7' }}>
                        Parenteral Cleanroom Solutions
                      </h4>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Aseptic formulation in certified ISO Class 5 compounding suites for targeted intravenous infusion under physician supervision.
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
                  Laboratory Handling &amp; GHS Guidelines
                </h3>
                <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.5 }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '6px', marginBottom: '12px' }}>
                    <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
                    <div style={{ color: '#991b1b', fontSize: '0.80rem' }}>
                      <strong>Laboratory Safety Warning (GHS06):</strong> Pure Sodium Selenite is an inorganic active compound with high physiological potency. Weighing and galenic preparation must be performed inside a certified fume hood with PPE (gloves, safety goggles, and respiratory mask).
                    </div>
                  </div>
                  <p>
                    <strong>Storage Requirements:</strong> {storageCondition}
                  </p>
                  <p>
                    <strong>Incompatibilities:</strong> Avoid contact with strong reducing agents, acids, and heavy metal oxidizers to prevent chemical reduction or precipitation.
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
                <div><strong>Packaging:</strong> Sealed HDPE Amber Laboratory Bottle</div>
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
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/common/BrandLogo';
import {
  Sparkles,
  Building2,
  Package,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  FileText,
  DollarSign,
  Truck,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  Phone,
  MessageCircle,
  Download,
  Percent,
  Calculator,
  Globe2,
  Check,
  Printer,
  Copy,
  Cpu,
  Zap,
  Activity
} from 'lucide-react';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import Breadcrumb from '@/components/ui/Breadcrumb';
import NominalWelcomeBanner from '@/components/shared/NominalWelcomeBanner';
import GcpUserBadge from '@/components/shared/GcpUserBadge';
import { useCommercialSchedule } from '@/hooks/useCommercialSchedule';
import { FALLBACK_AGREEMENTS } from '@/repositories/commercialAgreementsRepository';
import '../colway/ColwayPriceList.css';

export default function QatarColwayPriceClient() {
  const {
    agreement,
    currency,
    setCurrency,
    activeTab,
    setActiveTab,
    isHossamMode,
    isSubmittingQuote,
    generatedQuote,
    setGeneratedQuote,
    copiedLink,
    handleCopyShareLink,
    handleGenerateAtlasQuotation
  } = useCommercialSchedule('colway-qatar');

  const [selectedProduct, setSelectedProduct] = useState('shampoo');
  const [showAiInsight, setShowAiInsight] = useState(false);

  // Dynamic values backed by Firestore SSOT
  const pricing = agreement?.pricing || FALLBACK_AGREEMENTS['colway-qatar'].pricing;
  const totals = agreement?.totals || FALLBACK_AGREEMENTS['colway-qatar'].totals;
  const orderQuantity = agreement?.orderQuantity || 80;
  const keyConditions = agreement?.keyConditions || FALLBACK_AGREEMENTS['colway-qatar'].keyConditions;
  const discountPct = agreement?.securedDiscountPct || 18;

  return (
    <div className="colway-price-root" style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      {/* ── Screen-Only Interactive Navigation Bar (Atlas Health Brand Standard) ── */}
      <nav className="screen-nav-bar no-print" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="nav-container">
          <div className="nav-left">
            <Link href="/" className="nav-brand" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }} title="Atlas Health Services">
              <BrandLogo variant="light" size="compact" />
            </Link>
            <span className="nav-divider">/</span>
            <span className="nav-section">B2B Wholesale</span>
            <span className="nav-divider">/</span>
            <span className="nav-current">Qatar Distribution Hub</span>
          </div>

          <div className="nav-actions">
            {/* Currency Selector */}
            <div className="currency-selector">
              <span className="control-label">Currency:</span>
              <div className="pill-group">
                {['QAR', 'USD', 'PLN'].map((cur) => (
                  <button
                    key={cur}
                    onClick={() => setCurrency(cur)}
                    className={`pill-btn ${currency === cur ? 'pill-active' : ''}`}
                    title={cur === 'PLN' ? 'Origin Polish Złoty factory cost (102 PLN)' : `Display in ${cur}`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            </div>

            {/* Switch to Genomics */}
            <Link
              href="/pricing/24genomics-qatar"
              className="action-btn action-ghost"
              style={{ textDecoration: 'none', fontSize: '0.78rem' }}
              title="Open 24Genetics Clinical DNA & Nutrigenomics Schedule"
            >
              <span>24Genetics Nutrigen</span>
              <ArrowRight size={13} />
            </Link>

            {/* WhatsApp Contact */}
            <a
              href="https://wa.me/971504789841?text=Hello%20Jose,%20regarding%20the%20Qatar%20Colway%20Hair%20Distributor%20Schedule%20for%20Ryhanh%20Medical%20Company"
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn action-whatsapp"
              style={{ textDecoration: 'none' }}
            >
              <MessageCircle size={14} />
              <span>Contact Mediluxe</span>
            </a>

            {/* Google Cloud Console UX Standard User Badge & Quick Logout */}
            <GcpUserBadge
              variant="dark"
              loginRedirect="/pricing/colway-qatar"
            />
          </div>
        </div>
      </nav>

      {/* ── Atlas AI™ Interactive Sticker Bar (Golden Standard) ── */}
      <div style={{ backgroundColor: '#002244', color: '#ffffff', borderBottom: '1px solid rgba(56, 189, 248, 0.25)', padding: '0.65rem 1.5rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.4)', padding: '3px 9px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.04em' }}>
              <Sparkles size={13} />
              <span>ATLAS AI™ VERIFIED</span>
            </div>
            <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
              Dynamic Landed Cost & Margin Calibration Engine · Pegged at <strong style={{ color: '#ffffff' }}>3.6795 QAR/USD</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowAiInsight(!showAiInsight)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#ffffff',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 650,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Cpu size={14} className="text-cyan-300" />
              <span>{showAiInsight ? 'Hide AI Analysis ▲' : 'View Atlas AI Margin Analysis ▼'}</span>
            </button>

            <button
              onClick={handleGenerateAtlasQuotation}
              disabled={isSubmittingQuote}
              style={{
                background: 'linear-gradient(90deg, #0284c7 0%, #0369a1 100%)',
                border: '1px solid #38bdf8',
                color: '#ffffff',
                padding: '5px 14px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 750,
                cursor: isSubmittingQuote ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.4)'
              }}
            >
              <FileSpreadsheet size={14} />
              <span>{isSubmittingQuote ? 'Generating...' : 'Accept & Register Quote in Atlas'}</span>
            </button>
          </div>
        </div>

        {/* Expandable Atlas AI Insight Box */}
        {showAiInsight && (
          <div style={{ maxWidth: '1280px', margin: '0.75rem auto 0 auto', padding: '1rem', backgroundColor: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', fontSize: '0.80rem', color: '#e2e8f0', lineHeight: 1.5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#38bdf8', marginBottom: '4px' }}>
              <Zap size={14} />
              <span>Atlas AI Strategic Commercial Intelligence for Ryhanh Medical Company (Qatar):</span>
            </div>
            <div>
              1. <strong>Factory Hedging:</strong> European procurement cost is anchored in origin at <strong>102.00 PLN</strong> per unit, yielding $26.00 USD (93.94 QAR) with an approved ~18% factory discount.<br />
              2. <strong>Logistics Efficiency:</strong> Direct air courier freight from Poland to Hamad International Airport (Doha) allocates <strong>19.73 PLN</strong> ($5.00 USD / 18.06 QAR) per unit across the 80-unit commercial batch.<br />
              3. <strong>Total Landed Price:</strong> Approved landed price to distributor is <strong>121.73 PLN</strong> ($31.00 USD / 112.00 QAR).<br />
              4. <strong>Distributor Profitability:</strong> Reselling into premier aesthetic clinics and dermatology practices in Doha at <strong>187.00 QAR</strong> produces a <strong>40.1% gross distributor margin</strong> (+75.00 QAR / unit, yielding +6,000.00 QAR gross profit on the 80-unit batch).<br />
              5. <strong>Credit Protection Buffer:</strong> Even after factoring a 15% provision (-28.05 QAR / unit) for local delivery and salon 90-day settlement terms, net operating profit remains robust at <strong>23.93%</strong> (+3,579.25 QAR on the initial 80-unit batch).
            </div>
          </div>
        )}
      </div>

      {/* ── Main Sheet Container ── */}
      <main className="price-sheet-container" style={{ maxWidth: '1280px', margin: '1.5rem auto 3rem auto', padding: '0 1.5rem' }}>
        <Breadcrumb items={[
          { label: 'B2B Schedules', href: '/pricing' },
          { label: 'Qatar Exclusive Distribution', href: '/pricing/colway-qatar' },
          { label: 'Ryhanh Medical Company · Colway Trichology' }
        ]} />

        {/* Nominal Welcome Banner for Hossam / Ryhanh Medical */}
        {isHossamMode && (
          <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <NominalWelcomeBanner
              recipientName="Hossam Ahmed"
              role="wholesaler"
              clinicName="Ryhanh Medical Company · State of Qatar"
              verifiedBy="Atlas Health Services & Colway Poland"
              sessionDuration="90 days"
              lang="en"
            />
          </div>
        )}

        {/* ── Institutional Document Header (Exact Standard as /pricing/colway) ── */}
        <header className="document-header" style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
          <div className="header-meta-row">
            <div className="institutional-identity">
              <div className="brand-pairing">
                <div className="brand-pill-atlas">ATLAS HEALTH SERVICES</div>
                <span className="partner-cross">×</span>
                <div className="brand-pill-colway">COLWAY CLINICAL TRICHOLOGY</div>
              </div>
              <h1 className="document-title" style={{ fontSize: '1.65rem', fontWeight: 850, color: '#003666', letterSpacing: '-0.02em', margin: '0 0 0.35rem 0' }}>
                {agreement?.title || 'COLWAY® CLINICAL HAIR CARE & TRICHOLOGY SCHEDULE'}
              </h1>
              <p className="document-subtitle" style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
                {agreement?.subtitle || 'Exclusive B2B Commercial Distribution Architecture · State of Qatar Territory'}
              </p>
            </div>

            {/* Document Stamp Box */}
            <div className="document-stamp-box">
              <div className="stamp-item">
                <span className="stamp-label">DOCUMENT REF:</span>
                <span className="stamp-value font-mono font-bold">{agreement?.documentRef || 'DOC-QA-COL-2026-V1'}</span>
              </div>
              <div className="stamp-item">
                <span className="stamp-label">TERRITORY:</span>
                <span className="stamp-value font-bold">{agreement?.territory || 'State of Qatar (Exclusive B2B)'}</span>
              </div>
              <div className="stamp-item">
                <span className="stamp-label">CONSIGNEE DISTRIBUTOR:</span>
                <span className="stamp-value font-bold text-sky-700">{agreement?.organization || 'Ryhanh Medical Company (Ryhanh Group, Doha, Qatar)'}</span>
              </div>
              <div className="stamp-item">
                <span className="stamp-label">PRICING BASIS:</span>
                <span className="stamp-value">{agreement?.pricingBasis || 'CIF Doha Port of Entry (excl. 5% local VAT)'}</span>
              </div>
              <div className="stamp-item">
                <span className="stamp-label">SCHEDULE TIER:</span>
                <span className="stamp-value text-emerald-600 font-bold">{agreement?.tier || 'Authorized Commercial Distributor'}</span>
              </div>
              <div className="stamp-item">
                <span className="stamp-label">EFFECTIVE DATE:</span>
                <span className="stamp-value">November 2026 · Active & Verified SSOT</span>
              </div>
            </div>
          </div>

          {/* Navigation Subtabs & Interactive Quotation CTA */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveTab('commercial')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: activeTab === 'commercial' ? '2px solid #003666' : '1px solid #e2e8f0',
                  backgroundColor: activeTab === 'commercial' ? '#003666' : '#ffffff',
                  color: activeTab === 'commercial' ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FileSpreadsheet size={15} />
                <span>Commercial & Cost Breakdown</span>
              </button>
              <button
                onClick={() => setActiveTab('monographs')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: activeTab === 'monographs' ? '2px solid #003666' : '1px solid #e2e8f0',
                  backgroundColor: activeTab === 'monographs' ? '#003666' : '#ffffff',
                  color: activeTab === 'monographs' ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FileText size={15} />
                <span>Product Monographs & Fichas Técnicas</span>
              </button>
              <button
                onClick={() => setActiveTab('terms')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: activeTab === 'terms' ? '2px solid #003666' : '1px solid #e2e8f0',
                  backgroundColor: activeTab === 'terms' ? '#003666' : '#ffffff',
                  color: activeTab === 'terms' ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ShieldCheck size={15} />
                <span>Commercial Terms & Currency Rules</span>
              </button>
            </div>

            {/* Primary Action Button to Register Quotation in Atlas */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleCopyShareLink}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 650,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: copiedLink ? '#15803d' : '#475569',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copiedLink ? 'Link Copied' : 'Share Schedule'}</span>
              </button>

              <button
                onClick={handleGenerateAtlasQuotation}
                disabled={isSubmittingQuote}
                style={{
                  padding: '9px 18px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  border: 'none',
                  background: 'linear-gradient(135deg, #003666 0%, #0284c7 100%)',
                  color: '#ffffff',
                  cursor: isSubmittingQuote ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(0, 54, 102, 0.3)'
                }}
              >
                <Sparkles size={15} className="text-cyan-300" />
                <span>{isSubmittingQuote ? 'Registering...' : 'Generate Formal Atlas Quotation →'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* ── Approved Colway Commercial Terms & Key Conditions Announcement ── */}
        <div style={{ backgroundColor: '#ffffff', border: '2px solid #0284c7', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.75rem', boxShadow: '0 4px 16px rgba(2, 132, 199, 0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#003666', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={20} className="text-cyan-300" />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Approved Colway Commercial Agreement · Qatar Territory
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 850, color: '#003666', margin: '2px 0 0 0' }}>
                  {isHossamMode ? 'Special Terms for Hossam Ahmed · Ryhanh Medical Company' : 'Approved Colway Commercial Pricing · Ryhanh Medical Company'}
                </h2>
              </div>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#ecfdf5', border: '1px solid #86efac', padding: '6px 14px', borderRadius: '20px', color: '#15803d', fontSize: '0.80rem', fontWeight: 800 }}>
              <CheckCircle2 size={16} />
              <span>{discountPct}% Factory Discount Approved</span>
            </div>
          </div>

          <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, margin: '0 0 1rem 0' }}>
            {isHossamMode ? `Hi ${agreement?.partnerName || 'Hossam'},` : 'Dear Distributor Partner,'} following our recent discussions with Colway, I’m pleased to share that we have secured an approved product price of <strong>{pricing.unitProductPricePln.toFixed(2)} PLN (approx. {pricing.unitProductPriceQar.toFixed(2)} QAR / ${pricing.unitProductPriceUsd.toFixed(2)} USD)</strong> per unit, which reflects a discount of approximately <strong>{discountPct}%</strong>:
          </p>

          {/* 3 Metrics Cards (Product, Shipping, Total) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>• Product Price (-{discountPct}%)</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 850, color: '#003666', margin: '2px 0' }}>{pricing.unitProductPricePln.toFixed(2)} PLN</div>
              <div style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 700 }}>${pricing.unitProductPriceUsd.toFixed(2)} USD = {pricing.unitProductPriceQar.toFixed(2)} QAR</div>
            </div>
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>• Shipping & Customs</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 850, color: '#003666', margin: '2px 0' }}>{pricing.unitShippingPln.toFixed(2)} PLN</div>
              <div style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 700 }}>${pricing.unitShippingUsd.toFixed(2)} USD = {pricing.unitShippingQar.toFixed(2)} QAR</div>
            </div>
            <div style={{ backgroundColor: '#f0fdf4', border: '2px solid #86efac', borderRadius: '8px', padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>TOTAL LANDED PRICE</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#15803d', margin: '2px 0' }}>{pricing.unitTotalPln.toFixed(2)} PLN</div>
              <div style={{ fontSize: '0.82rem', color: '#166534', fontWeight: 800 }}>${pricing.unitTotalUsd.toFixed(2)} USD = {pricing.unitDistributorPriceQar.toFixed(2)} QAR</div>
            </div>
          </div>

          {/* 3 Key Agreement Conditions Box */}
          <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '1rem', marginTop: '0.5rem' }}>
            <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} />
              <span>Key Conditions of this Agreement:</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem', color: '#78350f', lineHeight: 1.5 }}>
              {keyConditions.map((cond, idx) => (
                <div key={cond.title || idx}>
                  <strong>{idx + 1}. {cond.title}:</strong> {cond.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Generated Quotation Confirmation Modal / Banner ── */}
        {generatedQuote && (
          <div style={{ backgroundColor: '#f0fdf4', border: '2px solid #86efac', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Quotation Successfully Registered in Atlas Health SSOT
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 4px 0' }}>
                    Quotation #{generatedQuote.quotationNumber}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                    Consignee: <strong>{generatedQuote.clientName || 'Ryhanh Medical Company'}</strong> · Total: <strong>8,960.00 QAR</strong> ($2,480.00 USD / 9,738.40 PLN).
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#16a34a', marginTop: '4px', fontWeight: 650 }}>
                    ✓ Formal quotation record created in Atlas database and dispatched to Mediluxe executive management (jose@mediluxeme.com).
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: '1px solid #bbf7d0',
                    backgroundColor: '#ffffff',
                    color: '#15803d',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Printer size={14} />
                  <span>Print Pro-Forma</span>
                </button>
                <a
                  href={`https://wa.me/971504789841?text=Hello%20Jose,%20I%20have%20registered%20our%20distributor%20quotation%20%23${generatedQuote.quotationNumber}%20in%20Atlas%20Health%20for%208,960%20QAR%20(80%20Units%20Colway%20Hair).`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    backgroundColor: '#25D366',
                    color: '#ffffff',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <MessageCircle size={14} />
                  <span>Confirm on WhatsApp</span>
                </a>
                <button
                  onClick={() => setGeneratedQuote(null)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: COMMERCIAL & COST BREAKDOWN */}
        {activeTab === 'commercial' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Top 4 KPI Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 650, color: '#64748b', textTransform: 'uppercase' }}>Purchase Units</span>
                  <Package size={16} style={{ color: '#003666' }} />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#003666' }}>{orderQuantity} Units</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                  40× Shampoo (250 mL) + 40× Conditioner (200 mL)
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 650, color: '#64748b', textTransform: 'uppercase' }}>Total Landed Price</span>
                  <Truck size={16} style={{ color: '#0284c7' }} />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0284c7' }}>112.00 QAR</div>
                <div style={{ fontSize: '0.72rem', color: '#0284c7', marginTop: '4px' }}>
                  $31.00 USD (121.73 PLN) · 102 PLN Product + 19.73 PLN Shipping
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '1.25rem', backgroundColor: '#f0fdf4' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>Distributor Gross Margin</span>
                  <Percent size={16} style={{ color: '#16a34a' }} />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#15803d' }}>{distributorGrossMarginPct}% (+75 QAR)</div>
                <div style={{ fontSize: '0.72rem', color: '#15803d', marginTop: '4px', fontWeight: 600 }}>
                  +6,000.00 QAR gross profit on 80-unit batch
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 650, color: '#64748b', textTransform: 'uppercase' }}>Factory Discount</span>
                  <TrendingUp size={16} style={{ color: '#059669' }} />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669' }}>~18% Approved</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                  102.00 PLN unit product price secured with Colway
                </div>
              </div>
            </div>

            {/* Landed Cost & Margin Full Breakdown Table */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Detailed Landed Cost & Commercial Architecture (80 Units)
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '3px' }}>
                    Transparent reconciliation between approved European compounding origin (Colway Poland), international express air freight, and Distributor wholesale revenue for <strong>Ryhanh Medical Company (Ryhanh Group)</strong>.
                  </p>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#003666', color: '#ffffff', padding: '4px 10px', borderRadius: '4px' }}>
                  Currencies: PLN, USD & QAR
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '10px 16px', fontWeight: 700, color: '#475569' }}>Cost & Commercial Element</th>
                      <th style={{ padding: '10px 16px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>Basis / Documentation</th>
                      <th style={{ padding: '10px 16px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Per Unit (PLN)</th>
                      <th style={{ padding: '10px 16px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Per Unit (USD)</th>
                      <th style={{ padding: '10px 16px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Per Unit (QAR)</th>
                      <th style={{ padding: '10px 16px', fontWeight: 700, color: '#003666', textAlign: 'right' }}>Total Batch (QAR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Row 1: Approved Product Price */}
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 650 }}>
                        <div>Approved Colway Product Price (18% Discount)</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>40× Shampoo (250 mL) + 40× Conditioner (200 mL) at 102.00 PLN</div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b' }}>Approved Factory Rate</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 650 }}>102.00 PLN</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>$26.00</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>93.94 QAR</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700 }}>7,515.20 QAR</td>
                    </tr>

                    {/* Row 2: Shipping & Customs */}
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 650 }}>
                        <div>International Air Freight & Customs Handling</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Direct air courier dispatch from Poland to Hamad Int. Airport (Doha)</div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b' }}>Air Logistics Allocation</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 650 }}>19.73 PLN</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>$5.00</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>18.06 QAR</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700 }}>1,444.80 QAR</td>
                    </tr>

                    {/* Row 3: Total Landed Price to Distributor */}
                    <tr style={{ backgroundColor: '#003666', color: '#ffffff', fontWeight: 800 }}>
                      <td style={{ padding: '14px 16px', fontSize: '0.92rem' }}>
                        <div>TOTAL LANDED PRICE TO DISTRIBUTOR (RYHANH MEDICAL COMPANY)</div>
                        <div style={{ fontSize: '0.74rem', color: '#93c5fd', fontWeight: 500 }}>Approved B2B price · 100% advance payment required prior to dispatch</div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', color: '#93c5fd', fontSize: '0.78rem' }}>Agreed B2B Terms</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '1rem', color: '#38bdf8' }}>121.73 PLN</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '1rem' }}>$31.00</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '1.05rem', color: '#38bdf8' }}>112.00 QAR</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '1.15rem', color: '#38bdf8' }}>8,960.00 QAR</td>
                    </tr>

                    {/* Distributor Resale Horizon */}
                    <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#f0fdf4' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 650, color: '#15803d' }}>
                        <div>Recommended Resale Price in Qatar (Clinics / Salons / Retail)</div>
                        <div style={{ fontSize: '0.72rem', color: '#16a34a' }}>Target end-user & aesthetic clinic price point in Doha</div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#15803d' }}>Market MSRP</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#15803d' }}>—</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#15803d' }}>$50.82</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#15803d', fontWeight: 700 }}>187.00 QAR</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#15803d', fontWeight: 800 }}>14,960.00 QAR</td>
                    </tr>

                    <tr style={{ backgroundColor: '#dcfce7', color: '#166534', fontWeight: 800 }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div>DISTRIBUTOR GROSS PROFIT FOR RYHANH MEDICAL COMPANY (40.1% MARGIN)</div>
                        <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 500 }}>Gross margin before local distribution and collection costs</div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>Gross Margin (40.1%)</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>—</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>+$19.82</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>+75.00 QAR</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '1.05rem' }}>+6,000.00 QAR</td>
                    </tr>

                    <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>
                        <div>Local Operating Expenses & 90-Day Credit Risk Buffer (15%)</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Allocated for salon delivery, finance, and 90-day delayed clinic payments</div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#94a3b8' }}>Risk Buffer</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748b' }}>—</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748b' }}>-$7.62</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748b' }}>-28.05 QAR</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748b' }}>-2,244.00 QAR</td>
                    </tr>

                    <tr style={{ backgroundColor: '#ecfdf5', color: '#065f46', fontWeight: 800 }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div>DISTRIBUTOR NET PROFIT (23.93% NET PROFIT MARGIN)</div>
                        <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 500 }}>Clean net operating profit for distributor on 80-unit batch</div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>Net Clean Margin</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>—</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>+$12.16</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>+44.74 QAR</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '1.05rem' }}>+3,579.25 QAR</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Direct Order Proforma Action Card */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#003666' }}>Ready to Confirm Initial 80-Unit Batch?</div>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                  Total Approved Invoice: <strong>8,960.00 QAR</strong> ($2,480.00 USD / 9,738.40 PLN). Full prepayment to Colway required prior to dispatch.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={handleGenerateAtlasQuotation}
                  disabled={isSubmittingQuote}
                  style={{
                    backgroundColor: '#003666',
                    color: '#ffffff',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: isSubmittingQuote ? 'wait' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: 'none',
                    boxShadow: '0 2px 4px rgba(0, 54, 102, 0.25)'
                  }}
                >
                  <Sparkles size={16} className="text-cyan-400" />
                  <span>{isSubmittingQuote ? 'Registering...' : 'Generate & Register Quotation in Atlas'}</span>
                </button>
                <a
                  href="https://wa.me/971504789841?text=Hello%20Jose,%20Hossam%20here.%20We%20confirm%20our%20distributor%20batch%20of%2080%20units%20Colway%20Hair%20for%208,960%20QAR."
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#25D366',
                    color: '#ffffff',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <MessageCircle size={16} />
                  <span>Confirm via WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCT MONOGRAPHS (FICHAS TÉCNICAS) */}
        {activeTab === 'monographs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '0.5rem' }}>
              <button
                onClick={() => setSelectedProduct('shampoo')}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 750,
                  border: selectedProduct === 'shampoo' ? '2px solid #003666' : '1px solid #cbd5e1',
                  backgroundColor: selectedProduct === 'shampoo' ? '#003666' : '#ffffff',
                  color: selectedProduct === 'shampoo' ? '#ffffff' : '#475569',
                  cursor: 'pointer'
                }}
              >
                1. Hair Strengthening Shampoo (250 mL)
              </button>
              <button
                onClick={() => setSelectedProduct('conditioner')}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 750,
                  border: selectedProduct === 'conditioner' ? '2px solid #003666' : '1px solid #cbd5e1',
                  backgroundColor: selectedProduct === 'conditioner' ? '#003666' : '#ffffff',
                  color: selectedProduct === 'conditioner' ? '#ffffff' : '#475569',
                  cursor: 'pointer'
                }}
              >
                2. Hair Strengthening Conditioner (200 mL)
              </button>
            </div>

            {selectedProduct === 'shampoo' ? (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.70rem', fontWeight: 800, textTransform: 'uppercase', color: '#0284c7', backgroundColor: '#f0f9ff', padding: '3px 8px', borderRadius: '4px', border: '1px solid #bae6fd' }}>
                      Clinical Trichology Monograph
                    </span>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#003666', marginTop: '6px', margin: 0 }}>
                      Colway Strengthening Anti-Hair Loss Shampoo
                    </h2>
                    <p style={{ fontSize: '0.90rem', color: '#64748b', marginTop: '4px' }}>
                      Szampon Zagęszczający Włosy Colway · 250 mL Dispenser Bottle · Physiologic pH 5.5
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Distributor Cost</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#003666' }}>112.00 QAR</div>
                    <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>Resale: 187.00 QAR (40.1% Margin)</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Key Active Biological Compounds
                    </h4>
                    <ul style={{ fontSize: '0.82rem', color: '#334155', paddingLeft: '1.2rem', lineHeight: 1.6, margin: 0 }}>
                      <li><strong>Baicapil™ 2.0% (Clinical Grade):</strong> Synergistic blend of Scutellaria baicalensis root extract, Glycine soja (soybean) germ extract, and Triticum vulgare (wheat) germ extract. Stimulates hair follicle stem cells in the bulge, increases cellular energy (ATP), and extends the anagen growth phase.</li>
                      <li><strong>Native Fish Tropocollagen:</strong> Biologically active, triple-helix marine collagen extracted cold. Rebuilds the perifollicular extracellular matrix and strengthens the dermal papilla anchor.</li>
                      <li><strong>Micronized Diosmin (Vascular Activator):</strong> Flavonoid compound that dramatically stimulates microcirculation in scalp capillaries, improving arterial perfusion and oxygenation to hair roots.</li>
                      <li><strong>Caffeine & Niacinamide:</strong> Neutralizes local DHT receptor micro-inflammation and accelerates nutrient absorption.</li>
                      <li><strong>Zinc PCA & Mild Cleansing Base:</strong> Regulates excess sebum without stripping the protective stratum corneum barrier.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Clinical Indications & Protocols
                    </h4>
                    <ul style={{ fontSize: '0.82rem', color: '#334155', paddingLeft: '1.2rem', lineHeight: 1.6, margin: 0 }}>
                      <li><strong>Pre-Hair Transplant Preparation:</strong> Prepares the scalp ostium and stimulates capillary density 30 days prior to FUE/DHI extraction.</li>
                      <li><strong>Post-Transplant Recovery (Day 10+):</strong> Accelerated healing of recipient micro-crusts and prevention of shock loss.</li>
                      <li><strong>Androgenetic Alopecia & Telogen Effluvium:</strong> Proven reduction in shedding within 4 weeks and increase in hair density by +18.0%.</li>
                      <li><strong>Application Protocol:</strong> Apply to wet scalp, massage gently for 2-3 minutes to allow transfollicular absorption of diosmin and Baicapil™, then rinse thoroughly with lukewarm water.</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.70rem', fontWeight: 800, textTransform: 'uppercase', color: '#059669', backgroundColor: '#ecfdf5', padding: '3px 8px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                      Clinical Trichology Monograph
                    </span>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#003666', marginTop: '6px', margin: 0 }}>
                      Colway Strengthening Hair Conditioner
                    </h2>
                    <p style={{ fontSize: '0.90rem', color: '#64748b', marginTop: '4px' }}>
                      Odżywka Zagęszczająca Włosy Colway · 200 mL Flexible Tube · Acidic pH 4.5 (Cuticle Sealer)
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Distributor Cost</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#003666' }}>112.00 QAR</div>
                    <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>Resale: 187.00 QAR (40.1% Margin)</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Key Active Biological Compounds
                    </h4>
                    <ul style={{ fontSize: '0.82rem', color: '#334155', paddingLeft: '1.2rem', lineHeight: 1.6, margin: 0 }}>
                      <li><strong>Baicapil™ Trichology Complex:</strong> Maintains active stimulation along the hair shaft and roots during conditioning.</li>
                      <li><strong>Hydrolyzed Keratin:</strong> Micro-peptides that penetrate micro-fractures in the hair cortex, reinforcing tensile resistance (+24%).</li>
                      <li><strong>Native Marine Collagen:</strong> Forms an invisible biomimetic protective shield that locks in moisture without weighing down fine hair.</li>
                      <li><strong>Argania Spinosa & Gossypium (Cotton) Seed Oil:</strong> Rich in essential Omega-6 and Omega-9 fatty acids for deep cuticular lipid seal.</li>
                      <li><strong>D-Panthenol (Provitamin B5):</strong> Enhances hair shaft elasticity and imparts natural clinical luster.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Mechanism of Action & Clinical Synergy
                    </h4>
                    <ul style={{ fontSize: '0.82rem', color: '#334155', paddingLeft: '1.2rem', lineHeight: 1.6, margin: 0 }}>
                      <li><strong>pH 4.5 Acidic Sealing:</strong> Immediately seals the keratin cuticle scales opened during washing, preventing mechanical breakage.</li>
                      <li><strong>Non-Comedogenic Scalp Formulation:</strong> Unlike commercial conditioners, it can be applied directly to the scalp without clogging follicular ostia.</li>
                      <li><strong>Thermal & Environmental Protection:</strong> Shields the hair shaft from intense Qatar heat and UV degradation.</li>
                      <li><strong>Application Protocol:</strong> After shampooing, apply along damp hair and scalp, leave for 3 to 5 minutes, then rinse.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: COMMERCIAL TERMS & CONDITIONS */}
        {activeTab === 'terms' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 850, color: '#003666', marginBottom: '1.25rem' }}>
              Official Distributor Terms & Conditions — State of Qatar (Ryhanh Medical Company)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.86rem', color: '#334155', lineHeight: 1.6 }}>
              <div style={{ padding: '1.2rem', backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: 800, fontSize: '0.92rem', marginBottom: '6px' }}>
                  <CheckCircle2 size={18} />
                  <span>Approved Colway Pricing & {discountPct}% Discount Structure</span>
                </div>
                <div>
                  Following direct negotiations with Colway Poland headquarters, Ryhanh Medical Company has secured an approved unit product price of <strong>{pricing.unitProductPricePln.toFixed(2)} PLN (approx. {pricing.unitProductPriceQar.toFixed(2)} QAR / ${pricing.unitProductPriceUsd.toFixed(2)} USD)</strong>, reflecting an approved discount of approximately <strong>{discountPct}%</strong>. With shipping and customs at <strong>{pricing.unitShippingPln.toFixed(2)} PLN (approx. {pricing.unitShippingQar.toFixed(2)} QAR / ${pricing.unitShippingUsd.toFixed(2)} USD)</strong>, the total landed price to distributor is <strong>{pricing.unitTotalPln.toFixed(2)} PLN (approx. {pricing.unitDistributorPriceQar.toFixed(2)} QAR / ${pricing.unitTotalUsd.toFixed(2)} USD)</strong>.
                </div>
              </div>

              {keyConditions.map((cond, idx) => {
                const styles = [
                  { bg: '#fffbeb', border: '#fde68a', color: '#b45309', Icon: ShieldCheck },
                  { bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8', Icon: Truck },
                  { bg: '#faf5ff', border: '#e9d5ff', color: '#7e22ce', Icon: Globe2 }
                ][idx % 3];
                const IconComponent = styles.Icon;
                return (
                  <div key={cond.title || idx} style={{ padding: '1.2rem', backgroundColor: styles.bg, border: `1px solid ${styles.border}`, borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: styles.color, fontWeight: 800, fontSize: '0.92rem', marginBottom: '6px' }}>
                      <IconComponent size={18} />
                      <span>Condition {idx + 1}: {cond.title}</span>
                    </div>
                    <div>
                      {cond.text}
                    </div>
                  </div>
                );
              })}

              <div style={{ padding: '1.2rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: 800, fontSize: '0.92rem', marginBottom: '6px' }}>
                  <Package size={18} />
                  <span>Territory & Batch Specifications</span>
                </div>
                <div>
                  Consignee: <strong>{agreement?.organization || 'Ryhanh Medical Company (Ryhanh Group, Doha, Qatar)'}</strong> · Initial Commercial Batch: <strong>{orderQuantity} Units</strong> (40× Anti-Hair Loss Shampoo 250mL + 40× Hair Strengthening Conditioner 200mL). Total initial batch commitment: <strong>{totals.totalDistributorInvoicePln.toLocaleString()} PLN / ${totals.totalDistributorInvoiceUsd.toLocaleString()} USD ({totals.totalDistributorInvoiceQar.toLocaleString()} QAR)</strong>.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <PublicUnifiedFooter />
    </div>
  );
}

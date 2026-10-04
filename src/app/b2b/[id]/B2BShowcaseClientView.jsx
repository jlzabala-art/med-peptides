'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  FileText,
  ExternalLink,
  Share2,
  Copy,
  Check,
  Sparkles,
  Layers,
  Thermometer,
  Truck,
  Building2,
  Activity,
  ArrowRight,
  MessageCircle,
  FlaskConical,
  Microscope,
  CheckCircle2,
  Lock,
  ChevronRight
} from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';
import CoaModal from '@/components/product/CoaModal';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';

export default function B2BShowcaseClientView({ showcase }) {
  const [copied, setCopied] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [selectedCoaProduct, setSelectedCoaProduct] = useState(null);

  const {
    id,
    clientName = 'Institutional Partner',
    targetSpecialty = 'Clinical Formulations',
    products = [],
    aiContent = {},
    showPricing = false,
    currency = 'EUR'
  } = showcase;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://med-peptides.com/b2b/${id}`;

  const handleCopyLink = () => {
    triggerHaptic('light');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast.success('B2B Portfolio Link copied ✓');
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleWhatsAppShare = () => {
    triggerHaptic('light');
    const msg = encodeURIComponent(
      `*${aiContent.heroTitle || 'Institutional Peptide Portfolio'}*\n` +
      `Prepared for: ${clientName}\n` +
      `Specialty: ${targetSpecialty}\n\n` +
      `Access verified clinical datasheets and certificates:\n${currentUrl}`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  return (
    <div className="b2b-showcase-root">
      {/* ── 1. Institutional Top Bar ── */}
      <header className="b2b-top-nav">
        <div className="b2b-nav-inner">
          <div className="b2b-brand-cluster">
            <div className="b2b-logo-mark">
              <FlaskConical size={18} color="#38bdf8" />
            </div>
            <div>
              <div className="b2b-brand-name">ATLAS BIOPHARMA</div>
              <div className="b2b-brand-sub">INSTITUTIONAL CLINICAL PORTFOLIO</div>
            </div>
          </div>

          <div className="b2b-partner-tag">
            <span className="b2b-partner-label">Prepared for</span>
            <strong className="b2b-partner-name">{clientName}</strong>
          </div>

          <div className="b2b-nav-actions">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="b2b-nav-btn b2b-nav-btn--wa"
              title="Share via WhatsApp"
            >
              <MessageCircle size={15} /> <span>WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="b2b-nav-btn"
              title="Copy shareable portfolio link"
            >
              {copied ? <Check size={15} color="#16a34a" /> : <Copy size={15} />}
              <span>{copied ? 'Copied' : 'Copy Link'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsInquiryOpen(true)}
              className="b2b-nav-btn b2b-nav-btn--primary"
            >
              <Building2 size={15} /> <span>Request Allocation</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. Hero Section ── */}
      <section className="b2b-hero-section">
        <div className="b2b-container">
          <div className="b2b-hero-badge">
            <Sparkles size={14} color="#0d9488" />
            <span>AI-CURATED CLINICAL SUITE • {targetSpecialty.toUpperCase()}</span>
          </div>

          <h1 className="b2b-hero-title">
            {aiContent.heroTitle || `Advanced ${targetSpecialty} Clinical Suite`}
          </h1>

          <p className="b2b-hero-subtitle">
            {aiContent.heroSubtitle || 'Verified clinical peptide formulations with complete RP-HPLC and mass spectrometry dossiers.'}
          </p>

          {/* Quick Metrics Strip */}
          <div className="b2b-metrics-grid">
            <div className="b2b-metric-card">
              <div className="b2b-metric-val">{products.length}</div>
              <div className="b2b-metric-label">Curated Compounds</div>
            </div>
            <div className="b2b-metric-card">
              <div className="b2b-metric-val" style={{ color: '#16a34a' }}>≥ 99.0%</div>
              <div className="b2b-metric-label">RP-HPLC Purity Spec</div>
            </div>
            <div className="b2b-metric-card">
              <div className="b2b-metric-val">&lt; 0.5 EU/mg</div>
              <div className="b2b-metric-label">Endotoxin Threshold</div>
            </div>
            <div className="b2b-metric-card">
              <div className="b2b-metric-val">24 Mos</div>
              <div className="b2b-metric-label">Lyophilized Stability (2–8°C)</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Executive Rationale & Clinical Synergies ── */}
      <section className="b2b-rationale-section">
        <div className="b2b-container">
          <div className="b2b-section-header">
            <span className="b2b-section-tag">CLINICAL RATIONALE</span>
            <h2 className="b2b-section-title">Mechanism of Action &amp; Biological Synergy</h2>
          </div>

          <div className="b2b-rationale-box">
            <div className="b2b-rationale-text">
              {String(aiContent.executiveSummary || '').split('\n\n').map((par, idx) => (
                <p key={idx}>{par}</p>
              ))}
            </div>

            {/* Synergy Pairings Grid */}
            {Array.isArray(aiContent.clinicalSynergies) && aiContent.clinicalSynergies.length > 0 && (
              <div className="b2b-synergies-grid">
                {aiContent.clinicalSynergies.map((syn, idx) => (
                  <div key={idx} className="b2b-synergy-card">
                    <div className="b2b-synergy-pairing">
                      <Activity size={15} color="#0284c7" />
                      <strong>{syn.pairing}</strong>
                    </div>
                    <div className="b2b-synergy-mech">
                      <span className="b2b-synergy-label">Signaling Mechanism:</span>
                      <p>{syn.mechanism}</p>
                    </div>
                    <div className="b2b-synergy-outcome">
                      <span className="b2b-synergy-label">Target Endpoint:</span>
                      <p>{syn.clinicalOutcome}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 4. Curated Formulations Showcase (Grid of Cards) ── */}
      <section className="b2b-products-section">
        <div className="b2b-container">
          <div className="b2b-section-header">
            <span className="b2b-section-tag">VERIFIED DOSSIERS</span>
            <h2 className="b2b-section-title">Included Pharmaceutical Formulations</h2>
            <p className="b2b-section-subtitle">
              Every compound is backed by an independent laboratory Certificate of Analysis (CoA) and complete public dispensing specifications.
            </p>
          </div>

          <div className="b2b-products-grid">
            {products.map((prod) => {
              const slug = prod.slug || prod.id;
              const purityClean = (prod.purity || '≥ 99.0%').replace(/[^0-9.≥% ]/g, '');

              return (
                <article key={prod.id || slug} className="b2b-product-card">
                  <div className="b2b-card-top">
                    <div className="b2b-card-category">{prod.category || 'Therapeutic Formulation'}</div>
                    <span className="b2b-card-purity-badge">
                      <CheckCircle2 size={12} color="#16a34a" /> {purityClean} HPLC
                    </span>
                  </div>

                  <h3 className="b2b-card-title">{prod.name}</h3>

                  <div className="b2b-card-meta">
                    <div className="b2b-meta-item">
                      <span className="b2b-meta-label">CAS Registry:</span>
                      <code className="b2b-meta-code">{prod.cas || '189691-06-3'}</code>
                    </div>
                    <div className="b2b-meta-item">
                      <span className="b2b-meta-label">Dose Baseline:</span>
                      <span className="b2b-meta-val">{prod.dosage || 'Standard Concentration'}</span>
                    </div>
                    <div className="b2b-meta-item">
                      <span className="b2b-meta-label">Dispensing:</span>
                      <span className="b2b-meta-val">{prod.format || 'Lyophilized Sterile Vial'}</span>
                    </div>
                  </div>

                  {showPricing && prod.price && (
                    <div className="b2b-card-pricing">
                      <span className="b2b-price-label">Institutional Rate:</span>
                      <strong className="b2b-price-val">{prod.price} {currency}</strong>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="b2b-card-actions">
                    <Link
                      href={`/p/${encodeURIComponent(slug)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="b2b-card-btn b2b-card-btn--primary"
                      title="Open Verified Monograph & Public Datasheet"
                    >
                      <span>Public Datasheet</span>
                      <ArrowRight size={14} />
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setSelectedCoaProduct(prod);
                      }}
                      className="b2b-card-btn b2b-card-btn--secondary"
                      title="Inspect Certificate of Analysis"
                    >
                      <ShieldCheck size={14} />
                      <span>CoA Report</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. Protocol Cadence & Cold-Chain Logistics ── */}
      <section className="b2b-logistics-section">
        <div className="b2b-container">
          <div className="b2b-logistics-grid">
            <div className="b2b-logistics-card">
              <div className="b2b-logistics-head">
                <Thermometer size={20} color="#0284c7" />
                <h3>Cold-Chain &amp; Reconstitution Standards</h3>
              </div>
              <p>{aiContent.storageAndLogistics || 'Lyophilized vials are strictly tested for 24-month stability when stored between 2°C–8°C. Once reconstituted with Bacteriostatic Water (0.9% Benzyl Alcohol), maintain refrigerated and use within 28 days.'}</p>
            </div>

            <div className="b2b-logistics-card">
              <div className="b2b-logistics-head">
                <Truck size={20} color="#0d9488" />
                <h3>Institutional Supply &amp; Batch Allocation</h3>
              </div>
              <p>Direct supply allocation for certified clinics, physicians, and pharmacy compounding departments. Every shipment arrives with thermal tracking and complete analytical lot verification records.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Fixed Bottom Action Bar ── */}
      <aside className="b2b-bottom-bar" aria-label="Portfolio Actions">
        <div className="b2b-bottom-inner">
          <div className="b2b-bottom-info">
            <span className="b2b-bottom-count">{products.length} Products</span>
            <span className="b2b-bottom-desc">Prepared for {clientName}</span>
          </div>

          <div className="b2b-bottom-buttons">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="b2b-btn b2b-btn--wa"
            >
              <MessageCircle size={15} /> <span>WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="b2b-btn b2b-btn--outline"
            >
              {copied ? <Check size={15} color="#16a34a" /> : <Copy size={15} />}
              <span>{copied ? 'Link Copied' : 'Share Link'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setIsInquiryOpen(true);
              }}
              className="b2b-btn b2b-btn--cta"
            >
              <Building2 size={16} /> <span>Request Institutional Quote</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── 7. Certificate of Analysis Modal (CoA Preview) ── */}
      {selectedCoaProduct && (
        <CoaModal
          isOpen={!!selectedCoaProduct}
          onClose={() => setSelectedCoaProduct(null)}
          product={selectedCoaProduct}
          variant={null}
        />
      )}

      {/* ── 8. Public Institutional Inquiry Drawer ── */}
      <PublicInstitutionalInquiryDrawer
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        contextType="b2b_showcase"
        contextAnchor={{
          name: aiContent.heroTitle || 'B2B Peptide Portfolio',
          slug: id,
          cas: clientName,
          purity: '≥ 99.0% RP-HPLC',
          category: targetSpecialty
        }}
      />

      {/* ── Inline Scoped Styles ── */}
      <style jsx>{`
        .b2b-showcase-root {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: #0f172a;
          color: #f1f5f9;
          min-height: 100vh;
          padding-bottom: 90px;
        }
        .b2b-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        /* Top Nav */
        .b2b-top-nav {
          background: rgba(15, 23, 42, 0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .b2b-nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0.75rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .b2b-brand-cluster {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .b2b-logo-mark {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .b2b-brand-name {
          font-size: 0.88rem;
          font-weight: 850;
          color: #ffffff;
          letter-spacing: 0.08em;
        }
        .b2b-brand-sub {
          font-size: 0.65rem;
          color: #38bdf8;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .b2b-partner-tag {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 4px 12px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
        }
        .b2b-partner-label { color: #94a3b8; }
        .b2b-partner-name { color: #f8fafc; font-weight: 700; }
        .b2b-nav-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .b2b-nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.76rem;
          font-weight: 700;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.06);
          color: #f1f5f9;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .b2b-nav-btn:hover { background: rgba(255, 255, 255, 0.12); }
        .b2b-nav-btn--wa { border-color: rgba(37, 211, 102, 0.3); color: #25d366; }
        .b2b-nav-btn--primary {
          background: #0284c7;
          border-color: #0284c7;
          color: #ffffff;
        }
        .b2b-nav-btn--primary:hover { background: #0369a1; }

        /* Hero */
        .b2b-hero-section {
          padding: 3.5rem 0 2rem;
          background: radial-gradient(circle at 50% 0%, rgba(2, 132, 199, 0.15) 0%, transparent 60%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .b2b-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(13, 148, 136, 0.15);
          border: 1px solid rgba(13, 148, 136, 0.4);
          color: #2dd4bf;
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          margin-bottom: 1rem;
        }
        .b2b-hero-title {
          font-size: 2.2rem;
          font-weight: 850;
          color: #ffffff;
          line-height: 1.2;
          margin: 0 0 1rem;
          letter-spacing: -0.02em;
          max-width: 900px;
        }
        .b2b-hero-subtitle {
          font-size: 1.05rem;
          color: #94a3b8;
          line-height: 1.5;
          margin: 0 0 2rem;
          max-width: 820px;
        }
        .b2b-metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-top: 2rem;
        }
        .b2b-metric-card {
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 1rem 1.25rem;
          backdrop-filter: blur(8px);
        }
        .b2b-metric-val {
          font-size: 1.4rem;
          font-weight: 850;
          color: #38bdf8;
          margin-bottom: 4px;
        }
        .b2b-metric-label {
          font-size: 0.72rem;
          color: #94a3b8;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.04em;
        }

        /* Rationale & Synergies */
        .b2b-rationale-section {
          padding: 3rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .b2b-section-header { margin-bottom: 1.75rem; }
        .b2b-section-tag {
          font-size: 0.68rem;
          font-weight: 800;
          color: #38bdf8;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          display: block;
          margin-bottom: 4px;
        }
        .b2b-section-title {
          font-size: 1.4rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
        }
        .b2b-section-subtitle {
          font-size: 0.85rem;
          color: #94a3b8;
          margin: 6px 0 0;
          max-width: 650px;
        }
        .b2b-rationale-box {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 1.75rem;
        }
        .b2b-rationale-text {
          font-size: 0.92rem;
          color: #cbd5e1;
          line-height: 1.65;
          margin-bottom: 1.75rem;
        }
        .b2b-rationale-text p { margin: 0 0 1rem; }
        .b2b-rationale-text p:last-child { margin-bottom: 0; }
        .b2b-synergies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 1.5rem;
        }
        .b2b-synergy-card {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: 8px;
          padding: 1rem;
        }
        .b2b-synergy-pairing {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.88rem;
          color: #38bdf8;
          margin-bottom: 0.65rem;
        }
        .b2b-synergy-label {
          font-size: 0.66rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
          display: block;
        }
        .b2b-synergy-mech p, .b2b-synergy-outcome p {
          font-size: 0.78rem;
          color: #cbd5e1;
          margin: 2px 0 8px;
          line-height: 1.4;
        }

        /* Products Grid */
        .b2b-products-section { padding: 3rem 0; }
        .b2b-products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.25rem;
        }
        .b2b-product-card {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.35rem;
          display: flex;
          flex-direction: column;
          transition: transform 0.15s ease, border-color 0.15s ease;
        }
        .b2b-product-card:hover {
          transform: translateY(-2px);
          border-color: rgba(56, 189, 248, 0.4);
        }
        .b2b-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        .b2b-card-category {
          font-size: 0.68rem;
          color: #38bdf8;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .b2b-card-purity-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(22, 163, 74, 0.15);
          color: #4ade80;
          border: 1px solid rgba(22, 163, 74, 0.3);
          padding: 2px 8px;
          border-radius: 9999px;
          font-size: 0.68rem;
          font-weight: 800;
        }
        .b2b-card-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 1rem;
          line-height: 1.3;
        }
        .b2b-card-meta {
          background: rgba(15, 23, 42, 0.6);
          border-radius: 8px;
          padding: 0.75rem;
          margin-bottom: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .b2b-meta-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.76rem;
        }
        .b2b-meta-label { color: #94a3b8; }
        .b2b-meta-code {
          font-family: monospace;
          background: rgba(255, 255, 255, 0.08);
          padding: 1px 6px;
          border-radius: 4px;
          color: #f8fafc;
        }
        .b2b-meta-val { color: #f8fafc; font-weight: 600; }
        .b2b-card-pricing {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-top: 1px dashed rgba(255, 255, 255, 0.1);
          margin-bottom: 1rem;
        }
        .b2b-price-label { font-size: 0.75rem; color: #94a3b8; }
        .b2b-price-val { font-size: 1.1rem; color: #38bdf8; }
        .b2b-card-actions {
          display: flex;
          gap: 8px;
          margin-top: auto;
        }
        .b2b-card-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px 12px;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.15s ease;
        }
        .b2b-card-btn--primary {
          background: #0284c7;
          color: #ffffff;
        }
        .b2b-card-btn--primary:hover { background: #0369a1; }
        .b2b-card-btn--secondary {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
          color: #f1f5f9;
        }
        .b2b-card-btn--secondary:hover { background: rgba(255, 255, 255, 0.15); }

        /* Logistics */
        .b2b-logistics-section {
          padding: 2.5rem 0 4rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        .b2b-logistics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }
        .b2b-logistics-card {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 1.5rem;
        }
        .b2b-logistics-head {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 0.75rem;
        }
        .b2b-logistics-head h3 {
          margin: 0;
          font-size: 0.96rem;
          color: #ffffff;
          font-weight: 800;
        }
        .b2b-logistics-card p {
          margin: 0;
          font-size: 0.82rem;
          color: #94a3b8;
          line-height: 1.55;
        }

        /* Fixed Bottom Action Bar */
        .b2b-bottom-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(15, 23, 42, 0.95);
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(16px);
          z-index: 60;
        }
        .b2b-bottom-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0.75rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .b2b-bottom-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .b2b-bottom-count {
          background: #0284c7;
          color: #ffffff;
          padding: 3px 9px;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 800;
        }
        .b2b-bottom-desc {
          font-size: 0.8rem;
          color: #cbd5e1;
          font-weight: 600;
        }
        .b2b-bottom-buttons {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .b2b-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.15s ease;
        }
        .b2b-btn--wa {
          background: rgba(37, 211, 102, 0.12);
          border-color: rgba(37, 211, 102, 0.3);
          color: #25d366;
        }
        .b2b-btn--wa:hover { background: rgba(37, 211, 102, 0.2); }
        .b2b-btn--outline {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.18);
          color: #f1f5f9;
        }
        .b2b-btn--outline:hover { background: rgba(255, 255, 255, 0.14); }
        .b2b-btn--cta {
          background: #0d9488;
          color: #ffffff;
          border-color: #0d9488;
        }
        .b2b-btn--cta:hover { background: #0f766e; }

        @media (max-width: 840px) {
          .b2b-metrics-grid { grid-template-columns: repeat(2, 1fr); }
          .b2b-logistics-grid { grid-template-columns: 1fr; }
          .b2b-hero-title { font-size: 1.7rem; }
          .b2b-partner-tag { display: none; }
        }
        @media (max-width: 600px) {
          .b2b-metrics-grid { grid-template-columns: 1fr; }
          .b2b-products-grid { grid-template-columns: 1fr; }
          .b2b-bottom-info { display: none; }
          .b2b-bottom-buttons { width: 100%; justify-content: space-between; }
          .b2b-btn { flex: 1; justify-content: center; }
        }
      `}</style>
    </div>
  );
}

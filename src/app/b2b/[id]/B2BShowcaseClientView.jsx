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
  ChevronRight,
  LogIn,
  User
} from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import CoaModal from '@/components/product/CoaModal';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import './B2BShowcase.css';

export default function B2BShowcaseClientView({ showcase }) {
  const { user, isAdmin, isProfessional } = useAuth();
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

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://www.atlashealth-services.com/b2b/${id}`;

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
      <PublicUnifiedHeader
        brandHref="/"
        loginRedirect={`/b2b/${id}`}
        hideCurrencySelector={true}
        hideAccountManager={true}
        onOpenInquiry={() => setIsInquiryOpen(true)}
        breadcrumb={[
          { label: 'B2B Clinical Portfolio', href: '/pricing' },
          { label: clientName },
        ]}
        extraActions={
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="puh-btn"
              style={{
                background: '#16a34a',
                border: '1px solid #15803d',
                color: '#ffffff',
                fontWeight: 600,
              }}
              title="Share via WhatsApp"
            >
              <MessageCircle size={14} />
              <span className="puh-btn-label">Share</span>
            </button>
            <button
              type="button"
              onClick={() => setIsInquiryOpen(true)}
              className="puh-btn"
              style={{
                background: '#2563eb',
                border: '1px solid #1d4ed8',
                color: '#ffffff',
                fontWeight: 600,
              }}
            >
              <Building2 size={14} />
              <span className="puh-btn-label">Request Allocation</span>
            </button>
          </div>
        }
      />

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

      <PublicUnifiedFooter />

      {/* ── Extracted CSS loaded via ./B2BShowcase.css to prevent SSR FOUC ── */}
    </div>
  );
}

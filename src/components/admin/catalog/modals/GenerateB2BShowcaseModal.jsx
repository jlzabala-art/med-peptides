'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Building2,
  Layers,
  Loader2,
  MessageCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';
import StandardDrawer from '@/components/ui/StandardDrawer';

export default function GenerateB2BShowcaseModal({
  isOpen,
  onClose,
  selectedProducts = [],
}) {
  const [clientName, setClientName] = useState('');
  const [targetSpecialty, setTargetSpecialty] = useState('Longevity & Regenerative Protocols');
  const [lang, setLang] = useState('en');
  const [showPricing, setShowPricing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultShowcase, setResultShowcase] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!selectedProducts || selectedProducts.length === 0) {
      toast.error('Please select at least 1 product.');
      return;
    }

    triggerHaptic('medium');
    setIsGenerating(true);
    setResultShowcase(null);

    try {
      const res = await fetch('/api/ai-generate-b2b-showcase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: selectedProducts,
          clientName: clientName.trim() || 'Institutional Partner',
          targetSpecialty,
          lang,
          showPricing,
          currency: 'EUR'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate B2B showcase');
      }

      triggerHaptic('success');
      toast.success('B2B Mini-Website generated with Gemini AI! 🚀');
      setResultShowcase(data);
    } catch (err) {
      console.error('[GenerateB2BShowcaseModal] Error:', err);
      toast.error(err.message || 'Error creating B2B showcase');
    } finally {
      setIsGenerating(false);
    }
  };

  const showcaseUrl = resultShowcase
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}${resultShowcase.url}`
    : '';

  const handleCopyLink = () => {
    triggerHaptic('light');
    if (showcaseUrl && navigator.clipboard) {
      navigator.clipboard.writeText(showcaseUrl);
      setCopied(true);
      toast.success('Showcase link copied ✓');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    triggerHaptic('light');
    const msg = encodeURIComponent(
      `*Clinical Peptide B2B Portfolio*\n` +
      `Prepared for: ${clientName || 'Partner'}\n` +
      `Specialty: ${targetSpecialty}\n\n` +
      `View interactive mini-website with datasheets & certificates:\n${showcaseUrl}`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Generate B2B Mini-Website (Gemini AI)"
      subtitle="Creates a real-time institutional portfolio linking directly to verified public datasheets."
      width="600px"
    >
      <div className="b2b-drawer-body">
        {!resultShowcase ? (
          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Selected Products Preview Strip */}
            <div className="b2b-selected-strip">
              <span className="b2b-strip-label">
                <Layers size={13} /> Selected Compounds ({selectedProducts.length}):
              </span>
              <div className="b2b-chips-wrap">
                {selectedProducts.slice(0, 10).map((p, idx) => (
                  <span key={idx} className="b2b-chip">
                    {p.canonicalName || p.name}
                  </span>
                ))}
                {selectedProducts.length > 10 && (
                  <span className="b2b-chip b2b-chip--more">+{selectedProducts.length - 10} more</span>
                )}
              </div>
            </div>

            {/* Client / Partner Name */}
            <div>
              <label className="b2b-input-label">
                Institutional Client / Recipient Name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Dr. Roberto Silva • Clínica Longevidad Madrid"
                className="b2b-input"
                required
              />
            </div>

            {/* Specialty & Target Focus */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="b2b-input-label">Clinical Specialty / Portfolio Theme</label>
                <select
                  value={targetSpecialty}
                  onChange={(e) => setTargetSpecialty(e.target.value)}
                  className="b2b-select"
                >
                  <option value="Longevity & Regenerative Protocols">Longevity & Regenerative Medicine</option>
                  <option value="Metabolic Health & Body Composition">Metabolic Health & Weight Management</option>
                  <option value="Tissue Repair & Orthopedic Recovery">Tissue Repair & Orthopedics</option>
                  <option value="Neuro-Endocrine & Cognitive Optimization">Neuro-Endocrine & Cognitive Axis</option>
                  <option value="Skin Cellular Restoration & Cosmeceuticals">Skin Cellular Restoration & Aesthetics</option>
                </select>
              </div>

              <div>
                <label className="b2b-input-label">Editorial Language</label>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="b2b-select"
                >
                  <option value="en">English (International Clinical)</option>
                  <option value="es">Español (Institutional ES)</option>
                </select>
              </div>
            </div>

            {/* Show Pricing Toggle */}
            <label className="b2b-checkbox-label">
              <input
                type="checkbox"
                checked={showPricing}
                onChange={(e) => setShowPricing(e.target.checked)}
              />
              <span>Include Institutional B2B Pricing in Showcase (EUR)</span>
            </label>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isGenerating}
                className="b2b-btn b2b-btn--cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating || selectedProducts.length === 0}
                className="b2b-btn b2b-btn--submit"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="b2b-spin" />
                    <span>Synthesizing with Gemini…</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Generate Live B2B Showcase</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Result Success View */
          <div className="b2b-success-view">
            <div className="b2b-success-badge">
              <ShieldCheck size={24} color="#16a34a" />
            </div>
            <h3 className="b2b-success-title">
              {resultShowcase.showcase?.aiContent?.heroTitle || 'B2B Showcase Ready!'}
            </h3>
            <p className="b2b-success-desc">
              Your live mini-website has been generated with Gemini AI rationale, synergy matrix, and direct links to public datasheets.
            </p>

            <div className="b2b-url-box">
              <input
                type="text"
                readOnly
                value={showcaseUrl}
                className="b2b-url-input"
                onClick={(e) => e.target.select()}
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="b2b-copy-btn"
                title="Copy link"
              >
                {copied ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
              </button>
            </div>

            <div className="b2b-result-actions">
              <button
                type="button"
                onClick={handleWhatsApp}
                className="b2b-btn b2b-btn--wa"
              >
                <MessageCircle size={16} /> <span>Share via WhatsApp</span>
              </button>
              <a
                href={resultShowcase.url}
                target="_blank"
                rel="noopener noreferrer"
                className="b2b-btn b2b-btn--open"
              >
                <span>Open Mini-Website</span>
                <ExternalLink size={16} />
              </a>
            </div>

            <button
              type="button"
              onClick={() => setResultShowcase(null)}
              className="b2b-btn-link"
            >
              ← Create another showcase
            </button>
          </div>
        )}

        <style jsx>{`
          .b2b-drawer-body {
            padding: 0.5rem 0;
          }
          .b2b-selected-strip {
            background: #f1f5f9;
            border-radius: 8px;
            padding: 10px 12px;
          }
          .b2b-strip-label {
            font-size: 0.72rem;
            font-weight: 750;
            color: #475569;
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 6px;
          }
          .b2b-chips-wrap {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
          }
          .b2b-chip {
            background: #ffffff;
            border: 1px solid #cbd5e1;
            color: #1e293b;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.70rem;
            font-weight: 650;
          }
          .b2b-chip--more {
            background: #0284c7;
            border-color: #0284c7;
            color: #ffffff;
          }

          .b2b-input-label {
            display: block;
            font-size: 0.78rem;
            font-weight: 700;
            color: #334155;
            margin-bottom: 4px;
          }
          .b2b-input, .b2b-select {
            width: 100%;
            padding: 9px 12px;
            border-radius: 6px;
            border: 1px solid #dadce0;
            font-size: 0.85rem;
            color: #202124;
            outline: none;
            box-sizing: border-box;
          }
          .b2b-input:focus, .b2b-select:focus {
            border-color: #1a73e8;
            box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
          }

          .b2b-checkbox-label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.8rem;
            font-weight: 600;
            color: #3c4043;
            cursor: pointer;
          }

          .b2b-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 0.84rem;
            font-weight: 600;
            cursor: pointer;
            border: 1px solid transparent;
            transition: all 0.15s ease;
          }
          .b2b-btn--cancel {
            background: #ffffff;
            border-color: #dadce0;
            color: #3c4043;
          }
          .b2b-btn--cancel:hover { background: #f8f9fa; }
          .b2b-btn--submit {
            background: #1a73e8;
            color: #ffffff;
          }
          .b2b-btn--submit:hover:not(:disabled) {
            background: #174ea6;
          }
          .b2b-btn--submit:disabled { opacity: 0.6; cursor: not-allowed; }

          /* Success View */
          .b2b-success-view {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 1rem 0;
          }
          .b2b-success-badge {
            width: 52px;
            height: 52px;
            border-radius: 50%;
            background: #ecfdf5;
            border: 1px solid #a7f3d0;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 0.75rem;
          }
          .b2b-success-title {
            font-size: 1.25rem;
            font-weight: 850;
            color: #0f172a;
            margin: 0 0 0.5rem;
          }
          .b2b-success-desc {
            font-size: 0.85rem;
            color: #64748b;
            max-width: 480px;
            margin: 0 0 1.25rem;
            line-height: 1.5;
          }
          .b2b-url-box {
            display: flex;
            width: 100%;
            max-width: 480px;
            border: 1px solid #dadce0;
            border-radius: 6px;
            overflow: hidden;
            margin-bottom: 1.25rem;
          }
          .b2b-url-input {
            flex: 1;
            border: none;
            padding: 9px 12px;
            font-size: 0.82rem;
            background: #f8fafc;
            color: #202124;
            font-family: monospace;
            outline: none;
          }
          .b2b-copy-btn {
            border: none;
            background: #ffffff;
            padding: 0 14px;
            cursor: pointer;
            border-left: 1px solid #dadce0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #5f6368;
          }
          .b2b-copy-btn:hover { background: #f1f3f4; }

          .b2b-result-actions {
            display: flex;
            gap: 10px;
            width: 100%;
            max-width: 480px;
            margin-bottom: 1rem;
          }
          .b2b-btn--wa {
            flex: 1;
            background: #25d366;
            color: #ffffff;
          }
          .b2b-btn--wa:hover { filter: brightness(1.08); }
          .b2b-btn--open {
            flex: 1;
            background: #1a73e8;
            color: #ffffff;
            text-decoration: none;
          }
          .b2b-btn--open:hover { background: #174ea6; }
          .b2b-btn-link {
            border: none;
            background: transparent;
            color: #5f6368;
            font-size: 0.78rem;
            font-weight: 600;
            cursor: pointer;
          }
          .b2b-btn-link:hover { color: #202124; text-decoration: underline; }

          .b2b-spin { animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </StandardDrawer>
  );
}

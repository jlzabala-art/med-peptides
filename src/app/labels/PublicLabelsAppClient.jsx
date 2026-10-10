'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import PharmacyLabelsModal from '@/components/prescription/PharmacyLabelsModal';
import {
  Search,
  Check,
  Share2,
  Database,
  ShieldCheck,
  User,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  X,
  Copy
} from '@/lib/icons';

// Flagship featured cases for instant 1-click access
const FEATURED_PATIENTS = [
  { code: '51812', name: 'Abdulla Sultan Alotaiba', title: 'Metabolic & Longevity (Parts 1 & 2)' },
  { code: '51857', name: 'Amna Sultan Alotaiba', title: 'Metabolic & Lipid Optimization' },
  { code: '50957', name: 'Alan Maclean Rutledge', title: 'Proteolytic & Mitochondrial' },
  { code: '51861', name: 'Basma Haitham Bouzo', title: 'Topical Scalp & Metabolic' },
  { code: '51811', name: 'Sarah Al Nuaimi', title: 'Hormonal & Transdermal' },
];

export default function PublicLabelsAppClient({
  initialRx,
  initialLabels = [],
  initialCode = '51812',
  initialEditMode = true,
  initialLabelIndex = 0,
  initialLang = 'en'
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [currentRx, setCurrentRx] = useState(initialRx);
  const [labels, setLabels] = useState(initialLabels);
  const [activeCode, setActiveCode] = useState(initialCode);
  const [labelIndex, setLabelIndex] = useState(initialLabelIndex);
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [lang, setLang] = useState(initialLang || 'en');
  const isEs = lang === 'es';

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isLoadingRx, setIsLoadingRx] = useState(false);
  const [copyCodeSuccess, setCopyCodeSuccess] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  const searchBoxRef = useRef(null);
  const searchInputRef = useRef(null);

  // Sync title dynamically
  const patientName = currentRx?.patient?.name || currentRx?.patientName || 'Patient';
  const rxCode = currentRx?.fileNumber || currentRx?.code || activeCode;

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const mode = isEs ? 'Estudio de Etiquetas' : 'Compounding Label Studio';
      document.title = `${mode} • #${rxCode} (${patientName}) • Pharmapolis & Atlas Health`;
    }
  }, [isEs, rxCode, patientName]);

  // Keyboard shortcut ⌘K to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Perform search query (debounced)
  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/labels/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data?.success && Array.isArray(data.results)) {
          setSearchResults(data.results);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.warn('Search fetch error:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load prescription by code
  const handleSelectPatient = async (code) => {
    if (!code) return;
    setSearchOpen(false);
    setIsLoadingRx(true);
    try {
      const res = await fetch(`/api/labels/load?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (data?.success && data.rx) {
        setCurrentRx(data.rx);
        setLabels(data.labels || []);
        setActiveCode(code);
        setLabelIndex(0);

        // Update URL query parameters without full reload
        const newUrl = `/labels?rx=${encodeURIComponent(code)}&phase=1&edit=true&lang=${lang}`;
        window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
      } else {
        alert(isEs ? `No se encontraron datos para la prescripción #${code}` : `No data found for prescription #${code}`);
      }
    } catch (err) {
      console.error('Error loading patient labels:', err);
      alert(isEs ? 'Error al cargar la prescripción' : 'Failed to load prescription');
    } finally {
      setIsLoadingRx(false);
    }
  };

  // Build current shareable deep-link
  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    const phaseParam = (labelIndex != null && labelIndex > 0) ? `&phase=${labelIndex + 1}` : '&phase=1';
    return `${origin}/labels?rx=${encodeURIComponent(activeCode)}${phaseParam}&edit=true&lang=${lang}`;
  };

  // WhatsApp Share handler
  const handleShareWhatsApp = () => {
    if (typeof window === 'undefined') return;
    const url = getShareUrl();
    const currentLabel = labels[labelIndex] || {};
    const formulaTitle = currentLabel.productTitle || currentLabel.productName || currentRx?.treatmentTitle || 'Compounded Pharmaceutical Formula';
    const partInfo = labels.length > 1 ? ` (Part ${labelIndex + 1}/${labels.length})` : '';

    const text = isEs
      ? `🏷️ *Pharmapolis Compounding Label Studio*\n👤 *Paciente:* ${patientName}\n📋 *Prescripción:* #${rxCode}\n💊 *Fórmula${partInfo}:* ${formulaTitle}\n📐 *Especificación:* Vector EU GMP (300 DPI)\n🔗 *Ver y Editar Etiqueta:* ${url}`
      : `🏷️ *Pharmapolis Compounding Label Studio*\n👤 *Patient:* ${patientName}\n📋 *Prescription:* #${rxCode}\n💊 *Formula${partInfo}:* ${formulaTitle}\n📐 *Specification:* Vector EU GMP (300 DPI)\n🔗 *View & Edit Label:* ${url}`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Copy share URL to clipboard
  const handleCopyShareLink = () => {
    if (typeof window === 'undefined') return;
    const url = getShareUrl();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2500);
    }
  };

  // Copy prescription code
  const handleCopyCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(rxCode);
      setCopyCodeSuccess(true);
      setTimeout(() => setCopyCodeSuccess(false), 2000);
    }
  };

  return (
    <div className="public-label-studio-root">
      <style>{`
        .public-label-studio-root {
          min-height: 100vh;
          min-height: 100dvh;
          background: #f8fafc;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          flex-direction: column;
          color: #202124;
        }

        /* Top Google Cloud Header */
        .pls-header {
          background: #ffffff;
          border-bottom: 1px solid #dadce0;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          position: sticky;
          top: 0;
          z-index: 60;
          box-shadow: 0 1px 2px rgba(60,64,67,0.06);
        }

        .pls-brand-link {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: inherit;
          flex-shrink: 0;
        }
        .pls-brand-icon {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 800;
          font-size: 14px;
          box-shadow: 0 1px 3px rgba(26,115,232,0.3);
        }
        .pls-brand-text {
          display: flex;
          flex-direction: column;
        }
        .pls-brand-title {
          font-size: 0.90rem;
          font-weight: 700;
          color: #202124;
          letter-spacing: -0.2px;
          line-height: 1.2;
        }
        .pls-brand-subtitle {
          font-size: 0.68rem;
          color: #5f6368;
          font-weight: 500;
        }

        /* Search input container */
        .pls-search-container {
          position: relative;
          flex: 1;
          max-width: 580px;
          min-width: 220px;
        }
        .pls-search-input-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f1f3f4;
          border: 1px solid transparent;
          border-radius: 8px;
          padding: 6px 12px;
          transition: all 0.2s ease;
        }
        .pls-search-input-wrap:focus-within {
          background: #ffffff;
          border-color: #1a73e8;
          box-shadow: 0 1px 3px rgba(26,115,232,0.25);
        }
        .pls-search-input {
          border: none;
          background: transparent;
          outline: none;
          font-size: 0.85rem;
          color: #202124;
          width: 100%;
        }
        .pls-search-input::placeholder {
          color: #80868b;
        }
        .pls-search-badge {
          font-size: 0.65rem;
          background: #e8eaed;
          color: #5f6368;
          padding: 2px 5px;
          border-radius: 4px;
          font-weight: 600;
          letter-spacing: 0.5px;
          flex-shrink: 0;
        }

        /* Search dropdown */
        .pls-search-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          background: #ffffff;
          border: 1px solid #dadce0;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(60,64,67,0.18);
          max-height: 380px;
          overflow-y: auto;
          z-index: 100;
        }
        .pls-search-item {
          padding: 10px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #f1f3f4;
          cursor: pointer;
          transition: background 0.15s;
        }
        .pls-search-item:last-child {
          border-bottom: none;
        }
        .pls-search-item:hover {
          background: #f8fafd;
        }
        .pls-search-item-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .pls-search-item-name {
          font-size: 0.84rem;
          font-weight: 600;
          color: #202124;
        }
        .pls-search-item-desc {
          font-size: 0.72rem;
          color: #5f6368;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pls-search-item-badge {
          font-size: 0.68rem;
          font-weight: 600;
          color: #1a73e8;
          background: #e8f0fe;
          padding: 3px 8px;
          border-radius: 4px;
          flex-shrink: 0;
        }

        /* Header Actions */
        .pls-actions-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .pls-btn-whatsapp {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #25d366;
          color: #ffffff;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          box-shadow: 0 1px 2px rgba(37,211,102,0.3);
        }
        .pls-btn-whatsapp:hover {
          background: #20ba5a;
        }
        .pls-btn-share {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ffffff;
          color: #3c4043;
          border: 1px solid #dadce0;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }
        .pls-btn-share:hover {
          background: #f8fafd;
          border-color: #1a73e8;
          color: #1a73e8;
        }
        .pls-lang-toggle {
          display: inline-flex;
          background: #f1f3f4;
          padding: 2px;
          border-radius: 4px;
          border: 1px solid #dadce0;
        }
        .pls-lang-btn {
          border: none;
          font-size: 0.70rem;
          padding: 3px 8px;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .pls-lang-btn.active {
          background: #ffffff;
          color: #1a73e8;
          font-weight: 700;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .pls-lang-btn.inactive {
          background: transparent;
          color: #5f6368;
          font-weight: 500;
        }

        /* Patient selector bar */
        .pls-patients-bar {
          background: #ffffff;
          border-bottom: 1px solid #e8eaed;
          padding: 6px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          white-space: nowrap;
          scrollbar-width: none;
        }
        .pls-patients-bar::-webkit-scrollbar {
          display: none;
        }
        .pls-patients-label {
          font-size: 0.72rem;
          font-weight: 600;
          color: #5f6368;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          margin-right: 4px;
          flex-shrink: 0;
        }
        .pls-patient-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 16px;
          font-size: 0.75rem;
          border: 1px solid #dadce0;
          background: #ffffff;
          color: #3c4043;
          cursor: pointer;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .pls-patient-chip:hover {
          border-color: #1a73e8;
          background: #f8fafd;
          color: #1a73e8;
        }
        .pls-patient-chip.active {
          background: #e8f0fe;
          border-color: #1a73e8;
          color: #1a73e8;
          font-weight: 600;
        }

        /* Active Patient Context Strip */
        .pls-context-strip {
          background: #f8fafd;
          border-bottom: 1px solid #dadce0;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .pls-context-patient {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .pls-context-name {
          font-size: 0.92rem;
          font-weight: 700;
          color: #202124;
        }
        .pls-context-meta {
          font-size: 0.76rem;
          color: #5f6368;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .pls-code-pill {
          background: #ffffff;
          border: 1px solid #dadce0;
          padding: 2px 7px;
          border-radius: 4px;
          font-family: monospace;
          font-weight: 600;
          color: #1a73e8;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .pls-code-pill:hover {
          background: #e8f0fe;
          border-color: #1a73e8;
        }

        /* Formula parts pills */
        .pls-parts-tabs {
          display: inline-flex;
          align-items: center;
          background: #e8eaed;
          padding: 2px;
          border-radius: 6px;
          gap: 2px;
        }
        .pls-part-btn {
          border: none;
          font-size: 0.74rem;
          padding: 4px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          color: #5f6368;
          background: transparent;
          transition: all 0.15s;
        }
        .pls-part-btn.active {
          background: #ffffff;
          color: #1a73e8;
          font-weight: 700;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        /* Mobile Adjustments (Golden Rule #23) */
        @media (max-width: 768px) {
          .pls-header {
            padding: 8px 12px !important;
            flex-wrap: wrap !important;
          }
          .pls-search-container {
            order: 3 !important;
            max-width: 100% !important;
            width: 100% !important;
            margin-top: 4px !important;
          }
          .pls-actions-wrap {
            order: 2 !important;
            gap: 6px !important;
          }
          .pls-brand-text {
            display: none !important;
          }
          .pls-btn-whatsapp span,
          .pls-btn-share span {
            display: none !important;
          }
          .pls-btn-whatsapp,
          .pls-btn-share {
            padding: 6px 8px !important;
          }
          .pls-context-strip {
            padding: 8px 12px !important;
          }
        }
      `}</style>

      {/* ── 1. Google Cloud Console Header ── */}
      <header className="pls-header">
        {/* Brand */}
        <Link href="/labels" className="pls-brand-link">
          <div className="pls-brand-icon">
            <span>℞</span>
          </div>
          <div className="pls-brand-text">
            <span className="pls-brand-title">Compounding Label Studio</span>
            <span className="pls-brand-subtitle">Pharmapolis • Atlas Health</span>
          </div>
        </Link>

        {/* Algolia Instant Search Container */}
        <div className="pls-search-container" ref={searchBoxRef}>
          <div className="pls-search-input-wrap">
            <Search size={15} color="#5f6368" />
            <input
              ref={searchInputRef}
              type="text"
              className="pls-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search patient, file #, or prescription code... (⌘K)"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#80868b' }}
              >
                <X size={14} />
              </button>
            )}
            <span className="pls-search-badge">⌘K</span>
          </div>

          {/* Search Dropdown Results */}
          {searchOpen && (
            <div className="pls-search-dropdown">
              <div style={{ padding: '8px 12px', background: '#f8fafc', borderBottom: '1px solid #e8eaed', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.70rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase' }}>
                  {searchQuery ? 'Algolia & Portal Matches' : 'Featured Prescriptions'}
                </span>
                {isSearching && (
                  <span style={{ fontSize: '0.68rem', color: '#1a73e8' }}>
                    Searching...
                  </span>
                )}
              </div>

              {searchResults.length === 0 && !isSearching ? (
                <div style={{ padding: '16px', textAlign: 'center', fontSize: '0.80rem', color: '#80868b' }}>
                  No matching records found.
                </div>
              ) : (
                searchResults.map((item) => (
                  <div
                    key={`${item.code}-${item.id}`}
                    className="pls-search-item"
                    onClick={() => handleSelectPatient(item.code)}
                  >
                    <div className="pls-search-item-info">
                      <div className="pls-search-item-name">
                        {item.patientName || item.name || 'Patient'}
                      </div>
                      <div className="pls-search-item-desc">
                        #{item.code} • {item.title || 'Compounded Pharmaceutical Protocol'}
                      </div>
                    </div>
                    <span className="pls-search-item-badge">
                      #{item.code}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Action Buttons: WhatsApp, Share, Language */}
        <div className="pls-actions-wrap">
          {/* WhatsApp 1-Click Share */}
          <button
            type="button"
            className="pls-btn-whatsapp"
            onClick={handleShareWhatsApp}
            title={isEs ? 'Compartir etiqueta por WhatsApp' : 'Share label via WhatsApp'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.07-.945.07-.63 0-1.472-.258-2.607-1.077-1.631-1.178-2.693-2.92-2.775-3.033-.082-.113-.664-.882-.664-1.684 0-.802.422-1.196.572-1.356.15-.16.328-.201.437-.201.109 0 .219.001.314.006.101.005.235-.038.368.281.137.33.468 1.144.509 1.228.041.084.068.183.013.295-.054.112-.082.182-.163.279-.082.097-.172.217-.246.291-.082.082-.168.172-.072.337.096.165.426.703.914 1.138.629.56 1.159.734 1.324.816.165.082.261.069.358-.041.096-.11.413-.48.523-.645.11-.165.22-.138.371-.083.151.055.959.452 1.124.535.165.083.275.124.316.193.041.069.041.4-.103.805z"/>
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.178L2 22l4.958-1.402C8.423 21.492 10.154 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.628 0-3.141-.453-4.437-1.24l-.318-.194-2.937.83.843-2.861-.212-.338C4.12 15.087 3.6 13.593 3.6 12c0-4.632 3.768-8.4 8.4-8.4 4.633 0 8.4 3.768 8.4 8.4 0 4.633-3.767 8.4-8.4 8.4z"/>
            </svg>
            <span>WhatsApp</span>
          </button>

          {/* Copy Share Link */}
          <button
            type="button"
            className="pls-btn-share"
            onClick={handleCopyShareLink}
            style={{
              borderColor: copiedShareLink ? '#ceead6' : '#dadce0',
              background: copiedShareLink ? '#e6f4ea' : '#ffffff',
              color: copiedShareLink ? '#137333' : '#3c4043'
            }}
            title={isEs ? 'Copiar enlace público del estudio' : 'Copy public studio link'}
          >
            {copiedShareLink ? <Check size={14} color="#137333" /> : <Share2 size={14} />}
            <span>{copiedShareLink ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Compartir' : 'Share')}</span>
          </button>

          {/* Language Switcher */}
          <div className="pls-lang-toggle">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`pls-lang-btn ${!isEs ? 'active' : 'inactive'}`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('es')}
              className={`pls-lang-btn ${isEs ? 'active' : 'inactive'}`}
            >
              ES
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. Quick-Pick Patient Bar (Flagship Clinical Cases) ── */}
      <div className="pls-patients-bar">
        <span className="pls-patients-label">
          {isEs ? 'Pacientes:' : 'Patients:'}
        </span>
        {FEATURED_PATIENTS.map((p) => {
          const isActive = String(activeCode) === String(p.code);
          return (
            <button
              key={p.code}
              type="button"
              className={`pls-patient-chip ${isActive ? 'active' : ''}`}
              onClick={() => handleSelectPatient(p.code)}
            >
              <User size={12} />
              <span>#{p.code} • {p.name}</span>
            </button>
          );
        })}
      </div>

      {/* ── 3. Active Patient & Formula Context Strip ── */}
      <div className="pls-context-strip">
        <div className="pls-context-patient">
          <div className="pls-context-name">
            {patientName}
          </div>
          <div className="pls-context-meta">
            <span>Prescription</span>
            <button
              type="button"
              className="pls-code-pill"
              onClick={handleCopyCode}
              title={isEs ? 'Copiar código de prescripción' : 'Copy prescription code'}
            >
              <span>#{rxCode}</span>
              {copyCodeSuccess ? <Check size={11} color="#137333" /> : <Copy size={11} />}
            </button>
            <span>•</span>
            <span style={{ color: '#202124', fontWeight: 600 }}>
              {currentRx?.doctorName || 'Dr. Marina Cordeiro Fernandes'}
            </span>
          </div>
        </div>

        {/* Formula Parts Switcher (Part 1 / Part 2) */}
        {labels.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: '#5f6368', fontWeight: 600, textTransform: 'uppercase' }}>
              {isEs ? 'Fórmula:' : 'Formula:'}
            </span>
            <div className="pls-parts-tabs">
              {labels.map((lbl, idx) => {
                const isActive = labelIndex === idx;
                const labelText = lbl.partLabel || `Part ${idx + 1}`;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`pls-part-btn ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setLabelIndex(idx);
                      const newUrl = `/labels?rx=${encodeURIComponent(activeCode)}&phase=${idx + 1}&edit=true&lang=${lang}`;
                      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
                    }}
                  >
                    {labelText}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── 4. Main Independent Label Studio Workspace ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {isLoadingRx ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#5f6368', fontSize: '0.90rem' }}>
            <p>{isEs ? 'Cargando datos de prescripción y formulación magistral...' : 'Loading prescription & compounding formulations...'}</p>
          </div>
        ) : (
          <PharmacyLabelsModal
            key={`${activeCode}-${labelIndex}`}
            isOpen={true}
            onClose={() => {
              // Standalone mode maintains workspace
            }}
            labels={labels}
            initialLabelIndex={labelIndex}
            initialEditMode={isEditing}
            isStandalone={true}
            isEs={isEs}
          />
        )}
      </main>
    </div>
  );
}

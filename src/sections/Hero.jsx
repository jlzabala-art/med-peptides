import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useResponsive } from '../hooks/useResponsive';
import { useNavigate } from 'react-router-dom';
import { Search, Bot, FileText, Lock, UploadCloud, ArrowRight, Shield } from 'lucide-react';
import '../styles/hero.css';

export default function Hero({ onOpenSearch, onOpenAI }) {
  const { user } = useAuth();
  const isMobile = useResponsive('(max-width: 768px)');
  const navigate = useNavigate();

  // Search card state
  const [searchQuery, setSearchQuery] = useState('');
  const searchChips = ['Recovery', 'Longevity', 'Cognitive', 'Sleep', 'Metabolic', 'Hormonal', 'Athletic'];

  // Ask card state
  const [askQuery, setAskQuery] = useState('');

  // Search submit
  const handleSearchSubmit = (val = searchQuery) => {
    if (!val?.trim()) return;
    if (onOpenSearch) onOpenSearch(val);
    setSearchQuery('');
  };

  // Ask submit
  const handleAskSubmit = (val = askQuery) => {
    if (!val?.trim()) return;
    if (onOpenAI) {
      onOpenAI(val);
    } else {
      sessionStorage.setItem('ai_seed_query', val);
      window.dispatchEvent(
        new CustomEvent('open-clinical-ai', {
          detail: { query: val, autoSend: true }
        })
      );
    }
    setAskQuery('');
  };

  // Prescription handler
  const handleUploadTrigger = (e) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent('open-clinical-ai', {
        detail: { query: '', autoSend: false }
      })
    );
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('trigger-prescription-upload'));
    }, 150);
  };

  const handleLoginRedirect = () => {
    navigate('/login?tab=register');
  };

  return (
    <section className="hero-section">
      <div className="hero-section__bg-glow" aria-hidden="true" />

      <div className="hero-container">
        
        {/* HEADER */}
        <header className="hero-header">
          <span className="hero-tagline">Google Cloud Agent Platform</span>
          <h1 className="hero-headline">Optimize by Goal</h1>
          <p className="hero-subheadline">
            Peptides, supplements and guided pathways — powered by ClinicAI.
          </p>
          <p className="hero-supporting">
            Explore evidence-guided pathways for recovery, cognition, sleep, metabolism and healthy aging.
          </p>
          <span className="hero-helper-text">How can we help today?</span>
        </header>

        {/* PRIMARY ACTIONS (ROW 1: FIND & ASK) & ROW 2: PROFESSIONAL TOOLS */}
        <div className="hero-grid">
          
          {/* FIND CARD */}
          <div className="hero-card card-find">
            <div className="card-header-row">
              <div className="icon-box"><Search size={20} /></div>
              <h3 className="card-title">I know what I want</h3>
            </div>
            {!isMobile && (
              <p className="card-desc">Search goals, compounds and protocol pathways.</p>
            )}
            
            <div className="card-form">
              <input
                className="card-input"
                type="text"
                placeholder="What are you trying to improve?"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()}
              />
              <button className="card-cta" onClick={() => handleSearchSubmit()}>
                Find <ArrowRight size={14} />
              </button>
            </div>

            {!isMobile && (
              <>
                <small className="card-helper">Search directly</small>
                <div className="chip-row">
                  {searchChips.map(chip => (
                    <button
                      key={chip}
                      className="chip"
                      onClick={() => handleSearchSubmit(chip)}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ASK CARD */}
          <div className="hero-card card-ask">
            <div className="card-header-row">
              <div className="icon-box"><Bot size={20} /></div>
              <h3 className="card-title">Help me choose</h3>
            </div>
            {!isMobile && (
              <p className="card-desc">Talk with ClinicAI to discover relevant pathways.</p>
            )}
            
            <div className="card-form">
              <input
                className="card-input"
                type="text"
                placeholder="Describe your goal"
                value={askQuery}
                onChange={e => setAskQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAskSubmit()}
              />
              <button className="card-cta" onClick={() => handleAskSubmit()}>
                Ask <ArrowRight size={14} />
              </button>
            </div>

            {!isMobile && (
              <div className="suggestions-list">
                <button className="suggestion-item" onClick={() => handleAskSubmit('Build a recovery protocol')}>
                  Build a recovery protocol
                </button>
                <button className="suggestion-item" onClick={() => handleAskSubmit('Compare compounds')}>
                  Compare compounds
                </button>
                <button className="suggestion-item" onClick={() => handleAskSubmit('Improve sleep')}>
                  Improve sleep
                </button>
              </div>
            )}
          </div>

          {/* SECONDARY PROFESSIONAL AREA (ROW 2: UPLOAD PRESCRIPTION) */}
          <div className="hero-card card-prescription">
            <div className="prescription-layout">
              <div className="presc-left">
                <div className="icon-box"><FileText size={18} /></div>
                <div>
                  <h3 className="card-title">Professional Tools</h3>
                  {!isMobile && (
                    <p className="card-desc" style={{ margin: 0 }}>
                      Prescription analysis and formulation matching.
                    </p>
                  )}
                </div>
              </div>

              <div className="presc-right">
                {!user ? (
                  <div className="guest-action">
                    {!isMobile && <span className="helper-label">Professional access required.</span>}
                    <button className="card-cta secondary" onClick={handleLoginRedirect}>
                      <Lock size={12} /> Login
                    </button>
                  </div>
                ) : (
                  <div className="logged-action">
                    {!isMobile && <span className="flow-indicator">Prescription → Catalog → Cart</span>}
                    <button className="card-cta" onClick={handleUploadTrigger}>
                      <UploadCloud size={12} /> Upload
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* TRUST BAR */}
        <div className="trust-bar">
          <span className="trust-item">Evidence-guided</span>
          <span className="trust-item">Global access</span>
          <span className="trust-item">Documentation available</span>
          <span className="trust-item">AI-assisted</span>
        </div>

      </div>
    </section>
  );
}
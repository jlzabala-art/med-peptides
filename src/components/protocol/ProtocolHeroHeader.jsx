import React, { useState, useRef, useEffect } from 'react';
import CategoryProtocolNavigator from './CategoryProtocolNavigator';
import ProtocolHeaderCharts from './ProtocolHeaderCharts';
import {
  Calendar,
  ChevronDown,
  Download,
  FlaskConical,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Users,
  Zap,
} from '@/lib/icons';

/**
 * ProtocolHeroHeader
 * Encapsulates the sticky top action bar, CategoryProtocolNavigator,
 * Hero identity block, quick-stat pills, PDF export dropdowns, and ProtocolHeaderCharts.
 */
export default function ProtocolHeroHeader({
  protocol,
  slug,
  isMed,
  isExporting,
  scrolled,
  stickyTotal = 0,
  shortCode,
  handleExportPdf,
  setIsCalendarModalOpen,
  isClinicAIOpen,
  setIsClinicAIOpen,
  handleChartRef,
  displayTitle,
  version,
  tagline,
  intensity,
  dailyDoseSource,
  primaryGoal,
  goalMeta,
}) {
  const [pdfDropdownOpen, setPdfDropdownOpen] = useState(false);
  const pdfDropdownRef = useRef(null);
  const [heroPdfDropdownOpen, setHeroPdfDropdownOpen] = useState(false);
  const heroPdfDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pdfDropdownRef.current && !pdfDropdownRef.current.contains(event.target)) {
        setPdfDropdownOpen(false);
      }
      if (heroPdfDropdownRef.current && !heroPdfDropdownRef.current.contains(event.target)) {
        setHeroPdfDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const GoalIcon = goalMeta?.icon || FlaskConical;

  return (
    <>
      {/* ── Sticky Scroll Header ── */}
      <div className={`proto-sticky-header${scrolled ? ' proto-sticky-header--visible' : ''}`}>
        <div className="container proto-sticky-header__inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                flexShrink: 0,
                background: goalMeta?.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GoalIcon size={14} color="white" />
            </div>
            {shortCode && (
              <span
                style={{
                  fontSize: '0.65rem',
                  fontFamily: 'monospace',
                  letterSpacing: '0.07em',
                  fontWeight: 700,
                  color: 'var(--color-text-secondary)',
                  flexShrink: 0,
                }}
              >
                {shortCode}
              </span>
            )}
            <span className="proto-sticky-header__name">{displayTitle}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {stickyTotal > 0 && (
              <span
                style={{
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: 'white',
                  letterSpacing: '-0.02em',
                  background: 'rgba(0,0,0,0.2)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                }}
              >
                ${stickyTotal}
              </span>
            )}
            <button
              onClick={() => {
                const supplySection = document.getElementById(slug + '_supply') || document.querySelector('.proto-supply-engine');
                if (supplySection) {
                  supplySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.4rem 1rem',
                color: 'var(--color-bg-surface)',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s ease',
                textTransform: 'uppercase',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02) translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1) translateY(0)'; }}
            >
              <ShoppingCart size={14} />
              <span>Add to Order</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setIsClinicAIOpen(!isClinicAIOpen)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.4rem 0.8rem',
                color: 'var(--color-bg-surface)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <Sparkles size={12} />
              <span>ClinicAI</span>
            </button>

            <div style={{ position: 'relative' }} ref={pdfDropdownRef}>
              <button
                className="proto-sticky-header__pdf"
                onClick={() => {
                  if (isMed) {
                    setPdfDropdownOpen(!pdfDropdownOpen);
                  } else {
                    handleExportPdf('patient', 'sticky_header');
                  }
                }}
                disabled={isExporting}
                style={{
                  opacity: isExporting ? 0.7 : 1,
                  cursor: isExporting ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'var(--color-bg-surface)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              >
                <Download size={12} />
                <span>{isExporting ? 'Generating...' : 'Generate PDF'}</span>
                {isMed && (
                  <ChevronDown
                    size={12}
                    style={{
                      transition: 'transform 0.2s',
                      transform: pdfDropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                    }}
                  />
                )}
              </button>

              {isMed && pdfDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    background: 'var(--color-text-primary)',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
                    zIndex: 1000,
                    minWidth: '160px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <button
                    onClick={() => {
                      setPdfDropdownOpen(false);
                      handleExportPdf('patient', 'sticky_header');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '0.6rem 1rem',
                      color: 'var(--color-bg-app)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textAlign: 'left',
                      cursor: 'pointer',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-text-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <Users size={12} color="var(--color-text-tertiary)" />
                    Patient Version
                  </button>
                  <button
                    onClick={() => {
                      setPdfDropdownOpen(false);
                      handleExportPdf('clinical', 'sticky_header');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '0.6rem 1rem',
                      color: 'var(--color-bg-app)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textAlign: 'left',
                      cursor: 'pointer',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      borderTop: '1px solid #334155',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-text-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <FlaskConical size={12} color="var(--color-text-tertiary)" />
                    Clinical Version
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsCalendarModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'var(--color-bg-surface)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            >
              <Calendar size={12} />
              <span>Export Calendar</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="proto-detail__hero">
        <div className="container">
          <CategoryProtocolNavigator
            currentSlug={protocol.protocol_id || protocol.id || slug}
            primaryGoal={primaryGoal}
            goalLabel={goalMeta?.label}
            goalGradient={goalMeta?.gradient}
          />

          <div
            className="proto-hero-identity glass-panel"
            style={{
              padding: '1.5rem',
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                flexShrink: 0,
                background: goalMeta?.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
              }}
            >
              <GoalIcon size={34} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.55)',
                  marginBottom: '0.45rem',
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                }}
              >
                {goalMeta?.label}
              </div>

              <h1
                className="proto-detail__hero-title"
                style={{
                  margin: '0 0 0.3rem',
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.1,
                  fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                }}
              >
                {displayTitle}
              </h1>

              {version && (
                <div style={{ marginTop: '0.3rem' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                      letterSpacing: '0.06em',
                      fontWeight: 600,
                      background: 'rgba(255,255,255,0.12)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 5,
                      backdropFilter: 'blur(4px)',
                      color: 'rgba(255,255,255,0.8)',
                    }}
                  >
                    Version {version}
                  </span>
                </div>
              )}
            </div>
          </div>

          {tagline && <p className="proto-detail__hero-tagline">{tagline}</p>}

          <div
            className="proto-detail__stats"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginTop: '1rem',
            }}
          >
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="proto-stat">
                <Zap size={14} />
                <span className="proto-stat__val">{intensity}</span>
                <span className="proto-stat__label">Intensity</span>
              </div>
              {dailyDoseSource === 'clinic' && (
                <div
                  className="proto-stat"
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <ShieldCheck size={14} color="var(--color-success)" />
                  <span className="proto-stat__val" style={{ color: 'var(--color-success)' }}>
                    Clinic Dosing Active
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ position: 'relative' }} ref={heroPdfDropdownRef}>
                <button
                  onClick={() => {
                    if (isMed) {
                      setHeroPdfDropdownOpen(!heroPdfDropdownOpen);
                    } else {
                      handleExportPdf('patient', 'hero');
                    }
                  }}
                  disabled={isExporting}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '0.75rem 1.3rem',
                    color: 'var(--color-bg-surface)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: isExporting ? 'wait' : 'pointer',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(8px)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
                >
                  <Download size={16} />
                  <span>{isExporting ? 'Generating PDF...' : 'Generate PDF'}</span>
                  {isMed && (
                    <ChevronDown
                      size={14}
                      style={{
                        transition: 'transform 0.2s',
                        transform: heroPdfDropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                      }}
                    />
                  )}
                </button>

                {isMed && heroPdfDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '0.5rem',
                      background: 'var(--color-text-primary)',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
                      zIndex: 1000,
                      minWidth: '180px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <button
                      onClick={() => {
                        setHeroPdfDropdownOpen(false);
                        handleExportPdf('patient', 'hero');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '0.8rem 1.2rem',
                        color: 'var(--color-bg-app)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textAlign: 'left',
                        cursor: 'pointer',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-text-primary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      <Users size={14} color="var(--color-text-tertiary)" />
                      Patient Version
                    </button>
                    <button
                      onClick={() => {
                        setHeroPdfDropdownOpen(false);
                        handleExportPdf('clinical', 'hero');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '0.8rem 1.2rem',
                        color: 'var(--color-bg-app)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textAlign: 'left',
                        cursor: 'pointer',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        borderTop: '1px solid #334155',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-text-primary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      <FlaskConical size={14} color="var(--color-text-tertiary)" />
                      Clinical Version
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsCalendarModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  padding: '0.75rem 1.3rem',
                  color: 'var(--color-bg-surface)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(8px)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
              >
                <Calendar size={16} />
                <span>Export Calendar</span>
              </button>
            </div>
          </div>

          <ProtocolHeaderCharts protocol={protocol} onChartRef={handleChartRef} />
        </div>
      </div>
    </>
  );
}

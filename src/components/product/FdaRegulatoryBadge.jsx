"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, AlertCircle, Info, ExternalLink, X, CheckCircle2, FlaskConical, RefreshCw, Calendar, Sparkles } from '@/lib/icons';
import { getFdaPeptideStatus } from '@/data/fdaPeptidesRegistry';
import notifier from '@/services/NotificationService';

/**
 * FdaRegulatoryBadge
 * 
 * Displays the verified FDA regulatory status badge across datasheets, catalog cards, and B2B views.
 * Clicking opens a detailed clinical and regulatory compliance breakdown.
 * Includes interactive on-demand Gemini AI refresh to verify the latest FDA regulatory standing.
 */
export default function FdaRegulatoryBadge({
  product,
  variant = 'badge', // 'badge', 'banner', 'pill', 'compact'
  showModalOnClick = true,
  style = {}
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const initialInfo = useMemo(() => getFdaPeptideStatus(product), [product]);
  const [currentInfo, setCurrentInfo] = useState(initialInfo);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setCurrentInfo(getFdaPeptideStatus(product));
  }, [product]);

  if (!currentInfo) return null;

  const info = currentInfo;
  const { colorScheme } = info;

  const handleRefreshFdaStatus = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/enrich-fda-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product?.id || product?.slug || info.slug,
          slug: product?.slug || info.slug,
          productName: info.canonicalName || product?.canonicalName || product?.name,
          casNumber: info.casNumber || product?.casNumber,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to query FDA regulatory status');
      }

      const data = await res.json();
      const regData = data.data || data.regulatory;
      if (regData) {
        const updated = {
          ...info,
          ...regData,
          updatedAt: regData.updatedAt || new Date().toISOString(),
          colorScheme: regData.colorScheme || info.colorScheme,
        };
        setCurrentInfo(updated);
        notifier.success(`FDA status updated to latest standing (${updated.shortBadge || updated.badgeLabel}) ✓`);
      } else {
        notifier.info('FDA status is already at the latest standing.');
      }
    } catch (err) {
      console.error('[FdaRegulatoryBadge] Refresh error:', err);
      notifier.error(`Error checking FDA: ${err.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDisplayDate = (dateVal) => {
    if (!dateVal) return 'Current';
    const parsed = new Date(dateVal);
    if (!isNaN(parsed.getTime()) && String(dateVal).includes('T')) {
      return parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    return String(dateVal);
  };

  const handleClick = (e) => {
    if (showModalOnClick) {
      e.stopPropagation();
      e.preventDefault();
      setIsModalOpen(true);
    }
  };

  return (
    <>
      {/* ── 1. HERO PILL VARIANT (For Public Datasheet Hero) ── */}
      {variant === 'hero-pill' && (
        <button
          type="button"
          onClick={handleClick}
          className="pds-fda-hero-pill gcp-pill-base gcp-pill-md"
          style={{
            borderRadius: '9999px',
            backgroundColor: colorScheme.bg,
            border: `1px solid ${colorScheme.border}`,
            color: colorScheme.text,
            cursor: showModalOnClick ? 'pointer' : 'default',
            outline: 'none',
            ...style
          }}
          title={`${info.badgeLabel} — Click for clinical regulatory monograph`}
        >
          {info.status === 'fda_approved' ? (
            <CheckCircle2 size={12} color="#15803d" style={{ flexShrink: 0 }} />
          ) : (
            <ShieldCheck size={12} color={colorScheme.accent || colorScheme.text} style={{ flexShrink: 0 }} />
          )}
          <span>{info.shortBadge || info.badgeLabel}</span>
          {showModalOnClick && (
            <Info size={11} style={{ opacity: 0.65, marginLeft: '1px', flexShrink: 0 }} />
          )}
        </button>
      )}

      {/* ── 2. COMPACT PILL VARIANT (For catalog cards & tables) ── */}
      {variant === 'pill' && (
        <span
          onClick={handleClick}
          className="gcp-pill-base gcp-pill-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '12px',
            backgroundColor: colorScheme.bg,
            border: `1px solid ${colorScheme.border}`,
            color: colorScheme.text,
            fontSize: '0.70rem',
            fontWeight: 700,
            cursor: showModalOnClick ? 'pointer' : 'default',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
            ...style
          }}
          title={`${info.badgeLabel} — Click for regulatory details`}
        >
          <span>{colorScheme.icon}</span>
          <span>{info.shortBadge}</span>
        </span>
      )}

      {/* ── 2. STANDARD BADGE VARIANT (For trust badge rows & sidebars) ── */}
      {variant === 'badge' && (
        <button
          type="button"
          onClick={handleClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '8px',
            backgroundColor: colorScheme.bg,
            border: `1px solid ${colorScheme.border}`,
            color: colorScheme.text,
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: showModalOnClick ? 'pointer' : 'default',
            textAlign: 'left',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            ...style
          }}
          title="Click to view FDA PCAC 503A regulatory details"
        >
          <span style={{ fontSize: '0.88rem' }}>{colorScheme.icon}</span>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontWeight: 800 }}>{info.badgeLabel}</span>
            <span style={{ fontSize: '0.64rem', opacity: 0.85 }}>{info.advisoryBody} ({info.rulingDate})</span>
          </div>
          {showModalOnClick && <Info size={12} style={{ opacity: 0.7, marginLeft: 'auto' }} />}
        </button>
      )}

      {/* ── 3. FULL BANNER VARIANT (For Datasheet Top / Clinical Overview) ── */}
      {variant === 'banner' && (
        <div
          onClick={handleClick}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '10px',
            backgroundColor: colorScheme.bg,
            border: `1px solid ${colorScheme.border}`,
            cursor: showModalOnClick ? 'pointer' : 'default',
            transition: 'all 0.15s ease',
            ...style
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              border: `1px solid ${colorScheme.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              flexShrink: 0
            }}
          >
            {colorScheme.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 800, color: colorScheme.text }}>
                {info.badgeLabel}
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '4px',
                  backgroundColor: '#ffffff',
                  color: colorScheme.accent,
                  border: `1px solid ${colorScheme.border}`
                }}
              >
                {info.rulingDate}
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.76rem', color: '#334155', lineHeight: 1.45 }}>
              {info.summary}
            </p>
          </div>
          {showModalOnClick && (
            <button
              type="button"
              style={{
                border: 'none',
                background: 'none',
                color: colorScheme.text,
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: 0,
                flexShrink: 0
              }}
            >
              Details <Info size={13} />
            </button>
          )}
        </div>
      )}

      {/* ── 4. COMPLIANCE & LEGAL DISCLOSURE MODAL ── */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: '16px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              animation: 'fadeIn 0.15s ease-out'
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                backgroundColor: colorScheme.bg,
                borderBottom: `1px solid ${colorScheme.border}`,
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>{colorScheme.icon}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: colorScheme.text }}>
                    FDA & Regulatory Classification
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    {info.canonicalName} {info.casNumber ? `(CAS: ${info.casNumber})` : ''}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  color: '#64748b',
                  borderRadius: '6px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
              {/* Classification Summary Card */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Official Advisory Finding
                </div>
                <div style={{ fontSize: '0.90rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                  {info.voteResult}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px', lineHeight: 1.45 }}>
                  {info.summary}
                </div>
              </div>

              {/* Committee Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Advisory Body</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>
                    {info.advisoryBody}
                  </div>
                </div>

                <div style={{ padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                    {info.phase ? 'Clinical Phase' : 'Review Date'}
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>
                    {info.phase || info.rulingDate}
                  </div>
                </div>
              </div>

              {/* Last Verified Timestamp & Status Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '8px',
                  fontSize: '0.74rem',
                  color: '#334155'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={13} color="#64748b" />
                  <span>
                    Last Updated: <strong>{formatDisplayDate(info.updatedAt || info.rulingDate)}</strong>
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.70rem', color: '#059669', fontWeight: 600 }}>
                  <CheckCircle2 size={12} color="#059669" />
                  <span>FDA Monograph</span>
                </div>
              </div>

              {/* Legal & Medical Notice */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fef3c7',
                  color: '#92400e',
                  fontSize: '0.74rem',
                  lineHeight: 1.5
                }}
              >
                <strong>Compliance Disclosure:</strong> {info.legalNotice}
                <div style={{ marginTop: '6px', fontSize: '0.70rem', color: '#b45309' }}>
                  Compounded preparations must comply with federal section 503A / 503B quality guidelines and state pharmacy board regulations.
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 20px',
                backgroundColor: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                flexShrink: 0,
                gap: '12px'
              }}
            >
              <button
                type="button"
                onClick={handleRefreshFdaStatus}
                disabled={isRefreshing}
                className="gcp-btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  color: '#003666',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  cursor: isRefreshing ? 'wait' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Query Gemini AI to check latest FDA rulings, clinical trials and PCAC lists"
              >
                <RefreshCw
                  size={13}
                  style={{
                    animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
                  }}
                />
                <Sparkles size={12} color="#7c3aed" />
                <span>{isRefreshing ? 'Checking FDA with Gemini...' : 'Verify Latest FDA Status'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="gcp-btn-primary"
                style={{ padding: '6px 16px', fontSize: '0.80rem', fontWeight: 600, borderRadius: '6px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Sparkles, ArrowRight, List, ShoppingBag, Share2, WifiOff } from 'lucide-react';
import { useB2BOrder } from '@/hooks/useB2BOrder';
import { getPublicAiPreset } from '@/config/publicAiPresets';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';
import './PublicStickyActionBar.css';

const PublicAtlasAIDrawer = dynamic(
  () => import('./PublicAtlasAIDrawer'),
  { ssr: false }
);

/**
 * PublicStickyActionBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified, persistent bottom action bar for Public Datasheets (/p/[slug])
 * and Public Protocol Pages (/proto/[slug]).
 *
 * Adheres to GCP console standards:
 * - Persistent primary action (Inquire) and integrated Clinical AI Copilot.
 * - Persistent Table of Contents / Sections trigger integrated on mobile & desktop.
 * - Always visible across desktop, tablet, and mobile.
 * - Keeps active entity context (Product or Protocol name + specs) clear.
 * - Synchronizes remaining AI quota with PublicAtlasAIDrawer in real-time.
 * - Encapsulates and lazy-loads PublicAtlasAIDrawer with zero initial bundle overhead.
 */
export default function PublicStickyActionBar({
  title,
  subtitle,
  badge = null,
  badgeType = 'default',
  inquireLabel = 'Inquire',
  onInquire,
  showClinicalAI = true,
  onOpenClinicalAI = null,
  aiPreset = null,
  aiContextQuery = null,
  aiCategory = null,
  aiMeta = {},
  mountAiDrawer = true,
  drawerProps = {},
  lang = 'en',
  onOpenSections = null,
  showSections = false,
  sectionsCount = null,
  activeSectionIndex = null,
  sectionsLabel = null,
  extraActions = null,
  children = null,
}) {
  const { totalCount, subtotal, openDrawer } = useB2BOrder();
  const [_quota, setQuota] = useState({ remaining: 5, limit: 5 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [tocProgress, setTocProgress] = useState({
    currentProgress: activeSectionIndex || 1,
    totalSections: sectionsCount || 0,
    hasToc: Boolean(showSections || onOpenSections),
  });

  // Track online/offline status
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsOnline(navigator.onLine);
    const setOnline = () => setIsOnline(true);
    const setOffline = () => {
      setIsOnline(false);
      toast(lang === 'es' ? 'Modo sin conexión · Datos en caché disponibles' : 'Offline mode · Cached data available', {
        icon: '⚡',
        duration: 3500,
      });
    };
    window.addEventListener('online', setOnline);
    window.addEventListener('offline', setOffline);
    return () => {
      window.removeEventListener('online', setOnline);
      window.removeEventListener('offline', setOffline);
    };
  }, [lang]);

  // Track reading scroll progress (0 to 100%)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 1. Fetch initial sandbox IP quota status
  useEffect(() => {
    let isMounted = true;
    fetch('/api/ai-chat?scope=public_sandbox')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (typeof data.remaining === 'number') {
          setQuota({
            remaining: data.remaining,
            limit: data.limit || 5,
          });
        }
      })
      .catch(() => {
        // Non-blocking quota lookup
      });

    // 2. Synchronize when PublicAtlasAIDrawer dispatches updates
    const handleQuotaUpdate = (e) => {
      if (e.detail && typeof e.detail.remaining === 'number') {
        setQuota({
          remaining: e.detail.remaining,
          limit: e.detail.limit || 5,
        });
      }
    };

    // 3. Synchronize TOC sections progress in real-time
    const handleTocUpdate = (e) => {
      if (e.detail) {
        setTocProgress({
          currentProgress: e.detail.currentProgress || 1,
          totalSections: e.detail.totalSections || 0,
          hasToc: true,
        });
      }
    };

    window.addEventListener('atlas-quota-updated', handleQuotaUpdate);
    window.addEventListener('datasheet-toc-progress', handleTocUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('atlas-quota-updated', handleQuotaUpdate);
      window.removeEventListener('datasheet-toc-progress', handleTocUpdate);
    };
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.add('has-sticky-bottom-bar');
      return () => {
        document.body.classList.remove('has-sticky-bottom-bar');
      };
    }
  }, []);

  const handleOpenAI = () => {
    triggerHaptic('light');
    if (onOpenClinicalAI) {
      onOpenClinicalAI();
    }
    if (typeof window !== 'undefined') {
      const plainTitle = typeof title === 'string' ? title : 'Atlas Resource';
      let resolvedCategory = aiCategory || (typeof badge === 'string' ? badge : 'Clinical');
      let resolvedQuery = aiContextQuery;

      if (!resolvedQuery && aiPreset) {
        const preset = getPublicAiPreset({
          type: aiPreset,
          title: plainTitle,
          category: resolvedCategory,
          lang,
          meta: aiMeta
        });
        resolvedQuery = preset.query;
        if (!aiCategory) resolvedCategory = preset.category;
      }

      const fallbackQuery = lang === 'es' 
        ? `¿Qué aplicaciones clínicas, evidencia y pautas tiene ${plainTitle}?`
        : `What are the clinical applications, evidence, and guidelines for ${plainTitle}?`;

      window.dispatchEvent(new CustomEvent('open-public-atlas-ai', {
        detail: {
          productName: plainTitle,
          category: resolvedCategory,
          initialQuery: resolvedQuery || fallbackQuery
        }
      }));
    }
  };

  const handleOpenSections = () => {
    triggerHaptic('selection');
    if (onOpenSections) {
      onOpenSections();
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-datasheet-toc'));
    }
  };

  const handleShare = async () => {
    triggerHaptic('selection');
    const plainTitle = typeof title === 'string' ? `${title} · Atlas Health` : 'Atlas Health';
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: plainTitle,
          text: typeof subtitle === 'string' ? subtitle : 'Clinical Specifications & Monograph',
          url: currentUrl,
        });
        return;
      } catch (err) {
        if (err?.name === 'AbortError') return;
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      toast.success(lang === 'es' ? 'Enlace clínico copiado al portapapeles ✓' : 'Clinical link copied to clipboard ✓');
    }
  };

  const getBadgeClass = () => {
    if (badgeType === 'diagnostic') return 'public-sticky-action-bar__badge public-sticky-action-bar__badge--diagnostic';
    if (badgeType === 'protocol') return 'public-sticky-action-bar__badge public-sticky-action-bar__badge--protocol';
    return 'public-sticky-action-bar__badge';
  };

  const hasSectionsOutline = Boolean(showSections || onOpenSections || tocProgress.hasToc);

  return (
    <>
      {/* ── Top Viewport Reading Progress Bar ── */}
      <div
        className="public-reading-progress-bar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: `${scrollProgress}%`,
          height: '3px',
          background: 'linear-gradient(90deg, #38bdf8 0%, #0284c7 50%, #003666 100%)',
          zIndex: 99999,
          pointerEvents: 'none',
          transition: 'width 0.1s cubic-bezier(0, 0, 0.2, 1)',
          boxShadow: '0 0 8px rgba(56, 189, 248, 0.6)'
        }}
      />

      {/* ── Offline Network Status Pill ── */}
      {!isOnline && (
        <div
          style={{
            position: 'fixed',
            top: '6px',
            right: '12px',
            zIndex: 99998,
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #334155',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '0.72rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <WifiOff size={12} color="#f59e0b" />
          <span>{lang === 'es' ? 'Modo sin conexión · Caché local activa' : 'Offline Mode · Local Cache Active'}</span>
        </div>
      )}

      <aside className="public-sticky-action-bar" aria-label="Quick Actions">
        <div className="public-sticky-action-bar__container">
          {/* Left: Entity Context Identity */}
          <div className="public-sticky-action-bar__info">
            <div className="public-sticky-action-bar__meta-row">
              {badge && (
                React.isValidElement(badge) ? badge : <span className={getBadgeClass()}>{badge}</span>
              )}
              <div className="public-sticky-action-bar__title" title={typeof title === 'string' ? title : undefined}>
                {title}
              </div>
            </div>
            {subtitle && (
              <div className="public-sticky-action-bar__subtitle" title={typeof subtitle === 'string' ? subtitle : undefined}>
                {subtitle}
              </div>
            )}
          </div>

          {/* Right: Actions Cluster */}
          <div className="public-sticky-action-bar__actions">
            {extraActions}
            {children}

            {/* Native 1-Tap Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className="public-sticky-action-bar__share-btn"
              title={lang === 'es' ? 'Compartir ficha clínica' : 'Share clinical monograph'}
              aria-label={lang === 'es' ? 'Compartir' : 'Share'}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
            >
              <Share2 size={15} />
            </button>

            {/* Page Outline / Sections Trigger (Mobile & Desktop) */}
            {hasSectionsOutline && (
              <button
                type="button"
                onClick={handleOpenSections}
                className="public-sticky-action-bar__sections-btn"
                title={lang === 'es' ? 'Ver índice de secciones' : 'View page sections outline'}
                aria-label={lang === 'es' ? 'Secciones' : 'Sections'}
              >
                <List size={15} className="public-sticky-action-bar__sections-icon" />
                <span className="public-sticky-action-bar__sections-label">
                  {sectionsLabel || (lang === 'es' ? 'Secciones' : 'Sections')}
                </span>
                {tocProgress.totalSections > 0 && (
                  <span className="public-sticky-action-bar__sections-pill">
                    {tocProgress.currentProgress}/{tocProgress.totalSections}
                  </span>
                )}
              </button>
            )}

            {/* Atlas AI Clinical Copilot with Active Product Context */}
            {showClinicalAI && (
              <button
                type="button"
                onClick={handleOpenAI}
                className="public-sticky-action-bar__ai-btn"
                title={lang === 'es' ? `Consultar con Atlas AI sobre ${title}` : `Consult Atlas AI regarding ${title}`}
                aria-label="Atlas AI"
              >
                <Sparkles size={14} className="public-sticky-action-bar__sparkle-icon" />
                <span className="public-sticky-action-bar__ai-label-full">Atlas AI</span>
                <span className="public-sticky-action-bar__ai-label-short">AI</span>
              </button>
            )}

            {/* Active B2B Order Trigger (when items present) */}
            {totalCount > 0 ? (
              <button
                type="button"
                onClick={openDrawer}
                className="public-sticky-action-bar__inquire-btn"
                style={{
                  background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                  boxShadow: '0 2px 10px rgba(13, 148, 136, 0.35)',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                aria-label={lang === 'es' ? `Tramitar Pedido (${totalCount})` : `Review Order (${totalCount})`}
              >
                <ShoppingBag size={14} style={{ flexShrink: 0 }} />
                <span style={{
                  background: 'rgba(255, 255, 255, 0.22)',
                  borderRadius: '12px',
                  padding: '1px 6px',
                  fontSize: '0.70rem',
                  fontWeight: 800
                }}>
                  {totalCount}
                </span>
                <span>{lang === 'es' ? `Tramitar Pedido (€${subtotal.toFixed(2)})` : `Review Order (€${subtotal.toFixed(2)})`}</span>
                <ArrowRight size={14} style={{ flexShrink: 0 }} />
              </button>
            ) : (
              <button
                type="button"
                onClick={onInquire}
                className="public-sticky-action-bar__inquire-btn"
                aria-label={inquireLabel}
              >
                <span>{inquireLabel}</span>
                <ArrowRight size={14} style={{ flexShrink: 0 }} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Dynamic Lazy-Loaded Atlas AI Drawer (zero initial bundle overhead) */}
      {showClinicalAI && mountAiDrawer && (
        <PublicAtlasAIDrawer lang={lang} {...drawerProps} />
      )}
    </>
  );
}

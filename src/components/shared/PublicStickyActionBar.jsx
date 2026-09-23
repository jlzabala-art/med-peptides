'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import './PublicStickyActionBar.css';

/**
 * PublicStickyActionBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified, persistent bottom action bar for Public Datasheets (/p/[slug])
 * and Public Protocol Pages (/proto/[slug]).
 *
 * Adheres to GCP console standards:
 * - Persistent primary action (Inquire) and integrated Clinical AI Copilot.
 * - Always visible across desktop, tablet, and mobile.
 * - Keeps active entity context (Product or Protocol name + specs) clear.
 * - Synchronizes remaining AI quota with PublicAtlasAIDrawer in real-time.
 */
export default function PublicStickyActionBar({
  title,
  subtitle,
  badge = null,
  badgeType = 'default',
  inquireLabel = 'Inquire',
  onInquire,
  showClinicalAI = true,
  lang = 'en',
}) {
  const [quota, setQuota] = useState({ remaining: 5, limit: 5 });

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

    window.addEventListener('atlas-quota-updated', handleQuotaUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('atlas-quota-updated', handleQuotaUpdate);
    };
  }, []);

  const handleOpenAI = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-public-atlas-ai'));
    }
  };

  const getBadgeClass = () => {
    if (badgeType === 'diagnostic') return 'public-sticky-action-bar__badge public-sticky-action-bar__badge--diagnostic';
    if (badgeType === 'protocol') return 'public-sticky-action-bar__badge public-sticky-action-bar__badge--protocol';
    return 'public-sticky-action-bar__badge';
  };

  return (
    <aside className="public-sticky-action-bar" aria-label="Quick Actions">
      <div className="public-sticky-action-bar__container">
        {/* Left: Entity Context Identity */}
        <div className="public-sticky-action-bar__info">
          <div className="public-sticky-action-bar__meta-row">
            {badge && (
              <span className={getBadgeClass()}>{badge}</span>
            )}
            <div className="public-sticky-action-bar__title" title={title}>
              {title}
            </div>
          </div>
          {subtitle && (
            <div className="public-sticky-action-bar__subtitle" title={subtitle}>
              {subtitle}
            </div>
          )}
        </div>

        {/* Right: Actions Cluster */}
        <div className="public-sticky-action-bar__actions">
          {showClinicalAI && (
            <button
              type="button"
              onClick={handleOpenAI}
              className="public-sticky-action-bar__ai-btn"
              title="Open Clinical AI Research Copilot"
              aria-label="Clinical AI Copilot"
            >
              <Sparkles size={15} className="public-sticky-action-bar__sparkle-icon" />
              <span className="public-sticky-action-bar__ai-label-full">Clinical AI</span>
              <span className="public-sticky-action-bar__ai-label-short">AI</span>
              <span className="public-sticky-action-bar__quota-pill">
                {quota.remaining}/{quota.limit}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onInquire}
            className="public-sticky-action-bar__inquire-btn"
            aria-label={inquireLabel}
          >
            <span>{inquireLabel}</span>
            <ArrowRight size={14} style={{ flexShrink: 0 }} />
          </button>
        </div>
      </div>
    </aside>
  );
}

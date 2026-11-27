'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import { useAtlasContext } from '@/context/AtlasContextProvider';
import { usePricing } from '@/hooks/usePricing';
import {
  getContextualAtlasChips,
  resolveFallbackContextTitle,
} from '@/constants/atlasAiContextChips';
import '@/styles/atlasAiDrawerGcp.css';

/**
 * AtlasAiFooterBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Universal Google-Cloud-UX Atlas AI footer strip mounted in:
 *   - PublicUnifiedFooter (every public & shared route)
 *   - PanelShell (every authenticated portal: Admin, Doctor, Patient, Wholesaler)
 *
 * Displays the live detected screen context, 3 contextually logical 1-click
 * prompt chips, and the primary "Ask Atlas AI" trigger.
 */
export default function AtlasAiFooterBar({
  lang = 'en',
  portalContextTitle = null,
  onOpenPortalDrawer = null,
  compact = false,
}) {
  const pathname = usePathname() || '/';
  const { screenContext, openAtlasAi } = useAtlasContext();
  const { pricingRole, market } = usePricing();
  const isEs = lang === 'es';
  const [domTitle, setDomTitle] = useState('');

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const h1 = document.querySelector('main h1, h1')?.textContent?.trim();
    const cleanedDocTitle = (document.title || '').split('|')[0].split('·')[0].trim();
    setDomTitle(h1 || cleanedDocTitle || '');
  }, [pathname]);

  const contextTitle = useMemo(() => {
    return (
      portalContextTitle ||
      screenContext?.contextAnchor?.sectionTitle ||
      screenContext?.contextAnchor?.name ||
      screenContext?.title ||
      resolveFallbackContextTitle(pathname, domTitle, isEs)
    );
  }, [portalContextTitle, screenContext, pathname, domTitle, isEs]);

  const chips = useMemo(
    () =>
      getContextualAtlasChips({
        pathname,
        screenContext,
        pricingRole,
        market,
        lang,
      }).slice(0, compact ? 2 : 3),
    [pathname, screenContext, pricingRole, market, lang, compact]
  );

  const handleOpen = (initialPrompt = null) => {
    if (typeof onOpenPortalDrawer === 'function') {
      onOpenPortalDrawer(initialPrompt);
      return;
    }
    openAtlasAi({
      contextType: screenContext?.contextType || 'catalog',
      contextAnchor: {
        ...(screenContext?.contextAnchor || {}),
        sectionTitle: contextTitle,
        pricingRole,
        market,
      },
      ...(initialPrompt ? { initialPrompt } : {}),
    });
  };

  return (
    <section
      className="atlas-ai-gcp-footer-strip no-print"
      aria-label={isEs ? 'Asistente contextual Atlas AI' : 'Atlas AI Contextual Assistant'}
      style={compact ? { padding: '8px 14px', borderBottom: 'none' } : undefined}
    >
      <div className="atlas-ai-gcp-footer-inner">
        <div className="atlas-ai-gcp-footer-meta">
          <span className="atlas-ai-gcp-footer-icon" aria-hidden="true">
            <Sparkles size={15} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#202124' }}>
                Atlas AI
              </span>
              <span
                style={{
                  fontSize: '0.67rem',
                  fontWeight: 600,
                  color: '#5f6368',
                  background: '#f1f3f4',
                  border: '1px solid #dadce0',
                  padding: '1px 7px',
                  borderRadius: '999px',
                  maxWidth: '280px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={contextTitle}
              >
                {contextTitle}
              </span>
            </div>
            {!compact && (
              <div style={{ fontSize: '0.71rem', color: '#5f6368', marginTop: '2px' }}>
                {isEs
                  ? 'Consultas clínicas, dosificación y condiciones contextualizadas a esta pantalla'
                  : 'Clinical, dosing, and commercial guidance contextualized to this screen'}
              </div>
            )}
          </div>
        </div>

        <div className="atlas-ai-gcp-footer-chips">
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              className="atlas-ai-gcp-chip"
              onClick={() => handleOpen(chip.prompt)}
            >
              <span>{chip.label}</span>
              <ArrowUpRight size={12} style={{ opacity: 0.65 }} />
            </button>
          ))}
        </div>

        <button
          type="button"
          className="atlas-ai-gcp-trigger-btn"
          onClick={() => handleOpen(null)}
        >
          <Sparkles size={14} />
          <span>{isEs ? 'Consultar a Atlas AI' : 'Ask Atlas AI'}</span>
        </button>
      </div>
    </section>
  );
}

'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Calculator,
  Check,
  Copy,
  Eye,
  ExternalLink,
  FilePlus2,
  MoreVertical,
  Plus,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usePublicWorkspace } from '@/context/PublicWorkspaceContext';
import { useAtlasContext } from '@/context/AtlasContextProvider';
import { buildPriceActionPayload } from './priceActionHelpers';
import './PriceScheduleActions.css';

/**
 * PriceScheduleRowActions
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified, mobile-friendly row action controls for all /pricing/* DataTables.
 * Keeps rows compact: [+ Quote] + [⋮] contextual menu.
 */
export default function PriceScheduleRowActions({
  item,
  currency = 'EUR',
  unitPrice = null,
  formattedPrice = '',
  categoryLabel = '',
  monographUrl = null,
  onQuickView = null,
  onPrescribe = null,
  onOpenCalculator = null,
  onOpenMonograph = null,
  onAddToQuote = null,
}) {
  const workspace = usePublicWorkspace();
  const { openAtlasAi } = useAtlasContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef(null);

  const payload = useMemo(
    () =>
      buildPriceActionPayload(item, {
        currency,
        unitPrice,
        formattedPrice,
        monographUrl,
        categoryLabel,
      }),
    [item, currency, unitPrice, formattedPrice, monographUrl, categoryLabel]
  );

  const isQuoted = useMemo(() => {
    const items = workspace?.rfqItems || [];
    return items.some((x) => (x.id || x.sku) === payload.key || (x.id || x.sku) === payload.sku);
  }, [workspace?.rfqItems, payload.key, payload.sku]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [menuOpen]);

  const handleQuoteClick = (e) => {
    e.stopPropagation();
    if (isQuoted) {
      workspace?.setIsQuoteDrawerOpen?.(true);
      return;
    }
    if (typeof onAddToQuote === 'function') {
      onAddToQuote(item, payload);
    } else {
      workspace?.addRfqItem?.(payload.rfqPayload);
    }
    toast.success(`Added ${payload.name} to RFQ Quote`);
  };

  const handleCopySummary = async (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    try {
      await navigator.clipboard.writeText(payload.b2bSummaryText);
      toast.success(`Copied ${payload.name} B2B summary`);
    } catch {
      toast.error('Unable to copy to clipboard');
    }
  };

  const handleAskAi = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    openAtlasAi?.(payload.atlasContext);
  };

  return (
    <div
      ref={containerRef}
      className="ps-row-actions"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className={`ps-row-action-btn ${isQuoted ? 'is-quoted' : ''}`}
        onClick={handleQuoteClick}
        title={isQuoted ? 'View in RFQ Quote Drawer' : 'Add SKU to RFQ Quote'}
      >
        {isQuoted ? <Check size={13} /> : <Plus size={13} />}
        <span>{isQuoted ? 'In Quote' : 'Quote'}</span>
      </button>

      <button
        type="button"
        className="ps-row-menu-btn"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={`More actions for ${payload.name}`}
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((prev) => !prev);
        }}
      >
        <MoreVertical size={15} />
      </button>

      {menuOpen && (
        <div className="ps-action-menu" role="menu">
          <button
            type="button"
            className="ps-action-menu-item"
            role="menuitem"
            onClick={handleCopySummary}
          >
            <Copy size={14} />
            <span>Copy B2B Summary</span>
          </button>

          <button
            type="button"
            className="ps-action-menu-item is-ai"
            role="menuitem"
            onClick={handleAskAi}
          >
            <Sparkles size={14} />
            <span>Ask AI about SKU</span>
          </button>

          {typeof onQuickView === 'function' && (
            <button
              type="button"
              className="ps-action-menu-item"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                onQuickView(item);
              }}
            >
              <Eye size={14} />
              <span>Quick View</span>
            </button>
          )}

          {typeof onPrescribe === 'function' && (
            <button
              type="button"
              className="ps-action-menu-item"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                onPrescribe(item);
              }}
            >
              <FilePlus2 size={14} />
              <span>Prescribe / Use in Rx</span>
            </button>
          )}

          {typeof onOpenCalculator === 'function' && (
            <button
              type="button"
              className="ps-action-menu-item"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                onOpenCalculator(item);
              }}
            >
              <Calculator size={14} />
              <span>Reconstitution Calc</span>
            </button>
          )}

          {(typeof onOpenMonograph === 'function' || payload.resolvedMonographUrl) && (
            <a
              href={payload.resolvedMonographUrl || '#'}
              className="ps-action-menu-item"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                if (typeof onOpenMonograph === 'function') {
                  e.preventDefault();
                  onOpenMonograph(item, payload.resolvedMonographUrl);
                }
              }}
            >
              <ExternalLink size={14} />
              <span>Open Full Monograph</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

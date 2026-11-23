'use client';

import React, { useMemo } from 'react';
import {
  ArrowRight,
  Calculator,
  Copy,
  FilePlus2,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAtlasContext } from '@/context/AtlasContextProvider';
import { buildPriceActionPayload } from './priceActionHelpers';
import './PriceScheduleActions.css';

/**
 * PriceScheduleExpandedActions
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified, non-redundant action bar rendered inside expandableRender panels
 * across all /pricing/* DataTables (Quote & Quick View live in the row above).
 * Responsive on laptop and mobile (>=44px touch targets on <768px).
 */
export default function PriceScheduleExpandedActions({
  item,
  currency = 'EUR',
  unitPrice = null,
  formattedPrice = '',
  categoryLabel = '',
  monographUrl = null,
  onPrescribe = null,
  onOpenCalculator = null,
  onOpenMonograph = null,
}) {
  const { openAtlasAi } = useAtlasContext();

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

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(payload.b2bSummaryText);
      toast.success(`Copied ${payload.name} B2B summary`);
    } catch {
      toast.error('Unable to copy to clipboard');
    }
  };

  const handleAskAi = (e) => {
    e.stopPropagation();
    openAtlasAi?.(payload.atlasContext);
  };

  return (
    <div className="ps-expanded-actions" onClick={(e) => e.stopPropagation()}>
      <button type="button" className="ps-expanded-btn" onClick={handleCopy}>
        <Copy size={14} />
        <span>Copy B2B Summary</span>
      </button>

      <button type="button" className="ps-expanded-btn is-ai" onClick={handleAskAi}>
        <Sparkles size={14} />
        <span>Ask AI</span>
      </button>

      {typeof onPrescribe === 'function' && (
        <button
          type="button"
          className="ps-expanded-btn"
          onClick={(e) => {
            e.stopPropagation();
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
          className="ps-expanded-btn"
          onClick={(e) => {
            e.stopPropagation();
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
          className="ps-expanded-btn is-primary"
          onClick={(e) => {
            e.stopPropagation();
            if (typeof onOpenMonograph === 'function') {
              e.preventDefault();
              onOpenMonograph(item, payload.resolvedMonographUrl);
            }
          }}
        >
          <span>Open Full Monograph</span>
          <ArrowRight size={14} />
        </a>
      )}
    </div>
  );
}

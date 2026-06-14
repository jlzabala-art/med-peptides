import Pill from "lucide-react/dist/esm/icons/pill";
import Plus from "lucide-react/dist/esm/icons/plus";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up";
/* eslint-disable no-unused-vars */
import React, { useMemo, useState, useCallback, useEffect } from 'react';






import { getActiveSupplements } from '../../repositories/supplementRepository';
import { trackEvent } from '../../hooks/useAnalytics';
import { resolveProductPrice } from '../../utils/resolveProductPrice';
import { PRICING_TIER } from '../../constants/productEnums';

// ── Module-level cache: fetched once, shared across all component instances ───
let _catalogPromise = null;
function getCatalog() {
  if (!_catalogPromise) {
    _catalogPromise = getActiveSupplements().catch((err) => {
      console.warn('[ProtocolSupplementSection] Could not load supplement catalog from Firestore:', err);
      _catalogPromise = null; // allow retry on next mount
      return [];
    });
  }
  return _catalogPromise;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function norm(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Resolve the display price from a catalog item.
 * Uses the canonical resolveProductPrice resolver (Engine v2 schema).
 * Falls back to legacy denormalised fields for docs not yet migrated.
 *
 * @param {Object|null} catalogItem - supplement document from Firestore
 * @returns {number|null}
 */
function catalogItemPrice(catalogItem) {
  if (!catalogItem) return null;

  // Phase 8: Canonical resolver only — no legacy flat-field fallback.
  // If the Firestore doc is missing pricing.retail.perUnit the price will be
  // null, which the UI renders as "—". Fix the data, not the resolver.
  const resolved = resolveProductPrice(catalogItem, { tier: PRICING_TIER.RETAIL });
  return resolved?.amount ?? null;
}

/**
 * Find a supplement in the Firestore catalog by name (and optionally dosage).
 * Returns the best match or null.
 *
 * @param {string} name - recommended supplement name from protocol doc
 * @param {string} dosage - recommended dosage (optional)
 * @param {Array}  catalog - active supplements from Firestore
 */
function findInCatalog(name, dosage, catalog) {
  if (!catalog || !catalog.length) return null;
  const nName = norm(name);

  // 1. Exact name + dosage match
  if (dosage) {
    const exact = catalog.find(
      (s) => norm(s.name) === nName && s.dosage === dosage
    );
    if (exact) return exact;
  }

  // 2. Name-only exact match (take cheapest variant)
  const byName = catalog
    .filter((s) => norm(s.name) === nName)
    .sort((a, b) => (catalogItemPrice(a) ?? 0) - (catalogItemPrice(b) ?? 0));
  if (byName.length) return byName[0];

  // 3. Synonym match
  const bySynonym = catalog.filter(
    (s) => Array.isArray(s.synonyms) && s.synonyms.some((syn) => norm(syn) === nName)
  );
  if (bySynonym.length) return bySynonym[0];

  // 4. Fuzzy: name contains match
  const fuzzy = catalog
    .filter((s) => norm(s.name).includes(nName) || nName.includes(norm(s.name)))
    .sort((a, b) => (catalogItemPrice(a) ?? 0) - (catalogItemPrice(b) ?? 0));
  if (fuzzy.length) return fuzzy[0];

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// ProtocolSupplementSection
// ─────────────────────────────────────────────────────────────────────────────
export default function ProtocolSupplementSection({
  recommendedSupplements = [],  // [{name, dosage, rationale, timing}] from Firestore protocol doc
  protocolName = '',
  updateCart,
}) {
  const [addedIds, setAddedIds]     = useState(new Set());
  const [expanded, setExpanded]     = useState(false);
  const [catalog, setCatalog]       = useState([]);   // loaded from Firestore
  const [catalogReady, setCatalogReady] = useState(false);

  // Load supplement catalog from Firestore once
  useEffect(() => {
    let active = true;
    getCatalog().then((items) => {
      if (active) {
        setCatalog(items);
        setCatalogReady(true);
      }
    });
    return () => { active = false; };
  }, []);

  // Enrich recommended supplements with Firestore catalog data
  const enriched = useMemo(() => {
    return recommendedSupplements
      .filter((rec) => rec?.name && typeof rec.name === 'string' && rec.name.trim().length > 0)
      .map((rec, idx) => {
      const catalogItem = findInCatalog(rec.name, rec.dosage, catalog);
      return {
        id: `supp_${norm(rec.name)}_${idx}`,
        name: rec.name,
        dosage: rec.dosage || catalogItem?.dosage || '',
        rationale: rec.rationale || catalogItem?.desc || '',
        timing: rec.timing || '',
        // Price resolution: canonical resolver (Engine v2), then legacy fields
        price: catalogItemPrice(catalogItem),
        quantity: catalogItem?.quantity || '',
        category: catalogItem?.category || '',
        catalogItem,
      };
    });
  }, [recommendedSupplements, catalog]);

  const handleAdd = useCallback((supp) => {
    if (!updateCart || addedIds.has(supp.id)) return;

    updateCart({
      items: [{
        id:    supp.id,
        slug:  norm(supp.name),
        label: `${supp.name}${supp.dosage ? ` ${supp.dosage}` : ''}`,
        qty:   1,
        price: supp.price || 0,
        source: 'protocol_supplement',
        protocol: protocolName,
        isAccessory: false,
        isSupplement: true,
      }],
    });

    setAddedIds((prev) => new Set([...prev, supp.id]));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(supp.id);
        return next;
      });
    }, 2500);

    trackEvent('add_to_cart', {
      item_name: supp.name,
      item_category: 'supplement',
      protocol_name: protocolName,
      value: supp.price || 0,
      currency: 'USD',
      location: 'protocol_supplement_section',
    });
  }, [addedIds, updateCart, protocolName]);

  if (!enriched.length) return null;

  // Show first 2 collapsed, expand for all 3
  const visible = expanded ? enriched : enriched.slice(0, 2);
  const hasMore = enriched.length > 2;

  return (
    <>
      <style>{`
        .pss-root {
          font-family: 'Inter', system-ui, sans-serif;
          margin-top: 0.85rem;
          border-top: 1px solid #e9f0f7;
          padding-top: 0.85rem;
        }

        .pss-header {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-bottom: 0.6rem;
        }
        .pss-header-label {
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #64748b;
          flex: 1;
        }
        .pss-spark-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.2rem;
          font-size: 0.56rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #7c3aed;
          background: #f3e8ff;
          padding: 0.15rem 0.45rem;
          border-radius: 20px;
        }

        /* ── Card ── */
        .pss-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.6rem 0.7rem;
          margin-bottom: 0.4rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          background: #fff;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .pss-card:hover {
          border-color: #c7d2fe;
          box-shadow: 0 1px 6px rgba(99,102,241,0.07);
        }
        .pss-card-top {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }
        .pss-card-icon {
          flex-shrink: 0;
          color: #6366f1;
          opacity: 0.7;
        }
        .pss-card-name {
          flex: 1;
          font-size: 0.75rem;
          font-weight: 700;
          color: #1e293b;
          line-height: 1.25;
        }
        .pss-card-dosage {
          font-size: 0.6rem;
          font-weight: 600;
          color: #64748b;
          background: #f1f5f9;
          padding: 0.1rem 0.4rem;
          border-radius: 12px;
          white-space: nowrap;
        }
        .pss-card-price {
          font-size: 0.68rem;
          font-weight: 800;
          color: #003666;
          font-family: 'JetBrains Mono', monospace;
          white-space: nowrap;
          margin-left: auto;
        }
        .pss-card-rationale {
          font-size: 0.64rem;
          color: #64748b;
          line-height: 1.45;
          padding-left: 1.45rem;
        }
        .pss-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-left: 1.45rem;
          margin-top: 0.1rem;
        }
        .pss-card-qty {
          font-size: 0.58rem;
          color: #94a3b8;
        }
        .pss-add-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.62rem;
          font-weight: 700;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          transition: background 0.15s ease, transform 0.1s ease, opacity 0.15s ease;
          outline: none;
        }
        .pss-add-btn--idle {
          background: #eef2ff;
          color: #4f46e5;
        }
        .pss-add-btn--idle:hover {
          background: #e0e7ff;
          transform: scale(1.03);
        }
        .pss-add-btn--added {
          background: #d1fae5;
          color: #065f46;
          cursor: default;
        }

        /* ── Expand toggle ── */
        .pss-expand-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.3rem;
          font-size: 0.62rem;
          font-weight: 700;
          color: #6366f1;
          background: none;
          border: 1px dashed #c7d2fe;
          border-radius: 6px;
          padding: 0.3rem 0;
          cursor: pointer;
          margin-top: 0.1rem;
          transition: background 0.15s ease;
        }
        .pss-expand-btn:hover {
          background: #f5f3ff;
        }
      `}</style>

      <div className="pss-root">
        {/* Header */}
        <div className="pss-header">
          <span className="pss-header-label">Recommended Supplements</span>
          <span className="pss-spark-badge">
            <Sparkles size={9} />
            AI Matched
          </span>
        </div>

        {/* Cards */}
        {visible.map((supp) => {
          const isAdded = addedIds.has(supp.id);
          return (
            <div key={supp.id} className="pss-card">
              <div className="pss-card-top">
                <Pill size={13} className="pss-card-icon" />
                <span className="pss-card-name">{supp.name}</span>
                {supp.dosage && (
                  <span className="pss-card-dosage">{supp.dosage}</span>
                )}
                {supp.price != null && (
                  <span className="pss-card-price">${supp.price.toFixed(2)}</span>
                )}
              </div>

              {supp.rationale && (
                <p className="pss-card-rationale">{supp.rationale}</p>
              )}

              <div className="pss-card-footer">
                <span className="pss-card-qty">
                  {supp.timing
                    ? `⏱ ${supp.timing}`
                    : supp.quantity
                    ? `${supp.quantity} / unit`
                    : ''}
                </span>
                {updateCart && (
                  <button
                    className={`pss-add-btn${isAdded ? ' pss-add-btn--added' : ' pss-add-btn--idle'}`}
                    onClick={() => !isAdded && handleAdd(supp)}
                    disabled={isAdded}
                    aria-label={`Add ${supp.name} to cart`}
                  >
                    {isAdded ? (
                      <><CheckCircle2 size={10} /> Added</>
                    ) : (
                      <><Plus size={10} /> Add</>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Expand / collapse toggle */}
        {hasMore && (
          <button
            className="pss-expand-btn"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            {expanded ? (
              <><ChevronUp size={11} /> Show less</>
            ) : (
              <><ChevronDown size={11} /> +{enriched.length - 2} more supplements</>
            )}
          </button>
        )}
      </div>
    </>
  );
}
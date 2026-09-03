"use client";

import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart";
import Check from "lucide-react/dist/esm/icons/check";
import CreditCard from "lucide-react/dist/esm/icons/credit-card";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import React, { useMemo, useState } from 'react';




import { derivePhaseSupply, ACCESSORY_DEFS } from '../../utils/supplyMath';
import { resolveProductPrice } from '../../utils/resolveProductPrice';
import DataTable from '../ui/DataTable';

const ProtocolEconomicSection = ({
  protocol,
  activeProtocolPhases = [],
  selectedSupplements = [],
  selectedAccessories = [],
  selectedTests = [],
  products = [],
  updateCart,
  localTier = 'retail',
  region = 'US'
}) => {
  const [isAdded, setIsAdded] = useState(false);

  // Normalize search queries
  const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  // Helper to find a product in Firestore products catalog
  const findCatalogProduct = (slugOrLabel, productId) => {
    if (productId) {
      const match = products.find(p => p.id === productId);
      if (match) return match;
    }
    const normSearch = norm(slugOrLabel);
    if (!normSearch) return null;

    return products.find(p => {
      if (!p) return false;
      const pid = norm(p.id);
      const pname = norm(p.name);
      const pdisp = norm(p.displayName);
      return (
        pid === normSearch ||
        pname === normSearch ||
        pdisp === normSearch ||
        pid.includes(normSearch) ||
        pname.includes(normSearch)
      );
    });
  };

  // 1. Calculate Peptide Requirements and Costs
  const peptideItems = useMemo(() => {
    if (!activeProtocolPhases || activeProtocolPhases.length === 0) return [];
    // Derive phase supply
    const phases = derivePhaseSupply(activeProtocolPhases);
    // Deduplicate and aggregate vial counts
    const peptideMap = new Map();
    phases.forEach(ph => {
      ph.compounds.forEach(c => {
        const key = c.productId || c.slug || c.label;
        if (peptideMap.has(key)) {
          peptideMap.get(key).vialsNeeded += c.vialsNeeded;
        } else {
          peptideMap.set(key, {
            ...c,
            vialsNeeded: c.vialsNeeded
          });
        }
      });
    });

    // Resolve pricing for each peptide
    return Array.from(peptideMap.values()).map(item => {
      const catalogProduct = findCatalogProduct(item.slug || item.label, item.productId);
      const priceObj = catalogProduct 
        ? resolveProductPrice(catalogProduct, { tier: localTier, countryCode: region }) 
        : null;
      const unitPrice = priceObj?.amount ?? 79.99; // Standard fallback Unit Price
      const currency = priceObj?.currency ?? 'USD';
      return {
        id: catalogProduct?.id || item.productId || item.slug,
        slug: item.slug,
        name: catalogProduct?.displayName || catalogProduct?.name || item.label,
        quantity: item.vialsNeeded,
        unitPrice,
        subtotal: unitPrice * item.vialsNeeded,
        currency,
        isAccessory: false
      };
    });
  }, [activeProtocolPhases, products, localTier, region]);

  // 2. Resolve Supplement Pricing
  const supplementItems = useMemo(() => {
    return selectedSupplements.map((s, idx) => {
      const catalogProduct = findCatalogProduct(s.name || s.product_title);
      const priceObj = catalogProduct 
        ? resolveProductPrice(catalogProduct, { tier: localTier, countryCode: region }) 
        : null;

      const unitPrice = priceObj?.amount ?? 39.99; // Fallback supplement price
      const currency = priceObj?.currency ?? 'USD';
      // Assume 1 bottle is needed for the protocol (or calculate based on duration if available)
      const qty = s.duration_weeks ? Math.ceil(s.duration_weeks / 4) : 1;

      return {
        id: catalogProduct?.id || s.id || `supp_idx_${idx}`,
        slug: s.id,
        name: catalogProduct?.displayName || catalogProduct?.name || s.name || s.product_title,
        quantity: qty,
        unitPrice,
        subtotal: unitPrice * qty,
        currency,
        isAccessory: false,
        isSupplement: true
      };
    });
  }, [selectedSupplements, products, localTier, region]);

  // 3. Resolve Accessories Pricing
  const accessoryItems = useMemo(() => {
    return selectedAccessories.map(a => {
      // Find matching catalog accessory if available, otherwise use base definition
      const catalogProduct = findCatalogProduct(a.name || a.label, a.id);
      const priceObj = catalogProduct 
        ? resolveProductPrice(catalogProduct, { tier: localTier, countryCode: region }) 
        : null;

      const unitPrice = priceObj?.amount ?? a.unitPrice ?? 8.00;
      const currency = priceObj?.currency ?? 'USD';

      return {
        id: a.id,
        slug: a.id,
        name: a.name || a.label,
        quantity: a.qty || a.quantity || 1,
        unitPrice,
        subtotal: unitPrice * (a.qty || a.quantity || 1),
        currency,
        isAccessory: true
      };
    });
  }, [selectedAccessories, products, localTier, region]);

  // 3b. Resolve Testing Pricing
  const testingItems = useMemo(() => {
    return selectedTests.map((t, idx) => {
      const catalogProduct = findCatalogProduct(t.name, t.id);
      const priceObj = catalogProduct 
        ? resolveProductPrice(catalogProduct, { tier: localTier, countryCode: region }) 
        : null;

      const unitPrice = priceObj?.amount ?? 150.00; // Fallback price
      const currency = priceObj?.currency ?? 'USD';
      const qty = 1;

      return {
        id: catalogProduct?.id || t.id || `test_idx_${idx}`,
        slug: t.id,
        name: catalogProduct?.displayName || catalogProduct?.name || t.name,
        quantity: qty,
        unitPrice,
        subtotal: unitPrice * qty,
        currency,
        isAccessory: false,
        isTesting: true
      };
    });
  }, [selectedTests, products, localTier, region]);

  // 4. Combine all elements and compute totals
  const allBundleItems = useMemo(() => {
    return [
      ...peptideItems.map(p => ({ ...p, categoryLabel: 'Peptide', categoryBadgeClass: 'pes-badge-peptide' })),
      ...supplementItems.map(s => ({ ...s, categoryLabel: 'Nutrient', categoryBadgeClass: 'pes-badge-nutrient' })),
      ...testingItems.map(t => ({ ...t, categoryLabel: 'Testing', categoryBadgeClass: 'pes-badge-testing' })),
      ...accessoryItems.map(a => ({ ...a, categoryLabel: 'Supply', categoryBadgeClass: 'pes-badge-supply' })),
    ];
  }, [peptideItems, supplementItems, testingItems, accessoryItems]);

  const totalCost = useMemo(() => {
    return allBundleItems.reduce((acc, item) => acc + item.subtotal, 0);
  }, [allBundleItems]);

  const currencyCode = allBundleItems[0]?.currency || 'USD';

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: currencyCode 
    }).format(val);
  };

  // 5. Handle Add to Cart
  const handleAddToCart = () => {
    if (!updateCart) return;

    const protocolName = protocol?.name || 'Protocol';
    const protocolGoal = protocol?.goal || protocol?.clinical_goal || 'Rejuvenation';

    const items = allBundleItems.map(item => ({
      id:          item.id,
      slug:        item.slug || item.id,
      label:       item.name,
      qty:         item.quantity,
      quantity:    item.quantity,
      price:       item.unitPrice,
      source:      item.isAccessory ? 'protocol_accessory' : 'protocol_bundle',
      protocol:    protocolName,
      isAccessory: item.isAccessory
    }));

    updateCart({
      items,
      bundle: {
        id:          protocolName.toLowerCase().replace(/\s+/g, '-'),
        name:        protocolName,
        goal:        protocolGoal,
        bundleTotal: totalCost,
        phases:      activeProtocolPhases.length,
        products:    items.map(p => ({
          productId:   p.id,
          label:       p.label,
          qty:         p.qty,
          quantity:    p.qty,
          price:       p.price,
          isAccessory: p.isAccessory
        })),
        savings:     0
      }
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  return (
    <>
      <style>{`
        .pes-container {
          font-family: 'Inter', system-ui, sans-serif;
          margin-bottom: 1rem;
          padding-top: 0.5rem;
        }
        .pes-header {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .pes-total-wrap {
          text-align: right;
          background: #f1f5f9;
          padding: 0.4rem 0.85rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        .pes-total-label {
          font-size: 0.55rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.15rem;
        }
        .pes-total-value {
          font-size: 1.15rem;
          font-weight: 800;
          color: #003666;
          line-height: 1;
        }
        .pes-table-title {
          font-size: 0.72rem;
          font-weight: 800;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .pes-table-container {
          background: #ffffff;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          margin-bottom: 1rem;
        }
        .pes-item-name {
          font-weight: 600;
          color: #0f172a;
          font-size: 0.76rem;
        }
        .pes-badge {
          display: inline-block;
          font-size: 0.58rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
        }
        .pes-badge-peptide {
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
        }
        .pes-badge-nutrient {
          background: #f0fdf4;
          color: #15803d;
          border: 1px solid #bbf7d0;
        }
        .pes-badge-testing {
          background: #faf5ff;
          color: #7e22ce;
          border: 1px solid #e9d5ff;
        }
        .pes-badge-supply {
          background: #f8fafc;
          color: #475569;
          border: 1px solid #e2e8f0;
        }
        .pes-qty-col {
          font-weight: 600;
          color: #334155;
          text-align: center;
          font-size: 0.74rem;
        }
        .pes-price-col {
          font-weight: 700;
          color: #003666;
          text-align: right;
          font-size: 0.76rem;
        }
        .pes-subtotals-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        @media (min-width: 640px) {
          .pes-subtotals-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        .pes-subtotal-card {
          background: #ffffff;
          padding: 0.6rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        .pes-subtotal-label {
          font-size: 0.58rem;
          color: #64748b;
          font-weight: 600;
          margin-bottom: 0.15rem;
        }
        .pes-subtotal-val {
          font-size: 0.82rem;
          font-weight: 700;
          color: #0f172a;
        }
        .pes-actions-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-top: 1rem;
        }
        .pes-action-hint {
          font-size: 0.65rem;
          color: #64748b;
          max-width: 18rem;
          line-height: 1.3;
        }
        .pes-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 0.6rem 1.25rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          width: 100%;
        }
        @media (min-width: 640px) {
          .pes-btn {
            width: auto;
          }
        }
        .pes-btn-added {
          background: #22c55e;
          color: #ffffff;
          cursor: default;
        }
        .pes-btn-idle {
          background: #003666;
          color: #ffffff;
        }
        .pes-btn-idle:hover {
          background: #002544;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
        }
        .pes-btn-idle:active {
          transform: translateY(0);
        }
        .pes-disclaimer {
          font-size: 0.62rem;
          color: #94a3b8;
          font-style: italic;
          margin-top: 0.75rem;
          line-height: 1.3;
        }
      `}</style>

      <div className="pes-container">
        <div className="pes-header">
          <div className="pes-total-wrap">
            <div className="pes-total-label">Total Estimated Cost</div>
            <div className="pes-total-value">{formatCurrency(totalCost)}</div>
          </div>
        </div>

        <div>
          <h4 className="pes-table-title">
            <Sparkles size={11} color="#22c55e" /> Protocol Bundle
          </h4>
          <div className="pes-table-container">
            <DataTable
              data={allBundleItems}
              keyField="id"
              emptyMessage="No items currently selected in the sections above."
              columns={[
                {
                  id: 'name',
                  header: 'Compound / Item',
                  width: '50%',
                  render: (item) => (
                    <span className="pes-item-name">{item.name}</span>
                  ),
                },
                {
                  id: 'category',
                  header: 'Category',
                  width: '20%',
                  render: (item) => (
                    <span className={`pes-badge ${item.categoryBadgeClass || 'pes-badge-supply'}`}>
                      {item.categoryLabel || 'Item'}
                    </span>
                  ),
                },
                {
                  id: 'quantity',
                  header: 'Qty',
                  width: '12%',
                  render: (item) => (
                    <span className="pes-qty-col">{item.quantity}</span>
                  ),
                },
                {
                  id: 'subtotal',
                  header: 'Est. Cost',
                  width: '18%',
                  render: (item) => (
                    <span className="pes-price-col">{formatCurrency(item.subtotal)}</span>
                  ),
                },
              ]}
            />
          </div>
        </div>

        <div className="pes-subtotals-grid">
          <div className="pes-subtotal-card">
            <div className="pes-subtotal-label">Peptides & Compounds</div>
            <div className="pes-subtotal-val">
              {formatCurrency(peptideItems.reduce((s, c) => s + c.subtotal, 0))}
            </div>
          </div>
          {testingItems.length > 0 && (
            <div className="pes-subtotal-card">
              <div className="pes-subtotal-label">Diagnostic Testing</div>
              <div className="pes-subtotal-val">
                {formatCurrency(testingItems.reduce((s, c) => s + c.subtotal, 0))}
              </div>
            </div>
          )}
          <div className="pes-subtotal-card">
            <div className="pes-subtotal-label">Nutrient Support</div>
            <div className="pes-subtotal-val">
              {formatCurrency(supplementItems.reduce((s, c) => s + c.subtotal, 0))}
            </div>
          </div>
          <div className="pes-subtotal-card">
            <div className="pes-subtotal-label">Essential Supplies</div>
            <div className="pes-subtotal-val">
              {formatCurrency(accessoryItems.reduce((s, c) => s + c.subtotal, 0))}
            </div>
          </div>
        </div>

        {allBundleItems.length > 0 && (
          <div className="pes-footer-actions">
            <div className="pes-action-hint">
              Click the button to automatically add all selected items and clinical configurations to your shopping cart.
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isAdded}
              className={`pes-btn ${isAdded ? 'pes-btn-added' : 'pes-btn-idle'}`}
            >
              {isAdded ? (
                <>
                  <Check size={15} strokeWidth={3} />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={15} strokeWidth={2.5} />
                  <span>Load Bundle into Cart</span>
                </>
              )}
            </button>
          </div>
        )}

        <div className="pes-disclaimer">
          * Estimates are calculated according to designated regional pricing structures and supplier standards. 
          Actual items in cart may vary according to dynamic supplier availability, tax regulations, and custom client pricing brackets.
        </div>
      </div>
    </>
  );
};

export default ProtocolEconomicSection;
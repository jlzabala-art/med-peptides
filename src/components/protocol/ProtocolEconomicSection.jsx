import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart";
import Check from "lucide-react/dist/esm/icons/check";
import CreditCard from "lucide-react/dist/esm/icons/credit-card";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import React, { useMemo, useState } from 'react';




import { derivePhaseSupply, ACCESSORY_DEFS } from '../../utils/supplyMath';
import { resolveProductPrice } from '../../utils/resolveProductPrice';

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
    return [...peptideItems, ...supplementItems, ...testingItems, ...accessoryItems];
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
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          font-weight: 700;
          margin-bottom: 0.05rem;
        }
        .pes-total-value {
          font-size: 1.2rem;
          font-weight: 800;
          color: #0f172a;
          font-family: 'JetBrains Mono', monospace;
        }
        .pes-table-title {
          font-size: 0.72rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0.75rem 0 0.4rem 0;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .pes-table-container {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }
        .pes-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.75rem;
          text-align: left;
        }
        .pes-table th {
          background: #f1f5f9;
          color: #475569;
          font-weight: 700;
          padding: 0.5rem 0.75rem;
          border-bottom: 1px solid #e2e8f0;
        }
        .pes-table td {
          padding: 0.6rem 0.75rem;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
          vertical-align: middle;
        }
        .pes-table tr:last-child td {
          border-bottom: none;
        }
        .pes-item-name {
          font-weight: 600;
        }
        .pes-badge {
          font-size: 0.58rem;
          font-weight: 700;
          padding: 0.1rem 0.35rem;
          border-radius: 10px;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .pes-badge-peptide {
          background: #e0f2fe;
          color: #0369a1;
        }
        .pes-badge-nutrient {
          background: #f0fdf4;
          color: #166534;
        }
        .pes-badge-supply {
          background: #ecfeff;
          color: #0891b2;
        }
        .pes-badge-testing {
          background: #fef3c7;
          color: #d97706;
        }
        .pes-qty-col {
          text-align: center;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 600;
        }
        .pes-price-col {
          text-align: right;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 600;
        }
        .pes-subtotals-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }
        @media (min-width: 640px) {
          .pes-subtotals-grid {
            grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          }
        }
        .pes-subtotal-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
        }
        .pes-subtotal-label {
          font-size: 0.58rem;
          text-transform: uppercase;
          color: #64748b;
          font-weight: 700;
          margin-bottom: 0.1rem;
        }
        .pes-subtotal-val {
          font-size: 0.9rem;
          font-weight: 700;
          color: #1e293b;
          font-family: 'JetBrains Mono', monospace;
        }
        .pes-footer-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-top: 1rem;
          padding-top: 0.75rem;
          border-top: 1px solid #e2e8f0;
          flex-wrap: wrap;
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
            <table className="pes-table">
              <thead>
                <tr>
                  <th>Compound / Item</th>
                  <th style={{ textAlign: 'center', width: '4.5rem' }}>Category</th>
                  <th style={{ textAlign: 'center', width: '3rem' }}>Qty</th>
                  <th style={{ textAlign: 'right', width: '5.5rem' }}>Est. Cost</th>
                </tr>
              </thead>
              <tbody>
                {peptideItems.map((item, idx) => (
                  <tr key={`pep-${idx}`}>
                    <td className="pes-item-name">{item.name}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="pes-badge pes-badge-peptide">Peptide</span>
                    </td>
                    <td className="pes-qty-col">{item.quantity}</td>
                    <td className="pes-price-col">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}

                {supplementItems.map((item, idx) => (
                  <tr key={`supp-${idx}`}>
                    <td className="pes-item-name">{item.name}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="pes-badge pes-badge-nutrient">Nutrient</span>
                    </td>
                    <td className="pes-qty-col">{item.quantity}</td>
                    <td className="pes-price-col">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}

                {testingItems.map((item, idx) => (
                  <tr key={`test-${idx}`}>
                    <td className="pes-item-name">{item.name}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="pes-badge pes-badge-testing">Testing</span>
                    </td>
                    <td className="pes-qty-col">{item.quantity}</td>
                    <td className="pes-price-col">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}

                {accessoryItems.map((item, idx) => (
                  <tr key={`acc-${idx}`}>
                    <td className="pes-item-name">{item.name}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="pes-badge pes-badge-supply">Supply</span>
                    </td>
                    <td className="pes-qty-col">{item.quantity}</td>
                    <td className="pes-price-col">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}

                {allBundleItems.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '1.25rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
                      No items currently selected in the sections above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
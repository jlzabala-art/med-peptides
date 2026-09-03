"use client";

import React, { useState } from 'react';
import { X, Package, Check, ShieldCheck, ArrowLeft, ShoppingBag } from 'lucide-react';
import { formatPrice, resolveVariantPrice } from '@/services/pricingService';
import StatusBadge from '@/components/ui/StatusBadge';
import { useCart } from '@/context/CartProvider';
import Link from 'next/link';

export default function ConsumableDetail({
  product,
  region,
  isProfessional,
  isAdmin,
  onClose,
  isQuickView = false
}) {
  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.[0] || product);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const { updateCart } = useCart() || {};

  const displayPrice = React.useMemo(() => {
    if (!selectedVariant) return '—';
    const tier = isProfessional ? 'wholesale' : 'retail';
    
    // Canonical schema check
    if (selectedVariant.unit_price) {
      return formatPrice(selectedVariant.unit_price, 'USD', region);
    }
    
    // Legacy schema
    const resolvedPrice = resolveVariantPrice(selectedVariant, { tier, countryCode: region });
    if (resolvedPrice.perUnit != null) {
      return formatPrice(resolvedPrice.perUnit, resolvedPrice.currency ?? 'USD', region);
    }
    return '$0.00';
  }, [selectedVariant, isProfessional, region]);

  if (!product) return null;

  const handleAddToCart = () => {
    if (updateCart) {
      const itemKey = selectedVariant?.dosage 
        ? `${product.name} (${selectedVariant.dosage})` 
        : (selectedVariant?.presentation ? `${product.name} (${selectedVariant.presentation})` : product.name);
      
      updateCart(itemKey, quantity, {
        productId: product.id,
        variantId: selectedVariant?.id,
        name: product.name,
        price: selectedVariant?.unit_price || 0,
        variant: selectedVariant
      });

      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 2500);
    }
  };

  const categoryName = (product.category || 'Clinical Supply').replace(/_/g, ' ').toUpperCase();

  return (
    <div className="cd-root">
      <div className="cd-container">
        {/* Navigation & Header */}
        <div className="cd-top-nav">
          {!isQuickView ? (
            <Link href="/peptides" className="cd-back-btn">
              <ArrowLeft size={16} /> Back to Catalog
            </Link>
          ) : (
            <button onClick={onClose} className="cd-close-btn" aria-label="Close">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="cd-layout-grid">
          {/* Column 1: Product Visual & Specifications */}
          <div className="cd-visual-col">
            <div className="cd-image-card">
              {product.image_url || product.image ? (
                <img 
                  src={product.image_url || product.image} 
                  alt={product.name} 
                  className="cd-product-img"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="cd-image-fallback" 
                style={{ display: (product.image_url || product.image) ? 'none' : 'flex' }}
              >
                <div className="cd-fallback-icon-wrap">
                  <Package size={48} color="var(--primary, #003666)" />
                </div>
                <span className="cd-fallback-title">{product.name}</span>
                <span className="cd-fallback-badge">{categoryName}</span>
              </div>
            </div>
            
            {/* Technical Specifications */}
            <div className="cd-specs-card">
              <h3 className="cd-specs-title">Technical Specifications</h3>
              <ul className="cd-specs-list">
                {product.attributes?.material && (
                  <li className="cd-spec-item">
                    <span className="cd-spec-k">Material</span>
                    <span className="cd-spec-v">{product.attributes.material}</span>
                  </li>
                )}
                {product.attributes?.volume && (
                  <li className="cd-spec-item">
                    <span className="cd-spec-k">Volume / Capacity</span>
                    <span className="cd-spec-v">{product.attributes.volume}</span>
                  </li>
                )}
                {product.attributes?.sterilization && (
                  <li className="cd-spec-item">
                    <span className="cd-spec-k">Sterilization</span>
                    <span className="cd-spec-v">{product.attributes.sterilization}</span>
                  </li>
                )}
                <li className="cd-spec-item">
                  <span className="cd-spec-k">Quality Standard</span>
                  <span className="cd-spec-v">ISO / GMP Certified</span>
                </li>
                <li className="cd-spec-item">
                  <span className="cd-spec-k">Packaging</span>
                  <span className="cd-spec-v">Tamper-Evident Medical Grade</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 2: Buy Box & Options */}
          <div className="cd-buybox-col">
            <div className="cd-buybox-card">
              <div className="cd-category-tag">{categoryName}</div>
              <h1 className="cd-product-title">{product.name}</h1>
              {product.brand && (
                <p className="cd-brand-subtitle">Manufacturer: <strong>{product.brand}</strong></p>
              )}

              {/* Price Banner */}
              <div className="cd-price-section">
                <span className="cd-price-label">Clinical Direct Pricing</span>
                <div className="cd-price-amount">{displayPrice}</div>
              </div>

              {/* Variants Selector */}
              {product.variants && product.variants.length > 1 && (
                <div className="cd-variants-section">
                  <label className="cd-variants-label">Format / Options</label>
                  <div className="cd-variants-grid">
                    {product.variants.map((v, i) => {
                      const isSel = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id || i}
                          type="button"
                          onClick={() => setSelectedVariant(v)}
                          className={`cd-variant-pill ${isSel ? 'cd-variant-pill--active' : ''}`}
                        >
                          {v.label || v.presentation || `Option ${i + 1}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stock Status */}
              <div className="cd-stock-section">
                <StatusBadge 
                  status={selectedVariant?.in_stock !== false ? 'active' : 'inactive'} 
                  customLabel={selectedVariant?.in_stock !== false ? 'In Stock (Ready to Dispatch)' : 'Backorder'} 
                />
              </div>

              {/* Quantity Controls & CTA */}
              <div className="cd-action-row">
                <div className="cd-qty-wrap">
                  <button 
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="cd-qty-btn"
                  >
                    -
                  </button>
                  <span className="cd-qty-val">{quantity}</span>
                  <button 
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="cd-qty-btn"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="cd-cta-btn"
                >
                  <ShoppingBag size={18} />
                  <span>{addedToast ? 'Added to Order!' : 'Add to Order'}</span>
                </button>
              </div>
            </div>

            {/* Quality & Compliance Banner */}
            <div className="cd-compliance-card">
              <div className="cd-compliance-header">
                <ShieldCheck size={20} color="var(--primary, #003666)" />
                <h4 className="cd-compliance-title">Institutional Quality Guarantee</h4>
              </div>
              <p className="cd-compliance-desc">
                All laboratory supplies, excipients, and consumables undergo rigorous batch inspection ensuring compliance with international clinical standards.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cd-root {
          width: 100%;
          min-height: 100vh;
          background: #f8fafc;
          padding: 1.5rem 1rem 4rem;
          box-sizing: border-box;
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
        }
        .cd-container {
          max-width: 1140px;
          margin: 0 auto;
        }
        .cd-top-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        .cd-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--primary, #003666);
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 8px;
          background: #ffffff;
          border: 1px solid var(--border, #e2e8f0);
          transition: all 0.2s ease;
        }
        .cd-back-btn:hover {
          background: #f1f5f9;
        }
        .cd-close-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 6px;
          color: #64748b;
        }
        .cd-layout-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          align-items: start;
        }
        .cd-visual-col, .cd-buybox-col {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .cd-image-card {
          background: #ffffff;
          border: 1px solid var(--border, #e2e8f0);
          border-radius: 18px;
          padding: 2.5rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 280px;
          box-shadow: 0 4px 20px -2px rgba(0, 54, 102, 0.04);
        }
        .cd-product-img {
          width: 100%;
          max-width: 280px;
          height: auto;
          object-fit: contain;
        }
        .cd-image-fallback {
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.75rem;
        }
        .cd-fallback-icon-wrap {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          background: #f0fdfa;
          border: 1px solid #ccfbf1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cd-fallback-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: #0f172a;
        }
        .cd-fallback-badge {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--primary, #003666);
          background: #eff6ff;
          padding: 4px 10px;
          border-radius: 6px;
        }
        .cd-specs-card {
          background: #ffffff;
          border: 1px solid var(--border, #e2e8f0);
          border-radius: 18px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px -2px rgba(0, 54, 102, 0.04);
        }
        .cd-specs-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 1rem 0;
          font-family: 'Outfit', sans-serif;
        }
        .cd-specs-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .cd-spec-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.6rem;
          border-bottom: 1px dashed #e2e8f0;
          font-size: 0.85rem;
        }
        .cd-spec-k {
          color: #64748b;
        }
        .cd-spec-v {
          font-weight: 600;
          color: #0f172a;
        }
        .cd-buybox-card {
          background: #ffffff;
          border: 1px solid var(--border, #e2e8f0);
          border-radius: 18px;
          padding: 2rem;
          box-shadow: 0 4px 20px -2px rgba(0, 54, 102, 0.05);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .cd-category-tag {
          font-size: 0.72rem;
          font-weight: 800;
          color: var(--primary, #003666);
          letter-spacing: 0.06em;
        }
        .cd-product-title {
          font-size: 1.75rem;
          font-weight: 900;
          color: #0f172a;
          margin: 0;
          line-height: 1.2;
          font-family: 'Outfit', sans-serif;
        }
        .cd-brand-subtitle {
          margin: -0.5rem 0 0 0;
          font-size: 0.85rem;
          color: #64748b;
        }
        .cd-price-section {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1rem 1.25rem;
        }
        .cd-price-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 0.25rem;
        }
        .cd-price-amount {
          font-size: 2.2rem;
          font-weight: 900;
          color: #0f172a;
          line-height: 1;
        }
        .cd-variants-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .cd-variants-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #475569;
        }
        .cd-variants-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .cd-variant-pill {
          padding: 8px 14px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          font-size: 0.85rem;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .cd-variant-pill:hover {
          border-color: var(--primary, #003666);
        }
        .cd-variant-pill--active {
          border-color: var(--primary, #003666);
          background: #eff6ff;
          color: var(--primary, #003666);
          box-shadow: 0 0 0 1px var(--primary, #003666);
        }
        .cd-action-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 0.5rem;
        }
        .cd-qty-wrap {
          display: inline-flex;
          align-items: center;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          background: #f8fafc;
          overflow: hidden;
        }
        .cd-qty-btn {
          width: 36px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          font-size: 1.1rem;
          font-weight: 700;
          color: #475569;
          cursor: pointer;
        }
        .cd-qty-btn:hover {
          background: #e2e8f0;
        }
        .cd-qty-val {
          width: 36px;
          text-align: center;
          font-weight: 700;
          font-size: 0.95rem;
          color: #0f172a;
        }
        .cd-cta-btn {
          flex: 1;
          height: 44px;
          border-radius: 10px;
          background: var(--primary, #003666);
          color: #ffffff;
          border: none;
          font-size: 0.95rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .cd-cta-btn:hover {
          background: #002547;
        }
        .cd-compliance-card {
          background: #f0fdfa;
          border: 1px solid #ccfbf1;
          border-radius: 14px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .cd-compliance-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .cd-compliance-title {
          font-size: 0.9rem;
          font-weight: 800;
          color: #0d9488;
          margin: 0;
        }
        .cd-compliance-desc {
          margin: 0;
          font-size: 0.78rem;
          color: #134e4a;
          line-height: 1.45;
        }

        /* Mobile First Stack */
        @media (max-width: 768px) {
          .cd-layout-grid {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
          }
          .cd-visual-col, .cd-buybox-col {
            display: contents;
          }
          .cd-image-card {
            order: 1;
          }
          .cd-buybox-card {
            order: 2;
            padding: 1.25rem;
          }
          .cd-specs-card {
            order: 3;
          }
          .cd-compliance-card {
            order: 4;
          }
          .cd-product-title {
            font-size: 1.4rem;
          }
          .cd-price-amount {
            font-size: 1.8rem;
          }
        }
      `}</style>
    </div>
  );
}

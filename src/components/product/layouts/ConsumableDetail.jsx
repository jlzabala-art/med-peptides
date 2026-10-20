"use client";

import React, { useState } from 'react';
import { X, Package, Check, ShieldCheck, ArrowLeft, ShoppingBag } from 'lucide-react';
import { formatPrice, resolveVariantPrice } from '@/services/pricingService';
import StatusBadge from '@/components/ui/StatusBadge';
import { useCart } from '@/context/CartProvider';
import Link from 'next/link';
import './ConsumableDetail.css';

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

    </div>
  );
}

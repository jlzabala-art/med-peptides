"use client";
/* eslint-disable no-unused-vars */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, ArrowLeft, Sparkles } from 'lucide-react';
import ProductDetailRouter from '../product/ProductDetailRouter';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartProvider';
import { productRepository } from '@/repositories/productRepository';
import { DetailSkeleton } from '../shared/SkeletonLoader';
import { useRoleAccess } from '@/hooks/useRoleAccess';

// ─── Constants ────────────────────────────────────────────────────────────────
// Keep in sync with AppSidebar.css --sb-w-full / --sb-w-mini fallbacks
const TOPBAR_HEIGHT = '60px';

export default function UniversalProductQuickView({ 
  product, 
  isOpen, 
  onClose,
  allFaqs = [],
  products = [],
  activeSupplierFilter = null
}) {
  const router = useRouter();
  const { updateCart, cart } = useCart();
  const currentRegion = 'US'; // Default fallback
  const { role, is } = useRoleAccess();
  const isProfessional = is('doctor') || is('clinic') || is('wholeseller') || is('pharmacy');

  const [enrichedProduct, setEnrichedProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Lock body scroll when open — only the content area scrolls
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Fetch full enriched product data when opened with a summary product
  useEffect(() => {
    let isMounted = true;
    if (isOpen && product?.name) {
      if (product.id && !product.id.includes('temp-')) {
        productRepository.getProductWithVariants(product.id).then(match => {
          if (!isMounted) return;
          const targetSupplier = activeSupplierFilter || product._preselectedSupplierId || product.supplierId || product.supplier;
          let explicitSupplierId = targetSupplier;
          
          if (targetSupplier && match?.variants) {
            const cleanFilter = String(targetSupplier).toLowerCase().replace(/^supplier-/, '').trim();
            const mVar = match.variants.find(v => {
              const s1 = String(v.supplier || '').toLowerCase().replace(/^supplier-/, '').trim();
              const s2 = String(v.supplierId || '').toLowerCase().replace(/^supplier-/, '').trim();
              const s3 = String(v.supplierName || '').toLowerCase().replace(/^supplier-/, '').trim();
              return s1 === cleanFilter || s2 === cleanFilter || s3 === cleanFilter || s1.includes(cleanFilter) || s3.includes(cleanFilter);
            });
            if (mVar) explicitSupplierId = mVar.supplierId || mVar.supplier || mVar.supplierName;
          }
          
          setEnrichedProduct(match ? { ...match, _preselectedSupplierId: explicitSupplierId } : product);
        }).catch(err => {
          if (!isMounted) return;
          console.error("Error fetching full product for QuickView:", err);
          setEnrichedProduct(product);
        });
      } else {
        Promise.resolve().then(() => {
          if (isMounted) setEnrichedProduct(product);
        });
      }
    } else {
      Promise.resolve().then(() => {
        if (isMounted) setEnrichedProduct(null);
      });
    }
    return () => { isMounted = false; };
  }, [isOpen, product, activeSupplierFilter]);

  if (!isOpen || !product) return null;

  const handleGoToFullPage = () => {
    onClose();
    const slug = product.slug || product.name?.toLowerCase().replace(/\s+/g, '-');
    if (slug) router.push(`/product/${slug}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 
            ── Drawer covers the content area only ────────────────────────────
            left: var(--sidebar-current-width)  → updated by AppSidebar/index.jsx
            top:  TOPBAR_HEIGHT                 → below the fixed topbar
            No backdrop needed — the drawer IS the content area.
          */}
          <style>{`
            .quick-view-drawer {
              position: fixed;
              top: ${TOPBAR_HEIGHT};
              left: var(--sidebar-current-width, 260px);
              right: 0;
              bottom: 0;
              width: auto;
              background-color: var(--color-bg-app, #f8fafc);
              z-index: 90;
              display: flex;
              flex-direction: column;
              overflow: hidden;
              font-family: Inter, system-ui, -apple-system, sans-serif;
              border-left: 1px solid var(--border, #e2e8f0);
            }
            @media (max-width: 1024px) {
              .quick-view-drawer {
                left: 0 !important;
                border-left: none;
              }
            }
          `}</style>
          <motion.div
            key="quick-view-drawer"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="quick-view-drawer"
          >
            {/* ── B2B Header bar ─────────────────────────────────────────────
                Clear close button (← Back) + product name + "Full Page" link.
                This header is exclusive to the Quick View context (isQuickView).
                ProductDetailContent itself doesn't render any close button.
            */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0 1.5rem',
              height: '52px',
              borderBottom: '1px solid var(--border, #e2e8f0)',
              backgroundColor: 'var(--color-bg-surface, #ffffff)',
              flexShrink: 0,
              zIndex: 10,
            }}>
              {/* ← Back — prominent close action */}
              <button
                onClick={onClose}
                aria-label="Close product view"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border, #e2e8f0)',
                  background: 'var(--color-bg-surface, #fff)',
                  color: 'var(--text-main, #0f172a)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-muted, #f1f5f9)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--color-bg-surface, #fff)'}
              >
                <ArrowLeft size={16} />
                Back to catalog
              </button>

              {/* Product name — center */}
              <span style={{
                flex: 1,
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--text-main, #0f172a)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {product.name || product.canonicalName}
              </span>

              {/* Consult ClinicalAI button */}
              <button
                onClick={() => {
                  const targetProd = enrichedProduct || product;
                  window.dispatchEvent(new CustomEvent('open-clinical-ai', {
                    detail: {
                      action: 'ask_about_entity',
                      entityName: targetProd.canonicalName || targetProd.name,
                      displayText: `Clinical Profile: ${targetProd.canonicalName || targetProd.name}`,
                      autoSend: true,
                      clearHistory: true,
                      productMode: true,
                      autoGenerate: true,
                      context: {
                        isProductPage: true,
                        productMode: true,
                        name: targetProd.canonicalName || targetProd.name,
                        canonicalName: targetProd.canonicalName || targetProd.name,
                        displayName: targetProd.displayName || targetProd.canonicalName,
                        slug: targetProd.slug || targetProd.id,
                        id: targetProd.id,
                        category: targetProd.category || '',
                        tags: targetProd.tags || [],
                        goalIds: targetProd.goalIds || [],
                        goalLabels: targetProd.goalLabels || [],
                        // ── Contenido clínico ──────────────────────────────────
                        description: targetProd.description || '',
                        objective: targetProd.objective || '',
                        mechanisms: targetProd.mechanisms || targetProd.mechanism || '',
                        clinical_benefits: targetProd.clinical_benefits || targetProd.clinicalBenefits || [],
                        pharmacology: targetProd.pharmacology || {
                          halfLife: targetProd.halfLife || null,
                          bioavailability: targetProd.bioavailability || null,
                        },
                        aiContent: targetProd.aiContent || null,
                        purity: targetProd.purity || '≥98%',
                        standard_dosage: targetProd.standard_dosage || '',
                        storage: targetProd.storage || null,
                        variants: (targetProd.variants || []).map(v => ({
                          dosage: v.dosage,
                          presentation: v.presentation,
                          supplier: v.supplierName || v.supplierId || v.supplier,
                          stock: v.stock,
                          purity: v.purity || targetProd.purity,
                        })),
                        relatedProtocols: targetProd.relatedProtocols || [],
                      }
                    }
                  }));
                }}
                title="Consultar ClinicalAI sobre este producto"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(124, 58, 237, 0.25)',
                  background: 'rgba(124, 58, 237, 0.06)',
                  color: '#7c3aed',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(124, 58, 237, 0.12)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(124, 58, 237, 0.06)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <Sparkles size={14} />
                <span>AI Atlas</span>
              </button>

              {/* Full Page link */}
              <button
                onClick={handleGoToFullPage}
                title="Open full product page"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'none',
                  color: 'var(--color-primary, #003666)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Full page <ExternalLink size={13} />
              </button>

              {/* X icon — secondary close */}
              <button
                onClick={onClose}
                aria-label="Close"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'none',
                  color: 'var(--text-muted, #64748b)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-muted, #f1f5f9)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <X size={18} />
              </button>
            </div>

            {/* ── Scrollable content — shared ProductDetailContent ────────── */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              backgroundColor: 'var(--color-bg-app, #f8fafc)',
            }}>
              {loading ? (
                <div style={{ padding: '2rem' }}>
                  <DetailSkeleton />
                </div>
              ) : (
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ProductDetailRouter 
                    product={enrichedProduct}
                    region={currentRegion}
                    isProfessional={isProfessional}
                    isAdmin={role === 'admin'}
                    onAddToCart={updateCart}
                    cart={cart}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

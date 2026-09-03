import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UploadCloud, Plus, Share2, Copy, Check, ExternalLink } from '@/lib/icons';
import TooltipWrapper from '../ui/TooltipWrapper';
import AppEntityCell from '../ui/AppEntityCell';
import InlineEditField from '../ui/InlineEditField';
import AppStatusToggle from '../ui/AppStatusToggle';
import AppActionGroup from '../ui/AppActionGroup';
import CopyableId from '../ui/CopyableId';
import notifier from '../../services/NotificationService';
import { getProductAvailableTypes } from '../../utils/productNormalizer';

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://regenpept.com';

/**
 * QrShareButton — inline share button for admin table rows.
 * Opens a compact popover with: public URL, copy, open in tab, WhatsApp share.
 * No modal, no full-screen takeover — stays in table context (Rule #4).
 */
function QrShareButton({ product }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);
  const slug = product.slug || product.id;
  const publicUrl = `${BASE_URL}/p/${slug}`;

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const copyUrl = useCallback(async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [publicUrl]);

  const shareWhatsApp = () => {
    const text = `${product.name || product.id} — Clinical Information\n${publicUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(p => !p)}
        title="Share / QR public link"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28, borderRadius: '6px', border: '1px solid #e2e8f0',
          background: open ? '#eff6ff' : 'white', cursor: 'pointer',
          color: open ? '#2563eb' : '#64748b', transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => { if (!open) { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; } }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e2e8f0'; } }}
      >
        <Share2 size={13} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 6px)', right: 0,
          width: '280px', background: 'white',
          border: '1px solid #e2e8f0', borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 999,
          padding: '0.9rem',
        }}>
          {/* URL display */}
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Public Product URL
          </div>
          <div style={{
            background: '#f8fafc', borderRadius: '6px', padding: '0.4rem 0.6rem',
            fontSize: '0.72rem', color: '#475569', wordBreak: 'break-all',
            border: '1px solid #e2e8f0', marginBottom: '0.6rem',
          }}>
            {publicUrl}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              onClick={copyUrl}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                padding: '0.45rem 0.6rem', borderRadius: '7px',
                border: '1px solid #e2e8f0', background: copied ? '#f0fdf4' : 'white',
                cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                color: copied ? '#16a34a' : '#475569', transition: 'all 0.15s ease',
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy URL'}
            </button>

            <button
              onClick={() => window.open(publicUrl, '_blank', 'noopener')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                padding: '0.45rem 0.6rem', borderRadius: '7px',
                border: '1px solid #e2e8f0', background: 'white',
                cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: '#475569',
              }}
            >
              <ExternalLink size={12} />
              Preview
            </button>

            {/* WhatsApp */}
            <button
              onClick={shareWhatsApp}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                padding: '0.45rem 0.6rem', borderRadius: '7px',
                border: 'none', background: '#25d366',
                cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, color: 'white',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.091.537 4.058 1.477 5.771L.013 23.52l5.893-1.44A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a10 10 0 01-5.079-1.381l-.365-.217-3.495.854.875-3.403-.238-.384A10 10 0 1122 12 10.011 10.011 0 0112 22z"/></svg>
              WhatsApp
            </button>
          </div>

          {/* Label downloads */}
          <div style={{ marginTop: '0.6rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Printable Materials
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
              <a
                href={`/api/vial-label/${product.id}?format=38x90`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
                  padding: '0.4rem', borderRadius: '6px',
                  border: '1px solid #e2e8f0', background: '#f8fafc',
                  cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, color: '#334155',
                  textDecoration: 'none', transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
              >
                🏷️ Vial (38x90)
              </a>
              <a
                href={`/api/vial-label/${product.id}?format=sheet_a4`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
                  padding: '0.4rem', borderRadius: '6px',
                  border: '1px solid #e2e8f0', background: '#f8fafc',
                  cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, color: '#334155',
                  textDecoration: 'none', transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
              >
                📋 Sheet (A4 x8)
              </a>
            </div>
            <a
              href={`/api/product-sheet/${product.id}`}
              download
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                padding: '0.4rem', borderRadius: '6px',
                border: '1px dashed #cbd5e1', background: '#f8fafc',
                cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, color: '#475569',
                textDecoration: 'none', transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
            >
              📄 Clinical Datasheet (PDF)
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export function getAdminProductsColumns({
  isAdmin,
  user,
  readOnly,
  savingProduct,
  navigate,
  updateProduct,
  handleDeleteProduct,
  handleScrapeCompetitor,
  onAddToPrescription,
  inventoryMode = false,
}) {
  const columns = [
    {
      key: 'product',
      header: 'Product / Category',
      // No explicit width, it will take the remaining flexible space
      sortKey: 'product',
      sortValue: (p) => p.name.toLowerCase(),
      render: (p) => (
        <div style={{ display: 'inline-flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div style={{ marginTop: '2px', width: '16px', display: 'flex', justifyContent: 'center' }}>
            {p.zoho_item_id && (
              <TooltipWrapper text="Synced to Zoho Inventory">
                <UploadCloud size={16} color="#1a73e8" />
              </TooltipWrapper>
            )}
          </div>
          <AppEntityCell
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.name}</span>
                {p.sku ? (
                  <CopyableId value={p.sku} iconOnly={true} />
                ) : (
                  <CopyableId value={p.id} iconOnly={true} />
                )}
              </div>
            }
            subtitle={
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                <span style={{ opacity: 0.5 }}>↳</span>
                <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 500, textTransform: 'capitalize' }}>
                  {p.categoryId || p.category || 'Uncategorized'}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>|</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {p.isGroup ? `${p.variants?.length || 0} Variants` : p.dosage}
                </span>
              </div>
            }
          />
        </div>
      ),
    },
    {
      key: 'product_type',
      header: 'Type',
      width: '120px',
      render: (p) => {
        const types = getProductAvailableTypes(p);
        const TYPE_CHIP = {
          finished_product:  { label: 'Finished',  color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
          raw_material:      { label: 'Bulk API',  color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
          clinical_supplies: { label: 'Clinical',  color: '#475569', bg: '#f8fafc', border: '#e2e8f0' },
          diagnostic:        { label: 'Diagnostic',color: '#7c3aed', bg: '#fdf4ff', border: '#e9d5ff' },
          service:           { label: 'Service',   color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
        };
        return (
          <TooltipWrapper content="Derived from variant types. Edit via variant subcollection.">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
              {types.map(t => {
                const cfg = TYPE_CHIP[t] || { label: t, color: '#64748b', bg: '#f1f5f9', border: '#e2e8f0' };
                return (
                  <span key={t} style={{
                    fontSize: '0.65rem', fontWeight: 700,
                    padding: '1px 5px', borderRadius: '4px',
                    background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                  }}>{cfg.label}</span>
                );
              })}
            </div>
          </TooltipWrapper>
        );
      },
    },
    {
      key: 'supplier',
      header: 'Supplier',
      width: '130px',
      sortKey: 'supplierName',
      sortValue: (p) => (p.supplierName || p.supplier || '').toLowerCase(),
      render: (p) => {
        const supplierName = p.supplierName || p.supplier || p['Supplier'];
        if (!supplierName) return '-';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ 
              fontWeight: 500, 
              color: 'var(--text-main)' 
            }}>
              {supplierName}
            </span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      width: '90px',
      sortKey: 'status',
      render: (p) => {
        let isLocked = false;
        let isLocallyActive = p.isActive !== false;

        if (!isAdmin && user) {
          if (p.isActive === false) {
            isLocked = true;
            isLocallyActive = false;
          } else {
            const localOverrides = p.localOverrides || {};
            if (localOverrides[user.uid] === false) {
              isLocallyActive = false;
            }
          }
        }

        const handleToggle = (willBeActive) => {
          if (isAdmin) {
            updateProduct(p.id, { isActive: willBeActive });
          } else {
            if (!user) return;
            updateProduct(p.id, { [`localOverrides.${user.uid}`]: willBeActive });
          }
        };

        return (
          <AppStatusToggle isActive={isLocallyActive} isLocked={isLocked} onToggle={handleToggle} />
        );
      },
    },
    {
      key: 'qr_scans',
      header: 'QR Scans',
      width: '95px',
      sortKey: 'qrScans',
      sortValue: (p) => p.qrScans || p.analytics?.qrScans || 0,
      render: (p) => {
        const count = p.qrScans || p.analytics?.qrScans || 0;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.2rem 0.5rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: count > 0 ? '#eff6ff' : '#f8fafc',
              color: count > 0 ? '#2563eb' : '#94a3b8',
              border: `1px solid ${count > 0 ? '#bfdbfe' : '#e2e8f0'}`,
            }}>
              📱 {count}
            </span>
          </div>
        );
      },
    },
  ];

  if (inventoryMode) {
    columns.push(
      {
        key: 'stock_level',
        header: 'Stock',
        width: '100px',
        sortKey: 'stock_level',
        render: (p) => (
          <span style={{ fontWeight: 600 }}>{p.stock_level || 0}</span>
        )
      },
      {
        key: 'stock_min_threshold',
        header: 'Min Stock',
        width: '100px',
        render: (p) => (
          <span style={{ color: 'var(--text-muted)' }}>{p.stock_min_threshold || 0}</span>
        )
      },
      {
        key: 'inventory_status',
        header: 'Inv Status',
        width: '120px',
        render: (p) => {
          const stock = p.stock_level || 0;
          const min = p.stock_min_threshold || 0;
          let statusStr = 'in_stock';
          if (stock === 0) statusStr = 'out_of_stock';
          else if (stock <= min) statusStr = 'low_stock';
          
          let color = 'var(--color-success)';
          let bg = 'var(--color-success-bg)';
          let label = 'In Stock';
          
          if (statusStr === 'out_of_stock') {
            color = '#dc2626';
            bg = '#fef2f2';
            label = 'Out of Stock';
          } else if (statusStr === 'low_stock') {
            color = '#d97706';
            bg = '#fffbeb';
            label = 'Low Stock';
          }
          
          return (
            <span style={{ 
              backgroundColor: bg, 
              color: color, 
              padding: '2px 8px', 
              borderRadius: '12px', 
              fontSize: '0.75rem', 
              fontWeight: 600 
            }}>
              {label}
            </span>
          );
        }
      }
    );
  }

  if (!readOnly) {
    columns.push({
      key: 'actions',
      header: 'Actions',
      align: 'right',
      width: '160px',
      render: (p) => {
        const targetP = p.isGroup ? (p.variants && p.variants[0] ? p.variants[0] : p) : p;
        const actions = [
          {
            type: 'custom',
            label: 'Add to Prescription',
            icon: Plus, // Use the component, not a string
            onClick: () => {
              if (onAddToPrescription) onAddToPrescription(targetP);
            }
          },
          {
            type: 'inventory',
            onClick: () => {
              navigate(
                `/admin/sku-sync?sku=${encodeURIComponent(targetP.sku || '')}&productId=${encodeURIComponent(targetP.id || '')}`
              );
            },
          },
          {
            type: 'pricing',
            onClick: () => {
              navigate(
                `/admin/prices?sku=${encodeURIComponent(targetP.sku || '')}&productId=${encodeURIComponent(targetP.id || '')}`
              );
            },
          },
          {
            type: 'protocols',
            onClick: () => {
              navigate(`/admin/protocols`);
            },
          },
          {
            type: 'ai',
            onClick: () => {
              window.dispatchEvent(
                new CustomEvent('OPEN_ATLAS_CLINICAL_MODE', {
                  detail: { product: targetP.name, sku: targetP.sku },
                })
              );
            },
          },
          {
            type: 'search',
            label: 'Search Competitors',
            onClick: () => handleScrapeCompetitor(targetP),
          },
        ];

        if (!p.isGroup) {
          actions.push({
            type: 'delete',
            onClick: () => notifier.confirmCritical(
              `Delete "${p.name}"? This cannot be undone.`,
              () => handleDeleteProduct(p.id)
            )
          });
        }

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {savingProduct === p.id && (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Saving...</span>
            )}
            {/* Share / QR public link button */}
            <QrShareButton product={p} />
            <AppActionGroup actions={actions} />
          </div>
        );
      },
    });
  }

  return columns;
}

"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  ExternalLink,
  Download,
  Save,
  Package,
  Plus,
  Trash2,
  Search,
  Check,
  Loader2,
  Tag
} from '@/lib/icons';
import CopyableId from '@/components/ui/CopyableId';
import { formatDateDisplay } from './payablesFormat';
import toast from 'react-hot-toast';

export default function BillExpandableDetail({
  bill,
  token,
  isLocked,
  lang = 'es',
  activeEmail,
  isMasterAdmin = false,
  paymentTerms,
  onBillUpdated
}) {
  const row = bill || {};
  const billId = row.billId || row.id;
  const billNum = row.billNumber || billId || 'FAC-••••••••';
  const totalNum = Number(row.total || 0);
  const balanceNum = Number(row.balance !== undefined ? row.balance : totalNum);
  const currency = row.currency || 'AED';
  const emailParam = activeEmail ? `?email=${encodeURIComponent(activeEmail)}` : '';
  const pdfUrl = `/api/payables/${token}/pdf/${encodeURIComponent(billId)}${emailParam}`;

  // State for admin annotations & description
  const [description, setDescription] = useState(row.adminDescription || '');
  const [associatedProducts, setAssociatedProducts] = useState(
    Array.isArray(row.associatedProducts) ? row.associatedProducts : []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // State for product search & autocomplete
  const [productQuery, setProductQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const searchContainerRef = useRef(null);

  // Sync state if prop changes
  useEffect(() => {
    setDescription(row.adminDescription || '');
    setAssociatedProducts(Array.isArray(row.associatedProducts) ? row.associatedProducts : []);
  }, [row.adminDescription, row.associatedProducts]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowProductDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced product search from public catalog API
  useEffect(() => {
    if (!productQuery || productQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/catalog/public?search=${encodeURIComponent(productQuery.trim())}&limit=8`);
        const json = await res.json();
        if (json.products && Array.isArray(json.products)) {
          setSearchResults(json.products);
          setShowProductDropdown(true);
        }
      } catch (err) {
        console.error('Error fetching catalog products:', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [productQuery]);

  const handleAddProduct = (prod) => {
    if (!prod) return;
    const exists = associatedProducts.some(p => p.id === prod.id || (p.sku && p.sku === prod.sku));
    if (exists) {
      toast(lang === 'es' ? 'Este producto ya está asociado' : 'Product is already linked', { icon: 'ℹ️' });
      setShowProductDropdown(false);
      return;
    }

    const newProd = {
      id: prod.id || `prod_${Date.now()}`,
      name: prod.name || 'Unnamed Product',
      sku: prod.sku || '',
      category: prod.category || 'General',
      quantity: 1,
      allocatedCostAed: 0
    };

    setAssociatedProducts(prev => [...prev, newProd]);
    setProductQuery('');
    setShowProductDropdown(false);
    toast.success(lang === 'es' ? `Producto añadido: ${newProd.name}` : `Product added: ${newProd.name}`);
  };

  const handleRemoveProduct = (indexToRemove) => {
    setAssociatedProducts(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleUpdateProductQty = (index, newQty) => {
    const qty = Math.max(1, parseInt(newQty, 10) || 1);
    setAssociatedProducts(prev => prev.map((p, idx) => idx === index ? { ...p, quantity: qty } : p));
  };

  const handleSaveToFirebase = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/payables/${token}/bill-annotation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billId,
          description,
          associatedProducts,
          email: activeEmail
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to save annotation in Firebase');
      }

      setSaveSuccess(true);
      toast.success(
        lang === 'es'
          ? 'Descripción y productos guardados en Firebase con éxito'
          : 'Description & products saved to Firebase successfully'
      );

      if (typeof onBillUpdated === 'function') {
        onBillUpdated();
      }

      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Error saving bill annotation:', err);
      toast.error(err.message || 'Error saving to Firebase');
    } finally {
      setIsSaving(false);
    }
  };

  const linkedClientInvoice = row.sourceInvoiceNumber || row.referenceNumber || '';

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      padding: '16px',
      margin: '4px 0',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
      gap: '20px',
      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)'
    }}>
      {/* ── LEFT COLUMN: EXECUTIVE BILL SUMMARY & TRACEABILITY ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Card 1: Official Summary */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="#003666" />
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                {lang === 'es' ? 'Resumen Ejecutivo de Factura' : 'Executive Bill Summary'}
              </span>
            </div>
            <span style={{
              fontSize: '0.70rem',
              fontWeight: 700,
              color: '#0369a1',
              backgroundColor: '#e0f2fe',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              Zoho Books Bill
            </span>
          </div>

          {/* Key Attributes Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.78rem' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.70rem', fontWeight: 600 }}>
                {lang === 'es' ? 'N.º FACTURA OFICIAL' : 'OFFICIAL BILL #'}
              </div>
              <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <span>{billNum}</span>
                <CopyableId value={billNum} iconOnly={true} />
              </div>
            </div>

            <div>
              <div style={{ color: '#64748b', fontSize: '0.70rem', fontWeight: 600 }}>
                {lang === 'es' ? 'FACTURA CLIENTE VINCULADA' : 'LINKED CLIENT INVOICE'}
              </div>
              <div style={{ fontWeight: 700, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <span>{linkedClientInvoice || '—'}</span>
                {linkedClientInvoice && <CopyableId value={linkedClientInvoice} iconOnly={true} />}
              </div>
            </div>

            <div>
              <div style={{ color: '#64748b', fontSize: '0.70rem', fontWeight: 600 }}>
                {lang === 'es' ? 'FECHA DE EMISIÓN' : 'ISSUE DATE'}
              </div>
              <div style={{ fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>
                {formatDateDisplay(row.date, lang)}
              </div>
            </div>

            <div>
              <div style={{ color: '#64748b', fontSize: '0.70rem', fontWeight: 600 }}>
                {lang === 'es' ? 'FECHA DE VENCIMIENTO' : 'DUE DATE'}
              </div>
              <div style={{
                fontWeight: 700,
                color: (row.status === 'overdue' || (row.dueDate && row.dueDate <= new Date().toISOString().slice(0, 10))) ? '#dc2626' : '#1e293b',
                marginTop: '2px'
              }}>
                {formatDateDisplay(row.dueDate, lang)}
              </div>
            </div>

            <div>
              <div style={{ color: '#64748b', fontSize: '0.70rem', fontWeight: 600 }}>
                {lang === 'es' ? 'IMPORTE TOTAL' : 'TOTAL AMOUNT'}
              </div>
              <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                {totalNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
              </div>
            </div>

            <div>
              <div style={{ color: '#c2410c', fontSize: '0.70rem', fontWeight: 700 }}>
                {lang === 'es' ? 'SALDO PENDIENTE' : 'BALANCE DUE'}
              </div>
              <div style={{ fontWeight: 800, color: '#c2410c', marginTop: '2px' }}>
                {balanceNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
              </div>
            </div>
          </div>

          {/* Commercial Terms Notice */}
          <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.74rem', color: '#475569' }}>
            <strong>{lang === 'es' ? 'Términos de Liquidación:' : 'Settlement Terms:'}</strong> {paymentTerms || 'Net 10th Prox. (Post-Settlement)'}
            <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '3px' }}>
              {lang === 'es'
                ? 'Liquidación transferible dentro de los primeros 10 días naturales del mes tras confirmación del cobro del cliente.'
                : 'Payable within the first 10 calendar days of the month following client payment receipt.'}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                backgroundColor: '#003666',
                color: '#ffffff',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 700,
                textDecoration: 'none',
                minHeight: '36px'
              }}
            >
              <ExternalLink size={13} />
              <span>{lang === 'es' ? 'Abrir PDF en Pantalla Completa' : 'Open PDF Full Screen'}</span>
            </a>

            <a
              href={pdfUrl}
              download={`Bill-${billNum}.pdf`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                backgroundColor: '#ffffff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 600,
                textDecoration: 'none',
                minHeight: '36px'
              }}
            >
              <Download size={13} />
              <span>{lang === 'es' ? 'Descargar PDF' : 'Download PDF'}</span>
            </a>
          </div>
        </div>

        {/* Card 2: Admin Description & Product Catalog Association (Traceability Hub) */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          {/* Header of Annotation Card */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag size={16} color="#003666" />
              <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                {lang === 'es' ? 'Descripción y Trazabilidad de Productos' : 'Description & Product Traceability'}
              </span>
            </div>
            {isMasterAdmin ? (
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#15803d',
                backgroundColor: '#dcfce7',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                {lang === 'es' ? 'Edición Administrador' : 'Admin Editable'}
              </span>
            ) : (
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                color: '#64748b',
                backgroundColor: '#f1f5f9',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                {lang === 'es' ? 'Solo Lectura' : 'Read-Only'}
              </span>
            )}
          </div>

          {/* Section A: Description / Internal Notes */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{lang === 'es' ? 'Descripción / Observaciones Administrativas:' : 'Administrative Description & Notes:'}</span>
              </label>
              {row.adminDescriptionUpdatedAt && (
                <span style={{ fontSize: '0.66rem', color: '#94a3b8' }}>
                  {lang === 'es' ? 'Actualizado:' : 'Updated:'} {new Date(row.adminDescriptionUpdatedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            {isMasterAdmin ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder={lang === 'es'
                  ? 'Escribe aquí notas internas, observaciones del pedido, lote o justificación contable para este bill...'
                  : 'Add internal administrative notes, order remarks, batch or reconciliation justification...'}
                style={{
                  width: '100%',
                  fontSize: '0.78rem',
                  lineHeight: '1.45',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  backgroundColor: '#ffffff',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#003666'}
                onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
              />
            ) : (
              <div style={{
                padding: '10px 12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '0.78rem',
                color: description ? '#1e293b' : '#94a3b8',
                fontStyle: description ? 'normal' : 'italic'
              }}>
                {description || (lang === 'es' ? 'Sin observaciones registradas por administración.' : 'No notes recorded by administration.')}
              </div>
            )}
          </div>

          {/* Section B: Associated Catalog Products */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Package size={14} color="#003666" />
                <span>{lang === 'es' ? 'Productos del Catálogo Asociados:' : 'Associated Catalog Products:'}</span>
                <span style={{
                  fontSize: '0.68rem',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontWeight: 700
                }}>
                  {associatedProducts.length}
                </span>
              </label>
            </div>

            {/* Product Chips List */}
            {associatedProducts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: isMasterAdmin ? '10px' : '0' }}>
                {associatedProducts.map((prod, idx) => (
                  <div
                    key={prod.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      fontSize: '0.76rem',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: '#166534',
                        backgroundColor: '#dcfce7',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        whiteSpace: 'nowrap'
                      }}>
                        {prod.sku || 'SKU-GEN'}
                      </span>
                      <span style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {prod.name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      {isMasterAdmin ? (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '0.70rem', color: '#64748b' }}>Cant:</span>
                            <input
                              type="number"
                              min="1"
                              value={prod.quantity || 1}
                              onChange={(e) => handleUpdateProductQty(idx, e.target.value)}
                              style={{
                                width: '48px',
                                padding: '2px 4px',
                                fontSize: '0.74rem',
                                border: '1px solid #cbd5e1',
                                borderRadius: '4px',
                                textAlign: 'center'
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(idx)}
                            title={lang === 'es' ? 'Quitar producto' : 'Remove product'}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#dc2626',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#166534' }}>
                          × {prod.quantity || 1}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '8px 10px',
                backgroundColor: '#f8fafc',
                border: '1px dashed #cbd5e1',
                borderRadius: '6px',
                fontSize: '0.74rem',
                color: '#64748b',
                marginBottom: isMasterAdmin ? '10px' : '0'
              }}>
                {lang === 'es' ? 'No hay productos asociados a esta factura todavía.' : 'No catalog products linked to this bill yet.'}
              </div>
            )}

            {/* Product Selector / Search (Only for Master Admin) */}
            {isMasterAdmin && (
              <div ref={searchContainerRef} style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <Search size={14} color="#64748b" style={{ position: 'absolute', left: '10px', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    value={productQuery}
                    onChange={(e) => setProductQuery(e.target.value)}
                    onFocus={() => { if (searchResults.length > 0) setShowProductDropdown(true); }}
                    placeholder={lang === 'es' ? 'Buscar producto en catálogo por nombre o SKU...' : 'Search product in catalog by name or SKU...'}
                    style={{
                      width: '100%',
                      padding: '7px 10px 7px 30px',
                      fontSize: '0.76rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  />
                  {isSearching && (
                    <Loader2 size={14} color="#003666" style={{ position: 'absolute', right: '10px', animation: 'spin 1s linear infinite' }} />
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                {showProductDropdown && searchResults.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 40,
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {searchResults.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleAddProduct(p)}
                        style={{
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f1f5f9',
                          fontSize: '0.76rem',
                          transition: 'background-color 0.1s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                            SKU: {p.sku || 'N/A'} • {p.category || 'General'}
                          </div>
                        </div>
                        <button
                          type="button"
                          style={{
                            padding: '3px 8px',
                            backgroundColor: '#e0f2fe',
                            color: '#0369a1',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.70rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Plus size={12} />
                          <span>{lang === 'es' ? 'Asociar' : 'Link'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Master Admin Save Button */}
          {isMasterAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px', borderTop: '1px solid #f1f5f9' }}>
              {saveSuccess && (
                <span style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={14} />
                  <span>{lang === 'es' ? '¡Guardado en Firebase!' : 'Saved to Firebase!'}</span>
                </span>
              )}

              <button
                type="button"
                onClick={handleSaveToFirebase}
                disabled={isSaving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 16px',
                  backgroundColor: isSaving ? '#64748b' : '#003666',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  minHeight: '36px',
                  transition: 'background-color 0.15s ease'
                }}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>{lang === 'es' ? 'Guardando en Firebase...' : 'Saving to Firebase...'}</span>
                  </>
                ) : (
                  <>
                    <Save size={13} />
                    <span>{lang === 'es' ? 'Guardar en Firebase' : 'Save to Firebase'}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT COLUMN: EMBEDDED INTERACTIVE PDF VIEWER ── */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        minHeight: '480px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={14} color="#0284c7" />
            <span>{lang === 'es' ? 'Previsualización Oficial de Zoho Books' : 'Official Zoho Books PDF Preview'}</span>
          </span>
          <span style={{ fontSize: '0.70rem', color: '#64748b' }}>
            {lang === 'es' ? 'Documento Oficial de Liquidación' : 'Authoritative Settlement Document'}
          </span>
        </div>

        <div style={{ flex: 1, width: '100%', minHeight: '430px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1', backgroundColor: '#e2e8f0' }}>
          <iframe
            src={pdfUrl}
            title={`PDF Preview ${billNum}`}
            style={{ width: '100%', height: '100%', minHeight: '430px', border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
}

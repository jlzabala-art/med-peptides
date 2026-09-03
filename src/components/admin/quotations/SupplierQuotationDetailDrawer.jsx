"use client";

import React, { useState, useEffect } from 'react';
import { 
  Building2, Calendar, DollarSign, FileCheck, ExternalLink, 
  ShoppingCart, CheckCircle2, XCircle, AlertTriangle, Loader2,
  Truck, CreditCard, ShieldCheck, Download, Package, ArrowRight
} from 'lucide-react';
import { fetchSupplierQuotationById, updateSupplierQuotation } from '../../../services/quotationRepository';
import StandardDrawer from '../../ui/StandardDrawer';
import StatusBadge from '../../ui/StatusBadge';
import DataTable from '../../ui/DataTable';
import CopyableId from '../../ui/CopyableId';
import MarginProfitabilityHUD from '../../ui/MarginProfitabilityHUD';
import { WarehouseOriginBadge, ColdChainBadge } from '../../ui/WarehouseOriginBadge';
import notifier from '../../../services/NotificationService';
import { formatCurrencyAdaptive, formatNumberAdaptive } from '../../../utils/formatters';

/**
 * SupplierQuotationDetailDrawer
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional drawer to inspect, audit, accept/reject, or convert a supplier
 * quotation into a Purchase Order (PO) with full probative document viewer.
 */
export default function SupplierQuotationDetailDrawer({ 
  quotationId, 
  isOpen, 
  onClose, 
  onStatusChange,
  zIndex = 10050 
}) {
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConverting, setIsConverting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [marginPercent, setMarginPercent] = useState(6.0);

  useEffect(() => {
    async function fetchQuotation() {
      if (!quotationId || !isOpen) return;
      setLoading(true);
      try {
        const data = await fetchSupplierQuotationById(quotationId);
        if (data) {
          setQuotation(data);
        } else {
          notifier.error(`Quotation ${quotationId} not found`);
        }
      } catch (err) {
        console.error("Error fetching quotation:", err);
        notifier.error("Failed to load quotation: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchQuotation();
  }, [quotationId, isOpen]);

  const handleConvertToPO = async () => {
    if (!quotation) return;
    setIsConverting(true);
    try {
      notifier.info(`Converting ${quotation.quotationNumber || quotation.id} to Purchase Order...`);
      const res = await fetch('/api/catalog/convert-quotation-to-po', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotationId: quotation.id
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to convert quotation");

      notifier.success(`Purchase Order created: ${data.poNumber}!`);
      setQuotation(prev => ({
        ...prev,
        status: 'converted_to_po',
        poId: data.poId,
        poNumber: data.poNumber
      }));
      if (onStatusChange) onStatusChange('converted_to_po', data.poNumber);
    } catch (err) {
      console.error("Failed to convert quotation to PO:", err);
      notifier.error("Conversion failed: " + (err.message || err));
    } finally {
      setIsConverting(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!quotation) return;
    setIsUpdatingStatus(true);
    try {
      await updateSupplierQuotation(quotation.id, {
        status: newStatus,
      });
      setQuotation(prev => ({ ...prev, status: newStatus }));
      notifier.success(`Quotation marked as ${newStatus}`);
      if (onStatusChange) onStatusChange(newStatus);
    } catch (err) {
      console.error("Error updating quote status:", err);
      notifier.error("Failed to update status: " + err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (!isOpen) return null;

  return (
    <StandardDrawer
      title={quotation ? `Quotation ${quotation.quotationNumber || quotation.id}` : 'Supplier Quotation'}
      isOpen={isOpen}
      onClose={onClose}
      width="min(94vw, 860px)"
      zIndex={zIndex}
    >
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: '#0284c7', marginBottom: '1rem' }} />
          <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Loading quotation details...</span>
        </div>
      ) : !quotation ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
          No quotation record found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.25rem 0' }}>
          
          {/* Header Summary Banner */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #bfdbfe'
              }}>
                <Building2 size={22} style={{ color: '#003666' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  {quotation.supplierName || 'Lotusland'}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Ref: <CopyableId value={quotation.quotationNumber || quotation.id} /> • Quoted: {quotation.quotationDate || '2026-08-20'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <StatusBadge status={quotation.status || 'received'} />
              {quotation.poNumber && (
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#1d4ed8',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}>
                  PO: {quotation.poNumber}
                </span>
              )}
            </div>
          </div>

          {/* Probative Document & Audit Trail */}
          {quotation.sourceFile?.fileUrl && (
            <div style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '10px',
              padding: '0.875rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} style={{ color: '#0284c7' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0369a1' }}>
                    Original Document Attached (Cloud Storage)
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {quotation.sourceFile.fileName || 'Quotation Document'}
                  </span>
                </div>
              </div>

              <a
                href={quotation.sourceFile.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  backgroundColor: '#0284c7',
                  borderRadius: '6px',
                  textDecoration: 'none'
                }}
              >
                <ExternalLink size={12} /> Open Original Scanned File
              </a>
            </div>
          )}

          {/* Commercial Terms & Financial Breakdown Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px'
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Payment Terms</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                {quotation.paymentTerms || '50% Advance / 50% on B/L'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Incoterm & Freight</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                {quotation.incoterm || 'DAP'} • ${formatNumberAdaptive(quotation.shippingCost || 0, 2)} Shipping
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Commercial Discount</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
                {quotation.discountPercentage || 0}% (-${formatNumberAdaptive(quotation.discountAmount || 0, 2)})
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Payable</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                ${formatNumberAdaptive(quotation.totalPayable || quotation.netSubtotal || 0, 2)}
              </div>
            </div>
          </div>

          {/* Profitability HUD */}
          {quotation && (
            <MarginProfitabilityHUD
              supplierCost={quotation.subtotal || quotation.grossSubtotal || 2400}
              sellingPrice={(quotation.subtotal || quotation.grossSubtotal || 2400) * (1 + marginPercent / 100)}
              marginPercent={marginPercent}
              currency={quotation.currency || 'USD'}
              onMarginChange={setMarginPercent}
              editable={true}
            />
          )}

          {/* Line Items Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
              Quotation Line Items ({((quotation.lineItems || quotation.items || [])).length})
            </span>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
              <DataTable
                data={(quotation.lineItems || quotation.items || []).map((it, idx) => ({ ...it, _idx: idx }))}
                keyField="_idx"
                minHeight="auto"
                hidePagination={true}
                columns={[
                  {
                    key: 'name',
                    header: 'Product / Description',
                    width: '32%',
                    render: (r) => (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>
                          {r.name || r.itemName || r.peptide_name}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          {r.originWarehouse && <WarehouseOriginBadge origin={r.originWarehouse} size="sm" />}
                          {r.purity_or_grade && (
                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                              Grade: {r.purity_or_grade}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  },
                  {
                    key: 'quantity',
                    header: 'Quantity',
                    width: '15%',
                    render: (r) => (
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>
                        {r.quantity} {r.unit_of_measure || r.unit || 'pcs'}
                      </span>
                    )
                  },
                  {
                    key: 'unit_price',
                    header: 'Supplier Cost',
                    width: '18%',
                    render: (r) => {
                      const cost = r.unitPrice || r.unit_price || r.supplierCost || 0;
                      return (
                        <span style={{ fontWeight: 700, color: '#64748b', fontSize: '0.85rem' }}>
                          ${formatNumberAdaptive(cost, 2)}
                        </span>
                      );
                    }
                  },
                  {
                    key: 'client_price',
                    header: `Client (+${marginPercent}%)`,
                    width: '20%',
                    render: (r) => {
                      const cost = r.unitPrice || r.unit_price || r.supplierCost || 0;
                      const clientRate = cost * (1 + marginPercent / 100);
                      return (
                        <span style={{ fontWeight: 800, color: '#0f766e', fontSize: '0.85rem' }}>
                          ${formatNumberAdaptive(clientRate, 2)}
                        </span>
                      );
                    }
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    width: '15%',
                    align: 'right',
                    render: (r) => (
                      <StatusBadge status={r.status || quotation.status || 'received'} />
                    )
                  }
                ]}
              />
            </div>
          </div>

          {/* Footer Action Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid #e2e8f0',
            marginTop: '0.5rem'
          }}>
            {/* Status Modification Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {quotation.status !== 'accepted' && quotation.status !== 'converted_to_po' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('accepted')}
                  disabled={isUpdatingStatus}
                  style={{
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#15803d',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <CheckCircle2 size={13} /> Accept Quote
                </button>
              )}

              {quotation.status !== 'rejected' && quotation.status !== 'converted_to_po' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('rejected')}
                  disabled={isUpdatingStatus}
                  style={{
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#dc2626',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <XCircle size={13} /> Reject
                </button>
              )}
            </div>

            {/* Convert Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              {/* Convert to Client Quote (Draft) */}
              {quotation.linkedClientQuotationNumber ? (
                <div style={{
                  padding: '0.55rem 1rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#047857',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <CheckCircle2 size={15} style={{ color: '#10b981' }} /> Client Quote: {quotation.linkedClientQuotationNumber}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    if (isConverting) return;
                    setIsConverting(true);
                    try {
                      notifier.info(`Creating draft Client Quotation (+${marginPercent}% margin)...`);
                      const res = await fetch('/api/catalog/convert-quotation-to-client', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          quotationId: quotation.id,
                          marginPercent: marginPercent
                        })
                      });
                      const data = await res.json();
                      if (!data.success) throw new Error(data.error || "Failed to convert to client quotation");
                      notifier.success(`Internal Client Quotation draft created: ${data.quotationNumber}!`);
                      setQuotation(prev => ({
                        ...prev,
                        linkedClientQuotationNumber: data.quotationNumber,
                        linkedClientQuotationId: data.clientQuoteId
                      }));
                      if (onStatusChange) onStatusChange('converted_to_client_quote', data.quotationNumber);
                    } catch (err) {
                      console.error("Conversion to client quote failed:", err);
                      notifier.error("Failed to generate client quote: " + (err.message || err));
                    } finally {
                      setIsConverting(false);
                    }
                  }}
                  disabled={isConverting}
                  style={{
                    padding: '0.55rem 1.15rem',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    color: '#0f766e',
                    backgroundColor: '#f0fdfa',
                    border: '1px solid #99f6e4',
                    borderRadius: '8px',
                    cursor: isConverting ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                >
                  <FileCheck size={15} /> Convert to Client Quote (+{marginPercent}% Margin)
                </button>
              )}

              {/* Convert to PO Action */}
              {quotation.status === 'converted_to_po' ? (
                <div style={{
                  padding: '0.55rem 1.25rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#1d4ed8',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #93c5fd',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <CheckCircle2 size={15} style={{ color: '#2563eb' }} /> Converted to PO ({quotation.poNumber})
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleConvertToPO}
                  disabled={isConverting}
                  style={{
                    padding: '0.55rem 1.35rem',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    backgroundColor: '#003666',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isConverting ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(0,54,102,0.2)'
                  }}
                >
                  {isConverting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Generating PO...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={15} /> Convert to PO <ArrowRight size={14} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

        </div>
      )}
    </StandardDrawer>
  );
}

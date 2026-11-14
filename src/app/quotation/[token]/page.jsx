"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchPublicQuotationByTokenAction, approvePublicQuotationAction } from '../../../actions/quotationsActions';
import {
  FileText,
  CheckCircle2,
  Download,
  AlertTriangle,
  Mail,
  Share2,
  Tag,
  ExternalLink,
  QrCode,
  DollarSign,
} from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';
import PublicStickyActionBar from '@/components/shared/PublicStickyActionBar';
import PublicAtlasAIDrawer from '@/components/shared/PublicAtlasAIDrawer';
import DocumentViewLayout from '@/components/shared/layouts/DocumentViewLayout';
import FocusedCardLayout from '@/components/shared/layouts/FocusedCardLayout';

export default function PublicQuotationPage() {
  const params = useParams();
  const token = params?.token;

  const [loading, setLoading] = useState(true);
  const [quotation, setQuotation] = useState(null);
  const [error, setError] = useState(null);

  // Approval state
  const [approverName, setApproverName] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [approvalResult, setApprovalResult] = useState(null);
  const [approvalError, setApprovalError] = useState(null);

  useEffect(() => {
    async function loadQuote() {
      if (!token) return;
      setLoading(true);
      try {
        const res = await fetchPublicQuotationByTokenAction(token);
        if (res.success && res.quotation) {
          setQuotation(res.quotation);
          setApproverName(res.quotation.clientName || '');
        } else {
          setError(res.error || 'Quotation not found or expired');
        }
      } catch (err) {
        setError(err.message || 'Failed to load quotation');
      } finally {
        setLoading(false);
      }
    }
    loadQuote();
  }, [token]);

  const isApproved = Boolean(
    quotation &&
      (quotation.status === 'approved' ||
        quotation.status === 'accepted' ||
        quotation.status === 'converted' ||
        approvalResult)
  );

  const handleApprove = async (e) => {
    e.preventDefault();
    setApprovalError(null);
    if (!approverName.trim()) {
      setApprovalError('Please enter your name or facility signature to confirm approval.');
      return;
    }

    setIsApproving(true);
    try {
      const res = await approvePublicQuotationAction(token, {
        approvedByName: approverName.trim(),
        clientNotes: clientNotes.trim(),
        signature: `Digital Confirmation by ${approverName.trim()}`,
      });

      if (res.success) {
        triggerHaptic('success');
        setApprovalResult(res);
        setQuotation((prev) => ({
          ...prev,
          status: 'approved',
          salesOrderNumber: res.orderNumber,
        }));
      } else {
        setApprovalError(res.error || 'Failed to submit approval');
      }
    } catch (err) {
      setApprovalError(err.message || 'Failed to submit approval');
    } finally {
      setIsApproving(false);
    }
  };

  const handleDownloadPdf = () => {
    triggerHaptic('light');
    if (!quotation) return;
    window.open(`/api/generate-pdf?type=quotation&id=${quotation.id}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    triggerHaptic('light');
    if (!quotation) return;
    const quoteUrl = typeof window !== 'undefined' ? window.location.href : '';
    const activeLang = typeof window !== 'undefined' ? (localStorage.getItem('share_message_lang') || 'en') : 'en';
    const isEs = activeLang === 'es';
    const text = isEs
      ? `📋 *Cotización Oficial — Med-Peptides*\n` +
        `• *Nº Cotización:* ${quotation.quotationNumber}\n` +
        `• *Cliente:* ${quotation.clientName}\n` +
        `• *Importe Total:* $${quotation.grandTotal?.toFixed(2)} ${quotation.currency || 'USD'}\n` +
        `• *Estado:* ${isApproved ? 'Aprobada ✓' : 'Pendiente de Aprobación'}\n\n` +
        `🔗 *Ver y Aprobar en línea:* ${quoteUrl}`
      : `📋 *Official Quotation — Med-Peptides*\n` +
        `• *Quote #:* ${quotation.quotationNumber}\n` +
        `• *Client:* ${quotation.clientName}\n` +
        `• *Grand Total:* $${quotation.grandTotal?.toFixed(2)} ${quotation.currency || 'USD'}\n` +
        `• *Status:* ${isApproved ? 'Approved ✓' : 'Awaiting Approval'}\n\n` +
        `🔗 *View and Approve online:* ${quoteUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <FocusedCardLayout
        tone="info"
        title="Loading Official Quotation..."
        subtitle="Verifying quotation token and locked compounding rates."
      >
        <div className="skeleton" style={{ height: 48, borderRadius: 10 }} />
      </FocusedCardLayout>
    );
  }

  if (error || !quotation) {
    return (
      <FocusedCardLayout
        icon={AlertTriangle}
        tone="warning"
        title="Estimate Unavailable"
        subtitle={error || 'The requested quotation link may be expired or invalid. Please contact your medical commercial supervisor.'}
        actions={
          <a
            href="mailto:support@atlas-medical.com"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#003666',
              color: '#fff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.88rem',
            }}
          >
            <Mail size={16} /> Contact Support
          </a>
        }
      />
    );
  }

  const items = quotation.items || [];
  const issuedDate = quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString() : '—';
  const expiresDate = quotation.createdAt
    ? new Date(new Date(quotation.createdAt).getTime() + 30 * 24 * 3600 * 1000).toLocaleDateString()
    : '—';

  const lineColumns = [
    {
      key: 'name',
      header: 'Product & Specification',
      width: '52%',
      render: (item) => {
        const prodSlug = item.productId || 'tirzepatide';
        const supplierParam = item.supplierId ? `?supplier=${item.supplierId}` : '';
        return (
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
            <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
              {item.dosage || 'Standard clinical vial'} • {item.presentation || 'Compounded Lyophilized Solution'}
            </div>
            {item.notes && (
              <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600, marginTop: '2px' }}>
                {item.notes}
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '6px' }}>
              <a
                href={`/p/${prodSlug}${supplierParam}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.74rem', color: '#003666', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              >
                <ExternalLink size={12} /> Tech Monograph
              </a>
              <a
                href={`/api/vial-label/${prodSlug}?format=38x90&type=full`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.74rem', color: '#4338ca', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              >
                <Tag size={12} /> Full Label
              </a>
              <a
                href={`/api/vial-label/${prodSlug}?format=38x90&type=barcode`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.74rem', color: '#0369a1', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              >
                <QrCode size={12} /> Barcode Only
              </a>
            </div>
          </div>
        );
      },
    },
    {
      key: 'quantity',
      header: 'Qty',
      width: '12%',
      align: 'center',
      render: (item) => <span style={{ fontWeight: 700 }}>{Number(item.quantity || 1)}</span>,
    },
    {
      key: 'unitRate',
      header: 'Unit Rate',
      width: '18%',
      align: 'right',
      render: (item) => {
        const rate = Number(item.unitRate || item.unitPrice || item.price || 0);
        return <span style={{ color: '#475569' }}>${rate.toFixed(2)}</span>;
      },
    },
    {
      key: 'total',
      header: 'Total',
      width: '18%',
      align: 'right',
      render: (item) => {
        const qty = Number(item.quantity || 1);
        const rate = Number(item.unitRate || item.unitPrice || item.price || 0);
        const lineTotal = Number(item.totalPrice || item.subtotal || qty * rate);
        return <span style={{ fontWeight: 800, color: '#0f172a' }}>${lineTotal.toFixed(2)}</span>;
      },
    },
  ];

  const recipientLines = quotation.shippingAddress
    ? [
        `${quotation.shippingAddress.street}, ${quotation.shippingAddress.city} (${quotation.shippingAddress.postalCode})`,
        quotation.deliveryInstructions,
      ].filter(Boolean)
    : [`Category: ${String(quotation.category || 'clinical').toUpperCase()} • Terms: ${quotation.paymentTerms || 'Due on Receipt'}`];

  return (
    <>
      <DocumentViewLayout
        documentType="Official Pro-Forma Estimate"
        title={quotation.quotationNumber}
        subtitle={`Issued for ${quotation.clientName}`}
        documentCode={quotation.quotationNumber}
        status={isApproved ? 'approved' : 'pending'}
        issuedDate={issuedDate}
        validUntil={expiresDate}
        headerActions={
          <>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
            >
              <Share2 size={15} style={{ color: '#16a34a' }} />
              WhatsApp
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
            >
              <Download size={15} style={{ color: '#0284c7' }} />
              PDF
            </button>
          </>
        }
        metadataCards={[
          { label: 'Recipient Details', title: quotation.clientName, lines: recipientLines },
          { label: 'Quality & Handling', title: '2-8°C Insulated Express', lines: ['USP & EU GMP Compounding Protocols'] },
          { label: 'Proposal Validity', title: 'Guaranteed Rates (30d)', lines: [`Expires: ${expiresDate}`] },
        ]}
        summaryMetrics={[
          {
            title: 'Formulations',
            value: items.length,
            subtitle: `Currency: ${quotation.currency || 'USD'}`,
            icon: FileText,
            color: '#2563eb',
          },
          {
            title: 'Total Amount',
            value: `$${Number(quotation.grandTotal || 0).toFixed(2)}`,
            subtitle: 'Includes applicable taxes',
            icon: DollarSign,
            color: '#0d9488',
          },
        ]}
        lineItems={items}
        lineColumns={lineColumns}
        totalsSection={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>${Number(quotation.subtotal || 0).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>VAT / Tax (5%):</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>${Number(quotation.taxTotal || 0).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, color: '#0d9488', borderTop: '2px solid #e2e8f0', paddingTop: '10px', marginTop: '4px' }}>
                  <span>Total Amount:</span>
                  <span>${Number(quotation.grandTotal || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div id="approval-section" style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px 28px', border: isApproved ? '2px solid #bbf7d0' : '1px solid #e2e8f0' }}>
              {isApproved ? (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <CheckCircle2 size={48} style={{ color: '#16a34a', margin: '0 auto 12px' }} />
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#15803d', margin: '0 0 6px' }}>
                    Quotation Approved &amp; Order Confirmed!
                  </h2>
                  <p style={{ fontSize: '0.88rem', color: '#475569', maxWidth: '480px', margin: '0 auto 16px' }}>
                    Your order is currently being routed to the compounding laboratory under verified pharmaceutical protocol.
                  </p>
                  {quotation.salesOrderNumber && (
                    <div style={{ display: 'inline-block', backgroundColor: '#f0fdf4', padding: '6px 14px', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '0.84rem', fontWeight: 700, color: '#166534' }}>
                      Reference Order: {quotation.salesOrderNumber}
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleApprove} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#003666', margin: '0 0 4px' }}>
                      Online Confirmation &amp; Order Placement
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                      By confirming below, you authorize the compounding and dispatch of the itemized protocol under the agreed terms.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        Authorizer / Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={approverName}
                        onChange={(e) => setApproverName(e.target.value)}
                        placeholder="e.g. Dr. John Doe / Clinic Director"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        Purchase Order Ref / Notes (Optional)
                      </label>
                      <input
                        type="text"
                        value={clientNotes}
                        onChange={(e) => setClientNotes(e.target.value)}
                        placeholder="e.g. PO-CLINIC-9921 or Delivery Instructions"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                      />
                    </div>
                  </div>

                  {approvalError && (
                    <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.84rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={16} />
                      <span>{approvalError}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                    <button
                      type="submit"
                      disabled={isApproving}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '9px', fontSize: '0.92rem', fontWeight: 800, cursor: isApproving ? 'not-allowed' : 'pointer', boxShadow: '0 2px 4px rgba(5,150,105,0.2)' }}
                    >
                      <CheckCircle2 size={18} />
                      {isApproving ? 'Processing Order...' : 'Approve & Place Order →'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        }
        stickyActionBar={
          <>
            <PublicStickyActionBar
              title={quotation?.quotationNumber ? `Quotation ${quotation.quotationNumber}` : `Quotation #${String(token).slice(0, 8)}`}
              subtitle={`${quotation?.clientName || 'Institutional Client'} • Total: ${quotation?.currency || '$'}${Number(quotation?.total || quotation?.grandTotal || 0).toFixed(2)} • Priority Logistics Included`}
              badge={quotation?.status ? quotation.status.toUpperCase() : 'OFFICIAL QUOTE'}
              badgeType="protocol"
              inquireLabel={isApproved ? 'Order Confirmed ✓' : 'Approve & Confirm ➔'}
              onInquire={() => {
                const el = document.getElementById('approval-section') || document.querySelector('form');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              showClinicalAI={true}
              aiCategory="Commercial Quotation"
              aiContextQuery={`What shipping logistics, batch analytical CoA documentation, and delivery lead times apply to quotation ${quotation?.quotationNumber || token}?`}
              extraActions={
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="public-sticky-action-bar__sections-btn"
                  title="Download Official PDF"
                >
                  <Download size={14} />
                  <span>PDF</span>
                </button>
              }
              lang="en"
            />

            <PublicAtlasAIDrawer
              contextType="catalog"
              contextAnchor={{
                name: `Quotation ${quotation?.quotationNumber || token}`,
                client: quotation?.clientName,
                total: quotation?.total || quotation?.grandTotal,
                itemsCount: quotation?.items?.length || 0,
              }}
              hideFloatingTrigger={true}
              lang="en"
            />
          </>
        }
      />
    </>
  );
}

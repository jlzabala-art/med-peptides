"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchPublicQuotationByTokenAction, approvePublicQuotationAction } from '../../../actions/quotationsActions';
import { FileText, CheckCircle2, Clock, ShieldCheck, Download, AlertTriangle, Snowflake, Building2, User, Sparkles, Phone, Mail } from 'lucide-react';
import StatusBadge from '../../../components/ui/StatusBadge';

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
          setError(res.error || "Quotation not found or expired");
        }
      } catch (err) {
        setError(err.message || "Failed to load quotation");
      } finally {
        setLoading(false);
      }
    }
    loadQuote();
  }, [token]);

  const handleApprove = async (e) => {
    e.preventDefault();
    if (!approverName.trim()) {
      alert("Please enter your name or facility signature to confirm approval.");
      return;
    }

    setIsApproving(true);
    try {
      const res = await approvePublicQuotationAction(token, {
        approvedByName: approverName.trim(),
        clientNotes: clientNotes.trim(),
        signature: `Digital Confirmation by ${approverName.trim()}`
      });

      if (res.success) {
        setApprovalResult(res);
        setQuotation(prev => ({
          ...prev,
          status: 'approved',
          salesOrderNumber: res.orderNumber
        }));
      }
    } catch (err) {
      alert(err.message || "Failed to submit approval");
    } finally {
      setIsApproving(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!quotation) return;
    window.open(`/api/generate-pdf?type=quotation&id=${quotation.id}`, '_blank');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ textAlign: 'center', color: '#475569' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #cbd5e1', borderTopColor: '#0284c7', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Loading official quotation...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ maxWidth: '480px', width: '100%', backgroundColor: '#fff', borderRadius: '12px', padding: '32px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
          <AlertTriangle size={48} style={{ color: '#d97706', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Estimate Unavailable</h2>
          <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, marginBottom: '24px' }}>
            {error || "The requested quotation link may be expired or invalid. Please contact your medical commercial supervisor."}
          </p>
          <a
            href="mailto:support@atlas-medical.com"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#003666', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem' }}
          >
            <Mail size={16} /> Contact Support
          </a>
        </div>
      </div>
    );
  }

  const isApproved = quotation.status === 'approved' || quotation.status === 'accepted' || quotation.status === 'converted' || !!approvalResult;
  const items = quotation.items || [];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '24px 16px 60px' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* 1. Header Card */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '24px 28px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0284c7', backgroundColor: '#eff6ff', padding: '3px 8px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                Official Pro-Forma Estimate
              </span>
              <StatusBadge status={isApproved ? 'approved' : 'pending'} label={isApproved ? 'Approved ✓' : 'Awaiting Approval'} />
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#003666', margin: '4px 0 2px' }}>
              {quotation.quotationNumber}
            </h1>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
              Issued for: <strong>{quotation.clientName}</strong> • {new Date(quotation.createdAt).toLocaleDateString()}
            </p>
          </div>

          <button
            onClick={handleDownloadPdf}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s ease' }}
          >
            <Download size={15} style={{ color: '#0284c7' }} />
            Download PDF
          </button>
        </div>

        {/* 2. Commercial & Logistics Banner */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Recipient Details</span>
            <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{quotation.clientName}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
              Category: <strong>{quotation.category.toUpperCase()}</strong> • Terms: {quotation.paymentTerms || 'Due on Receipt'}
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Quality & Handling</span>
            <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <Snowflake size={16} /> 2-8°C Insulated Express
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
              USP & EU GMP Compounding Protocols
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Proposal Validity</span>
            <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#003666', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <Clock size={16} style={{ color: '#0284c7' }} /> Guaranteed Rates (30d)
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
              Expires: {new Date(new Date(quotation.createdAt).getTime() + 30 * 24 * 3600 * 1000).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* 3. Products & Items Table */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '16px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Prescribed Formulations & Items ({items.length})
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Currency: <strong>{quotation.currency}</strong></span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.74rem' }}>
                  <th style={{ padding: '12px 20px' }}>Product & Specification</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Unit Rate</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const qty = Number(item.quantity || 1);
                  const rate = Number(item.unitRate || item.unitPrice || item.price || 0);
                  const lineTotal = Number(item.totalPrice || item.subtotal || qty * rate);

                  return (
                    <tr key={idx} style={{ borderBottom: idx < items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                          {item.dosage || 'Standard clinical vial'} • Compounded Lyophilized Solution
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 700 }}>{qty}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', color: '#475569' }}>${rate.toFixed(2)}</td>
                      <td style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>${lineTotal.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>${quotation.subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>VAT / Tax (5%):</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>${quotation.taxTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, color: '#0d9488', borderTop: '2px solid #e2e8f0', paddingTop: '10px', marginTop: '4px' }}>
                <span>Total Amount:</span>
                <span>${quotation.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Approval Section */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '24px 28px', border: isApproved ? '2px solid #bbf7d0' : '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          {isApproved ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <CheckCircle2 size={48} style={{ color: '#16a34a', margin: '0 auto 12px' }} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#15803d', margin: '0 0 6px' }}>
                Quotation Approved & Order Confirmed!
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#475569', maxWidth: '480px', margin: '0 auto 16px' }}>
                Your order is currently being routed to the compounding laboratory under strict refrigerated cold chain protocol.
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
                  Online Confirmation & Order Placement
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button
                  type="submit"
                  disabled={isApproving}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '9px', fontSize: '0.92rem', fontWeight: 800, cursor: isApproving ? 'not-allowed' : 'pointer', boxShadow: '0 2px 4px rgba(5,150,105,0.2)', transition: 'all 0.15s ease' }}
                >
                  <CheckCircle2 size={18} />
                  {isApproving ? 'Processing Order...' : 'Approve & Place Order →'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: '0.76rem', color: '#94a3b8', padding: '12px 0' }}>
          Atlas Health • Atlas Medical Compounding Systems • USP 797 & 800 Sterile Compounding
        </div>

      </div>
    </div>
  );
}

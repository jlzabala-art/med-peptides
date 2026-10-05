"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchPublicRFQByTokenAction, submitSupplierQuotationAction } from '../../../actions/supplierRfqActions';
import {
  FileText,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  Truck,
  Sparkles,
  AlertTriangle,
  Beaker,
  Check,
  Send,
  Printer,
  ChevronRight,
  PackageCheck,
  Scale
} from 'lucide-react';
import StatusBadge from '../../../components/ui/StatusBadge';
import { triggerHaptic } from '@/utils/haptics';

export default function PublicSupplierRFQPage() {
  const params = useParams();
  const token = params?.token;

  const [loading, setLoading] = useState(true);
  const [rfq, setRfq] = useState(null);
  const [error, setError] = useState(null);

  // Supplier Form State
  const [supplierName, setSupplierName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [facilityLocation, setFacilityLocation] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [itemsPrices, setItemsPrices] = useState({});
  const [compoundingFee, setCompoundingFee] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [leadTimeDays, setLeadTimeDays] = useState(3);
  const [hasCOA, setHasCOA] = useState(true);
  const [supplierNotes, setSupplierNotes] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    async function loadRFQ() {
      if (!token) return;
      setLoading(true);
      try {
        const res = await fetchPublicRFQByTokenAction(token);
        if (res.success && res.rfq) {
          setRfq(res.rfq);
          // If already quoted, prefill fields
          if (res.rfq.supplierQuotation) {
            const sq = res.rfq.supplierQuotation;
            setSupplierName(sq.supplierName || '');
            setContactPerson(sq.contactPerson || '');
            setContactEmail(sq.contactEmail || '');
            setContactPhone(sq.contactPhone || '');
            setFacilityLocation(sq.facilityLocation || '');
            setCurrency(sq.currency || 'EUR');
            setCompoundingFee(sq.compoundingFee || 0);
            setShippingCost(sq.shippingCost || 0);
            setLeadTimeDays(sq.leadTimeDays || 3);
            setHasCOA(sq.hasCOA !== false);
            setSupplierNotes(sq.supplierNotes || '');

            const pricesMap = {};
            (sq.items || []).forEach((it, idx) => {
              pricesMap[it.itemId || idx] = it.finalUnitPrice || it.unitPrice || 0;
            });
            setItemsPrices(pricesMap);
          } else {
            // Default pre-population
            setSupplierName(res.rfq.supplierName && !res.rfq.supplierName.includes('Specialist') ? res.rfq.supplierName : '');
          }
        } else {
          setError(res.error || "RFQ not found or link has expired.");
        }
      } catch (err) {
        setError(err.message || "Failed to load Request for Quotation.");
      } finally {
        setLoading(false);
      }
    }
    loadRFQ();
  }, [token]);

  // Handle item unit price change
  const handleItemPriceChange = (itemId, val) => {
    const num = parseFloat(val) >= 0 ? parseFloat(val) : '';
    setItemsPrices(prev => ({
      ...prev,
      [itemId]: val === '' ? '' : num
    }));
  };

  // Calculations
  const rawItems = rfq?.items || [];
  const itemsSubtotal = rawItems.reduce((acc, it, idx) => {
    const price = parseFloat(itemsPrices[it.itemId || idx]) || 0;
    const qty = parseFloat(it.amount) || 1;
    return acc + (price * qty);
  }, 0);

  const parsedCompounding = parseFloat(compoundingFee) || 0;
  const parsedShipping = parseFloat(shippingCost) || 0;
  const grandTotal = itemsSubtotal + parsedCompounding + parsedShipping;

  // Currency symbol
  const getCurrencySymbol = (c) => {
    switch (c) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'AED': return 'AED ';
      case 'GBP': return '£';
      default: return '€';
    }
  };
  const sym = getCurrencySymbol(currency);

  const handleSubmitQuotation = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!supplierName.trim()) {
      setSubmitError("Please specify your Laboratory / Pharmacy Name.");
      return;
    }

    if (grandTotal <= 0) {
      setSubmitError("Please enter pricing for the requested items or compounding fee.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedItems = rawItems.map((it, idx) => ({
        ...it,
        unitPrice: parseFloat(itemsPrices[it.itemId || idx]) || 0,
        amount: parseFloat(it.amount) || 1,
      }));

      const payload = {
        supplierName: supplierName.trim(),
        contactPerson: contactPerson.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        facilityLocation: facilityLocation.trim(),
        currency,
        items: formattedItems,
        compoundingFee: parsedCompounding,
        shippingCost: parsedShipping,
        leadTimeDays: parseInt(leadTimeDays) || 3,
        hasCOA,
        supplierNotes: supplierNotes.trim(),
      };

      const res = await submitSupplierQuotationAction(token, payload);
      if (res.success) {
        triggerHaptic('success');
        setSubmissionSuccess(true);
        setRfq(prev => ({
          ...prev,
          status: 'supplier_quoted',
          supplierQuotation: payload,
          totals: {
            subtotal: itemsSubtotal + parsedCompounding,
            shipping: parsedShipping,
            total: grandTotal,
            currency
          }
        }));
      } else {
        setSubmitError(res.error || "Failed to submit quotation. Please try again.");
      }
    } catch (err) {
      setSubmitError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid #dadce0', borderTopColor: '#1a73e8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ marginTop: '16px', fontSize: '0.9rem', color: '#5f6368', fontWeight: 500 }}>
            Loading Compounding RFQ Specifications…
          </p>
          <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }` }} />
        </div>
      </div>
    );
  }

  // Error Screen
  if (error || !rfq) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ maxWidth: '480px', width: '100%', backgroundColor: '#fff', borderRadius: '12px', padding: '36px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #dadce0' }}>
          <AlertTriangle size={44} style={{ color: '#d93025', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#202124', marginBottom: '8px' }}>
            Request for Quotation Unavailable
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#5f6368', lineHeight: 1.5, marginBottom: '24px' }}>
            {error || "This RFQ magic link is invalid or has expired. Please contact the clinical procurement department."}
          </p>
          <div style={{ fontSize: '0.8rem', color: '#70757a', borderTop: '1px solid #f1f3f4', paddingTop: '16px' }}>
            Med-Peptides Clinical Procurement • Magenta Health LLC
          </div>
        </div>
      </div>
    );
  }

  const isQuoted = rfq.status === 'supplier_quoted' || submissionSuccess;
  const formulationBlocks = rfq.formulationBlocks || [];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#202124', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '24px 16px 80px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* 1. Header Card (Google Cloud UX Style) */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '24px 28px',
          border: '1px solid #dadce0',
          boxShadow: '0 1px 3px rgba(60,64,67,0.08)',
          borderLeft: '5px solid #1a73e8',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#1a73e8',
                backgroundColor: '#e8f0fe',
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid #d2e3fc'
              }}>
                B2B Compounding RFQ
              </span>
              <StatusBadge
                status={isQuoted ? 'active' : 'pending'}
                label={isQuoted ? 'Quotation Submitted ✓' : 'Awaiting Your Quote'}
              />
            </div>

            <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#202124', margin: '4px 0 6px', letterSpacing: '-0.01em' }}>
              {rfq.prfqId}
            </h1>

            <p style={{ fontSize: '0.84rem', color: '#5f6368', margin: 0, display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span>Issued by: <strong>{rfq.clinicName}</strong></span>
              <span>•</span>
              <span>Sample Ref: <strong style={{ color: '#1a73e8', fontFamily: 'monospace' }}>{rfq.prescriptionCode}</strong></span>
              <span>•</span>
              <span>Date: {new Date(rfq.createdAt).toLocaleDateString()}</span>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => window.print()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                backgroundColor: '#ffffff',
                color: '#3c4043',
                border: '1px solid #dadce0',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.15s'
              }}
            >
              <Printer size={15} color="#5f6368" /> Print Specs
            </button>
          </div>
        </div>

        {/* 2. Success Banner if just submitted */}
        {isQuoted && (
          <div style={{
            backgroundColor: '#e6f4ea',
            border: '1px solid #ceead6',
            borderRadius: '10px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            color: '#137333'
          }}>
            <CheckCircle2 size={24} style={{ flexShrink: 0, color: '#1e8e3e' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.94rem' }}>
                Quotation Successfully Received & Logged
              </div>
              <div style={{ fontSize: '0.82rem', color: '#137333', marginTop: '2px' }}>
                Thank you! Your quotation for <strong>{rfq.prfqId}</strong> ({sym}{grandTotal.toFixed(2)}) is now under direct review by our compounding procurement team.
              </div>
            </div>
          </div>
        )}

        {/* 3. Clinical Formulations & APIs Specifications */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #dadce0',
          boxShadow: '0 1px 3px rgba(60,64,67,0.08)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e8eaed',
            backgroundColor: '#f8f9fa',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Beaker size={18} color="#1a73e8" />
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#202124', margin: 0 }}>
                Required Active Ingredients & Formulations
              </h2>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#5f6368', fontWeight: 500 }}>
              {rawItems.length} required compounds / vehicles
            </span>
          </div>

          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* If formulation blocks exist, display them grouped */}
            {formulationBlocks.length > 0 ? (
              formulationBlocks.map((block, bIdx) => (
                <div key={bIdx} style={{
                  border: '1px solid #e8eaed',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: '#fafbfc'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1a73e8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ backgroundColor: '#e8f0fe', color: '#1a73e8', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                        Phase {bIdx + 1}
                      </span>
                      {block.title || `Formulation ${bIdx + 1}`}
                    </div>
                    {block.vehicle && (
                      <span style={{ fontSize: '0.78rem', color: '#3c4043', backgroundColor: '#e8eaed', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                        Vehicle: {block.vehicle}
                      </span>
                    )}
                  </div>

                  {block.posology && (
                    <div style={{ fontSize: '0.8rem', color: '#5f6368', marginBottom: '12px', fontStyle: 'italic' }}>
                      Posology / Protocol: {block.posology}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(block.items || block.ingredients || []).map((ing, iIdx) => (
                      <div key={iIdx} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e8eaed',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '0.84rem'
                      }}>
                        <div style={{ fontWeight: 600, color: '#202124' }}>
                          {ing.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontWeight: 700, color: '#1a73e8', fontFamily: 'monospace' }}>
                            {ing.dosage || ing.concentration || ''}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#70757a', backgroundColor: '#f1f3f4', padding: '2px 6px', borderRadius: '3px' }}>
                            USP/Ph. Eur.
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {rawItems.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#fafbfc',
                    border: '1px solid #e8eaed',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    fontSize: '0.86rem'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#202124' }}>{item.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#5f6368' }}>{item.concentration} • Vehicle: {item.vehicle}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: '#1a73e8' }}>
                      Qty: {item.amount} {item.unit}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quality Standard Callout */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              backgroundColor: '#e8f0fe',
              borderRadius: '8px',
              border: '1px solid #d2e3fc',
              fontSize: '0.82rem',
              color: '#1a73e8'
            }}>
              <ShieldCheck size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong>Strict Quality Requirement:</strong> All quoted active pharmaceutical ingredients (APIs) and vehicles must comply with USP/Ph. Eur. Compounding Pharmacopeia monographs, include a Certificate of Analysis (COA), and be compounded under certified GMP / ISO cleanroom conditions.
              </div>
            </div>
          </div>
        </div>

        {/* 4. Supplier Pricing Matrix & Submission Form */}
        <form onSubmit={handleSubmitQuotation} style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #dadce0',
          boxShadow: '0 1px 3px rgba(60,64,67,0.08)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e8eaed',
            backgroundColor: '#f8f9fa',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={18} color="#1a73e8" />
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#202124', margin: 0 }}>
                {isQuoted ? 'Your Submitted Quotation' : 'Supplier Quotation Entry Matrix'}
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: '#5f6368', fontWeight: 600 }}>Currency:</span>
              <select
                disabled={isQuoted}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: '1px solid #dadce0',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  backgroundColor: '#ffffff',
                  color: '#202124',
                  cursor: isQuoted ? 'not-allowed' : 'pointer'
                }}
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="AED">AED (د.إ)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Supplier Profile Fields */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3c4043', marginBottom: '6px' }}>
                  Laboratory / Supplier Name *
                </label>
                <input
                  type="text"
                  required
                  disabled={isQuoted}
                  placeholder="e.g. Fagron Lab Madrid, Pharmapolis, etc."
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #dadce0',
                    fontSize: '0.86rem',
                    color: '#202124',
                    backgroundColor: isQuoted ? '#f8f9fa' : '#ffffff',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3c4043', marginBottom: '6px' }}>
                  Contact Person *
                </label>
                <input
                  type="text"
                  required
                  disabled={isQuoted}
                  placeholder="e.g. Dr. Elena Moreno (Technical Sales)"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #dadce0',
                    fontSize: '0.86rem',
                    color: '#202124',
                    backgroundColor: isQuoted ? '#f8f9fa' : '#ffffff',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3c4043', marginBottom: '6px' }}>
                  Contact Email *
                </label>
                <input
                  type="email"
                  required
                  disabled={isQuoted}
                  placeholder="orders@compoundinglab.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #dadce0',
                    fontSize: '0.86rem',
                    color: '#202124',
                    backgroundColor: isQuoted ? '#f8f9fa' : '#ffffff',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3c4043', marginBottom: '6px' }}>
                  Direct Phone / WhatsApp
                </label>
                <input
                  type="text"
                  disabled={isQuoted}
                  placeholder="+34 91 123 4567"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #dadce0',
                    fontSize: '0.86rem',
                    color: '#202124',
                    backgroundColor: isQuoted ? '#f8f9fa' : '#ffffff',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Line Items Pricing Table */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#202124', marginBottom: '8px' }}>
                Unit Prices for Compounds & Vehicles ({sym})
              </label>

              <div style={{ border: '1px solid #dadce0', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dadce0', color: '#5f6368', textAlign: 'left' }}>
                      <th style={{ padding: '10px 14px', fontWeight: 600 }}>Compound / Vehicle</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600, width: '120px' }}>Strength / Spec</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600, textAlign: 'center', width: '80px' }}>Req. Qty</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600, textAlign: 'right', width: '140px' }}>Unit Price ({sym})</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600, textAlign: 'right', width: '120px' }}>Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rawItems.map((item, idx) => {
                      const itemId = item.itemId || idx;
                      const price = itemsPrices[itemId] !== undefined ? itemsPrices[itemId] : '';
                      const qty = parseFloat(item.amount) || 1;
                      const lineTotal = (parseFloat(price) || 0) * qty;

                      return (
                        <tr key={idx} style={{ borderBottom: idx < rawItems.length - 1 ? '1px solid #f1f3f4' : 'none' }}>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 600, color: '#202124' }}>{item.name}</div>
                            {item.blockTitle && (
                              <div style={{ fontSize: '0.74rem', color: '#1a73e8' }}>{item.blockTitle}</div>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#5f6368', fontFamily: 'monospace' }}>
                            {item.concentration || 'Compounding Base'}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600 }}>
                            {qty} {item.unit || ''}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                            {isQuoted ? (
                              <span style={{ fontWeight: 600 }}>{sym}{(parseFloat(price) || 0).toFixed(2)}</span>
                            ) : (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ color: '#5f6368', fontSize: '0.8rem' }}>{sym}</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  value={price}
                                  onChange={(e) => handleItemPriceChange(itemId, e.target.value)}
                                  style={{
                                    width: '90px',
                                    padding: '6px 8px',
                                    borderRadius: '4px',
                                    border: '1px solid #dadce0',
                                    fontSize: '0.84rem',
                                    textAlign: 'right',
                                    fontWeight: 600,
                                    outline: 'none'
                                  }}
                                />
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#202124' }}>
                            {sym}{lineTotal.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Additional Cost & Logistics Inputs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
              backgroundColor: '#fafbfc',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #e8eaed'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3c4043', marginBottom: '6px' }}>
                  Laboratory Compounding & Preparation Fee ({sym})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  disabled={isQuoted}
                  placeholder="0.00"
                  value={compoundingFee}
                  onChange={(e) => setCompoundingFee(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #dadce0',
                    fontSize: '0.86rem',
                    backgroundColor: isQuoted ? '#f8f9fa' : '#ffffff',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3c4043', marginBottom: '6px' }}>
                  Cold-Chain Express Shipping & Packaging ({sym})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  disabled={isQuoted}
                  placeholder="0.00"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #dadce0',
                    fontSize: '0.86rem',
                    backgroundColor: isQuoted ? '#f8f9fa' : '#ffffff',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3c4043', marginBottom: '6px' }}>
                  Estimated Turnaround / Lead Time (Business Days)
                </label>
                <input
                  type="number"
                  min="1"
                  disabled={isQuoted}
                  placeholder="3"
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #dadce0',
                    fontSize: '0.86rem',
                    backgroundColor: isQuoted ? '#f8f9fa' : '#ffffff',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Quality Guarantee Checkbox & Supplier Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.84rem',
                color: '#202124',
                fontWeight: 600,
                cursor: isQuoted ? 'default' : 'pointer'
              }}>
                <input
                  type="checkbox"
                  disabled={isQuoted}
                  checked={hasCOA}
                  onChange={(e) => setHasCOA(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#1a73e8' }}
                />
                Confirm Batch Certificate of Analysis (COA) and Purity Grade Standard will accompany formulation.
              </label>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3c4043', marginBottom: '6px' }}>
                  Supplier Remarks / Batch Specifications / Packaging Details
                </label>
                <textarea
                  rows={2}
                  disabled={isQuoted}
                  placeholder="e.g. Compounded under validated laminar flow hood. 90-day beyond-use date (BUD). Delivered in amber dropper bottles with cold gel packs."
                  value={supplierNotes}
                  onChange={(e) => setSupplierNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #dadce0',
                    fontSize: '0.84rem',
                    backgroundColor: isQuoted ? '#f8f9fa' : '#ffffff',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            {/* Error Message */}
            {submitError && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#fce8e6',
                border: '1px solid #fad2cf',
                borderRadius: '6px',
                color: '#c5221f',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertTriangle size={16} />
                {submitError}
              </div>
            )}

            {/* Financial Summary & Submission CTA */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              borderTop: '2px solid #e8eaed',
              paddingTop: '20px'
            }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Quotation Value
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1a73e8', letterSpacing: '-0.02em' }}>
                  {sym}{grandTotal.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#70757a', marginTop: '2px' }}>
                  Includes {rawItems.length} lines + prep ({sym}{parsedCompounding.toFixed(2)}) + freight ({sym}{parsedShipping.toFixed(2)})
                </div>
              </div>

              {!isQuoted && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    backgroundColor: '#1a73e8',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.94rem',
                    fontWeight: 700,
                    cursor: isSubmitting ? 'wait' : 'pointer',
                    boxShadow: '0 1px 3px rgba(26,115,232,0.3)',
                    opacity: isSubmitting ? 0.7 : 1,
                    transition: 'all 0.15s'
                  }}
                >
                  <Send size={16} />
                  {isSubmitting ? 'Submitting Quotation…' : 'Submit Quotation to Clinic'}
                </button>
              )}
            </div>

          </div>
        </form>

        {/* 5. Footer info */}
        <div style={{ textAlign: 'center', fontSize: '0.76rem', color: '#70757a', padding: '12px 0' }}>
          Med-Peptides & Magenta Health Compounding Network • Automated B2B Procurement Link • Zero Login Required
        </div>

      </div>
    </div>
  );
}

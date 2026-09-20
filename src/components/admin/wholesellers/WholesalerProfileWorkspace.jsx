"use client";

import React, { useState } from 'react';
import {
  Building2,
  X,
  Phone,
  Mail,
  MapPin,
  FileText,
  DollarSign,
  Package,
  Clock,
  ShieldCheck,
  Globe,
  ChevronDown,
  ChevronUp,
  User,
  CreditCard,
  Percent,
  CheckCircle,
  Truck,
  ExternalLink,
  FileCheck,
  Copy,
  Download
} from '@/lib/icons';
import { StatusBadge, CopyableId, StatusChip } from '../../ui';
import notifier from '../../../services/NotificationService';

export default function WholesalerProfileWorkspace({
  wholeseller,
  onClose,
  onUpdate
}) {
  const [openSections, setOpenSections] = useState({
    profile: true,
    documents: true,
    catalog: false,
    manager: false,
    orders: false,
    activity: false
  });

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    companyName: wholeseller?.name || wholeseller?.companyName || '',
    legalNameArabic: wholeseller?.legalNameArabic || '',
    formationType: wholeseller?.formationType || 'Free Zone Establishment (FZE)',
    formationNumber: wholeseller?.formationNumber || '4418091',
    taxId: wholeseller?.taxId || wholeseller?.vatNumber || '104821244100003',
    taxAuthority: wholeseller?.taxAuthority || 'Federal Tax Authority (United Arab Emirates)',
    vatEffectiveDate: wholeseller?.vatEffectiveDate || '2025-11-01',
    firstVatReturnPeriod: wholeseller?.firstVatReturnPeriod || '2025-11-01 - 2026-01-31',
    licenseNumber: wholeseller?.licenseNumber || wholeseller?.tradeLicense || '4418091.01',
    licensingAuthority: wholeseller?.licensingAuthority || 'Sharjah Publishing City Free Zone Authority (SPCFZ)',
    licenseFormationDate: wholeseller?.licenseFormationDate || '2025-01-08',
    licenseExpiryDate: wholeseller?.licenseExpiryDate || '2026-01-07',
    manager: wholeseller?.manager || wholeseller?.primaryContact || 'Reimichon Shangchiri Daniel Shangchiri',
    managerArabic: wholeseller?.managerArabic || 'ريميشون شانجشيري دانييل شانجشيري',
    country: wholeseller?.country || 'United Arab Emirates',
    address: wholeseller?.address || wholeseller?.registeredAddress || wholeseller?.city || 'Business Center, Sharjah Publishing City Free Zone, Sharjah, United Arab Emirates',
    paymentTerms: wholeseller?.paymentTerms || 'Net 30',
    creditLimit: wholeseller?.creditLimit || 50000,
    tier: wholeseller?.tier || 'tier_b2b_clinic',
    discountMargin: wholeseller?.discountMargin || 25,
    contactName: wholeseller?.contactName || wholeseller?.primaryContact || 'Reimichon Shangchiri Daniel Shangchiri',
    contactEmail: wholeseller?.email || wholeseller?.contactEmail || 'business@mediluxeme.com',
    contactPhone: wholeseller?.phone || wholeseller?.contactPhone || '+971564179259',
    officialVerificationUrl: wholeseller?.officialVerificationUrl || 'https://portal.spcfz.ae/web/mydocuments/dc/173632832882?d=T1RnNE9BPT0=',
    documents: wholeseller?.documents || [],
    authorizedActivities: wholeseller?.authorizedActivities || []
  });

  const toggleSection = (sec) => {
    setOpenSections(prev => {
      const isCurrentlyOpen = prev[sec];
      return {
        profile: !isCurrentlyOpen && sec === 'profile',
        documents: !isCurrentlyOpen && sec === 'documents',
        catalog: !isCurrentlyOpen && sec === 'catalog',
        manager: !isCurrentlyOpen && sec === 'manager',
        orders: !isCurrentlyOpen && sec === 'orders',
        activity: !isCurrentlyOpen && sec === 'activity'
      };
    });
  };

  const collapseAll = () => {
    setOpenSections({
      profile: false,
      documents: false,
      catalog: false,
      manager: false,
      orders: false,
      activity: false
    });
  };

  const handleSaveField = async (fields) => {
    setSaving(true);
    try {
      if (onUpdate && wholeseller?.id) {
        await onUpdate(wholeseller.id, fields);
      }
      setFormData(prev => ({ ...prev, ...fields }));
      notifier.success('Wholesaler details updated successfully.');
    } catch (err) {
      notifier.error(err.message || 'Failed to update wholesaler.');
    } finally {
      setSaving(false);
    }
  };

  if (!wholeseller) return null;

  const displayName = formData.companyName || 'Wholesaler Account';
  const tierLabels = {
    standard: 'Standard Wholesale',
    tier_b2b_clinic: 'Clinic B2B Preferred',
    premium: 'Tier 1 Enterprise'
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 40,
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 0.3s ease',
        overflow: 'hidden'
      }}
    >
      {/* ── Fixed Header ── */}
      <div
        style={{
          flexShrink: 0,
          padding: '16px 20px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', minWidth: 0 }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: '#fff7ed',
              border: '1.5px solid #fed7aa',
              color: '#c2410c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: 800,
              flexShrink: 0
            }}
          >
            {displayName.substring(0, 2).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {displayName}
              </h1>
              {formData.legalNameArabic && (
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', direction: 'rtl' }}>
                  ({formData.legalNameArabic})
                </span>
              )}
              <StatusBadge status={wholeseller.status || 'active'} />
              <span
                style={{
                  fontSize: '0.70rem',
                  fontWeight: 800,
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0'
                }}
              >
                {tierLabels[formData.tier] || 'B2B Distributor'}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginTop: '4px',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} /> {formData.country}
              </span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Mail size={12} /> {formData.contactEmail}
              </span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Phone size={12} /> {formData.contactPhone}
              </span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                ID: <CopyableId value={wholeseller.id} />
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => {
              notifier.info(`Initiating B2B Purchase Order for ${displayName}`);
            }}
            className="gcp-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.80rem', padding: '6px 14px' }}
          >
            <Package size={14} /> New B2B Order
          </button>
          <button
            type="button"
            onClick={onClose}
            className="gcp-btn-secondary"
            style={{
              padding: '6px 14px',
              fontSize: '0.80rem',
              fontWeight: 600,
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#334155'
            }}
            title="Cerrar panel"
          >
            <X size={15} /> Cerrar
          </button>
        </div>
      </div>

      {/* ── Scrollable Body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>

          {/* ── 2x2 Metric Strip (Golden Rule & High Polish) ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '16px'
            }}
          >
            {/* Total B2B Orders */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={16} />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total B2B Orders</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e40af' }}>
                {wholeseller.ordersCount || 14} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3b82f6' }}>Fulfilled</span>
              </div>
            </div>

            {/* Credit Limit & Terms */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={16} />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Credit Terms & Limit</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d' }}>
                ${Number(formData.creditLimit).toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#22c55e' }}>({formData.paymentTerms})</span>
              </div>
            </div>

            {/* Pricing Tier & Margin */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Percent size={16} />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pricing & Margins</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#c2410c' }}>
                {formData.discountMargin}% <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ea580c' }}>Wholesale Margin</span>
              </div>
            </div>

            {/* Assigned Account Manager */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={16} />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assigned Rep</span>
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#7e22ce' }}>
                {wholeseller.accountManagerName || wholeseller.manager || 'Commercial Key Account Desk'}
              </div>
            </div>
          </div>

          {/* ── Toolbar: Focus Mode & Collapse All ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '0 2px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Wholesale Institutional Profile & Logistics
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.70rem', color: '#94a3b8', fontStyle: 'italic' }}>
                Single-section focus
              </span>
              <button
                type="button"
                onClick={collapseAll}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  color: '#475569',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '3px 8px'
                }}
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* ── Accordion 1: Company Profile, Licensing & Commercial Terms ── */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => toggleSection('profile')}
              style={{
                width: '100%',
                padding: '14px 18px',
                backgroundColor: openSections.profile ? '#f8fafc' : '#ffffff',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#003666', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.90rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Company Profile, Trade Licensing & Terms
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Corporate legal registry, tax compliance, billing address, and credit agreement
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#475569' }}>
                  Verified Enterprise
                </span>
                {openSections.profile ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
              </div>
            </button>

            {openSections.profile && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Legal Company Name (English)</label>
                    <input
                      type="text"
                      className="gcp-input"
                      value={formData.companyName}
                      onChange={(e) => setFormData(p => ({ ...p, companyName: e.target.value }))}
                      onBlur={() => handleSaveField({ name: formData.companyName, companyName: formData.companyName })}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Legal Name (Arabic) / الاسم القانوني</label>
                    <input
                      type="text"
                      className="gcp-input"
                      value={formData.legalNameArabic}
                      onChange={(e) => setFormData(p => ({ ...p, legalNameArabic: e.target.value }))}
                      onBlur={() => handleSaveField({ legalNameArabic: formData.legalNameArabic })}
                      style={{ width: '100%', direction: 'rtl' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Formation Type & Registry No.</label>
                    <input
                      type="text"
                      className="gcp-input"
                      value={`${formData.formationType} • #${formData.formationNumber}`}
                      disabled
                      style={{ width: '100%', backgroundColor: '#f8fafc', color: '#64748b' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Commercial Manager</label>
                    <input
                      type="text"
                      className="gcp-input"
                      value={formData.manager}
                      onChange={(e) => setFormData(p => ({ ...p, manager: e.target.value }))}
                      onBlur={() => handleSaveField({ manager: formData.manager })}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Trade License No. & Authority</label>
                    <input
                      type="text"
                      className="gcp-input"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData(p => ({ ...p, licenseNumber: e.target.value }))}
                      onBlur={() => handleSaveField({ licenseNumber: formData.licenseNumber })}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Tax / VAT TRN (Federal Tax Authority)</label>
                    <input
                      type="text"
                      className="gcp-input"
                      value={formData.taxId}
                      onChange={(e) => setFormData(p => ({ ...p, taxId: e.target.value }))}
                      onBlur={() => handleSaveField({ taxId: formData.taxId, vatNumber: formData.taxId })}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>License Validity Period</label>
                    <input
                      type="text"
                      className="gcp-input"
                      value={`${formData.licenseFormationDate} to ${formData.licenseExpiryDate}`}
                      disabled
                      style={{ width: '100%', backgroundColor: '#f8fafc', color: '#64748b' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Payment Terms</label>
                    <select
                      className="gcp-input"
                      value={formData.paymentTerms}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(p => ({ ...p, paymentTerms: val }));
                        handleSaveField({ paymentTerms: val });
                      }}
                      style={{ width: '100%' }}
                    >
                      <option value="Prepaid">Prepaid / Upfront</option>
                      <option value="Net 15">Net 15 Days</option>
                      <option value="Net 30">Net 30 Days</option>
                      <option value="Net 60">Net 60 Days</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Registered Headquarters & Warehouse Address</label>
                  <input
                    type="text"
                    className="gcp-input"
                    value={formData.address}
                    onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                    onBlur={() => handleSaveField({ address: formData.address })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Accordion: Corporate Documents & Compliance Vault ── */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => toggleSection('documents')}
              style={{
                width: '100%',
                padding: '14px 18px',
                backgroundColor: openSections.documents ? '#f8fafc' : '#ffffff',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.90rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Corporate Documents & Compliance Vault
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Cloud-hosted legal registries, UAE VAT certificate, SPCFZ trade license, and authority verification
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', backgroundColor: '#dcfce7', color: '#15803d' }}>
                  2 Verified Cloud Documents
                </span>
                {openSections.documents ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
              </div>
            </button>

            {openSections.documents && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', backgroundColor: '#ffffff' }}>
                {/* Documents Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                  
                  {/* VAT Certificate Card */}
                  <div style={{ padding: '1rem', borderRadius: '10px', border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ padding: '6px', borderRadius: '6px', backgroundColor: '#ffffff', border: '1px solid #86efac', color: '#16a34a' }}>
                          <FileCheck size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#166534' }}>
                            Certificate of Registration for VAT
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#15803d' }}>
                            Federal Tax Authority (United Arab Emirates)
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#22c55e', color: '#ffffff' }}>
                        ACTIVE
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#374151', margin: '0.75rem 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div><strong>TRN:</strong> <CopyableId value={formData.taxId || '104821244100003'} /></div>
                      <div><strong>Entity:</strong> Mediluxe Health Solutions FZE (ميديلوكس للحلول الصحية م م ح)</div>
                      <div><strong>Effective Date:</strong> 01/11/2025 • <strong>Issue Date:</strong> 03/11/2025</div>
                      <div><strong>Tax Periods:</strong> Quarterly (Feb-Apr, May-Jul, Aug-Oct, Nov-Jan)</div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                      <a
                        href="/documents/corporate/Mediluxe_Health_Solutions_FZE_VAT_Certificate.pdf"
                        target="_blank"
                        rel="noreferrer"
                        className="gcp-button-primary"
                        style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                      >
                        <FileText size={13} /> View PDF
                      </a>
                      <button
                        type="button"
                        className="gcp-button"
                        onClick={() => {
                          const cloudUrl = 'https://firebasestorage.googleapis.com/v0/b/med-peptides-app.firebasestorage.app/o/corporate_documents%2Fmediluxe-health-solutions%2FMediluxe_Health_Solutions_FZE_VAT_Certificate.pdf?alt=media';
                          navigator.clipboard.writeText(cloudUrl);
                          notifier.success('VAT Certificate Cloud Storage link copied to clipboard');
                        }}
                        style={{ fontSize: '0.75rem', padding: '6px 10px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      >
                        <Copy size={13} /> Copy Cloud Link
                      </button>
                    </div>
                  </div>

                  {/* Business License Card */}
                  <div style={{ padding: '1rem', borderRadius: '10px', border: '1px solid #fed7aa', backgroundColor: '#fffaf5' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ padding: '6px', borderRadius: '6px', backgroundColor: '#ffffff', border: '1px solid #fdba74', color: '#ea580c' }}>
                          <Building2 size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#9a3412' }}>
                            Sharjah Publishing City Business License
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#c2410c' }}>
                            Sharjah Publishing City Free Zone Authority
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#ea580c', color: '#ffffff' }}>
                        LICENSED
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#374151', margin: '0.75rem 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div><strong>License No:</strong> <CopyableId value={formData.licenseNumber || '4418091.01'} /></div>
                      <div><strong>Formation No:</strong> 4418091 (Free Zone Establishment - FZE)</div>
                      <div><strong>Validity:</strong> 08/01/2025 to 07/01/2026</div>
                      <div><strong>Manager:</strong> Reimichon Shangchiri Daniel Shangchiri</div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                      <a
                        href="/documents/corporate/Mediluxe_Health_Solutions_FZE_Business_License.pdf"
                        target="_blank"
                        rel="noreferrer"
                        className="gcp-button-primary"
                        style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', backgroundColor: '#c2410c', borderColor: '#9a3412' }}
                      >
                        <FileText size={13} /> View PDF
                      </a>
                      <button
                        type="button"
                        className="gcp-button"
                        onClick={() => {
                          const cloudUrl = 'https://firebasestorage.googleapis.com/v0/b/med-peptides-app.firebasestorage.app/o/corporate_documents%2Fmediluxe-health-solutions%2FMediluxe_Health_Solutions_FZE_Business_License.pdf?alt=media';
                          navigator.clipboard.writeText(cloudUrl);
                          notifier.success('Business License Cloud Storage link copied to clipboard');
                        }}
                        style={{ fontSize: '0.75rem', padding: '6px 10px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      >
                        <Copy size={13} /> Copy Cloud Link
                      </button>
                      <a
                        href={formData.officialVerificationUrl || 'https://portal.spcfz.ae/web/mydocuments/dc/173632832882?d=T1RnNE9BPT0='}
                        target="_blank"
                        rel="noreferrer"
                        className="gcp-button"
                        style={{ fontSize: '0.75rem', padding: '6px 10px', display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: '#2563eb' }}
                      >
                        <ExternalLink size={13} /> Verify at SPCFZ
                      </a>
                    </div>
                  </div>

                </div>

                {/* Authorized Commercial & Pharmaceutical Activities */}
                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.80rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', margin: 0 }}>
                      Licensed Business Activities (Sharjah Publishing City Free Zone Authority)
                    </h4>
                    <span style={{ fontSize: '0.70rem', color: '#64748b' }}>Authorized under License 4418091.01</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.5rem' }}>
                    {[
                      { code: '4649.29', name: 'Wholesale of Para Pharmaceutical Products', ar: 'تجارة المستحضرات الصيدلانية غير الدوائية بالجملة' },
                      { code: '7020.23', name: 'Pharmaceutical Consultancies', ar: 'الإستشارات الصيدلانية' },
                      { code: '7020.18', name: 'Health Management Consulting Services', ar: 'خدمات إستشارات إدارة الصحة' },
                      { code: '4649.24', name: 'Soap & Hair Care Products Trading', ar: 'تجارة الصابون و مستحضرات العناية بالشعر' },
                      { code: '4649.09', name: 'Wholesale of Perfumery Cosmetics & Beauty Products', ar: 'بيع العطور ومستحضرات التجميل بالجملة' },
                      { code: '4690.97', name: 'General Trading', ar: 'تجارة عامة' },
                      { code: '4791', name: 'Retail Sale Via Internet / E-Commerce', ar: 'البيع بالتجزئة عن طريق الإنترنت (تجارة الكترونية)' },
                      { code: '4791.05', name: 'Online IT Solutions & Internet Retail', ar: 'بيع حلول تكنولوجيا المعلومات والمنتجات عبر الإنترنت' },
                      { code: '7020.01', name: 'Marketing, PR & Communication Consultancy', ar: 'استشارات التسويق والعلاقات العامة' },
                      { code: '7020.15', name: 'Logistics Consultancy', ar: 'الإستشارات اللوجستية' },
                      { code: '7020.20', name: 'Procurement Consulting', ar: 'استشارات المشتريات' },
                      { code: '8299.12', name: 'Documents Clearing Services', ar: 'خدمات متابعة المعاملات ومقاصة المستندات' }
                    ].map((act, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#0f172a',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, backgroundColor: '#f1f5f9', color: '#0369a1', padding: '1px 5px', borderRadius: '4px' }}>
                            {act.code}
                          </span>
                          <span style={{ fontWeight: 600 }}>{act.name}</span>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b', direction: 'rtl', textAlign: 'right' }}>
                          {act.ar}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Accordion 2: Pricing Tier & Custom Catalog Access ── */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => toggleSection('catalog')}
              style={{
                width: '100%',
                padding: '14px 18px',
                backgroundColor: openSections.catalog ? '#f8fafc' : '#ffffff',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Percent size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.90rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Pricing Tier & Authorized Product Categories
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Discount margin schedules, custom wholesale catalogs, and category permissions
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', backgroundColor: '#fff7ed', color: '#c2410c' }}>
                  {formData.discountMargin}% Margin
                </span>
                {openSections.catalog ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
              </div>
            </button>

            {openSections.catalog && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Wholesale Pricing Tier</label>
                    <select
                      className="gcp-input"
                      value={formData.tier}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(p => ({ ...p, tier: val }));
                        handleSaveField({ tier: val });
                      }}
                      style={{ width: '100%' }}
                    >
                      <option value="standard">Standard Wholesale</option>
                      <option value="tier_b2b_clinic">Clinic B2B Preferred</option>
                      <option value="premium">Tier 1 Enterprise VIP</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Standard Discount Margin (%)</label>
                    <input
                      type="number"
                      className="gcp-input"
                      value={formData.discountMargin}
                      onChange={(e) => setFormData(p => ({ ...p, discountMargin: Number(e.target.value) }))}
                      onBlur={() => handleSaveField({ discountMargin: formData.discountMargin })}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.80rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    Authorized Distribution Categories
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {['Peptides & Longevity Biomarkers', 'Magistral Hair & Scalp Restoration', 'Bio-identical Hormone Therapy', 'Metabolic & GLP-1 Adjuvants', 'IV Nutrient & Antioxidant Packs'].map((cat, i) => (
                      <span
                        key={i}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 12px',
                          borderRadius: '16px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#0f172a'
                        }}
                      >
                        <CheckCircle size={13} color="#16a34a" /> {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Accordion 3: Account Management & Direct Representatives ── */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => toggleSection('manager')}
              style={{
                width: '100%',
                padding: '14px 18px',
                backgroundColor: openSections.manager ? '#f8fafc' : '#ffffff',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.90rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Commercial Representation & Key Contacts
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Assigned account manager, procurement director, and direct order communication
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', backgroundColor: '#faf5ff', color: '#7e22ce' }}>
                  Active Contacts
                </span>
                {openSections.manager ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
              </div>
            </button>

            {openSections.manager && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Lead Procurement Contact</label>
                    <input
                      type="text"
                      className="gcp-input"
                      value={formData.contactName}
                      onChange={(e) => setFormData(p => ({ ...p, contactName: e.target.value }))}
                      onBlur={() => handleSaveField({ contactName: formData.contactName })}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Direct Verified Email</label>
                    <input
                      type="email"
                      className="gcp-input"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData(p => ({ ...p, contactEmail: e.target.value }))}
                      onBlur={() => handleSaveField({ contactEmail: formData.contactEmail, email: formData.contactEmail })}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Direct Telephone / WhatsApp</label>
                    <input
                      type="text"
                      className="gcp-input"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData(p => ({ ...p, contactPhone: e.target.value }))}
                      onBlur={() => handleSaveField({ contactPhone: formData.contactPhone, phone: formData.contactPhone })}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Accordion 4: B2B Purchase Orders & Invoicing History ── */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => toggleSection('orders')}
              style={{
                width: '100%',
                padding: '14px 18px',
                backgroundColor: openSections.orders ? '#f8fafc' : '#ffffff',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Truck size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.90rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    B2B Purchase Orders & Wholesale Invoices
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Bulk procurement history, insulated freight status, and commercial invoice settlement
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                  Order History
                </span>
                {openSections.orders ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
              </div>
            </button>

            {openSections.orders && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { id: 'PO-WS-2024-9182', date: 'Yesterday', total: 14250, status: 'In Transit', items: '50x Magistral Formulations, 20x Peptide Vials' },
                    { id: 'PO-WS-2024-8841', date: 'Aug 28, 2024', total: 28900, status: 'Delivered', items: '120x Hair Restoration Courses, 40x Bio-Estradiol' },
                    { id: 'PO-WS-2024-8419', date: 'Jul 15, 2024', total: 19400, status: 'Delivered', items: '80x Compounded Solutions, 30x Laboratory Reagents' }
                  ].map((order) => (
                    <div key={order.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>{order.id}</span>
                          <CopyableId value={order.id} />
                        </div>
                        <StatusChip status={order.status.toLowerCase().replace(' ', '_')} />
                      </div>
                      <div style={{ fontSize: '0.80rem', color: '#334155', marginBottom: '0.25rem' }}>
                        Items: {order.items}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.80rem', color: 'var(--text-muted)' }}>
                        <span>Total: <strong>${order.total.toLocaleString()}</strong></span>
                        <span>Logistics: ❄️ Cold Chain Certified (2-8°C)</span>
                        <span>Date: {order.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Accordion 5: Commercial Notes & Activity Log ── */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => toggleSection('activity')}
              style={{
                width: '100%',
                padding: '14px 18px',
                backgroundColor: openSections.activity ? '#f8fafc' : '#ffffff',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.90rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Commercial Notes & Audit Log
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Historical credit authorization, agreement modifications, and CRM communications
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#475569' }}>
                  Audit Trail
                </span>
                {openSections.activity ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
              </div>
            </button>

            {openSections.activity && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.80rem', color: '#475569' }}>
                  <div style={{ padding: '0.75rem', borderRadius: '6px', backgroundColor: '#f8fafc', borderLeft: '3px solid #2563eb' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Credit Terms Confirmed (Net 30)</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Authorized by Commercial Directorate • Trade License Verified</div>
                  </div>
                  <div style={{ padding: '0.75rem', borderRadius: '6px', backgroundColor: '#f8fafc', borderLeft: '3px solid #16a34a' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Pricing Tier Assigned: Clinic B2B Preferred (25% Margin)</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Catalog scope configured for all accredited medical compounds</div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Standard GCP Sticky Footer ── */}
      <div
        style={{
          flexShrink: 0,
          position: 'sticky',
          bottom: 0,
          backgroundColor: '#ffffff',
          borderTop: '1px solid var(--border)',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.04)',
          zIndex: 20
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.80rem', color: 'var(--text-muted)' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{displayName}</span>
          <span>•</span>
          <span>Terms: <strong style={{ color: '#16a34a' }}>{formData.paymentTerms}</strong></span>
          <span>•</span>
          <span>Margin: <strong style={{ color: '#c2410c' }}>{formData.discountMargin}%</strong></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            className="gcp-btn-secondary"
            style={{
              padding: '8px 20px',
              fontSize: '0.84rem',
              fontWeight: 600,
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155'
            }}
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={() => {
              notifier.info(`Initiating B2B Purchase Order for ${displayName}`);
            }}
            className="gcp-btn-primary"
            style={{
              padding: '8px 20px',
              fontSize: '0.84rem',
              fontWeight: 700,
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Package size={15} /> New B2B Order
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { User, Building2, Globe, Calendar, DollarSign, Clock, ShieldCheck, Stethoscope, ArrowRight } from 'lucide-react';
import StatusBadge from '../../ui/StatusBadge';
import CopyableId from '../../ui/CopyableId';

export default function OverviewTab({ quotation, quotationId }) {
  if (!quotation) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        No quotation data loaded.
      </div>
    );
  }

  const category = quotation.category || quotation.recipientType || 'patient';
  const categoryIcon = category === 'clinic' ? Building2 : category === 'wholesaler' ? Globe : User;
  const CategoryIconComp = categoryIcon;

  const clientName = quotation.clientName || quotation.patientName || quotation.wholesalerName || quotation.clinicName || 'Direct Client';
  const currency = quotation.currency || 'USD';
  const currencySymbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
  const grandTotal = Number(quotation.grandTotal || quotation.totalAmount || 0);

  const formattedDate = quotation.createdAt
    ? new Date(quotation.createdAt?.toDate ? quotation.createdAt.toDate() : quotation.createdAt).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Recently';

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Summary */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: category === 'clinic' ? '#eff6ff' : category === 'wholesaler' ? '#fff7ed' : '#f0fdfa',
            color: category === 'clinic' ? '#2563eb' : category === 'wholesaler' ? '#ea580c' : '#0d9488',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CategoryIconComp size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              {clientName}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <span>ID: <CopyableId value={quotation.quotationNumber || quotation.id} /></span>
              <span>·</span>
              <span style={{ textTransform: 'capitalize' }}>Channel: {category}</span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <StatusBadge status={quotation.status || 'draft'} />
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary, #003666)', marginTop: 4 }}>
            {currencySymbol}{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Creation Date
          </div>
          <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#0f172a', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={14} color="#64748b" />
            {formattedDate}
          </div>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Validity Period
          </div>
          <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#0f172a', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} color="#64748b" />
            {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : '30 Days Standard'}
          </div>
        </div>

        {quotation.doctorName && (
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Supervising Doctor
            </div>
            <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#0f172a', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Stethoscope size={14} color="#0d9488" />
              {quotation.doctorName}
            </div>
          </div>
        )}

        {quotation.clinicName && (
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Facility / Clinic
            </div>
            <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#0f172a', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Building2 size={14} color="#2563eb" />
              {quotation.clinicName}
            </div>
          </div>
        )}
      </div>

      {/* Commercial Notes */}
      {quotation.commercialNotes && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
            Commercial Notes & Instructions
          </div>
          <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
            {quotation.commercialNotes}
          </div>
        </div>
      )}
    </div>
  );
}

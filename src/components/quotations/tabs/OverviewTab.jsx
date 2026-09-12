'use client';

import React, { useState } from 'react';
import { User, Building2, Globe, Calendar, DollarSign, Clock, ShieldCheck, Stethoscope, ArrowRight, ExternalLink, Share2, ShoppingCart, Truck, Copy, Check, Zap } from 'lucide-react';
import StatusBadge from '../../ui/StatusBadge';
import CopyableId from '../../ui/CopyableId';
import { useDrawer } from '../../../context/DrawerContext';
import { convertQuotationToOrderAction, convertQuotationToSupplierPoAction } from '../../../actions/quotationsActions';
import notifier from '../../../services/NotificationService';
import BiginContactLookupModal from '../../admin/quotations/BiginContactLookupModal';

export default function OverviewTab({ quotation, quotationId }) {
  const { openDrawer } = useDrawer();
  const [convertingOrder, setConvertingOrder] = useState(false);
  const [generatingPo, setGeneratingPo] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isBiginModalOpen, setIsBiginModalOpen] = useState(false);

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
  const clientId = quotation.patientId || quotation.clientId || quotation.wholesalerId || quotation.clinicId || quotation.userId;
  const currency = quotation.currency || 'USD';
  const currencySymbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
  const grandTotal = Number(quotation.grandTotal || quotation.totalAmount || 0);
  const publicToken = quotation.publicToken || quotation.token || quotation.id;
  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/quotation/${publicToken}` : `/quotation/${publicToken}`;

  const formattedDate = quotation.createdAt
    ? new Date(quotation.createdAt?.toDate ? quotation.createdAt.toDate() : quotation.createdAt).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Recently';

  const handleOpenClientProfile = () => {
    if (clientId) {
      openDrawer('patient', clientId, { clientName });
    } else {
      notifier.info(`Client profile ID not linked for ${clientName}`);
    }
  };

  const handleCopyLink = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(publicUrl);
      setCopiedLink(true);
      notifier.success('Public quotation link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleConvertToOrder = async () => {
    if (quotation.convertedOrderId) {
      notifier.info(`Quotation already converted to Order ${quotation.convertedOrderNumber || quotation.convertedOrderId}`);
      return;
    }
    setConvertingOrder(true);
    try {
      const qId = quotation.id || quotationId;
      const res = await convertQuotationToOrderAction(qId);
      if (res.success) {
        notifier.success(`Sales Order ${res.orderNumber} created successfully!`);
        if (res.orderId) {
          openDrawer('order', res.orderId);
        }
      }
    } catch (err) {
      notifier.error(err.message || 'Failed to convert quotation to order');
    } finally {
      setConvertingOrder(false);
    }
  };

  const handleConvertToPo = async () => {
    setGeneratingPo(true);
    try {
      const qId = quotation.id || quotationId;
      const res = await convertQuotationToSupplierPoAction(qId, quotation.supplierId, quotation.supplierName);
      if (res.success) {
        notifier.success(`Supplier PO ${res.poNumber} created successfully!`);
      }
    } catch (err) {
      notifier.error(err.message || 'Failed to generate supplier PO');
    } finally {
      setGeneratingPo(false);
    }
  };

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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                {clientName}
              </span>
              {clientId && (
                <button
                  type="button"
                  onClick={handleOpenClientProfile}
                  style={{
                    border: 'none',
                    background: '#eff6ff',
                    color: '#2563eb',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                  title="Open Client Profile"
                >
                  <User size={12} />
                  Ver Ficha ↗
                </button>
              )}
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

      {/* Interactive Actions & Public Link Card */}
      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
        border: '1px solid #bbf7d0',
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Globe size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#166534' }}>
              Enlace de Cotización Pública para el Cliente
            </div>
            <div style={{ fontSize: '0.74rem', color: '#15803d', marginTop: 2 }}>
              Incluye fichas técnicas, trazabilidad y etiquetas de vial 38x90
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleCopyLink}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 12px',
              borderRadius: 6,
              background: '#ffffff',
              border: '1px solid #86efac',
              color: '#166534',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {copiedLink ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
            {copiedLink ? 'Copiado ✓' : 'Copiar Enlace'}
          </button>

          <a
            href={`/quotation/${publicToken}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 12px',
              borderRadius: 6,
              background: '#16a34a',
              color: '#ffffff',
              fontSize: '0.78rem',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            Abrir Vista Cliente <ExternalLink size={13} />
          </a>

          <button
            type="button"
            onClick={() => setIsBiginModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 12px',
              borderRadius: 6,
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              color: '#0369a1',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title="Buscar y cargar datos de contacto, dirección e instrucciones desde Zoho Bigin"
          >
            <Zap size={14} color="#0284c7" />
            Cargar de Bigin
          </button>

          {!quotation.convertedOrderId && (
            <button
              type="button"
              disabled={convertingOrder}
              onClick={handleConvertToOrder}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                borderRadius: 6,
                background: 'var(--color-primary, #003666)',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <ShoppingCart size={14} />
              {convertingOrder ? 'Convirtiendo...' : 'Convertir a Pedido'}
            </button>
          )}

          <button
            type="button"
            disabled={generatingPo}
            onClick={handleConvertToPo}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 12px',
              borderRadius: 6,
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Truck size={14} />
            {generatingPo ? 'Generando PO...' : 'Generar PO Laboratorio'}
          </button>
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

      {/* Zoho Bigin Quick Contact Lookup Modal */}
      <BiginContactLookupModal
        isOpen={isBiginModalOpen}
        quotation={quotation}
        onClose={() => setIsBiginModalOpen(false)}
        onSuccess={(updated) => {
          notifier.success('Datos de Zoho Bigin aplicados a la cotización');
          window.dispatchEvent(new CustomEvent('quotation-updated', { detail: updated }));
          window.dispatchEvent(new CustomEvent('refresh-quotations'));
        }}
      />
    </div>
  );
}

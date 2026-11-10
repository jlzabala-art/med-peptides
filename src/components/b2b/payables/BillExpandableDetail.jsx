"use client";

import React from 'react';
import {
  FileText,
  ExternalLink,
  Download
} from '@/lib/icons';
import CopyableId from '@/components/ui/CopyableId';
import { formatDateDisplay } from './payablesFormat';

export default function BillExpandableDetail({ bill, token, isLocked, lang, activeEmail, isMasterAdmin, paymentTerms }) {
  const row = bill || {};
  const billId = row.billId || row.id;
  const billNum = row.billNumber || billId || 'FAC-••••••••';
  const totalNum = Number(row.total || 0);
  const balanceNum = Number(row.balance !== undefined ? row.balance : totalNum);
  const currency = row.currency || 'AED';
  const emailParam = activeEmail ? `?email=${encodeURIComponent(activeEmail)}` : '';
  const pdfUrl = `/api/payables/${token}/pdf/${encodeURIComponent(billId)}${emailParam}`;

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      padding: '16px',
      margin: '4px 0',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '20px',
      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)'
    }}>
      {/* Left Column: Executive Summary Card */}
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
            <div style={{ fontWeight: 600, color: '#0284c7', marginTop: '2px' }}>
              {row.sourceInvoiceNumber || row.referenceNumber || '—'}
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
            <div style={{ fontWeight: 700, color: (row.status === 'overdue' || (row.dueDate && row.dueDate <= new Date().toISOString().slice(0, 10))) ? '#dc2626' : '#1e293b', marginTop: '2px' }}>
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
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '8px' }}>
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
              transition: 'all 0.15s ease'
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
              transition: 'all 0.15s ease'
            }}
          >
            <Download size={13} />
            <span>{lang === 'es' ? 'Descargar PDF' : 'Download PDF'}</span>
          </a>
        </div>
      </div>

      {/* Right Column: Embedded Interactive PDF Viewer */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        minHeight: '440px'
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

        <div style={{ flex: 1, width: '100%', minHeight: '390px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1', backgroundColor: '#e2e8f0' }}>
          <iframe
            src={pdfUrl}
            title={`PDF Preview ${billNum}`}
            style={{ width: '100%', height: '100%', minHeight: '390px', border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
}

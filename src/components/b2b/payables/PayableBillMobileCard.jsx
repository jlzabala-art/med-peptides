"use client";

import React from 'react';
import {
  Clock,
  CheckCircle2,
  Lock
} from '@/lib/icons';
import CopyableId from '@/components/ui/CopyableId';
import { formatDateDisplay } from './payablesFormat';

export default function PayableBillMobileCard(props) {
  const bill = props.row || props.item || props.bill || props || {};
  const { isLocked, lang } = props;
  if (!bill || !bill.id) return null;
  const isPending = bill.status !== 'paid' && (Number(bill.balance || 0) > 0 || bill.status === 'locked' || bill.status === 'overdue');
  const balanceNum = Number(bill.balance !== undefined ? bill.balance : (bill.total || 0));
  const totalNum = Number(bill.total || 0);

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      padding: '12px 14px',
      marginBottom: '10px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      {/* Top Header: Bill ID & Status Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 750, color: '#003666', fontSize: '0.88rem' }}>
          {isLocked ? (
            <>
              <Lock size={12} color="#94a3b8" />
              <span style={{ color: '#64748b' }}>FAC-••••••••</span>
            </>
          ) : (
            <>
              <span>{bill.billNumber || bill.billId}</span>
              <CopyableId value={bill.billNumber || bill.billId} iconOnly={true} />
            </>
          )}
        </div>

        {isLocked ? (
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: '#c2410c',
            backgroundColor: '#fff7ed',
            border: '1px solid #ffedd5',
            padding: '2px 8px',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            <Lock size={10} /> PROTECTED
          </span>
        ) : isPending ? (
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: '#b45309',
            backgroundColor: '#fef3c7',
            border: '1px solid #fde68a',
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            PENDING
          </span>
        ) : (
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: '#16a34a',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            padding: '2px 8px',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            <CheckCircle2 size={11} /> SETTLED
          </span>
        )}
      </div>

      {/* Description & Reference */}
      <div style={{ fontSize: '0.78rem', color: '#1e293b' }}>
        <div style={{ fontWeight: 600 }}>
          {isLocked ? (lang === 'es' ? 'Facturación Comercial Protegida' : 'Protected Commercial Billing') : (bill.billType || 'Settlement / Commission')}
        </div>
        {bill.sourceInvoiceNumber && (
          <div style={{ fontSize: '0.72rem', color: '#0284c7', marginTop: '2px' }}>
            {isLocked ? (lang === 'es' ? 'Factura cliente protegida' : 'Linked to protected client invoice') : `Linked to client invoice: ${bill.sourceInvoiceNumber}`}
          </div>
        )}
        {bill.referenceNumber && bill.referenceNumber !== bill.billNumber && !isLocked && (
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '1px' }}>
            Ref: {bill.referenceNumber}
          </div>
        )}
      </div>

      {/* Dates Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.72rem',
        color: '#64748b',
        backgroundColor: '#f8fafc',
        padding: '5px 8px',
        borderRadius: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={11} />
          <span>Issue: <strong style={{ color: '#334155' }}>{formatDateDisplay(bill.date, lang)}</strong></span>
        </div>
        <div>
          <span>Due: <strong style={{ color: isPending ? '#b45309' : '#334155' }}>{formatDateDisplay(bill.dueDate, lang)}</strong></span>
        </div>
      </div>

      {/* Amounts Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid #f1f5f9',
        paddingTop: '6px',
        marginTop: '2px'
      }}>
        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
          Total: {isLocked ? `•••• ${bill.currency}` : `${totalNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${bill.currency}`}
        </div>
        <div>
          {isLocked ? (
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c2410c', backgroundColor: '#fff7ed', padding: '2px 8px', borderRadius: '4px' }}>
              •••• {bill.currency}
            </span>
          ) : isPending ? (
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#c2410c', backgroundColor: '#fff7ed', padding: '2px 8px', borderRadius: '4px', border: '1px solid #ffedd5' }}>
              {(balanceNum > 0 ? balanceNum : totalNum).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {bill.currency}
            </span>
          ) : (
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#16a34a' }}>
              0.00 {bill.currency}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

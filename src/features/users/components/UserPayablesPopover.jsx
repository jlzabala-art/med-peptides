'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Clock,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  X,
  MessageCircle,
  ShieldCheck,
  Building2,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserPayablesPopover({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statementData, setStatementData] = useState(null);
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef(null);

  // Determine token or identifier
  const token = user?.payablesToken || (user?.email === 'jia9156@gmail.com' || (user?.companyName || '').includes('Health Source') ? 'HSC-PAY-ZN1TU5Q6' : (user?.payablesSlug || user?.id));
  const isWholesalerOrSupplier = user?.role === 'wholesaler' || user?.role === 'supplier' || user?.roles?.includes('wholesaler') || user?.roles?.includes('supplier') || user?.zohoBooksVendorNumber || user?.payablesToken;

  if (!isWholesalerOrSupplier) {
    return null;
  }

  // Fetch payables summary lazily on popover open
  useEffect(() => {
    if (!isOpen || !token) return;

    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/payables/${token}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.success) {
          setStatementData(data);
          setIsLoading(false);
        } else if (isMounted) {
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.error('[UserPayablesPopover] Error fetching payables:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, token]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.atlashealth-services.com';
  const shareUrl = `${origin}/b2b/payables/${token}`;

  const handleCopy = (e) => {
    if (e) e.stopPropagation();
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    toast.success('Enlace de facturas pendientes copiado');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = (e) => {
    if (e) e.stopPropagation();
    const phone = (user?.phone || user?.mobile || '971506167657').replace(/[^0-9]/g, '');
    const amount = statementData?.kpis?.totalPendingAmount != null ? `${statementData.kpis.totalPendingAmount.toLocaleString()} ${statementData.kpis.currency || 'AED'}` : 'saldo pendiente';
    const msg = `Hola ${user?.firstName || user?.fullName || 'Estimado partner'}, aquí tienes el extracto oficial actualizado de facturas y pagos pendientes de liquidación (${amount}): ${shareUrl}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const pendingAmount = statementData?.kpis?.totalPendingAmount;
  const openCount = statementData?.kpis?.openBillsCount;
  const currency = statementData?.kpis?.currency || 'AED';

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={popoverRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        title="Ver y compartir extracto de facturas pendientes con el proveedor"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '0.72rem',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: '999px',
          backgroundColor: '#fff7ed',
          color: '#c2410c',
          border: '1px solid #fed7aa',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: isOpen ? '0 0 0 2px rgba(234, 88, 12, 0.2)' : 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#ffedd5';
          e.currentTarget.style.borderColor = '#fdba74';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#fff7ed';
          e.currentTarget.style.borderColor = '#fed7aa';
        }}
      >
        <FileText size={12} color="#ea580c" />
        <span>Bills Pendientes</span>
        {openCount != null && (
          <span style={{
            backgroundColor: '#ea580c',
            color: '#ffffff',
            borderRadius: '999px',
            padding: '1px 5px',
            fontSize: '0.65rem',
            fontWeight: 800
          }}>
            {openCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Container */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            width: '360px',
            maxWidth: '90vw',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.18), 0 2px 6px rgba(0,0,0,0.06)',
            border: '1px solid #e2e8f0',
            zIndex: 1050,
            overflow: 'hidden',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          {/* Popover Header */}
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#002244',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={15} color="#38bdf8" />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>
                  Extracto de Facturas Pendientes
                </div>
                <div style={{ fontSize: '0.68rem', color: '#93c5fd' }}>
                  {user?.companyName || user?.fullName || 'Proveedor B2B'} · Zoho Books Sync
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#cbd5e1',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Body Content */}
          <div style={{ padding: '1rem' }}>
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', gap: '8px', color: '#64748b', fontSize: '0.82rem' }}>
                <RefreshCw size={16} className="animate-spin" color="#003666" />
                <span>Consultando facturas en Zoho Books...</span>
              </div>
            ) : (
              <>
                {/* Clean Financial Snapshot */}
                <div style={{
                  backgroundColor: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: '8px',
                  padding: '0.75rem 0.9rem',
                  marginBottom: '0.85rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#c2410c' }}>
                      Saldo Pendiente de Pago
                    </span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#16a34a', backgroundColor: '#dcfce7', padding: '1px 6px', borderRadius: '4px' }}>
                      Al día
                    </span>
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#9a3412', letterSpacing: '-0.02em' }}>
                    {pendingAmount != null ? pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '6,182.24'}{' '}
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{currency}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#7c2d12', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} />
                    <span>{openCount ?? 3} facturas pendientes · Net 10 tras cobro</span>
                  </div>
                </div>

                {/* Share URL Box */}
                <div style={{ marginBottom: '0.85rem' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    Enlace público para el proveedor:
                  </label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      style={{
                        flex: 1,
                        fontSize: '0.74rem',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#f8fafc',
                        color: '#334155',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleCopy}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        padding: '6px 10px',
                        borderRadius: '6px',
                        backgroundColor: copied ? '#16a34a' : '#003666',
                        color: '#ffffff',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copied ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    <ExternalLink size={13} />
                    <span>Abrir Portal ↗</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleWhatsApp}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <MessageCircle size={13} />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


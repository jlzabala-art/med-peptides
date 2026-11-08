"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Download,
  Share2,
  RefreshCw,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Building2,
  ArrowUpRight
} from '@/lib/icons';
import BrandLogo from '@/components/common/BrandLogo';
import CopyableId from '@/components/ui/CopyableId';
import StatusBadge from '@/components/ui/StatusBadge';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import toast from 'react-hot-toast';

export default function PayablesStatementPage() {
  const params = useParams();
  const token = params?.token;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'paid'
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchStatement = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/payables/${token}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load payables statement');
      setData(json);
    } catch (err) {
      console.error('Error fetching statement:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatement();
  }, [token]);

  const statement = data?.statement || {};
  const kpis = data?.kpis || {};
  const openBills = data?.openBills || [];
  const paidBills = data?.paidBills || [];

  const handleCopyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast.success('Enlace del extracto copiado al portapapeles');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleOpenWhatsApp = () => {
    const pendingTotal = (kpis.totalPendingAmount || 0).toLocaleString();
    const count = openBills.length;
    const msg = `Hello Atlas Accounts Team, regarding the statement for ${statement.wholesalerName || 'Health Source Canada'}: we are reviewing the ${count} pending invoices totaling ${pendingTotal} AED. Link: ${typeof window !== 'undefined' ? window.location.href : ''}`;
    window.open(`https://wa.me/971506167657?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const currentBills = activeTab === 'pending' ? openBills : paidBills;
  const filteredBills = useMemo(() => {
    if (!searchFilter.trim()) return currentBills;
    const q = searchFilter.toLowerCase();
    return currentBills.filter(b => 
      (b.billNumber || '').toLowerCase().includes(q) ||
      (b.referenceNumber || '').toLowerCase().includes(q) ||
      (b.billType || '').toLowerCase().includes(q) ||
      (b.sourceInvoiceNumber || '').toLowerCase().includes(q)
    );
  }, [currentBills, searchFilter]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <RefreshCw size={28} className="animate-spin" style={{ color: '#003666', marginBottom: '1rem' }} />
        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>Cargando extracto de facturación...</div>
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Sincronizando registros en vivo con Zoho Books</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '2rem', textAlign: 'center' }}>
        <AlertCircle size={44} color="#dc2626" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Extracto no disponible o enlace expirado</h2>
        <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: '420px', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          {error || 'No se ha encontrado el extracto de cuentas por pagar solicitado. Contacte con el equipo de administración.'}
        </p>
        <button
          onClick={fetchStatement}
          style={{ padding: '8px 18px', backgroundColor: '#003666', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* ── TOP INSTITUTIONAL BAR (Google Cloud Header Style) ── */}
      <header style={{ backgroundColor: '#002244', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>Atlas Health</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 300, color: '#38bdf8' }}>Services</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>/</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#93c5fd' }}>B2B Settlement & Payables Statement</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            Zoho Books Live Sync ✓
          </span>
          <button
            onClick={handleCopyShareLink}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 11px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.12)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
          >
            {copiedLink ? <Check size={13} color="#4ade80" /> : <Share2 size={13} />}
            <span>{copiedLink ? 'Copiado' : 'Compartir'}</span>
          </button>
          <button
            onClick={handleOpenWhatsApp}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '6px', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
          >
            <MessageCircle size={13} />
            <span>Consultar Pago</span>
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Title & Metadata Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#0369a1', backgroundColor: '#e0f2fe', padding: '2px 8px', borderRadius: '4px' }}>
                Vendor Account · {statement.vendorNumber}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Updated {new Date(kpis.lastUpdated).toLocaleTimeString()}
              </span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              {statement.wholesalerName}
            </h1>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
              Attention: <strong>{statement.contactName}</strong> {statement.phone ? `(${statement.phone})` : ''} · Dubai, UAE
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={fetchStatement}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 13px', borderRadius: '6px', backgroundColor: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
              title="Refresh from Zoho Books"
            >
              <RefreshCw size={13} />
              <span>Sincronizar</span>
            </button>
          </div>
        </div>

        {/* ── 4 CLEAN OPERATIONAL KPIS (No commission %, No historical paid) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {/* KPI 1: Total Pendiente de Pago */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '1.25rem 1.4rem', border: '1.5px solid #fed7aa', boxShadow: '0 2px 8px rgba(234, 88, 12, 0.05)' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={13} /> Total Pendiente de Pago
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#9a3412', marginTop: '0.4rem', letterSpacing: '-0.02em' }}>
              {(kpis.totalPendingAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{kpis.currency}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '0.35rem', fontWeight: 500 }}>
              Saldo exigible pendiente de liquidación
            </div>
          </div>

          {/* KPI 2: Facturas Pendientes */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '1.25rem 1.4rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={13} /> Facturas Pendientes
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', marginTop: '0.4rem', letterSpacing: '-0.02em' }}>
              {kpis.openBillsCount} <span style={{ fontSize: '1rem', fontWeight: 500, color: '#64748b' }}>facturas abiertas</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
              En proceso de revisión contable
            </div>
          </div>

          {/* KPI 3: Próximo Vencimiento */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '1.25rem 1.4rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={13} /> Próximo Vencimiento
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '0.4rem', letterSpacing: '-0.01em' }}>
              {kpis.nextDueDate || 'Al día'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.35rem', fontWeight: 600 }}>
              Liquidación conforme a facturación origen
            </div>
          </div>

          {/* KPI 4: Términos de Liquidación */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '1.25rem 1.4rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={13} /> Términos de Pago
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '0.65rem', lineHeight: 1.3 }}>
              {kpis.paymentTerms}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
              Vendor Number: <strong>{statement.vendorNumber}</strong>
            </div>
          </div>
        </div>

        {/* ── TABS BAR (Google Cloud Segmented Control) ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('pending')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.65rem 1.25rem',
                border: 'none',
                borderBottom: activeTab === 'pending' ? '2.5px solid #c2410c' : '2.5px solid transparent',
                backgroundColor: 'transparent',
                color: activeTab === 'pending' ? '#c2410c' : '#64748b',
                fontWeight: activeTab === 'pending' ? 800 : 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>Facturas Pendientes de Pago</span>
              <span style={{ backgroundColor: activeTab === 'pending' ? '#ffedd5' : '#f1f5f9', color: activeTab === 'pending' ? '#c2410c' : '#64748b', fontSize: '0.72rem', fontWeight: 800, padding: '2px 7px', borderRadius: '10px' }}>
                {openBills.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('paid')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.65rem 1.25rem',
                border: 'none',
                borderBottom: activeTab === 'paid' ? '2.5px solid #003666' : '2.5px solid transparent',
                backgroundColor: 'transparent',
                color: activeTab === 'paid' ? '#003666' : '#64748b',
                fontWeight: activeTab === 'paid' ? 800 : 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>Historial de Facturas Pagadas</span>
              <span style={{ backgroundColor: activeTab === 'paid' ? '#e0f2fe' : '#f1f5f9', color: activeTab === 'paid' ? '#0369a1' : '#64748b', fontSize: '0.72rem', fontWeight: 800, padding: '2px 7px', borderRadius: '10px' }}>
                {paidBills.length}
              </span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Buscar por n.º de factura o concepto..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8rem',
                minWidth: '240px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* ── BILLS TABLE (DataTable GCP Standard) ── */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          {filteredBills.length === 0 ? (
            <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
              <CheckCircle2 size={36} color="#16a34a" style={{ margin: '0 auto 0.75rem auto' }} />
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                {activeTab === 'pending' ? 'No hay facturas pendientes de pago' : 'No se encontraron facturas pagadas con este criterio'}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.25rem' }}>
                {activeTab === 'pending' ? 'Todas las facturas están liquidadas y al día.' : 'Prueba a cambiar el texto de búsqueda.'}
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '12px 16px', width: '22%' }}>N.º Factura</th>
                    <th style={{ padding: '12px 14px', width: '14%' }}>Fecha</th>
                    <th style={{ padding: '12px 14px', width: '14%' }}>Vencimiento</th>
                    <th style={{ padding: '12px 16px', width: '26%' }}>Concepto / Ref. Origen</th>
                    <th style={{ padding: '12px 14px', width: '12%', textAlign: 'right' }}>Total</th>
                    <th style={{ padding: '12px 16px', width: '12%', textAlign: 'right' }}>Saldo Pendiente</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.map((bill, idx) => {
                    const isPending = bill.status !== 'paid' && (bill.balance > 0 || bill.status === 'draft');
                    const balanceNum = Number(bill.balance || 0);
                    const totalNum = Number(bill.total || 0);

                    return (
                      <tr
                        key={bill.id || idx}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        {/* N.º Factura */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{bill.billNumber || bill.billId}</span>
                            <CopyableId value={bill.billNumber || bill.billId} iconOnly={true} />
                          </div>
                          {bill.referenceNumber && bill.referenceNumber !== bill.billNumber && (
                            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                              Ref: {bill.referenceNumber}
                            </div>
                          )}
                        </td>

                        {/* Fecha Emisión */}
                        <td style={{ padding: '12px 14px', color: '#334155', whiteSpace: 'nowrap' }}>
                          {bill.date || '—'}
                        </td>

                        {/* Vencimiento */}
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                          <span style={{ color: isPending ? '#b45309' : '#64748b', fontWeight: isPending ? 600 : 400 }}>
                            {bill.dueDate || '—'}
                          </span>
                        </td>

                        {/* Concepto / Factura Origen */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ color: '#0f172a', fontWeight: 600 }}>
                            {bill.billType || 'Liquidación / Comisión'}
                          </div>
                          {bill.sourceInvoiceNumber && (
                            <div style={{ fontSize: '0.74rem', color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <span>Sobre factura cliente: {bill.sourceInvoiceNumber}</span>
                            </div>
                          )}
                        </td>

                        {/* Importe Total */}
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>
                          {totalNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {bill.currency}
                        </td>

                        {/* Saldo Pendiente */}
                        <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {isPending ? (
                            <span style={{ fontWeight: 800, color: '#c2410c', backgroundColor: '#fff7ed', padding: '3px 8px', borderRadius: '4px', border: '1px solid #ffedd5' }}>
                              {(balanceNum > 0 ? balanceNum : totalNum).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {bill.currency}
                            </span>
                          ) : (
                            <span style={{ fontWeight: 700, color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={13} /> Pagado
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── FOOTER NOTE ── */}
        <div style={{ marginTop: '2rem', padding: '1.25rem 1.5rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', fontSize: '0.78rem', color: '#64748b' }}>
          <div>
            <strong>Atlas Health Services · Mediluxe Health Solutions</strong> (Dubai, United Arab Emirates).
            <div style={{ marginTop: '0.2rem' }}>
              Este extracto es un documento comercial verificable en tiempo real contra el libro de compras de Zoho Books.
            </div>
          </div>
          <button
            onClick={handleOpenWhatsApp}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 14px', backgroundColor: '#003666', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
          >
            <MessageCircle size={14} /> Contactar Departamento Financiero
          </button>
        </div>
      </main>

      <PublicUnifiedFooter />
    </div>
  );
}


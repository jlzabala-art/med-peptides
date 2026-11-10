"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Share2,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  Building2,
  ExternalLink,
  MessageCircle,
  Mail,
  ArrowRight,
  LogOut,
  ChevronDown
} from '@/lib/icons';
import BrandLogo from '@/components/common/BrandLogo';
import CopyableId from '@/components/ui/CopyableId';
import DataTable from '@/components/ui/DataTable';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import StatusBadge from '@/components/ui/StatusBadge';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import GcpUserBadge from '@/components/shared/GcpUserBadge';
import toast from 'react-hot-toast';

function PayableBillMobileCard({ row: bill, isLocked, lang }) {
  if (!bill) return null;
  const isPending = bill.status !== 'paid' && (bill.balance > 0 || bill.status === 'draft' || bill.status === 'locked');
  const balanceNum = Number(bill.balance || 0);
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
          <span>Issue: <strong style={{ color: '#334155' }}>{bill.date || '—'}</strong></span>
        </div>
        <div>
          <span>Due: <strong style={{ color: isPending ? '#b45309' : '#334155' }}>{bill.dueDate || '—'}</strong></span>
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

export default function PayablesStatementPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const token = params?.token;

  // Bilingual engine: English by default
  const [lang, setLang] = useState('en'); // 'en' | 'es'

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'paid'
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Authentication & Zero-Trust Unlock State
  const authContext = useAuth?.() || {};
  const authUser = authContext.user;
  const isAdmin = authContext.isAdmin;
  const logout = authContext.logout;
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [unlockEmail, setUnlockEmail] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [activeEmail, setActiveEmail] = useState(() => {
    return searchParams?.get('email') || '';
  });

  const isQuicklinkVerified = searchParams?.get('quicklink') === 'verified';

  const [isSyncing, setIsSyncing] = useState(false);

  const fetchStatement = async (emailOverride, forceRefresh = false) => {
    if (!token) return;
    if (forceRefresh) setIsSyncing(true);
    else setLoading(true);
    setError(null);
    try {
      const emailToUse = emailOverride !== undefined ? emailOverride : (activeEmail || authUser?.email || '');
      const qParams = new URLSearchParams();
      if (emailToUse) qParams.set('email', emailToUse);
      if (isQuicklinkVerified) qParams.set('quicklink', 'verified');
      if (forceRefresh) qParams.set('refresh', 'true');

      const url = `/api/payables/${token}${qParams.toString() ? `?${qParams.toString()}` : ''}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load payables statement');
      setData(json);
      if (forceRefresh) {
        toast.success(lang === 'es' ? 'Sincronizado con Zoho Books' : 'Synced with Zoho Books');
      }
    } catch (err) {
      console.error('Error fetching statement:', err);
      setError(err.message);
      if (forceRefresh) {
        toast.error(lang === 'es' ? 'Error al sincronizar con Zoho Books' : 'Sync with Zoho Books failed');
      }
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (authUser?.email && !activeEmail) {
      setActiveEmail(authUser.email);
      fetchStatement(authUser.email);
    } else {
      fetchStatement();
    }
  }, [token, authUser?.email]);

  const statement = data?.statement || {};
  const kpis = data?.kpis || {};
  const openBills = data?.openBills || [];
  const paidBills = data?.paidBills || [];
  const isLocked = Boolean(data?.isLocked);

  // Handle email unlock attempt
  const handleUnlockSubmit = async (e) => {
    e.preventDefault();
    if (!unlockEmail.trim()) {
      toast.error(lang === 'es' ? 'Por favor introduce tu email registrado' : 'Please enter your registered partner email');
      return;
    }
    setIsUnlocking(true);
    try {
      const cleaned = unlockEmail.trim().toLowerCase();
      setActiveEmail(cleaned);
      await fetchStatement(cleaned);
      toast.success(lang === 'es' ? 'Identidad validada con éxito' : 'Identity verified successfully');
    } catch (err) {
      toast.error(lang === 'es' ? 'No se pudo verificar el email' : 'Could not verify email');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleCopyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast.success(lang === 'es' ? 'Enlace del extracto copiado' : 'Statement link copied to clipboard');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleOpenWhatsApp = () => {
    const msg = `Hello Atlas Accounts Team, regarding the commercial settlement statement: ${typeof window !== 'undefined' ? window.location.href : ''}`;
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

  const columns = useMemo(() => [
    {
      key: 'billNumber',
      header: lang === 'es' ? 'N.º FACTURA' : 'BILL / INVOICE #',
      width: '20%',
      sortable: true,
      render: (bill) => {
        if (isLocked) {
          return (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#64748b' }}>
              <Lock size={12} color="#94a3b8" />
              <span>FAC-••••••••</span>
            </div>
          );
        }
        return (
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{bill.billNumber || bill.billId}</span>
              <CopyableId value={bill.billNumber || bill.billId} iconOnly={true} />
            </div>
            {bill.referenceNumber && bill.referenceNumber !== bill.billNumber && (
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                Ref: {bill.referenceNumber}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'date',
      header: lang === 'es' ? 'FECHA' : 'ISSUE DATE',
      width: '12%',
      sortable: true,
      render: (bill) => (
        <span style={{ color: '#334155' }}>{bill.date || '—'}</span>
      )
    },
    {
      key: 'dueDate',
      header: lang === 'es' ? 'VENCIMIENTO' : 'DUE DATE',
      width: '12%',
      sortable: true,
      render: (bill) => {
        const isPending = bill.status !== 'paid' && (Number(bill.balance || 0) > 0 || bill.status === 'locked');
        return (
          <span style={{ color: isPending ? '#b45309' : '#64748b', fontWeight: isPending ? 600 : 400 }}>
            {bill.dueDate || '—'}
          </span>
        );
      }
    },
    {
      key: 'description',
      header: lang === 'es' ? 'CONCEPTO / REF. ORIGEN' : 'DESCRIPTION / SOURCE REF',
      width: '22%',
      render: (bill) => (
        <div>
          <div style={{ color: '#0f172a', fontWeight: 600 }}>
            {isLocked ? (lang === 'es' ? 'Facturación Comercial Protegida' : 'Protected Commercial Billing') : (bill.billType || 'Settlement / Commission')}
          </div>
          {bill.sourceInvoiceNumber && (
            <div style={{ fontSize: '0.74rem', color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <span>{isLocked ? (lang === 'es' ? 'Factura cliente protegida' : 'Linked to protected client invoice') : `${lang === 'es' ? 'Sobre factura cliente:' : 'Linked to client invoice:'} ${bill.sourceInvoiceNumber}`}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'total',
      header: lang === 'es' ? 'TOTAL' : 'TOTAL',
      width: '11%',
      align: 'right',
      sortable: true,
      render: (bill) => {
        const totalNum = Number(bill.total || 0);
        if (isLocked) {
          return <span style={{ color: '#94a3b8' }}>•••• {bill.currency}</span>;
        }
        return (
          <span style={{ fontWeight: 600, color: '#0f172a' }}>
            {totalNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {bill.currency}
          </span>
        );
      }
    },
    {
      key: 'balance',
      header: lang === 'es' ? 'SALDO PENDIENTE' : 'BALANCE DUE',
      width: '11%',
      align: 'right',
      sortable: true,
      render: (bill) => {
        const isPending = bill.status !== 'paid' && (Number(bill.balance || 0) > 0 || bill.status === 'locked');
        const balanceNum = Number(bill.balance || 0);
        const totalNum = Number(bill.total || 0);

        if (isLocked) {
          return (
            <span style={{ fontWeight: 700, color: '#c2410c', backgroundColor: '#fff7ed', padding: '3px 8px', borderRadius: '4px', border: '1px solid #ffedd5', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={11} /> •••• {bill.currency}
            </span>
          );
        }
        if (isPending) {
          return (
            <span style={{ fontWeight: 800, color: '#c2410c', backgroundColor: '#fff7ed', padding: '3px 8px', borderRadius: '4px', border: '1px solid #ffedd5' }}>
              {(balanceNum > 0 ? balanceNum : totalNum).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {bill.currency}
            </span>
          );
        }
        return (
          <span style={{ fontWeight: 700, color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={13} /> {lang === 'es' ? 'Pagado' : 'Settled'}
          </span>
        );
      }
    },
    {
      key: 'status',
      header: lang === 'es' ? 'ESTADO' : 'STATUS',
      width: '12%',
      align: 'center',
      render: (bill) => {
        const st = String(bill.status || '').toLowerCase().trim();
        const isPaid = st === 'paid' || (Number(bill.balance || 0) === 0 && !isLocked);
        const isOverdue = st === 'overdue';

        if (isPaid) {
          return <StatusBadge status="approved" customLabel={lang === 'es' ? 'Pagado' : 'Settled'} />;
        }
        if (isOverdue) {
          return <StatusBadge status="error" customLabel={lang === 'es' ? 'Vencida' : 'Overdue'} />;
        }
        return <StatusBadge status="pending" customLabel={lang === 'es' ? 'Pendiente' : 'Pending'} />;
      }
    }
  ], [lang, isLocked]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #cbd5e1', borderTopColor: '#003666', animation: 'spin 0.8s linear infinite', marginBottom: '1rem' }} />
        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
          {lang === 'es' ? 'Cargando extracto de facturación...' : 'Loading billing statement...'}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
          {lang === 'es' ? 'Sincronización automática en segundo plano con Zoho Books' : 'Automated background synchronization with Zoho Books'}
        </div>
        <style jsx>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <AlertCircle size={44} color="#dc2626" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
          {lang === 'es' ? 'Extracto no disponible o enlace expirado' : 'Statement unavailable or link expired'}
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: '420px', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          {error || (lang === 'es' ? 'No se ha encontrado el extracto solicitado. Contacte con administración.' : 'The requested statement was not found. Please contact administration.')}
        </p>
        <button
          onClick={() => fetchStatement()}
          style={{ padding: '8px 18px', backgroundColor: '#003666', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
        >
          {lang === 'es' ? 'Reintentar' : 'Retry'}
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Language Switcher Pill */}
          <div style={{ display: 'inline-flex', background: 'rgba(255, 255, 255, 0.12)', borderRadius: '6px', padding: '2px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <button
              type="button"
              onClick={() => setLang('en')}
              style={{
                border: 'none',
                background: lang === 'en' ? '#0284c7' : 'transparent',
                color: lang === 'en' ? '#ffffff' : '#cbd5e1',
                fontWeight: lang === 'en' ? 800 : 500,
                fontSize: '0.72rem',
                padding: '3px 8px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('es')}
              style={{
                border: 'none',
                background: lang === 'es' ? '#0284c7' : 'transparent',
                color: lang === 'es' ? '#ffffff' : '#cbd5e1',
                fontWeight: lang === 'es' ? 800 : 500,
                fontSize: '0.72rem',
                padding: '3px 8px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ES
            </button>
          </div>

          {/* Security Status Badge */}
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '3px 9px',
            borderRadius: '4px',
            backgroundColor: isLocked ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
            color: isLocked ? '#fca5a5' : '#86efac',
            border: `1px solid ${isLocked ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {isLocked ? <Lock size={11} /> : <ShieldCheck size={11} />}
            <span>{isLocked ? (lang === 'es' ? 'Acceso Protegido' : 'Protected Access') : (lang === 'es' ? 'Identidad Verificada' : 'Identity Verified')}</span>
          </span>

          <button
            onClick={handleCopyShareLink}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 11px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.12)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
          >
            {copiedLink ? <Check size={13} color="#4ade80" /> : <Share2 size={13} />}
            <span>{copiedLink ? (lang === 'es' ? 'Copiado' : 'Copied') : (lang === 'es' ? 'Compartir' : 'Share')}</span>
          </button>

          {/* Google Cloud Console UX Standard User Badge & Quick Logout */}
          <GcpUserBadge
            variant="dark"
            lang={lang}
            onLogout={() => {
              setActiveEmail('');
              setStatement(null);
              setIsLocked(true);
            }}
          />
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Title & Metadata Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#0369a1', backgroundColor: '#e0f2fe', padding: '2px 8px', borderRadius: '4px' }}>
                Vendor Account · {statement.vendorNumber}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span>{lang === 'es' ? 'Última sincronización automática:' : 'Last automated sync:'} {new Date(kpis.lastAutomatedSync || Date.now()).toLocaleTimeString()} · Real-time Zoho Books</span>
                <button
                  type="button"
                  onClick={() => fetchStatement(undefined, true)}
                  disabled={isSyncing}
                  style={{
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    borderRadius: '4px',
                    padding: '1px 6px',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    color: '#0284c7',
                    cursor: isSyncing ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                  title={lang === 'es' ? 'Sincronizar ahora con Zoho Books' : 'Sync now with Zoho Books'}
                >
                  <Clock size={10} />
                  <span>{isSyncing ? (lang === 'es' ? 'Sincronizando...' : 'Syncing...') : (lang === 'es' ? 'Sincronizar' : 'Sync')}</span>
                </button>
              </span>
            </div>

            {/* Company Name (Locked or Unlocked) */}
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isLocked ? (
                <>
                  <Lock size={20} color="#c2410c" />
                  <span style={{ color: '#475569' }}>
                    {lang === 'es' ? 'Empresa Comercial Protegida' : 'Protected Commercial Partner'}
                  </span>
                </>
              ) : (
                statement.wholesalerName
              )}
            </h1>

            {/* Attention Contact (Locked or Unlocked) */}
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isLocked ? (
                <>
                  <Lock size={12} color="#94a3b8" />
                  <span>{lang === 'es' ? 'Atención: Contacto Confidencial (••••••••••) · Dubai, UAE' : 'Attention: Confidential Contact (••••••••••) · Dubai, UAE'}</span>
                </>
              ) : (
                <span>Attention: <strong>{statement.contactName}</strong> {statement.phone ? `(${statement.phone})` : ''} · Dubai, UAE</span>
              )}
            </div>
          </div>
        </div>

        {/* ── 4 CLEAN OPERATIONAL KPIS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {/* KPI 1: Total Outstanding Balance (Locked or Unlocked) */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '1.25rem 1.4rem', border: '1.5px solid #fed7aa', boxShadow: '0 2px 8px rgba(234, 88, 12, 0.05)' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={13} /> {lang === 'es' ? 'Saldo Total Pendiente' : 'Total Outstanding Balance'}
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#9a3412', marginTop: '0.4rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isLocked ? (
                <>
                  <Lock size={22} color="#c2410c" />
                  <span style={{ letterSpacing: '0.15em', fontSize: '1.6rem' }}>••••••</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{kpis.currency}</span>
                </>
              ) : (
                <>
                  {(kpis.totalPendingAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{kpis.currency}</span>
                </>
              )}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '0.35rem', fontWeight: 500 }}>
              {isLocked ? (lang === 'es' ? 'Requiere validación de partner para visualizar' : 'Partner authentication required to view') : (lang === 'es' ? 'Saldo neto pendiente de liquidación' : 'Current payable balance pending settlement')}
            </div>
          </div>

          {/* KPI 2: Open Invoices (Server-computed) */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '1.25rem 1.4rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={13} /> {lang === 'es' ? 'Facturas Pendientes' : 'Open Invoices'}
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', marginTop: '0.4rem', letterSpacing: '-0.02em' }}>
              {kpis.openBillsCount ?? 0} <span style={{ fontSize: '1rem', fontWeight: 500, color: '#64748b' }}>{lang === 'es' ? 'facturas abiertas' : 'open invoices'}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: (kpis.openBillsCount === 0) ? '#16a34a' : '#64748b', marginTop: '0.35rem', fontWeight: (kpis.openBillsCount === 0) ? 600 : 400 }}>
              {kpis.openBillsCount === 0
                ? (lang === 'es' ? 'Todas las facturas aprobadas están liquidadas' : 'All approved bills settled · Current')
                : (lang === 'es' ? 'En proceso de liquidación contable' : 'Under accounting audit & settlement')}
            </div>
          </div>

          {/* KPI 3: Maturity / Due Status (Server-computed) */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '1.25rem 1.4rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={13} /> {lang === 'es' ? 'Estado de Vencimiento' : 'Account Maturity'}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.4rem', letterSpacing: '-0.01em' }}>
              {kpis.openBillsCount === 0 ? (lang === 'es' ? 'Al día' : 'Current') : (kpis.nextDueDate || 'Current')}
            </div>
            <div style={{ fontSize: '0.75rem', color: (kpis.overdueBillsCount || 0) > 0 ? '#dc2626' : '#16a34a', marginTop: '0.35rem', fontWeight: 600 }}>
              {(kpis.overdueBillsCount || 0) > 0
                ? `${kpis.overdueBillsCount} ${lang === 'es' ? 'facturas vencidas' : 'overdue bills'}`
                : (lang === 'es' ? '0 facturas vencidas · Conciliación al día' : '0 overdue bills · Standard settlement')}
            </div>
          </div>

          {/* KPI 4: Payment Terms (Server-computed Financial Terminology) */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '1.25rem 1.4rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={13} /> {lang === 'es' ? 'Condición Financiera' : 'Payment Terms'}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginTop: '0.55rem', lineHeight: 1.3 }}>
              {kpis.paymentTerms || 'Net 10th Prox. (Post-Settlement)'}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '0.35rem', lineHeight: 1.35 }}>
              {lang === 'es'
                ? 'Día 10 del mes siguiente tras cobro al cliente (Paid-When-Paid)'
                : (kpis.paymentTermsDetail || 'Payable by 10th prox. post client collection')}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.35rem' }}>
              Vendor Number: <strong>{statement.vendorNumber}</strong> · Commercial PWP
            </div>
          </div>
        </div>

        {/* ── ZERO-TRUST UNLOCK CARD (Visible when Locked) ── */}
        {isLocked && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '2px dashed #fdba74',
            padding: '2rem',
            textAlign: 'center',
            marginBottom: '2rem',
            boxShadow: '0 4px 20px rgba(194, 65, 12, 0.06)'
          }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', border: '1px solid #fed7aa' }}>
              <Lock size={24} color="#c2410c" />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              {lang === 'es' ? 'Extracto Confidencial Protegido' : 'Confidential Financial Statement Protected'}
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: '580px', margin: '0 auto 1.25rem auto', lineHeight: 1.5 }}>
              {lang === 'es'
                ? 'Los importes, números de factura y datos de contacto están protegidos para garantizar la confidencialidad B2B. Introduce el correo registrado del proveedor o inicia sesión arriba para desbloquearlo.'
                : 'Invoice numbers, line amounts, and partner contact details are shielded to protect commercial B2B confidentiality. Enter the partner registered email below or sign in above to unlock.'}
            </p>

            <form onSubmit={handleUnlockSubmit} style={{ display: 'inline-flex', gap: '8px', maxWidth: '460px', width: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
              <input
                type="email"
                placeholder={lang === 'es' ? 'Introduce tu email registrado' : 'Enter registered partner email'}
                value={unlockEmail}
                onChange={(e) => setUnlockEmail(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '240px',
                  padding: '9px 14px',
                  borderRadius: '6px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={isUnlocking}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  backgroundColor: '#c2410c',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: isUnlocking ? 'not-allowed' : 'pointer'
                }}
              >
                <Unlock size={14} />
                <span>{isUnlocking ? (lang === 'es' ? 'Validando...' : 'Verifying...') : (lang === 'es' ? 'Desbloquear Extracto' : 'Unlock Statement')}</span>
              </button>
            </form>
            <div style={{ marginTop: '0.85rem', fontSize: '0.78rem', color: '#94a3b8' }}>
              {lang === 'es' ? (
                <>¿Ya tienes cuenta autorizada? <Link href={`/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '')}`} style={{ color: '#0284c7', fontWeight: 600, textDecoration: 'underline' }}>Inicia sesión aquí</Link></>
              ) : (
                <>Already have an authorized account? <Link href={`/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '')}`} style={{ color: '#0284c7', fontWeight: 600, textDecoration: 'underline' }}>Sign in here</Link></>
              )}
            </div>
          </div>
        )}

        {/* ── PRIORITY SEARCH BAR (Google Cloud Standard - Golden Rule #7) ── */}
        <div style={{ marginBottom: '1rem' }}>
          <GlobalSearchBar
            value={searchFilter}
            onChange={setSearchFilter}
            placeholder={lang === 'es' ? 'Buscar por n.º de factura, concepto o referencia...' : 'Search by bill number, description, or reference...'}
            resultCount={filteredBills.length}
            namespace="b2b-payables"
            size="md"
          />
        </div>

        {/* ── TABS BAR (Google Cloud Segmented Control) ── */}
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #e2e8f0', marginBottom: '1.25rem', gap: '0.5rem' }}>
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
            <span>{lang === 'es' ? 'Facturas Pendientes de Pago' : 'Pending Invoices & Bills'}</span>
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
            <span>{lang === 'es' ? 'Historial de Facturas Pagadas' : 'Settled & Paid Invoices History'}</span>
            <span style={{ backgroundColor: activeTab === 'paid' ? '#e0f2fe' : '#f1f5f9', color: activeTab === 'paid' ? '#0369a1' : '#64748b', fontSize: '0.72rem', fontWeight: 800, padding: '2px 7px', borderRadius: '10px' }}>
              {paidBills.length}
            </span>
          </button>
        </div>

        {/* ── BILLS TABLE (DataTable GCP Standard - Golden Rule #3, #23, #30) ── */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <DataTable
            columns={columns}
            data={filteredBills}
            keyField="id"
            mobileView="cards"
            mobileCardComponent={(cardProps) => <PayableBillMobileCard {...cardProps} isLocked={isLocked} lang={lang} />}
            pagination={false}
            hidePagination={true}
            emptyTitle={activeTab === 'pending' ? (lang === 'es' ? 'No hay facturas pendientes' : 'No pending invoices found') : (lang === 'es' ? 'No se encontraron facturas pagadas' : 'No settled invoices found matching criteria')}
            emptyDescription={activeTab === 'pending' ? (lang === 'es' ? 'Todas las facturas están liquidadas y al día en Zoho Books.' : 'All vendor invoices are fully settled and current in Zoho Books.') : (lang === 'es' ? 'Prueba a ajustar los criterios de búsqueda.' : 'Try adjusting your search criteria.')}
          />
        </div>

        {/* ── FOOTER NOTE (100% Atlas Health Services — NO MEDILUXE) ── */}
        <div style={{ marginTop: '2rem', padding: '1.25rem 1.5rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', fontSize: '0.78rem', color: '#64748b' }}>
          <div>
            <strong>Atlas Health Services</strong> (Dubai, United Arab Emirates).
            <div style={{ marginTop: '0.2rem' }}>
              {lang === 'es'
                ? 'Este extracto es un documento comercial oficial sincronizado en tiempo real con el libro de cuentas por pagar de Zoho Books.'
                : 'This statement is an official commercial record synchronized in real-time with Zoho Books accounts payable.'}
            </div>
          </div>
          <button
            onClick={handleOpenWhatsApp}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 14px', backgroundColor: '#003666', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
          >
            <MessageCircle size={14} /> {lang === 'es' ? 'Contactar Departamento Financiero' : 'Contact Accounts Department'}
          </button>
        </div>
      </main>

      <PublicUnifiedFooter />
    </div>
  );
}

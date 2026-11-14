"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  ChevronDown,
  HelpCircle,
  CreditCard,
  Calendar,
  Download,
  Activity,
  Package
} from '@/lib/icons';
import BrandLogo from '@/components/common/BrandLogo';
import CopyableId from '@/components/ui/CopyableId';
import DataTable from '@/components/ui/DataTable';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import StatusBadge from '@/components/ui/StatusBadge';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import GcpUserBadge from '@/components/shared/GcpUserBadge';
import toast from 'react-hot-toast';

import PayableBillMobileCard from '@/components/b2b/payables/PayableBillMobileCard';
import BillExpandableDetail from '@/components/b2b/payables/BillExpandableDetail';
import PayablesMonthlyEvolutionChart from '@/components/b2b/payables/PayablesMonthlyEvolutionChart';
import { formatDateDisplay, formatCycleStart } from '@/components/b2b/payables/payablesFormat';

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

  const ADMIN_EMAILS = [
    'jlzabala@gmail.com',
    'jose@mediluxem.com',
    'jose@mediluxeme.com',
    'admin@regenpept.test',
    'clinical@atlashealth-services.com'
  ];

  // Authentication & Zero-Trust Unlock State
  const authContext = useAuth?.() || {};
  const authUser = authContext.user;
  const isMasterAdmin = Boolean(
    authContext.isAdmin ||
    authContext.activeRole === 'admin' ||
    (authUser?.email && (
      ADMIN_EMAILS.includes(authUser.email.toLowerCase()) ||
      authUser.email.toLowerCase().includes('admin')
    ))
  );
  const logout = authContext.logout;
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [unlockEmail, setUnlockEmail] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [otpStage, setOtpStage] = useState('email'); // 'email' | 'code'
  const [otpCode, setOtpCode] = useState('');
  const [activeEmail, setActiveEmail] = useState(() => {
    return searchParams?.get('email') || '';
  });

  const isQuicklinkVerified = searchParams?.get('quicklink') === 'verified';

  const [isSyncing, setIsSyncing] = useState(false);
  const [isWhatsAppDropdownOpen, setIsWhatsAppDropdownOpen] = useState(false);
  const whatsappDropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (whatsappDropdownRef.current && !whatsappDropdownRef.current.contains(e.target)) {
        setIsWhatsAppDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
    const userEmail = authUser?.email?.toLowerCase() || '';
    if (userEmail) {
      setActiveEmail(userEmail);
      fetchStatement(userEmail);
    } else {
      fetchStatement();
    }
  }, [token, authUser?.email]);

  const statement = data?.statement || {};
  const kpis = data?.kpis || {};
  const openBills = data?.openBills || [];
  const paidBills = data?.paidBills || [];
  const isLocked = Boolean(data?.isLocked) && !isMasterAdmin;

  const totalPendingAmount = useMemo(() => {
    if (kpis?.totalPendingAmount !== null && kpis?.totalPendingAmount !== undefined) {
      return Number(kpis.totalPendingAmount);
    }
    return openBills.reduce((acc, b) => acc + (Number(b.balance) > 0 ? Number(b.balance) : Number(b.total || 0)), 0);
  }, [kpis?.totalPendingAmount, openBills]);

  // Two-step unlock: 1) request one-time code by email, 2) verify code (sets secure session cookie)
  const handleUnlockSubmit = async (e) => {
    e.preventDefault();
    const cleaned = unlockEmail.trim().toLowerCase();
    if (!cleaned) {
      toast.error(lang === 'es' ? 'Por favor introduce tu email registrado' : 'Please enter your registered partner email');
      return;
    }
    setIsUnlocking(true);
    try {
      if (otpStage === 'email') {
        const res = await fetch(`/api/payables/${token}/otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleaned })
        });
        if (res.status === 503) {
          // OTP not configured on the server: legacy email validation
          setActiveEmail(cleaned);
          await fetchStatement(cleaned);
          return;
        }
        setOtpStage('code');
        toast.success(lang === 'es' ? 'Si el email está autorizado, hemos enviado un código' : 'If the email is authorized, we sent a code');
      } else {
        const res = await fetch(`/api/payables/${token}/otp/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleaned, code: otpCode.trim() })
        });
        if (!res.ok) {
          toast.error(lang === 'es' ? 'Código inválido o caducado' : 'Invalid or expired code');
          return;
        }
        setActiveEmail(cleaned);
        setOtpCode('');
        setOtpStage('email');
        await fetchStatement(cleaned);
        toast.success(lang === 'es' ? 'Identidad validada con éxito' : 'Identity verified successfully');
      }
    } catch (err) {
      toast.error(lang === 'es' ? 'No se pudo verificar el email' : 'Could not verify email');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleCopyShareLink = () => {
    if (typeof window !== 'undefined') {
      // Security: Strip any sensitive query parameters (e.g. ?email=...) when copying share link
      const cleanUrl = `${window.location.origin}/b2b/payables/${token}`;
      navigator.clipboard.writeText(cleanUrl);
      setCopiedLink(true);
      toast.success(lang === 'es' ? 'Enlace protegido copiado' : 'Protected statement link copied');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleOpenWhatsAppAction = (actionType = 'inquiry') => {
    setIsWhatsAppDropdownOpen(false);

    if (isLocked) {
      toast.error(
        lang === 'es'
          ? 'Introduce tu email o inicia sesión para verificar tu identidad antes de contactar'
          : 'Please verify your registered partner email or sign in to enable accounting options'
      );
      const unlockEl = document.getElementById('unlock-drawer-box') || document.querySelector('input[type="email"]');
      if (unlockEl) {
        unlockEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const inputEl = unlockEl.querySelector?.('input') || unlockEl;
        inputEl?.focus?.();
      }
      return;
    }

    const cleanUrl = typeof window !== 'undefined' ? `${window.location.origin}/b2b/payables/${token}` : '';
    const company = statement.wholesalerName || (lang === 'es' ? 'Empresa Colaboradora' : 'Commercial Partner');
    const vendorCode = statement.vendorNumber ? ` (${lang === 'es' ? 'Cta.' : 'Vendor'} ${statement.vendorNumber})` : '';
    const contact = statement.contactName ? ` - ${statement.contactName}` : '';

    let msg;
    if (actionType === 'settlement_payment') {
      const pendingTotalFormatted = totalPendingAmount > 0
        ? `${totalPendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${statement.currency || 'AED'}`
        : `${openBills.length} ${lang === 'es' ? 'facturas pendientes' : 'pending bills'}`;

      const billNumbers = openBills.map(b => b.billNumber || b.billId).filter(Boolean).slice(0, 3).join(', ');
      const billsRef = billNumbers ? ` (${lang === 'es' ? 'Facturas' : 'Bills'}: ${billNumbers})` : '';

      msg = lang === 'es'
        ? `Hola Departamento de Contabilidad de Atlas, les contacto en nombre de ${company}${vendorCode}${contact}. Deseamos solicitar la liberación y pago de nuestro saldo pendiente aprobado por valor de ${pendingTotalFormatted}${billsRef}. Por favor confirmen las instrucciones de transferencia bancaria y fecha de liquidación. Extracto oficial: ${cleanUrl}`
        : `Hello Atlas Accounts Department, I am contacting you on behalf of ${company}${vendorCode}${contact}. We would like to request the settlement and payment release of our approved outstanding balance of ${pendingTotalFormatted}${billsRef}. Please confirm wire transfer instructions and settlement schedule. Official statement: ${cleanUrl}`;
    } else {
      msg = lang === 'es'
        ? `Hola Departamento de Contabilidad de Atlas, les contacto en nombre de ${company}${vendorCode}${contact}. Tengo una consulta sobre nuestro extracto oficial de liquidación comercial: ${cleanUrl}`
        : `Hello Atlas Accounts Department, I am contacting you on behalf of ${company}${vendorCode}${contact}. I have an inquiry regarding our official commercial settlement statement: ${cleanUrl}`;
    }

    // Number embedded in code only: +971 52 129 0471 (not shown in visible UI text)
    window.open(`https://wa.me/971521290471?text=${encodeURIComponent(msg)}`, '_blank');
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
      render: (val, bill) => {
        const row = bill || {};
        if (isLocked) {
          return (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#64748b' }}>
              <Lock size={12} color="#94a3b8" />
              <span>FAC-••••••••</span>
            </div>
          );
        }
        const billNum = row.billNumber || row.billId || val || '—';
        return (
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{billNum}</span>
              <CopyableId value={billNum} iconOnly={true} />
            </div>
            {row.referenceNumber && row.referenceNumber !== billNum && (
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                Ref: {row.referenceNumber}
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
      render: (val, bill) => {
        const row = bill || {};
        return (
          <span style={{ color: '#334155' }}>{formatDateDisplay(val || row.date, lang)}</span>
        );
      }
    },
    {
      key: 'dueDate',
      header: lang === 'es' ? 'VENCIMIENTO' : 'DUE DATE',
      width: '12%',
      sortable: true,
      render: (val, bill) => {
        const row = bill || {};
        const isPending = row.status !== 'paid' && (Number(row.balance || 0) > 0 || row.status === 'locked' || row.status === 'overdue');
        return (
          <span style={{ color: isPending ? '#b45309' : '#64748b', fontWeight: isPending ? 600 : 400 }}>
            {formatDateDisplay(val || row.dueDate, lang)}
          </span>
        );
      }
    },
    {
      key: 'description',
      header: lang === 'es' ? 'CONCEPTO / REF. ORIGEN' : 'DESCRIPTION / SOURCE REF',
      width: '22%',
      render: (val, bill) => {
        const row = bill || {};
        return (
          <div>
            <div style={{ color: '#0f172a', fontWeight: 600 }}>
              {isLocked ? (lang === 'es' ? 'Facturación Comercial Protegida' : 'Protected Commercial Billing') : (row.billType || 'Settlement / Commission')}
            </div>
            {row.sourceInvoiceNumber && (
              <div style={{ fontSize: '0.74rem', color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <span>{isLocked ? (lang === 'es' ? 'Factura cliente protegida' : 'Linked to protected client invoice') : `${lang === 'es' ? 'Sobre factura cliente:' : 'Linked to client invoice:'} ${row.sourceInvoiceNumber}`}</span>
              </div>
            )}
            {row.adminDescription && (
              <div
                style={{
                  fontSize: '0.72rem',
                  color: isLocked ? '#64748b' : '#475569',
                  marginTop: '3px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '260px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title={isLocked ? (lang === 'es' ? 'Nota administrativa confidencial registrada' : 'Confidential administrative note recorded') : row.adminDescription}
              >
                {isLocked ? (
                  <>
                    <Lock size={10} color="#003666" />
                    <span>{lang === 'es' ? 'Nota admin (protegida)' : 'Admin note (protected)'}</span>
                  </>
                ) : (
                  <>📝 {row.adminDescription}</>
                )}
              </div>
            )}
            {/* ── GOOGLE CLOUD UX METADATA CHIPS (Clean, Monochromatic SVG, High Density) ── */}
            {((Array.isArray(row.associatedProducts) && row.associatedProducts.length > 0) || (Array.isArray(row.associatedSuppliers) && row.associatedSuppliers.length > 0)) && (
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                {Array.isArray(row.associatedProducts) && row.associatedProducts.slice(0, 1).map((p, idx) => (
                  <span
                    key={p.id || idx}
                    style={{
                      height: '20px',
                      fontSize: '0.68rem',
                      lineHeight: '18px',
                      backgroundColor: isLocked ? '#f1f3f4' : '#e8f0fe',
                      color: isLocked ? '#3c4043' : '#1a73e8',
                      border: `1px solid ${isLocked ? '#dadce0' : '#d2e3fc'}`,
                      borderRadius: '4px',
                      padding: '0 6px',
                      fontWeight: 500,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      maxWidth: '190px',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis'
                    }}
                    title={p.name}
                  >
                    {isLocked ? <Lock size={9} color="#5f6368" /> : <Package size={10} color="#1a73e8" />}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                  </span>
                ))}
                {Array.isArray(row.associatedProducts) && row.associatedProducts.length > 1 && (
                  <span
                    style={{
                      height: '20px',
                      fontSize: '0.65rem',
                      lineHeight: '18px',
                      backgroundColor: '#f1f3f4',
                      color: '#5f6368',
                      border: '1px solid #dadce0',
                      borderRadius: '4px',
                      padding: '0 5px',
                      fontWeight: 600
                    }}
                    title={row.associatedProducts.slice(1).map(p => p.name).join(', ')}
                  >
                    +{row.associatedProducts.length - 1}
                  </span>
                )}

                {Array.isArray(row.associatedSuppliers) && row.associatedSuppliers.slice(0, 1).map((s, idx) => (
                  <span
                    key={s.id || idx}
                    style={{
                      height: '20px',
                      fontSize: '0.68rem',
                      lineHeight: '18px',
                      backgroundColor: '#f8fafc',
                      color: '#475569',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      padding: '0 6px',
                      fontWeight: 500,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      maxWidth: '170px',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis'
                    }}
                    title={s.name}
                  >
                    {isLocked ? <Lock size={9} color="#64748b" /> : <Building2 size={10} color="#475569" />}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</span>
                  </span>
                ))}
                {Array.isArray(row.associatedSuppliers) && row.associatedSuppliers.length > 1 && (
                  <span
                    style={{
                      height: '20px',
                      fontSize: '0.65rem',
                      lineHeight: '18px',
                      backgroundColor: '#f1f3f4',
                      color: '#5f6368',
                      border: '1px solid #dadce0',
                      borderRadius: '4px',
                      padding: '0 5px',
                      fontWeight: 600
                    }}
                    title={row.associatedSuppliers.slice(1).map(s => s.name).join(', ')}
                  >
                    +{row.associatedSuppliers.length - 1}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'total',
      header: lang === 'es' ? 'TOTAL' : 'TOTAL',
      width: '11%',
      align: 'right',
      sortable: true,
      render: (val, bill) => {
        const row = bill || {};
        const totalNum = Number(row.total !== undefined ? row.total : (val !== undefined ? val : 0));
        if (isLocked) {
          return <span style={{ color: '#94a3b8' }}>•••• {row.currency || 'AED'}</span>;
        }
        return (
          <span style={{ fontWeight: 600, color: '#0f172a' }}>
            {totalNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {row.currency || 'AED'}
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
      render: (val, bill) => {
        const row = bill || {};
        const isPending = row.status !== 'paid' && (Number(row.balance || 0) > 0 || row.status === 'locked' || row.status === 'overdue');
        const balanceNum = Number(row.balance !== undefined ? row.balance : (val !== undefined ? val : 0));
        const totalNum = Number(row.total || 0);

        if (isLocked) {
          return (
            <span style={{ fontWeight: 700, color: '#c2410c', backgroundColor: '#fff7ed', padding: '3px 8px', borderRadius: '4px', border: '1px solid #ffedd5', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={11} /> •••• {row.currency || 'AED'}
            </span>
          );
        }
        if (isPending) {
          return (
            <span style={{ fontWeight: 800, color: '#c2410c', backgroundColor: '#fff7ed', padding: '3px 8px', borderRadius: '4px', border: '1px solid #ffedd5' }}>
              {(balanceNum > 0 ? balanceNum : totalNum).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {row.currency || 'AED'}
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
      render: (val, bill) => {
        const row = bill || {};
        const st = String(row.status || val || '').toLowerCase().trim();
        const isPaid = st === 'paid' || (Number(row.balance || 0) === 0 && !isLocked);
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
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
          <AlertCircle size={26} color="#dc2626" />
        </div>
        <h2 style={{ fontSize: '1.20rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
          {lang === 'es' ? 'Extracto de Liquidación No Disponible' : 'Statement Not Configured or Unavailable'}
        </h2>
        <p style={{ fontSize: '0.86rem', color: '#64748b', maxWidth: '460px', marginTop: '0.25rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          {lang === 'es'
            ? 'Esta cuenta no tiene configurado un extracto de facturas de proveedor activo. Los enlaces de liquidación B2B se emiten exclusivamente para proveedores autorizados.'
            : 'No active vendor payables statement is configured for this account. B2B settlement links are issued exclusively to authorized suppliers and billing partners.'}
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link
            href="/catalog"
            style={{
              padding: '8px 18px',
              backgroundColor: '#003666',
              color: '#ffffff',
              borderRadius: '6px',
              fontSize: '0.84rem',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            {lang === 'es' ? 'Volver al Catálogo' : 'Go to Catalog'}
          </Link>
          <a
            href="mailto:orders@atlas-solutions.com"
            style={{
              padding: '8px 18px',
              backgroundColor: '#ffffff',
              color: '#475569',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '0.84rem',
              fontWeight: 500,
              textDecoration: 'none'
            }}
          >
            {lang === 'es' ? 'Contactar Soporte' : 'Contact Support'}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* ── TOP INSTITUTIONAL BAR (Google Cloud Header Style — Sticky) ── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#002244',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.30)',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        width: '100%'
      }}>
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
            backgroundColor: isMasterAdmin ? 'rgba(2, 132, 199, 0.15)' : (isLocked ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)'),
            color: isMasterAdmin ? '#38bdf8' : (isLocked ? '#fca5a5' : '#86efac'),
            border: `1px solid ${isMasterAdmin ? 'rgba(56, 189, 248, 0.35)' : (isLocked ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)')}`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {isMasterAdmin ? <ShieldCheck size={11} color="#38bdf8" /> : (isLocked ? <Lock size={11} /> : <ShieldCheck size={11} />)}
            <span>
              {isMasterAdmin
                ? (lang === 'es' ? 'Vista Administrador Maestro' : 'Master Admin View')
                : (isLocked ? (lang === 'es' ? 'Acceso Protegido' : 'Protected Access') : (lang === 'es' ? 'Identidad Verificada' : 'Identity Verified'))}
            </span>
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
              setData(null);
              setOtpStage('email');
              setOtpCode('');
              fetchStatement('');
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
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {isLocked ? (
                <>
                  <Lock size={20} color="#c2410c" />
                  <span style={{ color: '#475569' }}>
                    {lang === 'es' ? 'Empresa Comercial Protegida' : 'Protected Commercial Partner'}
                  </span>
                </>
              ) : (
                <>
                  <span>{statement.wholesalerName}</span>
                  {isMasterAdmin && (
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#0284c7',
                      backgroundColor: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <ShieldCheck size={11} color="#0284c7" />
                      <span>{lang === 'es' ? 'Acceso Total Administrador' : 'Full Admin Access'}</span>
                    </span>
                  )}
                </>
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

        {/* ── MONTHLY EVOLUTION TIMELINE & PROCUREMENT CHART (Zoho Books 17-Month History) ── */}
        {!isLocked && (
          <PayablesMonthlyEvolutionChart
            cycleStartDate={kpis.cycleStartDate}
            monthlyEvolution={data?.monthlyEvolution || []}
            currency={statement.currency || 'AED'}
            lang={lang}
          />
        )}

        {/* ── ZERO-TRUST UNLOCK CARD (Visible when Locked) ── */}
        {isLocked && (
          <div
            id="unlock-drawer-box"
            style={{
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
              {otpStage === 'code' && (
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder={lang === 'es' ? 'Código de 6 dígitos' : '6-digit code'}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  style={{
                    flex: 1,
                    minWidth: '240px',
                    padding: '9px 14px',
                    borderRadius: '6px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.85rem',
                    letterSpacing: '4px',
                    outline: 'none'
                  }}
                />
              )}
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
                <span>{isUnlocking ? (lang === 'es' ? 'Validando...' : 'Verifying...') : (otpStage === 'code' ? (lang === 'es' ? 'Verificar código' : 'Verify code') : (lang === 'es' ? 'Enviar código por email' : 'Email me a code'))}</span>
              </button>
            </form>
            <div style={{ marginTop: '0.85rem', fontSize: '0.78rem', color: '#94a3b8' }}>
              {authUser ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span>
                    {lang === 'es' ? 'Sesión actual:' : 'Current session:'}{' '}
                    <strong style={{ color: '#0f172a' }}>{authUser.email}</strong>
                  </span>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={async () => {
                      if (authContext.logout) await authContext.logout();
                      window.location.href = `/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '')}&switch=true`;
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: '#0284c7',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    {lang === 'es' ? 'Cambiar de cuenta / Iniciar con otro usuario' : 'Switch account / Sign in as different user'}
                  </button>
                </div>
              ) : (
                <>
                  {lang === 'es' ? (
                    <>¿Ya tienes cuenta autorizada? <Link href={`/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '')}&switch=true`} style={{ color: '#0284c7', fontWeight: 600, textDecoration: 'underline' }}>Inicia sesión aquí</Link></>
                  ) : (
                    <>Already have an authorized account? <Link href={`/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '')}&switch=true`} style={{ color: '#0284c7', fontWeight: 600, textDecoration: 'underline' }}>Sign in here</Link></>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── PRIORITY SEARCH BAR (Google Cloud Standard - Golden Rule #7) ── */}
        <div style={{ marginBottom: '0.75rem' }}>
          <GlobalSearchBar
            value={searchFilter}
            onChange={setSearchFilter}
            placeholder={lang === 'es' ? 'Buscar por n.º de factura, concepto o referencia...' : 'Search by bill number, description, or reference...'}
            resultCount={filteredBills.length}
            namespace="b2b-payables"
            size="md"
          />
        </div>

        {/* ── ACTIVE BILLING CYCLE BADGE (Golden Rule #24 - Active & Temporal Filters) ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
              {lang === 'es' ? 'Filtro Temporal Activo:' : 'Active Filter:'}
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '16px',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: '#1d4ed8'
            }}>
              <Calendar size={12} color="#1d4ed8" />
              <span>{lang === 'es' ? `Período Activo: Desde ${formatCycleStart(kpis.cycleStartDate, lang)}` : `Billing Cycle: From ${formatCycleStart(kpis.cycleStartDate, lang)} onwards`}</span>
            </span>
            {kpis.totalHistoricalCount > 0 && (
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {lang === 'es'
                  ? `(Mostrando facturas emitidas a partir del 1 de noviembre de 2026 · ${kpis.totalHistoricalCount} registros históricos en Zoho Books)`
                  : `(Showing bills issued from November 1, 2026 onwards · ${kpis.totalHistoricalCount} historical records in Zoho Books)`}
              </span>
            )}
          </div>
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
            virtualize={false}
            expandableRender={(row) => (
              <BillExpandableDetail
                bill={row}
                token={token}
                isLocked={isLocked}
                lang={lang}
                activeEmail={activeEmail}
                isMasterAdmin={isMasterAdmin}
                paymentTerms={statement.paymentTerms}
                onBillUpdated={() => fetchStatement(activeEmail, false)}
              />
            )}
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
          {/* ── WhatsApp Financial Desk Dropdown / Actions ── */}
          {isLocked ? (
            <button
              type="button"
              onClick={() => handleOpenWhatsAppAction('inquiry')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 650,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title={lang === 'es' ? 'Identifícate con tu email para consultar al contable' : 'Verify your email to contact Accounts'}
            >
              <Lock size={13} color="#94a3b8" />
              <span>
                {lang === 'es' ? 'Identifícate para Opciones de Pago' : 'Sign In for Payment Options'}
              </span>
            </button>
          ) : (
            <div ref={whatsappDropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
              <button
                type="button"
                onClick={() => setIsWhatsAppDropdownOpen(prev => !prev)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#003666',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.80rem',
                  fontWeight: 650,
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                  transition: 'all 0.15s ease'
                }}
                title={lang === 'es' ? 'Opciones de gestión con el departamento contable' : 'Accounts Department Actions'}
              >
                <MessageCircle size={15} color="#38bdf8" />
                <span>{lang === 'es' ? 'Gestión WhatsApp con Contabilidad' : 'Accounts WhatsApp Actions'}</span>
                <ChevronDown size={14} style={{ transform: isWhatsAppDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
              </button>

              {isWhatsAppDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 8px)',
                  right: 0,
                  width: '320px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)',
                  zIndex: 50,
                  overflow: 'hidden',
                  padding: '6px 0'
                }}>
                  <div style={{ padding: '8px 14px 6px 14px', borderBottom: '1px solid #f1f5f9', fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {lang === 'es' ? 'Canal Oficial Departamento Contable' : 'Official Accounts Desk Channel'}
                  </div>

                  {/* Option 1: Accounting Clarifications */}
                  <button
                    type="button"
                    onClick={() => handleOpenWhatsAppAction('inquiry')}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '10px 14px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      <HelpCircle size={16} color="#0284c7" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                        {lang === 'es' ? 'Pedir Aclaraciones Contables' : 'Request Accounting Clarification'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', lineHeight: 1.3 }}>
                        {lang === 'es' ? 'Resolver dudas sobre conceptos, facturas o deducciones' : 'Ask questions regarding terms, invoices, or deductions'}
                      </div>
                    </div>
                  </button>

                  {/* Option 2: Request Settlement Payment */}
                  <button
                    type="button"
                    onClick={() => handleOpenWhatsAppAction('settlement_payment')}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '10px 14px',
                      border: 'none',
                      borderTop: '1px solid #f1f5f9',
                      backgroundColor: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff7ed'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      <CreditCard size={16} color="#c2410c" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                          {lang === 'es' ? 'Solicitar Pago del Saldo' : 'Request Balance Payment'}
                        </span>
                        {totalPendingAmount > 0 && (
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#c2410c', backgroundColor: '#ffedd5', padding: '1px 6px', borderRadius: '4px' }}>
                            {totalPendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {statement.currency || 'AED'}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', lineHeight: 1.3 }}>
                        {lang === 'es' ? 'Coordinar transferencia bancaria del importe pendiente' : 'Coordinate wire transfer release for approved balance'}
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <PublicUnifiedFooter />
    </div>
  );
}

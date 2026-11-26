'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import CopyableId from '@/components/ui/CopyableId';
import MobileConnectedStepper from '@/components/ui/MobileConnectedStepper';
import toast from 'react-hot-toast';
import {
  Building2,
  Package,
  TrendingUp,
  FileCheck,
  Printer,
  Share2,
  Check,
  ExternalLink,
  MessageCircle,
  ArrowRight,
  Clock,
  ShieldCheck,
  Sparkles,
  Edit2,
  Save,
} from '@/lib/icons';

const DOC_STATUS_OPTIONS = [
  { value: 'draft', en: 'Scheduled', es: 'Programado' },
  { value: 'pending', en: 'Pending', es: 'Pendiente' },
  { value: 'processing', en: 'In Progress', es: 'En trámite' },
  { value: 'completed', en: 'Completed', es: 'Completado' },
];

export default function SupplierOrderPortalClient({
  portal,
  slug,
  initialLang = 'en',
  isAdmin = false,
  shareToken = '',
}) {
  const [lang, setLang] = useState(initialLang === 'es' ? 'es' : 'en');
  const isEs = lang === 'es';
  const [copiedLink, setCopiedLink] = useState(false);

  const [activeOrder, setActiveOrder] = useState(portal?.activeOrder || {});
  const [checklist, setChecklist] = useState(portal?.activeOrder?.checklist || []);
  const [selectedStepIdx, setSelectedStepIdx] = useState(
    typeof portal?.activeOrder?.activeStageIndex === 'number'
      ? portal.activeOrder.activeStageIndex
      : 1
  );
  const [editingStepId, setEditingStepId] = useState(null);
  const [savingStep, setSavingStep] = useState(false);

  const orders = useMemo(() => portal?.orders || [], [portal]);

  const totals = useMemo(() => {
    const totalUnits = orders.reduce((acc, o) => acc + Number(o.quantity || 0), 0);
    const totalEur = orders.reduce((acc, o) => acc + Number(o.subtotalEur || 0), 0);
    const firstQty = Number(orders[0]?.quantity || 500);
    const lastQty = Number(orders[orders.length - 1]?.quantity || firstQty);
    const growthPct = firstQty > 0 ? Math.round(((lastQty - firstQty) / firstQty) * 100) : 0;
    return { totalUnits, totalEur, growthPct, count: orders.length };
  }, [orders]);

  const formatEur = (val) =>
    `€${Number(val || 0).toLocaleString(isEs ? 'es-ES' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const handleCopyPortalUrl = async () => {
    const base = `https://www.atlashealth-services.com/b2b/supplier/${encodeURIComponent(slug)}`;
    const qs = new URLSearchParams();
    if (shareToken) qs.set('token', shareToken);
    qs.set('lang', lang);
    const url = `${base}?${qs.toString()}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toast.success(isEs ? 'Enlace privado copiado ✓' : 'Private portal link copied ✓');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      toast.error(isEs ? 'No se pudo copiar' : 'Could not copy');
    }
  };

  const handleStepFieldChange = (stepId, field, value) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === stepId ? { ...item, [field]: value } : item))
    );
  };

  const handleSaveChecklist = async () => {
    setSavingStep(true);
    try {
      const nextActiveIdx = checklist.findIndex((c) => c.status !== 'completed');
      const resolvedIdx = nextActiveIdx === -1 ? Math.max(0, checklist.length - 1) : nextActiveIdx;
      const res = await fetch(`/api/supplier-portal/${encodeURIComponent(slug)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklist,
          activeStageIndex: resolvedIdx,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      const data = await res.json();
      setActiveOrder(data.activeOrder || activeOrder);
      setSelectedStepIdx(resolvedIdx);
      setEditingStepId(null);
      toast.success(isEs ? 'Documentación actualizada ✓' : 'Documentation checklist saved ✓');
    } catch {
      toast.error(isEs ? 'Error al guardar cambios' : 'Could not save checklist');
    } finally {
      setSavingStep(false);
    }
  };

  const mobileStepperItems = checklist.map((item) => ({
    id: item.id,
    kicker: isEs ? `Paso ${item.stepNumber} de ${checklist.length}` : `Step ${item.stepNumber} of ${checklist.length}`,
    label: isEs ? item.titleEs : item.titleEn,
  }));

  const orderColumns = useMemo(
    () => [
      {
        key: 'importNumber',
        label: isEs ? '# Import' : 'Import #',
        render: (val) => <strong style={{ color: '#003666' }}>#{val}</strong>,
      },
      {
        key: 'poCode',
        label: isEs ? 'Código PO / Ref' : 'PO / Reference',
        render: (val) => <CopyableId value={val} displayValue={val} />,
      },
      {
        key: 'orderDate',
        label: isEs ? 'Fecha' : 'Order Date',
        render: (val) => <span style={{ whiteSpace: 'nowrap', color: '#334155' }}>{val}</span>,
      },
      {
        key: 'quantity',
        label: isEs ? 'Cantidad' : 'Quantity',
        render: (val) => (
          <strong style={{ whiteSpace: 'nowrap', color: '#0f172a' }}>
            {Number(val || 0).toLocaleString(isEs ? 'es-ES' : 'en-US')} {isEs ? 'uds' : 'amps'}
          </strong>
        ),
      },
      {
        key: 'subtotalEur',
        label: isEs ? 'Subtotal (EUR)' : 'Subtotal (EUR)',
        render: (val) => (
          <strong style={{ whiteSpace: 'nowrap', color: '#003666' }}>{formatEur(val)}</strong>
        ),
      },
      {
        key: 'batchCode',
        label: isEs ? 'Lote' : 'Batch',
        render: (val) => (
          <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#475569' }}>
            {val || '—'}
          </span>
        ),
      },
      {
        key: 'status',
        label: isEs ? 'Estado' : 'Status',
        render: (val) => <StatusBadge status={val || 'processing'} />,
      },
    ],
    [isEs]
  );

  const partnerHubUrl = `/partners/suppliers?lang=${lang}&cur=EUR&partner=${encodeURIComponent(
    portal?.supplierName || ''
  )}`;

  const whatsappDocHref = useMemo(() => {
    const msg = isEs
      ? `Hola Atlas Health Services, referente al pedido ${activeOrder?.poCode || ''} (${portal?.supplierName || ''}), adjuntamos actualización documental.`
      : `Hello Atlas Health Services, regarding PO ${activeOrder?.poCode || ''} (${portal?.supplierName || ''}), sharing our latest order documentation update.`;
    return `https://wa.me/971553561058?text=${encodeURIComponent(msg)}`;
  }, [isEs, activeOrder?.poCode, portal?.supplierName]);

  const mailtoDocHref = `mailto:info@atlashealth-services.com?subject=${encodeURIComponent(
    `PO ${activeOrder?.poCode || ''} — ${portal?.supplierName || 'Supplier'} Documentation`
  )}`;

  return (
    <div className="atlas-page-bg" style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <style>{`
        .sp-shell {
          max-width: 1160px;
          margin: 0 auto;
          padding: 1.25rem 1.5rem 5rem;
          box-sizing: border-box;
        }
        .sp-hero {
          background: linear-gradient(135deg, #061428 0%, #003666 65%, #0a497d 100%);
          color: #ffffff;
          border-radius: 14px;
          padding: 1.65rem 2rem;
          margin-bottom: 1.25rem;
        }
        .sp-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 1.35rem;
        }
        .sp-card {
          background: #ffffff;
          border: 1px solid #dadce0;
          border-radius: 12px;
          padding: 1.25rem 1.4rem;
          box-shadow: 0 1px 3px rgba(60, 64, 67, 0.06);
          margin-bottom: 1.35rem;
        }
        .sp-checklist-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 10px;
        }
        .sp-mobile-step-panel {
          display: none;
        }
        @media (max-width: 960px) {
          .sp-kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .sp-checklist-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }
        @media (max-width: 768px) {
          .sp-shell {
            padding: 0.9rem 0.85rem 5.5rem;
            overflow-x: hidden;
          }
          .sp-hero {
            padding: 1.25rem 1.1rem;
          }
          .sp-checklist-grid {
            display: none;
          }
          .sp-mobile-step-panel {
            display: block;
          }
        }
        @media print {
          .no-print { display: none !important; }
          .sp-shell { padding: 0 !important; max-width: 100% !important; }
          .sp-hero, .sp-card { break-inside: avoid; box-shadow: none !important; }
          .sp-hero { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .sp-checklist-grid { display: grid !important; grid-template-columns: repeat(5, 1fr) !important; }
          .sp-mobile-step-panel { display: none !important; }
        }
      `}</style>

      <div className="no-print">
        <PublicUnifiedHeader
          brandHref="/"
          loginRedirect={`/b2b/supplier/${slug}`}
          hideCurrencySelector={true}
          hideAccountManager={true}
          breadcrumb={[
            { label: 'Atlas B2B', href: '/' },
            { label: isEs ? 'Portal Privado de Proveedor' : 'Private Supplier Portal' },
            { label: portal?.supplierName || slug },
          ]}
        />
      </div>

      <main className="sp-shell">
        {/* ── TOP ACTION BAR ── */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setLang('en')}
              className="gcp-btn-secondary"
              style={{
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderColor: !isEs ? '#1a73e8' : '#dadce0',
                color: !isEs ? '#1a73e8' : '#5f6368',
                background: !isEs ? '#e8f0fe' : '#ffffff',
              }}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('es')}
              className="gcp-btn-secondary"
              style={{
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderColor: isEs ? '#1a73e8' : '#dadce0',
                color: isEs ? '#1a73e8' : '#5f6368',
                background: isEs ? '#e8f0fe' : '#ffffff',
              }}
            >
              ES
            </button>
            {isAdmin && (
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#166534', background: '#dcfce7', padding: '4px 10px', borderRadius: '999px' }}>
                Admin Edit Mode
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => window.print()}
              className="gcp-btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', fontSize: '0.78rem', fontWeight: 600 }}
            >
              <Printer size={14} />
              <span>{isEs ? 'Descargar PDF' : 'Download PDF'}</span>
            </button>
            <button
              type="button"
              onClick={handleCopyPortalUrl}
              className="gcp-btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', fontSize: '0.78rem', fontWeight: 600 }}
            >
              {copiedLink ? <Check size={14} color="#16a34a" /> : <Share2 size={14} />}
              <span>{copiedLink ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Copiar Enlace' : 'Copy Link')}</span>
            </button>
            <a
              href={whatsappDocHref}
              target="_blank"
              rel="noopener noreferrer"
              className="gcp-btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}
            >
              <MessageCircle size={14} />
              <span>{isEs ? 'Enviar Documentación' : 'Share Documents'}</span>
            </a>
          </div>
        </div>

        {/* ── HERO HEADER ── */}
        <section className="sp-hero">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.25)', fontSize: '0.70rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              <Building2 size={13} />
              <span>ATLAS HEALTH SERVICES × {portal?.supplierName}</span>
            </span>
            <span style={{ fontSize: '0.74rem', color: '#bae6fd', fontWeight: 600 }}>
              {portal?.country} · {portal?.destinationMarket}
            </span>
          </div>

          <h1 style={{ margin: '0 0 6px', fontSize: 'clamp(1.3rem, 2.6vw, 1.8rem)', fontWeight: 800, lineHeight: 1.2, color: '#ffffff' }}>
            {isEs ? 'Portal Privado de Pedidos y Documentación Regulatoria' : 'Private Order Reconciliation & Regulatory Documentation Portal'}
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(241,245,249,0.9)', lineHeight: 1.5 }}>
            <strong>{isEs ? 'Producto:' : 'Product:'}</strong> {portal?.productName} ·{' '}
            <strong>Ex-Works:</strong> {formatEur(portal?.unitPriceEur)} / {isEs ? 'ampolla' : 'ampoule'}
          </p>
        </section>

        {/* ── 4 GCP KPI CARDS (Rule #22) ── */}
        <section className="sp-kpi-grid">
          <div className="sp-card" style={{ marginBottom: 0, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.69rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase' }}>
                {isEs ? 'Pedido Activo (#7)' : 'Active Order (#7)'}
              </span>
              <Clock size={15} color="#d97706" />
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#003666' }}>
              {Number(activeOrder?.quantity || 0).toLocaleString(isEs ? 'es-ES' : 'en-US')} {isEs ? 'uds' : 'amps'}
            </div>
            <div style={{ fontSize: '0.73rem', color: '#5f6368', marginTop: '2px' }}>
              {activeOrder?.poCode} · {formatEur(activeOrder?.subtotalEur)}
            </div>
          </div>

          <div className="sp-card" style={{ marginBottom: 0, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.69rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase' }}>
                {isEs ? 'Volumen Acumulado' : 'Cumulative Volume'}
              </span>
              <Package size={15} color="#1a73e8" />
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#003666' }}>
              {totals.totalUnits.toLocaleString(isEs ? 'es-ES' : 'en-US')} {isEs ? 'uds' : 'amps'}
            </div>
            <div style={{ fontSize: '0.73rem', color: '#5f6368', marginTop: '2px' }}>
              {totals.count} {isEs ? 'órdenes (Sep 2025 – Nov 2026)' : 'imports (Sep 2025 – Nov 2026)'}
            </div>
          </div>

          <div className="sp-card" style={{ marginBottom: 0, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.69rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase' }}>
                {isEs ? 'Importe Total Ex-Works' : 'Total Ex-Works Value'}
              </span>
              <FileCheck size={15} color="#0d9488" />
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#003666' }}>
              {formatEur(totals.totalEur)}
            </div>
            <div style={{ fontSize: '0.73rem', color: '#5f6368', marginTop: '2px' }}>
              {formatEur(portal?.unitPriceEur)} / {isEs ? 'unidad fija' : 'fixed unit'}
            </div>
          </div>

          <div className="sp-card" style={{ marginBottom: 0, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.69rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase' }}>
                {isEs ? 'Crecimiento de Pedido' : 'Order Growth'}
              </span>
              <TrendingUp size={15} color="#16a34a" />
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#16a34a' }}>
              +{totals.growthPct}%
            </div>
            <div style={{ fontSize: '0.73rem', color: '#5f6368', marginTop: '2px' }}>
              500 → 1,000 → 1,500 {isEs ? 'uds/pedido' : 'amps/PO'}
            </div>
          </div>
        </section>

        {/* ── BLOQUE 1: ACTIVE ORDER DOCUMENTARY WORKFLOW ── */}
        <section className="sp-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.15rem 1.4rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#0f172a' }}>
                  {isEs
                    ? `Flujo Documental — Import #${activeOrder?.importNumber || 7}`
                    : `Live Documentation Workflow — Import #${activeOrder?.importNumber || 7}`}
                </h2>
                <CopyableId value={activeOrder?.poCode || ''} displayValue={activeOrder?.poCode || ''} />
                <StatusBadge status={activeOrder?.status || 'processing'} />
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#475569' }}>
                {isEs
                  ? 'Seguimiento paso a paso de los documentos aportados por Atlas y los requeridos a Norma Hellas para liberación en UAE.'
                  : 'Step-by-step tracking of documents provided by Atlas and documents requested from Norma Hellas for UAE import clearance.'}
              </p>
            </div>

            <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <a
                href={mailtoDocHref}
                className="gcp-btn-secondary"
                style={{ fontSize: '0.75rem', fontWeight: 600, padding: '6px 11px', textDecoration: 'none' }}
              >
                {isEs ? 'Enviar PI / CoA por Email' : 'Email PI / CoA to Atlas'}
              </a>
            </div>
          </div>

          {/* Mobile GCP Connected Stepper */}
          <MobileConnectedStepper
            steps={mobileStepperItems}
            activeIndex={selectedStepIdx}
            onSelect={setSelectedStepIdx}
            isEs={isEs}
            ariaLabel={isEs ? 'Flujo documental del pedido' : 'Order documentation workflow'}
          />

          {/* Mobile Selected Step Detail */}
          {checklist[selectedStepIdx] && (
            <div className="sp-mobile-step-panel" style={{ padding: '14px 16px' }}>
              {(() => {
                const step = checklist[selectedStepIdx];
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.70rem', fontWeight: 800, color: step.owner === 'atlas' ? '#003666' : '#7c3aed', textTransform: 'uppercase' }}>
                        {step.owner === 'atlas'
                          ? (isEs ? 'Aporta: Atlas / Receptor' : 'Owner: Atlas / Importer')
                          : (isEs ? 'Aporta: Norma Hellas' : 'Owner: Norma Hellas')}
                      </span>
                      <StatusBadge status={step.status} />
                    </div>
                    <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#0f172a' }}>
                      {isEs ? step.titleEs : step.titleEn}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.79rem', color: '#475569', lineHeight: 1.45 }}>
                      {isEs ? step.noteEs : step.noteEn}
                    </p>
                    {step.docUrl && (
                      <a
                        href={step.docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gcp-btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', width: 'fit-content', fontSize: '0.76rem', fontWeight: 700, padding: '6px 12px', textDecoration: 'none' }}
                      >
                        <span>{isEs ? 'Abrir Documento' : 'Open Document'}</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Desktop 5-Column Checklist Grid */}
          <div className="sp-checklist-grid" style={{ padding: '1.25rem 1.4rem' }}>
            {checklist.map((step) => {
              const isEditing = isAdmin && editingStepId === step.id;
              return (
                <div
                  key={step.id}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: step.status === 'completed' ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                    background: step.status === 'completed' ? '#f0fdf4' : '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.66rem', fontWeight: 800, color: step.owner === 'atlas' ? '#003666' : '#7c3aed', textTransform: 'uppercase' }}>
                        {step.stepNumber}. {step.owner === 'atlas' ? 'ATLAS' : 'SUPPLIER'}
                      </span>
                      <StatusBadge status={step.status} />
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px', lineHeight: 1.25 }}>
                      {isEs ? step.titleEs : step.titleEn}
                    </div>
                    <div style={{ fontSize: '0.73rem', color: '#475569', lineHeight: 1.4 }}>
                      {isEs ? step.noteEs : step.noteEn}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                    {step.docUrl && !isEditing && (
                      <a
                        href={step.docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.73rem', fontWeight: 700, color: '#1a73e8', textDecoration: 'none' }}
                      >
                        <span>{isEs ? 'Ver PDF / Drive' : 'View PDF / Drive'}</span>
                        <ExternalLink size={11} />
                      </a>
                    )}

                    {isAdmin && !isEditing && (
                      <button
                        type="button"
                        onClick={() => setEditingStepId(step.id)}
                        className="gcp-btn-secondary no-print"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '0.70rem', width: 'fit-content' }}
                      >
                        <Edit2 size={11} />
                        <span>{isEs ? 'Editar' : 'Edit'}</span>
                      </button>
                    )}

                    {isEditing && (
                      <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '6px', borderTop: '1px dashed #cbd5e1' }}>
                        <select
                          value={step.status}
                          onChange={(e) => handleStepFieldChange(step.id, 'status', e.target.value)}
                          style={{ fontSize: '0.72rem', padding: '4px 6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        >
                          {DOC_STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {isEs ? opt.es : opt.en}
                            </option>
                          ))}
                        </select>
                        <input
                          type="url"
                          value={step.docUrl || ''}
                          onChange={(e) => handleStepFieldChange(step.id, 'docUrl', e.target.value)}
                          placeholder="https://drive.google.com/..."
                          style={{ fontSize: '0.72rem', padding: '4px 6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                        <button
                          type="button"
                          disabled={savingStep}
                          onClick={handleSaveChecklist}
                          className="gcp-btn-primary"
                          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '5px 8px', fontSize: '0.72rem' }}
                        >
                          <Save size={11} />
                          <span>{savingStep ? '...' : (isEs ? 'Guardar' : 'Save')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── BLOQUE 2: CONSOLIDATED ORDER HISTORY (DataTable · Golden Rule #3) ── */}
        <section className="sp-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Histórico Consolidado de Pedidos (Imports 1–7)' : 'Consolidated Order History (Imports 1–7)'}
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#475569' }}>
                {isEs
                  ? 'Evolución de volumen de 500 a 1.500 ampollas/pedido con trazabilidad documental completa.'
                  : 'Volume trajectory scaling from 500 to 1,500 ampoules per PO with full regulatory traceability.'}
              </p>
            </div>
          </div>

          <DataTable
            columns={orderColumns}
            data={orders}
            rowKey="id"
            globalSearch={false}
            pageSize={20}
            emptyMessage={isEs ? 'Sin pedidos registrados.' : 'No orders recorded.'}
          />
        </section>

        {/* ── BLOQUE 3: CONTEXTUAL ATLAS EXPANSION PITCH ── */}
        <section
          className="sp-card"
          style={{
            borderLeft: '4px solid #003666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ flex: '1 1 380px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.70rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              <Sparkles size={13} />
              <span>{isEs ? 'Expansión de Catálogo con Atlas' : 'Expand Your Portfolio with Atlas'}</span>
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 800, color: '#003666' }}>
              {isEs
                ? 'Con 1 solo SKU hemos escalado un +200% en UAE. ¿Activamos 2–4 referencias adicionales?'
                : 'With 1 SKU we scaled +200% in UAE. Ready to activate 2–4 additional EU GMP lines?'}
            </h3>
            <p style={{ margin: 0, fontSize: '0.80rem', color: '#475569', lineHeight: 1.5 }}>
              {isEs
                ? 'Atlas consolida pedidos de nuestra red de clínicas en Europa y Oriente Medio con precios protegidos por rol, trazabilidad documental y guías clínicas para médicos.'
                : 'Atlas consolidates demand across our Europe & GCC clinic network with role-gated pricing, full regulatory traceability, and physician enablement tools.'}
            </p>
          </div>

          <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Link
              href={partnerHubUrl}
              className="gcp-btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 14px', fontSize: '0.80rem', fontWeight: 700, textDecoration: 'none' }}
            >
              <ShieldCheck size={14} />
              <span>{isEs ? 'Ver Presentación Atlas B2B' : 'Explore Atlas Partner Hub'}</span>
            </Link>
            <a
              href={whatsappDocHref}
              target="_blank"
              rel="noopener noreferrer"
              className="gcp-btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', fontSize: '0.80rem', fontWeight: 700, textDecoration: 'none' }}
            >
              <span>{isEs ? 'Proponer Nuevos SKUs' : 'Propose Additional SKUs'}</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </section>
      </main>

      <div className="no-print">
        <PublicUnifiedFooter />
      </div>
    </div>
  );
}

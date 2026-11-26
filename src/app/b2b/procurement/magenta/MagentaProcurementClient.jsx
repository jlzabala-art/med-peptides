"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText,
  Download,
  Share2,
  Check,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  Clock,
  Printer,
  ChevronDown,
  ChevronUp,
  Package,
  Copy,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DataTable, StatusBadge, CopyableId } from '@/components/ui';
import MetricCard from '@/components/ui/MetricCard';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import UniversalShareDrawer from '@/components/ui/UniversalShareDrawer';
import {
  NORMA_HELLAS_METADATA,
  NORMA_HELLAS_IMPORTS,
  getNormaHellasProcurementStats
} from '@/services/normaHellasProcurementService';

export default function MagentaProcurementClient() {
  const [lang, setLang] = useState('en');
  const isEs = lang === 'es';
  const [searchQuery, setSearchFilter] = useState('');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const stats = useMemo(() => getNormaHellasProcurementStats(), []);

  const shareUrl = typeof window !== 'undefined'
    ? window.location.href
    : 'https://www.atlashealth-services.com/b2b/procurement/magenta';

  const filteredImports = useMemo(() => {
    if (!searchQuery.trim()) return NORMA_HELLAS_IMPORTS;
    const q = searchQuery.toLowerCase();
    return NORMA_HELLAS_IMPORTS.filter(imp =>
      imp.poNumber.toLowerCase().includes(q) ||
      imp.batchNumber.toLowerCase().includes(q) ||
      imp.status.toLowerCase().includes(q) ||
      String(imp.importNumber).includes(q)
    );
  }, [searchQuery]);

  const handleCopyWhatsAppSummary = async () => {
    const text = isEs
      ? `📋 *Atlas Health Services — Conciliación de Importaciones Norma Hellas*
*Cliente:* Magenta Pharma Medicine Trading LLC
*Producto:* Testosterone Enanthate 250mg/mL (Ampollas 1 mL)
• *Total Órdenes:* 7 Importaciones (Sep 2025 – Nov 2026)
• *Volumen Acumulado:* 5.000 ampollas suministradas
• *Inversión Total:* 24.950,00 € (4,99 € / ampolla)
• *Último Pedido:* PO PRX00035-2026-0206 (1.500 ampollas en curso)
• *Lotes Suministrados:* G3WT1E, F8XG1A, G4BJ1A
🔗 Ver conciliación interactiva y certificados: ${shareUrl}`
      : `📋 *Atlas Health Services — Norma Hellas Procurement Reconciliation*
*Client:* Magenta Pharma Medicine Trading LLC
*Product:* Testosterone Enanthate 250mg/mL (1 mL Ampoules)
• *Total Orders:* 7 Import Shipments (Sep 2025 – Nov 2026)
• *Cumulative Volume:* 5,000 ampoules fulfilled
• *Total Value:* €24,950.00 (€4.99 / unit)
• *Latest Allocation:* PO PRX00035-2026-0206 (1,500 units in transit)
• *Batches:* G3WT1E, F8XG1A, G4BJ1A
🔗 View live statement & batch certificates: ${shareUrl}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedSummary(true);
      toast.success(isEs ? 'Resumen para WhatsApp copiado ✓' : 'WhatsApp summary copied ✓');
      setTimeout(() => setCopiedSummary(false), 2500);
    } catch {
      toast.error(isEs ? 'Error al copiar' : 'Failed to copy');
    }
  };

  const columns = [
    {
      key: 'importNumber',
      header: isEs ? 'Import #' : 'Import #',
      label: 'Import #',
      width: '90px',
      align: 'center',
      render: (val) => (
        <span style={{ fontWeight: 800, color: '#003666', background: '#eff6ff', padding: '3px 8px', borderRadius: '6px', fontSize: '0.80rem' }}>
          #{val}
        </span>
      )
    },
    {
      key: 'poNumber',
      header: isEs ? 'PO / Referencia' : 'PO / Reference',
      label: 'PO / Reference',
      width: '210px',
      render: (val) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <CopyableId value={val} />
          <span style={{ fontSize: '0.70rem', color: '#64748b' }}>
            Norma Hellas S.A.
          </span>
        </div>
      )
    },
    {
      key: 'poDate',
      header: isEs ? 'Fecha Orden' : 'Order Date',
      label: 'Order Date',
      width: '120px',
      render: (val) => (
        <span style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 600 }}>
          {val}
        </span>
      )
    },
    {
      key: 'quantity',
      header: isEs ? 'Cantidad' : 'Quantity',
      label: 'Quantity',
      width: '120px',
      align: 'right',
      render: (val) => (
        <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.84rem' }}>
          {val.toLocaleString()} uds
        </span>
      )
    },
    {
      key: 'totalEur',
      header: isEs ? 'Total (EUR)' : 'Total (EUR)',
      label: 'Total (EUR)',
      width: '130px',
      align: 'right',
      render: (val) => (
        <span style={{ fontWeight: 800, color: '#15803d', fontSize: '0.84rem' }}>
          €{val.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      )
    },
    {
      key: 'batchNumber',
      header: isEs ? 'Lote / Caducidad' : 'Batch / Expiry',
      label: 'Batch / Expiry',
      width: '160px',
      render: (val, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1e293b', fontSize: '0.78rem' }}>
            {val}
          </span>
          <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
            Exp: {row.expiryDate}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      header: isEs ? 'Estado' : 'Status',
      label: 'Status',
      width: '130px',
      align: 'center',
      render: (val) => (
        <StatusBadge status={val === 'delivered' ? 'delivered' : 'processing'} />
      )
    }
  ];

  const breadcrumbs = [
    { label: isEs ? 'Portal B2B' : 'B2B Portals', href: '/b2b/lotusland' },
    { label: 'Magenta Pharma', href: '/b2b/quotes/magenta' },
    { label: isEs ? 'Conciliación Norma Hellas' : 'Norma Hellas Reconciliation' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      <PublicUnifiedHeader
        purePublic={true}
        hideAiButton={false}
        lang={lang}
        onLangChange={setLang}
        copyUrl={shareUrl}
        breadcrumb={breadcrumbs}
      />

      {/* GCP Header */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #dadce0', padding: '1rem 1.5rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#e8f0fe', color: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Package size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.24rem', fontWeight: 800, color: '#003666', margin: 0 }}>
                  {isEs
                    ? 'Conciliación de Importaciones: Norma Hellas ➔ Magenta Pharma'
                    : 'Import Procurement Ledger: Norma Hellas ➔ Magenta Pharma'}
                </h1>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                  {isEs ? 'Auditoría Oficial' : 'Official Audit'}
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.76rem', color: '#5f6368' }}>
                Testosterone Enanthate 250mg/mL Ampoules · Imports 1 to 7 · Corredor Atenas (Grecia) ➔ Dubai (UAE)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleCopyWhatsAppSummary}
              className="gcp-btn-secondary"
              style={{ padding: '7px 12px', fontSize: '0.76rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {copiedSummary ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedSummary ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar Resumen WhatsApp' : 'Copy WhatsApp Summary')}</span>
            </button>
            <button
              type="button"
              onClick={() => typeof window !== 'undefined' && window.print()}
              className="gcp-btn-secondary"
              style={{ padding: '7px 12px', fontSize: '0.76rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Printer size={14} />
              <span>{isEs ? 'Imprimir' : 'Print'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsShareOpen(true)}
              className="gcp-btn-primary"
              style={{ padding: '7px 14px', fontSize: '0.76rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Share2 size={14} />
              <span>{isEs ? 'Compartir con Cliente' : 'Share with Client'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1.5rem 6.5rem' }}>
        {/* 4 KPIs Header Grid (Google Cloud Console Standard Rule #22) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '1.5rem' }}>
          <MetricCard
            title={isEs ? 'Total Ampollas Suministradas' : 'Total Ampoules Fulfilled'}
            value={`${stats.totalUnits.toLocaleString()} uds`}
            subtitle={isEs ? '1,25 kg Testosterona Enantato activa' : '1.25 kg active testosterone enanthate'}
            icon={Package}
            color="primary"
          />
          <MetricCard
            title={isEs ? 'Inversión Total Acumulada' : 'Total Procurement Value'}
            value={`€${stats.totalEur.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            subtitle={isEs ? 'Tarifa fija 4,99 € / ampolla' : 'Locked €4.99 / unit ex-works'}
            icon={ShieldCheck}
            color="success"
          />
          <MetricCard
            title={isEs ? 'Lotes Oficiales Visados' : 'Verified Batch Lots'}
            value={`${stats.activeBatchesCount} Lotes`}
            subtitle={isEs ? 'Lote activo actual: G4BJ1A' : 'Current active batch: G4BJ1A'}
            icon={Layers}
            color="purple"
          />
          <MetricCard
            title={isEs ? 'Último Pedido en Curso' : 'Active In-Transit Order'}
            value={`${stats.pendingUnits.toLocaleString()} uds`}
            subtitle={isEs ? 'PO PRX00035 · Despacho Nov 2026' : 'PO PRX00035 · Nov 2026 release'}
            icon={Clock}
            color="amber"
          />
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '1rem' }}>
          <GlobalSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchFilter}
            placeholder={isEs ? 'Buscar por PO, lote o estado...' : 'Search by PO number, batch or status...'}
            size="lg"
            resultCount={filteredImports.length}
          />
        </div>

        {/* Master Detail Table */}
        <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #dadce0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <DataTable
            data={filteredImports}
            columns={columns}
            keyField="id"
            pageSize={10}
            showPagination={false}
            sortable={false}
            lang={lang}
            expandableRender={(row) => (
              <div style={{ padding: '14px 18px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', fontSize: '0.78rem' }}>
                <div>
                  <strong style={{ color: '#003666', display: 'block', marginBottom: '4px' }}>
                    {isEs ? 'Detalle de Pedido & Entrega:' : 'Order & Fulfillment Scope:'}
                  </strong>
                  <div style={{ color: '#475569', lineHeight: 1.5 }}>
                    <div><strong>PO Oficial:</strong> {row.poNumber}</div>
                    <div><strong>Fecha Entrega / Llegada:</strong> {row.deliveryDate}</div>
                    <div><strong>Notas:</strong> {row.notes}</div>
                  </div>
                </div>
                <div>
                  <strong style={{ color: '#003666', display: 'block', marginBottom: '4px' }}>
                    {isEs ? 'Permisos & Regulación MOH:' : 'Regulatory & MOH Status:'}
                  </strong>
                  <div style={{ color: '#475569', lineHeight: 1.5 }}>
                    <div><strong>Permiso Import Control:</strong> {row.mohPermit}</div>
                    <div><strong>Fabricante:</strong> {NORMA_HELLAS_METADATA.manufacturer}</div>
                    <div><strong>Consignatario:</strong> {NORMA_HELLAS_METADATA.buyer.name}</div>
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      </div>

      <UniversalShareDrawer
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        docType="statement"
        shareUrl={shareUrl}
        title={isEs ? 'Compartir Conciliación con Magenta' : 'Share Reconciliation with Magenta'}
        subtitle="Testosterone Enanthate Imports 1-7 Statement"
        itemName="Norma Hellas Imports Statement"
      />

      <PublicUnifiedFooter />
    </div>
  );
}

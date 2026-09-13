'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import CopyableId from '@/components/ui/CopyableId';
import EmptyState from '@/components/ui/EmptyState';
import notifier from '@/services/NotificationService';
import { 
  FileText, 
  ExternalLink, 
  Clock, 
  User, 
  Building, 
  Building2, 
  CheckCircle2, 
  TrendingUp, 
  Calendar,
  Send,
  MessageSquare,
  Filter,
  RefreshCw,
  Eye,
  DollarSign,
  Tag,
  Share2,
  Phone,
  Mail,
  FileSpreadsheet,
  Layers,
  Sparkles
} from 'lucide-react';

/**
 * SharedAssetsTrackingTable (CatalogTrackingTable)
 * ─────────────────────────────────────────────────────────────────────────────
 * Universal Audit Trail & Trazabilidad Registry for all assets shared across
 * the platform: Labels, Catalogs, Technical Datasheets, Quotes, etc.
 * Features:
 *  - 4 Dynamic KPIs (Golden Rule #22)
 *  - Hierarchical Recipient filters (Golden Rule #24 & User Requirement)
 *  - Asset type filters
 *  - Master-Detail inline drawer with full metadata (Golden Rule #4)
 *  - Copyable share codes and direct document access links
 */
export default function CatalogTrackingTable({ isMobile = false }) {
  const [logs, setLogs] = useState([]);
  const [kpis, setKpis] = useState({
    totalShares: 0,
    labelsShared: 0,
    catalogsShared: 0,
    datasheetsShared: 0,
    recipientBreakdown: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipientType, setSelectedRecipientType] = useState('all');
  const [selectedAssetType, setSelectedAssetType] = useState('all');
  const [isUpdating, setIsUpdating] = useState(null);

  // Fetch tracking logs from universal /api/shares endpoint
  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (selectedRecipientType !== 'all') params.set('recipientType', selectedRecipientType);
      if (selectedAssetType !== 'all') params.set('assetType', selectedAssetType);
      params.set('limit', '80');

      const res = await fetch(`/api/shares?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.items || []);
        if (data.kpis) setKpis(data.kpis);
      }
    } catch (err) {
      console.error('Error loading shared assets tracking logs:', err);
      notifier.error('Error al cargar historial de compartidos');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedRecipientType, selectedAssetType]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (selectedRecipientType !== 'all') params.set('recipientType', selectedRecipientType);
        if (selectedAssetType !== 'all') params.set('assetType', selectedAssetType);
        params.set('limit', '80');

        const res = await fetch(`/api/shares?${params.toString()}`);
        if (res.ok && active) {
          const data = await res.json();
          setLogs(data.items || []);
          if (data.kpis) setKpis(data.kpis);
        }
      } catch (err) {
        console.error('Error loading shared assets tracking logs:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [searchQuery, selectedRecipientType, selectedAssetType]);

  // Update status handler
  const handleUpdateStatus = async (logId, newStatus) => {
    try {
      setIsUpdating(logId);
      // Try updating via /api/catalog/tracking-logs if legacy or future share status API
      const res = await fetch('/api/catalog/tracking-logs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: logId, status: newStatus }),
      });
      if (res.ok) {
        setLogs(prev => prev.map(l => l.id === logId ? { ...l, status: newStatus } : l));
        notifier.success('Estado actualizado correctamente');
      }
    } catch (err) {
      console.error('Error updating log status:', err);
    } finally {
      setIsUpdating(null);
    }
  };

  // Convert to Purchase Order if it's a catalog / quote
  const handleConvertToOrder = useCallback(async (logId) => {
    try {
      setIsUpdating(logId);
      const res = await fetch('/api/catalog/convert-to-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId }),
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(prev => prev.map(l => l.id === logId ? { ...l, status: 'converted_to_order', poNumber: data.poNumber } : l));
        notifier.success(`Sales Order ${data.poNumber} created successfully!`);
      }
    } catch (err) {
      console.error('Error converting to order:', err);
      notifier.error('Failed to convert to order');
    } finally {
      setIsUpdating(null);
    }
  }, []);

  // Set CRM reminder
  const handleSetReminder = useCallback(async (logId, daysAhead = 3) => {
    try {
      setIsUpdating(logId);
      const nowMs = Date.now();
      const targetDate = new Date(nowMs + daysAhead * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const res = await fetch('/api/catalog/tracking-logs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: logId, followUpDate: targetDate, status: 'followed_up' }),
      });
      if (res.ok) {
        setLogs(prev => prev.map(l => l.id === logId ? { ...l, followUpDate: targetDate, status: 'followed_up' } : l));
        notifier.info(`Follow-up reminder set for ${targetDate}`);
      }
    } catch (err) {
      console.error('Error setting reminder:', err);
    } finally {
      setIsUpdating(null);
    }
  }, []);

  // Columns Definition
  const columns = useMemo(() => [
    {
      key: 'generatedAt',
      label: 'Date & Code',
      width: '140px',
      render: (row) => {
        const rawDate = row.createdAt || row.generatedAt;
        const date = rawDate ? new Date(rawDate).toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: 'short', 
          year: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : '-';
        const displayCode = row.shareCode || row.id?.slice(0, 10) || 'SH-REF';

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: '0.80rem', fontWeight: 600, color: '#0f172a' }}>{date}</span>
            <CopyableId value={displayCode} />
          </div>
        );
      }
    },
    {
      key: 'assetType',
      label: 'Asset Shared',
      width: '180px',
      render: (row) => {
        const type = (row.assetType || row.docType || '').toLowerCase();
        let badgeColor = '#003666';
        let badgeBg = '#eff6ff';
        let label = 'Catalog PDF';
        let Icon = FileText;

        if (type.includes('label')) {
          badgeColor = '#0284c7';
          badgeBg = '#f0f9ff';
          label = '🏷️ Vial / Sheet Label';
          Icon = Tag;
        } else if (type.includes('datasheet') || type.includes('fiche')) {
          badgeColor = '#0d9488';
          badgeBg = '#f0fdfa';
          label = '🔬 Technical Sheet';
          Icon = Sparkles;
        } else if (type.includes('quote') || type.includes('quotation')) {
          badgeColor = '#7c3aed';
          badgeBg = '#f5f3ff';
          label = '💼 Commercial Quote';
          Icon = DollarSign;
        } else if (type.includes('pricelist')) {
          badgeColor = '#003666';
          badgeBg = '#eff6ff';
          label = '📊 Price List';
          Icon = FileSpreadsheet;
        }

        const title = row.assetTitle || row.productSummary || row.itemName || 'Peptide Asset';

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 4, 
              padding: '2px 8px', 
              borderRadius: 6, 
              fontSize: '0.72rem', 
              fontWeight: 700, 
              color: badgeColor, 
              background: badgeBg,
              width: 'fit-content'
            }}>
              <Icon size={11} /> {label}
            </span>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1e293b' }} title={title}>
              {title.length > 28 ? title.slice(0, 26) + '…' : title}
            </span>
            {row.assetMeta?.vialCode && (
              <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                Vial: <strong style={{ color: '#003666' }}>{row.assetMeta.vialCode}</strong>
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: 'recipient',
      label: 'Recipient (Shared With)',
      width: '210px',
      render: (row) => {
        const r = row.recipient || {};
        const isClinic = r.type === 'clinic';
        const isDoctor = r.type === 'doctor';
        const isPatient = r.type === 'patient';
        const isWholesale = r.type === 'wholeseller';
        const isSupplier = r.type === 'supplier';

        let RoleIcon = User;
        let roleColor = '#64748b';
        let roleBg = '#f1f5f9';
        let roleLabel = 'Direct External';

        if (isDoctor || isClinic) {
          RoleIcon = isClinic ? Building2 : User;
          roleColor = '#0d9488';
          roleBg = '#f0fdfa';
          roleLabel = isClinic ? 'Clinic' : 'Doctor';
        } else if (isPatient) {
          RoleIcon = User;
          roleColor = '#7c3aed';
          roleBg = '#f5f3ff';
          roleLabel = 'Patient';
        } else if (isWholesale) {
          RoleIcon = Building;
          roleColor = '#003666';
          roleBg = '#eff6ff';
          roleLabel = 'Wholesaler';
        } else if (isSupplier) {
          RoleIcon = Building2;
          roleColor = '#c2410c';
          roleBg = '#fff7ed';
          roleLabel = 'Supplier';
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <RoleIcon size={13} color={roleColor} />
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                {r.name || 'Direct Contact'}
              </span>
            </div>
            {r.company && (
              <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 500 }}>
                {r.company}
              </span>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 1 }}>
              <span style={{ 
                fontSize: '0.66rem', 
                color: roleColor,
                background: roleBg,
                padding: '1px 6px',
                borderRadius: 4,
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                {roleLabel}
              </span>
              {r.email && (
                <span style={{ fontSize: '0.70rem', color: '#64748b' }}>
                  {r.email}
                </span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'channel',
      label: 'Channel & Operator',
      width: '160px',
      render: (row) => {
        const ch = (row.deliveryChannel || row.channel || 'direct_link').toLowerCase();
        let channelLabel = '🔗 Direct Link';
        let channelColor = '#0284c7';

        if (ch.includes('whatsapp')) {
          channelLabel = '💬 WhatsApp';
          channelColor = '#16a34a';
        } else if (ch.includes('email') || ch.includes('mail')) {
          channelLabel = '✉️ Email';
          channelColor = '#7c3aed';
        } else if (ch.includes('pdf')) {
          channelLabel = '📥 PDF Download';
          channelColor = '#475569';
        }

        const operator = row.sharedBy?.name || row.accountManager?.name || 'Admin Desk';

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: channelColor }}>
              {channelLabel}
            </span>
            <span style={{ fontSize: '0.70rem', color: '#64748b' }}>
              By: <strong>{operator}</strong>
            </span>
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      width: '140px',
      render: (row) => {
        const statusVal = row.status || 'generated';
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <StatusBadge status={statusVal} />
              {row.poNumber && (
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '1px 5px', borderRadius: 4 }}>
                  {row.poNumber}
                </span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '160px',
      render: (row) => {
        const viewUrl = row.assetMeta?.url || row.pdfUrl || row.shareUrl;

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {viewUrl && (
              <a
                href={viewUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 8px',
                  background: '#003666',
                  color: '#ffffff',
                  borderRadius: 6,
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 1px 2px rgba(0,54,102,0.2)'
                }}
              >
                <Eye size={12} /> View
              </a>
            )}

            {row.status !== 'converted_to_order' && (row.assetType === 'catalog_pdf' || row.docType === 'quotation') && (
              <button
                onClick={() => handleConvertToOrder(row.id)}
                disabled={isUpdating === row.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  padding: '4px 7px',
                  background: '#16a34a',
                  color: '#ffffff',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <DollarSign size={11} /> PO
              </button>
            )}
          </div>
        );
      }
    }
  ], [isUpdating, handleConvertToOrder]);

  // Master-Detail Expanded Row Renderer
  const expandableRender = (row) => {
    const meta = row.assetMeta || {};
    const recipient = row.recipient || {};

    return (
      <div style={{ 
        padding: '14px 18px', 
        background: '#f8fafc', 
        borderTop: '1px solid #e2e8f0', 
        borderBottom: '1px solid #e2e8f0',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr',
        gap: 16
      }}>
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#003666', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <MessageSquare size={13} /> Notes & Sharing Purpose
          </div>
          <div style={{ fontSize: '0.82rem', color: '#334155', background: '#ffffff', padding: '9px 13px', borderRadius: 8, border: '1px solid #e2e8f0', minHeight: 46 }}>
            {row.notes || row.followUpNotes || 'No custom notes provided for this share.'}
          </div>

          {/* Recipient Quick Contact details */}
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.75rem', color: '#475569' }}>
            {recipient.phone && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Phone size={12} color="#16a34a" /> {recipient.phone}
              </span>
            )}
            {recipient.email && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Mail size={12} color="#0284c7" /> {recipient.email}
              </span>
            )}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#003666', marginBottom: 6 }}>
            📋 Technical Asset Metadata & Audit Trail
          </div>
          <div style={{ fontSize: '0.76rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div>Share Reference Code: <code>{row.shareCode || row.id}</code></div>
            {meta.vialCode && <div>Vial Batch Code: <strong>{meta.vialCode}</strong></div>}
            {meta.dosage && <div>Presentation / Dose: <strong>{meta.dosage}</strong></div>}
            {meta.supplier && <div>Linked Supplier: <strong>{meta.supplier}</strong></div>}
            {meta.variantCount && <div>Variant presentations included: <strong>{meta.variantCount}</strong></div>}
            <div>Shared By: <strong>{row.sharedBy?.name || row.accountManager?.name || 'System Admin'}</strong> &lt;{row.sharedBy?.email || row.accountManager?.email || 'admin@atlas.com'}&gt;</div>
            {row.poNumber && (
              <div style={{ color: '#16a34a', fontWeight: 700, marginTop: 4 }}>
                ✓ Official B2B Order Linked: <code>{row.poNumber}</code>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* 4 Universal KPIs (Golden Rule #22) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
        gap: '0.75rem' 
      }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Total Shared Assets</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#003666', marginTop: 2 }}>{kpis.totalShares || logs.length}</div>
          <div style={{ fontSize: '0.68rem', color: '#16a34a', marginTop: 2 }}>Universal Trazabilidad</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Labels & Vials</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0284c7', marginTop: 2 }}>{kpis.labelsShared || 0}</div>
          <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 2 }}>QR / Shipping & Vials</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Catalogs & Prices</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0d9488', marginTop: 2 }}>{kpis.catalogsShared || 0}</div>
          <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 2 }}>B2B & Clinic Portfolios</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Datasheets & Quotes</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#7c3aed', marginTop: 2 }}>{kpis.datasheetsShared || 0}</div>
          <div style={{ fontSize: '0.68rem', color: '#16a34a', marginTop: 2 }}>Technical & Commercial</div>
        </div>
      </div>

      {/* Recipient Role Filter (Golden Rule & User Requirement to avoid heavy loads) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginRight: 4 }}>
              Recipient:
            </span>
            {[
              { id: 'all', label: 'All Recipients' },
              { id: 'doctor', label: '👨‍⚕️ Clinics & Doctors' },
              { id: 'patient', label: '🏥 Patients' },
              { id: 'wholeseller', label: '🏢 Wholesalers' },
              { id: 'supplier', label: '🏭 Suppliers' },
              { id: 'external', label: '📝 External / Direct' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedRecipientType(tab.id)}
                style={{
                  padding: '4px 11px',
                  borderRadius: 20,
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: selectedRecipientType === tab.id ? '#003666' : '#e2e8f0',
                  background: selectedRecipientType === tab.id ? '#003666' : '#ffffff',
                  color: selectedRecipientType === tab.id ? '#ffffff' : '#64748b',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchLogs}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 9px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              fontSize: '0.74rem',
              color: '#475569',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* Asset Type Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginRight: 4 }}>
            Asset Type:
          </span>
          {[
            { id: 'all', label: 'All Assets' },
            { id: 'label_vial', label: '🏷️ Labels' },
            { id: 'catalog_pdf', label: '📑 Catalogs' },
            { id: 'datasheet', label: '🔬 Datasheets' },
            { id: 'quotation', label: '💼 Quotations' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedAssetType(tab.id)}
              style={{
                padding: '3px 9px',
                borderRadius: 16,
                fontSize: '0.70rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: selectedAssetType === tab.id ? '#0284c7' : '#e2e8f0',
                background: selectedAssetType === tab.id ? '#f0f9ff' : '#ffffff',
                color: selectedAssetType === tab.id ? '#0284c7' : '#64748b',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit & Tracking DataTable (Golden Rule #3) */}
      <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={logs}
          keyField="id"
          isLoading={isLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search by recipient, product, vial code, share code..."
          expandableRender={expandableRender}
          emptyTitle="No shared records found"
          emptyDescription="When anyone shares a label, catalog, technical datasheet, or quote, the audit log with recipient identification will appear here."
        />
      </div>
    </div>
  );
}

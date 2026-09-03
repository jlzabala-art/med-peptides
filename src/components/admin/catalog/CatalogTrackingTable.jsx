'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import CopyableId from '@/components/ui/CopyableId';
import EmptyState from '@/components/ui/EmptyState';
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
  DollarSign
} from 'lucide-react';

export default function CatalogTrackingTable({ isMobile = false }) {
  const [logs, setLogs] = useState([]);
  const [kpis, setKpis] = useState({ totalGenerated: 0, wholesalerDocs: 0, clinicDocs: 0, convertedCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipientType, setSelectedRecipientType] = useState('all');
  const [isUpdating, setIsUpdating] = useState(null);

  // Fetch tracking logs
  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/catalog/tracking-logs?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.items || []);
        if (data.kpis) setKpis(data.kpis);
      }
    } catch (err) {
      console.error('Error loading catalog tracking logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch(`/api/catalog/tracking-logs?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok && active) {
          const data = await res.json();
          setLogs(data.items || []);
          if (data.kpis) setKpis(data.kpis);
        }
      } catch (err) {
        console.error('Error loading catalog tracking logs:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [searchQuery]);

  // Update status handler
  const handleUpdateStatus = async (logId, newStatus) => {
    try {
      setIsUpdating(logId);
      const res = await fetch('/api/catalog/tracking-logs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: logId, status: newStatus }),
      });
      if (res.ok) {
        setLogs(prev => prev.map(l => l.id === logId ? { ...l, status: newStatus } : l));
      }
    } catch (err) {
      console.error('Error updating log status:', err);
    } finally {
      setIsUpdating(null);
    }
  };

  // Convert catalog/quotation to official B2B Purchase Order
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
        setKpis(prev => ({ ...prev, convertedCount: prev.convertedCount + 1 }));
        alert(`🎉 Sales Order ${data.poNumber} created successfully in the system!`);
      }
    } catch (err) {
      console.error('Error converting to order:', err);
    } finally {
      setIsUpdating(null);
    }
  }, []);

  // Set CRM follow-up reminder
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
        alert(`⏰ Follow-up reminder set for ${targetDate}`);
      }
    } catch (err) {
      console.error('Error setting reminder:', err);
    } finally {
      setIsUpdating(null);
    }
  }, []);

  // Filtered dataset
  const filteredData = useMemo(() => {
    let list = logs;
    if (selectedRecipientType !== 'all') {
      list = list.filter(l => (l.recipient?.type || 'custom') === selectedRecipientType);
    }
    return list;
  }, [logs, selectedRecipientType]);

  // Table Columns Definition
  const columns = useMemo(() => [
    {
      key: 'generatedAt',
      label: 'Date & ID',
      width: '140px',
      render: (row) => {
        const date = row.generatedAt ? new Date(row.generatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-';
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>{date}</span>
            <CopyableId value={row.id} />
          </div>
        );
      }
    },
    {
      key: 'docType',
      label: 'Document Type',
      width: '130px',
      render: (row) => {
        const typeLabel = row.docType === 'quotation' ? 'Quotation' : row.docType === 'catalog' ? 'Catalog' : 'Price List';
        const typeColor = row.docType === 'quotation' ? '#7c3aed' : row.docType === 'catalog' ? '#0d9488' : '#003666';
        const typeBg = row.docType === 'quotation' ? '#f5f3ff' : row.docType === 'catalog' ? '#f0fdfa' : '#eff6ff';

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 4, 
              padding: '3px 8px', 
              borderRadius: 6, 
              fontSize: '0.74rem', 
              fontWeight: 700, 
              color: typeColor, 
              background: typeBg,
              width: 'fit-content'
            }}>
              <FileText size={11} /> {typeLabel}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Tier: <strong>{(row.tier || 'wholeseller').toUpperCase()}</strong> {row.incoterm ? `· ${row.incoterm}` : ''}
            </span>
          </div>
        );
      }
    },
    {
      key: 'recipient',
      label: 'Target Recipient',
      width: '210px',
      render: (row) => {
        const r = row.recipient || {};
        const isClinic = r.type === 'clinic';
        const isWholesale = r.type === 'wholeseller';
        const isDoctor = r.type === 'doctor';

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {isClinic && <Building2 size={13} color="#0d9488" />}
              {isWholesale && <Building size={13} color="#003666" />}
              {isDoctor && <User size={13} color="#7c3aed" />}
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                {r.name || 'Direct Client'}
              </span>
            </div>
            {r.email && (
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                {r.email}
              </span>
            )}
            <span style={{ 
              fontSize: '0.68rem', 
              color: isClinic ? '#0d9488' : isWholesale ? '#003666' : '#64748b',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              {r.type || 'Custom Prospect'}
            </span>
          </div>
        );
      }
    },
    {
      key: 'accountManager',
      label: 'Account Manager',
      width: '180px',
      render: (row) => {
        const am = row.accountManager || {};
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#003666' }}>
              {am.name || 'Atlas Commercial Desk'}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {am.email || 'orders@atlas-solutions.com'}
            </span>
          </div>
        );
      }
    },
    {
      key: 'products',
      label: 'Scope & Products',
      width: '200px',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>
            {row.productSummary || 'Peptide API Portfolio'}
          </span>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
            <strong>{row.variantCount || row.itemCount || 1}</strong> variant presentations ({row.currency || 'USD'})
          </span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'CRM Status',
      width: '160px',
      render: (row) => {
        const statusVal = row.status || 'generated';
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <StatusBadge status={statusVal} />
              {row.poNumber && (
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '2px 6px', borderRadius: 4 }}>
                  {row.poNumber}
                </span>
              )}
            </div>
            <select
              value={statusVal}
              disabled={isUpdating === row.id}
              onChange={e => handleUpdateStatus(row.id, e.target.value)}
              style={{
                fontSize: '0.72rem',
                padding: '3px 6px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                cursor: 'pointer',
                width: 'fit-content'
              }}
            >
              <option value="generated">📋 Generado</option>
              <option value="sent">✉️ Enviado al Cliente</option>
              <option value="followed_up">📞 En Seguimiento</option>
              <option value="converted_to_order">🛒 Convertido en Pedido</option>
              <option value="archived">📁 Archivado</option>
            </select>
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '180px',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {row.pdfUrl && (
            <a
              href={row.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '5px 8px',
                background: '#003666',
                color: '#ffffff',
                borderRadius: 6,
                fontSize: '0.74rem',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 1px 3px rgba(0,54,102,0.2)'
              }}
            >
              <Eye size={12} /> PDF
            </a>
          )}

          {row.status !== 'converted_to_order' && (
            <button
              onClick={() => handleConvertToOrder(row.id)}
              disabled={isUpdating === row.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '5px 8px',
                background: '#16a34a',
                color: '#ffffff',
                borderRadius: 6,
                border: 'none',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(22,163,74,0.2)'
              }}
            >
              <DollarSign size={12} /> Convert PO
            </button>
          )}
        </div>
      )
    }
  ], [isUpdating, handleConvertToOrder]);

  // Master-Detail Expanded Row Renderer
  const expandableRender = (row) => (
    <div style={{ 
      padding: '14px 18px', 
      background: '#f8fafc', 
      borderTop: '1px solid #e2e8f0', 
      borderBottom: '1px solid #e2e8f0',
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: 16
    }}>
      <div>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#003666', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <MessageSquare size={13} /> Commercial Follow-up Notes
        </div>
        <div style={{ fontSize: '0.82rem', color: '#334155', background: '#ffffff', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
          {row.followUpNotes || 'No internal CRM notes recorded during generation.'}
        </div>

        {/* Quick Follow-up Reminder buttons */}
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Set Reminder:</span>
          <button
            onClick={() => handleSetReminder(row.id, 3)}
            style={{ padding: '3px 8px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: '0.7rem', cursor: 'pointer' }}
          >
            ⏰ In 3 days
          </button>
          <button
            onClick={() => handleSetReminder(row.id, 7)}
            style={{ padding: '3px 8px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: '0.7rem', cursor: 'pointer' }}
          >
            ⏰ In 1 week
          </button>
          {row.followUpDate && (
            <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600 }}>
              (Scheduled: {row.followUpDate})
            </span>
          )}
        </div>
      </div>

      <div>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#003666', marginBottom: 4 }}>
          📄 Document Specifications & Conversion
        </div>
        <div style={{ fontSize: '0.76rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div>Filename: <code>{row.filename || row.pdfFilename || 'catalog.pdf'}</code></div>
          <div>Incoterm & Terms: <strong>{row.incoterm || 'EXW'}</strong> ({row.isExWorks ? 'Ex-Works pricing' : 'Standard'})</div>
          <div>Account Desk Contact: <strong>{row.accountManager?.name}</strong> &lt;{row.accountManager?.email}&gt;</div>
          {row.poNumber && (
            <div style={{ color: '#16a34a', fontWeight: 700 }}>
              ✓ Official Order Created: <code>{row.poNumber}</code>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* KPI Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
        gap: '0.75rem' 
      }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Total Generated</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#003666', marginTop: 2 }}>{kpis.totalGenerated}</div>
          <div style={{ fontSize: '0.68rem', color: '#16a34a', marginTop: 2 }}>Audit Trail Active</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Wholesaler Lists</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0284c7', marginTop: 2 }}>{kpis.wholesalerDocs}</div>
          <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 2 }}>B2B EXW Catalogs</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Clinic Proposals</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0d9488', marginTop: 2 }}>{kpis.clinicDocs}</div>
          <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 2 }}>Medical Portfolios</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Converted to PO</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#16a34a', marginTop: 2 }}>{kpis.convertedCount}</div>
          <div style={{ fontSize: '0.68rem', color: '#16a34a', marginTop: 2 }}>Closed Sales Orders</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Recipients' },
            { id: 'wholeseller', label: '🏢 Wholesalers' },
            { id: 'clinic', label: '🏥 Clinics' },
            { id: 'doctor', label: '👨‍⚕️ Doctors' },
            { id: 'custom', label: '📝 Direct Prospects' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedRecipientType(tab.id)}
              style={{
                padding: '5px 12px',
                borderRadius: 20,
                fontSize: '0.76rem',
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
            padding: '5px 10px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: 6,
            fontSize: '0.76rem',
            color: '#475569',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} /> Refresh Logs
        </button>
      </div>

      {/* Audit & Tracking DataTable */}
      <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={filteredData}
          keyField="id"
          isLoading={isLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search by client, account manager, peptide, or doc ID..."
          expandableRender={expandableRender}
          emptyTitle="No catalog generations recorded yet"
          emptyDescription="When you generate a PDF Price List, Quotation, or Catalog, its complete tracking record and PDF link will appear here automatically."
        />
      </div>
    </div>
  );
}

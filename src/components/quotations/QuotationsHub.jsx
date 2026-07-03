import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuotationsUIStore } from '../../stores/quotationsUIStore';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { FileText, Search, Plus, Filter, MoreHorizontal, Archive, RefreshCw, LayoutGrid, List as ListIcon } from '@/lib/icons';
import QuotationBuilderWizard from './modals/QuotationBuilderWizard';
import QuotationDetailDrawer from './QuotationDetailDrawer';
import DataTable from '../ui/DataTable';
import QuotationsKPIBanner from './QuotationsKPIBanner';

export default function QuotationsHub() {
  const {
    activeView,
    setActiveView,
    searchQuery,
    setSearchQuery,
    openBuilderWizard,
    openQuotationDrawer
  } = useQuotationsUIStore();

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch quotations (Real-time listener for the new schema)
  useEffect(() => {
    const q = query(collection(db, 'quotations_v2'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuotations(docs);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching quotations:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen for external events (like clicking "Create Quotation" from Prescriptions)
  useEffect(() => {
    const handleOpenWizard = (e) => {
      openBuilderWizard(e.detail);
    };
    window.addEventListener('open-quotation-wizard', handleOpenWizard);
    return () => window.removeEventListener('open-quotation-wizard', handleOpenWizard);
  }, [openBuilderWizard]);

  const columns = [
    {
      header: 'Quotation #',
      key: 'quotationNumber',
      render: (q) => <span style={{ fontWeight: 600 }}>{q.quotationNumber}</span>,
      sortValue: (q) => q.quotationNumber
    },
    {
      header: 'Patient & Clinic',
      key: 'patient',
      render: (q) => (
        <div>
          <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>{q.patientName || 'N/A'}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{q.clinicName || 'N/A'}</div>
        </div>
      )
    },
    {
      header: 'Doctor',
      key: 'doctor',
      render: (q) => q.doctorName || 'N/A'
    },
    {
      header: 'Status',
      key: 'status',
      render: (q) => {
        let bg = '#f1f5f9', color = '#64748b';
        switch (q.status) {
          case 'Pending Review':
          case 'Negotiation': bg = '#fef3c7'; color = '#d97706'; break;
          case 'Sent':
          case 'Viewed': bg = '#dbeafe'; color = '#2563eb'; break;
          case 'Accepted':
          case 'Converted': bg = '#d1fae5'; color = '#059669'; break;
          case 'Rejected': bg = '#fee2e2'; color = '#dc2626'; break;
        }
        return (
          <span style={{ padding: '4px 8px', borderRadius: '12px', background: bg, color: color, fontSize: '0.8rem', fontWeight: 600 }}>
            {q.status || 'Draft'}
          </span>
        );
      }
    },
    {
      header: 'Amount & Margin',
      key: 'amount',
      render: (q) => (
        <div>
          <div style={{ fontWeight: 600 }}>${Number(q.totalAmount || 0).toLocaleString()}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{Number(q.marginPercent || 0).toFixed(1)}% margin</div>
        </div>
      ),
      sortValue: (q) => Number(q.totalAmount || 0)
    },
    {
      header: 'Lead Time',
      key: 'leadTime',
      render: (q) => q.leadTime || 'N/A'
    },
    {
      header: 'Updated',
      key: 'updatedAt',
      render: (q) => {
        if (!q.updatedAt) return 'N/A';
        const date = q.updatedAt.toDate ? q.updatedAt.toDate() : new Date(q.updatedAt);
        return date.toLocaleDateString();
      },
      sortValue: (q) => {
        if (!q.updatedAt) return 0;
        return q.updatedAt.toMillis ? q.updatedAt.toMillis() : new Date(q.updatedAt).getTime();
      }
    }
  ];

  const renderHoverActions = (q) => (
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
      <button onClick={() => openQuotationDrawer(q)} className="btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}>Open</button>
      <button className="btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}>PDF</button>
      <button className="btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}><MoreHorizontal size={14} /></button>
    </div>
  );

  return (
    <div style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} />
            </div>
            Quotations
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage commercial proposals and patient estimates.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => openBuilderWizard()}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={16} />
            New Quotation
          </button>
        </div>
      </div>

      <QuotationsKPIBanner quotations={quotations} loading={loading} />

      {/* Main Content Area */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <DataTable
          columns={columns}
          data={quotations}
          isLoading={loading}
          keyField="id"
          onRowClick={(q) => openQuotationDrawer(q)}
          renderHoverActions={renderHoverActions}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search quotation #, patient, clinic..."
          emptyTitle="No quotations have been created yet."
          emptyDescription="Create your first quotation from a prescription, protocol, or build from scratch."
          emptyActionLabel="New Quotation"
          onEmptyAction={() => openBuilderWizard()}
        />
      </div>

      <QuotationBuilderWizard />
      <QuotationDetailDrawer />
    </div>
  );
}

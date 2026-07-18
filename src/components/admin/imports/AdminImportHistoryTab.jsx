"use client";

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import { format } from 'date-fns';
import { History, FileText, Calendar, User } from '@/lib/icons';
import PageHeader from '../../ui/PageHeader';
import DataTable from '../../ui/DataTable';
import DataTableSkeleton from '../../ui/skeletons/DataTableSkeleton';
import EmptyState from '../../ui/EmptyState';
import StatusBadge from '../../ui/StatusBadge';
import CopyableId from '../../ui/CopyableId';

export default function AdminImportHistoryTab() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const q = query(collection(db, 'import_history'), orderBy('timestamp', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHistory(data);
      } catch (err) {
        console.error("Error fetching import history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const columns = [
    {
      key: 'timestamp',
      header: 'Date',
      sortValue: (r) => r.timestamp?.seconds || 0,
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
          <Calendar size={14} color="var(--text-muted)" />
          {r.timestamp ? format(r.timestamp.toDate(), 'PPpp') : 'Unknown'}
        </div>
      )
    },
    {
      key: 'id',
      header: 'Import ID',
      render: (r) => <CopyableId value={r.id} />
    },
    {
      key: 'fileName',
      header: 'File Name',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, color: 'var(--color-primary)' }}>
          <FileText size={16} />
          {r.fileName}
        </div>
      )
    },
    {
      key: 'context',
      header: 'Type',
      render: (r) => <StatusBadge status="po_created" label={r.context || r.importType} />
    },
    {
      key: 'itemsCount',
      header: 'Items',
      align: 'right',
      sortValue: (r) => r.itemsCount || 0,
      render: (r) => <span style={{ fontWeight: 600 }}>{r.itemsCount}</span>
    },
    {
      key: 'adminEmail',
      header: 'Admin',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <User size={14} />
          {r.adminEmail || 'Unknown'}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: () => <StatusBadge status="active" label="Success" />
    }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      <PageHeader
        title="Import History"
        subtitle="Log of all files processed by AI and saved to the database."
        icon={History}
      />
      {loading ? (
        <DataTableSkeleton rows={8} columns={6} />
      ) : history.length === 0 ? (
        <EmptyState
          icon={History}
          title="No imports yet"
          subtitle="When you process and save imports, they will appear here."
        />
      ) : (
        <DataTable
          data={history}
          columns={columns}
          keyField="id"
          emptyTitle="No imports found"
          emptyDescription="No import records match your search."
          globalSearch
          searchPlaceholder="Search by file name or type..."
        />
      )}
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { Search, Users, Plus, Archive, CheckCircle2, XCircle, Trash2, FilePlus, UserPlus, ClipboardList, Activity, Mail } from 'lucide-react';
import DataTable from '../../ui/DataTable';
import BulkActionsBar from '../../ui/BulkActionsBar';
import { useDataTable } from '../../../hooks/ui/useDataTable';
import { exportToCSV } from '../../../utils/exportUtils';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import notifier from '../../../services/NotificationService';
import { useToast } from '../../../hooks/useToast';

export default function PhysiciansDirectory({ doctors = [], isLoading = false, onSelectDoctor, patientMap = {}, orderMap = {}, onAddPhysician, onRefresh, filters = {} }) {
  const { toast } = useToast();

  const filteredDoctors = doctors.filter(d => {
    // Status filter
    const status = d.isArchived ? 'archived' : (d.status || 'active');
    if (filters.status && filters.status !== 'all' && status !== filters.status) return false;

    return true;
  });

  const {
    paginatedData,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalCount,
    selectedIds,
    toggleRowSelection,
    clearSelection,
    selectedCount,
    selectedItems
  } = useDataTable(filteredDoctors, { initialPageSize: 10 });

  const getDoctorName = (d) => {
    return d.displayName || [d.firstName, d.lastName].filter(Boolean).join(' ') || 'Unnamed Physician';
  };

  const getPatientsCount = (doctorId) => {
    return patientMap[doctorId]?.length || 0;
  };

  const getOrdersData = (doctorId) => {
    const docOrders = orderMap[doctorId] || [];
    const rev = docOrders.reduce((sum, o) => sum + (o.total || o.amount || 0), 0);
    return { count: docOrders.length, revenue: rev };
  };

  const columns = [
    {
      key: 'physician',
      header: 'Physician',
      render: (d) => {
        const name = getDoctorName(d);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
              {name.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{d.email}</div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'specialty',
      header: 'Specialty / Clinic',
      render: (d) => (
        <div style={{ fontSize: '0.85rem' }}>
          <div style={{ color: 'var(--text-main)', fontWeight: 500 }}>{d.specialty || 'General'}</div>
          <div style={{ color: 'var(--text-muted)' }}>{d.clinicName || '-'}</div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (d) => {
        const statusStr = d.isArchived ? 'Archived' : (d.status || 'Active');
        const isError = statusStr === 'Archived' || statusStr === 'Pending';
        return (
          <span style={{ 
            padding: '0.25rem 0.75rem', 
            borderRadius: '1rem', 
            fontSize: '0.75rem', 
            fontWeight: 600,
            backgroundColor: isError ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
            color: isError ? 'var(--color-danger)' : 'var(--color-success)'
          }}>
            {statusStr}
          </span>
        );
      }
    },
    {
      key: 'patients',
      header: 'Patients',
      render: (d) => <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>{getPatientsCount(d.id)}</span>
    },
    {
      key: 'orders',
      header: 'Orders',
      render: (d) => <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>{getOrdersData(d.id).count}</span>
    },
    {
      key: 'revenue',
      header: 'Revenue',
      render: (d) => <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>AED {getOrdersData(d.id).revenue.toLocaleString()}</span>
    }
  ];

  // Quick actions to show on hover
  const renderActions = (d) => (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <button 
        onClick={(e) => { e.stopPropagation(); onSelectDoctor(d); }}
        style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', borderRadius: '6px', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
        View Profile
      </button>
      <button 
        title="Assign Patient"
        onClick={(e) => { e.stopPropagation(); toast.info('Assign Patient modal coming soon'); }}
        style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-main)' }}>
        <UserPlus size={14} />
      </button>
      <button 
        title="Create Prescription"
        onClick={(e) => { e.stopPropagation(); toast.info('Prescription creator coming soon'); }}
        style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-main)' }}>
        <FilePlus size={14} />
      </button>
    </div>
  );

  const handleBulkExportCSV = () => {
    const items = selectedItems;
    if (!items.length) return;
    exportToCSV(
      items.map(d => ({
        id: d.id,
        name: getDoctorName(d),
        email: d.email,
        specialty: d.specialty || 'General',
        clinic: d.clinicName || '-',
        status: d.isArchived ? 'Archived' : (d.status || 'Active'),
        patients: getPatientsCount(d.id),
        orders: getOrdersData(d.id).count,
        revenue: getOrdersData(d.id).revenue
      })),
      `physicians_export_${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { header: 'ID', accessor: 'id' },
        { header: 'Name', accessor: 'name' },
        { header: 'Email', accessor: 'email' },
        { header: 'Specialty', accessor: 'specialty' },
        { header: 'Clinic', accessor: 'clinic' },
        { header: 'Status', accessor: 'status' },
        { header: 'Patients', accessor: 'patients' },
        { header: 'Orders', accessor: 'orders' },
        { header: 'Revenue (AED)', accessor: 'revenue' },
      ]
    );
  };

  const handleBulkAction = async (action) => {
    if (!selectedCount) return;
    let msg = `Perform ${action} on ${selectedCount} physicians?`;
    if (action === 'delete') msg = `PERMANENTLY DELETE ${selectedCount} physicians? This cannot be undone!`;
    
    notifier.confirmCritical(msg, async () => {
      try {
        for (const uid of Array.from(selectedIds)) {
          const userRef = doc(db, 'users', uid);
          if (action === 'approve') await updateDoc(userRef, { status: 'active', approved: true });
          if (action === 'revoke') await updateDoc(userRef, { status: 'pending', approved: false });
          if (action === 'archive') await updateDoc(userRef, { isArchived: true });
          if (action === 'delete') await updateDoc(userRef, { isDeleted: true });
        }
        clearSelection();
        if (onRefresh) onRefresh();
        toast.success(`Bulk action ${action} completed`);
      } catch (err) {
        toast.error('Bulk action failed.');
        console.error(err);
      }
    });
  };

  const emptyState = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem', textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--color-bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <Users size={32} color="var(--primary)" />
      </div>
      <h2 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', fontSize: '1.25rem' }}>No Physicians Found</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 0 2rem 0', lineHeight: 1.5 }}>
        No physicians matched your criteria or none exist in the platform.
      </p>
      <button className="gcp-btn-primary" onClick={onAddPhysician}>
        <Plus size={16} style={{ marginRight: '0.5rem' }} /> Add First Physician
      </button>
    </div>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Table */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <DataTable 
          data={paginatedData}
          columns={columns}
          keyField="id"
          selectedIds={Array.from(selectedIds)}
          onSelectionChange={(newArr) => {
            clearSelection();
            newArr.forEach(id => toggleRowSelection(id));
          }}
          isLoading={isLoading}
          enableExport={false}
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalCount}
          rowsPerPage={pageSize}
          onRowsPerPageChange={setPageSize}
          onPageChange={setPage}
          emptyState={emptyState}
          onRowClick={onSelectDoctor}
          renderActions={renderActions}
        />
      </div>

      {/* Bulk Actions */}
      {selectedCount > 0 && (
        <BulkActionsBar
          selectedCount={selectedCount}
          onClear={clearSelection}
          actions={[
            { label: 'Export CSV', icon: <Archive size={14} />, onClick: handleBulkExportCSV },
            { label: 'Assign Protocol', icon: <ClipboardList size={14} />, onClick: () => { toast.info('Assign Protocol modal coming soon'); clearSelection(); } },
            { label: 'Request Audit', icon: <Activity size={14} />, onClick: () => handleBulkAction('request_audit') },
            { label: 'Safety Update', icon: <Mail size={14} />, onClick: () => { toast.info('Safety Update mailer coming soon'); clearSelection(); } },
            { label: 'Approve', icon: <CheckCircle2 size={14} />, onClick: () => handleBulkAction('approve') },
            { label: 'Archive', icon: <Archive size={14} />, onClick: () => handleBulkAction('archive'), variant: 'danger' },
          ]}
        />
      )}

    </div>
  );
}
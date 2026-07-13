'use client';
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import React, { useState, useMemo, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { db, functions } from '../../../firebase';
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { getApprovalEmailHtml } from '../../../data/emailTemplate';
import { exportToCSV } from '../../../utils/exportUtils';
import { logAction } from '../../../services/auditLogger';
import { useToast } from '../../../hooks/useToast';
import notifier from '../../../services/NotificationService';

import AdminPageHeader from '../../../components/admin/AdminPageHeader';
import GlobalSearchBar from '../../../components/ui/GlobalSearchBar';
import DataTable from '../../../components/ui/DataTable';
import BulkActionsBar from '../../../components/ui/BulkActionsBar';
import { ToastContainer } from '../../../components/common/Toast';
import AppStatusChip from '../../../components/ui/AppStatusChip';
import AppEntityCell from '../../../components/ui/AppEntityCell';
import AppActionGroup from '../../../components/ui/AppActionGroup';

import {
  Users, UserCheck, ShieldCheck, Mail, Archive,
  Trash2, Plus, Edit, AlertCircle, XCircle, Eye,
  Building2, DollarSign, CheckCircle2, Search
} from 'lucide-react';

import { useFirestoreCollection } from '../../../hooks/data/useFirestoreCollection';
import { useAlgoliaSearch } from '../../../hooks/data/useAlgoliaSearch';
import { useDataTable } from '../../../hooks/ui/useDataTable';

import CreateUserModal from '../../../components/admin/CreateUserModal';
import UserDetailsModal from '../../../components/admin/UserDetailsModal';
import EditingUserModal from '../../../components/admin/EditingUserModal';
import FinancialWholesalerModal from '../../../components/admin/FinancialWholesalerModal';

const EMAILJS_TEMPLATE_ID = 'template_7unfks8'; 

export default function UsersTable({ role = 'admin', defaultRole = null, readOnly = false, canApprove = true }) {
  const { user } = useAuth();
  const { toasts, toast } = useToast();
  const searchParams = useSearchParams();
  const deepLinkSearch = searchParams.get('search');
  const deepLinkNew = searchParams.get('new');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [detailsUser, setDetailsUser] = useState(null);
  const [financialWholesaler, setFinancialWholesaler] = useState(null);
  const [emailPreview, setEmailPreview] = useState(null);
  
  const [allDoctors, setAllDoctors] = useState([]);
  const [allWholesalers, setAllWholesalers] = useState([]);

  useEffect(() => {
    if (deepLinkNew === 'true') {
      setIsCreateModalOpen(true);
      const url = new URL(window.location.href);
      url.searchParams.delete('new');
      window.history.replaceState({}, '', url.toString());
    }
  }, [deepLinkNew]);

  useEffect(() => {
    if (isCreateModalOpen) {
      const fetchDoctorsAndWholesalers = async () => {
        try {
          const docQuery = query(collection(db, 'users'), where('roles', 'array-contains', 'doctor'));
          const wsQuery = query(collection(db, 'users'), where('roles', 'array-contains', 'wholesaler'));
          const [docSnap, wsSnap] = await Promise.all([getDocs(docQuery), getDocs(wsQuery)]);
          setAllDoctors(docSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          setAllWholesalers(wsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {
          console.error("Error loading doctors/wholesalers for creation modal:", e);
        }
      };
      fetchDoctorsAndWholesalers();
    }
  }, [isCreateModalOpen]);

  // Use a targeted query if a default role is passed. Otherwise fetch all and we will filter client-side.
  // Note: For huge scales, fetching all users locally may be heavy. But Admin Patients currently fetches all.
  const queryConstraints = defaultRole ? [where('roles', 'array-contains', defaultRole)] : [];
  const { data: users, loading: firestoreLoading, refetch } = useFirestoreCollection('users', { constraints: queryConstraints });

  const { searchTerm, setSearchTerm, results: algoliaResults, isSearching: algoliaLoading } = useAlgoliaSearch('atlas_users');

  useEffect(() => {
    if (deepLinkSearch) setSearchTerm(deepLinkSearch);
  }, [deepLinkSearch, setSearchTerm]);

  const [roleFilter, setRoleFilter] = useState(defaultRole || 'all');
  const [showArchived, setShowArchived] = useState(false);
  const [purchaseFilter, setPurchaseFilter] = useState('all');

  const filteredUsers = useMemo(() => {
    let source = users || [];

    if (searchTerm && algoliaResults) {
      const hitIds = new Set(algoliaResults.map(h => h.objectID));
      source = source.filter(u => hitIds.has(u.id));
    } else if (searchTerm) {
      const q = searchTerm.toLowerCase();
      source = source.filter(u => 
        (u.fullName || '').toLowerCase().includes(q) ||
        (u.displayName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.institution || '').toLowerCase().includes(q)
      );
    }

    return source.filter(u => {
      if (u.isDeleted) return false;
      if (showArchived ? !u.isArchived : u.isArchived) return false;
      
      const roles = u.roles || (u.role ? [u.role] : []);
      const appliedRole = defaultRole || (roleFilter !== 'all' ? roleFilter : null);
      if (appliedRole && !roles.includes(appliedRole)) return false;

      if (purchaseFilter === 'active' && !u.approved) return false;
      if (purchaseFilter === 'pending' && u.approved) return false;

      return true;
    });
  }, [users, searchTerm, algoliaResults, showArchived, roleFilter, defaultRole, purchaseFilter]);

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
  } = useDataTable(filteredUsers, { initialPageSize: 20 });

  async function handleToggleApproval(userId, currentStatus) {
    if (readOnly || !canApprove) return;
    const confirmMessage = currentStatus ? "Are you sure you want to REVOKE this user's professional access?" : 'Approve this user for professional access?';
    notifier.confirmCritical(confirmMessage, async () => {
      try {
        await updateDoc(doc(db, 'users', userId), { approved: !currentStatus });
        await logAction(user?.uid || 'admin', 'admin', currentStatus ? 'USER_REVOKE' : 'USER_APPROVE', userId);
        refetch();
      } catch (err) {
        toast.error('Failed to update user status.');
      }
    });
  }

  async function handleToggleArchive(userId, currentStatus) {
    if (readOnly) return;
    const confirmMessage = currentStatus ? 'Unarchive this user?' : 'Archive this user? They will be hidden from the main list.';
    notifier.confirmCritical(confirmMessage, async () => {
      try {
        await updateDoc(doc(db, 'users', userId), { isArchived: !currentStatus });
        await logAction(user?.uid || 'admin', 'admin', currentStatus ? 'USER_UNARCHIVE' : 'USER_ARCHIVE', userId);
        refetch();
      } catch (err) {
        toast.error('Failed to archive user.');
      }
    });
  }

  async function handleImpersonate(userId) {
    if (readOnly) return;
    notifier.confirmCritical("Are you sure you want to log in as this user in a new tab?", async () => {
      try {
        const toastId = toast.loading('Generating secure session...', { position: 'bottom-right' });
        const generateToken = httpsCallable(functions, 'generateImpersonationToken');
        const { data } = await generateToken({ targetUid: userId });
        if (data && data.customToken) {
          toast.dismiss(toastId);
          toast.success('Session generated! Opening in new tab.');
          window.open(`${window.location.origin}/impersonate?token=${data.customToken}`, '_blank');
        } else {
          throw new Error('No custom token returned');
        }
      } catch (err) {
        toast.dismiss();
        toast.error(err.message || 'Failed to impersonate user.');
      }
    });
  }

  async function handleSaveUser(e) {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'users', editingUser.id), {
        fullName: editingUser.fullName || '',
        institution: editingUser.institution || '',
        role: editingUser.role || 'guest',
      });
      await logAction(user?.uid || 'admin', 'admin', 'USER_UPDATE', editingUser.id);
      setEditingUser(null);
      refetch();
    } catch (err) {
      toast.error('Failed to save user.');
    }
  }

  async function handleSendEmail(u) {
    if (readOnly) return;
    try {
      const sendEmail = httpsCallable(functions, 'sendEmail');
      await sendEmail({
        templateId: EMAILJS_TEMPLATE_ID,
        templateParams: {
          to_email: u.email,
          to_name: u.fullName || u.displayName || 'Researcher',
          reply_to: 'business@atlas-health.com',
          email_body_html: getApprovalEmailHtml(u.fullName || u.displayName),
        }
      });
      toast.success(`Email sent successfully to ${u.email}`);
    } catch (error) {
      toast.error('Failed to send email.');
    }
  }

  async function handleBulkAction(action) {
    if (!selectedCount || readOnly) return;
    let msg = `Perform ${action} on ${selectedCount} users?`;
    if (action === 'delete') msg = `PERMANENTLY DELETE ${selectedCount} users? This cannot be undone!`;
    notifier.confirmCritical(msg, async () => {
      try {
        for (const uid of Array.from(selectedIds)) {
          const userRef = doc(db, 'users', uid);
          if (action === 'approve') await updateDoc(userRef, { approved: true });
          if (action === 'revoke') await updateDoc(userRef, { approved: false });
          if (action === 'archive') await updateDoc(userRef, { isArchived: true });
          if (action === 'delete') await updateDoc(userRef, { isDeleted: true });
          await logAction(user?.uid || 'admin', 'admin', `BULK_USER_${action.toUpperCase()}`, uid);
        }
        clearSelection();
        refetch();
        toast.success(`Bulk action ${action} completed`);
      } catch (err) {
        toast.error('Bulk action failed.');
      }
    });
  }

  const columns = [
    {
      key: 'user',
      header: 'User / Clinic',
      render: (u) => {
        const roles = (u.roles && u.roles.length > 0 ? u.roles : u.role ? [u.role] : []).filter(
          (r) => !(defaultRole === 'wholesaler' && r === 'wholesaler')
        );
        return (
          <AppEntityCell
            title={u.fullName || u.displayName || `User (${u.id.substring(0, 6)})`}
            subtitle={
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span>{u.institution || 'Individual / No Clinic'}</span>
                {u.email && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>↳ {u.email}</span>}
              </div>
            }
            badges={[...roles, u.zohoContactId ? 'Zoho Sync' : 'Local']}
          />
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      hideOnMobile: true,
      render: (u) => {
        let statusStr = u.isArchived ? 'Archived' : (u.approved ? 'Active' : 'Pending');
        return <AppStatusChip status={statusStr} />;
      }
    }
  ];

  if (!readOnly) {
    columns.push({
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (u) => {
        const actions = [];
        if (u.role === 'wholesaler' || (u.roles && u.roles.includes('wholesaler'))) {
          actions.push({ type: 'pricing', onClick: () => setFinancialWholesaler(u) });
        }
        if (u.linkedPatientId) {
          actions.push({ type: 'custom', icon: Eye, label: 'Ver Perfil Clínico', onClick: () => window.open(`/admin?s=patients&patientId=${u.linkedPatientId}`, '_blank') });
        }
        if (!u.isArchived) {
          actions.push({ type: 'custom', icon: UserCheck, label: 'Login As', onClick: () => handleImpersonate(u.id) });
        }
        actions.push({ type: 'edit', onClick: () => setEditingUser(u) });
        if (canApprove) {
          actions.push({ type: u.approved ? 'revoke' : 'approve', onClick: () => handleToggleApproval(u.id, u.approved) });
        }
        actions.push({ type: 'archive', onClick: () => handleToggleArchive(u.id, u.isArchived) });
        if (u.approved && !u.isArchived) {
          actions.push({ type: 'send', onClick: () => handleSendEmail(u) });
          actions.push({ type: 'view', onClick: () => setDetailsUser(u) });
        }
        return <div style={{ display: 'flex', justifyContent: 'flex-end' }}><AppActionGroup actions={actions} /></div>;
      }
    });
  }

  const handleBulkExportCSV = () => {
    const items = selectedItems;
    if (!items.length) return;
    exportToCSV(
      items,
      `users_export_${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { header: 'ID', accessor: 'id' },
        { header: 'Name', accessor: (u) => u.fullName || u.displayName || '' },
        { header: 'Email', accessor: 'email' },
        { header: 'Role', accessor: (u) => (u.roles ? u.roles.join(', ') : u.role || '') },
        { header: 'Status', accessor: (u) => (u.approved ? 'Active' : 'Pending') },
        { header: 'Institution', accessor: 'institution' }
      ]
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <ToastContainer toasts={toasts} onDismiss={toast.dismiss} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <GlobalSearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search users..."
          resultCount={firestoreLoading ? undefined : filteredUsers.length}
          isLoading={algoliaLoading}
          namespace="atlas_users"
        />
        <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '13px', padding: '0.4rem 1rem' }}>
          <Plus size={16} /> Create User
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'white', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
        {defaultRole !== 'doctor' && defaultRole !== 'wholesaler' && (
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ padding: '4px 12px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="doctor">Doctor</option>
            <option value="wholesaler">Wholesaler</option>
            <option value="patient">Patient</option>
            <option value="guest">Guest</option>
          </select>
        )}
        <label style={{ display: 'flex', gap: '0.5rem', fontSize: '14px', alignItems: 'center' }}>
          <input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} /> Show Archived
        </label>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <DataTable
          data={paginatedData}
          columns={columns}
          keyField="id"
          selectedIds={Array.from(selectedIds)}
          onSelectionChange={(newArr) => {
            clearSelection();
            newArr.forEach(id => toggleRowSelection(id));
          }}
          isLoading={firestoreLoading}
          enableExport={false}
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalCount}
          rowsPerPage={pageSize}
          onRowsPerPageChange={setPageSize}
          onPageChange={setPage}
          emptyTitle="No Users Found"
          emptyDescription="There are no users matching your criteria."
        />
      </div>

      {selectedCount > 0 && (
        <BulkActionsBar
          selectedCount={selectedCount}
          onClear={clearSelection}
          actions={[
            { label: 'Export CSV', icon: <Archive size={14} />, onClick: handleBulkExportCSV },
            { label: 'Approve', icon: <CheckCircle2 size={14} />, onClick: () => handleBulkAction('approve') },
            { label: 'Revoke', icon: <XCircle size={14} />, onClick: () => handleBulkAction('revoke'), variant: 'danger' },
            { label: 'Archive', icon: <Archive size={14} />, onClick: () => handleBulkAction('archive') },
            { label: 'Delete', icon: <Trash2 size={14} />, onClick: () => handleBulkAction('delete'), variant: 'danger' }
          ]}
        />
      )}

      {emailPreview && (
        <div id="email-preview-container" className="card" style={{ padding: '2rem', marginTop: '2rem', border: '2px solid var(--primary-light)' }}>
          <div dangerouslySetInnerHTML={{ __html: getApprovalEmailHtml(emailPreview.fullName || emailPreview.displayName) }} />
        </div>
      )}

      {editingUser && <EditingUserModal editingUser={editingUser} setEditingUser={setEditingUser} handleSaveUser={handleSaveUser} />}
      {financialWholesaler && <FinancialWholesalerModal financialWholesaler={financialWholesaler} setFinancialWholesaler={setFinancialWholesaler} />}
      {detailsUser && <UserDetailsModal isOpen={!!detailsUser} onClose={() => setDetailsUser(null)} user={detailsUser} />}
      {isCreateModalOpen && <CreateUserModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} doctors={allDoctors} wholesalers={allWholesalers} onCreated={refetch} defaultRole={defaultRole || 'patient'} />}
    </div>
  );
}

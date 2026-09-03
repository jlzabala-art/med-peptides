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

import PageHeader from '../../../components/ui/PageHeader';
import GlobalSearchBar from '../../../components/ui/GlobalSearchBar';
import DataTable from '../../../components/ui/DataTable';
import BulkActionsBar from '../../../components/ui/BulkActionsBar';
import { ToastContainer } from '../../../components/common/Toast';
import { StatusChip, MetricCard, AppActionGroup, RoleBadge } from '../../../components/ui';
import AppEntityCell from '../../../components/ui/AppEntityCell';
import CopyableId from '../../../components/ui/CopyableId';

import {
  Users, UserCheck, ShieldCheck, Mail, Archive,
  Trash2, Plus, Edit, AlertCircle, XCircle, Eye,
  Building2, DollarSign, CheckCircle2, Search, Download, UserPlus, Clock, Stethoscope, Sparkles
} from 'lucide-react';

import { useFirestorePaginatedCollection } from '../../../hooks/data/useFirestorePaginatedCollection';
import { useAlgoliaSearch } from '../../../hooks/data/useAlgoliaSearch';
import { useDataTable } from '../../../hooks/ui/useDataTable';

import UserFormDrawer from '../../../components/admin/UserFormDrawer';
import FinancialWholesalerModal from '../../../components/admin/FinancialWholesalerModal';
import User360Drawer from '../../../components/admin/users/User360Drawer';
import InviteUserModal from '../../../components/admin/users/InviteUserModal';
import AIUserIntelligenceModal from '../../../components/admin/users/AIUserIntelligenceModal';
import { useAdminRoleSimulation } from '../../../hooks/admin/useAdminRoleSimulation';
import { EMAILJS_CONFIG } from '@/config/emailjs';

const EMAILJS_TEMPLATE_ID = EMAILJS_CONFIG.TEMPLATES.USER_WELCOME; 

export default function UsersTable({ initialUsers = null, kpisData = null, isSubTab = false, role = 'admin', defaultRole = null, readOnly = false, canApprove = true }) {
  const { user } = useAuth();
  const { impersonateUser } = useAdminRoleSimulation();
  const { toasts, toast } = useToast();
  const searchParams = useSearchParams();
  const deepLinkSearch = searchParams.get('search');
  const deepLinkNew = searchParams.get('new');
  const deepLinkStatus = searchParams.get('status');
  const deepLinkPreselect = searchParams.get('preselect');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [detailsUser, setDetailsUser] = useState(null);
  const [financialWholesaler, setFinancialWholesaler] = useState(null);
  const [emailPreview, setEmailPreview] = useState(null);
  const [aiTargetUser, setAiTargetUser] = useState(null);
  
  const [allDoctors, setAllDoctors] = useState([]);
  const [allWholesalers, setAllWholesalers] = useState([]);

  // Robust Name Extractor supporting patient collections, Zoho sync, and auth documents
  const getUserFullName = (u) => {
    if (!u) return 'Unknown User';
    return (
      u.fullName ||
      u.displayName ||
      ([u.firstName, u.lastName].filter(Boolean).join(' ')) ||
      u.name ||
      u.patientName ||
      u.contactName ||
      (u.email ? u.email.split('@')[0] : 'Unknown User')
    );
  };

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

  const [roleFilter, setRoleFilter] = useState(defaultRole || 'all');
  const [showArchived, setShowArchived] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [originFilter, setOriginFilter] = useState('all');

  // Build whereConditions for real pagination
  const whereConditions = useMemo(() => {
    const conditions = [];
    const appliedRole = defaultRole || (roleFilter !== 'all' ? roleFilter : null);
    if (appliedRole) conditions.push(['roles', 'array-contains', appliedRole]);
    // Client-side fallback for `showArchived` to avoid index issues if we don't have one,
    // but ideally we would query it. Let's filter locally below.
    return conditions;
  }, [defaultRole, roleFilter]);

  const [rowsPerPage, setRowsPerPage] = useState(25);

  // To avoid missing composite index errors (roles array-contains + createdAt desc),
  // we drop the explicit ordering if a dynamic roleFilter is active. 
  // Firestore will fall back to ordering by document ID (which works without a composite index).
  const dynamicOrderBy = useMemo(() => {
    if (roleFilter !== 'all' && roleFilter !== defaultRole) {
      return []; // No explicit orderBy, relies on default document ID ordering
    }
    return [['createdAt', 'desc']];
  }, [roleFilter, defaultRole]);

  const { 
    data: users, 
    isLoading: firestoreLoading, 
    refresh: refetch, 
    loadMore, 
    hasMore, 
    isFetchingMore 
  } = useFirestorePaginatedCollection('users', { 
    constraints: [], 
    whereConditions,
    orderByFields: dynamicOrderBy,
    pageSize: rowsPerPage
  });

  const [searchTerm, setSearchTerm] = useState('');
  const { hits: algoliaResults, isAlgoliaActive, loading: algoliaLoading, error: algoliaError } = useAlgoliaSearch('atlas_users', searchTerm);

  useEffect(() => {
    if (deepLinkSearch) {
      setSearchTerm(deepLinkSearch);
    }
  }, [deepLinkSearch]);

  // Set initial status filter from deep link
  useEffect(() => {
    if (deepLinkStatus) {
      setStatusFilter(deepLinkStatus);
    }
  }, [deepLinkStatus]);

  const filteredUsers = useMemo(() => {
    let source = users || [];

    if (!searchTerm || !searchTerm.trim()) {
      // no search
    } else {
      const q = searchTerm.toLowerCase();
      const localHits = source.filter(u => {
        const name = getUserFullName(u).toLowerCase();
        const email = (u.email || u.contactEmail || '').toLowerCase();
        const id = (u.id || '').toLowerCase();
        const inst = (u.institution || u.clinicName || u.practiceName || '').toLowerCase();
        const country = (u.country || '').toLowerCase();
        const phone = (u.phone || u.phoneNumber || '').toLowerCase();
        return name.includes(q) || email.includes(q) || id.includes(q) || inst.includes(q) || country.includes(q) || phone.includes(q);
      });

      const algoliaMapped = isAlgoliaActive && !algoliaError && algoliaResults
        ? algoliaResults.map(h => source.find(u => u.id === h.objectID) || { ...h, id: h.objectID })
        : [];

      if (isAlgoliaActive && !algoliaError) {
        if (algoliaLoading && (!algoliaResults || algoliaResults.length === 0)) {
          source = localHits;
        } else {
          const combined = [...algoliaMapped];
          const algoliaIds = new Set(algoliaMapped.map(u => u.id));
          for (const u of localHits) {
            if (!algoliaIds.has(u.id)) combined.push(u);
          }
          source = combined;
        }
      } else {
        source = localHits;
      }
    }

    return source.filter(u => {
      if (u.isDeleted) return false;
      if (showArchived ? !u.isArchived : u.isArchived) return false;
      
      const roles = u.roles || (u.role ? [u.role] : []);
      const appliedRole = defaultRole || (roleFilter !== 'all' ? roleFilter : null);
      if (appliedRole && !roles.includes(appliedRole)) return false;

      if (statusFilter === 'active' && !u.approved) return false;
      if (statusFilter === 'pending' && u.approved) return false;

      if (originFilter === 'zoho' && !u.zohoContactId) return false;
      if (originFilter === 'local' && u.zohoContactId) return false;

      return true;
    });
  }, [users, searchTerm, algoliaResults, showArchived, roleFilter, defaultRole, statusFilter, originFilter, isAlgoliaActive, algoliaError, algoliaLoading]);

  // Keep useDataTable just for selection logic (ignore its local pagination)
  const {
    selectedIds,
    toggleRowSelection,
    clearSelection,
    selectedCount,
    selectedItems,
    selectAll
  } = useDataTable(filteredUsers, { initialPageSize: 500 }); // Large page size to bypass local pagination

  // Pre-select users if instructed by deep link
  useEffect(() => {
    if (deepLinkPreselect === 'true' && filteredUsers.length > 0) {
      // Select all loaded users that match the filters
      selectAll(filteredUsers.map(u => u.id));
      
      // Clean up URL to prevent re-selection on subsequent navigation within the page
      if (window.history && window.history.replaceState) {
        const url = new URL(window.location.href);
        url.searchParams.delete('preselect');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [deepLinkPreselect, filteredUsers, selectAll]);

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
    setIsSavingUser(true);
    try {
      await updateDoc(doc(db, 'users', editingUser.id), {
        fullName: editingUser.fullName || '',
        institution: editingUser.institution || '',
        role: editingUser.role || 'guest',
      });
      await logAction(user?.uid || 'admin', 'admin', 'USER_UPDATE', editingUser.id);
      toast.success(`User ${editingUser.fullName || editingUser.email} updated successfully.`);
      setEditingUser(null);
      refetch();
    } catch (err) {
      toast.error('Failed to save user.');
    } finally {
      setIsSavingUser(false);
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

  const handleInlineRoleChange = async (userId, newRole) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: newRole,
        roles: [newRole]
      });
      toast.success(`Role updated to ${newRole.toUpperCase()}`);
      refetch();
    } catch (err) {
      toast.error('Failed to update role: ' + err.message);
    }
  };

  const handleInlinePricingChange = async (userId, newChannel) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        pricingChannel: newChannel,
        priceTier: newChannel
      });
      toast.success(`Pricing channel updated to ${newChannel.toUpperCase()}`);
      refetch();
    } catch (err) {
      toast.error('Failed to update pricing channel: ' + err.message);
    }
  };

  const columns = [
    {
      key: 'user',
      header: 'User',
      mobilePriority: 1,
      width: '28%',
      render: (u) => {
        const name = getUserFullName(u);
        const email = u.email || u.contactEmail || 'No email';
        const role = u.role || (u.roles && u.roles[0]) || 'patient';
        const initial = name.charAt(0).toUpperCase() || 'U';

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: role === 'doctor' ? '#ccfbf1' : role === 'wholesaler' ? '#ffedd5' : role === 'admin' ? '#e0e7ff' : role === 'clinic' ? '#f3e8ff' : '#f1f5f9',
              color: role === 'doctor' ? '#0f766e' : role === 'wholesaler' ? '#c2410c' : role === 'admin' ? '#4338ca' : role === 'clinic' ? '#7e22ce' : '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              flexShrink: 0
            }}>
              {initial}
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', wordBreak: 'break-word' }}>
                {name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', wordBreak: 'break-word' }}>{email}</span>
                <CopyableId value={u.id} iconOnly={true} />
              </div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'roles',
      header: 'Role',
      mobilePriority: 2,
      width: '18%',
      render: (u) => {
        const currentRole = u.role || (u.roles && u.roles[0]) || 'patient';
        return (
          <select
            value={currentRole}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => handleInlineRoleChange(u.id, e.target.value)}
            style={{
              padding: '0.35rem 0.6rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.78rem',
              fontWeight: 600,
              backgroundColor: '#f8fafc',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <option value="admin">Admin</option>
            <option value="doctor">Doctor</option>
            <option value="clinic">Clinic</option>
            <option value="wholesaler">Wholesaler</option>
            <option value="patient">Patient</option>
          </select>
        );
      }
    },
    {
      key: 'pricingChannel',
      header: 'Pricing Channel',
      mobilePriority: 2,
      width: '20%',
      render: (u) => {
        const currentChannel = u.pricingChannel || u.priceTier || (u.role === 'wholesaler' ? 'wholesale' : u.role === 'doctor' ? 'clinic' : 'retail');
        return (
          <select
            value={currentChannel}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => handleInlinePricingChange(u.id, e.target.value)}
            style={{
              padding: '0.35rem 0.6rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.78rem',
              fontWeight: 600,
              backgroundColor: '#f0f9ff',
              color: '#0369a1',
              cursor: 'pointer'
            }}
          >
            <option value="wholesale">Wholesale B2B</option>
            <option value="clinic">Clinic / Doctor</option>
            <option value="retail">Retail Public</option>
            <option value="cost">Acquisition Cost</option>
          </select>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      hideOnMobile: true,
      width: '14%',
      render: (u) => {
        let statusStr = u.isArchived ? 'archived' : (u.approved ? 'active' : 'pending');
        return <StatusChip status={statusStr} />;
      }
    }
  ];

  if (!readOnly) {
    columns.push({
      key: 'actions',
      header: 'Actions',
      isAction: true,
      align: 'right',
      width: '180px',
      render: (u) => {
        const actions = [];
        
        // AI User Intelligence Action
        actions.push({
          label: 'AI Outreach',
          icon: Sparkles,
          onClick: (e) => { 
            e.stopPropagation(); 
            setAiTargetUser(u);
          }
        });

        if (!u.isArchived && canApprove) {
          actions.push({
            type: u.approved ? 'revoke' : 'approve',
            onClick: (e) => { e.stopPropagation(); handleToggleApproval(u.id, u.approved); }
          });
        }
        
        if (!u.isArchived) {
          actions.push({
            label: 'Act As',
            icon: Eye,
            onClick: (e) => { 
              e.stopPropagation(); 
              impersonateUser(u);
              toast.success(`Now simulating session as ${getUserFullName(u)}`);
            }
          });
        }
        
        actions.push({
          type: 'edit',
          onClick: (e) => { e.stopPropagation(); setDetailsUser(u); }
        });

        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
            <AppActionGroup actions={actions} maxVisible={3} />
          </div>
        );
      }
    });
  }

  const handleBulkExportCSV = () => {
    const items = selectedItems.length > 0 ? selectedItems : filteredUsers;
    if (!items.length) return;
    exportToCSV(
      items,
      `users_export_${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { header: 'ID', accessor: 'id' },
        { header: 'Name', accessor: (u) => getUserFullName(u) },
        { header: 'Email', accessor: (u) => u.email || u.contactEmail || '' },
        { header: 'Role', accessor: (u) => (u.roles ? u.roles.join(', ') : u.role || '') },
        { header: 'Status', accessor: (u) => (u.approved ? 'Active' : 'Pending') },
        { header: 'Institution', accessor: 'institution' }
      ]
    );
  };

  const filterOptions = [];
  if (defaultRole !== 'doctor' && defaultRole !== 'wholesaler') {
    filterOptions.push({
      id: 'roleFilter',
      label: 'Role',
      value: roleFilter,
      onChange: setRoleFilter,
      options: [
        { label: 'All Roles', value: 'all' },
        { label: 'Admin', value: 'admin' },
        { label: 'Doctor', value: 'doctor' },
        { label: 'Clinic', value: 'clinic' },
        { label: 'Wholesaler', value: 'wholesaler' },
        { label: 'Patient', value: 'patient' },
        { label: 'Guest', value: 'guest' }
      ]
    });
  }
  filterOptions.push({
    id: 'statusFilter',
    label: 'Status',
    value: statusFilter,
    onChange: setStatusFilter,
    options: [
      { label: 'All Statuses', value: 'all' },
      { label: 'Active (Approved)', value: 'active' },
      { label: 'Pending Approval', value: 'pending' }
    ]
  });
  filterOptions.push({
    id: 'originFilter',
    label: 'Source',
    value: originFilter,
    onChange: setOriginFilter,
    options: [
      { label: 'All Sources', value: 'all' },
      { label: 'Local Portal', value: 'local' },
      { label: 'Zoho Sync', value: 'zoho' }
    ]
  });
  filterOptions.push({
    id: 'archivedFilter',
    label: 'Archive',
    value: showArchived ? 'archived' : 'active',
    onChange: (val) => setShowArchived(val === 'archived'),
    options: [
      { label: 'Active Users', value: 'active' },
      { label: 'Show Archived', value: 'archived' }
    ]
  });

  const activeFilters = [];
  if (roleFilter !== 'all') {
    activeFilters.push({
      id: 'role',
      label: `Role: ${roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}`,
      onRemove: () => setRoleFilter('all')
    });
  }
  if (showArchived) {
    activeFilters.push({
      id: 'archived',
      label: 'Showing Archived',
      onRemove: () => setShowArchived(false)
    });
  }
  if (statusFilter !== 'all') {
    activeFilters.push({
      id: 'status',
      label: `Status: ${statusFilter === 'active' ? 'Active' : 'Pending'}`,
      onRemove: () => setStatusFilter('all')
    });
  }
  if (originFilter !== 'all') {
    activeFilters.push({
      id: 'origin',
      label: `Source: ${originFilter === 'local' ? 'Local' : 'Zoho Sync'}`,
      onRemove: () => setOriginFilter('all')
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', minHeight: 0 }}>
      <ToastContainer toasts={toasts} onDismiss={toast.dismiss} />

      {!isSubTab && (
        <div style={{ flexShrink: 0 }}>
          <PageHeader 
            title="Users Management"
            subtitle="Manage all users across portals, approve access, and assign roles."
            icon={Users}
            actions={
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button 
                  onClick={handleBulkExportCSV} 
                  className="gcp-btn-secondary"
                  disabled={!filteredUsers.length}
                  title="Export current view to CSV"
                >
                  <Download size={16} />
                  <span>Export ({filteredUsers.length})</span>
                </button>
                <button 
                  onClick={() => setIsInviteModalOpen(true)} 
                  className="gcp-btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#16a34a', borderColor: '#86efac' }}
                >
                  <Mail size={16} />
                  <span>Invite / WhatsApp</span>
                </button>
                <button onClick={() => setIsCreateModalOpen(true)} className="gcp-btn-primary">
                  <Plus size={16} />
                  <span>Create User</span>
                </button>
              </div>
            }
          />
        </div>
      )}

      {kpisData && (
        <div className="users-kpi-grid">
          <MetricCard
            title="Total Users"
            value={kpisData.total}
            icon={Users}
            color="var(--color-primary)"
            onClick={() => { setRoleFilter('all'); setStatusFilter('all'); }}
            style={{ cursor: 'pointer' }}
          />
          <MetricCard
            title="Patients"
            value={kpisData.patients}
            icon={UserPlus}
            color="var(--color-success)"
            onClick={() => { setRoleFilter('patient'); setStatusFilter('all'); }}
            style={{ cursor: 'pointer' }}
          />
          <MetricCard
            title="Doctors"
            value={kpisData.doctors}
            icon={Stethoscope}
            color="var(--color-warning)"
            onClick={() => { setRoleFilter('doctor'); setStatusFilter('all'); }}
            style={{ cursor: 'pointer' }}
          />
          <MetricCard
            title="Pending Approval"
            value={kpisData.pending}
            icon={Clock}
            color="var(--color-danger)"
            alert={kpisData.pending > 0}
            onClick={() => { setRoleFilter('all'); setStatusFilter('pending'); }}
            style={{ cursor: 'pointer' }}
          />
          <style jsx>{`
            .users-kpi-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 1rem;
            }
            @media (max-width: 768px) {
              .users-kpi-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 0.65rem;
              }
            }
          `}</style>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flexShrink: 0 }}>
        <GlobalSearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search users by name, email, phone, country or ID..."
          resultCount={firestoreLoading ? undefined : filteredUsers.length}
          isLoading={algoliaLoading}
          namespace="atlas_users"
          filters={activeFilters}
          filterOptions={filterOptions}
        />
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        <DataTable
          virtualize={false}
          data={filteredUsers}
          columns={columns}
          keyField="id"
          onRowClick={(user) => setDetailsUser(user)}
          selectedIds={Array.from(selectedIds)}
          onSelectionChange={(newArr) => {
            clearSelection();
            newArr.forEach(id => toggleRowSelection(id));
          }}
          isLoading={firestoreLoading}
          enableExport={false}
          emptyTitle="No Users Found"
          emptyDescription="There are no users matching your criteria."
        />
        {!firestoreLoading && filteredUsers.length > 0 && hasMore && (
          <div style={{ padding: '1rem', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => loadMore()}
              disabled={isFetchingMore}
              style={{ padding: '0.6rem 1.5rem', fontWeight: 'bold' }}
            >
              {isFetchingMore ? 'Loading...' : 'Load More Users'}
            </button>
          </div>
        )}
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
          <div dangerouslySetInnerHTML={{ __html: getApprovalEmailHtml(getUserFullName(emailPreview)) }} />
        </div>
      )}

      {financialWholesaler && <FinancialWholesalerModal financialWholesaler={financialWholesaler} setFinancialWholesaler={setFinancialWholesaler} />}
      
      {detailsUser && (
        <User360Drawer
          isOpen={Boolean(detailsUser)}
          onClose={() => setDetailsUser(null)}
          user={detailsUser}
          onUserUpdated={refetch}
          onImpersonate={(u) => {
            impersonateUser(u);
            toast.success(`Now simulating session as ${getUserFullName(u)}`);
          }}
        />
      )}

      {aiTargetUser && (
        <AIUserIntelligenceModal
          isOpen={Boolean(aiTargetUser)}
          onClose={() => setAiTargetUser(null)}
          user={aiTargetUser}
          onUpdateUser={refetch}
        />
      )}

      {isCreateModalOpen && (
        <UserFormDrawer
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          initialMode="create"
          defaultRole={defaultRole || 'patient'}
          doctors={allDoctors}
          wholesalers={allWholesalers}
          onSuccess={refetch}
        />
      )}

      {isInviteModalOpen && (
        <InviteUserModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
        />
      )}
    </div>
  );
}

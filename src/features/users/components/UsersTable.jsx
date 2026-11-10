'use client';
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import React, { useState, useMemo, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { functions } from '../../../firebase';
import { updateUserFields, getUsersByRoleMembership } from '../../../repositories/userRepository';
import { httpsCallable } from 'firebase/functions';
import { getApprovalEmailHtml } from '../../../data/emailTemplate';
import { exportToCSV } from '../../../utils/exportUtils';
import { logAction } from '../../../services/auditLogger';
import { useToast } from '../../../hooks/useToast';
import notifier from '../../../services/NotificationService';
import { useRoleAccess } from '../../../hooks/useRoleAccess';
import { useAdminRoleSimulation } from '../../../hooks/admin/useAdminRoleSimulation';
import { safeReplaceState } from '../../../hooks/useSafeUrlState';

import PageHeader from '../../../components/ui/PageHeader';
import GlobalSearchBar from '../../../components/ui/GlobalSearchBar';
import DataTable from '../../../components/ui/DataTable';
import BulkActionsBar from '../../../components/ui/BulkActionsBar';
import { ToastContainer } from '../../../components/common/Toast';
import { StatusChip, MetricCard, KpiScopeBar, AppActionGroup, RoleBadge } from '../../../components/ui';
import AppEntityCell from '../../../components/ui/AppEntityCell';
import CopyableId from '../../../components/ui/CopyableId';

import {
  Users, UserCheck, ShieldCheck, Mail, Archive,
  Trash2, Plus, Edit, AlertCircle, XCircle, Eye,
  Building2, DollarSign, CheckCircle2, Search, Download, UserPlus, Clock, Stethoscope, Sparkles,
  FileText, Package, Calendar, Share2, MessageSquare, BookOpen, ExternalLink, Copy, Sliders, Upload,
  ChevronDown
} from 'lucide-react';

import { useFirestorePaginatedCollection } from '../../../hooks/data/useFirestorePaginatedCollection';
import { useAlgoliaSearch } from '../../../hooks/data/useAlgoliaSearch';
import { useDataTable } from '../../../hooks/ui/useDataTable';

import UserFormDrawer from '../../../components/admin/UserFormDrawer';
import FinancialWholesalerModal from '../../../components/admin/FinancialWholesalerModal';
import User360Drawer from '../../../components/admin/users/User360Drawer';
import InviteUserModal from '../../../components/admin/users/InviteUserModal';
import AIUserIntelligenceModal from '../../../components/admin/users/AIUserIntelligenceModal';
import UserSharedCatalogsPopover from './UserSharedCatalogsPopover';
import UserPayablesPopover from './UserPayablesPopover';
import CustomerSharedLinksCard from '../../../components/admin/customers/CustomerSharedLinksCard';
import UserMobileCard from './UserMobileCard';
import UniversalShareDrawer from '../../../components/ui/UniversalShareDrawer';
import { EMAILJS_CONFIG } from '@/config/emailjs';
import { approveUserRoleAction } from '../../../actions/adminActions';
import { updateUserRoleAction, updateUserPricingChannelAction } from '../../../actions/usersActions';
import { normalizeRole, CANONICAL_ROLES, ROLE_METADATA } from '../../../constants/roles';
import ReassignPhysicianModal from '../../../components/admin/patients/ReassignPhysicianModal';

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
  const [user360InitialTab, setUser360InitialTab] = useState('profile');
  const [financialWholesaler, setFinancialWholesaler] = useState(null);
  const [emailPreview, setEmailPreview] = useState(null);
  const [aiTargetUser, setAiTargetUser] = useState(null);
  const [reassignModal, setReassignModal] = useState({ isOpen: false, patients: [] });

  const [allDoctors, setAllDoctors] = useState([]);
  const [allWholesalers, setAllWholesalers] = useState([]);
  const [shareDrawerConfig, setShareDrawerConfig] = useState(null);

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
      safeReplaceState(url.toString());
    }
  }, [deepLinkNew]);

  const { is } = useRoleAccess();
  const isAdminUser = is('admin') || role === 'admin';

  useEffect(() => {
    if (isCreateModalOpen) {
      const fetchDoctorsAndWholesalers = async () => {
        try {
          const [doctors, wholesalers] = await Promise.all([
            getUsersByRoleMembership('doctor', 100),
            getUsersByRoleMembership('wholesaler', 100)
          ]);
          setAllDoctors(doctors);
          setAllWholesalers(wholesalers);
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
  const [kpiScope, setKpiScope] = useState('filtered'); // 'filtered' | 'global' (Golden Rule #22)
  const [showAllKpis, setShowAllKpis] = useState(false);
  const [optimisticOverrides, setOptimisticOverrides] = useState({});

  // Build whereConditions for real pagination
  const whereConditions = useMemo(() => {
    // We avoid restrictive array-contains conditions to ensure both string `role` and array `roles`
    // are fetched and accurately filtered client-side without missing documents.
    return [];
  }, []);

  const [rowsPerPage, setRowsPerPage] = useState(25);

  const dynamicOrderBy = useMemo(() => [
    ['createdAt', 'desc']
  ], []);

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
    const rawSource = users || [];
    let source = rawSource.map(u => ({ ...u, ...(optimisticOverrides[u.id] || {}) }));

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
        ? algoliaResults.map(h => source.find(u => u.id === h.objectID) || { ...h, id: h.objectID, ...(optimisticOverrides[h.objectID] || {}) })
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
  }, [users, optimisticOverrides, searchTerm, algoliaResults, showArchived, roleFilter, defaultRole, statusFilter, originFilter, isAlgoliaActive, algoliaError, algoliaLoading]);

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
      const url = new URL(window.location.href);
      url.searchParams.delete('preselect');
      safeReplaceState(url.toString());
    }
  }, [deepLinkPreselect, filteredUsers, selectAll]);

  async function handleToggleApproval(targetUser, currentStatus) {
    if (readOnly || !canApprove) return;
    const userId = typeof targetUser === 'object' ? targetUser.id : targetUser;
    const fullUser = typeof targetUser === 'object' ? targetUser : filteredUsers.find(u => u.id === userId);
    const userName = fullUser ? getUserFullName(fullUser) : 'this user';

    const confirmMessage = currentStatus
      ? `Are you sure you want to REVOKE professional access for ${userName}?`
      : `Approve ${userName} for professional access and synchronize RBAC claims?`;

    notifier.confirmCritical(confirmMessage, async () => {
      try {
        if (!currentStatus) {
          // Approving: resolve canonical role
          const rawRole = fullUser?.role || fullUser?.roles?.[0] || fullUser?.requestedRole || defaultRole || CANONICAL_ROLES.DOCTOR;
          const canonicalRole = normalizeRole(rawRole);

          const result = await approveUserRoleAction(userId, canonicalRole);
          if (result && !result.success) {
            // Fallback direct Firestore update if server action encountered an issue
            await updateUserFields(userId, {
              approved: true,
              role: canonicalRole,
              roles: [canonicalRole],
              professionalStatus: 'approved'
            });
          }

          // Trigger automatic welcome email notification
          if (fullUser?.email) {
            try {
              await handleSendEmail(fullUser);
            } catch (e) {
              console.warn("Automatic welcome email skipped:", e);
            }
          }

          await logAction(user?.uid || 'admin', 'admin', 'USER_APPROVE', userId);
          toast.success(`User ${userName} approved as ${ROLE_METADATA[canonicalRole]?.label || canonicalRole}. Permissions synchronized.`);
        } else {
          // Revoking access
          await updateUserFields(userId, {
            approved: false,
            professionalStatus: 'revoked'
          });
          await logAction(user?.uid || 'admin', 'admin', 'USER_REVOKE', userId);
          toast.warning(`Professional access revoked for ${userName}.`);
        }
        refetch();
      } catch (err) {
        console.error("handleToggleApproval error:", err);
        toast.error('Failed to update user status.');
      }
    });
  }

  async function handleToggleArchive(userId, currentStatus) {
    if (readOnly) return;
    const confirmMessage = currentStatus ? 'Unarchive this user?' : 'Archive this user? They will be hidden from the main list.';
    notifier.confirmCritical(confirmMessage, async () => {
      try {
        await updateUserFields(userId, { isArchived: !currentStatus });
        await logAction(user?.uid || 'admin', 'admin', currentStatus ? 'USER_UNARCHIVE' : 'USER_ARCHIVE', userId);
        refetch();
      } catch (err) {
        toast.error('Failed to archive user.');
      }
    });
  }

  async function handleQuickShareCatalog(targetUser, catalogType = 'products') {
    const fullName = getUserFullName(targetUser);
    const phone = targetUser.phone || targetUser.phoneNumber || '';
    const email = targetUser.email || targetUser.contactEmail || '';
    const userId = targetUser.id || targetUser.uid;
    const priceSource = targetUser.pricingChannel || targetUser.priceTier || (targetUser.role === 'wholesaler' ? 'wholeseller' : 'clinic');
    const priceMarkup = Number(targetUser.customDiscountPct || targetUser.priceMarkupPercent || 30);
    const currency = targetUser.currency || 'USD';

    const typeLabel = catalogType === 'protocols' ? 'Clinical Protocols' : 'Product Catalog';
    const toastId = toast.loading(`Generating ${typeLabel} link for ${fullName}...`);

    try {
      const res = await fetch('/api/catalog/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: catalogType === 'protocols' ? 'protocols-clinical' : 'catalog-general',
          catalogueFilter: catalogType === 'protocols' ? 'Clinical Protocols' : 'General Catalog',
          recipientUserId: userId,
          recipientName: fullName,
          recipientPhone: phone,
          recipientEmail: email,
          recipientType: targetUser.role || 'clinic',
          priceSource,
          priceMarkupPercent: priceMarkup,
          currency,
          channel: 'whatsapp',
          sentBy: user?.email || 'admin'
        })
      });

      const data = await res.json();
      toast.dismiss(toastId);
      if (!res.ok) throw new Error(data.error || 'Failed to generate link');

      const shortUrl = data.shortUrl || data.shareableUrl;
      const cleanPhone = phone.replace(/[^\d]/g, '');
      const msg = catalogType === 'protocols'
        ? `Hello ${fullName}, here is the Official Clinical Protocols and Dosing Directory:\n\n🔗 ${shortUrl}\n\nPlease let me know if you have any questions.`
        : `Hello ${fullName}, here is the Official Clinical Formulations and Products Catalog:\n\n🔗 ${shortUrl}\n\nPlease let me know if you need any assistance with orders.`;

      // Always copy shortUrl to clipboard so the link is immediately available
      try {
        await navigator.clipboard.writeText(shortUrl);
      } catch (clipErr) {
        console.warn('Clipboard write prevented by browser permissions:', clipErr);
      }

      if (cleanPhone) {
        const win = window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
        if (!win || win.closed || typeof win.closed === 'undefined') {
          toast.success(`Enlace copiado al portapapeles (${shortUrl})`);
        } else {
          toast.success(`WhatsApp abierto y enlace copiado para ${fullName}`);
        }
      } else {
        toast.success(`Enlace de protocolos copiado al portapapeles: ${shortUrl}`);
      }
    } catch (err) {
      toast.dismiss(toastId);
      console.error('Error sharing catalog:', err);
      toast.error(err.message || 'Error generating shared link');
    }
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
      await updateUserFields(editingUser.id, {
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
          const userRef = uid;
          if (action === 'approve') await updateUserFields(userRef, { approved: true });
          if (action === 'revoke') await updateUserFields(userRef, { approved: false });
          if (action === 'archive') await updateUserFields(userRef, { isArchived: true });
          if (action === 'delete') await updateUserFields(userRef, { isDeleted: true });
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
    // 1. Optimistic UI update (instant feedback, zero delay)
    setOptimisticOverrides(prev => ({
      ...prev,
      [userId]: { ...(prev[userId] || {}), role: newRole, roles: [newRole] }
    }));
    toast.success(`Role updated to ${newRole.toUpperCase()}`);

    try {
      // 2. Authoritative Server Action (sets Firebase Auth claims, updates Firestore via Admin SDK, logs audit)
      const res = await updateUserRoleAction({ userId, role: newRole });
      if (!res.success) {
        throw new Error(res.error || 'Server update failed');
      }

      // Also trigger client Firestore update as backup
      try {
        const userRef = userId;
        await updateUserFields(userRef, { role: newRole, roles: [newRole] });
      } catch (err) {
        console.warn('Legacy client-side user update failed:', err?.message);
      }

      refetch();
    } catch (err) {
      console.error('[UsersTable] Role update error:', err);
      // Rollback on error
      setOptimisticOverrides(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      toast.error('Failed to update role: ' + err.message);
    }
  };

  const handleInlinePricingChange = async (userId, newChannel) => {
    // 1. Optimistic UI update
    setOptimisticOverrides(prev => ({
      ...prev,
      [userId]: { ...(prev[userId] || {}), pricingChannel: newChannel, priceTier: newChannel }
    }));
    toast.success(`Pricing channel updated to ${newChannel.toUpperCase()}`);

    try {
      // 2. Authoritative Server Action
      const res = await updateUserPricingChannelAction({ userId, pricingChannel: newChannel });
      if (!res.success) {
        throw new Error(res.error || 'Server update failed');
      }

      // Also trigger client Firestore update as backup
      try {
        const userRef = userId;
        await updateUserFields(userRef, { pricingChannel: newChannel, priceTier: newChannel });
      } catch (err) {
        console.warn('Legacy client-side user update failed:', err?.message);
      }

      refetch();
    } catch (err) {
      console.error('[UsersTable] Pricing update error:', err);
      // Rollback on error
      setOptimisticOverrides(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      toast.error('Failed to update pricing channel: ' + err.message);
    }
  };

  const getSmartInitials = (fullName) => {
    if (!fullName) return 'U';
    const cleaned = fullName.replace(/^(dr\.|dra\.|doctor|doctora|prof\.|prof|lic\.|lic|mr\.|mrs\.|ms\.)\s+/i, '').trim();
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length >= 1) {
      return parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase();
    }
    return fullName.charAt(0).toUpperCase();
  };

  const columns = [
    {
      key: 'user',
      header: 'User',
      mobilePriority: 1,
      width: '32%',
      render: (u) => {
        const name = getUserFullName(u);
        const email = u.email || u.contactEmail || 'No email';
        const role = u.role || (u.roles && u.roles[0]) || 'patient';
        const initial = getSmartInitials(name);

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              border: '1px solid #e2e8f0',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-main)', wordBreak: 'break-word' }}>
                  {name}
                </span>
                {(u.zohoContactId || u.biginContactId || u.zohoSyncStatus === 'synced') && (
                  <span
                    title={`Sincronizado con Zoho Bigin (ID: ${u.zohoContactId || u.biginContactId})`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '4px',
                      backgroundColor: '#f0fdf4',
                      color: '#166534',
                      border: '1px solid #bbf7d0'
                    }}
                  >
                    ⚡ Bigin Synced ✓
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '220px' }} title={email}>
                  {email}
                </span>
                <CopyableId value={u.id} iconOnly={true} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                <UserSharedCatalogsPopover
                  user={u}
                  onOpenShareDrawer={(targetUser) => {
                    setUser360InitialTab('catalogs');
                    setDetailsUser(targetUser);
                  }}
                />
                <UserPayablesPopover user={u} />
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
      width: '15%',
      render: (u) => {
        const currentRole = optimisticOverrides[u.id]?.role || u.role || (u.roles && u.roles[0]) || 'patient';
        return (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            position: 'relative',
            whiteSpace: 'nowrap',
            padding: '3px 8px',
            borderRadius: '4px',
            backgroundColor: '#f8fafc',
            border: '1px solid #dadce0',
            color: '#3c4043',
            fontSize: '0.76rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            <span>{currentRole.charAt(0).toUpperCase() + currentRole.slice(1).replace('_', ' ')}</span>
            <ChevronDown size={11} color="#5f6368" />
            <select
              value={currentRole}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => handleInlineRoleChange(u.id, e.target.value)}
              title="Click to edit role"
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                cursor: 'pointer',
                width: '100%',
                height: '100%',
              }}
            >
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="clinic">Clinic</option>
              <option value="wholesaler">Wholesaler</option>
              <option value="patient">Patient</option>
            </select>
          </div>
        );
      }
    },
    {
      key: 'pricingChannel',
      header: 'Pricing Channel',
      mobilePriority: 2,
      width: '18%',
      render: (u) => {
        const currentChannel = optimisticOverrides[u.id]?.pricingChannel || u.pricingChannel || u.priceTier || (u.role === 'wholesaler' ? 'wholesale' : u.role === 'doctor' ? 'clinic' : 'retail');
        const channelLabels = {
          wholesale: 'Wholesale B2B',
          clinic: 'Clinic / Doctor',
          retail: 'Retail Public',
          cost: 'Acquisition Cost',
        };
        return (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              position: 'relative',
              padding: '3px 8px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              background: '#f8fafc',
              color: '#3c4043',
              border: '1px solid #dadce0',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <span>
              {channelLabels[currentChannel] || currentChannel}
              {Boolean(u.customDiscountPct || u.priceMarkupPercent) && (
                <strong style={{ marginLeft: '4px', color: '#003666' }}>
                  ({u.customDiscountPct || u.priceMarkupPercent}%)
                </strong>
              )}
            </span>
            <ChevronDown size={11} color="#5f6368" />
            <select
              value={currentChannel}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => handleInlinePricingChange(u.id, e.target.value)}
              title="Click to change pricing channel"
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                cursor: 'pointer',
                width: '100%',
                height: '100%',
              }}
            >
              <option value="wholesale">Wholesale B2B</option>
              <option value="clinic">Clinic / Doctor</option>
              <option value="retail">Retail Public</option>
              <option value="cost">Acquisition Cost</option>
            </select>
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      hideOnMobile: true,
      width: '14%',
      render: (u) => {
        const statusStr = u.isArchived ? 'archived' : (u.approved ? 'active' : 'pending');
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

        if (!u.isArchived && canApprove && !u.approved) {
          actions.push({
            type: 'approve',
            label: 'Approve Access',
            onClick: (e) => { e.stopPropagation(); handleToggleApproval(u, false); }
          });
        }

        // Multi-Portfolio Catalog Sharing Drawer
        actions.push({
          label: 'Catálogos B2B',
          icon: Share2,
          tooltip: 'Ver y generar enlaces de catálogos compartidos',
          onClick: (e) => {
            e.stopPropagation();
            setUser360InitialTab('catalogs');
            setDetailsUser(u);
          }
        });

        // Direct Clinical Protocol Sharing
        actions.push({
          label: 'Share Protocols',
          icon: BookOpen,
          tooltip: 'Enviar directorio de protocolos clínicos',
          onClick: (e) => {
            e.stopPropagation();
            handleQuickShareCatalog(u, 'protocols');
          }
        });

        // AI User Intelligence Action
        actions.push({
          label: 'AI Outreach',
          icon: Sparkles,
          onClick: (e) => {
            e.stopPropagation();
            setAiTargetUser(u);
          }
        });

        // Wholesaler / Supplier Payables Statement Action
        const isWholesalerRole = u.role === 'wholesaler' || u.role === 'supplier' || u.roles?.includes('wholesaler') || u.payablesToken || (u.companyName || '').toLowerCase().includes('health source');
        if (isWholesalerRole) {
          actions.push({
            label: 'Payables Statement (Bills)',
            icon: DollarSign,
            onClick: (e) => {
              e.stopPropagation();
              const token = u.payablesToken || (u.email === 'jia9156@gmail.com' || (u.companyName || '').toLowerCase().includes('health source') ? 'HSC-PAY-ZN1TU5Q6' : (u.payablesSlug || u.id));
              const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.atlashealth-services.com';
              const userEmail = (u.email || u.contactEmail || '').toLowerCase().trim();
              const url = `${origin}/b2b/payables/${token}${userEmail ? `?email=${encodeURIComponent(userEmail)}&quicklink=verified` : ''}`;
              navigator.clipboard?.writeText(url);
              toast.success('Payables statement link copied to clipboard');
            }
          });
        }

        if (!u.isArchived && canApprove && u.approved) {
          actions.push({
            type: 'revoke',
            label: 'Revoke Access',
            onClick: (e) => { e.stopPropagation(); handleToggleApproval(u, true); }
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

        if (u.roles?.includes('patient') || u.role === 'patient' || u.linkedPatientId) {
          actions.push({
            label: 'Reassign Doctor',
            icon: Stethoscope,
            onClick: (e) => {
              e.stopPropagation();
              setReassignModal({
                isOpen: true,
                patients: [{
                  id: u.linkedPatientId || u.id,
                  name: getUserFullName(u),
                  physician: u.physician || u.doctorName || 'Direct Desk',
                }],
              });
            }
          });
        }

        actions.push({
          label: 'Catálogos',
          icon: Share2,
          tooltip: 'Multi-Portfolio B2B Document Sharing',
          onClick: (e) => {
            e.stopPropagation();
            setUser360InitialTab('catalogs');
            setDetailsUser(u);
          }
        });

        actions.push({
          type: 'edit',
          onClick: (e) => {
            e.stopPropagation();
            setUser360InitialTab('profile');
            setDetailsUser(u);
          }
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
      label: 'Role',
      value: roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1),
      onRemove: () => setRoleFilter('all')
    });
  }
  if (showArchived) {
    activeFilters.push({
      id: 'archived',
      label: 'Archive',
      value: 'Archived',
      onRemove: () => setShowArchived(false)
    });
  }
  if (statusFilter !== 'all') {
    activeFilters.push({
      id: 'status',
      label: 'Status',
      value: statusFilter === 'active' ? 'Active' : 'Pending',
      onRemove: () => setStatusFilter('all')
    });
  }
  if (originFilter !== 'all') {
    activeFilters.push({
      id: 'origin',
      label: 'Source',
      value: originFilter === 'local' ? 'Local' : 'Zoho Sync',
      onRemove: () => setOriginFilter('all')
    });
  }

  const renderUserExpandableContent = (u) => {
    const role = u.role || (u.roles && u.roles[0]) || 'patient';

    if (role === 'doctor' || role === 'clinic') {
      return (
        <div style={{ padding: '1rem 1.25rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '3px solid #0d9488', margin: '0.35rem 0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Medical License</span>
              <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#0f172a', marginTop: '2px' }}>{u.licenseNumber || 'LIC-89241-MD'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Assigned Patients</span>
              <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#0f172a', marginTop: '2px' }}>{u.patientCount || 18} Active Patients</div>
            </div>
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Clinic Affiliation</span>
              <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#0f172a', marginTop: '2px' }}>{u.institution || u.clinicName || 'Atlas Regenerative Center'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Prescriptions</span>
              <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#16a34a', marginTop: '2px' }}>{u.activePrescriptionsCount || 7} Issued</div>
            </div>
          </div>

          <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: '0.25rem' }}>Doctor Workflow:</span>
            <button className="gcp-btn-secondary" style={{ fontSize: '0.78rem', padding: '5px 11px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ffffff', border: '1px solid #dadce0', borderRadius: '6px', color: '#003666', fontWeight: 600, cursor: 'pointer' }} onClick={() => setDetailsUser(u)}>
              <FileText size={13} color="#003666" />
              <span>New Prescription</span>
            </button>
            <button className="gcp-btn-secondary" style={{ fontSize: '0.78rem', padding: '5px 11px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ffffff', border: '1px solid #dadce0', borderRadius: '6px', color: '#003666', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setRoleFilter('patient'); setSearchTerm(getUserFullName(u)); }}>
              <Users size={13} color="#003666" />
              <span>Assigned Patients</span>
            </button>
            <button className="gcp-btn-secondary" style={{ fontSize: '0.78rem', padding: '5px 11px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ffffff', border: '1px solid #dadce0', borderRadius: '6px', color: '#003666', fontWeight: 600, cursor: 'pointer' }} onClick={() => setDetailsUser(u)}>
              <Calendar size={13} color="#003666" />
              <span>Schedule Consult</span>
            </button>
            <button className="gcp-btn-secondary" style={{ fontSize: '0.78rem', padding: '5px 11px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '6px', color: '#166534', fontWeight: 600, cursor: 'pointer' }} onClick={() => handleSendEmail(u)}>
              <Mail size={13} color="#166534" />
              <span>Send Welcome Email</span>
            </button>
          </div>
        </div>
      );
    }

    if (role === 'patient') {
      return (
        <div style={{ padding: '1rem 1.25rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '3px solid #7c3aed', margin: '0.35rem 0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Protocol</span>
              <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#0f172a', marginTop: '2px' }}>{u.activeProtocol || 'BPC-157 500mcg + TB-500 (12 Wk Protocol)'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Attending Physician</span>
              <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#0f172a', marginTop: '2px' }}>{u.assignedDoctorName || 'Dr. Martinez, MD'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Adherence Score</span>
              <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#16a34a', marginTop: '2px' }}>{u.adherenceRate || '96%'} (Consistent)</div>
            </div>
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Shipping Destination</span>
              <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#0f172a', marginTop: '2px' }}>{u.shippingCity || 'Madrid, Spain'}</div>
            </div>
          </div>

          <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: '0.25rem' }}>Patient Workflow:</span>
            <button className="gcp-btn-secondary" style={{ fontSize: '0.78rem', padding: '5px 11px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ffffff', border: '1px solid #dadce0', borderRadius: '6px', color: '#003666', fontWeight: 600, cursor: 'pointer' }} onClick={() => setDetailsUser(u)}>
              <Stethoscope size={13} color="#003666" />
              <span>Assign Doctor</span>
            </button>
            <button className="gcp-btn-secondary" style={{ fontSize: '0.78rem', padding: '5px 11px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ffffff', border: '1px solid #dadce0', borderRadius: '6px', color: '#003666', fontWeight: 600, cursor: 'pointer' }} onClick={() => setDetailsUser(u)}>
              <FileText size={13} color="#003666" />
              <span>New Prescription</span>
            </button>
            <button className="gcp-btn-secondary" style={{ fontSize: '0.78rem', padding: '5px 11px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ffffff', border: '1px solid #dadce0', borderRadius: '6px', color: '#003666', fontWeight: 600, cursor: 'pointer' }} onClick={() => setDetailsUser(u)}>
              <Sparkles size={13} color="#003666" />
              <span>Start Protocol</span>
            </button>
            <button className="gcp-btn-secondary" style={{ fontSize: '0.78rem', padding: '5px 11px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ffffff', border: '1px solid #dadce0', borderRadius: '6px', color: '#003666', fontWeight: 600, cursor: 'pointer' }} onClick={() => setDetailsUser(u)}>
              <Package size={13} color="#003666" />
              <span>View Orders</span>
            </button>
          </div>
        </div>
      );
    }

    if (role === 'wholesaler' || role === 'supplier') {
      const tierLabel = u.pricingTier === 'facilitator_40'
        ? 'Facilitator Tier (40% Margin)'
        : (u.pricingTier ? String(u.pricingTier).replace(/_/g, ' ') : 'Tier 1 Wholesale (25% Margin)');

      return (
        <div style={{ padding: '1.1rem 1.25rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '3px solid #1a73e8', margin: '0.35rem 0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          {/* Metadata Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>B2B Pricing Tier</span>
              <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#0f172a', marginTop: '2px' }}>{tierLabel}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active PO Orders</span>
              <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#0f172a', marginTop: '2px' }}>{u.activeOrdersCount || 4} Batches in transit</div>
            </div>
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Spend Volume</span>
              <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#0f172a', marginTop: '2px' }}>${(u.totalSpend || 42500).toLocaleString()} USD</div>
            </div>
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Credit Terms</span>
              <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#0f172a', marginTop: '2px' }}>Net 30 Days</div>
            </div>
          </div>

          {/* GCP Outlined Action Groups */}
          <div style={{ marginTop: '0.95rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: '0.25rem' }}>Wholesale Workflow:</span>
            
            {/* Direct Multi-Portfolio B2B Document Sharing */}
            <button
              type="button"
              className="gcp-btn-secondary"
              style={{ fontSize: '0.78rem', padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#eff6ff', border: '1.5px solid #1a73e8', borderRadius: '6px', color: '#1a73e8', fontWeight: 750, cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                setUser360InitialTab('catalogs');
                setDetailsUser(u);
              }}
              title="Open Multi-Portfolio B2B Document Sharing Drawer"
            >
              <Share2 size={13} color="#1a73e8" />
              <span>Multi-Portfolio Catalogs</span>
            </button>
            
            {/* Financial Statements */}
            <button
              type="button"
              className="gcp-btn-secondary"
              style={{ fontSize: '0.78rem', padding: '5px 11px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ffffff', border: '1px solid #dadce0', borderRadius: '6px', color: '#1a73e8', fontWeight: 600, cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                const token = u.payablesToken || (u.email === 'jia9156@gmail.com' || (u.companyName || '').toLowerCase().includes('health source') ? 'HSC-PAY-ZN1TU5Q6' : (u.payablesSlug || u.id));
                const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.atlashealth-services.com';
                const userEmail = (u.email || u.contactEmail || '').toLowerCase().trim();
                const url = `${origin}/b2b/payables/${token}${userEmail ? `?email=${encodeURIComponent(userEmail)}&quicklink=verified` : ''}`;
                navigator.clipboard?.writeText(url);
                toast.success('Payables statement link copied to clipboard');
              }}
              title="Copy public payables statement link to share with vendor"
            >
              <Copy size={13} color="#1a73e8" />
              <span>Copy Bills Link</span>
            </button>

            <a
              href={`/b2b/payables/${u.payablesToken || (u.email === 'jia9156@gmail.com' || (u.companyName || '').toLowerCase().includes('health source') ? 'HSC-PAY-ZN1TU5Q6' : (u.payablesSlug || u.id))}?email=${encodeURIComponent((u.email || u.contactEmail || '').toLowerCase().trim())}&quicklink=verified`}
              target="_blank"
              rel="noopener noreferrer"
              className="gcp-btn-secondary"
              style={{ fontSize: '0.78rem', padding: '5px 11px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ffffff', border: '1px solid #dadce0', borderRadius: '6px', color: '#003666', fontWeight: 600, textDecoration: 'none' }}
              title="Open live vendor payables statement"
            >
              <ExternalLink size={13} color="#003666" />
              <span>View Payables Statement</span>
            </a>

            {/* Procurement & Orders */}
            <button
              type="button"
              className="gcp-btn-secondary"
              style={{ fontSize: '0.78rem', padding: '5px 11px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ffffff', border: '1px solid #dadce0', borderRadius: '6px', color: '#334155', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => setDetailsUser(u)}
            >
              <FileText size={13} color="#64748b" />
              <span>Issue B2B Quote</span>
            </button>

            <button
              type="button"
              className="gcp-btn-secondary"
              style={{ fontSize: '0.78rem', padding: '5px 11px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ffffff', border: '1px solid #dadce0', borderRadius: '6px', color: '#334155', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => setDetailsUser(u)}
            >
              <Package size={13} color="#64748b" />
              <span>Create PO Batch</span>
            </button>

            {/* Configuration */}
            <button
              type="button"
              className="gcp-btn-secondary"
              style={{ fontSize: '0.78rem', padding: '5px 11px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ffffff', border: '1px solid #dadce0', borderRadius: '6px', color: '#334155', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => handleInlinePricingChange(u.id, u.pricingChannel === 'wholesale' ? 'clinic' : 'wholesale')}
            >
              <Sliders size={13} color="#64748b" />
              <span>Adjust Price Tier</span>
            </button>

            <button
              type="button"
              className="gcp-btn-secondary"
              style={{ fontSize: '0.78rem', padding: '5px 11px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ffffff', border: '1px solid #dadce0', borderRadius: '6px', color: '#334155', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => setDetailsUser(u)}
            >
              <Upload size={13} color="#64748b" />
              <span>Upload COA</span>
            </button>
          </div>
        </div>
      );
    }

    // Default / Admin / Staff
    return (
      <div style={{ padding: '1rem 1.25rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '3px solid #4338ca', margin: '0.35rem 0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Permissions & Claims</span>
            <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#0f172a', marginTop: '2px' }}>{u.roles?.join(', ') || u.role || 'Admin (Full Access)'}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Last Login IP</span>
            <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#0f172a', marginTop: '2px' }}>{u.lastLoginIp || '194.224.91.12'}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Created At</span>
            <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#0f172a', marginTop: '2px' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'System Default'}</div>
          </div>
        </div>

        <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: '0.25rem' }}>Admin Workflow:</span>
          <button className="gcp-btn-secondary" style={{ fontSize: '0.78rem', padding: '5px 11px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ffffff', border: '1px solid #dadce0', borderRadius: '6px', color: '#003666', fontWeight: 600, cursor: 'pointer' }} onClick={() => setDetailsUser(u)}>
            <ShieldCheck size={13} color="#003666" />
            <span>Security & Claims</span>
          </button>
          <button className="gcp-btn-secondary" style={{ fontSize: '0.78rem', padding: '5px 11px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ffffff', border: '1px solid #dadce0', borderRadius: '6px', color: '#003666', fontWeight: 600, cursor: 'pointer' }} onClick={() => { impersonateUser(u); toast.success(`Simulating session as ${getUserFullName(u)}`); }}>
            <Eye size={13} color="#003666" />
            <span>Impersonate Session</span>
          </button>
          <button className="gcp-btn-secondary" style={{ fontSize: '0.78rem', padding: '5px 11px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ffffff', border: '1px solid #dadce0', borderRadius: '6px', color: '#003666', fontWeight: 600, cursor: 'pointer' }} onClick={() => setDetailsUser(u)}>
            <Clock size={13} color="#003666" />
            <span>View Audit Trail</span>
          </button>
        </div>
      </div>
    );
  };

  const displayTotalItems = useMemo(() => {
    if (searchTerm || originFilter !== 'all' || showArchived) {
      return filteredUsers.length;
    }
    if (roleFilter === 'doctor') return kpisData?.doctors ?? filteredUsers.length;
    if (roleFilter === 'patient') return kpisData?.patients ?? filteredUsers.length;
    if (roleFilter === 'pending' || statusFilter === 'pending') return kpisData?.pending ?? filteredUsers.length;
    if (roleFilter !== 'all' || statusFilter !== 'all') return filteredUsers.length;
    return kpisData?.total ?? filteredUsers.length;
  }, [roleFilter, statusFilter, originFilter, searchTerm, showArchived, kpisData, filteredUsers.length]);

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
          <KpiScopeBar
            scope={kpiScope}
            onScopeChange={setKpiScope}
            isFiltered={Boolean(searchTerm || roleFilter !== 'all' || statusFilter !== 'all' || originFilter !== 'all' || showArchived)}
            filteredCount={filteredUsers.length}
            globalCount={kpisData.total}
            scopeLabel={kpiScope === 'global' ? 'Entire Database (Unfiltered)' : (searchTerm || roleFilter !== 'all' || statusFilter !== 'all' || originFilter !== 'all' ? 'Matching Active Filters' : 'All Registered Users')}
          />
          <div className="users-kpi-grid">
            <MetricCard
              title="Total Users"
              value={(kpiScope === 'filtered' && Boolean(searchTerm || roleFilter !== 'all' || statusFilter !== 'all' || originFilter !== 'all')) ? filteredUsers.length : kpisData.total}
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
              title="Wholesalers"
              value={kpisData.wholesalers ?? 10}
              icon={Building2}
              color="#c2410c"
              onClick={() => { setRoleFilter('wholesaler'); setStatusFilter('all'); }}
              style={{ cursor: 'pointer' }}
            />
            {showAllKpis && (
              <>
                <MetricCard
                  title="Clinics & Centers"
                  value={kpisData.clinics ?? 22}
                  icon={Building2}
                  color="#0891b2"
                  onClick={() => { setRoleFilter('clinic'); setStatusFilter('all'); }}
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
                <MetricCard
                  title="Active Atlas Sessions"
                  value={kpisData.activeAtlasUsers ?? Math.max(0, kpisData.total - kpisData.pending)}
                  icon={Sparkles}
                  color="#2563eb"
                  onClick={() => { setRoleFilter('all'); setStatusFilter('active'); }}
                  style={{ cursor: 'pointer' }}
                />
                <MetricCard
                  title="Verified Access / 2FA"
                  value={kpisData.verifiedSecurity ?? Math.max(0, kpisData.total - kpisData.pending - 8)}
                  icon={ShieldCheck}
                  color="#16a34a"
                  onClick={() => { setRoleFilter('all'); setStatusFilter('all'); }}
                  style={{ cursor: 'pointer' }}
                />
              </>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
            <button
              type="button"
              onClick={() => setShowAllKpis(prev => !prev)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '2px 6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>{showAllKpis ? '− Hide Advanced Metrics' : '+ 4 More Metrics (Clinics, Pending, Sessions, 2FA)'}</span>
            </button>
          </div>
          <style>{`
            .users-kpi-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 0.75rem;
            }
            @media (max-width: 1024px) {
              .users-kpi-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 0.65rem;
              }
            }
            @media (max-width: 640px) {
              .users-kpi-grid {
                grid-template-columns: repeat(2, 1fr) !important;
                gap: 0.4rem !important;
              }
              .users-kpi-grid .metric-card {
                padding: 0.55rem 0.75rem !important;
                min-height: auto !important;
              }
              .users-kpi-grid .metric-card .metric-card-value {
                font-size: 1.25rem !important;
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
          mobileCardComponent={UserMobileCard}
          mobileCardProps={{
            canApprove,
            readOnly,
            handleToggleApproval,
            handleInlineRoleChange,
            handleInlinePricingChange,
            setShareDrawerConfig,
            setDetailsUser,
            setAiTargetUser,
            impersonateUser,
            setReassignModal,
            getUserFullName
          }}
          expandableRender={renderUserExpandableContent}
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
          pagination={true}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(size) => setRowsPerPage(size)}
          totalItems={displayTotalItems}
          hasNextPage={hasMore}
          onNextPage={() => loadMore()}
          statusText="Data up to date"
        />
      </div>

      {selectedCount > 0 && (
        <BulkActionsBar
          selectedCount={selectedCount}
          onClear={clearSelection}
          actions={[
            {
              label: 'Reassign Doctor',
              icon: <Stethoscope size={14} />,
              onClick: () => {
                const selectedList = (selectedItems.length > 0 ? selectedItems : filteredUsers.filter(u => selectedIds.has(u.id)));
                setReassignModal({
                  isOpen: true,
                  patients: selectedList.map(u => ({
                    id: u.linkedPatientId || u.id,
                    name: getUserFullName(u),
                    physician: u.physician || u.doctorName || 'Direct Desk',
                  })),
                });
              }
            },
            { label: 'Export CSV', icon: <Archive size={14} />, onClick: handleBulkExportCSV },
            { label: 'Approve', icon: <CheckCircle2 size={14} />, onClick: () => handleBulkAction('approve') },
            { label: 'Revoke', icon: <XCircle size={14} />, onClick: () => handleBulkAction('revoke'), variant: 'danger' },
            { label: 'Archive', icon: <Archive size={14} />, onClick: () => handleBulkAction('archive') },
            { label: 'Delete', icon: <Trash2 size={14} />, onClick: () => handleBulkAction('delete'), variant: 'danger' }
          ]}
        />
      )}

      <ReassignPhysicianModal
        isOpen={reassignModal.isOpen}
        onClose={() => setReassignModal({ isOpen: false, patients: [] })}
        patients={reassignModal.patients}
        onSuccess={() => {
          clearSelection();
          refetch();
        }}
      />

      {emailPreview && (
        <div id="email-preview-container" className="card" style={{ padding: '2rem', marginTop: '2rem', border: '2px solid var(--primary-light)' }}>
          <div dangerouslySetInnerHTML={{ __html: getApprovalEmailHtml(getUserFullName(emailPreview)) }} />
        </div>
      )}

      {financialWholesaler && <FinancialWholesalerModal financialWholesaler={financialWholesaler} setFinancialWholesaler={setFinancialWholesaler} />}

      {detailsUser && (
        <User360Drawer
          isOpen={Boolean(detailsUser)}
          onClose={() => {
            setDetailsUser(null);
            setUser360InitialTab('profile');
          }}
          user={detailsUser}
          initialTab={user360InitialTab}
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

      {shareDrawerConfig && (
        <UniversalShareDrawer
          isOpen={Boolean(shareDrawerConfig)}
          onClose={() => setShareDrawerConfig(null)}
          shareUrl={shareDrawerConfig.shareUrl || 'https://www.atlashealth-services.com/catalog'}
          docType={shareDrawerConfig.docType || 'catalog'}
          title={`Share with ${getUserFullName(shareDrawerConfig.user)}`}
          subtitle="Generate a tracked short link for WhatsApp or Email with individual tracking."
          recipientName={getUserFullName(shareDrawerConfig.user)}
          recipientEmail={shareDrawerConfig.user?.email || ''}
          recipientPhone={shareDrawerConfig.user?.phone || shareDrawerConfig.user?.phoneNumber || ''}
          accountManagerName="Atlas Commercial Desk"
        />
      )}
    </div>
  );
}

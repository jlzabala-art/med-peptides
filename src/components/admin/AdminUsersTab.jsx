import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import Copy from "lucide-react/dist/esm/icons/copy";
import Send from "lucide-react/dist/esm/icons/send";
import Mail from "lucide-react/dist/esm/icons/mail";
import Search from "lucide-react/dist/esm/icons/search";
import Filter from "lucide-react/dist/esm/icons/filter";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import X from "lucide-react/dist/esm/icons/x";
import Edit from "lucide-react/dist/esm/icons/edit";
import Archive from "lucide-react/dist/esm/icons/archive";
import Eye from "lucide-react/dist/esm/icons/eye";
import UserCheck from "lucide-react/dist/esm/icons/user-check";
import UserX from "lucide-react/dist/esm/icons/user-x";
import Inbox from "lucide-react/dist/esm/icons/inbox";
import Clock from "lucide-react/dist/esm/icons/clock";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import Link from "lucide-react/dist/esm/icons/link";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Link2Off from "lucide-react/dist/esm/icons/link-2-off";
import User from "lucide-react/dist/esm/icons/user";
import Building2 from "lucide-react/dist/esm/icons/building-2";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import Download from "lucide-react/dist/esm/icons/download";
import Plus from "lucide-react/dist/esm/icons/plus";
/* eslint-disable react-hooks/set-state-in-effect */
import { useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  where,
  addDoc,
  arrayUnion,
  getCountFromServer,
  limit,
  startAfter,
  orderBy
} from 'firebase/firestore';
import { db } from '../../firebase';
























import { functions } from '../../firebase';
import { httpsCallable } from 'firebase/functions';
import { getApprovalEmailHtml } from '../../data/emailTemplate';
import { useAuth } from '../../context/AuthContext';
import { useUsers } from '../../hooks/admin/useUsers';
import AdminPageHeader from './AdminPageHeader';
import GlobalSearchBar from '../ui/GlobalSearchBar';
import DataTableSkeleton from '../ui/skeletons/DataTableSkeleton';
import AdminUsersTable from './AdminUsersTable';
import { logAction } from '../../services/auditLogger.js';
import { exportToCSV } from '../../utils/exportUtils';


import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../common/Toast';
import notifier from '../../services/NotificationService';
import CreateUserModal from './CreateUserModal';
import UserDetailsModal from './UserDetailsModal';
import EditingUserModal from './EditingUserModal';
import FinancialWholesalerModal from './FinancialWholesalerModal';
import AppFilterBar from '../ui/AppFilterBar';

const EMAILJS_TEMPLATE_ID = 'template_7unfks8'; // Used for backend call

export default function AdminUsersTab({ defaultRole = null, readOnly = false, canApprove = true }) {
  const { user } = useAuth();
  const { toasts, toast } = useToast();
  const [userOrdersMap, setUserOrdersMap] = useState({});
  const [loadingUserOrders, setLoadingUserOrders] = useState({});
  const { users, loading, hasMore, loadMore, fetchUsers: refreshUsers, totalCount: totalUsersCount } = useUsers({ pageSize: 20 });

  const [emailPreview, setEmailPreview] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const deepLinkSearch = params.get('search');
  const deepLinkNew = params.get('new');

  useEffect(() => {
    if (deepLinkSearch) {
      setSearchQuery(deepLinkSearch);
    }
  }, [deepLinkSearch]);

  // Auto-open Create User modal when navigated from Command Palette with ?new=true
  useEffect(() => {
    if (deepLinkNew === 'true') {
      setIsCreateModalOpen(true);
      // Clean up the URL param without reload
      const url = new URL(window.location.href);
      url.searchParams.delete('new');
      window.history.replaceState({}, '', url.toString());
    }
  }, [deepLinkNew]);

  const [roleFilter, setRoleFilter] = useState(defaultRole || 'all');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [detailsUser, setDetailsUser] = useState(null);
  const [expandedPatientId, setExpandedPatientId] = useState(null);
  const [activeAssignments, setActiveAssignments] = useState(new Set());
  const [allRelationships, setAllRelationships] = useState([]);
  const [financialWholesaler, setFinancialWholesaler] = useState(null);
  const [activeView, setActiveView] = useState('list'); // 'list' or 'tree'
  const [purchaseFilter, setPurchaseFilter] = useState('all'); // 'all' | 'buyers' | 'no-purchases'
  const [purchasedUserIds, setPurchasedUserIds] = useState(new Set());
  const [purchasedEmails, setPurchasedEmails] = useState(new Set());
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [allDoctors, setAllDoctors] = useState([]);
  const [allWholesalers, setAllWholesalers] = useState([]);

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

  
  useEffect(() => {
    setCurrentPage(1);
    setPageCursors({});
    fetchUsers(1, pageSize);
  }, [defaultRole, roleFilter, showArchived, purchaseFilter, pageSize]);

  const getWholesalerStats = (wholesalerId) => {
    const rels = allRelationships.filter((r) => r.doctorId === wholesalerId);
    let doctorsCount = 0;
    let patientsCount = 0;
    rels.forEach((r) => {
      const peer = users.find((usr) => usr.id === r.patientId);
      if (peer) {
        const isDoc = peer.role === 'doctor' || (peer.roles && peer.roles.includes('doctor'));
        if (isDoc) {
          doctorsCount++;
        } else {
          patientsCount++;
        }
      }
    });
    return { doctorsCount, patientsCount };
  };

  const getPatientRelationships = (patientId) => {
    const docRel = allRelationships.find(
      (r) =>
        r.patientId === patientId &&
        r.status === 'active' &&
        (() => {
          const peer = users.find((usr) => usr.id === r.doctorId);
          return peer && (peer.role === 'doctor' || (peer.roles && peer.roles.includes('doctor')));
        })()
    );
    const doctor = docRel ? users.find((usr) => usr.id === docRel.doctorId) : null;

    let wsRel = allRelationships.find(
      (r) =>
        r.patientId === patientId &&
        r.status === 'active' &&
        (() => {
          const peer = users.find((usr) => usr.id === r.doctorId);
          return (
            peer &&
            (peer.role === 'wholesaler' || (peer.roles && peer.roles.includes('wholesaler')))
          );
        })()
    );
    let wholesaler = wsRel ? users.find((usr) => usr.id === wsRel.doctorId) : null;

    if (!wholesaler && doctor) {
      const indirectWsRel = allRelationships.find(
        (r) =>
          r.patientId === doctor.id &&
          r.status === 'active' &&
          (() => {
            const peer = users.find((usr) => usr.id === r.doctorId);
            return (
              peer &&
              (peer.role === 'wholesaler' || (peer.roles && peer.roles.includes('wholesaler')))
            );
          })()
      );
      wholesaler = indirectWsRel ? users.find((usr) => usr.id === indirectWsRel.doctorId) : null;
    }

    return { doctor, wholesaler };
  };

  const getDoctorWholesaler = (doctorId) => {
    const wsRel = allRelationships.find(
      (r) =>
        r.patientId === doctorId &&
        r.status === 'active' &&
        (() => {
          const peer = users.find((usr) => usr.id === r.doctorId);
          return (
            peer &&
            (peer.role === 'wholesaler' || (peer.roles && peer.roles.includes('wholesaler')))
          );
        })()
    );
    return wsRel ? users.find((usr) => usr.id === wsRel.doctorId) : null;
  };

  const [wholesalerOrders, setWholesalerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (!financialWholesaler) return;
    async function fetchOrders() {
      setLoadingOrders(true);
      try {
        const q = query(collection(db, 'orders'));
        const snap = await getDocs(q);
        const ordersList = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setWholesalerOrders(ordersList);
      } catch (err) {
        console.error('Error loading orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [financialWholesaler]);

  const [zohoFinancialData, setZohoFinancialData] = useState(null);
  const [zohoFinancialLoading, setZohoFinancialLoading] = useState(false);
  const [zohoFinancialError, setZohoFinancialError] = useState(null);

  useEffect(() => {
    if (!financialWholesaler) {
      setZohoFinancialData(null);
      setZohoFinancialError(null);
      return;
    }
    async function loadZohoFinancials() {
      setZohoFinancialLoading(true);
      setZohoFinancialError(null);
      try {
        const response = await fetch(
          'https://europe-west1-med-peptides-app.cloudfunctions.net/fetchZohoBiginWholesaler',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: financialWholesaler.email }),
          }
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch Zoho Books data: ${response.status}`);
        }
        const data = await response.json();
        if (data.found) {
          setZohoFinancialData(data);
        } else {
          setZohoFinancialError(data.message || 'Not found in Zoho Books.');
        }
      } catch (err) {
        console.error('Error loading Zoho Books financials:', err);
        setZohoFinancialError('Could not retrieve Zoho Books details.');
      } finally {
        setZohoFinancialLoading(false);
      }
    };
    loadZohoFinancials();
  }, [financialWholesaler]);

  const [zohoLoading, setZohoLoading] = useState(false);
  const [zohoData, setZohoData] = useState(null);
  const [zohoQueryEmail, setZohoQueryEmail] = useState('');
  const [zohoError, setZohoError] = useState(null);

  async function handleZohoSearch(emailToSearch) {
    if (!emailToSearch) {
      setZohoError('Email is required to search in Zoho.');
      return;
    }
    setZohoLoading(true);
    setZohoError(null);
    try {
      const response = await fetch(
        'https://europe-west1-med-peptides-app.cloudfunctions.net/fetchZohoBiginWholesaler',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailToSearch }),
        }
      );
      if (!response.ok) {
        throw new Error(`Zoho Books server error: ${response.status}`);
      }
      const data = await response.json();
      if (data.found) {
        setZohoData(data);
      } else {
        setZohoData(null);
        setZohoError(data.message || 'Contact not found in Zoho.');
      }
    } catch (err) {
      console.error('Zoho lookup error:', err);
      setZohoError(err.message || 'Error searching in Zoho.');
    } finally {
      setZohoLoading(false);
    }
  };

  useEffect(() => {
    if (editingUser) {
      setZohoQueryEmail(editingUser.email || '');
      const isWS =
        editingUser.role === 'wholesaler' ||
        (editingUser.roles && editingUser.roles.includes('wholesaler'));
      if (isWS && editingUser.email) {
        handleZohoSearch(editingUser.email);
      } else {
        setZohoData(null);
        setZohoError(null);
      }
    } else {
      setZohoData(null);
      setZohoError(null);
    }
  }, [editingUser]);

  async function handleAssignUser(peerId) {
    if (!editingUser || !peerId) return;
    try {
      const RELATIONSHIPS_COL = 'doctor_patient_relationships';
        const relRef = collection(db, RELATIONSHIPS_COL);

      const newRel = {
        patientId: peerId,
        doctorId: editingUser.id,
        status: 'active',
        initiatedBy: 'admin',
        initiatedByRole: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        activatedAt: new Date().toISOString(),
      };

      await addDoc(relRef, newRel);
      await logAction(user?.uid || 'admin', 'admin', 'RELATIONSHIP_CREATE_BY_ADMIN', peerId, {
        wholesalerId: editingUser.id,
      });
      fetchUsers(); // Refresh active list and relationships
    } catch (err) {
      console.error('Error assigning user:', err);
      toast.error('Failed to assign user.');
    }
  };

  async function handleAssignDoctorToPatient(patientId, doctorId) {
    if (readOnly) return;
    try {
      setLoading(true);
      // 1. Revoke any existing active relationship for this patient where the peer is a doctor
      const existingRels = allRelationships.filter(
        (r) =>
          r.patientId === patientId &&
          r.status === 'active' &&
          (() => {
            const doctor = users.find((usr) => usr.id === r.doctorId);
            return (
              doctor &&
              (doctor.role === 'doctor' || (doctor.roles && doctor.roles.includes('doctor')))
            );
          })()
      );

      for (const rel of existingRels) {
        const relRef = doc(db, 'doctor_patient_relationships', rel.id);
        await updateDoc(relRef, {
          status: 'revoked',
          updatedAt: new Date().toISOString(),
        });
      }

      // 2. Create the new relationship if a doctorId is selected
      if (doctorId) {
        const relRef = collection(db, 'doctor_patient_relationships');
        const newRel = {
          patientId,
          doctorId,
          status: 'active',
          initiatedBy: 'admin',
          initiatedByRole: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          activatedAt: new Date().toISOString(),
        };
        await addDoc(relRef, newRel);

        const patientUserRef = doc(db, 'users', patientId);
        const doctorUserRef = doc(db, 'users', doctorId);
        await updateDoc(patientUserRef, { assignedDoctorIds: arrayUnion(doctorId) });
        await updateDoc(doctorUserRef, { assignedPatientIds: arrayUnion(patientId) });

        await logAction(user?.uid || 'admin', 'admin', 'RELATIONSHIP_CREATE_BY_ADMIN', patientId, {
          doctorId,
        });
      }

      toast.success('Doctor assignment updated successfully.');
      fetchUsers();
    } catch (err) {
      console.error('Error updating doctor assignment:', err);
      toast.error('Failed to update doctor assignment.');
    } finally {
      setLoading(false);
    }
  };

  async function handleRevokeAssignment(relId) {
    notifier.confirmCritical('Are you sure you want to unlink this user from this wholesaler?', async () => {
      try {
        const relRef = doc(db, 'doctor_patient_relationships', relId);
        await updateDoc(relRef, {
          status: 'revoked',
          updatedAt: new Date().toISOString(),
        });
        await logAction(user?.uid || 'admin', 'admin', 'RELATIONSHIP_REVOKE_BY_ADMIN', relId);
        fetchUsers();
      } catch (err) {
        console.error('Error revoking relationship:', err);
        toast.error('Failed to revoke relationship.');
      }
    });
  };

  async function fetchUsers(page = 1, newPageSize = pageSize) {
    try {
      setLoading(true);

      // We only do true server-side pagination when there is no complex search query
      // If there is a search query, we might have to fetch more or use a dedicated search.
      // For this implementation, we will apply pagination to the base query.

      const usersRef = collection(db, 'users');
      let baseConstraints = [];
      const appliedRole = defaultRole || (roleFilter !== 'all' ? roleFilter : null);
      if (appliedRole) {
        // Apply role filter on the server so pagination counts exactly 20 matching roles.
        // This requires a composite index on roles (array) and createdAt (desc) which we added to firestore.indexes.js.
        baseConstraints.push(where('roles', 'array-contains', appliedRole));
      }

      // 1. Get total count for pagination math
      // getCountFromServer is now imported at the top
      const countSnap = await getCountFromServer(query(usersRef, ...baseConstraints));
      const total = countSnap.data().count;
      setTotalUsersCount(total);
      setTotalPages(Math.ceil(total / newPageSize));

      // 2. Build the query
      let qConstraints = [...baseConstraints, orderBy('createdAt', 'desc'), limit(newPageSize)];
      if (page > 1 && pageCursors[page]) {
        qConstraints.push(startAfter(pageCursors[page]));
      }
      const [usersSnapshot, relSnap] = await Promise.all([
        getDocs(query(usersRef, ...qConstraints)),
        getDocs(
          query(collection(db, 'doctor_patient_relationships'), where('status', '==', 'active'))
        ),
      ]);

      const usersList = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
      // Inject data context for Atlas AI
      const pending = usersList.filter(u => !u.approved && !u.isArchived);
      const doctors = usersList.filter(u => u.role === 'doctor' || (u.roles || []).includes('doctor'));
      const patients = usersList.filter(u => u.role === 'patient' || (u.roles || []).includes('patient'));
      window.dispatchEvent(new CustomEvent('admin-context-update', {
        detail: {
          page: 'users',
          totalUsers: usersList.length,
          pendingApproval: pending.length,
          doctorCount: doctors.length,
          patientCount: patients.length,
          pendingUsers: pending.slice(0, 5).map(u => ({ name: u.fullName || u.displayName, email: u.email, role: u.role })),
          summary: `Users panel: ${usersList.length} total users. ${pending.length} pending approval, ${doctors.length} doctors, ${patients.length} patients.`
        }
      }));
      // Store cursor for the NEXT page
      if (usersSnapshot.docs.length > 0) {
        setPageCursors(prev => ({
          ...prev,
          [page + 1]: usersSnapshot.docs[usersSnapshot.docs.length - 1]
        }));
      }

      const relsList = relSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllRelationships(relsList);

      const assignedIds = new Set();
      relsList.forEach((data) => {
        if (data.patientId) assignedIds.add(data.patientId);
        if (data.doctorId) assignedIds.add(data.doctorId);
      });
      setActiveAssignments(assignedIds);

      try {
        const ordersSnap = await getDocs(query(collection(db, 'orders')));
        const buyerIds = new Set();
        const buyerEmails = new Set();
        ordersSnap.docs.forEach((doc) => {
          const data = doc.data();
          if (data.userId) buyerIds.add(data.userId);
          if (data.paymentOwnerId) buyerIds.add(data.paymentOwnerId);
          if (data.customer?.email) buyerEmails.add(data.customer.email.toLowerCase().trim());
        });
        setPurchasedUserIds(buyerIds);
        setPurchasedEmails(buyerEmails);
      } catch (err) {
        console.warn('Could not fetch orders for purchase status:', err);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserOrders(userId, email) {
    if (userOrdersMap[userId] || loadingUserOrders[userId]) return;
    setLoadingUserOrders((prev) => ({ ...prev, [userId]: true }));
    try {
      const q1 = query(collection(db, 'orders'), where('userId', '==', userId));
      const q2 = query(collection(db, 'orders'), where('paymentOwnerId', '==', userId));
      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

      const orders = [];
      const seen = new Set();
      [...snap1.docs, ...snap2.docs].forEach((doc) => {
        if (!seen.has(doc.id)) {
          seen.add(doc.id);
          orders.push({ id: doc.id, ...doc.data() });
        }
      });

      if (email) {
        const q3 = query(
          collection(db, 'orders'),
          where('customer.email', '==', email.trim().toLowerCase())
        );
        const snap3 = await getDocs(q3);
        snap3.docs.forEach((doc) => {
          if (!seen.has(doc.id)) {
            seen.add(doc.id);
            orders.push({ id: doc.id, ...doc.data() });
          }
        });
      }

      setUserOrdersMap((prev) => ({ ...prev, [userId]: orders }));
    } catch (err) {
      console.warn('Error fetching user orders:', err);
    } finally {
      setLoadingUserOrders((prev) => ({ ...prev, [userId]: false }));
    }
  };

  async function handleToggleApproval(userId, currentStatus) {
    if (readOnly || !canApprove) return;

    const confirmMessage = currentStatus
      ? "Are you sure you want to REVOKE this user's professional access?"
      : 'Approve this user for professional access?';

    notifier.confirmCritical(confirmMessage, async () => {
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          approved: !currentStatus,
        });
        await logAction(
          user?.uid || 'admin',
          'admin',
          currentStatus ? 'USER_REVOKE' : 'USER_APPROVE',
          userId
        );
        fetchUsers(); // Refresh list
      } catch (err) {
        console.error('Error updating user status:', err);
        toast.error('Failed to update user status.');
      }
    });
  };

  async function handleToggleArchive(userId, currentStatus) {
    if (readOnly) return;
    const confirmMessage = currentStatus
      ? 'Unarchive this user?'
      : 'Archive this user? They will be hidden from the main list.';
    notifier.confirmCritical(confirmMessage, async () => {
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { isArchived: !currentStatus });
        await logAction(
          user?.uid || 'admin',
          'admin',
          currentStatus ? 'USER_UNARCHIVE' : 'USER_ARCHIVE',
          userId
        );
        fetchUsers();
      } catch (err) {
        console.error('Error archiving user:', err);
        toast.error('Failed to archive user.');
      }
    });
  };

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
          // Open the impersonation route with the token
          const impersonateUrl = `${window.location.origin}/impersonate?token=${data.customToken}`;
          window.open(impersonateUrl, '_blank');
        } else {
          throw new Error('No custom token returned');
        }
      } catch (err) {
        console.error('Error generating impersonation token:', err);
        toast.dismiss();
        toast.error(err.message || 'Failed to impersonate user.');
      }
    });
  }

  async function handleSaveUser(e) {
    e.preventDefault();
    try {
      const userRef = doc(db, 'users', editingUser.id);
      await updateDoc(userRef, {
        fullName: editingUser.fullName || '',
        institution: editingUser.institution || '',
        role: editingUser.role || 'guest',
      });
      await logAction(user?.uid || 'admin', 'admin', 'USER_UPDATE', editingUser.id, {
        fullName: editingUser.fullName || '',
        institution: editingUser.institution || '',
        role: editingUser.role || 'guest',
      });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      toast.error('Failed to save user.');
    }
  };

  async function handleSendEmail(user) {
    if (readOnly) return;

    setSendingEmail(user.id);
    try {
      const templateParams = {
        to_email: user.email,
        to_name: user.fullName || user.displayName || 'Researcher',
        reply_to: 'business@atlas-health.com',
        email_body_html: getApprovalEmailHtml(user.fullName || user.displayName),
      };

      const sendEmail = httpsCallable(functions, 'sendEmail');
      await sendEmail({
        templateId: EMAILJS_TEMPLATE_ID,
        templateParams
      });

      toast.success(`Email sent successfully to ${user.email}`);
    } catch (error) {
      console.error('FAILED to send email...', error);
      toast.error('Failed to send email. Check console for details.');
    } finally {
      setSendingEmail(null);
    }
  };

  async function handleSendWelcomeOffer(user) {
    if (readOnly) return;

    notifier.confirmCritical(`Send welcome/re-engagement offer email to ${user.email}?`, async () => {
      setSendingEmail(user.id);
      try {
      const welcomeBody = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="background: linear-gradient(135deg, #003666, #005a9c); color: #fff; padding: 20px; text-align: center; border-radius: 6px 6px 0 0;">
            <h1 style="margin: 0; font-size: 20px;">Unlock Your Health Goals with Regenpept</h1>
          </div>
          <div style="padding: 20px; background-color: #fff;">
            <p>Hello <strong>${user.fullName || user.displayName || 'Customer'}</strong>,</p>
            <p>We noticed you registered on Regenpept but haven't placed an order yet. We would love to help you get started on your peptide research or wellness journey!</p>
            <p><strong>Why choose Regenpept?</strong></p>
            <ul>
              <li><strong>Purity Guaranteed:</strong> Every batch is third-party tested with HPLC reports available.</li>
              <li><strong>Affiliated Network:</strong> Get assigned to a qualified physician to supervise your treatment and access specialized B2B pricing.</li>
              <li><strong>Fast Shipping:</strong> Climate-controlled shipping to preserve peptide integrity.</li>
            </ul>
            <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 15px; text-align: center; margin: 20px 0;">
              <span style="font-size: 14px; color: #0369a1; font-weight: bold;">SPECIAL OFFER</span>
              <p style="margin: 5px 0 0; font-size: 16px; color: #0284c7;">Use coupon code <strong>REGENSTART10</strong> at checkout for 10% off your first purchase.</p>
            </div>
            <p>If you'd like to be connected with a supervising doctor or clinic, simply reply to this email, and our support team will assist you.</p>
            <div style="text-align: center; margin-top: 25px;">
              <a href="https://atlas-health.com" style="display: inline-block; padding: 12px 24px; background-color: #1a73e8; color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold;">Browse Catalog</a>
            </div>
          </div>
          <div style="text-align: center; padding: 15px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; margin-top: 20px;">
            <p>&copy; 2024 Regenpept. All rights reserved.</p>
          </div>
        </div>
      `;

      const sendEmail = httpsCallable(functions, 'sendEmail');
      await sendEmail({
        templateId: EMAILJS_TEMPLATE_ID,
        templateParams: {
          to_email: user.email,
          to_name: user.fullName || user.displayName || 'Customer',
          reply_to: 'support@regenpept.com',
          email_body_html: welcomeBody,
        }
      });

      toast.success(`Welcome offer sent successfully to ${user.email}`);
    } catch (error) {
      console.error('FAILED to send welcome email...', error);
        toast.error('Failed to send offer. Check console for details.');
      } finally {
        setSendingEmail(null);
      }
    });
  };

  const showEmailPreview = (user) => {
    setEmailPreview(user);
    setTimeout(() => {
      document.getElementById('email-preview-container')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSelectAll = (filteredUsers) => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    }
  };

  const handleSelectUser = (id) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter((uid) => uid !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  async function handleBulkAction(action, payload = null) {
    if (!selectedUserIds.length || readOnly) return;

    let confirmMsg = '';
    if (action === 'approve') confirmMsg = `Approve ${selectedUserIds.length} users?`;
    if (action === 'revoke') confirmMsg = `Revoke access for ${selectedUserIds.length} users?`;
    if (action === 'archive') confirmMsg = `Archive ${selectedUserIds.length} users?`;
    if (action === 'delete')
      confirmMsg = `PERMANENTLY DELETE ${selectedUserIds.length} users? This cannot be undone!`;
    if (action === 'assignRole')
      confirmMsg = `Assign the role '${payload}' to ${selectedUserIds.length} users?`;

    notifier.confirmCritical(confirmMsg, async () => {
      try {
        setLoading(true);
        for (const uid of selectedUserIds) {
          const userRef = doc(db, 'users', uid);
          const uDoc = await getDoc(userRef);
          if (!uDoc.exists()) continue;
          const uData = uDoc.data();

          if (action === 'approve') await updateDoc(userRef, { approved: true });
          if (action === 'revoke') await updateDoc(userRef, { approved: false });
          if (action === 'archive') await updateDoc(userRef, { isArchived: true });
          if (action === 'delete') await updateDoc(userRef, { isDeleted: true });
          if (action === 'assignRole') {
            const currentRoles = uData.roles || (uData.role ? [uData.role] : []);
            if (!currentRoles.includes(payload)) {
              currentRoles.push(payload);
              await updateDoc(userRef, { roles: currentRoles });
            }
          }

          await logAction(user?.uid || 'admin', 'admin', `BULK_USER_${action.toUpperCase()}`, uid, {
            payload,
          });
        }
        setSelectedUserIds([]);
        fetchUsers();
      } catch (err) {
        console.error('Bulk action error:', err);
        toast.error('Bulk action failed.');
      } finally {
        setLoading(false);
      }
    });
  };

  const isPatientView = defaultRole === 'patient';
  const isDoctorView = defaultRole === 'doctor';
  const isWholesalerView = defaultRole === 'wholesaler';

  const filteredUsersList = users.filter((u) => {
    if (u.isDeleted) return false;
    if (showArchived ? !u.isArchived : u.isArchived) return false;

    // Role filtering is now handled natively by the Firestore query in baseConstraints.
    if (isPatientView && purchaseFilter !== 'all') {
      const hasPurchased =
        purchasedUserIds.has(u.id) ||
        (u.email && purchasedEmails.has(u.email.toLowerCase().trim()));
      if (purchaseFilter === 'buyers' && !hasPurchased) return false;
      if (purchaseFilter === 'no-purchases' && hasPurchased) return false;
    }
    if (dateRange.start || dateRange.end) {
      const created = u.createdAt
        ? new Date(u.createdAt.seconds ? u.createdAt.seconds * 1000 : u.createdAt)
        : null;
      if (created) {
        if (dateRange.start && created < new Date(dateRange.start)) return false;
        if (dateRange.end) {
          const endDate = new Date(dateRange.end);
          endDate.setHours(23, 59, 59, 999);
          if (created > endDate) return false;
        }
      } else {
        // If they have no createdAt and we are filtering by date, typically we exclude them.
        return false;
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const nameMatch =
        (u.fullName || '').toLowerCase().includes(q) ||
        (u.displayName || '').toLowerCase().includes(q);
      const emailMatch = (u.email || '').toLowerCase().includes(q);
      const instMatch = (u.institution || '').toLowerCase().includes(q);
      return nameMatch || emailMatch || instMatch;
    }

    if (purchaseFilter === 'active' && !u.approved) return false;
    if (purchaseFilter === 'pending' && u.approved) return false;

    return true;
  });

  const getActiveFilters = () => {
    const active = [];
    if (purchaseFilter && purchaseFilter !== 'all') {
      active.push({
        label: defaultRole === 'patient' ? 'Purchases' : 'Status',
        value: purchaseFilter,
        type: 'purchaseFilter',
      });
    }
    if (showArchived) {
      active.push({
        label: 'View',
        value: 'Archived',
        type: 'showArchived',
      });
    }
    return active;
  };

  const handleFilterRemove = (f) => {
    if (f.type === 'purchaseFilter') setPurchaseFilter('all');
    if (f.type === 'showArchived') setShowArchived(false);
  };

  const renderCustomFilters = () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
      {(() => {
        if (defaultRole === 'patient') {
          return (
            <select
              value={purchaseFilter}
              onChange={(e) => setPurchaseFilter(e.target.value)}
              style={{
                height: '32px', padding: '0 1.5rem 0 0.75rem', borderRadius: '16px',
                border: '1px solid var(--border)', backgroundColor: purchaseFilter === 'all' ? 'white' : 'var(--primary-light)',
                color: purchaseFilter === 'all' ? 'var(--text-main)' : 'var(--primary)',
                fontSize: '0.8rem', fontWeight: 500, outline: 'none', cursor: 'pointer', appearance: 'none',
              }}
            >
              <option value="all">All Patients</option>
              <option value="buyers">With Purchases</option>
              <option value="no-purchases">No Purchases</option>
            </select>
          );
        }
        if (defaultRole === 'doctor' || defaultRole === 'wholesaler') {
          return (
            <select
              value={purchaseFilter}
              onChange={(e) => setPurchaseFilter(e.target.value)}
              style={{
                height: '32px', padding: '0 1.5rem 0 0.75rem', borderRadius: '16px',
                border: '1px solid var(--border)', backgroundColor: purchaseFilter === 'all' ? 'white' : 'var(--primary-light)',
                color: purchaseFilter === 'all' ? 'var(--text-main)' : 'var(--primary)',
                fontSize: '0.8rem', fontWeight: 500, outline: 'none', cursor: 'pointer', appearance: 'none',
              }}
            >
              <option value="all">All {defaultRole === 'doctor' ? 'Physicians' : 'Wholesalers'}</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
            </select>
          );
        }
        return null;
      })()}

      {defaultRole === 'wholesaler' && (
        <div
          style={{
            display: 'flex',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            overflow: 'hidden',
          }}
        >
          <button
            onClick={() => setActiveView('list')}
            style={{
              padding: '0.4rem 1rem',
              border: 'none',
              backgroundColor: activeView === 'list' ? 'var(--primary)' : 'white',
              color: activeView === 'list' ? 'white' : 'var(--text-main)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            List View
          </button>
          <button
            onClick={() => setActiveView('tree')}
            style={{
              padding: '0.4rem 1rem',
              border: 'none',
              backgroundColor: activeView === 'tree' ? 'var(--primary)' : 'white',
              color: activeView === 'tree' ? 'white' : 'var(--text-main)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              borderLeft: '1px solid var(--border)',
            }}
          >
            Hierarchy View
          </button>
        </div>
      )}

      {defaultRole !== 'doctor' && defaultRole !== 'wholesaler' && (
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            height: '32px',
            padding: '0 12px',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            backgroundColor: 'white',
            color: 'var(--text-main)',
            fontSize: '13px',
            fontWeight: 500,
            textTransform: 'capitalize',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {(defaultRole === 'patient'
            ? ['all', 'patient', 'guest']
            : ['all', 'admin', 'doctor', 'wholesaler', 'patient', 'guest']
          ).map((role) => (
            <option key={role} value={role}>
              {role === 'all' && defaultRole === 'patient' ? 'All Patients' : role}
            </option>
          ))}
        </select>
      )}

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          marginLeft: '0.5rem',
        }}
      >
        <input
          type="checkbox"
          checked={showArchived}
          onChange={(e) => setShowArchived(e.target.checked)}
          style={{ cursor: 'pointer' }}
        />
        Show Archived
      </label>
    </div>
  );

  return (
    <div>
      <ToastContainer toasts={toasts} onDismiss={toast.dismiss} />

      {defaultRole === 'wholesaler' && activeView === 'tree' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ padding: '0.5rem 1rem', background: 'white', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Search size={16} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Search wholesalers..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '0.9rem', width: '200px' }}
              />
            </div>
            {renderCustomFilters()}
          </div>
          <WholesalerTreeView wholesalers={filteredUsersList} onUpdate={fetchUsers} />
        </div>
      )}

      {!(defaultRole === 'wholesaler' && activeView === 'tree') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {/* Create Button Top Right */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '0.25rem' }}>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '13px',
                padding: '0.4rem 1rem',
              }}
            >
              <Plus size={16} />
              Create{' '}
              {defaultRole ? defaultRole.charAt(0).toUpperCase() + defaultRole.slice(1) : 'User'}
            </button>
          </div>
          <AdminUsersTable
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search users by name, email, or institution..."
            filters={getActiveFilters()}
            onFilterRemove={handleFilterRemove}
            renderCustomFilters={renderCustomFilters}
            users={users}
            filteredUsersList={filteredUsersList}
            selectedUserIds={selectedUserIds}
            setSelectedUserIds={setSelectedUserIds}
            defaultRole={defaultRole}
            isPatientView={isPatientView}
            isWholesalerView={isWholesalerView}
            isDoctorView={isDoctorView}
            readOnly={readOnly}
            canApprove={canApprove}
            setEditingUser={setEditingUser}
            setDetailsUser={setDetailsUser}
            handleToggleApproval={handleToggleApproval}
            handleToggleArchive={handleToggleArchive}
            handleSendEmail={handleSendEmail}
            sendingEmail={sendingEmail}
            setFinancialWholesaler={setFinancialWholesaler}
            handleImpersonate={handleImpersonate}
            expandedPatientId={expandedPatientId}
            setExpandedPatientId={setExpandedPatientId}
            fetchUserOrders={fetchUserOrders}
            loadingUserOrders={loadingUserOrders}
            userOrdersMap={userOrdersMap}
            handleSendWelcomeOffer={handleSendWelcomeOffer}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalUsersCount}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(size) => { setPageSize(size); setCurrentPage(1); fetchUsers(1, size); }}
            onPageChange={(page) => { setCurrentPage(page); fetchUsers(page, pageSize); }}
            getPatientRelationships={getPatientRelationships}
            handleAssignDoctorToPatient={handleAssignDoctorToPatient}
            getDoctorWholesaler={getDoctorWholesaler}
            getWholesalerStats={getWholesalerStats}
            renderBatchActions={(selectedIds) => (
              <>
                <button
                  onClick={() => {
                    const toExport = filteredUsersList.filter((u) => selectedIds.includes(u.id));
                    exportToCSV(
                      toExport,
                      `users_export_${new Date().toISOString().slice(0, 10)}.csv`,
                      [
                        { header: 'ID', accessor: 'id' },
                        { header: 'Name', accessor: (u) => u.fullName || u.displayName || '' },
                        { header: 'Email', accessor: 'email' },
                        {
                          header: 'Role',
                          accessor: (u) => (u.roles ? u.roles.join(', ') : u.role || ''),
                        },
                        { header: 'Status', accessor: (u) => (u.approved ? 'Active' : 'Pending') },
                        { header: 'Archived', accessor: (u) => (u.isArchived ? 'Yes' : 'No') },
                        { header: 'Institution', accessor: 'institution' },
                        {
                          header: 'Country',
                          accessor: (u) => u.country || u.shippingCountry || '',
                        },
                      ]
                    );
                  }}
                  className="btn btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    padding: '0.4rem 0.8rem',
                  }}
                >
                  <Download size={14} /> Export Selected
                </button>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkAction('assignRole', e.target.value);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                  style={{
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    fontSize: '13px',
                    color: 'var(--text-main)',
                    backgroundColor: 'white',
                  }}
                >
                  <option value="">Bulk Assign Role...</option>
                  <option value="admin">Admin</option>
                  <option value="wholesaler">Wholesaler</option>
                  <option value="doctor">Doctor</option>
                  <option value="patient">Patient</option>
                </select>
                <button
                  onClick={() => handleBulkAction('approve')}
                  className="gcp-btn-secondary"
                  style={{ color: 'var(--success)', borderColor: 'var(--success)' }}
                >
                  <CheckCircle2 size={14} /> Approve ({selectedIds.length})
                </button>
                <button
                  onClick={() => handleBulkAction('revoke')}
                  className="gcp-btn-secondary"
                  style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                >
                  <XCircle size={14} /> Revoke
                </button>
                <button
                  onClick={() => handleBulkAction('archive')}
                  className="gcp-btn-secondary"
                  style={{ color: '#f59e0b', borderColor: '#f59e0b' }}
                >
                  <Archive size={14} /> Archive
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="gcp-btn-primary"
                  style={{ backgroundColor: 'var(--error)', border: 'none' }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </>
            )}
          />
        </div>
      )}

      {emailPreview && (
        <div
          id="email-preview-container"
          className="card"
          style={{ padding: '2rem', marginTop: '2rem', border: '2px solid var(--primary-light)' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div>
              <h3
                style={{
                  margin: '0 0 0.5rem 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Mail size={18} color="var(--primary)" /> Approval Email Preview
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <strong>To:</strong> {emailPreview.email} (
                {emailPreview.fullName || emailPreview.displayName})
              </div>
            </div>
            <button
              onClick={() => setEmailPreview(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
            >
              <XCircle size={24} />
            </button>
          </div>

          <div
            style={{
              backgroundColor: '#f1f5f9',
              padding: '2rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                backgroundColor: 'white',
                width: '100%',
                maxWidth: '600px',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
              }}
              dangerouslySetInnerHTML={{
                __html: getApprovalEmailHtml(emailPreview.fullName || emailPreview.displayName),
              }}
            />
          </div>
        </div>
      )}

      {editingUser && (
        <EditingUserModal
          editingUser={editingUser}
          setEditingUser={setEditingUser}
          users={users}
          allRelationships={allRelationships}
          handleSaveUser={handleSaveUser}
          zohoLoading={zohoLoading}
          zohoData={zohoData}
          zohoQueryEmail={zohoQueryEmail}
          setZohoQueryEmail={setZohoQueryEmail}
          zohoError={zohoError}
          handleZohoSearch={handleZohoSearch}
          handleRevokeAssignment={handleRevokeAssignment}
          handleAssignUser={handleAssignUser}
          setDetailsUser={setDetailsUser}
        />
      )}

      {financialWholesaler && (
        <FinancialWholesalerModal
          financialWholesaler={financialWholesaler}
          setFinancialWholesaler={setFinancialWholesaler}
          users={users}
          allRelationships={allRelationships}
          wholesalerOrders={wholesalerOrders}
        />
      )}

      {detailsUser && (
        <UserDetailsModal
          isOpen={!!detailsUser}
          onClose={() => setDetailsUser(null)}
          user={detailsUser}
        />
      )}

      {isCreateModalOpen && (
        <CreateUserModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          doctors={allDoctors}
          wholesalers={allWholesalers}
          onCreated={() => fetchUsers(1, pageSize)}
          defaultRole={defaultRole || 'patient'}
        />
      )}

      
      {loading && users.length === 0 ? (
        <DataTableSkeleton columns={5} rows={10} />
      ) : (
        <>
          <AdminUsersTable
            users={filteredUsersList}
            readOnly={readOnly}
            onRefresh={refreshUsers}
            defaultRole={defaultRole}
          />
          {hasMore && (
            <div style={{ padding: '1rem', textAlign: 'center' }}>
              <button className="gcp-btn-secondary" onClick={loadMore}>
                Load More
              </button>
            </div>
          )}
        </>
      )}

      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: AdminUsersTab | Props: none
      </div>
</div>
  );
}
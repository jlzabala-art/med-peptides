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
import {
  ShieldCheck,
  XCircle,
  CheckCircle2,
  Copy,
  Send,
  Mail,
  Search,
  Filter,
  Trash2,
  X,
  Edit,
  Archive,
  Eye,
  UserCheck,
  UserX,
  Inbox,
  Clock,
  AlertCircle,
  Link,
  DollarSign,
  Link2Off,
  User,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { functions } from '../../firebase';
import { httpsCallable } from 'firebase/functions';
import { getApprovalEmailHtml } from '../../data/emailTemplate';
import { useAuth } from '../../context/AuthContext';
import AdminUsersTable from './AdminUsersTable';
import { logAction } from '../../services/auditLogger.js';
import { exportToCSV } from '../../utils/exportUtils';
import { Download, Plus } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../common/Toast';
import CreateUserModal from './CreateUserModal';
import UserDetailsModal from './UserDetailsModal';
import AppFilterBar from '../ui/AppFilterBar';

const EMAILJS_TEMPLATE_ID = 'template_7unfks8'; // Used for backend call

export default function AdminUsersTab({ defaultRole = null, readOnly = false, canApprove = true }) {
  const { user } = useAuth();
  const { toasts, toast } = useToast();
  const [users, setUsers] = useState([]);
  const [userOrdersMap, setUserOrdersMap] = useState({});
  const [loadingUserOrders, setLoadingUserOrders] = useState({});
  const [loading, setLoading] = useState(true);
  const [emailPreview, setEmailPreview] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const deepLinkSearch = params.get('search');

  useEffect(() => {
    if (deepLinkSearch) {
      setSearchQuery(deepLinkSearch);
    }
  }, [deepLinkSearch]);

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

  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [pageCursors, setPageCursors] = useState({}); // map page number to its starting doc

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
    if (!window.confirm('Are you sure you want to unlink this user from this wholesaler?')) return;
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
        // This requires a composite index on roles (array) and createdAt (desc) which we added to firestore.indexes.json.
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

    if (!window.confirm(confirmMessage)) return;

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
  };

  async function handleToggleArchive(userId, currentStatus) {
    if (readOnly) return;
    const confirmMessage = currentStatus
      ? 'Unarchive this user?'
      : 'Archive this user? They will be hidden from the main list.';
    if (!window.confirm(confirmMessage)) return;
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
  };

  async function handleImpersonate(userId) {
    if (readOnly) return;
    if (!window.confirm("Are you sure you want to log in as this user in a new tab?")) return;
    
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

    const confirmSend = window.confirm(`Send welcome/re-engagement offer email to ${user.email}?`);
    if (!confirmSend) return;

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

    if (!window.confirm(confirmMsg)) return;

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
      console.error(`Error performing bulk ${action}:`, err);
      toast.error(`Failed to perform bulk action: ${action}`);
    } finally {
      setLoading(false);
    }
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

      {editingUser &&
        (() => {
          const isWS =
            editingUser.role === 'wholesaler' ||
            (editingUser.roles && editingUser.roles.includes('wholesaler'));

          // Compute lists for assignments
          const wholesalerIds = new Set(
            users
              .filter((u) => (u.roles && u.roles.includes('wholesaler')) || u.role === 'wholesaler')
              .map((u) => u.id)
          );
          const assignedToWholesalerIds = new Set();
          allRelationships.forEach((r) => {
            if (r.status === 'active' && wholesalerIds.has(r.doctorId)) {
              assignedToWholesalerIds.add(r.patientId);
            }
          });
          const freeDoctors = users.filter(
            (u) =>
              (u.role === 'doctor' || (u.roles && u.roles.includes('doctor'))) &&
              !assignedToWholesalerIds.has(u.id)
          );
          const freePatients = users.filter(
            (u) =>
              (u.role === 'patient' ||
                u.role === 'guest' ||
                (u.roles && (u.roles.includes('patient') || u.roles.includes('guest')))) &&
              !assignedToWholesalerIds.has(u.id)
          );

          const currentAssignments = allRelationships.filter(
            (r) => r.doctorId === editingUser.id && r.status === 'active'
          );

          return (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                backdropFilter: 'blur(2px)',
                zIndex: 9999,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  backgroundColor: 'var(--background)',
                  width: '100%',
                  maxWidth: '650px',
                  maxHeight: '85vh',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'var(--color-bg-app)',
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '1.1rem',
                      color: 'var(--text-main)',
                      fontWeight: 600,
                    }}
                  >
                    Edit User Data
                  </h2>
                  <button
                    onClick={() => setEditingUser(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Body */}
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1.5rem',
                    backgroundColor: 'white',
                  }}
                >
                  <form id="edit-user-form" onSubmit={handleSaveUser}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem',
                        marginBottom: '1.25rem',
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            marginBottom: '0.4rem',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                          }}
                        >
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={editingUser.fullName || editingUser.displayName || ''}
                          onChange={(e) =>
                            setEditingUser({ ...editingUser, fullName: e.target.value })
                          }
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '4px',
                            border: '1px solid var(--border)',
                            outline: 'none',
                            boxSizing: 'border-box',
                            fontSize: '0.9rem',
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            marginBottom: '0.4rem',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                          }}
                        >
                          Institution / Clinic{' '}
                          <span
                            style={{
                              color: 'var(--text-muted)',
                              fontWeight: 400,
                              textTransform: 'none',
                            }}
                          >
                            (optional)
                          </span>
                        </label>
                        <input
                          type="text"
                          value={editingUser.institution || ''}
                          onChange={(e) =>
                            setEditingUser({ ...editingUser, institution: e.target.value })
                          }
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '4px',
                            border: '1px solid var(--border)',
                            outline: 'none',
                            boxSizing: 'border-box',
                            fontSize: '0.9rem',
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            marginBottom: '0.4rem',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                          }}
                        >
                          System Role
                        </label>
                        <select
                          value={editingUser.role || 'guest'}
                          onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '4px',
                            border: '1px solid var(--border)',
                            outline: 'none',
                            boxSizing: 'border-box',
                            backgroundColor: 'white',
                            fontSize: '0.9rem',
                          }}
                        >
                          <option value="guest">Guest / Patient</option>
                          <option value="doctor">Physician</option>
                          <option value="wholesaler">Wholesaler</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                  </form>

                  {isWS && (
                    <>
                      <hr
                        style={{
                          border: 'none',
                          borderTop: '1px solid var(--border)',
                          margin: '1.5rem 0',
                        }}
                      />

                      {/* Zoho Books Section */}
                      <div style={{ marginBottom: '1.5rem' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.75rem',
                          }}
                        >
                          <h3
                            style={{
                              margin: 0,
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            Zoho Books Integration
                          </h3>
                          {zohoLoading ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Searching...
                            </span>
                          ) : zohoData ? (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '12px',
                                backgroundColor: '#e6f4ea',
                                color: '#137333',
                                fontWeight: 600,
                              }}
                            >
                              Match: {zohoData.source}
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '12px',
                                backgroundColor: '#f1f3f4',
                                color: '#5f6368',
                                fontWeight: 600,
                              }}
                            >
                              Not Found in Zoho
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                          <input
                            type="email"
                            placeholder="Search by email in Zoho..."
                            value={zohoQueryEmail}
                            onChange={(e) => setZohoQueryEmail(e.target.value)}
                            style={{
                              flex: 1,
                              padding: '0.4rem 0.6rem',
                              borderRadius: '4px',
                              border: '1px solid var(--border)',
                              fontSize: '0.85rem',
                              outline: 'none',
                            }}
                          />
                          <button
                            type="button"
                            className="gcp-btn-secondary"
                            onClick={() => handleZohoSearch(zohoQueryEmail)}
                            disabled={zohoLoading}
                            style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                          >
                            Sync / Search
                          </button>
                        </div>

                        {zohoError && (
                          <div
                            style={{
                              fontSize: '0.8rem',
                              color: '#d93025',
                              backgroundColor: '#fce8e6',
                              padding: '0.5rem 0.75rem',
                              borderRadius: '4px',
                              marginBottom: '1rem',
                            }}
                          >
                            {zohoError}
                          </div>
                        )}

                        {zohoData?.contact && (
                          <div
                            style={{
                              backgroundColor: 'var(--color-bg-app)',
                              border: '1px solid var(--border)',
                              borderRadius: '6px',
                              padding: '0.75rem 1rem',
                              fontSize: '0.85rem',
                            }}
                          >
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '0.5rem',
                                marginBottom: '0.5rem',
                              }}
                            >
                              <div>
                                <strong>Zoho Name:</strong> {zohoData.contact.fullName}
                              </div>
                              <div>
                                <strong>Company:</strong> {zohoData.contact.company || 'N/A'}
                              </div>
                            </div>
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '0.5rem',
                                marginBottom: '0.5rem',
                              }}
                            >
                              <div>
                                <strong>Phone:</strong> {zohoData.contact.phone || 'N/A'}
                              </div>
                              <div>
                                <strong>Email:</strong> {zohoData.contact.email}
                              </div>
                            </div>
                            <div>
                              <strong>Address:</strong>{' '}
                              {[
                                zohoData.contact.address,
                                zohoData.contact.city,
                                zohoData.contact.country,
                              ]
                                .filter(Boolean)
                                .join(', ') || 'N/A'}
                            </div>
                            {zohoData.contact.description && (
                              <div
                                style={{
                                  marginTop: '0.5rem',
                                  fontStyle: 'italic',
                                  color: 'var(--text-muted)',
                                }}
                              >
                                "{zohoData.contact.description}"
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <hr
                        style={{
                          border: 'none',
                          borderTop: '1px solid var(--border)',
                          margin: '1.5rem 0',
                        }}
                      />

                      {/* Doctor & Patient Assignments */}
                      <div>
                        <h3
                          style={{
                            margin: '0 0 0.75rem 0',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          Assigned Physicians & Patients
                        </h3>

                        {/* Current assignments list */}
                        <div
                          style={{
                            marginBottom: '1rem',
                            maxHeight: '150px',
                            overflowY: 'auto',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                          }}
                        >
                          {currentAssignments.length === 0 ? (
                            <div
                              style={{
                                padding: '1rem',
                                fontSize: '0.85rem',
                                color: 'var(--text-muted)',
                                textAlign: 'center',
                              }}
                            >
                              No users assigned currently.
                            </div>
                          ) : (
                            <table
                              style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '0.85rem',
                              }}
                            >
                              <tbody>
                                {currentAssignments.map((r) => {
                                  const peer = users.find((usr) => usr.id === r.patientId);
                                  if (!peer) return null;
                                  const isDoc =
                                    peer.role === 'doctor' ||
                                    (peer.roles && peer.roles.includes('doctor'));
                                  return (
                                    <tr
                                      key={r.id}
                                      style={{ borderBottom: '1px solid var(--border)' }}
                                    >
                                      <td style={{ padding: '0.4rem 0.75rem' }}>
                                        <button
                                          type="button"
                                          onClick={() => setDetailsUser(peer)}
                                          style={{
                                            background: 'none',
                                            border: 'none',
                                            padding: 0,
                                            color: '#1a73e8',
                                            textDecoration: 'underline',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            fontSize: '0.85rem',
                                            textAlign: 'left',
                                          }}
                                        >
                                          {peer.fullName || peer.displayName || peer.email}
                                        </button>
                                      </td>
                                      <td style={{ padding: '0.4rem 0.75rem' }}>
                                        <span
                                          style={{
                                            fontSize: '0.7rem',
                                            padding: '0.1rem 0.4rem',
                                            borderRadius: '10px',
                                            backgroundColor: isDoc
                                              ? 'rgba(26, 115, 232, 0.1)'
                                              : 'rgba(245, 158, 11, 0.1)',
                                            color: isDoc ? '#1a73e8' : '#b45309',
                                            textTransform: 'capitalize',
                                            fontWeight: 600,
                                          }}
                                        >
                                          {isDoc ? 'physician' : 'patient'}
                                        </span>
                                      </td>
                                      <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right' }}>
                                        <button
                                          type="button"
                                          onClick={() => handleRevokeAssignment(r.id)}
                                          style={{
                                            color: '#d93025',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                          }}
                                        >
                                          Unlink
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          )}
                        </div>

                        {/* Assign new doctor */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr auto',
                            gap: '0.5rem',
                            marginBottom: '0.75rem',
                          }}
                        >
                          <select
                            id="assign-doctor-select"
                            defaultValue=""
                            style={{
                              padding: '0.4rem 0.5rem',
                              borderRadius: '4px',
                              border: '1px solid var(--border)',
                              fontSize: '0.85rem',
                              backgroundColor: 'white',
                            }}
                          >
                            <option value="" disabled>
                              Select Free Physician...
                            </option>
                            {freeDoctors.map((doc) => (
                              <option key={doc.id} value={doc.id}>
                                {doc.fullName || doc.displayName} ({doc.email})
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="gcp-btn-secondary"
                            style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                            onClick={() => {
                              const val = document.getElementById('assign-doctor-select').value;
                              if (val) {
                                handleAssignUser(val);
                                document.getElementById('assign-doctor-select').value = '';
                              }
                            }}
                          >
                            Link Physician
                          </button>
                        </div>

                        {/* Assign new patient */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr auto',
                            gap: '0.5rem',
                          }}
                        >
                          <select
                            id="assign-patient-select"
                            defaultValue=""
                            style={{
                              padding: '0.4rem 0.5rem',
                              borderRadius: '4px',
                              border: '1px solid var(--border)',
                              fontSize: '0.85rem',
                              backgroundColor: 'white',
                            }}
                          >
                            <option value="" disabled>
                              Select Free Patient...
                            </option>
                            {freePatients.map((pat) => (
                              <option key={pat.id} value={pat.id}>
                                {pat.fullName || pat.displayName} ({pat.email})
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="gcp-btn-secondary"
                            style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                            onClick={() => {
                              const val = document.getElementById('assign-patient-select').value;
                              if (val) {
                                handleAssignUser(val);
                                document.getElementById('assign-patient-select').value = '';
                              }
                            }}
                          >
                            Link Patient
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer */}
                <div
                  style={{
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid var(--border)',
                    backgroundColor: 'var(--color-bg-app)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '0.75rem',
                  }}
                >
                  <button
                    type="button"
                    className="gcp-btn-secondary"
                    onClick={() => setEditingUser(null)}
                    style={{ fontSize: '0.9rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    form="edit-user-form"
                    type="submit"
                    className="gcp-btn-primary"
                    style={{ fontSize: '0.9rem' }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {financialWholesaler &&
        (() => {
          // Compute revenue data
          const directPatientRels = allRelationships.filter(
            (r) => r.doctorId === financialWholesaler.id && r.status === 'active'
          );
          const directPatientIds = new Set();
          const associatedDoctorIds = new Set();

          directPatientRels.forEach((r) => {
            const peer = users.find((usr) => usr.id === r.patientId);
            if (peer) {
              const isDoc = peer.role === 'doctor' || (peer.roles && peer.roles.includes('doctor'));
              if (isDoc) {
                associatedDoctorIds.add(peer.id);
              } else {
                directPatientIds.add(peer.id);
              }
            }
          });

          const doctorPatientRels = allRelationships.filter(
            (r) => associatedDoctorIds.has(r.doctorId) && r.status === 'active'
          );
          const doctorPatientMap = {};
          doctorPatientRels.forEach((r) => {
            doctorPatientMap[r.patientId] = r.doctorId;
          });

          let doctorRevenue = {};
          let patientRevenue = {};

          wholesalerOrders.forEach((order) => {
            if (order.status === 'cancelled') return;
            const total = order.total || 0;
            const userId = order.userId;
            if (!userId) return;

            if (directPatientIds.has(userId)) {
              const patientUser = users.find((u) => u.id === userId);
              const name = patientUser
                ? patientUser.fullName || patientUser.displayName
                : `Paciente (${userId.substring(0, 6)})`;
              if (!patientRevenue[userId]) {
                patientRevenue[userId] = { name, total: 0, orderCount: 0 };
              }
              patientRevenue[userId].total += total;
              patientRevenue[userId].orderCount += 1;
            } else if (doctorPatientMap[userId]) {
              const docId = doctorPatientMap[userId];
              const doctorUser = users.find((u) => u.id === docId);
              const docName = doctorUser
                ? doctorUser.fullName || doctorUser.displayName
                : `Médico (${docId.substring(0, 6)})`;
              if (!doctorRevenue[docId]) {
                doctorRevenue[docId] = { name: docName, total: 0, orderCount: 0 };
              }
              doctorRevenue[docId].total += total;
              doctorRevenue[docId].orderCount += 1;
            }
          });

          const docList = Object.values(doctorRevenue).sort((a, b) => b.total - a.total);
          const patList = Object.values(patientRevenue).sort((a, b) => b.total - a.total);

          const totalDocRevenue = docList.reduce((acc, curr) => acc + curr.total, 0);
          const totalPatRevenue = patList.reduce((acc, curr) => acc + curr.total, 0);
          const grandTotalRevenue = totalDocRevenue + totalPatRevenue;

          return (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                backdropFilter: 'blur(2px)',
                zIndex: 9999,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  backgroundColor: 'var(--background)',
                  width: '100%',
                  maxWidth: '550px',
                  maxHeight: '85vh',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'var(--color-bg-app)',
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '1.1rem',
                      color: '#1a73e8',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <DollarSign size={18} /> Revenue Summary
                  </h2>
                  <button
                    onClick={() => setFinancialWholesaler(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Body */}
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1.5rem',
                    backgroundColor: 'white',
                  }}
                >
                  <div style={{ marginBottom: '1.25rem' }}>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                      }}
                    >
                      Wholesaler
                    </span>
                    <div
                      style={{
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        marginTop: '0.2rem',
                      }}
                    >
                      {financialWholesaler.fullName || financialWholesaler.displayName}
                    </div>
                  </div>

                  {loadingOrders ? (
                    <div
                      style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}
                    >
                      Loading order history...
                    </div>
                  ) : (
                    <>
                      {/* Portal Orders (USD) */}
                      <div style={{ marginBottom: '2rem' }}>
                        <h3
                          style={{
                            margin: '0 0 0.75rem 0',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          Portal Orders (USD)
                        </h3>
                        {/* Summary Totals */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1rem',
                            marginBottom: '1.5rem',
                          }}
                        >
                          <div
                            style={{
                              padding: '0.75rem 1rem',
                              background: 'var(--color-bg-app)',
                              border: '1px solid var(--border)',
                              borderRadius: '6px',
                            }}
                          >
                            <div
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: 'var(--text-muted)',
                              }}
                            >
                              Via Physicians
                            </div>
                            <div
                              style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: 'var(--text-main)',
                                marginTop: '0.2rem',
                              }}
                            >
                              $
                              {totalDocRevenue.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </div>
                          </div>
                          <div
                            style={{
                              padding: '0.75rem 1rem',
                              background: 'var(--color-bg-app)',
                              border: '1px solid var(--border)',
                              borderRadius: '6px',
                            }}
                          >
                            <div
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: 'var(--text-muted)',
                              }}
                            >
                              Direct Patients
                            </div>
                            <div
                              style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: 'var(--text-main)',
                                marginTop: '0.2rem',
                              }}
                            >
                              $
                              {totalPatRevenue.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            padding: '1rem',
                            background: 'rgba(26, 115, 232, 0.05)',
                            border: '1px solid rgba(26, 115, 232, 0.15)',
                            borderRadius: '6px',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span style={{ fontWeight: 700, color: '#1a73e8', fontSize: '0.95rem' }}>
                            ACCUMULATED TOTAL
                          </span>
                          <span style={{ fontWeight: 900, color: '#1a73e8', fontSize: '1.4rem' }}>
                            $
                            {grandTotalRevenue.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>

                        {/* Table for Doctors */}
                        <div style={{ marginBottom: '1.5rem' }}>
                          <h4
                            style={{
                              margin: '0 0 0.5rem 0',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            Revenue by Clinics / Physicians ({docList.length})
                          </h4>
                          {docList.length === 0 ? (
                            <div
                              style={{
                                fontSize: '0.85rem',
                                color: 'var(--text-muted)',
                                padding: '0.5rem 0',
                              }}
                            >
                              No revenue recorded via associated physicians.
                            </div>
                          ) : (
                            <table
                              style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '0.85rem',
                              }}
                            >
                              <thead>
                                <tr
                                  style={{
                                    borderBottom: '2px solid var(--border)',
                                    textAlign: 'left',
                                  }}
                                >
                                  <th
                                    style={{
                                      padding: '0.4rem 0.5rem',
                                      color: 'var(--text-muted)',
                                      fontWeight: 600,
                                    }}
                                  >
                                    Physician / Clinic
                                  </th>
                                  <th
                                    style={{
                                      padding: '0.4rem 0.5rem',
                                      color: 'var(--text-muted)',
                                      fontWeight: 600,
                                      textAlign: 'center',
                                    }}
                                  >
                                    Orders
                                  </th>
                                  <th
                                    style={{
                                      padding: '0.4rem 0.5rem',
                                      color: 'var(--text-muted)',
                                      fontWeight: 600,
                                      textAlign: 'right',
                                    }}
                                  >
                                    Total
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {docList.map((doc, idx) => (
                                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td
                                      style={{
                                        padding: '0.5rem',
                                        fontWeight: 600,
                                        color: 'var(--text-main)',
                                      }}
                                    >
                                      {doc.name}
                                    </td>
                                    <td
                                      style={{
                                        padding: '0.5rem',
                                        textAlign: 'center',
                                        color: 'var(--text-muted)',
                                      }}
                                    >
                                      {doc.orderCount}
                                    </td>
                                    <td
                                      style={{
                                        padding: '0.5rem',
                                        textAlign: 'right',
                                        fontWeight: 700,
                                      }}
                                    >
                                      $
                                      {doc.total.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>

                        {/* Table for Direct Patients */}
                        <div>
                          <h4
                            style={{
                              margin: '0 0 0.5rem 0',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            Revenue by Direct Patients ({patList.length})
                          </h4>
                          {patList.length === 0 ? (
                            <div
                              style={{
                                fontSize: '0.85rem',
                                color: 'var(--text-muted)',
                                padding: '0.5rem 0',
                              }}
                            >
                              No revenue recorded from direct patients.
                            </div>
                          ) : (
                            <table
                              style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '0.85rem',
                              }}
                            >
                              <thead>
                                <tr
                                  style={{
                                    borderBottom: '2px solid var(--border)',
                                    textAlign: 'left',
                                  }}
                                >
                                  <th
                                    style={{
                                      padding: '0.4rem 0.5rem',
                                      color: 'var(--text-muted)',
                                      fontWeight: 600,
                                    }}
                                  >
                                    Patient
                                  </th>
                                  <th
                                    style={{
                                      padding: '0.4rem 0.5rem',
                                      color: 'var(--text-muted)',
                                      fontWeight: 600,
                                      textAlign: 'center',
                                    }}
                                  >
                                    Orders
                                  </th>
                                  <th
                                    style={{
                                      padding: '0.4rem 0.5rem',
                                      color: 'var(--text-muted)',
                                      fontWeight: 600,
                                      textAlign: 'right',
                                    }}
                                  >
                                    Total
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {patList.map((pat, idx) => (
                                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td
                                      style={{
                                        padding: '0.5rem',
                                        fontWeight: 600,
                                        color: 'var(--text-main)',
                                      }}
                                    >
                                      {pat.name}
                                    </td>
                                    <td
                                      style={{
                                        padding: '0.5rem',
                                        textAlign: 'center',
                                        color: 'var(--text-muted)',
                                      }}
                                    >
                                      {pat.orderCount}
                                    </td>
                                    <td
                                      style={{
                                        padding: '0.5rem',
                                        textAlign: 'right',
                                        fontWeight: 700,
                                      }}
                                    >
                                      $
                                      {pat.total.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>

                      {/* Zoho Books ERP Integration */}
                      <div
                        style={{
                          marginTop: '2rem',
                          borderTop: '2px solid var(--border)',
                          paddingTop: '1.5rem',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1rem',
                          }}
                        >
                          <h3
                            style={{
                              margin: 0,
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                            }}
                          >
                            <Building2 size={16} color="var(--primary)" /> Zoho Books ERP
                            Integration
                          </h3>
                          {zohoFinancialLoading ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Loading Zoho data...
                            </span>
                          ) : zohoFinancialData ? (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '12px',
                                backgroundColor: '#e6f4ea',
                                color: '#137333',
                                fontWeight: 600,
                              }}
                            >
                              Matched
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '12px',
                                backgroundColor: '#fdf2f2',
                                color: '#c5221f',
                                fontWeight: 600,
                              }}
                            >
                              Not Found
                            </span>
                          )}
                        </div>

                        {zohoFinancialLoading ? (
                          <div
                            style={{
                              padding: '1.5rem',
                              textAlign: 'center',
                              color: 'var(--text-muted)',
                              fontSize: '0.9rem',
                            }}
                          >
                            Fetching Zoho Books invoices...
                          </div>
                        ) : zohoFinancialError ? (
                          <div
                            style={{
                              backgroundColor: '#fdf2f2',
                              border: '1px solid #fde2e2',
                              borderRadius: '6px',
                              padding: '1rem',
                              fontSize: '0.85rem',
                              color: '#c5221f',
                            }}
                          >
                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                              Not Connected to Zoho Books
                            </div>
                            <div>
                              No wholesaler contact found in Zoho Books matching email:{' '}
                              <strong>{financialWholesaler.email}</strong>.
                            </div>
                            <div
                              style={{
                                marginTop: '0.75rem',
                                fontSize: '0.8rem',
                                color: 'var(--text-muted)',
                              }}
                            >
                              Please ensure the wholesaler's email in the portal matches their
                              contact profile in Zoho Books.
                            </div>
                          </div>
                        ) : zohoFinancialData ? (
                          <div>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: 'var(--color-bg-app)',
                                border: '1px solid var(--border)',
                                borderRadius: '6px',
                                padding: '0.75rem 1rem',
                                marginBottom: '1.5rem',
                              }}
                            >
                              <div>
                                <div
                                  style={{
                                    fontWeight: 600,
                                    color: 'var(--text-main)',
                                    fontSize: '0.85rem',
                                  }}
                                >
                                  {zohoFinancialData.contact.fullName}
                                </div>
                                <div
                                  style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--text-muted)',
                                    marginTop: '0.1rem',
                                  }}
                                >
                                  {zohoFinancialData.contact.company || 'No Company'} •{' '}
                                  {zohoFinancialData.contact.email}
                                </div>
                              </div>
                              <a
                                href={`https://erp.mediluxeme.com/app/662274409#/contacts/${zohoFinancialData.contact.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="gcp-btn-secondary"
                                style={{
                                  fontSize: '0.8rem',
                                  padding: '0.35rem 0.75rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  textDecoration: 'none',
                                }}
                              >
                                Open in Zoho Books ↗
                              </a>
                            </div>

                            <h4
                              style={{
                                margin: '0 0 0.5rem 0',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                color: 'var(--text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                              }}
                            >
                              Zoho Books Invoices ({zohoFinancialData.invoices?.length || 0})
                            </h4>

                            {!zohoFinancialData.invoices ||
                            zohoFinancialData.invoices.length === 0 ? (
                              <div
                                style={{
                                  fontSize: '0.85rem',
                                  color: 'var(--text-muted)',
                                  padding: '0.5rem 0',
                                  textAlign: 'center',
                                  fontStyle: 'italic',
                                }}
                              >
                                No invoices found in Zoho Books.
                              </div>
                            ) : (
                              <div
                                style={{
                                  maxHeight: '200px',
                                  overflowY: 'auto',
                                  border: '1px solid var(--border)',
                                  borderRadius: '6px',
                                }}
                              >
                                <table
                                  style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    fontSize: '0.85rem',
                                  }}
                                >
                                  <thead>
                                    <tr
                                      style={{
                                        borderBottom: '2px solid var(--border)',
                                        textAlign: 'left',
                                        backgroundColor: 'var(--color-bg-app)',
                                        position: 'sticky',
                                        top: 0,
                                      }}
                                    >
                                      <th
                                        style={{
                                          padding: '0.5rem 0.75rem',
                                          color: 'var(--text-muted)',
                                          fontWeight: 600,
                                        }}
                                      >
                                        Invoice #
                                      </th>
                                      <th
                                        style={{
                                          padding: '0.5rem 0.75rem',
                                          color: 'var(--text-muted)',
                                          fontWeight: 600,
                                        }}
                                      >
                                        Date
                                      </th>
                                      <th
                                        style={{
                                          padding: '0.5rem 0.75rem',
                                          color: 'var(--text-muted)',
                                          fontWeight: 600,
                                          textAlign: 'center',
                                        }}
                                      >
                                        Status
                                      </th>
                                      <th
                                        style={{
                                          padding: '0.5rem 0.75rem',
                                          color: 'var(--text-muted)',
                                          fontWeight: 600,
                                          textAlign: 'right',
                                        }}
                                      >
                                        Total (AED)
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {zohoFinancialData.invoices.map((inv, idx) => (
                                      <tr
                                        key={idx}
                                        style={{ borderBottom: '1px solid var(--border)' }}
                                      >
                                        <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>
                                          <a
                                            href={`https://erp.mediluxeme.com/app/662274409#/invoices/${inv.invoiceId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                              color: '#1a73e8',
                                              textDecoration: 'underline',
                                            }}
                                          >
                                            {inv.invoiceNumber}
                                          </a>
                                        </td>
                                        <td
                                          style={{
                                            padding: '0.5rem 0.75rem',
                                            color: 'var(--text-muted)',
                                          }}
                                        >
                                          {inv.date}
                                        </td>
                                        <td
                                          style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}
                                        >
                                          <span
                                            style={{
                                              fontSize: '0.7rem',
                                              padding: '0.1rem 0.4rem',
                                              borderRadius: '10px',
                                              backgroundColor:
                                                inv.status === 'paid' ? '#e6f4ea' : '#fef3c7',
                                              color: inv.status === 'paid' ? '#137333' : '#b45309',
                                              textTransform: 'capitalize',
                                              fontWeight: 600,
                                            }}
                                          >
                                            {inv.status}
                                          </span>
                                        </td>
                                        <td
                                          style={{
                                            padding: '0.5rem 0.75rem',
                                            textAlign: 'right',
                                            fontWeight: 700,
                                          }}
                                        >
                                          {inv.total.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </>
                  )}
                </div>

                {/* Footer */}
                <div
                  style={{
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid var(--border)',
                    backgroundColor: 'var(--color-bg-app)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  <button
                    type="button"
                    className="gcp-btn-secondary"
                    onClick={() => setFinancialWholesaler(null)}
                    style={{ fontSize: '0.9rem' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {detailsUser && (
        <UserDetailsModal
          isOpen={!!detailsUser}
          onClose={() => setDetailsUser(null)}
          user={detailsUser}
        />
      )}

      <AdminUsersTable
        users={filteredUsersList}
        readOnly={readOnly}
        onRefresh={fetchUsers}
        defaultRole={defaultRole}
      />
    
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: AdminUsersTab | Props: none
      </div>
    
</div>
  );
}

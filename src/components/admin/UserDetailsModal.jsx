import X from "lucide-react/dist/esm/icons/x";
import User from "lucide-react/dist/esm/icons/user";
import ShoppingBag from "lucide-react/dist/esm/icons/shopping-bag";
import MessageSquare from "lucide-react/dist/esm/icons/message-square";
import LinkIcon from "lucide-react/dist/esm/icons/link";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import Mail from "lucide-react/dist/esm/icons/mail";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import Activity from "lucide-react/dist/esm/icons/activity";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import React, { useState, useEffect } from 'react';
import StandardDrawer from '../ui/StandardDrawer';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../firebase';
import {
  getRelationshipsForPatient,
  getRelationshipsForDoctor,
  createRelationship,
  updateRelationshipStatus,
} from '../../services/assignmentService';













import { logAction } from '../../services/auditLogger';
import notifier from '../../services/NotificationService';

export default function UserDetailsModal({ isOpen, onClose, user, onUserUpdate }) {
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    orders: false,
    ai: false,
    assignments: false,
  });
  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [loadingRels, setLoadingRels] = useState(false);

  const [assignTarget, setAssignTarget] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setExpandedSections({
        overview: true,
        orders: false,
        ai: false,
        assignments: false,
      });
      fetchOrders();
      fetchLogs();
      fetchRelationships();
      if (user.role === 'patient' || !user.role) fetchDoctors();
      if (user.role === 'doctor' || user.role === 'wholesaler') fetchPatients();
    }
  }, [isOpen, user]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const fetchOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const q = query(collection(db, 'orders'), where('userId', '==', user.id), limit(20));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Sort in memory since we might not have a composite index for userId + createdAt DESC
      data.sort((a, b) => {
        const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dbTime = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dbTime - da;
      });
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchLogs = async () => {
    if (!user) return;
    setLoadingLogs(true);
    try {
      const q = query(collection(db, 'clinical_logs'), where('userId', '==', user.id), limit(50));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => {
        const da = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp || 0);
        const dbTime = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp || 0);
        return dbTime - da;
      });
      setLogs(data);
    } catch (err) {
      console.error('Error fetching clinical logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchRelationships = async () => {
    if (!user) return;
    setLoadingRels(true);
    try {
      let rels = [];
      if (user.role === 'doctor' || user.role === 'wholesaler') {
        rels = await getRelationshipsForDoctor(user.id);
      } else {
        rels = await getRelationshipsForPatient(user.id);
      }

      // Fetch user details for the other party
      const enriched = await Promise.all(
        rels.map(async (r) => {
          const otherId = user.id === r.patientId ? r.doctorId : r.patientId;
          // In a real app we might cache this, but for admin view it's ok
          let otherName = 'Unknown User';
          if (otherId) {
            const userQ = query(collection(db, 'users'), where('__name__', '==', otherId));
            const uSnap = await getDocs(userQ);
            if (!uSnap.empty) {
              const uData = uSnap.docs[0].data();
              otherName = uData.fullName || uData.displayName || uData.email;
            }
          }
          return { ...r, otherName };
        })
      );

      setRelationships(enriched);
    } catch (err) {
      console.error('Error fetching relationships:', err);
    } finally {
      setLoadingRels(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const q = query(collection(db, 'users'));
      const snap = await getDocs(q);
      const allUsers = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const docs = allUsers.filter((u) => {
        const userRoles = u.roles || (u.role ? [u.role] : []);
        return userRoles.includes('doctor') || userRoles.includes('clinic');
      });
      setDoctors(docs);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPatients = async () => {
    try {
      const q = query(collection(db, 'users'));
      const snap = await getDocs(q);
      const allUsers = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const pats = allUsers.filter((u) => {
        const userRoles = u.roles || (u.role ? [u.role] : []);
        // Si no tiene roles o tiene explícitamente el de patient
        return userRoles.includes('patient') || userRoles.length === 0;
      });
      setPatients(pats);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssign = async () => {
    if (!assignTarget) return;
    setAssigning(true);
    try {
      let patientId, doctorId;
      if (user.role === 'doctor' || user.role === 'wholesaler') {
        doctorId = user.id;
        patientId = assignTarget;
      } else {
        patientId = user.id;
        doctorId = assignTarget;
      }

      await createRelationship({
        patientId,
        doctorId,
        initiatedBy: 'admin',
        initiatedByRole: 'admin',
        status: 'active',
      });

      await logAction('admin', 'admin', 'CREATE_RELATIONSHIP', `${patientId}-${doctorId}`);

      if (sendEmail) {
        // Here you would hook into emailjs to notify them
        console.log('Email notification triggered for assignment.');
        notifier.info('Relationship created and email notification sent.');
      } else {
        notifier.info('Relationship created silently.');
      }

      setAssignTarget('');
      fetchRelationships();
    } catch (err) {
      console.error(err);
      notifier.info(err.message || 'Failed to create relationship.');
    } finally {
      setAssigning(false);
    }
  };

  const handleRevokeRelationship = async (relId) => {
    notifier.confirmCritical('Are you sure you want to revoke this assignment?', async () => {
      try {
        await updateRelationshipStatus(relId, 'revoked');
        fetchRelationships();
      } catch (err) {
        console.error(err);
        notifier.info('Failed to revoke relationship.');
      }
    });
  };

  if (!isOpen || !user) return null;

  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      width="850px"
      bodyPadding="0"
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {user.fullName || user.displayName || 'Unnamed User'}
          {user.approved && <ShieldCheck size={16} color="var(--success)" title="Approved" />}
        </span>
      }
      subtitle={
        <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Mail size={14} /> {user.email || 'No email'}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><User size={14} /> ID: {user.id.substring(0, 8)}...</span>
          {user.role !== 'wholesaler' && (
            <span style={{ backgroundColor: 'rgba(0,0,0,0.05)', padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-main)' }}>
              {user.role || 'Patient'}
            </span>
          )}
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* SECTION 1: OVERVIEW */}
          <div style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'white' }}>
            <button
              onClick={() => toggleSection('overview')}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.25rem 1.5rem',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: expandedSections.overview ? '#1a73e8' : 'var(--text-main)',
                fontWeight: 600,
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-app)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={18} />
                Overview
              </span>
              <ChevronDown
                size={18}
                style={{
                  transform: expandedSections.overview ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                  color: expandedSections.overview ? '#1a73e8' : 'var(--text-muted)',
                }}
              />
            </button>

            {expandedSections.overview && (
              <div
                style={{
                  padding: '1.5rem',
                  backgroundColor: 'var(--color-bg-app)',
                  borderTop: '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1.5rem',
                  }}
                >
                  <div
                    style={{
                      padding: '1.5rem',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      backgroundColor: 'white',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    }}
                  >
                    <h3
                      style={{
                        margin: '0 0 1.25rem 0',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                        letterSpacing: '0.05em',
                      }}
                    >
                      User Information
                    </h3>
                    <div style={{ display: 'grid', gap: '1rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                          Full Name:
                        </span>
                        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                          {user.fullName || user.displayName || '-'}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Email:</span>
                        <span style={{ color: 'var(--text-main)' }}>{user.email || '-'}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                          Institution:
                        </span>
                        <span style={{ color: 'var(--text-main)' }}>{user.institution || '-'}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Phone:</span>
                        <span style={{ color: 'var(--text-main)' }}>{user.phone || '-'}</span>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '1.5rem',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      backgroundColor: 'white',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    }}
                  >
                    <h3
                      style={{
                        margin: '0 0 1.25rem 0',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                        letterSpacing: '0.05em',
                      }}
                    >
                      System Metadata
                    </h3>
                    <div style={{ display: 'grid', gap: '1rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                          Account Status:
                        </span>
                        <span>
                          {user.approved ? (
                            <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                              Active (Approved)
                            </span>
                          ) : (
                            <span style={{ color: 'var(--error)', fontWeight: 600 }}>
                              Pending Approval
                            </span>
                          )}
                          {user.isArchived && (
                            <span
                              style={{ color: '#f59e0b', fontWeight: 600, marginLeft: '0.5rem' }}
                            >
                              (Archived)
                            </span>
                          )}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                          Created At:
                        </span>
                        <span style={{ color: 'var(--text-main)' }}>
                          {user.createdAt
                            ? new Date(
                                user.createdAt.seconds
                                  ? user.createdAt.seconds * 1000
                                  : user.createdAt
                              ).toLocaleDateString()
                            : 'Unknown'}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                          Last Login:
                        </span>
                        <span style={{ color: 'var(--text-main)' }}>
                          {user.lastLoginAt
                            ? new Date(
                                user.lastLoginAt.seconds
                                  ? user.lastLoginAt.seconds * 1000
                                  : user.lastLoginAt
                              ).toLocaleString()
                            : 'Not recorded'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: ORDERS */}
          <div style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'white' }}>
            <button
              onClick={() => toggleSection('orders')}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.25rem 1.5rem',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: expandedSections.orders ? '#1a73e8' : 'var(--text-main)',
                fontWeight: 600,
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-app)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingBag size={18} />
                Orders
              </span>
              <ChevronDown
                size={18}
                style={{
                  transform: expandedSections.orders ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                  color: expandedSections.orders ? '#1a73e8' : 'var(--text-muted)',
                }}
              />
            </button>

            {expandedSections.orders && (
              <div
                style={{
                  padding: '1.5rem',
                  backgroundColor: 'var(--color-bg-app)',
                  borderTop: '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <div
                    style={{
                      padding: '1rem 1.5rem',
                      borderBottom: '1px solid var(--border)',
                      backgroundColor: 'white',
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Purchase History
                    </h3>
                  </div>
                  {loadingOrders ? (
                    <div
                      style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}
                    >
                      Loading orders...
                    </div>
                  ) : orders.length === 0 ? (
                    <div
                      style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}
                    >
                      No orders found for this user.
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table
                        className="gcp-table"
                        style={{ width: '100%', borderCollapse: 'collapse' }}
                      >
                        <thead>
                          <tr
                            style={{
                              borderBottom: '1px solid var(--border)',
                              backgroundColor: 'var(--color-bg-app)',
                            }}
                          >
                            <th
                              style={{
                                padding: '0.75rem 1rem',
                                textAlign: 'left',
                                fontSize: '0.8rem',
                                textTransform: 'uppercase',
                                color: 'var(--text-muted)',
                                fontWeight: 600,
                              }}
                            >
                              Date
                            </th>
                            <th
                              style={{
                                padding: '0.75rem 1rem',
                                textAlign: 'left',
                                fontSize: '0.8rem',
                                textTransform: 'uppercase',
                                color: 'var(--text-muted)',
                                fontWeight: 600,
                              }}
                            >
                              Order ID
                            </th>
                            <th
                              style={{
                                padding: '0.75rem 1rem',
                                textAlign: 'left',
                                fontSize: '0.8rem',
                                textTransform: 'uppercase',
                                color: 'var(--text-muted)',
                                fontWeight: 600,
                              }}
                            >
                              Status
                            </th>
                            <th
                              style={{
                                padding: '0.75rem 1rem',
                                textAlign: 'right',
                                fontSize: '0.8rem',
                                textTransform: 'uppercase',
                                color: 'var(--text-muted)',
                                fontWeight: 600,
                              }}
                            >
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((o) => (
                            <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td
                                style={{
                                  padding: '0.75rem 1rem',
                                  fontSize: '0.85rem',
                                  color: 'var(--text-main)',
                                }}
                              >
                                {o.createdAt?.toDate
                                  ? o.createdAt.toDate().toLocaleDateString()
                                  : o.createdAt
                                    ? new Date(o.createdAt).toLocaleDateString()
                                    : '-'}
                              </td>
                              <td
                                style={{
                                  padding: '0.75rem 1rem',
                                  fontSize: '0.85rem',
                                  fontFamily: 'monospace',
                                  color: 'var(--text-muted)',
                                }}
                              >
                                {o.id.substring(0, 8)}...
                              </td>
                              <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                                <span
                                  style={{
                                    backgroundColor:
                                      o.status === 'completed'
                                        ? 'rgba(16,185,129,0.1)'
                                        : 'rgba(245,158,11,0.1)',
                                    color: o.status === 'completed' ? 'var(--success)' : '#f59e0b',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    textTransform: 'capitalize',
                                  }}
                                >
                                  {o.status || 'pending'}
                                </span>
                              </td>
                              <td
                                style={{
                                  padding: '0.75rem 1rem',
                                  fontSize: '0.85rem',
                                  textAlign: 'right',
                                  fontWeight: 600,
                                }}
                              >
                                ${parseFloat(o.total || 0).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: CLINICAL AI */}
          <div style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'white' }}>
            <button
              onClick={() => toggleSection('ai')}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.25rem 1.5rem',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: expandedSections.ai ? '#1a73e8' : 'var(--text-main)',
                fontWeight: 600,
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-app)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={18} />
                Clinical AI
              </span>
              <ChevronDown
                size={18}
                style={{
                  transform: expandedSections.ai ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                  color: expandedSections.ai ? '#1a73e8' : 'var(--text-muted)',
                }}
              />
            </button>

            {expandedSections.ai && (
              <div
                style={{
                  padding: '1.5rem',
                  backgroundColor: 'var(--color-bg-app)',
                  borderTop: '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <div
                    style={{
                      padding: '1rem 1.5rem',
                      borderBottom: '1px solid var(--border)',
                      backgroundColor: 'white',
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Clinical AI Consultations
                    </h3>
                  </div>
                  {loadingLogs ? (
                    <div
                      style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}
                    >
                      Loading logs...
                    </div>
                  ) : logs.length === 0 ? (
                    <div
                      style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}
                    >
                      No AI interactions recorded.
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table
                        className="gcp-table"
                        style={{ width: '100%', borderCollapse: 'collapse' }}
                      >
                        <thead>
                          <tr
                            style={{
                              borderBottom: '1px solid var(--border)',
                              backgroundColor: 'var(--color-bg-app)',
                            }}
                          >
                            <th
                              style={{
                                padding: '0.75rem 1rem',
                                textAlign: 'left',
                                fontSize: '0.8rem',
                                textTransform: 'uppercase',
                                color: 'var(--text-muted)',
                                fontWeight: 600,
                              }}
                            >
                              Date
                            </th>
                            <th
                              style={{
                                padding: '0.75rem 1rem',
                                textAlign: 'left',
                                fontSize: '0.8rem',
                                textTransform: 'uppercase',
                                color: 'var(--text-muted)',
                                fontWeight: 600,
                              }}
                            >
                              Intent / Query Type
                            </th>
                            <th
                              style={{
                                padding: '0.75rem 1rem',
                                textAlign: 'left',
                                fontSize: '0.8rem',
                                textTransform: 'uppercase',
                                color: 'var(--text-muted)',
                                fontWeight: 600,
                              }}
                            >
                              Query Excerpt
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {logs.map((l) => (
                            <tr key={l.id} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td
                                style={{
                                  padding: '0.75rem 1rem',
                                  fontSize: '0.85rem',
                                  whiteSpace: 'nowrap',
                                  color: 'var(--text-muted)',
                                }}
                              >
                                {l.timestamp?.toDate
                                  ? l.timestamp.toDate().toLocaleString()
                                  : l.timestamp
                                    ? new Date(l.timestamp).toLocaleString()
                                    : '-'}
                              </td>
                              <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                                <span
                                  style={{
                                    backgroundColor: 'var(--border)',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: 'var(--text-main)',
                                  }}
                                >
                                  {l.intent || 'general'}
                                </span>
                              </td>
                              <td
                                style={{
                                  padding: '0.75rem 1rem',
                                  fontSize: '0.85rem',
                                  maxWidth: '400px',
                                }}
                              >
                                <div
                                  style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    color: 'var(--text-main)',
                                  }}
                                >
                                  "{l.query}"
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: ASSIGNMENTS */}
          <div style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'white' }}>
            <button
              onClick={() => toggleSection('assignments')}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.25rem 1.5rem',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: expandedSections.assignments ? '#1a73e8' : 'var(--text-main)',
                fontWeight: 600,
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-app)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LinkIcon size={18} />
                Assignments
              </span>
              <ChevronDown
                size={18}
                style={{
                  transform: expandedSections.assignments ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                  color: expandedSections.assignments ? '#1a73e8' : 'var(--text-muted)',
                }}
              />
            </button>

            {expandedSections.assignments && (
              <div
                style={{
                  padding: '1.5rem',
                  backgroundColor: 'var(--color-bg-app)',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem',
                }}
              >
                <div
                  style={{
                    padding: '1.5rem',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <h3
                    style={{
                      margin: '0 0 1.25rem 0',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Create New Assignment
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      gap: '1.5rem',
                      alignItems: 'flex-end',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ flex: '1 1 200px' }}>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: 'var(--text-muted)',
                          marginBottom: '0.5rem',
                        }}
                      >
                        Assign to{' '}
                        {user.role === 'doctor' || user.role === 'wholesaler'
                          ? 'Patient'
                          : 'Doctor'}
                        :
                      </label>
                      <select
                        value={assignTarget}
                        onChange={(e) => setAssignTarget(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.5rem',
                          borderRadius: '4px',
                          border: '1px solid var(--border)',
                          outline: 'none',
                          fontSize: '0.85rem',
                          backgroundColor: 'white',
                        }}
                      >
                        <option value="">-- Select --</option>
                        {(user.role === 'doctor' || user.role === 'wholesaler'
                          ? patients
                          : doctors
                        ).map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.fullName || u.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.6rem',
                      }}
                    >
                      <input
                        type="checkbox"
                        id="sendEmailCheck"
                        checked={sendEmail}
                        onChange={(e) => setSendEmail(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      <label
                        htmlFor="sendEmailCheck"
                        style={{
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          color: 'var(--text-main)',
                        }}
                      >
                        Send Email Notification
                      </label>
                    </div>
                    <button
                      onClick={handleAssign}
                      disabled={!assignTarget || assigning}
                      style={{
                        padding: '0.5rem 1.5rem',
                        backgroundColor:
                          !assignTarget || assigning ? 'var(--color-border)' : '#1a73e8',
                        color: !assignTarget || assigning ? 'var(--color-text-tertiary)' : 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: !assignTarget || assigning ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        transition: 'background-color 0.2s',
                      }}
                    >
                      {assigning ? 'Assigning...' : 'Confirm Assignment'}
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <div
                    style={{
                      padding: '1rem 1.5rem',
                      borderBottom: '1px solid var(--border)',
                      backgroundColor: 'white',
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Current Relationships
                    </h3>
                  </div>
                  {loadingRels ? (
                    <div
                      style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}
                    >
                      Loading relationships...
                    </div>
                  ) : relationships.length === 0 ? (
                    <div
                      style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}
                    >
                      No assignments found.
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table
                        className="gcp-table"
                        style={{ width: '100%', borderCollapse: 'collapse' }}
                      >
                        <thead>
                          <tr
                            style={{
                              borderBottom: '1px solid var(--border)',
                              backgroundColor: 'var(--color-bg-app)',
                            }}
                          >
                            <th
                              style={{
                                padding: '0.75rem 1rem',
                                textAlign: 'left',
                                fontSize: '0.8rem',
                                textTransform: 'uppercase',
                                color: 'var(--text-muted)',
                                fontWeight: 600,
                              }}
                            >
                              Assigned To
                            </th>
                            <th
                              style={{
                                padding: '0.75rem 1rem',
                                textAlign: 'left',
                                fontSize: '0.8rem',
                                textTransform: 'uppercase',
                                color: 'var(--text-muted)',
                                fontWeight: 600,
                              }}
                            >
                              Status
                            </th>
                            <th
                              style={{
                                padding: '0.75rem 1rem',
                                textAlign: 'left',
                                fontSize: '0.8rem',
                                textTransform: 'uppercase',
                                color: 'var(--text-muted)',
                                fontWeight: 600,
                              }}
                            >
                              Initiated By
                            </th>
                            <th
                              style={{
                                padding: '0.75rem 1rem',
                                textAlign: 'right',
                                fontSize: '0.8rem',
                                textTransform: 'uppercase',
                                color: 'var(--text-muted)',
                                fontWeight: 600,
                              }}
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {relationships.map((r) => (
                            <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td
                                style={{
                                  padding: '0.75rem 1rem',
                                  fontSize: '0.85rem',
                                  fontWeight: 600,
                                  color: 'var(--primary)',
                                }}
                              >
                                {r.otherName}
                              </td>
                              <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                                <span
                                  style={{
                                    backgroundColor:
                                      r.status === 'active'
                                        ? 'rgba(16,185,129,0.1)'
                                        : 'rgba(239,68,68,0.1)',
                                    color:
                                      r.status === 'active' ? 'var(--success)' : 'var(--error)',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    textTransform: 'capitalize',
                                  }}
                                >
                                  {r.status}
                                </span>
                              </td>
                              <td
                                style={{
                                  padding: '0.75rem 1rem',
                                  fontSize: '0.85rem',
                                  color: 'var(--text-muted)',
                                  textTransform: 'capitalize',
                                }}
                              >
                                {r.initiatedByRole || 'unknown'}
                              </td>
                              <td
                                style={{
                                  padding: '0.75rem 1rem',
                                  fontSize: '0.85rem',
                                  textAlign: 'right',
                                }}
                              >
                                {r.status !== 'revoked' && (
                                  <button
                                    onClick={() => handleRevokeRelationship(r.id)}
                                    className="btn btn-outline"
                                    style={{
                                      borderColor: 'var(--error)',
                                      color: 'var(--error)',
                                      padding: '0.2rem 0.5rem',
                                      fontSize: '0.8rem',
                                      cursor: 'pointer',
                                      borderRadius: '4px',
                                      backgroundColor: 'transparent',
                                    }}
                                  >
                                    Revoke
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
      </div>
    </StandardDrawer>
  );
}
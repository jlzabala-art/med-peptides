import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
  updateDoc,
  orderBy,
  where,
} from 'firebase/firestore';
import { db } from '../../firebase';
import {
  MailPlus,
  Send,
  Mail,
  CheckCheck,
  Clock,
  X,
  Eye,
  Trash2,
  RefreshCw,
  ArrowUpDown,
  Search,
} from 'lucide-react';
import emailjs from '@emailjs/browser';
import { getInvitationEmailHtml } from '../../data/emailTemplate';

import DataTable from '../ui/DataTable';
import AppEntityCell from '../ui/AppEntityCell';
import AppStatusChip from '../ui/AppStatusChip';
import AppActionGroup from '../ui/AppActionGroup';
import AppFilterBar from '../ui/AppFilterBar';
import { useToast } from '../../hooks/useToast';

const EMAILJS_SERVICE_ID = 'service_vstbe8f';
const EMAILJS_TEMPLATE_ID = 'template_7unfks8';
const EMAILJS_PUBLIC_KEY = 'rO_f_X4uBvFf3u_3u';

export default function AdminInvitationsTab({ restrictedRoles = null, readOnly = false, tenantId = null }) {
  const { toast } = useToast();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sort states
  const [sortField, setSortField] = useState('invitedAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // Modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [previewEmail, setPreviewEmail] = useState(null); // Will hold the invitation object to preview

  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', message: '', roles: [] });

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);

  const AVAILABLE_ROLES = [
    { id: 'admin', label: 'Admin', color: 'var(--color-danger)' },
    { id: 'clinic', label: 'Clinic', color: '#8b5cf6' },
    { id: 'doctor', label: 'Practitioner', color: 'var(--color-success)' },
    { id: 'wholesaler', label: 'Wholesaler', color: '#f59e0b' },
    { id: 'sales_agent', label: 'Sales Agent', color: 'var(--color-primary)' },
    { id: 'staff', label: 'Clinic Staff', color: '#06b6d4' },
    { id: 'patient', label: 'Patient', color: '#ec4899' },
  ].filter(role => !restrictedRoles || restrictedRoles.includes(role.id));

  useEffect(() => {
    fetchInvitations();
  }, [tenantId]);

  async function fetchInvitations() {
    try {
      setLoading(true);
      let qBuilder = collection(db, 'invitations');
      if (tenantId) {
        qBuilder = query(qBuilder, where('tenantId', '==', tenantId));
      }
      const q = query(qBuilder, orderBy('invitedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setInvitations(list);
    } catch (err) {
      console.error('Error fetching invitations:', err);
    } finally {
      setLoading(false);
    }
  };

  async function handleSendInvitation() {
    const { name, email, message } = inviteForm;
    if (!name || !email) {
      toast.warning('Please enter at least the name and email address.');
      return;
    }

    if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID) {
      toast.warning('EmailJS configuration pending.');
      return;
    }

    setSendingInvite(true);
    try {
      const docRef = await addDoc(collection(db, 'invitations'), {
        name,
        email,
        message,
        roles: inviteForm.roles,
        status: 'pending',
        invitedAt: new Date(),
        ...(tenantId ? { tenantId } : {})
      });

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email: email,
          to_name: name,
          custom_message:
            message.trim() || 'You have been invited to join the ReGen PEPT professional platform.',
          invite_link: `https://med-peptides-app.web.app/?ref=invite&id=${docRef.id}`,
          reply_to: 'business@atlas-health.com',
        },
        EMAILJS_PUBLIC_KEY
      );

      setInviteForm({ name: '', email: '', message: '', roles: [] });
      setShowInviteModal(false);
      await fetchInvitations();
    } catch (err) {
      console.error('Invitation error:', err);
      toast.error('Error sending invitation. Please check the console.');
    } finally {
      setSendingInvite(false);
    }
  };

  async function handleResend(inv) {
    if (!window.confirm(`Resend invitation email to ${inv.email}?`)) return;

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email: inv.email,
          to_name: inv.name,
          custom_message:
            inv.message || 'You have been invited to join the ReGen PEPT professional platform.',
          invite_link: `https://med-peptides-app.web.app/?ref=invite&id=${inv.id}`,
          reply_to: 'business@atlas-health.com',
        },
        EMAILJS_PUBLIC_KEY
      );

      // Update invitedAt to now
      await updateDoc(doc(db, 'invitations', inv.id), {
        invitedAt: new Date(),
      });
      await fetchInvitations();
      toast.success(`Invitation resent to ${inv.email}`);
    } catch (err) {
      console.error('Resend error:', err);
      toast.error('Error resending invitation.');
    }
  };

  async function handleDeleteInvitation(id) {
    if (!window.confirm('Are you sure you want to delete this invitation record?')) return;
    try {
      await deleteDoc(doc(db, 'invitations', id));
      setInvitations((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error('Delete invitation error:', err);
    }
  };

  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const filteredInvitations = invitations.filter((inv) => {
    if (roleFilter !== 'all') {
      const userRoles = inv.roles || [];
      if (!userRoles.includes(roleFilter)) return false;
    }

    if (dateRange.start || dateRange.end) {
      const created = inv.invitedAt?.toDate ? inv.invitedAt.toDate() : null;
      if (created) {
        if (dateRange.start && created < new Date(dateRange.start)) return false;
        if (dateRange.end) {
          const endDate = new Date(dateRange.end);
          endDate.setHours(23, 59, 59, 999);
          if (created > endDate) return false;
        }
      } else {
        return false;
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const nameMatch = (inv.name || '').toLowerCase().includes(q);
      const emailMatch = (inv.email || '').toLowerCase().includes(q);
      return nameMatch || emailMatch;
    }
    return true;
  });

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '300px',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <RefreshCw
          size={32}
          style={{ animation: 'spin 1.5s linear infinite', color: 'var(--primary)' }}
        />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 650 }}>
          Loading Invitations...
        </span>
      </div>
    );
  }

  const getActiveFilters = () => {
    const active = [];
    if (roleFilter && roleFilter !== 'all') {
      active.push({
        label: 'Role',
        value: roleFilter,
        type: 'roleFilter',
      });
    }
    return active;
  };

  const handleFilterRemove = (f) => {
    if (f.type === 'roleFilter') setRoleFilter('all');
  };

  const renderCustomFilters = () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
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
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        <option value="all">All Roles</option>
        {AVAILABLE_ROLES.map(role => (
          <option key={role.id} value={role.id}>{role.label}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Tab Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div>
          <h2
            style={{ margin: 0, fontSize: '1.25rem', fontWeight: 500, color: 'var(--text-main)' }}
          >
            Invitation Registry
          </h2>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Total Sent: <strong>{invitations.length}</strong>
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Accepted: <strong>{invitations.filter((i) => i.status === 'accepted').length}</strong>
            </span>
          </div>
        </div>
        {!readOnly && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="gcp-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
          >
            <MailPlus size={16} /> New Invitation
          </button>
        )}
      </div>

      <DataTable
        data={filteredInvitations}
        keyField="id"
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={getActiveFilters()}
        onFilterRemove={handleFilterRemove}
        renderCustomFilters={renderCustomFilters}
        renderBatchActions={(selected) => (
          <button
            onClick={async () => {
              if (!window.confirm(`Delete ${selected.length} invitations?`)) return;
              for (const id of selected) {
                await deleteDoc(doc(db, 'invitations', id));
              }
              setInvitations((prev) => prev.filter((i) => !selected.includes(i.id)));
              setSelectedIds([]);
            }}
            className="btn btn-outline"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8rem',
              color: 'var(--error)',
              borderColor: 'var(--error)',
            }}
          >
            <Trash2 size={14} /> Delete Selected
          </button>
        )}
        emptyTitle="No Invitations Yet"
        emptyDescription="Click 'New Invitation' to invite professionals to the platform."
        columns={[
          {
            key: 'name',
            header: 'Name/Email',
            sortKey: 'name',
            sortValue: (inv) => (inv.name || inv.email || '').toLowerCase(),
            render: (inv) => <AppEntityCell title={inv.name} subtitle={inv.email} />,
          },
          // Roles and Date Sent have been moved to the expanded view to strictly enforce the 3-column paradigm.
          {
            key: 'actions',
            header: 'Actions',
            align: 'right',
            render: (inv) => (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <AppActionGroup
                  actions={[
                    { type: 'view', onClick: () => setPreviewEmail(inv) },
                    ...(inv.status !== 'accepted' && !readOnly
                      ? [{ type: 'send', onClick: () => handleResend(inv) }]
                      : []),
                    ...(!readOnly ? [{ type: 'delete', onClick: () => handleDeleteInvitation(inv.id) }] : []),
                  ]}
                />
              </div>
            ),
          },
        ]}
        expandableRender={(inv) => (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              gap: '1.5rem',
              borderLeft: '3px solid var(--primary)',
              paddingLeft: '1.25rem',
              fontSize: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className="show-on-mobile" style={{ display: 'none', gap: '1rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                  {inv.status === 'accepted' ? 'Active' : 'Pending'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Date Sent:</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                  {inv.invitedAt?.toDate
                    ? inv.invitedAt.toDate().toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Assigned Roles:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {inv.roles && inv.roles.length > 0 ? (
                    inv.roles.map((r) => (
                      <span
                        key={r}
                        style={{
                          padding: '2px 6px',
                          backgroundColor: 'var(--color-bg-hover)',
                          color: 'var(--text-main)',
                          borderRadius: '4px',
                          textTransform: 'capitalize',
                          fontWeight: 500,
                        }}
                      >
                        {r.replace('_', ' ')}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>—</span>
                  )}
                </div>
              </div>
              {inv.message && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Message:</span>
                  <span style={{ fontStyle: 'italic', color: 'var(--text-main)' }}>
                    "{inv.message}"
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      />

      {/* Modal: New Invitation */}
      {showInviteModal && (
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
            justifyContent: 'flex-end',
            alignItems: 'stretch',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--background)',
              width: '100%',
              maxWidth: '550px',
              height: '100%',
              boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <style>{`
              @keyframes slideInRight {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
              }
            `}</style>
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--color-bg-surface)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '1.25rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                  }}
                >
                  Grant Access
                </h2>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                }}
              >
                <X size={24} />
              </button>
            </div>
            <div
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                flex: 1,
                overflowY: 'auto',
              }}
            >
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Add new principals to the ReGen PEPT platform by providing their email and assigning
                roles.
              </p>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    marginBottom: '0.4rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  New principals *
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input
                    type="email"
                    placeholder="Email address (e.g., jane@clinic.com)"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))}
                    style={{
                      flex: 1,
                      padding: '0.6rem 0.75rem',
                      borderRadius: '4px',
                      border: '1px solid var(--border)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Full Name (optional)"
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm((p) => ({ ...p, name: e.target.value }))}
                    style={{
                      flex: 1,
                      padding: '0.6rem 0.75rem',
                      borderRadius: '4px',
                      border: '1px solid var(--border)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              <hr
                style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.5rem 0' }}
              />

              <div>
                <label
                  style={{
                    display: 'block',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    marginBottom: '0.4rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  Assign roles
                </label>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Select the roles you want to assign. This controls their access level across the
                  platform.
                </p>

                <div
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  {AVAILABLE_ROLES.map((role, idx) => {
                    const isSelected = inviteForm.roles.includes(role.id);
                    return (
                      <label
                        key={role.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '0.75rem 1rem',
                          borderBottom:
                            idx === AVAILABLE_ROLES.length - 1 ? 'none' : '1px solid var(--border)',
                          backgroundColor: isSelected ? 'var(--color-bg-elevated)' : 'transparent',
                          cursor: 'pointer',
                          margin: 0,
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            setInviteForm((p) => {
                              const newRoles = e.target.checked
                                ? [...p.roles, role.id]
                                : p.roles.filter((r) => r !== role.id);
                              return { ...p, roles: newRoles };
                            });
                          }}
                          style={{
                            width: '16px',
                            height: '16px',
                            accentColor: 'var(--primary)',
                            cursor: 'pointer',
                          }}
                        />
                        <span
                          style={{
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            color: 'var(--text-primary)',
                          }}
                        >
                          {role.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <hr
                style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.5rem 0' }}
              />

              <div>
                <label
                  style={{
                    display: 'block',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    marginBottom: '0.4rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  Notify new principals
                </label>
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    marginBottom: '0.75rem',
                  }}
                >
                  An email will be sent with an invitation link.
                </p>
                <textarea
                  rows={3}
                  placeholder="Optional: Add a custom welcome message..."
                  value={inviteForm.message}
                  onChange={(e) => setInviteForm((p) => ({ ...p, message: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    fontSize: '0.9rem',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    backgroundColor: 'transparent',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderTop: '1px solid var(--border)',
                backgroundColor: 'var(--color-bg-surface)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <button
                onClick={() =>
                  setPreviewEmail({
                    email: inviteForm.email || 'jane@clinic.com',
                    fullName: inviteForm.name || 'Jane Smith',
                    roles: inviteForm.roles,
                    message: inviteForm.message,
                  })
                }
                className="btn btn-outline"
                style={{
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1rem',
                }}
              >
                <Eye size={16} /> Preview Email
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="btn btn-outline"
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', border: 'none' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInvitation}
                  disabled={sendingInvite}
                  className="btn btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    opacity: sendingInvite ? 0.7 : 1,
                    padding: '0.5rem 1.5rem',
                  }}
                >
                  {sendingInvite ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Preview Email */}
      {previewEmail && (
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
            justifyContent: 'flex-end',
            alignItems: 'stretch',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--background)',
              width: '100%',
              maxWidth: '750px',
              height: '100%',
              boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <style>{`
              @keyframes slideInRight {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
              }
            `}</style>
            <div
              style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'white',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Eye size={20} color="var(--primary)" />
                <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                  Email Preview: {previewEmail.email}
                </h2>
              </div>
              <button
                onClick={() => setPreviewEmail(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                }}
              >
                <X size={24} />
              </button>
            </div>
            <div
              style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f0f4f8', padding: '1rem' }}
            >
              <div
                style={{
                  width: '100%',
                  minHeight: '500px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              >
                <iframe
                  title="Email Preview"
                  style={{ width: '100%', height: '100%', minHeight: '500px', border: 'none' }}
                  srcDoc={getInvitationEmailHtml({
                    toName: previewEmail.name,
                    fromName: 'Atlas Health Team',
                    customMessage: previewEmail.message,
                    roles: previewEmail.roles || [],
                  })}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: AdminInvitationsTab | Props: none
      </div>
    </div>
  );
}

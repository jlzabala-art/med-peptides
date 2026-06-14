import MailPlus from "lucide-react/dist/esm/icons/mail-plus";
import Upload from "lucide-react/dist/esm/icons/upload";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import Users from "lucide-react/dist/esm/icons/users";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, query, getDocs, doc, deleteDoc, addDoc, updateDoc, orderBy, where, limit, startAfter, getCountFromServer } from 'firebase/firestore';
import { db, functions } from '../../firebase';
import { httpsCallable } from 'firebase/functions';







import { useToast } from '../../hooks/useToast';

import DataTable from '../ui/DataTable';
import AppEntityCell from '../ui/AppEntityCell';
import AppStatusChip from '../ui/AppStatusChip';
import AppActionGroup from '../ui/AppActionGroup';
import notifier from '../../services/NotificationService';

import InvitationWizard from './invitations/InvitationWizard';
import InvitationPreviewPanel from './invitations/InvitationPreviewPanel';
import BulkInviteModal from './invitations/BulkInviteModal';

const EMAILJS_TEMPLATE_ID = 'template_7unfks8';

export default function AdminInvitationsTab({ restrictedRoles = null, readOnly = false, tenantId = null }) {
  const { toast } = useToast();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering
  const [lastVisible, setLastVisible] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCursors, setPageCursors] = useState({});
  const PAGE_SIZE = 20;

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals & Panels
  const [showWizard, setShowWizard] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [sendingInvite, setSendingInvite] = useState(false);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const deepLinkSearch = params.get('search');

  useEffect(() => {
    if (deepLinkSearch) setSearchQuery(deepLinkSearch);
  }, [deepLinkSearch]);

  useEffect(() => {
    fetchInvitations();
  }, [tenantId]);

  async function fetchInvitations(page = 1) {
    try {
      setLoading(true);
      let qBuilder = collection(db, 'invitations');
      if (tenantId) qBuilder = query(qBuilder, where('tenantId', '==', tenantId));

      const countSnap = await getCountFromServer(qBuilder);
      const total = countSnap.data().count;
      setTotalItems(total);
      setTotalPages(Math.ceil(total / PAGE_SIZE));
      let qConstraints = [orderBy('invitedAt', 'desc'), limit(PAGE_SIZE)];
      if (page > 1 && pageCursors[page]) qConstraints.push(startAfter(pageCursors[page]));
      const q = query(qBuilder, ...qConstraints);
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setInvitations(list);
      if (querySnapshot.docs.length > 0) {
        setPageCursors(prev => ({ ...prev, [page + 1]: querySnapshot.docs[querySnapshot.docs.length - 1] }));
      }
    } catch (err) {
      console.error('Error fetching invitations:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendInvitation(formData) {
    if (!formData.name || !formData.email) {
      toast.warning('Please enter name and email.');
      return;
    }

    setSendingInvite(true);
    try {
      const docRef = await addDoc(collection(db, 'invitations'), {
        name: formData.name,
        email: formData.email,
        company: formData.company,
        phone: formData.phone,
        roles: formData.roles,
        territories: formData.territories,
        pricingVisibility: formData.pricingVisibility,
        aiAccess: formData.aiAccess,
        message: formData.message,
        status: 'pending',
        invitedAt: new Date(),
        ...(tenantId ? { tenantId } : {})
      });

      const sendEmail = httpsCallable(functions, 'sendEmail');
      await sendEmail({
        templateId: EMAILJS_TEMPLATE_ID,
        templateParams: {
          to_email: formData.email,
          to_name: formData.name,
          custom_message: formData.message || 'You have been invited to join the platform.',
          invite_link: `https://atlas-health.com/register?ref=invite&id=${docRef.id}`,
          reply_to: 'business@atlas-health.com',
        }
      });

      setShowWizard(false);
      toast.success('Invitation sent successfully!');
      fetchInvitations();
    } catch (err) {
      console.error('Invitation error:', err);
      toast.error('Error sending invitation.');
    } finally {
      setSendingInvite(false);
    }
  }

  async function handleResend(inv) {
    notifier.confirmCritical(`Resend invitation email to ${inv.email}?`, async () => {
      try {
        const sendEmail = httpsCallable(functions, 'sendEmail');
        await sendEmail({
          templateId: EMAILJS_TEMPLATE_ID,
          templateParams: {
            to_email: inv.email,
            to_name: inv.name,
            custom_message: inv.message || 'You have been invited to join the platform.',
            invite_link: `https://atlas-health.com/register?ref=invite&id=${inv.id}`,
            reply_to: 'business@atlas-health.com',
          }
        });
        await updateDoc(doc(db, 'invitations', inv.id), { invitedAt: new Date() });
        toast.success(`Invitation resent to ${inv.email}`);
        fetchInvitations();
      } catch (err) {
        console.error('Resend error:', err);
        toast.error('Error resending invitation.');
      }
    });
  }

  async function handleDelete(id) {
    notifier.confirmCritical('Are you sure you want to delete this invitation?', async () => {
      try {
        await deleteDoc(doc(db, 'invitations', id));
        setInvitations(prev => prev.filter(i => i.id !== id));
        toast.success('Invitation deleted.');
      } catch (err) {
        console.error('Delete error:', err);
      }
    });
  }

  const getInvitationStatus = (inv) => {
    if (inv.status === 'accepted') return 'Accepted';
    if (inv.invitedAt) {
       const sentDate = inv.invitedAt.toDate ? inv.invitedAt.toDate() : new Date(inv.invitedAt);
       if ((new Date() - sentDate) / (1000 * 60 * 60 * 24) > 7) return 'Expired';
    }
    return 'Pending';
  };

  const filtered = invitations.filter((inv) => {
    if (roleFilter !== 'all' && !(inv.roles || []).includes(roleFilter)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (inv.name || '').toLowerCase().includes(q) || (inv.email || '').toLowerCase().includes(q);
    }
    return true;
  });

  const acceptedCount = invitations.filter(i => getInvitationStatus(i) === 'Accepted').length;
  const activationRate = invitations.length ? Math.round((acceptedCount / invitations.length) * 100) : 0;

  if (loading && invitations.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', flexDirection: 'column', gap: '1rem' }}>
        <RefreshCw size={32} style={{ animation: 'spin 1.5s linear infinite', color: 'var(--primary)' }} />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 650 }}>Loading Provisioning Center...</span>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Dashboard Header KPIs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>User Provisioning Center</h2>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>Manage invitations, territories, pricing, and AI access.</p>
        </div>
        {!readOnly && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setShowBulkModal(true)} className="gcp-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Upload size={16} /> Bulk Upload
            </button>
            <button onClick={() => setShowWizard(true)} className="gcp-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MailPlus size={16} /> New Invitation
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
         <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', backgroundColor: '#eff6ff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={24} /></div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{invitations.length}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Sent</div>
            </div>
         </div>
         <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', backgroundColor: '#f0fdf4', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle size={24} /></div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{acceptedCount}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Accepted</div>
            </div>
         </div>
         <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', backgroundColor: '#fdf4ff', color: '#d946ef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingUp size={24} /></div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{activationRate}%</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Activation Rate</div>
            </div>
         </div>
      </div>

      <DataTable
        data={filtered}
        keyField="id"
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        rowsPerPage={PAGE_SIZE}
        onPageChange={(page) => { setCurrentPage(page); fetchInvitations(page); }}
        emptyTitle="No Invitations Found"
        emptyDescription="Start provisioning users by clicking 'New Invitation'."
        renderBatchActions={(selected) => (
          <button onClick={async () => {
              notifier.confirmCritical(`Delete ${selected.length} invitations?`, async () => {
                for (const id of selected) await deleteDoc(doc(db, 'invitations', id));
                setInvitations((prev) => prev.filter((i) => !selected.includes(i.id)));
                setSelectedIds([]);
              });
            }}
            className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--error)', borderColor: 'var(--error)' }}
          >
            <Trash2 size={14} /> Delete Selected
          </button>
        )}
        columns={[
          {
            key: 'name',
            header: 'Name / Email',
            render: (inv) => <AppEntityCell title={inv.name} subtitle={inv.email} />,
          },
          {
            key: 'status',
            header: 'Status',
            render: (inv) => <AppStatusChip status={getInvitationStatus(inv)} />,
          },
          {
            key: 'actions',
            header: 'Actions',
            align: 'right',
            render: (inv) => (
              <AppActionGroup
                actions={[
                  { type: 'view', onClick: () => setSelectedPreview(inv) },
                  ...(inv.status !== 'accepted' && !readOnly ? [{ type: 'send', onClick: () => handleResend(inv) }] : []),
                  ...(!readOnly ? [{ type: 'delete', onClick: () => handleDelete(inv.id) }] : []),
                ]}
              />
            ),
          },
        ]}
      />

      {/* Overlays */}
      {showWizard && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: '90%', maxWidth: '1000px', height: '90%', backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
             <InvitationWizard onSend={handleSendInvitation} onCancel={() => setShowWizard(false)} isSending={sendingInvite} />
          </div>
        </div>
      )}

      {showBulkModal && <BulkInviteModal onClose={() => setShowBulkModal(false)} />}
      {selectedPreview && <InvitationPreviewPanel invitation={selectedPreview} onClose={() => setSelectedPreview(null)} onResend={(inv) => { handleResend(inv); setSelectedPreview(null); }} />}

    </div>
  );
}
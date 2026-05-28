/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { ROUTE } from '../constants/productEnums';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, getDoc, doc, getDocs, limit, updateDoc, arrayUnion, addDoc } from 'firebase/firestore';
import {
  Package, Clock, CheckCircle2, Truck, ExternalLink,
  ShieldCheck, ArrowLeft, ClipboardList, Info,
  FileText, MessageSquare, Download, Loader2, FlaskConical,
  Stethoscope, Bell, Check, X, UserPlus, BrainCircuit, Send, Sparkles
} from 'lucide-react';
import { generateClinicalPDF } from '../services/pdfService';
import ExitProfessionalMode from '../components/auth/ExitProfessionalMode';
import PatientOrdersTab from '../components/patient/PatientOrdersTab';


// ─── Status Configuration ────────────────────────────────────────────────────
// Extracted outside the component to prevent object recreation on every render.
const STATUS_CONFIG = {
  completed:   { color: 'var(--success)',      icon: <CheckCircle2 size={16} strokeWidth={1.2} /> },
  delivered:   { color: 'var(--success)',      icon: <CheckCircle2 size={16} strokeWidth={1.2} /> },
  shipped:     { color: 'var(--primary)',      icon: <Truck        size={16} strokeWidth={1.2} /> },
  'in transit':{ color: 'var(--primary)',      icon: <Truck        size={16} strokeWidth={1.2} /> },
  pending:     { color: '#f59e0b',             icon: <Clock        size={16} strokeWidth={1.2} /> },
  processing:  { color: '#f59e0b',             icon: <Clock        size={16} strokeWidth={1.2} /> },
  cancelled:   { color: 'var(--error)',        icon: <Package      size={16} strokeWidth={1.2} /> },
};

const DEFAULT_STATUS = { color: 'var(--text-muted)', icon: <Package size={16} strokeWidth={1.2} /> };

const getStatusConfig = (status) =>
  STATUS_CONFIG[status?.toLowerCase()] ?? DEFAULT_STATUS;

// ─── Skeleton Card ────────────────────────────────────────────────────────────
// Mirrors the exact layout of a real order card to eliminate layout shift.
function SkeletonCard() {
  return (
    <div
      style={{
        padding: '1.5rem',
        borderRadius: '16px',
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
      }}
    >
      {/* Header row: order id + status badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div className="sk-block" style={{ width: '160px', height: '13px' }} />
          <div className="sk-block" style={{ width: '120px', height: '12px' }} />
        </div>
        <div className="sk-block" style={{ width: '100px', height: '32px', borderRadius: '99px' }} />
      </div>

      {/* Detail grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        paddingTop: '1.25rem',
        borderTop: '1px dashed var(--border)',
      }}>
        {/* Items column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="sk-block" style={{ width: '50px',  height: '11px' }} />
          <div className="sk-block" style={{ width: '140px', height: '13px' }} />
          <div className="sk-block" style={{ width: '110px', height: '13px' }} />
        </div>
        {/* Shipment column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="sk-block" style={{ width: '65px',  height: '11px' }} />
          <div className="sk-block" style={{ width: '130px', height: '13px' }} />
          <div className="sk-block" style={{ width: '90px',  height: '13px' }} />
        </div>
        {/* Total value column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
          <div className="sk-block" style={{ width: '75px',  height: '11px' }} />
          <div className="sk-block" style={{ width: '80px',  height: '28px', borderRadius: '8px' }} />
          <div className="sk-block" style={{ width: '55px',  height: '11px' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Logistics Timeline ───────────────────────────────────────────────────────
// Maps an order's free-text status to one of the 4 canonical milestone indices.
// Index 0 = Inquiry, 1 = Confirmed, 2 = Shipped, 3 = Delivered
const MILESTONES = [
  { label: 'Inquiry',   icon: <ClipboardList size={14} strokeWidth={1.4} /> },
  { label: 'Confirmed', icon: <CheckCircle2  size={14} strokeWidth={1.4} /> },
  { label: 'Shipped',   icon: <Truck         size={14} strokeWidth={1.4} /> },
  { label: 'Delivered', icon: <Package       size={14} strokeWidth={1.4} /> },
];

const STATUS_TO_STEP = {
  pending:     0,
  processing:  1,
  confirmed:   1,
  shipped:     2,
  'in transit':2,
  completed:   3,
  delivered:   3,
};

function OrderTimeline({ status }) {
  const step = STATUS_TO_STEP[status?.toLowerCase()] ?? 0;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      margin: '1.1rem 0',
    }}>
      {MILESTONES.map((m, idx) => {
        const done   = idx <= step;
        const active = idx === step;
        return (
          <div key={m.label} style={{ display: 'flex', alignItems: 'center', flex: idx < MILESTONES.length - 1 ? 1 : 'none' }}>
            {/* Node */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: done ? (active ? 'var(--primary)' : 'rgba(0,75,135,0.12)') : '#f1f5f9',
                color: done ? (active ? 'white' : 'var(--primary)') : 'var(--color-text-tertiary)',
                border: active ? '2px solid var(--primary)' : '2px solid transparent',
                boxShadow: active ? '0 0 0 3px rgba(0,75,135,0.12)' : 'none',
                transition: 'all 0.25s ease',
                flexShrink: 0,
              }}>
                {m.icon}
              </div>
              <span style={{
                fontSize: '0.62rem',
                fontWeight: active ? 800 : 600,
                color: done ? (active ? 'var(--primary)' : 'var(--text-muted)') : 'var(--color-border)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
              }}>
                {m.label}
              </span>
            </div>
            {/* Connector line */}
            {idx < MILESTONES.length - 1 && (
              <div style={{
                flex: 1,
                height: '2px',
                backgroundColor: idx < step ? 'rgba(0,75,135,0.2)' : 'var(--color-border)',
                marginBottom: '18px', /* align with node centre */
                transition: 'background-color 0.25s ease',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
// ─── Tab config ──────────────────────────────────────────────────────────────
const TABS = [
  { id: 'orders',          label: 'Orders',         icon: <ClipboardList size={15} strokeWidth={1.6} /> },
  { id: 'my-supervisor',   label: 'My Supervisor',   icon: <Stethoscope   size={15} strokeWidth={1.6} /> },
  { id: 'recommendations', label: 'Recommendations', icon: <Bell          size={15} strokeWidth={1.6} /> },
];

export default function UserDashboard({ onBack, acceptRecommendation, onOpenCart }) {
  const { user, isProfessional, activeRole } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');

  const allowedTabs = useMemo(() => {
    return TABS.filter(tab => {
      if ((tab.id === 'my-supervisor' || tab.id === 'recommendations') && activeRole !== 'patient') {
        return false;
      }
      return true;
    });
  }, [activeRole]);

  useEffect(() => {
    if (allowedTabs.length > 0 && !allowedTabs.find(t => t.id === activeTab)) {
      setActiveTab(allowedTabs[0].id);
    }
  }, [allowedTabs, activeTab]);

  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [pdfLoading, setPdfLoading] = useState({}); // { [orderId]: boolean }
  const [pdfPreview, setPdfPreview]  = useState(null); // { url: string, label: string } | null
  const [supervisor, setSupervisor]   = useState(null);  // doctor profile | null
  const [supLoading, setSupLoading]  = useState(false);
  const [recommendations, setRecommendations] = useState(null); // array | null (null = not fetched yet)
  const [recLoading, setRecLoading]  = useState(false);

  // B2B Physician Invitations
  const [pendingInvites, setPendingInvites] = useState([]);
  const [invitesLoading, setInvitesLoading] = useState(false);

  // B2B Physician Search & Request
  const [availablePhysicians, setAvailablePhysicians] = useState([]);
  const [selectedPhysicianId, setSelectedPhysicianId] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState('');
  const [requestError, setRequestError] = useState('');

  const fetchPendingInvites = useCallback(async () => {
    if (!user?.uid) return;
    setInvitesLoading(true);
    try {
      const q = query(
        collection(db, 'doctor_patient_relationships'),
        where('patientId', '==', user.uid),
        where('status', '==', 'pending')
      );
      const snap = await getDocs(q);
      const list = await Promise.all(
        snap.docs.map(async (d) => {
          const rel = d.data();
          const docSnap = await getDoc(doc(db, 'users', rel.doctorId));
          const docData = docSnap.exists() ? docSnap.data() : {};
          return {
            id: d.id,
            doctorId: rel.doctorId,
            doctorName: [docData.firstName, docData.lastName].filter(Boolean).join(' ') || docData.displayName || 'Physician',
            specialty: docData.specialty || 'Medical Specialist',
            email: docData.email || '',
            notes: rel.notes || '',
            initiatedByRole: rel.initiatedByRole || 'doctor',
          };
        })
      );
      setPendingInvites(list);
    } catch (e) {
      console.error('fetchPendingInvites error:', e);
    } finally {
      setInvitesLoading(false);
    }
  }, [user]);

  const handleAcceptInvite = async (relId, doctorId) => {
    try {
      setSupLoading(true);
      // 1. Update relationship status to 'active'
      const relRef = doc(db, 'doctor_patient_relationships', relId);
      await updateDoc(relRef, {
        status: 'active',
        activatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      // 2. Update patient's assignedPhysicianIds in users
      const patientRef = doc(db, 'users', user.uid);
      await updateDoc(patientRef, {
        assignedPhysicianIds: arrayUnion(doctorId)
      });
      // 3. Update doctor's assignedPatientIds in users
      const doctorRef = doc(db, 'users', doctorId);
      await updateDoc(doctorRef, {
        assignedPatientIds: arrayUnion(user.uid)
      });
      
      // 4. Refresh supervisor and invitations
      const docSnap = await getDoc(doctorRef);
      if (docSnap.exists()) setSupervisor({ id: doctorId, ...docSnap.data() });
      setPendingInvites(prev => prev.filter(inv => inv.id !== relId));
    } catch (e) {
      console.error('[AcceptInvite] failed:', e);
    } finally {
      setSupLoading(false);
    }
  };

  const handleDeclineInvite = async (relId) => {
    try {
      setSupLoading(true);
      const relRef = doc(db, 'doctor_patient_relationships', relId);
      await updateDoc(relRef, {
        status: 'revoked',
        updatedAt: new Date().toISOString(),
      });
      setPendingInvites(prev => prev.filter(inv => inv.id !== relId));
    } catch (e) {
      console.error('[DeclineInvite] failed:', e);
    } finally {
      setSupLoading(false);
    }
  };

  // Split pending invites for incoming (initiated by doctor/admin) and outgoing (initiated by patient)
  const incomingInvites = useMemo(() => {
    return pendingInvites.filter(i => i.initiatedByRole !== 'patient');
  }, [pendingInvites]);

  const outgoingInvites = useMemo(() => {
    return pendingInvites.filter(i => i.initiatedByRole === 'patient');
  }, [pendingInvites]);

  // Fetch verified doctors list
  useEffect(() => {
    if (activeTab === 'my-supervisor' && activeRole === 'patient') {
      (async () => {
        try {
          const q = query(
            collection(db, 'users'),
            where('role', '==', 'doctor')
          );
          const snap = await getDocs(q);
          setAvailablePhysicians(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {
          console.error('[UserDashboard] fetch available doctors', e);
        }
      })();
    }
  }, [activeTab, activeRole]);

  // Patient supervision request
  const handleRequestSupervision = async (e) => {
    e.preventDefault();
    if (!selectedPhysicianId || sendingRequest) return;
    setSendingRequest(true);
    setRequestError('');
    setRequestSuccess('');
    try {
      const q = query(
        collection(db, 'doctor_patient_relationships'),
        where('patientId', '==', user.uid),
        where('doctorId', '==', selectedPhysicianId),
        where('status', 'in', ['pending', 'active'])
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        throw new Error('A pending or active supervision relationship already exists with this doctor.');
      }

      const docRef = doc(db, 'users', selectedPhysicianId);
      const docSnap = await getDoc(docRef);
      const doctorData = docSnap.exists() ? docSnap.data() : {};
      const doctorName = doctorData.displayName || [doctorData.firstName, doctorData.lastName].filter(Boolean).join(' ') || 'Physician';

      await addDoc(collection(db, 'doctor_patient_relationships'), {
        patientId: user.uid,
        patientEmail: user.email || '',
        doctorId: selectedPhysicianId,
        doctorName: doctorName,
        status: 'pending',
        createdBy: 'patient',
        initiatedByRole: 'patient',
        notes: requestNotes.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setRequestSuccess('Supervision request sent successfully!');
      setSelectedPhysicianId('');
      setRequestNotes('');
      await fetchPendingInvites();
    } catch (err) {
      console.error('[RequestSupervision] error:', err);
      setRequestError(err.message || 'Failed to send request.');
    } finally {
      setSendingRequest(false);
    }
  };

  // Reusable recommendation fetch & response logic
  const fetchRecommendations = useCallback(async () => {
    if (!user?.uid) return;
    setRecLoading(true);
    try {
      const q = query(
        collection(db, 'recommendations'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const snap = await getDocs(q);
      setRecommendations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error('recommendations fetch', e);
      setRecommendations([]);
    } finally {
      setRecLoading(false);
    }
  }, [user]);

  const handleAcceptRecommendation = async (rec) => {
    try {
      setRecLoading(true);
      const recRef = doc(db, 'recommendations', rec.id);
      await updateDoc(recRef, {
        status: 'accepted',
        updatedAt: new Date().toISOString(),
      });
      if (acceptRecommendation) {
        acceptRecommendation(rec);
      }
      await fetchRecommendations();
    } catch (e) {
      console.error('[AcceptRecommendation] failed:', e);
    } finally {
      setRecLoading(false);
    }
  };

  const handleDeclineRecommendation = async (recId) => {
    if (!window.confirm('Are you sure you want to decline this recommendation?')) return;
    try {
      setRecLoading(true);
      const recRef = doc(db, 'recommendations', recId);
      await updateDoc(recRef, {
        status: 'rejected',
        updatedAt: new Date().toISOString(),
      });
      await fetchRecommendations();
    } catch (e) {
      console.error('[DeclineRecommendation] failed:', e);
    } finally {
      setRecLoading(false);
    }
  };

  const askAI = (r) => {
    window.dispatchEvent(new CustomEvent('open-clinical-ai', {
      detail: {
        message: `Analyse this recommendation from my supervising doctor: "${r.title || r.protocolName || 'Peptide Protocol'}". Peptides: ${Array.isArray(r.peptides) ? r.peptides.join(', ') : r.peptides || 'not specified'}. Notes: ${r.notes || 'none'}. Provide clinical insights and any safety considerations.`,
        autoSend: true,
        doctorContext: {
          doctorName: r.doctorName || 'My Physician',
          protocolName: r.title || r.protocolName,
          recommendations: [{ productName: Array.isArray(r.peptides) ? r.peptides.join(', ') : r.peptides, notes: r.notes }],
        }
      }
    }));
  };

  // ── Fetch assigned supervisor when My Supervisor tab is first opened ─────────
  useEffect(() => {
    if (activeTab !== 'my-supervisor' || !user?.uid) return;
    (async () => {
      setSupLoading(true);
      try {
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        const ids = userSnap.data()?.assignedPhysicianIds ?? [];
        if (ids.length > 0) {
          const docSnap = await getDoc(doc(db, 'users', ids[0]));
          if (docSnap.exists()) setSupervisor({ id: ids[0], ...docSnap.data() });
        } else {
          setSupervisor(null);
        }
      } catch (e) {
        console.error('supervisor fetch', e);
      } finally {
        setSupLoading(false);
      }
    })();
    fetchPendingInvites();
  }, [activeTab, user?.uid, fetchPendingInvites]);

  // ── Fetch recommendations when that tab is first opened ──────────────────────
  useEffect(() => {
    if (activeTab === 'recommendations' && recommendations === null && !recLoading) {
      fetchRecommendations();
    }
  }, [activeTab, recommendations, recLoading, fetchRecommendations]);

  // ── PDF Preview (opens modal with iframe) ────────────────────────────────
  const handlePreviewPDF = useCallback(async (order) => {
    setPdfLoading((prev) => ({ ...prev, [order.id]: true }));
    try {
      const rawProtocol = order.protocol ?? {
        protocol_title: `Order ${order.orderId || order.id}`,
        phases: order.items?.map((item, idx) => ({
          phase_number: idx + 1,
          phase_title: item.name,
          start_week: idx === 0 ? 1 : null,
          end_week: null,
          drugs_used: [{
            product_title: item.name,
            product_slug: item.name?.toLowerCase().replace(/\s+/g, '-') ?? '',
            strength: item.variant ?? '',
            weekly_dose: item.variant ?? '',
            dosing_frequency: 'As directed',
            route: ROUTE.SC,
          }],
        })) ?? [],
      };
      const formData = order.formData ?? {
        patientName: order.customer?.fullName ??
          (`${order.customer?.firstName ?? ''} ${order.customer?.lastName ?? ''}`.trim() ||
          user?.displayName) ?? 'Research Patient',
        practitionerName: order.customer?.fullName ?? '',
        clinic: order.customer?.institution ?? '',
        orderId: order.orderId,
      };
      // generateClinicalPDF is the single canonical PDF function.
      // Pass returnBlob:true to get a Blob for in-app preview.
      let blobUrl = null;
      const blob = await generateClinicalPDF(rawProtocol, formData, { returnBlob: true });
      if (blob instanceof Blob) blobUrl = URL.createObjectURL(blob);
      if (blobUrl) {
        setPdfPreview({ url: blobUrl, label: `Protocol — Order ${order.orderId || order.id}` });
      } else {
        // Fallback: direct download
        await generateClinicalPDF(rawProtocol, formData);
      }
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Could not generate the PDF. Please try again.');
    } finally {
      setPdfLoading((prev) => ({ ...prev, [order.id]: false }));
    }
  }, [user]);

  const closePdfPreview = useCallback(() => {
    if (pdfPreview?.url) URL.revokeObjectURL(pdfPreview.url);
    setPdfPreview(null);
  }, [pdfPreview]);

  // ── Firestore real-time listener ──────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'orders'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setOrders(ordersList);
        setLoading(false);
      },
      (error) => {
        console.error('Dashboard error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // ── Memoised order list ───────────────────────────────────────────────────
  // Sorting and any future filtering logic lives here; recalculates only when
  // the `orders` array reference changes (i.e. on every Firestore snapshot).
  const sortedOrders = useMemo(() => {
    return [...orders]
      .filter(o => o.orderId || (o.items && o.items.length > 0))
      .sort((a, b) => {
      const tA = a.createdAt?.toMillis?.() ?? 0;
      const tB = b.createdAt?.toMillis?.() ?? 0;
      return tB - tA; // newest first (Firestore already orders this way, belt-and-suspenders)
    });
  }, [orders]);

  // ── Auth guard ────────────────────────────────────────────────────────────
  if (!user) {
    return <ExitProfessionalMode onBack={onBack} onLogin={() => window.location.href='/login'} />;
  }

  // ── Render ────────────────────────────────────────────────────────────────
  // ── Render ────────────────────────────────────────────────────────────────
  const mainContent = (
    <div
      className="template-root"
      style={{
        paddingTop: 'clamp(5rem, 10vw, 8rem)',
        minHeight: '100vh',
        backgroundColor: 'var(--surface)',
        backgroundImage: 'radial-gradient(circle at top right, rgba(0, 54, 102, 0.03), transparent 400px)',
      }}
    >
      <div className="container" style={{ maxWidth: '1000px', paddingBottom: '4rem' }}>

        {/* ── Page Header ── */}
        <div style={{ marginBottom: '3rem' }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(0,0,0,0.03)', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700,
              padding: '0.5rem 1.25rem', borderRadius: '12px',
              marginBottom: '2rem', transition: 'all 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.06)')}
            onMouseOut={(e)  => (e.currentTarget.style.background = 'rgba(0,0,0,0.03)')}
          >
            <ArrowLeft size={16} strokeWidth={1.2} /> RETURN TO SHOP
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 950, color: 'var(--primary)', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
                Account Dashboard
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 600 }}>
                Manage your research inquiries and order tracking.
              </p>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.85rem 1.5rem',
              background: isProfessional ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,54,102,0.05)',
              borderRadius: '20px',
              border: `1px solid ${isProfessional ? 'rgba(16, 185, 129, 0.2)' : 'var(--border)'}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            }}>
              <ShieldCheck size={22} strokeWidth={1.4} color={isProfessional ? 'var(--success)' : 'var(--primary)'} />
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: isProfessional ? 'var(--success)' : 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {isProfessional ? 'Professional Access' : 'Guest Researcher'}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div style={{
          display: 'flex', gap: '0.5rem',
          backgroundColor: 'rgba(0,54,102,0.04)',
          padding: '0.35rem',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          width: 'fit-content',
          marginBottom: '0.5rem',
          flexWrap: 'wrap',
        }}>
          {allowedTabs.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  letterSpacing: '0.04em',
                  transition: 'all 0.18s ease',
                  backgroundColor: active ? 'white' : 'transparent',
                  color: active ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: active ? '0 2px 10px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Content ── */}
        <div style={{ display: 'grid', gap: '2.5rem' }}>

          {/* API Materials card — professionals only */}
          {activeTab === 'orders' && isProfessional && (
            <div
              onClick={() => window.dispatchEvent(new CustomEvent('nav:apiDashboard'))}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1.25rem 1.75rem', borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(0,75,135,0.06), rgba(0,75,135,0.02))',
                border: '1px solid rgba(0,75,135,0.15)', cursor: 'pointer',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,75,135,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(0,75,135,0.1)', padding: '0.7rem', borderRadius: '14px', color: 'var(--primary)' }}>
                  <FlaskConical size={24} strokeWidth={1.4} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)' }}>API Materials Catalog</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Wholesale pricing & sourcing — verified professionals</div>
                </div>
              </div>
              <ExternalLink size={16} style={{ color: 'var(--primary)', opacity: 0.6 }} />
            </div>
          )}

          {/* Prescriptions Dashboard Panel */}
          {activeTab === 'orders' && sortedOrders.some(o => o.prescription) && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '28px',
              padding: 'clamp(1.5rem, 4vw, 2.5rem)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
              border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', padding: '0.75rem', borderRadius: '16px', color: 'var(--success)' }}>
                  <ShieldCheck size={28} strokeWidth={1.2} />
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
                  My Active Prescriptions
                </h2>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {sortedOrders.filter(o => o.prescription).map((order) => {
                  const rx = order.prescription;
                  const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
                  const remainingDays = Math.max(0, 60 - Math.floor((new Date() - orderDate) / (1000 * 60 * 60 * 24)));
                  
                  return (
                    <div key={order.id} style={{
                      padding: '1.25rem',
                      borderRadius: '18px',
                      backgroundColor: 'var(--color-bg-app)',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '1rem'
                    }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-success)', backgroundColor: '#ecfdf5', padding: '3px 8px', borderRadius: '20px', fontWeight: 800 }}>
                            ACTIVE CYCLE
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
                            {rx.fileName}
                          </span>
                        </div>
                        
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: '0.75rem 0 0.5rem 0' }}>
                          {rx.match || 'Compounding Formula'}
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                          <div>Dosage: <strong style={{ color: 'var(--color-text-primary)' }}>{rx.dosage}</strong></div>
                          <div>Frequency: <strong style={{ color: 'var(--color-text-primary)', textTransform: 'capitalize' }}>{rx.frequency}</strong></div>
                          <div>Remaining: <strong style={{ color: 'var(--color-success)' }}>~{remainingDays} days</strong></div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (rx.match) {
                            window.dispatchEvent(new CustomEvent('cart:add-direct', {
                              detail: {
                                productName: rx.match,
                                dosage: rx.dosage,
                                quantity: 1
                              }
                            }));
                            alert(`Added ${rx.match} to cart for quick reorder!`);
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '0.6rem 1rem',
                          borderRadius: '10px',
                          backgroundColor: 'var(--color-primary)',
                          color: 'white',
                          border: 'none',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
                        onMouseLeave={e => e.currentTarget.style.opacity = 1}
                      >
                        REORDER CYCLE
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

                    {/* Orders Card (Refactored to PatientOrdersTab) */}
          {activeTab === 'orders' && (
            <PatientOrdersTab userId={user.uid} />
          )}

                    {/* ── My Supervisor Tab (Refactored) ── */}
          {activeTab === 'my-supervisor' && (
            <PatientSupervisorTab userId={user.uid} />
          )}

          {/* ── Recommendations tab (Refactored) ── */}
          {activeTab === 'recommendations' && (
            <PatientRecommendationsTab userId={user.uid} acceptRecommendation={acceptRecommendation} />
          )}

          {/* ── Help / Information ── */}
          {activeTab === 'orders' && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)', display: 'flex', gap: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <div style={{ backgroundColor: 'rgba(0, 75, 135, 0.05)', padding: '0.75rem', borderRadius: '14px', color: 'var(--primary)', flexShrink: 0, height: 'fit-content' }}>
                <Info size={28} strokeWidth={1.2} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 800, color: 'var(--primary)' }}>Expert Logistics Support</h4>
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, fontWeight: 500 }}>
                  Our specialists are available 24/7 to provide real-time updates on your research materials and regulatory documentation.
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)', display: 'flex', gap: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <div style={{ backgroundColor: 'rgba(0, 75, 135, 0.05)', padding: '0.75rem', borderRadius: '14px', color: 'var(--primary)', flexShrink: 0, height: 'fit-content' }}>
                <ExternalLink size={28} strokeWidth={1.2} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 800, color: 'var(--primary)' }}>Verification Standards</h4>
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, fontWeight: 500 }}>
                  Every compound undergoes triple-stage verification. Certificates of Analysis (COA) are provided automatically upon dispatch confirmation.
                </p>
              </div>
            </div>
          </div>}

        </div>
      </div>
      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );

  return (
    <>
      {mainContent}

      {/* ── PDF Preview Modal ── */}
      {pdfPreview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="PDF Preview"
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            backgroundColor: 'rgba(2, 14, 28, 0.85)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(8px)',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closePdfPreview(); }}
        >
          {/* Modal window */}
          <div style={{
            background: 'white', borderRadius: '24px',
            width: '100%', maxWidth: '1000px',
            height: '90vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 40px 120px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            {/* Header bar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1.25rem 2rem',
              background: 'var(--surface)',
              borderBottom: '1px solid var(--border)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ background: 'var(--primary)', color: 'white', padding: '0.4rem', borderRadius: '8px' }}>
                  <FileText size={20} strokeWidth={1.4} />
                </div>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)', letterSpacing: '-0.01em' }}>
                  {pdfPreview.label}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <a
                  href={pdfPreview.url}
                  download={`${pdfPreview.label}.pdf`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.6rem 1.25rem', borderRadius: '12px',
                    backgroundColor: 'var(--primary)', color: 'white',
                    fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(0,54,102,0.2)',
                    transition: 'transform 0.2s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseOut={(e)  => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <Download size={16} strokeWidth={2} /> DOWNLOAD PDF
                </a>
                <button
                  onClick={closePdfPreview}
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '40px', height: '40px', borderRadius: '12px',
                    backgroundColor: 'rgba(0,0,0,0.05)', border: 'none',
                    cursor: 'pointer', color: 'var(--text-muted)',
                    fontSize: '1.2rem', fontWeight: 300,
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.1)')}
                  onMouseOut={(e)  => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)')}
                  aria-label="Close PDF preview"
                >
                  ✕
                </button>
              </div>
            </div>
            {/* iframe */}
            <div style={{ flex: 1, position: 'relative', background: '#525659' }}>
               <iframe
                 src={pdfPreview.url}
                 title="PDF Preview"
                 style={{ width: '100%', height: '100%', border: 'none' }}
               />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

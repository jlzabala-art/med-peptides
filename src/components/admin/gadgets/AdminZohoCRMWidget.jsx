import React, { useState, useEffect, useCallback } from 'react';
import { 
  doc, 
  onSnapshot, 
  collection, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../../../firebase';
import {
  Building2, User, Phone, Mail, MapPin, 
  RefreshCw, Users, DollarSign, Crown,
  ChevronDown, ChevronUp, ChevronRight, AlertCircle, Search, CheckCircle2, Link2, ExternalLink
} from 'lucide-react';

// ── Endpoints ───────────────────────────────────────────────────────────────
const CRM_CF_URL = 'https://europe-west1-med-peptides-app.cloudfunctions.net/fetchZohoCRMIntelligence';
const SEARCH_CF_URL = 'https://europe-west1-med-peptides-app.cloudfunctions.net/searchZohoContactByEmail';

const AED_USD_RATE = 3.67;

function fmtAED(n) {
  if (!n) return 'AED 0';
  return `AED ${Math.round(n).toLocaleString('en-AE')}`;
}

function fmtUSD(n) {
  if (!n) return '$0';
  return `$${Math.round(n / AED_USD_RATE).toLocaleString('en-US')}`;
}

function fmtAED_USD(n) {
  return `${fmtAED(n)} (${fmtUSD(n)})`;
}

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days < 30)  return `Hace ${days}d`;
  if (days < 365) return `Hace ${Math.floor(days / 30)}m`;
  return `Hace ${Math.floor(days / 365)}a`;
}

// ── Customer Row Subcomponent (Tab 1) ──────────────────────────────────────────
function CustomerRow({ c, rank }) {
  const [expanded, setExpanded] = useState(false);
  const isCorp = c.type === 'corporate';
  const hasBalance = c.outstanding_balance > 0;

  return (
    <React.Fragment>
      <tr 
        style={{ 
          borderBottom: '1px solid #dadce0', 
          backgroundColor: expanded ? '#f8f9fa' : 'transparent',
          transition: 'background-color 0.15s'
        }}
      >
        {/* Toggle Chevron */}
        <td style={{ padding: '0.6rem 0.85rem', verticalAlign: 'middle', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#5f6368'
            }}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        </td>

        {/* Rank */}
        <td style={{ padding: '0.6rem 0.85rem', verticalAlign: 'middle', fontWeight: 600, color: '#5f6368' }}>
          #{rank}
        </td>

        {/* Name & Company */}
        <td style={{ padding: '0.6rem 0.85rem', verticalAlign: 'middle' }}>
          <div style={{ fontWeight: 600, color: '#202124' }}>{c.name}</div>
          {c.company && (
            <div style={{ fontSize: '0.68rem', color: '#5f6368' }}>{c.company}</div>
          )}
        </td>

        {/* Email & Phone */}
        <td style={{ padding: '0.6rem 0.85rem', verticalAlign: 'middle' }}>
          {c.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.1rem' }}>
              <Mail size={11} color="#5f6368" />
              <a href={`mailto:${c.email}`} style={{ color: '#1a73e8', textDecoration: 'none' }}>
                {c.email}
              </a>
            </div>
          )}
          {c.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Phone size={11} color="#5f6368" />
              <span style={{ color: '#202124' }}>{c.phone}</span>
            </div>
          )}
        </td>

        {/* Type Badge */}
        <td style={{ padding: '0.6rem 0.85rem', verticalAlign: 'middle' }}>
          <span style={{
            display: 'inline-block',
            padding: '0.1rem 0.4rem',
            borderRadius: '4px',
            fontSize: '0.65rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            backgroundColor: isCorp ? '#e8f0fe' : '#e6f4ea',
            color: isCorp ? '#1a73e8' : '#137333'
          }}>
            {c.type}
          </span>
        </td>

        {/* Revenue */}
        <td style={{ padding: '0.6rem 0.85rem', verticalAlign: 'middle', textAlign: 'right', fontWeight: 600, color: '#202124' }}>
          {fmtAED_USD(c.total_revenue)}
        </td>

        {/* Outstanding Balance */}
        <td style={{ padding: '0.6rem 0.85rem', verticalAlign: 'middle', textAlign: 'right', fontWeight: 600, color: hasBalance ? '#d93025' : '#5f6368' }}>
          {hasBalance ? fmtAED(c.outstanding_balance) : '—'}
        </td>

        {/* Actions */}
        <td style={{ padding: '0.6rem 0.85rem', verticalAlign: 'middle', textAlign: 'center' }}>
          <a 
            href={`https://books.zoho.me/app#/contacts/${c.contact_id}`}
            target="_blank" 
            rel="noreferrer" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.3rem',
              border: '1px solid #dadce0',
              backgroundColor: 'var(--color-bg-surface)',
              borderRadius: '4px',
              color: '#5f6368',
              textDecoration: 'none'
            }}
            title="Open in Zoho Books"
          >
            <ExternalLink size={12} />
          </a>
        </td>
      </tr>

      {/* Expanded details row */}
      {expanded && (
        <tr>
          <td colSpan={8} style={{
            backgroundColor: '#f8f9fa',
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #dadce0',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem', alignItems: 'start' }}>
              {/* Left Column: Contact details */}
              <div style={{ fontSize: '0.78rem', color: '#5f6368', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', fontWeight: 600, color: '#202124' }}>
                  Client Profile Metadata
                </h5>
                {c.address && (
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
                    <MapPin size={12} style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                    <span><strong>Address:</strong> {c.address}</span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <Building2 size={12} style={{ flexShrink: 0 }} />
                  <span><strong>Total Invoices:</strong> {c.invoice_count || 0} invoices</span>
                </div>
                <div>
                  <strong>Last Purchase:</strong> {timeAgo(c.last_purchase)}
                </div>
              </div>

              {/* Right Column: Products Bought list */}
              <div>
                <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', fontWeight: 600, color: '#202124' }}>
                  Products Purchased
                </h5>
                {c.products_bought && c.products_bought.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {c.products_bought.map((p, idx) => (
                      <span key={idx} style={{ 
                        fontSize: '0.68rem', 
                        padding: '0.15rem 0.45rem', 
                        borderRadius: '4px', 
                        background: '#e8eaed', 
                        color: '#3c4043',
                        fontWeight: 500
                      }}>
                        {p}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: '0.72rem', color: '#9aa0a6', fontStyle: 'italic' }}>
                    No purchase history recorded.
                  </span>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}

// ── Main Widget Component ───────────────────────────────────────────────────────
export default function AdminZohoCRMWidget({ fullHeight = false }) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState('active'); // active | search | pending

  // CRM Active Customers state (from CF cache)
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter]   = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all | corporate | private
  const [error, setError]     = useState(null);

  // Manual Email Search state
  const [searchEmail, setSearchEmail] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState(null);

  // Webhook Pending assignments state
  const [pendingList, setPendingList] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);

  // Doctors & Wholesalers dropdown lists
  const [doctorsList, setDoctorsList] = useState([]);
  const [wholesalersList, setWholesalersList] = useState([]);

  // Assignment / Onboarding Form state
  const [selectedRole, setSelectedRole] = useState('patient'); // patient | doctor | wholesaler
  const [assignedDoctorId, setAssignedDoctorId] = useState('');
  const [assignedWholesalerId, setAssignedWholesalerId] = useState('');
  const [incorporating, setIncorporating] = useState(false);
  const [incorporationSuccess, setIncorporationSuccess] = useState(false);
  const [selectedPendingContact, setSelectedPendingContact] = useState(null); // for Tab 3 modal

  // ── 1. Fetch live metrics cache from Firestore ──
  useEffect(() => {
    const ref = doc(db, 'zoho_crm_cache', 'intelligence');
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setData(snap.data());
        setError(null);
      }
      setLoading(false);
    }, (err) => {
      console.error('[AdminZohoCRMWidget] Cache loading failed:', err);
      setError('Could not load cached customer overview.');
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // ── 2. Real-time listener for Zoho Webhook assignments ──
  useEffect(() => {
    const q = collection(db, 'pending_zoho_assignments');
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => {
        const timeA = a.createdAt ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      setPendingList(list);
      setPendingLoading(false);
    }, (err) => {
      console.error('[AdminZohoCRMWidget] Pending assignments failed:', err);
      setPendingLoading(false);
    });
    return () => unsub();
  }, []);

  // ── 3. Load active Doctors & Wholesalers for assignment ──
  useEffect(() => {
    async function loadRoles() {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const allUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        const docs = allUsers.filter(u => 
          (u.role === 'doctor' || u.role === 'clinic' || (u.roles && (u.roles.includes('doctor') || u.roles.includes('clinic')))) &&
          u.status === 'active'
        );
        const wholes = allUsers.filter(u => 
          (u.role === 'wholesaler' || (u.roles && u.roles.includes('wholesaler'))) &&
          u.status === 'active'
        );

        setDoctorsList(docs);
        setWholesalersList(wholes);

        if (docs.length > 0) setAssignedDoctorId(docs[0].id);
        if (wholes.length > 0) setAssignedWholesalerId(wholes[0].id);
      } catch (err) {
        console.error("Could not fetch user cohorts:", err);
      }
    }
    loadRoles();
  }, []);

  // ── 4. Call manually refreshed CRM cache CF ──
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;

      const res = await fetch(CRM_CF_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ force: true }),
      });

      if (!res.ok) {
        throw new Error(`CF request failed: ${res.status}`);
      }
    } catch (err) {
      console.error('[CRMWidget refresh]', err);
      setError('Manual sync failed. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // ── 5. Email manual search (Zoho query) ──
  const handleSearchEmail = async (e) => {
    e.preventDefault();
    if (!searchEmail) return;

    setSearchLoading(true);
    setSearchError(null);
    setSearchResult(null);
    setIncorporationSuccess(false);

    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      const res = await fetch(SEARCH_CF_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ email: searchEmail }),
      });

      if (!res.ok) {
        throw new Error(`Search failed: ${res.status}`);
      }

      const result = await res.json();
      if (result.found) {
        setSearchResult(result);
      } else {
        setSearchError(result.message || 'Client email not found in Zoho Books.');
      }
    } catch (err) {
      console.error('[Zoho Search error]', err);
      setSearchError('An error occurred during query. Try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  // ── 6. Incorporate & Assign Customer Flow ──
  const handleIncorporate = async (contact, role, assigneeId, isFromPendingQueue = false) => {
    setIncorporating(true);
    try {
      // Create user document in 'users' collection
      let targetUid;
      let existingUserObj = null;

      if (isFromPendingQueue && contact.alreadyRegistered && contact.registeredUser) {
        targetUid = contact.registeredUser.uid;
      } else if (!isFromPendingQueue && searchResult?.alreadyRegistered && searchResult?.registeredUser) {
        targetUid = searchResult.registeredUser.uid;
      } else {
        // Query to be absolutely sure there is no race condition
        const querySnap = await getDocs(query(
          collection(db, 'users'), 
          where('email', '==', contact.email.toLowerCase())
        ));
        if (!querySnap.empty) {
          targetUid = querySnap.docs[0].id;
          existingUserObj = querySnap.docs[0].data();
        } else {
          // Generate a new random Firestore UID
          const newDocRef = doc(collection(db, 'users'));
          targetUid = newDocRef.id;
        }
      }

      const userDocRef = doc(db, 'users', targetUid);

      const userFields = {
        email: contact.email.toLowerCase(),
        fullName: contact.name,
        phone: contact.phone || '',
        company: contact.company || '',
        role: role,
        status: 'pending_approval', // Option 2: Created as pending_approval
        zohoContactId: contact.contact_id,
        updatedAt: serverTimestamp()
      };

      if (!existingUserObj) {
        userFields.createdAt = serverTimestamp();
      }

      // If incorporating a doctor linked to a wholesaler
      if (role === 'doctor' && assigneeId) {
        userFields.parentWholesalerId = assigneeId;
      }

      await setDoc(userDocRef, userFields, { merge: true });

      // If incorporating a patient linked to a doctor, set up relationship
      if (role === 'patient' && assigneeId) {
        // Check if relationship already exists
        const relSnap = await getDocs(query(
          collection(db, 'doctor_patient_relationships'),
          where('patientId', '==', targetUid),
          where('doctorId', '==', assigneeId)
        ));

        if (relSnap.empty) {
          const relDocRef = doc(collection(db, 'doctor_patient_relationships'));
          await setDoc(relDocRef, {
            patientId: targetUid,
            doctorId: assigneeId,
            status: 'active',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
      }

      // Delete from pending collection if it was queued there
      await deleteDoc(doc(db, 'pending_zoho_assignments', contact.contact_id));

      setIncorporationSuccess(true);
      if (isFromPendingQueue) {
        setSelectedPendingContact(null);
      } else {
        setSearchResult(null);
        setSearchEmail('');
      }
    } catch (err) {
      console.error('[Incorporate Error]', err);
      alert('Failed to incorporate and assign client.');
    } finally {
      setIncorporating(false);
    }
  };

  // Filter Tab 1 Active Customers
  const filteredCustomers = (data?.top_customers || []).filter(c => {
    if (typeFilter !== 'all' && c.type !== typeFilter) return false;
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      (c.name?.toLowerCase().includes(q)) ||
      (c.company?.toLowerCase().includes(q)) ||
      (c.email?.toLowerCase().includes(q)) ||
      (c.products_bought?.some(p => p.toLowerCase().includes(q)))
    );
  });

  const { summary } = data || {};

  return (
    <div style={{
      background: 'var(--color-bg-surface)', 
      borderRadius: '8px',
      border: '1px solid #dadce0', 
      boxShadow: '0 1px 2px 0 rgba(60,67,70,0.06)',
      display: 'flex', 
      flexDirection: 'column',
      height: fullHeight ? '100%' : 'auto', 
      overflow: 'hidden',
    }}>
      
      {/* Google Cloud Header */}
      <div style={{ 
        padding: '1.25rem 1.5rem', 
        borderBottom: '1px solid #dadce0',
        background: '#f8f9fa', 
        flexShrink: 0 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ 
              margin: 0, 
              fontSize: '1rem', 
              fontWeight: 600, 
              color: '#202124',
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem' 
            }}>
              <Building2 size={18} color="#1a73e8" />
              CRM Intelligence — Zoho Books Integration
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: '#5f6368' }}>
              Zoho Books is the absolute source of truth. Manage, search, and map client accounts.
            </p>
          </div>
          {activeTab === 'active' && (
            <button 
              onClick={handleRefresh} 
              disabled={refreshing}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                padding: '0.45rem 0.8rem',
                borderRadius: '4px', 
                border: '1px solid #dadce0', 
                background: 'var(--color-bg-surface)',
                cursor: refreshing ? 'not-allowed' : 'pointer', 
                fontSize: '0.72rem',
                fontWeight: 600, 
                color: '#3c4043', 
                transition: 'all 0.15s', 
                flexShrink: 0 
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#1a73e8'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#dadce0'}
            >
              <RefreshCw size={12} style={{ animation: refreshing ? 'crmSpin 1s linear infinite' : 'none' }} />
              {refreshing ? 'Syncing...' : 'Force Sync'}
            </button>
          )}
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #dadce0', marginTop: '1rem' }}>
          <button 
            onClick={() => { setActiveTab('active'); setSearchResult(null); }}
            style={{
              padding: '0.5rem 0.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'active' ? '2px solid #1a73e8' : '2px solid transparent',
              color: activeTab === 'active' ? '#1a73e8' : '#5f6368',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            Active Clients
          </button>
          <button 
            onClick={() => { setActiveTab('search'); setSearchResult(null); }}
            style={{
              padding: '0.5rem 0.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'search' ? '2px solid #1a73e8' : '2px solid transparent',
              color: activeTab === 'search' ? '#1a73e8' : '#5f6368',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            Manual Search (Email)
          </button>
          <button 
            onClick={() => { setActiveTab('pending'); setSearchResult(null); }}
            style={{
              padding: '0.5rem 0.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'pending' ? '2px solid #1a73e8' : '2px solid transparent',
              color: activeTab === 'pending' ? '#1a73e8' : '#5f6368',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              outline: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            Pending Assignments
            {pendingList.length > 0 && (
              <span style={{
                background: '#d93025',
                color: 'var(--color-bg-surface)',
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '0.1rem 0.4rem',
                borderRadius: '10px',
                display: 'inline-block'
              }}>
                {pendingList.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        
        {/* TAB 1: ACTIVE CLIENTS */}
        {activeTab === 'active' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {summary && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '0.75rem',
                padding: '1rem 1.5rem',
                backgroundColor: '#f8f9fa',
                borderBottom: '1px solid #dadce0'
              }}>
                {[
                  { icon: Users,       label: 'Total Customers',    value: summary.total_customers, color: '#1a73e8' },
                  { icon: Building2,   label: 'Corporate',          value: summary.corporate,        color: '#1a73e8' },
                  { icon: User,        label: 'Private Clients',    value: summary.private,          color: '#137333' },
                  { icon: DollarSign,  label: 'Overall Revenue',    value: fmtAED_USD(summary.total_revenue_aed), color: '#f9ab00' },
                ].map(kpi => (
                  <div key={kpi.label} style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    padding: '0.75rem', 
                    borderRadius: '6px',
                    background: 'var(--color-bg-surface)', 
                    border: '1px solid #dadce0' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#5f6368', fontSize: '0.68rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      <kpi.icon size={11} color={kpi.color} />
                      {kpi.label}
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#202124' }}>
                      {kpi.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Filter bar */}
            <div style={{ 
              padding: '0.75rem 1.25rem', 
              borderBottom: '1px solid #dadce0',
              display: 'flex', 
              gap: '0.6rem', 
              alignItems: 'center', 
              flexShrink: 0 
            }}>
              <input
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder="Filter by name, company, email..."
                style={{ 
                  flex: 1, 
                  padding: '0.45rem 0.75rem', 
                  borderRadius: '4px',
                  border: '1px solid #dadce0', 
                  fontSize: '0.8rem', 
                  outline: 'none',
                  color: '#202124' 
                }}
              />
              {['all', 'corporate', 'private'].map(t => (
                <button 
                  key={t} 
                  onClick={() => setTypeFilter(t)} 
                  style={{
                    padding: '0.45rem 0.8rem', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    border: `1px solid ${typeFilter === t ? '#1a73e8' : '#dadce0'}`,
                    background: typeFilter === t ? '#1a73e8' : 'var(--color-bg-surface)',
                    color: typeFilter === t ? 'var(--color-bg-surface)' : '#3c4043',
                    fontSize: '0.72rem', 
                    fontWeight: 600, 
                    transition: 'all 0.15s', 
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t === 'all' ? 'All' : t === 'corporate' ? 'Corp.' : 'Private'}
                </button>
              ))}
            </div>

            {/* Client Lists */}
            <div style={{ padding: '1rem' }}>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ height: 60, borderRadius: '8px', background: '#f1f3f4', animation: 'shimmer 1.5s infinite' }} />
                  ))}
                </div>
              ) : error ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#d93025', fontSize: '0.8rem', fontWeight: 600 }}>
                  {error}
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: '#5f6368', fontSize: '0.8rem' }}>
                  {filter || typeFilter !== 'all' ? 'No clients found matching the filter.' : 'No data loaded. Force sync to retrieve.'}
                </div>
              ) : (
                <div style={{ overflowX: 'auto', border: '1px solid #dadce0', borderRadius: '4px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dadce0' }}>
                        <th style={{ padding: '0.6rem 0.85rem', width: '30px' }}></th>
                        <th style={{ padding: '0.6rem 0.85rem', fontWeight: 600, color: '#5f6368', width: '40px' }}>Rank</th>
                        <th style={{ padding: '0.6rem 0.85rem', fontWeight: 600, color: '#5f6368' }}>Client Name</th>
                        <th style={{ padding: '0.6rem 0.85rem', fontWeight: 600, color: '#5f6368' }}>Email / Phone</th>
                        <th style={{ padding: '0.6rem 0.85rem', fontWeight: 600, color: '#5f6368', width: '80px' }}>Type</th>
                        <th style={{ padding: '0.6rem 0.85rem', fontWeight: 600, color: '#5f6368', textAlign: 'right' }}>Total Revenue</th>
                        <th style={{ padding: '0.6rem 0.85rem', fontWeight: 600, color: '#5f6368', textAlign: 'right' }}>Pending Balance</th>
                        <th style={{ padding: '0.6rem 0.85rem', fontWeight: 600, color: '#5f6368', textAlign: 'center', width: '60px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map((c, i) => (
                        <CustomerRow key={c.contact_id} c={c} rank={i + 1} />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MANUAL SEARCH BY EMAIL */}
        {activeTab === 'search' && (
          <div style={{ padding: '1.5rem' }}>
            <form onSubmit={handleSearchEmail} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={14} color="#5f6368" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="Introduce el email para buscar en Zoho Books (ej. jose@mediluxeme.com)..."
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                    borderRadius: '4px',
                    border: '1px solid #dadce0',
                    fontSize: '0.8rem',
                    outline: 'none',
                    color: '#202124'
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={searchLoading}
                style={{
                  padding: '0.5rem 1.25rem',
                  border: 'none',
                  backgroundColor: '#1a73e8',
                  color: 'var(--color-bg-surface)',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: searchLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
            </form>

            {searchError && (
              <div style={{ 
                padding: '0.75rem 1rem', 
                backgroundColor: '#fce8e6', 
                border: '1px solid #f9d2ce', 
                borderRadius: '4px',
                color: '#c5221f', 
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.5rem'
              }}>
                <AlertCircle size={14} />
                {searchError}
              </div>
            )}

            {incorporationSuccess && (
              <div style={{ 
                padding: '0.75rem 1rem', 
                backgroundColor: '#e6f4ea', 
                border: '1px solid #ceead6', 
                borderRadius: '4px',
                color: '#137333', 
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.5rem'
              }}>
                <CheckCircle2 size={14} />
                Cliente incorporado al sistema local con éxito como 'Pending Approval'.
              </div>
            )}

            {searchResult && searchResult.found && (
              <div style={{
                border: '1px solid #dadce0',
                borderRadius: '8px',
                padding: '1.5rem',
                backgroundColor: 'var(--color-bg-surface)',
                boxShadow: '0 1px 2px 0 rgba(60,67,70,0.06)'
              }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#202124', fontWeight: 600, borderBottom: '1px solid #dadce0', paddingBottom: '0.5rem' }}>
                  Zoho Contact Info Found
                </h4>

                {searchResult.alreadyRegistered && (
                  <div style={{
                    padding: '0.6rem 0.85rem',
                    backgroundColor: '#fef7e0',
                    border: '1px solid #fbe9e7',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    color: '#b06000',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}>
                    <AlertCircle size={13} />
                    Este email ya existe en la aplicación local: {searchResult.registeredUser?.name} ({searchResult.registeredUser?.role})
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem' }}>
                  {/* Left Column: Data */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ color: '#5f6368', fontWeight: 500 }}>Name:</span>{' '}
                      <strong style={{ color: '#202124' }}>{searchResult.contact.name}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#5f6368', fontWeight: 500 }}>Email:</span>{' '}
                      <span style={{ color: '#202124' }}>{searchResult.contact.email}</span>
                    </div>
                    <div>
                      <span style={{ color: '#5f6368', fontWeight: 500 }}>Phone:</span>{' '}
                      <span style={{ color: '#202124' }}>{searchResult.contact.phone || '—'}</span>
                    </div>
                    <div>
                      <span style={{ color: '#5f6368', fontWeight: 500 }}>Company:</span>{' '}
                      <span style={{ color: '#202124' }}>{searchResult.contact.company || '—'}</span>
                    </div>
                    <div>
                      <span style={{ color: '#5f6368', fontWeight: 500 }}>Type:</span>{' '}
                      <span style={{
                        display: 'inline-block',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        backgroundColor: searchResult.contact.type === 'corporate' ? '#e8f0fe' : '#e6f4ea',
                        color: searchResult.contact.type === 'corporate' ? '#1a73e8' : '#137333'
                      }}>
                        {searchResult.contact.type}
                      </span>
                    </div>
                    {searchResult.contact.address && (
                      <div>
                        <span style={{ color: '#5f6368', fontWeight: 500 }}>Address:</span>
                        <div style={{ fontSize: '0.72rem', color: '#5f6368', marginTop: '0.1rem' }}>{searchResult.contact.address}</div>
                      </div>
                    )}
                    <div style={{ marginTop: '0.5rem' }}>
                      <a 
                        href={searchResult.contact.zohoLink} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{
                          color: '#1a73e8',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem'
                        }}
                      >
                        <ExternalLink size={12} /> View in Zoho Books
                      </a>
                    </div>
                  </div>

                  {/* Right Column: Mapping Form */}
                  <div style={{ borderLeft: '1px solid #dadce0', paddingLeft: '2rem' }}>
                    <h5 style={{ margin: '0 0 0.85rem 0', fontSize: '0.78rem', color: '#202124', fontWeight: 600 }}>
                      Onboard and Map User
                    </h5>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {/* Role selection */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: '#5f6368', fontWeight: 600, marginBottom: '0.25rem' }}>
                          Select Role Context:
                        </label>
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.35rem',
                            borderRadius: '4px',
                            border: '1px solid #dadce0',
                            fontSize: '0.75rem',
                            outline: 'none'
                          }}
                        >
                          <option value="patient">Patient (default)</option>
                          <option value="doctor">Physician & Clinic</option>
                          <option value="wholesaler">Wholesaler B2B</option>
                        </select>
                      </div>

                      {/* Doctor Assignment selection (for patient role) */}
                      {selectedRole === 'patient' && (
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', color: '#5f6368', fontWeight: 600, marginBottom: '0.25rem' }}>
                            Assign to Clinic/Doctor:
                          </label>
                          <select
                            value={assignedDoctorId}
                            onChange={(e) => setAssignedDoctorId(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.35rem',
                              borderRadius: '4px',
                              border: '1px solid #dadce0',
                              fontSize: '0.75rem',
                              outline: 'none'
                            }}
                          >
                            <option value="">No Doctor assignment</option>
                            {doctorsList.map(doc => (
                              <option key={doc.id} value={doc.id}>
                                {doc.fullName || doc.displayName || doc.email} ({doc.institution || 'Individual'})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Wholesaler Assignment selection (for doctor role) */}
                      {selectedRole === 'doctor' && (
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', color: '#5f6368', fontWeight: 600, marginBottom: '0.25rem' }}>
                            Assign to Wholesaler Parent:
                          </label>
                          <select
                            value={assignedWholesalerId}
                            onChange={(e) => setAssignedWholesalerId(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.35rem',
                              borderRadius: '4px',
                              border: '1px solid #dadce0',
                              fontSize: '0.75rem',
                              outline: 'none'
                            }}
                          >
                            <option value="">No Wholesaler assignment</option>
                            {wholesalersList.map(ws => (
                              <option key={ws.id} value={ws.id}>
                                {ws.fullName || ws.displayName || ws.email}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Confirmation buttons */}
                      <button
                        onClick={() => handleIncorporate(
                          searchResult.contact, 
                          selectedRole, 
                          selectedRole === 'patient' ? assignedDoctorId : (selectedRole === 'doctor' ? assignedWholesalerId : null),
                          false
                        )}
                        disabled={incorporating}
                        style={{
                          marginTop: '0.5rem',
                          padding: '0.5rem 1rem',
                          border: 'none',
                          backgroundColor: '#1a73e8',
                          color: 'var(--color-bg-surface)',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: incorporating ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <Link2 size={13} />
                        {incorporating ? 'Incorporate...' : (searchResult.alreadyRegistered ? 'Update Mapping' : 'Incorporate and Assign')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PENDING ASSIGNMENTS QUEUE */}
        {activeTab === 'pending' && (
          <div style={{ padding: '1.25rem' }}>
            {pendingLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ height: 50, borderRadius: '8px', background: '#f1f3f4', animation: 'shimmer 1.5s infinite' }} />
                ))}
              </div>
            ) : pendingList.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#5f6368', fontSize: '0.8rem' }}>
                No pending customer notifications in the Zoho Books webhook queue.
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.72rem', color: '#5f6368', fontWeight: 500 }}>
                    Newly created clients on Zoho Books waiting for local system link:
                  </span>
                </div>

                <div style={{ overflowX: 'auto', border: '1px solid #dadce0', borderRadius: '6px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dadce0' }}>
                        <th style={{ padding: '0.6rem 0.85rem', fontWeight: 600, color: '#5f6368' }}>Client Name</th>
                        <th style={{ padding: '0.6rem 0.85rem', fontWeight: 600, color: '#5f6368' }}>Email</th>
                        <th style={{ padding: '0.6rem 0.85rem', fontWeight: 600, color: '#5f6368' }}>Type</th>
                        <th style={{ padding: '0.6rem 0.85rem', fontWeight: 600, color: '#5f6368' }}>Date Notified</th>
                        <th style={{ padding: '0.6rem 0.85rem', fontWeight: 600, color: '#5f6368', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingList.map((contact) => (
                        <React.Fragment key={contact.id}>
                          <tr style={{ 
                            borderBottom: '1px solid #dadce0', 
                            backgroundColor: selectedPendingContact?.id === contact.id ? '#e8f0fe' : 'transparent',
                            transition: 'background-color 0.15s' 
                          }}>
                            <td style={{ padding: '0.6rem 0.85rem', fontWeight: 600, color: '#202124' }}>
                              {contact.name}
                              {contact.alreadyRegistered && (
                                <span style={{
                                  marginLeft: '0.4rem',
                                  padding: '0.05rem 0.3rem',
                                  borderRadius: '3px',
                                  fontSize: '0.6rem',
                                  fontWeight: 700,
                                  backgroundColor: '#fef7e0',
                                  color: '#b06000'
                                }}>
                                  Exists
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '0.6rem 0.85rem', color: '#5f6368' }}>{contact.email}</td>
                            <td style={{ padding: '0.6rem 0.85rem' }}>
                              <span style={{
                                display: 'inline-block',
                                padding: '0.1rem 0.4rem',
                                borderRadius: '4px',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                backgroundColor: contact.type === 'corporate' ? '#e8f0fe' : '#e6f4ea',
                                color: contact.type === 'corporate' ? '#1a73e8' : '#137333'
                              }}>
                                {contact.type}
                              </span>
                            </td>
                            <td style={{ padding: '0.6rem 0.85rem', color: '#5f6368' }}>
                              {contact.createdAt ? new Date(contact.createdAt.toMillis()).toLocaleString() : 'Just now'}
                            </td>
                            <td style={{ padding: '0.6rem 0.85rem', textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                <button
                                  onClick={() => {
                                    if (selectedPendingContact?.id === contact.id) {
                                      setSelectedPendingContact(null);
                                    } else {
                                      setSelectedPendingContact(contact);
                                    }
                                  }}
                                  style={{
                                    padding: '0.3rem 0.75rem',
                                    border: '1px solid #dadce0',
                                    backgroundColor: 'var(--color-bg-surface)',
                                    borderRadius: '4px',
                                    fontWeight: 600,
                                    fontSize: '0.72rem',
                                    color: '#1a73e8',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {selectedPendingContact?.id === contact.id ? 'Cancel' : 'Assign / Onboard'}
                                </button>
                                <a 
                                  href={contact.zohoLink} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: '0.3rem',
                                    border: '1px solid #dadce0',
                                    backgroundColor: 'var(--color-bg-surface)',
                                    borderRadius: '4px',
                                    color: '#5f6368',
                                    textDecoration: 'none'
                                  }}
                                  title="Open in Zoho Books"
                                >
                                  <ExternalLink size={12} />
                                </a>
                              </div>
                            </td>
                          </tr>

                          {/* Assignment expansion drawer */}
                          {selectedPendingContact?.id === contact.id && (
                            <tr>
                              <td colSpan={5} style={{
                                backgroundColor: '#f8f9fa',
                                padding: '1rem 1.5rem',
                                borderBottom: '1px solid #dadce0',
                                animation: 'fadeIn 0.2s ease-out'
                              }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', alignItems: 'start' }}>
                                  
                                  {/* Left context description */}
                                  <div>
                                    <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', fontWeight: 600, color: '#202124' }}>
                                      Assigning Zoho Contact: <strong style={{ color: '#1a73e8' }}>{contact.name}</strong>
                                    </h5>
                                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#5f6368', lineHeight: 1.4 }}>
                                      This client was recently registered in Zoho Books. Complete the mapping to automatically create their profile in our database in the 'Pending Approval' state.
                                    </p>
                                    {contact.alreadyRegistered && (
                                      <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#b06000', fontWeight: 600 }}>
                                        ⚠️ Note: The email is already linked to user '{contact.registeredUser?.name}' in the database. Continuing will map their Zoho ID to this existing user.
                                      </div>
                                    )}
                                  </div>

                                  {/* Right selection actions */}
                                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                                    
                                    {/* Role selection */}
                                    <div style={{ flex: 1 }}>
                                      <label style={{ display: 'block', fontSize: '0.68rem', color: '#5f6368', fontWeight: 600, marginBottom: '0.2rem' }}>
                                        Role assignment:
                                      </label>
                                      <select
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                        style={{
                                          width: '100%',
                                          padding: '0.35rem',
                                          borderRadius: '4px',
                                          border: '1px solid #dadce0',
                                          fontSize: '0.72rem',
                                          outline: 'none',
                                          backgroundColor: 'var(--color-bg-surface)'
                                        }}
                                      >
                                        <option value="patient">Patient (default)</option>
                                        <option value="doctor">Physician & Clinic</option>
                                        <option value="wholesaler">Wholesaler B2B</option>
                                      </select>
                                    </div>

                                    {/* Assignee selection */}
                                    {selectedRole === 'patient' && (
                                      <div style={{ flex: 1.5 }}>
                                        <label style={{ display: 'block', fontSize: '0.68rem', color: '#5f6368', fontWeight: 600, marginBottom: '0.2' }}>
                                          Supervising Doctor:
                                        </label>
                                        <select
                                          value={assignedDoctorId}
                                          onChange={(e) => setAssignedDoctorId(e.target.value)}
                                          style={{
                                            width: '100%',
                                            padding: '0.35rem',
                                            borderRadius: '4px',
                                            border: '1px solid #dadce0',
                                            fontSize: '0.72rem',
                                            outline: 'none',
                                            backgroundColor: 'var(--color-bg-surface)'
                                          }}
                                        >
                                          <option value="">No Doctor assignment</option>
                                          {doctorsList.map(doc => (
                                            <option key={doc.id} value={doc.id}>
                                              {doc.fullName || doc.displayName || doc.email} ({doc.institution || 'Individual'})
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    )}

                                    {selectedRole === 'doctor' && (
                                      <div style={{ flex: 1.5 }}>
                                        <label style={{ display: 'block', fontSize: '0.68rem', color: '#5f6368', fontWeight: 600, marginBottom: '0.2' }}>
                                          Parent Wholesaler:
                                        </label>
                                        <select
                                          value={assignedWholesalerId}
                                          onChange={(e) => setAssignedWholesalerId(e.target.value)}
                                          style={{
                                            width: '100%',
                                            padding: '0.35rem',
                                            borderRadius: '4px',
                                            border: '1px solid #dadce0',
                                            fontSize: '0.72rem',
                                            outline: 'none',
                                            backgroundColor: 'var(--color-bg-surface)'
                                          }}
                                        >
                                          <option value="">No Wholesaler assignment</option>
                                          {wholesalersList.map(ws => (
                                            <option key={ws.id} value={ws.id}>
                                              {ws.fullName || ws.displayName || ws.email}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    )}

                                    <button
                                      onClick={() => handleIncorporate(
                                        contact, 
                                        selectedRole, 
                                        selectedRole === 'patient' ? assignedDoctorId : (selectedRole === 'doctor' ? assignedWholesalerId : null),
                                        true
                                      )}
                                      disabled={incorporating}
                                      style={{
                                        padding: '0.45rem 1rem',
                                        border: 'none',
                                        backgroundColor: '#1a73e8',
                                        color: 'var(--color-bg-surface)',
                                        borderRadius: '4px',
                                        fontSize: '0.72rem',
                                        fontWeight: 600,
                                        cursor: incorporating ? 'not-allowed' : 'pointer'
                                      }}
                                    >
                                      {incorporating ? 'Assigning...' : 'Confirm Assignment'}
                                    </button>
                                  </div>
                                </div>
                                </td>
                              </tr>
                            )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {data?.cachedAt && activeTab === 'active' && (
        <div style={{ 
          padding: '0.6rem 1.25rem', 
          borderTop: '1px solid #dadce0',
          fontSize: '0.65rem', 
          color: '#5f6368', 
          flexShrink: 0, 
          fontWeight: 600 
        }}>
          Cache last updated · Zoho Books → Bigin synchronized automatically
        </div>
      )}

      <style>{`
        @keyframes crmSpin    { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

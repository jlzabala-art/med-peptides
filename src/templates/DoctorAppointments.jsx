import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  Timestamp,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  Pill, 
  Clock, 
  Info, 
  CheckCircle2, 
  CalendarDays, 
  User, 
  ArrowRight,
  Database,
  Chrome,
  AlertTriangle,
  RefreshCw,
  X
} from 'lucide-react';

export default function DoctorAppointments() {
  const { user, userProfile, baseRole } = useAuth();
  
  // Impersonation check
  const isAdmin = baseRole === 'admin';
  const storedImpersonatedId = sessionStorage.getItem('impersonatedDoctorId');
  const activeDoctorId = isAdmin && storedImpersonatedId ? storedImpersonatedId : user?.uid;

  // State
  const [prescriptions, setPrescriptions] = useState([]);
  const [refills, setRefills] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calendar sync state
  const [calendarConnected, setCalendarConnected] = useState(() => {
    return localStorage.getItem(`gcal_connected_${activeDoctorId}`) === 'true';
  });
  const [showOauthModal, setShowOauthModal] = useState(false);
  const [oauthEmail, setOauthEmail] = useState(user?.email || '');
  const [oauthPassword, setOauthPassword] = useState('');
  const [oauthLoading, setOauthLoading] = useState(false);

  // Load appointments, prescriptions, refills, and transactions
  useEffect(() => {
    if (!activeDoctorId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Prescriptions created by this doctor
        const rxQuery = query(
          collection(db, 'prescriptions'),
          where('doctorId', '==', activeDoctorId),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const rxSnap = await getDocs(rxQuery);
        const rxList = rxSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setPrescriptions(rxList);

        // 2. Fetch Refill Reminders for this doctor's patients
        const refillQuery = query(
          collection(db, 'refill_reminders'),
          where('doctorId', '==', activeDoctorId),
          limit(25)
        );
        const refillSnap = await getDocs(refillQuery);
        const refillList = refillSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setRefills(refillList);

        // 3. Fetch Wholesaler and Patient Transactions
        // In the system, transactions consist of orders linked to this doctor's prescriptions or recommendations
        const txQuery = query(
          collection(db, 'orders'),
          where('supervisingPhysicianId', '==', activeDoctorId),
          orderBy('createdAt', 'desc'),
          limit(25)
        );
        const txSnap = await getDocs(txQuery);
        const txList = txSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setTransactions(txList);

      } catch (err) {
        console.error("Error loading doctor appointments data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeDoctorId]);

  // Handle Mock Google Calendar Login
  const handleConnectCalendar = (e) => {
    e.preventDefault();
    if (!oauthEmail || !oauthPassword) return;
    setOauthLoading(true);
    setTimeout(() => {
      setCalendarConnected(true);
      localStorage.setItem(`gcal_connected_${activeDoctorId}`, 'true');
      setOauthLoading(false);
      setShowOauthModal(false);
    }, 1500);
  };

  const handleDisconnectCalendar = () => {
    if (!window.confirm("Disconnect Google Calendar sync?")) return;
    setCalendarConnected(false);
    localStorage.removeItem(`gcal_connected_${activeDoctorId}`);
  };

  // Trigger manual notification for patient refill
  const handleTriggerRefillAlert = async (refillId, patientEmail) => {
    try {
      const refillRef = doc(db, 'refill_reminders', refillId);
      await updateDoc(refillRef, {
        [`notified.doctor`]: true,
        [`notifiedAt.doctor`]: Timestamp.now()
      });
      setRefills(prev => prev.map(r => r.id === refillId ? {
        ...r,
        notified: { ...r.notified, doctor: true }
      } : r));
      alert(`Refill alert sent successfully to ${patientEmail}`);
    } catch (err) {
      console.error(err);
      alert("Failed to trigger alert. Check console.");
    }
  };

  // Mock schedule slots for Doctor Agenda
  const mockSchedule = [
    { time: '09:00 AM', patient: 'Arthur Pendragon', type: 'Clinical Consultation', status: 'Scheduled' },
    { time: '10:30 AM', patient: 'Gwen Stacy', type: 'Peptide Protocol Review', status: 'Completed' },
    { time: '12:00 PM', patient: 'Bruce Banner', type: 'Lab Results Check', status: 'Scheduled' },
    { time: '03:15 PM', patient: 'Peter Parker', type: 'Refill Intake', status: 'Scheduled' }
  ];

  return (
    <div style={styles.container}>
      {/* Title Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>📅 Clinical Agenda & Appointments</h2>
          <p style={styles.subtitle}>Manage scheduled patient visits, prescription timelines, 30-day refills, and transactions.</p>
        </div>
        
        {/* Google Calendar Sync */}
        <div>
          {calendarConnected ? (
            <button style={styles.btnSyncActive} onClick={handleDisconnectCalendar}>
              <Chrome size={14} style={{ marginRight: 6 }} />
              Calendar Synced
            </button>
          ) : (
            <button style={styles.btnSync} onClick={() => setShowOauthModal(true)}>
              <Chrome size={14} style={{ marginRight: 6 }} />
              Sync Google Calendar
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>
          <RefreshCw size={24} className="spinner" style={{ animation: 'spin 1.5s linear infinite', marginBottom: 12 }} />
          Loading agenda details...
        </div>
      ) : (
        <div style={styles.grid}>
          {/* Left Column: Calendar Agenda & Refills */}
          <div style={styles.col}>
            
            {/* Daily Schedule Slots */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <CalendarDays size={16} style={{ color: 'var(--color-success)' }} />
                <h3 style={styles.cardTitle}>Today's Appointments</h3>
              </div>
              <div style={styles.list}>
                {mockSchedule.map((slot, idx) => (
                  <div key={idx} style={styles.slotRow}>
                    <div style={styles.slotTime}>{slot.time}</div>
                    <div style={{ flex: 1 }}>
                      <div style={styles.slotPatient}>{slot.patient}</div>
                      <div style={styles.slotType}>{slot.type}</div>
                    </div>
                    <span style={slot.status === 'Completed' ? styles.badgeSuccess : styles.badgeInfo}>
                      {slot.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 30-Day Refill Alerts */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <Clock size={16} style={{ color: 'var(--color-warning)' }} />
                <h3 style={styles.cardTitle}>Refill Reminders (30-day Countdown)</h3>
              </div>
              <div style={styles.list}>
                {refills.length === 0 ? (
                  <div style={styles.empty}>No active patient refill alerts.</div>
                ) : (
                  refills.map(r => {
                    const remindDate = r.remindAt?.toDate ? r.remindAt.toDate() : new Date(r.remindAt);
                    const daysRemaining = Math.ceil((remindDate - new Date()) / (1000 * 60 * 60 * 24));
                    const isDue = daysRemaining <= 0;
                    
                    return (
                      <div key={r.id} style={styles.refillRow}>
                        <div style={{ flex: 1 }}>
                          <div style={styles.slotPatient}>{r.patientName || 'Patient'}</div>
                          <div style={styles.slotType}>Compound: {r.peptideName || 'Peptide Therapy'}</div>
                          <div style={styles.slotType}>Due in: <strong style={{ color: isDue ? 'var(--color-danger)' : 'var(--color-warning)' }}>{isDue ? 'Due Now' : `${daysRemaining} days`}</strong></div>
                        </div>
                        <button
                          style={r.notified?.doctor ? styles.btnAlertSent : styles.btnAlert}
                          onClick={() => handleTriggerRefillAlert(r.id, r.patientEmail)}
                          disabled={r.notified?.doctor}
                        >
                          {r.notified?.doctor ? 'Alert Sent' : 'Trigger Alert'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Prescriptions & Transactions */}
          <div style={styles.col}>
            
            {/* Prescription History */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <Pill size={16} style={{ color: '#1a73e8' }} />
                <h3 style={styles.cardTitle}>Prescription Log</h3>
              </div>
              <div style={styles.list}>
                {prescriptions.length === 0 ? (
                  <div style={styles.empty}>No prescriptions issued by you.</div>
                ) : (
                  prescriptions.map(rx => {
                    const date = rx.createdAt?.toDate ? rx.createdAt.toDate().toLocaleDateString() : '—';
                    return (
                      <div key={rx.id} style={styles.rxRow}>
                        <div style={{ flex: 1 }}>
                          <div style={styles.rxPatient}>{rx.patient?.name || rx.patient?.email || 'Patient'}</div>
                          <div style={styles.rxDetails}>
                            {rx.items?.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                          </div>
                          <div style={styles.rxDate}>Issued on: {date}</div>
                        </div>
                        <span style={styles.rxStatus}>{rx.status}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Transactions Ledger */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <Database size={16} style={{ color: '#7c3aed' }} />
                <h3 style={styles.cardTitle}>Clinical Transactions Ledger</h3>
              </div>
              <div style={styles.list}>
                {transactions.length === 0 ? (
                  <div style={styles.empty}>No transactions recorded.</div>
                ) : (
                  transactions.map(tx => {
                    const txDate = tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleString() : '—';
                    return (
                      <div key={tx.id} style={styles.txRow}>
                        <div style={{ flex: 1 }}>
                          <div style={styles.txInfo}>Order: <span style={styles.mono}>{tx.id.slice(0, 8)}</span></div>
                          <div style={styles.txDate}>{txDate}</div>
                          <div style={styles.txPrice}>
                            Total: <strong>${tx.totals?.usd || tx.totalAmount || 0}</strong> • Status: {tx.status}
                          </div>
                        </div>
                        <span style={styles.badgeTx}>{tx.cartOwnership?.source || 'standard'}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Mock Google Calendar OAuth Modal */}
      {showOauthModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Connect with Google Calendar</h3>
              <button style={styles.closeBtn} onClick={() => setShowOauthModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleConnectCalendar} style={styles.modalForm}>
              <p style={{ margin: 0, fontSize: 13, color: '#5f6368', lineHeight: 1.5 }}>
                Sync clinical appointments, refills, and transaction schedules directly with your Google Calendar account.
              </p>
              <div>
                <label style={styles.modalLabel}>Google Email Address</label>
                <input
                  type="email"
                  required
                  value={oauthEmail}
                  onChange={e => setOauthEmail(e.target.value)}
                  style={styles.modalInput}
                />
              </div>
              <div>
                <label style={styles.modalLabel}>Google Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={oauthPassword}
                  onChange={e => setOauthPassword(e.target.value)}
                  style={styles.modalInput}
                />
              </div>
              <div style={styles.modalFooter}>
                <button type="button" style={styles.btnGcpGray} onClick={() => setShowOauthModal(false)}>
                  Cancel
                </button>
                <button type="submit" style={styles.btnGcpPrimary} disabled={oauthLoading}>
                  {oauthLoading ? 'Authenticating...' : 'Sign in & Authorize'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Styling definitions (Google Cloud Console light themes)
const styles = {
  container: {
    padding: "24px",
    background: "var(--color-bg-surface)",
    fontFamily: "Inter, Roboto, sans-serif"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #dadce0",
    paddingBottom: "16px",
    marginBottom: "20px"
  },
  title: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 500,
    color: "#202124"
  },
  subtitle: {
    margin: "4px 0 0 0",
    fontSize: "13px",
    color: "#5f6368"
  },
  btnSync: {
    padding: "6px 12px",
    borderRadius: "4px",
    border: "1px solid #dadce0",
    background: "var(--color-bg-surface)",
    color: "#1a73e8",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: "13px",
    display: "flex",
    alignItems: "center"
  },
  btnSyncActive: {
    padding: "6px 12px",
    borderRadius: "4px",
    border: "1px solid #10b981",
    background: "rgba(16,185,129,0.06)",
    color: "var(--color-success)",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: "13px",
    display: "flex",
    alignItems: "center"
  },
  loading: {
    padding: "48px",
    textAlign: "center",
    color: "#5f6368",
    fontSize: "13px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px"
  },
  col: {
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  card: {
    background: "var(--color-bg-surface)",
    border: "1px solid #dadce0",
    borderRadius: "4px",
    overflow: "hidden"
  },
  cardHeader: {
    borderBottom: "1px solid #dadce0",
    padding: "10px 14px",
    backgroundColor: "var(--color-bg-app)",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  cardTitle: {
    margin: 0,
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--color-text-primary)"
  },
  list: {
    display: "flex",
    flexDirection: "column"
  },
  empty: {
    padding: "24px",
    textAlign: "center",
    color: "var(--color-text-tertiary)",
    fontSize: "13px"
  },
  slotRow: {
    display: "flex",
    alignItems: "center",
    padding: "10px 14px",
    borderBottom: "1px solid #f1f3f4",
    fontSize: "13px"
  },
  slotTime: {
    width: "80px",
    fontWeight: 600,
    color: "#5f6368"
  },
  slotPatient: {
    fontWeight: 500,
    color: "#202124"
  },
  slotType: {
    fontSize: "11px",
    color: "#5f6368",
    marginTop: "2px"
  },
  badgeSuccess: {
    fontSize: "11px",
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: "12px",
    background: "rgba(16,185,129,0.1)",
    color: "#137333"
  },
  badgeInfo: {
    fontSize: "11px",
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: "12px",
    background: "rgba(26,115,232,0.1)",
    color: "#1a73e8"
  },
  refillRow: {
    display: "flex",
    alignItems: "center",
    padding: "10px 14px",
    borderBottom: "1px solid #f1f3f4",
    fontSize: "13px"
  },
  btnAlert: {
    padding: "4px 8px",
    fontSize: "11px",
    border: "1px solid #dadce0",
    background: "var(--color-bg-surface)",
    color: "var(--color-warning)",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: 500
  },
  btnAlertSent: {
    padding: "4px 8px",
    fontSize: "11px",
    border: "1px solid #10b981",
    background: "rgba(16,185,129,0.06)",
    color: "var(--color-success)",
    borderRadius: "4px",
    fontWeight: 500
  },
  rxRow: {
    display: "flex",
    alignItems: "center",
    padding: "10px 14px",
    borderBottom: "1px solid #f1f3f4",
    fontSize: "13px"
  },
  rxPatient: {
    fontWeight: 500,
    color: "#202124"
  },
  rxDetails: {
    fontSize: "11px",
    color: "#3c4043",
    marginTop: "2px"
  },
  rxDate: {
    fontSize: "11px",
    color: "#80868b",
    marginTop: "2px"
  },
  rxStatus: {
    fontSize: "11px",
    textTransform: "uppercase",
    fontWeight: 700,
    color: "#5f6368"
  },
  txRow: {
    display: "flex",
    alignItems: "center",
    padding: "10px 14px",
    borderBottom: "1px solid #f1f3f4",
    fontSize: "13px"
  },
  txInfo: {
    fontWeight: 500,
    color: "#202124"
  },
  mono: {
    fontFamily: "monospace",
    color: "#5f6368"
  },
  txDate: {
    fontSize: "11px",
    color: "#80868b"
  },
  txPrice: {
    fontSize: "11px",
    color: "#3c4043",
    marginTop: "2px"
  },
  badgeTx: {
    fontSize: "11px",
    padding: "2px 6px",
    background: "#f1f3f4",
    borderRadius: "4px",
    color: "#3c4043"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(15, 23, 42, 0.4)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "16px"
  },
  modalContainer: {
    background: "var(--color-bg-surface)",
    borderRadius: "8px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
    border: "1px solid #dadce0",
    overflow: "hidden"
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    borderBottom: "1px solid #dadce0"
  },
  modalTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 600,
    color: "#202124"
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#5f6368",
    cursor: "pointer",
    padding: "4px"
  },
  modalForm: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  modalLabel: {
    display: "block",
    fontSize: "11px",
    fontWeight: 700,
    color: "var(--color-text-primary)",
    marginBottom: "4px"
  },
  modalInput: {
    width: "100%",
    fontSize: "13px",
    padding: "6px 8px",
    border: "1px solid #dadce0",
    borderRadius: "4px",
    background: "var(--color-bg-app)",
    outline: "none"
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    paddingTop: "12px",
    borderTop: "1px solid #dadce0"
  },
  btnGcpPrimary: {
    padding: "6px 12px",
    borderRadius: "4px",
    border: "none",
    background: "#1a73e8",
    color: "var(--color-bg-surface)",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: "13px"
  },
  btnGcpGray: {
    padding: "6px 12px",
    borderRadius: "4px",
    border: "1px solid #dadce0",
    background: "var(--color-bg-surface)",
    color: "#3c4043",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: "13px"
  }
};

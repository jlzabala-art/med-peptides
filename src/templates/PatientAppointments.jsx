import Calendar from "lucide-react/dist/esm/icons/calendar";
import Clock from "lucide-react/dist/esm/icons/clock";
import Chrome from "lucide-react/dist/esm/icons/chrome";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import CalendarDays from "lucide-react/dist/esm/icons/calendar-days";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Info from "lucide-react/dist/esm/icons/info";
import Beaker from "lucide-react/dist/esm/icons/beaker";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import X from "lucide-react/dist/esm/icons/x";
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';












export default function PatientAppointments() {
  const { user } = useAuth();
  const uid = user?.uid;

  // State
  const [refills, setRefills] = useState([]);
  const [loading, setLoading] = useState(true);
  // Google sync state
  const [calendarConnected, setCalendarConnected] = useState(() => {
    return localStorage.getItem(`gcal_connected_patient_${uid}`) === 'true';
  });
  const [showOauthModal, setShowOauthModal] = useState(false);
  const [oauthEmail, setOauthEmail] = useState(user?.email || '');
  const [oauthPassword, setOauthPassword] = useState('');
  const [oauthLoading, setOauthLoading] = useState(false);

  useEffect(() => {
    if (!uid) return;
    const fetchRefills = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'refill_reminders'),
          where('patientId', '==', uid),
          limit(10)
        );
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setRefills(docs);
      } catch (err) {
        console.error("Error loading patient refills:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRefills();
  }, [uid]);

  const handleConnectCalendar = (e) => {
    e.preventDefault();
    if (!oauthEmail || !oauthPassword) return;
    setOauthLoading(true);
    setTimeout(() => {
      setCalendarConnected(true);
      localStorage.setItem(`gcal_connected_patient_${uid}`, 'true');
      setOauthLoading(false);
      setShowOauthModal(false);
    }, 1500);
  };

  const handleDisconnectCalendar = () => {
    if (!window.confirm("Disconnect Google Calendar sync?")) return;
    setCalendarConnected(false);
    localStorage.removeItem(`gcal_connected_patient_${uid}`);
  };

  const mockAppointments = [
    { date: 'Today', time: '12:00 PM', doctor: 'Dr. Sarah Jenkins', type: 'Clinical Consultation', status: 'Confirmed' },
    { date: 'Next Tuesday', time: '03:15 PM', doctor: 'Dr. Sarah Jenkins', type: 'Peptide Progress Follow-up', status: 'Scheduled' }
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>📅 Appointments & Therapy Timeline</h2>
          <p style={styles.subtitle}>Track clinical checkups, active peptide refill dates, and sync with Google Calendar.</p>
        </div>
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
          Loading calendar timeline...
        </div>
      ) : (
        <div style={styles.grid}>
          {/* Left Column: Scheduled Appointments */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <CalendarDays size={16} style={{ color: '#1a73e8' }} />
              <h3 style={styles.cardTitle}>Upcoming Doctor Consultations</h3>
            </div>
            <div style={styles.list}>
              {mockAppointments.map((app, idx) => (
                <div key={idx} style={styles.appRow}>
                  <div style={styles.dateBlock}>
                    <div style={styles.dateText}>{app.date}</div>
                    <div style={styles.timeText}>{app.time}</div>
                  </div>
                  <div style={{ flex: 1, paddingLeft: 12 }}>
                    <div style={styles.docName}>{app.doctor}</div>
                    <div style={styles.appType}>{app.type}</div>
                  </div>
                  <span style={styles.badgeSuccess}>{app.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Refill Counters */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <Clock size={16} style={{ color: 'var(--color-warning)' }} />
              <h3 style={styles.cardTitle}>Therapy Refill Alarms (30-day Limit)</h3>
            </div>
            <div style={styles.list}>
              {refills.length === 0 ? (
                <div style={styles.empty}>
                  <Info size={16} style={{ marginBottom: 6, color: 'var(--color-text-tertiary)' }} />
                  <p style={{ margin: 0 }}>No active therapy refills scheduled.</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: 11, color: 'var(--color-text-tertiary)' }}>Refill reminders generate automatically upon delivery.</p>
                </div>
              ) : (
                refills.map(r => {
                  const remindDate = r.remindAt?.toDate ? r.remindAt.toDate() : new Date(r.remindAt);
                  const daysRemaining = Math.ceil((remindDate - new Date()) / (1000 * 60 * 60 * 24));
                  const isDue = daysRemaining <= 0;

                  return (
                    <div key={r.id} style={styles.refillRow}>
                      <div style={{ flex: 1 }}>
                        <div style={styles.peptideName}>{r.peptideName || 'Peptide Therapy'}</div>
                        <div style={styles.refillDate}>Due Date: {remindDate.toLocaleDateString()}</div>
                        <div style={styles.countdown}>
                          Status: <strong style={{ color: isDue ? 'var(--color-danger)' : 'var(--color-warning)' }}>{isDue ? 'Expired - Refill Needed' : `${daysRemaining} days remaining`}</strong>
                        </div>
                      </div>
                      <span style={isDue ? styles.badgeDanger : styles.badgeWarning}>
                        {isDue ? 'REFILL NOW' : 'ACTIVE'}
                      </span>
                    </div>
                  );
                })
              )}
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
                Sync clinical checkups, active peptide refill dates, and dosage schedules directly with your Google Calendar account.
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
    padding: "36px",
    textAlign: "center",
    color: "var(--color-text-tertiary)",
    fontSize: "13px"
  },
  appRow: {
    display: "flex",
    alignItems: "center",
    padding: "12px 14px",
    borderBottom: "1px solid #f1f3f4",
    fontSize: "13px"
  },
  dateBlock: {
    display: "flex",
    flexDirection: "column",
    width: "90px",
    borderRight: "1px solid #e2e8f0",
    paddingRight: "12px"
  },
  dateText: {
    fontWeight: 700,
    color: "#1a73e8"
  },
  timeText: {
    fontSize: "11px",
    color: "#5f6368",
    marginTop: "2px"
  },
  docName: {
    fontWeight: 500,
    color: "#202124"
  },
  appType: {
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
  refillRow: {
    display: "flex",
    alignItems: "center",
    padding: "12px 14px",
    borderBottom: "1px solid #f1f3f4",
    fontSize: "13px"
  },
  peptideName: {
    fontWeight: 500,
    color: "#202124"
  },
  refillDate: {
    fontSize: "11px",
    color: "#5f6368",
    marginTop: "2px"
  },
  countdown: {
    fontSize: "11px",
    color: "#3c4043",
    marginTop: "2px"
  },
  badgeWarning: {
    fontSize: "10px",
    fontWeight: 700,
    padding: "2px 6px",
    borderRadius: "4px",
    background: "rgba(245,158,11,0.1)",
    color: "#b45309"
  },
  badgeDanger: {
    fontSize: "10px",
    fontWeight: 700,
    padding: "2px 6px",
    borderRadius: "4px",
    background: "rgba(239,68,68,0.1)",
    color: "#b91c1c"
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
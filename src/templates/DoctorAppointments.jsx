import React, { useState, useEffect } from 'react';
import { 
  collection, query, where, orderBy, limit, getDocs, Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar as CalendarIcon, Clock, Users, Pill, CheckCircle2, ChevronLeft, ChevronRight,
  Filter, Search, AlertTriangle, FileText, BrainCircuit, Activity, HeartPulse, RefreshCw, Plus
} from 'lucide-react';
import AdminPageHeader from '../components/admin/AdminPageHeader';

import { toast } from 'react-hot-toast';

export default function DoctorAppointments() {
    const { user, baseRole } = useAuth();
    // Impersonation
    const isAdmin = baseRole === 'admin';
    const storedImpersonatedId = sessionStorage.getItem('impersonatedDoctorId');
    const activeDoctorId = isAdmin && storedImpersonatedId ? storedImpersonatedId : user?.uid;

    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState(window.innerWidth < 1024 ? 'Day' : 'Week'); // Day, Week, Month, Agenda
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarExpanded, setCalendarExpanded] = useState(false); // For mobile

    // Data
    const [events, setEvents] = useState([]);
    const [kpis, setKpis] = useState({
        prescriptionsToday: 0,
        pendingFollowUps: 0,
        testsDue: 0,
        totalConsultations: 0
    });

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!activeDoctorId) return;

        const loadData = async () => {
            setLoading(true);
            try {
                // Fetch mock data or real data and map to events
                const rxQuery = query(collection(db, 'prescriptions'), where('doctorId', '==', activeDoctorId), orderBy('createdAt', 'desc'), limit(10));
                const refillQuery = query(collection(db, 'refill_reminders'), where('doctorId', '==', activeDoctorId), limit(10));
                
                const [rxSnap, refillSnap] = await Promise.all([getDocs(rxQuery), getDocs(refillQuery)]);
                
                const loadedEvents = [];
                let rxToday = 0;

                // Today
                const today = new Date();
                today.setHours(0,0,0,0);

                rxSnap.forEach(d => {
                    const data = d.data();
                    const dDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
                    if (dDate >= today) rxToday++;
                    loadedEvents.push({
                        id: d.id,
                        title: `Prescription: ${data.patient?.name || 'Patient'}`,
                        type: 'Prescription',
                        date: dDate,
                        time: dDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                        color: '#1a73e8' // Blue
                    });
                });

                refillSnap.forEach(d => {
                    const data = d.data();
                    const rDate = data.remindAt?.toDate ? data.remindAt.toDate() : new Date();
                    loadedEvents.push({
                        id: d.id,
                        title: `Refill: ${data.patientName || 'Patient'}`,
                        type: 'Follow-Up',
                        date: rDate,
                        time: rDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                        color: '#f59e0b' // Warning Orange
                    });
                });

                // Add some hardcoded operational schedule
                const mockOp = [
                    { id: 'm1', title: 'Consult: Arthur Pendragon', type: 'Consultation', date: new Date(), time: '09:00 AM', color: '#10b981' },
                    { id: 'm2', title: 'Peptide Protocol Review: Gwen Stacy', type: 'Protocol Review', date: new Date(), time: '10:30 AM', color: '#8b5cf6' },
                    { id: 'm3', title: 'Genetic Test Results: Bruce Banner', type: 'Genetic Test', date: new Date(), time: '14:00 PM', color: '#ec4899' },
                ];

                const allEvents = [...loadedEvents, ...mockOp].sort((a,b) => a.date - b.date);
                setEvents(allEvents);

                setKpis({
                    prescriptionsToday: rxToday + 2, // Mocking some extra
                    pendingFollowUps: refillSnap.size + 1,
                    testsDue: 3,
                    totalConsultations: 5
                });

            } catch (err) {
                console.error("Error loading clinical schedule:", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [activeDoctorId]);

    const handleAction = (action) => {
        toast.success(`${action} action triggered. Modal would open here.`);
    };

    const fabActions = [
        { icon: <Pill size={18} />, label: 'New Prescription', onClick: () => handleAction('New Prescription') },
        { icon: <Clock size={18} />, label: 'New Follow-Up', onClick: () => handleAction('New Follow-Up') },
        { icon: <Activity size={18} />, label: 'New Test', onClick: () => handleAction('New Test') },
        { icon: <HeartPulse size={18} />, label: 'New Protocol', onClick: () => handleAction('New Protocol') },
        { icon: <CalendarIcon size={18} />, label: 'New Appointment', onClick: () => handleAction('New Appointment') },
    ];

    // Subcomponents
    const renderKPIs = () => (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={styles.kpiCard} onClick={() => toast("Filtered by Prescriptions")}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{...styles.kpiIconBox, background: '#e0f2fe', color: '#0284c7'}}><Pill size={20} /></div>
                    <div>
                        <div style={styles.kpiValue}>{kpis.prescriptionsToday}</div>
                        <div style={styles.kpiLabel}>Today's Prescriptions</div>
                    </div>
                </div>
            </div>
            <div style={styles.kpiCard} onClick={() => toast("Filtered by Follow-Ups")}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{...styles.kpiIconBox, background: '#fef3c7', color: '#d97706'}}><Clock size={20} /></div>
                    <div>
                        <div style={styles.kpiValue}>{kpis.pendingFollowUps}</div>
                        <div style={styles.kpiLabel}>Pending Follow-Ups</div>
                    </div>
                </div>
            </div>
            <div style={styles.kpiCard} onClick={() => toast("Filtered by Tests")}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{...styles.kpiIconBox, background: '#fce7f3', color: '#db2777'}}><Activity size={20} /></div>
                    <div>
                        <div style={styles.kpiValue}>{kpis.testsDue}</div>
                        <div style={styles.kpiLabel}>Tests Due</div>
                    </div>
                </div>
            </div>
            <div style={styles.kpiCard} onClick={() => toast("Filtered by Consultations")}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{...styles.kpiIconBox, background: '#d1fae5', color: '#059669'}}><Users size={20} /></div>
                    <div>
                        <div style={styles.kpiValue}>{kpis.totalConsultations}</div>
                        <div style={styles.kpiLabel}>Clinical Consults</div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderCalendar = () => (
        <div style={{ ...styles.card, flex: isMobile ? 'none' : '0 0 65%' }}>
            <div style={{ ...styles.cardHeader, display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h3 style={styles.cardTitle}>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button style={styles.iconBtn} onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))}><ChevronLeft size={16} /></button>
                        <button style={styles.iconBtn} onClick={() => setCurrentDate(new Date())}>Today</button>
                        <button style={styles.iconBtn} onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))}><ChevronRight size={16} /></button>
                    </div>
                </div>
                {!isMobile && (
                    <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                        {['Day', 'Week', 'Month', 'Agenda'].map(v => (
                            <button key={v} onClick={() => setViewMode(v)} style={{ ...styles.toggleBtn, ...(viewMode === v ? styles.toggleBtnActive : {}) }}>
                                {v}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Calendar View Body based on viewMode */}
            <div style={{ padding: '16px', overflowX: 'auto' }}>
                {viewMode === 'Agenda' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {events.map((ev, eIdx) => (
                            <div key={eIdx} style={{ background: `${ev.color}10`, borderLeft: `4px solid ${ev.color}`, padding: '12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{ev.title}</div>
                                    <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>{ev.date.toLocaleDateString()} • {ev.type}</div>
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: ev.color, background: `${ev.color}20`, padding: '4px 12px', borderRadius: '12px' }}>
                                    {ev.time}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'Day' ? '80px 1fr' : '80px repeat(5, 1fr)', gap: '8px', minWidth: viewMode === 'Day' ? 'auto' : '600px' }}>
                        {/* Time Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', paddingTop: '40px', color: '#94a3b8', fontSize: '12px', textAlign: 'right', paddingRight: '12px' }}>
                            <span>09:00</span>
                            <span>10:00</span>
                            <span>11:00</span>
                            <span>12:00</span>
                            <span>13:00</span>
                            <span>14:00</span>
                            <span>15:00</span>
                            <span>16:00</span>
                        </div>
                        {/* Days */}
                        {(viewMode === 'Day' ? ['Today'] : ['Mon 12', 'Tue 13', 'Wed 14', 'Thu 15', 'Fri 16']).map((day, idx) => (
                            <div key={day} style={{ position: 'relative', borderLeft: '1px solid #e2e8f0', paddingLeft: '8px', minHeight: '400px' }}>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: (viewMode==='Day' || idx === 2) ? '#0ea5e9' : '#475569', marginBottom: '16px', textAlign: 'center' }}>
                                    {day}
                                </div>
                                
                                {/* Plot events for current day */}
                                {(viewMode === 'Day' || idx === 2) && events.map((ev, eIdx) => (
                                    <div key={eIdx} style={{ background: `${ev.color}15`, borderLeft: `3px solid ${ev.color}`, padding: '8px', borderRadius: '4px', marginBottom: '8px', fontSize: '11px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{ev.title}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                            <span style={{ color: '#64748b' }}>{ev.time}</span>
                                            <span style={{ background: ev.color, color: 'white', padding: '2px 6px', borderRadius: '10px', fontSize: '9px', fontWeight: 600 }}>{ev.type}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const renderAtlasRecommendations = () => (
        <div style={{ ...styles.card, border: '1px solid #cce8ff', background: '#f0f9ff' }}>
            <div style={{ ...styles.cardHeader, background: 'transparent', borderBottom: '1px solid #bae6fd' }}>
                <BrainCircuit size={16} color="#0284c7" />
                <h3 style={{ ...styles.cardTitle, color: '#0284c7' }}>Atlas Clinical Insights</h3>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={styles.insightAlert}>
                    <AlertTriangle size={14} color="#ea580c" style={{flexShrink: 0}} />
                    <span style={{ fontSize: '13px', color: '#9a3412', lineHeight: 1.4 }}><strong>2 Prescriptions</strong> expire this week. Automated follow-up suggested.</span>
                </div>
                <div style={styles.insightAlert}>
                    <CheckCircle2 size={14} color="#059669" style={{flexShrink: 0}} />
                    <span style={{ fontSize: '13px', color: '#065f46', lineHeight: 1.4 }}><strong>Gwen Stacy's</strong> genetic markers indicate high compatibility for current protocol.</span>
                </div>
                <button style={styles.btnAiAction}>Automate Follow-Ups</button>
            </div>
        </div>
    );

    const renderTodaysAgenda = () => (
        <div style={styles.card}>
            <div style={styles.cardHeader}>
                <CalendarIcon size={16} color="#475569" />
                <h3 style={styles.cardTitle}>Today's Agenda</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {events.slice(0,4).map((ev, i) => (
                    <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: ev.color, marginTop: '6px' }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{ev.title}</div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{ev.time} • {ev.type}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderFollowUpTasks = () => (
        <div style={styles.card}>
            <div style={styles.cardHeader}>
                <Clock size={16} color="#475569" />
                <h3 style={styles.cardTitle}>Follow-Up Tasks</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Review Lab Panel for Bruce Banner</span>
                    <span style={{ color: '#ef4444', fontWeight: 600 }}>Due</span>
                </div>
                <div style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9' }}>
                    <span>Patient check-in: Magenta Medical</span>
                    <span style={{ color: '#f59e0b', fontWeight: 600 }}>Tomorrow</span>
                </div>
            </div>
        </div>
    );

    const renderRightPanel = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: isMobile ? 'none' : '0 0 calc(35% - 24px)' }}>
            {renderAtlasRecommendations()}
            {renderTodaysAgenda()}
            {renderFollowUpTasks()}
        </div>
    );

    if (loading) {
        return (
            <div style={{ padding: '48px', display: 'flex', justifyContent: 'center', color: '#64748b' }}>
                <RefreshCw size={24} className="animate-spin" />
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <AdminPageHeader
                title="Clinical Operations Center"
                subtitle="AI-powered schedule, operational metrics, and protocol timelines."
                icon={CalendarIcon}
                iconBg="#f0f9ff"
                iconColor="#0ea5e9"
                actions={
                    !isMobile && (
                        <>
                            <button className="secondary-btn" onClick={() => toast.success('New Prescription')}><Pill size={16}/> Prescription</button>
                            <button className="primary-btn" onClick={() => toast.success('New Appointment')}><Plus size={16}/> Appointment</button>
                        </>
                    )
                }
            />

            {renderKPIs()}

            {isMobile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {renderTodaysAgenda()}
                    {renderAtlasRecommendations()}
                    <div>
                        <button 
                            onClick={() => setCalendarExpanded(!calendarExpanded)}
                            style={{ width: '100%', padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: 600, color: '#0f172a' }}
                        >
                            {calendarExpanded ? 'Hide Calendar' : 'Show Full Calendar'}
                        </button>
                        {calendarExpanded && <div style={{ marginTop: '16px' }}>{renderCalendar()}</div>}
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '24px' }}>
                    {renderCalendar()}
                    {renderRightPanel()}
                </div>
            )}

            {/* Mobile / Global FAB */}

        </div>
    );
}

const styles = {
  container: {
    padding: "24px",
    background: "#f8fafc",
    fontFamily: "Inter, Roboto, sans-serif",
    minHeight: '100vh',
    margin: '-1rem' // Override parent padding if needed to expand
  },
  header: {
    marginBottom: "24px"
  },
  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 700,
    color: "#0f172a"
  },
  subtitle: {
    margin: "4px 0 0 0",
    fontSize: "14px",
    color: "#64748b"
  },
  kpiCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "16px",
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
    transition: "transform 0.2s",
  },
  kpiIconBox: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  kpiValue: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#0f172a"
  },
  kpiLabel: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#64748b",
    textTransform: 'uppercase'
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
  },
  cardHeader: {
    borderBottom: "1px solid #f1f5f9",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  cardTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 700,
    color: "#0f172a"
  },
  iconBtn: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '4px 8px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#334155',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  },
  toggleBtn: {
    background: 'transparent',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#64748b',
    cursor: 'pointer'
  },
  toggleBtnActive: {
    background: '#fff',
    color: '#0f172a',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  insightAlert: {
    background: '#fff',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #bae6fd',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px'
  },
  btnAiAction: {
    width: '100%',
    padding: '10px',
    background: '#0284c7',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
    marginTop: '4px'
  }
};
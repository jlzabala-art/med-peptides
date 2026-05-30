import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Stethoscope, Activity, FileText, Bot, HeartPulse, ChevronRight, CheckCircle2, UserPlus, RefreshCw, Zap, ArrowRight, FlaskConical, Calendar, LayoutDashboard, Users, LogOut } from 'lucide-react';
import { Card, MetricCard, Button } from '../components/ui';
import AppPortalLayout from '../layout/AppPortalLayout';
import AdminTabErrorBoundary from '../components/admin/AdminTabErrorBoundary';
import { MessageSquare, Brain } from 'lucide-react';

const MessagingWidget = React.lazy(() => import('../components/messaging/MessagingWidget'));
const ClinicalAIWidget = React.lazy(() => import('../components/admin/ClinicalAIWidget'));

// ── Agents relevant to doctors ───────────────────────────────────────────────
const CLINICAL_AGENTS = [
  {
    key: 'rag',
    name: 'Research AI',
    emoji: '🧠',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
    desc: 'Scientific literature, mechanisms of action and general research inquiries.',
    model: 'gemini-2.5-flash',
    region: 'us-west1',
    prompt: 'I need research information about',
  },
  {
    key: 'prescription',
    name: 'Rx Analyzer',
    emoji: '📋',
    color: 'var(--color-primary)',
    bg: 'rgba(59,130,246,0.08)',
    desc: 'Medical prescription analysis, catalog matching and personalized compounds.',
    model: 'gemini-2.5-pro',
    region: 'europe-west1',
    prompt: 'Please analyze this prescription:',
  },
  {
    key: 'clinical_data',
    name: 'Clinical Data',
    emoji: '🔬',
    color: 'var(--color-success)',
    bg: 'rgba(16,185,129,0.08)',
    desc: 'Lab interpretation, biomarkers and protocol recommendations.',
    model: 'gemini-2.5-pro',
    region: 'europe-west1',
    prompt: 'Please analyze these lab results:',
  },
  {
    key: 'logistics',
    name: 'Logistics',
    emoji: '📦',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    desc: 'Stock inquiries, pricing, shipping times and order status.',
    model: 'gemini-2.0-flash-lite',
    region: 'europe-west1',
    prompt: 'I need help with an order or shipping inquiry:',
  },
];

// ── Quick actions para el doctor ─────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: 'Analyze labs',        icon: '🔬', prompt: 'Please analyze these lab results: ', color: 'var(--color-success)' },
  { label: 'Review prescription', icon: '📋', prompt: 'Please analyze this prescription: ',  color: 'var(--color-primary)' },
  { label: 'Find protocol',       icon: '🧬', prompt: 'Find me a protocol for: ',             color: '#8b5cf6' },
  { label: 'Check stock',         icon: '📦', prompt: 'Check stock availability for: ',        color: '#f59e0b' },
];

function openClinicalAI(query = '', displayText = '') {
  window.dispatchEvent(new CustomEvent('open-clinical-ai', {
    detail: { query, autoSend: Boolean(query), displayText },
  }));
}

// ── Agent card ─────────────────────────────────────────────────────────────────
function AgentCard({ agent, status }) {
  const isActive  = status === 'active';
  const isPending = status === 'pending';
  const statusColor = isActive ? 'var(--color-success)' : isPending ? '#f59e0b' : 'var(--color-danger)';
  const statusLabel = isActive ? 'Active' : isPending ? 'Pending' : 'Inactive';

  return (
    <Card
      onClick={() => isActive && openClinicalAI(agent.prompt, agent.name)}
      style={{
        cursor: isActive ? 'pointer' : 'default', transition: 'all 0.2s', padding: '1.4rem',
        borderLeft: `4px solid ${agent.color}`,
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        {/* Emoji icon */}
        <div style={{ width: 46, height: 46, borderRadius: '13px', flexShrink: 0,
          background: `linear-gradient(135deg, ${agent.color}cc, ${agent.color}88)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.35rem', boxShadow: `0 5px 14px ${agent.color}40` }}>
          {agent.emoji}
        </div>

        {/* Status badge */}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          padding: '0.22rem 0.6rem', borderRadius: '999px', fontSize: '0.67rem', fontWeight: 800,
          background: `${statusColor}12`, color: statusColor,
          border: `1px solid ${statusColor}25` }}>
          {isActive && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-success)',
            display: 'inline-block', animation: 'dotPulse 2s infinite' }} />}
          {statusLabel}
        </span>
      </div>

      <div>
        <h3 style={{ margin: '0.5rem 0 0.3rem', fontSize: '0.95rem', fontWeight: 900,
          color: isActive ? '#0f172a' : 'var(--color-text-tertiary)', letterSpacing: '-0.01em' }}>
          {agent.name}
        </h3>
        <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          {agent.desc}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: '0.6rem', borderTop: `1px solid ${isActive ? agent.color + '18' : '#f1f5f9'}` }}>
        <span style={{ fontSize: '0.63rem', color: 'var(--color-text-tertiary)', fontWeight: 700, fontFamily: 'monospace',
          background: 'rgba(0,0,0,0.04)', padding: '0.12rem 0.4rem', borderRadius: '4px' }}>
          {agent.model}
        </span>
        {isActive && (
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: agent.color,
            display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            Ask <ArrowRight size={10} />
          </span>
        )}
      </div>
    </Card>
  );
}
const DOCTOR_NAV_GROUPS = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    id: 'patients',
    label: 'Patient Care',
    items: [
      { id: 'my-patients', label: 'My Patients', icon: Users },
      { id: 'appointments', label: 'Appointments', icon: Calendar },
      { id: 'messages', label: 'Mensajes', icon: MessageSquare },
      { id: 'clinical-ai', label: 'Atlas Health', icon: Brain },
    ],
  },
  {
    id: 'clinical',
    label: 'Clinical Tools',
    items: [
      { id: 'protocols', label: 'Protocols', icon: FileText },
      { id: 'labs', label: 'Lab Results', icon: FlaskConical },
    ],
  }
];

// ── Main component ─────────────────────────────────────────────────────────
export default function DoctorHome() {
  const { user, userProfile, logout } = useAuth();
  const doctorId   = user?.uid;
  const doctorName = userProfile?.firstName
    ? `Dr. ${userProfile.firstName}`
    : user?.displayName?.split(' ')[0] || 'Dr.';

  const [activeTab, setActiveTab] = useState('dashboard');
  const [metrics, setMetrics]       = useState({ patients: 0, protocols: 0, pendingLabs: 2, appointments: 3 });
  const [agentStatuses, setAgentStatuses] = useState(
    Object.fromEntries(CLINICAL_AGENTS.map(a => [a.key, a.key === 'clinical_data' ? 'pending' : 'active']))
  );
  const [activeInput, setActiveInput] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');

  const activeCount = CLINICAL_AGENTS.filter(a => agentStatuses[a.key] === 'active').length;

  useEffect(() => {
    async function fetchAll() {
      if (!doctorId) return;
      try {
        // Patients
        const patSnap = await getDocs(
          query(collection(db, 'doctor_patient_relationships'), where('doctorId', '==', doctorId), where('status', '==', 'active'))
        );
        // Protocols
        let protosSnap = null;
        try {
          protosSnap = await getDocs(
            query(collection(db, 'doctor_recommendations'), where('doctorId', '==', doctorId))
          );
        } catch {}

        let allPatients = patSnap.docs.map(d => d.data());
        let allProtos = protosSnap ? protosSnap.docs.map(d => d.data()) : [];

        // Apply Time Filter
        if (timeFilter !== 'all') {
          const now = new Date();
          let cutoff = new Date();
          if (timeFilter === '1d') cutoff.setDate(now.getDate() - 1);
          else if (timeFilter === '7d') cutoff.setDate(now.getDate() - 7);
          else if (timeFilter === '30d') cutoff.setDate(now.getDate() - 30);
          else if (timeFilter === '90d') cutoff.setDate(now.getDate() - 90);

          const isAfterCutoff = (item) => {
            const val = item.createdAt || item.timestamp;
            if (!val) return true; // keep items without date
            const d = typeof val.toDate === 'function' ? val.toDate() : new Date(val);
            if (isNaN(d.getTime())) return true;
            return d >= cutoff;
          };

          allPatients = allPatients.filter(isAfterCutoff);
          allProtos = allProtos.filter(isAfterCutoff);
        }

        setMetrics(m => ({ ...m, patients: allPatients.length, protocols: allProtos.length }));

        // Agent statuses
        const agentSnap = await getDoc(doc(db, 'ai_config', 'agents'));
        if (agentSnap.exists()) {
          const data = agentSnap.data();
          setAgentStatuses(prev => {
            const next = { ...prev };
            for (const a of CLINICAL_AGENTS) if (data[a.key]?.status) next[a.key] = data[a.key].status;
            return next;
          });
        }
      } catch (err) {
        console.warn('[DoctorHome] fetch error:', err);
      }
    }
    fetchAll();
  }, [doctorId, timeFilter]);

  const handleQuickAI = (e) => {
    e.preventDefault();
    if (activeInput.trim()) openClinicalAI(activeInput);
  };

  const handleLogout = () => {
    logout?.();
    window.location.href = '/';
  };

  const renderDashboard = () => (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: '4rem' }}>
      {/* ── Welcome + Status Bar ── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.2rem)', fontWeight: 900, color: '#0f172a',
              margin: '0 0 0.35rem', letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Stethoscope size={28} color="var(--color-primary)" />
              Welcome, {doctorName}
            </h1>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '1rem', fontWeight: 500 }}>
              Your clinical intelligence hub. AI Agents ready to assist you.
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Time Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#5f6368' }}>TIME RANGE</label>
              <select 
                value={timeFilter} 
                onChange={(e) => setTimeFilter(e.target.value)}
                style={{ padding: '0.45rem', borderRadius: '4px', border: '1px solid #dadce0', fontSize: '0.8rem', backgroundColor: '#f8f9fa', outline: 'none' }}
              >
                <option value="1d">Today</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last Month</option>
                <option value="90d">Last 3 Months</option>
                <option value="all">All Time</option>
              </select>
            </div>

            {/* Agent live badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1.1rem', borderRadius: '999px',
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-success)',
                animation: 'dotPulse 2s infinite' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-success)' }}>
                {activeCount} active agent{activeCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Quick AI input bar */}
        <form onSubmit={handleQuickAI} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center',
          background: 'var(--color-bg-surface)', borderRadius: '14px', padding: '0.75rem 1rem',
          border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <Bot size={18} color="#8b5cf6" style={{ flexShrink: 0 }} />
          <input
            value={activeInput}
            onChange={e => setActiveInput(e.target.value)}
            placeholder="Ask the clinical AI... e.g. 'Analyze these biomarkers: IGF-1 380, GH 5.2'"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.88rem', color: '#0f172a',
              background: 'transparent', fontWeight: 500 }}
          />
          {/* Quick action pills */}
          <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
            {QUICK_ACTIONS.map(qa => (
              <button key={qa.label} type="button"
                onClick={() => openClinicalAI(qa.prompt, qa.label)}
                title={qa.label}
                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem',
                  padding: '0.35rem 0.65rem', borderRadius: '7px', border: 'none', cursor: 'pointer',
                  background: `${qa.color}10`, color: qa.color, fontSize: '0.68rem', fontWeight: 700,
                  whiteSpace: 'nowrap', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = `${qa.color}20`}
                onMouseLeave={e => e.currentTarget.style.background = `${qa.color}10`}
              >
                <span>{qa.icon}</span>
                <span className="rp-desktop-only">{qa.label}</span>
              </button>
            ))}
          </div>
          <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem',
            padding: '0.55rem 1.1rem', borderRadius: '9px', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            color: 'var(--color-bg-surface)', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>
            Ask
          </button>
        </form>
      </div>

      {/* ── KPI Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <MetricCard title="Active Patients"  value={metrics.patients}     icon={Users}       color="var(--color-primary)" subtitle="In follow-up" />
        <MetricCard title="Appointments Today" value={metrics.appointments} icon={Activity}    color="#0284c7" subtitle="Today's schedule" />
        <MetricCard title="Pending Labs"      value={metrics.pendingLabs}  icon={FlaskConical} color="var(--color-warning)" subtitle="Need review" />
        <MetricCard title="Active Protocols"  value={metrics.protocols}    icon={FileText}    color="var(--color-success)" subtitle="Issued" />
      </div>

      {/* ── Agent Mission Control ── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '1.1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(139,92,246,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={16} color="#8b5cf6" />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
              AI Clinical Agents
            </h2>
          </div>
          <button onClick={() => openClinicalAI()} style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            color: 'var(--color-bg-surface)', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
          }}>
            <Zap size={13} /> Open full assistant
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {CLINICAL_AGENTS.map(agent => (
            <AgentCard key={agent.key} agent={agent} status={agentStatuses[agent.key]} />
          ))}
        </div>

        {/* Routing note */}
        <div style={{ marginTop: '1rem', padding: '0.9rem 1.1rem', borderRadius: '12px',
          background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)',
          fontSize: '0.77rem', color: 'var(--color-text-secondary)', lineHeight: 1.6,
          display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1rem' }}>🔀</span>
          <span>
            <strong style={{ color: 'var(--color-text-primary)' }}>Automatic routing:</strong> the system detects the query type
            and routes it to the optimal agent. You can manually activate each agent by clicking its card.
          </span>
        </div>
      </div>
      <style>{`
        @keyframes dotPulse {
          0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
          70%  { box-shadow: 0 0 0 7px rgba(16,185,129,0); }
          100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }
      `}</style>
    </div>
  );

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'messages':
        return (
          <div style={{ height: 'calc(100vh - 80px)', margin: '-2rem' }}>
            <React.Suspense fallback={<div>Loading messaging...</div>}>
              <MessagingWidget />
            </React.Suspense>
          </div>
        );
      case 'clinical-ai':
        return (
          <div style={{ height: 'calc(100vh - 80px)', margin: '-2rem' }}>
            <React.Suspense fallback={<div>Loading Atlas Health AI...</div>}>
              <ClinicalAIWidget />
            </React.Suspense>
          </div>
        );
      default:
        return (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            <h2 style={{ marginBottom: '1rem' }}>Coming Soon</h2>
            <p>This module is under development.</p>
          </div>
        );
    }
  };

  return (
    <AppPortalLayout allowedRoles={['doctor', 'admin']}>
      <div style={{ padding: '2rem' }}>
        <AdminTabErrorBoundary tabId={activeTab} tabLabel={activeTab}>
          {renderTab()}
        </AdminTabErrorBoundary>
      </div>
    </AppPortalLayout>
  );
}

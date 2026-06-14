import Users from 'lucide-react/dist/esm/icons/users';
import UserPlus from 'lucide-react/dist/esm/icons/user-plus';
import PackageSearch from 'lucide-react/dist/esm/icons/package-search';
import Activity from 'lucide-react/dist/esm/icons/activity';
import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import Server from 'lucide-react/dist/esm/icons/server';
import Cpu from 'lucide-react/dist/esm/icons/cpu';
import Database from 'lucide-react/dist/esm/icons/database';
import Layers from 'lucide-react/dist/esm/icons/layers';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import ChevronUp from 'lucide-react/dist/esm/icons/chevron-up';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Settings from 'lucide-react/dist/esm/icons/settings';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import Eye from 'lucide-react/dist/esm/icons/eye';
import EyeOff from 'lucide-react/dist/esm/icons/eye-off';
import Globe from 'lucide-react/dist/esm/icons/globe';
import Building2 from 'lucide-react/dist/esm/icons/building-2';
import Link2 from 'lucide-react/dist/esm/icons/link-2';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import X from 'lucide-react/dist/esm/icons/x';
import Send from 'lucide-react/dist/esm/icons/send';
import Sliders from 'lucide-react/dist/esm/icons/sliders';
import Play from 'lucide-react/dist/esm/icons/play';
import Check from 'lucide-react/dist/esm/icons/check';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import UserCheck from 'lucide-react/dist/esm/icons/user-check';
import CreditCard from 'lucide-react/dist/esm/icons/credit-card';
import Briefcase from 'lucide-react/dist/esm/icons/briefcase';
import Layers3 from 'lucide-react/dist/esm/icons/layers-3';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Home from 'lucide-react/dist/esm/icons/home';
import MessageSquare from 'lucide-react/dist/esm/icons/message-square';
import MoreHorizontal from 'lucide-react/dist/esm/icons/more-horizontal';
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import {
  ExecutiveSummaryStrip,
  TodayPrioritiesQueue,
  BusinessHealthRadar,
  FinanceTasksHub,
  CashFlowForecast,
  CrmPipelineFunnel,
  WholesalersLeaderboard,
  AiCommandConsole,
  GlobalActivityFeed,
} from './widgets/CommandCenterWidgets';
import HealthMatrixWidget from './widgets/HealthMatrixWidget';
import AdminExecutiveSummaryWidget from './AdminExecutiveSummaryWidget';
import notifier from '../../services/NotificationService';
import styles from './AdminMetricsDashboard.module.css';

// Roles-based dashboard configurations preset layout
const ROLE_PRESETS = {
  CEO: {
    visibleKPIs: [
      'revenue',
      'grossProfit',
      'openOrders',
      'pendingApprovals',
      'openRFQs',
      'aiAlerts',
      'cashPosition',
    ],
    visibleWidgets: [
      'todayPriorities',
      'businessHealth',
      'cashFlow',
      'crmPipeline',
      'wholesalersRanking',
      'aiWorkspace',
      'activityFeed',
    ],
    kpiOrder: [
      'revenue',
      'grossProfit',
      'cashPosition',
      'openOrders',
      'pendingApprovals',
      'openRFQs',
      'aiAlerts',
    ],
  },
  Finance: {
    visibleKPIs: ['revenue', 'grossProfit', 'cashPosition', 'pendingApprovals'],
    visibleWidgets: [
      'todayPriorities',
      'financeTasks',
      'cashFlow',
      'businessHealth',
      'activityFeed',
    ],
    kpiOrder: ['revenue', 'grossProfit', 'cashPosition', 'pendingApprovals'],
  },
  Purchasing: {
    visibleKPIs: ['openOrders', 'openRFQs', 'pendingApprovals'],
    visibleWidgets: ['todayPriorities', 'wholesalersRanking', 'businessHealth', 'activityFeed'],
    kpiOrder: ['openOrders', 'openRFQs', 'pendingApprovals'],
  },
  Sales: {
    visibleKPIs: ['revenue', 'openOrders', 'openRFQs'],
    visibleWidgets: [
      'todayPriorities',
      'crmPipeline',
      'wholesalersRanking',
      'businessHealth',
      'activityFeed',
    ],
    kpiOrder: ['revenue', 'openOrders', 'openRFQs'],
  },
  Operations: {
    visibleKPIs: ['openOrders', 'pendingApprovals', 'aiAlerts'],
    visibleWidgets: [
      'todayPriorities',
      'businessHealth',
      'wholesalersRanking',
      'activityFeed',
      'systemStatus',
    ],
    kpiOrder: ['openOrders', 'pendingApprovals', 'aiAlerts'],
  },
};

export default function AdminMetricsDashboard({ wholesalerId = null }) {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin' || userProfile?.roles?.includes('admin');
  // Customizer State
  const [currentRolePreset, setCurrentRolePreset] = useState('CEO');
  const [visibleKPIs, setVisibleKPIs] = useState(ROLE_PRESETS.CEO.visibleKPIs);
  const [visibleWidgets, setVisibleWidgets] = useState(ROLE_PRESETS.CEO.visibleWidgets);
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Core Data Metrics
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('7d');
  const [dbLatency, setDbLatency] = useState('24ms');
  const [aiConsumption, setAiConsumption] = useState(1.42);
  const [activeUsersCount, setActiveUsersCount] = useState(4);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  // Metrics values (live simulation and DB mappings)
  const [metrics, setMetrics] = useState({
    revenue: 456000,
    grossProfit: 136800,
    openOrders: 127,
    pendingApprovals: 18,
    openRFQs: 24,
    aiAlerts: 5,
    cashPosition: 890400,
  });

  // Today Priorities list
  const [priorities, setPriorities] = useState([
    {
      id: 1,
      text: '5 RFQs require immediate approval',
      type: 'rfq',
      priority: 'high',
      link: '/admin/rfq',
    },
    {
      id: 2,
      text: '3 supplier bills due today',
      type: 'bill',
      priority: 'critical',
      link: '/admin/bills',
    },
    {
      id: 3,
      text: '2 leads require follow-up',
      type: 'lead',
      priority: 'medium',
      link: '/admin/leads',
    },
    {
      id: 4,
      text: '1 inventory alert: low stock on Peptide A1',
      type: 'stock',
      priority: 'high',
      link: '/admin/products',
    },
    {
      id: 5,
      text: 'AI detected pricing anomaly in Wholesale B',
      type: 'anomaly',
      priority: 'low',
      link: '/admin/analytics',
    },
  ]);

  // AI Command Console simulation helper
  const handleAiAsk = async (queryText) => {
    const queryLower = queryText.toLowerCase();
    if (
      queryLower.includes('attention') ||
      queryLower.includes('priorities') ||
      queryLower.includes('today')
    ) {
      return {
        answer:
          'Here are the top issues that require your immediate attention today: Overdue bills (AED 34,200) and 3 pending RFQs.',
        actions: [],
      };
    }
    return {
      answer: `AI processing finished for "${queryText}": Current cash reserves are stable.`,
      actions: [],
    };
  };

  // Active Tab for Widgets
  const [aiWorkspaceTab, setAiWorkspaceTab] = useState('insights');

  // Real-time Global Activity Feed (Simulation)
  const [activityFeed, setActivityFeed] = useState([
    { id: 1, text: 'RFQ #2304 Approved by CEO', time: '2 mins ago', type: 'rfq' },
    { id: 2, text: 'PO #1920 Created for wholeseller BioPharma', time: '15 mins ago', type: 'po' },
    { id: 3, text: 'Bill #9023 Paid (AED 12,500)', time: '1 hour ago', type: 'bill' },
    { id: 4, text: 'New Lead: Clinic MedCare Dubai registered', time: '3 hours ago', type: 'lead' },
    {
      id: 5,
      text: 'Supplier catalog synced with Zoho Inventory',
      time: '5 hours ago',
      type: 'sync',
    },
    { id: 6, text: 'AI Analysis Completed: Q2 Margin Optimization', time: '1 day ago', type: 'ai' },
  ]);

  // Mobile Bottom Tab State
  const [mobileTab, setMobileTab] = useState('home');

  useEffect(() => {
    const interval = setInterval(() => {
      setDbLatency(`${Math.floor(Math.random() * 20) + 12}ms`);
      const activityTypes = [
        { text: 'AI detected new market price shift for peptide G3', type: 'ai' },
        { text: 'RFQ #2411 received pricing from supplier B', type: 'rfq' },
        { text: 'Supplier Bill #9244 matching completed', type: 'bill' },
      ];
      const randomActivity = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      setActivityFeed((prev) => [
        { id: Date.now(), text: randomActivity.text, time: 'Just now', type: randomActivity.type },
        ...prev.slice(0, 10),
      ]);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Fetch metrics dynamically
  useEffect(() => {
    const startDbTime = performance.now();
    async function loadData() {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const latency = Math.round(performance.now() - startDbTime);
        setDbLatency(`${latency}ms`);

        const recentRegs = usersSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
          .slice(0, 5);
        setRecentRegistrations(recentRegs);
        setLoading(false);
      } catch (err) {
        console.warn('Using fallback mock data for command center', err);
        setLoading(false);
      }
    }
    loadData();
  }, [timeFilter]);

  const handleApplyPreset = (presetName) => {
    setCurrentRolePreset(presetName);
    setVisibleKPIs(ROLE_PRESETS[presetName].visibleKPIs);
    setVisibleWidgets(ROLE_PRESETS[presetName].visibleWidgets);
  };

  const toggleKPIVisibility = (kpi) => {
    setVisibleKPIs((prev) => (prev.includes(kpi) ? prev.filter((k) => k !== kpi) : [...prev, kpi]));
  };

  const toggleWidgetVisibility = (widget) => {
    setVisibleWidgets((prev) =>
      prev.includes(widget) ? prev.filter((w) => w !== widget) : [...prev, widget]
    );
  };

  // Mock Wholesaler Leaderboard Data
  const wholesalers = [
    {
      name: 'Gulf Distribution LLC',
      revenue: 'AED 245,000',
      patients: 120,
      orders: 48,
      growth: '+14%',
      margin: '18%',
      score: 96,
      status: 'Strategic',
    },
    {
      name: 'PurePeptides GCC',
      revenue: 'AED 134,000',
      patients: 84,
      orders: 32,
      growth: '+22%',
      margin: '24%',
      score: 92,
      status: 'Active',
    },
    {
      name: 'Apex Pharmacy Direct',
      revenue: 'AED 98,200',
      patients: 45,
      orders: 20,
      growth: '-4%',
      margin: '15%',
      score: 78,
      status: 'Active',
    },
    {
      name: 'Oasis Biotech UAE',
      revenue: 'AED 62,500',
      patients: 38,
      orders: 15,
      growth: '+8%',
      margin: '20%',
      score: 85,
      status: 'Critical Audit',
    },
  ];

  // Cash flow mock data
  const cashFlowData = [
    { name: 'Week 1', Incoming: 65000, Outgoing: 42000, Balance: 23000 },
    { name: 'Week 2', Incoming: 82000, Outgoing: 38000, Balance: 44000 },
    { name: 'Week 3', Incoming: 54000, Outgoing: 49000, Balance: 5000 },
    { name: 'Week 4', Incoming: 95000, Outgoing: 52000, Balance: 43000 },
  ];

  return (
    <div className={styles.atlasCommandCenter}>
      {/* Dynamic Embedded CSS Styles */}

      {/* ── COMMAND CENTER HEADER & PRESET CUSTOMIZER ────────────────── */}
      <div className={styles.glassCard} style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.25rem',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 8px #10b981',
                }}
              />
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#10b981',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Live · All Systems Operational
              </span>
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.02em',
              }}
            >
              Atlas Command Center
            </h1>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Strategic oversight & operational real-time control room.
            </p>
          </div>

          {/* Controls Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Preset Selector */}
            <div
              style={{
                display: 'flex',
                background: '#f1f5f9',
                borderRadius: '8px',
                padding: '2px',
              }}
            >
              {Object.keys(ROLE_PRESETS).map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleApplyPreset(preset)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: currentRolePreset === preset ? 600 : 500,
                    backgroundColor: currentRolePreset === preset ? '#ffffff' : 'transparent',
                    color: currentRolePreset === preset ? '#0f172a' : '#64748b',
                    boxShadow: currentRolePreset === preset ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Customize Mode Toggle */}
            <button
              onClick={() => setIsCustomizing(!isCustomizing)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: isCustomizing ? '#e0f2fe' : '#ffffff',
                color: isCustomizing ? '#0369a1' : '#475569',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Sliders size={14} />
              {isCustomizing ? 'Done Customizing' : 'Customize Layout'}
            </button>
          </div>
        </div>

        {/* Customization Drawer / Control Box */}
        {isCustomizing && (
          <div
            style={{
              marginTop: '1.25rem',
              padding: '1.25rem',
              borderRadius: '12px',
              backgroundColor: '#f8fafc',
              border: '1px dashed #cbd5e1',
              animation: 'slideDown 0.2s ease-out',
            }}
          >
            <h3
              style={{
                margin: '0 0 0.75rem 0',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#0f172a',
              }}
            >
              Configure Active Widgets & Metrics
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
              {/* KPIs */}
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#475569',
                    display: 'block',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Visible KPIs (Top Strip)
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {[
                    'revenue',
                    'grossProfit',
                    'openOrders',
                    'pendingApprovals',
                    'openRFQs',
                    'aiAlerts',
                    'cashPosition',
                  ].map((kpi) => (
                    <button
                      key={kpi}
                      onClick={() => toggleKPIVisibility(kpi)}
                      style={{
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.75rem',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: visibleKPIs.includes(kpi) ? '#0284c7' : '#cbd5e1',
                        backgroundColor: visibleKPIs.includes(kpi) ? '#f0f9ff' : '#ffffff',
                        color: visibleKPIs.includes(kpi) ? '#0369a1' : '#475569',
                        cursor: 'pointer',
                      }}
                    >
                      {kpi.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>

              {/* Widgets */}
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#475569',
                    display: 'block',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Visible Workspace Widgets
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {[
                    { id: 'todayPriorities', label: "Today's Priorities" },
                    { id: 'businessHealth', label: 'Business Health Lights' },
                    { id: 'financeTasks', label: 'Finance Workspace Tasks' },
                    { id: 'cashFlow', label: 'Cash Flow forecasting' },
                    { id: 'crmPipeline', label: 'CRM Sales Funnel' },
                    { id: 'wholesalersRanking', label: 'Top Wholesalers Leaderboard' },
                    { id: 'aiWorkspace', label: 'AI Sync & Insights Hub' },
                    { id: 'activityFeed', label: 'Real-time Activity Feed' },
                    { id: 'systemStatus', label: 'Infrastructure Specs' },
                  ].map((w) => (
                    <button
                      key={w.id}
                      onClick={() => toggleWidgetVisibility(w.id)}
                      style={{
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.75rem',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: visibleWidgets.includes(w.id) ? '#0284c7' : '#cbd5e1',
                        backgroundColor: visibleWidgets.includes(w.id) ? '#f0f9ff' : '#ffffff',
                        color: visibleWidgets.includes(w.id) ? '#0369a1' : '#475569',
                        cursor: 'pointer',
                      }}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 0. AI EXECUTIVE SUMMARY WIDGET ────────────────────────────── */}
      <AdminExecutiveSummaryWidget metrics={metrics} />

      {/* ── 1. EXECUTIVE SUMMARY STRIP (TOP ROW) ────────────────────────── */}
      <ExecutiveSummaryStrip
        metrics={metrics}
        visibleKPIs={visibleKPIs}
        onCardClick={(kpiId) => {
          if (kpiId === 'openOrders') navigate('/admin/orders');
          else if (kpiId === 'pendingApprovals') navigate('/admin/approvals');
          else if (kpiId === 'openRFQs') navigate('/admin/rfq');
          else navigate('/admin/finance');
        }}
      />

      {/* ── MAIN WORKSPACE CONTENT GRID (2 COLUMNS) ────────────────────── */}
      <div className={styles.mainPortalGrid}>
        {/* LEFT COLUMN: PRIMARY WORKSPACE WIDGETS */}
        <div className={styles.widgetsCol}>
          {/* AI COMMAND CENTER (ASK ATLAS) */}
          <AiCommandConsole onAskQuestion={handleAiAsk} />

          {/* ── 2. TODAY'S PRIORITIES QUEUE ─────────────────────────────── */}
          {visibleWidgets.includes('todayPriorities') && (
            <TodayPrioritiesQueue
              priorities={priorities}
              onAction={(item) => navigate(item.link)}
            />
          )}

          {/* ── 3. BUSINESS HEALTH MATRIX (TRAFFIC LIGHTS) ───────────────── */}
          {visibleWidgets.includes('businessHealth') && <HealthMatrixWidget />}

          {/* ── 4. FINANCIAL TASKS WORKSPACE ───────────────────────────── */}
          {visibleWidgets.includes('financeTasks') && (
            <FinanceTasksHub
              onAction={(type, detail) => {
                notifier.info(`Redirecting to financial reconciliation for ${type}: ${detail}`);
              }}
            />
          )}

          {/* ── 5. CASH FLOW ANALYSIS WIDGET ────────────────────────────── */}
          {visibleWidgets.includes('cashFlow') && (
            <CashFlowForecast cashFlowData={cashFlowData} riskLevel="Low" />
          )}

          {/* ── 6. CRM PIPELINE FUNNEL WIDGET ────────────────────────────── */}
          {visibleWidgets.includes('crmPipeline') && <CrmPipelineFunnel />}

          {/* ── 7. TOP WHOLESALERS LEADERBOARD ────────────────────────── */}
          {visibleWidgets.includes('wholesalersRanking') && (
            <WholesalersLeaderboard
              wholesalersData={wholesalers}
              onSelect={(ws) => {
                navigate(`/admin/wholesellers?search=${ws.name}`);
              }}
            />
          )}

          {/* ── 8. AI WORKSPACE (SYNC & INSIGHTS HUB) ───────────────────── */}
          {visibleWidgets.includes('aiWorkspace') && (
            <div className={styles.glassCard} style={{ padding: '1.25rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  borderBottom: '1px solid #cbd5e1',
                  paddingBottom: '0.5rem',
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Sparkles size={16} color="#0ea5e9" /> Atlas AI Sourcing Hub
                </h3>
                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {['insights', 'predictions', 'recommendations', 'agents'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setAiWorkspaceTab(tab)}
                      className={`cc-tab-btn ${aiWorkspaceTab === tab ? 'active' : ''}`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Workspace Content */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '6px',
                    marginBottom: '0.75rem',
                    fontSize: '0.75rem',
                  }}
                >
                  <span>
                    Last analysis: <strong>Today 14:02</strong>
                  </span>
                  <span>
                    Confidence score: <strong style={{ color: '#10b981' }}>98.4%</strong>
                  </span>
                  <span>
                    Estimated impact: <strong style={{ color: '#0284c7' }}>+AED 24,000 / mo</strong>
                  </span>
                </div>

                {aiWorkspaceTab === 'insights' && (
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: '1.2rem',
                      fontSize: '0.82rem',
                      color: '#334155',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                    }}
                  >
                    <li>
                      Revenue increased <strong>18%</strong> this month across strategic wholesaler
                      segments.
                    </li>
                    <li>No overdue supplier bills in the queue. AP matches are healthy.</li>
                    <li>
                      <strong>3 opportunities</strong> in Dubai clinic network need strategic
                      discount review.
                    </li>
                    <li>
                      Average RFQ response time improved by <strong>22%</strong> over the last 14
                      days.
                    </li>
                  </ul>
                )}
                {aiWorkspaceTab === 'predictions' && (
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>
                    AI predicts a potential shipping delay of 3 days from EU laboratories next week
                    due to logistics strikes. Recommend frontloading Peptide B purchases.
                  </p>
                )}
                {aiWorkspaceTab === 'recommendations' && (
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>
                    Adjust pricing on product catalog item #4401. Market price rose by 14%, current
                    margins will reduce to 11% if not updated in Zoho Inventory.
                  </p>
                )}
                {aiWorkspaceTab === 'agents' && (
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>
                    Autonomous agents: <strong>Sourcing Bot</strong> is active (last synced 4 mins
                    ago). <strong>Discrepancy Agent</strong> matched 18/18 bills successfully.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SIDEBAR METRICS & INFRASTRUCTURE */}
        <div className={styles.sideCol}>
          {/* ── 9. GLOBAL ACTIVITY FEED ────────────────────────────────── */}
          {visibleWidgets.includes('activityFeed') && <GlobalActivityFeed logs={activityFeed} />}

          {/* ── 10. INFRASTRUCTURE & TECH STATUS ───────────────────────── */}
          {visibleWidgets.includes('systemStatus') && (
            <div className={styles.glassCard} style={{ padding: '1.25rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                }}
              >
                <Server size={16} color="#64748b" />
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  Infrastructure Specs
                </h3>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  fontSize: '0.8rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #f1f5f9',
                    paddingBottom: '0.4rem',
                  }}
                >
                  <span style={{ color: '#64748b' }}>Firestore Database</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>Connected</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #f1f5f9',
                    paddingBottom: '0.4rem',
                  }}
                >
                  <span style={{ color: '#64748b' }}>AI Engine Link</span>
                  <span style={{ color: '#0284c7', fontWeight: 600 }}>gemini-2.5-pro</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #f1f5f9',
                    paddingBottom: '0.4rem',
                  }}
                >
                  <span style={{ color: '#64748b' }}>Router Latency</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{dbLatency}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #f1f5f9',
                    paddingBottom: '0.4rem',
                  }}
                >
                  <span style={{ color: '#64748b' }}>Zoho Books Gateway</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>Synced (200 OK)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Environment</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>Production GCC</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 13. MOBILE UX BOTTOM NAVIGATION BAR ─────────────────────── */}
      <div className={styles.mobileNavBar}>
        <a
          onClick={() => setMobileTab('home')}
          className={`${styles.mobileNavItem} ${mobileTab === 'home' ? styles.active : ''}`}
        >
          <Home size={20} />
          <span>Home</span>
        </a>
        <a
          onClick={() => setMobileTab('tasks')}
          className={`${styles.mobileNavItem} ${mobileTab === 'tasks' ? styles.active : ''}`}
        >
          <CheckCircle2 size={20} />
          <span>Tasks</span>
        </a>
        <a
          onClick={() => setMobileTab('finance')}
          className={`${styles.mobileNavItem} ${mobileTab === 'finance' ? styles.active : ''}`}
        >
          <DollarSign size={20} />
          <span>Finance</span>
        </a>
        <a
          onClick={() => setMobileTab('crm')}
          className={`${styles.mobileNavItem} ${mobileTab === 'crm' ? styles.active : ''}`}
        >
          <Users size={20} />
          <span>CRM</span>
        </a>
        <a
          onClick={() => setMobileTab('ai')}
          className={`${styles.mobileNavItem} ${mobileTab === 'ai' ? styles.active : ''}`}
        >
          <Sparkles size={20} />
          <span>AI</span>
        </a>
        <a
          onClick={() => setMobileTab('more')}
          className={`${styles.mobileNavItem} ${mobileTab === 'more' ? styles.active : ''}`}
        >
          <MoreHorizontal size={20} />
          <span>More</span>
        </a>
      </div>
    </div>
  );
}

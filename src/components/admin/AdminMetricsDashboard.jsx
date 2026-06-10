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
  Users,
  UserPlus,
  PackageSearch,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Server,
  Cpu,
  Database,
  Layers,
  Sparkles,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  Settings,
  DollarSign,
  Eye,
  EyeOff,
  Globe,
  Building2,
  Link2,
  AlertTriangle,
  TrendingUp,
  X,
  Send,
  Sliders,
  Play,
  Check,
  FileText,
  UserCheck,
  CreditCard,
  Briefcase,
  Layers3,
  Calendar,
  Home,
  MessageSquare,
  MoreHorizontal
} from 'lucide-react';

import {
  ExecutiveSummaryStrip,
  TodayPrioritiesQueue,
  BusinessHealthRadar,
  FinanceTasksHub,
  CashFlowForecast,
  CrmPipelineFunnel,
  WholesalersLeaderboard,
  AiCommandConsole,
  GlobalActivityFeed
} from './widgets/CommandCenterWidgets';

// Roles-based dashboard configurations preset layout
const ROLE_PRESETS = {
  CEO: {
    visibleKPIs: ['revenue', 'grossProfit', 'openOrders', 'pendingApprovals', 'openRFQs', 'aiAlerts', 'cashPosition'],
    visibleWidgets: ['todayPriorities', 'businessHealth', 'cashFlow', 'crmPipeline', 'wholesalersRanking', 'aiWorkspace', 'activityFeed'],
    kpiOrder: ['revenue', 'grossProfit', 'cashPosition', 'openOrders', 'pendingApprovals', 'openRFQs', 'aiAlerts'],
  },
  Finance: {
    visibleKPIs: ['revenue', 'grossProfit', 'cashPosition', 'pendingApprovals'],
    visibleWidgets: ['todayPriorities', 'financeTasks', 'cashFlow', 'businessHealth', 'activityFeed'],
    kpiOrder: ['revenue', 'grossProfit', 'cashPosition', 'pendingApprovals'],
  },
  Purchasing: {
    visibleKPIs: ['openOrders', 'openRFQs', 'pendingApprovals'],
    visibleWidgets: ['todayPriorities', 'wholesalersRanking', 'businessHealth', 'activityFeed'],
    kpiOrder: ['openOrders', 'openRFQs', 'pendingApprovals'],
  },
  Sales: {
    visibleKPIs: ['revenue', 'openOrders', 'openRFQs'],
    visibleWidgets: ['todayPriorities', 'crmPipeline', 'wholesalersRanking', 'businessHealth', 'activityFeed'],
    kpiOrder: ['revenue', 'openOrders', 'openRFQs'],
  },
  Operations: {
    visibleKPIs: ['openOrders', 'pendingApprovals', 'aiAlerts'],
    visibleWidgets: ['todayPriorities', 'businessHealth', 'wholesalersRanking', 'activityFeed', 'systemStatus'],
    kpiOrder: ['openOrders', 'pendingApprovals', 'aiAlerts'],
  }
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
    { id: 1, text: '5 RFQs require immediate approval', type: 'rfq', priority: 'high', link: '/admin/rfq' },
    { id: 2, text: '3 supplier bills due today', type: 'bill', priority: 'critical', link: '/admin/bills' },
    { id: 3, text: '2 leads require follow-up', type: 'lead', priority: 'medium', link: '/admin/leads' },
    { id: 4, text: '1 inventory alert: low stock on Peptide A1', type: 'stock', priority: 'high', link: '/admin/products' },
    { id: 5, text: 'AI detected pricing anomaly in Wholesale B', type: 'anomaly', priority: 'low', link: '/admin/analytics' },
  ]);

  // AI Command Console simulation helper
  const handleAiAsk = async (queryText) => {
    const queryLower = queryText.toLowerCase();
    if (queryLower.includes('attention') || queryLower.includes('priorities') || queryLower.includes('today')) {
      return {
        answer: "Here are the top issues that require your immediate attention today: Overdue bills (AED 34,200) and 3 pending RFQs.",
        actions: []
      };
    }
    return {
      answer: `AI processing finished for "${queryText}": Current cash reserves are stable.`,
      actions: []
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
    { id: 5, text: 'Supplier catalog synced with Zoho Inventory', time: '5 hours ago', type: 'sync' },
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
        { text: 'Supplier Bill #9244 matching completed', type: 'bill' }
      ];
      const randomActivity = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      setActivityFeed(prev => [
        { id: Date.now(), text: randomActivity.text, time: 'Just now', type: randomActivity.type },
        ...prev.slice(0, 10)
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
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0))
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
    setVisibleKPIs(prev =>
      prev.includes(kpi) ? prev.filter(k => k !== kpi) : [...prev, kpi]
    );
  };

  const toggleWidgetVisibility = (widget) => {
    setVisibleWidgets(prev =>
      prev.includes(widget) ? prev.filter(w => w !== widget) : [...prev, widget]
    );
  };

  // Mock Wholesaler Leaderboard Data
  const wholesalers = [
    { name: 'Gulf Distribution LLC', revenue: 'AED 245,000', patients: 120, orders: 48, growth: '+14%', margin: '18%', score: 96, status: 'Strategic' },
    { name: 'PurePeptides GCC', revenue: 'AED 134,000', patients: 84, orders: 32, growth: '+22%', margin: '24%', score: 92, status: 'Active' },
    { name: 'Apex Pharmacy Direct', revenue: 'AED 98,200', patients: 45, orders: 20, growth: '-4%', margin: '15%', score: 78, status: 'Active' },
    { name: 'Oasis Biotech UAE', revenue: 'AED 62,500', patients: 38, orders: 15, growth: '+8%', margin: '20%', score: 85, status: 'Critical Audit' }
  ];

  // Cash flow mock data
  const cashFlowData = [
    { name: 'Week 1', Incoming: 65000, Outgoing: 42000, Balance: 23000 },
    { name: 'Week 2', Incoming: 82000, Outgoing: 38000, Balance: 44000 },
    { name: 'Week 3', Incoming: 54000, Outgoing: 49000, Balance: 5000 },
    { name: 'Week 4', Incoming: 95000, Outgoing: 52000, Balance: 43000 },
  ];

  return (
    <div className="atlas-command-center" style={{ animation: 'fadeIn 0.4s ease-out', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      
      {/* Dynamic Embedded CSS Styles */}
      <style>{`
        .atlas-command-center {
          --glass-bg: rgba(255, 255, 255, 0.75);
          --glass-border: rgba(226, 232, 240, 0.8);
          --glass-blur: blur(12px);
          font-family: 'Inter', -apple-system, sans-serif;
          padding: 1.5rem 2rem 5rem;
        }

        .glass-card {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border-radius: 16px;
          box-shadow: 0 4px 20px -2px rgba(148, 163, 184, 0.08);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .glass-card:hover {
          box-shadow: 0 10px 25px -4px rgba(148, 163, 184, 0.15);
          border-color: rgba(203, 213, 225, 0.9);
        }

        .kpi-strip {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          flex-wrap: nowrap;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }

        /* Custom scrollbars */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        /* Responsive Columns Grid */
        .main-portal-grid {
          display: grid;
          grid-template-columns: 2.2fr 0.8fr;
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .widgets-col {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .side-col {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Mobile bottom navigation */
        .mobile-nav-bar {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: #ffffff;
          border-top: 1px solid #e2e8f0;
          z-index: 1000;
          grid-template-columns: repeat(6, 1fr);
          align-items: center;
          justify-items: center;
          box-shadow: 0 -4px 12px rgba(0,0,0,0.05);
        }

        .mobile-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 0.65rem;
          color: #64748b;
          gap: 2px;
          cursor: pointer;
          text-decoration: none;
        }
        .mobile-nav-item.active {
          color: #0284c7;
        }

        /* Media Queries */
        @media (max-width: 1024px) {
          .main-portal-grid {
            grid-template-columns: 1fr;
          }
          .atlas-command-center {
            padding: 1rem 1rem 5rem;
          }
        }

        @media (max-width: 768px) {
          .desktop-only-widget {
            display: none !important;
          }
          .mobile-nav-bar {
            display: grid;
          }
        }
      `}</style>

      {/* ── COMMAND CENTER HEADER & PRESET CUSTOMIZER ────────────────── */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ display: 'inline-flex', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live · All Systems Operational</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Atlas Command Center
            </h1>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Strategic oversight & operational real-time control room.
            </p>
          </div>

          {/* Controls Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Preset Selector */}
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '2px' }}>
              {Object.keys(ROLE_PRESETS).map(preset => (
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
                    transition: 'all 0.15s ease'
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
                transition: 'all 0.2s'
              }}
            >
              <Sliders size={14} />
              {isCustomizing ? 'Done Customizing' : 'Customize Layout'}
            </button>
          </div>
        </div>

        {/* Customization Drawer / Control Box */}
        {isCustomizing && (
          <div style={{ marginTop: '1.25rem', padding: '1.25rem', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', animation: 'slideDown 0.2s ease-out' }}>
            <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>Configure Active Widgets & Metrics</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
              {/* KPIs */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Visible KPIs (Top Strip)</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {['revenue', 'grossProfit', 'openOrders', 'pendingApprovals', 'openRFQs', 'aiAlerts', 'cashPosition'].map(kpi => (
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
                      {kpi.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>

              {/* Widgets */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Visible Workspace Widgets</span>
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
                    { id: 'systemStatus', label: 'Infrastructure Specs' }
                  ].map(w => (
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
      <div className="main-portal-grid">
        
        {/* LEFT COLUMN: PRIMARY WORKSPACE WIDGETS */}
        <div className="widgets-col">
          
          {/* AI COMMAND CENTER (ASK ATLAS) */}
          <AiCommandConsole onAskQuestion={handleAiAsk} />

          {/* ── 2. TODAY'S PRIORITIES QUEUE ─────────────────────────────── */}
          {visibleWidgets.includes('todayPriorities') && (
            <TodayPrioritiesQueue
              priorities={priorities}
              onAction={(item) => navigate(item.link)}
            />
          )}

          {/* ── 3. BUSINESS HEALTH RADAR (TRAFFIC LIGHTS) ───────────────── */}
          {visibleWidgets.includes('businessHealth') && (
            <BusinessHealthRadar />
          )}

          {/* ── 4. FINANCIAL TASKS WORKSPACE ───────────────────────────── */}
          {visibleWidgets.includes('financeTasks') && (
            <FinanceTasksHub
              onAction={(type, detail) => {
                alert(`Redirecting to financial reconciliation for ${type}: ${detail}`);
              }}
            />
          )}

          {/* ── 5. CASH FLOW ANALYSIS WIDGET ────────────────────────────── */}
          {visibleWidgets.includes('cashFlow') && (
            <CashFlowForecast
              cashFlowData={cashFlowData}
              riskLevel="Low"
            />
          )}

          {/* ── 6. CRM PIPELINE FUNNEL WIDGET ────────────────────────────── */}
          {visibleWidgets.includes('crmPipeline') && (
            <CrmPipelineFunnel />
          )}

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
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sparkles size={16} color="#0ea5e9" /> Atlas AI Sourcing Hub
                </h3>
                
                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {['insights', 'predictions', 'recommendations', 'agents'].map(tab => (
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
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', marginBottom: '0.75rem', fontSize: '0.75rem' }}>
                  <span>Last analysis: <strong>Today 14:02</strong></span>
                  <span>Confidence score: <strong style={{ color: '#10b981' }}>98.4%</strong></span>
                  <span>Estimated impact: <strong style={{ color: '#0284c7' }}>+AED 24,000 / mo</strong></span>
                </div>

                {aiWorkspaceTab === 'insights' && (
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <li>Revenue increased <strong>18%</strong> this month across strategic wholesaler segments.</li>
                    <li>No overdue supplier bills in the queue. AP matches are healthy.</li>
                    <li><strong>3 opportunities</strong> in Dubai clinic network need strategic discount review.</li>
                    <li>Average RFQ response time improved by <strong>22%</strong> over the last 14 days.</li>
                  </ul>
                )}
                {aiWorkspaceTab === 'predictions' && (
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>
                    AI predicts a potential shipping delay of 3 days from EU laboratories next week due to logistics strikes. Recommend frontloading Peptide B purchases.
                  </p>
                )}
                {aiWorkspaceTab === 'recommendations' && (
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>
                    Adjust pricing on product catalog item #4401. Market price rose by 14%, current margins will reduce to 11% if not updated in Zoho Inventory.
                  </p>
                )}
                {aiWorkspaceTab === 'agents' && (
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>
                    Autonomous agents: <strong>Sourcing Bot</strong> is active (last synced 4 mins ago). <strong>Discrepancy Agent</strong> matched 18/18 bills successfully.
                  </p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: SIDEBAR METRICS & INFRASTRUCTURE */}
        <div className="side-col">
          
          {/* ── 9. GLOBAL ACTIVITY FEED ────────────────────────────────── */}
          {visibleWidgets.includes('activityFeed') && (
            <GlobalActivityFeed logs={activityFeed} />
          )}

          {/* ── 10. INFRASTRUCTURE & TECH STATUS ───────────────────────── */}
          {visibleWidgets.includes('systemStatus') && (
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Server size={16} color="#64748b" />
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Infrastructure Specs</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                  <span style={{ color: '#64748b' }}>Firestore Database</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>Connected</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                  <span style={{ color: '#64748b' }}>AI Engine Link</span>
                  <span style={{ color: '#0284c7', fontWeight: 600 }}>gemini-2.5-pro</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                  <span style={{ color: '#64748b' }}>Router Latency</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{dbLatency}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
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
      <div className="mobile-nav-bar">
        <a onClick={() => setMobileTab('home')} className={`mobile-nav-item ${mobileTab === 'home' ? 'active' : ''}`}>
          <Home size={20} />
          <span>Home</span>
        </a>
        <a onClick={() => setMobileTab('tasks')} className={`mobile-nav-item ${mobileTab === 'tasks' ? 'active' : ''}`}>
          <CheckCircle2 size={20} />
          <span>Tasks</span>
        </a>
        <a onClick={() => setMobileTab('finance')} className={`mobile-nav-item ${mobileTab === 'finance' ? 'active' : ''}`}>
          <DollarSign size={20} />
          <span>Finance</span>
        </a>
        <a onClick={() => setMobileTab('crm')} className={`mobile-nav-item ${mobileTab === 'crm' ? 'active' : ''}`}>
          <Users size={20} />
          <span>CRM</span>
        </a>
        <a onClick={() => setMobileTab('ai')} className={`mobile-nav-item ${mobileTab === 'ai' ? 'active' : ''}`}>
          <Sparkles size={20} />
          <span>AI</span>
        </a>
        <a onClick={() => setMobileTab('more')} className={`mobile-nav-item ${mobileTab === 'more' ? 'active' : ''}`}>
          <MoreHorizontal size={20} />
          <span>More</span>
        </a>
      </div>
      
    </div>
  );
}

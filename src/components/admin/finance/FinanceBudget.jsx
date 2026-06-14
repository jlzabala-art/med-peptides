import Target from "lucide-react/dist/esm/icons/target";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import TrendingDown from "lucide-react/dist/esm/icons/trending-down";
import Download from "lucide-react/dist/esm/icons/download";
import PlusCircle from "lucide-react/dist/esm/icons/plus-circle";
import FileUp from "lucide-react/dist/esm/icons/file-up";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import ArrowUpRight from "lucide-react/dist/esm/icons/arrow-up-right";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import BadgePercent from "lucide-react/dist/esm/icons/badge-percent";
import Landmark from "lucide-react/dist/esm/icons/landmark";
import Check from "lucide-react/dist/esm/icons/check";
import X from "lucide-react/dist/esm/icons/x";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import Coins from "lucide-react/dist/esm/icons/coins";
import UserCheck from "lucide-react/dist/esm/icons/user-check";
import React, { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { usePreferences } from '../../../context/PreferencesContext';
import SkeletonLoader from '../../ui/SkeletonLoader';
import AnimatedNumber from '../../ui/AnimatedNumber';



















import { exportToCSV } from '../../../utils/exportUtils';
import { useToast } from '../../../hooks/useToast';

export default function FinanceBudget({ dashboardData }) {
  const { formatCurrency } = usePreferences();
  const { toast } = useToast();

  // Component local states
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedKpi, setSelectedKpi] = useState('all');
  const [timelinePeriod, setTimelinePeriod] = useState('Quarter');
  const [aiReportType, setAiReportType] = useState(null);
  const [aiReportText, setAiReportText] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [zohoSyncing, setZohoSyncing] = useState(false);
  const [zohoStatus, setZohoStatus] = useState({
    lastSync: '10 mins ago',
    pending: 3,
    failed: 0,
    connected: 'Atlas Books Live'
  });

  const [approvals, setApprovals] = useState([
    { id: 'app_1', type: 'Supplier Payment', detail: 'Regpept Peptides Delivery', amount: 18400, department: 'R&D', status: 'Pending' },
    { id: 'app_2', type: 'Travel Request', detail: 'Board Summit (Dubai)', amount: 3250, department: 'Management', status: 'Pending' },
    { id: 'app_3', type: 'Subscription', detail: 'Google Cloud AI Tokens', amount: 7252, department: 'Technology', status: 'Pending' },
    { id: 'app_4', type: 'Invoice Pay', detail: 'Lotusland Lab Samples', amount: 3100, department: 'Medical', status: 'Pending' }
  ]);

  // Handle mobile resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Budget Breakdown values
  const budgetMap = useMemo(() => {
    return {
      'Marketing': { budget: 25000, spent: 15400, trend: '+4%', color: '#3b82f6' },
      'R&D': { budget: 10000, spent: 8200, trend: '-2%', color: '#10b981' },
      'Software & Tech': { budget: 12000, spent: 12500, trend: '+18%', color: '#f59e0b' },
      'Operations': { budget: 8000, spent: 5400, trend: '+1%', color: '#8b5cf6' },
      'Travel': { budget: 5000, spent: 6300, trend: '+12%', color: '#ec4899' },
      'Consulting': { budget: 7000, spent: 4000, trend: '-5%', color: '#06b6d4' },
      'Regulatory': { budget: 15000, spent: 11800, trend: '+8%', color: '#a855f7' },
      'Logistics': { budget: 10000, spent: 9200, trend: '+3%', color: '#64748b' }
    };
  }, []);

  const pieData = Object.entries(budgetMap).map(([name, data]) => ({
    name,
    value: data.spent,
    color: data.color
  }));

  const totalSpent = Object.values(budgetMap).reduce((acc, curr) => acc + curr.spent, 0);
  const totalBudget = Object.values(budgetMap).reduce((acc, curr) => acc + curr.budget, 0);
  const totalPct = Math.round((totalSpent / totalBudget) * 100);
  const remainingBudget = totalBudget - totalSpent;

  // Timeline consumption data
  const timelineData = useMemo(() => {
    if (timelinePeriod === 'Month') {
      return [
        { name: 'May 1', budget: 15000, spent: 12500 },
        { name: 'May 8', budget: 15000, spent: 14800 },
        { name: 'May 15', budget: 15000, spent: 16100 },
        { name: 'May 22', budget: 15000, spent: 13900 }
      ];
    } else if (timelinePeriod === 'Year') {
      return [
        { name: '2023', budget: 120000, spent: 115000 },
        { name: '2024', budget: 140000, spent: 146000 },
        { name: '2025', budget: 160000, spent: 152000 },
        { name: '2026 (YTD)', budget: 180000, spent: 171152 }
      ];
    } else { // Quarter (Default)
      return [
        { name: 'Jan 26', budget: 15000, spent: 12400 },
        { name: 'Feb 26', budget: 15000, spent: 13900 },
        { name: 'Mar 26', budget: 15000, spent: 16500 },
        { name: 'Apr 26', budget: 15000, spent: 14200 },
        { name: 'May 26', budget: 15000, spent: 15800 },
        { name: 'Jun 26 (Proj)', budget: 15000, spent: 17350 }
      ];
    }
  }, [timelinePeriod]);

  // CFO Report Generator simulation
  const handleGenerateReport = (type) => {
    setGeneratingReport(true);
    setAiReportType(type);
    setTimeout(() => {
      setGeneratingReport(false);
      if (type === 'CFO') {
        setAiReportText(`ATLAS FINANCIAL HQ - EXECUTIVE CFO REPORT SUMMARY\nDate: June 10, 2026\n\n1. Consumición de Presupuesto: AED ${totalSpent.toLocaleString()} spent against AED ${totalBudget.toLocaleString()} limit (${totalPct}% utilized).\n2. Puntos Críticos: La desviación más severa se registra en Software & Tech (+18%) y Travel (+12%).\n3. Previsión: Se proyecta una desviación de gasto final de +AED 2,350 al cierre del trimestre si el burn rate semanal se mantiene en AED 3,250.\n4. Acción Recomendada: Pausar aprobaciones discrecionales en viajes de negocios y optimizar licencias no activas de SaaS.`);
      } else if (type === 'FORECAST') {
        setAiReportText(`PREDICTIVE BUDGET FORECAST MODEL\nPeriod: Q2-Q3 2026\n\n- Q2 Final Estimate: AED 47,350 total spent (AED 2,350 over budget).\n- Burn Rate Slope: Weekly trend remains slightly positive (+1.2% slope weekly).\n- Safety Runway: Current cash available guarantees 14.2 months of runway at the current burn pace.\n- Red Flag Categories: Travel expenses have exceeded the safety envelope and require immediate adjustment.`);
      } else if (type === 'SAVINGS') {
        setAiReportText(`COST OPTIMIZATION & SAVINGS REPORT\n\n1. SaaS Licenses Overlap: Identified AED 1,200 in redundant tech infrastructure licenses.\n2. Logistics Consolidations: Shipping batches from UAE freezones can save up to 8% in fuel surcharges.\n3. Vendor Negotiation: Re-routing peptide raw requests through main supplier Regpept under MOQ 100 offers a 12% margin upgrade.`);
      }
      toast.success('AI Report generated successfully!');
    }, 1200);
  };

  // Zoho sync handler
  const handleZohoSync = () => {
    setZohoSyncing(true);
    setTimeout(() => {
      setZohoSyncing(false);
      setZohoStatus({
        lastSync: 'Just now',
        pending: 0,
        failed: 0,
        connected: 'Atlas Books Live'
      });
      toast.success('Zoho Books records synchronized successfully!');
    }, 1500);
  };

  // Approval handlers
  const handleApproval = (id, action) => {
    setApprovals(prev => prev.filter(app => app.id !== id));
    toast.success(`Request ${action === 'approve' ? 'Approved' : 'Rejected'} successfully`);
  };

  const handleExportCSVFile = () => {
    const dataToExport = Object.entries(budgetMap).map(([cat, val]) => ({
      Category: cat,
      Budget: val.budget,
      Spent: val.spent,
      Remaining: val.budget - val.spent,
      Utilization: `${Math.round((val.spent / val.budget) * 100)}%`
    }));
    exportToCSV(dataToExport, 'financial_budget_report');
  };

  return (
    <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 11. Quick Actions Top Toolbar */}
      <div className="glass-card-premium" style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        gap: '1rem', 
        padding: '1rem 1.5rem', 
        background: 'var(--surface-raised)',
        borderRadius: '12px',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target style={{ width: '20px', height: '20px', color: 'var(--primary)' }} />
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>Financial Control Center</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button onClick={() => toast.info('Budget creator workspace under construction')} className="gcp-btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <PlusCircle size={14} /> Create Budget
          </button>
          <button onClick={() => toast.info('Import utility open')} className="gcp-btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FileUp size={14} /> Import Expenses
          </button>
          <button onClick={handleExportCSVFile} className="gcp-btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Download size={14} /> Export Report
          </button>
          <button onClick={() => handleGenerateReport('FORECAST')} className="gcp-btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <BarChart3 size={14} /> Forecast Quarter
          </button>
          <button onClick={() => handleGenerateReport('CFO')} className="gcp-btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', borderColor: 'var(--primary)' }}>
            <Sparkles size={14} /> Generate CFO Report
          </button>
        </div>
      </div>

      {/* 1. Executive Summary KPI Cards Header Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        {[
          { key: 'all', title: 'Budget Utilization', value: `${totalSpent.toLocaleString()} AED / ${totalBudget.toLocaleString()} AED`, sub: `${totalPct}% consumed`, icon: Landmark, color: 'var(--primary)', highlight: '#eff6ff' },
          { key: 'burn', title: 'Burn Rate', value: '3,250 AED', sub: 'Per week average', icon: TrendingDown, color: '#f59e0b', highlight: '#fef3c7' },
          { key: 'remaining', title: 'Remaining Budget', value: `${remainingBudget.toLocaleString()} AED`, sub: 'Available Q3 funds', icon: Coins, color: '#10b981', highlight: '#dcfce7' },
          { key: 'forecast', title: 'Forecast End of Q', value: '+2,350 AED', sub: 'Projected overspend', icon: ArrowUpRight, color: '#ef4444', highlight: '#fee2e2' },
          { key: 'cash', title: 'Cash Position', value: '180,000 AED', sub: 'Current liquidity', icon: Landmark, color: '#06b6d4', highlight: '#ecfeff' }
        ].map(kpi => {
          const Icon = kpi.icon;
          const isSelected = selectedKpi === kpi.key;
          return (
            <div
              key={kpi.key}
              onClick={() => setSelectedKpi(selectedKpi === kpi.key ? 'all' : kpi.key)}
              style={{
                backgroundColor: 'var(--surface)',
                padding: '1.25rem',
                borderRadius: '12px',
                border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                transform: isSelected ? 'translateY(-2px)' : 'none'
              }}
              onMouseEnter={e => { if(!isSelected) e.currentTarget.style.borderColor = 'var(--primary-light)'; }}
              onMouseLeave={e => { if(!isSelected) e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{kpi.title}</span>
                <div style={{ backgroundColor: kpi.highlight, color: kpi.color, padding: '6px', borderRadius: '8px' }}>
                  <Icon size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', wordBreak: 'break-all' }}>{kpi.value}</div>
              <div style={{ fontSize: '0.7rem', color: kpi.color, fontWeight: 700 }}>{kpi.sub}</div>
            </div>
          );
        })}
      </div>

      {/* 14. Responsive 12-Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, 1fr)',
        gap: '1.5rem'
      }}>

        {/* 2. Atlas AI Financial Advisor Card (Full width on top or 8 columns on desktop) */}
        <div style={{ gridColumn: isMobile ? '1' : 'span 8', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card-premium" style={{ padding: '1.5rem', border: '1px solid #bfdbfe', backgroundColor: '#fafcff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles style={{ width: '20px', height: '20px', color: '#2563eb' }} />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e3a8a' }}>Atlas AI Financial Advisor</h3>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 700, backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '12px' }}>Real-time diagnostics</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              {[
                { text: "Software costs are growing faster than revenue.", severity: 'Red', color: '#ef4444', bg: '#fef2f2' },
                { text: "Current burn rate will exceed budget in 17 days.", severity: 'Red', color: '#ef4444', bg: '#fef2f2' },
                { text: "Marketing spending increased 18% versus last month.", severity: 'Yellow', color: '#d97706', bg: '#fffbeb' },
                { text: "Travel expenses are trending above forecast.", severity: 'Yellow', color: '#d97706', bg: '#fffbeb' },
                { text: "R&D spending remains below planned allocation.", severity: 'Green', color: '#10b981', bg: '#f0fdf4' }
              ].map((insight, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  padding: '0.75rem', 
                  borderRadius: '8px', 
                  border: `1px solid ${insight.color}33`, 
                  backgroundColor: insight.bg,
                  fontSize: '0.8rem'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: insight.color
                  }} />
                  <span style={{ flex: 1, fontWeight: 500, color: 'var(--text-main)' }}>{insight.text}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: insight.color }}>{insight.severity}</span>
                </div>
              ))}
            </div>

            {/* AI Reports Output Panel */}
            {aiReportText ? (
              <div style={{ 
                backgroundColor: '#f8fafc', 
                border: '1px solid #cbd5e1', 
                borderRadius: '8px', 
                padding: '1rem', 
                fontSize: '0.8rem', 
                fontFamily: 'monospace', 
                whiteSpace: 'pre-wrap',
                position: 'relative',
                color: 'var(--text-main)',
                marginBottom: '1rem'
              }}>
                <button 
                  onClick={() => setAiReportText('')}
                  style={{ position: 'absolute', top: '8px', right: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  Clear
                </button>
                {aiReportText}
              </div>
            ) : null}

            {/* AI Fast Actions Summary */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => handleGenerateReport('CFO')} 
                disabled={generatingReport}
                className="btn btn-outline" 
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
              >
                {generatingReport && aiReportType === 'CFO' ? 'Analyzing...' : 'Generate Board Summary'}
              </button>
              <button 
                onClick={() => handleGenerateReport('SAVINGS')} 
                disabled={generatingReport}
                className="btn btn-outline" 
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
              >
                {generatingReport && aiReportType === 'SAVINGS' ? 'Calculating...' : 'Savings Opportunities'}
              </button>
            </div>
          </div>
        </div>

        {/* 10. Zoho Sync Widget (4 columns on desktop) */}
        <div style={{ gridColumn: isMobile ? '1' : 'span 4' }}>
          <div className="glass-card-premium" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>Zoho Integration</h3>
              <span style={{ 
                fontSize: '0.7rem', 
                fontWeight: 700, 
                color: '#16a34a', 
                backgroundColor: '#dcfce7', 
                padding: '2px 8px', 
                borderRadius: '12px' 
              }}>
                Connected
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Connected Account:</span>
                <strong style={{ color: 'var(--text-main)' }}>{zohoStatus.connected}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Last Sync Run:</span>
                <strong style={{ color: 'var(--text-main)' }}>{zohoStatus.lastSync}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Pending Records:</span>
                <strong style={{ color: zohoStatus.pending > 0 ? '#ea580c' : 'var(--text-main)' }}>{zohoStatus.pending}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Failed sync logs:</span>
                <strong style={{ color: zohoStatus.failed > 0 ? '#ef4444' : 'var(--text-main)' }}>{zohoStatus.failed}</strong>
              </div>
            </div>

            <button 
              onClick={handleZohoSync}
              disabled={zohoSyncing}
              className="btn btn-primary"
              style={{ 
                width: '100%', 
                fontSize: '0.75rem', 
                padding: '0.5rem', 
                marginTop: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={14} className={zohoSyncing ? 'animate-spin' : ''} />
              {zohoSyncing ? 'Syncing Zoho Books...' : 'Force Zoho Sync'}
            </button>
          </div>
        </div>

        {/* 3. Donut & Breakdown Table (8 columns on desktop) */}
        <div style={{ gridColumn: isMobile ? '1' : 'span 8' }}>
          <div className="glass-card-premium" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>Operating Budget Distribution</h3>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '1.5rem', alignItems: 'center' }}>
              {/* Donut Chart */}
              <div style={{ position: 'relative', width: isMobile ? '180px' : '220px', height: isMobile ? '180px' : '220px', flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%" 
                      innerRadius={60} 
                      outerRadius={85} 
                      paddingAngle={4}
                      dataKey="value"
                      stroke="rgba(0,0,0,0)"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>{totalPct}%</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Utilized</span>
                </div>
              </div>

              {/* Breakdown Table with progress bars */}
              <div style={{ flex: 1, width: '100%', overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '6px' }}>Category</th>
                      <th style={{ padding: '6px', textAlign: 'right' }}>Budget</th>
                      <th style={{ padding: '6px', textAlign: 'right' }}>Spent</th>
                      <th style={{ padding: '6px' }}>Utilization</th>
                      <th style={{ padding: '6px', textAlign: 'right' }}>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(budgetMap).map(([name, data]) => {
                      const pct = Math.round((data.spent / data.budget) * 100);
                      const isOver = data.spent > data.budget;
                      const filledBlocks = Math.round(pct / 10);
                      const barString = '█'.repeat(Math.min(filledBlocks, 10)) + '░'.repeat(Math.max(10 - filledBlocks, 0));
                      return (
                        <tr key={name} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '8px 6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: data.color }} />
                            {name}
                          </td>
                          <td style={{ padding: '8px 6px', textAlign: 'right' }}>{formatCurrency(data.budget)}</td>
                          <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(data.spent)}</td>
                          <td style={{ padding: '8px 6px', fontFamily: 'monospace' }}>
                            <span style={{ color: isOver ? '#ef4444' : data.color, fontWeight: 700 }}>{barString} {pct}%</span>
                          </td>
                          <td style={{ padding: '8px 6px', textAlign: 'right', color: isOver ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                            {data.trend}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Temporal Timeline Consumption (4 columns on desktop) */}
        <div style={{ gridColumn: isMobile ? '1' : 'span 4' }}>
          <div className="glass-card-premium" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>Consumption Timeline</h3>
              <div style={{ display: 'flex', gap: '4px', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
                {['Month', 'Quarter', 'Year'].map(p => (
                  <button
                    key={p}
                    onClick={() => setTimelinePeriod(p)}
                    style={{
                      padding: '2px 6px',
                      fontSize: '0.65rem',
                      border: 'none',
                      backgroundColor: timelinePeriod === p ? 'var(--primary-light)' : 'transparent',
                      color: timelinePeriod === p ? 'var(--primary)' : 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: '180px', width: '100%', marginTop: '0.5rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip />
                  <Bar dataKey="budget" fill="#cbd5e1" name="Budget" />
                  <Bar dataKey="spent" fill="var(--primary)" name="Spent" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', display: 'block', marginTop: 'auto' }}>
              Comparing target envelope against actual Zoho invoice entries
            </span>
          </div>
        </div>

        {/* 5. Cost Drivers (4 columns on desktop) */}
        <div style={{ gridColumn: isMobile ? '1' : 'span 4' }}>
          <div className="glass-card-premium" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>Top Expense Drivers</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { name: 'Google AI Tokens', cost: 7252, pct: 15 },
                { name: 'Lotusland Lab Samples', cost: 3100, pct: 6 },
                { name: 'Regulatory Costs', cost: 1800, pct: 4 },
                { name: 'Travel Expenses', cost: 950, pct: 2 },
                { name: 'Accountancy Audit', cost: 500, pct: 1 }
              ].map((driver, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                  <div>
                    <strong style={{ color: 'var(--text-main)' }}>{driver.name}</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{driver.pct}% of total spent</span>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{driver.cost.toLocaleString()} AED</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => toast.info('Navigating to expense driver details ledger')} 
              className="btn btn-outline" 
              style={{ width: '100%', fontSize: '0.75rem', padding: '0.4rem', marginTop: '0.5rem' }}
            >
              View Full Cost Ledger
            </button>
          </div>
        </div>

        {/* 6. Departmental View (4 columns on desktop) */}
        <div style={{ gridColumn: isMobile ? '1' : 'span 4' }}>
          <div className="glass-card-premium" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>Spending by Department</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto', fontSize: '0.75rem' }}>
              {[
                { name: 'R&D', spent: 8200, budget: 10000 },
                { name: 'Marketing', spent: 15400, budget: 25000 },
                { name: 'Medical', spent: 3100, budget: 5000 },
                { name: 'Operations', spent: 5400, budget: 8000 },
                { name: 'Technology', spent: 12500, budget: 12000 },
                { name: 'Finance', spent: 4000, budget: 7000 },
                { name: 'Regulatory', spent: 11800, budget: 15000 }
              ].map(dept => {
                const varAmount = dept.spent - dept.budget;
                const isOver = varAmount > 0;
                return (
                  <div key={dept.name} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{dept.name}</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: 'var(--text-main)' }}>{dept.spent.toLocaleString()} / {dept.budget.toLocaleString()}</span>
                      <span style={{ fontSize: '0.7rem', color: isOver ? '#ef4444' : '#10b981', display: 'block', fontWeight: 700 }}>
                        {isOver ? `+${varAmount.toLocaleString()}` : varAmount.toLocaleString()} AED
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 7. Variance Analysis & 8. Cash Flow net positions (4 columns on desktop) */}
        <div style={{ gridColumn: isMobile ? '1' : 'span 4', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Budget Variance */}
          <div className="glass-card-premium" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>Budget Variance</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-main)' }}>Technology Department</span>
                <span style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>+15% Over Budget</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-main)' }}>R&D Department</span>
                <span style={{ color: '#10b981', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>-10% Under Budget</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-main)' }}>Operations Department</span>
                <span style={{ color: '#ea580c', backgroundColor: '#fef3c7', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>+2% Within Target</span>
              </div>
            </div>
          </div>

          {/* Cash Flow Panel */}
          <div className="glass-card-premium" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>Cash Flow Status</h3>
              <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>Net Positive</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.75rem', textAlign: 'center' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '6px', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Incoming</span>
                <strong style={{ color: '#10b981' }}>+45,000</strong>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '6px', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Outgoing</span>
                <strong style={{ color: '#ef4444' }}>-36,100</strong>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '6px', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Net Pos</span>
                <strong style={{ color: 'var(--primary)' }}>+8,900</strong>
              </div>
            </div>
          </div>
        </div>

        {/* 9. Expense Approvals (8 columns on desktop) */}
        <div style={{ gridColumn: isMobile ? '1' : 'span 8' }}>
          <div className="glass-card-premium" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserCheck size={18} color="var(--primary)" />
                Pending Expense Approvals
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{approvals.length} pending review</span>
            </div>

            {approvals.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                🎉 No pending expenses or invoices require approvals!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {approvals.map(app => (
                  <div key={app.id} style={{ 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between', 
                    alignItems: isMobile ? 'flex-start' : 'center', 
                    padding: '0.75rem 1rem', 
                    backgroundColor: 'var(--surface-raised)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '8px',
                    gap: '0.75rem'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ 
                          fontSize: '0.65rem', 
                          fontWeight: 700, 
                          color: 'var(--primary)', 
                          backgroundColor: 'var(--primary-light)', 
                          padding: '1px 6px', 
                          borderRadius: '4px' 
                        }}>{app.type}</span>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{app.detail}</strong>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                        Dept: {app.department} | Request ID: {app.id}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: isMobile ? '100%' : 'auto', justifyContent: 'space-between' }}>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)', minWidth: '90px', textAlign: 'right' }}>
                        {app.amount.toLocaleString()} AED
                      </strong>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button 
                          onClick={() => handleApproval(app.id, 'approve')}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.7rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}
                        >
                          <Check size={12} /> Approve
                        </button>
                        <button 
                          onClick={() => handleApproval(app.id, 'reject')}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.7rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}
                        >
                          <X size={12} /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
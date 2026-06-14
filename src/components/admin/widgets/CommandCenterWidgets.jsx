import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import Briefcase from "lucide-react/dist/esm/icons/briefcase";
import Server from "lucide-react/dist/esm/icons/server";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Users from "lucide-react/dist/esm/icons/users";
import Send from "lucide-react/dist/esm/icons/send";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import MoreHorizontal from "lucide-react/dist/esm/icons/more-horizontal";
import React, { useState } from 'react';











import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// ── Shared styling block inject ──
export function WidgetStyles() {
  return (
    <style>{`
      .cc-widget-card {
        background: rgba(255, 255, 255, 0.75);
        border: 1px solid rgba(226, 232, 240, 0.8);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-radius: 16px;
        box-shadow: 0 4px 20px -2px rgba(148, 163, 184, 0.08);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        padding: 1.25rem;
      }
      .cc-widget-card:hover {
        box-shadow: 0 10px 25px -4px rgba(148, 163, 184, 0.15);
        border-color: rgba(203, 213, 225, 0.9);
      }
      .cc-kpi-card {
        flex: 1;
        min-width: 145px;
        padding: 1rem 1.25rem;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        transition: all 0.2s ease;
        border-left: 4px solid transparent;
      }
      .cc-kpi-card:hover {
        background: #ffffff;
        transform: translateY(-2px);
      }
      .cc-health-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
      }
      .cc-dot-green { background-color: #10b981; box-shadow: 0 0 8px #10b981; }
      .cc-dot-yellow { background-color: #f59e0b; box-shadow: 0 0 8px #f59e0b; }
      .cc-dot-red { background-color: #ef4444; box-shadow: 0 0 8px #ef4444; }
      .cc-tab-btn {
        padding: 0.4rem 0.8rem;
        font-size: 0.78rem;
        font-weight: 500;
        color: #64748b;
        border-bottom: 2px solid transparent;
        background: none;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
      }
      .cc-tab-btn.active {
        color: #0284c7;
        border-bottom-color: #0284c7;
        font-weight: 600;
      }
    `}</style>
  );
}

// 1. EXECUTIVE SUMMARY STRIP
export function ExecutiveSummaryStrip({ metrics = {}, visibleKPIs = [], onCardClick }) {
  const kpis = [
    { id: 'revenue', label: 'Revenue', value: `AED ${metrics.revenue?.toLocaleString() || '0'}`, trend: '+18.4% vs LM', trendUp: true },
    { id: 'grossProfit', label: 'Gross Profit', value: `AED ${metrics.grossProfit?.toLocaleString() || '0'}`, trend: 'Avg. margin 30%', trendUp: null },
    { id: 'cashPosition', label: 'Cash Position', value: `AED ${metrics.cashPosition?.toLocaleString() || '0'}`, trend: 'Optimal Reserve', trendUp: true },
    { id: 'openOrders', label: 'Open Orders', value: metrics.openOrders || 0, trend: '12 delayed shipment', trendUp: false },
    { id: 'pendingApprovals', label: 'Pending Approvals', value: metrics.pendingApprovals || 0, trend: 'Requires Action', trendUp: false, alert: true },
    { id: 'openRFQs', label: 'Open RFQs', value: metrics.openRFQs || 0, trend: 'Awaiting pricing: 7', trendUp: null },
    { id: 'aiAlerts', label: 'AI Alerts', value: metrics.aiAlerts || 0, trend: 'Pricing anomalies', trendUp: false, alert: true }
  ];

  return (
    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '0.5rem' }}>
      <WidgetStyles />
      {kpis.filter(k => visibleKPIs.length === 0 || visibleKPIs.includes(k.id)).map(k => (
        <div 
          key={k.id} 
          className="cc-widget-card cc-kpi-card" 
          style={{ borderLeftColor: k.alert ? '#ef4444' : '#0284c7' }}
          onClick={() => onCardClick && onCardClick(k.id)}
        >
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k.label}</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: k.alert ? '#ef4444' : '#0f172a', letterSpacing: '-0.02em' }}>{k.value}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: k.trendUp ? '#10b981' : k.trendUp === false ? '#ef4444' : '#64748b', fontWeight: 600 }}>
            {k.trendUp && <TrendingUp size={10} />}
            {k.trend}
          </div>
        </div>
      ))}
    </div>
  );
}

// 2. TODAY'S PRIORITIES QUEUE
export function TodayPrioritiesQueue({ priorities = [], onAction }) {
  return (
    <div className="cc-widget-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={16} color="#ef4444" />
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Today's Priorities Queue</h3>
        </div>
        <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>Auto-generated by Atlas AI</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {priorities.map(item => (
          <div
            key={item.id}
            onClick={() => onAction && onAction(item)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              borderLeft: '4px solid',
              borderLeftColor: item.priority === 'critical' ? '#ef4444' : item.priority === 'high' ? '#f59e0b' : '#0284c7',
              cursor: 'pointer',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '0.15rem 0.4rem',
                borderRadius: '4px',
                backgroundColor: item.priority === 'critical' ? '#fef2f2' : item.priority === 'high' ? '#fffbeb' : '#f0f9ff',
                color: item.priority === 'critical' ? '#ef4444' : item.priority === 'high' ? '#b45309' : '#0284c7'
              }}>
                {item.priority}
              </span>
              <span style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 500 }}>{item.text}</span>
            </div>
            <ArrowRight size={14} color="#94a3b8" />
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. BUSINESS HEALTH RADAR (TRAFFIC LIGHTS)
export function BusinessHealthRadar({ statusData = [] }) {
  const defaultStatus = [
    { label: 'Sales Network', state: 'green', desc: 'Quota hit' },
    { label: 'Procurement', state: 'green', desc: 'Optimal lead time' },
    { label: 'Inventory Stk', state: 'yellow', desc: '3 SKUs running low' },
    { label: 'Cash Flow', state: 'green', desc: 'AED 890k reserves' },
    { label: 'B2B CRM Leads', state: 'green', desc: '14 new leads' },
    { label: 'Ops Dispatch', state: 'yellow', desc: 'Courier delayed' },
    { label: 'AI Sourcing', state: 'green', desc: '100% matched' }
  ];
  const items = statusData.length > 0 ? statusData : defaultStatus;

  return (
    <div className="cc-widget-card">
      <h3 style={{ margin: '0 0 0.85rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Business Health Diagnostic</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem' }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyNavigation: 'space-between', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>{item.label}</span>
              <span className={`cc-health-dot cc-dot-${item.state}`} />
            </div>
            <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{item.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 4. FINANCIAL TASKS HUB
export function FinanceTasksHub({ onAction }) {
  const [financeTab, setFinanceTab] = useState('commissions');
  return (
    <div className="cc-widget-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Briefcase size={16} color="#0ea5e9" /> Financial Tasks Hub
        </h3>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {['commissions', 'bills', 'approvals', 'payroll'].map(tab => (
            <button
              key={tab}
              onClick={() => setFinanceTab(tab)}
              className={`cc-tab-btn ${financeTab === tab ? 'active' : ''}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ minHeight: '140px' }}>
        {financeTab === 'commissions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: '#ffffff', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Dr. Alejandro Gomez</span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Mayo 2026</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>AED 12,500</span>
              <button onClick={() => onAction && onAction('commission', 'Gomez')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', color: '#0284c7', background: '#f0f9ff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Pay</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: '#ffffff', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Dra. María Sánchez</span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Mayo 2026</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>AED 34,000</span>
              <button onClick={() => onAction && onAction('commission', 'Sánchez')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', color: '#0284c7', background: '#f0f9ff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Pay</button>
            </div>
          </div>
        )}
        {financeTab === 'bills' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: '#ffffff', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Biopharma Ltd (PO #1809)</span>
              <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 500 }}>Due Today</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>AED 18,200</span>
            </div>
          </div>
        )}
        {financeTab === 'approvals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: '#ffffff', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Purchase Order (PO #2010)</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>AED 120,000</span>
              <button onClick={() => onAction && onAction('po', 'PO-2010')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', color: '#22c55e', background: '#f0fdf4', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Approve</button>
            </div>
          </div>
        )}
        {financeTab === 'payroll' && (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
            Next payroll verification complete. Disbursement scheduled for 25th of month.
          </div>
        )}
      </div>
    </div>
  );
}

// 5. CASH FLOW FORECAST
export function CashFlowForecast({ cashFlowData = [], riskLevel = 'Low' }) {
  const defaultData = [
    { name: 'Week 1', Incoming: 65000, Outgoing: 42000, Balance: 23000 },
    { name: 'Week 2', Incoming: 82000, Outgoing: 38000, Balance: 44000 },
    { name: 'Week 3', Incoming: 54000, Outgoing: 49000, Balance: 5000 },
    { name: 'Week 4', Incoming: 95000, Outgoing: 52000, Balance: 43000 },
  ];
  const data = cashFlowData.length > 0 ? cashFlowData : defaultData;

  return (
    <div className="cc-widget-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Cash Flow Forecast &amp; Reserves</h3>
        <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '6px', backgroundColor: '#ecfdf5', color: '#059669', fontWeight: 600 }}>Risk Level: {riskLevel}</span>
      </div>
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="widgetIn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="widgetOut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" fontSize={11} stroke="#64748b" />
            <YAxis fontSize={11} stroke="#64748b" />
            <Tooltip />
            <Area type="monotone" dataKey="Incoming" stroke="#0284c7" fillOpacity={1} fill="url(#widgetIn)" strokeWidth={2} />
            <Area type="monotone" dataKey="Outgoing" stroke="#ef4444" fillOpacity={1} fill="url(#widgetOut)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// 6. CRM PIPELINE FUNNEL
export function CrmPipelineFunnel({ pipelineStages = [] }) {
  const defaultStages = [
    { stage: 'Leads', count: 24, val: 'AED 45,000', width: '100%', color: '#38bdf8' },
    { stage: 'Opportunities', count: 18, val: 'AED 120,000', width: '82%', color: '#0ea5e9' },
    { stage: 'RFQs Sent', count: 12, val: 'AED 380,000', width: '60%', color: '#0284c7' },
    { stage: 'Quotations Sent', count: 9, val: 'AED 290,000', width: '45%', color: '#0369a1' },
    { stage: 'Won / Conversions', count: 42, val: 'AED 845,000', width: '30%', color: '#10b981' }
  ];
  const items = pipelineStages.length > 0 ? pipelineStages : defaultStages;

  return (
    <div className="cc-widget-card">
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>CRM Pipeline B2B Funnel</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {items.map((stage, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ width: '120px', fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>{stage.stage}</span>
            <div style={{ flex: 1, height: '24px', backgroundColor: '#f1f5f9', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
              <div style={{ width: stage.width, height: '100%', backgroundColor: stage.color, borderRadius: '6px' }} />
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', fontWeight: 700, color: '#ffffff' }}>
                {stage.count} items ({stage.val})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 7. TOP WHOLESALERS LEADERBOARD
export function WholesalersLeaderboard({ wholesalersData = [], onSelect }) {
  const defaultWs = [
    { name: 'Gulf Distribution LLC', revenue: 'AED 245,000', patients: 120, orders: 48, growth: '+14%', margin: '18%', score: 96 },
    { name: 'PurePeptides GCC', revenue: 'AED 134,000', patients: 84, orders: 32, growth: '+22%', margin: '24%', score: 92 }
  ];
  const list = wholesalersData.length > 0 ? wholesalersData : defaultWs;

  return (
    <div className="cc-widget-card">
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Top Wholesalers Leaderboard</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
              <th style={{ padding: '0.5rem', color: '#64748b' }}>Wholesaler</th>
              <th style={{ padding: '0.5rem', color: '#64748b' }}>Revenue</th>
              <th style={{ padding: '0.5rem', color: '#64748b' }}>Patients</th>
              <th style={{ padding: '0.5rem', color: '#64748b' }}>Orders</th>
              <th style={{ padding: '0.5rem', color: '#64748b' }}>Growth</th>
              <th style={{ padding: '0.5rem', color: '#64748b' }}>Margin</th>
              <th style={{ padding: '0.5rem', color: '#64748b' }}>AI Score</th>
            </tr>
          </thead>
          <tbody>
            {list.map((ws, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', cursor: onSelect ? 'pointer' : 'default' }} onClick={() => onSelect && onSelect(ws)}>
                <td style={{ padding: '0.65rem 0.5rem', fontWeight: 600 }}>{ws.name}</td>
                <td style={{ padding: '0.65rem 0.5rem' }}>{ws.revenue}</td>
                <td style={{ padding: '0.65rem 0.5rem' }}>{ws.patients}</td>
                <td style={{ padding: '0.65rem 0.5rem' }}>{ws.orders}</td>
                <td style={{ padding: '0.65rem 0.5rem', color: ws.growth?.startsWith('+') ? '#10b981' : '#ef4444', fontWeight: 600 }}>{ws.growth}</td>
                <td style={{ padding: '0.65rem 0.5rem' }}>{ws.margin}</td>
                <td style={{ padding: '0.65rem 0.5rem' }}>
                  <span style={{
                    padding: '0.2rem 0.4rem',
                    borderRadius: '4px',
                    fontWeight: 700,
                    backgroundColor: ws.score > 90 ? '#ecfdf5' : '#fffbeb',
                    color: ws.score > 90 ? '#047857' : '#b45309'
                  }}>
                    {ws.score}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 8. AI COMMAND CONSOLE
export function AiCommandConsole({ onAskQuestion }) {
  const [queryVal, setQueryVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!queryVal.trim()) return;
    setLoading(true);

    if (onAskQuestion) {
      onAskQuestion(queryVal).then(res => {
        setReply(res);
        setLoading(false);
      });
    } else {
      setTimeout(() => {
        setReply({
          answer: `Here is the operational query summary: 3 pending commissions found. Cash flow remains positive.`,
          actions: []
        });
        setLoading(false);
      }, 700);
    }
  };

  return (
    <div className="cc-widget-card" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 249, 255, 0.9) 100%)', border: '1px solid #bae6fd' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Sparkles size={18} color="#0284c7" />
        <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Ask Atlas AI Command Console</h2>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={queryVal}
          onChange={(e) => setQueryVal(e.target.value)}
          placeholder='Type: "What requires my attention today?"...'
          style={{
            flex: 1,
            padding: '0.65rem 1rem',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            fontSize: '0.85rem',
            outline: 'none',
            backgroundColor: '#ffffff'
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: '#0284c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '0 1.25rem',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          {loading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
          Ask
        </button>
      </form>

      {reply && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
          <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>{reply.answer}</p>
        </div>
      )}
    </div>
  );
}

// 9. GLOBAL ACTIVITY FEED
export function GlobalActivityFeed({ logs = [] }) {
  const defaultLogs = [
    { id: 1, text: 'RFQ #2304 Approved by CEO', time: '2 mins ago', type: 'rfq' },
    { id: 2, text: 'PO #1920 Created for wholeseller BioPharma', time: '15 mins ago', type: 'po' },
    { id: 3, text: 'Bill #9023 Paid (AED 12,500)', time: '1 hour ago', type: 'bill' },
  ];
  const items = logs.length > 0 ? logs : defaultLogs;

  return (
    <div className="cc-widget-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Global Activity Feed</h3>
        <span className="cc-health-dot cc-dot-green" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '380px', overflowY: 'auto' }}>
        {items.map(item => (
          <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', paddingBottom: '0.65rem', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: item.type === 'rfq' ? '#0ea5e9' : item.type === 'po' ? '#8b5cf6' : item.type === 'bill' ? '#ef4444' : '#10b981'
              }}>
                {item.type}
              </span>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{item.time}</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 500 }}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
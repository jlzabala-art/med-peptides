import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import Briefcase from 'lucide-react/dist/esm/icons/briefcase';
import Server from 'lucide-react/dist/esm/icons/server';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import Users from 'lucide-react/dist/esm/icons/users';
import Send from 'lucide-react/dist/esm/icons/send';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import MoreHorizontal from 'lucide-react/dist/esm/icons/more-horizontal';
import React, { useState } from 'react';
import OperationalKPICard from '../../shared/widgets/OperationalKPICard';

import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
      .cc-kpis-container {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
        margin-bottom: 1.5rem;
        width: 100%;
        box-sizing: border-box;
      }
      @media (min-width: 640px) {
        .cc-kpis-container {
          grid-template-columns: repeat(3, 1fr);
        }
      }
      @media (min-width: 768px) {
        .cc-kpis-container {
          grid-template-columns: repeat(4, 1fr);
        }
      }
      @media (min-width: 1024px) {
        .cc-kpis-container {
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        }
      }
      .cc-kpi-card {
        width: 100%;
        box-sizing: border-box;
        padding: 1rem 1.25rem;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        transition: all 0.2s ease;
        border-left: 4px solid transparent;
        position: relative;
        max-height: 220px;
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

// Mock Sparkline Component
function MiniSparkline({ data, color }) {
  return (
    <div
      style={{
        width: '60px',
        height: '24px',
        position: 'absolute',
        right: '1.25rem',
        top: '1.25rem',
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// 1. EXECUTIVE SUMMARY STRIP (KPI CARDS)
export function ExecutiveSummaryStrip({ metrics = {}, visibleKPIs = [], onCardClick }) {
  const mockSparkDataUp = [
    { value: 10 },
    { value: 15 },
    { value: 13 },
    { value: 20 },
    { value: 25 },
    { value: 30 },
  ];
  const mockSparkDataDown = [
    { value: 30 },
    { value: 25 },
    { value: 28 },
    { value: 20 },
    { value: 15 },
    { value: 10 },
  ];
  const mockSparkDataFlat = [
    { value: 15 },
    { value: 15 },
    { value: 16 },
    { value: 15 },
    { value: 15 },
    { value: 16 },
  ];

  const kpis = [
    {
      id: 'revenue',
      label: 'Revenue',
      value: `AED ${metrics.revenue?.toLocaleString() || '0'}`,
      trend: '+18.4%',
      trendUp: true,
      spark: mockSparkDataUp,
    },
    {
      id: 'grossProfit',
      label: 'Gross Profit',
      value: `AED ${metrics.grossProfit?.toLocaleString() || '0'}`,
      trend: 'Margin 30%',
      trendUp: null,
      spark: mockSparkDataFlat,
    },
    {
      id: 'cashPosition',
      label: 'Cash Position',
      value: `AED ${metrics.cashPosition?.toLocaleString() || '0'}`,
      trend: 'Optimal',
      trendUp: true,
      spark: mockSparkDataUp,
    },
    {
      id: 'openOrders',
      label: 'Open Orders',
      value: metrics.openOrders || 0,
      trend: '-2% delay',
      trendUp: false,
      spark: mockSparkDataDown,
    },
    {
      id: 'pendingApprovals',
      label: 'Approvals',
      value: metrics.pendingApprovals || 0,
      trend: 'Requires Action',
      trendUp: false,
      alert: true,
      spark: mockSparkDataFlat,
    },
    {
      id: 'openRFQs',
      label: 'Open RFQs',
      value: metrics.openRFQs || 0,
      trend: '+7 today',
      trendUp: null,
      spark: mockSparkDataFlat,
    },
    {
      id: 'aiAlerts',
      label: 'AI Alerts',
      value: metrics.aiAlerts || 0,
      trend: 'Pricing alerts',
      trendUp: false,
      alert: true,
      spark: mockSparkDataUp,
    },
  ];

  return (
    <div className="cc-kpis-container">
      <WidgetStyles />
      {kpis
        .filter((k) => visibleKPIs.length === 0 || visibleKPIs.includes(k.id))
        .map((k) => (
          <OperationalKPICard
            key={k.id}
            title={k.label}
            value={k.value}
            severity={k.alert ? 'critical' : 'neutral'}
            trend={k.trend}
            actionLabel="View Details"
            onClick={() => onCardClick && onCardClick(k.id)}
          >
            <MiniSparkline
              data={k.spark}
              color={k.trendUp ? '#10b981' : k.trendUp === false ? '#ef4444' : '#64748b'}
            />
          </OperationalKPICard>
        ))}
    </div>
  );
}

// 2. TODAY'S PRIORITIES QUEUE
export function TodayPrioritiesQueue({ priorities = [], onAction }) {
  const [selectedId, setSelectedId] = useState(null);

  const defaultPriorities = [
    {
      id: 1,
      priority: 'critical',
      text: 'Approve 3 high-value RFQs',
      detail:
        'RFQs from BioPharma and Gulf Distribution exceeding AED 50,000 await your signature.',
    },
    {
      id: 2,
      priority: 'high',
      text: 'Inventory alert: Thymulin',
      detail: 'Thymulin stock is below minimum threshold. Recommended reorder: 500 units.',
    },
    {
      id: 3,
      priority: 'normal',
      text: 'Review Q3 Marketing ROI',
      detail: 'Marketing campaign results are in. Conversions are up 12%.',
    },
  ];

  const items = priorities.length > 0 ? priorities : defaultPriorities;

  return (
    <div className="cc-widget-card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={16} color="#ef4444" />
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
            Priority Queue
          </h3>
        </div>
        <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>
          Auto-generated
        </span>
      </div>

      <div
        className="cc-pq-container"
        style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}
      >
        <style>{`
          @media (min-width: 1024px) {
            .cc-pq-container { flex-direction: row !important; align-items: flex-start; }
            .cc-pq-list { width: 50%; }
            .cc-pq-detail { width: 50%; display: block !important; }
            .cc-pq-accordion-detail { display: none !important; }
          }
          .cc-pq-detail { display: none; background: #f8fafc; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; height: 100%; }
        `}</style>

        <div
          className="cc-pq-list"
          style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}
        >
          {items.map((item) => {
            const isSelected = selectedId === item.id;
            return (
              <div key={item.id}>
                <div
                  onClick={() => setSelectedId(isSelected ? null : item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? '#f1f5f9' : '#ffffff',
                    borderLeft: '4px solid',
                    borderLeftColor:
                      item.priority === 'critical'
                        ? '#ef4444'
                        : item.priority === 'high'
                          ? '#f59e0b'
                          : '#0284c7',
                    border: isSelected ? '1px solid #cbd5e1' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px',
                        backgroundColor:
                          item.priority === 'critical'
                            ? '#fef2f2'
                            : item.priority === 'high'
                              ? '#fffbeb'
                              : '#f0f9ff',
                        color:
                          item.priority === 'critical'
                            ? '#ef4444'
                            : item.priority === 'high'
                              ? '#b45309'
                              : '#0284c7',
                      }}
                    >
                      {item.priority}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>
                      {item.text}
                    </span>
                  </div>
                  <ArrowRight
                    size={14}
                    color="#94a3b8"
                    style={{
                      transform: isSelected ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }}
                  />
                </div>

                {/* Mobile Accordion Detail */}
                {isSelected && (
                  <div
                    className="cc-pq-accordion-detail"
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '0 0 8px 8px',
                      marginTop: '-4px',
                      border: '1px solid #e2e8f0',
                      borderTop: 'none',
                      fontSize: '0.8rem',
                      color: '#475569',
                    }}
                  >
                    {item.detail}
                    <div style={{ marginTop: '0.5rem' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction && onAction(item);
                        }}
                        style={{
                          padding: '0.3rem 0.6rem',
                          fontSize: '0.75rem',
                          background: '#0284c7',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Resolve Action
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop Detail Panel */}
        <div className="cc-pq-detail">
          {selectedId ? (
            (() => {
              const item = items.find((i) => i.id === selectedId);
              return (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#0f172a' }}>
                    {item.text}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#475569', flex: 1 }}>{item.detail}</p>
                  <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                    <button
                      onClick={() => onAction && onAction(item)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.8rem',
                        background: '#0284c7',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        width: '100%',
                      }}
                    >
                      Resolve Action
                    </button>
                  </div>
                </div>
              );
            })()
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#94a3b8',
                fontSize: '0.85rem',
              }}
            >
              Select a priority to view details
            </div>
          )}
        </div>
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
    { label: 'AI Sourcing', state: 'green', desc: '100% matched' },
  ];
  const items = statusData.length > 0 ? statusData : defaultStatus;

  return (
    <div className="cc-widget-card">
      <h3
        style={{ margin: '0 0 0.85rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}
      >
        Business Health Diagnostic
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '0.75rem',
        }}
      >
        {items.map((item, idx) => (
          <div
            key={idx}
            style={{
              padding: '0.75rem',
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyNavigation: 'space-between',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
                {item.label}
              </span>
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          borderBottom: '1px solid #e2e8f0',
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
          <Briefcase size={16} color="#0ea5e9" /> Financial Tasks Hub
        </h3>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {['commissions', 'bills', 'approvals', 'payroll'].map((tab) => (
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
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem',
                background: '#ffffff',
                borderRadius: '6px',
                border: '1px solid #f1f5f9',
              }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Dr. Alejandro Gomez</span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Mayo 2026</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>AED 12,500</span>
              <button
                onClick={() => onAction && onAction('commission', 'Gomez')}
                style={{
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.7rem',
                  color: '#0284c7',
                  background: '#f0f9ff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Pay
              </button>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem',
                background: '#ffffff',
                borderRadius: '6px',
                border: '1px solid #f1f5f9',
              }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Dra. María Sánchez</span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Mayo 2026</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>AED 34,000</span>
              <button
                onClick={() => onAction && onAction('commission', 'Sánchez')}
                style={{
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.7rem',
                  color: '#0284c7',
                  background: '#f0f9ff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Pay
              </button>
            </div>
          </div>
        )}
        {financeTab === 'bills' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem',
                background: '#ffffff',
                borderRadius: '6px',
                border: '1px solid #f1f5f9',
              }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Biopharma Ltd (PO #1809)</span>
              <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 500 }}>
                Due Today
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>AED 18,200</span>
            </div>
          </div>
        )}
        {financeTab === 'approvals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem',
                background: '#ffffff',
                borderRadius: '6px',
                border: '1px solid #f1f5f9',
              }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Purchase Order (PO #2010)</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>AED 120,000</span>
              <button
                onClick={() => onAction && onAction('po', 'PO-2010')}
                style={{
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.7rem',
                  color: '#22c55e',
                  background: '#f0fdf4',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Approve
              </button>
            </div>
          </div>
        )}
        {financeTab === 'payroll' && (
          <div
            style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}
          >
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

  const totalIn = data.reduce((sum, item) => sum + item.Incoming, 0);
  const totalOut = data.reduce((sum, item) => sum + item.Outgoing, 0);

  return (
    <div className="cc-widget-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
          Cash Flow Forecast
        </h3>
        <span
          style={{
            fontSize: '0.7rem',
            padding: '0.2rem 0.5rem',
            borderRadius: '6px',
            backgroundColor: '#ecfdf5',
            color: '#059669',
            fontWeight: 600,
          }}
        >
          Risk: {riskLevel}
        </span>
      </div>

      <div
        className="cc-cf-container"
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}
      >
        <style>{`
          .cc-cf-container { height: 160px; }
          .cc-cf-chart { height: 120px; }
          @media (min-width: 1024px) {
            .cc-cf-container { flex-direction: row !important; align-items: center; height: 180px; }
            .cc-cf-chart { width: 60%; height: 100%; }
            .cc-cf-stats { width: 40%; display: flex; flexDirection: column; justify-content: center; border-left: 1px solid #e2e8f0; padding-left: 1rem; }
          }
        `}</style>

        <div className="cc-cf-chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="widgetIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="widgetOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                fontSize={10}
                stroke="#94a3b8"
                tickLine={false}
                axisLine={false}
              />
              <YAxis fontSize={10} stroke="#94a3b8" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  fontSize: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
              <Area
                type="monotone"
                dataKey="Incoming"
                stroke="#0284c7"
                fillOpacity={1}
                fill="url(#widgetIn)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="Outgoing"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#widgetOut)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div
          className="cc-cf-stats"
          style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-around' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '0.65rem',
                color: '#64748b',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              Projected In
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284c7' }}>
              {(totalIn / 1000).toFixed(0)}k
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '0.65rem',
                color: '#64748b',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              Projected Out
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ef4444' }}>
              {(totalOut / 1000).toFixed(0)}k
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';

// 6. CRM PIPELINE FUNNEL
export function CrmPipelineFunnel({ pipelineStages = [] }) {
  const defaultStages = [
    {
      stage: 'Leads',
      count: 24,
      val: 'AED 45k',
      color: '#e0f2fe',
      text: '#0369a1',
      border: '#bae6fd',
    },
    {
      stage: 'Opps',
      count: 18,
      val: 'AED 120k',
      color: '#bae6fd',
      text: '#0369a1',
      border: '#7dd3fc',
    },
    {
      stage: 'RFQs',
      count: 12,
      val: 'AED 380k',
      color: '#7dd3fc',
      text: '#0c4a6e',
      border: '#38bdf8',
    },
    {
      stage: 'Quotes',
      count: 9,
      val: 'AED 290k',
      color: '#38bdf8',
      text: '#f8fafc',
      border: '#0284c7',
    },
    {
      stage: 'Won',
      count: 42,
      val: 'AED 845k',
      color: '#10b981',
      text: '#ffffff',
      border: '#059669',
    },
  ];
  const items = pipelineStages.length > 0 ? pipelineStages : defaultStages;

  return (
    <div className="cc-widget-card">
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
        CRM Pipeline B2B Funnel
      </h3>
      <div
        className="cc-pipeline-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
        }}
      >
        {items.map((stage, idx) => (
          <React.Fragment key={idx}>
            <div
              style={{
                flex: '0 0 auto',
                width: '120px',
                backgroundColor: stage.color,
                border: `1px solid ${stage.border}`,
                borderRadius: '8px',
                padding: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              }}
            >
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: stage.text,
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                }}
              >
                {stage.stage}
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: stage.text }}>
                {stage.count}
              </span>
              <span
                style={{ fontSize: '0.7rem', fontWeight: 600, color: stage.text, opacity: 0.9 }}
              >
                {stage.val}
              </span>
            </div>
            {idx < items.length - 1 && (
              <ChevronRight size={18} color="#cbd5e1" style={{ flexShrink: 0 }} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// 7. TOP WHOLESALERS LEADERBOARD
export function WholesalersLeaderboard({ wholesalersData = [], onSelect }) {
  const defaultWs = [
    {
      name: 'Gulf Distribution LLC',
      revenue: 'AED 245,000',
      patients: 120,
      orders: 48,
      growth: '+14%',
      margin: '18%',
      score: 96,
    },
    {
      name: 'PurePeptides GCC',
      revenue: 'AED 134,000',
      patients: 84,
      orders: 32,
      growth: '+22%',
      margin: '24%',
      score: 92,
    },
  ];
  const list = wholesalersData.length > 0 ? wholesalersData : defaultWs;

  return (
    <div className="cc-widget-card">
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
        Top Wholesalers Leaderboard
      </h3>

      <style>{`
        .cc-wl-mobile { display: flex; flex-direction: column; gap: 0.75rem; }
        .cc-wl-desktop { display: none; }
        @media (min-width: 768px) {
          .cc-wl-mobile { display: none; }
          .cc-wl-desktop { display: block; overflow-x: auto; }
        }
      `}</style>

      {/* MOBILE CARDS VIEW */}
      <div className="cc-wl-mobile">
        {list.map((ws, i) => (
          <div
            key={i}
            onClick={() => onSelect && onSelect(ws)}
            style={{
              padding: '1rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              cursor: onSelect ? 'pointer' : 'default',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem',
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                {ws.name}
              </span>
              <span
                style={{
                  padding: '0.2rem 0.4rem',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: ws.score > 90 ? '#ecfdf5' : '#fffbeb',
                  color: ws.score > 90 ? '#047857' : '#b45309',
                }}
              >
                AI {ws.score}%
              </span>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
                fontSize: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#64748b' }}>Revenue</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{ws.revenue}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#64748b' }}>Growth</span>
                <span
                  style={{
                    fontWeight: 600,
                    color: ws.growth?.startsWith('+') ? '#10b981' : '#ef4444',
                  }}
                >
                  {ws.growth}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#64748b' }}>Orders</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{ws.orders}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#64748b' }}>Margin</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{ws.margin}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="cc-wl-desktop">
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.8rem',
            textAlign: 'left',
          }}
        >
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
              <tr
                key={i}
                style={{
                  borderBottom: '1px solid #f1f5f9',
                  cursor: onSelect ? 'pointer' : 'default',
                }}
                onClick={() => onSelect && onSelect(ws)}
              >
                <td style={{ padding: '0.65rem 0.5rem', fontWeight: 600 }}>{ws.name}</td>
                <td style={{ padding: '0.65rem 0.5rem' }}>{ws.revenue}</td>
                <td style={{ padding: '0.65rem 0.5rem' }}>{ws.patients}</td>
                <td style={{ padding: '0.65rem 0.5rem' }}>{ws.orders}</td>
                <td
                  style={{
                    padding: '0.65rem 0.5rem',
                    color: ws.growth?.startsWith('+') ? '#10b981' : '#ef4444',
                    fontWeight: 600,
                  }}
                >
                  {ws.growth}
                </td>
                <td style={{ padding: '0.65rem 0.5rem' }}>{ws.margin}</td>
                <td style={{ padding: '0.65rem 0.5rem' }}>
                  <span
                    style={{
                      padding: '0.2rem 0.4rem',
                      borderRadius: '4px',
                      fontWeight: 700,
                      backgroundColor: ws.score > 90 ? '#ecfdf5' : '#fffbeb',
                      color: ws.score > 90 ? '#047857' : '#b45309',
                    }}
                  >
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

// 8. AI COMMAND CONSOLE / SOURCING HUB
export function AiCommandConsole({ onAskQuestion }) {
  const [queryVal, setQueryVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState(null);
  const [activeTab, setActiveTab] = useState('insights');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!queryVal.trim()) return;
    setLoading(true);

    if (onAskQuestion) {
      onAskQuestion(queryVal).then((res) => {
        setReply(res);
        setLoading(false);
      });
    } else {
      setTimeout(() => {
        setReply({
          answer: `Here is the operational query summary: 3 pending commissions found. Cash flow remains positive.`,
          actions: [],
        });
        setLoading(false);
      }, 700);
    }
  };

  return (
    <div
      className="cc-widget-card"
      style={{
        background:
          'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 249, 255, 0.9) 100%)',
        border: '1px solid #bae6fd',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color="#0284c7" />
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
            Atlas Sourcing Hub
          </h2>
        </div>

        {/* Tabs for Sourcing Hub */}
        <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', paddingBottom: '2px' }}>
          {['insights', 'predictions', 'recommendations', 'agents'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.75rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeTab === tab ? '#0284c7' : 'transparent',
                color: activeTab === tab ? '#ffffff' : '#64748b',
                fontWeight: activeTab === tab ? 600 : 500,
                cursor: 'pointer',
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* TABS CONTENT */}
      <div style={{ marginBottom: '1rem' }}>
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
            Estimated impact: <strong style={{ color: '#0284c7' }}>+AED 24k / mo</strong>
          </span>
        </div>

        {activeTab === 'insights' && (
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
              <strong>3 opportunities</strong> in Dubai clinic network need strategic discount
              review.
            </li>
            <li>
              Average RFQ response time improved by <strong>22%</strong> over the last 14 days.
            </li>
          </ul>
        )}
        {activeTab === 'predictions' && (
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>
            AI predicts a potential shipping delay of 3 days from EU laboratories next week due to
            logistics strikes. Recommend frontloading Peptide B purchases.
          </p>
        )}
        {activeTab === 'recommendations' && (
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>
            Adjust pricing on product catalog item #4401. Market price rose by 14%, current margins
            will reduce to 11% if not updated in Zoho Inventory.
          </p>
        )}
        {activeTab === 'agents' && (
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>
            Autonomous agents: <strong>Sourcing Bot</strong> is active (last synced 4 mins ago).{' '}
            <strong>Discrepancy Agent</strong> matched 18/18 bills successfully.
          </p>
        )}
      </div>

      {/* INPUT CONSOLE */}
      <div style={{ marginTop: '0.5rem', borderTop: '1px solid #bae6fd', paddingTop: '1rem' }}>
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
              backgroundColor: '#ffffff',
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
              gap: '0.4rem',
            }}
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
            Ask
          </button>
        </form>
      </div>

      {reply && (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
          }}
        >
          <p
            style={{
              margin: '0 0 0.75rem 0',
              fontSize: '0.85rem',
              color: '#334155',
              lineHeight: 1.5,
            }}
          >
            {reply.answer}
          </p>
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
    { id: 4, text: 'New Lead: Clinic MedCare Dubai registered', time: '3 hours ago', type: 'lead' },
    {
      id: 5,
      text: 'Supplier catalog synced with Zoho Inventory',
      time: '5 hours ago',
      type: 'sync',
    },
    { id: 6, text: 'AI Analysis Completed: Q2 Margin Optimization', time: '1 day ago', type: 'ai' },
  ];
  const items = logs.length > 0 ? logs : defaultLogs;

  return (
    <div className="cc-widget-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
          Global Activity Feed
        </h3>
        <span className="cc-health-dot cc-dot-green" />
      </div>

      <style>{`
        .cc-activity-feed {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          max-height: 380px;
          overflow-y: auto;
        }
        /* Mobile: limit to 5 items */
        .cc-activity-feed .cc-activity-item:nth-child(n+6) {
          display: none !important;
        }
        /* Desktop: 2 columns, show all */
        @media (min-width: 1024px) {
          .cc-activity-feed {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }
          .cc-activity-feed .cc-activity-item:nth-child(n+6) {
            display: flex !important;
          }
        }
      `}</style>

      <div className="cc-activity-feed">
        {items.map((item) => (
          <div
            key={item.id}
            className="cc-activity-item"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.15rem',
              paddingBottom: '0.65rem',
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}
            >
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color:
                    item.type === 'rfq'
                      ? '#0ea5e9'
                      : item.type === 'po'
                        ? '#8b5cf6'
                        : item.type === 'bill'
                          ? '#ef4444'
                          : '#10b981',
                }}
              >
                {item.type}
              </span>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{item.time}</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 500 }}>
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

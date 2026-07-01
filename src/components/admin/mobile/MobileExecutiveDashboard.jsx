import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  BarChart3,
  DollarSign,
  Activity,
  Settings,
  TrendingUp,
  TrendingDown,
  BrainCircuit,
  ShieldAlert,
  Zap,
  Factory,
  PackageSearch,
  Users,
  Star,
  Box,
  Check,
  Cpu,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function MobileExecutiveDashboard() {
  const [sourcingExpanded, setSourcingExpanded] = useState(false);

  // MOCK DATA for layout testing
  const priorities = [
    { title: 'Approve 5 RFQs', impact: '+AED 24,000/month', type: 'action' },
    { title: 'Review 3 supplier bills', impact: 'High Urgency', type: 'review' },
    { title: 'Inventory risk: Thymulin', impact: 'Critical Out-of-Stock', type: 'alert' },
  ];

  const queue = [
    { id: 1, title: 'Approve pricing for Q3 Clinic batch', impact: '$12,000', badge: 'PRICING' },
    { id: 2, title: 'Verify new supplier compliance doc', impact: 'Required', badge: 'LEGAL' },
    {
      id: 3,
      title: 'Dispatch delayed: Saudi order #44',
      impact: '-$500 penalty risk',
      badge: 'LOGISTICS',
    },
    { id: 4, title: 'Low stock: BPC-157 10mg', impact: '14 days left', badge: 'INVENTORY' },
    { id: 5, title: 'Follow-up with MedGroup Lead', impact: '$8,500 potential', badge: 'SALES' },
  ];

  const kpis = [
    { label: 'Revenue', value: '$84.2K', color: '#10b981', trend: '+12%' },
    { label: 'Cash Position', value: '$124.5K', color: '#38bdf8', trend: '+5%' },
    { label: 'Open Orders', value: '42', color: '#fbbf24', trend: '-2' },
    { label: 'Approvals', value: '8', color: '#f43f5e', trend: '+3' },
    { label: 'AI Alerts', value: '3', color: '#c084fc', trend: 'New' },
    { label: 'Gross Profit', value: '41%', color: '#10b981', trend: '+1.2%' },
  ];

  const health = [
    { label: 'Sales', status: 'green' },
    { label: 'Procurement', status: 'green' },
    { label: 'Inventory', status: 'yellow' },
    { label: 'Cash Flow', status: 'green' },
    { label: 'Leads', status: 'green' },
    { label: 'Dispatch', status: 'yellow' },
  ];

  const funnel = [
    { label: 'Leads', value: 142, percent: 100 },
    { label: 'Opps', value: 85, percent: 60 },
    { label: 'RFQs', value: 42, percent: 30 },
    { label: 'Quotes', value: 18, percent: 12 },
    { label: 'Won', value: 6, percent: 4 },
  ];

  const wholesalers = [
    { name: 'Apex Medical Supplies', revenue: '$142K', growth: '+12%', score: 94 },
    { name: 'Global Pharma Dist.', revenue: '$98K', growth: '+5%', score: 88 },
    { name: 'BioTech Partners', revenue: '$65K', growth: '-2%', score: 76 },
  ];

  return (
    <div
      style={{
        padding: '1.5rem 1rem',
        paddingBottom: '120px',
        backgroundColor: 'var(--color-bg-app, #f8fafc)',
        minHeight: '100vh',
        fontFamily: 'Inter, sans-serif',
        color: 'var(--text-main, #0f172a)',
        backgroundImage:
          'radial-gradient(circle at top right, rgba(14, 165, 233, 0.05), transparent 400px), radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.03), transparent 400px)',
      }}
    >
      {/* 1. Today's Focus - Premium Glassmorphism */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '20px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          overflow: 'hidden',
          marginBottom: '1.5rem',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 4px 10px -5px rgba(0,0,0,0.02)',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(14, 165, 233, 0.1), rgba(139, 92, 246, 0.1))',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              padding: '8px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            }}
          >
            <BrainCircuit size={20} color="#0ea5e9" />
          </div>
          <h2
            style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              margin: 0,
              color: 'var(--text-main, #0f172a)',
              letterSpacing: '0.02em',
            }}
          >
            ATLAS INTELLIGENCE
          </h2>
        </div>
        <div style={{ padding: '20px' }}>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            {priorities.map((p, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ marginTop: '2px', color: '#0ea5e9' }}>
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      color: 'var(--text-main, #0f172a)',
                      fontSize: '0.95rem',
                      marginBottom: '2px',
                    }}
                  >
                    {p.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)' }}>
                    Impact:{' '}
                    <span
                      style={{
                        color: p.impact.includes('+')
                          ? '#059669'
                          : p.impact.includes('Critical')
                            ? '#dc2626'
                            : '#d97706',
                        fontWeight: 600,
                      }}
                    >
                      {p.impact}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              onClick={() => toast.success('Resolving priorities...')}
              style={{
                padding: '12px',
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.9rem',
                boxShadow: '0 4px 14px rgba(14, 165, 233, 0.3)',
                cursor: 'pointer',
              }}
            >
              Resolve All
            </button>
            <button
              onClick={() => toast('Atlas AI listening...')}
              style={{
                padding: '12px',
                background: 'white',
                color: 'var(--text-main, #0f172a)',
                border: '1px solid rgba(226, 232, 240, 1)',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              }}
            >
              <Zap size={16} color="#d97706" /> Ask Atlas
            </button>
          </div>
        </div>
      </div>

      {/* 3. Executive KPI Snapshot */}
      <div style={{ marginBottom: '2rem' }}>
        <h3
          style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: 'var(--text-muted, #64748b)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '1rem',
            paddingLeft: '4px',
          }}
        >
          Pulse Dashboard
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              style={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                borderRadius: '16px',
                padding: '16px',
                height: '100px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  width: '50px',
                  height: '50px',
                  background: `radial-gradient(circle, ${kpi.color}20, transparent 70%)`,
                }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted, #64748b)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  {kpi.label}
                </div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: kpi.trend.includes('-') ? '#dc2626' : kpi.color,
                    background: `${kpi.trend.includes('-') ? '#dc2626' : kpi.color}15`,
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {kpi.trend}
                </div>
              </div>
              <div
                style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}
              >
                {kpi.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Priority Queue */}
      <div style={{ marginBottom: '2rem' }}>
        <h3
          style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: 'var(--text-muted, #64748b)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '1rem',
            paddingLeft: '4px',
          }}
        >
          Action Queue
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {queue.map((q) => (
            <div
              key={q.id}
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              }}
              onClick={() => toast(`Opening drawer for: ${q.title}`)}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    display: 'inline-block',
                    marginBottom: '8px',
                  }}
                >
                  {q.badge}
                </div>
                <div
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: 'var(--text-main, #0f172a)',
                    lineHeight: 1.4,
                    marginBottom: '4px',
                  }}
                >
                  {q.title}
                </div>
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: q.impact.includes('-') ? '#dc2626' : '#059669',
                    fontWeight: 600,
                  }}
                >
                  {q.impact}
                </div>
              </div>
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '8px',
                  borderRadius: '50%',
                }}
              >
                <ChevronRight size={18} color="#64748b" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Executive AI Brief */}
      <div
        style={{
          marginBottom: '2rem',
          background:
            'linear-gradient(180deg, rgba(99, 102, 241, 0.05) 0%, rgba(255, 255, 255, 0.8) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 10px 30px -10px rgba(99, 102, 241, 0.1)',
        }}
      >
        <h3
          style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            color: '#4f46e5',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Cpu size={16} /> Strategy Insights
        </h3>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}
        >
          <div
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-main, #1e293b)',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ color: '#4f46e5', marginTop: '2px' }}>
              <ArrowRight size={14} />
            </div>
            <span style={{ lineHeight: 1.5, fontWeight: 500 }}>
              High conversion rate in UAE clinics this week (+14%).
            </span>
          </div>
          <div
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-main, #1e293b)',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ color: '#4f46e5', marginTop: '2px' }}>
              <ArrowRight size={14} />
            </div>
            <span style={{ lineHeight: 1.5, fontWeight: 500 }}>
              Freight costs from China down 4% overall. Opportunity to bulk order.
            </span>
          </div>
          <div
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-main, #1e293b)',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ color: '#4f46e5', marginTop: '2px' }}>
              <ArrowRight size={14} />
            </div>
            <span style={{ lineHeight: 1.5, fontWeight: 500 }}>
              Recommend purchasing BPC-157 before Q3 due to projected shortage.
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'white',
              background: '#4f46e5',
              border: 'none',
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
            }}
          >
            Deep Dive
          </button>
          <button
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#64748b',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
            }}
          >
            Dismiss
          </button>
        </div>
      </div>

      {/* 5. Business Health Matrix */}
      <div style={{ marginBottom: '2rem' }}>
        <h3
          style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: 'var(--text-muted, #64748b)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '1rem',
            paddingLeft: '4px',
          }}
        >
          Health Matrix
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            background: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          }}
        >
          {health.map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor:
                    item.status === 'green'
                      ? '#10b981'
                      : item.status === 'yellow'
                        ? '#f59e0b'
                        : '#ef4444',
                  boxShadow: `0 0 10px ${item.status === 'green' ? '#10b981' : item.status === 'yellow' ? '#f59e0b' : '#ef4444'}60`,
                }}
              />
              <span
                style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 7. CRM Funnel */}
      <div
        style={{
          marginBottom: '2rem',
          background: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        }}
      >
        <h3
          style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            color: 'var(--text-main, #0f172a)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Users size={16} color="#0ea5e9" /> Sales Pipeline
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {funnel.map((stage) => (
            <div key={stage.label}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-muted, #64748b)',
                  marginBottom: '8px',
                }}
              >
                <span>{stage.label}</span>
                <span style={{ color: 'var(--text-main, #0f172a)', fontWeight: 700 }}>
                  {stage.value}
                </span>
              </div>
              <div
                style={{
                  height: '8px',
                  background: '#f1f5f9',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${stage.percent}%`,
                    background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)',
                    borderRadius: '4px',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

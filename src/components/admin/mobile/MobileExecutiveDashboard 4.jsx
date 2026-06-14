import React, { useState } from 'react';
import { 
  CheckCircle2, AlertTriangle, ArrowRight, ChevronRight, BarChart3, 
  DollarSign, Activity, Settings, TrendingUp, TrendingDown,
  BrainCircuit, ShieldAlert, Zap, Factory, PackageSearch, Users, Star, Box
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function MobileExecutiveDashboard() {
  const [sourcingExpanded, setSourcingExpanded] = useState(false);

  // MOCK DATA for layout testing
  const priorities = [
    { title: "Approve 5 RFQs", impact: "+AED 24,000/month", type: "action" },
    { title: "Review 3 supplier bills", impact: "High Urgency", type: "review" },
    { title: "Inventory risk: Thymulin", impact: "Critical Out-of-Stock", type: "alert" }
  ];

  const queue = [
    { id: 1, title: 'Approve pricing for Q3 Clinic batch', impact: '$12,000', badge: 'PRICING' },
    { id: 2, title: 'Verify new supplier compliance doc', impact: 'Required', badge: 'LEGAL' },
    { id: 3, title: 'Dispatch delayed: Saudi order #44', impact: '-$500 penalty risk', badge: 'LOGISTICS' },
    { id: 4, title: 'Low stock: BPC-157 10mg', impact: '14 days left', badge: 'INVENTORY' },
    { id: 5, title: 'Follow-up with MedGroup Lead', impact: '$8,500 potential', badge: 'SALES' }
  ];

  const kpis = [
    { label: 'Revenue', value: '$84.2K', color: '#16a34a' },
    { label: 'Cash Position', value: '$124.5K', color: '#0284c7' },
    { label: 'Open Orders', value: '42', color: '#d97706' },
    { label: 'Approvals', value: '8', color: '#dc2626' },
    { label: 'AI Alerts', value: '3', color: '#9333ea' },
    { label: 'Gross Profit', value: '41%', color: '#059669' }
  ];

  const health = [
    { label: 'Sales', status: 'green' },
    { label: 'Procurement', status: 'green' },
    { label: 'Inventory', status: 'yellow' },
    { label: 'Cash Flow', status: 'green' },
    { label: 'Leads', status: 'green' },
    { label: 'Dispatch', status: 'yellow' }
  ];

  const funnel = [
    { label: 'Leads', value: 142, percent: 100 },
    { label: 'Opps', value: 85, percent: 60 },
    { label: 'RFQs', value: 42, percent: 30 },
    { label: 'Quotes', value: 18, percent: 12 },
    { label: 'Won', value: 6, percent: 4 }
  ];

  const wholesalers = [
    { name: 'Apex Medical Supplies', revenue: '$142K', growth: '+12%', score: 94 },
    { name: 'Global Pharma Dist.', revenue: '$98K', growth: '+5%', score: 88 },
    { name: 'BioTech Partners', revenue: '$65K', growth: '-2%', score: 76 }
  ];

  return (
    <div style={{ padding: '1rem', paddingBottom: '100px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. Today's Focus */}
      <div style={{ backgroundColor: 'var(--surface, #fff)', borderRadius: '12px', border: '1px solid #bae6fd', overflow: 'hidden', marginBottom: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ backgroundColor: '#f0f9ff', padding: '12px 16px', borderBottom: '1px solid #bae6fd', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BrainCircuit size={18} color="#0284c7" />
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0369a1' }}>TODAY'S FOCUS</h2>
        </div>
        <div style={{ padding: '16px' }}>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {priorities.map((p, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.9rem', color: '#334155' }}>
                <span style={{ color: '#0ea5e9' }}>•</span>
                <div>
                  <div style={{ fontWeight: 600 }}>{p.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Impact: {p.impact}</div>
                </div>
              </li>
            ))}
          </ul>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button style={{ padding: '10px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem' }} onClick={() => toast.success('Resolving priorities...')}>Resolve</button>
            <button style={{ padding: '10px', backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem' }} onClick={() => toast('Atlas AI listening...')}>Ask Atlas</button>
          </div>
        </div>
      </div>

      {/* 2. Priority Queue */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem', paddingLeft: '4px' }}>Priority Queue</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {queue.map(q => (
            <div key={q.id} style={{ backgroundColor: 'var(--surface, #fff)', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => toast(`Opening drawer for: ${q.title}`)}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginBottom: '4px' }}>{q.badge}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.3 }}>{q.title}</div>
                <div style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: 500, marginTop: '2px' }}>{q.impact}</div>
              </div>
              <ChevronRight size={18} color="#94a3b8" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Executive KPI Snapshot */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem', paddingLeft: '4px' }}>Snapshot</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {kpis.map(kpi => (
            <div key={kpi.label} style={{ backgroundColor: 'var(--surface, #fff)', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', height: '90px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{kpi.label}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Executive AI Brief */}
      <div style={{ marginBottom: '1.5rem', backgroundColor: 'var(--surface, #fff)', border: '1px solid #e0e7ff', borderRadius: '12px', padding: '16px' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={14} /> Executive AI Brief
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          <div style={{ fontSize: '0.85rem', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>• High conversion rate in UAE clinics this week.</div>
          <div style={{ fontSize: '0.85rem', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>• Freight costs from China down 4% overall.</div>
          <div style={{ fontSize: '0.85rem', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>• Recommend purchasing BPC-157 before Q3.</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ flex: 1, padding: '8px', fontSize: '0.8rem', fontWeight: 600, color: '#4f46e5', backgroundColor: '#eef2ff', border: 'none', borderRadius: '6px' }}>View More</button>
          <button style={{ flex: 1, padding: '8px', fontSize: '0.8rem', fontWeight: 600, color: '#334155', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '6px' }}>Ask Atlas</button>
        </div>
      </div>

      {/* 5. Business Health Matrix */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem', paddingLeft: '4px' }}>Health Matrix</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', backgroundColor: 'var(--surface, #fff)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' }}>
          {health.map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.status === 'green' ? '#10b981' : item.status === 'yellow' ? '#f59e0b' : '#ef4444' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Atlas Sourcing Hub */}
      <div style={{ marginBottom: '1.5rem', backgroundColor: 'var(--surface, #fff)', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        <div 
          onClick={() => setSourcingExpanded(!sourcingExpanded)}
          style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: sourcingExpanded ? '#f8fafc' : 'transparent' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PackageSearch size={16} color="#64748b" />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Atlas Sourcing Hub</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669', backgroundColor: '#d1fae5', padding: '2px 6px', borderRadius: '4px' }}>94% Conf.</div>
            <ChevronRight size={16} color="#94a3b8" style={{ transform: sourcingExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
          </div>
        </div>
        {sourcingExpanded && (
          <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '8px' }}>AI has identified 2 new vetted suppliers for Retatrutide.</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0ea5e9', marginBottom: '12px' }}>Est. Impact: 12% margin increase</div>
            <button style={{ width: '100%', padding: '8px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Review Suppliers</button>
          </div>
        )}
      </div>

      {/* 7. CRM Funnel */}
      <div style={{ marginBottom: '1.5rem', backgroundColor: 'var(--surface, #fff)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Users size={14} /> Pipeline
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {funnel.map(stage => (
            <div key={stage.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                <span>{stage.label}</span>
                <span>{stage.value}</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${stage.percent}%`, backgroundColor: '#3b82f6', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Top Wholesalers */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem', paddingLeft: '4px' }}>Top Wholesalers</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {wholesalers.map((w, i) => (
            <div key={i} style={{ backgroundColor: 'var(--surface, #fff)', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{w.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{w.revenue} • <span style={{ color: w.growth.startsWith('+') ? '#16a34a' : '#dc2626' }}>{w.growth}</span></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>AI SCORE</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0ea5e9' }}>{w.score}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

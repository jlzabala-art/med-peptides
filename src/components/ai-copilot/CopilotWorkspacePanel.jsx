import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCopilot } from '../../context/CopilotContext';
import { toast } from 'react-hot-toast';
import { askCatalogAssistant } from '../../services/catalogAIService';

import {
  X, Command, Activity, HeartPulse, Target, Briefcase, User, MessageSquare, Mic,
  ChevronRight, AlertTriangle, CheckCircle2, Zap, DollarSign, Package,
  ChevronDown, Clock, BrainCircuit, ShieldAlert, ArrowRight, ActivitySquare
} from 'lucide-react';

// Subcomponents moved OUTSIDE the main render to satisfy React Hooks ESLint rules.

const StatusBadge = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fef2f2', padding: '4px 10px', borderRadius: '12px', border: '1px solid #fecaca' }}>
    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
    <span style={{ fontSize: '11px', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase' }}>Critical</span>
  </div>
);

const TimelineItem = ({ time, text }) => (
  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
    <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', width: '40px' }}>{time}</div>
    <div style={{ flex: 1, fontSize: '13px', color: '#334155', borderLeft: '2px solid #e2e8f0', paddingLeft: '12px' }}>{text}</div>
  </div>
);

const AlertChip = ({ alert, onClick }) => (
  <div onClick={onClick} style={{ background: alert.bg, color: alert.color, padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, border: `1px solid ${alert.border}`, cursor: 'pointer' }}>
    {alert.icon} {alert.label}
  </div>
);

// Motor de Contexto
function generateAtlasContext(role, screen, record) {
  // Base default context for each role
  const baseContexts = {
    ceo: {
      recommendation: {
        what: 'Revenue increased 18%. Magenta represents 22% of monthly revenue.',
        why: 'High customer concentration introduces strategic risk.',
        action: 'Review customer concentration & diversify pipeline.',
        impact: 'Risk mitigation across AED 1.2M MRR',
        timeSaved: '4 hours of analyst work',
        buttons: ['Review Account', 'Review Risk', 'Schedule Meeting']
      },
      whyThinks: ['Revenue concentration > 20% triggers strategic review.', 'Historical churn of Top 5 clients impact is severe.', 'Confidence 94%'],
      alerts: [{ id: 1, icon: '⚠', label: '2 Strategic Risks Detected', bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', details: ['Magenta dependency', 'Lotusland supply chain'] }],
      memory: ['Pending strategic meeting: Fagron', 'Last CEO review: 2 days ago'],
      feed: [{ time: '09:00', text: 'Executive brief compiled' }],
      timeline: [{ time: '09:00', text: 'Quarterly review started' }, { time: '11:30', text: 'Magenta revenue flagged' }],
      suggestedQuestions: ['Review Magenta account', 'Analyze growth constraints', 'Show revenue by region']
    },
    operations: {
      recommendation: {
        what: '3 supplier bills pending, 2 shipments delayed.',
        why: 'AED 120,000 blocked in procurement. Delays affect inventory buffers.',
        action: 'Approve supplier bills to release holds.',
        impact: '+AED 120k liquidity freed',
        timeSaved: '45 mins of manual reconciliation',
        buttons: ['Approve', 'Review Shipment', 'Assign']
      },
      whyThinks: ['Supplier Lotusland requires upfront payment.', 'Shipment #8922 is stuck at customs.', 'Confidence 98%'],
      alerts: [{ id: 1, icon: '📦', label: '2 Shipments Delayed', bg: '#fffbeb', color: '#b45309', border: '#fde68a', details: ['Shipment #8922 (HK)', 'Shipment #8923 (EU)'] }],
      memory: ['Magenta Batch 2 awaiting HK arrival', 'Critical supplier: Lotusland'],
      feed: [{ time: '08:15', text: 'Customs alert received' }],
      timeline: [{ time: '08:15', text: 'Shipment delayed at HK' }, { time: '10:00', text: 'Supplier bill #441 pending' }],
      suggestedQuestions: ['Analyze peptide inventory', 'Show shipment risks', 'Open supplier approvals']
    },
    medical: {
      recommendation: {
        what: '2 peptide formulations require review. 1 protocol pending.',
        why: 'Clinical trials cannot proceed without QA sign-off.',
        action: 'Review protocol package for BPC-157.',
        impact: 'Unblocks 3 clinical trial enrollments',
        timeSaved: '2 days of regulatory delay',
        buttons: ['Review', 'Approve', 'Assign']
      },
      whyThinks: ['BPC-157 protocol lacks secondary safety signature.', 'Confidence 99%'],
      alerts: [{ id: 1, icon: '⚕️', label: '4 Safety Documents Pending', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', details: ['BPC-157 Safety Profile', 'TB-500 Tox Report'] }],
      memory: ['BPC-157 protocol updated 2 days ago', 'Dr. Smith requested review'],
      feed: [{ time: '07:30', text: 'Protocol draft submitted' }],
      timeline: [{ time: '09:00', text: 'Formulation 1A tested' }, { time: '11:15', text: 'Protocol review requested' }],
      suggestedQuestions: ['Review clinical trials', 'Check interactions BPC-157', 'Validate safety profiles']
    },
    commercial: {
      recommendation: {
        what: '5 RFQs require response. 3 quotations expire this week.',
        why: 'Potential revenue of AED 340,000 at risk of expiration.',
        action: 'Follow up on high-value quotations immediately.',
        impact: 'AED 340,000 Pipeline secured',
        timeSaved: '1.5 hrs of CRM tracking',
        buttons: ['Open RFQs', 'Review Quotations', 'Assign']
      },
      whyThinks: ['Quotation #102 for Magenta expires in 48h.', 'Historical win rate for this segment is 68%.', 'Confidence 85%'],
      alerts: [{ id: 1, icon: '💰', label: '3 Expiring Quotations', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', details: ['Quote #102 - Magenta', 'Quote #104 - Fagron'] }],
      memory: ['Magenta expressed interest in Bulk BPC-157', 'Target margin: 42%'],
      feed: [{ time: '10:10', text: 'Client opened quotation #102' }],
      timeline: [{ time: '08:00', text: 'New RFQ received' }, { time: '10:10', text: 'Client opened Quote #102' }],
      suggestedQuestions: ['Review delayed quotations', 'Analyze pipeline velocity', 'Show top leads']
    },
    executive: {
      recommendation: {
        what: 'Revenue up 18%. Ops delays may affect 2 strategic clients.',
        why: 'Cross-functional bottleneck: Sales promised delivery, Ops is delayed.',
        action: 'Resolve logistics bottleneck & alert clients.',
        impact: 'Prevents churn of Top 5 clients',
        timeSaved: '3 hrs of crisis management',
        buttons: ['View Analysis', 'Schedule Review', 'Assign']
      },
      whyThinks: ['Magenta (Top 5) is expecting Delivery #8922.', 'Delivery #8922 is delayed at HK.', 'Confidence 92%'],
      alerts: [{ id: 1, icon: '📊', label: '1 Cross-functional Bottleneck', bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', details: ['Sales/Ops misalignment on HK batch'] }],
      memory: ['Strategic goal: 99% SLA compliance', 'Magenta SLA is currently 96%'],
      feed: [{ time: '09:00', text: 'Executive dashboard compiled' }],
      timeline: [{ time: '09:00', text: 'SLA alert triggered' }, { time: '12:00', text: 'Cross-functional review suggested' }],
      suggestedQuestions: ['Show SLA compliance', 'Analyze cross-functional risks', 'Review Magenta SLA']
    },
    finance: {
      recommendation: {
        what: 'Outstanding receivables: AED 320,000. 3 bills overdue.',
        why: 'Receivables gap threatens 30-day liquidity buffer.',
        action: 'Collect Magenta payment & hold supplier bills.',
        impact: '+AED 320k cash flow restored',
        timeSaved: '2 hrs of dunning',
        buttons: ['Review Receivables', 'Send Reminder', 'Hold Bills']
      },
      whyThinks: ['Magenta invoice #992 is 15 days overdue.', 'Cash flow forecast requires minimum AED 500k.', 'Confidence 96%'],
      alerts: [{ id: 1, icon: '💵', label: 'AED 320k Overdue', bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', details: ['Magenta: AED 250k', 'Other: AED 70k'] }],
      memory: ['Pending payment: USD 26,281 (Magenta)', 'Liquidity buffer target: AED 500k'],
      feed: [{ time: '11:00', text: 'Bank reconciliation failed for 2 txs' }],
      timeline: [{ time: '08:00', text: 'Daily cash sweep completed' }, { time: '11:00', text: 'AR aging report generated' }],
      suggestedQuestions: ['Show pending payments', 'Explain cash flow forecast', 'Review AR aging']
    }
  };

  const currentContext = baseContexts[role] || baseContexts['ceo'];

  // Override logic based on context (screen/record)
  if (screen === 'customer' || (record && record.type === 'customer')) {
    if (role === 'commercial') {
      currentContext.recommendation.what = 'Customer shows high engagement on Peptide X.';
      currentContext.recommendation.why = 'Upsell opportunity based on viewing history.';
      currentContext.recommendation.action = 'Send targeted offer for Bulk Peptide X.';
    } else if (role === 'finance') {
      currentContext.recommendation.what = 'Customer has AED 45,000 in outstanding invoices.';
      currentContext.recommendation.why = 'Credit limit reached. New orders blocked.';
      currentContext.recommendation.action = 'Send immediate payment reminder.';
    } else if (role === 'operations') {
      currentContext.recommendation.what = 'Customer has 2 pending deliveries delayed.';
      currentContext.recommendation.why = 'SLA breach imminent.';
      currentContext.recommendation.action = 'Reroute shipment via priority courier.';
    }
  }

  return currentContext;
}

export default function CopilotWorkspacePanel() {
  const { isOpen, closeCopilot, contextData, mode, setMode } = useCopilot();
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const modes = [
    { id: 'ceo', label: 'CEO' },
    { id: 'operations', label: 'Operations' },
    { id: 'medical', label: 'Medical' },
    { id: 'commercial', label: 'Commercial' },
    { id: 'executive', label: 'Executive' },
    { id: 'finance', label: 'Finance' }
  ];

  // Mobile accordions
  const [whyOpen, setWhyOpen] = useState(false);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [feedOpen, setFeedOpen] = useState(false);

  // Generate Data from Engine
  const data = generateAtlasContext(mode, contextData?.screen, contextData?.record);

  const handleExecute = async (overrideQuery) => {
    const text = overrideQuery || query;
    if (!text.trim()) return;
    setIsProcessing(true);
    const toastId = toast.loading('Atlas AI processing command...', { icon: '⚡' });
    try {
      await askCatalogAssistant({ message: text, catalogContext: contextData, history: [] });
      toast.success('Command Executed', { id: toastId });
      setQuery('');
    } catch (e) {
      toast.error('Execution failed', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActionClick = (actionName) => {
    toast.success(`Action Triggered: ${actionName}`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          backgroundColor: '#f8fafc',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* HEADER */}
        <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: '#fff', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#0f172a', width: 32, height: 32, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Command size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>Atlas AI</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>Decision Workspace</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <StatusBadge />
            <button onClick={closeCopilot} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0 }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ROLE SELECTOR (Horizontal Scrollable) */}
        <div style={{ height: '48px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 16px', overflowX: 'auto', flexShrink: 0 }} className="hide-scrollbar">
          <div style={{ display: 'flex', gap: '8px' }}>
            {modes.map(m => (
              <button
                key={m.id} onClick={() => setMode(m.id)}
                style={{
                  padding: '6px 14px', borderRadius: '20px', border: '1px solid',
                  borderColor: mode === m.id ? '#0f172a' : '#e2e8f0',
                  background: mode === m.id ? '#0f172a' : '#f8fafc',
                  color: mode === m.id ? '#fff' : '#475569',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: '0.2s'
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* WORKSPACE CONTENT */}
        <div style={{ flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', overflow: 'hidden' }}>
          
          {/* LEFT: MAIN WORKSPACE (70%) */}
          <div style={{ width: isMobile ? '100%' : '70%', height: '100%', overflowY: 'auto', background: '#f8fafc', padding: isMobile ? '16px' : '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Top Recommendation Block */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: isMobile ? '20px' : '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>What Happened</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{data.recommendation.what}</div>
              </div>
              
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Why It Matters</div>
                <div style={{ fontSize: '14px', color: '#334155', marginTop: '4px' }}>{data.recommendation.why}</div>
              </div>

              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recommended Action</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={18} color="#0f172a" /> {data.recommendation.action}
                </div>
              </div>

              {/* Execution Actions */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
                <button onClick={() => handleActionClick(data.recommendation.buttons[0])} style={{ flex: isMobile ? '1 1 100%' : '0 1 auto', background: '#0f172a', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                  {data.recommendation.buttons[0]} <ArrowRight size={16} />
                </button>
                <button onClick={() => handleActionClick(data.recommendation.buttons[1])} style={{ flex: isMobile ? '1 1 45%' : '0 1 auto', background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                  {data.recommendation.buttons[1]}
                </button>
                <button onClick={() => handleActionClick(data.recommendation.buttons[2])} style={{ flex: isMobile ? '1 1 45%' : '0 1 auto', background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                  {data.recommendation.buttons[2]}
                </button>
              </div>
            </div>

            {/* Impact Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>Estimated Impact</div>
                <div style={{ fontSize: '15px', color: '#10b981', fontWeight: 700, marginTop: '4px' }}>{data.recommendation.impact}</div>
              </div>
              <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>Time Saved</div>
                <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: 700, marginTop: '4px' }}>{data.recommendation.timeSaved}</div>
              </div>
            </div>

            {/* Why Atlas Thinks This (Collapsible on Mobile, Open on Desktop) */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <button 
                onClick={() => setWhyOpen(!whyOpen)} 
                style={{ width: '100%', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', fontSize: '14px', fontWeight: 700, color: '#0f172a', cursor: isMobile ? 'pointer' : 'default' }}
                disabled={!isMobile}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><BrainCircuit size={18} color="#64748b" /> Why Atlas Thinks This</div>
                {isMobile && <ChevronDown size={18} color="#64748b" style={{ transform: whyOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />}
              </button>
              {(!isMobile || whyOpen) && (
                <div style={{ padding: '0 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {data.whyThinks.map((reason, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <div style={{ marginTop: '4px', width: 6, height: 6, borderRadius: '50%', background: '#cbd5e1', flexShrink: 0 }} />
                      <div style={{ fontSize: '14px', color: '#475569', lineHeight: 1.4 }}>{reason}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Executive Timeline (Desktop: Center bottom) */}
            {!isMobile && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '16px' }}>Executive Timeline • Today</div>
                {data.timeline.map((item, idx) => (
                  <TimelineItem key={idx} time={item.time} text={item.text} />
                ))}
              </div>
            )}
            
            {/* Horizontal Suggested Questions (Desktop Main Column Bottom) */}
            {!isMobile && (
              <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>Suggested Next Actions</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {data.suggestedQuestions.map((q, idx) => (
                    <button key={idx} onClick={() => handleExecute(q)} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#334155', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: CONTEXT PANEL (30% Desktop / Stacked Mobile) */}
          <div style={{ width: isMobile ? '100%' : '30%', height: isMobile ? 'auto' : '100%', borderLeft: isMobile ? 'none' : '1px solid #e2e8f0', background: '#fff', display: 'flex', flexDirection: 'column', padding: '0', overflowY: isMobile ? 'visible' : 'auto' }}>
            
            {/* Desktop: Render components normally. Mobile: Render as accordions or stack */}
            <div style={{ padding: isMobile ? '0 16px 16px' : '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Alerts */}
              <div>
                {(!isMobile || true) && <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>Context Alerts</div>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {data.alerts.map(alert => (
                    <AlertChip key={alert.id} alert={alert} onClick={() => {
                      toast(alert.details.join(' • '));
                    }} />
                  ))}
                </div>
              </div>

              {/* Atlas Memory */}
              <div style={{ background: isMobile ? '#fff' : 'transparent', borderRadius: isMobile ? '12px' : 0, border: isMobile ? '1px solid #e2e8f0' : 'none', overflow: 'hidden' }}>
                <button 
                  onClick={() => setMemoryOpen(!memoryOpen)} 
                  style={{ width: '100%', padding: isMobile ? '16px' : '0 0 12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', fontSize: isMobile ? '14px' : '11px', fontWeight: isMobile ? 700 : 800, color: isMobile ? '#0f172a' : '#94a3b8', textTransform: isMobile ? 'none' : 'uppercase', cursor: isMobile ? 'pointer' : 'default' }}
                  disabled={!isMobile}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{isMobile && <BrainCircuit size={18} color="#64748b" />} Atlas Memory</div>
                  {isMobile && <ChevronDown size={18} color="#64748b" style={{ transform: memoryOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />}
                </button>
                {(!isMobile || memoryOpen) && (
                  <div style={{ padding: isMobile ? '0 16px 16px 16px' : '0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {data.memory.map((m, idx) => (
                      <div key={idx} style={{ fontSize: '13px', color: '#475569', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <div style={{ marginTop: '6px', width: 4, height: 4, borderRadius: '50%', background: '#94a3b8', flexShrink: 0 }} />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Only: Suggested Actions scrollable row */}
              {isMobile && (
                <div>
                   <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>Suggested Next Actions</div>
                   <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }} className="hide-scrollbar">
                    {data.suggestedQuestions.map((q, idx) => (
                      <button key={idx} onClick={() => handleExecute(q)} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#334155', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity Feed */}
              <div style={{ background: isMobile ? '#fff' : 'transparent', borderRadius: isMobile ? '12px' : 0, border: isMobile ? '1px solid #e2e8f0' : 'none', overflow: 'hidden' }}>
                <button 
                  onClick={() => setFeedOpen(!feedOpen)} 
                  style={{ width: '100%', padding: isMobile ? '16px' : '0 0 12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', fontSize: isMobile ? '14px' : '11px', fontWeight: isMobile ? 700 : 800, color: isMobile ? '#0f172a' : '#94a3b8', textTransform: isMobile ? 'none' : 'uppercase', cursor: isMobile ? 'pointer' : 'default' }}
                  disabled={!isMobile}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{isMobile && <ActivitySquare size={18} color="#64748b" />} Recent Activity Feed</div>
                  {isMobile && <ChevronDown size={18} color="#64748b" style={{ transform: feedOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />}
                </button>
                {(!isMobile || feedOpen) && (
                  <div style={{ padding: isMobile ? '0 16px 16px 16px' : '0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {data.feed.map((f, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', width: '36px' }}>{f.time}</div>
                        <div style={{ flex: 1, fontSize: '12px', color: '#64748b' }}>{f.text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* COMMAND BAR (Sticky Bottom) */}
        <div style={{ height: '64px', background: '#fff', borderTop: '1px solid #e2e8f0', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', height: '40px' }}>
            <span style={{ position: 'absolute', left: '16px', color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>&gt;</span>
            <input 
              type="text" 
              placeholder={`Ask Atlas as ${data.role || modes.find(m => m.id === mode).label}...`}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleExecute()}
              style={{ width: '100%', height: '100%', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '20px', paddingLeft: '40px', paddingRight: '16px', fontSize: '14px', outline: 'none', color: '#0f172a', fontWeight: 500 }}
            />
          </div>
          <button style={{ width: 40, height: 40, borderRadius: '50%', background: '#f1f5f9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', flexShrink: 0 }}>
            <Mic size={18} />
          </button>
          <button onClick={() => handleExecute()} style={{ width: 40, height: 40, borderRadius: '50%', background: '#0f172a', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', flexShrink: 0 }}>
            <Zap size={18} />
          </button>
        </div>

      </motion.div>
    </AnimatePresence>
  );
}

"use client";

import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useCopilot } from '../../context/CopilotContext';
import { toast } from 'react-hot-toast';
import { askCatalogAssistant } from '../../services/catalogAIService';
import { useCatalogStore } from '../../store/useCatalogStore';
import { usePatientStore } from '../../store/usePatientStore';
import { useOrderStore } from '../../store/useOrderStore';
import { useLeadStore } from '../../store/useLeadStore';
import { useAtlasChat } from '../../hooks/useAtlasChat';
import { Mic, Send, Zap, Command, X, Search, FileText, BrainCircuit, Users, Stethoscope, Briefcase, Pill, Target, ActivitySquare } from 'lucide-react';
import StatusChip from '../ui/StatusChip';
import GenUIRenderer from './GenUIRenderer';

// Subcomponents moved OUTSIDE the main render to satisfy React Hooks ESLint rules.
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

function generateAtlasContext(role, pathname, record) {
  const { storeData } = record || {};
  const data = {
    recommendation: {
      what: 'No immediate action required.',
      why: 'All systems operational and KPIs are within normal ranges.',
      action: 'Explore dashboard or ask me anything.',
      impact: 'Maintain current velocity',
      timeSaved: '0 hrs',
      buttons: ['Review Metrics', 'Ask Atlas', 'Dismiss']
    },
    whyThinks: ['No critical alerts detected in the current module.'],
    alerts: [],
    memory: [],
    feed: [],
    timeline: [],
    suggestedQuestions: ['What are my top priorities today?', 'Summarize recent activity']
  };

  if (!storeData) return data;

  // Context-aware logic based on active module and role
  const isOrders = pathname?.includes('/orders');
  const isPatients = pathname?.includes('/patients');
  const isLeads = pathname?.includes('/leads');

  if (isOrders || (storeData.pendingOrders > 0 && role === 'operations')) {
    data.recommendation.what = `${storeData.pendingOrders} orders are currently pending review.`;
    data.recommendation.why = 'Pending orders directly impact SLA and customer satisfaction.';
    data.recommendation.action = 'Review and approve pending orders to maintain SLA.';
    data.recommendation.impact = 'Prevents delivery delays';
    data.alerts = [{ id: 1, icon: '📦', label: `${storeData.pendingOrders} Pending Orders`, bg: '#fffbeb', color: '#b45309', border: '#fde68a', details: ['Action required'] }];
    data.whyThinks = ['SLA drops below 98% if orders remain pending for >24h.'];
    data.suggestedQuestions = ['Show pending orders', 'Approve all orders'];
  } else if (isLeads || (storeData.activeLeads > 0 && role === 'commercial')) {
    data.recommendation.what = `${storeData.activeLeads} active leads require follow-up.`;
    data.recommendation.why = 'Lead conversion drops significantly after 48h of inactivity.';
    data.recommendation.action = 'Engage with top priority leads in your pipeline.';
    data.recommendation.impact = 'Increases conversion rate';
    data.alerts = [{ id: 1, icon: '💰', label: `${storeData.activeLeads} Active Leads`, bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', details: ['High priority'] }];
    data.suggestedQuestions = ['Who should I call next?', 'Summarize new leads'];
  } else if (isPatients && role === 'medical') {
    data.recommendation.what = `You have ${storeData.totalPatients} active patients.`;
    data.recommendation.why = 'Regular monitoring ensures better clinical outcomes.';
    data.recommendation.action = 'Review patients with recent lab results.';
    data.recommendation.impact = 'Improved patient care';
    data.alerts = [];
    data.suggestedQuestions = ['Which patients need protocol adjustments?', 'Analyze recent blood tests'];
  } else if (role === 'ceo' || role === 'executive') {
    data.recommendation.what = `Platform Overview: ${storeData.totalOrders} Orders, ${storeData.activeLeads} Active Leads.`;
    data.recommendation.why = 'High-level metrics indicate stable growth but operations may need attention.';
    data.recommendation.action = 'Review order fulfillment metrics.';
    data.alerts = storeData.pendingOrders > 0 ? [{ id: 1, icon: '⚠', label: `${storeData.pendingOrders} Ops Delays`, bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', details: ['Fulfillment bottleneck'] }] : [];
  }

  return data;
}

export default function CopilotWorkspacePanel() {
  const { isOpen, closeCopilot, openCopilot, contextData, mode, setMode, isPinned, setIsPinned } = useCopilot();
  const [query, setQuery] = useState('');
  const { messages: chatMessages, sendMessage, isProcessing } = useAtlasChat();
  const router = useRouter();
  const pathname = usePathname();

  // Inject real context from Zustand Stores
  const { products } = useCatalogStore();
  const { patients } = usePatientStore();
  const { orders } = useOrderStore();
  const { leads } = useLeadStore();

  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
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

    const richContext = {
      ...contextData,
      storeData: {
        totalProducts: products?.length || 0,
        totalPatients: patients?.length || 0,
        totalOrders: orders?.length || 0,
        totalLeads: leads?.length || 0,
        // Calculate dynamic KPIs for the prompt
        pendingOrders: orders?.filter(o => o.status === 'pending')?.length || 0,
        activeLeads: leads?.filter(l => l.status === 'new' || l.status === 'contacted')?.length || 0
      }
    };
  // Listen for Ask Atlas events from anywhere (e.g. DataTable)
  useEffect(() => {
    const handleAtlasQuery = (e) => {
      const { query: q, record } = e.detail;
      if (!isOpen && openCopilot) {
        openCopilot();
      }
      setQuery(q);
      // Wait for states to update, then execute
      setTimeout(() => {
        const fakeBtn = document.getElementById('atlas-execute-btn');
        if (fakeBtn) fakeBtn.click();
      }, 100);
    };
    window.addEventListener('ATLAS_PREFILL_QUERY', handleAtlasQuery);
    return () => window.removeEventListener('ATLAS_PREFILL_QUERY', handleAtlasQuery);
  }, [isOpen]);
  // Generate Data from Engine with dynamic storeData
  const data = generateAtlasContext(mode, pathname, { ...contextData?.record, storeData: richContext.storeData });

  const handleExecute = async (overrideQuery) => {
    const text = overrideQuery || query;
    if (!text.trim()) return;
    
    setQuery('');
    
    // Using new real chat logic
    await sendMessage(text, contextData?.record);
  };

  const handleActionClick = (actionName) => {
    if (actionName === 'Review Metrics') {
        router.push('/admin/analytics');
    } else {
        toast.success(`Action Triggered: ${actionName}`);
    }
  };

  if (!isOpen) return null;

  return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        style={{
          position: isPinned ? 'fixed' : 'fixed',
          top: 0,
          bottom: 0,
          right: 0,
          left: isPinned ? 'auto' : 0,
          width: isPinned ? '400px' : '100%',
          zIndex: isPinned ? 90 : 99999, // Lower z-index if pinned so topbar is clickable if we want, but actually 90 is above main layout
          backgroundColor: '#f8fafc',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: isPinned ? '-4px 0 20px rgba(0,0,0,0.05)' : 'none',
          borderLeft: isPinned ? '1px solid #e2e8f0' : 'none',
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
            {!isPinned && <StatusChip />}
            <button 
              onClick={() => setIsPinned(!isPinned)} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: isPinned ? '#0f172a' : '#64748b', padding: 0 }}
              title={isPinned ? "Unpin Panel" : "Pin to Side"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
            </button>
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
        <div style={{ flex: 1, display: 'flex', flexDirection: isMobile || isPinned ? 'column' : 'row', overflowY: isMobile || isPinned ? 'auto' : 'hidden', overflowX: 'hidden' }}>
          
          {/* LEFT: MAIN WORKSPACE (Hidden if Pinned) */}
          {!isPinned && (
            <div style={{ width: isMobile ? '100%' : '70%', height: isMobile ? 'auto' : '100%', overflowY: isMobile ? 'visible' : 'auto', background: '#f8fafc', padding: isMobile ? '16px' : '32px', display: 'flex', flexDirection: 'column', gap: '24px', flexShrink: 0 }}>
            
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
          )}

          {/* RIGHT: CONTEXT PANEL */}
          <div style={{ width: isMobile || isPinned ? '100%' : '30%', height: isMobile ? 'auto' : '100%', borderLeft: isMobile || isPinned ? 'none' : '1px solid #e2e8f0', background: isMobile ? '#f8fafc' : '#fff', display: 'flex', flexDirection: 'column', padding: '0', overflowY: isMobile ? 'visible' : 'auto', flexShrink: 0 }}>
            
            {/* Desktop: Render components normally. Mobile: Render as accordions or stack */}
            <div style={{ padding: isMobile ? '0 16px 16px' : '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Alerts */}
              <div>
                <div><div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>Context Alerts</div></div>
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

              {/* Chat History */}
              {chatMessages.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '16px', flex: 1 }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Conversation</div>
                  {chatMessages.map(msg => (
                    <div key={msg.id} style={{ display: 'flex', gap: '12px', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      {msg.role === 'atlas' && (
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Zap size={14} color="#fff" />
                        </div>
                      )}
                      <div style={{ 
                        background: msg.role === 'user' ? '#e2e8f0' : '#f8fafc', 
                        padding: '12px 16px', 
                        borderRadius: '12px', 
                        border: msg.role === 'atlas' ? '1px solid #e2e8f0' : 'none',
                        color: '#0f172a',
                        fontSize: '14px',
                        maxWidth: '85%',
                        lineHeight: 1.5
                      }}>
                        <GenUIRenderer text={msg.text} />
                      </div>
                    </div>
                  ))}
                  {isProcessing && (
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-start' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Zap size={14} color="#fff" />
                      </div>
                      <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '14px' }}>
                        Thinking...
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* COMMAND BAR (Sticky Bottom) */}
        <div style={{ height: '64px', background: '#fff', borderTop: '1px solid #e2e8f0', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', height: '40px' }}>
            <span style={{ position: 'absolute', left: '16px', color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>&gt;</span>
            <input 
              type="text" 
              placeholder={`Ask Atlas as ${data.role || (modes.find(m => m.id === mode)?.label || 'Atlas')}...`}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleExecute()}
              style={{ width: '100%', height: '100%', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '20px', paddingLeft: '40px', paddingRight: '16px', fontSize: '14px', outline: 'none', color: '#0f172a', fontWeight: 500 }}
            />
          </div>
          <button style={{ width: 40, height: 40, borderRadius: '50%', background: '#f1f5f9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', flexShrink: 0 }}>
            <Mic size={18} />
          </button>
          <button id="atlas-execute-btn" onClick={() => handleExecute()} style={{ width: 40, height: 40, borderRadius: '50%', background: '#0f172a', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', flexShrink: 0 }}>
            <Zap size={18} />
          </button>
        </div>

      </motion.div>
    );
}

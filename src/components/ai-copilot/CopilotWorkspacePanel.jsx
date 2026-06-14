import X from "lucide-react/dist/esm/icons/x";
import Command from "lucide-react/dist/esm/icons/command";
import Activity from "lucide-react/dist/esm/icons/activity";
import HeartPulse from "lucide-react/dist/esm/icons/heart-pulse";
import Target from "lucide-react/dist/esm/icons/target";
import Briefcase from "lucide-react/dist/esm/icons/briefcase";
import User from "lucide-react/dist/esm/icons/user";
import MessageSquare from "lucide-react/dist/esm/icons/message-square";
import PhoneCall from "lucide-react/dist/esm/icons/phone-call";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import PlayCircle from "lucide-react/dist/esm/icons/play-circle";
import PlusCircle from "lucide-react/dist/esm/icons/plus-circle";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import FileText from "lucide-react/dist/esm/icons/file-text";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import LineChart from "lucide-react/dist/esm/icons/line-chart";
import Users from "lucide-react/dist/esm/icons/users";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Shield from "lucide-react/dist/esm/icons/shield";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import Minimize2 from "lucide-react/dist/esm/icons/minimize-2";
import Maximize2 from "lucide-react/dist/esm/icons/maximize-2";
import Clock from "lucide-react/dist/esm/icons/clock";
import Zap from "lucide-react/dist/esm/icons/zap";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCopilot } from '../../context/CopilotContext';


























import { toast } from 'react-hot-toast';
import { askCatalogAssistant } from '../../services/catalogAIService';

export default function CopilotWorkspacePanel() {
  const { isOpen, closeCopilot, contextData, mode, setMode, panelWidth, setPanelWidth } = useCopilot();
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const modes = [
    { id: 'operational', icon: Activity, label: 'Ops' },
    { id: 'medical', icon: HeartPulse, label: 'Medical' },
    { id: 'commercial', icon: Target, label: 'Comm' },
    { id: 'executive', icon: Briefcase, label: 'Exec' },
    { id: 'personal', icon: User, label: 'Personal' }
  ];

  const getContextualActions = () => {
    switch (mode) {
      case 'medical':
        return [
          { label: 'Summarize Patient', icon: FileText, primary: false, onClick: () => { toast.success('Patient summary generated.'); closeCopilot(); } },
          { label: 'Show Risk Factors', icon: AlertTriangle, primary: false, onClick: () => { toast('Loading risk factors...', { icon: '🧬' }); closeCopilot(); } },
          { label: 'Recommend Follow-Up', icon: PhoneCall, primary: true, onClick: () => { navigate('/admin/patients'); closeCopilot(); } },
          { label: 'Analyze Program Compliance', icon: Activity, primary: false, onClick: () => { navigate('/admin/patients'); closeCopilot(); } },
        ];
      case 'commercial':
        return [
          { label: 'Growth Opportunities', icon: Target, primary: true, onClick: () => { navigate('/admin/leads'); closeCopilot(); } },
          { label: 'Revenue Trends', icon: LineChart, primary: false, onClick: () => { navigate('/admin/payments-received'); closeCopilot(); } },
          { label: 'Engagement Analysis', icon: Users, primary: false, onClick: () => { navigate('/admin/orders'); closeCopilot(); } },
        ];
      case 'executive':
        return [
          { label: 'Cash Flow Summary', icon: DollarSign, primary: true, onClick: () => { navigate('/admin/payments-received'); closeCopilot(); } },
          { label: 'Outstanding Payments', icon: AlertTriangle, primary: false, onClick: () => { navigate('/admin/invoices'); closeCopilot(); } },
          { label: 'Risk Analysis', icon: Shield, primary: false, onClick: () => { navigate('/admin/quotations'); closeCopilot(); } },
        ];
      default: // operational
        return [
          { label: 'Pending Approvals', icon: CheckCircle2, primary: true, onClick: () => { navigate('/admin/approvals'); closeCopilot(); } },
          { label: 'Overdue Tasks', icon: AlertTriangle, primary: false, onClick: () => { navigate('/admin/sales-orders'); closeCopilot(); } },
          { label: 'System Alerts', icon: Activity, primary: false, onClick: () => { navigate('/admin/rfq'); closeCopilot(); } },
        ];
    }
  };

  const getInsights = () => {
    if (mode === 'medical') {
      return [
        { title: 'Compliance Alert', text: 'Patient compliance has decreased by 15% over the last 2 weeks. A follow-up is highly recommended to adjust protocols.', icon: HeartPulse, type: 'warning', actionLink: '/admin/patients' }
      ];
    } else if (mode === 'commercial') {
      return [
        { title: 'Revenue Risk', text: 'Revenue growth for this clinic slowed 18% this month. Review physician engagement metrics.', icon: Target, type: 'error', actionLink: '/admin/leads' }
      ];
    } else {
      return [
        { title: 'Task Summary', text: 'You have 3 high-priority operational tasks pending for this week.', icon: Activity, type: 'info', actionLink: '/admin/approvals' }
      ];
    }
  };

  const actions = getContextualActions();
  const insights = getInsights();

  // Map icons for dynamic rendering
  const IconMap = { FileText: Activity, AlertTriangle: Activity, PhoneCall: PhoneCall, Target: Target, LineChart: Activity, Users: User, DollarSign: Activity, Shield: Shield, CheckCircle2: Activity };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [sheetHeight, setSheetHeight] = useState('50vh');

  const handleDragEnd = (event, info) => {
    const offset = info.offset.y;
    const velocity = info.velocity.y;
    if (offset > 100 || velocity > 500) {
      if (sheetHeight === '85vh') setSheetHeight('50vh');
      else if (sheetHeight === '50vh') setSheetHeight('25vh');
      else closeCopilot();
    } else if (offset < -100 || velocity < -500) {
      if (sheetHeight === '25vh') setSheetHeight('50vh');
      else if (sheetHeight === '50vh') setSheetHeight('85vh');
    }
  };

  const handleSendMessage = async () => {
    if (!query.trim()) return;
    setIsProcessing(true);
    const toastId = toast.loading('Atlas AI is analyzing context...', { icon: '🧠' });
    try {
      // Inyectar contexto dinámico de la página (Opción A)
      const pageContext = {
        ...contextData,
        currentUrl: window.location.href,
        pathname: window.location.pathname,
        mode: mode
      };
      
      const response = await askCatalogAssistant({
        message: query,
        catalogContext: pageContext,
        history: []
      });
      
      toast.success('Atlas AI Response Received', { id: toastId });
      // Aquí se debería mostrar la respuesta en el historial de chat, pero por ahora lo alertamos
      alert(`Atlas AI: ${response}`);
      setQuery('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to communicate with Atlas AI', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeCopilot}
              style={{
                position: 'fixed', inset: 0,
                backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999
              }}
            />
          )}
          <motion.div
            initial={isMobile ? { y: '100%', opacity: 0 } : { x: '100%', opacity: 0 }}
            animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
            exit={isMobile ? { y: '100%', opacity: 0 } : { x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag={isMobile ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={isMobile ? handleDragEnd : undefined}
            style={{
              position: 'fixed',
              ...(isMobile ? {
                bottom: 0, left: 0, right: 0, height: sheetHeight,
                borderTopLeftRadius: '24px', borderTopRightRadius: '24px'
              } : {
                top: 0, right: 0, height: '100vh', 
                width: panelWidth === 'compact' ? '80px' : panelWidth === 'full' ? 'clamp(600px, 50vw, 800px)' : 'clamp(320px, 30vw, 450px)',
                borderLeft: '1px solid var(--border)'
              }),
              backgroundColor: 'var(--surface, #ffffff)',
              boxShadow: isMobile ? '0 -8px 32px rgba(0,0,0,0.1)' : '-8px 0 32px rgba(0,0,0,0.08)',
              zIndex: 10000,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Mobile drag handle */}
            {isMobile && (
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0.5rem 0', background: 'var(--background)' }}>
                <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'var(--border)' }} />
              </div>
            )}
            {/* Header */}
          <div style={{
            padding: panelWidth === 'compact' ? '1.5rem 0' : '1.5rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: panelWidth === 'compact' ? 'center' : 'space-between',
            background: 'var(--background)'
          }}>
            {panelWidth !== 'compact' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Command size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Atlas AI</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    Action-Oriented Copilot
                  </div>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexDirection: panelWidth === 'compact' ? 'column' : 'row' }}>
              {panelWidth === 'compact' && (
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Command size={18} />
                </div>
              )}
              {!isMobile && (
                <>
                  {panelWidth !== 'compact' && (
                    <button onClick={() => setPanelWidth('compact')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.5rem' }}>
                      <ChevronRight size={18} />
                    </button>
                  )}
                  {panelWidth === 'compact' && (
                    <button onClick={() => setPanelWidth('context')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.5rem' }}>
                      <ChevronLeft size={18} />
                    </button>
                  )}
                  {panelWidth !== 'full' && panelWidth !== 'compact' && (
                    <button onClick={() => setPanelWidth('full')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.5rem' }}>
                      <Maximize2 size={16} />
                    </button>
                  )}
                  {panelWidth === 'full' && (
                    <button onClick={() => setPanelWidth('context')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.5rem' }}>
                      <Minimize2 size={16} />
                    </button>
                  )}
                </>
              )}
              <button onClick={closeCopilot} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.5rem' }}>
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Mode Switcher */}
          <div style={{ display: panelWidth === 'compact' ? 'flex' : 'flex', flexDirection: panelWidth === 'compact' ? 'column' : 'row', padding: '0.75rem 1rem', gap: '0.5rem', borderBottom: '1px solid var(--border)', overflowX: panelWidth === 'compact' ? 'visible' : 'auto', flexWrap: 'nowrap', WebkitOverflowScrolling: 'touch', alignItems: panelWidth === 'compact' ? 'center' : 'stretch' }} className="hide-scrollbar">
            {modes.map(m => {
              const Icon = m.icon;
              const isActive = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  title={m.label}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                    padding: panelWidth === 'compact' ? '0.75rem' : '0.4rem 0.75rem', borderRadius: '99px',
                    border: 'none',
                    background: isActive ? 'var(--primary)' : 'transparent',
                    color: isActive ? 'white' : 'var(--text-muted)',
                    fontSize: '0.75rem', fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                >
                  <Icon size={16} /> {panelWidth !== 'compact' && m.label}
                </button>
              );
            })}
          </div>

          {/* Main Area (Hidden if compact) */}
          {panelWidth !== 'compact' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Enhanced Context */}
              <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Zap size={14} /> Current Context
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ color: 'var(--text-muted)' }}>Module</span><span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{contextData.entityType}</span></div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ color: 'var(--text-muted)' }}>Category</span><span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{contextData.category}</span></div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ color: 'var(--text-muted)' }}>Results</span><span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{contextData.results}</span></div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ color: 'var(--text-muted)' }}>Role</span><span style={{ fontWeight: 600, color: 'var(--primary)' }}>Operations Mgr</span></div>
                </div>
              </div>

              {/* Recommended Actions */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                  Recommended Actions
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: panelWidth === 'full' ? '1fr 1fr' : '1fr', gap: '0.5rem' }}>
                  {actions.map((act, i) => {
                    const Icon = act.icon;
                    return (
                      <button 
                        key={i} 
                        className={act.primary ? "gcp-btn-primary" : "gcp-btn-secondary"} 
                        onClick={act.onClick ? act.onClick : () => toast.success(`Action triggered: ${act.label}`)}
                        style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}
                      >
                        <Icon size={16} /> {act.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Actionable Insight Cards */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                  Active Findings
                </div>
                {insights.map((ins, i) => {
                  const Icon = ins.icon;
                  const colorMap = { warning: 'var(--warning)', error: 'var(--error)', info: 'var(--primary)' };
                  return (
                    <div key={i} style={{ background: 'var(--background)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: colorMap[ins.type] || 'var(--primary)' }}>
                        <Icon size={16} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{ins.title}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                        {ins.text}
                      </p>
                      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button onClick={() => { navigate(ins.actionLink); closeCopilot(); toast.success(`Task created: ${ins.title}`); }} className="gcp-btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Create Task</button>
                        <button onClick={() => { navigate(ins.actionLink); closeCopilot(); toast.success(`Review scheduled for: ${ins.title}`); }} className="gcp-btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Schedule Review</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Timeline AI */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                  Recent AI Findings
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { time: '08:32', text: 'Low stock detected for TB-500', icon: AlertTriangle },
                    { time: '09:12', text: 'Revenue anomaly detected in Q3 projection', icon: Target },
                    { time: '10:01', text: 'Inactive physician identified in East Region', icon: User }
                  ].map((event, i) => {
                    const EventIcon = event.icon;
                    return (
                      <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, width: '40px', paddingTop: '2px' }}>{event.time}</div>
                        <div style={{ flex: 1, display: 'flex', gap: '0.5rem', padding: '0.75rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                          <EventIcon size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{event.text}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* AI Memory (Recent Commands) */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                  Recent Commands
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {['Show inactive clinics', 'Analyze physician performance', 'Review low stock'].map((cmd, i) => (
                    <button key={i} onClick={() => { setQuery(cmd); toast('Command copied to input', { icon: '⌨️' }); }} style={{ background: 'var(--background)', border: '1px solid var(--border)', padding: '0.4rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={12} color="var(--text-muted)" /> {cmd}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Input Area (Hidden if compact) */}
          {panelWidth !== 'compact' && (
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: 'var(--background)' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Ask Atlas to analyze, summarize, or execute..."
                  className="gcp-input"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  disabled={isProcessing}
                  style={{ width: '100%', paddingRight: '2.5rem', borderRadius: '24px' }}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isProcessing}
                  style={{ 
                    position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)',
                    background: isProcessing ? 'var(--text-muted)' : 'var(--primary)', color: 'white', border: 'none',
                    width: '28px', height: '28px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: isProcessing ? 'not-allowed' : 'pointer'
                  }}
                >
                  <MessageSquare size={14} />
                </button>
              </div>
            </div>
          )}

        </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
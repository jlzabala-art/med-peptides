import Menu from "lucide-react/dist/esm/icons/menu";
import X from "lucide-react/dist/esm/icons/x";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Stethoscope from "lucide-react/dist/esm/icons/stethoscope";
import Bot from "lucide-react/dist/esm/icons/bot";
import Zap from "lucide-react/dist/esm/icons/zap";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import BrainCircuit from "lucide-react/dist/esm/icons/brain-circuit";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import Package from "lucide-react/dist/esm/icons/package";
import React, { useState, useEffect, useCallback } from 'react';










import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

// ── Agents visible to the doctor (clinical subset) ─────────────────────────
const DOCTOR_AGENTS = [
  { key: 'rag',           label: 'Research AI',    emoji: '🧠', color: '#8b5cf6', desc: 'Literatura clínica y RAG',  queryType: 'rag'           },
  { key: 'prescription',  label: 'Rx Analyzer',    emoji: '📋', color: 'var(--color-primary)', desc: 'Prescripciones y catálogo', queryType: 'prescription'  },
  { key: 'clinical_data', label: 'Clinical Data',  emoji: '🔬', color: 'var(--color-success)', desc: 'Labs y biomarcadores',       queryType: 'clinical_data' },
  { key: 'logistics',     label: 'Logistics',      emoji: '📦', color: '#f59e0b', desc: 'Stock y pedidos',            queryType: 'logistics'     },
];

function openClinicalAI(query = '', displayText = '') {
  window.dispatchEvent(new CustomEvent('open-clinical-ai', {
    detail: { query, autoSend: Boolean(query), displayText },
  }));
}

// ── Mini agent pill in sidebar ─────────────────────────────────────────────
function AgentPill({ agent, status, onClick }) {
  const isActive = status === 'active';
  return (
    <button
      onClick={onClick}
      title={`Activar ${agent.label}`}
      style={{
        width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        padding: '0.5rem 0.7rem', borderRadius: '10px',
        background: isActive ? `${agent.color}10` : 'rgba(0,0,0,0.02)',
        transition: 'all 0.18s',
        opacity: isActive ? 1 : 0.5,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = `${agent.color}18`; }}
      onMouseLeave={e => { e.currentTarget.style.background = isActive ? `${agent.color}10` : 'rgba(0,0,0,0.02)'; }}
    >
      <span style={{ fontSize: '1rem', lineHeight: 1, flexShrink: 0 }}>{agent.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {agent.label}
        </div>
        <div style={{ fontSize: '0.62rem', color: 'var(--color-text-tertiary)', marginTop: '0.05rem',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {agent.desc}
        </div>
      </div>
      {isActive && (
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success)', flexShrink: 0,
          animation: 'agentPulse 2s infinite', boxShadow: '0 0 0 0 rgba(16,185,129,0.4)' }} />
      )}
    </button>
  );
}

export default function PhysicianLayout({
  children,
  tabs,
  activeTab,
  onTabChange,
  onLogout,
  doctorName,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [agentStatuses, setAgentStatuses] = useState(
    Object.fromEntries(DOCTOR_AGENTS.map(a => [a.key, a.key === 'clinical_data' ? 'pending' : 'active']))
  );
  const [agentsExpanded, setAgentsExpanded] = useState(true);

  // Load real agent statuses from Firestore
  useEffect(() => {
    getDoc(doc(db, 'ai_config', 'agents')).then(snap => {
      if (!snap.exists()) return;
      const data = snap.data();
      setAgentStatuses(prev => {
        const next = { ...prev };
        for (const a of DOCTOR_AGENTS) {
          if (data[a.key]?.status) next[a.key] = data[a.key].status;
        }
        return next;
      });
    }).catch(() => {});
  }, []);

  const activeTabMeta = tabs.find(t => t.id === activeTab) || tabs[0];
  const activeAgents = DOCTOR_AGENTS.filter(a => agentStatuses[a.key] === 'active').length;

  const handleMobileTabClick = (tabId) => {
    onTabChange(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', color: '#0f172a' }}>

      {/* ── MOBILE TOP BAR ── */}
      <div className="rp-mobile-only" style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '60px',
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1rem', zIndex: 999,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Stethoscope size={18} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 800, fontSize: '0.88rem', letterSpacing: '-0.01em' }}>
            Practitioner Portal
          </span>
        </div>
        <button onClick={() => openClinicalAI()} style={{
          display: 'flex', alignItems: 'center', gap: '0.35rem',
          background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
          color: 'var(--color-bg-surface)', border: 'none', borderRadius: '8px',
          padding: '0.45rem 0.85rem', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
        }}>
          <Bot size={13} /> AI
        </button>
      </div>

      {/* ── MOBILE DRAWER ── */}
      {mobileMenuOpen && (
        <div className="rp-mobile-only" style={{
          position: 'fixed', top: '60px', left: 0, bottom: 0, width: '280px',
          background: 'var(--color-bg-surface)', zIndex: 998, borderRight: '1px solid #e2e8f0',
          overflowY: 'auto', padding: '1.25rem', boxShadow: '4px 0 20px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)', marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Stethoscope size={16} /> {doctorName}
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.5rem' }}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => handleMobileTabClick(tab.id)} style={{
                  textAlign: 'left', background: isActive ? 'rgba(0,54,102,0.06)' : 'none',
                  border: 'none', padding: '0.75rem 1rem', borderRadius: '10px',
                  color: isActive ? 'var(--primary)' : 'var(--color-text-secondary)',
                  fontWeight: isActive ? 800 : 600, fontSize: '0.88rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.65rem',
                }}>
                  {tab.icon && <tab.icon size={17} />} {tab.label}
                </button>
              );
            })}
          </nav>
          {/* Mobile agent list */}
          <div style={{ paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-text-tertiary)',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              🤖 Agentes AI activos
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {DOCTOR_AGENTS.map(a => (
                <AgentPill key={a.key} agent={a} status={agentStatuses[a.key]}
                  onClick={() => { openClinicalAI('', a.label); setMobileMenuOpen(false); }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── DESKTOP LAYOUT ── */}
      <div style={{ display: 'flex', minHeight: '100vh' }}>

        {/* ── LEFT SIDEBAR ── */}
        <aside className="rp-desktop-only doctor-sidebar-new" style={{
          width: 240, flexShrink: 0, position: 'fixed', top: 0, bottom: 0, left: 0,
          background: 'var(--color-bg-surface)', borderRight: '1px solid #e2e8f0',
          display: 'flex', flexDirection: 'column',
          boxShadow: '2px 0 12px rgba(0,0,0,0.04)', zIndex: 100,
          overflowY: 'auto',
        }}>
          {/* Logo / Doctor identity */}
          <div style={{
            padding: '1.5rem 1.25rem 1rem',
            borderBottom: '1px solid #f1f5f9',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--primary), #1e40af)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Stethoscope size={18} color="var(--color-bg-surface)" />
              </div>
              <div>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--color-text-tertiary)',
                  textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Practitioner Portal
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
                  {doctorName || 'Dr. Practitioner'}
                </div>
              </div>
            </div>
          </div>

          {/* Main nav */}
          <nav style={{ padding: '1rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--color-border)',
              textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 0.5rem', marginBottom: '0.5rem' }}>
              Navegación
            </div>
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => onTabChange(tab.id)} style={{
                  width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.7rem',
                  padding: '0.7rem 0.85rem', borderRadius: '10px',
                  background: isActive ? 'rgba(0,54,102,0.07)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--color-text-secondary)',
                  fontWeight: isActive ? 800 : 600, fontSize: '0.85rem',
                  transition: 'all 0.15s',
                  borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <tab.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* AI Agents section */}
          <div style={{ padding: '0 0.75rem 1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
            {/* Section header */}
            <button onClick={() => setAgentsExpanded(v => !v)} style={{
              width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 0.5rem', borderRadius: '8px', background: 'transparent',
              marginBottom: agentsExpanded ? '0.75rem' : 0,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--color-text-tertiary)',
                textTransform: 'uppercase', letterSpacing: '0.08em', flex: 1 }}>
                🤖 Agentes AI
              </div>
              <span style={{
                fontSize: '0.62rem', fontWeight: 800, padding: '0.15rem 0.45rem',
                borderRadius: '999px', background: 'rgba(16,185,129,0.12)', color: 'var(--color-success)',
              }}>
                {activeAgents}/{DOCTOR_AGENTS.length} activos
              </span>
              <ChevronRight size={12} color="var(--color-text-tertiary)"
                style={{ transform: agentsExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {agentsExpanded && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {DOCTOR_AGENTS.map(a => (
                  <AgentPill key={a.key} agent={a} status={agentStatuses[a.key]}
                    onClick={() => openClinicalAI('', `Activating ${a.label}`)} />
                ))}
              </div>
            )}

            {/* Quick launch AI */}
            <button onClick={() => openClinicalAI()} style={{
              width: '100%', marginTop: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              padding: '0.7rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              color: 'var(--color-bg-surface)', fontWeight: 800, fontSize: '0.8rem',
              boxShadow: '0 4px 16px rgba(139,92,246,0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(139,92,246,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(139,92,246,0.3)'; }}
            >
              <Bot size={14} /> Consultar AI Clínico
            </button>
          </div>

          {/* Sign out */}
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #f1f5f9' }}>
            <button onClick={onLogout} style={{
              width: '100%', textAlign: 'left', border: '1px solid #e2e8f0', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.6rem 0.85rem', borderRadius: '9px', background: 'white',
              color: 'var(--color-text-tertiary)', fontSize: '0.78rem', fontWeight: 700, transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.color = 'var(--color-danger)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-tertiary)'; }}
            >
              <ArrowLeft size={14} /> Cerrar sesión
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT AREA ── */}
        <main className="rp-desktop-only" style={{
          marginLeft: 240, flex: 1, minWidth: 0,
          padding: '0 2rem 4rem 2rem',
          minHeight: '100vh',
        }}>
          {/* Top bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1.5rem 0 1.25rem', marginBottom: '0.5rem',
            borderBottom: '1px solid #f1f5f9',
          }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: '#0f172a',
                letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {activeTabMeta?.icon && <activeTabMeta.icon size={20} color="var(--primary)" />}
                {activeTabMeta?.label || 'Dashboard'}
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Agent status badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.4rem 0.85rem', borderRadius: '999px',
                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-success)',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success)',
                  display: 'inline-block', animation: 'agentPulse 2s infinite' }} />
                {activeAgents} active agent{activeAgents !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          {children}
        </main>

        {/* ── MOBILE CONTENT ── */}
        <div className="rp-mobile-only" style={{ paddingTop: '60px', flex: 1, padding: '80px 1rem 2rem' }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes agentPulse {
          0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
          70%  { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
          100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }
        @media (max-width: 1023px) {
          .doctor-sidebar-new { display: none !important; }
        }
        @media (min-width: 1024px) {
          .rp-mobile-only { display: none !important; }
        }
      `}</style>
    </div>
  );
}
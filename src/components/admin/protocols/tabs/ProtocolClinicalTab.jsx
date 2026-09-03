"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateClinicalCompleteness } from '../../../../utils/protocolHelpers';
import { enrichProtocolSection } from '../../../../services/atlasProtocolEnricher';
import notifier from '../../../../services/NotificationService';


import dynamic from 'next/dynamic';

const ProtocolExecutiveSummary = dynamic(() => import('../ProtocolExecutiveSummary'), {
  loading: () => <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Executive Summary...</div>,
});
const ProtocolTreatment = dynamic(() => import('./ProtocolTreatment'), {
  loading: () => <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Treatment Plan...</div>,
});
const ProtocolDosage = dynamic(() => import('./ProtocolDosage'), {
  loading: () => <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Dosage & Administration Calendar...</div>,
});
const ProtocolPatientJourney = dynamic(() => import('./ProtocolPatientJourney'), {
  loading: () => <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Patient Journey...</div>,
});
const ProtocolMonitoring = dynamic(() => import('./ProtocolMonitoring'), {
  loading: () => <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Monitoring & Check-ins...</div>,
});
const ProtocolLabs = dynamic(() => import('./ProtocolLabs'), {
  loading: () => <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Laboratory & Biomarkers...</div>,
});
import { ChevronDown, ChevronUp, Activity, Clock, Calendar, Users, TrendingUp, BrainCircuit } from '@/lib/icons';

// ── Collapsible Section wrapper ───────────────────────────────────────────────
function ClinicalSection({ id, icon: Icon, title, subtitle, color = '#3b82f6', defaultOpen = false, open, onToggle, children }) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = open !== undefined ? open : internalOpen;

  const handleToggle = () => {
    if (onToggle) onToggle(!isOpen);
    else setInternalOpen(!isOpen);
  };

  return (
    <div id={`section-${id}`} style={{
      border: open ? `1px solid ${color}33` : '1px solid var(--border)',
      borderRadius: '20px',
      overflow: 'hidden',
      background: 'var(--surface)',
      boxShadow: open ? `0 12px 30px -10px ${color}26` : '0 2px 8px rgba(0,0,0,0.02)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      marginBottom: '1rem',
      scrollMarginTop: '180px'
    }}>
      {/* Section header */}
      <button
        onClick={handleToggle}
        style={{
          width: '100%', textAlign: 'left', cursor: 'pointer', border: 'none',
          padding: '1rem 1.25rem',
          background: `linear-gradient(to right, ${color}08, var(--surface))`,
          borderBottom: open ? '1px solid var(--border)' : 'none',
          display: 'flex', alignItems: 'center', gap: '1.5rem',
          transition: 'background 0.3s ease',
        }}
      >
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
          background: `${color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 12px -4px ${color}30`,
          border: `1px solid ${color}33`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <Icon size={20} color={color} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: color, marginBottom: '0.1rem', letterSpacing: '-0.01em' }}>{title}</div>
          {subtitle && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1.4 }}>{subtitle}</div>}
        </div>
        <div style={{
          width: '30px', height: '30px', borderRadius: '50%',
          background: open ? `${color}1a` : 'var(--background-alt)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.3s',
          border: `1px solid ${open ? `${color}33` : 'transparent'}`
        }}>
          {open
            ? <ChevronUp size={18} color={color} />
            : <ChevronDown size={18} color="var(--text-muted)" />}
        </div>
      </button>

      {/* Animated content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '1.25rem', background: 'var(--surface)' }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Progress bar across sections ──────────────────────────────────────────────
function ClinicalCompletionBar({ protocol, onChipClick, aiWorkingStates = {} }) {
  const { checks, pct, color } = calculateClinicalCompleteness(protocol);

  return (
    <div style={{
      padding: '1.25rem',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      boxShadow: '0 8px 30px -12px rgba(0,0,0,0.06)',
      marginBottom: '1.5rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>Clinical Completeness</h3>
            <span 
              title="Calculated in real-time based on the amount of medical data provided."
              style={{ cursor: 'help', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '18px', height: '18px', borderRadius: '50%', background: 'var(--background-alt)', color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 800 }}>
              ?
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Click any missing section below to have Atlas AI generate it for you instantly.
          </p>
        </div>
        <div style={{
          background: `${color}1a`,
          color: color,
          padding: '0.6rem 1.2rem',
          borderRadius: '99px',
          fontWeight: 900,
          fontSize: '1.2rem',
          border: `1px solid ${color}33`,
          boxShadow: `0 4px 12px -4px ${color}4d`
        }}>
          {pct}%
        </div>
      </div>
      
      {/* Progress Bar */}
      <div style={{ position: 'relative', height: '10px', background: 'var(--border-light)', borderRadius: '99px', overflow: 'hidden' }}>
        <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: `linear-gradient(90deg, ${color}, ${color}99)`, borderRadius: '99px' }}
        />
      </div>

      {/* Chips */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {checks.map(c => (
          <div key={c.label} onClick={() => onChipClick(c.id)} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '12px',
            background: c.done ? '#10b98114' : '#eff6ff',
            border: `1px solid ${c.done ? '#10b98140' : '#bfdbfe'}`,
            color: c.done ? '#059669' : '#1d4ed8',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: c.done ? '0 2px 8px -2px rgba(16, 185, 129, 0.1)' : '0 2px 8px -2px rgba(59, 130, 246, 0.2)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = c.done ? '0 4px 12px -4px rgba(16, 185, 129, 0.2)' : '0 4px 12px -4px rgba(59, 130, 246, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = c.done ? '0 2px 8px -2px rgba(16, 185, 129, 0.1)' : '0 2px 8px -2px rgba(59, 130, 246, 0.2)';
          }}
          >
            <div style={{
              width: '18px', height: '18px', borderRadius: '50%',
              background: c.done ? '#10b981' : '#3b82f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '0.6rem', fontWeight: 900
            }}>
              {aiWorkingStates[c.id] ? '🤖' : (c.done ? '✓' : '✨')}
            </div>
            {aiWorkingStates[c.id] ? `Working on ${c.label}...` : c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProtocolClinicalTab({ protocol, onUpdate, onAiUpdate, protocolId, onProductClick }) {
  const [openSection, setOpenSection] = useState('overview');
  const [aiWorkingStates, setAiWorkingStates] = useState({});

  const handleChipClick = (id, isDone) => {
    if (isDone) {
      // Already done: just scroll to the section so the user can review it
      setOpenSection(id);
      setTimeout(() => {
        const el = document.getElementById(`section-${id}`);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 180;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 350);
      return;
    }

    const sectionLabels = { overview: 'Overview', treatment: 'Treatment Plan', dosage: 'Dosage', monitoring: 'Monitoring', labs: 'Labs & Biomarkers', progress: 'Progress Tracker' };
    const label = sectionLabels[id] || id;

    const runAi = async () => {
      setAiWorkingStates(prev => ({ ...prev, [id]: true }));
      try {
        const patch = await enrichProtocolSection(protocolId, protocol, id);
        if (onAiUpdate) onAiUpdate(patch);
        else if (onUpdate) onUpdate(patch);
        notifier.toast(`"${label}" has been completed by Atlas AI.`, 'success');
      } catch (err) {
        console.error('[ProtocolClinicalTab] AI enrichment failed:', err);
        notifier.toast(`Atlas AI could not complete "${label}": ${err.message}`, 'error');
      } finally {
        setAiWorkingStates(prev => ({ ...prev, [id]: false }));
      }
    };

    runAi();
  };

  const handleToggleSection = (id, isOpen) => {
    if (isOpen) {
      setOpenSection(id);
      setTimeout(() => {
        const el = document.getElementById(`section-${id}`);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 180;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 350);
    } else if (openSection === id) {
      setOpenSection(null);
    }
  };

  const handleOpenSectionAndScroll = (id) => {
    setOpenSection(id);
    setTimeout(() => {
      const el = document.getElementById(`section-${id}`);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 180;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 350);
  };
  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

      {/* Completeness strip with AI trigger */}
      <ClinicalCompletionBar
        protocol={protocol}
        aiWorkingStates={aiWorkingStates}
        onChipClick={(id) => {
          const checks = calculateClinicalCompleteness(protocol).checks;
          const c = checks.find(x => x.id === id);
          handleChipClick(id, c?.done);
        }}
      />

      {/* 1 — Overview */}
      <ClinicalSection
        id="overview"
        icon={Activity}
        title="Executive Overview"
        subtitle="Protocol summary, category, difficulty level, and AI confidence score"
        color="#3b82f6"
        open={openSection === 'overview'}
        onToggle={(val) => handleToggleSection('overview', val)}
      >
        <ProtocolExecutiveSummary protocol={protocol} onUpdate={onUpdate} onCardClick={handleOpenSectionAndScroll} />
      </ClinicalSection>

      {/* 2 — Treatment Plan */}
      <ClinicalSection id="treatment" icon={Activity} title="Treatment Plan" subtitle="Structured timeline and phases" color="#0ea5e9" open={openSection === 'treatment'} onToggle={(open) => handleToggleSection('treatment', open)}>
        <ProtocolTreatment 
          protocol={protocol} 
          onUpdate={onUpdate} 
          onProductClick={onProductClick}
          onEnrichTreatment={() => handleChipClick('treatment', false)}
          onEnrichMonitoring={() => handleChipClick('monitoring', false)}
        />
      </ClinicalSection>

      {/* 3 — Dosage & Calendar */}
      <ClinicalSection
        id="dosage"
        icon={Calendar}
        title="Dosage & Administration Calendar"
        subtitle="Weekly dosing schedule, reconstitution instructions, injection calendar"
        color="#0ea5e9"
        open={openSection === 'dosage'}
        onToggle={(val) => handleToggleSection('dosage', val)}
      >
        <ProtocolDosage protocol={protocol} onUpdate={onUpdate} />
      </ClinicalSection>

      {/* 4 — Patient Journey */}
      <ClinicalSection
        id="patient"
        icon={Users}
        title="Patient Journey"
        subtitle="What the patient will experience — symptoms, improvements, and adherence by phase"
        color="#f59e0b"
        open={openSection === 'patient'}
        onToggle={(val) => handleToggleSection('patient', val)}
      >
        <ProtocolPatientJourney protocol={protocol} onUpdate={onUpdate} />
      </ClinicalSection>

      {/* 5 — Monitoring */}
      <ClinicalSection
        id="monitoring"
        icon={TrendingUp}
        title="Monitoring & Check-ins"
        subtitle="Cadence, expected biomarker evolution, red flags, and side-effect management"
        color="#10b981"
        open={openSection === 'monitoring'}
        onToggle={(val) => handleToggleSection('monitoring', val)}
      >
        <ProtocolMonitoring 
          protocol={protocol} 
          onUpdate={onUpdate} 
          onEnrichMonitoring={() => handleChipClick('monitoring', false)}
        />
      </ClinicalSection>

      {/* 6 — Labs */}
      <ClinicalSection
        id="labs"
        icon={BrainCircuit}
        title="Laboratory & Biomarkers"
        subtitle="Required tests, baseline vs target values, genomics, and AI lab insights"
        color="#e11d48"
        open={openSection === 'labs'}
        onToggle={(val) => handleToggleSection('labs', val)}
      >
        <ProtocolLabs protocol={protocol} onUpdate={onUpdate} onProductClick={onProductClick} />
      </ClinicalSection>

    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ChevronUp from 'lucide-react/dist/esm/icons/chevron-up';
import Activity from 'lucide-react/dist/esm/icons/activity';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Users from 'lucide-react/dist/esm/icons/users';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import BrainCircuit from 'lucide-react/dist/esm/icons/brain-circuit';

import ProtocolExecutiveSummary from '../ProtocolExecutiveSummary';
import ProtocolTreatment from './ProtocolTreatment';
import ProtocolDosage from './ProtocolDosage';
import ProtocolPatientJourney from './ProtocolPatientJourney';
import ProtocolMonitoring from './ProtocolMonitoring';
import ProtocolLabs from './ProtocolLabs';

// ── Collapsible Section wrapper ───────────────────────────────────────────────
function ClinicalSection({ id, icon: Icon, title, subtitle, color = 'var(--primary)', defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: '14px',
      overflow: 'hidden',
      background: 'var(--surface)',
    }}>
      {/* Section header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', textAlign: 'left', cursor: 'pointer', border: 'none',
          padding: '1rem 1.25rem',
          background: open ? `color-mix(in srgb, ${color} 8%, var(--surface))` : 'var(--surface)',
          borderBottom: open ? '1px solid var(--border)' : 'none',
          display: 'flex', alignItems: 'center', gap: '0.85rem',
          transition: 'background 0.2s',
        }}
      >
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
          background: `color-mix(in srgb, ${color} 15%, transparent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={color} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: open ? color : 'var(--text-main)' }}>{title}</div>
          {subtitle && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{subtitle}</div>}
        </div>
        {open
          ? <ChevronUp size={18} color="var(--text-muted)" />
          : <ChevronDown size={18} color="var(--text-muted)" />}
      </button>

      {/* Animated content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Progress bar across sections ──────────────────────────────────────────────
function ClinicalCompletionBar({ protocol }) {
  const checks = [
    { label: 'Overview', done: !!(protocol?.protocol_name && protocol?.therapeutic_category) },
    { label: 'Treatment', done: !!(protocol?.phases?.length > 0 || protocol?.duration_weeks) },
    { label: 'Dosage',    done: !!(protocol?.dosage_schedule?.length > 0 || protocol?.weekly_doses) },
    { label: 'Monitoring', done: !!(protocol?.monitoring_cadence || protocol?.check_in_weeks) },
    { label: 'Labs',      done: !!(protocol?.required_labs?.length > 0 || protocol?.biomarkers?.length > 0) },
  ];
  const completed = checks.filter(c => c.done).length;
  const pct = Math.round((completed / checks.length) * 100);
  const color = pct === 100 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{
      padding: '0.85rem 1.25rem',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '14px',
      display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1, minWidth: '200px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Clinical Completeness</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 900, color }}>{pct}%</span>
        </div>
        <div style={{ height: '6px', borderRadius: '99px', background: 'var(--border)', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ height: '100%', background: color, borderRadius: '99px' }}
          />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {checks.map(c => (
          <span key={c.label} style={{
            padding: '2px 8px', borderRadius: '99px', fontSize: '0.68rem', fontWeight: 700,
            background: c.done ? '#dcfce7' : 'var(--border)',
            color: c.done ? '#166534' : 'var(--text-muted)',
          }}>{c.done ? '✓' : '○'} {c.label}</span>
        ))}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProtocolClinicalTab({ protocol, onUpdate }) {
  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

      {/* Completeness strip */}
      <ClinicalCompletionBar protocol={protocol} />

      {/* 1 — Overview (always open) */}
      <ClinicalSection
        id="overview"
        icon={Activity}
        title="Executive Overview"
        subtitle="Protocol summary, category, difficulty level, and AI confidence score"
        color="#3b82f6"
        defaultOpen
      >
        <ProtocolExecutiveSummary protocol={protocol} onUpdate={onUpdate} />
      </ClinicalSection>

      {/* 2 — Treatment Plan */}
      <ClinicalSection
        id="treatment"
        icon={Clock}
        title="Treatment Plan"
        subtitle="Phases, clinical milestones, timeline, and therapeutic objectives"
        color="#7c3aed"
      >
        <ProtocolTreatment protocol={protocol} onUpdate={onUpdate} />
      </ClinicalSection>

      {/* 3 — Dosage & Calendar */}
      <ClinicalSection
        id="dosage"
        icon={Calendar}
        title="Dosage & Administration Calendar"
        subtitle="Weekly dosing schedule, reconstitution instructions, injection calendar"
        color="#0ea5e9"
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
      >
        <ProtocolMonitoring protocol={protocol} onUpdate={onUpdate} />
      </ClinicalSection>

      {/* 6 — Labs */}
      <ClinicalSection
        id="labs"
        icon={BrainCircuit}
        title="Laboratory & Biomarkers"
        subtitle="Required tests, baseline vs target values, genomics, and AI lab insights"
        color="#e11d48"
      >
        <ProtocolLabs protocol={protocol} onUpdate={onUpdate} />
      </ClinicalSection>

    </div>
  );
}

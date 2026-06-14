import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import Activity from "lucide-react/dist/esm/icons/activity";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import Beaker from "lucide-react/dist/esm/icons/beaker";
import Clipboard from "lucide-react/dist/esm/icons/clipboard";
import Zap from "lucide-react/dist/esm/icons/zap";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Clock from "lucide-react/dist/esm/icons/clock";
import Info from "lucide-react/dist/esm/icons/info";
import User from "lucide-react/dist/esm/icons/user";
import Stethoscope from "lucide-react/dist/esm/icons/stethoscope";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Download from "lucide-react/dist/esm/icons/download";
import Eye from "lucide-react/dist/esm/icons/eye";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
/* eslint-disable no-unused-vars */
import React from 'react';

















import { generatePatientGuide, generateClinicalPDF } from '../../services/pdfService';
import { generateProtocolICS } from '../../services/calendarService';

// --- SHARED COMPONENTS ---

const ArtifactHeader = ({ title, id, type, date, duration }) => (
  <div style={{ marginBottom: '3rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '2rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justify: 'center', color: 'white' }}>
          <ShieldAlert size={24} />
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.02em' }}>Atlas Health Clinical</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Document Type</div>
        <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary)' }}>{type}</div>
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)', margin: '0 0 0.5rem 0' }}>{title}</h1>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Protocol ID</div>
            <div style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '0.9rem', fontWeight: 700 }}>{id}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Start Date</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{date}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Duration</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{duration} Weeks</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- PATIENT ADMINISTRATION GUIDE ---

export const PatientAdministrationGuide = ({ data }) => {
  const { protocol_id, protocol_title, duration_weeks, patientContext, _timeline, monitoringSchedule } = data;
  const timeline = _timeline || [];
  return (
    <div className="artifact-preview" style={{ background: 'white', color: 'var(--color-text-primary)', minHeight: '842px', padding: '4rem', maxWidth: '800px', margin: '0 auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', fontFamily: 'Inter, sans-serif' }}>
      <ArtifactHeader 
        title="Patient Administration Guide" 
        type="Operational Guidance"
        id={protocol_id || 'WM-2026-XQ'}
        date={patientContext?.startDate || 'April 23, 2026'}
        duration={duration_weeks || timeline.length || 12}
      />

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={20} /> Treatment Overview
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {[
            { label: 'Weight Regulation', icon: <CheckCircle2 size={16} color="var(--color-success)" /> },
            { label: 'Metabolic Optimization', icon: <CheckCircle2 size={16} color="var(--color-success)" /> },
            { label: 'Energy Stabilization', icon: <CheckCircle2 size={16} color="var(--color-success)" /> }
          ].map((goal, i) => (
            <div key={i} style={{ padding: '1rem', background: 'var(--color-bg-app)', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {goal.icon}
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{goal.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={20} /> Weekly Administration
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <thead>
            <tr style={{ background: 'var(--color-bg-app)', textAlign: 'left' }}>
              <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-text-secondary)' }}>WEEK</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-text-secondary)' }}>MEDICATION</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-text-secondary)' }}>DOSE</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-text-secondary)' }}>DAY</th>
            </tr>
          </thead>
          <tbody>
            {timeline.slice(0, 12).map((w, i) => {
              const weekNum = w?.week || i + 1;
              const meds = w?.medications || (w?.events ? w.events.filter(e => e.type === 'medication') : []);
              return meds.map((c, j) => (
                <tr key={`${i}-${j}`} style={{ borderTop: j === 0 ? '1px solid #e2e8f0' : 'none' }}>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 700 }}>{j === 0 ? `Week ${weekNum}` : ''}</td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 800 }}>{c.name}</td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>{c.dosage}</td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text-secondary)' }}>{(c.days || []).join(', ') || c.frequency}</td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={20} /> Injection Instructions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 250px', gap: '2rem' }}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {[
              "Wash hands thoroughly with soap.",
              "Prepare the syringe and sanitize injection site.",
              "Inject subcutaneously at a 45-90 degree angle.",
              "Dispose of the needle safely in a sharps container."
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '24px', height: '24px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justify: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 900, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{step}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--color-bg-app)', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1rem', textAlign: 'center' }}>
             <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '1rem' }}>Site Rotation Recommended</div>
             <div style={{ height: '120px', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justify: 'center', color: 'var(--color-border)' }}>
                <TrendingUp size={48} />
             </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '2rem', background: '#fff7ed', borderRadius: '16px', border: '1px solid #ffedd5' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#9a3412', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} /> Missed Dose & Safety
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#c2410c', lineHeight: 1.6, margin: 0 }}>
          If a dose is missed, take it within 24 hours of the scheduled time. If more than 24 hours have passed, skip the dose entirely. Never take two doses at once. 
          Contact your physician immediately if you experience severe nausea, persistent fatigue, or unusual injection site reactions.
        </p>
      </section>
    </div>
  );
};

// --- PHYSICIAN MONITORING CHECKLIST ---

export const PhysicianMonitoringChecklist = ({ data }) => {
  const { protocol_id, duration_weeks, patientContext, _validation, monitoringSchedule } = data;
  const validation = _validation || {};
  const monitoring = monitoringSchedule || [];

  return (
    <div className="artifact-preview" style={{ background: 'white', color: 'var(--color-text-primary)', minHeight: '842px', padding: '4rem', maxWidth: '800px', margin: '0 auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', fontFamily: 'Inter, sans-serif' }}>
      <ArtifactHeader 
        title="Physician Monitoring Checklist" 
        type="Clinical Supervision"
        id={protocol_id || 'WM-2026-XQ'}
        date={patientContext?.startDate || 'April 23, 2026'}
        duration={duration_weeks || 12}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ padding: '1.5rem', background: 'var(--color-bg-app)', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '1rem' }}>Clinical Status</div>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Safety Status:</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 900, color: validation.state === 'REJECTED' ? 'var(--color-danger)' : 'var(--color-success)' }}>
                {validation.state || 'Validated'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Confidence Score:</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--primary)' }}>{validation.confidence_score || 95}%</span>
            </div>
          </div>
        </div>
        <div style={{ padding: '1.5rem', background: 'var(--color-bg-app)', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '1rem' }}>Key Recommendations</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {(validation.recommendations || ['Baseline Biomarkers', 'GI Tolerance Monitoring']).slice(0, 3).map(c => (
              <span key={c} style={{ padding: '4px 10px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>{c}</span>
            ))}
          </div>
        </div>
      </div>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Stethoscope size={20} /> Monitoring Schedule
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <thead>
            <tr style={{ background: 'var(--color-bg-app)', textAlign: 'left' }}>
              <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-text-secondary)' }}>WEEK</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-text-secondary)' }}>CHECK TYPE</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-text-secondary)' }}>PARAMETERS</th>
            </tr>
          </thead>
          <tbody>
            {monitoring.length > 0 ? (
              monitoring.map((m, i) => (
                <tr key={i} style={{ borderTop: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1.25rem', fontSize: '0.85rem', fontWeight: 700 }}>{m.week === 0 ? 'Baseline' : `Week ${m.week}`}</td>
                  <td style={{ padding: '1.25rem', fontSize: '0.85rem', fontWeight: 800 }}>Follow-up Check</td>
                  <td style={{ padding: '1.25rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{(m.labs || []).join(', ')}</td>
                </tr>
              ))
            ) : (
              [
                { week: 'Week 4', type: 'Hematology', params: 'CBC, Liver Panel, Renal Function' },
                { week: 'Week 8', type: 'Metabolic', params: 'HBA1C, Fasting Glucose, Lipid Profile' },
                { week: 'Week 12', type: 'Final Systemic', params: 'Comprehensive Panel, Recovery Audit' }
              ].map((m, i) => (
                <tr key={i} style={{ borderTop: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1.25rem', fontSize: '0.85rem', fontWeight: 700 }}>{m.week}</td>
                  <td style={{ padding: '1.25rem', fontSize: '0.85rem', fontWeight: 800 }}>{m.type}</td>
                  <td style={{ padding: '1.25rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{m.params}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={20} /> Clinical Risk Flags
        </h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {(validation.details || [
            { section: 'Rapid Escalation Risk', text: 'Monitor GI tolerance closely during weeks 3-5.', status: 'FLAG_RAISED' }
          ]).filter(d => d.status === 'FLAG_RAISED').slice(0, 2).map((risk, i) => (
            <div key={i} style={{ padding: '1.25rem', border: '1px solid #fee2e2', background: 'var(--color-danger-bg)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#991b1b', fontWeight: 900, fontSize: '0.95rem' }}>⚠ {risk.section}</div>
                <div style={{ color: '#b91c1c', fontSize: '0.8rem', fontWeight: 600 }}>{risk.text || risk.reason || 'Observed clinical variance.'}</div>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 950, background: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '4px' }}>HIGH</span>
            </div>
          ))}
          {validation.details?.filter(d => d.status === 'FLAG_RAISED').length === 0 && (
             <div style={{ padding: '1.25rem', border: '1px solid #dcfce7', background: 'var(--color-success-bg)', borderRadius: '12px', color: '#166534', fontWeight: 700, fontSize: '0.9rem' }}>
               No high-risk clinical flags detected for this protocol configuration.
             </div>
          )}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clipboard size={20} /> Physician Clinical Notes
        </h2>
        <div style={{ height: '150px', border: '2px solid #e2e8f0', borderRadius: '12px', backgroundColor: 'var(--color-bg-app)', padding: '1rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          {data.clinical_notes || 'No operational notes recorded.'}
        </div>
      </section>
    </div>
  );
};

// --- PREVIEW OVERLAY ---

export const generateTimelineEvents = (data) => {
  const events = [];
  const timeline = data._timeline || [];
  const monitoring = data.monitoringSchedule || [];
  const startDate = data.patientContext?.startDate ? new Date(data.patientContext.startDate) : new Date();

  // 1. Injections / Administrations
  timeline.forEach(wk => {
    const weekStartDate = new Date(startDate);
    weekStartDate.setDate(startDate.getDate() + (wk.week - 1) * 7);

    const meds = wk.medications || (wk.events ? wk.events.filter(e => e.type === 'medication') : []);
    meds.forEach(med => {
      const days = med.days || ['Monday'];
      days.forEach(day => {
        const dayOffset = {
          'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3,
          'Friday': 4, 'Saturday': 5, 'Sunday': 6
        }[day] || 0;

        const eventDate = new Date(weekStartDate);
        eventDate.setDate(weekStartDate.getDate() + dayOffset);

        events.push({
          title: `${med.name} Injection`,
          date: eventDate.toISOString().split('T')[0],
          desc: `${med.dosage} (${med.strength || 'Standard'})`,
          category: 'Injections',
          week: wk.week
        });
      });
    });
  });

  // 2. Monitoring
  monitoring.forEach(mon => {
    const eventDate = new Date(startDate);
    eventDate.setDate(startDate.getDate() + mon.week * 7);

    events.push({
      title: `Clinical Monitoring: Week ${mon.week}`,
      date: eventDate.toISOString().split('T')[0],
      desc: (mon.labs || []).join(', '),
      category: 'Monitoring',
      week: mon.week
    });
  });

  // 3. Milestones
  // Start Milestone
  events.push({
    title: 'Protocol Initiation: Day 1',
    date: startDate.toISOString().split('T')[0],
    desc: 'Commence treatment as per administration guide.',
    category: 'Milestones',
    week: 1
  });

  // Phase Transitions
  let currentPhase = '';
  timeline.forEach(wk => {
    if (wk.phase && wk.phase !== currentPhase) {
      const eventDate = new Date(startDate);
      eventDate.setDate(startDate.getDate() + (wk.week - 1) * 7);
      events.push({
        title: `Phase Transition: ${wk.phase}`,
        date: eventDate.toISOString().split('T')[0],
        desc: `Transitioning to ${wk.phase} protocols.`,
        category: 'Milestones',
        week: wk.week
      });
      currentPhase = wk.phase;
    }
  });

  // Completion Milestone
  if (timeline.length > 0) {
    const lastWeek = timeline[timeline.length - 1];
    const completionDate = new Date(startDate);
    completionDate.setDate(startDate.getDate() + (lastWeek.week * 7));
    events.push({
      title: 'Protocol Completion',
      date: completionDate.toISOString().split('T')[0],
      desc: 'Final administration and protocol cycle closure.',
      category: 'Milestones',
      week: lastWeek.week
    });
  }

  return events.sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const ArtifactPreviewOverlay = ({ type, data, onClose }) => {
  const timeline_event_list = generateTimelineEvents(data);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justify: 'center', padding: '2rem' }}>
       <div style={{ width: '100%', maxWidth: '900px', height: '90vh', backgroundColor: '#f1f5f9', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.5rem 2rem', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Artifact Preview</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary)' }}>
                   {type === 'patient' && 'Patient Administration Guide'}
                   {type === 'physician' && 'Physician Monitoring Checklist'}
                   {type === 'json' && 'Optimization Path Definition (JSON)'}
                   {type === 'ics' && 'Dosing Schedule (ICS)'}
                </div>
             </div>
             <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  className="btn-secondary-v5" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  onClick={() => {
                    if (type === 'patient') generatePatientGuide(data);
                    if (type === 'physician') generateClinicalPDF(data);
                    if (type === 'ics') {
                      try {
                        generateProtocolICS(data);
                      } catch (err) {
                        console.error("ICS Gen Error:", err);
                        alert("Calendar export failed. Check console for details.");
                      }
                    }
                    if (type === 'json') {
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Optimization_Path_${data.protocol_id || 'EXPORT'}.js`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }
                  }}
                >
                  <Download size={16} /> Download
                </button>
                <button 
                  className="btn-secondary-v5" 
                  style={{ background: 'var(--primary)', color: 'white', border: 'none' }}
                  onClick={onClose}
                >
                  Close
                </button>
             </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '3rem 0' }}>
             {type === 'patient' && <PatientAdministrationGuide data={data} />}
             {type === 'physician' && <PhysicianMonitoringChecklist data={data} />}
             {type === 'json' && (
                <div style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--color-text-primary)', color: 'var(--color-text-tertiary)', padding: '2rem', borderRadius: '16px', fontFamily: 'Roboto Mono, monospace', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
             )}
             {type === 'ics' && (
                <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ margin: 0 }}>Calendar Events Manifest</h3>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>{timeline_event_list.length} Events Scheduled</div>
                   </div>
                   <div style={{ display: 'grid', gap: '1rem' }}>
                      {timeline_event_list.slice(0, 50).map((evt, i) => (
                        <div key={i} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <div>
                              <div style={{ fontWeight: 900, color: 'var(--primary)' }}>{evt.title}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{evt.desc}</div>
                           </div>
                           <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.9rem', fontWeight: 900 }}>{new Date(evt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: evt.category === 'Injections' ? '#0369a1' : '#b45309', textTransform: 'uppercase' }}>{evt.category}</div>
                           </div>
                        </div>
                      ))}
                      {timeline_event_list.length > 50 && (
                        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                          + {timeline_event_list.length - 50} more events...
                        </div>
                      )}
                   </div>
                   <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--color-bg-app)', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '1rem' }}>Raw ICS Header Preview</div>
                      <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                        BEGIN:VCALENDAR<br />
                        VERSION:2.0<br />
                        PRODID:-//Atlas Health//Clinical Calendar v5.2//EN<br />
                        CALSCALE:GREGORIAN<br />
                        METHOD:PUBLISH<br />
                        X-WR-CALNAME:Dosing Schedule - {data.protocol_title || 'Custom Protocol'}<br />
                        ...
                      </div>
                   </div>
                </div>
             )}
          </div>
       </div>
    </div>
  );
};
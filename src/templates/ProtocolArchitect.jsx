import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Clock from "lucide-react/dist/esm/icons/clock";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import Layers from "lucide-react/dist/esm/icons/layers";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import Target from "lucide-react/dist/esm/icons/target";
import Zap from "lucide-react/dist/esm/icons/zap";
import Package from "lucide-react/dist/esm/icons/package";
import Syringe from "lucide-react/dist/esm/icons/syringe";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import Info from "lucide-react/dist/esm/icons/info";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import TrendingDown from "lucide-react/dist/esm/icons/trending-down";
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useMemo, useEffect } from 'react';
















import { getProtocolTemplate } from '../repositories/protocolRepository';
import '../styles/architect.css';

/* ─── constants ─────────────────────────────────────────────────── */
const PROTOCOL_ID  = 'wm_001';
const BMI_BRACKETS = [
  { label: 'Normal (18.5–24.9)',  min: 18.5, max: 24.9 },
  { label: 'Overweight (25–29.9)',min: 25,   max: 29.9 },
  { label: 'Obese Class I (30–34.9)',  min: 30, max: 34.9 },
  { label: 'Obese Class II (35–39.9)',min: 35, max: 39.9 },
  { label: 'Obese Class III (≥40)',   min: 40, max: 99  },
];
const PHASE_COLORS = ['var(--color-success)','var(--color-primary)','#8b5cf6','#f59e0b'];
const DRUG_COLORS  = { tirzepatide:'var(--color-primary)', 'mots-c':'var(--color-success)', 'aod-9604':'#f59e0b' };

/* ─── helpers ────────────────────────────────────────────────────── */
const fmt = s => s ? s.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) : '';
const keyOf = id => id?.replace('prd_','').toLowerCase();

function drugDose(dl) {
  if (!dl) return '—';
  if (dl.starting_weekly_dose) return `${dl.starting_weekly_dose}${dl.dose_unit}/wk (start)`;
  if (dl.default_weekly_dose)  return `${dl.default_weekly_dose}${dl.dose_unit}/wk`;
  if (dl.dose_per_administration) return `${dl.dose_per_administration}${dl.dose_unit}/dose`;
  return '—';
}

function freqLabel(f) {
  const map = { weekly:'1×/week', '3x_week':'3×/week', '2x_week':'2×/week', daily:'daily' };
  return map[f] || fmt(f);
}

/* vial estimate: doses_per_week × weeks × vial_mg → vials needed */
function estimateVials(phases, durationWeeks) {
  const totals = {};
  let week = 0;
  phases.forEach(ph => {
    const phWeeks = Math.min(ph.default_duration_weeks, durationWeeks - week);
    if (phWeeks <= 0) return;
    week += phWeeks;
    ph.drugs.forEach(d => {
      const key = d.product_title;
      const dl  = d.dose_logic;
      const dosePerAdmin = dl.starting_weekly_dose ?? dl.default_weekly_dose ?? dl.dose_per_administration ?? 0;
      const freq = { weekly:1, '3x_week':3, '2x_week':2, daily:7 }[dl.administration_frequency] ?? 1;
      const totalDose = dosePerAdmin * freq * phWeeks;
      totals[key] = (totals[key] || 0) + totalDose;
    });
  });
  /* assume 10mg vials for MOTS-C/AOD, 5mg for Tirzepatide */
  const vialSizes = { Tirzepatide:5, 'MOTS-C':10, 'AOD-9604':10 };
  return Object.entries(totals).map(([name, mg]) => ({
    name,
    totalMg: Math.round(mg),
    vials: Math.ceil(mg / (vialSizes[name] ?? 10)),
    vialSize: vialSizes[name] ?? 10,
  }));
}

/* ─── sub-components ─────────────────────────────────────────────── */

function ValidationBadge({ ageRange, bmi, proto }) {
  const supported = proto?.eligibility_rules?.supported_age_groups ?? [];
  const ok = supported.includes(ageRange) && bmi >= 27;
  return ok ? (
    <span className="arch-vbadge arch-vbadge--ok"><CheckCircle2 size={13}/> Eligible Cohort</span>
  ) : (
    <span className="arch-vbadge arch-vbadge--fail"><XCircle size={13}/>
      {!supported.includes(ageRange) ? 'Age range incompatible' : 'BMI < 27: protocol not indicated'}
    </span>
  );
}

function EligibilityPanel({ ageRange, bmi, tolerance, goal, proto }) {
  const AGE_RANGES = proto?.eligibility_rules?.supported_age_groups ?? [];
  const GOALS      = proto?.eligibility_rules?.supported_goals ?? [];
  const ageOk = AGE_RANGES.includes(ageRange);
  const bmiOk = bmi >= 27;
  const goalOk = GOALS.includes(goal);
  const tolProfile = proto?.generator_rules?.tolerance_profiles?.[tolerance] ?? {};
  const contraindications = proto?.eligibility_rules?.contraindications ?? [];
  const cautions = proto?.eligibility_rules?.relative_cautions ?? [];

  return (
    <aside className="arch-sidebar">
      <div className="arch-sidebar__title"><ShieldCheck size={15}/> Eligibility Matrix</div>

      <div className="arch-elig-row">
        <span className="arch-elig-label">Age Range</span>
        <span className={`arch-elig-val ${ageOk?'ok':'fail'}`}>
          {ageOk ? <CheckCircle2 size={12}/> : <XCircle size={12}/>} {ageRange || '—'}
        </span>
      </div>
      <div className="arch-elig-row">
        <span className="arch-elig-label">BMI Bracket</span>
        <span className={`arch-elig-val ${bmiOk?'ok':'fail'}`}>
          {bmiOk ? <CheckCircle2 size={12}/> : <XCircle size={12}/>} {bmi ? `≈${bmi}` : '—'}
        </span>
      </div>
      <div className="arch-elig-row">
        <span className="arch-elig-label">Goal Match</span>
        <span className={`arch-elig-val ${goalOk?'ok':'fail'}`}>
          {goalOk ? <CheckCircle2 size={12}/> : <XCircle size={12}/>} {fmt(goal) || '—'}
        </span>
      </div>
      <div className="arch-elig-row">
        <span className="arch-elig-label">Tolerance</span>
        <span className="arch-elig-val ok">
          <CheckCircle2 size={12}/> {fmt(tolerance)} (max: {fmt(tolProfile.max_intensity)})
        </span>
      </div>

      <div className="arch-sidebar__divider"/>

      <div className="arch-sidebar__sub"><AlertTriangle size={12}/> Contraindications</div>
      <div className="arch-tag-group">
        {contraindications.map((c,i)=>(
          <span key={i} className="arch-tag arch-tag--warn">{fmt(c)}</span>
        ))}
      </div>

      <div className="arch-sidebar__sub" style={{marginTop:'0.75rem'}}><Info size={12}/> Relative Cautions</div>
      <div className="arch-tag-group">
        {cautions.map((c,i)=>(
          <span key={i} className="arch-tag arch-tag--caution">{fmt(c)}</span>
        ))}
      </div>

      {(!ageOk || !bmiOk) && (
        <div className="arch-safety-warn">
          <AlertTriangle size={15}/> Incompatible with protocol definition. Review inclusion criteria before proceeding.
        </div>
      )}
    </aside>
  );
}

function PhaseTimeline({ phases, activePhase, setActivePhase, durationWeeks, proto }) {
  let week = 1;
  return (
    <div className="arch-timeline">
      {phases.map((ph, i) => {
        const dur   = Math.min(ph.default_duration_weeks, Math.max(0, durationWeeks - (week - 1)));
        const start = week; 
        // eslint-disable-next-line
        week += dur;
        const color = PHASE_COLORS[i % PHASE_COLORS.length];
        const checkpoints = proto?.monitoring_plan?.scheduled_checkpoints ?? [];
        const checkpoint = checkpoints.find(c => c.week >= start && c.week < start + dur);
        if (dur <= 0) return null;
        return (
          <button
            key={ph.phase_key}
            className={`arch-phase-card ${activePhase === i ? 'active' : ''}`}
            style={{ '--pc': color, flexGrow: dur }}
            onClick={() => setActivePhase(activePhase === i ? null : i)}
          >
            <div className="arch-phase-card__num">Phase {i+1}</div>
            <div className="arch-phase-card__name">{ph.phase_title}</div>
            <div className="arch-phase-card__weeks">Wk {start}–{start+dur-1}</div>
            {checkpoint && (
              <div className="arch-phase-card__checkpoint">
                <FlaskConical size={10}/> Wk {checkpoint.week} lab review
              </div>
            )}
            <div className="arch-phase-card__bar" style={{width:`${(dur/durationWeeks)*100}%`}}/>
          </button>
        );
      })}
    </div>
  );
}

function PhaseDetail({ phase, index }) {
  const color = PHASE_COLORS[index % PHASE_COLORS.length];
  return (
    <div className="arch-phase-detail" style={{ '--pc': color }}>
      <div className="arch-phase-detail__header">
        <div className="arch-phase-detail__badge" style={{ background: color }}>Phase {index+1}</div>
        <div className="arch-phase-detail__title">{phase.phase_title}</div>
        <div className="arch-phase-detail__dur"><Clock size={12}/> {phase.default_duration_weeks} weeks</div>
      </div>

      <div className="arch-phase-detail__purposes">
        {phase.clinical_purpose.map((p,i)=>(
          <span key={i} className="arch-purpose-badge" style={{ borderColor: color, color }}><Zap size={10}/> {fmt(p)}</span>
        ))}
      </div>

      <div className="arch-drugs-grid">
        {phase.drugs.map((d,i) => {
          const ck = keyOf(d.product_id);
          const dc = DRUG_COLORS[ck] ?? 'var(--color-text-secondary)';
          return (
            <div key={i} className="arch-drug-card" style={{ '--dc': dc }}>
              <div className="arch-drug-card__dot" style={{ background: dc }}/>
              <div className="arch-drug-card__info">
                <div className="arch-drug-card__name">{d.product_title}</div>
                <div className="arch-drug-card__dose">{drugDose(d.dose_logic)}</div>
                <div className="arch-drug-card__freq">
                  <Clock size={10}/> {freqLabel(d.dose_logic.administration_frequency)}
                  &nbsp;·&nbsp;{fmt(d.route)}
                </div>
                {d.dose_logic.role && (
                  <span className="arch-drug-card__role">{fmt(d.dose_logic.role.replace('optional_',''))}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {phase.clinical_events?.length > 0 && (
        <div className="arch-events">
          {phase.clinical_events.map((e,i)=>(
            <div key={i} className="arch-event">
              <span className="arch-event__wk">Wk {e.week}</span>
              <span className="arch-event__title">{e.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SupplyPanel({ phases, durationWeeks, proto }) {
  const vials   = useMemo(() => estimateVials(phases, durationWeeks), [phases, durationWeeks]);
  const econ    = proto?.economics ?? {};
  const ratio   = durationWeeks / 12;
  const adjCost = Math.round(econ.estimated_total_cost * ratio);
  const adjWk   = Math.round(econ.estimated_weekly_cost * ratio);

  return (
    <section className="arch-supply">
      <div className="arch-supply__header"><Package size={16}/> Logistics & Supply Summary</div>
      <div className="arch-supply__grid">
        <table className="arch-vial-table">
          <thead>
            <tr><th>Compound</th><th>Total mg</th><th>Vial size</th><th>Vials needed</th></tr>
          </thead>
          <tbody>
            {vials.map((v,i)=>(
              <tr key={i}>
                <td><span className="arch-compound-dot" style={{background: DRUG_COLORS[v.name.toLowerCase().replace('-','').replace(' ','').replace('mots','mots-c').replace('aod9604','aod-9604')] ?? 'var(--color-text-secondary)'}}/>{v.name}</td>
                <td>{v.totalMg} mg</td>
                <td>{v.vialSize} mg</td>
                <td><strong>{v.vials}</strong></td>
              </tr>
            ))}
            <tr className="arch-vial-table__kit">
              <td colSpan={3}>Reconstitution Kit (BAC water, syringes)</td>
              <td><strong>1 kit / 4 wk</strong></td>
            </tr>
          </tbody>
        </table>

        <div className="arch-cost-card">
          <div className="arch-cost-card__label"><DollarSign size={13}/> Estimated Cycle Budget</div>
          <div className="arch-cost-card__total">${adjCost.toLocaleString()}</div>
          <div className="arch-cost-card__sub">{econ.currency} · {durationWeeks} weeks</div>
          <div className="arch-cost-card__breakdown">
            <div className="arch-cost-row">
              <span>Weekly avg</span><span>${adjWk}/wk</span>
            </div>
            <div className="arch-cost-row">
              <span>Duration</span><span>{durationWeeks} wk</span>
            </div>
          </div>
          <div className="arch-cost-card__note">
            <Info size={11}/> Research budget estimate. Not a personalized quote.
          </div>
        </div>
      </div>

      <div className="arch-outcomes">
        <div className="arch-outcomes__title"><BarChart3 size={14}/> Expected Outcomes (Research Reference)</div>
        <div className="arch-outcomes__grid">
          {Object.entries(proto?.expected_outcomes?.quantitative_ranges ?? {}).map(([k,v])=>(
            <div key={k} className="arch-outcome-chip">
              <TrendingDown size={11}/> <strong>{v}</strong> <span>{fmt(k).replace(/ Percent$/,'%')}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── main ───────────────────────────────────────────────────────── */
export default function ProtocolArchitect() {
  const [proto,      setProto]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [ageRange,   setAgeRange]   = useState('36-50');
  const [bmi,        setBmi]        = useState(32);
  const [goal,       setGoal]       = useState('weight_management');
  const [tolerance,  setTolerance]  = useState('average');
  const [duration,   setDuration]   = useState(12);
  const [activePhase,setActivePhase]= useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProtocolTemplate(PROTOCOL_ID)
      .then((data) => { if (!cancelled) { setProto(data); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const AGE_RANGES  = proto?.eligibility_rules?.supported_age_groups ?? [];
  const GOALS       = proto?.eligibility_rules?.supported_goals ?? [];
  const TOLERANCES  = Object.keys(proto?.generator_rules?.tolerance_profiles ?? {});
  const durationKey = `${duration}_weeks`;
  const durVariant  = proto?.variant_rules?.duration_variants?.[durationKey] ?? {};
  const ageVariant  = proto?.variant_rules?.age_variants?.[ageRange] ?? {};
  const tolProfile  = proto?.generator_rules?.tolerance_profiles?.[tolerance] ?? {};
  const phases      = proto?.phase_blueprints ?? [];

  const isEligible = AGE_RANGES.includes(ageRange) && bmi >= 27 && GOALS.includes(goal);

  if (loading) return (
    <div className="arch-root" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <div style={{ color:'var(--color-text-tertiary)', fontSize:'1rem' }}>Loading protocol…</div>
    </div>
  );

  if (error || !proto) return (
    <div className="arch-root" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <div style={{ color:'#f87171', fontSize:'1rem' }}>
        <AlertTriangle size={18} style={{ marginRight:'0.4rem' }}/>
        Failed to load protocol: {error ?? 'Not found'}
      </div>
    </div>
  );

  return (
    <div className="arch-root">
      {/* RUO Disclaimer bar */}
      <div className="arch-ruo-bar">
        <ShieldCheck size={13}/>
        Institutional Research Use Only — This is a technical reference guide, not a medical prescription.
      </div>

      {/* Page header */}
      <div className="arch-page-header">
        <div className="arch-container">
          <div className="arch-page-header__eyebrow"><Target size={14}/> Protocol Architect</div>
          <h1 className="arch-page-header__title">{proto.protocol_title}</h1>
          <div className="arch-page-header__meta">
            <span>v{proto.protocol_version}</span>
            <span>·</span>
            <span>{proto.protocol_id?.toUpperCase()}</span>
            <span>·</span>
            <ValidationBadge ageRange={ageRange} bmi={bmi} proto={proto}/>
          </div>
        </div>
      </div>

      <div className="arch-container arch-layout">

        {/* ── Left: controls ── */}
        <section className="arch-controls">
          <div className="arch-controls__title"><Layers size={15}/> Cohort Parameters</div>

          <label className="arch-field-label">Clinical Focus</label>
          <select className="arch-select" value={goal} onChange={e=>setGoal(e.target.value)}>
            {GOALS.map(g=><option key={g} value={g}>{fmt(g)}</option>)}
          </select>

          <label className="arch-field-label">Age Range</label>
          <div className="arch-btn-group">
            {AGE_RANGES.map(a=>(
              <button key={a} className={`arch-chip ${ageRange===a?'active':''}`} onClick={()=>setAgeRange(a)}>{a}</button>
            ))}
          </div>

          <label className="arch-field-label">BMI Bracket</label>
          <div className="arch-btn-group arch-btn-group--col">
            {BMI_BRACKETS.map(b=>(
              <button
                key={b.label}
                className={`arch-chip arch-chip--wide ${bmi>=b.min && bmi<=b.max?'active':''}`}
                onClick={()=>setBmi(Math.round((b.min+b.max)/2))}
              >{b.label}</button>
            ))}
          </div>

          <label className="arch-field-label">Tolerance Profile</label>
          <div className="arch-btn-group">
            {TOLERANCES.map(t=>(
              <button key={t} className={`arch-chip ${tolerance===t?'active':''}`} onClick={()=>setTolerance(t)}>{fmt(t)}</button>
            ))}
          </div>

          <label className="arch-field-label">Duration</label>
          <div className="arch-btn-group">
            {['8','12','16','20'].map(d=>(
              <button key={d} className={`arch-chip ${duration===+d?'active':''}`} onClick={()=>setDuration(+d)}>{d} wk</button>
            ))}
          </div>

          {/* Applied variants summary */}
          <div className="arch-variant-box">
            <div className="arch-variant-row"><span>Escalation</span><strong>{fmt(ageVariant.escalation_profile)}</strong></div>
            <div className="arch-variant-row"><span>Monitoring</span><strong>{fmt(ageVariant.monitoring_intensity)}</strong></div>
            <div className="arch-variant-row"><span>Mode</span><strong>{fmt(durVariant.mode)}</strong></div>
            <div className="arch-variant-row"><span>Max Intensity</span><strong>{fmt(tolProfile.max_intensity)}</strong></div>
          </div>
        </section>

        {/* ── Right: eligibility panel ── */}
        <EligibilityPanel ageRange={ageRange} bmi={bmi} tolerance={tolerance} goal={goal} proto={proto}/>
      </div>

      {/* ── Timeline ── */}
      <div className="arch-container" style={{marginTop:'1.5rem'}}>
        {!isEligible && (
          <div className="arch-incompat-banner">
            <AlertTriangle size={16}/>
            <strong>Safety Warning:</strong> Selected cohort parameters are incompatible with protocol definition. Review eligibility matrix before proceeding.
          </div>
        )}

        <div className="arch-section-title"><Clock size={15}/> Phase Timeline — click a phase to inspect</div>
        <PhaseTimeline phases={phases} activePhase={activePhase} setActivePhase={setActivePhase} durationWeeks={duration} proto={proto}/>

        {activePhase !== null && phases[activePhase] && (
          <PhaseDetail phase={phases[activePhase]} index={activePhase}/>
        )}
      </div>

      {/* ── Supply panel ── */}
      <div className="arch-container" style={{marginTop:'2rem', paddingBottom:'4rem'}}>
        <SupplyPanel phases={phases} durationWeeks={duration} proto={proto}/>
      </div>
    </div>
  );
}
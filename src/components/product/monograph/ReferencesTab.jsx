"use client";

import React, { useState } from 'react';
import { 
  BookOpen, 
  ExternalLink, 
  ShieldAlert, 
  Layers, 
  FileText, 
  ChevronRight, 
  Search,
  CheckCircle2
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';

export default function ReferencesTab() {
  const [activeRefCategory, setActiveRefCategory] = useState('regulatory'); // 'regulatory' | 'pharmacology' | 'literature' | 'safety'

  const scientificLiterature = [
    {
      id: 'rosen-2004',
      title: 'Efficacy and safety of subcutaneous bremelanotide in the treatment of erectile dysfunction: Phase II dose-ranging trial',
      authors: 'Rosen RC, Diamond LE, Earle DC, Shadiack AM, Molinoff PB.',
      journal: 'International Journal of Impotence Research',
      year: 2004,
      volume: '16(2): 135–142',
      pmid: '14999221',
      doi: '10.1038/sj.ijir.3901198',
      summary: 'Randomized, double-blind, placebo-controlled study demonstrating that central melanocortin receptor agonist bremelanotide produces statistically significant erectogenic responses in men refractory to PDE5 inhibitors.'
    },
    {
      id: 'kingsberg-2019',
      title: 'Bremelanotide for the Treatment of Hypoactive Sexual Desire Disorder: Two Randomized Phase 3 RECONNECT Trials',
      authors: 'Kingsberg SA, Clayton AH, Portman D, Williams LA, Krop J, Jordan R, Lucas J, Simon JA.',
      journal: 'Obstetrics & Gynecology',
      year: 2019,
      volume: '134(5): 899–908',
      pmid: '31599841',
      doi: '10.1097/AOG.0000000000003514',
      summary: 'Pivotal Phase 3 multicenter trials (RECONNECT) establishing clinical efficacy and safety of subcutaneous bremelanotide 1.75 mg, leading directly to U.S. FDA approval for premenopausal HSDD.'
    },
    {
      id: 'safarinejad-2008',
      title: 'Evaluation of the safety and efficacy of bremelanotide in men with erectile dysfunction who had non-response to sildenafil',
      authors: 'Safarinejad MR, Hosseini SY.',
      journal: 'The Journal of Urology',
      year: 2008,
      volume: '179(3): 1066–1070',
      pmid: '18206941',
      doi: '10.1016/j.juro.2007.10.052',
      summary: 'Demonstrated clinical rescue response in sildenafil non-responders, showing non-vascular central neurogenic pathway recruitment.'
    },
    {
      id: 'diamond-2006',
      title: 'Co-administration of low doses of intranasal or subcutaneous PT-141 with sildenafil produces marked synergy in men with erectile dysfunction',
      authors: 'Diamond LE, Earle DC, Heiman JR, Wiegel M, Foster CA.',
      journal: 'European Urology',
      year: 2006,
      volume: '49(4): 742–748',
      pmid: '16472909',
      doi: '10.1016/j.eururo.2006.01.011',
      summary: 'Documented synergistic interaction between central melanocortinergic stimulus and peripheral nitric oxide/cGMP smooth-muscle relaxation.'
    }
  ];

  return (
    <div className="pds-tab-content pds-references-tab">
      
      {/* ── Sub-navigation Filter Bar ── */}
      <div className="pds-ref-filter-bar">
        {[
          { id: 'regulatory', label: '1. Regulatory & FDA Reference' },
          { id: 'pharmacology', label: '2. Receptor Pharmacology & MOA' },
          { id: 'literature', label: '3. Clinical Literature & PubMed' },
          { id: 'safety', label: '4. Contraindications & Precautions' }
        ].map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setActiveRefCategory(cat.id);
            }}
            className={`pds-ref-filter-btn ${activeRefCategory === cat.id ? 'is-active' : ''}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Section 1: Regulatory & FDA Reference Dossier ── */}
      {(activeRefCategory === 'regulatory' || activeRefCategory === 'all') && (
        <section className="pds-ref-section">
          <h2 style={{
            margin: '0 0 0.85rem 0',
            fontSize: '0.92rem',
            fontWeight: 800,
            color: '#003666',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            1. FDA Commercial Reference Product Dossier
          </h2>

          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.85rem',
            marginBottom: '1rem'
          }}>
            <div>
              <span style={{ fontSize: '0.68rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>Reference Brand</span>
              <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#1e3a8a', marginTop: '2px' }}>Vyleesi® (bremelanotide injection)</div>
            </div>

            <div>
              <span style={{ fontSize: '0.68rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>Application Number</span>
              <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#1e3a8a', marginTop: '2px', fontFamily: 'monospace' }}>NDA 210583</div>
            </div>

            <div>
              <span style={{ fontSize: '0.68rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>FDA Approval Date</span>
              <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#1e3a8a', marginTop: '2px' }}>June 21, 2019</div>
            </div>

            <div>
              <span style={{ fontSize: '0.68rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>NDA Sponsor / Holder</span>
              <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#1e3a8a', marginTop: '2px' }}>Palatin Technologies / AMAG Pharma</div>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
            <strong>Regulatory Guidance:</strong> Vyleesi® is indicated for the treatment of generalized hypoactive sexual desire disorder (HSDD) in premenopausal women. Bremelanotide was developed from the parent peptide Melanotan II by removing the terminal amide and cyclicizing the core hexapeptide sequence to selectively increase affinity for MC4R over MC1R, eliminating tanning side-effects while retaining neurogenic sexual stimulation.
          </p>
        </section>
      )}

      {/* ── Section 2: Receptor Pharmacology & Mechanism ── */}
      {(activeRefCategory === 'pharmacology' || activeRefCategory === 'all') && (
        <section className="pds-ref-section">
          <h2 style={{
            margin: '0 0 0.85rem 0',
            fontSize: '0.92rem',
            fontWeight: 800,
            color: '#003666',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            2. Pharmacodynamics & Receptor Affinity
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem', marginBottom: '0.85rem' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px' }}>
              <strong style={{ fontSize: '0.80rem', color: '#003666' }}>Melanocortin Receptor Binding Affinity:</strong>
              <ul style={{ margin: '6px 0 0 0', paddingLeft: '1.2rem', fontSize: '0.76rem', color: '#475569', lineHeight: 1.5 }}>
                <li><strong>MC4R (Central):</strong> Ki ~ 0.5–1.0 nM (Primary mediator of sexual motivation & erection)</li>
                <li><strong>MC3R (Hypothalamic):</strong> Ki ~ 2.0 nM (Energy homeostasis & secondary arousal)</li>
                <li><strong>MC1R (Melanocytes):</strong> Ki ~ 0.6 nM (Residual skin pigmentation at chronic high doses)</li>
                <li><strong>MC5R (Exocrine):</strong> Ki ~ 10 nM (Minimal clinical relevance)</li>
              </ul>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px' }}>
              <strong style={{ fontSize: '0.80rem', color: '#003666' }}>Neurochemical Mechanism of Action:</strong>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.76rem', color: '#475569', lineHeight: 1.5 }}>
                Binding to MC4R in the paraventricular nucleus (PVN) and medial preoptic area (MPOA) triggers intracellular cAMP accumulation, stimulating downstream oxytocinergic and dopaminergic neural circuits that govern sexual incentive motivation.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── Section 3: Peer-Reviewed Clinical Literature ── */}
      {(activeRefCategory === 'literature' || activeRefCategory === 'all') && (
        <section className="pds-ref-section">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '0.5rem',
            marginBottom: '0.75rem'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '0.92rem',
              fontWeight: 800,
              color: '#003666',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              3. Peer-Reviewed Clinical Trials (PubMed Indexed)
            </h2>
            <span style={{ fontSize: '0.70rem', color: '#64748b' }}>
              {scientificLiterature.length} Primary Citations
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {scientificLiterature.map((study) => (
              <div
                key={study.id}
                className="pds-ref-study-card"
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 3px 0', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.35 }}>
                      {study.title}
                    </h3>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: '4px' }}>
                      {study.authors} — <em style={{ color: '#003666', fontWeight: 600 }}>{study.journal}</em> ({study.year})
                    </div>
                  </div>

                  <a
                    href={`https://pubmed.ncbi.nlm.nih.gov/${study.pmid}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      color: '#0284c7',
                      fontSize: '0.70rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      flexShrink: 0
                    }}
                  >
                    <span>PMID: {study.pmid}</span>
                    <ExternalLink size={11} />
                  </a>
                </div>

                <p style={{ margin: '6px 0 0 0', fontSize: '0.76rem', color: '#334155', lineHeight: 1.45 }}>
                  {study.summary}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Section 4: Clinical Safety & Contraindications ── */}
      {(activeRefCategory === 'safety' || activeRefCategory === 'all') && (
        <section className="pds-ref-section">
          <h2 style={{
            margin: '0 0 0.85rem 0',
            fontSize: '0.92rem',
            fontWeight: 800,
            color: '#991b1b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            4. Clinical Contraindications & Safety Warnings
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px' }}>
              <strong style={{ fontSize: '0.80rem', color: '#991b1b' }}>Absolute Contraindications:</strong>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: '1.2rem', fontSize: '0.76rem', color: '#7f1d1d', lineHeight: 1.4 }}>
                <li>Uncontrolled or refractory hypertension (systolic BP &gt; 160 mmHg or diastolic &gt; 100 mmHg).</li>
                <li>Known cardiovascular disease, history of myocardial infarction, or transient ischemic attack.</li>
                <li>Concurrent use of oral naltrexone or opiate antagonists (reduces naltrexone bioavailability).</li>
              </ul>
            </div>

            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 14px' }}>
              <strong style={{ fontSize: '0.80rem', color: '#92400e' }}>Reported Adverse Reactions Profile:</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.76rem', color: '#78350f', lineHeight: 1.4 }}>
                Transient mild nausea (~40% incidence during initiation; prophylactic administration with antiemetics or pre-dose meals mitigates this), facial flushing (20%), and mild transient headache. Nausea typically resolves within 2 hours.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

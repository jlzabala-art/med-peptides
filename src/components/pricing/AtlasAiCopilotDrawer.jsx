'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Send,
  Bot,
  User,
  CheckCircle2,
  Droplets,
  BookOpen,
  Layers,
  ShieldCheck,
  ArrowRight,
  Dna,
  Activity,
  Zap,
  ThermometerSnowflake,
  Brain,
  HelpCircle,
  Clock
} from 'lucide-react';
import DoctorAiMessageRenderer from '@/components/doctor/DoctorAiMessageRenderer';

const SUGGESTED_INQUIRIES = [
  {
    icon: Droplets,
    iconColor: '#1a73e8',
    iconBg: '#e8f0fe',
    badge: 'Dosing Math',
    title: 'Reconstitution & Syringes',
    subtitle: 'Precise dilution for 10mg Tirzepatide in 2.0mL BAC water on U-100 syringe',
    prompt: 'Calculate reconstitution for 10mg Tirzepatide using 2.0mL BAC water on a 100-unit U-100 syringe for a 2.5mg dose.'
  },
  {
    icon: ShieldCheck,
    iconColor: '#0d9488',
    iconBg: '#f0fdfa',
    badge: 'Tissue Repair',
    title: 'BPC-157 + TB-500 Synergy',
    subtitle: 'VEGF neo-angiogenesis & G-actin migration in tendon-to-bone repair',
    prompt: 'What is the molecular mechanism and synergy between BPC-157 and TB-500 in tendon-to-bone junction repair?'
  },
  {
    icon: Sparkles,
    iconColor: '#7c3aed',
    iconBg: '#faf5ff',
    badge: 'Longevity Cycle',
    title: '60-Day Cellular Longevity',
    subtitle: 'Epithalon telomerase activation + MOTS-c mitochondrial bioenergetics',
    prompt: 'Suggest an evidence-based 60-day longevity protocol combining Epithalon and MOTS-c for cellular health.'
  },
  {
    icon: Brain,
    iconColor: '#ea580c',
    iconBg: '#fff7ed',
    badge: 'Neuro-Cognitive',
    title: 'Semax vs Selank Distinctives',
    subtitle: 'Hippocampal BDNF/TrkB upregulation vs GABA-A slow-wave stabilization',
    prompt: 'Compare the mechanisms of Semax (BDNF/TrkB) and Selank (GABA/enkephalins) for neuro-cognitive optimization.'
  },
  {
    icon: Zap,
    iconColor: '#16a34a',
    iconBg: '#f0fdf4',
    badge: 'Incretin Kinetics',
    title: 'Retatrutide vs Tirzepatide',
    subtitle: 'Triple GLP-1/GIP/Glucagon receptor affinity and titration curve',
    prompt: 'Explain receptor kinetics, titration curves, and satiety synergy for Retatrutide vs Cagrilintide.'
  },
  {
    icon: ThermometerSnowflake,
    iconColor: '#0284c7',
    iconBg: '#f0f9ff',
    badge: 'Storage & Stability',
    title: 'Storage & Refrigeration Stability',
    subtitle: 'Lyophilized powder vs reconstituted liquid stability and half-life',
    prompt: 'What are the exact clinical storage, temperature limits, and half-life parameters for reconstituted lyophilized peptide vials?'
  }
];

const PREBUILT_KNOWLEDGE = {
  reconstitution: `**Atlas Clinical Reconstitution Formulation:**
• **Vial Formulation:** 10 mg Lyophilized Powder
• **Diluent Volume:** 2.0 mL Bacteriostatic Water (0.9% Benzyl Alcohol)
• **Final Solution Concentration:** 5.0 mg / mL (5,000 mcg / mL)

**Syringe Calibration (U-100 Insulin Syringe · 100 Units = 1.0 mL):**
• Each 10 Units (0.10 mL) = **500 mcg (0.5 mg)**
• For a **2.5 mg Starting Dose**: Draw exactly **50 Units (0.50 mL)**.
• For a **5.0 mg Maintenance Dose**: Draw exactly **100 Units (1.00 mL)**.

*Clinical Storage Notice:* Reconstituted solution must be refrigerated immediately at 2°C – 8°C. Protect from direct ultraviolet light. Stable for up to 45 days.`,

  synergy: `**Molecular Synergy Rationale · BPC-157 + TB-500:**
1. **BPC-157 (Body Protection Compound):** Upregulates VEGF and VEGFR2 expression, inducing focal angiogenesis, granulation tissue formation, and collagen type I synthesis. Accelerates tendon-to-bone healing and stabilizes the gastric mucosal barrier.
2. **TB-500 (Thymosin Beta-4):** Acts as the primary cellular G-actin sequestering peptide. Accelerates directional migration of fibroblasts and endothelial progenitor cells into injured tissue matrices, resolving chronic inflammation.
3. **Synergistic Endpoint:** While BPC-157 builds the micro-vascular capillary bed, TB-500 rapidly populates it with regenerative myoblasts and fibroblasts, cutting recovery timelines by up to 50%.`,

  longevity: `**60-Day Cellular Longevity Protocol (Epithalon + MOTS-c):**
• **Phase 1 (Days 1–15): Telomeric & Circadian Reset**
  - *Epithalon 10 mg daily (SQ, morning)* for 10–15 consecutive days.
  - Re-activates telomerase transcriptase and resynchronizes pineal melatonin rhythm.
• **Phase 2 (Days 16–60): Mitochondrial Bioenergetics**
  - *MOTS-c 10 mg 3x weekly (SQ, post-morning mobility or fasting)*.
  - Activates AMPK pathway, increases intracellular GLUT4 translocation, enhances metabolic flexibility, and restores muscle insulin sensitivity.
• **Recommended Volume:** 2x Epithalon 50mg (or 10x 10mg) + 1x MOTS-c 40mg (or 6x 10mg).`,

  neuro: `**Semax vs. Selank Clinical Distinction:**
• **Semax (ACTH 4-10 Heptapeptide):**
  - Primary Mechanism: Potent upregulation of BDNF (Brain-Derived Neurotrophic Factor) and TrkB mRNA in the hippocampus.
  - Indication: Executive focus, neuroprotection following ischemia, working memory, and daytime dopaminergic vigor without sympathetic stimulation.
• **Selank (Tuftsin Analog):**
  - Primary Mechanism: Modulates GABA-A receptor kinetics and inhibits enkephalin-degrading enzymes.
  - Indication: Anxiolysis, down-regulation of generalized stress, cognitive stabilization, and restoration of restorative slow-wave sleep architecture.`,

  glp1: `**Next-Gen Incretin Kinetics · Retatrutide & Cagrilintide:**
• **Retatrutide (Triple Agonist - GLP-1 / GIP / GCGR):**
  - Simultaneous activation of GLP-1 (satiety), GIP (lipolysis & insulin sensitivity), and Glucagon receptor (thermogenesis & resting metabolic rate elevation).
  - Titration Schedule: Initiate at 2.0 mg SQ weekly for 4 weeks; escalate to 4.0 mg, then 8.0 mg at 4-week intervals based on glycemic tolerance.
• **Cagrilintide (Long-Acting Amylin Analog):**
  - Non-incretin neuro-endocrine satiety signaling via area postrema calcitonin receptors. Delays gastric emptying without triggering incretin exhaustion.
• **Stacking Protocol (CagriSema Standard):** Administered once weekly SQ at opposite injection sites to eliminate nausea spikes while achieving synergistic adipocyte reduction.`,

  stability: `**Lyophilized Peptide Stability & Storage Protocol:**
• **Lyophilized (Unopened Powder):** Stable at 2°C – 8°C for up to 24 months. Stable at room temperature (20°C – 25°C) for up to 90 days during shipping without bioactivity loss.
• **Reconstituted Solution:** Must be compounded strictly with Bacteriostatic 0.9% Benzyl Alcohol Water. Must remain refrigerated at 2°C – 8°C at all times. Do not freeze once reconstituted (ice crystals shear delicate secondary peptide bonds).
• **Light & Agitation Sensitive:** Protect from direct sunlight/UV exposure. Never vigorously shake reconstituted vials; gently roll between palms to solubilize.`
};

export default function AtlasAiCopilotDrawer({
  isOpen,
  onClose,
  activeCategory = 'all',
  activeCategoryLabel = null
}) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: activeCategoryLabel
        ? `Hello! I am Atlas Clinical AI Copilot. I see you are exploring ${activeCategoryLabel}. I can assist you with precise reconstitution calculations, clinical posology, receptor affinities, and synergistic protocol stacking. What would you like to formulate?`
        : 'Hello. I am Atlas Clinical AI Copilot. I can assist you with peptide reconstitution math, receptor synergies, protocol durations, and clinical pharmacopeia data. How can I help your practice today?'
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = (textToSend) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query) return;

    const userMsg = { role: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    setTimeout(() => {
      let replyText = '';
      const qLower = query.toLowerCase();

      if (qLower.includes('reconstitut') || qLower.includes('tirzepatide') || qLower.includes('math') || qLower.includes('syringe') || qLower.includes('dilution')) {
        replyText = PREBUILT_KNOWLEDGE.reconstitution;
      } else if (qLower.includes('synergy') || qLower.includes('bpc') || qLower.includes('tb-500') || qLower.includes('repair') || qLower.includes('tendon')) {
        replyText = PREBUILT_KNOWLEDGE.synergy;
      } else if (qLower.includes('longevity') || qLower.includes('epithalon') || qLower.includes('mots-c') || qLower.includes('telomer')) {
        replyText = PREBUILT_KNOWLEDGE.longevity;
      } else if (qLower.includes('semax') || qLower.includes('selank') || qLower.includes('neuro') || qLower.includes('focus') || qLower.includes('bdnf')) {
        replyText = PREBUILT_KNOWLEDGE.neuro;
      } else if (qLower.includes('glp') || qLower.includes('gip') || qLower.includes('retatrutide') || qLower.includes('cagrilintide') || qLower.includes('satiety')) {
        replyText = PREBUILT_KNOWLEDGE.glp1;
      } else if (qLower.includes('stability') || qLower.includes('cold') || qLower.includes('chain') || qLower.includes('storage') || qLower.includes('refrigerat')) {
        replyText = PREBUILT_KNOWLEDGE.stability;
      } else {
        replyText = `### Atlas Clinical Pharmacopeia Guidance\n\nFor **${query}**, the current European and US compounding standard specifies **HPLC-verified ≥99.0%** pure lyophilized peptides packed in sterile borosilicate glass.\n\n• **Solubilization:** Reconstitute strictly with 0.9% Benzyl Alcohol USP Bacteriostatic Water under laminar flow or aseptic conditions.\n• **Reconstituted Storage:** Maintain refrigerated at 2°C – 8°C. Protect from direct ultraviolet sunlight.\n• **Titration:** All clinical protocols require conservative upward micro-dosing titration with dedicated physician oversight.`;
      }

      setMessages(prev => [...prev, { role: 'assistant', text: replyText }]);
      setLoading(false);
    }, 400);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      zIndex: 1100,
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: '#ffffff',
        width: '100%',
        maxWidth: '540px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.15rem 1.4rem',
          borderBottom: '1px solid #334155',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #1a73e8 0%, #0d9488 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(26, 115, 232, 0.4)'
            }}>
              <Sparkles size={18} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
                  Atlas Clinical AI
                </span>
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  background: 'rgba(13, 148, 136, 0.25)',
                  border: '1px solid #14b8a6',
                  color: '#2dd4bf',
                  padding: '1px 6px',
                  borderRadius: '4px'
                }}>
                  v4.8 Verified
                </span>
                {activeCategoryLabel && (
                  <span style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    background: 'rgba(56, 189, 248, 0.2)',
                    border: '1px solid #38bdf8',
                    color: '#7dd3fc',
                    padding: '1px 6px',
                    borderRadius: '4px'
                  }}>
                    {activeCategoryLabel}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Peptide Pharmacopeia, Dosing Math & Synergy Engine
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              padding: '6px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Chat Messages & Suggested Starter Inquiries */}
        <div style={{
          flex: 1,
          padding: '1.25rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          background: '#f8fafc'
        }}>
          {messages.map((m, idx) => (
            <React.Fragment key={idx}>
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: m.role === 'user' ? '85%' : '96%'
                }}
              >
                {m.role === 'assistant' && (
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1a73e8 0%, #0d9488 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                    boxShadow: '0 2px 6px rgba(26, 115, 232, 0.3)'
                  }}>
                    <Bot size={15} />
                  </div>
                )}
                {m.role === 'user' ? (
                  <div style={{
                    background: '#1a73e8', // Google Cloud Blue
                    color: '#ffffff',
                    padding: '10px 14px',
                    borderRadius: '14px 14px 2px 14px',
                    fontSize: '0.82rem',
                    lineHeight: 1.5,
                    boxShadow: '0 2px 6px rgba(26, 115, 232, 0.25)'
                  }}>
                    {m.text}
                  </div>
                ) : (
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    color: '#0f172a',
                    padding: '14px 16px',
                    borderRadius: '14px 14px 14px 2px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    width: '100%'
                  }}>
                    <DoctorAiMessageRenderer content={m.text} />
                  </div>
                )}
              </div>

              {/* Starter Question Cards (Only shown below the initial welcome message when conversation is fresh) */}
              {idx === 0 && messages.length === 1 && (
                <div style={{
                  marginTop: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 2px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={14} color="#1a73e8" />
                      <span style={{
                        fontSize: '0.70rem',
                        fontWeight: 800,
                        color: '#5f6368',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em'
                      }}>
                        Suggested Clinical Questions
                      </span>
                    </div>
                    <span style={{ fontSize: '0.66rem', color: '#80868b' }}>
                      Tap to formulate
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                    gap: '10px'
                  }}>
                    {SUGGESTED_INQUIRIES.map((item, qIdx) => {
                      const IconComponent = item.icon;
                      return (
                        <button
                          key={qIdx}
                          type="button"
                          onClick={() => handleSend(item.prompt)}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            padding: '12px 14px',
                            background: '#ffffff',
                            border: '1px solid #dadce0',
                            borderRadius: '8px',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#1a73e8';
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.boxShadow = '0 3px 8px rgba(26,115,232,0.12)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#dadce0';
                            e.currentTarget.style.background = '#ffffff';
                            e.currentTarget.style.boxShadow = '0 1px 2px rgba(60,64,67,0.06)';
                            e.currentTarget.style.transform = 'none';
                          }}
                        >
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: item.iconBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: '2px'
                          }}>
                            <IconComponent size={16} color={item.iconColor} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', marginBottom: '2px' }}>
                              <span style={{ fontSize: '0.80rem', fontWeight: 750, color: '#202124' }}>
                                {item.title}
                              </span>
                              <span style={{
                                fontSize: '0.60rem',
                                fontWeight: 700,
                                background: item.iconBg,
                                color: item.iconColor,
                                padding: '1px 5px',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.02em',
                                whiteSpace: 'nowrap'
                              }}>
                                {item.badge}
                              </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.71rem', color: '#5f6368', lineHeight: 1.4 }}>
                              {item.subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b', fontSize: '0.78rem' }}>
              <Bot size={16} />
              <span>Atlas AI is consulting biochemical database...</span>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid #dadce0',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Atlas AI about peptide synergy, dosing, or reconstitution..."
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '24px',
              border: '1px solid #dadce0',
              fontSize: '0.84rem',
              outline: 'none',
              background: '#f8fafc',
              transition: 'all 0.15s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#1a73e8';
              e.target.style.background = '#ffffff';
              e.target.style.boxShadow = '0 0 0 2px rgba(26,115,232,0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#dadce0';
              e.target.style.background = '#f8fafc';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputPrompt.trim() || loading}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: 'none',
              background: inputPrompt.trim() && !loading ? '#1a73e8' : '#e8eaed',
              color: inputPrompt.trim() && !loading ? '#ffffff' : '#9aa0a6',
              cursor: inputPrompt.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
            title="Send query to Atlas AI"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}


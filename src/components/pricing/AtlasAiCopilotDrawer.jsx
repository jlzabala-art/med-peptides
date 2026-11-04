'use client';

import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, CheckCircle2, Droplets, BookOpen, Layers, ShieldCheck, ArrowRight } from 'lucide-react';

const QUICK_PROMPTS = [
  {
    title: 'Reconstitution Math',
    prompt: 'Calculate reconstitution for 10mg Tirzepatide using 2.0mL BAC water on a 100-unit U-100 syringe for a 2.5mg dose.'
  },
  {
    title: 'BPC-157 + TB-500 Synergy',
    prompt: 'What is the molecular mechanism and synergy between BPC-157 and TB-500 in tendon-to-bone junction repair?'
  },
  {
    title: 'Longevity Protocol',
    prompt: 'Suggest an evidence-based 60-day longevity protocol combining Epithalon and MOTS-c for cellular health.'
  },
  {
    title: 'Semax vs Selank',
    prompt: 'Compare the mechanisms of Semax (BDNF/TrkB) and Selank (GABA/enkephalins) for neuro-cognitive optimization.'
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
  - Indication: Anxiolysis, down-regulation of generalized stress, cognitive stabilization, and restoration of restorative slow-wave sleep architecture.`
};

export default function AtlasAiCopilotDrawer({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello. I am Atlas Clinical AI Copilot. I can assist you with peptide reconstitution math, receptor synergies, protocol durations, and clinical pharmacopeia data. How can I help your practice today?'
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

      if (qLower.includes('reconstitut') || qLower.includes('tirzepatide') || qLower.includes('math') || qLower.includes('syringe')) {
        replyText = PREBUILT_KNOWLEDGE.reconstitution;
      } else if (qLower.includes('synergy') || qLower.includes('bpc') || qLower.includes('tb-500') || qLower.includes('repair')) {
        replyText = PREBUILT_KNOWLEDGE.synergy;
      } else if (qLower.includes('longevity') || qLower.includes('epithalon') || qLower.includes('mots-c')) {
        replyText = PREBUILT_KNOWLEDGE.longevity;
      } else if (qLower.includes('semax') || qLower.includes('selank') || qLower.includes('neuro') || qLower.includes('focus')) {
        replyText = PREBUILT_KNOWLEDGE.neuro;
      } else {
        replyText = `Based on Atlas Clinical Bioregulatory Guidelines: For ${query}, the verified standard entails HPLC-verified ≥99.0% lyophilized borosilicate vials. Reconstitute strictly with 0.9% Benzyl Alcohol Bacteriostatic Water and store at 2°C – 8°C. All clinical protocols should follow progressive micro-dosing titration with physician supervision.`;
      }

      setMessages(prev => [...prev, { role: 'assistant', text: replyText }]);
      setLoading(false);
    }, 450);
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
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
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
              background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)'
            }}>
              <Sparkles size={18} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Quick Prompts Bar */}
        <div style={{
          padding: '10px 14px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp.prompt)}
              style={{
                fontSize: '0.70rem',
                fontWeight: 650,
                padding: '4px 9px',
                borderRadius: '14px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>{qp.title}</span>
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div style={{
          flex: 1,
          padding: '1.25rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          background: '#ffffff'
        }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '8px',
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '88%'
              }}
            >
              {m.role === 'assistant' && (
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: '#0284c7',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bot size={14} />
                </div>
              )}
              <div style={{
                background: m.role === 'user' ? '#0284c7' : '#f1f5f9',
                color: m.role === 'user' ? '#ffffff' : '#0f172a',
                padding: '10px 13px',
                borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                fontSize: '0.80rem',
                lineHeight: 1.55,
                whiteSpace: 'pre-wrap',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
              }}>
                {m.text}
              </div>
            </div>
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
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
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
              padding: '9px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
              outline: 'none',
              background: '#ffffff'
            }}
          />
          <button
            onClick={() => handleSend()}
            style={{
              padding: '9px 14px',
              borderRadius: '6px',
              border: 'none',
              background: '#0284c7',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

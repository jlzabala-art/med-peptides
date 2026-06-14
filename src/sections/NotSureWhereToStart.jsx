import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Bot from "lucide-react/dist/esm/icons/bot";
import HelpCircle from "lucide-react/dist/esm/icons/help-circle";
import MessageCircle from "lucide-react/dist/esm/icons/message-circle";
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';





/**
 * NotSureWhereToStart — Phase 10 of Rules 5.0
 * ─────────────────────────────────────────────
 * Reassuring CTA placed on the homepage, search modal empty states,
 * and Protocol Finder. Offers a warm, guided on-ramp to ClinicalAI.
 *
 * Rules 5.0 requirements:
 *  - "Not sure where to start? ClinicalAI can guide you step-by-step."
 *  - Place on: homepage, search modal, empty states, protocol finder
 *  - Concierge-like, not aggressive
 */

const GUIDED_PROMPTS = [
  { label: "I'm completely new to peptide research", color: '#818cf8' },
  { label: 'Show me the safest starting protocols', color: '#34d399' },
  { label: 'What do researchers use for recovery?', color: '#fb7185' },
  { label: 'Compare the top longevity compounds', color: '#f59e0b' },
  { label: 'What is a beginner-friendly stack?', color: '#38bdf8' },
];

export default function NotSureWhereToStart({ onOpenAI, variant = 'homepage' }) {
  const navigate = useNavigate();
  const [activePrompt, setActivePrompt] = useState(0);

  // Rotate the example prompts every 3s
  useEffect(() => {
    const id = setInterval(() => {
      setActivePrompt((p) => (p + 1) % GUIDED_PROMPTS.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const handleAIGuide = (prompt) => {
    if (onOpenAI) {
      onOpenAI(prompt || "I'm not sure where to start. Help me find the right research area.");
    } else {
      sessionStorage.setItem('ai_seed_goal', prompt || "I need guidance on where to start.");
      navigate('/');
    }
  };



  const isCompact = variant === 'inline' || variant === 'empty-state';

  if (isCompact) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1.5rem',
          background: 'rgba(129,140,248,0.06)',
          border: '1px solid rgba(129,140,248,0.18)',
          borderRadius: 14,
          textAlign: 'center',
        }}
      >
        <HelpCircle size={24} color="#818cf8" />
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-border)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
            Not sure where to start?
          </div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.82rem', lineHeight: 1.5 }}>
            ClinicalAI can guide you step-by-step through the research landscape.
          </div>
        </div>
        <button
          id="not-sure-ai-guide-compact"
          onClick={() => handleAIGuide()}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.55rem 1.2rem',
            borderRadius: 99,
            background: 'rgba(129,140,248,0.15)',
            border: '1px solid rgba(129,140,248,0.35)',
            color: '#818cf8',
            fontSize: '0.82rem', fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.18s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(129,140,248,0.25)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(129,140,248,0.15)'; }}
        >
          <Bot size={14} />
          Let AI Guide Me
        </button>
      </div>
    );
  }

  // Full homepage variant
  return (
    <section
      aria-labelledby="not-sure-heading"
      style={{
        padding: '3.5rem 1.25rem',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(16,185,129,0.04) 100%)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Soft glow */}
      <div aria-hidden style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 300,
        background: 'radial-gradient(ellipse, rgba(129,140,248,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>

        {/* Icon */}
        <div style={{
          width: 56, height: 56,
          borderRadius: '50%',
          background: 'rgba(129,140,248,0.12)',
          border: '1px solid rgba(129,140,248,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}>
          <Bot size={26} color="#818cf8" />
        </div>

        <h2
          id="not-sure-heading"
          style={{
            fontSize: 'clamp(1.4rem, 3vw, 2rem)',
            fontWeight: 700,
            color: '#f1f5f9',
            marginBottom: '0.5rem',
          }}
        >
          Not sure where to start?
        </h2>
        <p style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'clamp(0.88rem, 2vw, 1rem)',
          lineHeight: 1.65,
          marginBottom: '1.5rem',
          maxWidth: 500,
          margin: '0 auto 1.5rem',
        }}>
          ClinicalAI can guide you step-by-step through the peptide research landscape.
          Tell it your goal — it will suggest the right compounds and protocols.
        </p>

        {/* Rotating example prompt */}
        <div style={{
          marginBottom: '1.5rem',
          fontSize: '0.82rem',
          color: 'var(--color-text-secondary)',
          minHeight: '1.6rem',
          transition: 'color 0.3s',
        }}>
          <span style={{ color: 'var(--color-text-primary)' }}>Try saying: </span>
          <span
            style={{
              color: GUIDED_PROMPTS[activePrompt].color,
              fontStyle: 'italic',
              fontWeight: 500,
              transition: 'color 0.5s ease',
            }}
          >
            "{GUIDED_PROMPTS[activePrompt].label}"
          </span>
        </div>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap',
        }}>
          <button
            id="not-sure-ai-guide-main"
            onClick={() => handleAIGuide(GUIDED_PROMPTS[activePrompt].label)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
              padding: '0.7rem 1.5rem',
              borderRadius: 99,
              background: 'linear-gradient(135deg,#6366f1,#818cf8)',
              border: 'none',
              color: 'var(--color-bg-surface)',
              fontSize: '0.9rem', fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(99,102,241,0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.3)'; }}
          >
            <Bot size={16} />
            Let AI Guide Me
          </button>


        </div>

        {/* WhatsApp support — Phase 17 integration */}
        <div style={{ marginTop: '1.5rem' }}>
          <a
            href="https://wa.me/971564179256?text=Hi%2C%20I%20need%20help%20getting%20started%20with%20peptide%20research"
            target="_blank"
            rel="noopener noreferrer"
            id="not-sure-whatsapp-support"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              color: 'var(--color-text-secondary)', fontSize: '0.78rem',
              textDecoration: 'none',
              transition: 'color 0.18s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#25D366'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
          >
            <MessageCircle size={13} />
            Prefer talking to a person? Chat on WhatsApp
          </a>
        </div>

      </div>
    </section>
  );
}
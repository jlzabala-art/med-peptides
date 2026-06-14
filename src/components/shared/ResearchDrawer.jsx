import X from "lucide-react/dist/esm/icons/x";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Check from "lucide-react/dist/esm/icons/check";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Brain from "lucide-react/dist/esm/icons/brain";
import Moon from "lucide-react/dist/esm/icons/moon";
import Zap from "lucide-react/dist/esm/icons/zap";
import Dumbbell from "lucide-react/dist/esm/icons/dumbbell";
import Scale from "lucide-react/dist/esm/icons/scale";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import Award from "lucide-react/dist/esm/icons/award";
import Compass from "lucide-react/dist/esm/icons/compass";
import Edit2 from "lucide-react/dist/esm/icons/edit-2";
import Bot from "lucide-react/dist/esm/icons/bot";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';















import useGuestPreferences, { 
  GOAL_META, LEVEL_META, PREFERENCE_OPTIONS, CONTEXT_QUICK_CHIPS, GOAL_DRAWER_DETAILS, CLINICAL_AI_CONTEXTS
} from '../../hooks/useGuestPreferences';

// ── Components ────────────────────────────────────────────────────────────────

function StepIndicator({ currentStep, totalSteps }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          Step {currentStep} of {totalSteps}
        </span>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          ~45s left
        </span>
      </div>
      <div style={{ display: 'flex', gap: '0.4rem', width: '100%' }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: i + 1 <= currentStep ? '#1a73e8' : 'var(--border)',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function GoalCard({ id, meta, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(id)}
      style={{
        padding: '0.85rem 1rem',
        borderRadius: '8px',
        border: `1px solid ${selected ? '#1a73e8' : '#e0e0e0'}`,
        background: selected ? '#f8f9fa' : 'var(--color-bg-surface)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        textAlign: 'left',
        transition: 'all 0.15s',
        width: '100%',
        fontFamily: 'inherit',
        color: selected ? '#1a73e8' : 'var(--text-main)',
        position: 'relative',
        boxShadow: selected ? '0 1px 3px rgba(26,115,232,0.1)' : 'none'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = selected ? '#f1f3f4' : '#f8f9fa'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = selected ? '#f8f9fa' : 'var(--color-bg-surface)'; }}
    >
      <div style={{ fontSize: '1.2rem' }}>
        {meta.icon}
      </div>
      <span style={{
        fontSize: '0.95rem',
        fontWeight: selected ? 700 : 500,
        letterSpacing: '0.01em',
      }}>
        {meta.label}
      </span>
      {selected && (
        <div
          style={{
            position: 'absolute', top: '50%', right: '16px',
            transform: 'translateY(-50%)',
            width: 20, height: 20, borderRadius: '50%',
            backgroundColor: '#1a73e8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Check size={12} color="white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

// ── Main Drawer Component ──────────────────────────────────────────────────────

export default function ResearchDrawer({ onComplete, onOpenAI }) {
  const { prefs, savePrefs, hasCompleted, isLoaded } = useGuestPreferences();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isClosing, setIsClosing] = useState(false);
  // Custom Mode State
  const [mode, setMode] = useState('personalization'); // 'personalization' | 'goal-detail'
  const [detailGoal, setDetailGoal] = useState(null);
  // Form State (initialized from prefs if available)
  const [goal, setGoal] = useState(null);
  const [context, setContext] = useState('');
  const [experienceLevel, setExperienceLevel] = useState(null);
  const [preferences, setPreferences] = useState([]);
  const totalSteps = 4;
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  // Scroll to top on step change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [step]);

  // Initialize and Open Logic
  useEffect(() => {
    if (isLoaded) {
      if (!hasCompleted && !sessionStorage.getItem('researchDrawerDismissed')) {
        const t = setTimeout(() => setIsOpen(true), 1500);
        return () => clearTimeout(t);
      }
    }
  }, [hasCompleted, isLoaded]);

  // Listen for manual open trigger
  useEffect(() => {
    const handleOpen = (e) => {
      setIsOpen(true);
      if (e.detail?.mode === 'goal-detail' && e.detail?.goalId) {
        setMode('goal-detail');
        setDetailGoal(e.detail.goal || { id: e.detail.goalId, label: e.detail.goalId });
      } else {
        setMode('personalization');
      }
    };
    window.addEventListener('open-research-drawer', handleOpen);
    return () => window.removeEventListener('open-research-drawer', handleOpen);
  }, []);

  useEffect(() => {
    if (isOpen && prefs) {
      if (prefs.goal) setGoal(prefs.goal);
      if (prefs.context) setContext(prefs.context);
      if (prefs.experienceLevel) setExperienceLevel(prefs.experienceLevel);
      if (prefs.preferences) setPreferences(prefs.preferences);
    }
  }, [isOpen, prefs]);

  useEffect(() => {
    if (step === 2 && inputRef.current) {
      inputRef.current.focus();
    }
  }, [step]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen || isClosing) return;
      if (e.key === 'Enter') {
        if (e.target.tagName === 'TEXTAREA') return; // let textarea have newlines
        e.preventDefault();
        handleNext();
      }
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, step, goal, context, experienceLevel, preferences, isClosing]);

  if (!isOpen) return null;

  // Handlers
  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setMode('personalization');
      setDetailGoal(null);
      sessionStorage.setItem('researchDrawerDismissed', 'true');
    }, 300);
  };

  const handleNext = () => {
    if (step === 1 && !goal) return;
    if (step === 3 && !experienceLevel) return;
    // Autosave progress
    savePrefs({ goal, context, experienceLevel, preferences });
    if (step < 5) {
      if (step === 1 && goal === 'explore') {
        // Skip context and experience if explore
        setStep(5); // Go straight to summary
      } else {
        setStep(s => s + 1);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      if (step === 5 && goal === 'explore') setStep(1);
      else setStep(s => s - 1);
    }
  };

  const togglePreference = (id) => {
    setPreferences(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleContextChip = (chip) => {
    setContext(prev => {
      const current = prev.trim();
      if (!current) return chip;
      return current.endsWith('.') || current.endsWith(',') ? `${current} ${chip}` : `${current}, ${chip}`;
    });
  };

  const finishFlow = () => {
    savePrefs({ goal, context, experienceLevel, preferences });
    onComplete?.();
    handleDismiss();
  };

  // Render Steps
  const renderStep1 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s ease' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
        What brings you here today?
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.6rem' }}>
        {Object.entries(GOAL_META).map(([id, meta]) => (
          <GoalCard
            key={id} id={id} meta={meta}
            selected={goal === id}
            onSelect={(id) => { setGoal(id); setTimeout(() => handleNext(), 150); }}
          />
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s ease' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
        What are you trying to improve?
      </h2>
      <textarea
        ref={inputRef}
        value={context}
        onChange={(e) => setContext(e.target.value)}
        placeholder="Examples:&#10;'I feel mentally exhausted'&#10;'Improve recovery'&#10;'Support healthy aging'"
        style={{
          width: '100%',
          minHeight: '120px',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          background: 'var(--surface-raised)',
          color: 'var(--text-main)',
          fontFamily: 'inherit',
          fontSize: '1rem',
          resize: 'vertical',
        }}
      />
      <div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>
          Quick chips:
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {CONTEXT_QUICK_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => handleContextChip(chip)}
              style={{
                padding: '0.4rem 0.8rem', borderRadius: '16px',
                border: '1px solid var(--border)', background: 'var(--surface)',
                fontSize: '0.8rem', color: 'var(--text-main)', cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border-light)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface)'}
            >
              + {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s ease' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
        Have you used peptides or protocols before?
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {Object.entries(LEVEL_META).map(([id, meta]) => (
          <button
            key={id}
            onClick={() => { setExperienceLevel(id); setTimeout(() => handleNext(), 150); }}
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              border: `1px solid ${experienceLevel === id ? '#1a73e8' : '#e0e0e0'}`,
              background: experienceLevel === id ? '#f8f9fa' : 'var(--color-bg-surface)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem',
              textAlign: 'left', transition: 'all 0.15s', width: '100%',
              boxShadow: experienceLevel === id ? '0 1px 3px rgba(26,115,232,0.1)' : 'none'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = experienceLevel === id ? '#f1f3f4' : '#f8f9fa'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = experienceLevel === id ? '#f8f9fa' : 'var(--color-bg-surface)'; }}
          >
            <div style={{ fontSize: '1.2rem' }}>{meta.icon}</div>
            <span style={{ fontSize: '0.95rem', fontWeight: experienceLevel === id ? 700 : 500, color: experienceLevel === id ? '#1a73e8' : 'var(--text-main)' }}>
              {meta.label}
            </span>
            {experienceLevel === id && (
              <Check size={16} color="#1a73e8" style={{ marginLeft: 'auto' }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s ease' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
        What matters most?
      </h2>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Select all that apply</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {PREFERENCE_OPTIONS.map(pref => {
          const sel = preferences.includes(pref.id);
          return (
            <button
              key={pref.id}
              onClick={() => togglePreference(pref.id)}
              style={{
                padding: '0.6rem 1rem', borderRadius: '8px',
                border: `1px solid ${sel ? '#1a73e8' : 'var(--border)'}`,
                background: sel ? 'rgba(26, 115, 232, 0.08)' : 'var(--surface-raised)',
                fontSize: '0.9rem', fontWeight: sel ? 600 : 500,
                color: sel ? '#1a73e8' : 'var(--text-main)', cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {pref.label} {sel && <Check size={12} strokeWidth={3} style={{ marginLeft: 4 }} />}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderSummary = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, background: 'rgba(26, 115, 232, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#1a73e8' }}>
          <Sparkles size={24} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
          Research Profile Ready
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
          Your profile has been built to generate highly personalized protocols.
        </p>
      </div>

      <div style={{ background: 'var(--surface-raised)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Your Profile</h3>
          <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#1a73e8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
            <Edit2 size={12} /> Edit
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {goal && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', width: '80px' }}>Goal:</span>
              <span style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 500 }}>{GOAL_META[goal]?.label || goal}</span>
            </div>
          )}
          {context && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', width: '80px' }}>Context:</span>
              <span style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 500 }}>{context}</span>
            </div>
          )}
          {experienceLevel && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', width: '80px' }}>Experience:</span>
              <span style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 500 }}>{LEVEL_META[experienceLevel]?.label || experienceLevel}</span>
            </div>
          )}
          {preferences.length > 0 && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', width: '80px' }}>Prefers:</span>
              <span style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 500 }}>
                {preferences.map(p => PREFERENCE_OPTIONS.find(o => o.id === p)?.label || p).join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderGoalDetail = () => {
    if (!detailGoal) return null;
    const details = GOAL_DRAWER_DETAILS[detailGoal.id] || {};
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', animation: 'fadeIn 0.3s ease', paddingBottom: '1rem' }}>
        <div>
          <h4 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1a73e8', marginBottom: '0.5rem' }}>
            {details.pathway || 'Vía Biológica'}
          </h4>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-main)', margin: 0 }}>
            {details.description || detailGoal.desc}
          </p>
        </div>

        {details.peptides && (
          <div>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Compuestos de Investigación
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {details.peptides.map((pep) => (
                <div 
                  key={pep.name} 
                  onClick={() => {
                    handleDismiss();
                    navigate(`/product/${pep.slug}`);
                  }}
                  style={{
                    padding: '1rem',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1a73e8'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(26,115,232,0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>{pep.name}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{pep.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes drawerSlideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes drawerSlideOut {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.25)', backdropFilter: 'blur(2px)',
          zIndex: 99998,
          opacity: isClosing ? 0 : 1,
          transition: 'opacity 0.2s ease',
        }}
        onClick={handleDismiss}
      />

      {/* Drawer */}
      <div 
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0,
          width: '100%', maxWidth: '420px',
          background: 'var(--color-bg-surface)',
          zIndex: 99999,
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.08)',
          display: 'flex', flexDirection: 'column',
          animation: `${isClosing ? 'drawerSlideOut' : 'drawerSlideIn'} 0.25s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`,
        }}
      >
        {/* Header */}
        <div style={{ 
          padding: '1.25rem 1.5rem 1rem', 
          borderBottom: '1px solid #f1f3f4',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '2px 8px', borderRadius: '4px',
              background: 'rgba(26, 115, 232, 0.08)', border: '1px solid rgba(26, 115, 232, 0.2)',
              fontSize: '0.65rem', fontWeight: 700, color: '#1a73e8',
              letterSpacing: '0.05em', textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}>
              <Sparkles size={10} style={{ color: '#1a73e8' }} />
              {mode === 'goal-detail' ? 'Clinical Protocol' : 'Personalize your research'}
            </div>
            {mode === 'goal-detail' ? (
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {detailGoal?.label}
              </h2>
            ) : (
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Answer a few quick questions to generate more relevant protocols.
              </p>
            )}
          </div>
          <button 
            onClick={handleDismiss}
            style={{ 
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: '0.25rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {mode === 'goal-detail' ? (
            renderGoalDetail()
          ) : (
            <>
              {step < 5 && <StepIndicator currentStep={step} totalSteps={totalSteps} />}
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
              {step === 5 && renderSummary()}
            </>
          )}
        </div>

        {/* Footer Navigation */}
        {mode === 'goal-detail' ? (
          <div style={{ 
            padding: '1.5rem', 
            borderTop: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', gap: '0.75rem'
          }}>
            <button 
              style={{
                width: '100%', padding: '0.85rem', borderRadius: '10px',
                fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                background: '#1a73e8', color: '#FFF', border: 'none', transition: 'all 0.15s'
              }}
              onClick={() => {
                const richPrompt = CLINICAL_AI_CONTEXTS[detailGoal?.id] || `I want to investigate an advanced clinical protocol for the goal of ${detailGoal?.label}.`;
                const cleanLabel = `Designing ${detailGoal?.label} Protocol...`;
                handleDismiss();
                if (onOpenAI) {
                  onOpenAI(richPrompt, cleanLabel);
                } else {
                  window.dispatchEvent(
                    new CustomEvent('open-clinical-ai', {
                      detail: { query: richPrompt, autoSend: true, displayText: cleanLabel },
                    })
                  );
                }
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#1557b0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#1a73e8'; }}
            >
              <Bot size={18} /> Preguntar a ClinicalAI
            </button>
            <button 
              style={{
                width: '100%', padding: '0.85rem', borderRadius: '10px',
                fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                background: 'var(--surface)', color: 'var(--text-main)', border: '1px solid var(--border)', transition: 'all 0.15s'
              }}
              onClick={() => {
                const details = GOAL_DRAWER_DETAILS[detailGoal?.id] || {};
                handleDismiss();
                if (details.category) {
                  navigate(`/collection/peptides?category=${encodeURIComponent(details.category)}`);
                } else {
                  navigate('/collection/peptides');
                }
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-raised)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface)'; }}
            >
              Explorar en Catálogo <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div style={{ 
            padding: '1.5rem 2rem', 
            borderTop: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            {step > 1 ? (
              <button 
                onClick={handleBack}
                style={{
                  background: 'transparent', border: '1px solid var(--border)',
                  color: 'var(--text-main)', borderRadius: '8px',
                  padding: '0.6rem 1.25rem', cursor: 'pointer',
                  fontSize: '0.9rem', fontWeight: 600,
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border-light)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Back
              </button>
            ) : <div />}

            {step < 5 ? (
              <button 
                onClick={handleNext}
                disabled={step === 1 && !goal || step === 3 && !experienceLevel}
                style={{
                  background: (step === 1 && !goal) || (step === 3 && !experienceLevel) ? 'var(--border-light)' : '#1a73e8',
                  color: (step === 1 && !goal) || (step === 3 && !experienceLevel) ? 'var(--text-light)' : 'white',
                  border: 'none', borderRadius: '8px',
                  padding: '0.6rem 1.25rem', cursor: 'pointer',
                  fontSize: '0.9rem', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  transition: 'background 0.15s'
                }}
              >
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button 
                onClick={finishFlow}
                style={{
                  background: '#1a73e8', color: 'white',
                  border: 'none', borderRadius: '8px',
                  padding: '0.6rem 1.25rem', cursor: 'pointer',
                  fontSize: '0.9rem', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  transition: 'background 0.15s'
                }}
              >
                <Sparkles size={16} /> Generate protocol
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
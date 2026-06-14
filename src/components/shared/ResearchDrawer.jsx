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
  const [isClosing, setIsClosing] = useState(false);
  // Custom Mode State
  const [mode, setMode] = useState('personalization'); // 'personalization' | 'goal-detail'
  const [detailGoal, setDetailGoal] = useState(null);
  
  // AI State
  const [aiInput, setAiInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Form State (initialized from prefs if available)
  const [goal, setGoal] = useState(null);
  const [context, setContext] = useState('');
  const [experienceLevel, setExperienceLevel] = useState(null);
  const [preferences, setPreferences] = useState([]);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  // Scroll to top on summarize
  useEffect(() => {
    if (scrollRef.current && isSummarizing) {
      scrollRef.current.scrollTop = 0;
    }
  }, [isSummarizing]);

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
    if (isOpen && !isSummarizing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isSummarizing]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen || isClosing) return;
      if (e.key === 'Enter' && e.metaKey) {
        e.preventDefault();
        handleAnalyze();
      }
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isClosing, aiInput]);

  if (!isOpen) return null;

  // Handlers
  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setMode('personalization');
      setDetailGoal(null);
      setIsSummarizing(false);
      setAiInput('');
      sessionStorage.setItem('researchDrawerDismissed', 'true');
    }, 300);
  };

  const handleAnalyze = () => {
    if (!aiInput.trim()) return;
    setIsAnalyzing(true);
    
    // Simulate AI parsing
    setTimeout(() => {
      const lower = aiInput.toLowerCase();
      
      // Goal extraction
      let extGoal = 'longevity'; // default
      if (lower.match(/recover|heal|injury|joint|pain/)) extGoal = 'recovery';
      else if (lower.match(/brain|focus|cogniti|memory|adhd/)) extGoal = 'cognition';
      else if (lower.match(/weight|fat|metabol|lean/)) extGoal = 'weight-loss';
      else if (lower.match(/muscle|strength|hypertrophy|bulk/)) extGoal = 'muscle';
      else if (lower.match(/sleep|insomnia/)) extGoal = 'sleep';
      
      // Experience extraction
      let extExp = 'beginner';
      if (lower.match(/used before|some experience|intermediate/)) extExp = 'intermediate';
      if (lower.match(/advanced|expert|years|protocol/)) extExp = 'advanced';

      // Preferences extraction
      const extPrefs = [];
      if (lower.match(/oral|pill|no inject/)) extPrefs.push('oral-only');
      if (lower.match(/vegan|plant/)) extPrefs.push('vegan');
      if (lower.match(/budget|cheap|affordable/)) extPrefs.push('budget');
      
      setGoal(extGoal);
      setExperienceLevel(extExp);
      setPreferences(extPrefs);
      setContext(aiInput);
      
      savePrefs({ goal: extGoal, context: aiInput, experienceLevel: extExp, preferences: extPrefs });
      
      setIsAnalyzing(false);
      setIsSummarizing(true);
    }, 1500); // 1.5s simulated AI thinking time
  };

  const handleQuickPrompt = (prompt) => {
    setAiInput(prompt);
    if (inputRef.current) inputRef.current.focus();
  };

  const finishFlow = () => {
    onComplete?.();
    handleDismiss();
  };

  // Render Steps
  const renderAIOnboarding = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ background: 'rgba(26, 115, 232, 0.05)', border: '1px solid rgba(26, 115, 232, 0.2)', padding: '1.25rem', borderRadius: '12px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color="#1a73e8" />
          Hi! Tell me about your research goals.
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
          Describe what you want to achieve, your experience level, and any preferences. I will instantly build a custom protocol dashboard for you.
        </p>
      </div>
      
      <div style={{ position: 'relative' }}>
        <textarea
          ref={inputRef}
          value={aiInput}
          onChange={(e) => setAiInput(e.target.value)}
          placeholder="E.g., I'm a beginner looking to heal a nagging joint injury. I prefer oral administration over injections if possible."
          disabled={isAnalyzing}
          style={{
            width: '100%',
            minHeight: '140px',
            padding: '1.25rem',
            borderRadius: '12px',
            border: `2px solid ${isAnalyzing ? '#1a73e8' : 'var(--border)'}`,
            background: 'var(--surface-raised)',
            color: 'var(--text-main)',
            fontFamily: 'inherit',
            fontSize: '1rem',
            resize: 'vertical',
            transition: 'border-color 0.3s ease',
            opacity: isAnalyzing ? 0.7 : 1,
          }}
        />
        {isAnalyzing && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(2px)',
            borderRadius: '12px', flexDirection: 'column', gap: '0.5rem', color: '#1a73e8',
            fontWeight: 600, fontSize: '0.95rem'
          }}>
            <Bot className="spin-slow" size={24} />
            Analyzing your profile...
          </div>
        )}
      </div>

      {!isAnalyzing && (
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'block', fontWeight: 600 }}>
            Quick Prompts:
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => handleQuickPrompt("I want to optimize my longevity and slow down aging. I have intermediate experience.")}
              style={{
                padding: '0.75rem 1rem', borderRadius: '8px', textAlign: 'left',
                border: '1px solid var(--border)', background: 'var(--surface)',
                fontSize: '0.85rem', color: 'var(--text-main)', cursor: 'pointer',
                transition: 'all 0.15s', display: 'flex', gap: '0.5rem', alignItems: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-raised)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface)'}
            >
              🌱 Longevity & Anti-aging (Intermediate)
            </button>
            <button
              onClick={() => handleQuickPrompt("I'm an advanced researcher looking for protocols to maximize muscle hypertrophy and fat loss.")}
              style={{
                padding: '0.75rem 1rem', borderRadius: '8px', textAlign: 'left',
                border: '1px solid var(--border)', background: 'var(--surface)',
                fontSize: '0.85rem', color: 'var(--text-main)', cursor: 'pointer',
                transition: 'all 0.15s', display: 'flex', gap: '0.5rem', alignItems: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-raised)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface)'}
            >
              💪 Muscle & Fat Loss (Advanced)
            </button>
            <button
              onClick={() => handleQuickPrompt("I'm a complete beginner looking to improve my cognitive function and focus at work.")}
              style={{
                padding: '0.75rem 1rem', borderRadius: '8px', textAlign: 'left',
                border: '1px solid var(--border)', background: 'var(--surface)',
                fontSize: '0.85rem', color: 'var(--text-main)', cursor: 'pointer',
                transition: 'all 0.15s', display: 'flex', gap: '0.5rem', alignItems: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-raised)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface)'}
            >
              🧠 Brain Focus & Cognition (Beginner)
            </button>
          </div>
        </div>
      )}
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
          <button onClick={() => setIsSummarizing(false)} style={{ background: 'none', border: 'none', color: '#1a73e8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
            <Edit2 size={12} /> Refine with AI
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-slow {
          animation: spin 3s linear infinite;
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
          ) : isSummarizing ? (
            renderSummary()
          ) : (
            renderAIOnboarding()
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
            display: 'flex', justifyContent: 'flex-end', alignItems: 'center'
          }}>
            {!isSummarizing ? (
              <button 
                onClick={handleAnalyze}
                disabled={!aiInput.trim() || isAnalyzing}
                style={{
                  background: !aiInput.trim() || isAnalyzing ? 'var(--border-light)' : '#1a73e8',
                  color: !aiInput.trim() || isAnalyzing ? 'var(--text-light)' : 'white',
                  border: 'none', borderRadius: '8px',
                  padding: '0.6rem 1.25rem', cursor: 'pointer',
                  fontSize: '0.9rem', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  transition: 'background 0.15s'
                }}
              >
                <Sparkles size={16} /> Analyze with AI
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
                Apply Profile to Dashboard <ChevronRight size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
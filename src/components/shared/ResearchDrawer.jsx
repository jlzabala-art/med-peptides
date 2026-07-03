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
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
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
          ~{45 - (currentStep * 10)}s left
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

function SelectionCard({ label, icon, selected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      style={{
        padding: '0.85rem 1rem',
        borderRadius: '12px',
        border: `1px solid ${selected ? '#1a73e8' : 'var(--border)'}`,
        background: selected ? 'rgba(26,115,232,0.05)' : 'var(--color-bg-surface)',
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
        boxShadow: selected ? '0 2px 8px rgba(26,115,232,0.1)' : 'none'
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = 'var(--surface-raised)'; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'var(--color-bg-surface)'; }}
    >
      {icon && (
        <div style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}>
          {icon}
        </div>
      )}
      <span style={{
        fontSize: '0.95rem',
        fontWeight: selected ? 600 : 500,
        letterSpacing: '0.01em',
        flex: 1
      }}>
        {label}
      </span>
      {selected && (
        <div
          style={{
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

// ── Main Modal Component ──────────────────────────────────────────────────────

export default function ResearchDrawer({ onComplete, onOpenAI }) {
  const { prefs, savePrefs, isLoaded } = useGuestPreferences();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  const [mode, setMode] = useState('personalization'); // 'personalization' | 'goal-detail'
  const [detailGoal, setDetailGoal] = useState(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [aiInput, setAiInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Form State
  const [goal, setGoal] = useState(null);
  const [context, setContext] = useState('');
  const [experienceLevel, setExperienceLevel] = useState(null);
  const [preferences, setPreferences] = useState([]);
  
  const inputRef = useRef(null);
  const modalRef = useRef(null);

  // Listen for manual open trigger
  useEffect(() => {
    const handleOpen = (e) => {
      setIsOpen(true);
      if (e.detail?.mode === 'goal-detail' && e.detail?.goalId) {
        setMode('goal-detail');
        setDetailGoal(e.detail.goal || { id: e.detail.goalId, label: e.detail.goalId });
      } else {
        setMode('personalization');
        setCurrentStep(1);
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
    if (isOpen && currentStep === 1 && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, currentStep]);

  // Keyboard navigation & outside click
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen || isClosing) return;
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };
    
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        handleDismiss();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    if (isOpen) {
      setTimeout(() => {
         window.addEventListener('click', handleClickOutside);
      }, 100);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, isClosing]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setMode('personalization');
      setDetailGoal(null);
      setCurrentStep(1);
      setAiInput('');
    }, 250);
  };

  const handleAnalyzeAndProceed = () => {
    if (!aiInput.trim()) return;
    setIsAnalyzing(true);
    
    // Simulate AI parsing context and predicting defaults
    setTimeout(() => {
      const lower = aiInput.toLowerCase();
      
      let extGoal = 'longevity'; 
      if (lower.match(/recover|heal|injury|joint|pain/)) extGoal = 'recovery';
      else if (lower.match(/brain|focus|cogniti|memory|adhd/)) extGoal = 'cognitive';
      else if (lower.match(/weight|fat|metabol|lean/)) extGoal = 'metabolic';
      else if (lower.match(/muscle|strength|hypertrophy|bulk/)) extGoal = 'performance';
      else if (lower.match(/sleep|insomnia/)) extGoal = 'sleep';
      
      let extExp = 'beginner';
      if (lower.match(/used before|some experience|intermediate/)) extExp = 'intermediate';
      if (lower.match(/advanced|expert|years|protocol/)) extExp = 'advanced';

      const extPrefs = [];
      if (lower.match(/oral|pill|no inject/)) extPrefs.push('convenience');
      if (lower.match(/budget|cheap|affordable/)) extPrefs.push('budget');
      if (lower.match(/safe|safety/)) extPrefs.push('safety');
      if (lower.match(/fast|quick/)) extPrefs.push('fast');
      
      setGoal(extGoal);
      setExperienceLevel(extExp);
      setPreferences(extPrefs);
      setContext(aiInput);
      
      setIsAnalyzing(false);
      setCurrentStep(2);
    }, 1500);
  };

  const finishFlow = () => {
    savePrefs({ goal, context, experienceLevel, preferences });
    onComplete?.();
    handleDismiss();
  };

  const handleQuickPrompt = (prompt) => {
    setAiInput(prompt);
    if (inputRef.current) inputRef.current.focus();
  };
  
  const togglePreference = (id) => {
    if (preferences.includes(id)) {
      setPreferences(preferences.filter(p => p !== id));
    } else {
      setPreferences([...preferences, id]);
    }
  };

  const renderStep1 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.3s ease' }}>
      <StepIndicator currentStep={1} totalSteps={3} />
      
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={22} color="#1a73e8" />
          Tell us about your research goals
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
          Describe what you want to achieve. Atlas AI will analyze your prompt to instantly tailor protocols specifically for you.
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
            width: '100%', minHeight: '140px', padding: '1.25rem',
            borderRadius: '12px', border: `2px solid ${isAnalyzing ? '#1a73e8' : 'var(--border)'}`,
            background: 'var(--surface-raised)', color: 'var(--text-main)',
            fontFamily: 'inherit', fontSize: '1rem', resize: 'vertical',
            transition: 'border-color 0.3s ease', opacity: isAnalyzing ? 0.7 : 1,
          }}
        />
        {isAnalyzing && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(4px)',
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button
              onClick={() => handleQuickPrompt("I want to optimize my longevity and slow down aging. I have intermediate experience.")}
              className="quick-chip"
              style={{
                padding: '0.5rem 1rem', borderRadius: '20px',
                border: '1px solid var(--border)', background: 'var(--surface)',
                fontSize: '0.85rem', color: 'var(--text-main)', cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              Longevity
            </button>
            <button
              onClick={() => handleQuickPrompt("I'm looking for protocols to maximize muscle hypertrophy and fat loss.")}
              className="quick-chip"
              style={{
                padding: '0.5rem 1rem', borderRadius: '20px',
                border: '1px solid var(--border)', background: 'var(--surface)',
                fontSize: '0.85rem', color: 'var(--text-main)', cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              Weight Loss
            </button>
            <button
              onClick={() => handleQuickPrompt("I'm a beginner looking to improve my cognitive function and focus at work.")}
              className="quick-chip"
              style={{
                padding: '0.5rem 1rem', borderRadius: '20px',
                border: '1px solid var(--border)', background: 'var(--surface)',
                fontSize: '0.85rem', color: 'var(--text-main)', cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              Brain Health
            </button>
            <button
              onClick={() => handleQuickPrompt("I want to improve my deep sleep and circadian rhythm.")}
              className="quick-chip"
              style={{
                padding: '0.5rem 1rem', borderRadius: '20px',
                border: '1px solid var(--border)', background: 'var(--surface)',
                fontSize: '0.85rem', color: 'var(--text-main)', cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              Sleep
            </button>
            <button
              onClick={() => handleQuickPrompt("I want to heal a joint injury and speed up recovery.")}
              className="quick-chip"
              style={{
                padding: '0.5rem 1rem', borderRadius: '20px',
                border: '1px solid var(--border)', background: 'var(--surface)',
                fontSize: '0.85rem', color: 'var(--text-main)', cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              Recovery
            </button>
          </div>
        </div>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button 
          onClick={handleAnalyzeAndProceed}
          disabled={!aiInput.trim() || isAnalyzing}
          style={{
            background: !aiInput.trim() || isAnalyzing ? 'var(--border-light)' : '#1a73e8',
            color: !aiInput.trim() || isAnalyzing ? 'var(--text-light)' : 'white',
            border: 'none', borderRadius: '8px',
            padding: '0.8rem 1.5rem', cursor: 'pointer',
            fontSize: '0.95rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            transition: 'background 0.15s'
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.3s ease' }}>
      <StepIndicator currentStep={2} totalSteps={3} />
      
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color="#1a73e8" />
          Experience Level
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
          Atlas AI deduced this from your prompt. Please confirm or adjust your experience level with peptide research.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
        {Object.entries(LEVEL_META).map(([key, meta]) => (
          <SelectionCard 
            key={key} 
            label={meta.label} 
            icon={meta.icon} 
            selected={experienceLevel === key}
            onSelect={() => setExperienceLevel(key)}
          />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
        <button 
          onClick={() => setCurrentStep(1)}
          style={{
            background: 'var(--surface)', color: 'var(--text-main)',
            border: '1px solid var(--border)', borderRadius: '8px',
            padding: '0.8rem 1.5rem', cursor: 'pointer',
            fontSize: '0.95rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button 
          onClick={() => setCurrentStep(3)}
          style={{
            background: '#1a73e8', color: 'white',
            border: 'none', borderRadius: '8px',
            padding: '0.8rem 1.5rem', cursor: 'pointer',
            fontSize: '0.95rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.3s ease' }}>
      <StepIndicator currentStep={3} totalSteps={3} />
      
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color="#1a73e8" />
          Administration Preferences
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
          Atlas AI deduced these preferences. You can select multiple options to further refine your recommendations.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
        {PREFERENCE_OPTIONS.map((opt) => (
          <SelectionCard 
            key={opt.id} 
            label={opt.label} 
            selected={preferences.includes(opt.id)}
            onSelect={() => togglePreference(opt.id)}
          />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
        <button 
          onClick={() => setCurrentStep(2)}
          style={{
            background: 'var(--surface)', color: 'var(--text-main)',
            border: '1px solid var(--border)', borderRadius: '8px',
            padding: '0.8rem 1.5rem', cursor: 'pointer',
            fontSize: '0.95rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button 
          onClick={() => setCurrentStep(4)}
          style={{
            background: '#1a73e8', color: 'white',
            border: 'none', borderRadius: '8px',
            padding: '0.8rem 1.5rem', cursor: 'pointer',
            fontSize: '0.95rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  );

  const renderSummary = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease', textAlign: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: 64, height: 64, background: 'rgba(26, 115, 232, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: '#1a73e8' }}>
        <Check size={32} strokeWidth={3} />
      </div>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
          Profile Completed
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>
          Atlas AI is now adapting all recommendations to your specific goals and preferences.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
        <button 
          onClick={finishFlow}
          style={{
            background: '#1a73e8', color: 'white',
            border: 'none', borderRadius: '8px',
            padding: '0.9rem 2rem', cursor: 'pointer',
            fontSize: '1rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            transition: 'background 0.15s'
          }}
        >
          Enter the Platform <ChevronRight size={18} />
        </button>
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
        @keyframes modalFadeScale {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.96); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes modalFadeScaleOut {
          from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          to { opacity: 0; transform: translate(-50%, -50%) scale(0.96); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-slow {
          animation: spin 3s linear infinite;
        }
        .quick-chip:hover {
          background: var(--surface-raised) !important;
        }
        
        /* Mobile overrides */
        @media (max-width: 768px) {
          .research-modal {
            width: 100% !important;
            height: 100% !important;
            max-width: 100% !important;
            border-radius: 0 !important;
            top: 0 !important;
            left: 0 !important;
            transform: none !important;
            animation: none !important;
          }
          @keyframes mobileModalFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .research-modal.mobile-anim {
            animation: mobileModalFadeIn 0.25s ease-out forwards !important;
          }
          .research-modal.mobile-anim-out {
            animation: modalFadeScaleOut 0.2s ease-out forwards !important;
          }
        }
      `}</style>
      
      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)',
          zIndex: 99998,
          opacity: isClosing ? 0 : 1,
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Centered Modal */}
      <div 
        ref={modalRef}
        className={`research-modal ${isClosing ? 'mobile-anim-out' : 'mobile-anim'}`}
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%', maxWidth: '700px',
          background: 'var(--color-bg-surface)',
          zIndex: 99999,
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.2)',
          borderRadius: '20px',
          display: 'flex', flexDirection: 'column',
          maxHeight: '90vh',
          animation: `${isClosing ? 'modalFadeScaleOut' : 'modalFadeScale'} 0.25s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`,
        }}
      >
        {/* Header */}
        <div style={{ 
          padding: '1.5rem 2rem 1rem', 
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '4px 10px', borderRadius: '20px',
              background: 'rgba(26, 115, 232, 0.08)', border: '1px solid rgba(26, 115, 232, 0.2)',
              fontSize: '0.7rem', fontWeight: 700, color: '#1a73e8',
              letterSpacing: '0.05em', textTransform: 'uppercase',
            }}>
              <Sparkles size={12} style={{ color: '#1a73e8' }} />
              {mode === 'goal-detail' ? 'Clinical Protocol' : 'Personalization'}
            </div>
          </div>
          <button 
            onClick={handleDismiss}
            style={{ 
              background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer',
              color: 'var(--text-muted)', padding: '0.4rem', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-raised)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          {mode === 'goal-detail' ? (
            renderGoalDetail()
          ) : currentStep === 1 ? (
            renderStep1()
          ) : currentStep === 2 ? (
            renderStep2()
          ) : currentStep === 3 ? (
            renderStep3()
          ) : (
            renderSummary()
          )}
        </div>

        {/* Footer Navigation for Goal Detail */}
        {mode === 'goal-detail' && (
          <div style={{ 
            padding: '1.5rem 2rem', 
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
              <Bot size={18} /> Ask ClinicalAI
            </button>
          </div>
        )}
      </div>
    </>
  );
}
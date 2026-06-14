import Target from "lucide-react/dist/esm/icons/target";
import Zap from "lucide-react/dist/esm/icons/zap";
import Activity from "lucide-react/dist/esm/icons/activity";
import Brain from "lucide-react/dist/esm/icons/brain";
import Moon from "lucide-react/dist/esm/icons/moon";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Info from "lucide-react/dist/esm/icons/info";
import Filter from "lucide-react/dist/esm/icons/filter";
import Beaker from "lucide-react/dist/esm/icons/beaker";
import Shield from "lucide-react/dist/esm/icons/shield";
import User from "lucide-react/dist/esm/icons/user";
import Clipboard from "lucide-react/dist/esm/icons/clipboard";
import Ruler from "lucide-react/dist/esm/icons/ruler";
import Weight from "lucide-react/dist/esm/icons/weight";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import Clock from "lucide-react/dist/esm/icons/clock";
import Microscope from "lucide-react/dist/esm/icons/microscope";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import Dumbbell from "lucide-react/dist/esm/icons/dumbbell";
import Heart from "lucide-react/dist/esm/icons/heart";
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';























import GoalLifestyleStrip from '../sections/GoalLifestyleStrip';

import { protocolBundle } from '../services/protocol_finder_2_0_protocols_bundle/index.js';

// --- DATA ---
const OBJECTIVES = [
  { 
    id: 'Muscle Growth & Recovery', 
    label: 'Muscle Growth & Recovery', 
    icon: <Dumbbell />, 
    color: '#00D1FF',
    description: 'Hypertrophy, nitrogen balance, and rapid restoration.'
  },
  { 
    id: 'Fat Loss & Metabolic Health', 
    label: 'Fat Loss & Metabolic Health', 
    icon: <Activity />, 
    color: '#00FFB2',
    description: 'Lipolysis, GLP-1 pathways, and partitioning.'
  },
  { 
    id: 'Cognitive Performance & Focus', 
    label: 'Cognitive Performance & Focus', 
    icon: <Brain />, 
    color: '#A855F7',
    description: 'Neurogenesis, memory, and concentration.'
  },
  { 
    id: 'Longevity & Biological Repair', 
    label: 'Longevity & Biological Repair', 
    icon: <Heart />, 
    color: '#FF3B3B',
    description: 'Senolytic clearing and cellular health.'
  },
  { 
    id: 'Hormonal Vitality & Balance', 
    label: 'Hormonal Vitality & Balance', 
    icon: <Zap />, 
    color: '#F59E0B',
    description: 'Optimal endocrine function and peak vitality.'
  },
  { 
    id: 'Skin, Hair & Cellular Health', 
    label: 'Skin, Hair & Cellular Health', 
    icon: <Sparkles />, 
    color: '#F0ABFC',
    description: 'Dermal repair and structural integrity.'
  },
  { 
    id: 'Immune Function & Defense', 
    label: 'Immune Function & Defense', 
    icon: <ShieldCheck />, 
    color: '#3B82F6',
    description: 'Modulation and systemic recovery.'
  }
];

const AGE_GROUPS = [
  { id: '20-35', label: '20 - 35', desc: 'Peak performance & baseline' },
  { id: '36-50', label: '36 - 50', desc: 'Metabolic shift & optimization' },
  { id: '51-65', label: '51 - 65', desc: 'Regenerative focus & longevity' },
  { id: '65+', label: '65+', desc: 'Systemic support & resilience' },
];

const EXPERIENCE_LEVELS = [
  { id: 'novice', label: 'Novice', desc: 'New to peptide research' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Some experience with protocols' },
  { id: 'advanced', label: 'Advanced', desc: 'Expert researcher / Clinical focus' },
];

const INTENSITIES = [
  { id: 'conservative', label: 'Conservative', desc: 'Focus on safety & steady progress' },
  { id: 'balanced', label: 'Balanced', desc: 'Optimized risk/reward ratio' },
  { id: 'aggressive', label: 'Rapid / Aggressive', desc: 'Maximum biological response' },
];

const FORMATS = [
  { id: 'any', label: 'No preference', desc: 'Open to all delivery methods' },
  { id: 'oral_only', label: 'Oral only', desc: 'Exclude injectable compounds' },
  { id: 'avoid_injectables', label: 'Avoid injectables', desc: 'Prefer oral or topical' },
];

const GOAL_SPECIFIC_QUESTIONS = {
  'Muscle Growth & Recovery': [
    {
      id: 'condition_type',
      label: 'Clinical Focus',
      question: 'What is the nature of the research focus?',
      options: [
        { id: 'acute', label: 'Acute Injury', desc: 'Recent tissue trauma or sprains' },
        { id: 'chronic', label: 'Chronic Degeneration', desc: 'Long-term joint/tendon wear' },
        { id: 'post_op', label: 'Post-Surgical', desc: 'Post-operative tissue healing' },
        { id: 'systemic', label: 'Systemic Soreness', desc: 'Generalized inflammatory response' }
      ]
    },
    {
      id: 'tissue_focus',
      label: 'Tissue Target',
      question: 'Which tissue types are primarily involved?',
      options: [
        { id: 'connective', label: 'Tendon/Ligament', desc: 'Collagen-heavy structures' },
        { id: 'muscle', label: 'Muscle Tissue', desc: 'Hypertrophy & repair pathways' },
        { id: 'joint', label: 'Joint/Cartilage', desc: 'Synovial & cartilage integrity' }
      ]
    }
  ],
  'Fat Loss & Metabolic Health': [
    {
      id: 'metabolic_objective',
      label: 'Metabolic Goal',
      question: 'What is the primary metabolic objective?',
      options: [
        { id: 'fat_loss', label: 'Adipose Reduction', desc: 'Targeted lipolysis & fat oxidation' },
        { id: 'insulin', label: 'Insulin Sensitivity', desc: 'Glucose disposal optimization' },
        { id: 'appetite', label: 'Appetite Control', desc: 'Managing satiety & hunger signals' }
      ]
    },
    {
      id: 'prior_exposure',
      label: 'Prior Exposure',
      question: 'Have you previously utilized GLP-1 agonists?',
      options: [
        { id: 'never', label: 'Never', desc: 'No prior exposure' },
        { id: 'recent', label: 'Recent (< 6 months)', desc: 'Known tolerance established' },
        { id: 'historic', label: 'Historic (> 6 months)', desc: 'Previous metabolic experience' }
      ]
    }
  ],
  'Longevity & Biological Repair': [
    {
      id: 'longevity_focus',
      label: 'Longevity Focus',
      question: 'What is the primary longevity focus area?',
      options: [
        { id: 'senescence', label: 'Cellular Senescence', desc: 'Clearing "zombie" cells' },
        { id: 'mitochondria', label: 'Mitochondrial Health', desc: 'Energy & cellular respiration' },
        { id: 'telomere', label: 'Telomere Support', desc: 'DNA integrity & repair' },
        { id: 'dermal', label: 'Dermal Structure', desc: 'Collagen & skin elasticity' }
      ]
    }
  ],
  'Cognitive Performance & Focus': [
    {
      id: 'cognitive_dimension',
      label: 'Cognitive Focus',
      question: 'Which cognitive dimension requires support?',
      options: [
        { id: 'focus', label: 'Focus & Executive', desc: 'Attention & task switching' },
        { id: 'memory', label: 'Memory Retention', desc: 'Recall & synaptic plasticity' },
        { id: 'anxiety', label: 'Stress Resilience', desc: 'Calmness & mood stability' },
        { id: 'neuro', label: 'Neuroprotection', desc: 'Long-term brain health' }
      ]
    }
  ],
  'Hormonal Vitality & Balance': [
    {
      id: 'hormonal_symptom',
      label: 'Primary Symptom',
      question: 'Which physiological marker is most prominent?',
      options: [
        { id: 'vitality', label: 'Low Vitality', desc: 'Physical stamina & drive' },
        { id: 'libido', label: 'Libido/Performance', desc: 'Sexual health signaling' },
        { id: 'recovery', label: 'Slow Recovery', desc: 'Muscle soreness persists' },
        { id: 'mood', label: 'Mood/Irritability', desc: 'Hormone-related mood shifts' }
      ]
    }
  ],
  'Skin, Hair & Cellular Health': [
    {
      id: 'skin_focus',
      label: 'Dermal Focus',
      question: 'What is the primary skin or hair concern?',
      options: [
        { id: 'collagen', label: 'Collagen & Elasticity', desc: 'Firmness & wrinkle reduction' },
        { id: 'hair_loss', label: 'Hair Loss', desc: 'Follicle stimulation & density' },
        { id: 'wound', label: 'Wound / Scar Healing', desc: 'Accelerated tissue repair' },
        { id: 'hydration', label: 'Hydration & Barrier', desc: 'Moisture retention & glow' }
      ]
    }
  ],
  'Immune Function & Defense': [
    {
      id: 'immune_goal',
      label: 'Immune Focus',
      question: 'What is the primary immune research goal?',
      options: [
        { id: 'resilience', label: 'Viral Resilience', desc: 'Acute seasonal defense' },
        { id: 'autoimmune', label: 'Autoimmune Modulation', desc: 'Calming overactive signals' },
        { id: 'allergy', label: 'Allergy Management', desc: 'Sensitivity to environment' },
        { id: 'senescence', label: 'Immunosenescence', desc: 'Aging of the immune system' }
      ]
    }
  ]
};

const ObjectivesView = ({ onSelectObjective }) => (
  <div className="objectives-strip-container">
    <GoalLifestyleStrip 
      onSelectCategory={(id) => {
        const obj = OBJECTIVES.find(o => o.id === id);
        if (obj) onSelectObjective(obj);
      }} 
    />
  </div>
);

export default function ProtocolFinder({ onOpenSearch, protocolIndex = [] }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState({
    goal: searchParams.get('goal') || '',
    ageGroup: '',
    experience: '',
    intensity: 'balanced',
    format: 'any',
    weight: '',
    height: '',
    specificResponses: {},
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Auto-scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const bmi = useMemo(() => {
    if (!selection.weight || !selection.height) return null;
    const w = parseFloat(selection.weight);
    const h = parseFloat(selection.height) / 100;
    if (isNaN(w) || isNaN(h) || h === 0) return null;
    return (w / (h * h)).toFixed(1);
  }, [selection.weight, selection.height]);

  const handleSearch = () => {
    setIsAnalyzing(true);
    // Simulate "Clinical Analysis"
    setTimeout(() => {
      if (!protocolBundle || protocolBundle.length === 0) {
        setIsAnalyzing(false);
        return;
      }

      // 1. Filter by category first (base candidates)
      const candidates = protocolBundle.filter(p => {
        const primaryGoal = p.metadata?.primary_goal;
        // Map canonical goal strings to UI goal names
        const GOAL_MAP = {
          'Muscle Growth & Recovery': ['recovery_repair', 'muscle_growth'],
          'Fat Loss & Metabolic Health': ['weight_management', 'metabolic_optimization'],
          'Cognitive Performance & Focus': ['cognitive_mood', 'cognitive_support'],
          'Longevity & Biological Repair': ['longevity_anti_aging', 'longevity'],
          'Hormonal Vitality & Balance': ['hormonal_optimization', 'sleep_circadian'],
          'Skin, Hair & Cellular Health': ['longevity', 'longevity_anti_aging'],
          'Immune Function & Defense': ['immune_support', 'immune_modulation']
        };
        return GOAL_MAP[selection.goal]?.includes(primaryGoal);
      });
      if (candidates.length === 0) {
        // Fallback: search all protocols if no category match
        const queryParts = [selection.goal, selection.intensity, selection.experience].filter(Boolean);
        if (onOpenSearch) onOpenSearch(queryParts.join(' '), 'protocols');
        setIsAnalyzing(false);
        return;
      }

      // 2. Weighted Scoring System
      const scored = candidates.map(p => {
        let score = 0;
        const pTags = (p.tags || []).map(t => t.toLowerCase());
        // Intensity Mapping Score
        const intensityMap = {
          conservative: ['simple', 'standard', 'moderate'],
          balanced: ['standard', 'moderate'],
          aggressive: ['advanced', 'moderate']
        };
        const targetIntensities = intensityMap[selection.intensity] || [];
        if (pTags.some(t => targetIntensities.includes(t))) score += 50;

        // Experience Mapping Score
        const experienceMap = {
          novice: ['simple', 'standard'],
          intermediate: ['standard', 'moderate'],
          advanced: ['advanced', 'moderate']
        };
        const targetExperience = experienceMap[selection.experience] || [];
        if (pTags.some(t => targetExperience.includes(t))) score += 30;

        // Specific Responses / Canonical Marker Alignment
        Object.entries(selection.specificResponses).forEach(([key, val]) => {
          // 1. Direct tag match (backup)
          if (pTags.includes(val.toLowerCase())) score += 40;
          // 2. Canonical Marker Alignment (Primary)
          const alignmentData = p.metadata?.marker_alignment?.[key]?.[val];
          if (alignmentData) {
            score += (alignmentData.score || 50);
          }
        });

        return { protocol: p, score };
      });

      // Sort by score descending
      scored.sort((a, b) => b.score - a.score);
      const bestMatch = scored[0].protocol;

      if (bestMatch) {
        navigate(`/protocol/${bestMatch.protocol_slug}`, { state: { alignment: selection } });
      }
      setIsAnalyzing(false);
    }, 1500);
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="finder-page">
      <div className="finder-container">
        {/* Header */}
        <header className="finder-header">
          <div className="finder-badge">
            <Microscope size={14} />
            <span>Clinical Intelligence Protocol Search</span>
          </div>
          <h1 className="finder-title">Clinical Protocol Discovery</h1>
          <p className="finder-subtitle">
            Advanced clinical alignment to identify the optimal research protocol based on biometric markers and research objectives.
          </p>
        </header>

        {/* Progress Tracker */}
        <div className="finder-progress">
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className={`progress-dot ${step >= s ? 'active' : ''} ${step === s ? 'current' : ''}`} />
          ))}
        </div>

        {/* Form Area */}
        <main className="finder-main">
          {step === 1 && (
            <div className="finder-step animate-in" style={{ padding: 0 }}>
              <h2 className="step-title" style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>01. Research Objective Alignment</h2>
              <ObjectivesView
                onSelectObjective={(obj) => {
                  setSelection({ ...selection, goal: obj.id, specificResponses: {} });
                  setTimeout(nextStep, 300);
                }}
              />
            </div>
          )}

          {step === 2 && (
            <div className="finder-step animate-in">
              <h2 className="step-title">02. Biological Context</h2>
              <div className="finder-field-group">
                <label className="field-label"><User size={14} /> Age Group</label>
                <div className="selection-mini-grid">
                  {AGE_GROUPS.map(age => (
                    <button 
                      key={age.id}
                      className={`mini-card ${selection.ageGroup === age.id ? 'selected' : ''}`}
                      onClick={() => setSelection({...selection, ageGroup: age.id})}
                    >
                      <span className="mini-label">{age.label}</span>
                      <span className="mini-desc">{age.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="finder-field-group">
                <label className="field-label"><Clipboard size={14} /> Protocol Familiarity</label>
                <div className="selection-mini-grid">
                  {EXPERIENCE_LEVELS.map(exp => (
                    <button 
                      key={exp.id}
                      className={`mini-card ${selection.experience === exp.id ? 'selected' : ''}`}
                      onClick={() => setSelection({...selection, experience: exp.id})}
                    >
                      <span className="mini-label">{exp.label}</span>
                      <span className="mini-desc">{exp.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selection.goal === 'Fat Loss & Metabolic Health' && (
                <div className="biometric-row animate-in">
                  <div className="input-group">
                    <label className="field-label"><Weight size={14} /> Weight (kg)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 85"
                      value={selection.weight}
                      onChange={(e) => setSelection({...selection, weight: e.target.value})}
                      className="finder-input"
                    />
                  </div>
                  <div className="input-group">
                    <label className="field-label"><Ruler size={14} /> Height (cm)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 180"
                      value={selection.height}
                      onChange={(e) => setSelection({...selection, height: e.target.value})}
                      className="finder-input"
                    />
                  </div>
                  {bmi && (
                    <div className="bmi-display">
                      <span className="bmi-label">Calculated BMI</span>
                      <span className="bmi-value">{bmi}</span>
                      <span className="bmi-status">
                        {bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="finder-actions">
                <button className="btn-back" onClick={prevStep}>Back</button>
                <button 
                  className="btn-next" 
                  disabled={!selection.ageGroup || !selection.experience}
                  onClick={nextStep}
                >
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="finder-step animate-in">
              <h2 className="step-title">03. Goal-Specific Clinical Markers</h2>
              <p className="step-desc">Identifying precise biological objectives for the {selection.goal} pathway.</p>
              <div className="specific-questions">
                {(GOAL_SPECIFIC_QUESTIONS[selection.goal] || []).map((q, idx) => (
                  <div key={q.id} className="finder-field-group" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <label className="field-label">{q.label}</label>
                    <p className="question-text">{q.question}</p>
                    <div className="selection-list">
                      {q.options.map(opt => (
                        <button 
                          key={opt.id}
                          className={`selection-item ${selection.specificResponses[q.id] === opt.id ? 'selected' : ''}`}
                          onClick={() => setSelection({
                            ...selection, 
                            specificResponses: { ...selection.specificResponses, [q.id]: opt.id }
                          })}
                        >
                          <div className="item-content">
                            <span className="item-label">{opt.label}</span>
                            <span className="item-desc">{opt.desc}</span>
                          </div>
                          <div className="selection-radio" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {(!GOAL_SPECIFIC_QUESTIONS[selection.goal] || GOAL_SPECIFIC_QUESTIONS[selection.goal].length === 0) && (
                  <div className="no-questions-notice" style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '20px' }}>
                    <Info size={24} style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>No additional specific markers required for this objective. Proceeding to clinical preferences.</p>
                  </div>
                )}
              </div>

              <div className="finder-actions">
                <button className="btn-back" onClick={prevStep}>Back</button>
                <button 
                  className="btn-next" 
                  disabled={(GOAL_SPECIFIC_QUESTIONS[selection.goal] || []).some(q => !selection.specificResponses[q.id])}
                  onClick={nextStep}
                >
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="finder-step animate-in">
              <h2 className="step-title">04. Customization</h2>
              <div className="finder-field-group">
                <label className="field-label"><Clock size={14} /> Protocol Intensity (Tempo)</label>
                <div className="selection-list">
                  {INTENSITIES.map(int => (
                    <button 
                      key={int.id}
                      className={`selection-item ${selection.intensity === int.id ? 'selected' : ''}`}
                      onClick={() => setSelection({...selection, intensity: int.id})}
                    >
                      <div className="item-content">
                        <span className="item-label">{int.label}</span>
                        <span className="item-desc">{int.desc}</span>
                      </div>
                      <div className="selection-radio" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="finder-field-group">
                <label className="field-label"><Beaker size={14} /> Preferred Delivery Method</label>
                <div className="selection-list">
                  {FORMATS.map(fmt => (
                    <button 
                      key={fmt.id}
                      className={`selection-item ${selection.format === fmt.id ? 'selected' : ''}`}
                      onClick={() => setSelection({...selection, format: fmt.id})}
                    >
                      <div className="item-content">
                        <span className="item-label">{fmt.label}</span>
                        <span className="item-desc">{fmt.desc}</span>
                      </div>
                      <div className="selection-radio" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="finder-actions">
                <button className="btn-back" onClick={prevStep}>Back</button>
                <button className="btn-next" onClick={nextStep}>Final Review <ArrowRight size={18} /></button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="finder-step animate-in">
              <h2 className="step-title">05. Final Analysis Summary</h2>
              <div className="summary-card">
                <div className="summary-header">
                  <ShieldCheck size={20} color="var(--primary)" />
                  <span>PRE-DISCOVERY ALIGNMENT</span>
                </div>
                <div className="summary-grid">
                  <div className="summary-item">
                    <label>Selected Goal</label>
                    <p>{selection.goal}</p>
                  </div>
                  <div className="summary-item">
                    <label>Research Profile</label>
                    <p>{selection.ageGroup}yo • {selection.experience} level</p>
                  </div>
                  <div className="summary-item">
                    <label>Approach</label>
                    <p>{selection.intensity} tempo • {selection.format.replace(/_/g, ' ')}</p>
                  </div>
                  {bmi && (
                    <div className="summary-item">
                      <label>Biometric Profile</label>
                      <p>BMI {bmi} ({bmi < 25 ? 'Standard' : 'Metabolic focus'})</p>
                    </div>
                  )}
                  {Object.entries(selection.specificResponses).map(([key, val]) => {
                    const question = GOAL_SPECIFIC_QUESTIONS[selection.goal]?.find(q => q.id === key);
                    const option = question?.options.find(o => o.id === val);
                    if (!option) return null;
                    return (
                      <div key={key} className="summary-item">
                        <label>{question.label}</label>
                        <p>{option.label}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="safety-disclaimer">
                  <AlertTriangle size={16} />
                  <p>Our discovery engine is matching your profile against clinical benchmarks to identify the most efficacious research protocol.</p>
                </div>
              </div>

              <div className="finder-actions" style={{ marginTop: '2rem' }}>
                <button className="btn-back" onClick={prevStep} disabled={isAnalyzing}>Back</button>
                <button 
                  className="btn-finish" 
                  onClick={handleSearch}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw size={18} className="spin" /> Analyzing Protocols...
                    </>
                  ) : (
                    <>
                      View Recommended Protocol <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Footer Info */}
        <footer className="finder-footer">
          <div className="info-pill">
            <Shield size={14} />
            <span>Secure Clinical Selection</span>
          </div>
          <p className="footer-text">
            Atlas Health Selection Engine uses proprietary mapping to align biological goals with verified research protocols.
          </p>
        </footer>
      </div>

      <style>{`
        .finder-page {
          min-height: calc(100vh - 80px);
          background: var(--background, #F4F8FB);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 0.5rem 1rem;
        }

        .finder-container {
          width: 100%;
          max-width: 860px;
          background: white;
          border-radius: 40px;
          box-shadow: 0 30px 100px rgba(0, 54, 102, 0.1);
          padding: 2.5rem;
          border: 1px solid var(--border-light, #DDE6EF);
          position: relative;
          overflow: hidden;
        }

        .finder-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .finder-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(0, 163, 224, 0.08);
          color: var(--primary, #003666);
          padding: 0.5rem 1rem;
          border-radius: 99px;
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 1.25rem;
        }

        .finder-title {
          font-size: clamp(1.75rem, 4vw, 2.75rem);
          font-weight: 900;
          color: var(--primary, #003666);
          margin: 0 0 1rem;
          letter-spacing: -0.04em;
          line-height: 1.1;
        }

        .finder-subtitle {
          color: var(--text-muted, #64748b);
          font-size: 1.15rem;
          max-width: 580px;
          margin: 0 auto;
          line-height: 1.55;
        }

        .finder-progress {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 4rem;
        }

        .progress-dot {
          width: 48px;
          height: 6px;
          background: #E2E8F0;
          border-radius: 3px;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .progress-dot.active {
          background: var(--secondary, #00A3E0);
        }

        .progress-dot.current {
          background: var(--primary, #003666);
          width: 80px;
        }

        .step-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--primary);
          margin-bottom: 2.5rem;
          text-align: center;
          letter-spacing: -0.02em;
        }

        /* Balanced Selection Layout */
        .selection-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1.25rem;
        }

        .selection-card {
          flex: 1 1 calc(33.33% - 1.25rem);
          min-width: 260px;
          max-width: 400px;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.5rem;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 24px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: left;
        }

        @media (max-width: 768px) {
          .selection-card {
            flex: 1 1 100%;
            max-width: 100%;
          }
        }

        .selection-card:hover {
          border-color: var(--secondary);
          background: white;
          transform: translateY(-4px);
          box-shadow: 0 15px 30px rgba(0, 54, 102, 0.08);
        }

        .selection-card.selected {
          border-color: var(--primary);
          background: rgba(0, 54, 102, 0.04);
          box-shadow: 0 0 0 4px rgba(0, 54, 102, 0.08);
        }

        .selection-icon {
          width: 52px;
          height: 52px;
          background: white;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--secondary);
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }

        .selection-label {
          display: block;
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--primary);
          margin-bottom: 0.25rem;
        }

        .selection-desc {
          font-size: 0.82rem;
          color: var(--text-muted);
          font-weight: 500;
          line-height: 1.4;
        }

        /* Field Groups */
        .finder-field-group {
          margin-bottom: 2.5rem;
        }

        .field-label {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 1.25rem;
          opacity: 0.7;
        }

        .selection-mini-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .mini-card {
          padding: 1.25rem;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .mini-card:hover { border-color: var(--secondary); background: white; }
        .mini-card.selected { border-color: var(--primary); background: rgba(0, 54, 102, 0.04); }

        .mini-label { font-size: 1rem; font-weight: 800; color: var(--primary); }
        .mini-desc { font-size: 0.75rem; color: var(--text-muted); }

        /* Biometrics */
        .biometric-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1.25rem;
          padding: 1.5rem;
          background: #F8FAFC;
          border-radius: 20px;
          border: 1px solid #E2E8F0;
          align-items: flex-end;
          margin-bottom: 2.5rem;
        }

        .finder-input {
          width: 100%;
          padding: 0.85rem 1rem;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
          font-size: 1rem;
          font-weight: 600;
          outline: none;
          transition: all 0.2s;
        }

        .finder-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(0, 54, 102, 0.08); }

        .bmi-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding-bottom: 0.25rem;
        }

        .bmi-label { font-size: 0.65rem; font-weight: 800; color: #64748B; text-transform: uppercase; }
        .bmi-value { font-size: 1.75rem; font-weight: 900; color: var(--primary); line-height: 1; margin: 4px 0; }
        .bmi-status { font-size: 0.72rem; font-weight: 700; color: var(--secondary); }

        /* Selection List */
        .selection-list { display: flex; flex-direction: column; gap: 0.85rem; }
        .selection-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
          text-align: left;
        }
        .selection-item:hover { border-color: var(--secondary); background: white; }
        .selection-item.selected { border-color: var(--primary); background: rgba(0, 54, 102, 0.04); }

        .item-label { display: block; font-size: 1rem; font-weight: 800; color: var(--primary); }
        .item-desc { font-size: 0.8rem; color: var(--text-muted); }

        .selection-radio {
          width: 22px;
          height: 22px;
          border: 2.5px solid #E2E8F0;
          border-radius: 50%;
          position: relative;
          flex-shrink: 0;
        }
        .selected .selection-radio { border-color: var(--primary); }
        .selected .selection-radio::after {
          content: ''; position: absolute; inset: 4px;
          background: var(--primary); border-radius: 50%;
        }

        /* Summary Card */
        .summary-card {
          background: #F8FAFC;
          border-radius: 28px;
          border: 1px solid #E2E8F0;
          padding: 2rem;
        }

        .summary-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.85rem;
          font-weight: 900;
          color: var(--primary);
          letter-spacing: 0.1em;
          margin-bottom: 2rem;
          border-bottom: 1px solid #E2E8F0;
          padding-bottom: 1rem;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .summary-item label {
          display: block;
          font-size: 0.7rem;
          font-weight: 800;
          color: #64748B;
          text-transform: uppercase;
          margin-bottom: 0.4rem;
        }

        .summary-item p {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--primary);
          margin: 0;
        }

        .safety-disclaimer {
          display: flex;
          gap: 1rem;
          padding: 1.25rem;
          background: white;
          border: 1px solid #FED7AA;
          border-radius: 16px;
        }

        .safety-disclaimer p {
          font-size: 0.82rem;
          color: #9A3412;
          font-weight: 500;
          line-height: 1.5;
          margin: 0;
        }

        /* Actions */
        .finder-actions {
          display: flex;
          gap: 1rem;
          margin-top: 3rem;
        }

        .btn-back {
          background: white;
          border: 1px solid #E2E8F0;
          color: #64748B;
          padding: 1rem 2rem;
          border-radius: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-back:hover { background: #F8FAFC; color: var(--primary); }

        .btn-next, .btn-finish {
          flex: 1;
          background: var(--primary);
          color: white;
          padding: 1rem 2rem;
          border: none;
          border-radius: 16px;
          font-weight: 800;
          font-size: 1.1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: all 0.3s;
          box-shadow: 0 10px 30px rgba(0, 54, 102, 0.15);
        }

        .btn-next:hover, .btn-finish:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(0, 54, 102, 0.25);
          opacity: 0.95;
        }

        .btn-next:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .finder-footer {
          margin-top: 5rem;
          text-align: center;
          border-top: 1px solid #E2E8F0;
          padding-top: 2.5rem;
        }

        .info-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #10B981;
          font-size: 0.75rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }

        .footer-text {
          font-size: 0.85rem;
          color: #94A3B8;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.7;
        }

        .animate-in {
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .finder-container { padding: 2rem; border-radius: 30px; }
          .selection-grid { grid-template-columns: 1fr; }
          .selection-mini-grid { grid-template-columns: 1fr; }
          .biometric-row { grid-template-columns: 1fr; gap: 1rem; }
          .summary-grid { grid-template-columns: 1fr; gap: 1.5rem; }
          .finder-title { font-size: 1.85rem; }
        }
      `}</style>
    </div>
  );
}
/* eslint-disable react-hooks/set-state-in-effect, no-undef, no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Clock, 
  Package, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  FileText, 
  Send, 
  Loader2, 
  ExternalLink,
  Info,
  Calendar,
  Activity,
  Heart,
  Shield,
  Zap,
  FlaskConical,
  Beaker,
  History,
  FileSearch,
  Dna
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProtocolById } from '../services/protocolStorage';
import CostBreakdown from '../components/CostBreakdown';

export default function ProtocolResult({ products, region, isProfessional, addProtocolRequest, onOpenCart }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const protocolId = searchParams.get('id');
  
  const [loading, setLoading] = useState(true);
  const [protocol, setProtocol] = useState(null);
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  // Checkout-Style Navigation State
  // Can be 'phase-0', 'phase-1', ... or 'summary'
  const [activeStep, setActiveStep] = useState('phase-0');
  const [expandedSections, setExpandedSections] = useState({
    schedule: true,
    outcomes: false,
    safety: false
  });

  // Smart Phase Scroll Management
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeStep]);

  async function loadProtocol() {
    setLoading(true);
    const data = await getProtocolById(protocolId);
    if (data) {
      setProtocol(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (protocolId) {
      loadProtocol();
    }
  }, [protocolId]);

  const handleRequestProtocol = () => {
    if (!protocol) return;
    setIsAddingToCart(true);

    // Read directly from the Firestore document fields — always available on load
    const name = protocol.protocol_name || protocol.formData?.goal || 'Custom Protocol';
    const productList = Array.isArray(protocol.products)
      ? protocol.products.map(p => p.name || p).filter(Boolean)
      : [];
    const estimatedCost = protocol.cost_summary?.totalEstimatedCost
      || protocol.cost_summary?.total
      || 0;
    const phaseCount = Array.isArray(protocol.phases) ? protocol.phases.length : 0;

    addProtocolRequest({
      id: protocolId,
      name,
      goal: protocol.patient_inputs?.primary_focus || protocol.formData?.goal || '',
      phases: phaseCount,
      products: productList,
      estimatedCost,
      patientGuide: protocol.patientGuide || protocol.protocolData?.patientGuide || null,
    });

    setIsAddingToCart(false);
    if (onOpenCart) onOpenCart();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <Loader2 className="spinner-icon" size={40} color="var(--primary)" />
        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Finalizing Protocol Architecture...</p>
      </div>
    );
  }

  if (!protocol) {
    return (
      <div style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <h2>Protocol not found.</h2>
        <button onClick={() => navigate('/protocol-finder')} className="btn btn-primary" style={{ marginTop: '1rem' }}>Return to Finder</button>
      </div>
    );
  }

  // V4 Resilience: Extract from top-level or from the 'protocolData' map
  const rawData = protocol || {};
  const nestedData = (rawData.protocolData && typeof rawData.protocolData === 'object' && !Array.isArray(rawData.protocolData)) 
    ? rawData.protocolData 
    : {};
  
  // Create a flattened data object for easier access
  const data = { ...rawData, ...nestedData };
  
  const formData = data.formData || {};
  const confidenceScore = data.confidenceScore || 0;
  const validationStatus = data.status || 'pending';
  
  // Extract critical V4 caches
  const timelineCache = Array.isArray(data.timelineCache)
    ? data.timelineCache
    : Array.isArray(data.timeline)
      ? data.timeline
      : [];
  const costCache = data.costCache || data.costData || {};
  const patientGuide = data.patientGuide || null;
  const evidenceCache = data.evidenceCache || {};

  // Log for verification in dev console
  console.log("ProtocolResult: Resolved data object", { timeline: timelineCache.length, hasGuide: !!patientGuide });

  // Helper for product slug (assuming name to slug conversion)
  const getSlug = (name) => name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

  return (
    <div className="protocol-result-page" style={{ 
      backgroundColor: 'var(--background)', 
      minHeight: '100vh', 
      paddingBottom: '5rem',
      position: 'relative',
      zIndex: 10
    }}>
      {/* Scrollable Container */}
      <div className="container" style={{ maxWidth: '700px', padding: '1.5rem' }}>
        
        {/* Header Section */}
        <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <button 
            onClick={() => navigate(`/protocol-finder?id=${protocolId}`)}
            style={{ 
              backgroundColor: 'white', 
              border: '1px solid var(--border)', 
              borderRadius: '50%', 
              width: '40px', 
              height: '40px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 850, margin: 0, color: 'var(--primary)', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>Protocol Checkout</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>Reference ID: {protocolId.substring(0, 8)}</p>
          </div>
        </header>

        {/* Checkout-Style Protocol Navigation (Section 16) */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: 'var(--background)',
          padding: '1rem 0',
          marginBottom: '2rem',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            overflowX: 'auto', 
            paddingBottom: '0.5rem',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none' // IE 10+
          }}>
            {/* 1. Patient Inputs (Completed) */}
            <button 
              onClick={() => navigate(`/protocol-finder?id=${protocolId}`)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0, background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-success)', fontWeight: 700, fontSize: '0.85rem' }}
            >
              <CheckCircle2 size={16} /> Inputs
            </button>
            <ChevronRight size={14} color="var(--color-border)" style={{ flexShrink: 0 }} />

            {/* 2. Validation (Completed) */}
            <button 
              onClick={() => navigate(`/protocol-finder/validation?id=${protocolId}`)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0, background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-success)', fontWeight: 700, fontSize: '0.85rem' }}
            >
              <CheckCircle2 size={16} /> Validation
            </button>
            <ChevronRight size={14} color="var(--color-border)" style={{ flexShrink: 0 }} />

            {/* 3. Phases */}
            {timelineCache && timelineCache.map((phase, idx) => {
              const stepId = `phase-${idx}`;
              const isActive = activeStep === stepId;
              let isCompleted = false;
              if (activeStep === 'summary') isCompleted = true;
              else if (activeStep.startsWith('phase-')) {
                const currentIdx = parseInt(activeStep.replace('phase-', ''));
                if (idx < currentIdx) isCompleted = true;
              }

              return (
                <React.Fragment key={stepId}>
                  <button 
                    onClick={() => setActiveStep(stepId)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.4rem', 
                      flexShrink: 0, 
                      background: 'none', 
                      border: 'none', 
                      padding: '0.25rem 0.5rem', 
                      cursor: 'pointer', 
                      color: isActive ? 'var(--primary)' : isCompleted ? 'var(--color-success)' : 'var(--text-muted)', 
                      fontWeight: isActive ? 800 : 600, 
                      fontSize: '0.85rem',
                      borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isCompleted && <CheckCircle2 size={14} />} Phase {idx + 1}
                  </button>
                  <ChevronRight size={14} color="var(--color-border)" style={{ flexShrink: 0 }} />
                </React.Fragment>
              );
            })}

            {/* 4. Summary Checkout */}
            <button 
              onClick={() => setActiveStep('summary')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                flexShrink: 0, 
                background: 'none', 
                border: 'none', 
                padding: '0.25rem 0.5rem', 
                cursor: 'pointer', 
                color: activeStep === 'summary' ? 'var(--primary)' : 'var(--text-muted)', 
                fontWeight: activeStep === 'summary' ? 800 : 600, 
                fontSize: '0.85rem',
                borderBottom: activeStep === 'summary' ? '2px solid var(--primary)' : '2px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              Summary
            </button>
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            .clinical-timeline-bar::-webkit-scrollbar { display: none; }
            .collapse-header {
              display: flex; justify-content: space-between; align-items: center; 
              width: 100%; padding: 1.25rem; background: none; border: none; cursor: pointer;
              font-weight: 800; color: var(--primary); text-align: left;
            }
            .collapse-content {
              padding: 0 1.25rem 1.25rem 1.25rem;
            }
          `}} />
        </div>

        {/* 1. Content Order: Title & Identity */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(0,150,204,0.1)', color: 'var(--secondary)', padding: '0.4rem 1.25rem', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
             {formData.primaryCondition || 'Custom Protocol'}
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 850, lineHeight: 1.05, marginBottom: '0.75rem', color: 'var(--primary)', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.04em' }}>
            {formData.goal || 'Optimized Metabolic Support'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600, marginBottom: '1.25rem' }}>
             <Clock size={16} /> Duration: {formData.duration || '12 Weeks'}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'var(--color-bg-app)', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
              <FlaskConical size={14} color="var(--primary)" /> PUBMED INDEXED
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'var(--color-bg-app)', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
              <ShieldCheck size={14} color="var(--color-success)" /> 99%+ PURITY BASIS
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'var(--color-bg-app)', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
              <Beaker size={14} color="#f59e0b" /> RESEARCH GRADE
            </div>
          </div>
        </div>

        {/* 2. Confidence Panel */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, margin: '0 0 0.25rem 0' }}>Clinical Confidence</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: confidenceScore > 90 ? 'var(--color-success)' : '#f59e0b' }}>{confidenceScore}%</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Alignment Score</span>
            </div>
          </div>
          {validationStatus === 'approved' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ color: 'var(--color-success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                <ShieldCheck size={16} /> VALIDATED
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>V4 Security Logic</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Link to={`/protocol-finder/validation?id=${protocolId}`} style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Verify Clinical Data <ChevronRight size={16} />
              </Link>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>V4 Security Logic</span>
            </div>
          )}
        </div>

        {/* 3. Clinical Synergy Block */}
        <div style={{ 
          marginBottom: '2.5rem', 
          padding: '1.5rem', 
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
          borderRadius: '16px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.15)'
        }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
            <Dna size={120} color="white" />
          </div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.4rem', borderRadius: '8px' }}>
                <Zap size={18} color="#fbbf24" />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, letterSpacing: '0.02em' }}>Synergistic Architecture</h3>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', margin: 0 }}>
              This protocol utilizes a multi-pathway approach. Primary agents target cellular repair while secondary compounds optimize metabolic efficiency, ensuring a recursive feedback loop that maximizes research outcomes and systemic stability.
            </p>
            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Bioavailability</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 900 }}>High-Grade</div>
              </div>
              <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Synergy Index</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 900 }}>Optimized</div>
              </div>
            </div>
          </div>
        </div>

        {/* --- DYNAMIC PROTOCOL VIEWS --- */}
        
        {/* VIEW A: PHASE SCREEN */}
        {activeStep.startsWith('phase-') && timelineCache && timelineCache.length > 0 && (
          <section style={{ marginBottom: '2.5rem', animation: 'fadeIn 0.3s ease-out' }}>
            {(() => {
               const phaseIdx = parseInt(activeStep.replace('phase-', ''));
               const phase = timelineCache[phaseIdx];
               if (!phase) return null;
               
               let startWeek = 1;
               for (let i = 0; i < phaseIdx; i++) {
                 const p = timelineCache[i];
                 const match = p?.duration ? p.duration.match(/\d+/) : null;
                 startWeek += match ? parseInt(match[0]) : 4;
               }
               const phaseMatch = phase.duration ? phase.duration.match(/\d+/) : null;
               const durationWeeks = phaseMatch ? parseInt(phaseMatch[0]) : 4;
               const endWeek = startWeek + durationWeeks - 1;
               
               return (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                   <div className="clinical-card" style={{ padding: '1.5rem', border: '2px solid var(--primary)', backgroundColor: 'var(--color-bg-app)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                           <span style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em' }}>
                             PHASE {phaseIdx + 1}
                           </span>
                           <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                             WEEKS {startWeek}-{endWeek}
                           </span>
                         </div>
                         <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                           <Clock size={14} /> {phase.duration}
                         </span>
                      </div>
                      <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1.5rem', color: 'var(--text-main)', lineHeight: 1.1 }}>
                        {phase.name}
                      </h2>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Package size={14} /> Phase Agents
                          </h4>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                             {(phase.items || []).map((item, i) => (
                               <Link key={i} to={`/product/${getSlug(item.name)}`} className="chip" style={{ fontSize: '0.85rem', textDecoration: 'none' }}>
                                 {item.name} <ExternalLink size={12} opacity={0.5} />
                               </Link>
                             ))}
                          </div>
                        </div>

                        <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Activity size={14} /> Phase Dosing Summary
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                            {(phase.items || []).map((item, i) => {
                               const phaseItems = phase.items || [];
                               const catalogProduct = products ? products.find(p => p.name === item.name) : null;
                               const dosageToDisplay = item.dosage || catalogProduct?.strength || 'Administer as scheduled';
                               return (
                                 <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: i !== (phaseItems.length - 1) ? '0.5rem' : 0, borderBottom: i !== (phaseItems.length - 1) ? '1px solid #f1f5f9' : 'none' }}>
                                   <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{item.name}</strong>
                                   <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, backgroundColor: '#f0f9ff', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                                     {dosageToDisplay}
                                   </span>
                                 </div>
                               );
                            })}
                          </div>
                        </div>
                      </div>
                   </div>

                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                     {patientGuide?.weeklyCalendar && (
                       <div className="clinical-card" style={{ padding: 0, overflow: 'hidden' }}>
                          <button 
                            className="collapse-header" 
                            onClick={() => setExpandedSections(p => ({...p, schedule: !p.schedule}))}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Calendar size={18}/> Weekly Schedule
                            </span>
                            <ChevronRight size={18} style={{ transform: expandedSections.schedule ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                          </button>
                          
                          {expandedSections.schedule && (
                             <div className="collapse-content" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                                 {Object.entries(patientGuide.weeklyCalendar).map(([day, action]) => {
                                    const isRest = action.toLowerCase().includes('rest') || action.toLowerCase().includes('none') || action.toLowerCase().includes('off');
                                    const isMaintenance = action.toLowerCase().includes('maintenance');
                                    return (
                                      <div key={day} style={{ 
                                        padding: '1rem 0.75rem', 
                                        backgroundColor: isRest ? 'var(--color-bg-app)' : isMaintenance ? 'var(--color-success-bg)' : '#eff6ff', 
                                        border: `1px solid ${isRest ? 'var(--color-border)' : isMaintenance ? '#bbf7d0' : '#bfdbfe'}`,
                                        borderRadius: '8px',
                                        textAlign: 'center'
                                      }}>
                                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800, color: isRest ? 'var(--color-text-secondary)' : isMaintenance ? '#166534' : '#1e40af', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>{day}</div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{action}</div>
                                      </div>
                                    );
                                 })}
                               </div>
                             </div>
                          )}
                       </div>
                     )}

                     {patientGuide?.safetyNotes && (
                        <div className="clinical-card" style={{ padding: 0, overflow: 'hidden' }}>
                          <button 
                            className="collapse-header" 
                            onClick={() => setExpandedSections(p => ({...p, safety: !p.safety}))}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)' }}>
                              <Shield size={18}/> Clinical & Safety Notes
                            </span>
                            <ChevronRight size={18} style={{ transform: expandedSections.safety ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} color="var(--color-success)" />
                          </button>
                          
                          {expandedSections.safety && (
                             <div className="collapse-content" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                  {Array.isArray(patientGuide.safetyNotes.sideEffects) && patientGuide.safetyNotes.sideEffects.length > 0 && (
                                    <div style={{ marginBottom: '1rem', backgroundColor: 'var(--color-warning-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                                      <strong style={{ color: 'var(--color-warning)', display: 'block', marginBottom: '0.25rem' }}>Monitor for:</strong>
                                      <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#92400e' }}>
                                        {patientGuide.safetyNotes.sideEffects.map((effect, eIdx) => <li key={eIdx}>{effect}</li>)}
                                      </ul>
                                    </div>
                                  )}
                                  <strong style={{ color: 'var(--text-main)' }}>Recommended Routine Labs:</strong>
                                  <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.2rem' }}>
                                    {Array.isArray(patientGuide.safetyNotes.recommendedTests) ? patientGuide.safetyNotes.recommendedTests.map((test, i) => (
                                      <li key={i}>{test}</li>
                                    )) : <li>Routine metabolic panel</li>}
                                  </ul>
                                </div>
                             </div>
                          )}
                       </div>
                     )}
                   </div>
                 </div>
               );
            })()}
          </section>
        )}
        
        {/* VIEW B: SUMMARY SCREEN */}
        {activeStep === 'summary' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            {patientGuide && (
          <section style={{ marginBottom: '2.5rem' }}>
            <h3 className="clinical-heading" style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <FileText size={20} color="var(--primary)" /> Patient Clinical Guide
            </h3>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {patientGuide.programAtAGlance && (
                <div className="clinical-card" style={{ padding: '1.5rem', border: 'none', backgroundColor: '#f0f9ff' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                    <Activity size={18} /> Program at a Glance
                  </h4>
                  <div style={{ fontSize: '0.95rem', marginBottom: '1rem', fontWeight: 600, color: '#0c4a6e' }}>{patientGuide.programAtAGlance.goal}</div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem', color: '#0f172a', lineHeight: 1.6 }}>
                    {Array.isArray(patientGuide.programAtAGlance.benefits) && patientGuide.programAtAGlance.benefits.map((b, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{b}</li>)}
                  </ul>
                </div>
              )}

              {patientGuide.weeklyCalendar && (
                <div className="clinical-card" style={{ padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={18} color="var(--primary)" /> Weekly Admin Schedule
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                    {Object.entries(patientGuide.weeklyCalendar).map(([day, action]) => {
                       const isRest = action.toLowerCase().includes('rest') || action.toLowerCase().includes('none') || action.toLowerCase().includes('off');
                       const isMaintenance = action.toLowerCase().includes('maintenance');
                       return (
                         <div key={day} style={{ 
                           padding: '1rem 0.75rem', 
                           backgroundColor: isRest ? 'var(--color-bg-app)' : isMaintenance ? 'var(--color-success-bg)' : '#eff6ff', 
                           border: `1px solid ${isRest ? 'var(--color-border)' : isMaintenance ? '#bbf7d0' : '#bfdbfe'}`,
                           borderRadius: '8px',
                           textAlign: 'center'
                         }}>
                           <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800, color: isRest ? 'var(--color-text-secondary)' : isMaintenance ? '#166534' : '#1e40af', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>{day}</div>
                           <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{action}</div>
                         </div>
                       );
                    })}
                  </div>
                </div>
              )}

              {patientGuide.expectedResults && (() => {
                const rawMetric = patientGuide.expectedResults.metric || '';
                const obs       = Array.isArray(patientGuide.expectedResults.observations)
                                    ? patientGuide.expectedResults.observations
                                    : [];

                const detectUnit = (metric, observations) => {
                  const combined = [metric, ...observations].join(' ').toLowerCase();
                  if (combined.match(/hba1c|a1c|glucose|sugar/))           return '%';
                  if (combined.match(/fat|body\s*fat|bmi|weight|mass/))    return '%';
                  if (combined.match(/waist|circumference|hip|height/))    return 'cm';
                  if (combined.match(/kg\b/))                              return 'kg';
                  if (combined.match(/\blb\b/))                            return 'lb';
                  if (combined.match(/%/))                                 return '%';
                  if (combined.match(/\bcm\b/))                            return 'cm';
                  return null;
                };
                const unit         = detectUnit(rawMetric, obs);
                const alreadyHasUnit = unit && rawMetric.toLowerCase().includes(unit.toLowerCase());
                const displayTitle = unit && !alreadyHasUnit ? `${rawMetric} (${unit})` : rawMetric;

                const getAxisLabel = (metric) => {
                  const m = metric.toLowerCase();
                  if (m.match(/hba1c|a1c/))                    return 'Expected reduction by week';
                  if (m.match(/fat|body\s*fat/))               return 'Expected percentage reduction per phase';
                  if (m.match(/waist|circumference/))          return 'Expected reduction in centimeters over time';
                  if (m.match(/weight|mass/))                  return 'Expected weight reduction over protocol';
                  if (m.match(/glucose|sugar|insulin/))        return 'Expected blood glucose change over time';
                  if (m.match(/skin|collagen|texture|elastic/))return 'Dermal improvement score over time';
                  if (m.match(/energy|fatigue|stamina/))       return 'Expected energy level improvement';
                  if (m.match(/pain|inflammation/))            return 'Expected pain score reduction over time';
                  return 'Expected clinical improvement by timepoint';
                };

                const parseObs = (str) => {
                  const weekMatch  = str.match(/week\s*(\d+)/i);
                  const phaseMatch = str.match(/phase\s*(\d+)/i);
                  const monthMatch = str.match(/month\s*(\d+)/i);
                  const valMatch   = str.match(/([\d.]+)\s*(%|cm|kg|lb)/i);
                  return {
                    week:  weekMatch  ? parseInt(weekMatch[1])  : null,
                    phase: phaseMatch ? parseInt(phaseMatch[1]) : null,
                    month: monthMatch ? parseInt(monthMatch[1]) : null,
                    value: valMatch   ? parseFloat(valMatch[1]) : null,
                    unit:  valMatch   ? valMatch[2]             : unit,
                    raw:   str,
                  };
                };

                const parsed   = obs.map(parseObs);
                const maxValue = Math.max(...parsed.map(p => p.value || 0), 1);

                return (
                  <div className="clinical-card" style={{ padding: '1.5rem', border: '1px solid #e0f2fe', backgroundColor: '#f0f9ff' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0369a1' }}>
                      <CheckCircle2 size={18} /> {displayTitle}
                    </h4>
                    <p style={{ fontSize: '0.76rem', color: '#4da6cc', fontWeight: 600, margin: '0 0 1.25rem 0', letterSpacing: '0.01em' }}>
                      {getAxisLabel(rawMetric)}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {parsed.map((p, i) => {
                        const timeLabel = p.week  !== null ? `Week ${p.week}`
                                        : p.phase !== null ? `Phase ${p.phase}`
                                        : p.month !== null ? `Month ${p.month}`
                                        : `Point ${i + 1}`;

                        const pct = p.value !== null
                          ? Math.min(Math.round((p.value / maxValue) * 100), 100)
                          : null;

                        const displayValue = p.value !== null
                          ? `${p.value}${p.unit || ''}`
                          : p.raw;

                        return (
                          <div key={i}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                              <span style={{
                                fontSize: '0.72rem', fontWeight: 800, color: '#0369a1',
                                textTransform: 'uppercase', letterSpacing: '0.06em'
                                }}>
                                {timeLabel}
                              </span>
                              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0c4a6e' }}>
                                {displayValue}
                              </span>
                            </div>
                            {pct !== null ? (
                              <div style={{ height: '7px', backgroundColor: '#bae6fd', borderRadius: '999px', overflow: 'hidden' }}>
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.15 }}
                                  style={{
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #38bdf8, #0369a1)',
                                    borderRadius: '999px',
                                  }} />
                              </div>
                            ) : (
                              <span className="chip" style={{ backgroundColor: 'white', borderColor: '#bae6fd', color: '#0369a1', fontSize: '0.8rem' }}>
                                {p.raw}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {patientGuide.lifestyleRecommendations && (
                  <div className="clinical-card" style={{ padding: '1.25rem', border: '1px solid #e2e8f0', backgroundColor: '#fafafa' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Heart size={16} color="var(--color-danger)" /> Lifestyle
                    </h4>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      <ul style={{ margin: 0, paddingLeft: '1.2rem', marginBottom: '0.5rem' }}>
                        {Array.isArray(patientGuide.lifestyleRecommendations.nutrition) && patientGuide.lifestyleRecommendations.nutrition.slice(0, 2).map((n, i) => <li key={i}>{n}</li>)}
                      </ul>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '0.5rem' }}>
                        <Activity size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/> 
                        {patientGuide.lifestyleRecommendations.activity?.[0] || "Maintain active profile"}
                      </div>
                    </div>
                  </div>
                )}
                {patientGuide.safetyNotes && (
                  <div className="clinical-card" style={{ padding: '1.25rem', border: '1px solid #e2e8f0', backgroundColor: '#fafafa' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Shield size={16} color="var(--color-success)" /> Safety Highlights
                    </h4>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {Array.isArray(patientGuide.safetyNotes.sideEffects) && patientGuide.safetyNotes.sideEffects.length > 0 && (
                        <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.25rem' }}>
                          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px', color: '#f59e0b' }}/> 
                          <span>Monitor for {patientGuide.safetyNotes.sideEffects[0].toLowerCase()}</span>
                        </div>
                      )}
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '0.75rem', marginBottom: '0.25rem' }}>Recommended Labs:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {Array.isArray(patientGuide.safetyNotes.recommendedTests) ? patientGuide.safetyNotes.recommendedTests.slice(0, 2).map((test, i) => (
                          <span key={i} style={{ fontSize: '0.75rem', backgroundColor: 'var(--color-border)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--color-text-primary)', fontWeight: 500 }}>{test}</span>
                        )) : "Routine labs"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 4. Products Section */}
        <section style={{ marginBottom: '2.5rem' }}>
           <h3 className="clinical-heading" style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Package size={20} color="var(--primary)" /> Required Agents
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {Array.isArray(timelineCache) && timelineCache.reduce((acc, rawPhase) => {
              if (!rawPhase) return acc;
              const agents = Array.isArray(rawPhase.items) ? rawPhase.items : [rawPhase];
              agents.forEach(item => {
                if (item && item.name && !acc.find(i => i.name === item.name)) acc.push(item);
              });
              return acc;
            }, []).map((item, idx) => {
              const p = products.find(prod => prod.name === item.name);
              return (
                <Link 
                  key={idx} 
                  to={`/product/${getSlug(item.name)}`}
                  className="clinical-card" 
                  style={{ 
                    padding: '1.25rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Package size={20} color="var(--primary)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>{item.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p?.strength || item.dosage || 'Standard Concentration'}</div>
                    </div>
                  </div>
                  <ChevronRight size={18} color="var(--color-text-tertiary)" />
                </Link>
              );
            })}
          </div>
        </section>

        {/* 5. Cost Summary & Economics */}
        <section style={{ marginBottom: '4.5rem' }}>
           <h3 className="clinical-heading" style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <DollarSign size={20} color="var(--primary)" /> Investment Summary
          </h3>
          <div className="clinical-card" style={{ padding: '1.5rem', backgroundColor: 'var(--color-bg-app)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Total Protocol Value:</span>
              <span style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--primary)' }}>
                ${costCache?.totalEstimatedCost || '0.00'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Per Week</div>
                <div style={{ fontWeight: 800 }}>${((costCache?.totalEstimatedCost || 0) / (parseInt(formData.duration) || 12)).toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Per Agent</div>
                <div style={{ fontWeight: 800 }}>${((costCache?.totalEstimatedCost || 0) / (timelineCache?.length || 1)).toFixed(2)}</div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowCostBreakdown(true)}
              className="btn btn-secondary"
              style={{ 
                width: '100%', 
                marginTop: '1.5rem', 
                padding: '0.9rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem',
              }}
            >
              <Info size={16} /> Detailed Cost Breakdown
            </button>

            <button 
              onClick={handleRequestProtocol}
              disabled={isAddingToCart}
              className="btn btn-primary"
              style={{ 
                width: '100%', 
                marginTop: '1rem', 
                padding: '1rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.75rem',
                fontSize: '1rem',
                fontWeight: 800
              }}
            >
              {isAddingToCart ? <Loader2 className="spinner-icon" size={20} /> : <Send size={20} />}
              {isAddingToCart ? 'Synthesizing Request...' : 'Proceed to Logistics Optimization'}
            </button>
          </div>
        </section>

        {/* Cost Breakdown Modal Overlay */}
        {showCostBreakdown && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div className="card" style={{ 
              width: '100%', 
              maxWidth: '500px', 
              maxHeight: '90vh', 
              overflowY: 'auto',
              padding: '2rem',
              position: 'relative'
            }}>
              <button 
                onClick={() => setShowCostBreakdown(false)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={24} />
              </button>
              <CostBreakdown protocol={protocol} products={products} />
            </div>
          </div>
        )}
      </div>
    )}
      </div>
    </div>
  );
}

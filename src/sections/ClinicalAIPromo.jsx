/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles, Zap, Calculator, ChevronRight, BrainCircuit, Globe, ShieldCheck } from 'lucide-react';

export default function ClinicalAIPromo() {
  const openAI = () => {
    window.dispatchEvent(new CustomEvent('open-clinical-ai', {
      detail: { query: "I want to understand how peptide research works and where to start." }
    }));
  };

  return (
    <section className="ai-promo-section" style={{
      padding: '8rem 1rem',
      background: '#020617',
      position: 'relative',
      overflow: 'hidden',
      color: 'white'
    }}>
      {/* Immersive background effects */}
      <div style={{
        position: 'absolute', top: '20%', left: '10%', width: '30%', height: '40%',
        background: 'radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 1
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '5%', width: '40%', height: '50%',
        background: 'radial-gradient(circle, rgba(129, 140, 248, 0.08) 0%, transparent 70%)',
        filter: 'blur(100px)', pointerEvents: 'none', zIndex: 1
      }} />
      
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '4rem', 
          alignItems: 'center' 
        }}>
          {/* Content Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1.25rem', borderRadius: '100px',
              background: 'rgba(34, 211, 238, 0.1)', border: '1px solid rgba(34, 211, 238, 0.2)',
              marginBottom: '2rem', fontSize: '0.85rem', fontWeight: 800, color: '#22d3ee',
              textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>
              <BrainCircuit size={16} /> Knowledge Intelligence
            </div>

            <h2 style={{ 
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 900, lineHeight: 1,
              marginBottom: '1.5rem', letterSpacing: '-0.04em'
            }}>
              Next-Gen <br />
              <span style={{ 
                background: 'linear-gradient(to right, #22d3ee, #818cf8, #c084fc)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent' 
              }}>Scientific Support.</span>
            </h2>

            <p style={{ 
              fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', 
              lineHeight: 1.6, marginBottom: '3rem', maxWidth: '540px'
            }}>
              Bridge the gap between complex data and actionable research. Our AI Knowledge Hub 
              synthesizes laboratory protocols, chemical profiles, and precise calculations in seconds.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
              <button 
                onClick={openAI}
                style={{
                  padding: '1.25rem 2.5rem', borderRadius: '18px',
                  background: 'white', color: '#020617', fontWeight: 800,
                  fontSize: '1rem', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 30px 60px rgba(34, 211, 238, 0.3)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
                }}
              >
                Launch Knowledge AI <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>

          {/* Visual Column / UI Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            style={{ position: 'relative', perspective: '1000px' }}
          >
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(20px)',
              borderRadius: '32px',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '2.5rem',
              boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
              position: 'relative',
              zIndex: 2
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }} />
                <div style={{ flex: 1 }} />
                <Bot size={20} color="#22d3ee" />
              </div>

              <div style={{ spaceY: '1.5rem' }}>
                {[
                  { label: "Compound Analysis", status: "Complete", color: "#22d3ee" },
                  { label: "Protocol Synthesis", status: "Active", color: "#818cf8" },
                  { label: "Global Logistics Sync", status: "Verified", color: "#4ade80" }
                ].map((item, idx) => (
                  <div key={idx} style={{ 
                    marginBottom: '1.25rem', padding: '1rem', 
                    borderRadius: '16px', background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{item.label}</span>
                    <span style={{ 
                      fontSize: '0.7rem', fontWeight: 800, color: item.color, 
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      padding: '0.25rem 0.6rem', borderRadius: '6px', background: `${item.color}15`
                    }}>{item.status}</span>
                  </div>
                ))}
              </div>

              <div style={{ 
                marginTop: '2rem', padding: '1.5rem', borderRadius: '20px', 
                background: 'linear-gradient(135deg, rgba(34,211,238,0.1), rgba(129,140,248,0.1))',
                border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22d3ee', marginBottom: '0.5rem' }}>RECONSTITUTION MATH</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>5.0mg → 2ml = <span style={{ color: '#22d3ee' }}>10U</span></div>
              </div>
            </div>

            {/* Decorative orbit */}
            <div style={{
              position: 'absolute', top: '-10%', right: '-10%', width: '120%', height: '120%',
              border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '50%',
              zIndex: 1, pointerEvents: 'none'
            }} />
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div style={{ 
          marginTop: '6rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4rem'
        }}>
          {[
            { icon: <ShieldCheck />, title: "Precision Protocols", desc: "Access validated research methodology instantly." },
            { icon: <Calculator />, title: "Smart Calculations", desc: "Zero-error mixing ratios for any compound vial." },
            { icon: <Globe />, title: "Real-time Availability", desc: "Syncs directly with our global laboratory inventory." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + i * 0.1 }}
              style={{ textAlign: 'left' }}
            >
              <div style={{ color: '#22d3ee', marginBottom: '1.25rem', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(34,211,238,0.1)', borderRadius: '12px' }}>{feature.icon}</div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>{feature.title}</h4>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

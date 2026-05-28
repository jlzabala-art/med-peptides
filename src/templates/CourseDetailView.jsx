 
import React from 'react';
import { ChevronLeft, CheckCircle2, Calendar, Clock, MonitorPlay, Award, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CourseDetailView({ onBack }) {
  const { isProfessional } = useAuth();

  if (!isProfessional) {
    return (
      <div className="container" style={{ paddingTop: '120px', minHeight: '60vh', textAlign: 'center' }}>
        <h2>Restricted Access</h2>
        <p>This content is exclusively available to verified medical professionals.</p>
        <button onClick={onBack} style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '4rem', backgroundColor: 'var(--background)', minHeight: '100vh' }}>
      
      {/* Back Navigation */}
      <div className="container" style={{ marginBottom: '2rem' }}>
        <button 
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'none', border: 'none', color: 'var(--text-muted)',
            fontWeight: 600, cursor: 'pointer', padding: 0
          }}
          onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ChevronLeft size={20} /> Back to Academy
        </button>
      </div>

      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem', alignItems: 'start' }}>
        
        {/* Main Content */}
        <div>
          <span style={{ color: 'var(--secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem' }}>
            Master Protocols Program
          </span>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.5rem 0 1rem 0', lineHeight: 1.1 }}>
            Renewal Master Protocols - Peptides
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Advanced training on peptide therapy for human optimization. Learn all relevant clinical protocols for immunity, metabolism, neurobiology, and longevity.
          </p>

          <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>A new frontier in optimization medicine</h2>
            <p style={{ color: 'var(--text-main)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Peptides have emerged as a key component of precision medicine, especially when integrated with hormone optimization strategies. The challenge is not awareness, but knowing how to apply them with clinical logic, safety, and real-world relevance.
            </p>
            <p style={{ color: 'var(--text-main)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              The <strong>Renewal Master Protocols</strong> is a comprehensive program designed to help clinicians master peptide therapy and integrate it strategically into modern practice. Over two months, you'll learn advanced clinical protocols guided by leading experts in hormone optimization, integrative medicine, and longevity science.
            </p>

            <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginTop: '2.5rem', marginBottom: '1rem' }}>Why this training delivers real clinical impact:</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                "Design safe, integrated peptide protocols",
                "Select peptides based on systems biology, not trends",
                "Integrate peptides with HRT, metabolism, and inflammation control",
                "Manage complex cases with confidence",
                "Position yourself as a reference clinician in peptide therapy",
                "Increasing patient interest in optimization and longevity strategies",
                "Integration of peptides with existing therapeutic models",
                "Responsible and scientifically supported clinical use"
              ].map((item, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--text-main)' }}>
                  <CheckCircle2 size={20} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '2rem' }}>Learn from International Medical Leaders</h2>
            
            <div style={{ display: 'grid', gap: '2rem' }}>
              {/* Speaker 1 */}
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--primary)', opacity: 0.1 }}></div>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.2rem', margin: '0 0 0.25rem 0', color: 'var(--text-main)' }}>Dr. Adrián Gaspar, M.D.</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--secondary)', fontWeight: 600, margin: '0 0 0.75rem 0' }}>OB/GYN & Anti-aging Medicine</p>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>Over 30 years of experience and international recognition in regenerative and functional gynecology. He developed the vaginal and urethral laser technique for treating genitourinary syndrome of menopause.</p>
                </div>
              </div>
              
              {/* Speaker 2 */}
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--primary)', opacity: 0.1 }}></div>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.2rem', margin: '0 0 0.25rem 0', color: 'var(--text-main)' }}>Dr. Francisco Tostes, M.D.</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--secondary)', fontWeight: 600, margin: '0 0 0.75rem 0' }}>Medical Director of Renewal EU | Endocrinologist</p>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>Master’s degree in Biochemistry and Molecular Biology, and advanced training across endocrinology, sports nutrition, obesity, eating disorders, and transgender healthcare. Active researcher in hormone therapies.</p>
                </div>
              </div>

               {/* Speaker 3 */}
               <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--primary)', opacity: 0.1 }}></div>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.2rem', margin: '0 0 0.25rem 0', color: 'var(--text-main)' }}>Dr. Rodrigo Ayoub, M.D.</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--secondary)', fontWeight: 600, margin: '0 0 0.75rem 0' }}>Orthomolecular and Anti-Aging Medicine</p>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>Over 29 years of clinical experience. Faculty member of Portugal's largest hormone therapy training program. Master’s degree in Aesthetic Medicine and postgraduate training in Cosmetic Medicine and Surgery.</p>
                </div>
              </div>

               {/* Speaker 4 */}
               <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--primary)', opacity: 0.1 }}></div>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.2rem', margin: '0 0 0.25rem 0', color: 'var(--text-main)' }}>Dr. Andréa Sánchez, M.D.</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--secondary)', fontWeight: 600, margin: '0 0 0.75rem 0' }}>Precision and Regenerative Medicine</p>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>Training in Nutrology and Lifestyle Medicine. Integrates evidence-based medicine, genomics, and epigenetics. Director of EAPMED and European Ambassador for IARM.</p>
                </div>
              </div>

              {/* Surprise Speaker */}
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--primary)', opacity: 0.1 }}></div>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.2rem', margin: '0 0 0.25rem 0', color: 'var(--text-main)' }}>Surprise Speaker, M.D.</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, margin: '0 0 0.75rem 0' }}>Special Guest</p>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>Internationally trained physician and pioneer in regenerative and reconstructive medicine. Founder of the International Academy of Regenerative Medicine.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info Card */}
        <div style={{ position: 'sticky', top: '100px' }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: 'var(--radius-lg)', 
            boxShadow: 'var(--shadow-lg)', 
            border: '1px solid var(--border)',
            overflow: 'hidden'
          }}>
            <div style={{ backgroundColor: '#0a192f', color: 'white', padding: '2rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8, display: 'block', marginBottom: '0.5rem' }}>Global Lecture Series</span>
              <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Renewal Master Protocols</h3>
            </div>
            
            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ backgroundColor: 'rgba(0, 150, 255, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                    <Calendar size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Start Date</span>
                    <strong style={{ color: 'var(--text-main)' }}>March 24th, 2026</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ backgroundColor: 'rgba(0, 150, 255, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                    <Clock size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Duration</span>
                    <strong style={{ color: 'var(--text-main)' }}>8 weeks (1 class/week)</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ backgroundColor: 'rgba(0, 150, 255, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                    <MonitorPlay size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Format</span>
                    <strong style={{ color: 'var(--text-main)' }}>Online Live Sessions</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ backgroundColor: 'rgba(0, 150, 255, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                    <Award size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Certification</span>
                    <strong style={{ color: 'var(--text-main)' }}>Included</strong>
                  </div>
                </div>
              </div>

              <a 
                href="https://bit.ly/masterprotocols-peptides" 
                target="_blank" 
                rel="noreferrer"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'var(--primary)', 
                  color: 'white', 
                  textDecoration: 'none',
                  padding: '1rem', 
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  transition: 'background 0.2s',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-dark)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
              >
                Register Now <ArrowRight size={18} />
              </a>
              
              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem', fontStyle: 'italic' }}>
                Seats are limited to ensure real-time interaction and clinical discussion.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

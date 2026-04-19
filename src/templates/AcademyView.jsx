import React from 'react';
import { ChevronRight, PlayCircle, BookOpen, Award, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AcademyView({ onSelectCourse }) {
  const { isProfessional } = useAuth();

  if (!isProfessional) {
    return (
      <div className="container" style={{ paddingTop: '120px', minHeight: '60vh', textAlign: 'center' }}>
        <h2>Restricted Access</h2>
        <p>This section is exclusively available to verified medical professionals.</p>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '120px', paddingBottom: '4rem', minHeight: '80vh', backgroundColor: 'var(--background)' }}>
      {/* Hero Section */}
      <div className="container" style={{ marginBottom: '3rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 800, 
          color: 'var(--primary)',
          marginBottom: '1rem'
        }}>
          Knowledge & Academy
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '800px' }}>
          Exclusive educational resources, advanced clinical protocols, and masterclasses designed for professionals ready to expand their impact in precision medicine and peptide therapy.
        </p>
      </div>

      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '1000px', marginBottom: '1.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', margin: 0 }}>
            Available Courses
          </h2>
        </div>

        {/* Featured Course Card */}
        <div 
          onClick={() => onSelectCourse('renewal-master-protocols')}
          style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            border: '1px solid var(--border)',
            width: '100%',
            maxWidth: '1000px',
            position: 'relative'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }}
        >
          {/* Tag */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '25px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            padding: '0.4rem 1rem',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            zIndex: 10
          }}>
            New Masterclass
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: '0' }}>
            {/* Image Placeholder */}
            <div style={{
              backgroundColor: '#0a192f',
              backgroundImage: 'radial-gradient(circle at top right, #112240, #0a192f)',
              padding: '3rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              color: 'white',
              minHeight: '300px'
            }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Global Lecture Series</span>
              <h3 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.1, margin: '0 0 1rem 0' }}>
                Renewal Master Protocols
              </h3>
              <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                Peptide Therapy for Human Optimization
              </p>
            </div>

            {/* Content */}
            <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  Learn all relevant clinical protocols for immunity, metabolism, neurobiology, and longevity guided by leading international experts.
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                    <PlayCircle size={18} color="var(--primary)" />
                    <span><strong>Online Access:</strong> Starts March 24th, 2026</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                    <Clock size={18} color="var(--primary)" />
                    <span><strong>Duration:</strong> 8 weeks (1 class/week)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                    <Award size={18} color="var(--primary)" />
                    <span><strong>Certification:</strong> Official Renewal EU Certificate</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--secondary)', fontWeight: 600, fontSize: '1.05rem', gap: '0.5rem' }}>
                View Masterclass Details
                <ChevronRight size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

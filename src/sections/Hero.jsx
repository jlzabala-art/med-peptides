import { ArrowRight, RefreshCw, ShieldCheck, BarChart3, FileSpreadsheet, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Hero({ onNavigate, mode = 'guest' }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="hero-section" style={{
      background: '#001A35',
      color: 'white',
      minHeight: 'clamp(80vh, 90vh, 1000px)',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: 'clamp(6rem, 10vw, 9rem) 1.25rem 3rem'
    }}>
      {/* Background Gradients - Optimizados para no saturar GPU móvil */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(circle at 15% 50%, rgba(0, 163, 224, 0.08) 0%, transparent 50%), radial-gradient(circle at 85% 50%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)',
        zIndex: 0
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <div className="hero-grid">

          {/* LEFT: Text Content */}
          <div className="hero-text-content">
            {mode === 'professional' && (
              <div className="eyebrow" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#00A3E0',
                fontSize: '0.7rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
                backgroundColor: 'rgba(0, 163, 224, 0.1)',
                padding: '0.4rem 0.8rem',
                borderRadius: '100px'
              }}>
                <Sparkles size={12} /> Clinical Intelligence Platform
              </div>
            )}

            <h1 className="hero-headline" style={{
              fontSize: 'clamp(2.2rem, 6vw, 3.8rem)',
              lineHeight: 1.1,
              fontWeight: 900,
              marginBottom: '1.25rem',
              letterSpacing: '-0.03em',
              color: 'white'
            }}>
              {mode === 'professional'
                ? 'Clinical Peptides and Protocols, Ready to Deploy'
                : 'Clinical Peptides and Protocols, Ready to Deploy'}
            </h1>

            <p className="hero-subheadline" style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.5,
              marginBottom: '2.5rem',
              maxWidth: '620px'
            }}>
              {mode === 'professional'
                ? 'Browse evidence-based peptide protocols and compounds curated for clinical practice.'
                : 'Explore our catalog of clinical-grade peptides, ready-to-use protocols, and evidence-based guides.'}
            </p>

            {/* Feature Grid - Optimizada para Mobile */}
            <div className="feature-grid">
              <div className="feature-item">
                <div className="icon-box"><RefreshCw size={18} /></div>
                <div className="feature-info">
                  <h4>Multi-phase</h4>
                  <p>Dynamic dose schedules.</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="icon-box"><ShieldCheck size={18} /></div>
                <div className="feature-info">
                  <h4>Validated</h4>
                  <p>Safety-first design.</p>
                </div>
              </div>
            </div>

            <div className="cta-group">
              <button
                onClick={() => navigate('/protocols')}
                className="cta-button primary"
              >
                Browse Protocols <ArrowRight size={20} />
              </button>

              <button onClick={() => navigate('/peptides')} className="cta-button secondary">
                Explore Peptides
              </button>
            </div>
          </div>

          {/* RIGHT: Hero Image - Ahora visible pero ajustada para Mobile */}
          <div className="hero-image-container">
            <div className="image-wrapper">
              <img
                src="/assets/peptides-hero.png"
                alt="Interface Preview"
                className="hero-artwork"
              />
              <div className="image-glow" />
            </div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .hero-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 4rem;
          align-items: center;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .feature-item {
          display: flex;
          gap: 0.85rem;
          align-items: flex-start;
        }

        .icon-box {
          background: rgba(255,255,255,0.08);
          color: #00A3E0;
          padding: 0.6rem;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .feature-info h4 {
          margin: 0 0 0.15rem 0;
          font-size: 0.9rem;
          font-weight: 700;
          color: white;
        }

        .feature-info p {
          margin: 0;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.5);
          line-height: 1.3;
        }

        .cta-group {
          display: flex;
          gap: 1rem;
        }

        .cta-button {
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          transition: all 0.3s ease;
          border: none;
        }

        .cta-button.primary {
          background: white;
          color: #001A35;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }

        .cta-button.secondary {
          background: rgba(255,255,255,0.05);
          color: white;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .image-wrapper {
          position: relative;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.02);
          padding: 0.5rem;
          box-shadow: 0 30px 60px rgba(0,0,0,0.4);
          animation: float 6s ease-in-out infinite;
        }

        .image-wrapper img {
          width: 100%;
          border-radius: 14px;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        @media (max-width: 1023px) {
          .hero-grid { grid-template-columns: 1fr; text-align: center; }
          .hero-text-content { display: flex; flex-direction: column; align-items: center; }
          .feature-grid { max-width: 500px; text-align: left; }
          .hero-image-container { max-width: 550px; margin: 2rem auto 0; }
        }

        @media (max-width: 640px) {
          .hero-section { padding-top: 5rem; }
          .feature-grid { 
            grid-template-columns: 1fr; 
            gap: 1rem; 
            margin-bottom: 2rem;
            background: rgba(255,255,255,0.03);
            padding: 1.25rem;
            border-radius: 16px;
          }
          .cta-group { flex-direction: column; width: 100%; }
          .cta-button { width: 100%; justify-content: center; }
          
          /* Peek effect para la imagen en móvil */
          .hero-image-container {
            margin-top: 3rem;
            opacity: 0.6;
            transform: scale(0.9);
          }
        }
      ` }} />
    </section>
  );
}
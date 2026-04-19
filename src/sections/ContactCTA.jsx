import { PhoneCall, ArrowRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ContactCTA() {
  const navigate = useNavigate();

  return (
    <section style={{ padding: 'clamp(2rem, 5vw, 4rem) 0.5rem clamp(4rem, 8vw, 6rem)' }}>
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{
          background: 'linear-gradient(145deg, #001f3f 0%, #002a54 100%)',
          borderRadius: 'clamp(24px, 4vw, 32px)',
          padding: 'clamp(3rem, 6vw, 5rem) clamp(1.25rem, 4vw, 3rem)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>

          {/* Orbs de fondo optimizados para móvil */}
          <div style={{
            position: 'absolute', top: '-10%', right: '-5%',
            width: '300px', height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,163,224,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0
          }} />

          <div style={{
            width: '64px', height: '64px',
            background: 'rgba(0,163,224,0.15)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(0,163,224,0.3)',
            borderRadius: '20px', // Estilo Squircle más moderno
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 2rem',
            color: '#00A3E0',
            position: 'relative',
            zIndex: 1
          }}>
            <PhoneCall size={28} />
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              color: 'white',
              fontWeight: 850,
              marginBottom: '1.25rem',
              letterSpacing: '-0.03em',
              lineHeight: 1.1
            }}>
              Need Technical Support <br className="hidden-mobile" /> or Bulk Pricing?
            </h2>

            <p style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: 'clamp(1rem, 1.6vw, 1.15rem)',
              maxWidth: '600px',
              margin: '0 auto 3rem',
              lineHeight: 1.6,
              padding: '0 0.5rem'
            }}>
              Our scientific advisory team is available to discuss custom synthesis, verify analytical data, and provide institutional volume discounts.
            </p>
          </div>

          <style dangerouslySetInnerHTML={{
            __html: `
            .cta-btn-group {
              display: flex;
              gap: 1rem;
              justify-content: center;
              position: relative;
              z-index: 1;
            }
            .cta-primary-btn {
              padding: 1.1rem 2.2rem;
              font-size: 1rem;
              font-weight: 700;
              border-radius: 16px;
              display: inline-flex;
              align-items: center;
              gap: 0.75rem;
              cursor: pointer;
              transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
              border: none;
              background: #00A3E0;
              color: white;
              box-shadow: 0 10px 25px rgba(0,163,224,0.35);
            }
            .cta-primary-btn:hover {
              transform: translateY(-3px) scale(1.02);
              background: #00b4f5;
              box-shadow: 0 15px 35px rgba(0,163,224,0.45);
            }
            .cta-secondary-btn {
              padding: 1.1rem 2.2rem;
              font-size: 1rem;
              font-weight: 700;
              border-radius: 16px;
              display: inline-flex;
              align-items: center;
              gap: 0.75rem;
              cursor: pointer;
              transition: all 0.3s ease;
              background: rgba(255,255,255,0.04);
              color: white;
              border: 1px solid rgba(255,255,255,0.15);
              backdrop-filter: blur(10px);
            }
            .cta-secondary-btn:hover {
              background: rgba(255,255,255,0.1);
              border-color: rgba(255,255,255,0.3);
            }
            @media (max-width: 768px) {
              .cta-btn-group {
                flex-direction: column;
                padding: 0 1rem;
              }
              .cta-primary-btn, .cta-secondary-btn {
                width: 100%;
                justify-content: center;
                padding: 1.2rem; /* Más alto para pulgares */
              }
              .hidden-mobile { display: none; }
            }
          `}} />

          <div className="cta-btn-group">
            <button className="cta-primary-btn" onClick={() => navigate('/contact')}>
              Talk to Specialist <ArrowRight size={18} />
            </button>
            <button className="cta-secondary-btn" onClick={() => navigate('/products')}>
              <BookOpen size={18} /> View Catalogue
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

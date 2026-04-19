import { Layers, Search, FileText, FileBarChart, PiggyBank } from 'lucide-react';

const capabilities = [
  { title: 'Protocol Builder', icon: <Layers size={22} />, desc: 'AI-assisted logic generation for experimental scheduling.' },
  { title: 'Batch Tracking', icon: <Search size={22} />, desc: 'End-to-end visibility of synthesis and QA lifecycle.' },
  { title: 'Documentation', icon: <FileText size={22} />, desc: 'Immediate access to SDS, safety, and regulatory compliance.' },
  { title: 'Analytical Reports', icon: <FileBarChart size={22} />, desc: 'HPLC & MS purity verification linked to every vial.' },
  { title: 'Institutional Tier', icon: <PiggyBank size={22} />, desc: 'Automated scaled pricing for verified research facilities.' },
];

export default function PlatformCapabilities() {
  return (
    <section className="section" style={{ backgroundColor: 'white', padding: 'clamp(3rem, 7vw, 6rem) 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'clamp(2.5rem, 5vw, 4rem)', padding: '0 1rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#00A3E0',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            fontSize: '0.7rem',
            marginBottom: '0.75rem'
          }}>
            What We Offer
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#0f172a', marginBottom: '1rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Platform Capabilities
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
            Designed for clinical researchers and institutional buyers requiring absolute precision and traceability.
          </p>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
          .capabilities-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
            padding: 0 1rem;
          }
          .capabilities-card {
            padding: 2rem;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 20px;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .cap-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            background: rgba(0,163,224,0.08);
            color: #00A3E0;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          
          /* Desktop Hover */
          @media (min-width: 1024px) {
            .capabilities-card:hover {
              border-color: #00A3E0;
              background: white;
              box-shadow: 0 20px 40px rgba(0,163,224,0.08);
              transform: translateY(-5px);
            }
          }

          @media (max-width: 1023px) {
            .capabilities-grid { grid-template-columns: repeat(2, 1fr); }
          }

          /* MOBILE OPTIMIZATION */
          @media (max-width: 640px) {
            .capabilities-grid { 
              grid-template-columns: 1fr; 
              gap: 0.75rem; 
            }
            .capabilities-card { 
              flex-direction: row; /* Cambio a horizontal */
              align-items: center;
              padding: 1.25rem;
              gap: 1.25rem;
              border-radius: 16px;
            }
            .cap-icon {
              width: 42px;
              height: 42px;
              background: white; /* Contraste limpio en móvil */
              border: 1px solid #e2e8f0;
            }
            .capabilities-card h3 {
              font-size: 1rem !important;
              margin-bottom: 0.15rem !important;
            }
            .capabilities-card p {
              font-size: 0.85rem !important;
              line-height: 1.4 !important;
            }
            .capabilities-card:active {
              background: #f1f5f9;
              transform: scale(0.98);
            }
          }
        `}} />

        <div className="capabilities-grid">
          {capabilities.map((cap, i) => (
            <div key={i} className="capabilities-card">
              <div className="cap-icon">{cap.icon}</div>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 700, margin: '0 0 0.4rem 0' }}>
                  {cap.title}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0, lineHeight: 1.55 }}>
                  {cap.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
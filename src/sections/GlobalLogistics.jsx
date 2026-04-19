import { ThermometerSnowflake, FileCheck, Globe, PackageCheck } from 'lucide-react';

const pillars = [
  { title: 'Cold-Chain Labs', icon: <ThermometerSnowflake size={22} />, desc: 'Verified temperature integrity.' }, // Descripciones un poco más cortas para mobile
  { title: 'Compliance', icon: <FileCheck size={22} />, desc: 'Frictionless global documentation.' },
  { title: 'Express Transit', icon: <Globe size={22} />, desc: 'Reliable 3-5 day global network.' },
  { title: 'Secure Handling', icon: <PackageCheck size={22} />, desc: 'Shatter-proof scientific packaging.' }
];

export default function GlobalLogistics() {
  return (
    <section className="logistics-section" style={{ backgroundColor: 'var(--surface)', padding: 'clamp(2.5rem, 5vw, 4rem) 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 4vw, 3rem)', padding: '0 1rem' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', color: 'var(--text-main)', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Logistics Infrastructure
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.5 }}>
            End-to-end management from synthesis to delivery.
          </p>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
          .logistics-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1.25rem;
            padding: 0 1rem;
          }
          .logistics-card {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            padding: 1.5rem;
            background: white;
            border-radius: 20px;
            border: 1px solid var(--border);
            transition: all 0.3s ease;
          }
          .logistics-card:hover {
            border-color: #00A3E0;
            box-shadow: 0 12px 30px rgba(0,163,224,0.1);
            transform: translateY(-4px);
          }
          .logistics-icon {
            min-width: 44px;
            height: 44px;
            border-radius: 12px;
            background: rgba(0,163,224,0.08);
            color: #00A3E0;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          @media (max-width: 1023px) {
            .logistics-grid { grid-template-columns: repeat(2, 1fr); }
          }

          @media (max-width: 540px) {
            .logistics-grid { 
              grid-template-columns: repeat(2, 1fr); /* Mantenemos 2 columnas para simetría */
              gap: 0.75rem; 
              padding: 0 0.75rem;
            }
            .logistics-card { 
              flex-direction: column; /* Icono arriba, texto abajo */
              align-items: center;
              text-align: center;
              padding: 1.25rem 0.75rem;
              gap: 0.75rem;
            }
            .logistics-card h3 {
              font-size: 0.85rem !important;
              line-height: 1.2;
            }
            .logistics-card p {
              font-size: 0.75rem !important;
              display: -webkit-box;
              -webkit-line-clamp: 2; /* Limitamos a 2 líneas para mantener la cuadrícula alineada */
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
            .logistics-icon {
              width: 40px;
              height: 40px;
              min-width: 40px;
            }
          }
        `}} />

        <div className="logistics-grid">
          {pillars.map((pillar, i) => (
            <div key={i} className="logistics-card">
              <div className="logistics-icon">{pillar.icon}</div>
              <div style={{ width: '100%' }}>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 800, margin: '0 0 0.25rem 0' }}>
                  {pillar.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>
                  {pillar.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
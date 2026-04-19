import { Beaker, Search, ShieldCheck, Globe } from 'lucide-react';

const ITEMS = [
  { label: 'Protocol Builder', icon: <Beaker size={18} /> },
  { label: 'Clinical Search', icon: <Search size={18} /> },
  { label: 'Safety Validation', icon: <ShieldCheck size={18} /> },
  { label: 'Global Logistics', icon: <Globe size={18} /> },
];

export default function TrustStrip() {
  // Duplicamos los items para que el loop infinito sea perfecto
  const doubleItems = [...ITEMS, ...ITEMS];

  return (
    <div style={{
      backgroundColor: '#020e1c',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '0.85rem 0',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .trust-strip-container {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
        }
        
        /* Edge Fades: Más pronunciados para el efecto ticker */
        .trust-strip-container::before,
        .trust-strip-container::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 60px;
          z-index: 2;
          pointer-events: none;
        }
        
        .trust-strip-container::before {
          left: 0;
          background: linear-gradient(to right, #020e1c 20%, transparent);
        }
        
        .trust-strip-container::after {
          right: 0;
          background: linear-gradient(to left, #020e1c 20%, transparent);
        }

        .trust-strip-inner {
          display: flex;
          align-items: center;
          gap: 3rem; /* Espaciado constante */
          padding: 0;
          width: max-content;
          animation: ticker 25s linear infinite; /* Animación suave */
        }
        
        .trust-strip-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #64748b;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .trust-icon-box {
          color: #00A3E0;
          display: flex;
          align-items: center;
          filter: drop-shadow(0 0 10px rgba(0, 163, 224, 0.4));
        }

        /* DESKTOP: Desactivamos animación y centramos */
        @media (min-width: 1024px) {
          .trust-strip-inner {
            animation: none;
            width: 100%;
            justify-content: center;
            gap: 0;
          }
          .trust-strip-container::before,
          .trust-strip-container::after {
            display: none;
          }
          .trust-strip-item {
            font-size: 0.82rem;
            padding: 0 2.5rem;
            color: #94a3b8;
          }
          /* Reintroducimos el separador solo en desktop */
          .trust-strip-item:not(:last-child) {
            border-right: 1px solid rgba(255,255,255,0.08);
          }
          .trust-strip-item:hover {
            color: white;
          }
        }

        /* Reducimos velocidad en móviles si el usuario prefiere menos movimiento */
        @media (prefers-reduced-motion: reduce) {
          .trust-strip-inner { animation: none; overflow-x: auto; width: 100%; padding: 0 2rem; }
        }
      `}} />

      <div className="trust-strip-container">
        {/* Renderizamos doubleItems para el scroll infinito en móvil */}
        <div className="trust-strip-inner">
          {doubleItems.map((item, i) => (
            <div key={`${item.label}-${i}`} className="trust-strip-item">
              <span className="trust-icon-box">
                {item.icon}
              </span>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
 
import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Throttling sutil para no saturar el event loop
    let timeout;
    const handleScroll = () => {
      if (!timeout) {
        timeout = setTimeout(() => {
          setVisible(window.scrollY > 600);
          timeout = null;
        }, 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="back-to-top-btn"
      aria-label="Back to top"
    >
      <ChevronUp size={24} strokeWidth={3} />

      <style>{`
        .back-to-top-btn {
          position: fixed;
          /* Posicionamiento dinámico */
          right: 20px;
          bottom: calc(85px + env(safe-area-inset-bottom)); 
          
          width: 50px;
          height: 50px;
          border-radius: 16px; /* Diseño más moderno/app-like que el círculo perfecto */
          background-color: var(--primary);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 54, 102, 0.3);
          z-index: 900;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          
          /* Evita que el zoom del sistema interfiera */
          touch-action: manipulation;
        }

        /* Hidden on mobile — competes with sticky purchase CTA */
        @media (max-width: 768px) {
          .back-to-top-btn {
            display: none !important;
          }
        }

        /* Desktop Hover */
        @media (min-width: 769px) {
          .back-to-top-btn {
            bottom: 30px;
          }
          .back-to-top-btn:hover {
            background-color: var(--secondary);
            transform: translateY(-5px);
          }
        }

        /* Mobile Active State (Feedback táctil) */
        .back-to-top-btn:active {
          transform: scale(0.85);
          background-color: var(--primary-light);
          opacity: 0.9;
        }

        @keyframes popIn {
          0% { opacity: 0; transform: scale(0) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* Ocultar si el teclado está abierto (Android) */
        @media (height < 500px) {
          .back-to-top-btn { display: none; }
        }
      `}</style>
    </button>
  );
}
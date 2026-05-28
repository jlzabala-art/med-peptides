 
import { ShieldCheck, FileCheck, Globe, MessageCircle, FlaskConical, Truck, Lock, Activity } from 'lucide-react';
import homeData from '../data/homeData.json';

const iconMap = {
  FlaskConical: FlaskConical,
  Truck: Truck,
  Lock: Lock,
  ShieldCheck: ShieldCheck,
  Globe: Globe,
  MessageCircle: MessageCircle,
  FileCheck: FileCheck,
  Activity: Activity,
};

/* Accent colours per item (cycles if more items added) */
const ACCENTS = [
  { color: '#14b8a6', bg: 'rgba(20,184,166,0.10)', border: 'rgba(20,184,166,0.18)' },
  { color: '#38bdf8', bg: 'rgba(56,189,248,0.10)', border: 'rgba(56,189,248,0.18)' },
  { color: '#34d399', bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.18)' },
  { color: '#818cf8', bg: 'rgba(129,140,248,0.10)', border: 'rgba(129,140,248,0.18)' },
];

export default function TrustStrip() {
  const { items } = homeData.trustStrip;

  return (
    <section className="ts-wrap" aria-label="Why Med-Peptides">
      <div className="ts-inner">
        {items.map((item, idx) => {
          const IconComponent = iconMap[item.icon] || ShieldCheck;
          const accent = ACCENTS[idx % ACCENTS.length];
          return (
            <div key={idx} className="ts-item">
              {/* Icon bubble */}
              <div
                className="ts-icon"
                style={{
                  background: accent.bg,
                  border: `1px solid ${accent.border}`,
                  color: accent.color,
                }}
              >
                <IconComponent size={18} strokeWidth={2} />
              </div>

              {/* Text */}
              <div className="ts-text">
                <span className="ts-label" style={{ color: accent.color }}>
                  {item.label}
                </span>
                <span className="ts-desc">{item.desc}</span>
              </div>

              {/* Separator (hidden on last item) */}
              {idx < items.length - 1 && (
                <div className="ts-sep" aria-hidden="true" />
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .ts-wrap {
          background: linear-gradient(
            to bottom,
            rgba(5, 15, 26, 0.98) 0%,
            rgba(10, 22, 40, 0.96) 100%
          );
          border-top: 1px solid rgba(20, 184, 166, 0.12);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding: 1.5rem 1.5rem;
        }

        .ts-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0;
        }

        .ts-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 2rem;
          position: relative;
          flex: 1 1 220px;
          min-width: 0;
          transition: background 0.2s ease;
          border-radius: 12px;
        }

        .ts-item:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .ts-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }

        .ts-item:hover .ts-icon {
          transform: scale(1.08);
        }

        .ts-text {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          min-width: 0;
        }

        .ts-label {
          font-weight: 700;
          font-size: 0.875rem;
          line-height: 1.2;
          letter-spacing: -0.01em;
        }

        .ts-desc {
          font-size: 0.75rem;
          color: #64748b;
          line-height: 1.4;
          white-space: normal;
        }

        .ts-sep {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 1px;
          height: 36px;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(255, 255, 255, 0.07) 50%,
            transparent
          );
        }

        @media (max-width: 768px) {
          .ts-wrap {
            padding: 1.25rem 1rem;
          }
          .ts-inner {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
          }
          .ts-item {
            padding: 0.75rem 1rem;
            flex: unset;
          }
          .ts-sep { display: none; }
          .ts-desc { font-size: 0.72rem; }
        }

        @media (max-width: 400px) {
          .ts-inner {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
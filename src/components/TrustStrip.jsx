import React from 'react';
import { ShieldCheck, Zap, Globe, FlaskConical } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TrustStrip = () => {
  const { t } = useTranslation();

  const items = [
    { icon: <ShieldCheck size={18} />, text: t('trustStrip.purity', "≥98% Purity — Verified") },
    { icon: <FlaskConical size={18} />, text: t('trustStrip.labTested', "Independently Lab Tested") },
    { icon: <Globe size={18} />, text: t('trustStrip.shipping', "Worldwide Tracked Shipping") },
    { icon: <Zap size={18} />, text: t('trustStrip.fastShipping', "Ships the Same Day") }
  ];

  return (
    <div className="trust-strip">
      <div className="container">
        <div className="trust-strip-inner">
          {items.map((item, index) => (
            <div key={index} className="trust-item">
              <span className="trust-icon">{item.icon}</span>
              <span className="trust-text">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .trust-strip {
          background: rgba(15, 15, 20, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding: 1rem 0;
          position: relative;
          z-index: 10;
        }
        .trust-strip-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .trust-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.02em;
        }
        .trust-icon {
          color: var(--primary);
          display: flex;
          align-items: center;
        }
        @media (max-width: 768px) {
          .trust-strip-inner {
            justify-content: center;
            gap: 1.5rem;
          }
          .trust-item {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default TrustStrip;

"use client";
import React, { useState } from 'react';
import { Stethoscope, ShieldCheck, ArrowRight } from '@/lib/icons';
import MedicalSupervisionModal from './MedicalSupervisionModal';

export default function MedicalSupervisionBanner({ itemName, itemType = 'protocol', style = {} }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="msb-banner" style={style}>
        <div className="msb-info">
          <div className="msb-icon-box">
            <Stethoscope size={22} />
          </div>
          <div>
            <div className="msb-tag-row">
              <span className="msb-tag-label">
                Clinical Network
              </span>
            </div>
            <h4 className="msb-heading">
              Looking for Clinical Guidance or Prescription?
            </h4>
            <p className="msb-subtext">
              Connect with an affiliated physician to evaluate this {itemType} for your specific profile.
            </p>
          </div>
        </div>

        <div className="msb-actions-row">
          <button
            type="button"
            className="msb-btn msb-btn-whatsapp"
            onClick={() => {
              const text = `Hello Atlas Clinical Network, I am looking for clinical guidance regarding ${itemName || 'this product'}.`;
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
            }}
          >
            💬 Direct Medical WhatsApp
          </button>

          <button
            type="button"
            className="msb-btn msb-btn-primary"
            onClick={() => setModalOpen(true)}
          >
            Request Doctor Review <ArrowRight size={14} />
          </button>
        </div>

        <style jsx>{`
          .msb-banner {
            background: linear-gradient(135deg, rgba(0, 54, 102, 0.04) 0%, rgba(2, 132, 199, 0.07) 100%);
            border: 1px solid rgba(2, 132, 199, 0.2);
            border-radius: 16px;
            padding: 1.25rem 1.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 1rem;
            margin: 1.5rem 0;
          }
          .msb-info {
            display: flex;
            align-items: center;
            gap: 1rem;
            flex: 1 1 280px;
          }
          .msb-icon-box {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background: rgba(2, 132, 199, 0.12);
            color: #0284c7;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .msb-tag-row {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            margin-bottom: 0.2rem;
          }
          .msb-tag-label {
            font-size: 0.7rem;
            font-weight: 800;
            color: #0284c7;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .msb-heading {
            margin: 0;
            font-size: 0.95rem;
            font-weight: 700;
            color: var(--text-main);
          }
          .msb-subtext {
            margin: 0.15rem 0 0;
            font-size: 0.82rem;
            color: var(--text-muted);
          }
          .msb-actions-row {
            display: flex;
            gap: 0.5rem;
            align-items: center;
            flex-wrap: wrap;
          }
          .msb-btn {
            padding: 0.65rem 1.1rem;
            min-height: 44px;
            border-radius: 999px;
            font-weight: 700;
            font-size: 0.84rem;
            border: none;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.4rem;
            white-space: nowrap;
            transition: all 0.2s ease;
          }
          .msb-btn:active {
            transform: scale(0.98);
          }
          .msb-btn-whatsapp {
            background: #25d366;
            color: white;
            box-shadow: 0 2px 8px rgba(37, 211, 102, 0.25);
          }
          .msb-btn-primary {
            background: var(--primary, #003666);
            color: white;
            box-shadow: 0 2px 8px rgba(0, 54, 102, 0.15);
          }

          @media (max-width: 768px) {
            .msb-banner {
              padding: 1rem;
              flex-direction: column;
              align-items: stretch;
            }
            .msb-info {
              flex: 1 1 100%;
            }
            .msb-actions-row {
              flex-direction: column;
              width: 100%;
            }
            .msb-btn {
              width: 100%;
            }
          }
        `}</style>
      </div>

      <MedicalSupervisionModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        itemName={itemName} 
        itemType={itemType} 
      />
    </>
  );
}

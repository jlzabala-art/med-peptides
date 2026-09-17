import React from 'react';

/**
 * PeptideDetailStyles
 * Scoped styles for the PeptideDetail page layout, hero visualizer, floating CTA, and responsive viewports.
 */
export default function PeptideDetailStyles() {
  return (
    <style>{`
      /* === Product Detail — pd namespace === */

      /* Desktop 1-column grid */
      .pd-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 3rem;
        align-items: start;
      }

      .pd-template-root {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1.5rem 3rem 1.5rem;
      }

      .pd-overview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        align-items: start;
      }

      /* Center col */
      .pd-info-col {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        padding-bottom: 120px; /* Space for Floating Action Bar */
      }

      /* Hero image with glow */
      .pd-hero-container {
        width: 100%;
        border-radius: 24px;
        overflow: hidden;
        position: relative;
        background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4));
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.4);
        box-shadow: var(--shadow-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        transition: var(--transition-smooth);
      }
      .pd-hero-container:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-xl);
        border-color: var(--secondary);
      }
      .pd-vial-glow {
        position: absolute;
        width: 250px;
        height: 250px;
        background: var(--secondary);
        filter: blur(80px);
        opacity: 0.15;
        z-index: 0;
        pointer-events: none;
        animation: pulse-glow 4s ease-in-out infinite;
      }
      @keyframes pulse-glow {
        0%, 100% { transform: scale(1); opacity: 0.15; }
        50% { transform: scale(1.3); opacity: 0.25; }
      }
      .pd-hero-img {
        width: 100%;
        height: auto;
        max-height: 280px;
        object-fit: contain;
        z-index: 1;
        filter: drop-shadow(0 10px 20px rgba(0,54,102,0.15));
      }

      /* Back button */
      .pd-back-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        color: var(--text-muted);
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        background: none;
        border: none;
        padding: 0.4rem 0;
        transition: color 0.2s;
        letter-spacing: 0.01em;
      }
      .pd-back-btn:hover { color: var(--primary); }

      /* Variant row container */
      .pd-variant-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 0.25rem;
      }

      /* Variant selector pills */
      .pd-variant-btn {
        padding: 0.55rem 1.1rem;
        border-radius: 10px;
        border: 1.5px solid var(--border);
        background: white;
        color: var(--text-main);
        font-weight: 600;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s ease;
        min-height: 44px;
        min-width: 64px;
        text-align: center;
      }
      .pd-variant-btn:hover:not(.pd-variant-selected) {
        border-color: var(--secondary);
        color: var(--secondary);
        background: rgba(0, 163, 224, 0.04);
      }
      .pd-variant-selected {
        border: 2px solid var(--secondary) !important;
        background: var(--secondary) !important;
        color: white !important;
        font-weight: 800 !important;
        box-shadow: 0 4px 14px rgba(0, 163, 224, 0.3);
      }

      /* Spec grid cards */
      .pd-spec-card {
        padding: 0.9rem 1rem;
        background: white;
        border: 1px solid var(--border);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        transition: all 0.2s ease;
      }
      .pd-spec-card:hover {
        border-color: rgba(0, 163, 224, 0.3);
        box-shadow: 0 4px 12px rgba(0, 163, 224, 0.07);
      }

      /* Trust badge mini cards */
      .pd-trust-card {
        padding: 0.7rem 0.85rem;
        background: white;
        border: 1px solid var(--border);
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
      }

      /* Accordions */
      .pd-accordion {
        background: white;
        border: 1px solid var(--border);
        border-radius: 12px;
        margin-bottom: 0.625rem;
        overflow: hidden;
        transition: box-shadow 0.2s ease;
      }
      .pd-accordion:hover { box-shadow: 0 4px 12px rgba(0,54,102,0.04); }
      .pd-accordion summary {
        padding: 1rem 1.25rem;
        font-weight: 700;
        color: var(--primary);
        cursor: pointer;
        list-style: none;
        display: flex;
        justify-content: space-between;
        align-items: center;
        user-select: none;
        font-size: 0.9rem;
        gap: 0.75rem;
      }
      .pd-accordion summary::-webkit-details-marker { display: none; }
      .pd-accordion summary::after {
        content: '+';
        font-size: 1.15rem;
        color: var(--text-muted);
        flex-shrink: 0;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: rgba(0,54,102,0.05);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.25s;
      }
      .pd-accordion[open] summary {
        border-bottom: 1px solid var(--border);
        background: rgba(0,54,102,0.015);
      }
      .pd-accordion[open] summary::after { content: '−'; }

      /* Related cards */
      .related-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid rgba(0,0,0,0.05);
      }
      .related-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
        border-color: var(--primary);
      }

      /* Segmented type toggle */
      .pd-type-toggle {
        display: flex;
        border-radius: 10px;
        border: 1px solid var(--border);
        overflow: hidden;
        height: 44px;
      }
      .pd-type-toggle button {
        flex: 1;
        border: none;
        font-weight: 700;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s;
        letter-spacing: 0.01em;
      }

      /* Sticky mobile CTA & Desktop Floating Action Bar */
      @keyframes slideUpCta {
        from { transform: translateY(100%); opacity: 0; }
        to   { transform: translateY(0);    opacity: 1; }
      }
      .pd-floating-bar {
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        width: 90%;
        max-width: 900px;
        z-index: 1000;
        background: rgba(255, 255, 255, 0.75);
        backdrop-filter: blur(24px) saturate(200%);
        -webkit-backdrop-filter: blur(24px) saturate(200%);
        border: 1px solid rgba(255, 255, 255, 0.5);
        border-radius: 20px;
        padding: 1rem 1.5rem;
        box-shadow: 0 10px 40px -10px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.5) inset;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1.5rem;
        animation: slideUpCta 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
      }
      .pd-mobile-cta { display: none; }
      .pd-floating-price {
        font-family: 'Outfit', sans-serif;
        font-size: 1.75rem;
        font-weight: 850;
        color: var(--primary);
        line-height: 1;
      }

      /* Responsive Design */
      @media (max-width: 1200px) {
        .pd-grid { grid-template-columns: 1fr; gap: 2rem; }
      }

      @media (max-width: 1024px) {
        .pd-grid { grid-template-columns: 1fr; gap: 2rem; }
      }

      @media (max-width: 768px) {
        .pd-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
      }

      /* ── Mobile ── */
      @media (max-width: 768px) {
        .pd-grid {
          display: flex !important;
          flex-direction: column !important;
          gap: 1.25rem !important;
        }
        .pd-template-root {
          padding: 0 0.75rem 3rem 0.75rem !important;
        }
        .pd-overview-grid {
          grid-template-columns: 1fr !important;
          gap: 1rem !important;
        }
        .pd-info-col { display: contents !important; }

        .pd-title-h1 { font-size: 1.85rem !important; }
        .pd-hero-img { height: 220px !important; }

        /* Dosage pills — compact, scrollable row on mobile */
        .pd-variant-row {
          display: flex !important;
          flex-wrap: wrap !important;
          gap: 0.4rem !important;
          max-height: 9rem !important;
          overflow-y: auto !important;
          padding-right: 0.25rem !important;
        }
        .pd-variant-btn {
          padding: 0.4rem 0.75rem !important;
          font-size: 0.78rem !important;
          min-height: 36px !important;
          min-width: 52px !important;
          border-radius: 8px !important;
        }
      }

      @media (max-width: 580px) {
        .pd-ai-widget-header {
          flex-direction: column !important;
          align-items: center !important;
          text-align: center !important;
        }
      }

      /* Accordion body */
      .pd-accordion-content {
        padding: 1rem 1.25rem 1.25rem;
        font-size: 0.875rem;
        color: var(--text-main);
        line-height: 1.65;
      }

      /* Purity badge hover */
      .pd-purity-badge:hover {
        border-color: var(--primary) !important;
        color: var(--primary) !important;
        background: rgba(0,54,102,0.04) !important;
      }

      @media (max-width: 768px) {
        .pd-inline-buy-btn {
          display: none !important;
        }
      }
    `}</style>
  );
}

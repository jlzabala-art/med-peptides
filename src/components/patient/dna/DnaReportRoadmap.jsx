'use client';

import React from 'react';

/**
 * 4-Step Executive Patient Roadmap
 * Provides an immediate 15-second orientation and quick jump links for the patient, kitchen, and doctor.
 */
export default function DnaReportRoadmap({ onSelectSection, onSetFoodViewMode }) {
  const steps = [
    {
      step: 'PART 1',
      title: 'Your DNA in Plain Language',
      desc: 'Your 5 body priorities (appetite, energy, blood sugar, dairy digestion & sleep) explained without medical jargon.',
      shareWith: '👤 For You (2-min read)',
      shareBg: '#e0f2fe',
      shareColor: '#0369a1',
      onClick: () => {
        onSelectSection?.('mealplan');
        if (typeof document !== 'undefined') {
          document.getElementById('dna-axes-section')?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    {
      step: 'PART 2',
      title: 'Complete Food List (All 17 Food Families)',
      desc: 'All 116 foods classified into 🟢 Eat Freely, 🟡 Normal Portion (1-2x/wk), and 🔴 Avoid across CARBO+, PROTEIN+, LIPID+, and EXTRAS.',
      shareWith: '🛒 For Supermarket / Home Kitchen',
      shareBg: '#dcfce7',
      shareColor: '#166534',
      onClick: () => {
        onSelectSection?.('mealplan');
        onSetFoodViewMode?.('fagron_matrix');
        if (typeof document !== 'undefined') {
          setTimeout(() => document.getElementById('fagron-food-matrix-section')?.scrollIntoView({ behavior: 'smooth' }), 60);
        }
      }
    },
    {
      step: 'PART 3',
      title: '7-Day Meal Plan & 24h Routine',
      desc: 'Breakfast, lunch, snack, and dinner for the whole week + the 1-2-3 plate order rule (Vegetables → Protein → Carbs).',
      shareWith: '👨‍🍳 For Catering / Chef / Family',
      shareBg: '#fef3c7',
      shareColor: '#92400e',
      onClick: () => {
        onSelectSection?.('mealplan');
        if (typeof document !== 'undefined') {
          setTimeout(() => document.getElementById('weekly-menu-section')?.scrollIntoView({ behavior: 'smooth' }), 60);
        }
      }
    },
    {
      step: 'PART 4',
      title: 'Your 3 Daily Capsules & Pharmacy Order',
      desc: 'Your key nutrients grouped into 3 simple decision packs + ready-to-dispense local or compounded pharmacy order.',
      shareWith: '💊 For Your Doctor or Pharmacy',
      shareBg: '#f3e8ff',
      shareColor: '#6b21a8',
      onClick: () => {
        onSelectSection?.('prescription');
      }
    }
  ];

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1.5px solid #bae6fd',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 10px rgba(2, 132, 199, 0.05)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '0.85rem' }}>
        <div>
          <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            HOW THIS REPORT IS ORGANIZED · 15-SECOND ROADMAP
          </span>
          <h2 style={{ fontSize: '1.10rem', fontWeight: 850, color: '#003666', margin: '2px 0 0 0' }}>
            What Is Inside Your Guide &amp; Who to Share Each Section With
          </h2>
        </div>
        <span style={{ fontSize: '0.74rem', color: '#475569', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
          Click any card below to jump directly to that section
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(225px, 1fr))', gap: '0.85rem' }}>
        {steps.map((item, idx) => (
          <div
            key={idx}
            onClick={item.onClick}
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '12px 14px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.15s ease'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 850, backgroundColor: '#003666', color: '#ffffff', padding: '2px 7px', borderRadius: '4px' }}>
                  {item.step}
                </span>
                <span style={{ fontSize: '0.68rem', fontWeight: 750, backgroundColor: item.shareBg, color: item.shareColor, padding: '2px 7px', borderRadius: '4px' }}>
                  {item.shareWith}
                </span>
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                {item.title}
              </div>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#475569', lineHeight: 1.45 }}>
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

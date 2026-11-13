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
        borderRadius: '8px',
        border: '1px solid #dadce0',
        padding: '16px 20px',
        marginBottom: '1.25rem',
        boxShadow: '0 1px 2px rgba(60, 64, 67, 0.06)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
        <div>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1a73e8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            15-SECOND EXECUTIVE ROADMAP
          </span>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#202124', margin: '2px 0 0 0' }}>
            Guide Structure &amp; Who to Share Each Section With
          </h2>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#5f6368', backgroundColor: '#f1f3f4', border: '1px solid #e8eaed', padding: '3px 8px', borderRadius: '4px', fontWeight: 500 }}>
          Click any card to jump to section
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '10px' }}>
        {steps.map((item, idx) => (
          <div
            key={idx}
            onClick={item.onClick}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #dadce0',
              borderRadius: '6px',
              padding: '14px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 2px rgba(60,64,67,0.04)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#1a73e8';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(60,64,67,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#dadce0';
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(60,64,67,0.04)';
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.66rem', fontWeight: 700, backgroundColor: '#e8f0fe', color: '#1a73e8', border: '1px solid #d2e3fc', padding: '2px 6px', borderRadius: '4px' }}>
                  {item.step}
                </span>
                <span style={{ fontSize: '0.66rem', fontWeight: 600, backgroundColor: '#f1f3f4', color: '#3c4043', border: '1px solid #dadce0', padding: '2px 6px', borderRadius: '4px' }}>
                  {item.shareWith}
                </span>
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#202124', marginBottom: '4px' }}>
                {item.title}
              </div>
              <p style={{ margin: 0, fontSize: '0.74rem', color: '#5f6368', lineHeight: 1.45 }}>
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

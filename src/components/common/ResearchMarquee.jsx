 
import React from 'react';

const FOCUS_AREAS = [
  { label: 'RECOVERY & REPAIR', id: 'Recovery & Repair' },
  { label: 'METABOLIC & WEIGHT', id: 'Metabolic & Weight' },
  { label: 'LONGEVITY & ANTI-AGING', id: 'Longevity & Anti-Aging' },
  { label: 'COGNITIVE & MOOD', id: 'Cognitive & Mood' },
  { label: 'SLEEP & CIRCADIAN', id: 'Sleep & Circadian' },
  { label: 'HORMONAL OPTIMIZATION', id: 'Hormonal Optimization' },
  { label: 'IMMUNE SUPPORT', id: 'Immune Support' },
];

export default function ResearchMarquee({ onSelectCategory }) {
  // Triple the list to ensure seamless looping
  const items = [...FOCUS_AREAS, ...FOCUS_AREAS, ...FOCUS_AREAS];

  return (
    <div className="research-marquee-container">
      <div className="research-marquee-content">
        {items.map((area, idx) => (
          <React.Fragment key={idx}>
            <button 
              className="marquee-item"
              onClick={() => onSelectCategory?.(area.id)}
            >
              {area.label}
            </button>
            <span className="marquee-dot">•</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

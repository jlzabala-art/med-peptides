 
import React from 'react';
import { getPepChipColor } from '../../utils/textUtils';

function BrochureHeroPepRow({ phases = [], max = 7 }) {
  // Collect unique compound names from all phase drugs
  const seen = new Set();
  const compounds = [];
  for (const ph of phases) {
    for (const d of (ph.drugs || [])) {
      const name = d.product_title || d.name || d.compound || '';
      if (!name) continue;
      const key = name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        compounds.push(name);
      }
    }
  }
  if (compounds.length === 0) return null;

  const visible = compounds.slice(0, max);
  const overflow = compounds.length - visible.length;

  return (
    <div className="brochure-hero-pep-row" role="list" aria-label="Protocol compounds">
      {visible.map((name) => {
        const { color, dot } = getPepChipColor(name);
        return (
          <span
            key={name}
            className="bro-pep-chip"
            role="listitem"
            style={{
              borderColor: `${color}55`,
              background: `${color}18`,
              color: 'var(--color-bg-surface)',
            }}
          >
            <span
              className="bro-pep-chip__dot"
              style={{ background: dot }}
              aria-hidden="true"
            />
            {name}
          </span>
        );
      })}
      {overflow > 0 && (
        <span
          className="bro-pep-chip"
          style={{ opacity: 0.65, cursor: 'default' }}
          aria-label={`${overflow} more compounds`}
        >
          +{overflow} more
        </span>
      )}
    </div>
  );
}

export default BrochureHeroPepRow;

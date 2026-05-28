 
import React from 'react';
import { parseRangeMax } from '../../utils/textUtils';

/**
 * Phase 4: Inline progress bar component.
 * Renders a compact bar + value label. Does NOT change the parent container.
 */
const OutcomeProgressBar = ({ value, accentColor }) => {
  const maxVal = parseRangeMax(value);
  // Use a sensible display cap: if the value is already a percentage-ish
  // number we cap at 100, otherwise we cap at 2× the value so the bar isn't full.
  const cap = maxVal !== null ? Math.max(maxVal * 2, 10) : null;
  const fillPct = maxVal !== null ? Math.min((maxVal / cap) * 100, 100) : 0;
  const color = accentColor || 'var(--color-primary)';
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', minWidth: 120 }}>
      {/* Bar track */}
      <div style={{
        flex: 1, height: 6, borderRadius: 999,
        background: `${color}22`,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${fillPct}%`,
          height: '100%',
          background: color,
          borderRadius: 999,
          transition: 'width 0.5s ease',
        }} />
      </div>
      {/* Value label */}
      <span style={{
        fontSize: '0.74rem', fontWeight: 700,
        color, whiteSpace: 'nowrap',
        minWidth: 36, textAlign: 'right',
      }}>
        {String(value)}
      </span>
    </div>
  );
};

export default OutcomeProgressBar;

 
import React from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { safeStr } from '../../utils/textUtils';

const fmt = (v) => safeStr(v);

/**
 * EligibilityBlock — Displays inclusion and exclusion criteria.
 */
export function EligibilityBlock({ eligibility }) {
  if (!eligibility) return null;
  const include = eligibility.inclusion_criteria || eligibility.include || [];
  const exclude = eligibility.exclusion_criteria || eligibility.exclude || [];
  if (!include.length && !exclude.length) return null;
  
  return (
    <div id="pm-s01b" className="proto-eligibility">
      {include.length > 0 && (
        <div className="proto-eligibility__col">
          <h4><ShieldCheck size={15} color="#4ade80" /> Inclusion Criteria</h4>
          <div className="proto-criteria-list">
            {include.map((c, i) => (
              <span key={i} className="proto-badge proto-badge--include">
                <CheckCircle2 size={11} /> {fmt(c)}
              </span>
            ))}
          </div>
        </div>
      )}
      {exclude.length > 0 && (
        <div className="proto-eligibility__col proto-eligibility__col--exclude">
          <h4><XCircle size={15} color="#f87171" /> Exclusion Criteria</h4>
          <div className="proto-criteria-list">
            {exclude.map((c, i) => (
              <span key={i} className="proto-badge proto-badge--exclude">
                <AlertCircle size={11} /> {fmt(c)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default EligibilityBlock;

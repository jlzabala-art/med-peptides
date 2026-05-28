import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PelletCard.css';

// Icon components (inline SVG — no extra dep needed)
const FlaskIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3h6m-3 0v6.5l3.5 7a4 4 0 0 1-7 0L12 9.5V3"/>
  </svg>
);
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6"/>
  </svg>
);

/**
 * PelletCard — Premium glassmorphism card for a hormone pellet product.
 *
 * Props:
 *  - product: { id, name, dosage, objective, goals, pharmacology, category, subcategory }
 *  - onViewDetails: optional click handler (overrides default navigation)
 *  - accentColor: optional CSS color for the top accent bar
 */
export default function PelletCard({
  product,
  onViewDetails,
  accentColor,
}) {
  const navigate = useNavigate();
  const {
    id = '',
    name = '',
    dosage = '',
    objective = '',
    goals = [],
    pharmacology = {},
    subcategory = '',
  } = product || {};

  const halfLife = pharmacology?.halfLife || '';
  const displayGoals = Array.isArray(goals) ? goals.slice(0, 3) : [];

  const handleClick = () => {
    if (onViewDetails) {
      onViewDetails(product);
    } else if (id) {
      navigate(`/collection/hormone-pellets/${id}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  // derive a stable accent colour from subcategory/name
  const accent = accentColor || (
    name.toLowerCase().includes('testosterone') ? '#1565C0' :
    name.toLowerCase().includes('estradiol')   ? '#7B2D8B' :
    name.toLowerCase().includes('gestrinone')  ? '#065F46' :
    'var(--primary, #003666)'
  );

  return (
    <article
      className="pellet-card"
      style={{
        '--pellet-accent': accent,
        '--glass-bg': 'var(--glass-bg)',
        '--glass-border': 'var(--glass-border)',
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${name}`}
    >
      {/* Top accent bar */}
      <div className="pellet-card-accent" />

      {/* Card body */}
      <div className="pellet-card-body">
        {/* Header: icon + active badge */}
        <div className="pellet-card-header">
          <div className="pellet-card-icon" aria-hidden="true">
            <FlaskIcon />
          </div>
          <span className="pellet-card-badge">
            <span style={{ width: 6, height: 6, borderRadius: '0.25rem', background: 'var(--color-success)', display: 'inline-block' }} />
            Active
          </span>
        </div>

        {/* Name */}
        <h3 className="pellet-name">{name}</h3>

        {/* Dosage */}
        {dosage && (
          <div className="pellet-dosage-row">
            <span className="pellet-dosage-label">Dose</span>
            <span className="pellet-dosage-value">{dosage}</span>
          </div>
        )}

        {/* Objective */}
        {objective && <p className="pellet-objective">{objective}</p>}

        {/* Goal tags */}
        {displayGoals.length > 0 && (
          <div className="pellet-tags">
            {displayGoals.map((g, i) => (
              <span key={i} className="pellet-tag">{g}</span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pellet-card-footer">
        {halfLife ? (
          <span className="pellet-duration">
            <ClockIcon />
            {halfLife}
          </span>
        ) : (
          <span className="pellet-duration" style={{ opacity: 0 }}>—</span>
        )}
        <button
          className="pellet-view-btn"
          onClick={(e) => { e.stopPropagation(); handleClick(); }}
          aria-label={`View ${name} details`}
        >
          View Details <ArrowIcon />
        </button>
      </div>
    </article>
  );
}

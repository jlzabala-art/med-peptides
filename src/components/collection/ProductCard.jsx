import { ArrowRight, Eye, FlaskConical, Beaker, Zap, Activity, ShieldCheck, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductCard({
  title,
  subtitle,
  description, // optionally used in list view
  tags = [],
  color = '#0096CC', // Default brand accent
  badge, // e.g. { text: 'Popular', type: 'popular' } or 'Complexity'
  footerLeft,
  viewMode = 'grid',
  onClick,           // primary action (navigate to detail page)
  onSecondaryClick,  // secondary action (navigate to detail page)
  onCompareClick,    // compare action
  primaryLabel   = 'ClinicAI',
  secondaryLabel = 'Details',
}) {
  const isList = viewMode === 'list';

  // Support string badge or object
  const badgeText = typeof badge === 'string' ? badge : badge?.text;
  const badgeType = typeof badge === 'object' ? badge?.type : 'default';

  // Always show dual buttons for products
  const isDual = true;

  const handleOpenAI = (e) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent('open-clinical-ai', {
        detail: { query: `I want to explore research options for the compound ${title}.`, autoSend: true },
      })
    );
  };

  const handleDetailsClick = (e) => {
    e.stopPropagation();
    if (onSecondaryClick) {
      onSecondaryClick();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <motion.article
      className="col-card col-card--dual"
      style={{ '--card-accent': color, position: 'relative' }}
      role="article"
      aria-label={`Product card for ${title}`}
    >
      <div className="col-card-accent" />
      
      {/* Hover Overlay Actions */}
      <div className="col-card-hover-overlay" style={{
        position: 'absolute', top: '0.75rem', right: '0.75rem',
        display: 'flex', gap: '0.5rem',
        opacity: 0, transition: 'opacity 0.2s',
        zIndex: 10
      }}>
        {onCompareClick && (
          <button 
            onClick={(e) => { e.stopPropagation(); onCompareClick(); }}
            style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: '50%', padding: '0.4rem',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="Compare"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
              <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
              <path d="M7 21h10"/>
              <path d="M12 3v18"/>
              <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
            </svg>
          </button>
        )}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderRadius: '50%', padding: '0.4rem',
          boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Eye size={14} color={color} />
        </div>
      </div>
      
      <div className="col-card-body">
        <div className="col-card-header">
          <h3 className="col-card-title">{title}</h3>
          {badgeText && (
            <span className={`col-card-badge ${badgeType}`}>
              {badgeText}
            </span>
          )}
        </div>
        
        {subtitle && (
          <p className="col-card-subtitle" style={{ color: isList ? 'var(--text-muted)' : color }}>
            {subtitle}
          </p>
        )}
        
        {isList && description && (
          <p className="col-card-subtitle" style={{ color: 'var(--text-muted)' }}>
            {description.slice(0, 120)}{description.length > 120 ? '…' : ''}
          </p>
        )}
        
        {!isList && tags.length > 0 && (
          <div className="col-card-tags">
            {tags.slice(0, 3).map((t, i) => (
              <span key={i} className="col-card-tag">
                {typeof t === 'string' ? t : typeof t === 'object' && t !== null
                  ? (t.phase_title ?? t.phase_key ?? t.title ?? t.name ?? JSON.stringify(t))
                  : String(t ?? '')}
              </span>
            ))}
          </div>
        )}

        {/* Display specs/dosage details inside body */}
        {footerLeft && (typeof footerLeft !== 'string' || footerLeft.trim()) && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 600 }}>
             {typeof footerLeft === 'object' && footerLeft !== null
               ? `${footerLeft.min ?? ''}${footerLeft.max ? `–${footerLeft.max}` : ''} ${footerLeft.unit ?? ''} ${footerLeft.frequency ? ` (${footerLeft.frequency.replace(/_/g, ' ')})` : ''}`.trim() || JSON.stringify(footerLeft)
               : String(footerLeft)
             }
          </div>
        )}
      </div>

      <div className="col-card-footer">
        <div className="col-card-footer-actions" style={{ display: 'flex', gap: '0.4rem', width: '100%' }}>
          <button
            type="button"
            className="col-card-btn col-card-btn--ghost"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.72rem', flex: 1, padding: '0.45rem' }}
            onClick={handleOpenAI}
            aria-label={`Ask ClinicAI about ${title}`}
          >
            <Bot size={12} strokeWidth={2.5} /> ClinicAI
          </button>
          <button
            type="button"
            className="col-card-btn col-card-btn--accent"
            style={{ '--btn-accent': color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.72rem', flex: 1, padding: '0.45rem' }}
            onClick={handleDetailsClick}
            aria-label={`View details for ${title}`}
          >
            Details <ArrowRight size={12} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export function SkeletonCard() {
  return (
    <div className="col-skeleton-card" aria-hidden="true">
      <div style={{ height: '20px', width: '60%', background: 'var(--border-light)', borderRadius: '4px' }} />
      <div style={{ height: '14px', width: '80%', background: 'var(--border-light)', borderRadius: '4px' }} />
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem' }}>
        <div style={{ height: '20px', width: '40px', background: 'var(--border-light)', borderRadius: '999px' }} />
        <div style={{ height: '20px', width: '60px', background: 'var(--border-light)', borderRadius: '999px' }} />
      </div>
    </div>
  );
}

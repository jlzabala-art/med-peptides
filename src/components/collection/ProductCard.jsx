















import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, FlaskConical, Beaker, Zap, Activity, ShieldCheck, Bot, Plus, Check } from '@/lib/icons';
import ProductCardActions from '../product/ProductCardActions';

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
  onQuickAdd,        // quick add to cart
  primaryLabel   = 'ClinicalAI',
  secondaryLabel = 'Details',
  additionalCapabilities = null,
}) {
  const router = useRouter();
  const isList = viewMode === 'list';
  const [added, setAdded] = useState(false);

  const handleMouseEnter = () => {
    try {
      if (title) {
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        router?.prefetch?.(`/product/${slug}`);
      }
    } catch {
      // ignore
    }
  };

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
      onMouseEnter={handleMouseEnter}
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
          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            {badgeText && (
              <span className={`col-card-badge ${badgeType}`}>
                {badgeText}
              </span>
            )}
            {additionalCapabilities?.aiInterpretationService && (
              <span className="col-card-badge ai" style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)', color: 'white', border: 'none' }}>
                <Bot size={10} style={{ marginRight: '2px', display: 'inline' }} /> AI Powered
              </span>
            )}
            {additionalCapabilities?.requiresPrescription && (
              <span className="col-card-badge rx" style={{ background: '#EF4444', color: 'white', border: 'none' }}>
                Rx Required
              </span>
            )}
          </div>
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
        <ProductCardActions 
          title={title} 
          color={color} 
          onDetailsClick={handleDetailsClick} 
          onQuickAdd={onQuickAdd} 
        />
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
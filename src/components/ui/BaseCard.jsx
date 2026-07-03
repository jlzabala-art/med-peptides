import React from 'react';

/**
 * BaseCard
 * Standardized card component that supports headers, content, and footer.
 */
export default function BaseCard({ 
  title, 
  icon: Icon, 
  action, 
  children, 
  footer,
  loading = false,
  emptyState = null,
  hoverable = false,
  className = '',
  style = {}
}) {
  return (
    <div className={`base-card ${hoverable ? 'base-card--hoverable' : ''} ${className}`} style={style}>
      {(title || Icon || action) && (
        <div className="base-card__header">
          <h3 className="base-card__title">
            {Icon && <Icon size={20} className="text-primary" />}
            {title}
          </h3>
          {action && <div className="base-card__action">{action}</div>}
        </div>
      )}
      
      <div className="base-card__body">
        {loading ? (
          <div className="skeleton" style={{ height: '100px', width: '100%' }} />
        ) : emptyState ? (
          emptyState
        ) : (
          children
        )}
      </div>

      {footer && (
        <div className="base-card__footer">
          {footer}
        </div>
      )}
    </div>
  );
}

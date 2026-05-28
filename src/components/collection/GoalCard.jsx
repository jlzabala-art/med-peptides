 
import React from 'react';

/**
 * Standardized card for Biological Goals.
 * Enforces unified spacing, hover behavior, icon logic, and responsive behavior.
 */
export default function GoalCard({
  title,
  description,
  count,
  icon: Icon,
  color = 'var(--primary)',
  onClick,
  isActive = false
}) {
  return (
    <div 
      className="col-goal-card" 
      onClick={onClick}
      style={{
        '--goal-color': color,
        borderColor: isActive ? color : undefined,
        background: isActive ? 'rgba(255, 255, 255, 0.08)' : undefined
      }}
    >
      <div className="col-goal-accent" />
      
      <div className="col-goal-header">
        <div className="col-goal-icon-wrapper" style={{ color: color }}>
          {Icon && <Icon size={20} />}
        </div>
        {count !== undefined && (
          <div className="col-goal-count">{count} items</div>
        )}
      </div>

      <div>
        <h3 className="col-goal-title">{title}</h3>
        {description && <p className="col-goal-desc">{description}</p>}
      </div>
    </div>
  );
}

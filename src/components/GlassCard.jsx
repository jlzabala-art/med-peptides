import React from 'react';

export default function GlassCard({ 
  children, 
  gradientType = 'default', // 'default', 'primary', 'secondary', 'success', 'warning'
  onClick,
  style = {},
  hoverEffect = true
}) {
  const gradientStyles = {
    default: {
      background: 'rgba(255, 255, 255, 0.45)',
      border: '1px solid rgba(255, 255, 255, 0.6)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.04)',
    },
    primary: {
      background: 'linear-gradient(135deg, rgba(0, 54, 102, 0.03) 0%, rgba(0, 163, 224, 0.05) 100%)',
      border: '1px solid rgba(0, 163, 224, 0.15)',
      boxShadow: '0 8px 32px 0 rgba(0, 163, 224, 0.04)',
    },
    secondary: {
      background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.03) 0%, rgba(0, 209, 255, 0.06) 100%)',
      border: '1px solid rgba(56, 189, 248, 0.15)',
      boxShadow: '0 8px 32px 0 rgba(56, 189, 248, 0.03)',
    },
    success: {
      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.02) 0%, rgba(16, 185, 129, 0.05) 100%)',
      border: '1px solid rgba(16, 185, 129, 0.15)',
      boxShadow: '0 8px 32px 0 rgba(16, 185, 129, 0.03)',
    },
    warning: {
      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.02) 0%, rgba(245, 158, 11, 0.05) 100%)',
      border: '1px solid rgba(245, 158, 11, 0.15)',
      boxShadow: '0 8px 32px 0 rgba(245, 158, 11, 0.03)',
    }
  };

  const selectedGradient = gradientStyles[gradientType] || gradientStyles.default;

  return (
    <div 
      onClick={onClick}
      className={`glass-card ${hoverEffect ? 'hover-enabled' : ''} ${onClick ? 'clickable' : ''}`}
      style={{
        borderRadius: '16px',
        padding: '1.5rem',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        position: 'relative',
        overflow: 'hidden',
        ...selectedGradient,
        ...style
      }}
    >
      <style>{`
        .glass-card.hover-enabled:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.07);
          border-color: rgba(56, 189, 248, 0.3);
        }
        .glass-card.clickable {
          cursor: pointer;
        }
        .glass-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: skewX(-25deg);
          transition: 0.75s;
        }
        .glass-card.hover-enabled:hover::before {
          left: 150%;
        }
      `}</style>
      {children}
    </div>
  );
}

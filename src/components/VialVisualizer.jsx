 
import { memo } from 'react';

const VIAL_W = 60;
const VIAL_H = 80;

function VialVisualizer({ waterAmount }) {
  const numeric = Math.max(0, parseFloat(waterAmount) || 0);
  const maxWater = 10; // Max visual capacity
  const fillPct = Math.min(numeric / maxWater, 1);

  return (
    <div style={s.wrapper}>
      <div style={s.vial}>
        {/* Cap */}
        <div style={s.cap} />
        {/* Neck */}
        <div style={s.neck} />
        {/* Body */}
        <div style={s.body}>
          {/* Glass Gloss */}
          <div style={s.gloss} />
          {/* Liquid */}
          <div style={{
            ...s.liquid,
            height: `${fillPct * 100}%`,
            backgroundColor: 'rgba(0, 163, 224, 0.3)'
          }} />
          {/* Label */}
          <div style={s.label}>
             <div style={s.labelLine} />
             <div style={s.labelLineSmall} />
          </div>
        </div>
      </div>
      <div style={s.value}>{numeric.toFixed(1)} ml</div>
    </div>
  );
}

const s = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  vial: {
    position: 'relative',
    width: `${VIAL_W}px`,
    height: `${VIAL_H + 20}px`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  cap: {
    width: '30px',
    height: '10px',
    backgroundColor: 'var(--color-text-primary)',
    borderRadius: '4px 4px 2px 2px',
    zIndex: 3,
  },
  neck: {
    width: '24px',
    height: '12px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderLeft: '1.5px solid rgba(255,255,255,0.4)',
    borderRight: '1.5px solid rgba(255,255,255,0.4)',
    zIndex: 2,
  },
  body: {
    width: `${VIAL_W}px`,
    height: `${VIAL_H}px`,
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: '1.5px solid rgba(255,255,255,0.4)',
    borderRadius: '8px 8px 12px 12px',
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: 'blur(4px)',
  },
  liquid: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    transition: 'height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
    borderTop: '1px solid rgba(255,255,255,0.5)',
  },
  gloss: {
    position: 'absolute',
    top: 0,
    left: '10%',
    width: '20%',
    height: '100%',
    background: 'linear-gradient(to right, rgba(255,255,255,0.2), transparent)',
    zIndex: 5,
  },
  label: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    right: '10%',
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: '2px',
    zIndex: 4,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '4px',
    padding: '4px',
  },
  labelLine: {
    height: '2px',
    width: '80%',
    backgroundColor: 'var(--color-primary)',
    opacity: 0.3,
  },
  labelLineSmall: {
    height: '1.5px',
    width: '50%',
    backgroundColor: 'var(--color-primary)',
    opacity: 0.2,
  },
  value: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'monospace',
  }
};

export default memo(VialVisualizer);

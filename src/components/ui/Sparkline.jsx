import React from 'react';

export function Sparkline({ 
  data = [10, 20, 15, 30, 25, 40, 35, 50], 
  color = 'var(--primary, #1a73e8)', 
  width = 80, 
  height = 30, 
  strokeWidth = 2,
  fill = true
}) {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  // Transform data to SVG coordinates
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' L ');

  const pathD = `M ${points}`;
  
  // Create an area path that closes at the bottom corners
  const areaD = `M 0,${height} L ${points} L ${width},${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`-2 -2 ${width + 4} ${height + 4}`} style={{ overflow: 'visible' }}>
      {fill && (
        <>
          <defs>
            <linearGradient id={`sparkline-gradient-${color}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            d={areaD}
            fill={`url(#sparkline-gradient-${color})`}
            stroke="none"
          />
        </>
      )}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          filter: `drop-shadow(0px 2px 4px ${color}40)`,
        }}
      />
    </svg>
  );
}

export default Sparkline;

import React from 'react';

const ProtocolDayBadge = ({ text, tooltip }) => {
  return (
    <div className="protocol-day-badge-container" title={tooltip} style={{ position: 'relative', zIndex: 11, display: 'flex', alignItems: 'center' }}>
      <div className="protocol-day-badge"></div>
      {text && <span style={{ marginLeft: '12px', fontSize: '0.7rem', color: '#cbd5e1' }}>{text}</span>}
    </div>
  );
};

export default ProtocolDayBadge;

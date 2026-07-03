import React, { useState } from 'react';
import './SpeedDial.css';

/**
 * SpeedDial Component for mobile quick actions.
 * @param {Array} actions - Array of { icon: Node, label: String, onClick: Function }
 */
export function SpeedDial({ actions = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`speed-dial ${open ? 'open' : ''}`}>
      <div className="speed-dial-actions">
        {actions.map((action, index) => (
          <button
            key={index}
            className="speed-dial-action-btn"
            onClick={() => {
              action.onClick();
              setOpen(false);
            }}
            title={action.label}
          >
            {action.icon}
            <span className="speed-dial-label">{action.label}</span>
          </button>
        ))}
      </div>
      <button
        className="speed-dial-fab"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        <span className={`speed-dial-icon ${open ? 'rotated' : ''}`}>+</span>
      </button>
    </div>
  );
}

export default SpeedDial;

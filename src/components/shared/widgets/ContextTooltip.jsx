import HelpCircle from "lucide-react/dist/esm/icons/help-circle";
import Bot from "lucide-react/dist/esm/icons/bot";
import React, { useState } from 'react';



/**
 * Generic Context Tooltip
 * Renders a small ? icon that reveals contextual help on hover.
 * Can include a button to trigger Atlas Copilot for deeper explanations.
 * 
 * @param {string} content - The text to display inside the tooltip.
 * @param {string} copilotPrompt - Optional string. If provided, shows "Ask Copilot" button.
 */
export default function ContextTooltip({ content, copilotPrompt }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleAskCopilot = () => {
    // Dispatch custom event to trigger Copilot with pre-filled context
    const event = new CustomEvent('atlas:open-copilot', { detail: { prompt: copilotPrompt } });
    window.dispatchEvent(event);
    setIsHovered(false);
  };

  return (
    <div 
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: '6px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <HelpCircle size={16} color="#94a3b8" style={{ cursor: 'help' }} />

      {isHovered && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '8px',
          width: '280px',
          background: '#1e293b',
          color: '#fff',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          zIndex: 100,
          fontSize: '13px',
          lineHeight: 1.5,
          fontWeight: 400
        }}>
          {content}
          {copilotPrompt && (
            <button 
              onClick={handleAskCopilot}
              style={{
                marginTop: '12px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                padding: '6px 0',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              <Bot size={14} /> Ask Atlas Copilot
            </button>
          )}
          {/* Tooltip Arrow */}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '6px',
            borderStyle: 'solid',
            borderColor: '#1e293b transparent transparent transparent'
          }} />
        </div>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import Plus from 'lucide-react/dist/esm/icons/plus';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import MessageSquare from 'lucide-react/dist/esm/icons/message-square';
import Zap from 'lucide-react/dist/esm/icons/zap';

export default function SpeedDialFAB({ onOpenOmnibar }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="speed-dial-container" style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}>
      {/* Dial items */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem',
        opacity: isOpen ? 1 : 0, transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
        pointerEvents: isOpen ? 'auto' : 'none', transition: 'all 0.2s ease-out', alignItems: 'flex-end'
      }}>
        
        <button onClick={() => { setIsOpen(false); onOpenOmnibar(); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '0.5rem 1rem', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Ask Atlas</span>
          <div style={{ background: '#f0f9ff', padding: '0.4rem', borderRadius: '50%' }}>
            <MessageSquare size={16} color="#0284c7" />
          </div>
        </button>
        
        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '0.5rem 1rem', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Quick Command</span>
          <div style={{ background: '#f5f3ff', padding: '0.4rem', borderRadius: '50%' }}>
            <Zap size={16} color="#8b5cf6" />
          </div>
        </button>

        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '0.5rem 1rem', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Create RFQ</span>
          <div style={{ background: '#ecfdf5', padding: '0.4rem', borderRadius: '50%' }}>
            <FileText size={16} color="#10b981" />
          </div>
        </button>

      </div>
      
      {/* Main Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '56px', height: '56px', borderRadius: '50%', background: '#0f172a',
          color: 'white', border: 'none', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)',
          transition: 'transform 0.2s',
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0)'
        }}
      >
        <Plus size={24} />
      </button>
    </div>
  );
}

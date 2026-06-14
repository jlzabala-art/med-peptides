import Search from "lucide-react/dist/esm/icons/search";
import Command from "lucide-react/dist/esm/icons/command";
import Activity from "lucide-react/dist/esm/icons/activity";
import HeartPulse from "lucide-react/dist/esm/icons/heart-pulse";
import User from "lucide-react/dist/esm/icons/user";
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';





import { useCopilot } from '../../context/CopilotContext';
import { useNavigate } from 'react-router-dom';

export default function CommandBar() {
  const { isCommandBarOpen, setIsCommandBarOpen } = useCopilot();
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isCommandBarOpen) {
      // Focus input when opened
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandBarOpen]);

  const handleClose = () => {
    setIsCommandBarOpen(false);
  };

  const handleAction = (actionStr) => {
    handleClose();
    // Dummy action logic
    if (actionStr === 'inactive_physicians') navigate('/admin/physicians');
  };

  return (
    <AnimatePresence>
      {isCommandBarOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 30, 60, 0.5)',
            backdropFilter: 'blur(8px)',
            zIndex: 11000,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '15vh'
          }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '600px',
              backgroundColor: 'var(--surface, #ffffff)',
              borderRadius: '16px',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              margin: '0 1rem'
            }}
          >
            {/* Input Header */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>
              <Search size={20} color="var(--primary)" style={{ marginRight: '0.75rem' }} />
              <input 
                ref={inputRef}
                type="text" 
                placeholder="Ask Atlas or jump to..." 
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '1.2rem',
                  fontWeight: 500,
                  color: 'var(--text-main)',
                  background: 'transparent'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') handleClose();
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                <kbd style={{ background: 'var(--background)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>ESC</kbd>
              </div>
            </div>

            {/* Suggestions / Results */}
            <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '0.5rem' }}>
              <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Suggested Queries
              </div>
              <button onClick={() => handleAction('inactive_physicians')} className="command-item" style={{ 
                width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', 
                border: 'none', background: 'transparent', textAlign: 'left', borderRadius: '8px', cursor: 'pointer' 
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0, 54, 102, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}><User size={16} /></div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>Show inactive physicians</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Find doctors without recent activity</div>
                </div>
              </button>

              <button onClick={() => handleAction('revenue_clinic')} className="command-item" style={{ 
                width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', 
                border: 'none', background: 'transparent', textAlign: 'left', borderRadius: '8px', cursor: 'pointer' 
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0, 54, 102, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}><Activity size={16} /></div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>Which clinic generated most revenue?</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Commercial insight</div>
                </div>
              </button>

              <button onClick={() => handleAction('followup_patients')} className="command-item" style={{ 
                width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', 
                border: 'none', background: 'transparent', textAlign: 'left', borderRadius: '8px', cursor: 'pointer' 
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0, 54, 102, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}><HeartPulse size={16} /></div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>Patients requiring follow-up</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Medical workflow</div>
                </div>
              </button>

            </div>
          </motion.div>
          <style>{`
            .command-item:hover { background: rgba(0,54,102,0.03) !important; }
          `}</style>
        </div>
      )}
    </AnimatePresence>
  );
}
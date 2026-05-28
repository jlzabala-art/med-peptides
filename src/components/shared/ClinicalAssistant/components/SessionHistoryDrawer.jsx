/* eslint-disable no-unused-vars */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Trash2, Plus, Clock, X } from 'lucide-react';

export default function SessionHistoryDrawer({ 
  isOpen, 
  onClose, 
  sessions = [], 
  activeSessionId, 
  onLoadSession, 
  onNewSession, 
  onDeleteSession 
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.3)',
              backdropFilter: 'blur(4px)',
              zIndex: 10000
            }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'absolute',
              top: 0, left: 0, bottom: 0,
              width: '300px',
              backgroundColor: 'white',
              zIndex: 10001,
              boxShadow: '10px 0 30px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>Research History</h3>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1rem' }}>
              <button
                onClick={() => { onNewSession(); onClose(); }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  border: '1.5px dashed var(--primary)',
                  backgroundColor: 'rgba(0,75,135,0.03)',
                  color: 'var(--primary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} />
                New Research Thread
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem 1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {sessions.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.75rem' }}>
                    No previous sessions found.
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div 
                      key={session.id}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '12px',
                        backgroundColor: activeSessionId === session.id ? 'rgba(0,75,135,0.06)' : 'transparent',
                        border: `1px solid ${activeSessionId === session.id ? 'rgba(0,75,135,0.1)' : 'transparent'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => { onLoadSession(session.id); onClose(); }}
                    >
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        backgroundColor: activeSessionId === session.id ? 'var(--primary)' : '#f1f5f9',
                        color: activeSessionId === session.id ? 'white' : 'var(--color-text-secondary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        <MessageSquare size={16} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 700, 
                          color: 'var(--color-text-primary)', 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis' 
                        }}>
                          {session.title || 'New Research Thread'}
                        </div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Clock size={10} />
                          {new Date(session.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-border)',
                          padding: '0.4rem', borderRadius: '6px', transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--color-danger)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--color-border)'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ padding: '1.5rem', borderTop: '1px solid #f1f5f9', backgroundColor: 'var(--color-bg-app)' }}>
              <p style={{ margin: 0, fontSize: '0.62rem', color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
                Your research history is stored locally on this device.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

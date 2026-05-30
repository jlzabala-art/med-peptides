import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCpu } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
// Depending on the role, we might render different AI tools here. 
// For now, we will render a standard AI Chat interface placeholder.

export default function PortalAIDrawer({ isOpen, onClose }) {
  const { activeRole, userProfile } = useAuth();
  const location = useLocation();

  // Basic context parsing
  const currentPath = location.pathname;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div 
            className="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Slide-out Panel */}
          <motion.div 
            className="ai-drawer"
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="drawer-header">
              <div className="drawer-title">
                <FiCpu className="title-icon" />
                <h2>Regenpept AI</h2>
              </div>
              <button className="close-btn" onClick={onClose} aria-label="Close Drawer">
                <FiX />
              </button>
            </div>

            <div className="drawer-content">
              <div className="ai-context-banner">
                <p><strong>Context:</strong> You are acting as <span>{activeRole}</span> viewing <code>{currentPath}</code>.</p>
                <p>How can I assist you today, {userProfile?.firstName || 'User'}?</p>
              </div>

              {/* Chat Interface Placeholder */}
              <div className="chat-area">
                <div className="chat-bubble ai">
                  Hello! I'm ready to help you analyze data, draft protocols, or manage inventory based on your current view.
                </div>
              </div>
            </div>

            <div className="drawer-footer">
              <div className="chat-input-wrapper">
                <input type="text" placeholder="Ask AI a question..." className="chat-input" />
                <button className="send-btn">Send</button>
              </div>
            </div>
          </motion.div>
        </>
      )}

      <style>{`
        .drawer-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.3);
          z-index: 1040;
        }

        .ai-drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 400px;
          max-width: 90vw;
          background: #ffffff;
          box-shadow: -4px 0 24px rgba(0,0,0,0.15);
          z-index: 1050;
          display: flex;
          flex-direction: column;
        }

        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(0,0,0,0.08);
          background: #f8fafc;
        }

        .drawer-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--color-primary, #003666);
        }
        
        .drawer-title h2 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
        }

        .title-icon {
          font-size: 1.25rem;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #718096;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .close-btn:hover {
          background: rgba(0,0,0,0.05);
          color: #1a202c;
        }

        .drawer-content {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .ai-context-banner {
          background: rgba(0, 54, 102, 0.04);
          border: 1px solid rgba(0, 54, 102, 0.1);
          padding: 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          color: #4a5568;
        }

        .ai-context-banner p {
          margin: 0 0 0.5rem 0;
        }
        .ai-context-banner p:last-child {
          margin: 0;
        }

        .chat-area {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .chat-bubble {
          padding: 1rem;
          border-radius: 12px;
          font-size: 0.95rem;
          line-height: 1.5;
          max-width: 90%;
        }

        .chat-bubble.ai {
          background: #f1f5f9;
          color: #1a202c;
          align-self: flex-start;
          border-bottom-left-radius: 2px;
        }

        .drawer-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(0,0,0,0.08);
          background: #fff;
        }

        .chat-input-wrapper {
          display: flex;
          gap: 0.5rem;
        }

        .chat-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .chat-input:focus {
          border-color: var(--color-primary, #003666);
        }

        .send-btn {
          background: var(--color-primary, #003666);
          color: white;
          border: none;
          padding: 0 1.25rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .send-btn:hover {
          background: #002244;
        }
      `}</style>
    </AnimatePresence>
  );
}

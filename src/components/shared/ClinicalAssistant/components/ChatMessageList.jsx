/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronsDown, Bot } from 'lucide-react';
import ChatMessageItem from './ChatMessageItem';
import ResearchCompass from './ResearchCompass';

export default function ChatMessageList({ 
  messages, 
  isLoading, 
  isTyping, 
  scrollRef, 
  messagesEndRef, 
  showScrollBtn, 
  scrollToBottom,
  onProductClick,
  InstantResultsTabs,
  navigate,
  setIsOpen,
  onSend,
  onRate,
  onDeepDive,
  contextMode = 'patient',
  onConfirmAction
}) {
  const [hasSeenIntro, setHasSeenIntro] = useState(() => {
    return typeof window !== 'undefined' && localStorage.getItem('clinicalAI_hasSeenIntro') === 'true';
  });

  useEffect(() => {
    if (!hasSeenIntro) {
      localStorage.setItem('clinicalAI_hasSeenIntro', 'true');
    }
  }, [hasSeenIntro]);
  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 8 }}
            onClick={scrollToBottom}
            style={{
              position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
              zIndex: 100, display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1.25rem', borderRadius: '999px',
              background: 'white', color: 'var(--primary)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)', cursor: 'pointer',
              fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase',
              border: '1px solid rgba(0,0,0,0.05)'
            }}
          >
            <ChevronsDown size={14} />
            Jump to latest
          </motion.button>
        )}
      </AnimatePresence>

      <div 
        ref={scrollRef}
        className="ca-message-list"
        style={{
          flex: 1, overflowY: 'auto', padding: '2rem 1.5rem 8rem',
          display: 'flex', flexDirection: 'column',
          backgroundColor: (contextMode === 'admin' || contextMode === 'doctor') ? 'var(--color-bg-app)' : 'var(--color-bg-surface)',
          scrollBehavior: 'smooth'
        }}
      >
        <div style={{
          width: '100%',
          maxWidth: '820px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          flex: 1
        }}>
        {messages.map((msg, idx) => (
          <ChatMessageItem 
            key={idx} 
            msg={msg} 
            idx={idx} 
            onProductClick={onProductClick}
            InstantResultsTabs={InstantResultsTabs}
            navigate={navigate}
            setIsOpen={setIsOpen}
            onSend={onSend}
            onRate={onRate}
            onDeepDive={onDeepDive}
            contextMode={contextMode}
            onConfirmAction={onConfirmAction}
          />
        ))}


        
        {(isLoading || isTyping) && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: 'white', color: 'var(--primary)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <Bot size={18} />
            </div>
            <div style={{
              padding: '0.75rem 1.25rem', borderRadius: '16px',
              backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.05)',
              display: 'flex', gap: '4px'
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-border)', animation: 'ca-typing 1s infinite' }} />
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-border)', animation: 'ca-typing 1s infinite 0.2s' }} />
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-border)', animation: 'ca-typing 1s infinite 0.4s' }} />
            </div>
          </div>
        )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}

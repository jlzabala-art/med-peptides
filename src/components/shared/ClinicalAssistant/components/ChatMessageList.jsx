"use client";

/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


import ChatMessageItem from './ChatMessageItem';
import ResearchCompass from './ResearchCompass';
import { ChevronsDown, Bot } from '@/lib/icons';

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
  onConfirmAction,
  pageContext
}) {
  const [hasSeenIntro, setHasSeenIntro] = useState(() => {
    return typeof window !== 'undefined' && localStorage.getItem('clinicalAI_hasSeenIntro') === 'true';
  });

  useEffect(() => {
    if (!hasSeenIntro) {
      localStorage.setItem('clinicalAI_hasSeenIntro', 'true');
    }
  }, [hasSeenIntro]);
  const [thinkingStep, setThinkingStep] = useState(0);
  const thinkingSteps = [
    'Searching clinical literature...',
    'Crossing interactions data...',
    'Generating clinical report...'
  ];

  useEffect(() => {
    let interval;
    if (isLoading || isTyping) {
      interval = setInterval(() => {
        setThinkingStep(prev => (prev + 1) % thinkingSteps.length);
      }, 2500);
    } else {
      setThinkingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading, isTyping]);

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
          <div style={{ display: 'flex', gap: '0.85rem', width: '100%', maxWidth: '820px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: 'white', color: 'var(--primary, #003666)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)',
              flexShrink: 0
            }}>
              <Bot size={18} />
            </div>
            <div style={{
              flex: 1,
              padding: '0.85rem 1.15rem', borderRadius: '14px',
              backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary, #003666)', animation: 'ca-typing 1s infinite' }} />
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary, #003666)', animation: 'ca-typing 1s infinite 0.2s' }} />
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary, #003666)', animation: 'ca-typing 1s infinite 0.4s' }} />
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary, #003666)' }}>
                  {thinkingSteps[thinkingStep]}
                </span>
              </div>
              <div style={{
                height: '4px',
                width: '100%',
                borderRadius: '4px',
                backgroundColor: 'rgba(0, 54, 102, 0.08)',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  height: '100%',
                  width: '45%',
                  borderRadius: '4px',
                  background: 'linear-gradient(90deg, #003666 0%, #0d9488 100%)',
                  animation: 'shimmer 1.5s infinite ease-in-out'
                }} />
              </div>
            </div>
          </div>
        )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
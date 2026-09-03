import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { X, Sparkles, Send, Bot, User, RefreshCw, ArrowRight, BookOpen, ShieldCheck, Check } from '@/lib/icons';
import useGuestPreferences from '../../hooks/useGuestPreferences';
import { useCart } from '../../context/CartProvider';
import { useResponsive } from '../../hooks/useResponsive';
import { useScreenAIContext } from '../../hooks/useScreenAIContext';

function renderFormattedMessage(text, router, onClose) {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, lIdx) => {
    const parts = [];
    const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*)/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }
      if (match[2] && match[3]) {
        const label = match[2];
        const href = match[3];
        parts.push(
          <a
            key={`link-${lIdx}-${match.index}`}
            href={href}
            onClick={(e) => {
              e.preventDefault();
              if (onClose) onClose();
              router.push(href);
            }}
            style={{
              color: '#2563eb',
              textDecoration: 'underline',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {label}
          </a>
        );
      } else if (match[4]) {
        parts.push(
          <strong key={`bold-${lIdx}-${match.index}`} style={{ fontWeight: 700 }}>
            {match[4]}
          </strong>
        );
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    return (
      <span key={lIdx} style={{ display: 'block', minHeight: line === '' ? '0.6rem' : 'auto', marginBottom: '0.15rem' }}>
        {parts.length > 0 ? parts : line}
      </span>
    );
  });
}

export default function AtlasAIDrawer({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useResponsive('(max-width: 768px)');
  const { prefs, goalMeta, levelMeta, clearPrefs } = useGuestPreferences();
  const { cart = [] } = useCart() || {};
  const screenAI = useScreenAIContext(pathname);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const storageKey = `atlas_chat_history_${screenAI.scopeKey}`;

  // Load screen-scoped isolated history
  useEffect(() => {
    if (!isOpen) return;

    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn('[AtlasAIDrawer] Error reading scoped history:', e);
    }

    // Default screen-tailored initial greeting
    const activeGoal = goalMeta?.label || 'Longevity & Healthspan';
    const initialGreeting = {
      id: `initial-greeting-${screenAI.scopeKey}`,
      sender: 'ai',
      text: `Hello! I am your **${screenAI.agentName}** for *${screenAI.roleLabel}*.\n\nI am tailored for this specific view (${pathname}).\n\nHow can I assist your workflow or answer questions for this section?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([initialGreeting]);
  }, [isOpen, screenAI.scopeKey, pathname, storageKey, screenAI.agentName, screenAI.roleLabel, goalMeta?.label]);

  // Persist screen-scoped history
  useEffect(() => {
    if (!isOpen || messages.length === 0) return;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(messages));
      }
    } catch (e) {
      console.warn('[AtlasAIDrawer] Error persisting scoped history:', e);
    }
  }, [messages, isOpen, storageKey]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Screen-tailored suggested prompts
  const suggestedPrompts = screenAI.suggestedPrompts || [
    'How do I calculate reconstitution units for a 5mg vial?',
    'What synergistic supplements pair well with BPC-157?',
  ];

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const cartItemsList = Object.entries(cart || {}).map(([key, val]) => ({
      name: (val && typeof val === 'object' ? (val.name || val.title) : null) || key,
      quantity: (val && typeof val === 'object' ? val.quantity : val) || 1,
    }));

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: {
            goal: goalMeta?.label || prefs?.goal,
            experienceLevel: levelMeta?.label || prefs?.experienceLevel,
            preferences: Array.isArray(prefs?.preferences) ? prefs.preferences : [],
            pathname: pathname || '/',
            cartItems: cartItemsList,
            systemPersona: screenAI.systemPersona,
            screenScope: screenAI.scopeKey,
            agentName: screenAI.agentName,
          },
          history: messages.slice(-4),
        }),
      });

      const data = await res.json();
      const aiReply = data?.reply || 'I am ready to assist. Please refine your question or ask about specific compounds.';

      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: aiReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } catch (err) {
      console.error('[AtlasAIDrawer] error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'We encountered a momentary network hiccup. You can also explore our catalog directly.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(storageKey);
      }
    } catch (e) {
      console.warn('[AtlasAIDrawer] Error resetting history:', e);
    }
    const initialGreeting = {
      id: `initial-greeting-${screenAI.scopeKey}-${Date.now()}`,
      sender: 'ai',
      text: `Chat history cleared for **${screenAI.agentName}**.\n\nHow can I help you on this screen?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([initialGreeting]);
  };

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
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(2, 14, 28, 0.65)',
              backdropFilter: 'blur(6px)',
              zIndex: 99999,
            }}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: isMobile ? '100%' : '460px',
              backgroundColor: 'var(--surface-main, #ffffff)',
              boxShadow: '-12px 0 40px rgba(0,0,0,0.25)',
              zIndex: 100000,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Mobile Drag Indicator Handle */}
            {isMobile && (
              <div style={{
                width: '36px',
                height: '4px',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '2px',
                margin: '10px auto 0 auto',
              }} />
            )}

            {/* Header */}
            <div style={{
              padding: isMobile ? '1rem 1.25rem' : '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border, #e2e8f0)',
              backgroundColor: 'var(--surface-raised, #f8fafc)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    width: 34,
                    height: 34,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                  }}>
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
                      {screenAI.agentName}
                    </h3>
                    <span style={{ fontSize: '0.72rem', color: screenAI.accentColor || '#2563eb', fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                      {screenAI.roleLabel}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={handleResetChat}
                    title="Clear conversation"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted, #64748b)',
                      cursor: 'pointer',
                      padding: '0.4rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <RefreshCw size={16} />
                  </button>
                  <button
                    onClick={onClose}
                    aria-label="Close Atlas AI"
                    style={{
                      background: 'var(--surface-main, #ffffff)',
                      border: '1px solid var(--border, #cbd5e1)',
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'var(--text-main, #334155)',
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Context Pill Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                flexWrap: 'wrap',
                paddingTop: '0.25rem',
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--text-muted, #64748b)',
                }}>
                  Context:
                </span>
                {goalMeta && (
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                    color: '#2563eb',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    {goalMeta.icon} {goalMeta.label}
                  </span>
                )}
                {levelMeta && (
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    backgroundColor: 'var(--border-light, #f1f5f9)',
                    color: 'var(--text-main, #475569)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                  }}>
                    {levelMeta.label}
                  </span>
                )}
                <span style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted, #94a3b8)',
                  marginLeft: 'auto',
                }}>
                  {pathname === '/' ? 'Home' : pathname.replace('/', '')}
                </span>
              </div>
            </div>

            {/* Chat Thread */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}>
              {messages.map((m) => {
                const isAi = m.sender === 'ai';
                return (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isAi ? 'flex-start' : 'flex-end',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      maxWidth: '88%',
                      alignItems: 'flex-start',
                    }}>
                      {isAi && (
                        <div style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          backgroundColor: '#2563eb',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}>
                          <Bot size={14} />
                        </div>
                      )}
                      <div style={{
                        backgroundColor: isAi ? 'var(--surface-raised, #f1f5f9)' : '#2563eb',
                        color: isAi ? 'var(--text-main, #0f172a)' : '#ffffff',
                        padding: '0.85rem 1.1rem',
                        borderRadius: isAi ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                        fontSize: '0.92rem',
                        lineHeight: 1.55,
                        whiteSpace: 'pre-wrap',
                        boxShadow: isAi ? '0 2px 8px rgba(0,0,0,0.03)' : '0 4px 12px rgba(37,99,235,0.2)',
                      }}>
                        {isAi ? renderFormattedMessage(m.text, router, onClose) : m.text}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.65rem',
                      color: 'var(--text-muted, #94a3b8)',
                      marginTop: '0.25rem',
                      padding: '0 0.5rem',
                    }}>
                      {m.timestamp}
                    </span>
                  </div>
                );
              })}

              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={14} />
                  </div>
                  <div style={{ backgroundColor: 'var(--surface-raised, #f1f5f9)', padding: '0.6rem 1rem', borderRadius: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Analyzing protocol evidence...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div style={{
              padding: '0.5rem 1.25rem',
              borderTop: '1px solid var(--border, #f1f5f9)',
              display: 'flex',
              gap: '0.4rem',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            }}>
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p)}
                  disabled={loading}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.4rem 0.75rem',
                    borderRadius: '16px',
                    background: 'var(--surface-raised, #f8fafc)',
                    border: '1px solid var(--border, #e2e8f0)',
                    color: 'var(--text-main, #334155)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    flexShrink: 0,
                  }}
                >
                  <Sparkles size={11} color="#2563eb" /> {p}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div style={{
              padding: '0.85rem 1.25rem calc(0.85rem + env(safe-area-inset-bottom, 8px)) 1.25rem',
              borderTop: '1px solid var(--border, #e2e8f0)',
              backgroundColor: 'var(--surface-main, #ffffff)',
            }}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'var(--surface-raised, #f8fafc)',
                  border: '1.5px solid var(--border, #cbd5e1)',
                  borderRadius: '12px',
                  padding: '0.35rem 0.6rem',
                }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Atlas AI about peptides, doses, protocols..."
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '0.92rem',
                    color: 'var(--text-main, #0f172a)',
                    padding: '0.4rem',
                  }}
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '8px',
                    backgroundColor: input.trim() && !loading ? '#2563eb' : 'var(--border, #cbd5e1)',
                    color: 'white',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: input.trim() && !loading ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                  }}
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

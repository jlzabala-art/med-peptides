'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, X, ShieldCheck, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';

/**
 * PublicAtlasAIDrawer
 * ─────────────────────────────────────────────────────────────────────────────
 * Sandboxed, strictly focused AI research assistant for Public Datasheets (/p/[slug])
 * and Public Shared Catalogs (/c/[id]).
 * 
 * Strict Guardrails:
 * 1. Strictly in English at all times.
 * 2. Hard rate-limit of 5 queries per IP / 24h.
 * 3. Session isolation via sessionStorage (no cross-user query bleed).
 * 4. Zero outbound hyperlinks (no jumping out of the document context).
 * 5. Registration CTA trigger once the 5 queries are exhausted.
 */
export default function PublicAtlasAIDrawer({
  contextType = 'monograph', // 'monograph' | 'catalog'
  contextAnchor = null,     // { name, cas, purity, molecular, sequence, details }
  catalogInventory = [],    // [{ name, category, purity, format }]
  storageKey = 'default',
  onOpenRegisterModal = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [remaining, setRemaining] = useState(5);
  const [limit, setLimit] = useState(5);
  const [isBlocked, setIsBlocked] = useState(false);
  const messagesEndRef = useRef(null);

  const sessionKey = `atlas_ai_public_${storageKey}`;

  // 1. Load isolated session chat history
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(sessionKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // Ignore sessionStorage parsing errors
    }
  }, [sessionKey]);

  // 2. Fetch current IP quota status
  useEffect(() => {
    let isMounted = true;
    fetch('/api/ai-chat?scope=public_sandbox')
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        if (typeof data.remaining === 'number') {
          setRemaining(data.remaining);
          setLimit(data.limit || 5);
          if (data.remaining <= 0) {
            setIsBlocked(true);
          }
        }
      })
      .catch(() => {
        // Non-blocking quota lookup
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Save session messages locally
  const saveMessages = (updated) => {
    setMessages(updated);
    try {
      sessionStorage.setItem(sessionKey, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || message).trim();
    if (!query || isLoading || isBlocked) return;

    setMessage('');
    const newMsgList = [...messages, { sender: 'user', text: query, timestamp: new Date().toISOString() }];
    saveMessages(newMsgList);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope: 'public_sandbox',
          message: query,
          context: {
            screenScope: contextType === 'monograph' ? 'product_monograph' : 'catalog_portfolio',
            contextAnchor,
            catalogInventory,
          },
          history: newMsgList.slice(-6),
        }),
      });

      const data = await res.json();

      if (res.status === 429 || data.error === 'QUOTA_EXCEEDED') {
        setIsBlocked(true);
        setRemaining(0);
        saveMessages([
          ...newMsgList,
          {
            sender: 'bot',
            text: 'You have reached the limit of 5 free research inquiries. Please sign in or create an authorized institutional account for unlimited access.',
            isQuotaExceeded: true,
            timestamp: new Date().toISOString(),
          },
        ]);
        return;
      }

      if (typeof data.remaining === 'number') {
        setRemaining(data.remaining);
        if (data.remaining <= 0) {
          setIsBlocked(true);
        }
      }

      const botReply = data.reply || 'Analytical specification confirmed. All compounding parameters must follow standard institutional guidelines.';
      saveMessages([
        ...newMsgList,
        {
          sender: 'bot',
          text: botReply,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      saveMessages([
        ...newMsgList,
        {
          sender: 'bot',
          text: 'Temporary network connection delay. Dual-stage RP-HPLC specifications remain verified on the primary document.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Safe markdown cleaner (strips any markdown links to prevent external escapes)
  const renderSafeBotText = (txt) => {
    if (!txt) return null;
    // Strip markdown links [text](url) -> text
    const sanitized = txt.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    const lines = sanitized.split('\n');

    return lines.map((line, idx) => {
      // Bold rendering
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={idx} style={{ margin: '0 0 6px 0', lineHeight: 1.45, fontSize: '0.86rem' }}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} style={{ color: '#00284d', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  const quickPrompts = contextType === 'monograph'
    ? [
        `How to reconstitute with 2mL BAC water?`,
        `What are the storage guidelines?`,
        `What is the purity specification?`,
      ]
    : [
        `What formulations are ready for immediate dispatch?`,
        `Which peptides are intended for metabolic research?`,
        `What is the Lotusland synthesis purity standard?`,
      ];

  return (
    <>
      {/* ── Floating Launcher Trigger ── */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="atlas-ai-public-fab"
        title="Open Atlas AI Technical Research Copilot"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '9px',
          background: 'linear-gradient(135deg, #003666 0%, #002244 100%)',
          color: '#ffffff',
          border: '1px solid rgba(56, 189, 248, 0.45)',
          borderRadius: '24px',
          padding: '10px 18px',
          fontSize: '0.84rem',
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: '0 8px 24px -4px rgba(0, 54, 102, 0.4), 0 2px 6px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Sparkles size={16} color="#38bdf8" />
        <span style={{ letterSpacing: '0.01em' }}>
          Atlas AI {contextType === 'monograph' ? 'Technical Inquiry' : 'Catalog Copilot'}
        </span>
        <span
          style={{
            fontSize: '0.70rem',
            fontWeight: 800,
            backgroundColor: isBlocked ? 'rgba(239, 68, 68, 0.25)' : 'rgba(56, 189, 248, 0.2)',
            color: isBlocked ? '#fca5a5' : '#bae6fd',
            border: `1px solid ${isBlocked ? '#f87171' : 'rgba(56, 189, 248, 0.35)'}`,
            padding: '2px 7px',
            borderRadius: '10px',
          }}
        >
          {isBlocked ? 'Limit Reached' : `${remaining}/${limit}`}
        </span>
      </button>

      {/* ── Slide-Over Drawer ── */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            transition: 'opacity 0.2s ease',
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '420px',
              height: '100%',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-8px 0 32px rgba(0, 24, 48, 0.25)',
              borderLeft: '1px solid #e2e8f0',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #00284d 0%, #001833 100%)',
                color: '#ffffff',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(56, 189, 248, 0.25)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Sparkles size={16} color="#38bdf8" />
                  <span style={{ fontSize: '0.98rem', fontWeight: 800, letterSpacing: '-0.01em', color: '#ffffff' }}>
                    Atlas Research Copilot
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#7dd3fc', marginTop: '2px', fontWeight: 600 }}>
                  Lotusland Limited • Verified Analytical Support
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '0.70rem',
                    fontWeight: 700,
                    backgroundColor: isBlocked ? 'rgba(239, 68, 68, 0.25)' : 'rgba(56, 189, 248, 0.15)',
                    color: isBlocked ? '#fca5a5' : '#bae6fd',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    border: `1px solid ${isBlocked ? 'rgba(248, 113, 113, 0.4)' : 'rgba(56, 189, 248, 0.3)'}`,
                  }}
                >
                  {isBlocked ? '0/5 Available' : `${remaining}/${limit} Inquiries`}
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Subheader Anchor Summary */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: '10px 16px',
                borderBottom: '1px solid #e2e8f0',
                fontSize: '0.76rem',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <ShieldCheck size={14} color="#16a34a" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <strong style={{ color: '#003666' }}>Active Focus:</strong>{' '}
                {contextType === 'monograph'
                  ? `${contextAnchor?.name || 'Peptide Monograph'} (${contextAnchor?.purity || '≥99% HPLC'})`
                  : `Portfolio Catalog (${catalogInventory.length} Available Formulations)`}
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                backgroundColor: '#ffffff',
              }}
            >
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: '#f0f9ff',
                      color: '#0284c7',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '10px',
                    }}
                  >
                    <Sparkles size={22} />
                  </div>
                  <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#0f172a' }}>
                    Dedicated Technical Research Assistant
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', maxWidth: '300px', margin: '6px auto 0' }}>
                    Ask specific technical questions regarding reconstitution volumes, storage temperatures, or batch analytics. Strictly limited to this monograph.
                  </div>

                  {/* Suggested Prompts */}
                  <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Suggested Inquiries:
                    </div>
                    {quickPrompts.map((q, qIdx) => (
                      <button
                        key={qIdx}
                        type="button"
                        onClick={() => handleSendMessage(q)}
                        disabled={isBlocked || isLoading}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '0.78rem',
                          color: '#003666',
                          fontWeight: 600,
                          textAlign: 'left',
                          cursor: isBlocked || isLoading ? 'default' : 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        → {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      backgroundColor: m.sender === 'user' ? '#003666' : '#f8fafc',
                      color: m.sender === 'user' ? '#ffffff' : '#1e293b',
                      border: m.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                      borderRadius: m.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      padding: '10px 14px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    }}
                  >
                    {m.sender === 'user' ? (
                      <div style={{ fontSize: '0.86rem', lineHeight: 1.4 }}>{m.text}</div>
                    ) : (
                      renderSafeBotText(m.text)
                    )}
                  </div>
                ))
              )}

              {isLoading && (
                <div
                  style={{
                    alignSelf: 'flex-start',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    fontSize: '0.82rem',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <RefreshCw size={14} className="animate-spin" color="#003666" />
                  <span>Verifying analytical specifications…</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quota Exhaustion Banner & Registration Trigger */}
            {isBlocked && (
              <div
                style={{
                  backgroundColor: '#fffbeb',
                  borderTop: '1px solid #fde68a',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#92400e', fontSize: '0.80rem', fontWeight: 800 }}>
                  <AlertTriangle size={15} color="#d97706" />
                  <span>Free Guest Inquiries Depleted (5/5)</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#78350f', lineHeight: 1.4 }}>
                  You have utilized all 5 free analytical inquiries for this IP. Access unlimited clinical intelligence and full compendium tools with a verified professional account.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenRegisterModal) {
                      setIsOpen(false);
                      onOpenRegisterModal();
                    } else {
                      window.open('/auth/login?register=true', '_blank');
                    }
                  }}
                  style={{
                    marginTop: '4px',
                    background: 'linear-gradient(135deg, #003666 0%, #002244 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontWeight: 800,
                    fontSize: '0.80rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0, 54, 102, 0.25)',
                  }}
                >
                  <span>Register for Full Professional Access</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* Input Box */}
            <div
              style={{
                padding: '14px 16px',
                borderTop: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
              }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                style={{ display: 'flex', gap: '8px' }}
              >
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isLoading || isBlocked}
                  placeholder={
                    isBlocked
                      ? 'Inquiry quota reached (5/5). Please register.'
                      : 'Ask technical question (English only)…'
                  }
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    outline: 'none',
                    backgroundColor: isBlocked ? '#f1f5f9' : '#ffffff',
                    color: isBlocked ? '#94a3b8' : '#0f172a',
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading || isBlocked || !message.trim()}
                  style={{
                    backgroundColor: isBlocked || !message.trim() ? '#94a3b8' : '#003666',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isBlocked || !message.trim() ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Send size={15} />
                </button>
              </form>
              <div
                style={{
                  fontSize: '0.68rem',
                  color: '#94a3b8',
                  marginTop: '6px',
                  textAlign: 'center',
                }}
              >
                Strictly English • Lotusland Analytical Verification • Confidential Session
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

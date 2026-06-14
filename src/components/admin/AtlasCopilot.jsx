import Bot from "lucide-react/dist/esm/icons/bot";
import X from "lucide-react/dist/esm/icons/x";
import Send from "lucide-react/dist/esm/icons/send";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Minimize2 from "lucide-react/dist/esm/icons/minimize-2";
import Maximize2 from "lucide-react/dist/esm/icons/maximize-2";
import React, { useState, useEffect, useRef } from 'react';






import { getFunctions, httpsCallable } from 'firebase/functions';

export default function AtlasCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your Atlas AI Copilot. I can help you analyze patients, query clinical protocols, or summarize clinic performance. What do you need?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Listen for global event to open copilot with context
  useEffect(() => {
    const handleOpenCopilot = (e) => {
      setIsOpen(true);
      setIsMinimized(false);
      if (e.detail?.query) {
        handleSend(e.detail.query, e.detail.context);
      }
    };
    window.addEventListener('open-atlas-copilot', handleOpenCopilot);
    return () => window.removeEventListener('open-atlas-copilot', handleOpenCopilot);
  }, []);

  const handleSend = async (textOverride = null, context = null) => {
    const text = textOverride || input;
    if (!text.trim()) return;

    const userMsg = { role: 'user', content: text, context };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const functions = getFunctions();
      const clinicalAiAssistant = httpsCallable(functions, 'clinicalAiAssistant');
      const response = await clinicalAiAssistant({ 
        query: text, 
        context: context || { currentRoute: window.location.pathname }
      });

      const reply = response.data?.reply || response.data?.answer || 'I processed your request, but received an empty response from the clinical core.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error("Copilot Error:", err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error connecting to the clinical intelligence core.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: isMinimized ? '2rem' : '2rem',
      right: '2rem',
      width: '380px',
      height: isMinimized ? 'auto' : '600px',
      maxHeight: '80vh',
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 9999,
      overflow: 'hidden',
      border: '1px solid var(--border)',
      animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      {/* Header */}
      <div style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Bot size={20} />
          <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>Atlas Copilot</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setIsMinimized(!isMinimized)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0.25rem' }}>
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      {!isMinimized && (
        <>
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#f8fafc' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: msg.role === 'user' ? 'var(--primary)' : 'white',
                  color: msg.role === 'user' ? 'white' : 'var(--text-main)',
                  border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                  fontSize: '0.9rem',
                  lineHeight: '1.4'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '0.75rem 1rem', borderRadius: '12px', backgroundColor: 'white', border: '1px solid var(--border)' }}>
                  <Loader2 size={18} className="spin" color="var(--primary)" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', backgroundColor: 'white' }}>
            <form onSubmit={e => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask Atlas Copilot..."
                style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '24px', border: '1px solid var(--border)', outline: 'none', fontSize: '0.9rem' }}
                disabled={loading}
              />
              <button 
                type="submit" 
                disabled={loading || !input.trim()}
                style={{
                  width: '40px', height: '40px', borderRadius: '50%', backgroundColor: input.trim() ? 'var(--primary)' : '#e2e8f0', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'default', transition: 'background 0.2s'
                }}
              >
                <Send size={16} style={{ transform: 'translateX(-1px) translateY(1px)' }} />
              </button>
            </form>
          </div>
        </>
      )}
      <style>{`
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, XCircle } from 'lucide-react';

export default function AdminAIAssistant({ onClose }) {
  const [messages, setMessages] = useState([
    { 
      id: 1,
      role: 'assistant', 
      content: 'Hello! I am your Platform Assistant. How can I help you manage the system today?',
      suggestions: ['Show pending approvals', 'Stock inventory report', 'Weekly revenue summary']
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message
    const newMessages = [...messages, { id: Date.now(), role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    
    // Simulate AI response
    setTimeout(() => {
      setMessages([...newMessages, { 
        id: Date.now() + 1,
        role: 'assistant', 
        content: `I'm a simulated assistant. If this were fully wired, I would process your request: "${input}" and perform the necessary actions in the database.`
      }]);
    }, 800);
  };

  const handleSuggestion = (text) => {
    setInput(text);
  };

  return (
    <>
      {/* Background Overlay */}
      <div 
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(2px)',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease-out'
        }} 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Slide-over Panel */}
      <div 
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0,
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'var(--color-bg-surface)',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        role="dialog"
        aria-label="AI Assistant"
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--color-bg-app)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px', height: '36px',
              borderRadius: '8px',
              backgroundColor: '#0071bd',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white'
            }}>
              <Bot size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Platform Copilot</h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <Sparkles size={12} color="#0071bd" /> AI Assistant
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-secondary)', padding: '0.5rem', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-border)'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '85%',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                borderTopLeftRadius: msg.role === 'user' ? '12px' : '4px',
                borderTopRightRadius: msg.role === 'user' ? '4px' : '12px',
                backgroundColor: msg.role === 'user' ? '#0071bd' : '#f1f5f9',
                color: msg.role === 'user' ? 'var(--color-bg-surface)' : 'var(--color-text-primary)',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                boxShadow: msg.role === 'user' ? '0 2px 8px rgba(0, 113, 189, 0.2)' : 'none'
              }}>
                {msg.content}
              </div>
              
              {/* Suggestions Chips */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                  {msg.suggestions.map((sugg, i) => (
                    <button 
                      key={i}
                      onClick={() => handleSuggestion(sugg)}
                      style={{
                        background: 'transparent',
                        border: '1px solid #cbd5e1',
                        borderRadius: '100px',
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--color-text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0071bd'; e.currentTarget.style.color = '#0071bd'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
                    >
                      {sugg}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', backgroundColor: 'var(--color-bg-surface)' }}>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                paddingRight: '2.5rem',
                borderRadius: '999px',
                border: '1px solid #cbd5e1',
                backgroundColor: 'var(--color-bg-app)',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0071bd'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              style={{
                position: 'absolute',
                right: '0.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: input.trim() ? '#0071bd' : 'transparent',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: input.trim() ? 'white' : 'var(--color-text-tertiary)',
                cursor: input.trim() ? 'pointer' : 'default',
                transition: 'all 0.2s ease'
              }}
            >
              <Send size={14} style={{ marginLeft: input.trim() ? '2px' : '0' }} />
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)' }}>
              AI can make mistakes. Verify important information.
            </span>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
    </>
  );
}

import React, { useState } from 'react';
import { Sparkles, X, ChevronRight, CheckSquare, FileText } from 'lucide-react';
import './MessagingApp.css';

export default function ChatAIAssistant({ conversation, onClose }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [actionType, setActionType] = useState('');

  const handleAction = (type) => {
    setActionType(type);
    setLoading(true);
    setResult(null);

    // Mock AI processing delay
    setTimeout(() => {
      setLoading(false);
      if (type === 'summarize') {
        setResult("This conversation is regarding a recent order delay. The patient has requested an update on shipping, and the doctor advised waiting until Friday.");
      } else if (type === 'action_items') {
        setResult("1. Follow up with logistics team on Friday.\n2. Send tracking link to patient.\n3. Update clinical notes with tracking status.");
      }
    }, 1500);
  };

  return (
    <div className="chat-ai-assistant-panel">
      <div className="ai-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1a73e8', fontWeight: 600 }}>
          <Sparkles size={18} /> Atlas AI Assistant
        </div>
        <button className="chat-action-btn" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className="ai-content">
        {!result && !loading && (
          <div className="ai-options">
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
              How can I help with this conversation?
            </p>
            <button className="ai-action-btn" onClick={() => handleAction('summarize')}>
              <FileText size={16} /> Summarize Thread <ChevronRight size={16} style={{ marginLeft: 'auto' }} />
            </button>
            <button className="ai-action-btn" onClick={() => handleAction('action_items')}>
              <CheckSquare size={16} /> Extract Action Items <ChevronRight size={16} style={{ marginLeft: 'auto' }} />
            </button>
          </div>
        )}

        {loading && (
          <div className="ai-loading">
            <Sparkles size={24} className="ai-sparkle-spin" color="#1a73e8" />
            <p>Analyzing conversation...</p>
          </div>
        )}

        {result && !loading && (
          <div className="ai-result">
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#1e293b', textTransform: 'capitalize' }}>
              {actionType.replace('_', ' ')}
            </h4>
            <div className="ai-result-text">
              {result.split('\n').map((line, i) => (
                <p key={i} style={{ margin: '0 0 0.25rem 0' }}>{line}</p>
              ))}
            </div>
            <button className="empty-state-btn" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center', padding: '0.4rem' }} onClick={() => setResult(null)}>
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

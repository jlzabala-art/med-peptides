import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, FileText, Image as ImageIcon, Link as LinkIcon, DollarSign, Sparkles } from 'lucide-react';
import { messagingService } from '../../../services/messagingService';
import RichMessageCard from './RichMessageCard';
import ChatAIAssistant from './ChatAIAssistant';
import './MessagingApp.css';

export default function ChatWindow({ conversation, currentUserId, currentUserRole, onBack, onToggleContext }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [showRichMenu, setShowRichMenu] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  const [isInternal, setIsInternal] = useState(false);

  useEffect(() => {
    if (!conversation) return;
    const unsubscribe = messagingService.subscribeToMessages(conversation.id, (msgs) => {
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() && !file) return;
    setSending(true);
    try {
      // In a real app we'd update messagingService signature, 
      // here we pass it in the metadata or as 7th parameter depending on the service.
      await messagingService.sendMessage(
        conversation.id,
        currentUserId,
        newMessage,
        'text',
        null,
        file ? { file } : null,
        isInternal
      );
      setNewMessage('');
      setFile(null);
      setIsInternal(false);
    } catch (e) {
      console.error("Failed to send message", e);
    }
    setSending(false);
  };

  const handleSendRich = async (type) => {
    let referenceId = '';
    let text = '';
    
    if (type === 'payment_link') {
      referenceId = prompt("Enter the payment URL (e.g., Stripe Payment Link):");
      if (!referenceId) return;
      text = "Please complete your payment using this link.";
    } else {
      referenceId = prompt(`Enter the ${type === 'link_product' ? 'Product' : 'Order'} ID:`);
      if (!referenceId) return;
    }

    setSending(true);
    try {
      await messagingService.sendMessage(
        conversation.id,
        currentUserId,
        text,
        type,
        referenceId
      );
    } catch (e) {
      console.error("Failed to send rich message", e);
    }
    setSending(false);
    setShowRichMenu(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  if (!conversation) {
    return (
      <div className="messaging-main" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: '#9aa0a6', fontSize: '1.1rem' }}>Select a conversation to start chatting</div>
      </div>
    );
  }

  const getConvoTitle = (convo) => {
    if (convo.title) return convo.title;
    const otherId = convo.participants.find(id => id !== currentUserId);
    return otherId && convo.participantNames ? (convo.participantNames[otherId] || 'User') : 'Chat';
  };

  return (
    <div className="messaging-main">
      {/* Header */}
      <div className="chat-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {onBack && (
            <button className="chat-header-back-btn" onClick={onBack} aria-label="Back to conversations">
              ←
            </button>
          )}
          <div className="chat-header-title">
            {getConvoTitle(conversation)}
            {conversation.type === 'direct' && <span className="chat-header-status">● Online</span>}
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="chat-header-tags" style={{ display: 'flex', gap: '0.5rem' }}>
             {conversation.priority === 'urgent' && <span style={{ background: '#fef2f2', color: '#ef4444', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Urgent</span>}
             <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Clinical</span>
          </div>
          <button className="chat-action-btn" onClick={() => setShowAIAssistant(!showAIAssistant)} title="Atlas AI Assistant" style={{ color: showAIAssistant ? '#1a73e8' : '#64748b' }}>
            <Sparkles size={18} />
          </button>
          {onToggleContext && (
            <button className="chat-action-btn" onClick={onToggleContext} title="Toggle Context Panel">
              <FileText size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages" style={{ position: 'relative' }}>
        {showAIAssistant && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }}>
            <ChatAIAssistant conversation={conversation} onClose={() => setShowAIAssistant(false)} />
          </div>
        )}

        {messages.map((msg, idx) => {
          const isSent = msg.senderId === currentUserId;
          const isRich = ['link_product', 'link_order', 'payment_link'].includes(msg.type);
          
          // Filter internal notes if the current user is not part of the internal team.
          // Assuming 'admin' and 'account_manager' are internal roles.
          if (msg.isInternal && currentUserRole !== 'admin' && currentUserRole !== 'account_manager') {
            return null;
          }

          return (
            <div key={msg.id || idx} className={`message-bubble ${isSent ? 'sent' : 'received'} ${msg.isInternal ? 'internal-note' : ''}`}>
              
              {msg.isInternal && (
                <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#b45309', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  🔒 Internal Note
                </div>
              )}

              {/* If it's a file attachment */}
              {msg.fileUrl && (
                <div style={{ marginBottom: '0.5rem' }}>
                  {msg.fileType?.startsWith('image/') ? (
                    <img src={msg.fileUrl} alt="attachment" style={{ maxWidth: '100%', borderRadius: '4px' }} />
                  ) : (
                    <a href={msg.fileUrl} target="_blank" rel="noreferrer" style={{ color: isSent ? 'var(--color-bg-surface)' : '#1a73e8', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}>
                      <FileText size={16} /> {msg.fileName || 'Attachment'}
                    </a>
                  )}
                </div>
              )}

              {/* Text Content */}
              {msg.text && <div>{msg.text}</div>}

              {/* Rich Content Card */}
              {isRich && <RichMessageCard type={msg.type} referenceId={msg.referenceId} text={msg.text} />}

              <div className="message-meta" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' }}>
                {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                {isSent && !msg.isInternal && <span style={{ fontSize: '10px' }}>✓✓</span>}
              </div>

              {/* Hover Actions */}
              <div className="message-actions-overlay">
                <button className="chat-action-btn" title="Reply">↩</button>
                <button className="chat-action-btn" title="Forward">→</button>
                <button className="chat-action-btn" title="Bookmark">★</button>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* File Preview */}
      {file && (
        <div style={{ padding: '0.5rem 1rem', backgroundColor: '#e8f0fe', borderTop: '1px solid #dadce0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', color: '#1a73e8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Paperclip size={14} /> Attached: {file.name}
          </span>
          <button onClick={() => setFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5f6368' }}>✕</button>
        </div>
      )}

      {/* Input Area */}
      <div className="chat-input-area" style={{ position: 'relative' }}>
        
        <input 
          type="file" 
          id="chat-file-upload" 
          style={{ display: 'none' }} 
          onChange={handleFileChange} 
          accept="image/*,.pdf"
        />
        <label htmlFor="chat-file-upload" className="chat-attach-btn" title="Attach file">
          <Paperclip size={20} />
        </label>

        {/* Account Managers / Admins only: Rich Message Menu */}
        {(currentUserRole === 'admin' || currentUserRole === 'account_manager' || currentUserRole === 'wholesaler') && (
          <div style={{ position: 'relative' }}>
            <button 
              className="chat-attach-btn" 
              onClick={() => setShowRichMenu(!showRichMenu)}
              title="Attach Rich Content"
            >
              <LinkIcon size={20} />
            </button>
            {showRichMenu && (
              <div style={{ 
                position: 'absolute', bottom: '100%', left: 0, marginBottom: '0.5rem', 
                backgroundColor: 'var(--color-bg-surface)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                border: '1px solid #dadce0', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
                minWidth: '150px'
              }}>
                <button style={{ border: 'none', background: 'none', textAlign: 'left', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }} onClick={() => handleSendRich('payment_link')}>
                  <DollarSign size={16} color="var(--color-success)" /> Send Payment Link
                </button>
                <button style={{ border: 'none', background: 'none', textAlign: 'left', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }} onClick={() => handleSendRich('link_product')}>
                  <ImageIcon size={16} color="#1a73e8" /> Link Product
                </button>
              </div>
            )}
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <input 
            className={`chat-input-box ${isInternal ? 'internal-mode' : ''}`}
            type="text" 
            placeholder={isInternal ? "Type an internal note..." : "Type a message..."}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={sending}
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
          {(currentUserRole === 'admin' || currentUserRole === 'account_manager') && (
            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={isInternal} 
                  onChange={(e) => setIsInternal(e.target.checked)} 
                />
                Internal
              </label>
            </div>
          )}
        </div>
        
        <button className={`chat-send-btn ${isInternal ? 'internal-btn' : ''}`} onClick={handleSend} disabled={sending || (!newMessage.trim() && !file)}>
          {sending ? <div className="spinner" style={{ width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
}

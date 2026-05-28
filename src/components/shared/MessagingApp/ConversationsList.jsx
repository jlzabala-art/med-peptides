import React from 'react';
import { User, Users } from 'lucide-react';
import './MessagingApp.css';

export default function ConversationsList({ conversations, activeConversation, onSelect, currentUserId }) {
  
  const getConvoTitle = (convo) => {
    if (convo.title) return convo.title;
    // For direct chats, return the other person's name
    const otherParticipantId = convo.participants.find(id => id !== currentUserId);
    if (otherParticipantId && convo.participantNames) {
      return convo.participantNames[otherParticipantId] || 'User';
    }
    return 'Chat';
  };

  return (
    <div className="messaging-sidebar">
      <div className="messaging-sidebar-header">
        Messages
      </div>
      <div className="convo-list">
        {conversations.map(convo => {
          const isActive = activeConversation?.id === convo.id;
          const title = getConvoTitle(convo);
          return (
            <div 
              key={convo.id} 
              className={`convo-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelect(convo)}
            >
              <div className="convo-avatar" style={{ backgroundColor: convo.type === 'direct' ? '#1a73e8' : '#8b5cf6' }}>
                {convo.type === 'direct' ? <User size={20} /> : <Users size={20} />}
              </div>
              <div className="convo-info">
                <div className="convo-title">{title}</div>
                <div className="convo-preview">{convo.lastMessage || 'No messages yet'}</div>
              </div>
            </div>
          );
        })}
        {conversations.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#9aa0a6', fontSize: '0.9rem' }}>
            No active conversations
          </div>
        )}
      </div>
    </div>
  );
}

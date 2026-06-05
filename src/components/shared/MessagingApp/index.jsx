import React, { useState, useEffect } from 'react';
import { messagingService } from '../../../services/messagingService';
import ConversationsList from './ConversationsList';
import ChatWindow from './ChatWindow';
import './MessagingApp.css';

export default function MessagingApp({ currentUser }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);

  useEffect(() => {
    if (!currentUser || !currentUser.uid) return;

    messagingService.updateUserPresence(currentUser.uid, true);

    const handleUnload = () => {
      messagingService.updateUserPresence(currentUser.uid, false);
    };
    window.addEventListener('beforeunload', handleUnload);

    const unsubscribe = messagingService.subscribeToConversations(currentUser.uid, (convos) => {
      setConversations(convos);
      if (!activeConversation && convos.length > 0) {
        setActiveConversation(convos[0]);
      } else if (activeConversation) {
        const updated = convos.find(c => c.id === activeConversation.id);
        if (updated) setActiveConversation(updated);
      }
    });

    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', handleUnload);
      messagingService.updateUserPresence(currentUser.uid, false);
    };
  }, [currentUser]);

  if (!currentUser) return null;

  const handleSelectConversation = (convo) => {
    setActiveConversation(convo);
  };

  return (
    <div className="messaging-app-container">
      {/* Mobile-only tab bar (hidden on desktop via CSS) */}
      <div className="messaging-mobile-tabs">
        <div
          className={`messaging-mobile-tab ${!activeConversation ? 'active' : ''}`}
          onClick={() => setActiveConversation(null)}
        >
          Conversations
          {conversations.length > 0 && (
            <span className="messaging-mobile-tab-badge">{conversations.length}</span>
          )}
        </div>
        <div className={`messaging-mobile-tab ${activeConversation ? 'active' : ''}`}>
          {activeConversation ? (activeConversation.title || 'Chat') : 'Chat'}
        </div>
      </div>

      {/* Panels row: desktop = side by side, mobile = one at a time */}
      <div className="messaging-panels-row">
        <div className={`messaging-panel messaging-sidebar-panel ${activeConversation ? 'mobile-hidden' : 'mobile-visible'}`}>
          <ConversationsList
            conversations={conversations}
            activeConversation={activeConversation}
            onSelect={handleSelectConversation}
            currentUserId={currentUser.uid}
          />
        </div>
        <div className={`messaging-panel messaging-chat-panel ${!activeConversation ? 'mobile-hidden' : 'mobile-visible'}`}>
          <ChatWindow
            conversation={activeConversation}
            currentUserId={currentUser.uid}
            currentUserRole={currentUser.role}
            onBack={() => setActiveConversation(null)}
          />
        </div>
      </div>
    </div>
  );
}

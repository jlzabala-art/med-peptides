import React, { useState, useEffect } from 'react';
import { messagingService } from '../../../services/messagingService';
import ConversationsList from './ConversationsList';
import ChatWindow from './ChatWindow';
import ConversationContextPanel from './ConversationContextPanel';
import './MessagingApp.css';

export default function MessagingApp({ currentUser }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [mobileView, setMobileView] = useState('list'); // 'list', 'chat', 'context'

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
        // We do not auto-select on mobile so they don't get stuck in chat
        if (window.innerWidth > 768) {
          setActiveConversation(convos[0]);
          setMobileView('chat');
        }
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
  }, [currentUser]); // eslint-disable-line

  if (!currentUser) return null;

  const handleSelectConversation = (convo) => {
    setActiveConversation(convo);
    setMobileView('chat');
  };

  const handleBackToList = () => {
    setActiveConversation(null);
    setMobileView('list');
  };

  const toggleContextPanel = () => {
    setMobileView(mobileView === 'context' ? 'chat' : 'context');
  };

  return (
    <div className="messaging-app-container">
      {/* Mobile-only tab bar (hidden on desktop via CSS) */}
      <div className="messaging-mobile-tabs">
        <div
          className={`messaging-mobile-tab ${mobileView === 'list' ? 'active' : ''}`}
          onClick={handleBackToList}
        >
          Conversations
          {conversations.length > 0 && (
            <span className="messaging-mobile-tab-badge">{conversations.length}</span>
          )}
        </div>
        <div 
          className={`messaging-mobile-tab ${mobileView === 'chat' ? 'active' : ''}`}
          onClick={() => activeConversation && setMobileView('chat')}
          style={{ opacity: activeConversation ? 1 : 0.5 }}
        >
          {activeConversation ? (activeConversation.title || 'Chat') : 'Chat'}
        </div>
        <div 
          className={`messaging-mobile-tab ${mobileView === 'context' ? 'active' : ''}`}
          onClick={() => activeConversation && setMobileView('context')}
          style={{ opacity: activeConversation ? 1 : 0.5 }}
        >
          Info
        </div>
      </div>

      {/* Panels row: desktop = side by side, mobile = one at a time */}
      <div className="messaging-panels-row">
        <div className={`messaging-panel messaging-sidebar-panel ${(mobileView !== 'list') ? 'mobile-hidden' : 'mobile-visible'}`}>
          <ConversationsList
            conversations={conversations}
            activeConversation={activeConversation}
            onSelect={handleSelectConversation}
            currentUserId={currentUser.uid}
          />
        </div>
        <div className={`messaging-panel messaging-chat-panel ${(mobileView !== 'chat') ? 'mobile-hidden' : 'mobile-visible'}`}>
          <ChatWindow
            conversation={activeConversation}
            currentUserId={currentUser.uid}
            currentUserRole={currentUser.role}
            onBack={handleBackToList}
            onToggleContext={toggleContextPanel}
          />
        </div>
        <div className={`messaging-panel messaging-context-panel ${(mobileView !== 'context') ? 'mobile-hidden' : 'mobile-visible'}`}>
           <ConversationContextPanel 
             conversation={activeConversation}
             currentUserRole={currentUser.role}
           />
        </div>
      </div>
    </div>
  );
}

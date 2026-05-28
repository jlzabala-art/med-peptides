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

    // Track presence
    messagingService.updateUserPresence(currentUser.uid, true);

    const handleUnload = () => {
      messagingService.updateUserPresence(currentUser.uid, false);
    };
    window.addEventListener('beforeunload', handleUnload);

    // Subscribe to conversations
    const unsubscribe = messagingService.subscribeToConversations(currentUser.uid, (convos) => {
      setConversations(convos);
      // If we don't have an active conversation, but we have convos, select the first one
      if (!activeConversation && convos.length > 0) {
        setActiveConversation(convos[0]);
      } else if (activeConversation) {
        // Update active conversation reference if data changed
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

  return (
    <div className="messaging-app-container">
      <ConversationsList 
        conversations={conversations} 
        activeConversation={activeConversation}
        onSelect={setActiveConversation}
        currentUserId={currentUser.uid}
      />
      <ChatWindow 
        conversation={activeConversation}
        currentUserId={currentUser.uid}
        currentUserRole={currentUser.role}
      />
    </div>
  );
}

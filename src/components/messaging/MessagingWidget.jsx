import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Users, Search, Plus } from 'lucide-react';
import ConversationThread from './ConversationThread';

export default function MessagingWidget({ role, ownerId }) {
  const { user, isAdmin, userRole } = useAuth();
  const effectiveRole = role || userRole;
  const effectiveId = ownerId || user?.uid;
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConvId, setActiveConvId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatName, setNewChatName] = useState('');

  useEffect(() => {
    if (!user) return;
    
    // In a real app, query by `participants array-contains user.uid` or if isAdmin get all.
    // We'll do a simple query for now.
    // Lógica Jerárquica: Si es admin ve todo.
    // Si no es admin, filtramos por participants (array-contains effectiveId)
    const q = (effectiveRole === 'admin' || isAdmin)
      ? query(collection(db, 'conversations'), orderBy('lastMessageAt', 'desc'))
      : query(collection(db, 'conversations'), where('participants', 'array-contains', effectiveId), orderBy('lastMessageAt', 'desc'));
      
    const unsub = onSnapshot(q, (snap) => {
      const convs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConversations(convs);
      setLoading(false);
    });

    return () => unsub();
  }, [user, isAdmin]);

  const filtered = conversations.filter(c => 
    c.id.includes(searchTerm) || 
    (c.lastMessage || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.groupName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeConv = conversations.find(c => c.id === activeConvId);

  const handleCreateGroup = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newChatName.trim()) return;

    try {
      const docRef = await addDoc(collection(db, 'conversations'), {
        type: 'direct',
        groupName: newChatName.trim(),
        participants: [effectiveId], // In a real flow, you'd select participants from a modal
        createdAt: serverTimestamp(),
        lastMessage: 'Conversation started',
        lastMessageAt: serverTimestamp(),
        status: 'open',
        unreadCount: {}
      });
      setActiveConvId(docRef.id);
      setShowNewChat(false);
      setNewChatName('');
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)', gap: '1rem' }}>
      {/* Sidebar: Inbox */}
      <div style={{ width: '320px', background: 'var(--color-bg-surface)', borderRadius: '12px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Messages</h2>
            <button onClick={() => setShowNewChat(!showNewChat)} style={{ background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem', cursor: 'pointer' }} title="New Conversation">
              <Plus size={16} />
            </button>
          </div>
          {showNewChat && (
            <form onSubmit={handleCreateGroup} style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                placeholder="Enter name or topic..." 
                value={newChatName}
                onChange={(e) => setNewChatName(e.target.value)}
                style={{ flex: 1, padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.8rem' }}
                autoFocus
              />
              <button type="submit" style={{ background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', cursor: 'pointer' }}>Start</button>
            </form>
          )}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.4rem 0.4rem 0.4rem 2rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.8rem' }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>No conversations found.</div>
          ) : (
            filtered.map(c => {
              const isUnread = c.unreadCount?.[effectiveId] > 0;
              return (
                <div 
                  key={c.id} 
                  onClick={() => setActiveConvId(c.id)}
                  style={{ 
                    padding: '1rem', 
                    borderBottom: '1px solid var(--color-border)', 
                    cursor: 'pointer',
                    background: activeConvId === c.id ? 'rgba(99,102,241,0.05)' : isUnread ? 'rgba(99,102,241,0.02)' : 'transparent',
                    borderLeft: activeConvId === c.id ? '3px solid var(--color-primary)' : isUnread ? '3px solid #f59e0b' : '3px solid transparent'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <div style={{ fontWeight: isUnread ? 800 : 600, fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                      {c.type === 'group' ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Users size={12}/> {c.groupName || 'Group'}</span>
                      ) : c.type === 'order_support' ? (
                        `Order #${c.referenceId?.slice(0,6)}`
                      ) : (
                        c.type === 'product_inquiry' ? `SKU Inquiry` : 'Direct Chat'
                      )}
                    </div>
                    {c.lastMessageAt && (
                      <div style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)' }}>
                        {c.lastMessageAt?.toDate ? c.lastMessageAt.toDate().toLocaleDateString() : ''}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: isUnread ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: isUnread ? 600 : 400 }}>
                    {c.lastMessage || 'No messages yet'}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {activeConvId ? (
          <ConversationThread 
            conversationId={activeConvId} 
            conversationType={activeConv?.type} 
            referenceId={activeConv?.referenceId}
            onResolved={activeConv?.status !== 'resolved' ? async () => {
              await updateDoc(doc(db, 'conversations', activeConvId), { status: 'resolved' });
            } : null}
          />
        ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', background: 'var(--color-bg-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            <MessageSquare size={48} strokeWidth={1} style={{ marginBottom: '1rem' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Select a conversation</div>
            <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>or start a new message.</div>
          </div>
        )}
      </div>
    </div>
  );
}

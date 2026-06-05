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
import { MessageSquare, Users, Search, Plus, ArrowLeft } from 'lucide-react';
import ConversationThread from './ConversationThread';

const mobileStyles = `
  .mw-tabs { display: none; }
  .mw-panels { display: flex; flex: 1; gap: 1rem; overflow: hidden; min-height: 0; }
  .mw-sidebar {
    width: 320px; flex-shrink: 0;
    background: var(--color-bg-surface);
    border-radius: 12px;
    border: 1px solid var(--color-border);
    display: flex; flex-direction: column; overflow: hidden;
  }
  .mw-chat { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .mw-back-btn { display: none; }

  @media (max-width: 768px) {
    .mw-tabs {
      display: flex;
      border-bottom: 2px solid #e2e8f0;
      background: var(--color-bg-surface);
      border-radius: 12px 12px 0 0;
      flex-shrink: 0;
    }
    .mw-tab {
      flex: 1; padding: 0.75rem 1rem; text-align: center;
      font-size: 0.9rem; font-weight: 500; color: #64748b;
      cursor: pointer; border-bottom: 3px solid transparent;
      transition: all 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 0.4rem;
    }
    .mw-tab.active {
      color: var(--color-primary, #2563eb);
      border-bottom-color: var(--color-primary, #2563eb);
      font-weight: 600;
    }
    .mw-tab-badge {
      background: var(--color-primary, #2563eb); color: #fff;
      border-radius: 10px; padding: 0 6px; font-size: 0.7rem;
      min-width: 18px; height: 18px;
      display: inline-flex; align-items: center; justify-content: center;
    }
    .mw-panels {
      flex-direction: column; gap: 0;
      border-radius: 0 0 12px 12px; overflow: hidden;
    }
    .mw-sidebar { width: 100%; border-radius: 0; border-top: none; }
    .mw-panel-hidden { display: none !important; }
    .mw-back-btn {
      display: flex !important; align-items: center; gap: 0.4rem;
      background: none; border: none;
      color: var(--color-primary, #2563eb);
      font-size: 0.85rem; cursor: pointer; padding: 0.5rem 0;
      font-weight: 500;
    }
  }
`;

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
    const q = (effectiveRole === 'admin' || isAdmin)
      ? query(collection(db, 'conversations'), orderBy('lastMessageAt', 'desc'))
      : query(collection(db, 'conversations'), where('participants', 'array-contains', effectiveId), orderBy('lastMessageAt', 'desc'));

    const unsub = onSnapshot(q, (snap) => {
      setConversations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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
        participants: [effectiveId],
        createdAt: serverTimestamp(),
        lastMessage: 'Conversation started',
        lastMessageAt: serverTimestamp(),
        status: 'open',
        unreadCount: {}
      });
      setActiveConvId(docRef.id);
      setShowNewChat(false);
      setNewChatName('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectConv = (id) => setActiveConvId(id);
  const handleBack = () => setActiveConvId(null);

  const activeConvName = activeConv?.groupName ||
    (activeConv?.type === 'order_support' ? `Order #${activeConv?.referenceId?.slice(0,6)}` : 'Chat');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <style>{mobileStyles}</style>

      {/* Mobile tab bar */}
      <div className="mw-tabs">
        <div className={`mw-tab ${!activeConvId ? 'active' : ''}`} onClick={handleBack}>
          Conversations
          {conversations.length > 0 && (
            <span className="mw-tab-badge">{conversations.length}</span>
          )}
        </div>
        <div className={`mw-tab ${activeConvId ? 'active' : ''}`}>
          {activeConvId ? activeConvName : 'Chat'}
        </div>
      </div>

      {/* Panels */}
      <div className="mw-panels">

        {/* ── Sidebar ── */}
        <div className={`mw-sidebar ${activeConvId ? 'mw-panel-hidden' : ''}`}>
          {/* Header */}
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Messages</h2>
              <button
                onClick={() => setShowNewChat(v => !v)}
                style={{ background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem', cursor: 'pointer' }}
                title="New Conversation"
              >
                <Plus size={16} />
              </button>
            </div>

            {showNewChat && (
              <form onSubmit={handleCreateGroup} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Enter name or topic..."
                  value={newChatName}
                  onChange={e => setNewChatName(e.target.value)}
                  style={{ flex: 1, padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.8rem' }}
                  autoFocus
                />
                <button type="submit" style={{ background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                  Start
                </button>
              </form>
            )}

            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.4rem 0.4rem 0.4rem 2rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.8rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Conversation list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>Loading...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>No conversations found.</div>
            ) : (
              filtered.map(c => {
                const isUnread = c.unreadCount?.[effectiveId] > 0;
                const isActive = activeConvId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectConv(c.id)}
                    style={{
                      padding: '1rem',
                      borderBottom: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      background: isActive ? 'rgba(99,102,241,0.05)' : isUnread ? 'rgba(99,102,241,0.02)' : 'transparent',
                      borderLeft: isActive ? '3px solid var(--color-primary)' : isUnread ? '3px solid #f59e0b' : '3px solid transparent'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <div style={{ fontWeight: isUnread ? 800 : 600, fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                        {c.type === 'group' ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Users size={12} /> {c.groupName || 'Group'}</span>
                        ) : c.type === 'order_support' ? (
                          `Order #${c.referenceId?.slice(0, 6)}`
                        ) : c.type === 'product_inquiry' ? 'SKU Inquiry' : 'Direct Chat'}
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

        {/* ── Chat Area ── */}
        <div className={`mw-chat ${!activeConvId ? 'mw-panel-hidden' : ''}`}>
          {activeConvId ? (
            <>
              {/* Mobile back button */}
              <button className="mw-back-btn" onClick={handleBack}>
                <ArrowLeft size={14} /> Back to conversations
              </button>
              <div style={{ flex: 1, minHeight: 0 }}>
                <ConversationThread
                  conversationId={activeConvId}
                  conversationType={activeConv?.type}
                  referenceId={activeConv?.referenceId}
                  onResolved={activeConv?.status !== 'resolved' ? async () => {
                    const { updateDoc, doc } = await import('firebase/firestore');
                    await updateDoc(doc(db, 'conversations', activeConvId), { status: 'resolved' });
                  } : null}
                />
              </div>
            </>
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', background: 'var(--color-bg-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
              <MessageSquare size={48} strokeWidth={1} style={{ marginBottom: '1rem' }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Select a conversation</div>
              <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>or start a new message.</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

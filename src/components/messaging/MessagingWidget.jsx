import MessageSquare from "lucide-react/dist/esm/icons/message-square";
import Users from "lucide-react/dist/esm/icons/users";
import Search from "lucide-react/dist/esm/icons/search";
import Plus from "lucide-react/dist/esm/icons/plus";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
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

  @media (max-width: 1023px) {
    .mw-panels {
      flex-direction: column; gap: 0;
      border-radius: 12px; overflow: hidden;
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
  // Admin User Search state
  const [allUsers, setAllUsers] = useState([]);
  useEffect(() => {
    if (showNewChat && (isAdmin || effectiveRole === 'admin') && allUsers.length === 0) {
      import('firebase/firestore').then(({ collection, getDocs, query }) => {
        getDocs(query(collection(db, 'users'))).then(snap => {
          setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
      });
    }
  }, [showNewChat, isAdmin, effectiveRole, allUsers.length]);

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
        type: 'group',
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

  const handleStartDirectChat = async (targetUser) => {
    try {
      // Create new direct conversation
      const myName = user?.displayName || user?.email || 'Admin';
      const docRef = await addDoc(collection(db, 'conversations'), {
        type: 'direct',
        groupName: '', // Handled dynamically
        participants: [effectiveId, targetUser.id],
        participantNames: {
          [effectiveId]: myName,
          [targetUser.id]: targetUser.name || targetUser.email || 'User'
        },
        participantRoles: {
          [targetUser.id]: targetUser.role || 'user'
        },
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

            {showNewChat && (isAdmin || effectiveRole === 'admin') ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Search user by name or email..."
                  value={newChatName}
                  onChange={e => setNewChatName(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.8rem' }}
                  autoFocus
                />
                {newChatName.trim().length > 0 && (
                  <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '6px', background: 'var(--color-bg-surface)' }}>
                    {allUsers.filter(u => 
                      u.id !== effectiveId && (
                        (u.name || '').toLowerCase().includes(newChatName.toLowerCase()) || 
                        (u.email || '').toLowerCase().includes(newChatName.toLowerCase())
                      )
                    ).map(u => (
                      <div 
                        key={u.id}
                        onClick={() => handleStartDirectChat(u)}
                        style={{ padding: '0.5rem', borderBottom: '1px solid var(--color-border)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', flexDirection: 'column' }}
                      >
                        <div style={{ fontWeight: 600 }}>{u.name || 'Unknown'} <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.7rem', textTransform: 'uppercase', marginLeft: '0.3rem' }}>({u.role || 'user'})</span></div>
                        <div style={{ color: 'var(--color-text-tertiary)' }}>{u.email}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : showNewChat && (
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
                        ) : c.type === 'product_inquiry' ? (
                          'SKU Inquiry'
                        ) : (
                          c.participantNames 
                            ? Object.entries(c.participantNames).find(([id]) => id !== effectiveId)?.[1] || 'Direct Chat'
                            : 'Direct Chat'
                        )}
                      </div>
                      {c.lastMessageAt && (
                        <div style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)' }}>
                          {c.lastMessageAt?.toDate ? c.lastMessageAt.toDate().toLocaleDateString() : ''}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '0.75rem', color: isUnread ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: isUnread ? 600 : 400 }}>
                        {c.lastMessage || 'No messages yet'}
                      </div>
                      {isUnread && (
                        <span style={{
                          background: '#f59e0b',
                          color: 'white',
                          borderRadius: '999px',
                          padding: '0 0.4rem',
                          fontSize: '0.6rem',
                          marginLeft: '0.5rem'
                        }}>
                          {c.unreadCount?.[effectiveId]}
                        </span>
                      )}
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
import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, CheckCircle2, AlertTriangle, Clock, Paperclip, Mic, ArrowRight,
  TrendingUp, Activity, Link2, Plus, Users, Building, ShoppingCart, Box,
  MessageSquare, FileText, Bot, Zap, ArrowLeft, MoreVertical, X, ShieldAlert,
  Calendar as CalendarIcon, ListTodo, Send, Copy, ThumbsUp, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { messagingService } from '../../services/messagingService';
import { generateThreadInsights } from '../../services/adminAiService';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function AtlasMessagesHub() {
  const { user } = useAuth();
  
  // UI States
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [mobileView, setMobileView] = useState('inbox'); // 'inbox', 'thread', 'context'
  const [replyText, setReplyText] = useState('');

  // Data States
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  
  // AI States
  const [aiInsights, setAiInsights] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1. Fetch Conversations
  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = messagingService.subscribeToConversations(user.uid, (data) => {
      const formatted = data.map(d => ({
        ...d,
        entityName: Object.values(d.participantNames || {}).find(n => n !== user.displayName) || 'Unknown User',
        entityType: d.type || 'direct',
        avatar: (Object.values(d.participantNames || {}).find(n => n !== user.displayName) || 'U').charAt(0).toUpperCase(),
        color: '#0ea5e9', // Could be dynamic based on role
        time: d.updatedAt ? new Date(d.updatedAt?.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Now'
      }));
      setThreads(formatted);
      if (!activeThreadId && formatted.length > 0) {
        setActiveThreadId(formatted[0].id);
      }
    });
    return () => unsubscribe();
  }, [user, activeThreadId]);

  // 2. Fetch Messages and Generate AI Insights
  useEffect(() => {
    if (!activeThreadId) return;
    const activeThread = threads.find(t => t.id === activeThreadId);
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAiLoading(true);
    setAiInsights(null);

    const unsubscribe = messagingService.subscribeToMessages(activeThreadId, async (msgs) => {
      setMessages(msgs);
      
      if (msgs.length > 0 && activeThread) {
        const threadText = msgs.slice(-15).map(m => m.text).join('\n');
        const insights = await generateThreadInsights(threadText, activeThread.entityName);
        setAiInsights(insights);
        setIsAiLoading(false);
      } else {
        setIsAiLoading(false);
      }
    });
    return () => unsubscribe();
  }, [activeThreadId, threads]); 

  const activeThread = threads.find(t => t.id === activeThreadId);

  const handleThreadSelect = (id) => {
    setActiveThreadId(id);
    if (isMobile) setMobileView('thread');
  };

  // 3. Convert To Workflows
  const executeAction = async (actionType) => {
    if (!user || !activeThread) return;
    toast.loading(`Creating ${actionType}...`, { id: 'action-toast' });
    try {
        const collectionMap = {
            'Task': 'tasks',
            'RFQ': 'rfqs',
            'Issue': 'issues',
            'Event': 'events'
        };
        const colName = collectionMap[actionType];
        
        await addDoc(collection(db, colName), {
            sourceThreadId: activeThreadId,
            createdBy: user.uid,
            entityName: activeThread.entityName,
            status: 'Open',
            createdAt: serverTimestamp(),
            context: aiInsights?.aiSummary || 'Created from Atlas Messages Hub'
        });
        
        // Add a system message to the thread
        await messagingService.sendMessage(activeThreadId, 'system', `${actionType} created by ${user.displayName}`, 'system');
        
        toast.success(`${actionType} created successfully!`, { id: 'action-toast' });
    } catch (error) {
        console.error(e);
        toast.error(`Failed to create ${actionType}`, { id: 'action-toast' });
    }
  };

  // 4. Send Message Workflow
  const handleSend = async () => {
    if (!replyText.trim() || !activeThreadId || !user) return;
    try {
      const textToSend = replyText;
      setReplyText(''); // clear early for UX
      await messagingService.sendMessage(activeThreadId, user.uid, textToSend);
    } catch (err) {
      console.error('Error starting conversation:', err);
    }
  };

  const handleAiReplySelect = (text) => {
    setReplyText(text);
  };

  // --- SUBCOMPONENTS ---

  const renderLeftPanel = () => (
    <div style={{ width: isMobile ? '100%' : '25%', borderRight: isMobile ? 'none' : '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', background: '#fff', height: '100%' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Priority Inbox</h2>
          <button style={{ background: '#f1f5f9', border: 'none', width: 32, height: 32, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Filter size={16} color="#64748b" />
          </button>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 10 }} />
          <input 
            type="text" 
            placeholder="Search AI threads..." 
            style={{ width: '100%', padding: '8px 12px 8px 36px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
          />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {threads.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
            No conversations yet.
          </div>
        ) : (
          threads.map(thread => (
            <div 
              key={thread.id} 
              onClick={() => handleThreadSelect(thread.id)}
              style={{ 
                padding: '16px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                background: activeThreadId === thread.id && !isMobile ? '#f8fafc' : '#fff',
                borderLeft: activeThreadId === thread.id && !isMobile ? '3px solid #0f172a' : '3px solid transparent'
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: thread.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px', flexShrink: 0 }}>
                  {thread.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{thread.entityName}</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{thread.time}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '8px' }}>
                      {thread.lastMessage || 'No messages'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderCenterPanel = () => {
    if (!activeThread) {
      return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
          <div style={{ color: '#94a3b8', fontSize: '14px' }}>Select a conversation to start messaging</div>
        </div>
      );
    }

    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc', height: '100%', position: 'relative' }}>
        {/* Header */}
        <div style={{ height: '64px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isMobile && (
              <button onClick={() => setMobileView('inbox')} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', marginLeft: '-8px' }}>
                <ArrowLeft size={20} color="#0f172a" />
              </button>
            )}
            <div style={{ width: 36, height: 36, borderRadius: '8px', background: activeThread.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
              {activeThread.avatar}
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{activeThread.entityName}</div>
              <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} /> Active
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isMobile && (
              <button onClick={() => setMobileView('context')} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <Bot size={14} /> AI Context
              </button>
            )}
            {!isMobile && (
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <MoreVertical size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Timeline Feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map(item => {
            const timeStr = item.createdAt ? new Date(item.createdAt.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now';
            if (item.type === 'system') {
              return (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                    <Activity size={14} color={'#64748b'} />
                    <span style={{ fontWeight: 600, color: '#334155' }}>{item.text}</span> • {timeStr}
                  </div>
                </div>
              );
            } else {
              const isMe = item.senderId === user?.uid;
              return (
                <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', maxWidth: '80%' }}>
                    {!isMe && <div style={{ width: 28, height: 28, borderRadius: '50%', background: activeThread.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>{activeThread.avatar}</div>}
                    <div style={{ background: isMe ? '#0f172a' : '#fff', color: isMe ? '#fff' : '#0f172a', padding: '12px 16px', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', border: isMe ? 'none' : '1px solid #e2e8f0', fontSize: '14px', lineHeight: 1.5, boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                      {item.text}
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', padding: isMe ? '0 4px 0 0' : '0 0 0 40px' }}>
                    {timeStr}
                  </div>
                </div>
              );
            }
          })}
        </div>

        {/* AI Assistant Bar Inline */}
        {aiInsights?.suggestedReplies && aiInsights.suggestedReplies.length > 0 && (
          <div style={{ padding: '0 24px' }}>
            <div style={{ background: 'linear-gradient(to right, #f8fafc, #f1f5f9)', border: '1px solid #e2e8f0', borderRadius: '12px 12px 0 0', padding: '12px', display: 'flex', gap: '8px', overflowX: 'auto' }} className="hide-scrollbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginRight: '8px' }}>
                <Bot size={14} /> AI Replies
              </div>
              {aiInsights.suggestedReplies.map((reply, idx) => (
                <button key={idx} onClick={() => handleAiReplySelect(reply)} style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Composer */}
        <div style={{ padding: '16px 24px 24px 24px', background: '#f8fafc' }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '8px', display: 'flex', alignItems: 'flex-end', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <button style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <Plus size={20} />
            </button>
            <textarea 
              placeholder="Reply or type / for AI commands..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              style={{ flex: 1, border: 'none', resize: 'none', outline: 'none', maxHeight: '120px', minHeight: '40px', padding: '10px', fontSize: '14px', color: '#0f172a' }}
              rows={1}
            />
            <div style={{ display: 'flex', gap: '4px', paddingBottom: '2px', paddingRight: '2px' }}>
              <button style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <Mic size={18} />
              </button>
              <button onClick={handleSend} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRightContextPanel = () => {
    if (!activeThread) {
      return (
        <div style={{ width: isMobile ? '100%' : '25%', borderLeft: isMobile ? 'none' : '1px solid #e2e8f0', background: '#fff', height: '100%' }} />
      );
    }

    return (
      <div style={{ width: isMobile ? '100%' : '25%', borderLeft: isMobile ? 'none' : '1px solid #e2e8f0', background: '#fff', height: '100%', overflowY: 'auto' }}>
        {isMobile && (
          <div style={{ height: '64px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '12px' }}>
            <button onClick={() => setMobileView('thread')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', marginLeft: '-8px' }}>
              <ArrowLeft size={20} color="#0f172a" />
            </button>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>AI Context</div>
          </div>
        )}

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Entity Card */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '16px', background: activeThread.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>
              {activeThread.avatar}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>{activeThread.entityName}</div>
            <div style={{ fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginTop: '4px' }}>{activeThread.entityType}</div>
          </div>

          {/* Action Convert To */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>Convert Thread To</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button onClick={() => executeAction('Task')} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}><ListTodo size={14} /> Task</button>
              <button onClick={() => executeAction('RFQ')} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}><FileText size={14} /> RFQ</button>
              <button onClick={() => executeAction('Issue')} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}><ShieldAlert size={14} /> Issue</button>
              <button onClick={() => executeAction('Event')} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}><CalendarIcon size={14} /> Event</button>
            </div>
          </div>

          {/* AI Summary */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Bot size={16} color="#0f172a" />
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>Atlas Summary</div>
            </div>
            {isAiLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px' }}>
                <Loader2 size={14} className="animate-spin" /> Generating insights...
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                {aiInsights?.aiSummary || 'Start chatting to generate an AI summary.'}
              </div>
            )}
          </div>

          {/* Health Score */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>Communication Health</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${aiInsights?.healthScore || 0}%`, height: '100%', background: (aiInsights?.healthScore || 0) > 80 ? '#10b981' : (aiInsights?.healthScore || 0) > 50 ? '#f59e0b' : '#ef4444', transition: 'width 0.5s ease-out' }} />
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{aiInsights?.healthScore || 0}%</div>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Sentiment: <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{aiInsights?.sentiment || 'Neutral'}</span></div>
          </div>

          {/* Related Records (Mocks for now since pure firestore messages don't easily have cross-collection CRM data inherently attached without complex aggregations) */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>Related Records</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#0f172a', fontWeight: 600, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>
                <Box size={14} color="#64748b" /> Auto-Linked Orders
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden', background: '#fff', margin: '-1rem' }}>
      {isMobile ? (
        <AnimatePresence mode="wait">
          {mobileView === 'inbox' && (
            <motion.div key="inbox" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }} style={{ width: '100%', height: '100%' }}>
              {renderLeftPanel()}
            </motion.div>
          )}
          {mobileView === 'thread' && (
            <motion.div key="thread" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} transition={{ duration: 0.2 }} style={{ width: '100%', height: '100%' }}>
              {renderCenterPanel()}
            </motion.div>
          )}
          {mobileView === 'context' && (
            <motion.div key="context" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} transition={{ duration: 0.2 }} style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 10, background: '#fff' }}>
              {renderRightContextPanel()}
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <>
          {renderLeftPanel()}
          {renderCenterPanel()}
          {renderRightContextPanel()}
        </>
      )}
    </div>
  );
}

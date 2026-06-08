import React, { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  increment
} from 'firebase/firestore';
import { db, storage, uploadBytes, getDownloadURL, ref } from '../../firebase';
import { Send, Package, FileText, CheckCircle2, UploadCloud, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ContextAttachment from './ContextAttachment';

export default function ConversationThread({ conversationId, conversationType, referenceId, onResolved }) {
  const { user, isAdmin, userRole } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const endRef = useRef(null);

  useEffect(() => {
    if (!conversationId) {
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(msgs);
      setLoading(false);
      
      if (user && msgs.length > 0) {
        const convRef = doc(db, 'conversations', conversationId);
        updateDoc(convRef, {
          [`unreadCount.${user.uid}`]: 0
        }).catch(err => console.error("Error marking read:", err));
      }
    });
    return () => unsub();
  }, [conversationId, user]);

  useEffect(() => {
    if (!conversationId) return;
    const convRef = doc(db, 'conversations', conversationId);
    const unsub = onSnapshot(convRef, (snap) => {
      const data = snap.data();
      const typing = (data && data.typing) || {};
      const others = Object.entries(typing).filter(([uid, val]) => uid !== user?.uid && val);
      setTypingUsers(others.map(([uid]) => uid));
    });
    return () => unsub();
  }, [conversationId, user]);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Update typing status
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (user && conversationId) {
        const typingRef = doc(db, 'conversations', conversationId);
        updateDoc(typingRef, { [`typing.${user.uid}`]: false }).catch(()=>{});
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, [inputText, conversationId, user]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (user && conversationId) {
      const typingRef = doc(db, 'conversations', conversationId);
      updateDoc(typingRef, { [`typing.${user.uid}`]: true }).catch(()=>{});
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const storagePath = `attachments/${conversationId}/${file.name}`;
    const fileRef = ref(storage, storagePath);
    try {
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      setPendingAttachments(prev => [...prev, { type: 'file', name: file.name, url: downloadURL }]);
    } catch (err) {
      console.error('File upload error:', err);
    }
  };

  const handleSend = async (e, directText = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const textToSend = directText !== null ? directText : inputText;
    
    if (!textToSend.trim() && pendingAttachments.length === 0) return;
    if (!user || !conversationId) return;

    const content = textToSend.trim();
    const attachmentsToSent = [...pendingAttachments];
    
    setInputText('');
    setPendingAttachments([]);

    try {
      await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
        senderId: user.uid,
        senderRole: isAdmin ? 'admin' : userRole || 'user',
        senderName: user.displayName || user.email || 'User',
        content,
        attachments: attachmentsToSent,
        timestamp: serverTimestamp(),
      });

      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: content || 'Attachment',
        lastMessageAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const quickReplies = [
    'Thanks for reaching out, we will get back soon.',
    'Please provide your order number.',
    'Your request has been escalated to the specialist.',
    'Let me check that for you.',
    'Could you share more details?'
  ];

  const sendQuickReply = async (text) => {
    await handleSend(null, text);
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading messages...</div>;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const textData = e.dataTransfer.getData('text/plain');
    if (textData) {
      if (textData.toLowerCase().includes('sku')) {
        setPendingAttachments(prev => [...prev, {
          type: 'product_card',
          name: 'Dragged product',
          sku: textData.substring(0, 15)
        }]);
      } else {
        setPendingAttachments(prev => [...prev, {
          type: 'proposal',
          title: 'Dragged document',
          content: textData.substring(0, 50)
        }]);
      }
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ 
        display: 'flex', flexDirection: 'column', height: '100%', 
        background: 'var(--color-bg-app)', border: isDragging ? '2px dashed var(--color-primary)' : '1px solid var(--color-border)', 
        borderRadius: '12px', overflow: 'hidden', position: 'relative'
      }}
    >
      {isDragging && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <UploadCloud size={32} color="var(--color-primary)" />
            <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>Drop to attach context</div>
          </div>
        </div>
      )}
      
      <div style={{ padding: '1rem', background: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>
            {conversationType === 'order_support' ? 'B2B Order' : 'Inquiry'} #{referenceId?.slice(0,8)}
          </h3>
          <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>Secure communication</p>
        </div>
        {onResolved && (
          <button onClick={onResolved} style={{ background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '0.3rem 0.6rem', fontSize: '0.7rem', display: 'flex', gap: '0.3rem', alignItems: 'center', cursor: 'pointer' }}>
            <CheckCircle2 size={12} color="var(--color-success)"/> Resolve
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.8rem', marginTop: '2rem' }}>
            No messages in this conversation.<br/>Type below to start.
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === user?.uid;
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', marginBottom: '0.2rem', marginLeft: isMe ? 0 : '0.5rem', marginRight: isMe ? '0.5rem' : 0 }}>
                  {isMe ? 'You' : msg.senderRole === 'admin' ? 'Support / Admin' : msg.senderName}
                </div>
                <div style={{ 
                  background: isMe ? 'var(--color-primary)' : 'var(--color-bg-surface)', 
                  color: isMe ? 'white' : 'var(--color-text-primary)',
                  padding: '0.6rem 0.8rem', 
                  borderRadius: '12px', 
                  borderBottomRightRadius: isMe ? '2px' : '12px',
                  borderBottomLeftRadius: isMe ? '12px' : '2px',
                  border: isMe ? 'none' : '1px solid var(--color-border)',
                  maxWidth: '85%',
                  fontSize: '0.85rem',
                  lineHeight: 1.4
                }}>
                  {msg.content}
                </div>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.2rem', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                    {msg.attachments.map((att, i) => <ContextAttachment key={i} attachment={att} />)}
                  </div>
                )}
                {isMe && idx === messages.length - 1 && (
                    <div style={{ fontSize: '0.6rem', display: 'flex', alignItems: 'center', marginTop: '2px', color: 'var(--color-text-tertiary)' }}>
                        Sent <Check size={10} style={{ marginLeft: '2px' }} />
                    </div>
                )}
              </div>
            );
          })
        )}
        <div ref={endRef} />
        {typingUsers.length > 0 && (
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
            Someone is typing...
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '0.75rem', background: 'var(--color-bg-surface)', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        
        {pendingAttachments.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', padding: '0.5rem', background: 'var(--color-bg-app)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', width: '100%' }}>Pending attachments:</div>
            {pendingAttachments.map((att, i) => (
              <div key={i} style={{ fontSize: '0.75rem', background: 'white', padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {att.type === 'product_card' ? <Package size={12}/> : <FileText size={12}/>}
                {att.name || att.title}
                <button type="button" onClick={() => setPendingAttachments(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }}>&times;</button>
              </div>
            ))}
          </div>
        )}

        {/* Quick replies (admin only) */}
        {isAdmin && (
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
            {quickReplies.map((qr, i) => (
              <button
                key={i}
                type="button"
                onClick={() => sendQuickReply(qr)}
                style={{
                  background: 'var(--color-bg-app)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  padding: '0.3rem 0.6rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {qr}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button type="button" onClick={() => {
            const sku = prompt("Enter SKU to attach context:");
            if (sku) setPendingAttachments(prev => [...prev, { type: 'product_card', name: 'Attached product', sku }]);
          }} title="Adjuntar documento / SKU" style={{ background: 'transparent', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', padding: '0.3rem' }}>
            <FileText size={18} />
          </button>
          
          <input type="file" id="fileUpload" style={{ display: 'none' }} onChange={handleFileSelect} />
          <button type="button" onClick={() => document.getElementById('fileUpload').click()} title="Adjuntar archivo" style={{ background: 'transparent', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', padding: '0.3rem' }}>
            <UploadCloud size={18} />
          </button>
          
          <input 
            type="text" 
            placeholder={pendingAttachments.length > 0 ? "Add a message to your attachments..." : "Type a message..."}
            value={inputText}
            onChange={handleInputChange}
            style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: '20px', border: '1px solid var(--color-border)', background: 'var(--color-bg-app)', fontSize: '0.85rem' }}
          />
          
          <button type="submit" disabled={!inputText.trim() && pendingAttachments.length === 0} style={{ background: 'var(--color-primary)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (inputText.trim() || pendingAttachments.length > 0) ? 'pointer' : 'not-allowed', opacity: (inputText.trim() || pendingAttachments.length > 0) ? 1 : 0.5 }}>
            <Send size={16} style={{ marginLeft: '-2px' }}/>
          </button>
        </form>
      </div>
    </div>
  );
}

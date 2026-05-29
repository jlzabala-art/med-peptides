import React, { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from '../../firebase';
import { Send, Package, FileText, CheckCircle2, UploadCloud } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ContextAttachment from './ContextAttachment';

export default function ConversationThread({ conversationId, conversationType, referenceId, onResolved }) {
  const { user, isAdmin, isPhysician, userRole } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState([]);
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
      const msgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setLoading(false);
      
      // Mark as read for current user
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
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !user || !conversationId) return;

    const content = inputText.trim();
    const attachmentsToSent = [...pendingAttachments];
    
    setInputText('');
    setPendingAttachments([]);

    try {
      await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
        senderId: user.uid,
        senderRole: isAdmin ? 'admin' : userRole || 'user',
        senderName: user.displayName || user.email || 'Usuario',
        content,
        attachments: attachmentsToSent,
        timestamp: serverTimestamp(),
      });

      // Update conversation lastMessage
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: content,
        lastMessageAt: serverTimestamp(),
        // For vertical communication, if admin sends, increase clinic's unread, else increase admin's unread
        // (Simplified for now, real implementation would increment the other participant's counter)
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando mensajes...</div>;

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
    
    // Check if it's text/html (like dragging a product card)
    const htmlData = e.dataTransfer.getData('text/html');
    const textData = e.dataTransfer.getData('text/plain');
    
    // Very naive extraction of product info from dragged text
    if (textData) {
      // Simulate creating a product context from drag
      if (textData.toLowerCase().includes('sku')) {
        setPendingAttachments(prev => [...prev, {
          type: 'product_card',
          name: 'Producto arrastrado',
          sku: textData.substring(0, 15)
        }]);
      } else {
        setPendingAttachments(prev => [...prev, {
          type: 'proposal',
          title: 'Documento arrastrado',
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
            <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>Suelta para adjuntar contexto</div>
          </div>
        </div>
      )}
      
      {/* Header Context */}
      <div style={{ padding: '1rem', background: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>
            {conversationType === 'order_support' ? 'Pedido B2B' : 'Consulta'} #{referenceId?.slice(0,8)}
          </h3>
          <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>Comunicación segura</p>
        </div>
        {onResolved && (
          <button onClick={onResolved} style={{ background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '0.3rem 0.6rem', fontSize: '0.7rem', display: 'flex', gap: '0.3rem', alignItems: 'center', cursor: 'pointer' }}>
            <CheckCircle2 size={12} color="var(--color-success)"/> Resolver
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.8rem', marginTop: '2rem' }}>
            No hay mensajes en esta conversación.<br/>Escribe abajo para iniciar.
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderId === user?.uid;
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', marginBottom: '0.2rem', marginLeft: isMe ? 0 : '0.5rem', marginRight: isMe ? '0.5rem' : 0 }}>
                  {isMe ? 'Tú' : msg.senderRole === 'admin' ? 'Soporte / Admin' : msg.senderName}
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
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '0.75rem', background: 'var(--color-bg-surface)', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        
        {pendingAttachments.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', padding: '0.5rem', background: 'var(--color-bg-app)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', width: '100%' }}>Adjuntos pendientes:</div>
            {pendingAttachments.map((att, i) => (
              <div key={i} style={{ fontSize: '0.75rem', background: 'white', padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {att.type === 'product_card' ? <Package size={12}/> : <FileText size={12}/>}
                {att.name || att.title}
                <button type="button" onClick={() => setPendingAttachments(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }}>&times;</button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button type="button" onClick={() => {
            const sku = prompt("Introducir SKU para adjuntar contexto:");
            if (sku) setPendingAttachments(prev => [...prev, { type: 'product_card', name: 'Producto adjunto', sku }]);
          }} title="Adjuntar documento / SKU" style={{ background: 'transparent', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', padding: '0.3rem' }}>
            <FileText size={18} />
          </button>
          <input 
            type="text" 
            placeholder={pendingAttachments.length > 0 ? "Añade un mensaje a tus adjuntos..." : "Escribe un mensaje..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
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

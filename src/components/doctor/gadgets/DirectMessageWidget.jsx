import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { MessageSquare, Send, User, Clock } from 'lucide-react';

export default function DirectMessageWidget() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Fetch active patients for the doctor
  useEffect(() => {
    async function fetchPatients() {
      if (!user?.uid) return;
      try {
        const q = query(collection(db, 'doctor_patient_relationships'), where('doctorId', '==', user.uid), where('status', '==', 'active'));
        const snap = await getDocs(q);
        setPatients(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching patients for messages", err);
      }
    }
    fetchPatients();
  }, [user]);

  // Fetch messages for selected patient
  useEffect(() => {
    if (!selectedPatient || !user?.uid) {
      setMessages([]);
      return;
    }
    
    async function fetchMessages() {
      try {
        const q = query(
          collection(db, 'secure_messages'),
          where('doctorId', '==', user.uid),
          where('patientId', '==', selectedPatient),
          orderBy('createdAt', 'asc')
        );
        // Note: In a real app we'd use onSnapshot, but getDocs is fine for this demo if we refresh on send
        const snap = await getDocs(q);
        setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        scrollToBottom();
      } catch (err) {
        console.error("Error fetching messages", err);
        // If index is missing, we might need to fallback to client-side sorting
        try {
          const qFallback = query(
            collection(db, 'secure_messages'),
            where('doctorId', '==', user.uid),
            where('patientId', '==', selectedPatient)
          );
          const snapF = await getDocs(qFallback);
          const list = snapF.docs.map(d => ({ id: d.id, ...d.data() }));
          list.sort((a, b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0));
          setMessages(list);
          scrollToBottom();
        } catch (fallbackErr) {
          console.error("Fallback also failed", fallbackErr);
        }
      }
    }
    
    fetchMessages();
  }, [selectedPatient, user]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedPatient) return;
    
    setLoading(true);
    try {
      const p = patients.find(x => x.patientId === selectedPatient);
      const newMsgObj = {
        doctorId: user.uid,
        patientId: selectedPatient,
        senderId: user.uid, // Physician is sender
        senderName: user.displayName || 'Physician',
        text: newMessage.trim(),
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'secure_messages'), newMsgObj);
      
      // Optimistic update
      setMessages(prev => [...prev, { ...newMsgObj, createdAt: { toMillis: () => Date.now() } }]);
      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '0', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', background: 'var(--color-bg-app)' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={18} color="var(--primary)" /> Mensajería Segura
        </h3>
        <select 
          value={selectedPatient} 
          onChange={e => setSelectedPatient(e.target.value)} 
          style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none', fontWeight: 600, color: 'var(--color-text-secondary)' }}
        >
          <option value="">-- Seleccionar Patient --</option>
          {patients.map(p => <option key={p.id} value={p.patientId}>{p.patientName}</option>)}
        </select>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'white', minHeight: '300px' }}>
        {!selectedPatient ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.9rem', flexDirection: 'column', gap: '0.5rem' }}>
            <User size={32} opacity={0.5} />
            Selecciona un paciente para conversar
          </div>
        ) : messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.9rem' }}>
            No hay mensajes previos. Escribe el primero.
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.senderId === user.uid;
            return (
              <div key={msg.id || i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{ 
                  maxWidth: '80%', padding: '0.75rem 1rem', borderRadius: '16px',
                  background: isMe ? 'var(--primary)' : '#f1f5f9',
                  color: isMe ? 'white' : 'var(--color-text-primary)',
                  borderBottomRightRadius: isMe ? '4px' : '16px',
                  borderBottomLeftRadius: !isMe ? '4px' : '16px',
                  fontSize: '0.9rem', lineHeight: '1.4'
                }}>
                  {msg.text}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Clock size={10} /> {msg.createdAt ? new Date(msg.createdAt?.toMillis ? msg.createdAt.toMillis() : Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ahora'}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', background: 'white' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..." 
            disabled={!selectedPatient || loading}
            style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '24px', border: '1px solid #e2e8f0', outline: 'none', background: 'var(--color-bg-app)' }}
          />
          <button 
            type="submit"
            disabled={!selectedPatient || !newMessage.trim() || loading}
            style={{ 
              background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '50%', 
              width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: (!selectedPatient || !newMessage.trim() || loading) ? 'not-allowed' : 'pointer',
              opacity: (!selectedPatient || !newMessage.trim() || loading) ? 0.5 : 1
            }}
          >
            <Send size={18} style={{ marginLeft: '3px' }} />
          </button>
        </form>
      </div>
    </div>
  );
}

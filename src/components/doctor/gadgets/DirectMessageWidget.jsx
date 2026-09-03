import React, { useState, useEffect, useRef } from 'react';
import MessageSquare from "lucide-react/dist/esm/icons/message-square";
import Send from "lucide-react/dist/esm/icons/send";
import Clock from "lucide-react/dist/esm/icons/clock";
import { getDoctorPatientRelationships, getDirectMessages, sendDirectMessage } from '../../../repositories/conversationRepository';
import { useAuth } from '../../../context/AuthContext';

export default function DirectMessageWidget() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  };

  // Fetch active patients for the doctor
  useEffect(() => {
    async function fetchPatients() {
      if (!user?.uid) return;
      try {
        const list = await getDoctorPatientRelationships(user.uid);
        setPatients(list);
      } catch (err) {
        console.error("Error fetching patients for messages", err);
      }
    }
    fetchPatients();
  }, [user]);

  // Fetch messages for selected patient
  useEffect(() => {
    if (!selectedPatient || !user?.uid) {
      return;
    }
    let active = true;
    async function fetchMessages() {
      try {
        const list = await getDirectMessages(user.uid, selectedPatient);
        if (!active) return;
        setMessages(list);
        scrollToBottom();
      } catch (err) {
        console.error("Error fetching messages", err);
      }
    }
    fetchMessages();
    return () => {
      active = false;
      setMessages([]);
    };
  }, [selectedPatient, user]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedPatient) return;
    setLoading(true);
    try {
      const p = patients.find(x => x.patientId === selectedPatient);
      const newMsgObj = {
        doctorId: user.uid,
        doctorName: user.displayName || 'Doctor',
        patientId: selectedPatient,
        patientName: p ? `${p.firstName} ${p.lastName}` : 'Patient',
        text: newMessage.trim(),
        sender: 'doctor',
      };
      await sendDirectMessage(newMsgObj);
      setMessages(prev => [...prev, { ...newMsgObj, createdAt: { toMillis: () => 0 } }]);
      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      console.error("Error sending message", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'var(--color-bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      overflow: 'hidden',
      height: '520px',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Header with Patient Selector */}
      <div style={{
        padding: '0.85rem 1rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--color-bg-app)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={18} color="var(--primary)" />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Direct Patient Messages</span>
        </div>
        <div>
          <select 
            value={selectedPatient} 
            onChange={e => setSelectedPatient(e.target.value)}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              fontSize: '0.85rem',
              background: 'white',
              outline: 'none',
              maxWidth: '180px'
            }}
          >
            <option value="">Select a patient...</option>
            {patients.map(p => (
              <option key={p.id || p.patientId} value={p.patientId}>
                {p.firstName || p.patientName || 'Patient'} {p.lastName || ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages Thread Container */}
      <div ref={scrollRef} style={{
        flex: 1,
        padding: '1rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        background: 'var(--color-bg-app)'
      }}>
        {!selectedPatient ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', marginTop: '4rem', fontSize: '0.9rem' }}>
            Select a patient above to start or view secure conversation history.
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', marginTop: '4rem', fontSize: '0.9rem' }}>
            No messages yet. Send a note to the patient below.
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender === 'doctor' || msg.senderId === user?.uid;
            return (
              <div key={msg.id || index} style={{
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                maxWidth: '75%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMe ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  padding: '0.65rem 0.9rem',
                  borderRadius: '16px',
                  background: isMe ? 'var(--primary)' : '#f1f5f9',
                  color: isMe ? 'white' : 'var(--color-text-primary)',
                  borderBottomRightRadius: isMe ? '4px' : '16px',
                  borderBottomLeftRadius: !isMe ? '4px' : '16px',
                  fontSize: '0.9rem', lineHeight: '1.4'
                }}>
                  {msg.text}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Clock size={10} /> {msg.createdAt ? new Date(msg.createdAt?.toMillis ? msg.createdAt.toMillis() : (msg.createdAt?.seconds ? msg.createdAt.seconds * 1000 : 0)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
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
            placeholder="Type a message..." 
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
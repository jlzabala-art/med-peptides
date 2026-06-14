import Mail from "lucide-react/dist/esm/icons/mail";
import Phone from "lucide-react/dist/esm/icons/phone";
import MessageCircle from "lucide-react/dist/esm/icons/message-circle";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Send from "lucide-react/dist/esm/icons/send";
import React, { useState } from 'react';





import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';

export default function CommunicationHub({ entityId, entityType, entityName, email, phone }) {
  const [noteContent, setNoteContent] = useState('');
  const [activeTab, setActiveTab] = useState('notes');

  const logActivity = async (type, title, description) => {
    try {
      await addDoc(collection(db, 'activities'), {
        relatedEntityId: entityId,
        entityType,
        entityName,
        type,
        title,
        description,
        createdAt: serverTimestamp(),
      });
      toast.success(`${title} logged successfully.`);
    } catch (error) {
      console.error("Failed to log activity:", error);
      toast.error("Failed to log activity.");
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    await logActivity('COMMUNICATION_LOGGED', 'Note Added', noteContent);
    setNoteContent('');
  };

  const handleSendEmail = () => {
    if (!email) {
      toast.error("No email address available for this entity.");
      return;
    }
    logActivity('COMMUNICATION_LOGGED', 'Email Initiated', `Started email draft to ${email}`);
    window.open(`mailto:${email}`, '_blank');
  };

  const handleSendWhatsApp = () => {
    if (!phone) {
      toast.error("No phone number available for this entity.");
      return;
    }
    logActivity('COMMUNICATION_LOGGED', 'WhatsApp Initiated', `Opened WhatsApp chat with ${phone}`);
    const formattedPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${formattedPhone}`, '_blank');
  };

  const handleLogCall = () => {
    logActivity('COMMUNICATION_LOGGED', 'Call Logged', `Logged an outbound call to ${entityName}`);
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', backgroundColor: '#f8fafc', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', display: 'flex', gap: '1rem' }}>
        <button 
          onClick={() => setActiveTab('notes')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: activeTab === 'notes' ? 'var(--primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={16} /> Notes
        </button>
        <button 
          onClick={() => setActiveTab('actions')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: activeTab === 'actions' ? 'var(--primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageCircle size={16} /> Actions
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '1.5rem', flex: 1 }}>
        {activeTab === 'notes' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
            <textarea 
              className="gcp-input" 
              placeholder="Type an internal note..." 
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              style={{ flex: 1, minHeight: '120px', resize: 'none' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="gcp-btn-primary" onClick={handleAddNote} disabled={!noteContent.trim()}>
                <Send size={14} style={{ marginRight: '0.5rem' }} /> Save Note
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <button onClick={handleSendEmail} className="hover-card-subtle" style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={20} />
              </div>
              <div style={{ fontWeight: 600 }}>Send Email</div>
            </button>
            <button onClick={handleSendWhatsApp} className="hover-card-subtle" style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageCircle size={20} />
              </div>
              <div style={{ fontWeight: 600 }}>WhatsApp</div>
            </button>
            <button onClick={handleLogCall} className="hover-card-subtle" style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', gridColumn: 'span 2' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#f8fafc', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={20} />
              </div>
              <div style={{ fontWeight: 600 }}>Log a Call</div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
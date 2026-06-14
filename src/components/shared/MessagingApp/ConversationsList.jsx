import User from "lucide-react/dist/esm/icons/user";
import Users from "lucide-react/dist/esm/icons/users";
import Search from "lucide-react/dist/esm/icons/search";
import Plus from "lucide-react/dist/esm/icons/plus";
import Filter from "lucide-react/dist/esm/icons/filter";
import MessageSquare from "lucide-react/dist/esm/icons/message-square";
import Briefcase from "lucide-react/dist/esm/icons/briefcase";
import Stethoscope from "lucide-react/dist/esm/icons/stethoscope";
import Building2 from "lucide-react/dist/esm/icons/building-2";
import Truck from "lucide-react/dist/esm/icons/truck";
import React, { useState } from 'react';










import './MessagingApp.css';

export default function ConversationsList({ conversations, activeConversation, onSelect, currentUserId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Unread', 'Patients', 'Doctors', 'Clinics', 'Distributors', 'Internal Team'];

  const getConvoTitle = (convo) => {
    if (convo.title) return convo.title;
    const otherParticipantId = convo.participants.find(id => id !== currentUserId);
    if (otherParticipantId && convo.participantNames) {
      return convo.participantNames[otherParticipantId] || 'User';
    }
    return 'Chat';
  };

  const getConvoRole = (convo) => {
    return convo.role || 'Patient'; // Mock role badge for now
  };

  const getRoleColor = (role) => {
    switch(role?.toLowerCase()) {
      case 'patient': return '#10b981'; // Green
      case 'doctor': return '#3b82f6'; // Blue
      case 'clinic': return '#8b5cf6'; // Purple
      case 'distributor': return '#f59e0b'; // Orange
      case 'internal': return '#1f2937'; // Dark Gray
      default: return '#6b7280';
    }
  };

  const getRoleIcon = (role) => {
    switch(role?.toLowerCase()) {
      case 'patient': return <User size={16} />;
      case 'doctor': return <Stethoscope size={16} />;
      case 'clinic': return <Building2 size={16} />;
      case 'distributor': return <Truck size={16} />;
      case 'internal': return <Briefcase size={16} />;
      default: return <User size={16} />;
    }
  };

  const filteredConversations = conversations.filter(c => {
    const title = getConvoTitle(c).toLowerCase();
    const role = getConvoRole(c).toLowerCase();
    // Search match
    if (searchTerm && !title.includes(searchTerm.toLowerCase()) && !c.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Filter match
    if (activeFilter === 'Unread' && c.unreadCount === 0) return false;
    if (activeFilter === 'Patients' && role !== 'patient') return false;
    if (activeFilter === 'Doctors' && role !== 'doctor') return false;
    if (activeFilter === 'Clinics' && role !== 'clinic') return false;
    if (activeFilter === 'Distributors' && role !== 'distributor') return false;
    if (activeFilter === 'Internal Team' && role !== 'internal') return false;

    return true;
  });

  const [showComposeMenu, setShowComposeMenu] = useState(false);

  return (
    <div className="messaging-sidebar">
      <div className="messaging-sidebar-header">
        <span>Messages</span>
        <div style={{ position: 'relative' }}>
          <button 
            className="chat-action-btn primary-action"
            onClick={() => setShowComposeMenu(!showComposeMenu)}
          >
            <Plus size={18} />
          </button>
          {showComposeMenu && (
            <div className="compose-menu-dropdown">
              <div className="compose-menu-item"><User size={14} /> New Patient Chat</div>
              <div className="compose-menu-item"><Stethoscope size={14} /> New Doctor Chat</div>
              <div className="compose-menu-item"><Building2 size={14} /> New Clinic Chat</div>
              <div className="compose-menu-item"><Truck size={14} /> New Distributor Chat</div>
              <div className="compose-menu-item"><Briefcase size={14} /> New Internal Chat</div>
              <div className="compose-menu-divider"></div>
              <div className="compose-menu-item"><Users size={14} /> New Group Conversation</div>
            </div>
          )}
        </div>
      </div>

      <div className="messaging-sidebar-search">
        <div className="search-box-wrapper">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search messages, users, or orders..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="chat-search-input"
          />
        </div>
      </div>

      <div className="messaging-sidebar-filters">
        {filters.map(f => (
          <div 
            key={f}
            className={`filter-pill ${activeFilter === f ? 'active' : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </div>
        ))}
      </div>

      <div className="convo-list">
        {filteredConversations.map(convo => {
          const isActive = activeConversation?.id === convo.id;
          const title = getConvoTitle(convo);
          const role = getConvoRole(convo);
          const roleColor = getRoleColor(role);

          return (
            <div 
              key={convo.id} 
              className={`convo-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelect(convo)}
            >
              <div className="convo-avatar" style={{ backgroundColor: roleColor }}>
                {getRoleIcon(role)}
              </div>
              <div className="convo-info">
                <div className="convo-title-row">
                  <div className="convo-title">{title}</div>
                  <div className="convo-time">
                    {convo.lastActivity ? new Date(convo.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:00'}
                  </div>
                </div>
                <div className="convo-role-badge" style={{ color: roleColor, backgroundColor: `${roleColor}15` }}>
                  {role}
                </div>
                <div className="convo-preview">{convo.lastMessage || 'No messages yet'}</div>
              </div>
            </div>
          );
        })}
        {filteredConversations.length === 0 && (
          <div className="convo-empty-state">
            <MessageSquare size={40} className="empty-state-icon" />
            <h3>Start a Conversation</h3>
            <p>Connect with patients, doctors, and your internal team.</p>
            <button className="empty-state-btn">
              <Plus size={16} /> New Message
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
import User from "lucide-react/dist/esm/icons/user";
import Activity from "lucide-react/dist/esm/icons/activity";
import ShoppingBag from "lucide-react/dist/esm/icons/shopping-bag";
import ClipboardList from "lucide-react/dist/esm/icons/clipboard-list";
import Briefcase from "lucide-react/dist/esm/icons/briefcase";
import Truck from "lucide-react/dist/esm/icons/truck";
import Mail from "lucide-react/dist/esm/icons/mail";
import Phone from "lucide-react/dist/esm/icons/phone";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import Clock from "lucide-react/dist/esm/icons/clock";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import PlusCircle from "lucide-react/dist/esm/icons/plus-circle";
import LinkIcon from "lucide-react/dist/esm/icons/link";
import FileText from "lucide-react/dist/esm/icons/file-text";
import React from 'react';














import './MessagingApp.css';

export default function ConversationContextPanel({ conversation }) {
  if (!conversation) return null;

  // Infer context type from conversation (Mock logic for UI demo)
  // In a real app, this would be fetched based on the other participant's profile
  const getContextType = () => {
    if (conversation.title?.toLowerCase().includes('clinic') || conversation.role === 'clinic') return 'clinic';
    if (conversation.title?.toLowerCase().includes('dr.') || conversation.role === 'doctor') return 'doctor';
    if (conversation.title?.toLowerCase().includes('distributor') || conversation.role === 'distributor') return 'distributor';
    return 'patient'; // default
  };

  const contextType = getContextType();

  const renderPatientContext = () => (
    <div className="context-body">
      <div className="context-card">
        <h4><Activity size={16} /> Clinical Timeline</h4>
        <div className="timeline-item">
          <div className="timeline-dot bg-blue"></div>
          <div className="timeline-content">
            <span className="timeline-date">Oct 12, 2023</span>
            <span className="timeline-title">Blood Panel Received</span>
          </div>
        </div>
        <div className="timeline-item">
          <div className="timeline-dot bg-green"></div>
          <div className="timeline-content">
            <span className="timeline-date">Oct 10, 2023</span>
            <span className="timeline-title">Consultation with Dr. Smith</span>
          </div>
        </div>
      </div>
      <div className="context-card">
        <h4><ShoppingBag size={16} /> Recent Orders</h4>
        <div className="context-list-item">
          <div><strong style={{ color: '#1a73e8' }}>#ORD-9921</strong></div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Peptide Protocol Alpha • Shipped</div>
        </div>
      </div>
    </div>
  );

  const renderDoctorContext = () => (
    <div className="context-body">
      <div className="context-card">
        <h4><Briefcase size={16} /> Professional Profile</h4>
        <div style={{ fontSize: '0.85rem', color: '#334155' }}>
          <p><strong>Specialty:</strong> Endocrinology</p>
          <p><strong>NPI:</strong> 1234567890</p>
          <p><strong>Status:</strong> Active Partner</p>
        </div>
      </div>
      <div className="context-card">
        <h4><Activity size={16} /> Performance Metrics</h4>
        <div className="metrics-grid">
          <div className="metric-box">
            <span className="metric-value">24</span>
            <span className="metric-label">Active Patients</span>
          </div>
          <div className="metric-box">
            <span className="metric-value">$4.2k</span>
            <span className="metric-label">Commissions</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDistributorContext = () => (
    <div className="context-body">
      <div className="context-card">
        <h4><Truck size={16} /> Logistics Overview</h4>
        <div className="timeline-item">
          <div className="timeline-dot bg-yellow"></div>
          <div className="timeline-content">
            <span className="timeline-date">Pending</span>
            <span className="timeline-title">Restock #4022</span>
          </div>
        </div>
      </div>
      <div className="context-card">
        <h4><ClipboardList size={16} /> Invoices</h4>
        <div className="context-list-item" style={{ justifyContent: 'space-between', display: 'flex' }}>
          <span style={{ color: '#1a73e8', fontWeight: 500 }}>INV-2023-11</span>
          <span style={{ color: '#0f9d58', fontWeight: 600 }}>Paid</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="messaging-context-panel-content">
      {/* Context Profile Header */}
      <div className="context-profile-header">
        <div className="context-avatar-lg">
          {contextType === 'clinic' ? <ClipboardList size={32} /> : 
           contextType === 'doctor' ? <Briefcase size={32} /> : 
           contextType === 'distributor' ? <Truck size={32} /> : 
           <User size={32} />}
        </div>
        <h3 className="context-name">{conversation.title || 'Unknown Contact'}</h3>
        <span className={`context-role-badge badge-${contextType}`}>{contextType}</span>
        <div className="context-quick-actions">
          <button className="quick-action-btn" title="Email"><Mail size={16} /></button>
          <button className="quick-action-btn" title="Call"><Phone size={16} /></button>
          <button className="quick-action-btn" title="Schedule"><Calendar size={16} /></button>
        </div>
      </div>

      {/* Dynamic Body based on Role */}
      {contextType === 'patient' && renderPatientContext()}
      {contextType === 'doctor' && renderDoctorContext()}
      {contextType === 'distributor' && renderDistributorContext()}
      {(contextType === 'clinic') && renderPatientContext() /* Fallback for demo */}

      {/* CRM Quick Actions (Global) */}
      <div className="context-footer">
        <h4 style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 0.5rem 0' }}>CRM Actions</h4>
        <button className="crm-action-btn"><PlusCircle size={14} /> Create Task</button>
        <button className="crm-action-btn"><AlertTriangle size={14} /> Open Support Ticket</button>
        <button className="crm-action-btn"><FileText size={14} /> View Full Profile</button>
      </div>
    </div>
  );
}
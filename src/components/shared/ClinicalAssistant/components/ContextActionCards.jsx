import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, TrendingUp, AlertCircle, ShoppingCart, UserCheck, MessageSquare, ClipboardList, Calendar, ShieldAlert, RefreshCw, Sparkles, BookOpen } from 'lucide-react';

export default function ContextActionCards({ onActionClick }) {
  const location = useLocation();
  const path = location.pathname;

  // Contextual operational functions based on path
  const getContextCards = () => {
    // ADMIN PORTAL
    if (path === '/admin') {
      return [
        { id: 'admin_report', icon: FileText, label: 'Generate Daily Report', desc: 'PDF summary of metrics', color: 'blue', prompt: 'Generate a daily sales report for today.' },
        { id: 'admin_alerts', icon: AlertCircle, label: 'System Alerts', desc: 'Critical notifications', color: 'red', prompt: 'Check for pending user approvals and system alerts.' }
      ];
    }
    if (path.includes('/admin/sales') || path.includes('/admin/orders')) {
      return [
        { id: 'sales_approve', icon: UserCheck, label: 'Approve Pending', desc: 'Verified → Processing', color: 'green', prompt: 'List all pending orders.' },
        { id: 'sales_delays', icon: AlertCircle, label: 'Detect Delays', desc: 'Analyze shipping', color: 'orange', prompt: 'Check for pending orders to detect any delays.' },
        { id: 'sales_reminders', icon: MessageSquare, label: 'Payment Reminders', desc: 'For overdue accounts', color: 'blue', prompt: 'List users who have been inactive for more than 30 days.' }
      ];
    }
    if (path.includes('/admin/analytics') || path.includes('/admin/finance')) {
      return [
        { id: 'fin_pnl', icon: TrendingUp, label: 'Analyze P&L (AI)', desc: 'Expenses vs Revenue', color: 'purple', prompt: 'Analyze P&L by listing products sorted by highest margin and retrieving the top selling products.' },
        { id: 'fin_sync', icon: RefreshCw, label: 'Sync Zoho', desc: 'Force update', color: 'blue', prompt: 'Sync Zoho data for recent users.' }
      ];
    }
    if (path.includes('/admin/inventory') || path.includes('/admin/stock') || path.includes('/admin/products')) {
      return [
        { id: 'inv_low_stock', icon: AlertCircle, label: 'Low Stock Alert', desc: 'Generate POs', color: 'red', prompt: 'Get low stock inventory alerts (stock <= 10).' },
        { id: 'inv_price_opt', icon: TrendingUp, label: 'Price Optimizer', desc: 'Analyze profitability', color: 'green', prompt: 'List active products sorted by lowest retail margin to optimize pricing.' }
      ];
    }
    if (path.includes('/admin/users') || path.includes('/admin/invitations') || path.includes('/admin/clinics') || path.includes('/admin/doctors')) {
      return [
        { id: 'usr_audit', icon: ShieldAlert, label: 'Audit Permissions', desc: 'Security review', color: 'red', prompt: 'List recent users across all roles to audit permissions.' },
        { id: 'usr_invite', icon: UserCheck, label: 'Pending Invites', desc: 'Check statuses', color: 'blue', prompt: 'Check for pending user approvals.' }
      ];
    }

    // DOCTOR PORTAL
    if (path === '/doctor') {
      return [
        { id: 'doc_citas_hoy', icon: Calendar, label: 'Today\'s Appointments', desc: 'Daily schedule', color: 'blue', prompt: 'Show me my appointments for today.' },
        { id: 'doc_seguimiento', icon: AlertCircle, label: 'Follow-up Alerts', desc: 'Inactive patients', color: 'orange', prompt: 'List patients who need follow-ups.' }
      ];
    }
    if (path.includes('/doctor/new-prescription') || path.includes('/doctor/prescriptions')) {
      return [
        { id: 'doc_sugerir_protocolo', icon: Sparkles, label: 'Suggest Protocols', desc: 'Based on BMI', color: 'purple', prompt: 'Suggest medical protocols based on patient metrics.' },
        { id: 'doc_interacciones', icon: ShieldAlert, label: 'Interaction Check', desc: 'Cross-reference supplements', color: 'red', prompt: 'Check for potential interactions between these supplements.' }
      ];
    }

    // PATIENT PORTAL
    if (path === '/patient') {
      return [
        { id: 'pat_next_dose', icon: Calendar, label: 'My Next Dose', desc: 'Today\'s plan', color: 'green', prompt: 'When is my next dose scheduled?' },
        { id: 'pat_goals', icon: TrendingUp, label: 'Goal Progress', desc: 'Mass / Longevity', color: 'blue', prompt: 'Show my progress against my health goals.' }
      ];
    }
    if (path.includes('/patient/prescriptions') || path.includes('/patient/orders')) {
      return [
        { id: 'pat_refill', icon: ShoppingCart, label: 'Request Refill', desc: 'Add to cart', color: 'orange', prompt: 'I want to request a refill for my active prescriptions.' },
        { id: 'pat_guide', icon: BookOpen, label: 'Reconstitution Guide', desc: 'Video instructions', color: 'purple', prompt: 'Show me the reconstitution guide for my products.' }
      ];
    }

    // Default general context if matched nothing
    return [];
  };

  const cards = getContextCards();

  if (cards.length === 0) return null;

  return (
    <div style={{ padding: '1rem', borderBottom: '1px solid rgba(0,0,0,0.05)', backgroundColor: 'rgba(255,255,255,0.5)' }}>
      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
        Screen Actions (AI)
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onActionClick(card.id, card.label, card.prompt)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '0.75rem',
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `var(--color-${card.color}-400, #94a3b8)`;
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Icon size={14} color={`var(--color-${card.color}-500, #3b82f6)`} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', lineHeight: 1.1 }}>{card.label}</span>
              </div>
              <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{card.desc}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Archive, 
  Mail, 
  MinusCircle, 
  ShieldAlert, 
  Link2, 
  HelpCircle,
  EyeOff
} from 'lucide-react';

export default function AppStatusChip({ status }) {
  const normalized = status?.toLowerCase().trim() || 'unknown';
  
  let bg = 'var(--color-bg-hover)';
  let color = 'var(--color-text-secondary)';
  let Icon = HelpCircle;

  switch(normalized) {
    case 'active':
    case 'linked':
      bg = 'var(--color-success-bg)';
      color = 'var(--color-success)';
      Icon = normalized === 'linked' ? Link2 : CheckCircle2;
      break;
    case 'pending':
    case 'unverified':
      bg = 'var(--color-warning-bg)';
      color = 'var(--color-warning)';
      Icon = Clock;
      break;
    case 'suspended':
    case 'inactive':
      bg = 'var(--color-danger-bg)';
      color = 'var(--color-danger)';
      Icon = XCircle;
      break;
    case 'archived':
      bg = 'var(--color-bg-hover)';
      color = 'var(--color-text-secondary)';
      Icon = Archive;
      break;
    case 'hidden':
      bg = 'var(--color-bg-hover)';
      color = 'var(--color-text-secondary)';
      Icon = EyeOff;
      break;
    case 'invited':
      bg = 'var(--color-info-bg)';
      color = 'var(--color-info)';
      Icon = Mail;
      break;
    case 'protected':
      bg = 'var(--color-info-bg)';
      color = 'var(--color-info)';
      Icon = ShieldAlert;
      break;
    default:
      Icon = HelpCircle;
      break;
  }

  return (
    <span 
      title={`Status: ${status}`}
      style={{ 
        backgroundColor: bg, 
        color: color, 
        width: '24px',
        height: '24px',
        borderRadius: 'var(--radius-sm)', 
        display: 'inline-flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: `1px solid ${bg}`,
        cursor: 'help'
      }}>
      <Icon size={14} />
    </span>
  );
}

import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import Clock from "lucide-react/dist/esm/icons/clock";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import Archive from "lucide-react/dist/esm/icons/archive";
import Mail from "lucide-react/dist/esm/icons/mail";
import MinusCircle from "lucide-react/dist/esm/icons/minus-circle";
import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import Link2 from "lucide-react/dist/esm/icons/link-2";
import HelpCircle from "lucide-react/dist/esm/icons/help-circle";
import EyeOff from "lucide-react/dist/esm/icons/eye-off";
import React from 'react';











export default function AppStatusChip({ status }) {
  const normalized = status?.toLowerCase().trim() || 'unknown';
  let bg = 'var(--color-bg-hover)';
  let color = 'var(--color-text-secondary)';
  let Icon = HelpCircle;

  switch(normalized) {
    case 'active':
    case 'linked':
    case 'accepted':
    case 'aceptada':
      bg = 'var(--color-success-bg)';
      color = 'var(--color-success)';
      Icon = normalized === 'linked' ? Link2 : CheckCircle2;
      break;
    case 'pending':
    case 'pendiente':
    case 'unverified':
      bg = 'var(--color-warning-bg)';
      color = 'var(--color-warning)';
      Icon = Clock;
      break;
    case 'suspended':
    case 'inactive':
    case 'expired':
    case 'caducada':
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
    case 'sent':
    case 'enviada':
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
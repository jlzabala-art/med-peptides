'use client';

import React from 'react';
import { Flame, Eye, Clock, CheckCircle2 } from 'lucide-react';

/**
 * EngagementBadge
 * 
 * Visual GCP-inspired status badge indicating recipient activity and engagement
 * on shared public pages, portals, catalogs, and clinical dossiers.
 * 
 * Rules:
 * - 🔥 High Engagement: >= 5 visits or accessed within last 48h
 * - 👁️ Viewed / Active: 1 to 4 visits
 * - ⏳ Sent / Unread: Shared but 0 visits
 * - ⚪ Unshared: No record of shared link yet
 */
export default function EngagementBadge({
  viewCount = 0,
  visitsCount = 0,
  lastViewedAt = null,
  sharedAt = null,
  status = null,
  size = 'sm', // 'xs' | 'sm' | 'md'
  showDetails = true,
}) {
  const count = Number(viewCount || visitsCount || 0);
  const isViewed = count > 0 || status === 'viewed' || status === 'read';
  const isShared = Boolean(sharedAt || status === 'sent' || count > 0);

  // Time diff helper
  const getTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    try {
      const now = new Date();
      const date = new Date(dateStr);
      const diffMs = now - date;
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHrs < 1) return 'hace un momento';
      if (diffHrs < 24) return `hace ${diffHrs}h`;
      const diffDays = Math.floor(diffHrs / 24);
      if (diffDays === 1) return 'hace 1 día';
      if (diffDays < 30) return `hace ${diffDays}d`;
      return `hace +1m`;
    } catch {
      return '';
    }
  };

  const timeAgo = getTimeAgo(lastViewedAt || sharedAt);

  // 1. Not shared yet
  if (!isShared && count === 0) {
    return (
      <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontStyle: 'italic' }}>
        Sin compartir
      </span>
    );
  }

  // 2. High Engagement (>= 5 visits or visited recently)
  const isRecent = lastViewedAt && (new Date() - new Date(lastViewedAt)) < 48 * 60 * 60 * 1000;
  if (count >= 5 || (count >= 2 && isRecent)) {
    return (
      <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '1px' }}>
        <span
          title={`Acceso frecuente: ${count} visitas. Última visita: ${lastViewedAt ? new Date(lastViewedAt).toLocaleString() : 'Reciente'}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: size === 'xs' ? '1px 6px' : '2px 8px',
            borderRadius: 6,
            fontSize: size === 'xs' ? '0.68rem' : '0.72rem',
            fontWeight: 700,
            background: '#f0fdf4',
            color: '#15803d',
            border: '1px solid #86efac',
            whiteSpace: 'nowrap',
          }}
        >
          <Flame size={12} color="#16a34a" />
          <span>{count} {count === 1 ? 'visita' : 'visitas'}</span>
        </span>
        {showDetails && timeAgo && (
          <span style={{ fontSize: '0.66rem', color: '#166534', paddingLeft: 2 }}>
            Activo {timeAgo}
          </span>
        )}
      </div>
    );
  }

  // 3. Moderate / Viewed (1-4 visits)
  if (isViewed && count > 0) {
    return (
      <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '1px' }}>
        <span
          title={`Abierto: ${count} visitas. Último acceso: ${lastViewedAt ? new Date(lastViewedAt).toLocaleString() : 'Registrado'}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: size === 'xs' ? '1px 6px' : '2px 8px',
            borderRadius: 6,
            fontSize: size === 'xs' ? '0.68rem' : '0.72rem',
            fontWeight: 600,
            background: '#eff6ff',
            color: '#1d4ed8',
            border: '1px solid #bfdbfe',
            whiteSpace: 'nowrap',
          }}
        >
          <Eye size={12} color="#2563eb" />
          <span>{count} {count === 1 ? 'visita' : 'visitas'}</span>
        </span>
        {showDetails && timeAgo && (
          <span style={{ fontSize: '0.66rem', color: '#1e40af', paddingLeft: 2 }}>
            Visto {timeAgo}
          </span>
        )}
      </div>
    );
  }

  // 4. Sent but Unread / 0 visits
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '1px' }}>
      <span
        title={`Enlace compartido pero aún sin registrar apertura. Enviado: ${sharedAt ? new Date(sharedAt).toLocaleString() : 'Recientemente'}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: size === 'xs' ? '1px 6px' : '2px 8px',
          borderRadius: 6,
          fontSize: size === 'xs' ? '0.68rem' : '0.72rem',
          fontWeight: 600,
          background: '#fffbeb',
          color: '#b45309',
          border: '1px solid #fde68a',
          whiteSpace: 'nowrap',
        }}
      >
        <Clock size={12} color="#d97706" />
        <span>Enviado (sin abrir)</span>
      </span>
      {showDetails && timeAgo && (
        <span style={{ fontSize: '0.66rem', color: '#92400e', paddingLeft: 2 }}>
          {timeAgo}
        </span>
      )}
    </div>
  );
}

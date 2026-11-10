'use client';

import React from 'react';
import {
  Share2,
  Clock,
  Eye,
  ShoppingCart
} from 'lucide-react';
import { triggerHaptic } from '../../../utils/haptics';

/**
 * Intelligent Telemetry Micro-Badge (Google Cloud Console Standard).
 * Instead of an intrusive floating popup that blocks table rows,
 * this badge acts as a direct launcher for the Google Cloud Side Drawer (User360Drawer).
 */
export default function UserSharedCatalogsPopover({ user, onOpenShareDrawer }) {
  const userName = user?.fullName || user?.name || user?.email || 'User';

  // Telemetry & Reading State for intelligent micro-badge (Google Cloud UX)
  const isRead = user?.lastAssetReadStatus === 'read' || (user?.lastAssetViewCount || 0) > 0;
  const totalSharesCount = user?.catalogSharesCount || (user?.lastCatalogSharedAt || user?.lastAssetViewedAt ? 1 : 0);
  const hasShared = totalSharesCount > 0;
  const readCount = Number(user?.lastAssetViewCount || 0);
  const hasOrder = Boolean(user?.lastAssetOrderPlaced);

  // Derive badge styling (Google Cloud IAM Sobriety Standard)
  let badgeBg = '#f8fafc';
  let badgeBorder = '1px solid #dadce0';
  let badgeColor = '#475569';
  let badgeIcon = <Share2 size={11} color="#5f6368" />;
  let badgeText = 'Catalogs';
  let badgeTitle = `Ver y generar catálogos para ${userName}`;

  if (hasOrder) {
    badgeBg = '#f0fdf4';
    badgeBorder = '1px solid #bbf7d0';
    badgeColor = '#166534';
    badgeIcon = <ShoppingCart size={11} color="#16a34a" />;
    badgeText = 'Catalogs · 🛒 Pedido';
    badgeTitle = `Catálogo convertido en pedido B2B confirmado. Clic para ver detalles en panel lateral.`;
  } else if (isRead || readCount > 0) {
    badgeBg = '#f8fafc';
    badgeBorder = '1px solid #c2e7ff';
    badgeColor = '#1a73e8';
    badgeIcon = <Eye size={11} color="#1a73e8" />;
    badgeText = `Catalogs · ${readCount > 1 ? `${readCount} aperturas` : 'Leído'}`;
    badgeTitle = `Catálogo abierto ${readCount > 1 ? `${readCount} veces` : '1 vez'} por ${userName}. Clic para ver telemetría completa en el panel lateral.`;
  } else if (hasShared) {
    badgeBg = '#f8fafc';
    badgeBorder = '1px solid #dadce0';
    badgeColor = '#475569';
    badgeIcon = <Clock size={11} color="#5f6368" />;
    badgeText = 'Catalogs · Enviado';
    badgeTitle = `Catálogo enviado a ${userName}. Clic para reenviar o ver en panel lateral.`;
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        triggerHaptic('light');
        if (onOpenShareDrawer) {
          onOpenShareDrawer(user);
        }
      }}
      title={`${badgeTitle} (Abre el panel lateral de catálogos)`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '0.72rem',
        fontWeight: 700,
        padding: '3px 8px',
        borderRadius: '6px',
        background: badgeBg,
        color: badgeColor,
        border: badgeBorder,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
        flexShrink: 0
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(26,115,232,0.2)';
        e.currentTarget.style.borderColor = '#1a73e8';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = badgeBorder.split(' ')[2];
      }}
    >
      {badgeIcon}
      <span>{badgeText}</span>
    </button>
  );
}

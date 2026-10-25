'use client';

import React, { useState } from 'react';
import { Eye, ExternalLink, Share2, Layers, MessageCircle, Loader2 } from '@/lib/icons';
import AppActionGroup from '@/components/ui/AppActionGroup';
import notifier from '@/services/NotificationService';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { generateShareWhatsAppMessage } from '@/utils/shareTemplates';

/**
 * UniversalActionCell
 * 
 * Standardized GCP-style Action Toolbar for ANY table in the platform.
 * Homogenizes quick-action buttons across Doctors, Patients, Wholesalers, and Prescriptions:
 * - 👁️ View / Public Page
 * - 💬 1-Click Direct WhatsApp (auto-detects phone & pre-fills clinical/commercial message)
 * - 🔗 Tracked Share2 (triggers UniversalShareDrawer)
 * - 🗂️ Load into 360° Workspace
 * - ··· AppActionGroup dropdown for entity-specific actions
 * 
 * Complies with Golden Rules:
 * - Golden Rule #3: Seamless DataTable column render integration
 * - Golden Rule #5: High visibility, no context loss
 * - Golden Rule #11: Consistent IDs & clipboard interactions
 * - Golden Rule #23: Mobile-friendly action ergonomics
 */
export default function UniversalActionCell({
  entity,
  entityType = 'custom', // 'doctor' | 'patient' | 'wholesaler' | 'prescription' | 'custom'
  onView = null,
  viewHref = null,
  onShare = null,
  onWorkspace = null,
  onWhatsApp = null,
  extraActions = [],
  maxVisibleDropdown = 1,
  showView = true,
  showWhatsApp = true,
  showShare = true,
  showWorkspace = true,
  children = null,
}) {
  // 1. Dispatching State for Idempotency (Hook at top level)
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

  if (!entity) return null;

  // 2. Resolve Recipient Phone
  const rawPhone = entity.phone || entity.mobile || entity.contactPhone || entity.patient?.phone || '';
  const cleanPhone = String(rawPhone).replace(/[^\d+]/g, '').replace('+', '');
  const hasPhone = Boolean(cleanPhone && cleanPhone.length >= 7);

  // 3. Resolve Entity Name & Link
  const name = entity.displayName || entity.name || entity.companyName || entity.patientName || entity.patient?.name || 'Usuario';
  const id = entity.id || entity.slug || entity.prescriptionNumber || entity.code || '';

  // 4. Default WhatsApp Dispatcher with Auto-Tracking and Users Enrollment
  const handleDefaultWhatsApp = async () => {
    if (onWhatsApp) {
      onWhatsApp(entity);
      return;
    }
    if (!hasPhone) {
      notifier.error('No hay número de teléfono registrado.');
      return;
    }
    if (isSendingWhatsApp) return;

    setIsSendingWhatsApp(true);

    let targetUrl;
    if (entityType === 'doctor') {
      const slug = entity.slug || id;
      targetUrl = `https://www.atlashealth-services.com/dr/${encodeURIComponent(slug)}`;
    } else if (entityType === 'patient') {
      const rxCode = entity.lastRxCode || (Array.isArray(entity.prescriptions) && entity.prescriptions[0]) || id;
      targetUrl = rxCode ? `https://www.atlashealth-services.com/rx/${encodeURIComponent(rxCode)}` : 'https://www.atlashealth-services.com/rx/intake';
    } else if (entityType === 'wholesaler') {
      targetUrl = `https://www.atlashealth-services.com/vials?ref=${encodeURIComponent(id)}`;
    } else if (entityType === 'prescription') {
      targetUrl = `https://www.atlashealth-services.com/rx/${encodeURIComponent(id)}`;
    } else {
      targetUrl = 'https://www.atlashealth-services.com';
    }

    let finalUrl = targetUrl;

    // Asynchronously register in /api/shares to guarantee user role enrollment & tracked short URL
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const shareRes = await fetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          assetType: entityType === 'prescription' ? 'prescription' : entityType === 'doctor' ? 'doctor_profile' : entityType === 'wholesaler' ? 'wholesale_catalog' : 'patient_dossier',
          assetTitle: `${entityType.toUpperCase()} — ${name}`,
          assetMeta: {
            shareUrl: targetUrl,
            entityType,
            entityId: id || null,
          },
          recipient: {
            type: entityType === 'wholesaler' ? 'wholeseller' : entityType,
            role: entityType === 'wholesaler' ? 'wholesaler' : entityType,
            id: entity.id || null,
            name,
            phone: rawPhone,
            email: entity.email || '',
            company: entity.companyName || entity.clinicName || '',
          },
          deliveryChannel: 'whatsapp',
          shareUrl: targetUrl,
        }),
      });

      clearTimeout(timeoutId);

      if (shareRes.ok) {
        const shareData = await shareRes.json();
        if (shareData.shortUrl) {
          finalUrl = shareData.shortUrl;
        }
      }
    } catch (err) {
      console.warn('[UniversalActionCell] Auto-tracking error, falling back to direct URL:', err);
    } finally {
      setIsSendingWhatsApp(false);
    }

    const msgText = generateShareWhatsAppMessage({
      entityType,
      name,
      url: finalUrl,
      id,
      lang: 'es',
    });

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msgText)}`, '_blank');
    notifier.success(`WhatsApp directo abierto para ${name} ✓`);
  };

  // 4. Default Workspace Dispatcher
  const handleDefaultWorkspace = () => {
    if (onWorkspace) {
      onWorkspace(entity);
      return;
    }
    const role = entityType === 'doctor' ? 'doctor' : entityType === 'wholesaler' ? 'wholesaler' : 'patient';
    useWorkspaceStore.getState().loadUserIntoWorkspace(entity, { role });
    notifier.info(`Cargado ${name} en Workspace 360°`);
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '5px',
        whiteSpace: 'nowrap',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* ── BUTTON 1: View / Public Page ── */}
      {showView && (
        viewHref ? (
          <a
            href={viewHref}
            target="_blank"
            rel="noopener noreferrer"
            title={`Ver página pública de ${name}`}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              border: '1px solid #bbf7d0',
              backgroundColor: '#f0fdf4',
              color: '#16a34a',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              flexShrink: 0,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <ExternalLink size={14} />
          </a>
        ) : onView ? (
          <button
            type="button"
            onClick={() => onView(entity)}
            title={`Ver detalles de ${name}`}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              color: '#475569',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
          >
            <Eye size={14} />
          </button>
        ) : null
      )}

      {/* ── BUTTON 2: 1-Click Direct WhatsApp ── */}
      {showWhatsApp && hasPhone && (
        <button
          type="button"
          onClick={handleDefaultWhatsApp}
          disabled={isSendingWhatsApp}
          title={isSendingWhatsApp ? 'Preparando enlace...' : `Envío Rápido por WhatsApp a ${rawPhone}`}
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '6px',
            border: '1px solid #86efac',
            backgroundColor: isSendingWhatsApp ? '#dcfce7' : '#f0fdf4',
            color: '#16a34a',
            cursor: isSendingWhatsApp ? 'wait' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            flexShrink: 0,
            transition: 'all 0.15s ease',
            opacity: isSendingWhatsApp ? 0.7 : 1,
          }}
        >
          {isSendingWhatsApp ? (
            <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <MessageCircle size={14} />
          )}
        </button>
      )}

      {/* ── BUTTON 3: Tracked Share2 (UniversalShareDrawer) ── */}
      {showShare && onShare && (
        <button
          type="button"
          onClick={() => onShare(entity)}
          title={`Compartir enlace trazado con ${name}`}
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '6px',
            border: '1px solid #fed7aa',
            backgroundColor: '#fff7ed',
            color: '#ea580c',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
        >
          <Share2 size={14} />
        </button>
      )}

      {/* ── BUTTON 4: Load into Workspace ── */}
      {showWorkspace && (
        <button
          type="button"
          onClick={handleDefaultWorkspace}
          title={`Cargar ${name} en Workspace 360°`}
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '6px',
            border: '1px solid #bfdbfe',
            backgroundColor: '#eff6ff',
            color: '#1d4ed8',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
        >
          <Layers size={14} />
        </button>
      )}

      {/* ── CUSTOM INJECTED CONTROLS (e.g. QuoteQuickActionDropdown) ── */}
      {children}

      {/* ── BUTTON 5: Entity-Specific Dropdown Actions ── */}
      {extraActions.length > 0 && (
        <AppActionGroup actions={extraActions} maxVisible={maxVisibleDropdown} />
      )}
    </div>
  );
}

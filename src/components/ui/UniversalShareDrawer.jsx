'use client';
import React, { useState, useEffect, useMemo } from 'react';
import StandardDrawer from '@/components/ui/StandardDrawer';
import notifier from '@/services/NotificationService';
import { Copy, Check, MessageSquare, Mail, QrCode, ExternalLink, Key, Loader2, Sparkles, User, RefreshCw } from 'lucide-react';
import RecipientHierarchySelector from '@/components/shared/RecipientHierarchySelector';
import EngagementBadge from '@/components/ui/EngagementBadge';
import { generateDoctorWelcomeWhatsApp, generateDoctorWelcomeEmail } from '@/data/doctorOnboardingTemplates';

/**
 * UniversalShareDrawer
 * 
 * Unified, polymorphic and parameterizable drawer to share ANY resource across all portals:
 * - Doctors (Public Profile / 1-Tap Magic Token Onboarding)
 * - Prescriptions (Digital Dossier, Multipart Fagron Genomics, Posology)
 * - Wholesalers / Customers (B2B Catalog, /vials?ref=[id], Price tiers)
 * - Patients (Personalized Clinical Portal, Rx Intake)
 * - Custom / Generic links (Catalogs, PriceLists, Protocols, Lab Reports)
 * 
 * Complies with AGENTS.md Golden Rules:
 * - Golden Rule #1 & #2: Zero heavy initial load; queries on-demand
 * - Golden Rule #4: Uses StandardDrawer without context-breaking modals
 * - Golden Rule #8 & #15: GCP-inspired UX, CSS variables & semantic colors
 * - Golden Rule #11: IDs & links are copy-on-click
 */
export default function UniversalShareDrawer({
  isOpen,
  onClose,
  // Polymorphic props
  entityType = null, // 'doctor' | 'prescription' | 'wholesaler' | 'patient' | 'catalog' | 'custom'
  entity = null,
  doctor = null,
  rx = null,
  customer = null,
  patient = null,
  // Direct/generic props (for backwards compatibility)
  shareUrl: incomingShareUrl = '',
  docUrl = '',
  docType: incomingDocType = 'document',
  title: incomingTitle = null,
  subtitle: incomingSubtitle = null,
  itemName: incomingItemName = '',
  itemCount: incomingItemCount = 0,
  recipientName: initialRecipientName = '',
  recipientEmail: initialRecipientEmail = '',
  recipientPhone: initialRecipientPhone = '',
  accountManagerName = 'Atlas Commercial Desk',
  accountManagerEmail = 'orders@atlas-solutions.com',
  logId = null,
  isMobile = false,
  allowedRoles = ['doctor', 'wholeseller', 'account_manager', 'patient', 'custom'],
  customMessageTemplate = null,
  assetMeta = {},
  onSuccess = null,
}) {
  // 1. Resolve Effective Entity & Entity Type
  const resolvedEntityType = useMemo(() => {
    if (entityType) return entityType;
    if (doctor) return 'doctor';
    if (rx) return 'prescription';
    if (customer) return 'wholesaler';
    if (patient) return 'patient';
    return 'custom';
  }, [entityType, doctor, rx, customer, patient]);

  const resolvedEntity = useMemo(() => {
    return entity || doctor || rx || customer || patient || null;
  }, [entity, doctor, rx, customer, patient]);

  // Origin for URL construction
  const origin = typeof window !== 'undefined'
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com');

  // 1-Tap Access state for Doctor onboarding
  const [useMagicLink, setUseMagicLink] = useState(true);
  const [magicLinkDuration, setMagicLinkDuration] = useState(24);
  const [isGeneratingMagicLink, setIsGeneratingMagicLink] = useState(false);
  const [magicLinkData, setMagicLinkData] = useState(null);

  // Language state - Defaults to English ('en') per GCP UX Standard
  const [messageLang, setMessageLang] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('share_message_lang') || 'en';
    }
    return 'en';
  });

  const handleLanguageChange = (lang) => {
    setMessageLang(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('share_message_lang', lang);
    }
  };

  // Derive initial values based on entityType
  const derivedDefaults = useMemo(() => {
    let type = incomingDocType;
    let recType = 'doctor';
    let name = initialRecipientName;
    let email = initialRecipientEmail;
    let phone = initialRecipientPhone;
    let company = '';
    let recId = null;
    let defaultUrl = incomingShareUrl || docUrl || '';
    let autoTitle = incomingTitle;
    let autoSubtitle = incomingSubtitle;
    let label = incomingItemName;

    if (resolvedEntityType === 'doctor' && resolvedEntity) {
      const d = resolvedEntity;
      type = 'doctor';
      recType = 'doctor';
      recId = d.id || null;
      name = d.displayName || [d.firstName, d.lastName].filter(Boolean).join(' ') || d.name || 'Doctor';
      email = d.email || d.secondaryEmail || '';
      phone = d.phone || d.mobile || '';
      company = d.clinicName || d.clinic || '';
      const slug = d.slug || d.id || '';
      const isEs = messageLang === 'es';
      defaultUrl = `${origin}/dr/${encodeURIComponent(slug)}`;
      autoTitle = autoTitle || (isEs ? `Compartir Perfil Médico / Acceso 1-Tap` : `Share Clinical Profile / 1-Tap Access`);
      autoSubtitle = autoSubtitle || (isEs ? `Enlace directo al perfil público y credencial 1-Tap para ${name}` : `Direct link to public clinical profile and 1-Tap credential for ${name}`);
      label = label || `Dr. ${name}`;
    } else if (resolvedEntityType === 'prescription' && resolvedEntity) {
      const isEs = messageLang === 'es';
      const p = resolvedEntity;
      type = 'prescription';
      recType = 'patient';
      recId = p.patientId || p.patient?.id || null;
      name = p.patient?.name || p.patientName || 'Patient';
      email = p.patient?.email || p.patientEmail || '';
      phone = p.patient?.phone || p.patientPhone || '';
      const rxCode = p.prescriptionNumber || p.code || p.id || '';
      defaultUrl = rxCode ? `${origin}/rx/${encodeURIComponent(rxCode)}` : `${origin}/rx/intake`;
      autoTitle = autoTitle || (isEs ? `Compartir Expediente de Prescripción` : `Share Prescription Record`);
      autoSubtitle = autoSubtitle || (isEs ? `Expediente clínico #${rxCode} verificado con pautas posológicas` : `Clinical dossier #${rxCode} verified with posology guidelines`);
      label = label || `Prescripción #${rxCode}`;
    } else if (resolvedEntityType === 'wholesaler' && resolvedEntity) {
      const isEs = messageLang === 'es';
      const w = resolvedEntity;
      type = 'wholesaler';
      recType = 'wholeseller';
      recId = w.id || null;
      name = w.name || w.companyName || w.legalName || 'Wholesaler';
      email = w.contactEmail || w.email || '';
      phone = w.contactPhone || w.phone || '';
      company = w.companyName || w.company || '';
      defaultUrl = `${origin}/vials?ref=${encodeURIComponent(w.id || '')}`;
      autoTitle = autoTitle || (isEs ? `Compartir Catálogo Mayorista B2B` : `Share Wholesaler B2B Catalog`);
      autoSubtitle = autoSubtitle || (isEs ? `Catálogo de viales con margen y comisiones para ${name}` : `Vial catalog with tiered wholesale pricing and margins for ${name}`);
      label = label || name;
    } else if (resolvedEntityType === 'patient' && resolvedEntity) {
      const isEs = messageLang === 'es';
      const pt = resolvedEntity;
      type = 'patient';
      recType = 'patient';
      recId = pt.id || null;
      name = pt.name || `${pt.firstName || ''} ${pt.lastName || ''}`.trim() || 'Patient';
      email = pt.email || '';
      phone = pt.phone || '';
      const lastRx = pt.lastRxCode || (Array.isArray(pt.prescriptions) && pt.prescriptions[0]) || '';
      defaultUrl = lastRx ? `${origin}/rx/${encodeURIComponent(lastRx)}` : `${origin}/rx/intake`;
      autoTitle = autoTitle || (isEs ? `Compartir Portal de Paciente` : `Share Patient Portal`);
      autoSubtitle = autoSubtitle || (isEs ? `Acceso directo al portal clínico y recetas activas de ${name}` : `Direct access to clinical portal and active treatment plans for ${name}`);
      label = label || name;
    }

    const isEs = messageLang === 'es';
    return {
      type,
      recType,
      recId,
      name,
      email,
      phone,
      company,
      defaultUrl,
      autoTitle: autoTitle || `Share ${type.toUpperCase()}`,
      autoSubtitle: autoSubtitle || (isEs ? 'Seleccione el destinatario y comparta vía WhatsApp, Email o Enlace.' : 'Select recipient and share via WhatsApp, Email, or Direct Link.'),
      label,
    };
  }, [resolvedEntityType, resolvedEntity, incomingDocType, initialRecipientName, initialRecipientEmail, initialRecipientPhone, incomingShareUrl, docUrl, incomingTitle, incomingSubtitle, incomingItemName, origin, messageLang]);

  // Recipient state
  const [recipient, setRecipient] = useState({
    type: derivedDefaults.recType,
    id: derivedDefaults.recId,
    name: derivedDefaults.name,
    company: derivedDefaults.company,
    email: derivedDefaults.email,
    phone: derivedDefaults.phone,
    notes: '',
  });

  // Re-sync recipient when derivedDefaults change
  useEffect(() => {
    setRecipient({
      type: derivedDefaults.recType,
      id: derivedDefaults.recId,
      name: derivedDefaults.name,
      company: derivedDefaults.company,
      email: derivedDefaults.email,
      phone: derivedDefaults.phone,
      notes: '',
    });
    setMagicLinkData(null);
  }, [derivedDefaults]);

  // UI state
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [activeLogId, setActiveLogId] = useState(logId);
  const [activeShortUrl, setActiveShortUrl] = useState(null);

  // Sync activeLogId if logId prop changes
  useEffect(() => {
    setActiveLogId(logId);
  }, [logId]);

  // Reset active tracked code if recipient or entity changes
  useEffect(() => {
    setActiveLogId(null);
    setActiveShortUrl(null);
  }, [recipient.id, recipient.email, recipient.phone, recipient.name]);

  // Base raw share URL before tracking
  const rawShareUrl = useMemo(() => {
    if (resolvedEntityType === 'doctor') {
      const d = resolvedEntity;
      const slug = d?.slug || d?.id || '';
      // When sharing with a patient, strictly route to patient intake/view — never provide doctor 1-Tap credentials!
      if (recipient.type === 'patient') {
        return `${origin}/rx/intake?refDoctor=${encodeURIComponent(slug)}`;
      }
      if (useMagicLink && magicLinkData?.accessUrl) {
        return magicLinkData.accessUrl;
      }
    }
    return derivedDefaults.defaultUrl || incomingShareUrl || docUrl || '';
  }, [resolvedEntityType, recipient.type, resolvedEntity, useMagicLink, magicLinkData, derivedDefaults.defaultUrl, incomingShareUrl, docUrl, origin]);

  // Handle generating Doctor 1-Tap Magic Link
  const handleGenerateDoctorMagicLink = async () => {
    if (resolvedEntityType !== 'doctor' || !resolvedEntity) return;
    const d = resolvedEntity;
    const slug = d.slug || d.id || '';
    if (!slug) {
      notifier.error('Doctor profile has no slug or ID');
      return;
    }

    setIsGeneratingMagicLink(true);
    try {
      const res = await fetch('/api/doctor/request-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorSlug: slug,
          phone: recipient.phone || d.phone || d.mobile || '',
          email: recipient.email || d.email || '',
          rememberDevice: true,
          expiresInHours: Number(magicLinkDuration) || 24,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate 1-Tap magic link');

      setMagicLinkData(data);
      setActiveShortUrl(null);
      setActiveLogId(null);
      notifier.success(`1-Tap Access link generated (${magicLinkDuration}h validity) ✓`);
    } catch (err) {
      console.error('Error generating 1-tap link:', err);
      notifier.error(err.message || 'Could not generate 1-Tap link');
    } finally {
      setIsGeneratingMagicLink(false);
    }
  };

  // Ensure universal tracking record exists and guarantees user role enrollment
  const getTrackedUrl = async (channel = 'link') => {
    if (activeShortUrl) return activeShortUrl;
    if (!rawShareUrl) return '';
    let currentLogId = activeLogId;

    if (!currentLogId && (recipient.name || recipient.email || recipient.phone)) {
      try {
        const res = await fetch('/api/shares', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assetType: derivedDefaults.type,
            assetTitle: derivedDefaults.label || `${derivedDefaults.type.toUpperCase()}`,
            assetMeta: {
              shareUrl: rawShareUrl,
              itemCount: incomingItemCount,
              entityType: resolvedEntityType,
              entityId: resolvedEntity?.id || null,
              ...assetMeta,
            },
            recipient: {
              type: recipient.type,
              role: recipient.type === 'wholeseller' ? 'wholesaler' : recipient.type,
              id: recipient.id,
              name: recipient.name,
              company: recipient.company,
              email: recipient.email,
              phone: recipient.phone,
            },
            notes: recipient.notes,
            deliveryChannel: channel,
            shareUrl: rawShareUrl,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.id) {
            currentLogId = data.id;
            setActiveLogId(data.id);
          }
          if (data.shortUrl) {
            setActiveShortUrl(data.shortUrl);
            onSuccess?.(data);
            return data.shortUrl;
          }
        }
      } catch (err) {
        console.warn('Could not create universal tracking log:', err);
      }
    }

    if (currentLogId) {
      const separator = rawShareUrl.includes('?') ? '&' : '?';
      return `${rawShareUrl}${separator}sid=${currentLogId}`;
    }

    return rawShareUrl;
  };

  // Compose clinical / commercial message text
  const composeMessageText = (effectiveUrl = rawShareUrl) => {
    if (customMessageTemplate) {
      return customMessageTemplate({
        targetName: recipient.name,
        targetType: recipient.type,
        shareUrl: effectiveUrl,
        itemName: derivedDefaults.label,
        itemCount: incomingItemCount,
        accountManagerEmail,
        lang: messageLang,
        entity: resolvedEntity,
      });
    }

    const isEs = messageLang === 'es';

    // 1. Doctor Profile / 1-Tap Access Template
    if (resolvedEntityType === 'doctor') {
      const d = resolvedEntity;
      const docName = d?.displayName || d?.name || 'Dr. Sobia Mirza';
      const cleanDocTitle = docName.startsWith('Dr.') ? docName : `Dr. ${docName}`;
      const clinicName = d?.clinicName || d?.clinic || 'My London Skin Clinic';

      // ── Patient Recipient: Safe Public Intake & Care Portal ──
      if (recipient.type === 'patient') {
        const patName = recipient.name || (isEs ? 'Estimado/a paciente' : 'Dear Patient');
        if (isEs) {
          return `🏥 *Atlas Health Services — Portal de Atención al Paciente*

Estimado/a ${patName},

Le facilitamos su enlace personal al portal de atención médica y prescripción digital con ${cleanDocTitle} (${clinicName}).

A través de este canal seguro puede completar su ficha médica, cargar informes previos y consultar sus fórmulas magistrales prescritas:
👉 ${effectiveUrl}

🔒 *Canal Clínico Protegido*: Confidencialidad bajo estándares DHA y formulación EU GMP.`;
        }

        return `🏥 *Atlas Health Services — Patient Care Portal*

Dear ${patName},

Here is your direct access to the clinical care and digital prescription portal with ${cleanDocTitle} (${clinicName}).

Through this secure link you can submit your patient intake, review your clinical regimen, and track your personalized compounded prescriptions:
👉 ${effectiveUrl}

🔒 *Certified Patient Portal*: Compliant with EU GMP and DHA healthcare privacy standards.`;
      }

      // ── Doctor / Clinic Recipient: 1-Tap Access ──
      const recDocName = recipient.name || 'Doctor';
      const cleanTitle = recDocName.startsWith('Dr.') ? recDocName : `Dr. ${recDocName}`;

      if (isEs) {
        return `🩺 *Atlas Health Services — Acceso Clínico 1-Tap*

Estimado/a ${cleanTitle},

Le damos la bienvenida a **Atlas Health Services**, su plataforma de formulación magistral individualizada y medicina regenerativa de precisión.

Ponemos a su disposición:
• **Fórmulas Magistrales a Medida**: Preparadas según farmacopea europea y USP (cremas transdérmicas liposomales Pentravan®, cápsulas orales, trociscos sublinguales).
• **Péptidos Bioactivos & BHRT**: Protocolos endocrinos y de longevidad celular clínicamente validados.
• **Expedientes Nominales y Dispensación Directa**: Recetas digitales en 1 clic y entrega directa a sus pacientes.

🔑 **Su Enlace de Acceso 1-Tap al Portal Médico**:
👉 ${effectiveUrl}

⏱️ *Validez*: **${magicLinkDuration} horas** desde el envío.
💻 *Autorización*: Al abrir el enlace, su dispositivo queda autorizado durante **90 días** sin necesidad de contraseña.

_Atlas Health Services — Operaciones Clínicas y Formulación Magistral_
_Madrid · Dubái · Doha · Zúrich_`;
      }

      return generateDoctorWelcomeWhatsApp({
        doctorName: cleanTitle,
        accessUrl: effectiveUrl,
        durationHours: magicLinkDuration,
      });
    }

    // 2. Prescription Dossier Template
    if (resolvedEntityType === 'prescription' && resolvedEntity) {
      const p = resolvedEntity;
      const rxCode = p.prescriptionNumber || p.code || p.id || '';
      const patientName = recipient.name || p.patient?.name || 'Estimado/a paciente';
      const doctorName = p.doctor?.name || p.doctorName || 'Equipo Médico';
      const isMultiPart = Boolean(p._isSessionGroup || (p._sessionMembers && p._sessionMembers.length > 1));
      const partsCount = p._sessionCount || p._sessionMembers?.length || (p.totalParts || 0);
      const testName = p.fagron?.testName || 'NutriGen';

      if (isMultiPart) {
        const partsList = (p._sessionMembers || []).map((m, idx) => {
          const partNum = m.partNumber || idx + 1;
          const items = m.prescriptionLines || m.items || [];
          const itemNames = items.slice(0, 3).map(i => i.productName || i.name).filter(Boolean);
          const moreCount = items.length > 3 ? ` +${items.length - 3} más` : '';
          return isEs
            ? `• Parte ${partNum} (${items.length} activos): ${itemNames.join(', ')}${moreCount}`
            : `• Part ${partNum} (${items.length} active ingredients): ${itemNames.join(', ')}${moreCount}`;
        }).join('\n');

        if (isEs) {
          return `📋 *Atlas Clinical Platform — Expediente Integral Fagron ${testName}*

Estimado/a ${patientName},

Puede acceder a su prescripción genética multiparte digitalizada (#${rxCode}), que incluye *${partsCount} fórmulas magistrales secuenciales* con su pauta posológica completa:

${partsList}

🔗 ${effectiveUrl}

🔒 Prescrito y verificado por ${doctorName}.`;
        }

        return `📋 *Atlas Clinical Platform — Comprehensive Fagron ${testName} Dossier*

Dear ${patientName},

You can access your verified multi-part genetic prescription (#${rxCode}), which includes *${partsCount} sequential compounded formulations* with customized administration schedules:

${partsList}

🔗 ${effectiveUrl}

🔒 Prescribed & clinically verified by ${doctorName}.`;
      }

      if (isEs) {
        return `📋 *Atlas Clinical Platform — Expediente de Prescripción Digital*

Estimado/a ${patientName},

Puede acceder a su prescripción médica digitalizada (#${rxCode}), pautas de administración, calendario de dosificación y verificación clínica a través del siguiente enlace seguro:

🔗 ${effectiveUrl}

🔒 Verificado por ${doctorName}.`;
      }

      return `📋 *Atlas Clinical Platform — Digital Prescription Dossier*

Dear ${patientName},

You can access your verified digital prescription (#${rxCode}), administration protocol, posology schedule, and clinical verification via the following secure link:

🔗 ${effectiveUrl}

🔒 Prescribed & verified by ${doctorName}.`;
    }

    // 3. Wholesaler / Customer B2B Template
    if (resolvedEntityType === 'wholesaler') {
      const clientName = recipient.name || 'Estimado/a Colaborador/a';
      if (isEs) {
        return `📦 *Atlas Solutions — Catálogo Comercial Mayorista B2B*

Estimado/a ${clientName},

Adjuntamos las condiciones comerciales mayoristas y el catálogo de viales y formulaciones con márgenes de distribución vinculados:

🔗 ${effectiveUrl}

Para consultas sobre volúmenes o pedidos oficiales, contacte con: ${accountManagerEmail}`;
      }
      return `📦 *Atlas Solutions — B2B Wholesale Commercial Catalog*

Dear ${clientName},

Please find your wholesale commercial conditions and verified catalog link with distributor margins:

🔗 ${effectiveUrl}

For order inquiries or volume logistics: ${accountManagerEmail}`;
    }

    // 4. Patient Portal Template
    if (resolvedEntityType === 'patient') {
      const ptName = recipient.name || 'Estimado/a paciente';
      if (isEs) {
        return `🏥 *Atlas Clinical Platform — Portal de Paciente*

Estimado/a ${ptName},

Aquí tiene su enlace directo para consultar sus tratamientos activos, pautas posológicas y solicitar renovaciones de forma segura:

🔗 ${effectiveUrl}

🔒 Portal confidencial Atlas Health Services.`;
      }
      return `🏥 *Atlas Clinical Platform — Patient Care Portal*

Dear ${ptName},

Here is your direct secure access link to view your active treatment plans, posology guidelines, and request refills:

🔗 ${effectiveUrl}

🔒 Confidential Atlas Health Services Patient Portal.`;
    }

    // 5. Generic Fallback
    const greeting = recipient.name ? (isEs ? `Estimado/a ${recipient.name},\n\n` : `Dear ${recipient.name},\n\n`) : '';
    const desc = derivedDefaults.label ? `"${derivedDefaults.label}"` : (isEs ? `documento oficial` : `official document`);
    if (isEs) {
      return `${greeting}Adjuntamos el enlace seguro para acceder a ${desc}:\n\n🔗 ${effectiveUrl}\n\nPara cualquier consulta, contacte con: ${accountManagerEmail}`;
    }
    return `${greeting}Please find the secure link for ${desc}:\n\n🔗 ${effectiveUrl}\n\nFor questions, please contact: ${accountManagerEmail}`;
  };

  const handleCopyLink = async () => {
    if (!rawShareUrl) {
      notifier.error('Share URL not available.');
      return;
    }
    const finalUrl = await getTrackedUrl();
    await navigator.clipboard.writeText(finalUrl);
    setCopied(true);
    notifier.success(recipient.name ? `Enlace trazado copiado para ${recipient.name} ✓` : 'Enlace copiado al portapapeles ✓');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = async () => {
    if (!rawShareUrl) return;
    const finalUrl = await getTrackedUrl('whatsapp');
    const cleanPhone = (recipient.phone || '').replace(/[^\d+]/g, '');
    const msg = composeMessageText(finalUrl);

    const phoneParam = cleanPhone.replace('+', '');
    const waUrl = phoneParam
      ? `https://wa.me/${phoneParam}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;

    window.open(waUrl, '_blank');
    notifier.success('WhatsApp abierto con enlace trazado ✓');
  };

  const handleShareEmail = async () => {
    if (!rawShareUrl) return;
    const finalUrl = await getTrackedUrl('email');
    const recEmail = recipient.email || initialRecipientEmail;
    const recName = recipient.name || initialRecipientName;
    const subject = `ATLAS SOLUTIONS — ${derivedDefaults.label || derivedDefaults.type.toUpperCase()}${recName ? ` for ${recName}` : ''}`;
    const body = composeMessageText(finalUrl);

    const mailtoUrl = `mailto:${encodeURIComponent(recEmail || '')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
    notifier.success('Cliente de correo abierto con plantilla oficial ✓');
  };

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=${encodeURIComponent(rawShareUrl || '')}`;

  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      zIndex={100050}
      width={isMobile ? '100%' : '530px'}
      title={derivedDefaults.autoTitle}
      subtitle={derivedDefaults.autoSubtitle}
      footer={
        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%',
            padding: '10px 18px',
            background: 'var(--color-primary, #003666)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          {messageLang === 'es' ? 'Hecho / Cerrar' : 'Done / Close'}
        </button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Doctor-Specific: 1-Tap Access Magic Link Config or Patient Safe Mode */}
        {resolvedEntityType === 'doctor' && (
          recipient.type === 'patient' ? (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: 10,
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={16} color="#0284c7" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                  {messageLang === 'es' ? 'Modo Paciente Seguro (Admisión y Consulta)' : 'Patient Safe Mode (Intake & Dossier)'}
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#475569', lineHeight: 1.4 }}>
                {messageLang === 'es'
                  ? 'El paciente recibirá su enlace directo a la ficha de admisión y recetas prescritas. El acceso administrativo 1-Tap del médico queda protegido y desactivado.'
                  : 'The patient will receive a direct link to patient intake and prescribed formulas. The physician’s 1-Tap administrative access is protected and disabled.'}
              </p>
            </div>
          ) : (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 10,
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Key size={16} color="#16a34a" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534' }}>
                    {messageLang === 'es' ? 'Acceso Seguro 1-Tap (Sin Contraseña)' : 'Secure 1-Tap Access (Passwordless)'}
                  </span>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', cursor: 'pointer', color: '#166534', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={useMagicLink}
                    onChange={(e) => setUseMagicLink(e.target.checked)}
                  />
                  {messageLang === 'es' ? 'Activar 1-Tap' : 'Enable 1-Tap'}
                </label>
              </div>

              {useMagicLink && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.73rem', color: '#15803d' }}>
                      {messageLang === 'es' ? 'Validez enlace:' : 'Link validity:'}
                    </span>
                    <select
                      value={magicLinkDuration}
                      onChange={(e) => setMagicLinkDuration(Number(e.target.value))}
                      style={{
                        fontSize: '0.75rem',
                        padding: '3px 8px',
                        borderRadius: 6,
                        border: '1px solid #86efac',
                        background: '#ffffff',
                        fontWeight: 600,
                        color: '#166534',
                      }}
                    >
                      <option value={24}>{messageLang === 'es' ? '24 horas' : '24 hours'}</option>
                      <option value={72}>{messageLang === 'es' ? '72 horas (3 días)' : '72 hours (3 days)'}</option>
                      <option value={168}>{messageLang === 'es' ? '7 días' : '7 days'}</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateDoctorMagicLink}
                    disabled={isGeneratingMagicLink}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: 'none',
                      background: '#16a34a',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(22, 163, 74, 0.2)'
                    }}
                  >
                    {isGeneratingMagicLink ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                    {magicLinkData
                      ? (messageLang === 'es' ? 'Regenerar Token' : 'Regenerate Token')
                      : (messageLang === 'es' ? 'Generar Token' : 'Generate Token')}
                  </button>
                </div>
              )}
            </div>
          )
        )}

        {/* Hierarchical Recipient Selector (Type -> Search/Edit Contact) */}
        <div style={{
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          padding: '12px',
          background: '#ffffff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={14} color="#003666" />
              {messageLang === 'es' ? 'Destinatario Registrado' : 'Registered Recipient'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <EngagementBadge
                viewCount={resolvedEntity?.lastAssetViewCount || resolvedEntity?.viewCount || 0}
                lastViewedAt={resolvedEntity?.lastAssetViewedAt || resolvedEntity?.lastActiveAt || resolvedEntity?.lastLoginAt}
                sharedAt={resolvedEntity?.lastAssetSharedAt}
                status={resolvedEntity?.lastAssetReadStatus}
                size="xs"
              />
              <span style={{ fontSize: '0.70rem', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                {messageLang === 'es' ? 'Rol: ' : 'Role: '}<strong>{recipient.type}</strong>
              </span>
            </div>
          </div>
          <RecipientHierarchySelector
            value={recipient}
            onChange={(rec) => setRecipient(rec)}
            showNotesField={true}
          />
        </div>

        {/* Language Selector for Share Message */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '8px 12px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
            🌐 {messageLang === 'es' ? 'Idioma del Mensaje / Language' : 'Message Language / Idioma'}
          </span>
          <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', padding: '3px', borderRadius: 6 }}>
            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              style={{
                padding: '3px 10px',
                fontSize: '0.75rem',
                fontWeight: messageLang === 'en' ? 700 : 500,
                borderRadius: 4,
                border: 'none',
                background: messageLang === 'en' ? 'var(--color-primary, #003666)' : 'transparent',
                color: messageLang === 'en' ? '#ffffff' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              🇬🇧 English
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('es')}
              style={{
                padding: '3px 10px',
                fontSize: '0.75rem',
                fontWeight: messageLang === 'es' ? 700 : 500,
                borderRadius: 4,
                border: 'none',
                background: messageLang === 'es' ? 'var(--color-primary, #003666)' : 'transparent',
                color: messageLang === 'es' ? '#ffffff' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              🇪🇸 Español
            </button>
          </div>
        </div>

        {/* Action 1: Share via WhatsApp (Dominant CTA) */}
        <div
          onClick={handleShareWhatsApp}
          style={{
            border: '1px solid #86efac',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            boxShadow: '0 2px 4px rgba(22, 163, 74, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#16a34a', color: '#fff', padding: 8, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={19} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#14532d' }}>
                {messageLang === 'es' ? 'Compartir por WhatsApp' : 'Share via WhatsApp'}
              </div>
              <div style={{ fontSize: '0.73rem', color: '#15803d' }}>
                {recipient.phone 
                  ? (messageLang === 'es' ? `Chat directo a ${recipient.phone}` : `Direct chat to ${recipient.phone}`)
                  : (messageLang === 'es' ? 'Abre WhatsApp con mensaje oficial pre-rellenado' : 'Opens WhatsApp with pre-filled clinical message')}
              </div>
            </div>
          </div>
          <ExternalLink size={16} color="#16a34a" />
        </div>

        {/* Action 2: Share via Email */}
        <div
          onClick={handleShareEmail}
          style={{
            border: '1px solid #bfdbfe',
            background: '#eff6ff',
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#2563eb', color: '#fff', padding: 8, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={19} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e3a8a' }}>
                {messageLang === 'es' ? 'Enviar por Correo Electrónico' : 'Send via Email'}
              </div>
              <div style={{ fontSize: '0.73rem', color: '#1d4ed8' }}>
                {recipient.email 
                  ? (messageLang === 'es' ? `Dirigido a ${recipient.email}` : `Addressed to ${recipient.email}`)
                  : (messageLang === 'es' ? 'Abre el cliente de correo con plantilla y firma' : 'Opens mail client with official template and signature')}
              </div>
            </div>
          </div>
          <ExternalLink size={16} color="#2563eb" />
        </div>

        {/* Action 3: Direct Link & Copy */}
        <div style={{
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          padding: '12px 14px',
          background: '#ffffff',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Copy size={15} color="var(--color-primary, #003666)" />
              {messageLang === 'es' ? 'Enlace Directo Trazado' : 'Direct Tracked Link'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  padding: '5px 12px',
                  background: copied ? '#16a34a' : 'var(--color-primary, #003666)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'background 0.2s ease',
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied 
                  ? (messageLang === 'es' ? '¡Copiado!' : 'Copied!') 
                  : (messageLang === 'es' ? 'Copiar Enlace' : 'Copy Link')}
              </button>
            </div>
          </div>

          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 6,
            padding: '7px 9px',
            fontSize: '0.73rem',
            color: '#64748b',
            wordBreak: 'break-all',
            maxHeight: 52,
            overflowY: 'auto',
          }}>
            {rawShareUrl || (messageLang === 'es' ? 'Generando enlace...' : 'Generating link...')}
          </div>
        </div>

        {/* Action 4: On-Demand Mobile QR Code */}
        <div style={{
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          padding: '12px 14px',
          background: '#ffffff',
        }}>
          <div
            onClick={() => setShowQr(prev => !prev)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <QrCode size={16} color="var(--color-primary, #003666)" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                {messageLang === 'es' ? 'Código QR para Móvil' : 'Mobile / Clinic QR Code'}
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>
              {showQr 
                ? (messageLang === 'es' ? 'Ocultar QR' : 'Hide QR') 
                : (messageLang === 'es' ? 'Mostrar QR' : 'Show QR')}
            </span>
          </div>

          {showQr && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
              <div style={{ background: '#ffffff', padding: 8, border: '1px solid #cbd5e1', borderRadius: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                <img
                  src={qrApiUrl}
                  alt="QR Code"
                  style={{ width: 140, height: 140, display: 'block' }}
                />
              </div>
              <div style={{ fontSize: '0.71rem', color: '#64748b', marginTop: 6, textAlign: 'center' }}>
                Escanee con la cámara de cualquier smartphone para abrir el enlace directamente.
              </div>
            </div>
          )}
        </div>

      </div>
    </StandardDrawer>
  );
}

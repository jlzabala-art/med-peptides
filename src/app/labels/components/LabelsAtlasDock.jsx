'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Printer, 
  Truck, 
  CheckCircle, 
  AlertTriangle, 
  Layers, 
  Search, 
  Send, 
  FileText,
  ShieldCheck,
  Maximize2,
  BookOpen,
  ExternalLink,
  MessageSquare
} from '@/lib/icons';

const PDF_MANUALS = [
  {
    id: 'share',
    title: '1. Share Treatment Guide via WhatsApp',
    sub: 'Send patient guide link after parcel delivery',
    href: '/manuals/Atlas-Labels-Share-User-Manual-EN.pdf',
  },
  {
    id: 'delivery',
    title: '2. Print Bottle & Box Labels (Delivery & QR)',
    sub: 'Lot/BUD, A4/thermal print & SCAN FOR REFILL QR',
    href: '/manuals/Atlas-Delivery-Labels-QR-Manual-EN.pdf',
  },
  {
    id: 'shipping',
    title: '3. Prepare Customs & Courier Labels (Shipping)',
    sub: 'Domestic UAE & GCC/EU international dispatch',
    href: '/manuals/Atlas-Shipping-Customs-Manual-EN.pdf',
  },
  {
    id: 'intake',
    title: '4. Import Rx, Update Status & Country Filter',
    sub: 'Upload Rx, 1-click lifecycle & doctor country filter',
    href: '/manuals/Atlas-Rx-Intake-Lifecycle-Filters-Manual-EN.pdf',
  },
];

const HELP_TOPICS = [
  {
    id: 'workflow',
    icon: Layers,
    manualHref: '/manuals/Atlas-Rx-Intake-Lifecycle-Filters-Manual-EN.pdf',
    manualLabel: 'Manual 4: Import Rx, Status & Country Filter (PDF)',
    titleEs: '1. Flujo de Trabajo y Filtros',
    titleEn: '1. Intake, Lifecycle & Country Filter',
    descEs: 'Importar Rx, filtrar por país del médico y gestionar estados.',
    descEn: 'Import Rx, filter by doctor country, and update parcel lifecycle.',
    contentEs: `
• **Paso 1 - Importar o Buscar:** Pulsa ⌘K o usa el buscador superior para localizar pacientes (#BOX..., nombre, fórmula) o usa **"Import Rx"** / **"Crear Rx"** para nuevas recetas.
• **Paso 2 - Filtrar por País del Médico:** Usa el selector **"All countries ▾"** para aislar recetas por país (UAE, Spain, KSA, etc.) y preparar envíos agrupados.
• **Paso 3 - Diseñar y Etiquetar:** Abre el estudio para imprimir etiquetas **Delivery** (con QR de refill) o **Shipping** (aduana/mensajería).
• **Paso 4 - Ciclo de Vida y WhatsApp:** Marca el estado (**Printed → Dispatched → Delivered**) y, tras la entrega, usa **Share ▾ → Send via WhatsApp**.
    `,
    contentEn: `
• **Step 1 - Intake or Search:** Press ⌘K or search by patient, #BOX code, or formula, or click **"Import Rx"** / **"Create Rx"** to add prescriptions.
• **Step 2 - Filter by Doctor Country:** Use **"All countries ▾"** to filter prescriptions by doctor country (UAE, Spain, KSA, etc.) for courier batching.
• **Step 3 - Print Labels:** Open the studio to print **Delivery** labels (with SCAN FOR REFILL QR) or **Shipping** customs/courier labels.
• **Step 4 - Lifecycle & Share:** Advance status (**Printed → Dispatched → Delivered**), then click **Share ▾ → Send via WhatsApp** once delivered.
    `
  },
  {
    id: 'share',
    icon: MessageSquare,
    manualHref: '/manuals/Atlas-Labels-Share-User-Manual-EN.pdf',
    manualLabel: 'Manual 1: Share Treatment Guide via WhatsApp (PDF)',
    titleEs: '2. Compartir Guía al Paciente (WhatsApp)',
    titleEn: '2. Post-Delivery WhatsApp Sharing',
    descEs: 'Envía el enlace de la guía al paciente tras recibir el paquete.',
    descEn: 'Send the live treatment guide to patients after parcel delivery.',
    contentEs: `
• **Cuándo enviar:** Espera a que el paquete figure como **Delivered** para que el paciente tenga el frasco en la mano al abrir la guía.
• **Botón Share ▾:** En la fila de la tabla, pulsa **Share ▾** y elige **"Send via WhatsApp"** (o **"Copy Guide URL"** / **"Open Patient Guide"**).
• **Control Sent ✓:** Al enviarlo por WhatsApp, la fila marca **Sent ✓** con la hora para evitar duplicados en el equipo.
• **Qué ve el paciente:** Su guía móvil en inglés o español con dosis, conservación y el botón **Request Refill**.
    `,
    contentEn: `
• **When to send:** Wait until the parcel is marked **Delivered** so the patient has the vial in hand when opening the guide.
• **Share ▾ Menu:** In the table row, click **Share ▾** and choose **"Send via WhatsApp"** (or **"Copy Guide URL"** / **"Open Patient Guide"**).
• **Sent ✓ Tracking:** Clicking WhatsApp records **Sent ✓** with a timestamp on the row so teammates do not message twice.
• **Patient View:** Opens the mobile treatment guide (?view=patient&lang=en) with dosing, storage, and **Request Refill**.
    `
  },
  {
    id: 'shipping',
    icon: Truck,
    manualHref: '/manuals/Atlas-Shipping-Customs-Manual-EN.pdf',
    manualLabel: 'Manual 3: Prepare Customs & Courier Labels (PDF)',
    titleEs: '3. Etiquetas de Frasco vs Envío (Aduana)',
    titleEn: '3. Vial Labels vs Shipping & Customs',
    descEs: 'Diferencia entre la etiqueta de la fórmula y la etiqueta del paquete.',
    descEn: 'Difference between formula label and parcel box shipping label.',
    contentEs: `
• **Etiqueta de Frasco / Producto (Delivery):** Se adhiere directamente al vial, bote o gotero. Contiene principios activos, dosis exacta, lote, BUD y **SCAN FOR REFILL QR**.
• **Etiqueta de Envío (Shipping Package):** Se coloca en el exterior de la caja (DHL / mensajería). Incluye remitente Pharmapolis / Atlas, destino, conservación y declaración aduanera para envíos GCC/UE.
• **Cómo cambiar:** En el estudio, selecciona **"Shipping"** o usa el modo de impresión en lote.
    `,
    contentEn: `
• **Vial / Product Label (Delivery):** Affixed directly to vial, bottle, or dropper. Contains APIs, dosage, batch lot, BUD, and **SCAN FOR REFILL QR**.
• **Shipping Package Label:** Used on the outer courier parcel (DHL Express). Includes sender (Pharmapolis / Atlas), delivery address, storage condition flag, and GCC/EU customs declaration.
• **How to switch:** Select **"Shipping"** in the studio variant selector or use batch export.
    `
  },
  {
    id: 'legibility',
    icon: ShieldCheck,
    titleEs: '4. Normativa EU GMP y Legibilidad (pt)',
    titleEn: '4. EU GMP Legibility & Font Sizing (pt)',
    descEs: 'Qué significa el indicador óptico de puntos tipográficos.',
    descEn: 'Understanding the legal optical font point threshold.',
    contentEs: `
• **Estándar Legal:** Las normativas de formulación magistral farmacéutica exigen que los textos clínicos y advertencias no bajen de 4.0 pt (óptimo ≥ 6.0 pt).
• **Indicador Óptico en Vivo:** El estudio calcula en milisegundos el tamaño tipográfico real.
  - **✓ Verde (≥ 4.0 pt):** Totalmente conforme para lectura humana e inspección regulatoria.
  - **⚠️ Rojo (< 4.0 pt):** Alerta de texto excesivo. Se recomienda abreviar descripciones o elegir una etiqueta más grande (ej. 100×50mm).
    `,
    contentEn: `
• **Regulatory Threshold:** Pharmaceutical compounding guidelines require patient directions and warnings not to drop below 4.0 pt (recommended ≥ 6.0 pt).
• **Live Legibility Monitor:** Real-time font calculation:
  - **✓ Green (≥ 4.0 pt):** Legible and compliant for pharmaceutical packaging inspection.
  - **⚠️ Red (< 4.0 pt):** Warning: text too dense. Shorten directions or choose a larger container preset (e.g. 100×50mm).
    `
  },
  {
    id: 'printing',
    icon: Printer,
    manualHref: '/manuals/Atlas-Delivery-Labels-QR-Manual-EN.pdf',
    manualLabel: 'Manual 2: Print Bottle & Box Labels (PDF)',
    titleEs: '5. Formatos de Impresión (Zebra / A4)',
    titleEn: '5. Printers, QR Refill & Export Formats',
    descEs: 'Zebra térmica, hojas A4 troqueladas y PDF vectorial.',
    descEn: 'Zebra thermal, A4 sticker sheets, QR refill, and vector PDF.',
    contentEs: `
• **Zebra ZPL:** Para impresoras térmicas de farmacia y almacén logístico.
• **PDF A4 Multi-Paciente:** Si imprimes en hojas estándar de oficina (A4 con 4, 8 o 10 pegatinas por hoja), usa el botón superior **"Queue Unprinted"** / **"PDF Lote A4"**.
• **PNG 600 DPI y QR Refill:** Cada etiqueta Delivery incluye un QR único **SCAN FOR REFILL** que lleva al paciente directo a su solicitud de reposición.
    `,
    contentEn: `
• **Zebra ZPL:** Optimized for thermal roll label printers in pharmacies and warehouse distribution.
• **A4 Batch Sheet:** Generates an office-ready A4 sheet with multiple labels per page via **"Queue Unprinted"** / batch export.
• **Vector PDF & QR Refill:** Delivery labels embed a unique **SCAN FOR REFILL** QR linking straight to the patient refill request flow.
    `
  }
];

export default function LabelsAtlasDock({
  isEs = true,
  patientQueue = [],
  onOpenSearch,
  onAddFeaturedPatient
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('pls_dock_dismissed_v1') === 'true';
    } catch {
      return false;
    }
  });
  const [activeTopic, setActiveTopic] = useState('workflow');
  const [userQuery, setUserQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState(null);
  const [isThinking, setIsThinking] = useState(false);

  // Keyboard shortcut: Press ? to open help
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAskAtlas = (e) => {
    e.preventDefault();
    if (!userQuery.trim()) return;

    setIsThinking(true);
    setAiAnswer(null);

    const q = userQuery.toLowerCase();
    setTimeout(() => {
      let text;
      let manual = null;
      if (q.includes('whatsapp') || q.includes('compartir') || q.includes('share') || q.includes('sent') || q.includes('entreg') || q.includes('deliver')) {
        manual = PDF_MANUALS[0];
        text = isEs
          ? 'Cuando el paquete figure como "Delivered", haz clic en el botón "Share ▾" de la fila del paciente y elige "Send via WhatsApp". El sistema abrirá WhatsApp con el mensaje listo y marcará "Sent ✓" con la hora para evitar envíos duplicados.'
          : 'Once the parcel status is "Delivered", click "Share ▾" on the patient row and choose "Send via WhatsApp". It opens a pre-filled WhatsApp message with the mobile guide link and logs "Sent ✓" with a timestamp.';
      } else if (q.includes('pais') || q.includes('país') || q.includes('country') || q.includes('filtro') || q.includes('filter') || q.includes('import') || q.includes('status') || q.includes('estado')) {
        manual = PDF_MANUALS[3];
        text = isEs
          ? 'Usa el selector "All countries ▾" junto al buscador para filtrar prescripciones por país del médico (UAE, Spain, KSA, etc.). También puedes subir nuevas recetas con "Import Rx" / "Crear Rx" y avanzar estados (Printed → Dispatched → Delivered) en 1 clic.'
          : 'Use the "All countries ▾" dropdown next to search to filter prescriptions by doctor country (UAE, Spain, KSA, etc.). You can also upload new prescriptions via "Import Rx" / "Create Rx" and update status in 1 click.';
      } else if (q.includes('zebra') || q.includes('termica') || q.includes('impresora') || q.includes('printer') || q.includes('qr') || q.includes('refill') || q.includes('a4')) {
        manual = PDF_MANUALS[1];
        text = isEs
          ? 'Para imprimir etiquetas de frasco o caja con QR de refill ("SCAN FOR REFILL"): abre el estudio y elige "Export > Zebra ZPL", "PNG 600 DPI" o usa "Queue Unprinted" para generar hojas A4 en lote.'
          : 'To print bottle/box Delivery labels with the "SCAN FOR REFILL" QR: open the studio and choose "Export > Zebra ZPL", "600 DPI PNG", or click "Queue Unprinted" for batch A4 sticker sheets.';
      } else if (q.includes('envio') || q.includes('envío') || q.includes('paquete') || q.includes('shipping') || q.includes('dhl') || q.includes('caja') || q.includes('aduana') || q.includes('customs')) {
        manual = PDF_MANUALS[2];
        text = isEs
          ? 'Para etiquetas exteriores de envío (Pharmapolis / DHL) y declaración aduanera GCC/UE: cambia la variante a "Shipping" en el estudio. Incluye origen, destino, conservación y datos aduaneros.'
          : 'For outer parcel courier labels (Pharmapolis / DHL) and GCC/EU customs declarations: switch the variant selector to "Shipping" in the studio.';
      } else if (q.includes('manual') || q.includes('pdf') || q.includes('guia') || q.includes('guía') || q.includes('guide')) {
        manual = PDF_MANUALS[0];
        text = isEs
          ? 'Tienes 4 manuales operativos en PDF (en inglés) integrados aquí abajo y en el menú "Manuals ▾" de la cabecera: (1) WhatsApp Sharing, (2) Delivery & QR Refill, (3) Shipping & Customs, y (4) Rx Intake & Country Filter.'
          : 'All 4 English PDF Operations Manuals are listed below in this drawer and in the top "Manuals ▾" menu: (1) WhatsApp Sharing, (2) Delivery & QR Refill, (3) Shipping & Customs, and (4) Rx Intake & Country Filter.';
      } else if (q.includes('borrar') || q.includes('quitar') || q.includes('delete') || q.includes('remove') || q.includes('eliminar')) {
        text = isEs
          ? 'Puedes quitar cualquier paciente de la cola haciendo clic en el icono "×" de su tarjeta en la barra de lote. Si borras el último, la pantalla volverá al estado limpio.'
          : 'You can remove any patient from the queue by clicking the "×" icon on their pill badge in the batch bar. Removing the last one returns cleanly to the empty search view.';
      } else if (q.includes('tamaño') || q.includes('medida') || q.includes('dimension') || q.includes('mm') || q.includes('size')) {
        manual = PDF_MANUALS[1];
        text = isEs
          ? 'Los tamaños estándar recomendados son: 75×45 mm para frascos goteros y viales estándar; 100×50 mm para sprays tópicos o frascos anchos; y 100×150 mm para etiquetas de caja de envío.'
          : 'Recommended standard presets: 75×45 mm for dropper bottles and standard vials; 100×50 mm for topical sprays; and 100×150 mm for outer parcel shipping.';
      } else {
        manual = PDF_MANUALS[3];
        text = isEs
          ? 'Atlas AI Copilot: Aquí puedes filtrar por país del médico, imprimir etiquetas Delivery (con QR de refill) y Shipping (aduana), actualizar estados y enviar la guía al paciente por WhatsApp tras la entrega. Consulta los 4 manuales PDF abajo.'
          : 'Atlas AI Copilot: Filter by doctor country, print Delivery (with refill QR) & Shipping customs labels, update parcel status, and send post-delivery WhatsApp treatment guides. Open any of the 4 PDF manuals below.';
      }
      setAiAnswer({ text, manual });
      setIsThinking(false);
    }, 350);
  };

  const selectedTopicData = HELP_TOPICS.find((t) => t.id === activeTopic) || HELP_TOPICS[0];

  return (
    <>
      {/* ── Fixed Bottom Bar (GCP Sticky Dock) ── */}
      {isDismissed ? (
        <button
          type="button"
          className="pls-dock-mini-fab"
          onClick={() => {
            setIsDismissed(false);
            setIsOpen(true);
            try {
              localStorage.removeItem('pls_dock_dismissed_v1');
            } catch (err) {
              console.warn('Storage unavailable:', err);
            }
          }}
          title={isEs ? 'Abrir ayuda de Atlas AI (?)' : 'Open Atlas AI Help (?)'}
        >
          <Sparkles size={13} />
          <span>{isEs ? 'Ayuda (?)' : 'Help (?)'}</span>
        </button>
      ) : (
        <footer className="pls-atlas-bottom-dock" role="region" aria-label="Atlas AI Assistant Dock">
          <div className="pls-dock-content">
            {/* Brand Pill Trigger */}
            <button
              type="button"
              className={`pls-dock-trigger-btn ${isOpen ? 'active' : ''}`}
              onClick={() => setIsOpen((prev) => !prev)}
              aria-expanded={isOpen}
              aria-controls="pls-atlas-help-drawer"
              title={isEs ? "Abrir Atlas AI y Guía de Uso (?)" : "Open Atlas AI & Guide (?)"}
            >
              <span className="pls-dock-sparkle-icon">
                <Sparkles size={12} />
              </span>
              <span className="pls-dock-title">
                <strong>Atlas Copilot</strong>
              </span>
              <span className="pls-dock-badge">
                {isEs ? 'Guía' : 'Guide'}
              </span>
            </button>

            {/* Quick Contextual Action Chips (single line, hidden on mobile) */}
            <div className="pls-dock-quick-pills">
              <button
                type="button"
                className="pls-dock-pill"
                onClick={() => {
                  setActiveTopic('workflow');
                  setIsOpen(true);
                }}
              >
                <Layers size={11} />
                <span>{isEs ? '¿Cómo empezar?' : 'How to start?'}</span>
              </button>

              <button
                type="button"
                className="pls-dock-pill"
                onClick={() => {
                  setActiveTopic('shipping');
                  setIsOpen(true);
                }}
              >
                <Truck size={11} />
                <span>{isEs ? 'Etiquetas de Envío' : 'Shipping Labels'}</span>
              </button>

              <button
                type="button"
                className="pls-dock-pill"
                onClick={() => {
                  setActiveTopic('legibility');
                  setIsOpen(true);
                }}
              >
                <ShieldCheck size={11} />
                <span>{isEs ? 'Normativa pt' : 'EU GMP pt'}</span>
              </button>

              <button
                type="button"
                className="pls-dock-pill"
                onClick={() => {
                  setActiveTopic('printing');
                  setIsOpen(true);
                }}
              >
                <Printer size={11} />
                <span>{isEs ? 'Impresoras Zebra / A4' : 'Zebra / A4 Print'}</span>
              </button>
            </div>

            {/* Right Status Badge */}
            <div className="pls-dock-right-meta">
              <span className="pls-dock-status-dot" aria-hidden="true" />
              <span className="pls-dock-status-text">
                {patientQueue.length > 0 
                  ? `${patientQueue.length} ${patientQueue.length === 1 ? (isEs ? 'paciente activo' : 'active patient') : (isEs ? 'pacientes activos' : 'active patients')}`
                  : (isEs ? 'Listo para buscar' : 'Ready to search')}
              </span>
              <span className="pls-dock-shortcut" title={isEs ? 'Atajo de teclado' : 'Keyboard shortcut'}>
                <strong>?</strong>
              </span>
              <button
                type="button"
                className="pls-dock-close-btn"
                onClick={() => {
                  setIsDismissed(true);
                  try {
                    localStorage.setItem('pls_dock_dismissed_v1', 'true');
                  } catch (err) {
                    console.warn('Storage unavailable:', err);
                  }
                }}
                title={isEs ? 'Ocultar barra de estado' : 'Dismiss status bar'}
                aria-label="Dismiss status bar"
              >
                ×
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* ── Slide-Over Help Drawer / Modal ── */}
      {isOpen && (
        <div className="pls-atlas-drawer-backdrop" onClick={() => setIsOpen(false)}>
          <div
            id="pls-atlas-help-drawer"
            className="pls-atlas-drawer"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pls-atlas-drawer-title"
          >
            {/* Drawer Header */}
            <div className="pls-atlas-drawer-header">
              <div className="pls-atlas-drawer-title-wrap">
                <div className="pls-atlas-drawer-icon">
                  <Sparkles size={18} color="#ffffff" />
                </div>
                <div>
                  <h3 id="pls-atlas-drawer-title" className="pls-atlas-drawer-title">
                    Atlas AI
                  </h3>
                  <p className="pls-atlas-drawer-subtitle">
                    {isEs 
                      ? 'Guía interactiva de diseño, normativas EU GMP, envíos y formatos de impresión'
                      : 'Interactive guide for EU GMP compounding labels, courier shipping & printing'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="pls-atlas-drawer-close"
                onClick={() => setIsOpen(false)}
                aria-label={isEs ? 'Cerrar ayuda' : 'Close help'}
              >
                <X size={18} />
              </button>
            </div>

            {/* Interactive Search / Ask Input */}
            <div className="pls-atlas-drawer-search">
              <form onSubmit={handleAskAtlas} className="pls-atlas-drawer-input-row">
                <Search size={15} color="#5f6368" />
                <input
                  type="text"
                  className="pls-atlas-drawer-input"
                  placeholder={isEs ? 'Pregunta a Atlas: "¿Cómo imprimo en Zebra?" o "¿Cómo hago etiquetas de envío?"...' : 'Ask Atlas: "How do I print on Zebra?" or "How do I toggle shipping labels?"...'}
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="pls-atlas-drawer-submit"
                  disabled={isThinking || !userQuery.trim()}
                  title={isEs ? "Consultar a Atlas AI" : "Ask Atlas AI"}
                >
                  <Send size={14} />
                </button>
              </form>

              {/* Dynamic AI Answer Box */}
              {isThinking && (
                <div className="pls-atlas-ai-thinking">
                  <Sparkles size={14} className="pls-spin" />
                  <span>{isEs ? 'Atlas AI está analizando tu consulta...' : 'Atlas AI is generating response...'}</span>
                </div>
              )}

              {aiAnswer && (
                <div className="pls-atlas-ai-answer">
                  <div className="pls-atlas-ai-answer-header">
                    <Sparkles size={14} color="#1a73e8" />
                    <strong>{isEs ? 'Respuesta de Atlas AI:' : 'Atlas AI Guidance:'}</strong>
                  </div>
                  <p>{typeof aiAnswer === 'string' ? aiAnswer : aiAnswer.text}</p>
                  {aiAnswer?.manual && (
                    <a
                      href={aiAnswer.manual.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '8px',
                        padding: '5px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#1a73e8',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      <BookOpen size={12} />
                      <span>{aiAnswer.manual.title} (PDF)</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Tabs for Standard Guide Topics */}
            <div className="pls-atlas-drawer-tabs">
              {HELP_TOPICS.map((topic) => {
                const IconComponent = topic.icon;
                const isActive = activeTopic === topic.id;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    className={`pls-atlas-drawer-tab ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveTopic(topic.id)}
                  >
                    <IconComponent size={14} />
                    <span>{isEs ? topic.titleEs : topic.titleEn}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Topic Body */}
            <div className="pls-atlas-drawer-body">
              <div className="pls-atlas-topic-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                  <h4 style={{ margin: 0 }}>{isEs ? selectedTopicData.titleEs : selectedTopicData.titleEn}</h4>
                  {selectedTopicData.manualHref && (
                    <a
                      href={selectedTopicData.manualHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 9px',
                        borderRadius: '6px',
                        border: '1px solid #dadce0',
                        background: '#ffffff',
                        color: '#1a73e8',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      <BookOpen size={12} />
                      <span>{selectedTopicData.manualLabel}</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
                <p className="pls-atlas-topic-desc">{isEs ? selectedTopicData.descEs : selectedTopicData.descEn}</p>
                <div className="pls-atlas-markdown-content">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(isEs ? selectedTopicData.contentEs : selectedTopicData.contentEn)
                      .trim()
                      .split('\n')
                      .map(line => line.trim())
                      .filter(Boolean)
                      .map((line, lIdx) => {
                        const cleanLine = line.replace(/^[•\-*]\s*/, '').trim();
                        // Step matching
                        const stepMatch = cleanLine.match(/^\*\*([^*]+):(?:\*\*|\s*\*)\s*(.*)$/);
                        if (stepMatch) {
                          const title = stepMatch[1];
                          const body = stepMatch[2];
                          const isWarning = title.toLowerCase().includes('rojo') || title.toLowerCase().includes('red') || title.toLowerCase().includes('aviso');
                          const isSuccess = title.toLowerCase().includes('verde') || title.toLowerCase().includes('green');

                          return (
                            <div
                              key={lIdx}
                              style={{
                                background: isWarning ? '#fef2f2' : isSuccess ? '#f0fdf4' : '#f8fafc',
                                border: `1px solid ${isWarning ? '#fecaca' : isSuccess ? '#bbf7d0' : '#e2e8f0'}`,
                                borderLeft: `4px solid ${isWarning ? '#dc2626' : isSuccess ? '#16a34a' : '#1a73e8'}`,
                                borderRadius: '8px',
                                padding: '10px 14px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{
                                  fontSize: '0.82rem',
                                  fontWeight: 700,
                                  color: isWarning ? '#991b1b' : isSuccess ? '#166534' : '#0f172a'
                                }}>
                                  {title}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.45 }}>
                                {body.split('**').map((part, pIdx) => {
                                  if (pIdx % 2 === 1) {
                                    return <strong key={pIdx} style={{ color: '#0f172a' }}>{part}</strong>;
                                  }
                                  if (part.includes('⌘K')) {
                                    const sub = part.split('⌘K');
                                    return (
                                      <React.Fragment key={pIdx}>
                                        {sub[0]}
                                        <kbd style={{
                                          padding: '1px 5px',
                                          background: '#ffffff',
                                          border: '1px solid #cbd5e1',
                                          borderRadius: '4px',
                                          fontSize: '0.74rem',
                                          fontFamily: 'monospace',
                                          fontWeight: 650,
                                          boxShadow: '0 1px 1px rgba(0,0,0,0.06)'
                                        }}>⌘K</kbd>
                                        {sub[1]}
                                      </React.Fragment>
                                    );
                                  }
                                  return part;
                                })}
                              </div>
                            </div>
                          );
                        }

                        // Regular bullet point
                        return (
                          <div
                            key={lIdx}
                            style={{
                              padding: '8px 12px',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '0.82rem',
                              color: '#334155',
                              lineHeight: 1.45
                            }}
                          >
                            {cleanLine.split('**').map((part, pIdx) => (
                              pIdx % 2 === 1 ? <strong key={pIdx} style={{ color: '#0f172a' }}>{part}</strong> : part
                            ))}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Operations Manuals (PDF · EN) */}
              <div
                style={{
                  marginTop: '14px',
                  padding: '12px 14px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <BookOpen size={14} color="#1a73e8" />
                  <strong style={{ fontSize: '0.8rem', color: '#0f172a' }}>
                    {isEs ? 'Manuales Operativos (PDF · EN)' : 'Operations Manuals (PDF · EN)'}
                  </strong>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                  {PDF_MANUALS.map((m) => (
                    <a
                      key={m.href}
                      href={m.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        padding: '8px 10px',
                        background: '#ffffff',
                        border: '1px solid #dadce0',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        color: '#202124',
                      }}
                    >
                      <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{m.title}</span>
                        <span style={{ fontSize: '0.68rem', color: '#5f6368' }}>{m.sub}</span>
                      </span>
                      <ExternalLink size={12} color="#1a73e8" style={{ flexShrink: 0 }} />
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick Actions Footer inside Drawer */}
              <div className="pls-atlas-drawer-quick-actions">
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                  {isEs ? 'Acciones rápidas:' : 'Quick shortcuts:'}
                </span>
                <button
                  type="button"
                  className="pls-atlas-chip-btn"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenSearch?.();
                  }}
                >
                  <Search size={13} />
                  <span>{isEs ? 'Buscar paciente (⌘K)' : 'Search patient (⌘K)'}</span>
                </button>
                <button
                  type="button"
                  className="pls-atlas-chip-btn"
                  onClick={() => {
                    setIsOpen(false);
                    onAddFeaturedPatient?.('51812');
                  }}
                >
                  <span>{isEs ? 'Cargar caso demo (#51812)' : 'Load sample patient (#51812)'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

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
  Maximize2
} from '@/lib/icons';

const HELP_TOPICS = [
  {
    id: 'workflow',
    icon: Layers,
    titleEs: '1. Flujo de Trabajo (Paso a Paso)',
    titleEn: '1. Workflow (Step-by-Step)',
    descEs: 'Aprende a buscar pacientes, diseñar y exportar etiquetas.',
    descEn: 'Learn how to find patients, design, and export labels.',
    contentEs: `
• **Paso 1 - Añadir Paciente:** Pulsa ⌘K o usa el buscador superior para escribir el nombre del paciente o el código (#51812, #BOX...). Puedes añadir varios al lote.
• **Paso 2 - Elegir Formato:** Selecciona el tamaño adecuado para el frasco (Gotero 75×45mm, Spray 100×50mm, o Etiqueta de Envío).
• **Paso 3 - Personalizar:** Puedes editar la fórmula, fechas de caducidad, lote y advertencias en tiempo real.
• **Paso 4 - Exportar:** Descarga en PNG a 600 DPI, PDF Vectorial, impresión térmica Zebra ZPL o genera una hoja A4 con todas las etiquetas del lote.
    `,
    contentEn: `
• **Step 1 - Add Patient:** Press ⌘K or use top search to enter patient name or file code (#51812, #BOX...). You can add multiple to batch.
• **Step 2 - Select Format:** Pick the appropriate packaging size (Dropper 75×45mm, Spray 100×50mm, or Shipping Label).
• **Step 3 - Customize:** Edit formula text, expiry dates, batch lot number and warnings in real-time.
• **Step 4 - Export:** Download high-res PNG (600 DPI), Vector PDF, Zebra thermal ZPL, or generate an A4 sticker sheet.
    `
  },
  {
    id: 'shipping',
    icon: Truck,
    titleEs: '2. Etiquetas de Frasco vs Envíos Pharmapolis',
    titleEn: '2. Vial Labels vs Shipping Labels',
    descEs: 'Diferencia entre la etiqueta de la fórmula y la etiqueta del paquete.',
    descEn: 'Difference between formula label and parcel box shipping label.',
    contentEs: `
• **Etiqueta de Frasco / Producto (Frontal / Trasera):** Se adhiere directamente al vial, bote o gotero. Contiene los principios activos (APIs), dosis exacta, lote analítico, posología y QR de trazabilidad.
• **Etiqueta de Envío (Shipping Package):** Se utiliza en el exterior del paquete de transporte (DHL / mensajería). Incluye los datos de origen (Pharmapolis / Atlas), dirección de destino, aviso de almacenamiento y declaración aduanera conforme.
• **Cómo cambiar:** En el desplegable de variantes, selecciona **"Etiqueta de Envío"** o activa el modo comparativa.
    `,
    contentEn: `
• **Vial / Product Label (Front / Back):** Affixed directly to vial, bottle, or dropper. Contains Active Pharmaceutical Ingredients (APIs), dosage, batch lot, instructions, and verification QR.
• **Shipping Package Label:** Used on the outer courier parcel (DHL Express). Includes sender (Pharmapolis / Atlas), delivery address, storage condition flag, and customs declaration.
• **How to switch:** Select **"Shipping Label"** in the variant selector or enable the compare mode.
    `
  },
  {
    id: 'legibility',
    icon: ShieldCheck,
    titleEs: '3. Normativa EU GMP y Legibilidad (pt)',
    titleEn: '3. EU GMP Legibility & Font Sizing (pt)',
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
    titleEs: '4. Formatos de Impresión e Impresoras',
    titleEn: '4. Printers & Export Formats',
    descEs: 'Zebra térmica, hojas A4 troqueladas y PDF vectorial.',
    descEn: 'Zebra thermal, A4 sticker sheets, and vector PDF.',
    contentEs: `
• **Zebra ZPL:** Para impresoras térmicas de farmacia y almacén logístico.
• **PDF A4 Multi-Paciente:** Si imprimes en hojas estándar de oficina (A4 con 4, 8 o 10 pegatinas por hoja), usa el botón superior **"PDF Lote A4"**.
• **PNG 600 DPI:** Ideal para previsualización digital, adjuntar a albaranes o enviar por WhatsApp al médico o paciente.
    `,
    contentEn: `
• **Zebra ZPL:** Optimized for thermal roll label printers in pharmacies and warehouse distribution.
• **A4 Batch Sheet:** Generates an office-ready A4 sheet with multiple labels per page (Avery format).
• **Vector PDF / 600 DPI PNG:** Crisp graphics with embedded high-resolution headers for digital sharing.
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
      let response;
      if (q.includes('zebra') || q.includes('termica') || q.includes('impresora') || q.includes('printer')) {
        response = isEs
          ? 'Para imprimir en impresoras Zebra o rollos térmicos de farmacia: selecciona la etiqueta individual y haz clic en "Exportar > Zebra ZPL" o descarga el PNG a 600 DPI que coincide con las dimensiones en milímetros exactas de tu rollo.'
          : 'For Zebra or thermal roll printers: select the individual label and click "Export > Zebra ZPL" or export 600 DPI PNG matching your exact roll millimeter measurements.';
      } else if (q.includes('envio') || q.includes('paquete') || q.includes('shipping') || q.includes('dhl') || q.includes('caja')) {
        response = isEs
          ? 'Para etiquetas de envío de Pharmapolis: cambia el selector de variante a "Etiqueta de Envío". Esto generará el formato exterior con dirección de entrega, remitente Pharmapolis/Atlas, indicador de almacenamiento y código de seguimiento.'
          : 'For Pharmapolis courier labels: switch the variant selector to "Shipping Label". This creates the outer parcel format with delivery address, storage condition badge, and customs notes.';
      } else if (q.includes('borrar') || q.includes('quitar') || q.includes('delete') || q.includes('remove') || q.includes('eliminar')) {
        response = isEs
          ? 'Ahora puedes borrar cualquier paciente de la cola haciendo clic en el icono "×" de su tarjeta en la barra de lote. Si borras el último, la pantalla volverá al estado limpio para que puedas empezar de nuevo.'
          : 'You can remove any patient from the queue by clicking the "×" icon on their pill badge in the batch bar. Removing the last one cleanly returns the screen to the empty search view.';
      } else if (q.includes('tamaño') || q.includes('medida') || q.includes('dimension') || q.includes('mm') || q.includes('size')) {
        response = isEs
          ? 'Los tamaños estándar recomendados son: 75×45 mm para frascos goteros y viales estándar; 100×50 mm para sprays tópicos o frascos anchos; y 100×150 mm para etiquetas de caja de envío.'
          : 'Recommended standard presets: 75×45 mm for dropper bottles and standard vials; 100×50 mm for topical sprays; and 100×150 mm for outer parcel shipping.';
      } else if (q.includes('compartir') || q.includes('share') || q.includes('enlace') || q.includes('url')) {
        response = isEs
          ? 'Haz clic en el botón "Share" en la esquina superior derecha. Copiará el enlace directo con los parámetros de la prescripción actual para que puedas enviarlo por WhatsApp o email a la farmacia o clínica.'
          : 'Click the "Share" button at the top right. It copies the direct deep-link with current prescription parameters ready to send via WhatsApp or email.';
      } else {
        response = isEs
          ? `Atlas AI Copilot: En este estudio puedes buscar pacientes (⌘K), diseñar etiquetas EU GMP con semáforo de legibilidad, generar etiquetas de frasco y de envío, y exportar lotes completos en A4 o Zebra.`
          : `Atlas AI Copilot: In this studio you can search patients (⌘K), design EU GMP compliant labels with live legibility checks, toggle shipping packaging, and export batch sheets.`;
      }
      setAiAnswer(response);
      setIsThinking(false);
    }, 450);
  };

  const selectedTopicData = HELP_TOPICS.find((t) => t.id === activeTopic) || HELP_TOPICS[0];

  return (
    <>
      {/* ── Fixed Bottom Bar (GCP Sticky Dock) ── */}
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
              <Sparkles size={15} />
            </span>
            <span className="pls-dock-title">
              <strong>Atlas AI</strong>
            </span>
            <span className="pls-dock-badge">
              {isEs ? 'Ayuda en vivo' : 'Live Help'}
            </span>
            {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>

          {/* Quick Contextual Action Chips */}
          <div className="pls-dock-quick-pills">
            <button
              type="button"
              className="pls-dock-pill"
              onClick={() => {
                setActiveTopic('workflow');
                setIsOpen(true);
              }}
            >
              <Layers size={12} />
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
              <Truck size={12} />
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
              <ShieldCheck size={12} />
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
              <Printer size={12} />
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
              {isEs ? 'Pulsa' : 'Press'} <strong>?</strong>
            </span>
          </div>
        </div>
      </footer>

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
                  <p>{aiAnswer}</p>
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
                <h4>{isEs ? selectedTopicData.titleEs : selectedTopicData.titleEn}</h4>
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

'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, HelpCircle, Send, ArrowUpRight, ArrowRight, RotateCcw } from 'lucide-react';
import StandardDrawer from './StandardDrawer';
import { useAtlasContext } from '@/context/AtlasContextProvider';
import { useAuth } from '@/context/AuthContext';
import { trackSearchClick } from '@/services/algoliaInsights';

function getRouteQuickPrompts(pathname = '/', isEs = false) {
  if (pathname.startsWith('/labels')) {
    return isEs
      ? [
          '¿Cómo elimino una parte de una prescripción ya importada?',
          '¿Cómo programo o renuevo un refill desde /labels?',
          '¿Qué valida el modo GMP Strict antes de imprimir?',
        ]
      : [
          'How do I remove a part from an imported prescription?',
          'How do I schedule or issue a refill from /labels?',
          'What does GMP Strict Gate check before printing?',
        ];
  }
  if (pathname.startsWith('/dr/')) {
    return isEs
      ? [
          '¿Cómo activo el Modo Consulta para proteger nombres en pantalla?',
          '¿Cómo abro una receta directamente en Label Studio / Refill?',
          '¿Cómo envío la guía del paciente de un péptido?',
        ]
      : [
          'How do I enable Desk Privacy mode during consultations?',
          'How do I open a prescription directly in Label Studio?',
          'How do I share a peptide Patient Guide (?view=patient)?',
        ];
  }
  if (pathname.startsWith('/p/')) {
    return isEs
      ? [
          '¿Cómo comparto la guía bloqueada para pacientes (?view=patient)?',
          '¿Dónde calculo las unidades de jeringa para reconstituir?',
          '¿Cómo consulto los protocolos clínicos asociados a este péptido?',
        ]
      : [
          'How do I share the locked Patient Guide (?view=patient)?',
          'How do I calculate reconstitution syringe units?',
          'How do I view clinical protocols linked to this peptide?',
        ];
  }
  if (pathname.startsWith('/pricing/24genetics')) {
    return isEs
      ? [
          '¿Qué asistente IA de 24Genomics corresponde a cada panel?',
          '¿Cómo solicito una proforma o pack por volumen?',
          '¿Dónde veo los vídeos explicativos de Jun, Julia, Kai, Gaia y Nuria?',
        ]
      : [
          'Which 24Genomics AI Assistant matches each panel?',
          'How do I request a proforma or volume pack?',
          'Where can I watch Jun, Julia, Kai, Gaia & Nuria videos?',
        ];
  }
  return isEs
    ? [
        '¿Cómo navego rápido entre módulos con ⌘K?',
        '¿Cómo comparto el código QR de cualquier pantalla?',
        '¿Cómo creo o importo una prescripción en Atlas?',
      ]
    : [
        'How do I jump quickly between Atlas modules with ⌘K?',
        'How do I share a QR code for any page?',
        'How do I create or import a prescription in Atlas?',
      ];
}

/**
 * HelpDrawer
 * ─────────────────────────────────────────────────────────────────────────────
 * Atlas AI-powered contextual Help & Documentation Drawer.
 * Works both when controlled (`isOpen` / `onClose`) and globally via `?` shortcut
 * or `open-atlas-help-drawer` custom event.
 */
export default function HelpDrawer({ isOpen: controlledIsOpen, onClose: controlledOnClose }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof controlledIsOpen === 'boolean';
  const isOpen = isControlled ? controlledIsOpen : internalOpen;

  const pathname = usePathname() || '/';
  const { screenContext, openAtlasAi } = useAtlasContext();
  const { user, activeRole } = useAuth();
  const isEs = typeof document !== 'undefined' && document.documentElement?.lang === 'es';

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const handleClose = () => {
    if (isControlled) {
      controlledOnClose?.();
    } else {
      setInternalOpen(false);
    }
  };

  // Global listener for `?` shortcut (outside inputs) & `open-atlas-help-drawer`
  useEffect(() => {
    if (isControlled) return undefined;
    const handleOpenEvent = () => setInternalOpen(true);
    const handleKeyDown = (e) => {
      if (pathname.startsWith('/labels')) return; // /labels uses ? for its own Shortcuts modal
      const tag = (e.target?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable) return;
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setInternalOpen((v) => !v);
      }
    };
    window.addEventListener('open-atlas-help-drawer', handleOpenEvent);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('open-atlas-help-drawer', handleOpenEvent);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isControlled, pathname]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const quickPrompts = useMemo(() => getRouteQuickPrompts(pathname, isEs), [pathname, isEs]);

  const askAtlasHelp = async (questionText) => {
    const q = String(questionText || input || '').trim();
    if (!q || loading) return;

    const userMsg = { role: 'user', content: q };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          mode: 'platform_help',
          history: nextHistory.slice(-6).map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            content: m.content,
          })),
          currentUser: user ? { uid: user.uid, role: activeRole || 'operator' } : null,
          context: {
            pathname,
            screenTitle: screenContext?.title || pathname,
            contextAnchor: screenContext?.contextAnchor || {
              sectionTitle: `Atlas Help (${pathname})`,
              mechanisms: 'Platform navigation, clinical workflows, labels, refills, patient guides, and 24Genomics tools.',
            },
          },
        }),
      });
      const data = await res.json();
      const reply =
        data?.reply ||
        data?.answer ||
        data?.message ||
        data?.text ||
        (isEs ? 'No pude generar respuesta en este momento.' : 'Unable to generate a response right now.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: reply,
          matchedEntities: Array.isArray(data?.matchedEntities) ? data.matchedEntities : [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: isEs
            ? 'Error de conexión con Atlas AI. Inténtalo de nuevo.'
            : 'Connection error reaching Atlas AI. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="#1a73e8" />
          <span>{isEs ? 'Ayuda Inteligente · Atlas AI' : 'Atlas AI Contextual Help'}</span>
        </div>
      }
      width="420px"
      bodyPadding="1rem"
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
        {/* Active Screen Context Pill */}
        <div
          style={{
            padding: '10px 12px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
            border: '1px solid #dbeafe',
            fontSize: '0.76rem',
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {screenContext?.title || pathname}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
              {isEs ? 'Asistencia contextual impulsada por Atlas AI' : 'Context-aware assistance powered by Atlas AI'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              handleClose();
              openAtlasAi();
            }}
            style={{
              padding: '5px 9px',
              borderRadius: '6px',
              border: '1px solid #bfdbfe',
              background: '#ffffff',
              color: '#1d4ed8',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              flexShrink: 0,
            }}
          >
            <span>{isEs ? 'Atlas AI' : 'Full AI'}</span>
            <ArrowUpRight size={11} />
          </button>
        </div>

        {/* Route-Aware Suggested Prompts */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              {isEs ? 'Preguntas rápidas de esta pantalla' : 'Suggested for this screen'}
            </span>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => setMessages([])}
                style={{ border: 'none', background: 'none', color: '#64748b', fontSize: '0.7rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              >
                <RotateCcw size={11} />
                <span>{isEs ? 'Limpiar' : 'Clear'}</span>
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={loading}
                onClick={() => askAtlasHelp(prompt)}
                style={{
                  textAlign: 'left',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: loading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                }}
              >
                <HelpCircle size={13} color="#1a73e8" style={{ flexShrink: 0 }} />
                <span>{prompt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Thread */}
        <div
          style={{
            flex: 1,
            minHeight: '180px',
            overflowY: 'auto',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            background: '#f8fafc',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {messages.length === 0 ? (
            <div style={{ fontSize: '0.78rem', color: '#64748b', textAlign: 'center', margin: 'auto 0', padding: '16px' }}>
              {isEs
                ? 'Haz cualquier pregunta sobre cómo usar esta pantalla, protocolos, prescripciones o herramientas de Atlas.'
                : 'Ask anything about how to use this screen, clinical protocols, prescriptions, or Atlas workflows.'}
            </div>
          ) : (
            messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '90%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div
                  style={{
                    padding: '8px 11px',
                    borderRadius: '10px',
                    background: m.role === 'user' ? '#1a73e8' : '#ffffff',
                    color: m.role === 'user' ? '#ffffff' : '#0f172a',
                    border: m.role === 'user' ? 'none' : '1px solid #e2e8f0',
                    fontSize: '0.8rem',
                    lineHeight: 1.45,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {m.content}
                </div>
                {m.role === 'assistant' && Array.isArray(m.matchedEntities) && m.matchedEntities.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {m.matchedEntities.slice(0, 3).map((ent, entIdx) => (
                      <Link
                        key={`${ent.type}-${ent.objectID}-${entIdx}`}
                        href={ent.href}
                        onClick={() => {
                          trackSearchClick({
                            indexName: ent.type === 'protocol' ? 'protocols' : 'products',
                            objectID: ent.objectID,
                            position: entIdx + 1,
                            eventName: 'Atlas Help Grounded Card Clicked',
                          });
                          handleClose();
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid #bfdbfe',
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        <span>{ent.title}</span>
                        <ArrowRight size={11} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div style={{ fontSize: '0.76rem', color: '#1a73e8', fontWeight: 600 }}>
              {isEs ? 'Atlas AI está pensando...' : 'Atlas AI is thinking...'}
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            askAtlasHelp();
          }}
          style={{ display: 'flex', gap: '6px' }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isEs ? 'Pregunta a Atlas AI sobre esta pantalla...' : 'Ask Atlas AI about this screen...'}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label={isEs ? 'Enviar pregunta' : 'Send question'}
            style={{
              padding: '0 12px',
              borderRadius: '8px',
              border: 'none',
              background: '#1a73e8',
              color: '#ffffff',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </StandardDrawer>
  );
}

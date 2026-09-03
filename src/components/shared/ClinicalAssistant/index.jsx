"use client";
/* eslint-disable no-unused-vars */

import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect, useMemo, useRef } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { getActiveProducts } from '../../../repositories/productRepository';
import { getAllProtocols } from '../../../repositories/protocolRepository';
import { buildProtocolIndex } from '../../../utils/searchEngine';
import { buildCatalogIndex } from '../../../utils/classifyQuery';
import { useClinicalAIConfig } from '../../../hooks/useClinicalAIConfig';
import BottomSheet from '../BottomSheet';
import { useClinicalAI } from './useClinicalAI';
import { useAtlasContext } from '@/hooks/shared/useAtlasContext';








// Components
import ChatHeader from './components/ChatHeader';
import ChatMessageList from './components/ChatMessageList';
import ChatInputBar from './components/ChatInputBar';
import QuickMatchChip from './components/QuickMatchChip';
import InstantResultsTabs from './components/InstantResultsTabs';
import SupportEscalationCard from './components/SupportEscalationCard';
// import ChatFAB from './components/ChatFAB';
import ChatSuggestions from './components/ChatSuggestions';
import ContextActionCards from './components/ContextActionCards';
import SessionHistoryDrawer from './components/SessionHistoryDrawer';
import ResearchDetailDrawer from './components/ResearchDetailDrawer';
import { Scale, PanelLeft, Plus, Trash2, History, Sparkles, BookOpen, X } from '@/lib/icons';

export default function ClinicalAssistant({ 
  isOpen: externalIsOpen, 
  setIsOpen: externalSetIsOpen, 
  embedded = false, 
  pageContext = null, 
  contextMode: passedContextMode, 
  agentType: passedAgentType, 
  suggestedPrompts: passedSuggestedPrompts 
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalSetIsOpen || setInternalIsOpen;

  const atlasContext = useAtlasContext();
  const contextMode = passedContextMode || atlasContext.contextMode;
  const agentType = passedAgentType || atlasContext.agentType;
  const suggestedPrompts = passedSuggestedPrompts && passedSuggestedPrompts.length > 0 ? passedSuggestedPrompts : atlasContext.suggestedPrompts;
  const contextActions = atlasContext.contextActions || [];
  
  const themeAccent = atlasContext.themeAccent;
  const themeBgActive = atlasContext.themeBgActive;

  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile } = useAuth();

  

  
  const [products, setProducts] = useState(() => {
    try {
      if (typeof window === 'undefined') return [];
      const saved = localStorage.getItem('regenpept_products_cache_v4');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [protocols, setProtocols] = useState(() => {
    try {
      if (typeof window === 'undefined') return [];
      const saved = localStorage.getItem('regenpept_protocols_cache');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  const [showSupportCard, setShowSupportCard] = useState(false);
  const [supportContext, setSupportContext] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBeginnerMode, setIsBeginnerMode] = useState(userProfile?.researchLevel === 'beginner');
  const [deepDiveData, setDeepDiveData] = useState(null);
  const [isDeepDiveOpen, setIsDeepDiveOpen] = useState(false);
  const [comparisonSelection, setComparisonSelection] = useState([]);
  const [isPulsing, setIsPulsing] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isPulsing) return;
    const handleClick = (e) => {
      // Si el clic no es dentro del contenedor de ChatInputBar o de un elemento del assistant
      if (!e.target.closest('.clinical-assistant-container')) {
        setIsPulsing(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isPulsing]);

  const handleCompare = (compoundName) => {
    setComparisonSelection(prev => {
      if (prev.includes(compoundName)) return prev;
      const newSelection = [...prev, compoundName];
      if (newSelection.length === 2) {
        handleSend(`Compare ${newSelection[0]} and ${newSelection[1]}`);
        return [];
      }
      return newSelection;
    });
  };

  const toggleDeepDive = (data) => {
    setDeepDiveData(data);
    setIsDeepDiveOpen(!!data);
  };

  const protocolIndex = useMemo(() => buildProtocolIndex(protocols), [protocols]);
  const catalogIndex = useMemo(() => buildCatalogIndex(products), [products]);
  const { clinicalConfig } = useClinicalAIConfig();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    const loadData = async () => {
      try {
        const [prodData, protData] = await Promise.all([getActiveProducts(), getAllProtocols()]);
        setProducts(prodData);
        setProtocols(protData);
        // We do not manually set localStorage here because getActiveProducts and getAllProtocols
        // should handle their own Layer 2 caching via cacheManager.
      } catch (err) {
        console.warn("Failed to load catalog data for Clinical Assistant:", err);
      }
    };
    loadData();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleNavInternal = (e) => {
      const href = e.detail?.href;
      if (href) {
        router.push(href);
        setIsOpen(false);
      }
    };
    window.addEventListener('nav:internal', handleNavInternal);
    return () => window.removeEventListener('nav:internal', handleNavInternal);
  }, [router, setIsOpen]);




  const {
    messages,
    isLoading,
    isTyping,
    input,
    setInput,
    suggestions,
    quickMatch,
    setQuickMatch,
    clearSession,
    exportSession,
    handleSend,
    rateMessage,
    scrollRef,
    messagesEndRef,
    hasNewActivity,
    setHasNewActivity,
    getSessionSummary,
    sessions,
    sessionId,
    createNewSession,
    loadSession,
    deleteSession,
    emailSession,
    queriesToday,
    maxFreeQueries,
    autocompleteCandidates,
    handleConfirmAction,
    handleUploadPrice,
    handleUploadStock,
    setMessages,
    dynamicPageContext,
    clearActiveContext
  } = useClinicalAI({
    products,
    protocolIndex,
    catalogIndex,
    userCtx: userProfile,
    protocols,
    clinicalConfig,
    isHistoryOpen,
    isOpen,
    setIsOpen,
    isBeginnerMode,
    contextMode,
    maybeShowSupport: (ctx) => {
      setShowSupportCard(true);
      setSupportContext(ctx);
    },
    externalPageContext: pageContext,
    agentType
  });

  // Keep a stable ref to handleSend — avoids re-registering event listeners on every render
  const handleSendRef = useRef(null);
  useEffect(() => {
    handleSendRef.current = handleSend;
  }, [handleSend]);

  useEffect(() => {
    const handleContextEvent = (e) => {
      const product = e.detail?.product;
      const sku = e.detail?.sku;
      const prompt = e.detail?.prompt;

      if (prompt && typeof setInput === 'function') {
        if (typeof handleSend === 'function') {
          // Si el Assistant está listo, enviamos el prompt automáticamente
          handleSend(prompt);
        } else {
          setInput(prompt);
        }
        setIsPulsing(true);
      } else if (product && typeof setMessages === 'function') {
        setTimeout(() => {
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.content.includes(product)) return prev;
            return [
              ...prev,
              {
                role: 'assistant',
                content: `**Clinical Mode Activated**\n\nI have received the context for the product **${product}**${sku ? ` (SKU: ${sku})` : ''}. What medical question or protocol would you like to consult?`,
                timestamp: new Date()
              }
            ];
          });
          setIsPulsing(true);
          // Focus input after a short delay
          setTimeout(() => {
            const inputEl = document.querySelector('.clinical-assistant-container input[type="text"], .clinical-assistant-container textarea');
            if (inputEl) inputEl.focus();
          }, 400);

        }, 100);
      }
    };
    window.addEventListener('OPEN_ATLAS_CLINICAL_MODE', handleContextEvent);

    const handleShortcutPrompt = (e) => {
      const prompt = e.detail?.prompt;
      if (prompt && typeof setInput === 'function') {
        setInput(prompt);
        setIsPulsing(true);
        setTimeout(() => {
          const inputEl = document.querySelector('.clinical-assistant-container input[type="text"], .clinical-assistant-container textarea');
          if (inputEl) {
            inputEl.focus();
          }
        }, 400);
      }
    };
    window.addEventListener('ai-shortcut-prompt', handleShortcutPrompt);

    const handleAtlasPrefillQuery = (e) => {
      const query = e.detail?.query;
      const autoSend = e.detail?.autoSend === true;
      if (query && typeof setInput === 'function') {
        setIsOpen(true);
        setIsPulsing(true);
        if (autoSend) {
          // Open first, then send after drawer animation settles using latest handleSend via ref
          setTimeout(() => {
            if (typeof handleSendRef.current === 'function') {
              handleSendRef.current(query);
            }
          }, 500);
        } else {
          setInput(query);
          setTimeout(() => {
            const inputEl = document.querySelector('.clinical-assistant-container input[type="text"], .clinical-assistant-container textarea');
            if (inputEl) inputEl.focus();
          }, 400);
        }
      }
    };
    window.addEventListener('ATLAS_PREFILL_QUERY', handleAtlasPrefillQuery);

    const handleOpenAiChat = (e) => {
      const ctx = e.detail?.context || {};
      const patientName = ctx.name || ctx.patientName || 'Selected Patient';
      const patientId = ctx.patientId || ctx.id || '';

      setIsOpen(true);
      setIsPulsing(true);

      setTimeout(() => {
        if (typeof setMessages === 'function') {
          setMessages(prev => {
            const alreadyLoaded = prev.some(m => m.content && m.content.includes(patientName));
            if (alreadyLoaded) return prev;
            return [
              ...prev,
              {
                role: 'assistant',
                content: `**Patient AI Quick View** 🩺\n\nClinical record loaded for **${patientName}**${patientId ? ` (ID: \`${patientId}\`)` : ''}.\n\nHow can I help with this patient? You can ask me to:\n- 📋 *Summarize medical history & active protocols*\n- 💊 *Check dosage recommendations & treatment duration*\n- ⚠️ *Screen for contraindications & drug interactions*\n- 📝 *Draft a new prescription*`,
                timestamp: new Date()
              }
            ];
          });
        }
        const inputEl = document.querySelector('.clinical-assistant-container input[type="text"], .clinical-assistant-container textarea');
        if (inputEl) inputEl.focus();
      }, 300);
    };
    window.addEventListener('open-ai-chat', handleOpenAiChat);

    return () => {
      window.removeEventListener('OPEN_ATLAS_CLINICAL_MODE', handleContextEvent);
      window.removeEventListener('ai-shortcut-prompt', handleShortcutPrompt);
      window.removeEventListener('ATLAS_PREFILL_QUERY', handleAtlasPrefillQuery);
      window.removeEventListener('open-ai-chat', handleOpenAiChat);
    };
  }, [setIsOpen, setMessages, setInput]); // handleSend omitted: stable via handleSendRef in useClinicalAI

  const isProductPage = /^\/product\//.test(pathname);

  // Prevent auto-keyboard on mobile when drawer is opened or loading states change
  useEffect(() => {
    if (isMobile && isOpen) {
      const dismissKeyboard = () => {
        if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
          document.activeElement.blur();
        }
      };
      const timer = setTimeout(dismissKeyboard, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMobile]);

  useEffect(() => {
    if (isMobile) {
      const dismissKeyboard = () => {
        if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
          document.activeElement.blur();
        }
      };
      dismissKeyboard();
      const timer = setTimeout(dismissKeyboard, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isMobile]);

  const renderChatContent = () => (
    <div className={`clinical-assistant-container${isPulsing ? ' atlas-pulsing' : ''}`} style={{ 
      display: 'flex', 
      flexDirection: 'row', 
      height: '100%', 
      width: '100%',
      overflow: 'hidden', 
      position: 'relative',
      backgroundColor: 'var(--color-bg-surface)'
    }}>
      {/* ─── ChatGPT-Style Collapsible History Sidebar (Desktop Only) ─── */}
      {!isMobile && isHistoryOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 260, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={{
            width: '260px',
            backgroundColor: '#f8f9fa', // Google Cloud Console light grey sidebar
            color: '#202124',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid #dadce0',
            height: '100%',
            flexShrink: 0,
            overflow: 'hidden',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 20,
            boxShadow: '4px 0 15px rgba(0,0,0,0.05)'
          }}
        >
          {/* New Chat Button */}
          <div style={{ padding: '0.85rem' }}>
            <button
              onClick={() => {
                createNewSession();
                if (setIsOpen) setIsOpen(false);
              }}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #dadce0',
                backgroundColor: 'white',
                color: themeAccent,
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s',
                outline: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#f1f3f4';
                e.currentTarget.style.borderColor = themeAccent;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#dadce0';
              }}
            >
              <Plus size={16} />
              <span>New Chat</span>
            </button>
          </div>

          {/* Chat History List */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '0.5rem 0.5rem 0.5rem 0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            scrollbarWidth: 'none'
          }}>
            <div style={{ 
              fontSize: '0.62rem', 
              fontWeight: 850, 
              textTransform: 'uppercase', 
              color: '#5f6368', 
              marginBottom: '0.5rem', 
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <History size={11} />
              <span>Research History</span>
            </div>
            {sessions.length === 0 ? (
              <div style={{ fontSize: '0.7rem', color: '#5f6368', padding: '0.5rem', fontStyle: 'italic' }}>
                No active sessions
              </div>
            ) : (
              sessions.map(s => {
                const isActive = s.id === sessionId;
                return (
                  <div
                    key={s.id}
                    onClick={() => loadSession(s.id)}
                    style={{
                      padding: '0.55rem 0.65rem',
                      borderRadius: '8px',
                      backgroundColor: isActive ? themeBgActive : 'transparent',
                      color: isActive ? themeAccent : '#3c4043',
                      cursor: 'pointer',
                      fontSize: '0.74rem',
                      fontWeight: isActive ? 700 : 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      position: 'relative'
                    }}
                    onMouseEnter={e => {
                      if (!isActive) e.currentTarget.style.backgroundColor = '#f1f3f4';
                    }}
                    onMouseLeave={e => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span style={{ 
                      flex: 1, 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      marginRight: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ opacity: isActive ? 1 : 0.6 }}>💬</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {s.title || (contextMode === 'admin' ? 'Admin Session' : contextMode === 'doctor' ? 'Clinical Session' : 'Research Session')}
                      </span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(s.id);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: isActive ? themeAccent : '#9aa0a6',
                        cursor: 'pointer',
                        fontSize: '0.74rem',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = '#d93025';
                        e.currentTarget.style.backgroundColor = '#fce8e6';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = isActive ? themeAccent : '#9aa0a6';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      title="Delete Session"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar Footer */}
          <div style={{ 
            padding: '0.85rem', 
            borderTop: '1px solid #dadce0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
          }}>
            <button
              onClick={() => setIsBeginnerMode(!isBeginnerMode)}
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                borderRadius: '8px',
                backgroundColor: 'white',
                border: '1px solid #dadce0',
                color: '#3c4043',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                outline: 'none'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f3f4'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
            >
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isBeginnerMode ? '#1e8e3e' : themeAccent,
              }} />
              <span>{isBeginnerMode ? '🔰 Beginner Mode' : '🔬 Expert Mode'}</span>
            </button>
            <div style={{ fontSize: '0.6rem', color: '#80868b', textAlign: 'center', fontWeight: 500, letterSpacing: '0.02em' }}>
              Atlas Health Assistant v4.5
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Main Chat View Panel ─── */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        overflow: 'hidden', 
        position: 'relative',
        backgroundColor: 'var(--color-bg-surface)'
      }}>
        <ChatHeader 
          onClear={clearSession} 
          onExport={exportSession} 
          onEmail={emailSession}
          onClose={() => setIsOpen(false)} 
          onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
          isBeginnerMode={isBeginnerMode}
          onToggleBeginner={() => setIsBeginnerMode(!isBeginnerMode)}
          isMobile={isMobile} 
          messagesCount={messages.length}
          messages={messages}
          isHistoryOpen={isHistoryOpen}
          queriesToday={queriesToday}
          maxFreeQueries={maxFreeQueries}
          isRegistered={!!user}
          role={userProfile?.role}
          contextMode={contextMode}
          pageContext={dynamicPageContext || pageContext}
        />
        {(() => {
          const effectiveContext = dynamicPageContext || pageContext;
          if (!effectiveContext) return null;

          const isPatientContext = effectiveContext.mode === 'patient' || effectiveContext.isPatientContext || Boolean(effectiveContext.patientId);
          const isProductContext = !isPatientContext && (
            effectiveContext.isProductPage || 
            Boolean(effectiveContext.productName) ||
            (typeof window !== 'undefined' && (window.location.pathname.startsWith('/product/') || window.location.pathname.startsWith('/supplements/')))
          );

          const entityTitle = effectiveContext.name || effectiveContext.productName || effectiveContext.entityName || (messages[0]?.content?.match(/about\s+([A-Za-z0-9-]+)/i)?.[1]) || 'Patient Chart';
          const variantCount = effectiveContext.variants?.length || 0;
          const category = effectiveContext.clinic || effectiveContext.category || '';

          return (
            <div style={{
              padding: '0.45rem 1rem',
              backgroundColor: isPatientContext ? 'rgba(13, 148, 136, 0.06)' : isProductContext ? 'rgba(124, 58, 237, 0.05)' : 'var(--surface-raised, #f8fafc)',
              borderBottom: `1px solid ${isPatientContext ? 'rgba(13, 148, 136, 0.18)' : isProductContext ? 'rgba(124, 58, 237, 0.15)' : 'var(--border-light, #e2e8f0)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              fontSize: '0.76rem',
              color: isPatientContext ? '#0d9488' : isProductContext ? '#7c3aed' : 'var(--text-muted, #64748b)',
              fontWeight: 600
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                <span style={{ fontSize: '0.9rem' }}>{isPatientContext ? '🩺' : isProductContext ? '🧬' : '📋'}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <span>{isPatientContext ? 'Active Patient:' : isProductContext ? 'Active Focus:' : 'Context:'}</span>
                  <strong style={{ color: isPatientContext ? '#0f766e' : isProductContext ? '#5b21b6' : '#0f172a' }}>{entityTitle}</strong>
                  {variantCount > 0 && (
                    <span style={{
                      fontSize: '0.68rem',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(124, 58, 237, 0.1)',
                      color: '#6d28d9',
                      fontWeight: 700
                    }}>
                      {variantCount} {variantCount === 1 ? 'format' : 'formats'}
                    </span>
                  )}
                  {category && (
                    <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>· {category}</span>
                  )}
                </div>
              </div>
              <button
                onClick={clearActiveContext}
                title="Clear patient focus and return to general assistant"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isPatientContext ? '#0d9488' : isProductContext ? '#8b5cf6' : 'var(--text-muted, #94a3b8)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  fontSize: '0.70rem',
                  fontWeight: 700,
                  gap: '4px',
                  transition: 'all 0.2s',
                  backgroundColor: 'rgba(0,0,0,0.03)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#ef4444';
                  e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = isPatientContext ? '#0d9488' : isProductContext ? '#8b5cf6' : '#94a3b8';
                  e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)';
                }}
              >
                <span>Clear Focus</span>
                <X size={12} />
              </button>
            </div>
          );
        })()}
        {isMobile && (
          <SessionHistoryDrawer 
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            sessions={sessions}
            activeSessionId={sessionId}
            onLoadSession={loadSession}
            onNewSession={createNewSession}
            onDeleteSession={deleteSession}
            contextMode={contextMode}
            themeAccent={themeAccent}
            themeBgActive={themeBgActive}
          />
        )}

        {/* Role-specific starter prompts (shown only when chat is empty) */}
        {messages.length === 0 && !isLoading && (() => {
          const isProductContext = pageContext?.isProductPage || 
            Boolean(pageContext?.name || pageContext?.productName || pageContext?.entityName) ||
            (typeof window !== 'undefined' && (window.location.pathname.startsWith('/product/') || window.location.pathname.startsWith('/supplements/'))) ||
            messages.some(m => m.content && /\b(retatrutide|tirzepatide|semaglutide|bpc-157|tb-500|cjc-1295|ipamorelin|aod-9604|epithalon|semax|selank|nad\+|motc-c|dosage|mechanism|peptide|protocol|vial|reconstitution)\b/i.test(m.content));

          const displayPrompts = isProductContext ? [
            { label: '🔬 Scientific Mechanism of Action', prompt: 'Tell me about the molecular mechanism of action for this product.' },
            { label: '💊 Recommended Research Dosage', prompt: 'What are the studied clinical research dosages and protocols?' },
            { label: '✨ Is this right for me?', prompt: 'Can you ask me 3 simple questions about my health goals to evaluate if this peptide fits my needs?' },
            { label: '🧊 Reconstitution & Storage Guide', prompt: 'How do I reconstitute and store this product properly?' }
          ] : suggestedPrompts;

          if (!displayPrompts || displayPrompts.length === 0) return null;

          return (
            <div style={{ padding: '1rem 1.25rem 0.5rem', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem', opacity: 0.7 }}>
                {isProductContext ? 'Product Inquiry Starters' : 'Suggested Actions'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {displayPrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(p.prompt || p.label)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '999px',
                      backgroundColor: 'rgba(0,0,0,0.03)',
                      border: `1.5px solid ${themeAccent}33`,
                      color: themeAccent,
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.18s',
                      whiteSpace: 'nowrap',
                      lineHeight: 1.3
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = `${themeAccent}15`;
                      e.currentTarget.style.borderColor = themeAccent;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)';
                      e.currentTarget.style.borderColor = `${themeAccent}33`;
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {messages.length <= 1 && !pageContext?.isProductPage && !(pageContext?.name || pageContext?.productName || pageContext?.entityName) && !(typeof window !== 'undefined' && (window.location.pathname.startsWith('/product/') || window.location.pathname.startsWith('/supplements/'))) && !messages.some(m => m.content && /\b(retatrutide|tirzepatide|semaglutide|bpc-157|tb-500|cjc-1295|ipamorelin|aod-9604|epithalon|semax|selank|nad\+|motc-c|dosage|mechanism|peptide|protocol|vial|reconstitution)\b/i.test(m.content)) && (
          <ContextActionCards cards={contextActions} onActionClick={(id, label, prompt) => handleSend(prompt || label)} />
        )}

        <ChatMessageList 
          messages={messages}
          isLoading={isLoading}
          isTyping={isTyping}
          scrollRef={scrollRef}
          messagesEndRef={messagesEndRef}
          InstantResultsTabs={(props) => <InstantResultsTabs {...props} onCompare={handleCompare} />}
          navigate={(path) => { router.push(path); setIsOpen(false); }}
          setIsOpen={setIsOpen}
          onSend={handleSend}
          onRate={rateMessage}
          onDeepDive={toggleDeepDive}
          contextMode={contextMode}
          onConfirmAction={handleConfirmAction}
          pageContext={dynamicPageContext || pageContext}
        />

        <AnimatePresence>
          {comparisonSelection.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              style={{
                position: 'absolute', bottom: '6rem', left: '50%', transform: 'translateX(-50%)',
                width: '90%', maxWidth: '800px',
                backgroundColor: 'var(--primary)', color: 'white',
                padding: '0.75rem 1rem', borderRadius: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: '0 8px 24px rgba(0,75,135,0.2)', zIndex: 100
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Scale size={16} />
                <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                  Comparing <strong>{comparisonSelection[0]}</strong> + ...
                </span>
              </div>
              <button 
                onClick={() => setComparisonSelection([])}
                style={{ background: 'none', border: 'none', color: 'white', opacity: 0.7, cursor: 'pointer', fontSize: '0.65rem' }}
              >
                Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <QuickMatchChip 
          quickMatch={quickMatch}
          onDismiss={() => setQuickMatch(null)}
          onAdd={() => { setIsOpen(false); }}
          isLoading={isLoading}
          isTyping={isTyping}
        />
        <ResearchDetailDrawer 
          isOpen={isDeepDiveOpen}
          onClose={() => setIsDeepDiveOpen(false)}
          data={deepDiveData}
        />
        <div style={{
          width: '100%',
          maxWidth: '820px',
          margin: '0 auto',
          padding: '0 1.5rem',
          boxSizing: 'border-box'
        }}>
          <ChatInputBar 
            input={input}
            setInput={setInput}
            onSend={handleSend}
            isLoading={isLoading}
            products={products}
            autocompleteCandidates={autocompleteCandidates}
            voiceSupported={typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)}
            messages={messages}
            suggestions={suggestions}
            isTyping={isTyping}
            contextMode={contextMode}
            pageContext={pageContext}
            onUploadPrice={handleUploadPrice}
            onUploadStock={handleUploadStock}
          />
        </div>
        {/* Widget Watermark */}
        <div style={{ textAlign: 'right', fontSize: '10px', color: 'var(--text-muted)', opacity: 0.5, padding: '0 1rem 0.5rem 0', position: 'absolute', bottom: 0, right: 0, zIndex: 10 }}>
          Widget: ClinicAIWidget (Agent: {agentType})
        </div>
      </div>
    </div>
  );


  if (!mounted) return null;

  if (embedded) {
    return (
      <div className="embedded-clinical-assistant" style={{ 
        height: '100%', 
        border: '1px solid var(--border)', 
        borderRadius: '12px', 
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {renderChatContent()}
        <SupportEscalationCard 
          showSupportCard={showSupportCard}
          isOpen={isOpen}
          dismissSupportCard={() => setShowSupportCard(false)}
          buildWhatsAppUrl={() => `https://wa.me/medpeptides?text=${getSessionSummary()}`}
          trackSupportEvent={() => {}}
          trackAIToWhatsApp={() => {}}
          sessionId={sessionId}
          messagesSent={messages.length}
        />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes siriPulseEdge {
          0% { box-shadow: 0 0 10px rgba(79, 70, 229, 0.3), inset 0 0 10px rgba(79, 70, 229, 0.3); border: 2px solid rgba(79, 70, 229, 0.5); }
          50% { box-shadow: 0 0 40px rgba(79, 70, 229, 0.9), inset 0 0 20px rgba(79, 70, 229, 0.6); border: 2px solid rgba(79, 70, 229, 1); }
          100% { box-shadow: 0 0 10px rgba(79, 70, 229, 0.3), inset 0 0 10px rgba(79, 70, 229, 0.3); border: 2px solid rgba(79, 70, 229, 0.5); }
        }
        .pulse-active {
          animation: siriPulseEdge 2s infinite ease-in-out;
        }
      `}</style>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                backdropFilter: 'blur(4px)',
                zIndex: 9990,
              }}
            />
            {/* Right-aligned Drawer Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: isMobile ? '100vw' : '520px',
                backgroundColor: 'white',
                boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 9995,
                overflow: 'hidden',
                borderLeft: '1px solid rgba(0,0,0,0.08)'
              }}
              className={isPulsing ? 'pulse-active' : ''}
            >
              {renderChatContent()}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SupportEscalationCard 
        showSupportCard={showSupportCard}
        isOpen={isOpen}
        dismissSupportCard={() => setShowSupportCard(false)}
        buildWhatsAppUrl={() => `https://wa.me/medpeptides?text=${getSessionSummary()}`}
        trackSupportEvent={() => {}}
        trackAIToWhatsApp={() => {}}
        sessionId={sessionId}
        messagesSent={messages.length}
      />
    </>
  );
}

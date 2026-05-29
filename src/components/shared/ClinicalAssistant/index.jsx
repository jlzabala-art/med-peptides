/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { getActiveProducts } from '../../../repositories/productRepository';
import { getAllProtocols } from '../../../repositories/protocolRepository';
import { buildProtocolIndex } from '../../../utils/searchEngine';
import { buildCatalogIndex } from '../../../utils/classifyQuery';
import { useClinicalAIConfig } from '../../../hooks/useClinicalAIConfig';
import BottomSheet from '../BottomSheet';
import { useClinicalAI } from './useClinicalAI';
import { Scale, PanelLeft, Plus, Trash2, History, Sparkles, BookOpen } from 'lucide-react';

// Components
import ChatHeader from './components/ChatHeader';
import ChatMessageList from './components/ChatMessageList';
import ChatInputBar from './components/ChatInputBar';
import QuickMatchChip from './components/QuickMatchChip';
import InstantResultsTabs from './components/InstantResultsTabs';
import SupportEscalationCard from './components/SupportEscalationCard';
// import ChatFAB from './components/ChatFAB';
import ChatSuggestions from './components/ChatSuggestions';
import SessionHistoryDrawer from './components/SessionHistoryDrawer';
import ResearchDetailDrawer from './components/ResearchDetailDrawer';

export default function ClinicalAssistant({ isOpen, setIsOpen, embedded = false, pageContext = null, contextMode = 'clinical', agentType = 'default' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  const themeAccent = useMemo(() => {
    if (contextMode === 'admin') return '#1a73e8'; // Google Blue
    if (contextMode === 'doctor') return '#0f9d58'; // Google Green
    return '#4285f4'; // Google Light Blue
  }, [contextMode]);

  const themeBgActive = useMemo(() => {
    if (contextMode === 'admin') return '#e8f0fe';
    if (contextMode === 'doctor') return '#e6f4ea';
    return '#e8f0fe';
  }, [contextMode]);
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('regenpept_products_cache');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [protocols, setProtocols] = useState(() => {
    try {
      const saved = localStorage.getItem('regenpept_protocols_cache');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showSupportCard, setShowSupportCard] = useState(false);
  const [supportContext, setSupportContext] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBeginnerMode, setIsBeginnerMode] = useState(userProfile?.researchLevel === 'beginner');
  const [deepDiveData, setDeepDiveData] = useState(null);
  const [isDeepDiveOpen, setIsDeepDiveOpen] = useState(false);
  const [comparisonSelection, setComparisonSelection] = useState([]);

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
        localStorage.setItem('regenpept_products_cache', JSON.stringify(prodData));
        localStorage.setItem('regenpept_protocols_cache', JSON.stringify(protData));
      } catch (err) {
        console.warn("Failed to refresh catalog data, relying on local cache:", err);
      }
    };
    loadData();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleNavInternal = (e) => {
      const href = e.detail?.href;
      if (href) {
        navigate(href);
        setIsOpen(false);
      }
    };
    window.addEventListener('nav:internal', handleNavInternal);
    return () => window.removeEventListener('nav:internal', handleNavInternal);
  }, [navigate, setIsOpen]);




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
    setMessages
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
    contextMode,
    agentType
  });

  useEffect(() => {
    const handleContextEvent = (e) => {
      const product = e.detail?.product;
      const sku = e.detail?.sku;
      if (product && typeof setMessages === 'function') {
        setTimeout(() => {
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.content.includes(product)) return prev;
            return [
              ...prev,
              {
                role: 'assistant',
                content: `**Modo Clínico Activado Temporalmente**\n\nHe recibido el contexto del producto **${product}**${sku ? ` (SKU: ${sku})` : ''}. ¿Qué duda médica o protocolo te gustaría consultar?`,
                timestamp: new Date()
              }
            ];
          });
        }, 100);
      }
    };
    window.addEventListener('OPEN_ATLAS_CLINICAL_MODE', handleContextEvent);
    return () => window.removeEventListener('OPEN_ATLAS_CLINICAL_MODE', handleContextEvent);
  }, [setIsOpen, setMessages]);

  const isProductPage = /^\/product\//.test(location.pathname);

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
    <div className="clinical-assistant-container" style={{ 
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
        />
        {pageContext && (
          <div style={{
            padding: '0.4rem 1rem',
            backgroundColor: 'var(--surface-raised, #f8fafc)',
            borderBottom: '1px solid var(--border-light, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.75rem',
            color: 'var(--text-muted, #64748b)',
            fontWeight: 500
          }}>
            <PanelLeft size={14} style={{ opacity: 0.7 }} />
            <span>Context: <strong>{pageContext.label || pageContext.activeTab}</strong></span>
          </div>
        )}
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
        <ChatMessageList 
          messages={messages}
          isLoading={isLoading}
          isTyping={isTyping}
          scrollRef={scrollRef}
          messagesEndRef={messagesEndRef}
          InstantResultsTabs={(props) => <InstantResultsTabs {...props} onCompare={handleCompare} />}
          navigate={(path) => { navigate(path); setIsOpen(false); }}
          setIsOpen={setIsOpen}
          onSend={handleSend}
          onRate={rateMessage}
          onDeepDive={toggleDeepDive}
          contextMode={contextMode}
          onConfirmAction={handleConfirmAction}
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
      </div>
    );
  }

  return (
    <>
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


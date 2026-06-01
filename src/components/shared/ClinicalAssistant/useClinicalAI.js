/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars */
const uuidv4 = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  searchProducts, 
  searchProtocols, 
  isQuestion 
} from '../../../utils/searchEngine';
import { 
  classifyQuery, 
  QUERY_TYPE_TO_INTENT,
  INTENT_TO_QUERY_TYPE
} from '../../../utils/classifyQuery';
import { trackAIQuestion, trackAIFeedback } from '../../../utils/analytics';
import { trackAIInterests } from '../../../services/aiInterestTracker';
import { 
  buildClinicalAITrainingBlock, 
  buildProfessionalContextBlock
} from '../../../config/clinicalAIRules';
import { CLINIC_AI } from '../../../config/clinicAI.config';
import { 
  API_ENDPOINT, 
  SESSION_INTENT_MAP, 
  PRE_SEARCH_SYNONYMS,
  KNOWN_GOAL_TERMS,
  GREETINGS,
  DEFAULT_GREETING
} from './constants';

// --- Locale-aware Greeting Helper ------------------------------------------
const getLocalizedGreeting = () => {
  return GREETINGS.en;
};

// --- Follow-up Suggestion Generator ----------------------------------------
function generateFollowUps(reply = '', userMsg = '', protocols = [], products = [], intent = 'unknown', layer = 1) {
  const r = reply.toLowerCase();
  const q = userMsg.toLowerCase();
  
  // Basic language detection - forced to false per user request
  const isSpanish = false;

  const productTagMatch = reply.match(/\[PRODUCT:(.*?)\]/g);
  const hasReconTag = reply.includes('[RECON_TOOL:');

  const firstProductSlug = productTagMatch?.[0]?.match(/\[PRODUCT:(.*?)\]/)?.[1];
  const firstProduct = firstProductSlug
    ? products.find(p => p.slug === firstProductSlug || p.id === firstProductSlug)
    : null;
  const compoundName = firstProduct ? (firstProduct.displayName || firstProduct.name) : null;
  const protocolTagMatch = reply.match(/\[PROTOCOL:(.*?)\]/g);
  const firstProtocolSlug = protocolTagMatch?.[0]?.match(/\[PROTOCOL:(.*?)\]/)?.[1];

  const followUps = [];

  const labels = {
    recon:     isSpanish ? '❄️ Guía de almacenamiento' : '❄️ Storage guidelines',
    protocols: isSpanish ? '📋 Ver protocolos relacionados' : '📋 See related protocols',
    profile:   isSpanish ? `📖 Perfil completo de ${compoundName}` : `📖 Full ${compoundName} profile`,
    reconstitute: isSpanish ? `🧪 Cómo preparar ${compoundName}` : `🧪 Reconstitute ${compoundName}`,
    compare:   isSpanish ? '⚖️ Comparar con otro similar' : '⚖️ Compare with a similar peptide',
    sideEffects: isSpanish ? '💊 ¿Efectos secundarios?' : '💊 What about side effects?',
    alternatives: isSpanish ? '💊 ¿Alternativas más seguras?' : '💊 Safer alternatives?',
    science:   isSpanish ? '🔬 Más ciencia técnica' : '🔬 More technical science',
    options:   isSpanish ? '❓ Ver más opciones' : '❓ Tell me more about my options',
    mix:       isSpanish ? '⚗️ Cómo mezclar péptidos' : '⚗️ How to mix peptides'
  };

  if (hasReconTag || r.includes('reconstitut') || q.includes('reconstitut') || q.includes('mix') || q.includes('bac water') || q.includes('mezclar') || q.includes('reconstitu')) {
    if (compoundName) followUps.push({ label: labels.profile, action: 'MESSAGE', payload: isSpanish ? `Cuéntame más sobre el mecanismo de ${compoundName}` : `Tell me more about ${compoundName} mechanism and research applications` });
    followUps.push({ label: labels.protocols, action: 'MESSAGE', payload: isSpanish ? '¿Qué protocolos usan este péptido?' : 'What protocols use this peptide?' });
    followUps.push({ label: labels.recon, action: 'MESSAGE', payload: isSpanish ? '¿Cómo debo guardar los péptidos?' : 'How should I store reconstituted peptides?' });
    return followUps.slice(0, 3);
  }

  switch (intent) {
    case 'peptide': {
      if (compoundName) {
        followUps.push({ label: labels.reconstitute, action: 'MESSAGE', payload: isSpanish ? `¿Cómo preparo ${compoundName}?` : `How do I reconstitute ${compoundName}?` });
        followUps.push({ label: labels.protocols, action: 'MESSAGE', payload: isSpanish ? `¿Qué protocolos incluyen ${compoundName}?` : `Which protocols include ${compoundName}?` });
        followUps.push({ label: labels.compare, action: 'MESSAGE', payload: isSpanish ? `Comparar ${compoundName} con otros similares` : `Compare ${compoundName} vs similar peptides` });
      }
      break;
    }
    case 'comparison': {
      followUps.push({ label: isSpanish ? '📋 Planear protocolo con ambos' : '📋 Build a protocol with both', action: 'MESSAGE', payload: isSpanish ? '¿Puedo combinar ambos en un protocolo?' : 'Can I combine both peptides in a protocol?' });
      followUps.push({ label: labels.sideEffects, action: 'MESSAGE', payload: isSpanish ? '¿Cuál es el perfil de seguridad de estos péptidos?' : 'What are the safety profiles of these peptides?' });
      break;
    }
    case 'vague':
    case 'goal': {
      followUps.push({ label: labels.options, action: 'MESSAGE', payload: isSpanish ? 'Explícame mis opciones con más detalle' : 'Can you explain my options in more detail?' });
      followUps.push({ label: labels.sideEffects, action: 'MESSAGE', payload: isSpanish ? '¿Qué precauciones debo tener?' : 'What safety precautions should I take?' });
      followUps.push({ label: labels.mix, action: 'MESSAGE', payload: isSpanish ? '¿Es difícil preparar estos péptidos?' : 'Is it difficult to prepare these peptides?' });
      break;
    }
    case 'safety': {
      followUps.push({ label: labels.alternatives, action: 'MESSAGE', payload: isSpanish ? '¿Hay opciones con menos riesgos?' : 'Are there safer alternatives for the same goal?' });
      followUps.push({ label: labels.protocols, action: 'MESSAGE', payload: isSpanish ? '¿Protocolos recomendados?' : 'What protocols use this peptide safely?' });
      break;
    }
    default: {
      followUps.push({ label: labels.options, action: 'MESSAGE', payload: isSpanish ? '¿Cómo empiezo?' : 'How do I get started?' });
      followUps.push({ label: labels.sideEffects, action: 'MESSAGE', payload: isSpanish ? 'Háblame de seguridad' : 'Tell me about safety' });
      break;
    }
  }

  return followUps.slice(0, 3);
}

export function useClinicalAI({ 
  products, 
  protocolIndex, 
  catalogIndex, 
  userCtx, 
  protocols,
  clinicalConfig,
  isOpen,
  setIsOpen,
  isBeginnerMode,
  maybeShowSupport,
  externalPageContext,
  contextMode = 'clinical'
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null);
  const activityRef = useRef({ messagesSent: 0, comparisonCount: 0 });
  const queryCacheRef = useRef(new Map());
  const exploredCompoundsRef = useRef([]);
  const supportShownThisSession = useRef(false);
  const typingIntervalRef = useRef(null);

  const [sessionId, setSessionId] = useState(() => {
    return localStorage.getItem('clinicalAI_activeSessionId') || uuidv4();
  });

  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('clinicalAI_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [messages, setMessages] = useState(() => {
      const saved = localStorage.getItem(`clinicalAI_messages_${sessionId}`);
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed && parsed.length > 0) {
        return parsed;
      }
      const initialGreeting = contextMode === 'admin' 
        ? "Hey! 👋 I'm your System Admin Assistant. How can I help you manage the platform today?" 
        : contextMode === 'doctor'
        ? "Hey! 👋 I'm your Clinical Advisor. How can I help you evaluate protocols or analyze patient cases today?"
        : "Hey! 👋 I'm your Research Assistant. How can I help you explore your optimization goals today?";
      return [{
        role: 'assistant',
        content: initialGreeting,
        timestamp: Date.now()
      }];
  });

  const [sessionIntents, setSessionIntents] = useState([]);
  const [dynamicPageContext, setDynamicPageContext] = useState(null);

  useEffect(() => {
    const handler = (e) => setDynamicPageContext(e.detail);
    window.addEventListener('UPDATE_GLOBAL_CONTEXT', handler);
    return () => window.removeEventListener('UPDATE_GLOBAL_CONTEXT', handler);
  }, []);
  const [hasNewActivity, setHasNewActivity] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [quickMatch, setQuickMatch] = useState(null);

  // Scroll to interaction start (User Query) when assistant starts responding
  useEffect(() => {
    if (isLoading || isTyping) {
      setTimeout(() => {
        const userMessages = scrollRef.current?.querySelectorAll('.ca-user-message');
        if (userMessages && userMessages.length > 0) {
          const lastUserMsg = userMessages[userMessages.length - 1];
          lastUserMsg.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [isLoading, isTyping]);

  // Save active session ID and update list
  useEffect(() => {
    localStorage.setItem('clinicalAI_activeSessionId', sessionId);
    // Update sessions list if this session is new
    setSessions(prev => {
      if (prev.find(s => s.id === sessionId)) return prev;
      const newSessions = [{ 
        id: sessionId, 
        title: 'New Research Thread', 
        timestamp: Date.now() 
      }, ...prev].slice(0, 15);
      localStorage.setItem('clinicalAI_sessions', JSON.stringify(newSessions));
      return newSessions;
    });
  }, [sessionId]);

  // Update session title based on first user message
  useEffect(() => {
    const firstUserMsg = messages.find(m => m.role === 'user');
    if (firstUserMsg) {
      setSessions(prev => {
        const updated = prev.map(s => s.id === sessionId ? { ...s, title: firstUserMsg.content.slice(0, 30) + '...' } : s);
        localStorage.setItem('clinicalAI_sessions', JSON.stringify(updated));
        return updated;
      });
    }
  }, [messages, sessionId]);

  const createNewSession = useCallback(() => {
    const newId = uuidv4();
    setSessionId(newId);
    setSuggestions([]);
    const initialGreeting = contextMode === 'admin' 
      ? "Hey! 👋 I'm your System Admin Assistant. How can I help you manage the platform today?" 
      : contextMode === 'doctor'
      ? "Hey! 👋 I'm your Clinical Advisor. How can I help you evaluate protocols or analyze patient cases today?"
      : "Hey! 👋 I'm your Research Assistant. How can I help you explore your optimization goals today?";
    setMessages([{
      role: 'assistant',
      content: initialGreeting,
      timestamp: Date.now()
    }]);
  }, [contextMode]);

  const loadSession = useCallback((id) => {
    setSessionId(id);
    setSuggestions([]);
    const saved = localStorage.getItem(`clinicalAI_messages_${id}`);
    if (saved) {
      setMessages(JSON.parse(saved));
    }
  }, []);

  const deleteSession = useCallback((id) => {
    localStorage.removeItem(`clinicalAI_messages_${id}`);
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      localStorage.setItem('clinicalAI_sessions', JSON.stringify(filtered));
      if (sessionId === id) {
        if (filtered.length > 0) {
          loadSession(filtered[0].id);
        } else {
          createNewSession();
        }
      }
      return filtered;
    });
  }, [sessionId, loadSession, createNewSession]);

  const [queriesToday, setQueriesToday] = useState(0);
  const maxFreeQueries = 5;
  const maxRegisteredQueries = 20;

    useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const usageKey = `clinicAI_usage_${today}`;
    const used = parseInt(localStorage.getItem(usageKey) || '0', 10);
    setQueriesToday(used);
  }, []);

  // Periodic refresh of queriesToday for quota UI
  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date().toISOString().slice(0, 10);
      const usageKey = `clinicAI_usage_${today}`;
      const used = parseInt(localStorage.getItem(usageKey) || '0', 10);
      setQueriesToday(used);
    }, 30000); // refresh every 30 seconds

    const storageHandler = (e) => {
      if (e.key && e.key.startsWith('clinicAI_usage_')) {
        const used = parseInt(e.newValue || '0', 10);
        setQueriesToday(used);
      }
    };
    window.addEventListener('storage', storageHandler);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', storageHandler);
    };
  }, []);

  const trackQueryUsage = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    const usageKey = `clinicAI_usage_${today}`;
    const used = parseInt(localStorage.getItem(usageKey) || '0', 10);
    const newCount = used + 1;
    localStorage.setItem(usageKey, newCount);
    setQueriesToday(newCount);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`clinicalAI_messages_${sessionId}`, JSON.stringify(messages));
    }
  }, [messages, sessionId]);

  const clearSession = useCallback(() => {
    const initialGreeting = contextMode === 'admin' 
      ? "Hey! 👋 I'm your System Admin Assistant. How can I help you manage the platform today?" 
      : contextMode === 'doctor'
      ? "Hey! 👋 I'm your Clinical Advisor. How can I help you evaluate protocols or analyze patient cases today?"
      : "Hey! 👋 I'm your Research Assistant. How can I help you explore your optimization goals today?";
    const defaultGreeting = [{
      role: 'assistant',
      content: initialGreeting,
      timestamp: Date.now()
    }];
    setMessages(defaultGreeting);
    setSuggestions([]);
    setSessionIntents([]);
    localStorage.setItem(`clinicalAI_messages_${sessionId}`, JSON.stringify(defaultGreeting));
    localStorage.removeItem(`clinical_ai_session_${sessionId}`);
    activityRef.current = { messagesSent: 0, comparisonCount: 0 };
    exploredCompoundsRef.current = [];
  }, [sessionId, contextMode]);

  const inferIntentFromMessage = useCallback((text) => {
    const lower = text.toLowerCase();
    const matched = SESSION_INTENT_MAP
      .filter(({ keywords }) => keywords.some(kw => lower.includes(kw)))
      .map(({ theme }) => theme);
    if (matched.length) {
      setSessionIntents(prev => {
        const updated = [...prev, ...matched];
        return updated.slice(-20);
      });
    }
  }, []);

  const isOpenRef = useRef(isOpen);
  const handleSendRef = useRef(null);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // ─── Phase 8: Active Doctor Context ────────────────────────────────────────
  // Stores the supervising doctor's recommendation payload so it can be
  // prepended as a privileged instruction block in every API call.
  const doctorContextRef = useRef(null);

  // ─── Context Bridge: external sections can open the AI with a message ────────
  const pendingContextRef = useRef(null);
  const activeSectionRef = useRef('unknown');
  
  useEffect(() => {
    const handleContextBridge = (e) => {
      const msg = e?.detail?.message || e?.detail?.query;
      const ctx = e?.detail?.context;
      const label = e?.detail?.displayText || e?.detail?.label || '';
      const action = e?.detail?.action;
      const entityName = e?.detail?.entityName;
      const section = e?.detail?.section;

      if (section) {
        activeSectionRef.current = section;
      }

      // ─── Phase 8: Capture doctor supervision context ─────────────────────
      if (e?.detail?.doctorContext) {
        doctorContextRef.current = e.detail.doctorContext;
      }

      // Build a contextual opener when no explicit message is given.
      const resolvedMsg = msg || (() => {
        if (action === 'ask_about_entity' && entityName) {
          return `Provide a detailed clinical study profile for ${entityName}, including its primary mechanism of action, key research applications, and standard clinical dosages in the context of the ${section || 'platform'} section.`;
        }
        if (action === 'compare_trending' && section === 'TrendingPeptides') {
          return `Which trending peptides are most evidence-backed for my goals? Give me a quick comparison of the top compounds researchers are using right now.`;
        }
        if (!ctx) return '';
        if (ctx.currentQuery) {
          if (ctx.classification === 'comparison_query') {
            return `Compare the peptides related to "${ctx.currentQuery}"`;
          }
          return `I'm looking for research information about "${ctx.currentQuery}".`;
        }
        return '';
      })();

      setIsOpen(true);
      if (resolvedMsg) {
        if (e?.detail?.autoSend) {
          pendingContextRef.current = { message: resolvedMsg, displayText: label };
          if (isOpenRef.current && handleSendRef.current) {
            handleSendRef.current({ message: resolvedMsg, displayText: label });
            pendingContextRef.current = null;
          }
        } else {
          setInput(resolvedMsg);
        }
      }
    };
    window.addEventListener('open-clinical-ai', handleContextBridge);
    return () => window.removeEventListener('open-clinical-ai', handleContextBridge);
  }, [setIsOpen]);



  const handleSend = async (suggestion) => {
    let messageText = input;
    let displayText = null;
    
    if (suggestion && typeof suggestion === 'object' && !suggestion.nativeEvent) {
      if (suggestion.message) {
        messageText = suggestion.message;
        displayText = suggestion.displayText;
      } else if (suggestion.action === 'NAVIGATE') {
        navigate(suggestion.payload);
        setIsOpen(false);
        return;
      } else if (suggestion.action === 'URL') {
        window.open(suggestion.payload, '_blank', 'noopener,noreferrer');
        return;
      } else if (suggestion.action === 'MESSAGE') {
        messageText = suggestion.payload;
        displayText = suggestion.displayText || suggestion.label;
      } else {
        messageText = suggestion.label || suggestion.payload || '';
        displayText = suggestion.label;
      }
    } else if (typeof suggestion === 'string') {
      messageText = suggestion;
    }

    let finalMessageText = messageText.trim();
    if (!finalMessageText || isLoading || isTyping) return;

    if (contextMode === 'admin') {
      const lower = finalMessageText.toLowerCase();
      if (lower === '/hoy' || lower.startsWith('/hoy ')) {
        finalMessageText = "Genera un reporte financiero del día de hoy y formatea la respuesta usando el widget de finanzas.";
        if (!displayText) displayText = "/hoy";
      } else if (lower === '/pedidos' || lower.startsWith('/pedidos ')) {
        finalMessageText = "Muéstrame un resumen de los pedidos pendientes de aprobación.";
        if (!displayText) displayText = "/pedidos";
      }
    }

    messageText = finalMessageText;

    const userMsg = { 
      role: 'user', 
      content: finalMessageText, 
      displayText: displayText || null, 
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSuggestions([]);
    setIsLoading(true);
    setHasNewActivity(false);

    inferIntentFromMessage(messageText);

    activityRef.current.messagesSent += 1;
    if (activityRef.current.messagesSent === 5 && !supportShownThisSession.current && maybeShowSupport) {
      setTimeout(() => {
        maybeShowSupport('long_engagement');
        supportShownThisSession.current = true;
      }, 4000);
    }

    const isComparisonQuery = /\bvs\b|\bversus\b|\bcompare\b|\bdifference between\b/i.test(messageText);
    const inferredIntent = sessionIntents.length > 0 ? sessionIntents[sessionIntents.length - 1] : 'unknown';
    trackAIQuestion(sessionId, activityRef.current.messagesSent - 1, inferredIntent, isComparisonQuery);

    if (isComparisonQuery) {
      activityRef.current.comparisonCount += 1;
      if (activityRef.current.comparisonCount >= 2 && !supportShownThisSession.current && maybeShowSupport) {
        setTimeout(() => {
          maybeShowSupport('advanced_comparison', messageText.slice(0, 60));
          supportShownThisSession.current = true;
        }, 3500);
      }
    }

    const cacheKey = messageText.trim().toLowerCase().replace(/\s+/g, ' ');
    const cached = queryCacheRef.current.get(cacheKey);
    if (cached) {
      setIsLoading(false);
      setIsTyping(true);
      setMessages(prev => [...prev, { role: 'assistant', content: '', fullContent: cached.reply, timestamp: new Date() }]);
      let ci = 0;
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = setInterval(() => {
        ci++;
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === 'assistant' && last.fullContent) {
            updated[updated.length - 1] = { ...last, content: last.fullContent.slice(0, ci) };
          }
          return updated;
        });
        if (ci >= cached.reply.length) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
          setIsTyping(false);
          setSuggestions(cached.suggestions || []);
          setHasNewActivity(true);
        }
      }, 14);
      return;
    }

    // Hybrid Search Engine Integration
    const expandQueryForSearch = (q) => {
      const lower = q.toLowerCase().trim();
      return PRE_SEARCH_SYNONYMS[lower] || lower;
    };
    const expandedSearchQuery = expandQueryForSearch(messageText);
    const didExpandQuery = expandedSearchQuery !== messageText.toLowerCase().trim();

    const topProducts = searchProducts(
      didExpandQuery ? expandedSearchQuery : messageText,
      products,
      protocolIndex
    ).slice(0, 5);
    const topProtocols = searchProtocols(
      didExpandQuery ? expandedSearchQuery : messageText,
      protocolIndex
    ).slice(0, 4);

    const hasPreRankedResults = topProducts.length > 0 || topProtocols.length > 0;
    const classifyResult = classifyQuery(messageText, { catalogIndex });
    const detectedIntent = QUERY_TYPE_TO_INTENT[classifyResult.query_type] || 'goal';

    const activeBeginnerMode = isBeginnerMode || (() => {
      const BEGINNER_SIGNALS = ['where do i start', 'im new', 'beginner', 'first time', 'help me choose', 'soy nuevo', 'ayuda'];
      return BEGINNER_SIGNALS.some(signal => messageText.toLowerCase().includes(signal));
    })();

    const responseLayer = (() => {
      if (/\b(mechanism|receptor|half-life|pharmacokinetics)\b/i.test(messageText)) return 4;
      if (messages.length <= 1 || activeBeginnerMode) return 1;
      if (detectedIntent === 'comparison' || activityRef.current.messagesSent >= 4) return 3;
      return 2;
    })();
    
    const isAdmin = contextMode === 'admin' || userCtx?.role === 'admin' || userCtx?.roles?.includes('admin');
    const isOverLimit = !isAdmin && (
      (!userCtx && queriesToday >= maxFreeQueries) ||
      (userCtx && queriesToday >= maxRegisteredQueries)
    );

    if (isOverLimit) {
        setIsLoading(false);
        const limitType = !userCtx ? maxFreeQueries : maxRegisteredQueries;
        const quotaMsg = !userCtx 
          ? `You have run out of your free ClinicAI quota (${limitType}/${limitType} queries used). Please register or log in.`
          : `You have reached your daily query limit (${limitType}/${limitType}). Please try again tomorrow.`;
        setMessages(prev => [...prev, { role: 'assistant', content: quotaMsg, timestamp: new Date(), isError: true }]);
        return;
    }
    
    trackQueryUsage();

    try {
      const bodyStr = JSON.stringify({
        message: messageText,
        sessionId,
        query_type: classifyResult.query_type,
        intent: detectedIntent,
        layer: responseLayer,
        clinicAIConfig: {
          ...CLINIC_AI,
          ...(contextMode === 'admin' ? { agentId: 'gemini-native' } : {})
        },
        context: {
          active_entities_data: classifyResult.detected_entities.map(hit => {
            const full = products.find(p => p.name === hit.name || p.displayName === hit.name);
            if (!full) return hit;
            return {
              name: full.name,
              category: full.category,
              objective: full.objective,
              mechanisms: full.mechanisms,
              clinical_benefits: full.clinical_benefits,
              delivery_format: full.delivery_format,
              tags: full.tags,
              dosage: full.standard_dosage,
              timing: full.timing,
              aiContent: full.aiContent,
              pharmacology: full.pharmacology
            };
          }),
          available_compounds: products.map(p => ({
            name: p.name || p.displayName,
            slug: p.slug,
            category: p.category
          })),
          current_page: location.pathname,
          research_mode: true,
          user_profile: userCtx ? {
            goals: userCtx.goals || [],
            interests: userCtx.interests || [],
            research_level: activeBeginnerMode ? 'beginner' : (userCtx?.researchLevel || 'intermediate')
          } : null,
          page_context: { 
            path: location.pathname,
            isProductPage: location.pathname.startsWith('/product/'),
            isSupplementPage: location.pathname.startsWith('/supplements/'),
            isProtocolPage: location.pathname.startsWith('/protocol/') || location.pathname.startsWith('/protocols/'),
            activeEntity: location.pathname.split('/').pop(),
            activeSection: activeSectionRef.current,
            activeEntityData: (() => {
              const activeSlug = location.pathname.split('/').pop();
              if (location.pathname.startsWith('/product/') || location.pathname.startsWith('/supplements/')) {
                return products.find(p => p.slug === activeSlug || p.id === activeSlug || p.name?.toLowerCase() === activeSlug?.toLowerCase()) || null;
              }
              if (location.pathname.startsWith('/protocol/') || location.pathname.startsWith('/protocols/')) {
                return protocols.find(p => p.protocol_slug === activeSlug || p.protocol_id === activeSlug || p.id === activeSlug || p.slug === activeSlug) || null;
              }
              return null;
            })(),
            ...externalPageContext,
            ...(dynamicPageContext || {})
          },
          instructions: contextMode === 'admin' ? `
--- ADMIN MODE ACTIVE ---
You are "Atlas AI", the Atlas Health administrative assistant. Help the administrator manage users, analyze business metrics, and audit the system. DO NOT provide medical or research advice.
Current Tab: ${externalPageContext?.label || externalPageContext?.activeTab || 'Admin Portal'}.
${externalPageContext?.summary ? `Context Summary: ${externalPageContext.summary}` : ''}
${externalPageContext ? `Page Data (JSON): ${JSON.stringify(externalPageContext, (key, val) => key === 'page' || key === 'label' || key === 'activeTab' || key === 'summary' ? undefined : val)}` : ''}
` : `
${buildClinicalAITrainingBlock(detectedIntent, userCtx?.role || 'patient')}
LAYER:${responseLayer} DIRECTIVE. Respond at depth ${responseLayer}/4.
${externalPageContext ? `
--- ACTIVE PAGE CONTEXT ---
The user is currently navigating the Application.
Current Tab: ${externalPageContext.label || externalPageContext.activeTab || 'Application'}.
${externalPageContext.summary ? `Context Summary: ${externalPageContext.summary}` : ''}
Page Data (JSON): ${JSON.stringify(externalPageContext, (key, val) => key === 'page' || key === 'label' || key === 'activeTab' || key === 'summary' ? undefined : val)}
If the user asks questions about the platform, help them with tasks related to this section.
--- END ACTIVE PAGE CONTEXT ---` : ''}
${doctorContextRef.current ? `
--- ACTIVE DOCTOR SUPERVISION CONTEXT ---
This patient session is under active clinical supervision. A licensed doctor has provided the following guidance. You MUST align your research information with these clinical directives while maintaining full scientific accuracy:

Supervising Doctor: ${doctorContextRef.current.doctorName || 'Licensed Physician'}
Specialty: ${doctorContextRef.current.specialty || 'General Medicine'}
${doctorContextRef.current.recommendations ? `Doctor's Active Recommendations:
${doctorContextRef.current.recommendations.map((r, i) => `${i+1}. [${r.productName || r.product || 'Protocol'}] — ${r.notes || r.rationale || r.text || ''}`).join('\n')}` : ''}
${doctorContextRef.current.protocolName ? `Active Protocol: ${doctorContextRef.current.protocolName}` : ''}
${doctorContextRef.current.notes ? `Clinical Notes: ${doctorContextRef.current.notes}` : ''}
IMPORTANT: The patient retains full purchasing autonomy. Never instruct them what to buy. Provide scientifically grounded information that supports informed decision-making aligned with the doctor's clinical guidance.
--- END SUPERVISION CONTEXT ---` : ''}`,
        },
        history: messages.slice(-5).map(m => ({ role: m.role, content: m.content }))
      });

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr,
      });

      if (!response.ok) {
        if (response.status === 429 || response.status >= 500) {
          throw new Error('Quota Exceeded');
        }
        throw new Error('API Error');
      }
      const data = await response.json();
      const fullReply      = data.reply || '';
      const formattedData  = data.formatted || null;
      const agentName      = data.agentName || 'AgentRAG';  // ← agent identity
      const usageData      = data.usage || null;            // ← token/cost info
      const adminNavLinks  = data.admin_nav_links || [];    // ← contextual admin routes
      const pendingAction  = data.pending_action || null;   // ← AdminAI write proposal


      const proactiveCards = searchProducts(messageText, products, protocolIndex).filter(p => (p.searchScore || 0) > 4).slice(0, 3);
      const proactiveProtocols = searchProtocols(messageText, protocolIndex).filter(p => (p.searchScore || 0) > 4).slice(0, 3);
      
      let contextualSuggestions = data.suggestions && data.suggestions.length > 0
        ? data.suggestions
        : generateFollowUps(fullReply, messageText, protocols, products, detectedIntent, responseLayer);
      let cleanedReply = fullReply;
      const suggestionsMatch = fullReply.match(/\[SUGGESTIONS:\s*(.*?)\]/i);
      if (suggestionsMatch) {
        const rawSuggs = suggestionsMatch[1];
        contextualSuggestions = rawSuggs.split('|').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
        cleanedReply = fullReply.replace(/\[SUGGESTIONS:.*?\]/i, '').trim();
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '',
        fullContent: cleanedReply,
        formatted: formattedData,    // ← rich UI data from AgentFormatter
        agentName,                   // ← agent identity for AgentBadge
        usage: usageData,            // ← token count + estimated cost
        adminNavLinks,               // ← contextual admin navigation links
        pendingAction,               // ← AdminAI write proposal (null for normal msgs)
        preRankedProducts: proactiveCards,
        preRankedProtocols: proactiveProtocols,
        timestamp: new Date()
      }]);

      // ── Track AI interests for personalized PatientHome ─────────────────
      // Fire-and-forget: extract compound mentions from this exchange and
      // persist them to Firestore so PatientHome can surface personalized sections.
      if (userCtx?.uid) {
        trackAIInterests({
          uid: userCtx.uid,
          userMsg: messageText,
          assistantReply: fullReply,
          preRankedProducts: proactiveCards,
        }).catch(() => {});
      }



      setIsLoading(false);
      setIsTyping(true);
      let i = 0;
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = setInterval(() => {
        i++;
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === 'assistant' && last.fullContent) {
            updated[updated.length - 1] = { ...last, content: last.fullContent.slice(0, i) };
          }
          return updated;
        });
        if (i >= cleanedReply.length) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
          setIsTyping(false);
          setSuggestions(contextualSuggestions);
          setHasNewActivity(true);
        }
      }, 14);

    } catch (err) {
      setIsLoading(false);
      
      if (err.message === 'Quota Exceeded') {
        const quotaMsg = "You have run out of your free ClinicAI quota. To increase your limit and continue exploring with unlimited research assistance, please register or log in.";
        setMessages(prev => [...prev, { role: 'assistant', content: quotaMsg, timestamp: new Date(), isError: true }]);
        return;
      }

      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
      const isConnectionFailure = err.message === 'API Error' || err.message.includes('fetch') || err.message.includes('NetworkError');
      
      if (isOffline || isConnectionFailure) {
        const isSpanish = false;
        const relatedProds = topProducts.slice(0, 3);
        const relatedProts = topProtocols.slice(0, 2);
        
        let offlineContent = '';
        const lowerMsg = messageText.toLowerCase();
        let goalReport = null;
        
        if (lowerMsg.includes('muscle') || lowerMsg.includes('muscular') || lowerMsg.includes('recovery')) {
          goalReport = `### 🏋️ Research Optimization Report: Muscle Growth & Recovery

**1. 🏃 Core Lifestyle & Groundwork:**
Before evaluating specific peptides, optimizing tissue recovery and hypertrophy requires establishing fundamental bio-infrastructure pillars: optimal protein synthesis through a positive nitrogen balance, deep restorative sleep to maximize endogenous growth factor release, and proper cellular hydration and nutrient flow to the sarcomeres micro-injured during resistance training. Consistency in these biological basics is the true catalyst of cellular repair.

**2. 🧪 Recommended Research Peptides (Top 3):**
*   **[BPC-157](/product/bpc-157)**: Accelerates healing of tendons, ligaments, and muscle fibers by promoting angiogenesis and expressing growth hormone receptors.
*   **[TB-500](/product/tb-500)**: A systemic peptide key to actin regulation, promoting deep structural tissue regeneration.
*   **[Sermorelin](/product/sermorelin)**: A Growth Hormone Releasing Hormone (GHRH) secretagogue that stimulates natural pituitary growth hormone release to support lean mass.

**3. 📋 Curated Research Protocols:**
*   **[Advanced Recovery Protocol](/protocol/recovery-starter)**: A synergistic combination of BPC-157 and TB-500 to accelerate systemic repair.
*   **[Reconstitution Guide](/protocol/reconstitution-guide)**: A step-by-step practical guide for clean preparation.

**4. 💊 Complementary Synergistic Supplements:**
*   **[NMN](/supplements/nmn)**: A NAD+ booster that enhances mitochondrial energy within muscle fibers.
*   **[Berberine](/supplements/berberine)**: Supports cellular nutrient sensitivity by activating the AMPK pathway.

---
*Would you like to explore suggested research dosages for any of these peptides, or would you prefer a quick guide on peptide reconstitution? Let me know, and we will take the next step together!*`;
        } else if (lowerMsg.includes('fat loss') || lowerMsg.includes('metabolic')) {
          goalReport = `### ⚡ Research Optimization Report: Fat Loss & Metabolic Health

**1. 🏃 Core Lifestyle & Groundwork:**
Managing adipose tissue and achieving metabolic flexibility begins at the cellular level. Before introducing external modulators, it is vital to balance overall energy, improve insulin sensitivity by regulating carbohydrate intake, and maintain active mitochondrial function so cells can efficiently oxidize free fatty acids instead of storing them.

**2. 🧪 Recommended Research Peptides (Top 3):**
*   **[Tirzepatide](/product/tirzepatide)**: A highly effective dual GIP/GLP-1 receptor agonist studied for appetite regulation, delayed gastric emptying, and adipose fat mobilization.
*   **[Semaglutide](/product/semaglutide)**: The gold-standard GLP-1 receptor agonist investigated for promoting satiety and pancreatic balance.
*   **[AOD-9604](/product/aod-9604)**: An HGH fragment studied for its ability to stimulate lipolysis and prevent lipogenesis without elevating blood glucose.

**3. 📋 Curated Research Protocols:**
*   **[Advanced Metabolic Protocol](/protocol/fat-loss)**: Step-by-step guidance on titration schedules and tolerance cycles for GLP-1 agonists.
*   **[Reconstitution Guide](/protocol/reconstitution-guide)**: Clear instructions for preparing lyophilized research peptides.

**4. 💊 Complementary Synergistic Supplements:**
*   **[Berberine](/supplements/berberine)**: A premium metabolic regulator that activates AMPK to support cellular insulin sensitivity.
*   **[NMN](/supplements/nmn)**: Key to maintaining active mitochondrial respiration and maximizing fat oxidation.

---
*Would you like to explore suggested research dosages for any of these peptides, or would you prefer a quick guide on peptide reconstitution? Let me know, and we will take the next step together!*`;
        } else if (lowerMsg.includes('cognitive') || lowerMsg.includes('focus') || lowerMsg.includes('clarity') || lowerMsg.includes('mental') || lowerMsg.includes('nootropics')) {
          goalReport = `### 🧠 Research Optimization Report: Cognitive Performance & Focus

**1. 🏃 Core Lifestyle & Groundwork:**
Mental clarity and sustained focus depend heavily on synaptic health and optimal cerebral blood flow. The first step to clearing brain fog involves regulating circadian rhythms for nighttime glymphatic clearance, maintaining cell hydration to support neurotransmission, and stabilizing glucose levels to avoid mid-day energy crashes.

**2. 🧪 Recommended Research Peptides (Top 3):**
*   **[Semax](/product/semax)**: A potent ACTH analog studied for elevating BDNF and NGF levels, supporting working memory, and promoting neuroprotection.
*   **[Selank](/product/selank)**: A tuftsin analog with calming properties studied for modulating GABAergic systems to support focus under stress.
*   **[Dihexa](/product/dihexa)**: An advanced neurotrophic peptide investigated for its unique potency in promoting synaptic growth.

**3. 📋 Curated Research Protocols:**
*   **[Simple Nootropic Protocol](/protocol/cognitive-simple)**: An introductory cycle demonstrating the synergy between Semax and Selank for daily clarity.
*   **[Reconstitution Guide](/protocol/reconstitution-guide)**: Instructions for preparing sterile research peptides.

**4. 💊 Complementary Synergistic Supplements:**
*   **[NMN](/supplements/nmn)**: Essential for meeting the high mitochondrial energy demands of neurons during intensive cognitive research.

---
*Would you like to explore suggested research dosages for any of these peptides, or would you prefer a quick guide on peptide reconstitution? Let me know, and we will take the next step together!*`;
        } else if (lowerMsg.includes('longevity') || lowerMsg.includes('repair')) {
          goalReport = `### 🧬 Research Optimization Report: Longevity & Biological Repair

**1. 🏃 Core Lifestyle & Groundwork:**
Extending biological healthspan relies on slowing the biomarkers of cellular aging. On a fundamental level, this is achieved by regularly triggering autophagy (cellular cleanup via intermittent fasting), managing mitochondrial oxidative stress, and actively cooling chronic low-grade inflammation (inflammaging).

**2. 🧪 Recommended Research Peptides (Top 3):**
*   **[Epithalon](/product/epithalon)**: A pineal peptide studied for telomerase activation, helping extend telomeres and delay cellular senescence.
*   **[GHK-Cu](/product/ghk-cu)**: A copper peptide key to upregulating healing genes, collagen production, and systemic organic rejuvenation.
*   **[Sermorelin](/product/sermorelin)**: A growth hormone secretagogue vital for mitochondrial health and systemic cell repair.

**3. 📋 Curated Research Protocols:**
*   **[Cellular Longevity Protocol](/protocol/longevity-essentials)**: A methodological approach to cycling Epithalon and GHK-Cu safely.
*   **[Reconstitution Guide](/protocol/reconstitution-guide)**: Practical preparation guidelines for lyophilized research peptides.

**4. 💊 Complementary Synergistic Supplements:**
*   **[NMN](/supplements/nmn)**: A powerful NAD+ precursor that amplifies cellular energy and directly activates sirtuins.
*   **[Berberine](/supplements/berberine)**: An AMPK activator that mimics fasting, supporting healthy lipid profiles and cellular longevity.

---
*Would you like to explore suggested research dosages for any of these peptides, or would you prefer a quick guide on peptide reconstitution? Let me know, and we will take the next step together!*`;
        } else if (lowerMsg.includes('hormonal') || lowerMsg.includes('vitality') || lowerMsg.includes('balance')) {
          goalReport = `### ⚖️ Research Optimization Report: Hormonal Vitality & Balance

**1. 🏃 Core Lifestyle & Groundwork:**
The neuroendocrine system operates like a finely tuned orchestra where the thyroid, adrenals, and hypothalamus-pituitary axis must resonate in harmony. To support natural vitality, it is crucial to manage cortisol levels through lifestyle optimization, maintain healthy fat intake for hormone synthesis, and align rest with circadian rhythms.

**2. 🧪 Recommended Research Peptides (Top 3):**
*   **[Sermorelin](/product/sermorelin)**: A GHRH secretagogue that stimulates the natural release of pituitary growth hormone to support tissue health.
*   **[PT-141](/product/pt-141)**: A melanocortin receptor agonist studied for its positive influence on libido and general endocrine balance.
*   **[Ipamorelin](/product/ipamorelin)**: A highly selective GH secretagogue that supports muscle recovery without raising cortisol or prolactin.

**3. 📋 Curated Research Protocols:**
*   **[Hormonal Vitality Protocol](/protocol/hormonal-balance)**: A guide on secretagogue cycling paired with adaptive lifestyle supports.
*   **[Reconstitution Guide](/protocol/reconstitution-guide)**: Detailed preparation instructions for lyophilized research peptides.

**4. 💊 Complementary Synergistic Supplements:**
*   **[NMN](/supplements/nmn)**: Restores mitochondrial vitality in endocrine cells to support healthy pituitary and adrenal responses.

---
*Would you like to explore suggested research dosages for any of these peptides, or would you prefer a quick guide on peptide reconstitution? Let me know, and we will take the next step together!*`;
        } else if (lowerMsg.includes('skin') || lowerMsg.includes('hair') || lowerMsg.includes('cellular health')) {
          goalReport = `### 🧴 Research Optimization Report: Skin, Hair & Cellular Health

**1. 🏃 Core Lifestyle & Groundwork:**
Dermal health and hair follicle strength are outward reflections of internal nutritional and cellular states. To rejuvenate the dermal matrix, initial focuses must include ensuring a steady supply of structural amino acids, enhancing microcirculation to deliver oxygen, and defending cells against oxidative damage from ultraviolet radiation.

**2. 🧪 Recommended Research Peptides (Top 3):**
*   **[GHK-Cu](/product/ghk-cu)**: The gold-standard peptide for signaling collagen and elastin synthesis, studied for dermal healing and hair follicle density.
*   **[KPV](/product/kpv)**: A potent anti-inflammatory peptide studied for skin barrier restoration and soothing inflammatory conditions.
*   **[BPC-157](/product/bpc-157)**: Investigated for accelerating dermal repair and supporting vascularization of follicles.

**3. 📋 Curated Research Protocols:**
*   **[Aesthetic Health Protocol](/protocol/skin-hair-health)**: A guide to combining topical and systemic peptides for dermal rejuvenation.
*   **[Reconstitution Guide](/protocol/reconstitution-guide)**: Step-by-step guidance for clean peptide reconstitution.

**4. 💊 Complementary Synergistic Supplements:**
*   **[NMN](/supplements/nmn)**: Boosts cellular bioenergetics in the skin, protecting against UV-induced aging.

---
*Would you like to explore suggested research dosages for any of these peptides, or would you prefer a quick guide on peptide reconstitution? Let me know, and we will take the next step together!*`;
        } else if (lowerMsg.includes('immune') || lowerMsg.includes('defense')) {
          goalReport = `### 🛡️ Research Optimization Report: Immune Function & Defense

**1. 🏃 Core Lifestyle & Groundwork:**
A resilient immune system is not one that is hyperactive, but one that is perfectly modulated and balanced. The body's first line of defense is established by maintaining the gut barrier (where 70% of immune cells reside), nurturing a diverse microbiome, and securing micronutrient cofactors like Vitamin D, Vitamin C, and Zinc.

**2. 🧪 Recommended Research Peptides (Top 3):**
*   **[Thymosin Alpha-1](/product/thymosin-alpha-1)** (TA1): A premier thymic modulator studied for boosting/modulating innate cellular immune responses.
*   **[BPC-157](/product/bpc-157)**: Supports gut-associated lymphoid tissue (GALT) and is studied for modulating inflammatory cytokines.
*   **[LL-37](/product/ll-37)**: An antimicrobial peptide investigated for supporting the body's natural defense against cellular threats.

**3. 📋 Curated Research Protocols:**
*   **[Immune Defense Protocol](/protocol/immune-defense)**: Suggested research timelines for immune modulation and immune cell maturation.
*   **[Reconstitution Guide](/protocol/reconstitution-guide)**: Instructions for hygienic preparation and dilution.

**4. 💊 Complementary Synergistic Supplements:**
*   **[Berberine](/supplements/berberine)**: Enhances gut barrier integrity to support gut-associated immune cells.

---
*Would you like to explore suggested research dosages for any of these peptides, or would you prefer a quick guide on peptide reconstitution? Let me know, and we will take the next step together!*`;
        } else if (/\b(intro|journey|senderos|clinical research pathways|introducci[oó]n)\b/i.test(lowerMsg)) {
          goalReport = `### 🌅 Embark on a Wonderful Health Journey: 8 Optimization Paths

Welcome! I am absolutely thrilled to accompany you at the very beginning of this wonderful health optimization journey. Our goal is to make advanced biological research highly accessible, friendly, and empowering for you!

Here is a warm, simple overview of the **8 optimization paths** we offer to help improve your health and cellular vitality:

*   🏋️ **Muscle Growth & Recovery**: Designed to support tissue repair, accelerate athletic recovery, and maintain healthy active muscle tissue.
*   ⚡ **Fat Loss & Metabolic Health**: Focused on optimizing insulin sensitivity, natural metabolic rates, and sustaining clean, daily cellular energy.
*   🧠 **Cognitive Performance & Focus**: Geared toward elevating sinaptic plasticity, memory, and clearing away brain fog for sharp mental focus.
*   🧬 **Longevity & Biological Repair**: Targeting cellular rejuvenation, telomere protection, and healthy aging deep inside the cells.
*   ⚖️ **Hormonal Vitality & Balance**: Restoring natural endocrine rhythms, biological harmony, and physical vitality.
*   🧴 **Skin, Hair & Cellular Health**: Supporting glowing dermal regeneration, hair follicle strength, and extracellular matrix density.
*   🛡️ **Immune Function & Defense**: Strengthening your body's immune resilience and active cellular defenses.
*   🌙 **Better Sleep & Circadian Restoration**: Supporting deep delta-wave sleep, circadian rhythm synchronization, and nighttime cellular restoration.

---
*Would you like to explore the friendly starter guide for one of these specific pathways, or are you interested in a quick guide on peptide reconstitution? Let me know, and we will take the next step together!*`;
        } else if (/\b(store|storage|guardar|conserv\w*|temperat\w*|refriger\w*)\b/i.test(lowerMsg)) {
          goalReport = `### ❄️ Peptide Storage & Preservation Guidelines (Offline)

Peptide and protein stability is highly sensitive to temperature, UV light exposure, and humidity. Proper storage is critical to prevent hydrolysis and peptide degradation:

**1. 📦 Lyophilized Peptides (Dry Powder):**
*   **Short to Medium Term (up to 12 months):** Store refrigerated at **2°C to 8°C (36°F - 46°F)** in a dark environment.
*   **Long Term (up to 3 years):** Store frozen at **-20°C (-4°F)** or lower. Avoid auto-defrost freezers, as temperature fluctuations cause degradation.

**2. 💧 Reconstituted Peptides (Liquid Solution):**
*   **Critical Temperature:** Must be stored refrigerated at **2°C to 8°C (36°F - 46°F)** at all times. **Never freeze a reconstituted peptide**, as ice crystal formation will permanently shear and destroy the molecular bonds.
*   **Aqueous Shelf Life:** Once reconstituted with Bacteriostatic Water, most research peptides remain stable for 21 to 45 days, depending on their amino acid sequence stability.
*   **Light Protection:** Keep vials inside their storage boxes or wrapped to shield them from UV radiation and strong overhead lighting.

---
*Would you like to explore exact dosage calculation or details on peptide reconstitution?*`;
        } else if (
          /\b(reconstit\w*|mezcl\w*|prepar\w*|dilu\w*|calcula\w*|jeringa\w*|syringe\w*|unit\w*|unidad\w*)\b/i.test(lowerMsg) ||
          /\b(mix|mixing|mixture|mixes|mixed)\b/i.test(lowerMsg) ||
          /\b(agua|aguas)\b/i.test(lowerMsg)
        ) {
          goalReport = `### 🧪 Peptide Reconstitution Protocol (Offline)

Reconstitution is the process of dissolving a freeze-dried (lyophilized) peptide powder into a sterile liquid diluent (typically Bacteriostatic Water) for research evaluation:

**1. 🏃 Prep Environment and Setup:**
Before beginning, establish a clean and sterile working environment. Gather all necessary items (Bacteriostatic Water, insulin syringes, alcohol prep pads) on a sanitized surface to ensure sample integrity.

**2. 📋 Standard Preparation Steps:**
*   **Sanitization:** Wipe the rubber stoppers of both the peptide vial and the bacteriostatic water vial with a fresh 70% isopropyl alcohol swab. Let dry.
*   **Drawing Diluent:** Draw air into a sterile syringe equal to the volume of water you plan to transfer (e.g., 2 mL). Inject this air into the water vial to equalize pressure, then slowly draw out the bacteriostatic water.
*   **Gentle Transfer:** Insert the needle into the peptide vial at a 45-degree angle. **Aim the stream at the glass wall of the vial.** Slowly inject the diluent. Letting the water spray directly onto the powder can shear and degrade the peptide.
*   **Passive Dissolution:** **Never shake the vial.** Agitation can break the protein's delicate peptide bonds. Instead, gently swirl the vial between your palms or let it sit in the refrigerator until the solution is completely clear.

---
*Would you like to explore exact dosage calculation or details on peptide storage and stability?*`;
        }

        if (goalReport) {
          offlineContent = goalReport;
        } else {
          offlineContent = `### 📴 Offline Research Mode\n\nYou are currently offline, but **Atlas Health Clinical Intelligence** continues to serve you locally using your device's cached database.\n\nBased on your query **"${messageText}"**, I have identified the following local catalog resources:\n\n`;
        }

        if (relatedProds.length > 0) {
          offlineContent += `#### 🧪 Suggested Compounds:\n`;
          relatedProds.forEach(p => {
            offlineContent += `- **${p.displayName || p.name}**: ${p.objective || 'Clinical Research Compound'}. [PRODUCT:${p.slug}]\n`;
          });
        }

        if (relatedProts.length > 0) {
          offlineContent += `\n#### 📋 Research Protocols:\n`;
          relatedProts.forEach(p => {
            offlineContent += `- **${p.title}**: ${p.description || 'Standard Research Protocol'}. [PROTOCOL:${p.id}]\n`;
          });
        }

        if (relatedProds.length === 0 && relatedProts.length === 0) {
          offlineContent += `No exact matches were found in the local catalog. Please try searching for another peptide or protocol name (e.g. *BPC-157*, *Sleep*, *Anti-Aging*).`;
        }

        offlineContent += `\n\n*Note: Full advanced AI synthesis will resume automatically once your connection is restored.*`;

        const contextualSuggestions = generateFollowUps(offlineContent, messageText, protocols, products, detectedIntent, responseLayer);
        
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?._isPreRankedPlaceholder) {
            const updated = [...prev];
            updated[updated.length - 1] = { 
              ...last, 
              content: '', 
              fullContent: offlineContent, 
              preRankedProducts: relatedProds, 
              preRankedProtocols: relatedProts, 
              _isPreRankedPlaceholder: false 
            };
            return updated;
          }
          return [...prev, { 
            role: 'assistant', 
            content: '', 
            fullContent: offlineContent, 
            preRankedProducts: relatedProds, 
            preRankedProtocols: relatedProts, 
            timestamp: new Date() 
          }];
        });

        setIsTyping(true);
        let i = 0;
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = setInterval(() => {
          i++;
          setMessages(prev => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last?.role === 'assistant' && last.fullContent) {
              updated[updated.length - 1] = { ...last, content: last.fullContent.slice(0, i) };
            }
            return updated;
          });
          if (i >= offlineContent.length) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
            setIsTyping(false);
            setSuggestions(contextualSuggestions);
            setHasNewActivity(true);
          }
        }, 12);
        return;
      }

      const errorMsg = `### ❌ Debug: Client-side Error\n\n\`\`\`\n${err?.stack || err?.message || String(err)}\n\`\`\``;
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg, timestamp: new Date(), isError: true }]);
    }
  };

  // Fire the pending context message once the modal is open
  useEffect(() => {
    if (isOpen && pendingContextRef.current) {
      const msg = pendingContextRef.current;
      pendingContextRef.current = null;
      setTimeout(() => {
        handleSend(msg);
      }, 400);
    }
  }, [isOpen, handleSend]);

  const exportSession = useCallback(() => {
    const text = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clinical_ai_session_${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
  }, [messages]);

  const emailSession = useCallback(() => {
    const text = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
    const subject = `Research Brief: ${messages[1]?.content.slice(0, 30) || 'Peptide Study'}...`;
    const body = `Clinical Research Summary:\n\n${text}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [messages]);

  const getSessionSummary = useCallback(() => {
    if (messages.length === 0) return '';
    const userQueries = messages.filter(m => m.role === 'user').map(m => m.content).slice(-3);
    const summary = `Research Context:\n- Last Queries: ${userQueries.join(' | ')}\n- Session ID: ${sessionId}`;
    return encodeURIComponent(summary);
  }, [messages, sessionId]);

  const rateMessage = useCallback((idx, rating) => {
    trackAIFeedback(sessionId, idx, rating);
    setMessages(prev => {
      const updated = [...prev];
      if (updated[idx]) {
        updated[idx] = { ...updated[idx], rating };
      }
      return updated;
    });
  }, [sessionId]);

  handleSendRef.current = handleSend;

  const processAdminUpload = async (file, queryType, initialMessage) => {
    setIsLoading(true);
    setMessages(prev => [
      ...prev,
      { role: 'user', content: initialMessage, timestamp: new Date() }
    ]);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      
      const body = JSON.stringify({
        message: initialMessage,
        sessionId,
        query_type: queryType,
        clinicAIConfig: { agentId: 'gemini-native' },
        pdfBase64: base64,
        context: {
          instructions: `--- ADMIN MODE ACTIVE ---\nYou are "AdminAI", analyzing an uploaded document for ${queryType}.`,
          user_profile: userCtx ? { uid: userCtx.uid, role: 'admin' } : null,
        },
        history: messages.slice(-5),
      });

      const resp = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      const data = await resp.json();
      
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply || `Analysis complete for ${file.name}.`,
          fullContent: data.reply || `Analysis complete for ${file.name}.`,
          timestamp: new Date(),
          queryType: data.queryType || queryType,
          comparisonData: data.comparisonData || data.comparison || null,
        },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `❌ Error uploading file: ${err.message}`, timestamp: new Date(), isError: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadPrice = useCallback((file) => {
    processAdminUpload(file, 'price_import_pdf', `📄 Analyzing supplier price catalog: ${file.name}`);
  }, [sessionId, userCtx, messages]);

  const handleUploadStock = useCallback((file) => {
    processAdminUpload(file, 'stock_import', `📦 Analyzing stock update file: ${file.name}`);
  }, [sessionId, userCtx, messages]);

  // ── AdminAI: confirm a pending write action ──────────────────────────────
  const handleConfirmAction = useCallback(async (pendingAction) => {
    if (!pendingAction) return;
    setIsLoading(true);
    try {
      const body = JSON.stringify({
        message: `Confirming action: ${pendingAction.fn}`,
        sessionId,
        clinicAIConfig: { agentId: 'gemini-native' },
        execute_pending: pendingAction,
        context: {
          instructions: `--- ADMIN MODE ACTIVE ---\nYou are "AdminAI", executing a confirmed admin write action.`,
          user_profile: userCtx ? { uid: userCtx.uid, role: 'admin' } : null,
        },
        history: [],
      });
      const resp = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      const data = await resp.json();
      const confirmReply = data.reply || '✅ Acción ejecutada correctamente.';
      const auditId = data.auditId || null;
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: confirmReply + (auditId ? `\n\n*Audit ID: \`${auditId}\`*` : ''),
          fullContent: confirmReply + (auditId ? `\n\n*Audit ID: \`${auditId}\`*` : ''),
          timestamp: new Date(),
          adminNavLinks: data.admin_nav_links || [],
        },
      ]);
      setSuggestions(data.suggestions || [
        { label: '📋 Ver Audit Log', action: 'NAVIGATE', payload: '/admin/audit' },
        { label: '💰 Costes & Márgenes', action: 'NAVIGATE', payload: '/admin/costs' },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `❌ Error al ejecutar la acción: ${err.message}`, timestamp: new Date(), isError: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, userCtx]);

  return {
    messages,
    setMessages,
    isLoading,
    isTyping,
    input,
    setInput,
    suggestions,
    setSuggestions,
    quickMatch,
    setQuickMatch,
    clearSession,
    exportSession,
    handleSend,
    handleConfirmAction,
    handleUploadPrice,
    handleUploadStock,
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
    autocompleteCandidates: useMemo(() => {
      const candidates = [];
      if (contextMode === 'admin') return candidates; // Disable peptide autocomplete in admin mode
      if (Array.isArray(products)) {
        products.forEach(p => {
          if (p) {
            const label = p.displayName || p.name;
            if (label) {
              candidates.push({ label, type: 'compound', slug: p.slug });
            }
          }
        });
      }
      if (Array.isArray(protocols)) {
        protocols.forEach(p => {
          if (p) {
            const label = p.title || p.name;
            if (label) {
              candidates.push({ label, type: 'protocol', slug: p.id });
            }
          }
        });
      }
      return candidates;
    }, [products, protocols])
  };
}

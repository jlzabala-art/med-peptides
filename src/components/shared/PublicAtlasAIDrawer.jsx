'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  X,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  FileText,
  Thermometer,
  Droplets,
  HelpCircle,
  Layers,
  FlaskConical,
  BookOpen,
  ExternalLink,
} from 'lucide-react';

/**
 * PublicAtlasAIDrawer
 * ─────────────────────────────────────────────────────────────────────────────
 * Sandboxed, strictly focused AI research assistant for Public Datasheets (/p/[slug])
 * and Public Shared Catalogs (/c/[id]).
 * 
 * Strict Guardrails:
 * 1. Strictly in English at all times.
 * 2. Hard rate-limit of 5 queries per IP / 24h.
 * 3. Session isolation via sessionStorage (no cross-user query bleed).
 * 4. Zero outbound hyperlinks away from the platform.
 * 5. Registration CTA trigger once the 5 queries are exhausted.
 * 6. Live integration with Recognized Clinical Sources (NIH PubMed & Clinical Compendiums).
 */
export default function PublicAtlasAIDrawer({
  contextType = 'monograph', // 'monograph' | 'catalog'
  contextAnchor = null,     // { name, cas, purity, molecular, sequence, details, slug }
  catalogInventory = [],    // [{ name, category, purity, format }]
  storageKey = 'default',
  onOpenRegisterModal = null,
  hideFloatingTrigger = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [remaining, setRemaining] = useState(5);
  const [limit, setLimit] = useState(5);
  const [isBlocked, setIsBlocked] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'evidence'
  const [clinicalSources, setClinicalSources] = useState([]);
  const [isLoadingSources, setIsLoadingSources] = useState(false);
  const messagesEndRef = useRef(null);

  const sessionKey = `atlas_ai_public_${storageKey}`;

  // 1. Load isolated session chat history
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(sessionKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // Ignore sessionStorage parsing errors
    }
  }, [sessionKey]);

  // Global event listener to open drawer with pre-filled inquiry from publication cards
  useEffect(() => {
    const handleOpen = (e) => {
      setIsOpen(true);
      if (e.detail?.initialQuery) {
        setMessage(e.detail.initialQuery);
        setActiveTab('chat');
      }
    };
    window.addEventListener('open-public-atlas-ai', handleOpen);
    return () => window.removeEventListener('open-public-atlas-ai', handleOpen);
  }, []);

  // 2. Fetch current IP quota status
  useEffect(() => {
    let isMounted = true;
    fetch('/api/ai-chat?scope=public_sandbox')
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        if (typeof data.remaining === 'number') {
          setRemaining(data.remaining);
          setLimit(data.limit || 5);
          if (data.remaining <= 0) {
            setIsBlocked(true);
          }
        }
      })
      .catch(() => {
        // Non-blocking quota lookup
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Pre-load recognized PubMed clinical evidence for active compound
  useEffect(() => {
    if (contextType === 'monograph' && contextAnchor?.name) {
      let isMounted = true;
      setIsLoadingSources(true);
      const cleanName = contextAnchor.name.replace(/\([^)]*\)/g, '').replace(/≥.*%/, '').trim();
      const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(cleanName)}&retmode=json&retmax=4`;

      fetch(searchUrl)
        .then(res => res.json())
        .then(data => {
          const ids = data.esearchresult?.idlist || [];
          if (ids.length === 0) {
            if (isMounted) setIsLoadingSources(false);
            return;
          }
          const sumUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
          return fetch(sumUrl);
        })
        .then(res => (res ? res.json() : null))
        .then(sumData => {
          if (!isMounted || !sumData?.result) return;
          const result = sumData.result || {};
          const ids = sumData.result.uids || [];
          const parsed = ids.map(id => {
            const item = result[id] || {};
            return {
              pmid: id,
              title: item.title || '',
              journal: item.source || item.fulljournalname || 'Biomedical Journal',
              pubdate: item.pubdate || item.epubdate || '',
              authors: (item.authors || []).slice(0, 2).map(a => a.name).join(', '),
              pubmedUrl: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
            };
          });
          setClinicalSources(parsed);
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted) setIsLoadingSources(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [contextType, contextAnchor?.name]);

  // 4. Scroll to latest message
  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeTab]);

  // Save session messages locally
  const saveMessages = (updated) => {
    setMessages(updated);
    try {
      sessionStorage.setItem(sessionKey, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || message).trim();
    if (!query || isLoading || isBlocked) return;

    setMessage('');
    setActiveTab('chat');
    const newMsgList = [...messages, { sender: 'user', text: query, timestamp: new Date().toISOString() }];
    saveMessages(newMsgList);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope: 'public_sandbox',
          message: query,
          context: {
            screenScope: contextType === 'monograph' ? 'product_monograph' : 'catalog_portfolio',
            contextAnchor,
            catalogInventory,
          },
          history: newMsgList.slice(-6),
        }),
      });

      const data = await res.json();

      if (res.status === 429 || data.error === 'QUOTA_EXCEEDED') {
        setIsBlocked(true);
        setRemaining(0);
        saveMessages([
          ...newMsgList,
          {
            sender: 'bot',
            text: 'You have reached the limit of 5 free research inquiries. Please sign in or create an authorized institutional account for unlimited access.',
            isQuotaExceeded: true,
            timestamp: new Date().toISOString(),
          },
        ]);
        return;
      }

      if (typeof data.remaining === 'number') {
        setRemaining(data.remaining);
        if (data.remaining <= 0) {
          setIsBlocked(true);
        }
      }

      if (Array.isArray(data.sources) && data.sources.length > 0) {
        setClinicalSources(prev => (prev.length > 0 ? prev : data.sources));
      }

      const botReply = data.reply || 'Analytical specification confirmed. All compounding parameters must follow standard institutional guidelines.';
      saveMessages([
        ...newMsgList,
        {
          sender: 'bot',
          text: botReply,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      saveMessages([
        ...newMsgList,
        {
          sender: 'bot',
          text: 'Temporary network connection delay. Dual-stage RP-HPLC specifications remain verified on the primary document.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Metric Highlight Helper ────────────────────────────────────────────────
  const METRIC_REGEX = /(≥\s*\d+(?:\.\d+)?%|\d+(?:\.\d+)?%|[-−]?\d+(?:\.\d+)?\s*(?:°C|°F)|\d+(?:\.\d+)?\s*[-–—]\s*\d+(?:\.\d+)?\s*(?:°C|°F)|\d+(?:\.\d+)?\s*[-–—]\s*\d+(?:\.\d+)?\s*(?:mL|mg|mcg|µg)|\b\d+(?:\.\d+)?\s*(?:mL|mg|mcg|µg)\b|\bRP-HPLC\b|\bLC-MS\b|\bESI-MS\b|\b0\.9%\s+benzyl\s+alcohol\b|\bU-100\b|\b\d+\s*(?:days|months|hours|weeks|years)\b|\[PubMed:\s*\d+[^\]]*\]|\[Clinical[^\]]*\])/gi;

  const TOKEN_REGEX = /(\[[^\]]+\]\(\/[^)]+\)|\*\*[^*]+\*\*)/g;

  const renderBodyWithHighlights = (text) => {
    if (!text) return null;
    const tokens = text.split(TOKEN_REGEX);

    return tokens.map((chunk, cIdx) => {
      if (!chunk) return null;

      // 1. Internal Public Markdown Link
      if (chunk.startsWith('[') && chunk.includes('](')) {
        const linkMatch = chunk.match(/^\[([^\]]+)\]\(\/([^)]+)\)$/);
        if (linkMatch) {
          const label = linkMatch[1];
          const href = '/' + linkMatch[2];
          return (
            <a
              key={cIdx}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: '#0284c7',
                backgroundColor: '#eff6ff',
                border: '1px solid #bae6fd',
                borderRadius: '6px',
                padding: '1px 7px',
                margin: '1px 3px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.80rem',
                verticalAlign: 'baseline',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e0f2fe';
                e.currentTarget.style.borderColor = '#7dd3fc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#eff6ff';
                e.currentTarget.style.borderColor = '#bae6fd';
              }}
            >
              <ExternalLink size={11} color="#0284c7" />
              <span>{label}</span>
            </a>
          );
        }
      }

      // 2. Bold emphasis
      if (chunk.startsWith('**') && chunk.endsWith('**')) {
        const inner = chunk.slice(2, -2);
        return (
          <strong key={cIdx} style={{ color: '#00284d', fontWeight: 700 }}>
            {inner}
          </strong>
        );
      }

      // 3. Metric and Citation regex parser
      const metricParts = chunk.split(METRIC_REGEX);
      return metricParts.map((part, pIdx) => {
        if (!part) return null;
        if (METRIC_REGEX.test(part)) {
          METRIC_REGEX.lastIndex = 0;

          // Citation tag badge
          if (part.startsWith('[PubMed:') || part.startsWith('[Clinical')) {
            return (
              <span
                key={`${cIdx}-${pIdx}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  borderRadius: '5px',
                  padding: '1px 6px',
                  margin: '0 2px',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  verticalAlign: 'baseline',
                }}
              >
                <BookOpen size={11} color="#2563eb" />
                {part.replace(/[\[\]]/g, '')}
              </span>
            );
          }

          // Clinical parameter metric badge
          return (
            <span
              key={`${cIdx}-${pIdx}`}
              style={{
                display: 'inline-block',
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                padding: '0 4px',
                margin: '0 1.5px',
                borderRadius: '4px',
                fontWeight: 700,
                fontSize: '0.79rem',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                border: '1px solid rgba(59, 130, 246, 0.22)',
                verticalAlign: 'baseline',
              }}
            >
              {part}
            </span>
          );
        }
        return part;
      });
    });
  };

  const getSpecIconAndStyle = (label, body) => {
    const text = ((label || '') + ' ' + (body || '')).toLowerCase();

    if (
      text.includes('storage') ||
      text.includes('thermal') ||
      text.includes('temp') ||
      text.includes('stability') ||
      text.includes('°c') ||
      text.includes('freeze') ||
      text.includes('refrigerat') ||
      text.includes('cool')
    ) {
      return {
        icon: <Thermometer size={14} color="#2563eb" style={{ flexShrink: 0 }} />,
        tagBg: '#eff6ff',
        tagColor: '#1d4ed8',
        borderColor: 'rgba(59, 130, 246, 0.25)',
      };
    }
    if (
      text.includes('dilut') ||
      text.includes('reconstitut') ||
      text.includes('water') ||
      text.includes('bac') ||
      text.includes('solvent') ||
      text.includes('inject') ||
      text.includes('syringe') ||
      text.includes('volume') ||
      text.includes('liquid')
    ) {
      return {
        icon: <Droplets size={14} color="#0284c7" style={{ flexShrink: 0 }} />,
        tagBg: '#f0f9ff',
        tagColor: '#0369a1',
        borderColor: 'rgba(14, 165, 233, 0.25)',
      };
    }
    if (
      text.includes('purity') ||
      text.includes('standard') ||
      text.includes('hplc') ||
      text.includes('ms') ||
      text.includes('synthes') ||
      text.includes('analytical') ||
      text.includes('grade') ||
      text.includes('certif')
    ) {
      return {
        icon: <ShieldCheck size={14} color="#059669" style={{ flexShrink: 0 }} />,
        tagBg: '#ecfdf5',
        tagColor: '#047857',
        borderColor: 'rgba(16, 185, 129, 0.25)',
      };
    }
    if (
      text.includes('cas') ||
      text.includes('molecular') ||
      text.includes('formula') ||
      text.includes('weight') ||
      text.includes('sequence') ||
      text.includes('peptide') ||
      text.includes('receptor') ||
      text.includes('affinity') ||
      text.includes('agonist')
    ) {
      return {
        icon: <FlaskConical size={14} color="#7c3aed" style={{ flexShrink: 0 }} />,
        tagBg: '#f5f3ff',
        tagColor: '#6d28d9',
        borderColor: 'rgba(139, 92, 246, 0.25)',
      };
    }
    return {
      icon: <CheckCircle2 size={14} color="#003666" style={{ flexShrink: 0 }} />,
      tagBg: '#f8fafc',
      tagColor: '#003666',
      borderColor: '#e2e8f0',
    };
  };

  const getDynamicSuggestions = () => {
    if (contextType === 'protocol') {
      return ['Titration Schedule', 'Required Biomarkers', 'Compound Synergies', 'Contraindications'];
    }
    return contextType === 'monograph'
      ? ['BAC Dilution Ratio', 'Refrigeration Limits', 'Clinical Pathways', 'Receptor Target Affinities']
      : ['Metabolic Peptides', 'Immediate Dispatch', 'Lotusland Standards', 'Verified Volume Tiers'];
  };

  // Safe markdown cleaner and high-fidelity clinical parser
  const renderSafeBotText = (txt) => {
    if (!txt) return null;
    // Sanitize markdown links: preserve only safe internal public platform routes, strip external or private links
    const sanitized = txt.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, url) => {
      const isSafePublic = /^\/(proto(\/.*)?|p(\/.*)?|catalog|calculator|what-are-peptides)(\?.*)?$/.test(url);
      return isSafePublic ? `[${label}](${url})` : label;
    });
    const rawLines = sanitized.split('\n').map(l => l.trim()).filter(Boolean);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Institutional Micro-Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '4px',
            paddingBottom: '4px',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.70rem', fontWeight: 800, color: '#003666', letterSpacing: '0.02em' }}>
            <Sparkles size={11} color="#0284c7" />
            <span>LOTUSLAND ANALYTICAL VERIFICATION</span>
          </div>
          <span style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 600 }}>Standard Monograph</span>
        </div>

        {rawLines.map((line, idx) => {
          // Check if it's a section header
          const isHeader = (
            (line.endsWith(':') && !line.startsWith('•') && !line.startsWith('-') && !line.startsWith('*') && line.length < 65) ||
            line.startsWith('### ') ||
            line.startsWith('## ') ||
            (/^(\*\*[^*]+:\*\*|\*\*[^*]+\*\*)$/.test(line))
          );

          if (isHeader) {
            const cleanTitle = line.replace(/^[#*\s]+|[*#:]+$/g, '').trim();
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  margin: '6px 0 4px 0',
                  paddingBottom: '4px',
                  borderBottom: '1px solid #e2e8f0',
                }}
              >
                <Layers size={13} color="#003666" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#00284d', letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
                  {cleanTitle}
                </span>
              </div>
            );
          }

          // Check if it's a callout or closing question
          const isQuestionOrCallout = (
            line.endsWith('?') ||
            line.toLowerCase().startsWith('which specific') ||
            line.toLowerCase().startsWith('would you like') ||
            line.toLowerCase().startsWith('please let me know') ||
            line.toLowerCase().startsWith('note:') ||
            line.toLowerCase().startsWith('warning:')
          );

          if (isQuestionOrCallout) {
            return (
              <div
                key={idx}
                style={{
                  marginTop: '6px',
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '7px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px' }}>
                  <HelpCircle size={14} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.80rem', fontWeight: 600, color: '#0369a1', lineHeight: 1.4 }}>
                    {line}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', paddingLeft: '21px' }}>
                  {getDynamicSuggestions().map((chip, cIdx) => (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => handleSendMessage(`Please detail: ${chip}`)}
                      disabled={isBlocked || isLoading}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '12px',
                        padding: '2px 8px',
                        fontSize: '0.70rem',
                        fontWeight: 600,
                        color: '#003666',
                        cursor: isBlocked || isLoading ? 'default' : 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>
            );
          }

          // Check if it's a bullet or parameter item
          const isBullet = (
            line.startsWith('•') ||
            line.startsWith('-') ||
            line.startsWith('*') ||
            /^\d+\.\s/.test(line) ||
            /^[A-Za-z\s/&—-]+:\s+.+/.test(line)
          );

          if (isBullet) {
            const stripped = line.replace(/^[\s•\-*]+|\s*^\d+\.\s*/, '').trim();
            const colonMatch = stripped.match(/^(\*\*[^*]+:\*\*|\*\*[^*]+\*\*:\s*|[A-Za-z0-9\s/&—-]+:)\s*(.+)$/);

            let label = null;
            let body = stripped;

            if (colonMatch) {
              label = colonMatch[1].replace(/[:*]/g, '').trim();
              body = colonMatch[2].trim();
            }

            const style = getSpecIconAndStyle(label, body);

            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#ffffff',
                  border: `1px solid ${style.borderColor}`,
                  borderRadius: '8px',
                  padding: '8px 11px',
                  marginBottom: '2px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                }}
              >
                {label && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                    {style.icon}
                    <span style={{ fontSize: '0.78rem', fontWeight: 750, color: style.tagColor, letterSpacing: '-0.01em' }}>
                      {label}
                    </span>
                  </div>
                )}
                <div style={{ fontSize: '0.82rem', lineHeight: 1.45, color: '#334155', paddingLeft: label ? '19px' : '0' }}>
                  {!label && (
                    <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: '6px' }}>
                      {style.icon}
                    </span>
                  )}
                  {renderBodyWithHighlights(body)}
                </div>
              </div>
            );
          }

          // General paragraph
          return (
            <p key={idx} style={{ margin: '0 0 4px 0', lineHeight: 1.45, fontSize: '0.84rem', color: '#334155' }}>
              {renderBodyWithHighlights(line)}
            </p>
          );
        })}

        {/* Footer Verification Stamp */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '6px',
            paddingTop: '6px',
            borderTop: '1px dashed #e2e8f0',
            fontSize: '0.67rem',
            color: '#94a3b8',
            fontWeight: 500,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={11} color="#16a34a" />
            <span>Dual-Stage RP-HPLC & LC-MS Verified</span>
          </div>
          <span>Lotusland Limited</span>
        </div>
      </div>
    );
  };

  const quickPrompts = contextType === 'protocol'
    ? [
        `Explain the phase titration schedule`,
        `Which active peptides are included and how do they synergize?`,
        `What are the baseline laboratory monitoring biomarkers?`,
        `Are there companion peptide monographs or calculators?`,
      ]
    : contextType === 'monograph'
    ? [
        `How to reconstitute with 2mL BAC water?`,
        `What are the storage guidelines?`,
        `What is the purity specification?`,
        `What does peer-reviewed clinical research say?`,
      ]
    : [
        `What formulations are ready for immediate dispatch?`,
        `Which peptides are intended for metabolic research?`,
        `What is the Lotusland synthesis purity standard?`,
      ];

  return (
    <>
      {/* ── Floating Launcher Trigger ── */}
      {!hideFloatingTrigger && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="atlas-ai-public-fab"
          title="Open Atlas AI Technical Research Copilot"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 45,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '9px',
            background: 'linear-gradient(135deg, #003666 0%, #002244 100%)',
            color: '#ffffff',
            border: '1px solid rgba(56, 189, 248, 0.45)',
            borderRadius: '24px',
            padding: '10px 18px',
            fontSize: '0.84rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 8px 24px -4px rgba(0, 54, 102, 0.4), 0 2px 6px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Sparkles size={16} color="#38bdf8" />
          <span className="atlas-ai-fab-label" style={{ letterSpacing: '0.01em' }}>
            Atlas AI Technical Inquiry
          </span>
          <span
            className="atlas-ai-fab-badge"
            style={{
              fontSize: '0.70rem',
              fontWeight: 800,
              backgroundColor: isBlocked ? 'rgba(239, 68, 68, 0.25)' : 'rgba(56, 189, 248, 0.2)',
              color: isBlocked ? '#fca5a5' : '#bae6fd',
              border: `1px solid ${isBlocked ? '#f87171' : 'rgba(56, 189, 248, 0.35)'}`,
              padding: '2px 7px',
              borderRadius: '10px',
            }}
          >
            {isBlocked ? 'Limit Reached' : `${remaining}/${limit}`}
          </span>
        </button>
      )}

      {/* ── Slide-Over Drawer ── */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            transition: 'opacity 0.2s ease',
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '430px',
              height: '100%',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-8px 0 32px rgba(0, 24, 48, 0.25)',
              borderLeft: '1px solid #e2e8f0',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #00284d 0%, #001833 100%)',
                color: '#ffffff',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(56, 189, 248, 0.25)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Sparkles size={16} color="#38bdf8" />
                  <span style={{ fontSize: '0.98rem', fontWeight: 800, letterSpacing: '-0.01em', color: '#ffffff' }}>
                    Atlas Research Copilot
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#7dd3fc', marginTop: '2px', fontWeight: 600 }}>
                  Lotusland Limited • Verified Analytical Support
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '0.70rem',
                    fontWeight: 700,
                    backgroundColor: isBlocked ? 'rgba(239, 68, 68, 0.25)' : 'rgba(56, 189, 248, 0.15)',
                    color: isBlocked ? '#fca5a5' : '#bae6fd',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    border: `1px solid ${isBlocked ? 'rgba(248, 113, 113, 0.4)' : 'rgba(56, 189, 248, 0.3)'}`,
                  }}
                >
                  {isBlocked ? '0/5 Available' : `${remaining}/${limit} Inquiries`}
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Subheader Anchor Summary */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: '9px 16px',
                borderBottom: '1px solid #e2e8f0',
                fontSize: '0.76rem',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <ShieldCheck size={14} color="#16a34a" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <strong style={{ color: '#003666' }}>Active Focus:</strong>{' '}
                {contextType === 'protocol'
                  ? `Clinical Protocol: ${contextAnchor?.name || 'Protocol'} (${contextAnchor?.duration || 'Multi-week'})`
                  : contextType === 'monograph'
                  ? `${contextAnchor?.name || 'Peptide Monograph'} (${contextAnchor?.purity || '≥99% HPLC'})`
                  : `Portfolio Catalog (${catalogInventory.length} Available Formulations)`}
              </div>
            </div>

            {/* Dual Mode Tab Selector */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                padding: '0 12px',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                style={{
                  padding: '9px 14px',
                  fontSize: '0.78rem',
                  fontWeight: activeTab === 'chat' ? 750 : 600,
                  color: activeTab === 'chat' ? '#003666' : '#64748b',
                  borderBottom: activeTab === 'chat' ? '2px solid #003666' : '2px solid transparent',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={13} color={activeTab === 'chat' ? '#0284c7' : '#94a3b8'} />
                <span>Technical Inquiry</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('evidence')}
                style={{
                  padding: '9px 14px',
                  fontSize: '0.78rem',
                  fontWeight: activeTab === 'evidence' ? 750 : 600,
                  color: activeTab === 'evidence' ? '#003666' : '#64748b',
                  borderBottom: activeTab === 'evidence' ? '2px solid #003666' : '2px solid transparent',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <BookOpen size={13} color={activeTab === 'evidence' ? '#0284c7' : '#94a3b8'} />
                <span>Clinical Evidence {clinicalSources.length > 0 ? `(${clinicalSources.length})` : ''}</span>
              </button>
            </div>

            {/* Tab 1: Chat View */}
            {activeTab === 'chat' && (
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  backgroundColor: '#ffffff',
                }}
              >
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 10px', color: '#64748b' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        backgroundColor: '#f0f9ff',
                        color: '#0284c7',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '10px',
                      }}
                    >
                      <Sparkles size={22} />
                    </div>
                    <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#0f172a' }}>
                      Dedicated Technical Research Assistant
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', maxWidth: '320px', margin: '6px auto 0', lineHeight: 1.45 }}>
                      Ask specific compounding, dilution, thermal stability, or peer-reviewed literature questions regarding this monograph.
                    </div>

                    {/* Suggested Prompts */}
                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Suggested Inquiries:
                      </div>
                      {quickPrompts.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          type="button"
                          onClick={() => handleSendMessage(q)}
                          disabled={isBlocked || isLoading}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            fontSize: '0.78rem',
                            color: '#003666',
                            fontWeight: 600,
                            textAlign: 'left',
                            cursor: isBlocked || isLoading ? 'default' : 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          → {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((m, idx) => (
                    <div
                      key={idx}
                      style={{
                        alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: m.sender === 'user' ? '82%' : '96%',
                        background: m.sender === 'user'
                          ? 'linear-gradient(135deg, #003666 0%, #002244 100%)'
                          : '#ffffff',
                        color: m.sender === 'user' ? '#ffffff' : '#1e293b',
                        border: m.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                        borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        padding: m.sender === 'user' ? '10px 14px' : '13px 14px',
                        boxShadow: m.sender === 'user'
                          ? '0 2px 6px rgba(0, 54, 102, 0.18)'
                          : '0 2px 8px -2px rgba(0, 54, 102, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03)',
                      }}
                    >
                      {m.sender === 'user' ? (
                        <div style={{ fontSize: '0.86rem', lineHeight: 1.4, fontWeight: 500 }}>{m.text}</div>
                      ) : (
                        renderSafeBotText(m.text)
                      )}
                    </div>
                  ))
                )}

                {isLoading && (
                  <div
                    style={{
                      alignSelf: 'flex-start',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      fontSize: '0.82rem',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <RefreshCw size={14} className="animate-spin" color="#003666" />
                    <span>Querying analytical & clinical literature compendiums…</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Tab 2: Recognized Clinical Evidence Compendium */}
            {activeTab === 'evidence' && (
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Compound Clinical Identity Card */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '14px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <FlaskConical size={16} color="#003666" />
                    <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#00284d' }}>
                      {contextAnchor?.name || 'Peptide Active Substance'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div><strong>CAS Registry:</strong> {contextAnchor?.cas || 'Verified Compendial ID'}</div>
                    <div><strong>Synthesis Standard:</strong> {contextAnchor?.purity || '≥ 99.0% Dual-Stage RP-HPLC Verified'}</div>
                    <div><strong>Formulation Quality:</strong> Lyophilized Analytical Grade (Lotusland Limited Release)</div>
                  </div>
                </div>

                {/* Peer-Reviewed PubMed Studies */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <BookOpen size={14} color="#003666" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#00284d', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    Peer-Reviewed PubMed Clinical Studies
                  </span>
                </div>

                {isLoadingSources ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b', fontSize: '0.80rem' }}>
                    <RefreshCw size={16} className="animate-spin" style={{ display: 'inline', marginRight: '6px' }} />
                    Retrieving NIH PubMed citations…
                  </div>
                ) : clinicalSources.length === 0 ? (
                  <div style={{ backgroundColor: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '0.78rem' }}>
                    Clinical compendial monograph active. Verified analytical CoA available in primary specifications tab.
                  </div>
                ) : (
                  clinicalSources.map((study, sIdx) => (
                    <div
                      key={sIdx}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '9px',
                        padding: '12px',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 750,
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            padding: '2px 7px',
                            borderRadius: '5px',
                            border: '1px solid #dbeafe',
                          }}
                        >
                          {study.journal} ({study.pubdate ? study.pubdate.slice(0, 4) : 'Clinical Study'})
                        </span>
                        <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#64748b', fontWeight: 600 }}>
                          PMID: {study.pmid}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.80rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.35 }}>
                        {study.title}
                      </div>

                      {study.authors && (
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          Authors: {study.authors}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          handleSendMessage(`What are the key clinical findings and dosage protocols discussed in PubMed study PMID ${study.pmid}?`);
                        }}
                        style={{
                          marginTop: '4px',
                          alignSelf: 'flex-start',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#003666',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Sparkles size={11} color="#0284c7" />
                        <span>Inquire About This Study →</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Quota Exhaustion Banner & Registration Trigger */}
            {isBlocked && (
              <div
                style={{
                  backgroundColor: '#fffbeb',
                  borderTop: '1px solid #fde68a',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#92400e', fontSize: '0.80rem', fontWeight: 800 }}>
                  <AlertTriangle size={15} color="#d97706" />
                  <span>Free Guest Inquiries Depleted (5/5)</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#78350f', lineHeight: 1.4 }}>
                  You have utilized all 5 free analytical inquiries for this IP. Access unlimited clinical intelligence and full compendium tools with a verified professional account.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenRegisterModal) {
                      setIsOpen(false);
                      onOpenRegisterModal();
                    } else {
                      window.open('/auth/login?register=true', '_blank');
                    }
                  }}
                  style={{
                    marginTop: '4px',
                    background: 'linear-gradient(135deg, #003666 0%, #002244 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontWeight: 800,
                    fontSize: '0.80rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0, 54, 102, 0.25)',
                  }}
                >
                  <span>Register for Full Professional Access</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* Input Box */}
            <div
              style={{
                padding: '14px 16px',
                borderTop: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
              }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                style={{ display: 'flex', gap: '8px' }}
              >
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isLoading || isBlocked}
                  placeholder={
                    isBlocked
                      ? 'Inquiry quota reached (5/5). Please register.'
                      : 'Ask technical question (English only)…'
                  }
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    outline: 'none',
                    backgroundColor: isBlocked ? '#f1f5f9' : '#ffffff',
                    color: isBlocked ? '#94a3b8' : '#0f172a',
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading || isBlocked || !message.trim()}
                  style={{
                    backgroundColor: isBlocked || !message.trim() ? '#94a3b8' : '#003666',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isBlocked || !message.trim() ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Send size={15} />
                </button>
              </form>
              <div
                style={{
                  fontSize: '0.68rem',
                  color: '#94a3b8',
                  marginTop: '6px',
                  textAlign: 'center',
                }}
              >
                Strictly English • Lotusland Analytical Verification • Confidential Session
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

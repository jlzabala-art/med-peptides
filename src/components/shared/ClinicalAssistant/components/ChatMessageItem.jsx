/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { User, Bot, Copy, Check, Volume2, VolumeX, ThumbsUp, ThumbsDown } from 'lucide-react';
import { renderAIMarkdown, processMarkdown } from '../utils/markdownRenderer';
import EvidenceBadge from './EvidenceBadge';
import StackSynergyWidget from './StackSynergyWidget';
import ComparisonMatrix from './ComparisonMatrix';
import ProtocolTimeline from './ProtocolTimeline';
import VisualReconWidget from './VisualReconWidget';
import FormattedResponse from './FormattedResponse';
import AgentBadge from './AgentBadge';

export default function ChatMessageItem({ msg, idx, onProductClick, InstantResultsTabs, navigate, setIsOpen, onSend, onRate, onDeepDive, contextMode = 'patient' }) {
  const [copyIdx, setCopyIdx] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isAssistant = msg.role === 'assistant';
  const { html, metadata } = isAssistant ? processMarkdown(msg.content) : { html: null, metadata: {} };
  
  const isSpecialMode = contextMode === 'admin' || contextMode === 'doctor';
  const themeAccent = contextMode === 'admin' ? '#1a73e8' : contextMode === 'doctor' ? '#0f9d58' : '#4285f4';
  const senderBot = contextMode === 'admin' ? 'AdminAI' : contextMode === 'doctor' ? 'ClinicalAI' : 'ResearchAI';
  const senderUser = contextMode === 'admin' ? 'Administrator' : contextMode === 'doctor' ? 'Physician' : 'Researcher';

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    
    // Clean text for speech (strip markdown links, formatting, emojis)
    const speechText = msg.content
      .replace(/\[.*?\]/g, '')
      .replace(/\*\*/g, '')
      .replace(/#+/g, '')
      .replace(/`{3}[\s\S]*?`{3}/g, '') // remove code blocks
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ''); // remove emojis
      
    const utterance = new SpeechSynthesisUtterance(speechText);
    
    // Dynamically detect Spanish vs English - forced to false per user request
    const isSpanish = false;
    utterance.lang = isSpanish ? 'es-ES' : 'en-US';
    
    // Set a premium, slightly slower pacing rate for optimal medical research reading
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    
    // Try to pick a premium voice if available
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        // Find a high quality Spanish voice
        if (isSpanish) {
          const esVoice = voices.find(v => v.lang.startsWith('es') && (v.name.includes('Google') || v.name.includes('Siri') || v.name.includes('Monica')));
          if (esVoice) utterance.voice = esVoice;
        } else {
          // Find a high quality English voice
          const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Siri') || v.name.includes('Samantha') || v.name.includes('Daniel')));
          if (enVoice) utterance.voice = enVoice;
        }
      }
    }
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const wrapperStyle = isSpecialMode ? {
    display: 'flex', gap: '1.25rem',
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    padding: '1.25rem',
    backgroundColor: isAssistant ? 'var(--color-bg-surface)' : '#f1f5f9',
    borderRadius: '8px',
    border: `1px solid ${isAssistant ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.04)'}`,
    borderLeft: `4px solid ${isAssistant ? themeAccent : 'var(--color-text-secondary)'}`,
    boxShadow: isAssistant ? '0 2px 8px rgba(0, 0, 0, 0.02)' : 'none',
    marginBottom: '0.85rem'
  } : {
    display: 'flex', gap: '1.25rem',
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    padding: '1.5rem 0',
    borderBottom: '1px solid #f1f3f4',
  };

  const avatarBg = msg.role === 'user' ? themeAccent : 'white';
  const avatarColor = msg.role === 'user' ? 'white' : themeAccent;

  return (
    <div 
      className={`ca-message-item-wrapper ${msg.role === 'user' ? 'ca-user-message' : ''}`}
      style={wrapperStyle}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'center' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: avatarBg,
          color: avatarColor,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)', flexShrink: 0,
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
        </div>
        {/* Agent identity badge — shown below bot avatar */}
        {isAssistant && msg.agentName && (
          <AgentBadge agentName={msg.agentName} animated={true} size="sm" />
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
        {isAssistant && metadata.evidenceLevel && (
          <EvidenceBadge 
            level={metadata.evidenceLevel} 
            onClick={() => onDeepDive(metadata.deepDive || { 
              title: "Compound Analysis", 
              description: "Detailed scientific profile of the compound mentioned in the research context.",
              findings: ["Mechanism of action analysis", "Clinical research overview", "Safety profile review"],
              stage: "Research Phase",
              score: metadata.evidenceLevel,
              sources: [{ title: "PubMed Central Search", url: "https://pubmed.ncbi.nlm.nih.gov/", journal: "Scientific Database" }]
            })} 
          />
        )}
        <div className="ca-message-bubble" style={{
          width: '100%',
          padding: isSpecialMode ? '0.2rem 0' : '0.75rem 0',
          color: '#202124',
          fontSize: '0.85rem', lineHeight: 1.6,
          whiteSpace: isAssistant ? 'normal' : 'pre-wrap',
          position: 'relative',
        }}>
          {/* Markdown content (existing — always rendered as fallback) */}
          {isAssistant ? html : (msg.displayText || msg.content)}

          {/* Rich formatted response (rendered BELOW markdown when available) */}
          {isAssistant && msg.formatted && (
            <FormattedResponse
              formatted={msg.formatted}
              onProductClick={() => setIsOpen?.(false)}
            />
          )}

          {isAssistant && msg.content.includes('Reporte de Optimización') && (
            <button 
              onClick={() => {
                navigator.clipboard.writeText(msg.content);
                setCopyIdx(idx);
                setTimeout(() => setCopyIdx(null), 2000);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '0.85rem',
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                border: copyIdx === idx ? '1px solid #10b981' : '1px solid rgba(0, 209, 255, 0.2)',
                background: copyIdx === idx ? 'rgba(16, 185, 129, 0.05)' : 'linear-gradient(135deg, rgba(0, 209, 255, 0.05) 0%, rgba(0, 75, 135, 0.02) 100%)',
                color: copyIdx === idx ? 'var(--color-success)' : 'var(--primary)',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                width: 'fit-content',
                boxShadow: '0 4px 12px rgba(0, 209, 255, 0.05)'
              }}
              onMouseEnter={e => {
                if (copyIdx !== idx) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 209, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(0, 209, 255, 0.4)';
                }
              }}
              onMouseLeave={e => {
                if (copyIdx !== idx) {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 209, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(0, 209, 255, 0.2)';
                }
              }}
            >
              {copyIdx === idx ? (
                <>
                  <Check size={13} strokeWidth={2.5} />
                  <span>¡Reporte Copiado!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>📋 Copiar Reporte Clínico</span>
                </>
              )}
            </button>
          )}
          
          {isAssistant && (
            <div style={{ 
              display: 'flex', 
              gap: '0.25rem', 
              justifyContent: 'flex-end', 
              marginTop: '0.85rem', 
              paddingTop: '0.4rem', 
              borderTop: '1px solid #f1f5f9' 
            }}>
              <button 
                onClick={handleSpeak}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '0.4rem', borderRadius: '6px',
                  color: isSpeaking ? 'var(--primary)' : 'var(--color-text-tertiary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                  backgroundColor: isSpeaking ? 'rgba(0,75,135,0.05)' : 'transparent'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0,75,135,0.05)'}
                onMouseLeave={e => { if (!isSpeaking) e.currentTarget.style.backgroundColor = 'transparent'; }}
                title={isSpeaking ? "Stop speaking" : "Read aloud"}
              >
                {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>

              <button 
                onClick={() => {
                  navigator.clipboard.writeText(msg.content);
                  setCopyIdx(idx);
                  setTimeout(() => setCopyIdx(null), 2000);
                }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '0.4rem', borderRadius: '6px',
                  color: copyIdx === idx ? 'var(--color-success)' : 'var(--color-text-tertiary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                title="Copy to clipboard"
              >
                {copyIdx === idx ? <Check size={14} /> : <Copy size={14} />}
              </button>

              <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--color-border)', margin: '0.3rem 0.2rem 0' }} />

              <button 
                onClick={() => onRate(idx, 'up')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '0.4rem', borderRadius: '6px',
                  color: msg.rating === 'up' ? 'var(--color-success)' : 'var(--color-text-tertiary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                  backgroundColor: msg.rating === 'up' ? 'rgba(5,150,105,0.08)' : 'transparent'
                }}
                title="Helpful"
              >
                <ThumbsUp size={14} fill={msg.rating === 'up' ? 'var(--color-success)' : 'none'} />
              </button>

              <button 
                onClick={() => onRate(idx, 'down')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '0.4rem', borderRadius: '6px',
                  color: msg.rating === 'down' ? 'var(--color-danger)' : 'var(--color-text-tertiary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                  backgroundColor: msg.rating === 'down' ? 'rgba(220,38,38,0.08)' : 'transparent'
                }}
                title="Not helpful"
              >
                <ThumbsDown size={14} fill={msg.rating === 'down' ? 'var(--color-danger)' : 'none'} />
              </button>
            </div>
          )}
        </div>

        <div style={{ fontSize: '0.62rem', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
          {isAssistant ? senderBot : senderUser} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>

        {/* Instant Results disabled per user request
        {isAssistant && (msg.preRankedProducts?.length > 0 || msg.preRankedProtocols?.length > 0) && InstantResultsTabs && (
          <InstantResultsTabs
            preRankedProducts={msg.preRankedProducts || []}
            preRankedProtocols={msg.preRankedProtocols || []}
            navigate={navigate}
            setIsOpen={setIsOpen}
          />
        )}
        */}

        {isAssistant && metadata.stackSynergy && (
          <StackSynergyWidget 
            synergyScore={metadata.stackSynergy.score}
            compounds={metadata.stackSynergy.compounds}
          />
        )}

        {isAssistant && metadata.comparisonMatrix && (
          <ComparisonMatrix 
            compounds={metadata.comparisonMatrix.compounds}
            data={metadata.comparisonMatrix.data}
          />
        )}

        {isAssistant && metadata.protocolTimeline && (
          <ProtocolTimeline 
            phases={metadata.protocolTimeline}
          />
        )}

        {isAssistant && metadata.visualRecon && (
          <VisualReconWidget 
            peptideName={metadata.visualRecon.peptideName}
            vialMg={metadata.visualRecon.vialMg}
            waterMl={metadata.visualRecon.waterMl}
            dosageMcg={metadata.visualRecon.dosageMcg}
          />
        )}
      </div>
    </div>
  );
}

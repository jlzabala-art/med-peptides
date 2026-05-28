 
import React from 'react';
import { Trash2, X, Download, FileDown, Mail, PanelLeft } from 'lucide-react';
import { generateClinicalBriefPDF } from '../utils/PDFGenerator';

export default function ChatHeader({ 
  onClear, 
  onExport, 
  onEmail, 
  onClose, 
  onToggleHistory, 
  isBeginnerMode, 
  onToggleBeginner, 
  isMobile, 
  messagesCount, 
  messages,
  isHistoryOpen,
  queriesToday = 0,
  maxFreeQueries = 5,
  isRegistered = false,
  role = 'patient',
  contextMode = 'clinical'
}) {
  const themeAccent = contextMode === 'admin' ? '#1a73e8' : contextMode === 'doctor' ? '#0f9d58' : '#4285f4';
  const themeBgActive = contextMode === 'admin' ? '#e8f0fe' : contextMode === 'doctor' ? '#e6f4ea' : '#e8f0fe';
  const headerTitle = contextMode === 'admin' ? 'Admin Assistant' : contextMode === 'doctor' ? 'Clinical Advisor' : 'Research Assistant';
  const statusLabel = contextMode === 'admin' ? 'System Link Active' : contextMode === 'doctor' ? 'Clinical Link Active' : 'Neural Link Active';

  return (
    <div className="clinical-chat-header" style={{
      padding: isMobile ? '0.75rem 1rem' : '1rem 1.5rem',
      background: 'var(--color-bg-surface)',
      color: '#202124',
      borderBottom: '1px solid #dadce0',
      borderTop: `3px solid ${themeAccent}`,
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '0.6rem' : '1rem',
      flexShrink: 0
    }}>
      <button 
        onClick={onToggleHistory}
        title={isHistoryOpen ? "Hide sidebar" : "Show sidebar"}
        style={{
          width: isMobile ? '32px' : '40px',
            height: isMobile ? '32px' : '40px',
            borderRadius: isMobile ? '10px' : '12px',
            border: isMobile ? 'none' : '1px solid #dadce0',
            cursor: 'pointer',
            backgroundColor: isMobile ? 'rgba(26,115,232,0.08)' : '#f8f9fa',
            color: isMobile ? '#202124' : '#202124',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            flexShrink: 0
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.05)';
          if (!isMobile) e.currentTarget.style.backgroundColor = themeBgActive;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          if (!isMobile) e.currentTarget.style.backgroundColor = '#f8f9fa';
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PanelLeft size={isMobile ? 16 : 20} />
        </span>
      </button>
      
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: isMobile ? '0.9rem' : '1.05rem', 
            fontWeight: 900, 
            letterSpacing: '-0.02em', 
            color: '#0f172a',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {headerTitle}
          </h3>
          {contextMode !== 'admin' && contextMode !== 'doctor' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#e8f0fe',
              border: '1px solid #dadce0',
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '0.62rem',
              fontWeight: 850,
              color: '#1967d2',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              boxShadow: 'none'
            }}>
              <span style={{ fontSize: '0.72rem' }}>📋</span>
              <span>Prescription Scan Ready</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.1rem' }}>
          <div style={{ 
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            backgroundColor: themeAccent,
            boxShadow: `0 0 6px ${themeAccent}`,
            animation: 'pulse 2s infinite',
            flexShrink: 0
          }} />
          <span style={{ 
            fontSize: '0.62rem',
            opacity: 0.9,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#5f6368',
            whiteSpace: 'nowrap'
          }}>
            {statusLabel}
          </span>
          {!isRegistered && (
            <>
              <span style={{ fontSize: '0.5rem', color: '#dadce0', margin: '0 0.2rem' }}>|</span>
              <span style={{ 
                fontSize: '0.62rem',
                fontWeight: 700,
                color: queriesToday >= maxFreeQueries ? '#d93025' : '#5f6368',
                backgroundColor: queriesToday >= maxFreeQueries ? '#fce8e6' : '#f1f3f4',
                padding: '2px 6px',
                borderRadius: '8px',
                whiteSpace: 'nowrap'
              }} title={`You have used ${queriesToday} of your ${maxFreeQueries} free queries today. Resets at midnight.`}>
                Free Quota: {queriesToday}/{maxFreeQueries}
              </span>
            </>
          )}
        </div>
      </div>
      
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: isMobile ? '0.35rem' : '0.5rem', flexShrink: 0 }}>
        {messagesCount > 1 && (
          <>
            <button
              onClick={onToggleBeginner}
              title={isBeginnerMode ? "Switch to Advanced Mode" : "Switch to Beginner Mode"}
              style={{
                height: '32px',
                padding: isMobile ? '0 6px' : '0 10px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                backgroundColor: isBeginnerMode ? 'var(--color-success)' : 'var(--color-bg-app)',
                color: isBeginnerMode ? 'white' : 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.2s',
                boxShadow: isBeginnerMode ? '0 0 15px rgba(16,185,129,0.2)' : 'none'
              }}
            >
              <div style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                backgroundColor: isBeginnerMode ? 'var(--color-bg-surface)' : 'var(--color-text-tertiary)', 
                flexShrink: 0 
              }} />
              <span style={{ fontSize: '0.62rem', fontWeight: 900, textTransform: 'uppercase' }}>
                {isMobile ? (isBeginnerMode ? 'BEG' : 'EXP') : (isBeginnerMode ? 'Beginner' : 'Expert')}
              </span>
            </button>
            
            <div style={{ 
              width: '1px', 
              height: '20px', 
              backgroundColor: isMobile ? 'rgba(255,255,255,0.15)' : 'var(--color-border)', 
              margin: isMobile ? '0 0.1rem' : '0 0.2rem' 
            }} />
            
            <button
              onClick={() => generateClinicalBriefPDF(messages)}
              title="Export Research Brief (PDF)"
              style={{
                width: '32px', height: '32px', borderRadius: '10px',
                border: isMobile ? 'none' : '1px solid #e2e8f0', 
                cursor: 'pointer',
                backgroundColor: isMobile ? 'rgba(255,255,255,0.12)' : 'var(--color-bg-app)',
                color: isMobile ? 'white' : 'var(--color-text-secondary)', 
                display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => { if (!isMobile) e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
              onMouseLeave={e => { if (!isMobile) e.currentTarget.style.backgroundColor = 'var(--color-bg-app)'; }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileDown size={15} />
              </span>
            </button>



            <button
              onClick={onClear}
              title="Clear conversation"
              style={{
                height: '32px',
                padding: isMobile ? '0 8px' : '0 10px',
                borderRadius: '10px',
                border: isMobile ? '1px solid rgba(255,255,255,0.25)' : '1px solid #fee2e2',
                cursor: 'pointer',
                backgroundColor: isMobile ? 'rgba(255,255,255,0.12)' : 'var(--color-danger-bg)',
                color: isMobile ? 'white' : 'var(--color-danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                if (!isMobile) {
                  e.currentTarget.style.backgroundColor = '#fde8e8';
                }
              }}
              onMouseLeave={e => {
                if (!isMobile) {
                  e.currentTarget.style.backgroundColor = 'var(--color-danger-bg)';
                }
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={14} />
              </span>
              {!isMobile && <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>Clear</span>}
            </button>
          </>
        )}
        <button
          onClick={onClose}
          title="Close assistant"
          style={{
            width: '32px', height: '32px', borderRadius: '10px',
            border: isMobile ? 'none' : '1px solid #e2e8f0', 
            cursor: 'pointer',
            backgroundColor: isMobile ? 'rgba(0,0,0,0.2)' : 'var(--color-bg-app)',
            color: isMobile ? 'white' : 'var(--color-text-secondary)', 
            display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            marginLeft: '0.1rem',
            flexShrink: 0,
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { if (!isMobile) e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
          onMouseLeave={e => { if (!isMobile) e.currentTarget.style.backgroundColor = 'var(--color-bg-app)'; }}
        >
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </span>
        </button>
      </div>
    </div>
  );
}

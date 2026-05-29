import React from 'react';
import { Trash2, X, FileDown, PanelLeft, Zap } from 'lucide-react';
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
  const headerTitle = contextMode === 'admin' ? 'Atlas AI (Admin)' : contextMode === 'doctor' ? 'Clinical Advisor' : 'Atlas AI';
  const statusLabel = contextMode === 'admin' ? 'System Link Active' : contextMode === 'doctor' ? 'Clinical Link Active' : 'Neural Link Active';

  return (
    <div className="clinical-chat-header" style={{
      padding: '0.5rem 1rem',
      background: 'var(--color-bg-surface)',
      color: '#202124',
      borderBottom: '1px solid #dadce0',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      flexShrink: 0,
      height: '50px'
    }}>
      <button 
        onClick={onToggleHistory}
        title={isHistoryOpen ? "Ocultar panel lateral de historial" : "Mostrar historial de chats"}
        data-tooltip={isHistoryOpen ? "Ocultar panel lateral de historial" : "Mostrar historial de chats"}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          border: isMobile ? 'none' : '1px solid #dadce0',
          cursor: 'pointer',
          backgroundColor: isMobile ? 'rgba(26,115,232,0.08)' : '#f8f9fa',
          color: '#202124',
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
          <PanelLeft size={16} />
        </span>
      </button>
      
      <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {contextMode !== 'admin' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: '0.95rem', 
              fontWeight: 800, 
              color: '#0f172a',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }} title={`Asistente de IA: ${headerTitle}`}>
              {headerTitle}
            </h3>
            {contextMode !== 'doctor' && !isMobile && (
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
                flexShrink: 0
              }} title="El sistema puede analizar recetas médicas en esta sesión.">
                <span style={{ fontSize: '0.72rem' }}>📋</span>
                <span>Prescription Scan Ready</span>
              </div>
            )}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: contextMode === 'admin' ? '0' : '0.1rem' }}>
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
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }} title={`Estado de conexión: ${statusLabel}`}>
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
              }} title={`Used ${queriesToday} of ${maxFreeQueries} free queries today.`}>
                Quota: {queriesToday}/{maxFreeQueries}
              </span>
            </>
          )}
        </div>
      </div>
      
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
        {messagesCount > 1 && (
          <>
            <button
              onClick={onToggleBeginner}
              title={isBeginnerMode ? "Cambiar a modo experto (rápido)" : "Cambiar a modo principiante (explicado)"}
              data-tooltip={isBeginnerMode ? "Cambiar a modo experto (rápido)" : "Cambiar a modo principiante (explicado)"}
              style={{
                width: '32px', height: '32px', borderRadius: '10px',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                backgroundColor: isBeginnerMode ? 'var(--color-success)' : 'var(--color-bg-app)',
                color: isBeginnerMode ? 'white' : 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: isBeginnerMode ? '0 0 15px rgba(16,185,129,0.2)' : 'none'
              }}
            >
              <Zap size={16} />
            </button>
            
            <div style={{ 
              width: '1px', 
              height: '20px', 
              backgroundColor: 'var(--color-border)', 
              margin: '0 0.1rem' 
            }} />
            
            <button
              onClick={() => generateClinicalBriefPDF(messages)}
              title="Exportar chat a PDF"
              data-tooltip="Exportar chat a PDF"
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
              <FileDown size={16} />
            </button>

            <button
              onClick={onClear}
              title="Borrar chat actual"
              data-tooltip="Borrar chat actual"
              style={{
                width: '32px', height: '32px', borderRadius: '10px',
                border: isMobile ? '1px solid rgba(255,255,255,0.25)' : '1px solid #fee2e2',
                cursor: 'pointer',
                backgroundColor: isMobile ? 'rgba(255,255,255,0.12)' : 'var(--color-danger-bg)',
                color: isMobile ? 'white' : 'var(--color-danger)',
                display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { if (!isMobile) e.currentTarget.style.backgroundColor = '#fde8e8'; }}
              onMouseLeave={e => { if (!isMobile) e.currentTarget.style.backgroundColor = 'var(--color-danger-bg)'; }}
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
        <button
          onClick={onClose}
          title="Cerrar asistente"
          data-tooltip="Cerrar asistente"
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

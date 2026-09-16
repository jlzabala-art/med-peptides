import React from 'react';





import { generateClinicalBriefPDF } from '../utils/PDFGenerator';
import { Trash2, X, FileDown, PanelLeft, Zap } from '@/lib/icons';

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
  contextMode = 'clinical',
  pageContext
}) {
  const isPatientContext = contextMode === 'patient' || pageContext?.mode === 'patient' || Boolean(pageContext?.patientId);
  const isProtocolContext = !isPatientContext && (
    contextMode === 'protocols' ||
    pageContext?.mode === 'protocols' ||
    pageContext?.activeTab === 'protocols' ||
    pageContext?.page === 'protocols' ||
    Boolean(pageContext?.selectedProtocol) ||
    (typeof window !== 'undefined' && window.location.pathname.includes('/protocols'))
  );
  const isProductContext = !isPatientContext && !isProtocolContext && (
    pageContext?.isProductPage ||
    Boolean(pageContext?.selectedProduct) ||
    (typeof window !== 'undefined' && (window.location.pathname.startsWith('/product/') || window.location.pathname.startsWith('/supplements/'))) ||
    (!pageContext && messages?.some(m => m.content && /\b(retatrutide|tirzepatide|semaglutide|bpc-157|tb-500|cjc-1295|ipamorelin|aod-9604|epithalon|semax|selank|nad\+|motc-c|dosage|mechanism|peptide|protocol|vial|reconstitution)\b/i.test(m.content)))
  );
  const isCatalogContext = !isPatientContext && !isProductContext && !isProtocolContext && (
    pageContext?.activeTab === 'products' ||
    pageContext?.activeTab === 'catalog' ||
    pageContext?.page === 'products' ||
    (typeof window !== 'undefined' && (window.location.pathname.includes('/products') || window.location.pathname.includes('/catalog')))
  );
  const isQuotationsContext = !isPatientContext && !isProductContext && !isProtocolContext && (
    pageContext?.isQuotationsContext ||
    pageContext?.isEstimateContext ||
    pageContext?.page === 'quotations' ||
    (typeof window !== 'undefined' && (window.location.pathname.includes('/quotations') || window.location.pathname.includes('/estimates')))
  );

  const selectedProduct = pageContext?.selectedProduct || pageContext?.product;
  const selectedProtocol = pageContext?.selectedProtocol || pageContext?.protocol;
  const selectedQuote = pageContext?.quote;
  const activeProductName = selectedProduct?.name || selectedProduct?.title || selectedProduct?.compound;
  const activeProtocolName = selectedProtocol?.name || selectedProtocol?.title;
  const activeQuoteNumber = pageContext?.quoteNumber || selectedQuote?.quotationNumber || selectedQuote?.id;
  const activeQuoteClient = pageContext?.clientName || selectedQuote?.clientName;

  const isDoctorRole = contextMode === 'doctor' || contextMode === 'medical_director' || role === 'doctor' || role === 'medical_director';
  const themeAccent = isPatientContext ? '#0d9488' : isProtocolContext ? '#0d9488' : isQuotationsContext ? '#0284c7' : (isProductContext || isCatalogContext) ? '#7c3aed' : isDoctorRole ? '#0d9488' : contextMode === 'admin' ? '#1a73e8' : '#4285f4';
  const themeBgActive = isPatientContext ? 'rgba(13, 148, 136, 0.08)' : isProtocolContext ? 'rgba(13, 148, 136, 0.08)' : isQuotationsContext ? 'rgba(2, 132, 199, 0.08)' : (isProductContext || isCatalogContext) ? 'rgba(124, 58, 237, 0.08)' : isDoctorRole ? 'rgba(13, 148, 136, 0.08)' : contextMode === 'admin' ? '#e8f0fe' : '#e8f0fe';
  const headerTitle = isPatientContext 
    ? '🩺 Patient Clinical Copilot' 
    : isProtocolContext && activeProtocolName
      ? `📋 ${activeProtocolName}`
      : isProtocolContext
        ? '📋 ClinicalAI — Protocol Hub'
        : isQuotationsContext && activeQuoteNumber
          ? `💼 Quote #${activeQuoteNumber} (${activeQuoteClient || 'Client'})`
          : isQuotationsContext
            ? '💼 Commercial AI — Estimates & Quotes'
            : isProductContext && activeProductName
              ? `🔬 ${activeProductName}`
              : isProductContext
                ? '🔬 ClinicalAI — Product Intelligence'
                : isCatalogContext
                  ? '🧬 Catalog & Peptide Intelligence'
                  : isDoctorRole
                    ? '🩺 Clinical AI Copilot (Doctor)'
                    : contextMode === 'admin'
                      ? 'Atlas AI (Admin)'
                      : 'Atlas AI';

  const statusLabel = isPatientContext 
    ? `Patient Link Active · ${pageContext?.name || 'Chart'}` 
    : isProtocolContext && activeProtocolName
      ? `Protocol Active · ${selectedProtocol?.category || selectedProtocol?.code || 'Tier 2/3'}`
      : isProtocolContext
        ? `Protocol Intelligence Active · ${pageContext?.protocolsCount ? `${pageContext.protocolsCount} Protocols` : 'Protocols DB'}`
        : isQuotationsContext && activeQuoteNumber
          ? `Estimate Active · Margin ${pageContext?.marginPercent || selectedQuote?.marginPercent || 45}%`
          : isQuotationsContext
            ? `Estimates Pipeline Active · ${pageContext?.totalQuotations ? `${pageContext.totalQuotations} Quotes` : 'Pro-Forma Desk'}`
            : isProductContext && activeProductName
              ? `Product Active · ${selectedProduct?.sku || selectedProduct?.concentration || 'Tier 2/3'}`
              : isProductContext 
                ? 'Product Research Link Active' 
                : isCatalogContext 
                  ? 'Catalog Intelligence Active · Product DB' 
                  : isDoctorRole 
                    ? 'Clinical Link Active · Doctor Decision Support' 
                    : contextMode === 'admin' 
                      ? 'System Link Active' 
                      : 'Neural Link Active';

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
        title={isHistoryOpen ? "Hide chat history sidebar" : "Show chat history"}
        data-tooltip={isHistoryOpen ? "Hide chat history sidebar" : "Show chat history"}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '0.95rem', 
            fontWeight: 800, 
            color: '#0f172a',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }} title={`AI Assistant: ${headerTitle}`}>
            {headerTitle}
          </h3>
          {isProtocolContext && !isMobile && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'rgba(13, 148, 136, 0.1)',
              border: '1px solid rgba(13, 148, 136, 0.25)',
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '0.62rem',
              fontWeight: 850,
              color: '#0d9488',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              flexShrink: 0
            }} title="Protocol Intelligence Hub active">
              <span>📋</span>
              <span>{activeProtocolName ? 'Protocol Focus' : 'Protocols DB'}</span>
            </div>
          )}
          {(isProductContext || isCatalogContext) && !isMobile && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'rgba(124, 58, 237, 0.08)',
              border: '1px solid rgba(124, 58, 237, 0.2)',
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '0.62rem',
              fontWeight: 700,
              color: '#7c3aed',
              flexShrink: 0
            }} title="Product Catalog Intelligence active">
              <span>🔬</span>
              <span>{activeProductName ? 'Product Focus' : 'Catalog DB'}</span>
            </div>
          )}
          {!isProductContext && !isCatalogContext && !isProtocolContext && contextMode !== 'doctor' && contextMode !== 'admin' && !isMobile && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#e8f0fe',
              border: '1px solid #dadce0',
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '0.62rem',
              fontWeight: 700,
              color: '#1967d2',
              flexShrink: 0
            }} title="Prescription scan is available in this session.">
              <span style={{ fontSize: '0.72rem' }}>📋</span>
              <span>Prescription Ready</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2px' }}>
          <div style={{ 
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)',
            animation: 'pulse 2s infinite',
            flexShrink: 0
          }} />
          <span style={{ 
            fontSize: '0.66rem',
            fontWeight: 600,
            color: '#64748b',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }} title={`Status: Live assistant connected`}>
            {isProductContext && activeProductName ? `Live Focus: ${activeProductName}` : isCatalogContext ? 'Catalog Knowledge Active' : 'Assistant Connected'}
          </span>
          {/* Subtle quota indicator */}
          <span style={{ fontSize: '0.55rem', color: '#cbd5e1', margin: '0 0.15rem' }}>•</span>
          <span style={{ 
            fontSize: '0.64rem',
            fontWeight: 600,
            color: queriesToday >= maxFreeQueries ? '#dc2626' : '#64748b',
            whiteSpace: 'nowrap'
          }} title={`Used ${queriesToday} of ${maxFreeQueries} queries today.`}>
            {maxFreeQueries - queriesToday > 0 ? `${maxFreeQueries - queriesToday} queries remaining` : 'Daily quota reached'}
          </span>
        </div>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
        {messagesCount > 1 && (
          <>
            <button
              onClick={onToggleBeginner}
              title={isBeginnerMode ? "Switch to Expert mode (faster)" : "Switch to Beginner mode (explained)"}
              data-tooltip={isBeginnerMode ? "Switch to Expert mode" : "Switch to Beginner mode"}
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
              title="Export chat to PDF"
              data-tooltip="Export chat to PDF"
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
              title="Clear current chat"
              data-tooltip="Clear current chat"
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
          title="Close assistant"
          data-tooltip="Close assistant"
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
import Smartphone from "lucide-react/dist/esm/icons/smartphone";
import Monitor from "lucide-react/dist/esm/icons/monitor";
import Moon from "lucide-react/dist/esm/icons/moon";
import Sun from "lucide-react/dist/esm/icons/sun";
import React, { useState, useEffect, useRef } from 'react';





export default function EmailPreviewPanel({ htmlContent }) {
  const [previewMode, setPreviewMode] = useState('desktop'); // 'desktop' | 'mobile'
  const [darkMode, setDarkMode] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();

        if (darkMode) {
          const styleEl = doc.createElement('style');
          styleEl.innerHTML = `
            html, body {
              background-color: #121212 !important;
              color: #e0e0e0 !important;
            }
            table, td {
              background-color: #1e1e1e !important;
              color: #e0e0e0 !important;
              border-color: #333333 !important;
            }
            h1, h2, h3, h4, span, p, strong {
              color: #ffffff !important;
            }
            .btn {
              background-color: #3b82f6 !important;
              color: #ffffff !important;
            }
          `;
          doc.head.appendChild(styleEl);
        }
      }
    }
  }, [htmlContent, darkMode]);

  return (
    <div style={panelContainerStyle}>
      {/* Selector controls */}
      <div style={controlsHeaderStyle}>
        <span style={titleStyle}>Device Preview</span>
        <div style={btnGroupStyle}>
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            style={{
              ...toggleBtnStyle,
              backgroundColor: darkMode ? '#fef3c7' : 'transparent',
              color: darkMode ? 'var(--color-warning)' : '#5f6368',
              borderColor: darkMode ? '#f59e0b' : '#dadce0',
            }}
            title="Simulate client Dark Mode color inversion"
          >
            {darkMode ? <Sun size={14} /> : <Moon size={14} />} {darkMode ? 'Light' : 'Simulate Dark'}
          </button>
          <button 
            onClick={() => setPreviewMode('desktop')} 
            style={{
              ...toggleBtnStyle,
              backgroundColor: previewMode === 'desktop' ? '#e8f0fe' : 'transparent',
              color: previewMode === 'desktop' ? '#1a73e8' : '#5f6368',
              borderColor: previewMode === 'desktop' ? '#1a73e8' : '#dadce0',
            }}
          >
            <Monitor size={14} /> Desktop (600px)
          </button>
          <button 
            onClick={() => setPreviewMode('mobile')} 
            style={{
              ...toggleBtnStyle,
              backgroundColor: previewMode === 'mobile' ? '#e8f0fe' : 'transparent',
              color: previewMode === 'mobile' ? '#1a73e8' : '#5f6368',
              borderColor: previewMode === 'mobile' ? '#1a73e8' : '#dadce0',
            }}
          >
            <Smartphone size={14} /> Mobile (375px)
          </button>
        </div>
      </div>

      {/* Preview viewport frame */}
      <div style={viewportContainerStyle}>
        <div style={{
          ...deviceFrameStyle,
          width: previewMode === 'desktop' ? '100%' : '375px',
          maxWidth: previewMode === 'desktop' ? '600px' : '375px',
          height: previewMode === 'desktop' ? '100%' : '600px',
          border: previewMode === 'mobile' ? '12px solid #202124' : '1px solid #dadce0',
          borderRadius: previewMode === 'mobile' ? '24px' : '4px',
        }}>
          <iframe 
            ref={iframeRef}
            title="Email Template Render Preview"
            style={iframeStyle}
          />
        </div>
      </div>
    </div>
  );
}

// ── Styles (Google Cloud inspired) ──────────────────────────────────────────
const panelContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: 'var(--color-bg-app)',
  border: '1px solid #dadce0',
  borderRadius: '8px',
  overflow: 'hidden',
};

const controlsHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.75rem 1rem',
  backgroundColor: 'var(--color-bg-surface)',
  borderBottom: '1px solid #dadce0',
};

const titleStyle = {
  fontSize: '0.85rem',
  fontWeight: 700,
  color: '#5f6368',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const btnGroupStyle = {
  display: 'flex',
  gap: '0.5rem',
};

const toggleBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  border: '1px solid',
  padding: '4px 10px',
  borderRadius: '4px',
  fontSize: '0.78rem',
  fontWeight: 600,
  cursor: 'pointer',
  outline: 'none',
  transition: 'all 0.15s ease',
};

const viewportContainerStyle = {
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '1.5rem',
  overflow: 'auto',
};

const deviceFrameStyle = {
  background: 'var(--color-bg-surface)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
};

const iframeStyle = {
  width: '100%',
  height: '100%',
  border: 'none',
};
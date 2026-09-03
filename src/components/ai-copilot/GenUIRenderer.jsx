import React from 'react';
import { Activity, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import StatusChip from '../ui/StatusChip';

function AtlasKpiCard({ label, value, description, color = '#0f172a' }) {
  return (
    <div style={{ padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>{label}</div>
      <div style={{ fontSize: '24px', fontWeight: 800, color }}>{value}</div>
      {description && <div style={{ fontSize: '12px', color: '#94a3b8' }}>{description}</div>}
    </div>
  );
}

function AtlasAlert({ title, message, type = 'info' }) {
  const colors = {
    info: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e3a8a', icon: <Info size={16} /> },
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e', icon: <AlertTriangle size={16} /> },
    error: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', icon: <AlertTriangle size={16} /> },
    success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', icon: <CheckCircle size={16} /> }
  };
  const theme = colors[type] || colors.info;
  
  return (
    <div style={{ padding: '12px 16px', background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
      <div style={{ color: theme.text, marginTop: '2px' }}>{theme.icon}</div>
      <div>
        {title && <div style={{ fontSize: '13px', fontWeight: 700, color: theme.text, marginBottom: '2px' }}>{title}</div>}
        <div style={{ fontSize: '13px', color: theme.text, lineHeight: 1.5 }}>{message}</div>
      </div>
    </div>
  );
}

export default function GenUIRenderer({ text }) {
  // Regex to find ```json ... ``` blocks
  const jsonRegex = /```json\s*(\{[\s\S]*?\})\s*```/g;
  
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = jsonRegex.exec(text)) !== null) {
    // Add text before JSON
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
    }
    
    // Parse JSON
    try {
      const data = JSON.parse(match[1]);
      if (data.type === 'GenUI') {
        parts.push({ type: 'component', data });
      } else {
        // Not GenUI, treat as regular text
        parts.push({ type: 'text', content: match[0] });
      }
    } catch (e) {
      parts.push({ type: 'text', content: match[0] });
    }
    
    lastIndex = jsonRegex.lastIndex;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.substring(lastIndex) });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {parts.map((part, i) => {
        if (part.type === 'text') {
          const content = part.content.trim();
          if (!content) return null;
          return (
            <div key={i} style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
              {content}
            </div>
          );
        }
        
        if (part.type === 'component') {
          const { component, props } = part.data;
          switch(component) {
            case 'KpiCard':
              return <AtlasKpiCard key={i} {...props} />;
            case 'Alert':
              return <AtlasAlert key={i} {...props} />;
            case 'StatusChip':
              return <StatusChip key={i} {...props} />;
            case 'Table':
              return (
                <div key={i} style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead style={{ background: '#f8fafc' }}>
                      <tr>
                        {props.columns?.map(c => (
                          <th key={c} style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600 }}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {props.rows?.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {props.columns?.map(c => (
                            <td key={c} style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>{row[c]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            default:
              return <div key={i} style={{ padding: '8px', background: '#fee2e2', color: '#991b1b', fontSize: '12px', borderRadius: '4px' }}>Unknown component: {component}</div>;
          }
        }
        return null;
      })}
    </div>
  );
}

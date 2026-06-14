import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import React from 'react';




/**
 * Generic AI Extraction Widget
 * Can be used for Price Imports, Prescription Intake, Lab Results, etc.
 * 
 * @param {string} title - Panel Title
 * @param {number|string} confidence - e.g., "98%"
 * @param {Array} fields - Array of { label, value, icon: LucideIcon }
 * @param {Array} highlights - Array of { label, value, color }
 */
export default function AIExtractionWidget({ title = "AI Extraction Results", confidence = "98%", fields = [], highlights = [] }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '16px', 
        borderBottom: '1px solid #e2e8f0', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#f8fafc'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="#8b5cf6" />
          <span style={{ fontWeight: 600, color: '#0f172a' }}>{title}</span>
        </div>
        <div style={{ 
          fontSize: '12px', 
          fontWeight: 600, 
          color: '#8b5cf6', 
          background: '#ede9fe', 
          padding: '4px 8px', 
          borderRadius: '12px' 
        }}>
          {confidence} Confidence
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Fields */}
        {fields && fields.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {fields.map((field, idx) => {
              const Icon = field.icon || CheckCircle2;
              return (
                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <Icon size={16} color="#64748b" style={{ marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>{field.label}</div>
                    <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: 500 }}>{field.value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Highlights Breakdown */}
        {highlights && highlights.length > 0 && (
          <div style={{ marginTop: '8px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
            {highlights.map((highlight, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '20px', fontWeight: 700, color: highlight.color || '#0f172a' }}>{highlight.value}</span>
                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>{highlight.label}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
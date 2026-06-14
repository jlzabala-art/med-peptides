import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Zap from "lucide-react/dist/esm/icons/zap";
import React from 'react';



import { Card } from '../../ui';

export default function AIAssistantPanel() {
  const insights = [
    { text: "3 products appear to be duplicates based on naming conventions.", action: "Review" },
    { text: "5 products can inherit pricing from existing variants.", action: "Apply" },
    { text: "2 products are missing supplier assignments.", action: "Assign" },
    { text: "8 products are fully enriched and ready for Zoho sync.", action: "Sync Now" }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px', flexShrink: 0 }}>
      <button 
        className="gcp-btn-primary" 
        style={{ 
          width: '100%', 
          padding: '1rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.75rem',
          fontSize: '0.9rem',
          background: 'linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%)',
          border: 'none',
          boxShadow: '0 4px 12px rgba(26,115,232,0.2)'
        }}
      >
        <Zap size={18} />
        Auto Enrich Catalog
      </button>

      <Card style={{ padding: '1.25rem', backgroundColor: 'rgba(26,115,232,0.02)', border: '1px solid rgba(26,115,232,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '1rem', fontWeight: 600 }}>
          <Sparkles size={16} />
          Atlas AI Insights
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {insights.map((insight, idx) => (
            <div key={idx} style={{ 
              backgroundColor: 'var(--color-bg-surface)', 
              padding: '0.75rem', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              fontSize: '0.8rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <span style={{ color: 'var(--text-main)', lineHeight: 1.4 }}>{insight.text}</span>
              <button style={{ 
                alignSelf: 'flex-start',
                background: 'none', 
                border: 'none', 
                color: 'var(--primary)', 
                fontSize: '0.75rem', 
                fontWeight: 600, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem',
                cursor: 'pointer',
                padding: 0
              }}>
                {insight.action} <ArrowRight size={12} />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
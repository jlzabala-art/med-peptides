import React from 'react';
import { Brain, Sparkles, AlertCircle, Play, Target, ShieldCheck } from 'lucide-react';

export default function CatalogAIAssistantPanel({ 
  catalogMeta, 
  setCatalogMeta, 
  isGeneratingAI, 
  onGenerateAI,
  catalogCart
}) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#f8fafc',
      borderRight: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto'
    }}>
      <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '8px', color: '#2563eb' }}>
          <Brain size={24} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: 600 }}>Atlas AI Assistant</h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Intelligent Catalog Setup</p>
        </div>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Main Action */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px', textAlign: 'center' }}>
            {catalogMeta.goals?.length > 0 ? "AI has analyzed your portfolio. You can regenerate suggestions at any time." : `Atlas AI can analyze your ${catalogCart.length} selected products to generate a commercial catalog structure automatically.`}
          </div>
          <button 
            onClick={() => onGenerateAI(catalogCart)}
            disabled={isGeneratingAI || catalogCart.length === 0}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              background: catalogMeta.goals?.length > 0 ? '#f1f5f9' : (catalogCart.length === 0 ? '#cbd5e1' : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'),
              color: catalogMeta.goals?.length > 0 ? '#475569' : '#fff',
              border: catalogMeta.goals?.length > 0 ? '1px solid #cbd5e1' : 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: catalogCart.length === 0 || isGeneratingAI ? 'not-allowed' : 'pointer',
              opacity: isGeneratingAI ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
          >
            {isGeneratingAI ? <><Sparkles className="animate-spin" size={16} /> Generating...</> : 
             catalogMeta.goals?.length > 0 ? <>↻ Regenerate AI Suggestions</> : <><Sparkles size={16} /> Generate Insights</>}
          </button>
        </div>



        {/* AI Detection Summary */}
        {(catalogMeta.goals?.length > 0 || catalogMeta.categories?.length > 0) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {catalogMeta.goals?.length > 0 && (
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>Clinical Goals</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {catalogMeta.goals.map((g, i) => (
                    <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', padding: '4px 10px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 500 }}>
                      <span style={{ color: '#10b981' }}>✓</span> {g}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {catalogMeta.categories?.length > 0 && (
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>Categories</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {catalogMeta.categories.map((c, i) => (
                    <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', padding: '4px 10px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 500 }}>
                      <span style={{ color: '#10b981' }}>✓</span> {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>Source Risk</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#d1fae5', color: '#065f46', padding: '4px 12px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 600 }}>
                  <ShieldCheck size={16} /> Low Risk
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

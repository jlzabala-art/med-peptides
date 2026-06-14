import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Sparkles, AlertTriangle, Send, Loader2, CheckCircle2, FileSignature } from 'lucide-react';
import toast from 'react-hot-toast';

const ClinicalCopilotWidget = ({ onDraftGenerated }) => {
  const [query, setQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState(null);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsGenerating(true);
    setDraft(null);

    // Simulate Atlas AI clinical drafting
    setTimeout(() => {
      setIsGenerating(false);
      setDraft({
        patientProfile: "Adult Male (approx. 45-50) / Accelerated Healing requested",
        rationale: "Basado en tu consulta, un protocolo dual de BPC-157 y TB-500 es el estándar dorado para la recuperación acelerada de tejidos blandos. Se ha añadido Ipamorelin para maximizar el entorno endocrino nocturno.",
        protocolItems: [
          { name: "BPC-157 (Body Protection Compound)", dose: "250mcg", freq: "Diario (Local)", duration: "6 semanas" },
          { name: "TB-500 (Thymosin Beta-4)", dose: "2.5mg", freq: "2 veces/semana", duration: "6 semanas" },
          { name: "Ipamorelin", dose: "200mcg", freq: "Noche", duration: "8 semanas" }
        ],
        alerts: [
          "Precaución: Vigilar la sensibilidad a la insulina durante el uso de secretagogos (Ipamorelin).",
          "Contraindicación: Evitar en caso de historial de neoplasias activas (factores de crecimiento angiogénicos)."
        ]
      });
      toast.success('Borrador clínico generado por Atlas AI.');
    }, 2500);
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
      overflow: 'hidden'
    }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc' }}>
        <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '0.6rem', borderRadius: '12px', color: 'white', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
          <BrainCircuit size={20} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Clinical Copilot (Atlas AI)</h2>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Autocompletado de protocolos basado en lenguaje natural.</p>
        </div>
      </div>

      <div style={{ padding: '1.5rem' }}>
        <form onSubmit={handleGenerate} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ej: Hombre 45 años, post-operatorio rodilla, necesita acelerar recuperación..."
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 2.8rem',
                borderRadius: '16px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              disabled={isGenerating}
            />
            <Sparkles size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
          <button
            type="submit"
            disabled={isGenerating || !query.trim()}
            style={{
              padding: '0 1.5rem',
              borderRadius: '16px',
              border: 'none',
              background: 'var(--primary)',
              color: 'white',
              fontWeight: 800,
              cursor: (isGenerating || !query.trim()) ? 'not-allowed' : 'pointer',
              opacity: (isGenerating || !query.trim()) ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            {isGenerating ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
            Generar
          </button>
        </form>

        <AnimatePresence>
          {draft && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', background: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Draft Result</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>{draft.rationale}</p>
                  </div>
                  <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', background: '#d1fae5', color: '#059669', borderRadius: '20px', fontWeight: 800, whiteSpace: 'nowrap' }}>AI 98% Confianza</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', margin: '1.5rem 0' }}>
                  {draft.protocolItems.map((item, idx) => (
                    <div key={idx} style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <strong style={{ display: 'block', fontSize: '0.9rem', color: '#0f172a', marginBottom: '0.25rem' }}>{item.name}</strong>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
                        <span>Dosis: <strong>{item.dose}</strong></span>
                        <span>{item.freq}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {draft.alerts.map((alert, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', background: '#fffbeb', padding: '0.8rem', borderRadius: '10px', border: '1px solid #fef3c7', marginBottom: '0.5rem' }}>
                    <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 600 }}>{alert}</span>
                  </div>
                ))}

                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => {
                      toast.success('Borrador importado al editor del paciente.');
                      if(onDraftGenerated) onDraftGenerated(draft);
                    }}
                    style={{ flex: 1, padding: '0.8rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <CheckCircle2 size={18} /> Aprobar e Importar al Carrito
                  </button>
                  <button 
                    onClick={() => setDraft(null)}
                    style={{ padding: '0.8rem 1.5rem', background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Descartar
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default ClinicalCopilotWidget;

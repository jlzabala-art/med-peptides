import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSignature, Sparkles, Loader2, CheckCircle2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

const AISoapGeneratorWidget = ({ patientName = "Paciente" }) => {
  const [rawNotes, setRawNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [soapNote, setSoapNote] = useState(null);

  const generateSoap = (e) => {
    e.preventDefault();
    if (!rawNotes.trim()) return;

    setIsGenerating(true);
    setSoapNote(null);

    // Simulate AI parsing
    setTimeout(() => {
      setIsGenerating(false);
      setSoapNote({
        S: "El paciente reporta fatiga generalizada de 3 semanas de evolución y dolor articular moderado en el codo derecho al jugar al tenis. No hay alivio con AINEs de venta libre.",
        O: "A la palpación, dolor leve-moderado en epicóndilo lateral derecho. Rango de movimiento ligeramente disminuido por el dolor. Análisis de testosterona total pendiente.",
        A: "Epicondilitis lateral derecha refractaria a tratamiento conservador inicial. Posible deficiencia subclínica subyacente causando fatiga crónica.",
        P: "1. Iniciar protocolo localizado con BPC-157 (250mcg SC diario x 4 semanas).\n2. Ordenar panel hormonal completo (Testosterona, IGF-1, Perfil tiroideo).\n3. Reevaluación en 4 semanas."
      });
      toast.success('Nota clínica estructurada por Atlas AI');
    }, 2000);
  };

  const copyToClipboard = () => {
    if (!soapNote) return;
    const text = `S: ${soapNote.S}\n\nO: ${soapNote.O}\n\nA: ${soapNote.A}\n\nP: ${soapNote.P}`;
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      overflow: 'hidden'
    }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', padding: '0.5rem', borderRadius: '10px', color: 'white' }}>
          <FileSignature size={18} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>AI SOAP Notes Generator</h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Estructura clínica automática para {patientName}</p>
        </div>
      </div>

      <div style={{ padding: '1.5rem' }}>
        {!soapNote ? (
          <form onSubmit={generateSoap}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
              Dictado / Notas sueltas
            </label>
            <textarea
              value={rawNotes}
              onChange={e => setRawNotes(e.target.value)}
              placeholder="Ej: Fatiga desde hace 3 semanas, le duele el codo al jugar tenis. Le voy a mandar BPC y pedir analítica de testo..."
              rows={4}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
                background: '#f8fafc'
              }}
              disabled={isGenerating}
            />
            <button
              type="submit"
              disabled={isGenerating || !rawNotes.trim()}
              style={{
                marginTop: '1rem',
                width: '100%',
                padding: '0.85rem',
                borderRadius: '12px',
                border: 'none',
                background: 'var(--primary)',
                color: 'white',
                fontWeight: 800,
                cursor: (isGenerating || !rawNotes.trim()) ? 'not-allowed' : 'pointer',
                opacity: (isGenerating || !rawNotes.trim()) ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'background 0.2s'
              }}
            >
              {isGenerating ? <Loader2 size={18} className="spin" /> : <Sparkles size={18} />}
              {isGenerating ? 'Estructurando SOAP...' : 'Generar Historial Clínico'}
            </button>
          </form>
        ) : (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
                {Object.entries(soapNote).map(([key, text]) => (
                  <div key={key} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 900, color: '#4f46e5', fontSize: '1rem', marginBottom: '0.25rem' }}>
                      {key === 'S' ? 'Subjetivo' : key === 'O' ? 'Objetivo' : key === 'A' ? 'Análisis (Assessment)' : 'Plan'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {text}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => { setSoapNote(null); setRawNotes(''); }}
                  style={{ flex: 1, padding: '0.8rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Nuevo Dictado
                </button>
                <button
                  onClick={copyToClipboard}
                  style={{ flex: 1, padding: '0.8rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Copy size={16} /> Copiar al Historial
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default AISoapGeneratorWidget;

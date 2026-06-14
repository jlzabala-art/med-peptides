import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, Activity, AlertCircle, CheckCircle2, ChevronRight, Zap, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const BloodTestAnalyzerWidget = ({ onRecommendationClick }) => {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  // Simulated AI response
  const handleUpload = (e) => {
    e.preventDefault();
    const uploadedFile = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    if (!uploadedFile) return;

    if (uploadedFile.type !== 'application/pdf' && !uploadedFile.type.includes('image')) {
      toast.error('Por favor, sube un PDF o imagen de tus análisis.');
      return;
    }

    setFile(uploadedFile);
    setIsAnalyzing(true);
    setResults(null);

    // Simulate Atlas AI processing time (e.g. OCR + Gemini Extraction)
    setTimeout(() => {
      setIsAnalyzing(false);
      setResults({
        markers: [
          { name: 'IGF-1 (Insulin-like Growth Factor 1)', value: 110, unit: 'ng/mL', range: '150 - 350', status: 'low', info: 'Crucial for muscle recovery and tissue repair.' },
          { name: 'Testosterone (Total)', value: 450, unit: 'ng/dL', range: '300 - 1000', status: 'normal', info: 'Hormonal baseline is stable.' },
          { name: 'HbA1c', value: 5.8, unit: '%', range: '< 5.7', status: 'high', info: 'Indicates slightly elevated average blood sugar.' },
          { name: 'C-Reactive Protein (CRP)', value: 4.2, unit: 'mg/L', range: '< 3.0', status: 'high', info: 'Marker of systemic inflammation.' }
        ],
        interpretation: "Hemos detectado una deficiencia significativa en tus niveles de IGF-1 y marcadores de inflamación elevados (CRP). Esto coincide con síntomas de recuperación lenta y fatiga. Se recomienda una revisión con un especialista para considerar terapias de péptidos como Ipamorelin o BPC-157.",
        recommendedAction: "Consultar Protocolo de Recuperación"
      });
      toast.success('Análisis completado por Atlas AI.');
    }, 3500);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = 'var(--primary)';
    e.currentTarget.style.background = 'rgba(0,113,189,0.05)';
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)';
    e.currentTarget.style.background = 'transparent';
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      padding: '2rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', padding: '0.8rem', borderRadius: '16px', color: 'white', boxShadow: '0 10px 20px rgba(14,165,233,0.3)' }}>
          <Activity size={24} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>Atlas AI: Blood Analysis</h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Sube tu último PDF médico. Nuestra IA extraerá los marcadores.</p>
        </div>
      </div>

      {!results && !isAnalyzing && (
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleUpload}
          style={{
            border: '2px dashed rgba(0,0,0,0.1)',
            borderRadius: '16px',
            padding: '3rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onClick={() => document.getElementById('blood-test-upload').click()}
        >
          <input type="file" id="blood-test-upload" style={{ display: 'none' }} accept=".pdf,image/*" onChange={handleUpload} />
          <FileUp size={48} color="var(--color-text-tertiary)" style={{ margin: '0 auto 1rem' }} strokeWidth={1.5} />
          <h3 style={{ margin: '0 0 0.5rem', fontWeight: 700, color: '#1e293b' }}>Arrastra tu analítica aquí</h3>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>PDF, JPG o PNG. Encriptado y analizado localmente.</p>
        </div>
      )}

      {isAnalyzing && (
        <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            style={{ display: 'inline-block', marginBottom: '1rem' }}
          >
            <Zap size={40} color="var(--primary)" />
          </motion.div>
          <h3 style={{ margin: '0 0 0.5rem', fontWeight: 700, color: 'var(--primary)' }}>Atlas AI está leyendo el documento...</h3>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Mapeando biomarcadores con la ontología clínica (SNOMED/LOINC).</p>
          
          <div style={{ marginTop: '2rem', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: '100%' }} 
              transition={{ duration: 3.5, ease: 'easeOut' }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #38bdf8, #2563eb)' }} 
            />
          </div>
        </div>
      )}

      {results && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px' }}>
              <CheckCircle2 size={24} color="#16a34a" />
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: '#166534' }}>Extracción Exitosa ({file?.name || 'document.pdf'})</strong>
                <span style={{ fontSize: '0.8rem', color: '#15803d' }}>Se han encontrado {results.markers.length} marcadores clínicos relevantes.</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {results.markers.map((marker, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{marker.name}</strong>
                      {marker.status === 'low' && <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '20px', background: '#fef2f2', color: '#dc2626', fontWeight: 800 }}>BAJO</span>}
                      {marker.status === 'high' && <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '20px', background: '#fffbeb', color: '#d97706', fontWeight: 800 }}>ALTO</span>}
                      {marker.status === 'normal' && <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '20px', background: '#f0fdf4', color: '#16a34a', fontWeight: 800 }}>ÓPTIMO</span>}
                    </div>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{marker.info}</p>
                  </div>
                  <div style={{ textAlign: 'right', marginLeft: '1rem' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: marker.status !== 'normal' ? (marker.status === 'low' ? '#dc2626' : '#d97706') : 'var(--color-text-primary)' }}>
                      {marker.value} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{marker.unit}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>Rango: {marker.range}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Zap size={16} color="#3b82f6" />
                <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>Atlas AI Clinical Interpretation</strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                {results.interpretation}
              </p>
            </div>

            <button 
              onClick={() => onRecommendationClick && onRecommendationClick(results)}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--primary), #0ea5e9)',
                color: 'white',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 16px rgba(0, 113, 189, 0.2)'
              }}
            >
              <FileText size={18} /> {results.recommendedAction} <ChevronRight size={18} />
            </button>

            <button 
              onClick={() => { setResults(null); setFile(null); }}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Analizar otro documento
            </button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default BloodTestAnalyzerWidget;

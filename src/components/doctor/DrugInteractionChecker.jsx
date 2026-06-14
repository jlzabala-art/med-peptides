import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, Activity, Search, AlertTriangle, Info, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock database of interactions
const INTERACTION_DB = {
  'aspirina': {
    peptides: ['tb-500', 'thymosin beta-4'],
    risk: 'moderate',
    message: 'TB-500 puede afectar la migración celular endotelial y la angiogénesis. Uso concurrente con Aspirina puede aumentar levemente el riesgo de sangrado capilar.'
  },
  'lisinopril': {
    peptides: ['bpc-157'],
    risk: 'low',
    message: 'BPC-157 ha demostrado efectos moduladores en la presión arterial. Monitorizar hipotensión ortostática al inicio del tratamiento.'
  },
  'metformina': {
    peptides: ['cjc-1295', 'ipamorelin', 'tesamorelin', 'mk-677'],
    risk: 'high',
    message: 'Secretagogos de GH pueden inducir resistencia a la insulina transitoria o elevar glucosa basal, antagonizando el efecto de la Metformina. Monitorizar HbA1c de cerca.'
  },
  'escitalopram': {
    peptides: ['pt-141', 'melanotan ii'],
    risk: 'moderate',
    message: 'PT-141 actúa a nivel central (receptores melanocortina). Aunque no afecta la serotonina directamente, pacientes en SSRIs pueden experimentar variaciones en la respuesta al arousal.'
  }
};

export default function DrugInteractionChecker({ rxItems = [] }) {
  const [traditionalDrugs, setTraditionalDrugs] = useState([]);
  const [drugInput, setDrugInput] = useState('');
  const [interactions, setInteractions] = useState([]);
  const [isChecking, setIsChecking] = useState(false);

  const addDrug = (e) => {
    e.preventDefault();
    if (!drugInput.trim()) return;
    const normalized = drugInput.trim().toLowerCase();
    if (!traditionalDrugs.includes(normalized)) {
      setTraditionalDrugs(prev => [...prev, normalized]);
    }
    setDrugInput('');
  };

  const removeDrug = (drug) => {
    setTraditionalDrugs(prev => prev.filter(d => d !== drug));
  };

  useEffect(() => {
    setIsChecking(true);
    const timer = setTimeout(() => {
      let foundInteractions = [];

      traditionalDrugs.forEach(drug => {
        const drugData = INTERACTION_DB[drug];
        if (drugData) {
          rxItems.forEach(item => {
            const itemNameLower = item.name.toLowerCase();
            // Check if any risky peptide is a substring of the item name
            const riskyPeptide = drugData.peptides.find(p => itemNameLower.includes(p));
            if (riskyPeptide) {
              foundInteractions.push({
                drug: drug.charAt(0).toUpperCase() + drug.slice(1),
                peptide: item.name,
                risk: drugData.risk,
                message: drugData.message
              });
            }
          });
        }
      });

      setInteractions(foundInteractions);
      setIsChecking(false);
    }, 600); // simulate network delay

    return () => clearTimeout(timer);
  }, [traditionalDrugs, rxItems]);

  const hasHighRisk = interactions.some(i => i.risk === 'high');
  const hasModerateRisk = interactions.some(i => i.risk === 'moderate');

  let statusColor = '#10b981'; // green
  let statusIcon = <ShieldCheck size={18} color="white" />;
  let statusTitle = "Sin Interacciones Detectadas";

  if (isChecking) {
    statusColor = '#94a3b8';
    statusIcon = <Activity size={18} color="white" className="spin" />;
    statusTitle = "Analizando Vías Metabólicas...";
  } else if (hasHighRisk) {
    statusColor = '#ef4444';
    statusIcon = <AlertTriangle size={18} color="white" />;
    statusTitle = "Alerta Clínica: Interacción Severa";
  } else if (hasModerateRisk) {
    statusColor = '#f59e0b';
    statusIcon = <ShieldAlert size={18} color="white" />;
    statusTitle = "Precaución: Interacción Moderada";
  } else if (interactions.length > 0) {
    statusColor = '#3b82f6';
    statusIcon = <Info size={18} color="white" />;
    statusTitle = "Nota Clínica Menor";
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      border: `1.5px solid ${isChecking ? '#e2e8f0' : (hasHighRisk ? '#fca5a5' : hasModerateRisk ? '#fcd34d' : '#cbd5e1')}`,
      overflow: 'hidden',
      marginTop: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{
        background: statusColor,
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        transition: 'background 0.3s ease'
      }}>
        {statusIcon}
        <span style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
          {statusTitle}
        </span>
      </div>

      <div style={{ padding: '1.25rem' }}>
        <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
          Añade la medicación tradicional actual del paciente para comprobar posibles interacciones metabólicas o sinergias con los péptidos de la receta.
        </p>

        <form onSubmit={addDrug} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={drugInput}
              onChange={e => setDrugInput(e.target.value)}
              placeholder="Ej: Metformina, Aspirina, Lisinopril..."
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.2rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <button type="submit" style={{
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '8px',
            padding: '0 1rem',
            color: '#334155',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <Plus size={16} /> Añadir
          </button>
        </form>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: interactions.length > 0 ? '1.5rem' : '0' }}>
          <AnimatePresence>
            {traditionalDrugs.map(drug => (
              <motion.div
                key={drug}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '0.35rem 0.6rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#475569',
                  textTransform: 'capitalize'
                }}
              >
                {drug}
                <X size={14} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => removeDrug(drug)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {interactions.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {interactions.map((interaction, idx) => (
                  <div key={idx} style={{
                    background: interaction.risk === 'high' ? '#fef2f2' : interaction.risk === 'moderate' ? '#fffbeb' : '#eff6ff',
                    border: `1px solid ${interaction.risk === 'high' ? '#fca5a5' : interaction.risk === 'moderate' ? '#fcd34d' : '#bfdbfe'}`,
                    padding: '1rem',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <Activity size={14} color={interaction.risk === 'high' ? '#ef4444' : interaction.risk === 'moderate' ? '#f59e0b' : '#3b82f6'} />
                      <strong style={{ fontSize: '0.8rem', color: '#1e293b' }}>
                        {interaction.drug} <span style={{ color: '#94a3b8', fontWeight: 400 }}>vs</span> {interaction.peptide}
                      </strong>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                      {interaction.message}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {rxItems.length === 0 && traditionalDrugs.length > 0 && (
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', marginTop: '1rem' }}>
            Añade péptidos a la receta arriba para comprobar interacciones cruzadas.
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}

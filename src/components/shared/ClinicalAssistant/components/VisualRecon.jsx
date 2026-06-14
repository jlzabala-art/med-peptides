import Pipette from "lucide-react/dist/esm/icons/pipette";
import Droplets from "lucide-react/dist/esm/icons/droplets";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import Snowflake from "lucide-react/dist/esm/icons/snowflake";
/* eslint-disable no-unused-vars */
import React from 'react';




import { motion } from 'framer-motion';

export default function VisualRecon({ data }) {
  const { compound = 'Peptide', solvent = 'BAC Water', ratio = '2ml' } = data || {};
  // Basic language detection (could be passed as prop but we'll stick to bilingual for now)
  const steps = [
    { 
      icon: <Snowflake size={20} />, 
      title: '1. Prep', 
      titleEs: '1. Preparación',
      desc: `Ensure ${compound} vial is at room temperature. Clean both stoppers with alcohol.`,
      descEs: `Asegure que el vial de ${compound} esté a temperatura ambiente. Limpie ambos tapones con alcohol.`
    },
    { 
      icon: <Pipette size={20} />, 
      title: '2. Draw', 
      titleEs: '2. Extraer',
      desc: `Draw ${ratio} of ${solvent} into the syringe. Do not touch the needle.`,
      descEs: `Extraiga ${ratio} de ${solvent} en la jeringa. No toque la aguja.`
    },
    { 
      icon: <FlaskConical size={20} />, 
      title: '3. Inject', 
      titleEs: '3. Inyectar',
      desc: `Slowly inject ${solvent} into ${compound} vial. Aim at the side wall, not directly at the powder.`,
      descEs: `Inyecte lentamente el ${solvent} en el vial de ${compound}. Apunte a la pared lateral, no al polvo.`
    },
    { 
      icon: <Droplets size={20} />, 
      title: '4. Dissolve', 
      titleEs: '4. Disolver',
      desc: 'Swirl gently. NEVER shake. Store in refrigerator once mixed.',
      descEs: 'Gire suavemente. NUNCA agite. Guarde en el refrigerador una vez mezclado.'
    }
  ];

  return (
    <div style={{ 
      margin: '1.5rem 0', 
      padding: '1.25rem', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
      borderRadius: '24px',
      border: '1px solid #e2eaf5',
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <FlaskConical size={18} />
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>Reconstitution Guide</h4>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Mixing protocol for research compounds</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
        {steps.map((step, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '16px', border: '1px solid #edf2f7' }}
          >
            <div style={{ color: 'var(--primary)', marginBottom: '0.5rem', opacity: 0.8 }}>
              {step.icon}
            </div>
            <h5 style={{ margin: '0 0 0.4rem 0', fontSize: '0.75rem', fontWeight: 800 }}>{step.title}</h5>
            <p style={{ margin: 0, fontSize: '0.65rem', lineHeight: 1.4, color: 'var(--text-muted)' }}>{step.desc}</p>
          </motion.div>
        ))}
      </div>
      <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'rgba(0,75,135,0.05)', borderRadius: '12px', border: '1px dashed var(--primary)' }}>
        <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 600, textAlign: 'center' }}>
          ⚠️ RESEARCH ONLY: Not for human use. Follow laboratory safety standards.
        </p>
      </div>
    </div>
  );
}
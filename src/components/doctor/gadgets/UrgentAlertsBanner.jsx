import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function UrgentAlertsBanner({ alerts }) {
  const [visible, setVisible] = useState(true);
  if (!alerts || alerts.length === 0 || !visible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, height: 0 }} 
        animate={{ opacity: 1, height: 'auto' }} 
        exit={{ opacity: 0, height: 0 }}
        style={{ 
          background: 'linear-gradient(90deg, #ef4444 0%, #f43f5e 100%)', 
          borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          color: 'white', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.25)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <AlertTriangle size={20} strokeWidth={2.5} />
          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
            {alerts.length} Abnormal Lab Results require immediate review in your clinical queue.
          </div>
        </div>
        <button 
          onClick={() => setVisible(false)}
          style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', transition: 'background 0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

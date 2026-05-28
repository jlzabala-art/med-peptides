import React, { useState } from 'react';
import DoctorNav from '../components/doctor/DoctorNav';
import PubMedPreviewPanel from '../components/discovery/PubMedPreviewPanel';
import styles from './DoctorResearch.module.css';

export default function DoctorResearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeProduct, setActiveProduct] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setActiveProduct({ name: searchTerm });
    setIsPanelOpen(true);
  };

  return (
    <div className={styles.container}>
      <DoctorNav menuKey="research" />
      <section className={styles.content}>
        <h2>Investigación Clínica</h2>
        <p>Busca en la base de datos de PubMed literatura científica sobre péptidos y compuestos.</p>
        
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', maxWidth: '500px' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ej. BPC-157, Semaglutide..."
            style={{ 
              flex: 1, 
              padding: '0.75rem', 
              borderRadius: '8px', 
              border: '1px solid #cbd5e1',
              fontSize: '1rem'
            }}
          />
          <button 
            type="submit" 
            style={{ 
              padding: '0.75rem 1.5rem', 
              background: 'var(--primary, #003666)', 
              color: 'var(--color-bg-surface)', 
              border: 'none', 
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Buscar en PubMed
          </button>
        </form>

        <PubMedPreviewPanel 
          isOpen={isPanelOpen} 
          onClose={() => setIsPanelOpen(false)} 
          product={activeProduct} 
        />
      </section>
    </div>
  );
}

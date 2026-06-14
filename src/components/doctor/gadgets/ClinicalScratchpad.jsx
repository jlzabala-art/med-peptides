import Edit3 from "lucide-react/dist/esm/icons/edit-3";
import Save from "lucide-react/dist/esm/icons/save";
import React, { useState } from 'react';



export default function ClinicalScratchpad() {
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="card" style={{ padding: '2rem', background: 'var(--color-warning-bg)', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #fde68a', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#92400e', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Edit3 size={18} color="var(--color-warning)" /> Scratchpad
        </h3>
        <button 
          onClick={handleSave}
          style={{ background: 'none', border: 'none', color: saved ? 'var(--color-success)' : 'var(--color-warning)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, fontSize: '0.8rem' }}
        >
          <Save size={16} /> {saved ? 'Saved' : 'Save'}
        </button>
      </div>
      <textarea 
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Jot down quick thoughts, peptide names, or reminders here..."
        style={{ 
          flex: 1, width: '100%', minHeight: '120px', padding: '1rem', 
          borderRadius: '12px', border: '1px solid transparent', 
          background: 'rgba(253, 230, 138, 0.3)', fontSize: '0.9rem', 
          color: '#92400e', outline: 'none', resize: 'none', boxSizing: 'border-box',
          fontFamily: 'inherit'
        }}
        onFocus={(e) => e.target.style.borderColor = '#fcd34d'}
        onBlur={(e) => e.target.style.borderColor = 'transparent'}
      />
    </div>
  );
}
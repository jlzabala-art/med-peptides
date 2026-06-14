import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Activity from "lucide-react/dist/esm/icons/activity";
import Building from "lucide-react/dist/esm/icons/building";
import Users from "lucide-react/dist/esm/icons/users";
import React, { useState } from 'react';





import { useWorkspace } from './WorkspaceContext';

export default function AskAtlasBar() {
  const { setActiveWorkspaceId } = useWorkspace();
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsProcessing(true);
    // Simulate AI parsing and dynamically switching workspaces based on intent
    setTimeout(() => {
      const q = query.toLowerCase();
      if (q.includes('revenue') || q.includes('profit') || q.includes('finance')) {
        setActiveWorkspaceId('ceo');
      } else if (q.includes('patient') || q.includes('program') || q.includes('medical')) {
        setActiveWorkspaceId('medical');
      } else if (q.includes('order') || q.includes('task') || q.includes('supplier')) {
        setActiveWorkspaceId('operations');
      }
      setIsProcessing(false);
      setQuery('');
    }, 800);
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg-app)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
       <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '30px', padding: '0.5rem 0.5rem 0.5rem 1.5rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
          <Sparkles size={20} color="var(--primary)" />
          <input 
            type="text" 
            placeholder="Ask Atlas: 'What requires my attention today?' or 'Show clinics at risk'"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1rem', color: 'var(--text-main)', background: 'transparent' }}
          />
          <button type="submit" disabled={isProcessing} style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: isProcessing ? '#e2e8f0' : 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
             <ArrowRight size={18} />
          </button>
       </form>

       <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Suggested Queries:</div>
          <button onClick={() => setQuery('Which physicians generated the most revenue?')} style={{ background: 'none', border: '1px solid var(--border)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', color: 'var(--text-main)', cursor: 'pointer', backgroundColor: 'white' }}>Which physicians generated the most revenue?</button>
          <button onClick={() => setQuery('What tasks are overdue?')} style={{ background: 'none', border: '1px solid var(--border)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', color: 'var(--text-main)', cursor: 'pointer', backgroundColor: 'white' }}>What tasks are overdue?</button>
          <button onClick={() => setQuery('Show clinics at risk.')} style={{ background: 'none', border: '1px solid var(--border)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', color: 'var(--text-main)', cursor: 'pointer', backgroundColor: 'white' }}>Show clinics at risk.</button>
       </div>
    </div>
  );
}
import X from "lucide-react/dist/esm/icons/x";
import LayoutTemplate from "lucide-react/dist/esm/icons/layout-template";
import PlusCircle from "lucide-react/dist/esm/icons/plus-circle";
import Save from "lucide-react/dist/esm/icons/save";
import Share2 from "lucide-react/dist/esm/icons/share-2";
import Settings from "lucide-react/dist/esm/icons/settings";
import Plus from "lucide-react/dist/esm/icons/plus";
import React, { useState } from 'react';







import { useWorkspace, WORKSPACE_TEMPLATES } from './WorkspaceContext';
import CustomKPIBuilder from './CustomKPIBuilder';

export default function WorkspaceBuilderDrawer({ onClose }) {
  const { workspaces, activeWorkspaceId, setActiveWorkspaceId, removeWidget, activeLayout } = useWorkspace();
  const [showCustomKPI, setShowCustomKPI] = useState(false);

  if (showCustomKPI) {
    return (
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px', backgroundColor: 'white', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', zIndex: 1000, animation: 'slideInRight 0.3s ease' }}>
         <CustomKPIBuilder onClose={() => setShowCustomKPI(false)} />
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '380px', backgroundColor: '#f8fafc', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', zIndex: 1000, display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.3s ease' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem', backgroundColor: 'white', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
           <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Workspace Builder</h2>
           <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Configure your operational layout</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Templates */}
        <div>
           <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <LayoutTemplate size={16} /> Role Templates
           </h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Object.values(WORKSPACE_TEMPLATES).map(tpl => (
                 <div key={tpl.id} onClick={() => setActiveWorkspaceId(tpl.id)}
                      style={{ padding: '1rem', border: `2px solid ${activeWorkspaceId === tpl.id ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '12px', cursor: 'pointer', backgroundColor: activeWorkspaceId === tpl.id ? 'rgba(0,113,189,0.05)' : 'white', transition: 'all 0.2s' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{tpl.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Focus: {tpl.focus}</div>
                 </div>
              ))}
           </div>
        </div>

        {/* Active Layout Widgets */}
        <div>
           <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Settings size={16} /> Active Widgets
           </h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             {activeLayout.map((widget, idx) => (
                <div key={`${widget.id}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '8px' }}>
                   <div>
                     <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{widget.data.label || widget.data.component || widget.id}</div>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Type: {widget.type} | Size: {widget.size}</div>
                   </div>
                   <button onClick={() => removeWidget(widget.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}><X size={16} /></button>
                </div>
             ))}
             {activeLayout.length === 0 && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No widgets in this layout.</div>}
           </div>
        </div>

        {/* Widget Marketplace / Add New */}
        <div>
           <button onClick={() => setShowCustomKPI(true)} className="gcp-btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', borderStyle: 'dashed' }}>
             <Plus size={16} /> Create Custom KPI
           </button>
        </div>

      </div>

      <div style={{ padding: '1.5rem', backgroundColor: 'white', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
         <button className="gcp-btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={16} /> Save Workspace
         </button>
      </div>

    </div>
  );
}
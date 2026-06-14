import User from "lucide-react/dist/esm/icons/user";
import Stethoscope from "lucide-react/dist/esm/icons/stethoscope";
import Building from "lucide-react/dist/esm/icons/building";
import Briefcase from "lucide-react/dist/esm/icons/briefcase";
import ArrowDown from "lucide-react/dist/esm/icons/arrow-down";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import React from 'react';







export default function GlobalRelationshipPanel({ 
  patient, 
  physician, 
  clinic, 
  manager,
  activeEntity // 'patient' | 'physician' | 'clinic' | 'manager'
}) {
  const nodes = [];

  if (patient) {
    nodes.push({ id: 'patient', label: 'Patient', data: patient, icon: User, color: '#ec4899', bg: '#fdf2f8' });
  }
  if (physician) {
    nodes.push({ id: 'physician', label: 'Primary Physician', data: physician, icon: Stethoscope, color: '#8b5cf6', bg: '#f5f3ff' });
  }
  if (clinic) {
    nodes.push({ id: 'clinic', label: 'Clinic', data: clinic, icon: Building, color: '#3b82f6', bg: '#eff6ff' });
  }
  if (manager) {
    nodes.push({ id: 'manager', label: 'Account Manager', data: manager, icon: Briefcase, color: '#10b981', bg: '#f0fdf4' });
  }

  return (
    <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
      <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Relationship Graph
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {nodes.map((node, idx) => {
          const isActive = activeEntity === node.id;
          const isLast = idx === nodes.length - 1;
          const Icon = node.icon;

          return (
            <React.Fragment key={node.id}>
              {/* Node Card */}
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem', 
                  padding: '0.75rem', 
                  backgroundColor: isActive ? 'var(--color-bg-hover)' : 'transparent',
                  border: isActive ? `1px solid ${node.color}` : '1px solid transparent',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                className="hover-card-subtle"
                onClick={() => {
                  // In a real app with routing, this would navigate. 
                  // For drawers, this might trigger a context change or event.
                  console.log('Navigate to', node.id, node.data.id);
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: '8px', backgroundColor: node.bg, color: node.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{node.label}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {node.data.name}
                  </div>
                </div>
                {!isActive && (
                  <ExternalLink size={14} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                )}
              </div>

              {/* Edge (Connecting Line) */}
              {!isLast && (
                <div style={{ display: 'flex', justifyContent: 'center', height: '24px', alignItems: 'center' }}>
                  <ArrowDown size={14} color="var(--border)" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
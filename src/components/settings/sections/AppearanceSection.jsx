import Sun from "lucide-react/dist/esm/icons/sun";
import Moon from "lucide-react/dist/esm/icons/moon";
import Monitor from "lucide-react/dist/esm/icons/monitor";
import LayoutGrid from "lucide-react/dist/esm/icons/layout-grid";
import LayoutList from "lucide-react/dist/esm/icons/layout-list";
import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useAutoSave } from '../../../hooks/useAutoSave';






export default function AppearanceSection() {
  const { userProfile, updateProfileData } = useAuth();
  const { data, updateField } = useAutoSave({
    theme: userProfile?.appearance?.theme || 'system',
    density: userProfile?.appearance?.density || 'comfortable',
  }, async (changedFields) => {
    await updateProfileData({
      appearance: {
        ...(userProfile?.appearance || {}),
        ...data,
        ...changedFields
      }
    });
  }, 500);

  return (
    <div style={{ padding: '2rem' }}>
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)' }}>Appearance & Theme</h3>
      <p style={{ margin: '0 0 2rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Customize the look and feel of the application.</p>

      {/* Theme Selection */}
      <div style={{ marginBottom: '3rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Color Theme</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <button 
            onClick={() => updateField('theme', 'light')}
            style={{
              padding: '1.5rem', borderRadius: '12px', border: `2px solid ${data.theme === 'light' ? 'var(--primary)' : 'var(--border)'}`,
              backgroundColor: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', transition: 'all 0.2s'
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sun size={24} />
            </div>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Light Mode</span>
          </button>

          <button 
            onClick={() => updateField('theme', 'dark')}
            style={{
              padding: '1.5rem', borderRadius: '12px', border: `2px solid ${data.theme === 'dark' ? 'var(--primary)' : 'var(--border)'}`,
              backgroundColor: '#1e293b', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', transition: 'all 0.2s'
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#334155', color: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Moon size={24} />
            </div>
            <span style={{ fontWeight: 600, color: 'white' }}>Dark Mode</span>
          </button>

          <button 
            onClick={() => updateField('theme', 'system')}
            style={{
              padding: '1.5rem', borderRadius: '12px', border: `2px solid ${data.theme === 'system' ? 'var(--primary)' : 'var(--border)'}`,
              background: 'linear-gradient(135deg, white 50%, #1e293b 50%)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', transition: 'all 0.2s'
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(128,128,128,0.2)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Monitor size={24} />
            </div>
            <span style={{ fontWeight: 600, color: 'var(--primary)', mixBlendMode: 'difference' }}>System Default</span>
          </button>

        </div>
      </div>

      {/* Density Selection */}
      <div>
        <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Information Density</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <button 
            onClick={() => updateField('density', 'compact')}
            style={{
              padding: '1rem', borderRadius: '12px', border: `2px solid ${data.density === 'compact' ? 'var(--primary)' : 'var(--border)'}`,
              backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left', transition: 'all 0.2s'
            }}
          >
            <LayoutList size={24} color={data.density === 'compact' ? 'var(--primary)' : 'var(--text-muted)'} />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Compact</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Show more data with less spacing.</div>
            </div>
          </button>

          <button 
            onClick={() => updateField('density', 'comfortable')}
            style={{
              padding: '1rem', borderRadius: '12px', border: `2px solid ${data.density === 'comfortable' ? 'var(--primary)' : 'var(--border)'}`,
              backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left', transition: 'all 0.2s'
            }}
          >
            <LayoutGrid size={24} color={data.density === 'comfortable' ? 'var(--primary)' : 'var(--text-muted)'} />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Comfortable</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Default spacious layout.</div>
            </div>
          </button>

        </div>
      </div>

    </div>
  );
}
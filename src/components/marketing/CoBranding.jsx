import React, { useState } from 'react';
import { Image as ImageIcon, UploadCloud, Edit3, Briefcase } from 'lucide-react';

export default function CoBranding({ ownerId, ownerType }) {
  const [logoUrl, setLogoUrl] = useState('');
  const [brandColor, setBrandColor] = useState('#0f766e');
  const [profileText, setProfileText] = useState('Dr. Roberto - Official Distributor');

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2rem'
      }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <Briefcase size={24} color="var(--primary)" />
            Co-Branding & Identity
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Customize how your shared catalogs and portals appear to your clients.
          </p>
        </div>
        <button className="primary-button" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Save Preferences
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 350px',
        gap: '2rem',
        alignItems: 'start'
      }}>
        
        {/* Settings Form */}
        <div style={{
          backgroundColor: 'var(--color-bg-surface)',
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Brand Assets</h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Secondary Logo / Clinic Badge
            </label>
            <div style={{
              border: '2px dashed var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '2rem',
              textAlign: 'center',
              backgroundColor: 'var(--color-bg-subtle, #f8fafc)',
              cursor: 'pointer'
            }}>
              <UploadCloud size={32} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
              <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>Click to upload or drag and drop</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>PNG, JPG or SVG (max. 2MB)</div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Display Name / Title
            </label>
            <input 
              type="text" 
              value={profileText}
              onChange={(e) => setProfileText(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                outline: 'none',
                fontFamily: 'var(--font-main)'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Accent Color
            </label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input 
                type="color" 
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                style={{
                  width: '50px',
                  height: '40px',
                  padding: '0',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{brandColor.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
          position: 'sticky',
          top: '2rem'
        }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', backgroundColor: '#f1f5f9', display: 'flex', gap: '0.4rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#cbd5e1' }}></div>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#cbd5e1' }}></div>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#cbd5e1' }}></div>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '50%', 
                backgroundColor: 'var(--color-bg-subtle, #f8fafc)', 
                margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid var(--border)'
              }}>
                <ImageIcon size={24} color="var(--text-muted)" />
              </div>
              <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem' }}>{profileText}</h4>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Partnered with Atlas Health</div>
            </div>

            <button style={{ 
              width: '100%', 
              padding: '0.75rem', 
              backgroundColor: brandColor, 
              color: 'white', 
              border: 'none', 
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.9rem',
              marginBottom: '1rem'
            }}>
              View Custom Catalog
            </button>
            
            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Powered by Atlas Health Infrastructure
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

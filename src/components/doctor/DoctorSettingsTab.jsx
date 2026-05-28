import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Building2, AlertCircle, Save, CheckCircle2, Loader2 } from 'lucide-react';
import Card from '../ui/Card';

export default function DoctorSettingsTab() {
  const { userProfile, updateProfileData } = useAuth();
  const [form, setForm] = useState({
    firstName: '', lastName: '', specialty: '', institution: '', licenseNo: '', phone: ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userProfile) return;
    setForm({
      firstName: userProfile.firstName || '',
      lastName: userProfile.lastName || '',
      specialty: userProfile.specialty || '',
      institution: userProfile.institution || '',
      licenseNo: userProfile.licenseNo || '',
      phone: userProfile.phone || '',
    });
  }, [userProfile]);

  const handleChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim()) { setError('El nombre es obligatorio.'); return; }
    setSaving(true);
    setError(null);
    try {
      await updateProfileData({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        specialty: form.specialty.trim(),
        institution: form.institution.trim(),
        licenseNo: form.licenseNo.trim(),
        phone: form.phone.trim(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('[Settings] save', err);
      setError('Error guardando el perfil. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', background: 'var(--color-bg-app)', border: '1px solid #cbd5e1', borderRadius: '8px', 
    padding: '0.75rem', fontSize: '0.95rem', color: 'var(--color-text-primary)', outline: 'none'
  };

  const labelStyle = {
    display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', padding: '2rem 0' }}>
      
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 0.5rem' }}>Configuración de Perfil</h2>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Actualiza tu información personal y profesional.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
            <User size={20} color="var(--primary)" />
            <h3 style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>Información Personal</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Nombre *</label>
              <input style={inputStyle} value={form.firstName} onChange={handleChange('firstName')} placeholder='Tu nombre' required />
            </div>
            <div>
              <label style={labelStyle}>Apellido</label>
              <input style={inputStyle} value={form.lastName} onChange={handleChange('lastName')} placeholder='Tu apellido' />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Teléfono</label>
            <input style={inputStyle} value={form.phone} onChange={handleChange('phone')} placeholder='+1 555 000 000' type='tel' />
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
            <Building2 size={20} color="var(--primary)" />
            <h3 style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>Información Profesional</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Especialidad</label>
              <input style={inputStyle} value={form.specialty} onChange={handleChange('specialty')} placeholder='Ej. Medicina Deportiva' />
            </div>
            <div>
              <label style={labelStyle}>Licencia Médica</label>
              <input style={inputStyle} value={form.licenseNo} onChange={handleChange('licenseNo')} placeholder='Número de licencia' />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Clínica / Hospital</label>
            <input style={inputStyle} value={form.institution} onChange={handleChange('institution')} placeholder='Nombre de la institución' />
          </div>
        </Card>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-danger)', background: '#fee2e2', padding: '1rem 1.5rem', borderRadius: '8px', fontWeight: 600 }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button
              type='submit'
              disabled={saving}
              className="btn"
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '8px', 
                border: 'none', background: saving ? 'var(--color-border)' : 'var(--primary)', color: 'var(--color-bg-surface)', 
                fontSize: '0.95rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            
            {saved && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: 'var(--color-success)', fontWeight: 600 }}>
                <CheckCircle2 size={18} /> Cambios guardados
              </span>
            )}
          </div>
        </Card>

      </form>
    </div>
  );
}

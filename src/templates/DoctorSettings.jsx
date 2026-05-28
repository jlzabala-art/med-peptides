import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import DoctorNav from '../components/doctor/DoctorNav';
import styles from './DoctorSettings.module.css';

export default function DoctorSettings() {
  const { user, userProfile } = useAuth();
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    defaultCurrency: 'USD',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (userProfile?.settings) {
      setSettings(userProfile.settings);
    }
  }, [userProfile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage('');
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { settings });
      setMessage('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <DoctorNav menuKey="settings" />
      <section className={styles.content}>
        <h2>Settings</h2>
        <p>Configure physician profile and preferences.</p>
        
        {message && <p style={{ color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="checkbox" 
              name="notificationsEnabled" 
              checked={settings.notificationsEnabled} 
              onChange={handleChange} 
            />
            Enable Email Notifications
          </label>
          
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            Default Currency
            <select 
              name="defaultCurrency" 
              value={settings.defaultCurrency} 
              onChange={handleChange}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </label>

          <button 
            type="submit" 
            disabled={saving} 
            style={{ 
              padding: '0.75rem', 
              background: 'var(--primary, #003666)', 
              color: 'var(--color-bg-surface)', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: saving ? 'not-allowed' : 'pointer' 
            }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </section>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import DoctorNav from '../components/doctor/DoctorNav';
import styles from './DoctorProfile.module.css';
import { Helmet } from 'react-helmet-async';

export default function DoctorProfile() {
  const { user, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialty: '',
    avatar: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (userProfile || user) {
      setFormData({
        name: userProfile?.name || user?.displayName || '',
        email: userProfile?.email || user?.email || '',
        specialty: userProfile?.specialty || '',
        avatar: userProfile?.avatar || user?.photoURL || ''
      });
    }
  }, [userProfile, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage('');
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: formData.name,
        specialty: formData.specialty,
        avatar: formData.avatar,
        updatedAt: new Date()
      });
      setMessage('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage('Error saving profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>Physician Profile – Med‑Peptides</title>
        <meta name="description" content="Edit physician profile information, including personal data and preferences." />
      </Helmet>
      <DoctorNav menuKey="profile" />
      <section className={styles.content}>
        <h2>Physician Profile</h2>
        {message && <p style={{ color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}
        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            Name
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full name" />
          </label>
          <label>
            Email
            <input type="email" name="email" value={formData.email} disabled placeholder="email@example.com" />
          </label>
          <label>
            Specialty
            <input type="text" name="specialty" value={formData.specialty} onChange={handleChange} placeholder="Specialty" />
          </label>
          <label>
            Avatar URL
            <input type="url" name="avatar" value={formData.avatar} onChange={handleChange} placeholder="https://..." />
          </label>
          <button type="submit" disabled={saving} className={styles.saveBtn}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </section>
    </div>
  );
}

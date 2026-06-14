import Camera from "lucide-react/dist/esm/icons/camera";
import Wand2 from "lucide-react/dist/esm/icons/wand-2";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import React, { useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useAutoSave } from '../../../hooks/useAutoSave';



import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../firebase';
import { updateProfile } from 'firebase/auth';
import toast from 'react-hot-toast';

export default function ProfileSection() {
  const { user, userProfile, updateProfileData } = useAuth();
  const fileInputRef = useRef(null);

  const { data, updateField } = useAutoSave({
    firstName: userProfile?.firstName || '',
    lastName: userProfile?.lastName || '',
    phone: userProfile?.phone || '',
    language: userProfile?.language || 'en',
    timezone: userProfile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  }, updateProfileData, 1000);

  const getInitials = () => {
    if (userProfile?.firstName && userProfile?.lastName) return `${userProfile.firstName[0]}${userProfile.lastName[0]}`.toUpperCase();
    return user?.email ? user.email.substring(0, 2).toUpperCase() : 'RP';
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }

    const loadingToast = toast.loading('Uploading profile photo...');
    try {
      const storageRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on('state_changed', null,
        (error) => {
          console.error(error);
          toast.error('Failed to upload image.', { id: loadingToast });
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await updateProfileData({ photoURL: downloadURL });
          if (user) await updateProfile(user, { photoURL: downloadURL });
          toast.success('Profile photo updated successfully.', { id: loadingToast });
        }
      );
    } catch (err) {
      console.error(err);
      toast.error('Error uploading image.', { id: loadingToast });
    }
  };

  const removePhoto = async () => {
    if (!userProfile?.photoURL) return;
    const loadingToast = toast.loading('Removing photo...');
    try {
      await updateProfileData({ photoURL: null });
      if (user) await updateProfile(user, { photoURL: null });
      toast.success('Photo removed.', { id: loadingToast });
    } catch(err) {
      toast.error('Failed to remove photo.', { id: loadingToast });
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)' }}>Profile Information</h3>
      {/* Profile Photo Area */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', marginBottom: '2.5rem' }}>
        <div style={{ 
          width: '96px', height: '96px', borderRadius: '50%', 
          backgroundColor: 'var(--background)', color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', fontWeight: 700, border: '1px solid var(--border)',
          overflow: 'hidden'
        }}>
          {userProfile?.photoURL || user?.photoURL ? (
            <img src={userProfile?.photoURL || user?.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : getInitials()}
        </div>
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: 'var(--text-main)' }}>Profile Photo</h4>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>We recommend an image of at least 300x300px.</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => fileInputRef.current?.click()} className="gcp-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
              <Camera size={14} /> Upload Photo
            </button>
            <button className="gcp-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} onClick={() => toast('AI Generation coming soon!')}>
              <Wand2 size={14} /> Generate Avatar
            </button>
            {(userProfile?.photoURL || user?.photoURL) && (
              <button onClick={removePhoto} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', fontSize: '0.8rem', background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontWeight: 500 }}>
                <Trash2 size={14} /> Remove
              </button>
            )}
            <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleAvatarChange} />
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>First Name</label>
          <input type="text" className="gcp-input" value={data.firstName} onChange={(e) => updateField('firstName', e.target.value)} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Last Name</label>
          <input type="text" className="gcp-input" value={data.lastName} onChange={(e) => updateField('lastName', e.target.value)} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Email Address (Read-only)</label>
          <input type="email" className="gcp-input" value={user?.email || ''} readOnly disabled style={{ backgroundColor: 'var(--background)', color: 'var(--text-muted)', cursor: 'not-allowed' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Phone Number</label>
          <input type="tel" className="gcp-input" value={data.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+1 (555) 000-0000" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Language</label>
          <select className="gcp-input" value={data.language} onChange={(e) => updateField('language', e.target.value)}>
            <option value="en">English (US)</option>
            <option value="es">Español (ES)</option>
            <option value="fr">Français (FR)</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Timezone</label>
          <select className="gcp-input" value={data.timezone} onChange={(e) => updateField('timezone', e.target.value)}>
            <option value="America/New_York">Eastern Time (US & Canada)</option>
            <option value="America/Chicago">Central Time (US & Canada)</option>
            <option value="America/Denver">Mountain Time (US & Canada)</option>
            <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
            <option value="Europe/Madrid">Central European Time (Madrid)</option>
            <option value="Asia/Dubai">Gulf Standard Time (Dubai)</option>
            <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>Local ({Intl.DateTimeFormat().resolvedOptions().timeZone})</option>
          </select>
        </div>
      </div>
    </div>
  );
}
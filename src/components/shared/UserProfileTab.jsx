import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, User as UserIcon, Phone, Lock, Save, AlertCircle, CheckCircle2, Camera, Globe, MapPin, Briefcase, BellRing } from 'lucide-react';
import { getAuth, updatePassword, updateProfile } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase';

export default function UserProfileTab() {
  const { user, userProfile, updateProfileData } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: userProfile?.firstName || '',
    lastName: userProfile?.lastName || '',
    phone: userProfile?.phone || '',
    timezone: userProfile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    language: userProfile?.language || 'en',
    professionalRole: userProfile?.professionalRole || '',
    address_street: userProfile?.address?.street || '',
    address_city: userProfile?.address?.city || '',
    address_postalCode: userProfile?.address?.postalCode || '',
    address_country: userProfile?.address?.country || '',
    notif_email: userProfile?.notifications?.email ?? true,
    notif_sms: userProfile?.notifications?.sms ?? false,
    notif_inApp: userProfile?.notifications?.inApp ?? true,
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const handleDataChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleCheckboxChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.checked }));
  const handlePassChange = (e) => setPasswordData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        timezone: formData.timezone,
        language: formData.language,
        professionalRole: formData.professionalRole,
        address: {
          street: formData.address_street,
          city: formData.address_city,
          postalCode: formData.address_postalCode,
          country: formData.address_country,
        },
        notifications: {
          email: formData.notif_email,
          sms: formData.notif_sms,
          inApp: formData.notif_inApp,
        }
      };
      await updateProfileData(payload);
      setStatus({ type: 'success', message: 'Administrative details updated successfully.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Error updating details.' });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName[0]}${userProfile.lastName[0]}`.toUpperCase();
    }
    if (userProfile?.name) {
      return userProfile.name.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'RP';
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setStatus({ type: 'error', message: 'Passwords do not match.' });
    }
    if (passwordData.newPassword.length < 6) {
      return setStatus({ type: 'error', message: 'Password must be at least 6 characters.' });
    }
    
    setLoading(true);
    setStatus({ type: '', message: '' });
    
    try {
      const auth = getAuth();
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, passwordData.newPassword);
        setStatus({ type: 'success', message: 'Password updated successfully.' });
        setPasswordData({ newPassword: '', confirmPassword: '' });
      } else {
        setStatus({ type: 'error', message: 'You must log in again to perform this action.' });
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        setStatus({ type: 'error', message: 'For security reasons, you must log out and log back in before changing your password.' });
      } else {
        setStatus({ type: 'error', message: err.message || 'Error changing password.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate image
    if (!file.type.startsWith('image/')) {
      setStatus({ type: 'error', message: 'Please select a valid image file.' });
      return;
    }

    setUploadingAvatar(true);
    setStatus({ type: '', message: '' });
    try {
      const storageRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on('state_changed', 
        null,
        (error) => {
          console.error(error);
          setStatus({ type: 'error', message: 'Failed to upload image.' });
          setUploadingAvatar(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await updateProfileData({ photoURL: downloadURL });
          
          // Also update Firebase Auth profile
          if (user) {
            await updateProfile(user, { photoURL: downloadURL });
          }
          
          setUploadingAvatar(false);
          setStatus({ type: 'success', message: 'Profile photo updated successfully.' });
        }
      );
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Error uploading image.' });
      setUploadingAvatar(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '1.5rem' }}>
        My Profile & Settings
      </h2>

      {status.message && (
        <div style={{
          padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem',
          backgroundColor: status.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: status.type === 'success' ? '#166534' : '#991b1b'
        }}>
          {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          {status.message}
        </div>
      )}

      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 500, marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
          Administrative Details
        </h3>
        
        {/* Avatar Selection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          <div 
            style={{ 
              position: 'relative', 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: '2px solid #e2e8f0'
            }}
          >
            {userProfile?.photoURL || user?.photoURL ? (
              <img 
                src={userProfile?.photoURL || user?.photoURL} 
                alt="Profile" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <span style={{ fontSize: '2.5rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '-1px' }}>{getInitials()}</span>
            )}
            <div 
              onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '30px',
                background: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                opacity: uploadingAvatar ? 0.5 : 1
              }}
            >
              <Camera size={16} color="white" />
            </div>
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 500 }}>Profile Photo</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              {uploadingAvatar ? 'Uploading...' : 'Click the camera icon to upload a new photo.'}
            </p>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: '#666' }}>Email (Read-only)</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: '#999' }} />
              <input type="email" value={user?.email || ''} readOnly style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', color: '#666', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: '#666' }}>First Name</label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: '#999' }} />
                <input type="text" name="firstName" value={formData.firstName} onChange={handleDataChange} style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: '#666' }}>Last Name</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleDataChange} style={{ width: '100%', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: '#666' }}>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: '#999' }} />
                <input type="tel" name="phone" value={formData.phone} onChange={handleDataChange} style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: '#666' }}>Professional Role / Specialty</label>
              <div style={{ position: 'relative' }}>
                <Briefcase size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: '#999' }} />
                <input type="text" name="professionalRole" value={formData.professionalRole} onChange={handleDataChange} style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} placeholder="e.g. Doctor, Manager..." />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: '#666' }}>Timezone</label>
              <div style={{ position: 'relative' }}>
                <Globe size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: '#999' }} />
                <select name="timezone" value={formData.timezone} onChange={handleDataChange} style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', appearance: 'none', backgroundColor: 'white' }}>
                  <option value="America/New_York">Eastern Time (US & Canada)</option>
                  <option value="America/Chicago">Central Time (US & Canada)</option>
                  <option value="America/Denver">Mountain Time (US & Canada)</option>
                  <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                  <option value="Europe/Madrid">Central European Time (Madrid)</option>
                  <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>Local ({Intl.DateTimeFormat().resolvedOptions().timeZone})</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: '#666' }}>Language / Idioma</label>
              <div style={{ position: 'relative' }}>
                <Globe size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: '#999' }} />
                <select name="language" value={formData.language} onChange={handleDataChange} style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', appearance: 'none', backgroundColor: 'white' }}>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: '#666' }}>Full Address</label>
            <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
              <MapPin size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: '#999' }} />
              <input type="text" name="address_street" value={formData.address_street} onChange={handleDataChange} placeholder="Street Address" style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
              <input type="text" name="address_city" value={formData.address_city} onChange={handleDataChange} placeholder="City" style={{ width: '100%', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              <input type="text" name="address_postalCode" value={formData.address_postalCode} onChange={handleDataChange} placeholder="Postal Code" style={{ width: '100%', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              <input type="text" name="address_country" value={formData.address_country} onChange={handleDataChange} placeholder="Country" style={{ width: '100%', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: '#666' }}>
              <BellRing size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
              Notification Preferences
            </label>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="notif_email" checked={formData.notif_email} onChange={handleCheckboxChange} />
                <span>Email Alerts</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="notif_sms" checked={formData.notif_sms} onChange={handleCheckboxChange} />
                <span>SMS Notifications</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="notif_inApp" checked={formData.notif_inApp} onChange={handleCheckboxChange} />
                <span>In-App Messages</span>
              </label>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            marginTop: '1rem', padding: '0.75rem', borderRadius: '8px', border: 'none', background: 'var(--color-primary)', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
          }}>
            <Save size={18} /> Save Changes
          </button>
        </form>
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 500, marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
          Change Password
        </h3>
        
        <form onSubmit={handleUpdatePassword} style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: '#666' }}>New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: '#999' }} />
              <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePassChange} minLength={6} style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} required />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: '#666' }}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: '#999' }} />
              <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePassChange} minLength={6} style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} required />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            marginTop: '1rem', padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#334155', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: 'fit-content'
          }}>
            <Lock size={18} /> Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

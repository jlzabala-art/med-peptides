"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Mail, 
  User as UserIcon, 
  Phone, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  Camera, 
  Globe, 
  MapPin, 
  Briefcase, 
  BellRing, 
  Check, 
  Loader2, 
  Sparkles,
  Info
} from '@/lib/icons';
import { Checkbox } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import InternationalPhoneInput from '../../components/ui/InternationalPhoneInput';
import notifier from '@/services/NotificationService';
import { getAuth, updatePassword, updateProfile } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import * as fb from '../../firebase';

const storage = fb?.storage;

// Clinical & Role Specialties Presets
export const ROLE_SPECIALTY_PRESETS = {
  admin: [
    'Platform Administrator',
    'Operations Director',
    'Clinical Director',
    'Medical Governance Lead',
    'System Superadmin',
    'Healthcare Compliance Officer'
  ],
  doctor: [
    'Functional Medicine Physician',
    'Anti-Aging & Longevity Specialist',
    'Endocrinologist & Metabolic Health',
    'Regenerative Medicine Physician',
    'Sports Medicine & Performance Doctor',
    'Integrative Medicine Practitioner',
    'Dermatology & Aesthetic Medicine',
    'Cardiology & Cardiovascular Health',
    'Internal Medicine Specialist',
    'Neurology & Cognitive Health',
    'Urology & Men’s Health Optimization',
    'Gynecology & Women’s Hormonal Health',
    'Orthopedics & Joint Restoration',
    'Immunology & Peptide Therapy',
    'General Practitioner / Family Physician',
    'Peptide Therapy Consultant'
  ],
  wholesaler: [
    'Clinic Director',
    'Purchasing & Procurement Lead',
    'Compounding Pharmacist',
    'Wholesale Operations Manager',
    'Medical Supply Coordinator',
    'Pharmacy Operations Director',
    'Fagron Partner / Distributor'
  ],
  clinic: [
    'Clinic Director',
    'Medical Operations Manager',
    'Lead Nurse Practitioner',
    'Clinical Operations Lead',
    'Purchasing Coordinator'
  ],
  pharmacy: [
    'Lead Compounding Pharmacist',
    'Pharmacy Director',
    'Formulation Specialist',
    'Quality & Sterility Officer'
  ],
  patient: [
    'Executive Wellness Member',
    'Fagron Client',
    'Longevity Protocol Patient',
    'Active Peptide Therapy Patient',
    'Preventive Health Client'
  ]
};

export default function UserProfileTab({ inDrawer = false, onClose }) {
  const { user, userProfile, updateProfileData, activeRole } = useAuth();

  const [formData, setFormData] = useState({
    firstName: userProfile?.firstName || '',
    lastName: userProfile?.lastName || '',
    phone: userProfile?.phone || '',
    timezone: userProfile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Madrid',
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
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [loadingPass, setLoadingPass] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  // Sync profile data when Firestore userProfile loads
  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        firstName: userProfile.firstName !== undefined ? userProfile.firstName : prev.firstName,
        lastName: userProfile.lastName !== undefined ? userProfile.lastName : prev.lastName,
        phone: userProfile.phone !== undefined ? userProfile.phone : prev.phone,
        timezone: userProfile.timezone || prev.timezone,
        language: userProfile.language || prev.language,
        professionalRole: userProfile.professionalRole !== undefined ? userProfile.professionalRole : prev.professionalRole,
        address_street: userProfile.address?.street !== undefined ? userProfile.address.street : prev.address_street,
        address_city: userProfile.address?.city !== undefined ? userProfile.address.city : prev.address_city,
        address_postalCode: userProfile.address?.postalCode !== undefined ? userProfile.address.postalCode : prev.address_postalCode,
        address_country: userProfile.address?.country !== undefined ? userProfile.address.country : prev.address_country,
        notif_email: userProfile.notifications?.email ?? prev.notif_email,
        notif_sms: userProfile.notifications?.sms ?? prev.notif_sms,
        notif_inApp: userProfile.notifications?.inApp ?? prev.notif_inApp,
      }));
    }
  }, [userProfile]);

  // Determine role presets
  const effectiveRole = activeRole || userProfile?.role || 'doctor';
  const rolePresets = ROLE_SPECIALTY_PRESETS[effectiveRole] || ROLE_SPECIALTY_PRESETS.doctor;

  // Generic Auto-Save function
  const saveField = async (updatedFields) => {
    setSaveStatus('saving');
    try {
      await updateProfileData(updatedFields);
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus(prev => prev === 'saved' ? 'idle' : prev);
      }, 2500);
    } catch (err) {
      console.error('Failed to auto-save field:', err);
      setSaveStatus('error');
      notifier.toast('Failed to save changes automatically: ' + (err.message || 'Unknown error'), 'error');
    }
  };

  const handleDataChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleBlurField = (e) => {
    const { name, value } = e.target;
    saveField({ [name]: value });
  };

  const handleAddressBlur = () => {
    saveField({
      address: {
        street: formData.address_street,
        city: formData.address_city,
        postalCode: formData.address_postalCode,
        country: formData.address_country,
      }
    });
  };

  const handleSelectPreset = (preset) => {
    setFormData(p => ({ ...p, professionalRole: preset }));
    saveField({ professionalRole: preset });
  };

  const handlePhoneChange = (newPhone) => {
    setFormData(p => ({ ...p, phone: newPhone }));
  };

  const handlePhoneBlur = () => {
    saveField({ phone: formData.phone });
  };

  const handleSelectChangeWithSave = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    saveField({ [name]: value });
  };

  const handleCheckboxChangeWithSave = (e) => {
    const { name, checked } = e.target;
    setFormData(p => ({ ...p, [name]: checked }));
    const notifs = {
      email: name === 'notif_email' ? checked : formData.notif_email,
      sms: name === 'notif_sms' ? checked : formData.notif_sms,
      inApp: name === 'notif_inApp' ? checked : formData.notif_inApp,
    };
    saveField({ notifications: notifs });
  };

  const handlePassChange = (e) => {
    setPasswordData(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const getInitials = () => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName[0]}${userProfile.lastName[0]}`.toUpperCase();
    }
    if (userProfile?.name) {
      const parts = userProfile.name.split(' ').filter(p => p.length > 0);
      if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
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
    setLoadingPass(true);
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
      setLoadingPass(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
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

  // Determine country hint for phone prefix
  const countryHint = formData.address_country?.toLowerCase().includes('spain') || 
                      formData.timezone?.includes('Madrid') ? 'ES' : 'AE';

  return (
    <div style={{ 
      maxWidth: inDrawer ? '100%' : '820px', 
      margin: inDrawer ? '0' : '0 auto', 
      padding: inDrawer ? '0' : '2rem' 
    }}>
      {/* Title & Save Status Badge */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {!inDrawer && (
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary, #003666)', margin: 0 }}>
            My Profile
          </h2>
        )}

        {/* Live Smart Save Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          {saveStatus === 'saving' && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              color: '#0284c7',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              padding: '3px 10px',
              borderRadius: '20px',
              fontWeight: 600,
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}>
              <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
              Saving changes...
            </span>
          )}

          {saveStatus === 'saved' && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              color: '#166534',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              padding: '3px 10px',
              borderRadius: '20px',
              fontWeight: 600,
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}>
              <CheckCircle2 size={14} />
              All changes saved
            </span>
          )}

          {saveStatus === 'error' && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              color: '#991b1b',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              padding: '3px 10px',
              borderRadius: '20px',
              fontWeight: 600
            }}>
              <AlertCircle size={14} />
              Error saving
            </span>
          )}

          {saveStatus === 'idle' && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.75rem',
              color: '#64748b',
              padding: '2px 8px',
              borderRadius: '6px',
              background: '#f8fafc',
              border: '1px solid #f1f5f9'
            }}>
              <CheckCircle2 size={13} color="#10b981" />
              Auto-saved on edit
            </span>
          )}
        </div>
      </div>

      {status.message && (
        <div style={{
          padding: '0.85rem 1rem',
          marginBottom: '1.25rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.88rem',
          backgroundColor: status.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: status.type === 'success' ? '#166534' : '#991b1b',
          border: `1px solid ${status.type === 'success' ? '#bbf7d0' : '#fecaca'}`
        }}>
          {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{status.message}</span>
        </div>
      )}

      {/* Main Details Card */}
      <div style={{ 
        background: 'white', 
        padding: inDrawer ? '1.25rem' : '2rem', 
        borderRadius: '12px', 
        boxShadow: inDrawer ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)', 
        border: inDrawer ? '1px solid #e2e8f0' : 'none',
        marginBottom: '1.5rem' 
      }}>
        {/* Avatar Selection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem' }}>
          <div 
            style={{ 
              position: 'relative', 
              width: '84px', 
              height: '84px', 
              borderRadius: '50%', 
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: '2px solid #e2e8f0',
              flexShrink: 0
            }}
          >
            {userProfile?.photoURL || user?.photoURL ? (
              <img 
                src={userProfile?.photoURL || user?.photoURL} 
                alt="Profile" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#94a3b8' }}>{getInitials()}</span>
            )}
            <button 
              type="button"
              onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
              aria-label="Upload profile photo"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '28px',
                background: 'rgba(0,0,0,0.6)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                opacity: uploadingAvatar ? 0.5 : 1
              }}
            >
              <Camera size={14} color="white" />
            </button>
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
              Profile Photo
            </h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
              {uploadingAvatar ? 'Uploading image...' : 'Click the camera icon to upload a photo.'}
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

        {/* Inline Editable Form Fields */}
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          
          {/* Email (Read-Only) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#475569' }}>
              Email Address (Read-only)
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
              <input 
                type="email" 
                value={user?.email || ''} 
                readOnly 
                style={{ 
                  width: '100%', 
                  padding: '0.55rem 1rem 0.55rem 2.4rem', 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0', 
                  backgroundColor: '#f8fafc', 
                  color: '#64748b', 
                  fontSize: '0.88rem',
                  boxSizing: 'border-box' 
                }} 
              />
            </div>
          </div>

          {/* First & Last Name */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#475569' }}>
                First Name
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleDataChange} 
                  onBlur={handleBlurField}
                  style={{ 
                    width: '100%', 
                    padding: '0.55rem 1rem 0.55rem 2.4rem', 
                    borderRadius: '8px', 
                    border: '1px solid #cbd5e1', 
                    fontSize: '0.88rem',
                    color: '#0f172a',
                    boxSizing: 'border-box' 
                  }} 
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#475569' }}>
                Last Name
              </label>
              <input 
                type="text" 
                name="lastName" 
                value={formData.lastName} 
                onChange={handleDataChange} 
                onBlur={handleBlurField}
                style={{ 
                  width: '100%', 
                  padding: '0.55rem 1rem', 
                  borderRadius: '8px', 
                  border: '1px solid #cbd5e1', 
                  fontSize: '0.88rem',
                  color: '#0f172a',
                  boxSizing: 'border-box' 
                }} 
              />
            </div>
          </div>

          {/* International Phone with Prefix */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#475569' }}>
              Phone Number (with Country Code)
            </label>
            <div onBlur={handlePhoneBlur}>
              <InternationalPhoneInput
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="612 345 678"
                countryHint={countryHint}
              />
            </div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
              Select your country prefix and enter your local number. Automatically saved when you exit the field.
            </span>
          </div>

          {/* Professional Role / Specialty with Quick Presets */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#475569' }}>
              Professional Role / Specialty
            </label>
            <div style={{ position: 'relative' }}>
              <Briefcase size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
              <input 
                type="text" 
                name="professionalRole" 
                list="role-specialty-presets"
                value={formData.professionalRole} 
                onChange={handleDataChange} 
                onBlur={handleBlurField}
                placeholder="e.g. Functional Medicine Physician, Clinic Director, Fagron Client..." 
                style={{ 
                  width: '100%', 
                  padding: '0.55rem 1rem 0.55rem 2.4rem', 
                  borderRadius: '8px', 
                  border: '1px solid #cbd5e1', 
                  fontSize: '0.88rem',
                  color: '#0f172a',
                  boxSizing: 'border-box' 
                }} 
              />
              <datalist id="role-specialty-presets">
                {rolePresets.map(preset => (
                  <option key={preset} value={preset} />
                ))}
              </datalist>
            </div>

            {/* Quick-Select Recommendation Chips */}
            <div style={{ marginTop: '0.55rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginBottom: '0.35rem' }}>
                Recommended for your role ({effectiveRole}):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {rolePresets.map(preset => {
                  const isSelected = formData.professionalRole === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: isSelected ? 700 : 500,
                        padding: '3px 9px',
                        borderRadius: '14px',
                        border: isSelected ? '1.5px solid var(--color-primary, #003666)' : '1px solid #e2e8f0',
                        background: isSelected ? 'rgba(0, 54, 102, 0.08)' : '#f8fafc',
                        color: isSelected ? 'var(--color-primary, #003666)' : '#475569',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title={`Select ${preset}`}
                    >
                      {isSelected && <Check size={12} />}
                      <span>{preset}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Timezone & Language */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#475569' }}>
                Timezone
              </label>
              <div style={{ position: 'relative' }}>
                <Globe size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                <select 
                  name="timezone" 
                  value={formData.timezone} 
                  onChange={handleSelectChangeWithSave} 
                  style={{ 
                    width: '100%', 
                    padding: '0.55rem 1rem 0.55rem 2.4rem', 
                    borderRadius: '8px', 
                    border: '1px solid #cbd5e1', 
                    boxSizing: 'border-box', 
                    backgroundColor: 'white',
                    fontSize: '0.88rem',
                    color: '#0f172a'
                  }}
                >
                  <option value="Europe/Madrid">Central European Time (Madrid - UTC+1/+2)</option>
                  <option value="Asia/Dubai">Gulf Standard Time (Dubai - UTC+4)</option>
                  <option value="Asia/Riyadh">Arabia Standard Time (Riyadh - UTC+3)</option>
                  <option value="America/New_York">Eastern Time (US & Canada - UTC-5)</option>
                  <option value="America/Chicago">Central Time (US & Canada - UTC-6)</option>
                  <option value="America/Denver">Mountain Time (US & Canada - UTC-7)</option>
                  <option value="America/Los_Angeles">Pacific Time (US & Canada - UTC-8)</option>
                  <option value="Europe/London">Greenwich Mean Time (London - UTC+0)</option>
                  <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                    Local ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#475569' }}>
                Preferred Language
              </label>
              <div style={{ position: 'relative' }}>
                <Globe size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                <select 
                  name="language" 
                  value={formData.language} 
                  onChange={handleSelectChangeWithSave} 
                  style={{ 
                    width: '100%', 
                    padding: '0.55rem 1rem 0.55rem 2.4rem', 
                    borderRadius: '8px', 
                    border: '1px solid #cbd5e1', 
                    boxSizing: 'border-box', 
                    backgroundColor: 'white',
                    fontSize: '0.88rem',
                    color: '#0f172a'
                  }}
                >
                  <option value="en">English (Clinical Standard)</option>
                  <option value="es">Español (En validación clínica)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Full Address */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#475569' }}>
              Full Address
            </label>
            <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
              <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
              <input 
                type="text" 
                name="address_street" 
                value={formData.address_street} 
                onChange={handleDataChange} 
                onBlur={handleAddressBlur}
                placeholder="Street Address (e.g. Paseo de la Castellana 45)" 
                style={{ 
                  width: '100%', 
                  padding: '0.55rem 1rem 0.55rem 2.4rem', 
                  borderRadius: '8px', 
                  border: '1px solid #cbd5e1', 
                  fontSize: '0.88rem',
                  boxSizing: 'border-box' 
                }} 
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
              <input 
                type="text" 
                name="address_city" 
                value={formData.address_city} 
                onChange={handleDataChange} 
                onBlur={handleAddressBlur}
                placeholder="City (e.g. Madrid)" 
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }} 
              />
              <input 
                type="text" 
                name="address_postalCode" 
                value={formData.address_postalCode} 
                onChange={handleDataChange} 
                onBlur={handleAddressBlur}
                placeholder="Postal Code (e.g. 28046)" 
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }} 
              />
              <input 
                type="text" 
                name="address_country" 
                value={formData.address_country} 
                onChange={handleDataChange} 
                onBlur={handleAddressBlur}
                placeholder="Country (e.g. Spain)" 
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }} 
              />
            </div>
          </div>

          {/* Notification Preferences */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1rem',
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              <BellRing size={16} color="var(--color-primary, #003666)" />
              Notification Channels
            </label>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#334155' }}>
                <Checkbox name="notif_email" checked={formData.notif_email} onChange={handleCheckboxChangeWithSave} />
                <span>Email Alerts</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#334155' }}>
                <Checkbox name="notif_sms" checked={formData.notif_sms} onChange={handleCheckboxChangeWithSave} />
                <span>SMS Notifications</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#334155' }}>
                <Checkbox name="notif_inApp" checked={formData.notif_inApp} onChange={handleCheckboxChangeWithSave} />
                <span>In-App Messages</span>
              </label>
            </div>
          </div>

        </div>
      </div>

      {/* Password & Credentials Section (Explicit Save Required) */}
      <div style={{ 
        background: 'white', 
        padding: inDrawer ? '1.25rem' : '2rem', 
        borderRadius: '12px', 
        boxShadow: inDrawer ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)', 
        border: inDrawer ? '1px solid #e2e8f0' : 'none'
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
          Password & Security
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0 0 1.25rem 0', lineHeight: 1.4 }}>
          Set or change your personal account password. For security reasons, updating your password requires deliberate confirmation.
        </p>

        <form onSubmit={handleUpdatePassword} style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#475569' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                <input 
                  type="password" 
                  name="newPassword" 
                  value={passwordData.newPassword} 
                  onChange={handlePassChange} 
                  minLength={6} 
                  placeholder="At least 6 characters"
                  style={{ width: '100%', padding: '0.55rem 1rem 0.55rem 2.4rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }} 
                  required 
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#475569' }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={passwordData.confirmPassword} 
                  onChange={handlePassChange} 
                  minLength={6} 
                  placeholder="Repeat new password"
                  style={{ width: '100%', padding: '0.55rem 1rem 0.55rem 2.4rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }} 
                  required 
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loadingPass} 
            style={{
              padding: '0.65rem 1.25rem', 
              borderRadius: '8px', 
              border: 'none', 
              background: '#0f172a', 
              color: 'white', 
              fontWeight: 600, 
              fontSize: '0.85rem',
              cursor: 'pointer', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem', 
              width: 'fit-content'
            }}
          >
            {loadingPass ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Lock size={15} />}
            <span>Update Password</span>
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
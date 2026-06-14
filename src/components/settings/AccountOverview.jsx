import Globe from "lucide-react/dist/esm/icons/globe";
import Clock from "lucide-react/dist/esm/icons/clock";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import React from 'react';
import { useAuth } from '../../context/AuthContext';





export default function AccountOverview() {
  const { user, userProfile, activeRole } = useAuth();
  const getInitials = () => {
    if (userProfile?.firstName && userProfile?.lastName) return `${userProfile.firstName[0]}${userProfile.lastName[0]}`.toUpperCase();
    if (userProfile?.name) {
      const parts = userProfile.name.split(' ').filter(p => p.length > 0);
      if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      return userProfile.name.substring(0, 2).toUpperCase();
    }
    return user?.email ? user.email.substring(0, 2).toUpperCase() : 'RP';
  };

  const name = userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName}` : (userProfile?.name || 'User');
  const roleDisplay = userProfile?.professionalRole || activeRole || 'Standard User';
  const department = userProfile?.institution || 'General Access';
  const lastLogin = user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'Today';
  const timezone = userProfile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const language = userProfile?.language === 'es' ? 'Español' : 'English';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '16px',
      border: '1px solid var(--border)',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          fontWeight: 700,
          border: '2px solid var(--border)',
          overflow: 'hidden'
        }}>
          {userProfile?.photoURL || user?.photoURL ? (
            <img src={userProfile?.photoURL || user?.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            getInitials()
          )}
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>{roleDisplay}</span>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--border)' }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{department}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
            padding: '0.25rem 0.75rem', borderRadius: '99px',
            backgroundColor: 'var(--success-light)', color: 'var(--success)',
            fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase'
          }}>
            <ShieldCheck size={14} /> Active
          </span>
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '0.5rem 0' }} />

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={16} color="var(--text-muted)" />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Last Login</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>{lastLogin}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Globe size={16} color="var(--text-muted)" />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Language</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>{language}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={16} color="var(--text-muted)" />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Timezone</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>{timezone}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
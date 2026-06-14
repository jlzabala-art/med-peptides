import Lock from "lucide-react/dist/esm/icons/lock";
import Smartphone from "lucide-react/dist/esm/icons/smartphone";
import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import Monitor from "lucide-react/dist/esm/icons/monitor";
import KeyRound from "lucide-react/dist/esm/icons/key-round";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getAuth, updatePassword, signOut } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase';






import toast from 'react-hot-toast';

export default function SecurityCenter() {
  const { user } = useAuth();
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  // Real Sessions State
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setSessionsLoading(false);
      return;
    }
    const q = query(collection(db, 'users', user.uid, 'sessions'), orderBy('lastActive', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setSessions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setSessionsLoading(false);
    }, (err) => {
      console.warn("Could not load sessions", err);
      setSessionsLoading(false);
    });
    return unsub;
  }, [user]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match.');
    }
    if (passwordData.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      const auth = getAuth();
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, passwordData.newPassword);
        toast.success('Password updated successfully.');
        setPasswordData({ newPassword: '', confirmPassword: '' });
      } else {
        toast.error('You must log in again to perform this action.');
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        toast.error('For security reasons, you must log out and log back in before changing your password.', { duration: 5000 });
      } else {
        toast.error(err.message || 'Error changing password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateSession = async (sessionId) => {
    if (!user?.uid) return;
    const loadingToast = toast.loading('Terminating session...');
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'sessions', sessionId));
      toast.success('Session terminated successfully.', { id: loadingToast });
    } catch (err) {
      console.error('Error terminating session:', err);
      toast.error('Failed to terminate session.', { id: loadingToast });
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)' }}>Security & Devices</h3>
      <p style={{ margin: '0 0 2.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Manage your password, two-factor authentication, and active sessions.</p>

      {/* Password Update */}
      <div style={{ marginBottom: '3rem' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
          <KeyRound size={18} color="var(--primary)" /> Change Password
        </h4>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <form onSubmit={handleUpdatePassword} style={{ display: 'grid', gap: '1.5rem', maxWidth: '400px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>New Password</label>
              <input type="password" minLength={6} required className="gcp-input" value={passwordData.newPassword} onChange={e => setPasswordData(p => ({...p, newPassword: e.target.value}))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Confirm New Password</label>
              <input type="password" minLength={6} required className="gcp-input" value={passwordData.confirmPassword} onChange={e => setPasswordData(p => ({...p, confirmPassword: e.target.value}))} />
            </div>
            <button type="submit" disabled={loading} className="gcp-btn-primary" style={{ width: 'fit-content' }}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Two-Factor Auth Mock */}
      <div style={{ marginBottom: '3rem' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
          <ShieldAlert size={18} color="var(--primary)" /> Two-Factor Authentication (2FA)
        </h4>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Authenticator App</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Use an app like Google Authenticator or Authy to generate codes.</div>
          </div>
          <button className="gcp-btn-secondary" onClick={() => toast('2FA setup coming soon.')}>Enable 2FA</button>
        </div>
      </div>

      {/* Active Sessions - Real Firestore connection */}
      <div>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
          <Monitor size={18} color="var(--primary)" /> Active Sessions
        </h4>
        {sessionsLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', color: 'var(--text-muted)' }}>
            <Loader2 size={16} className="animate-spin" /> Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No active session history found. Sessions are recorded upon login.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {sessions.map((session, index) => {
              const isCurrent = index === 0; // Assume most recent is current for display purposes if not explicitly marked
              const Icon = session.deviceType === 'mobile' ? Smartphone : Monitor;
              return (
                <div key={session.id} style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ padding: '0.5rem', backgroundColor: isCurrent ? 'var(--success-light)' : 'var(--background)', color: isCurrent ? 'var(--success)' : 'var(--text-muted)', borderRadius: '8px' }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {session.os || 'Unknown OS'} • {session.browser || 'Unknown Browser'}
                        {isCurrent && (
                          <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', backgroundColor: 'var(--success)', color: 'white', borderRadius: '99px', textTransform: 'uppercase', fontWeight: 700 }}>Current</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {session.location || 'Unknown Location'} • IP: {session.ip || 'Unknown'} • 
                        Last active: {session.lastActive?.toDate ? session.lastActive.toDate().toLocaleDateString() : 'Recently'}
                      </div>
                    </div>
                  </div>
                  {!isCurrent && (
                    <button className="gcp-btn-secondary" style={{ color: 'var(--error)' }} onClick={() => handleTerminateSession(session.id)}>
                      Log Out
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
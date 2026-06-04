import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { signInWithCustomToken, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function ImpersonateCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verifying secure token...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setError('Invalid or missing impersonation token.');
      return;
    }

    const authenticate = async () => {
      try {
        // Ensure we sign out from any current session in this window context
        await signOut(auth);
        
        setStatus('Authenticating as user...');
        
        // Set a flag in localStorage for this specific window/tab
        // so we can display a banner indicating we are impersonating.
        sessionStorage.setItem('isImpersonating', 'true');
        
        // Sign in with the custom token
        await signInWithCustomToken(auth, token);
        
        setStatus('Success! Redirecting...');
        
        // Redirect to root, the router will automatically handle role-based redirection
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1000);
        
      } catch (err) {
        console.error('Impersonation error:', err);
        setError(err.message || 'Failed to authenticate with the provided token.');
      }
    };

    authenticate();
  }, [searchParams, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      background: 'var(--bg-default)' 
    }}>
      <div style={{ 
        background: 'var(--bg-surface)', 
        padding: '2rem 3rem', 
        borderRadius: '16px', 
        border: '1px solid var(--border)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        {error ? (
          <>
            <ShieldAlert size={48} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>Impersonation Failed</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{error}</p>
            <button 
              className="btn btn-outline" 
              onClick={() => navigate('/')}
              style={{ marginTop: '1.5rem', width: '100%' }}
            >
              Return to Home
            </button>
          </>
        ) : (
          <>
            <Loader2 size={48} color="var(--primary)" className="spin" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>Secure Login</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{status}</p>
          </>
        )}
      </div>
    </div>
  );
}

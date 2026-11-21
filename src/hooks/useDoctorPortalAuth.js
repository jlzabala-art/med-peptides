"use client";

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

/**
 * useDoctorPortalAuth
 *
 * Encapsulates DHA / HIPAA authorization state for the Doctor Public Portal:
 * - Firebase Auth role/email matching
 * - 90-day clinical workstation verification & magic_token/auth_token exchange
 */
export function useDoctorPortalAuth({ slug, propSlug, data, initialData, isCustomerAgent = false }) {
  const [workstationAuthorized, setWorkstationAuthorized] = useState(false);
  const [viewerRole, setViewerRole] = useState('doctor');
  const { user, activeRole, isAdmin } = useAuth();

  const isAuthorizedViewer = useMemo(() => {
    if (isCustomerAgent) return true;
    if (workstationAuthorized) return true;
    if (!user) return false;
    if (isAdmin || activeRole === 'admin' || activeRole === 'doctor' || activeRole === 'clinic_admin') return true;
    const docEmail = data?.doctor?.email || initialData?.doctor?.email;
    const assistantEmail = data?.doctor?.assistantEmail || initialData?.doctor?.assistantEmail || data?.doctor?.assistant?.email;
    if (docEmail && user.email && user.email.toLowerCase() === docEmail.toLowerCase()) return true;
    if (assistantEmail && user.email && user.email.toLowerCase() === assistantEmail.toLowerCase()) return true;
    return false;
  }, [
    user,
    activeRole,
    isAdmin,
    data?.doctor?.email,
    initialData?.doctor?.email,
    data?.doctor?.assistantEmail,
    initialData?.doctor?.assistantEmail,
    data?.doctor?.assistant?.email,
    isCustomerAgent,
    workstationAuthorized
  ]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const magicToken = params.get('magic_token');
    const authToken = params.get('auth_token');
    let savedWsToken = '';
    try {
      savedWsToken = localStorage.getItem('atlas_workstation_session') || '';
    } catch (e) {
      console.debug('Could not read workstation session token:', e);
    }

    const targetSlug = slug || propSlug;
    if ((magicToken || authToken || savedWsToken) && targetSlug) {
      fetch('/api/doctor/verify-workstation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorSlug: targetSlug,
          magicToken: magicToken || '',
          authToken: authToken || '',
          workstationToken: savedWsToken || ''
        })
      })
        .then(res => res.json())
        .then(resData => {
          if (resData?.authorized) {
            setWorkstationAuthorized(true);
            if (resData.viewerRole) {
              setViewerRole(resData.viewerRole);
            }
            if (resData.workstationToken) {
              try {
                localStorage.setItem('atlas_workstation_session', resData.workstationToken);
              } catch (e) {
                console.debug('Could not save workstation session token:', e);
              }
            }
            if (magicToken || authToken) {
              const cleanUrl = window.location.pathname;
              window.history.replaceState({}, '', cleanUrl);
              toast.success('Clinical practice verified! Nominal patient records unlocked.');
            }
          }
        })
        .catch(err => console.warn('Workstation session verification:', err));
    }
  }, [slug, propSlug]);

  return {
    user,
    activeRole,
    isAdmin,
    workstationAuthorized,
    setWorkstationAuthorized,
    viewerRole,
    setViewerRole,
    isAuthorizedViewer
  };
}

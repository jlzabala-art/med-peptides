'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getDoctorQuota,
  consumeAiQuery,
  syncDoctorQuotaFromFirestore,
  isProTier,
  BASIC_AI_MONTHLY_LIMIT,
} from '../services/doctorAiQuotaService';

/**
 * useDoctorAiQuota
 * ─────────────────────────────────────────────────────────────────────────────
 * React hook to reactively track and consume a physician's monthly AI allowance.
 *
 * @param {string} [explicitDoctorId] - Optional doctor ID
 * @param {string} [explicitTier] - Optional subscription tier ('basic' | 'advanced')
 */
export function useDoctorAiQuota(explicitDoctorId = null, explicitTier = null) {
  const { user, userProfile, baseRole } = useAuth() || {};

  // Resolve effective doctorId and tier
  const resolveDoctorDetails = useCallback(() => {
    let docId = explicitDoctorId;
    let tier = explicitTier;

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const simParam = urlParams.get('simulate');
      const storedSim = sessionStorage.getItem('impersonatedDoctorId') || localStorage.getItem('impersonatedDoctorId');

      if (!docId) {
        if (simParam === 'dr-hanieh-erdmann' || storedSim === 'dr-hanieh-erdmann') {
          docId = 'dr-hanieh-erdmann';
        } else if (storedSim) {
          docId = storedSim;
        } else if (baseRole === 'doctor') {
          docId = user?.uid;
        } else if (userProfile?.assignedDoctorIds?.[0]) {
          docId = userProfile.assignedDoctorIds[0];
        } else {
          docId = 'dr-hanieh-erdmann'; // Default clinical simulation
        }
      }

      if (!tier) {
        if (docId === 'dr-hanieh-erdmann') {
          tier = 'basic';
        } else if (userProfile?.subscriptionTier) {
          tier = userProfile.subscriptionTier;
        } else {
          tier = 'basic';
        }
      }
    }

    return {
      doctorId: docId || 'dr-hanieh-erdmann',
      tier: tier || 'basic',
    };
  }, [explicitDoctorId, explicitTier, user?.uid, userProfile, baseRole]);

  const [doctorInfo, setDoctorInfo] = useState(resolveDoctorDetails);
  const [quota, setQuota] = useState(() => getDoctorQuota(doctorInfo.doctorId, doctorInfo.tier));

  // Update when doctor info changes
  useEffect(() => {
    const nextInfo = resolveDoctorDetails();
    setDoctorInfo(nextInfo);
    setQuota(getDoctorQuota(nextInfo.doctorId, nextInfo.tier));
    syncDoctorQuotaFromFirestore(nextInfo.doctorId, nextInfo.tier).then(synced => {
      if (synced) setQuota(synced);
    });
  }, [resolveDoctorDetails]);

  // Listen to global changes across components or tabs
  useEffect(() => {
    const handleQuotaChanged = (e) => {
      if (e.detail) {
        setQuota(e.detail);
      } else {
        setQuota(getDoctorQuota(doctorInfo.doctorId, doctorInfo.tier));
      }
    };

    window.addEventListener('doctor-ai-quota-changed', handleQuotaChanged);
    return () => {
      window.removeEventListener('doctor-ai-quota-changed', handleQuotaChanged);
    };
  }, [doctorInfo]);

  const consume = useCallback(async () => {
    const updated = await consumeAiQuery(doctorInfo.doctorId, doctorInfo.tier);
    setQuota(updated);
    return updated;
  }, [doctorInfo]);

  const refresh = useCallback(async () => {
    const synced = await syncDoctorQuotaFromFirestore(doctorInfo.doctorId, doctorInfo.tier);
    setQuota(synced);
    return synced;
  }, [doctorInfo]);

  return {
    ...quota,
    doctorId: doctorInfo.doctorId,
    tier: doctorInfo.tier,
    isPro: isProTier(doctorInfo.tier),
    basicLimit: BASIC_AI_MONTHLY_LIMIT,
    consume,
    refresh,
  };
}

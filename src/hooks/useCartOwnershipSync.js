import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartProvider';

/**
 * Custom Hook: useCartOwnershipSync
 * 
 * Responsibility: Watches for authentication identity changes (login/logout/switch)
 * and updates or clears the shopping cart ownership accordingly.
 * Extracted from App.jsx to adhere to Single Responsibility Principle.
 */
export function useCartOwnershipSync() {
  const { user, isPatient, userProfile } = useAuth();
  const { setCart, setCartMetadata, setCartOwnership } = useCart();
  
  const prevUserUidRef = useRef(undefined); // undefined = not yet initialized

  useEffect(() => {
    const prevUid = prevUserUidRef.current;
    const currUid = user?.uid ?? null;

    // Skip on first mount (Firebase Auth hasn't resolved yet)
    if (prevUid === undefined) {
      prevUserUidRef.current = currUid;
      // Still stamp ownership on first mount without clearing cart
      if (user && isPatient) {
        setCartOwnership(prev => ({
          ...prev,
          patientId: user.uid,
          supervisingPhysicianId: userProfile?.assignedPhysicianIds?.[0] ?? null,
          supervisingAdminId: null,
          source: 'patient_selected',
          recommendationId: null,
        }));
      } else if (!user) {
        setCartOwnership(prev => ({
          ...prev,
          patientId: null,
          supervisingPhysicianId: null,
          supervisingAdminId: null,
          source: 'patient_selected',
          recommendationId: null,
        }));
      }
      return;
    }

    // Only clear cart if identity actually changed (different user or login/logout)
    const identityChanged = prevUid !== currUid;
    prevUserUidRef.current = currUid;

    if (identityChanged) {
      setCart({});
      setCartMetadata({});
    }

    if (user && isPatient) {
      // Patient just authenticated — stamp ownership.
      setCartOwnership(prev => ({
        ...prev,
        patientId: user.uid,
        supervisingPhysicianId: userProfile?.assignedPhysicianIds?.[0] ?? null,
        supervisingAdminId: null,
        source: 'patient_selected',
        recommendationId: null,
      }));
    } else if (!user) {
      // Logged out — reset to anonymous defaults.
      setCartOwnership(prev => ({
        ...prev,
        patientId: null,
        supervisingPhysicianId: null,
        supervisingAdminId: null,
        source: 'patient_selected',
        recommendationId: null,
      }));
    }
  }, [user, isPatient, userProfile?.assignedPhysicianIds, setCart, setCartMetadata, setCartOwnership]);
}

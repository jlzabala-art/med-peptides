import { useState } from 'react';
import * as fb from '../firebase';
const auth = fb?.auth;
const db = fb?.db;
const functions = fb?.functions;
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { getActiveTenantForResolution } from '../utils/resolvePrice';
import { ADMIN_EMAILS } from '../context/AuthContext';

const DEFAULT_ROLE_PERMISSIONS = {
  admin: { read: true, write: true, delete: true, manageUsers: true, manageInventory: true, viewFinances: true, orderB2B: true },
  clinic: { read: true, write: true, orderB2B: true, viewFinances: false },
  doctor: { read: true, write: true, prescribe: true, orderB2B: true },
  patient: { read: true, write: false, viewFinances: false, orderB2B: false },
  wholesaler: { read: true, write: true, orderB2B: true, manageInventory: true, viewFinances: true },
  guest: { read: true, write: false, viewFinances: false, orderB2B: false }
};

export function useRegistration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * register — creates a Firebase Auth user + Firestore profile.
   * @param {string} email
   * @param {string} password
   * @param {string} fullName
   * @param {string} institution
   * @param {string} userType
   * @param {string} accountType ('customer', 'professional', 'patient', 'doctor', 'wholesaler', 'clinic', 'admin')
   * @param {object} extraFields
   * @param {array} goals
   */
  const register = async (email, password, fullName, institution, userType, accountType = 'professional', extraFields = {}, goals = []) => {
    setLoading(true);
    setError(null);
    try {
      const safeEmail = email ? email.trim() : email;
      const cred = await createUserWithEmailAndPassword(auth, safeEmail, password);
      // Update display name
      await updateProfile(cred.user, { displayName: fullName });
      // Split fullName into firstName / lastName for the canonical schema
      const nameParts = (fullName || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const isCustomer = accountType === 'customer';
      const isPatientAccount = accountType === 'patient';
      const isPhysicianAccount = accountType === 'doctor';

      // ── Check Invitations for Roles ──────────────────────────────────────────
      let invitationRoles = [];
      let invitationId = null;
      let assignedManagerId = null;
      try {
        // First check by direct inviteId from URL
        if (extraFields.inviteId) {
          const invDocRef = doc(db, 'invitations', extraFields.inviteId);
          const invSnap = await getDoc(invDocRef);
          if (invSnap.exists() && invSnap.data().status === 'pending') {
            const invData = invSnap.data();
            if (invData.role) invitationRoles = [invData.role];
            if (invData.roles) invitationRoles = invData.roles;
            assignedManagerId = invData.createdBy || null;
            invitationId = invSnap.id;
          }
        }
        
        // Fallback: check by email
        if (!invitationId) {
          const invQ = query(
            collection(db, 'invitations'),
            where('email', '==', email.trim().toLowerCase()),
            where('status', '==', 'pending')
          );
          const invSnapDocs = await getDocs(invQ);
          if (!invSnapDocs.empty) {
            const invDoc = invSnapDocs.docs[0];
            const invData = invDoc.data();
            if (invData.role) invitationRoles = [invData.role];
            if (invData.roles && invData.roles.length > 0) {
              invitationRoles = invData.roles;
            }
            assignedManagerId = invData.createdBy || null;
            invitationId = invDoc.id;
          }
        }
      } catch (err) {
        console.warn('Could not check invitations:', err);
      }

      // ── Determine role ────────────────────────────────────────────────────────
      let role = 'professional_pending';
      let professionalStatus = 'pending_review';
      
      const isAdminEmail = ADMIN_EMAILS.includes(email.trim().toLowerCase());

      if (isAdminEmail || accountType === 'admin') {
        role = 'admin';
        professionalStatus = 'approved';
      } else if (invitationRoles.length > 0) {
        role = invitationRoles[0]; // Set primary role to the first in array
        professionalStatus = 'approved'; // Pre-approved via invitation
      } else if (isCustomer || isPatientAccount) {
        // Force B2C customers to patient role for portal access
        role = 'patient';
        professionalStatus = 'not_requested';
      } else if (isPhysicianAccount) {
        role = 'doctor';
        professionalStatus = 'pending_review';
      } else if (['wholesaler', 'clinic', 'sales_agent', 'staff'].includes(accountType)) {
        role = `${accountType}_pending`;
        professionalStatus = 'pending_review';
      }

      const assignedRoles = invitationRoles.length > 0 ? invitationRoles : [role];

      // ── B2B Auto-Linking for Physician Invitations ──
      let initialPhysicianIds = [];
      if (role === 'patient' || role === 'guest') {
        try {
          const relsQ = query(
            collection(db, 'doctor_patient_relationships'),
            where('patientEmail', '==', email.trim().toLowerCase()),
            where('status', '==', 'pending')
          );
          const relSnap = await getDocs(relsQ);
          if (!relSnap.empty) {
            await Promise.all(relSnap.docs.map(async (relDoc) => {
              const relData = relDoc.data();
              const relId = relDoc.id;
              // Update relationship doc with new patient's UID and activate
              await updateDoc(doc(db, 'doctor_patient_relationships', relId), {
                patientId: cred.user.uid,
                status: 'active',
                activatedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
              // Update doctor's profile to add this patient
              const doctorRef = doc(db, 'users', relData.doctorId);
              await updateDoc(doctorRef, { assignedPatientIds: arrayUnion(cred.user.uid) });
              // Add to doctor UIDs
              initialPhysicianIds.push(relData.doctorId);
            }));
          }
        } catch (err) {
          console.error('[B2B Auto-Link] failed:', err);
        }
      }

      const baseRoleKey = role.replace('_pending', '');
      const defaultPermissions = DEFAULT_ROLE_PERMISSIONS[baseRoleKey] || DEFAULT_ROLE_PERMISSIONS.guest;

      const activeTenant = getActiveTenantForResolution();

      // ── Build role-specific data sub-document ──────────────────────────────────
      // Each role stores its unique fields under roleData[roleName] so they
      // are clearly differentiated in Firestore and easy to query/display per role.
      const buildRoleData = (roleKey, fields) => {
        const { licenseId, taxId, country, intendedUse, institution: inst } = fields;
        switch (roleKey) {
          case 'doctor':
            return {
              doctor: {
                licenseId: licenseId || '',
                country: country || '',
                institution: inst || institution || '',
                intendedUse: intendedUse || '',
                verifiedAt: null,
                verifiedBy: null,
              }
            };
          case 'clinic':
            return {
              clinic: {
                licenseId: licenseId || '',
                taxId: taxId || '',
                country: country || '',
                institution: inst || institution || '',
                verifiedAt: null,
                verifiedBy: null,
              }
            };
          case 'wholesaler':
            return {
              wholesaler: {
                taxId: taxId || '',
                country: country || '',
                institution: inst || institution || '',
                verifiedAt: null,
                verifiedBy: null,
                creditLimit: 0,
                paymentTerms: 'net30',
              }
            };
          case 'patient':
            return {
              patient: {
                goals: goals || [],
                country: country || '',
                medicalHistory: [],
                allergies: [],
                currentMedications: [],
              }
            };
          default:
            return {};
        }
      };

      const roleSpecificData = buildRoleData(baseRoleKey, extraFields);

      // Create Firestore profile
      const profile = {
        firstName,
        lastName,
        email,
        institution: institution || extraFields.institution || '',
        userType: (isCustomer || isPatientAccount) ? '' : (userType || ''),
        role,
        roles: assignedRoles,
        professionalStatus,
        permissions: defaultPermissions,
        // Top-level convenience fields
        goals: goals || [],
        country: extraFields.country || '',
        taxId: extraFields.taxId || '',      // kept top-level for billing queries
        licenseId: extraFields.licenseId || '', // kept top-level for doctor queries
        // Role-differentiated sub-document
        roleData: roleSpecificData,
        // Address fields
        phone: '',
        shippingStreet: '',
        shippingCity: '',
        shippingZip: '',
        shippingCountry: extraFields.country || '',
        billingStreet: '',
        billingCity: '',
        billingZip: '',
        billingCountry: extraFields.country || '',
        approved: (role === 'admin' || isPatientAccount || isCustomer || invitationRoles.length > 0) ? true : false,
        isVerified: (role === 'admin' || isPatientAccount || isCustomer || invitationRoles.length > 0) ? true : false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignedPhysicianIds: initialPhysicianIds,
        assignedPatientIds: [],
        assignedTenantId: activeTenant?.id || null,
        tenantId: activeTenant?.id || null,
        ownerType: activeTenant ? 'wholesaler' : null,
        ownerId: activeTenant ? (activeTenant.slug || activeTenant.id) : null,
        sourceDomain: activeTenant ? window.location.hostname : null,
        sourceTerritory: activeTenant?.territoryGeoIds?.[0] || null,
        attributionLocked: activeTenant ? true : false,
        ...(assignedManagerId && { assignedAccountManagerId: assignedManagerId }),
      };
      
      await setDoc(doc(db, 'users', cred.user.uid), profile);

      // If there was an invitation, mark it as accepted securely via Cloud Function
      if (invitationId) {
        try {
          const acceptInv = httpsCallable(functions, 'acceptInvitation');
          await acceptInv({ inviteId: invitationId });
        } catch (e) {
          console.warn('Failed to call acceptInvitation cloud function:', e);
          try {
            await updateDoc(doc(db, 'invitations', invitationId), {
              status: 'accepted',
              acceptedAt: new Date().toISOString(),
              userId: cred.user.uid
            });
          } catch (fallbackErr) {
            console.warn('Fallback invitation update failed:', fallbackErr);
          }
        }
      }
      
      setLoading(false);
      return cred;
    } catch (err) {
      setLoading(false);
      setError(err);
      throw err;
    }
  };

  return { register, loading, error };
}

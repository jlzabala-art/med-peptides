"use client";

import React, { useMemo, useState, useEffect } from 'react';
import UniversalFormDrawer from '../shared/UniversalFormDrawer';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { useToast } from '../../hooks/useToast';
import { logAction } from '../../services/auditLogger';
import { useAuth } from '../../context/AuthContext';
import { useFirestoreCollection } from '../../hooks/data/useFirestoreCollection';
import ClinicFormDrawer from './clinics/ClinicFormDrawer';

export default function UserFormDrawer({
  isOpen,
  onClose,
  user = null,
  initialMode = 'view',
  defaultRole = 'guest',
  doctors = [],
  wholesalers = [],
  onSuccess
}) {
  const { user: authUser } = useAuth();
  const { toast } = useToast();

  const isCreating = !user;
  const initialRoles = isCreating ? [defaultRole || 'guest'] : (user?.roles || (user?.role ? [user.role] : [defaultRole || 'guest']));
  
  const [currentRoles, setCurrentRoles] = useState(initialRoles);
  const [isClinicDrawerOpen, setIsClinicDrawerOpen] = useState(false);
  const { data: clinics } = useFirestoreCollection('atlas_clinics');

  // Sync state if user or modal open changes
  useEffect(() => {
    if (isOpen) {
      setCurrentRoles(initialRoles);
    }
  }, [isOpen, user, defaultRole]);

  const schema = useMemo(() => {
    const baseSchema = [
      { name: 'fullName', label: 'Full Name', type: 'text', required: true },
      { name: 'email', label: 'Email Address', type: 'email', required: true },
      { name: 'phone', label: 'Phone Number', type: 'text', required: false },
      { 
        name: 'roles', 
        label: 'Roles', 
        type: 'checkbox-group', 
        required: true,
        options: [
          { value: 'patient', label: 'Patient' },
          { value: 'doctor', label: 'Physician' },
          { value: 'wholesaler', label: 'Wholesaler' },
          { value: 'guest', label: 'Guest (B2C)' },
          { value: 'admin', label: 'Admin' }
        ]
      },
      { 
        name: 'institution', 
        label: 'Institution / Clinic', 
        type: 'searchable-select', 
        required: false,
        placeholder: 'Search clinics...',
        options: [{ value: '', label: 'None' }, ...(clinics || []).map(c => ({ value: c.id, label: c.name || c.legalName || 'Unknown Clinic' }))],
        onCreateNew: () => setIsClinicDrawerOpen(true)
      }
    ];

    if (currentRoles.includes('patient')) {
      baseSchema.push({
        name: 'doctorId',
        label: 'Assigned Physician',
        type: 'searchable-select',
        required: false,
        placeholder: 'Search physicians...',
        options: [{ value: '', label: 'None' }, ...doctors.map(d => ({ value: d.id, label: d.displayName || d.fullName || d.email }))]
      });
    }

    if (currentRoles.includes('doctor') || currentRoles.includes('patient')) {
      baseSchema.push({
        name: 'wholesalerId',
        label: 'Assigned Wholesaler',
        type: 'searchable-select',
        required: false,
        placeholder: 'Search wholesalers...',
        options: [{ value: '', label: 'None' }, ...wholesalers.map(w => ({ value: w.id, label: w.companyName || w.fullName || w.email }))]
      });
    }

    return baseSchema;
  }, [currentRoles, doctors, wholesalers, clinics]);

  const handleSubmit = async (formData) => {
    try {
      if (isCreating) {
        // Create Logic
        const selectedRoles = Array.isArray(formData.roles) && formData.roles.length > 0 ? formData.roles : [defaultRole];
        const newUser = {
          fullName: formData.fullName,
          email: formData.email.toLowerCase(),
          phone: formData.phone || '',
          role: selectedRoles[0], // legacy
          roles: selectedRoles,
          approved: true,
          createdAt: new Date().toISOString(),
          institution: formData.institution || '',
          isArchived: false,
          isDeleted: false,
          assignedDoctorIds: formData.doctorId ? [formData.doctorId] : [],
        };

        const userRef = await addDoc(collection(db, 'users'), newUser);
        const newUserId = userRef.id;

        if (formData.doctorId) {
          const docRel = {
            patientId: newUserId,
            doctorId: formData.doctorId,
            status: 'active',
            initiatedBy: 'admin',
            initiatedByRole: 'admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            activatedAt: new Date().toISOString(),
          };
          await addDoc(collection(db, 'doctor_patient_relationships'), docRel);

          const docUserRef = doc(db, 'users', formData.doctorId);
          await updateDoc(docUserRef, { assignedPatientIds: arrayUnion(newUserId) });
        }

        if (formData.wholesalerId) {
          const wsRel = {
            patientId: newUserId,
            doctorId: formData.wholesalerId,
            status: 'active',
            initiatedBy: 'admin',
            initiatedByRole: 'admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            activatedAt: new Date().toISOString(),
          };
          await addDoc(collection(db, 'doctor_patient_relationships'), wsRel);
        }

        await logAction(authUser?.uid || 'admin', 'admin', 'ADMIN_CREATE_USER', newUserId, { formData });
        toast.success(`${formData.role} created successfully.`);
      } else {
        // Update Logic
        const userRef = doc(db, 'users', user.id);
        const selectedRoles = Array.isArray(formData.roles) && formData.roles.length > 0 ? formData.roles : [defaultRole];
        
        const updates = {
          fullName: formData.fullName,
          email: formData.email.toLowerCase(),
          phone: formData.phone || '',
          role: selectedRoles[0], // legacy
          roles: selectedRoles,
          institution: formData.institution || '',
          updatedAt: new Date().toISOString(),
        };

        await updateDoc(userRef, updates);
        await logAction(authUser?.uid || 'admin', 'admin', 'ADMIN_UPDATE_USER', user.id, { updates });
        toast.success(`User updated successfully.`);
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error saving user:', err);
      toast.error(`Failed to save user details.`);
      throw err;
    }
  };

  return (
    <>
      <UniversalFormDrawer
        isOpen={isOpen}
        onClose={onClose}
        title={isCreating ? `Create New ${defaultRole}` : `User Profile`}
        schema={schema}
        initialData={user ? { ...user, fullName: user.fullName || user.displayName || '', roles: initialRoles } : { roles: [defaultRole] }}
        initialMode={initialMode}
        onSubmit={handleSubmit}
        onValuesChange={(newValues) => {
          if (newValues.roles) {
            setCurrentRoles(newValues.roles);
          }
        }}
        submitLabel={isCreating ? "Create User" : "Save Changes"}
        width="600px"
      />
      
      <ClinicFormDrawer 
        isOpen={isClinicDrawerOpen}
        onClose={() => setIsClinicDrawerOpen(false)}
        onComplete={(newClinicId) => {
          setIsClinicDrawerOpen(false);
          toast.success("Clinic created successfully. You can now select it from the dropdown.");
        }}
      />
    </>
  );
}

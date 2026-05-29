import React, { useState } from 'react';
import { collection, addDoc, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase';
import { X, UserPlus, Mail, User, Building2, Phone } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { logAction } from '../../services/auditLogger';
import { useAuth } from '../../context/AuthContext';

export default function CreateUserModal({
  isOpen,
  onClose,
  doctors,
  wholesalers,
  onCreated,
  defaultRole = 'patient',
}) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: defaultRole,
    institution: '',
    doctorId: '',
    wholesalerId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        role: defaultRole,
        fullName: '',
        email: '',
        phone: '',
        institution: '',
        doctorId: '',
        wholesalerId: '',
      }));
    }
  }, [isOpen, defaultRole]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) {
      toast.warning('Full Name and Email are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create the user document in Firestore (Simulating registration)
      // Normally they register via Firebase Auth, but if admin creates them manually:
      const newUser = {
        fullName: formData.fullName,
        email: formData.email.toLowerCase(),
        phone: formData.phone,
        role: formData.role,
        roles: [formData.role],
        approved: true,
        createdAt: new Date().toISOString(),
        institution: formData.institution || '',
        isArchived: false,
        isDeleted: false,
        assignedDoctorIds: formData.doctorId ? [formData.doctorId] : [],
      };

      const userRef = await addDoc(collection(db, 'users'), newUser);
      const newUserId = userRef.id;

      // 2. Establish Doctor Relationship
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

        // Update Doctor's assignedPatientIds
        const docUserRef = doc(db, 'users', formData.doctorId);
        await updateDoc(docUserRef, { assignedPatientIds: arrayUnion(newUserId) });
      }

      // 3. Establish Wholesaler Relationship (if any)
      if (formData.wholesalerId) {
        const wsRel = {
          patientId: newUserId,
          doctorId: formData.wholesalerId, // Relationships collection uses 'doctorId' generically for the professional side
          status: 'active',
          initiatedBy: 'admin',
          initiatedByRole: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          activatedAt: new Date().toISOString(),
        };
        await addDoc(collection(db, 'doctor_patient_relationships'), wsRel);
      }

      await logAction(user?.uid || 'admin', 'admin', 'ADMIN_CREATE_USER', newUserId, { formData });

      toast.success(
        `${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} created successfully.`
      );
      onCreated();
      onClose();
    } catch (err) {
      console.error('Error creating user:', err);
      toast.error(`Failed to create ${formData.role}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
        opacity: isOpen ? 1 : 0,
        transition: 'opacity 0.2s ease-in-out',
        pointerEvents: isOpen ? 'auto' : 'none',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          width: '100%',
          maxWidth: '450px',
          height: '100%',
          boxShadow: '-4px 0 15px rgba(0,0,0,0.1)',
          borderLeft: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-app)',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textTransform: 'capitalize',
            }}
          >
            <UserPlus size={20} /> Create New {defaultRole}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-tertiary)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <form
            id="create-patient-form"
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {/* Full Name */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  color: 'var(--color-text-primary)',
                }}
              >
                Full Name *
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '10px',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                  placeholder="e.g. Jane Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  color: 'var(--color-text-primary)',
                }}
              >
                Email Address *
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '10px',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                  placeholder="jane@example.com"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  color: 'var(--color-text-primary)',
                }}
              >
                Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '10px',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            {/* Institution / Clinic Name (Only for Doctor/Wholesaler) */}
            {defaultRole !== 'patient' && (
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {defaultRole === 'doctor' ? 'Clinic / Practice Name' : defaultRole === 'compounding_pharmacy' ? 'Pharmacy Name' : 'Company Name'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Building2
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '10px',
                      color: 'var(--text-muted)',
                    }}
                  />
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    placeholder={
                      defaultRole === 'doctor'
                        ? 'e.g. Regenerative Med Clinic'
                        : defaultRole === 'compounding_pharmacy'
                        ? 'e.g. Wellness Compounding Rx'
                        : 'e.g. Pharma Distribution LLC'
                    }
                  />
                </div>
              </div>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }} />

            {/* Link to Doctor (Only for Patients) */}
            {defaultRole === 'patient' && (
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Assign Doctor
                </label>
                <select
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'var(--color-bg-app)',
                  }}
                >
                  <option value="">-- No Doctor Assigned --</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      Dr. {doc.fullName || doc.email}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Link to Wholesaler (Only for Patients) */}
            {defaultRole === 'patient' && (
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Assign Wholesaler
                </label>
                <select
                  name="wholesalerId"
                  value={formData.wholesalerId}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'var(--color-bg-app)',
                  }}
                >
                  <option value="">-- No Wholesaler Assigned --</option>
                  {wholesalers.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.fullName || ws.institution || ws.email}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </form>
        </div>

        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            backgroundColor: 'var(--color-bg-app)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontWeight: 600,
              color: 'var(--text-main)',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-patient-form"
            disabled={isSubmitting}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: 'var(--primary)',
              color: 'white',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              textTransform: 'capitalize',
            }}
          >
            {isSubmitting ? 'Creating...' : `Create ${defaultRole}`}
          </button>
        </div>
      </div>
    </div>
  );
}

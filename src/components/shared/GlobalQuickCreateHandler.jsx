"use client";

import React, { useState, useEffect, useMemo } from 'react';
import PatientFormDrawer from '../admin/patients/PatientFormDrawer';
import UserFormDrawer from '../admin/UserFormDrawer';
import ClinicFormDrawer from '../admin/clinics/ClinicFormDrawer';
import { default as SharedUniversalFormDrawer } from './UniversalFormDrawer';
import { StandardDrawer } from '../ui';
import POForm from '../purchase/POForm';
import toast from 'react-hot-toast';
import { collection, addDoc, serverTimestamp, query, where, limit, getDocs } from 'firebase/firestore';
import * as fb from '../../firebase';
import notifier from '../../services/NotificationService';
const db = fb?.db;

// Helper to fetch basic autocomplete suggestions from Firestore
const fetchFirestoreSuggestions = async (collectionName, searchField, queryText) => {
  if (!queryText || queryText.length < 2) return [];
  try {
    // Prefix search (Case sensitive in Firestore)
    const q = query(
      collection(db, collectionName),
      where(searchField, '>=', queryText),
      where(searchField, '<=', queryText + '\uf8ff'),
      limit(10)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ label: doc.data()[searchField] || doc.id, value: doc.id }));
  } catch (err) {
    console.error('Error fetching suggestions:', err);
    return [];
  }
};

export default function GlobalQuickCreateHandler() {
  const [activeForm, setActiveForm] = useState(null);

  useEffect(() => {
    const handleOpenQuickCreate = (event) => {
      const { type } = event.detail;
      setActiveForm(type);
    };

    window.addEventListener('open-quick-create', handleOpenQuickCreate);
    return () => window.removeEventListener('open-quick-create', handleOpenQuickCreate);
  }, []);

  const handleClose = () => setActiveForm(null);

  const schemas = useMemo(() => ({
    'new-protocol': {
      title: 'Create New Protocol',
      fields: [
        { name: 'name', label: 'Protocol Name', type: 'text', required: true, fullWidth: true },
        { name: 'therapeutic_category', label: 'Therapeutic Category', type: 'select', required: true, options: [
          { value: 'Recovery', label: 'Recovery' },
          { value: 'Sleep', label: 'Sleep' },
          { value: 'Longevity', label: 'Longevity' },
          { value: 'Weight Loss', label: 'Weight Loss' },
          { value: 'Aesthetics', label: 'Aesthetics' },
          { value: 'Cognitive', label: 'Cognitive' }
        ]},
        { name: 'duration_weeks', label: 'Duration (Weeks)', type: 'number', required: true },
        { 
          name: 'primary_peptides', 
          label: 'Primary Peptides', 
          type: 'autocomplete', 
          required: false, 
          fullWidth: true,
          fetchSuggestions: async (text) => fetchFirestoreSuggestions('products', 'name', text)
        },
        { name: 'administration_frequency', label: 'Administration Frequency', type: 'select', required: true, options: [
          { value: 'Daily', label: 'Daily' },
          { value: 'Weekly', label: 'Weekly' },
          { value: 'Bi-weekly', label: 'Bi-weekly' },
          { value: 'Monthly', label: 'Monthly' }
        ]},
        { name: 'risk_level', label: 'Risk / Side Effects Level', type: 'select', required: false, options: [
          { value: 'Low', label: 'Low' },
          { value: 'Medium', label: 'Medium' },
          { value: 'High', label: 'High' }
        ]},
        { name: 'standard_dose', label: 'Standard Dose / Instructions', type: 'textarea', required: false },
        { name: 'clinical_goals', label: 'Clinical Goals (KPIs)', type: 'text', required: false, fullWidth: true },
      ]
    },

    'new-quotation': {
      title: 'Create New Quotation',
      fields: [
        { 
          name: 'client_id', 
          label: 'Client / Clinic', 
          type: 'autocomplete', 
          required: true,
          fullWidth: true,
          fetchSuggestions: async (text) => fetchFirestoreSuggestions('clinics', 'name', text)
        },
        { name: 'discount_percentage', label: 'Discount (%)', type: 'number', required: false },
        { name: 'currency', label: 'Currency', type: 'select', required: true, options: [
          { value: 'USD', label: 'USD ($)' },
          { value: 'EUR', label: 'EUR (€)' },
          { value: 'GBP', label: 'GBP (£)' }
        ]},
        { name: 'valid_until', label: 'Valid Until', type: 'text', required: true, placeholder: 'YYYY-MM-DD' },
        { name: 'terms', label: 'Terms and Conditions / Notes', type: 'textarea', required: false },
      ]
    },
    'new-invoice': {
      title: 'Create New Invoice',
      fields: [
        { 
          name: 'client_id', 
          label: 'Client / Clinic', 
          type: 'autocomplete', 
          required: true,
          fetchSuggestions: async (text) => fetchFirestoreSuggestions('clinics', 'name', text)
        },
        { 
          name: 'reference_id', 
          label: 'Linked Quotation / PO (ID)', 
          type: 'text', 
          required: false 
        },
        { name: 'amount', label: 'Total Amount', type: 'number', required: true },
        { name: 'status', label: 'Status', type: 'select', required: true, options: [
          { value: 'draft', label: 'Draft' },
          { value: 'sent', label: 'Sent' },
          { value: 'paid', label: 'Paid' }
        ]},
        { name: 'issue_date', label: 'Issue Date', type: 'text', required: true, placeholder: 'YYYY-MM-DD' },
        { name: 'due_date', label: 'Due Date', type: 'text', required: true, placeholder: 'YYYY-MM-DD' },
        { name: 'notes', label: 'General Concept / Notes', type: 'textarea', required: false },
      ]
    },
    'new-lead': {
      title: 'Create New Lead',
      fields: [
        { name: 'company_name', label: 'Company / Clinic Name', type: 'text', required: true, fullWidth: true },
        { name: 'contact_name', label: 'Contact Name', type: 'text', required: true },
        { name: 'role', label: 'Role / Title', type: 'text', required: false },
        { name: 'email', label: 'Email Address', type: 'text', required: true },
        { name: 'phone', label: 'Phone Number', type: 'text', required: false },
        { name: 'lead_source', label: 'Lead Source', type: 'select', required: true, options: [
          { value: 'web', label: 'Web' },
          { value: 'referral', label: 'Referral' },
          { value: 'event', label: 'Event' },
          { value: 'cold_call', label: 'Cold Call' },
          { value: 'linkedin', label: 'LinkedIn' }
        ]},
        { name: 'priority', label: 'Priority / Temp', type: 'select', required: true, options: [
          { value: 'cold', label: 'Cold' },
          { value: 'warm', label: 'Warm' },
          { value: 'hot', label: 'Hot' }
        ]},
        { name: 'interests', label: 'Primary Interests', type: 'text', required: false, fullWidth: true, placeholder: 'e.g. Peptides, Equipment, Consulting' },
      ]
    },
    'new-follow-up': {
      title: 'Create New Follow-up',
      fields: [
        { 
          name: 'target_lead', 
          label: 'Target Lead / Clinic', 
          type: 'autocomplete', 
          required: true,
          fullWidth: true,
          fetchSuggestions: async (text) => fetchFirestoreSuggestions('leads', 'company_name', text)
        },
        { name: 'interaction_type', label: 'Interaction Type', type: 'select', required: true, options: [
          { value: 'call', label: 'Call' },
          { value: 'email', label: 'Email' },
          { value: 'meeting', label: 'Meeting' },
          { value: 'whatsapp', label: 'WhatsApp' },
          { value: 'event', label: 'Event' }
        ]},
        { name: 'date', label: 'Date & Time', type: 'text', required: true, placeholder: 'YYYY-MM-DD HH:MM' },
        { name: 'next_step', label: 'Next Step', type: 'text', required: false, fullWidth: true },
        { name: 'next_step_date', label: 'Next Step Date', type: 'text', required: false, placeholder: 'YYYY-MM-DD' },
        { name: 'notes', label: 'Conversation Summary', type: 'textarea', required: true },
      ]
    },
    'new-message': {
      title: 'New Secure Message',
      fields: [
        { 
          name: 'recipient', 
          label: 'Recipient', 
          type: 'autocomplete', 
          required: true,
          fetchSuggestions: async (text) => fetchFirestoreSuggestions('users', 'displayName', text)
        },
        { name: 'priority', label: 'Priority', type: 'select', required: true, options: [
          { value: 'normal', label: 'Normal' },
          { value: 'high', label: 'High' },
          { value: 'urgent', label: 'Urgent' }
        ]},
        { name: 'subject', label: 'Subject', type: 'text', required: true, fullWidth: true },
        { name: 'body', label: 'Message Body', type: 'textarea', required: true },
      ]
    }
  }), []);

  // Default fallback schema for unmapped forms
  const fallbackSchema = [
    { name: 'name', label: 'Name', type: 'text', required: true }
  ];

  const renderActiveForm = () => {
    switch (activeForm) {
      case 'new-patient':
        return <PatientFormDrawer isOpen={true} onClose={handleClose} onComplete={handleClose} />;
      case 'new-doctor':
        return <UserFormDrawer isOpen={true} onClose={handleClose} onSuccess={handleClose} initialMode="edit" defaultRole="doctor" />;
      case 'new-clinic':
        return <ClinicFormDrawer isOpen={true} onClose={handleClose} onSuccess={handleClose} />;
      case 'new-purchase-order':
        return (
          <StandardDrawer isOpen={true} onClose={handleClose} title="Create Purchase Order">
            <div style={{ padding: '1rem' }}>
              <POForm onClose={handleClose} />
            </div>
          </StandardDrawer>
        );
      default:
        // Handle mapped schemas or fallback
        if (activeForm) {
          const mappedSchema = schemas[activeForm];
          return (
            <SharedUniversalFormDrawer
              isOpen={true}
              onClose={handleClose}
              title={mappedSchema ? mappedSchema.title : `Quick Create: ${activeForm}`}
              schema={mappedSchema ? mappedSchema.fields : fallbackSchema}
              initialData={{}}
              initialMode="edit"
              onSubmit={async (data) => {
                try {
                  const collectionMap = {
                    'new-protocol': 'protocols',
                    'new-prescription': 'prescriptions',
                    'new-quotation': 'quotations',
                    'new-invoice': 'invoices',
                    'new-lead': 'leads',
                    'new-follow-up': 'activities',
                    'new-message': 'secure_messages'
                  };
                  const targetCollection = collectionMap[activeForm] || 'misc_quick_creates';
                  
                  const docRef = await addDoc(collection(db, targetCollection), {
                    ...data,
                    createdAt: serverTimestamp(),
                    source: 'quick-create'
                  });
                  
                  toast.success(`${mappedSchema ? mappedSchema.title : activeForm} created successfully!`);
                  
                  // Trigger automated notifications
                  let notificationParams = null;
                  if (activeForm === 'new-prescription' && data.physician_id) {
                    notificationParams = { to: [data.physician_id, 'admin'], message: `New prescription created for patient`, type: 'prescription', link: `/doctor/prescriptions/${docRef.id}` };
                  } else if (activeForm === 'new-lead') {
                    notificationParams = { to: ['admin', 'wholeseller'], message: `New lead created: ${data.company_name}`, type: 'lead', link: `/admin/marketing` };
                  } else if (activeForm === 'new-message' && data.recipient) {
                    notificationParams = { to: data.recipient, message: `New secure message: ${data.subject}`, type: 'message' };
                  } else if (activeForm === 'new-quotation') {
                    notificationParams = { to: ['admin', 'wholeseller'], message: `New quotation created`, type: 'finance' };
                  } else if (activeForm === 'new-protocol') {
                    notificationParams = { to: ['doctor', 'admin'], message: `New clinical protocol available: ${data.name}`, type: 'protocol' };
                  }

                  if (notificationParams) {
                    notifier.send(notificationParams);
                  }
                  
                  handleClose();
                } catch (error) {
                  console.error(`Error saving ${activeForm}:`, error);
                  toast.error(`Failed to create: ${error.message}`);
                }
              }}
            />
          );
        }
        return null;
    }
  };

  return (
    <>
      {renderActiveForm()}
    </>
  );
}

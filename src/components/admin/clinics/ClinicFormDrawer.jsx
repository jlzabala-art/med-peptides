"use client";

import React, { useState } from 'react';
import UniversalFormDrawer from '../../shared/UniversalFormDrawer';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useToast } from '../../../hooks/useToast';
import { Sparkles, Loader2 } from '@/lib/icons';

const CLINIC_TYPES = [
  'Longevity Clinic', 'Functional Medicine', 'Medical Center', 
  'Anti-Aging Clinic', 'Aesthetic Clinic', 'Pharmacy', 
  'Wellness Center', 'Hospital'
];

export default function ClinicFormDrawer({ isOpen, onClose, onComplete }) {
  const { toast } = useToast();
  const [aiText, setAiText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [initialData, setInitialData] = useState({ tier: 'Bronze' });

  const schema = [
    { name: 'name', label: 'Clinic Name', type: 'text', required: true, placeholder: 'Lifespan Institute' },
    { name: 'legalName', label: 'Legal Name', type: 'text', required: false, placeholder: 'Lifespan Institute LLC' },
    { name: 'type', label: 'Clinic Type', type: 'select', required: true, options: CLINIC_TYPES.map(t => ({label: t, value: t})) },
    { name: 'tier', label: 'Tier', type: 'select', required: true, options: [
      {label: 'Bronze', value: 'Bronze'}, {label: 'Silver', value: 'Silver'}, {label: 'Gold', value: 'Gold'}
    ] },
    { name: 'country', label: 'Country', type: 'country-select', required: true, placeholder: 'USA' },
    { name: 'city', label: 'City', type: 'text', required: true, placeholder: 'Austin' },
    { name: 'address', label: 'Full Address', type: 'textarea', required: false, placeholder: '123 Main St...' },
    { name: 'email', label: 'Contact Email', type: 'email', required: true, placeholder: 'contact@clinic.com' },
    { name: 'phone', label: 'Contact Phone', type: 'text', required: false },
    { name: 'website', label: 'Website', type: 'text', required: false, placeholder: 'https://...' },
    { name: 'taxId', label: 'Tax ID / EIN', type: 'text', required: false },
    { name: 'licenseNumber', label: 'Medical License', type: 'text', required: false }
  ];

  const handleExtractAI = async () => {
    if (!aiText.trim()) return;
    setIsExtracting(true);
    try {
      // Simulate AI extraction
      const emailMatch = aiText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const phoneMatch = aiText.match(/\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/);
      const urlMatch = aiText.match(/https?:\/\/[^\s]+/);
      
      const extracted = {};
      if (emailMatch) extracted.email = emailMatch[0];
      if (phoneMatch) extracted.phone = phoneMatch[0];
      if (urlMatch) extracted.website = urlMatch[0];
      
      // Look for known clinic types in text
      const lowerText = aiText.toLowerCase();
      const matchedType = CLINIC_TYPES.find(t => lowerText.includes(t.toLowerCase()));
      if (matchedType) extracted.type = matchedType;

      const words = aiText.split('\n')[0]; // assume first line is name
      if (words && words.length < 50) {
        extracted.name = words;
      }

      setInitialData(prev => ({ ...prev, ...extracted }));
      toast.success("AI Extracted fields successfully.");
      setAiText('');
    } catch (e) {
      toast.error("Failed to extract data via AI.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = async (data) => {
    try {
      const docData = {
        ...data,
        status: 'Active',
        createdAt: serverTimestamp(),
        revenue: 0,
        patientCount: 0,
        physicianCount: 0,
        pendingApprovals: 0,
        lastActivity: new Date().toISOString().split('T')[0],
      };
      const docRef = await addDoc(collection(db, 'clinics'), docData);
      const createdClinic = { id: docRef.id, ...docData };
      if (onComplete) onComplete(createdClinic);
      onClose();
    } catch (e) {
      console.error(e);
      throw new Error('Failed to save clinic');
    }
  };

  const customHeader = (
    <div style={{ backgroundColor: 'var(--primary-light)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <Sparkles size={16} color="var(--primary)" />
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>AI Auto-fill</span>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        Paste the clinic's signature, bio, or website text. We will extract the name, email, phone, and website.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input 
          type="text" 
          value={aiText}
          onChange={e => setAiText(e.target.value)}
          placeholder="Paste clinic info here..." 
          style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
          disabled={isExtracting}
        />
        <button 
          type="button"
          onClick={handleExtractAI}
          disabled={isExtracting || !aiText.trim()}
          style={{ 
            backgroundColor: 'var(--primary)', color: '#fff', border: 'none', 
            borderRadius: '4px', padding: '0 1rem', cursor: aiText.trim() ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem'
          }}
        >
          {isExtracting ? <Loader2 size={14} className="spin" /> : 'Extract'}
        </button>
      </div>
    </div>
  );

  return (
    <UniversalFormDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Clinic"
      schema={schema}
      initialData={initialData}
      onSubmit={handleSave}
      submitLabel="Create Clinic"
      customHeader={customHeader}
    />
  );
}
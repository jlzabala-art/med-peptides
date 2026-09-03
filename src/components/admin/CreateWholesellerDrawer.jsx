"use client";

import React, { useState, useMemo } from 'react';
import { Search, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { UniversalForm } from '../shared/UniversalFormDrawer';
import { StandardDrawer } from '../ui';
import { Building2 } from 'lucide-react';
import { getAllCountries, getZonesForCountry } from '../../data/geographyZones';
import { useToast } from '../../hooks/useToast';

export default function CreateWholesellerDrawer({ isOpen = true, onClose, onSuccess }) {
  const { toast } = useToast();
  const [aiText, setAiText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  // We maintain form values at this level to dynamically update the schema
  const [formValues, setFormValues] = useState({
    rating: '5',
    type: 'Distributor',
    email: '',
    phone: '',
    companyName: ''
  });

  const countries = getAllCountries();
  const availableZones = formValues.country ? getZonesForCountry(formValues.country) : null;

  const handleExtractAI = async () => {
    if (!aiText.trim()) return;
    setIsExtracting(true);
    try {
      // Simulate AI extraction
      const emailMatch = aiText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const phoneMatch = aiText.match(/\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/);
      
      const extracted = {};
      if (emailMatch) extracted.email = emailMatch[0];
      if (phoneMatch) extracted.phone = phoneMatch[0];
      
      const words = aiText.split('\n')[0];
      if (words && words.length < 50) {
        extracted.companyName = words.trim();
      }

      setFormValues(prev => ({ ...prev, ...extracted }));
      toast.success("AI Extracted fields successfully.");
      setAiText('');
    } catch (e) {
      toast.error("Failed to extract data via AI.");
    } finally {
      setIsExtracting(false);
    }
  };

  const schema = useMemo(() => {
    const s = [
      { name: 'companyName', label: 'Company Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Phone Number', type: 'text', required: false },
      { 
        name: 'type', 
        label: 'Supplier Type', 
        type: 'select', 
        options: [
          { value: 'Manufacturer', label: 'Manufacturer' },
          { value: 'Distributor', label: 'Distributor' },
          { value: 'Compounding Pharmacy', label: 'Compounding Pharmacy' },
          { value: 'Testing Lab', label: 'Testing Lab' },
          { value: 'Raw Material Supplier', label: 'Raw Material Supplier' },
          { value: 'Packaging Supplier', label: 'Packaging Supplier' },
          { value: 'Courier', label: 'Courier' }
        ] 
      },
      {
        name: 'rating',
        label: 'Initial Performance Rating',
        type: 'select',
        options: [
          { value: '5', label: '★★★★★ (5 Stars)' },
          { value: '4', label: '★★★★☆ (4 Stars)' },
          { value: '3', label: '★★★☆☆ (3 Stars)' },
          { value: '2', label: '★★☆☆☆ (2 Stars)' },
          { value: '1', label: '★☆☆☆☆ (1 Star)' },
        ]
      },
      { name: 'buyer', label: 'Assigned Buyer', type: 'text' },
      { name: 'accountManager', label: 'Assigned Account Manager', type: 'account-manager-select' },
      { name: 'regulatoryManager', label: 'Regulatory Manager', type: 'text' },
      { name: 'logisticsManager', label: 'Logistics Manager', type: 'text' },
      { 
        name: 'country', 
        label: 'Territory Assignment (Country)', 
        type: 'select', 
        options: [{ value: '', label: 'Select a Country...' }, ...countries.map(c => ({ value: c.id, label: c.name }))] 
      }
    ];

    if (availableZones && availableZones.length > 0) {
      s.push({
        name: 'zones',
        label: 'Specific Zones/Regions',
        type: 'checkbox-group',
        options: availableZones.map(z => ({ value: z, label: z }))
      });
    }

    return s;
  }, [countries, availableZones]);

  const handleSubmit = (formData) => {
    // Zoho sync is assumed to happen in the background now by the parent or cloud function
    const payload = {
      ...formData,
      zohoSyncStatus: true,
      rating: parseInt(formData.rating || '5', 10)
    };
    onSuccess(payload);
  };

  const aiHeader = (
    <div style={{ backgroundColor: 'var(--primary-light)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <Sparkles size={16} color="var(--primary)" />
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>AI Auto-fill</span>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        Paste the supplier's signature or info to extract company name, email, and phone automatically.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input 
          type="text" 
          value={aiText}
          onChange={e => setAiText(e.target.value)}
          placeholder="Paste info here..." 
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
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Wholeseller"
      icon={Building2}
    >
      <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
        <UniversalForm
          schema={schema}
          initialData={formValues}
          onValuesChange={setFormValues}
          onSubmit={handleSubmit}
          submitLabel="Create Organization"
          initialMode="edit"
          customHeader={aiHeader}
          onCancel={onClose}
        />
      </div>
    </StandardDrawer>
  );
}
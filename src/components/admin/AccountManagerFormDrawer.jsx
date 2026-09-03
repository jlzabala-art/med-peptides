"use client";

import React, { useState } from 'react';
import UniversalFormDrawer from '../shared/UniversalFormDrawer';
import { functions } from '../../firebase';
import { httpsCallable } from 'firebase/functions';
import toast from 'react-hot-toast';
import { Sparkles, Loader2 } from '@/lib/icons';

export default function AccountManagerFormDrawer({ isOpen, onClose, onSuccess }) {
  const [aiText, setAiText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [initialData, setInitialData] = useState({ 
    role: 'account_manager',
    permissions: ['canManageOrders'] // default checked
  });

  const schema = [
    { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'John Smith' },
    { name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'john@example.com' },
    { name: 'phone', label: 'Phone Number', type: 'text', required: false },
    { name: 'role', label: 'System Role', type: 'select', required: true, options: [
      {label: 'Account Manager', value: 'account_manager'},
      {label: 'Sales Director', value: 'sales_director'}
    ] },
    { name: 'permissions', label: 'Special Permissions', type: 'checkbox-group', options: [
      {label: 'Can Modify Territories', value: 'canModifyTerritories'},
      {label: 'Can Access Analytics', value: 'canAccessAnalytics'},
      {label: 'Can Manage Orders', value: 'canManageOrders'}
    ] }
  ];

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
      
      const words = aiText.split(' ').filter(w => !w.includes('@') && !w.match(/\d/));
      if (words.length >= 2) {
        extracted.name = words[0] + ' ' + words.slice(1).join(' ');
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
      const inviteUser = httpsCallable(functions, 'inviteUser');
      
      // Parse permissions array back to booleans
      const perms = data.permissions || [];
      const claims = {
        canModifyTerritories: perms.includes('canModifyTerritories'),
        canAccessAnalytics: perms.includes('canAccessAnalytics'),
        canManageOrders: perms.includes('canManageOrders')
      };

      await inviteUser({
        email: data.email,
        displayName: data.name,
        role: data.role,
        claims
      });
      
      toast.success(`Account Manager ${data.name} invited successfully!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating manager:', error);
      throw new Error('Failed to create account manager. Please try again.');
    }
  };

  const customHeader = (
    <div style={{ backgroundColor: 'var(--primary-light)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <Sparkles size={16} color="var(--primary)" />
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>AI Auto-fill</span>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        Paste the candidate's email signature or info to automatically fill their name, email, and phone.
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
    <UniversalFormDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Account Manager"
      schema={schema}
      initialData={initialData}
      onSubmit={handleSave}
      submitLabel="Send Invitation"
      customHeader={customHeader}
    />
  );
}

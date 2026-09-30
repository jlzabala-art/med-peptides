"use client";

import React from 'react';
import { 
  FlaskConical, 
  Layers, 
  Syringe, 
  ShieldCheck, 
  FileText, 
  X, 
  Check, 
  ChevronRight 
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';

export default function MonographTabsNavigatorDrawer({
  isOpen = false,
  onClose,
  activeTab = 'overview',
  onSelectTab,
  protocolCount = 3
}) {
  if (!isOpen) return null;

  const tabs = [
    {
      id: 'overview',
      number: 1,
      name: 'Overview & Pharmacology',
      subtitle: 'Molecular profile, pharmacokinetics, half-life & specifications',
      icon: FlaskConical
    },
    {
      id: 'protocols',
      number: 2,
      name: 'Clinical Protocols',
      badge: protocolCount,
      subtitle: 'Titration schedules, duration, dosing phases & procurement',
      icon: Layers
    },
    {
      id: 'preparation',
      number: 3,
      name: 'Preparation & Reconstitution',
      subtitle: 'Interactive reconstitution guide & U-100 syringe draw math',
      icon: Syringe
    },
    {
      id: 'quality',
      number: 4,
      name: 'Quality & Verified Batch',
      subtitle: 'Batch release certificate, HPLC purity ≥99% & testing specs',
      icon: ShieldCheck
    },
    {
      id: 'references',
      number: 5,
      name: 'References & Regulatory',
      subtitle: 'FDA reference documents, PubChem identifiers & PubMed bibliography',
      icon: FileText
    }
  ];

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 0
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: '#ffffff',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: '1.25rem 1.25rem 2.5rem 1.25rem',
          boxShadow: '0 -10px 25px -5px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div style={{ width: '40px', height: '4px', background: '#cbd5e1', borderRadius: '4px', margin: '0 auto 4px auto' }} />

        {/* Drawer Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
              Clinical Monograph Navigation
            </span>
            <h3 style={{ margin: '2px 0 0 0', fontSize: '1.1rem', fontWeight: 850, color: '#003666' }}>
              Jump to Workspace Section
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: '#f1f5f9',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tabs.map(tab => {
            const isSelected = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  onSelectTab(tab.id);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: isSelected ? '1.5px solid #003666' : '1px solid #e2e8f0',
                  background: isSelected ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: isSelected ? '#003666' : '#f8fafc',
                    color: isSelected ? '#ffffff' : '#003666',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.70rem', fontWeight: 800, color: isSelected ? '#0284c7' : '#94a3b8' }}>
                        Tab {tab.number}
                      </span>
                      <strong style={{ fontSize: '0.90rem', color: isSelected ? '#003666' : '#0f172a', fontWeight: isSelected ? 850 : 750 }}>
                        {tab.name}
                      </strong>
                      {tab.badge && (
                        <span style={{
                          fontSize: '0.66rem',
                          fontWeight: 800,
                          background: isSelected ? '#003666' : '#e0f2fe',
                          color: isSelected ? '#ffffff' : '#0369a1',
                          padding: '1px 6px',
                          borderRadius: '10px'
                        }}>
                          {tab.badge}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                      {tab.subtitle}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                  {isSelected ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#003666',
                      color: '#ffffff'
                    }}>
                      <Check size={14} />
                    </span>
                  ) : (
                    <ChevronRight size={18} color="#94a3b8" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

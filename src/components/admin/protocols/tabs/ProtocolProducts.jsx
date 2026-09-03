"use client";

import React, { useState } from 'react';
import { Package, Pill, Box, Zap, ChevronDown } from '@/lib/icons';
import VialCalculator from '../VialCalculator';
import AlgoliaProductPicker from './AlgoliaProductPicker';
import { toast } from 'react-hot-toast';

export default function ProtocolProducts({ protocol, onUpdate, onProductClick }) {
  const [selectedPhaseId, setSelectedPhaseId] = useState(protocol?.phases?.[0]?.id || protocol?.phases?.[0]?.phase_key || null);
  
  // Aggregate products/items from phases
  const allItems = protocol?.phases?.flatMap(phase => phase.items || []) || [];
  const uniqueItems = [...new Set(allItems.map(i => i.product_id))];

  const handleAddProduct = (product) => {
    if (!selectedPhaseId && protocol?.phases?.length > 0) {
      setSelectedPhaseId(protocol.phases[0].id);
    }
    
    const targetPhaseId = selectedPhaseId || protocol?.phases?.[0]?.id;
    if (!targetPhaseId) {
      toast("Please create a Phase in the Treatment Plan first.");
      return;
    }

    const newPhases = protocol.phases.map((phase, index) => {
      const currentPhaseId = phase.id || phase.phase_key || `phase-${index}`;
      if (currentPhaseId === targetPhaseId) {
        // Create a new item mapped from the Algolia product
        const newItem = {
          id: Date.now().toString(),
          product_id: product.objectID || product.id,
          name: product.title || product.name,
          dosage_mg: product.vial_strength || product.mg_per_vial || 0, // default dosage
          frequency: "daily",
          // Add default fields needed by vial calculator
        };
        return {
          ...phase,
          items: [...(phase.items || []), newItem]
        };
      }
      return phase;
    });

    if (onUpdate) {
      onUpdate({ phases: newPhases });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* Header & KPI Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={24} color="var(--primary)" /> Required Products & Kits
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, maxWidth: '600px' }}>
            Determine the exact vials, supplements, and supplies needed to fulfill the entire duration of the protocol.
          </p>
        </div>
      </div>

      {/* Premium Mini KPIs for Products */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '1.25rem', borderRadius: '16px', border: '1px solid #bbf7d0', boxShadow: '0 4px 15px rgba(22, 163, 74, 0.1)' }}>
          <div style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Unique Compounds</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Pill size={24} /> {uniqueItems.length}
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', padding: '1.25rem', borderRadius: '16px', border: '1px solid #bfdbfe', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.1)' }}>
          <div style={{ color: '#2563eb', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total Deliveries</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Box size={24} /> {allItems.length}
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)', padding: '1.25rem', borderRadius: '16px', border: '1px solid #f5d0fe', boxShadow: '0 4px 15px rgba(192, 38, 211, 0.1)' }}>
          <div style={{ color: '#c026d3', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Synergy Score</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#a21caf', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={24} /> {uniqueItems.length > 2 ? 'High' : 'Normal'}
          </div>
        </div>
      </div>

      {/* Smart Product Picker Module */}
      <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: 'var(--text-main)' }}>Add Products via Algolia</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Instantly search and map exact products into the protocol phases.</p>
          </div>
          
          {protocol?.phases?.length > 0 && (
            <div style={{ minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 600 }}>Target Phase</label>
              <div style={{ position: 'relative' }}>
                <select 
                  value={selectedPhaseId || ''} 
                  onChange={(e) => setSelectedPhaseId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.5rem 0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-main)',
                    appearance: 'none',
                    fontSize: '0.95rem',
                    color: 'var(--text-main)',
                    outline: 'none',
                  }}
                >
                  {protocol.phases.map((phase, index) => {
                    const phaseId = phase.id || phase.phase_key || `phase-${index}`;
                    const phaseName = phase.name || 'Unnamed Phase';
                    return (
                      <option key={phaseId} value={phaseId}>{phaseName}</option>
                    );
                  })}
                </select>
                <ChevronDown size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </div>
          )}
        </div>
        
        <AlgoliaProductPicker onProductSelect={handleAddProduct} />
      </div>

      {/* Embedded Deep Components */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginTop: '1rem' }}>
        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
             <Package size={18} color="var(--primary)" /> Smart Vial Calculator
          </h4>
          <VialCalculator protocol={protocol} onUpdate={onUpdate} onProductClick={onProductClick} />
        </div>
      </div>
      
    </div>
  );
}

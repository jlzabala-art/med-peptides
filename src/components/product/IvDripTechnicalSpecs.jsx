"use client";

import React, { useState, useMemo } from 'react';
import { 
  Droplets, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  Thermometer, 
  CheckCircle2, 
  AlertTriangle, 
  FlaskConical, 
  Building2, 
  Activity, 
  Layers, 
  Info, 
  Search,
  Check
} from '@/lib/icons';

/**
 * IvDripTechnicalSpecs
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional Clinical Monograph Component for IV Drip & Infusion Formulations.
 * Renders the master compounded active formulation matrix, clinical infusion
 * carrier protocols, storage stability, and auxiliary vial requirements.
 */
export default function IvDripTechnicalSpecs({ 
  product, 
  selectedDose = '50 mL Infusion', 
  supplierName = 'Magenta Compounding Pharmacy', 
  lang = 'en' 
}) {
  const isEs = lang === 'es';
  const [ingredientFilter, setIngredientFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const ingredients = product?.ingredients || [];
  const totalActiveMg = product?.totalActiveMg || ingredients.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const volumeMl = product?.volume_ml || 50;
  const mgPerMl = volumeMl > 0 ? (totalActiveMg / volumeMl).toFixed(1) : '—';

  // Extract unique ingredient categories for filtering
  const categories = useMemo(() => {
    const set = new Set(ingredients.map(i => i.category).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [ingredients]);

  // Filtered ingredients
  const filteredIngredients = useMemo(() => {
    return ingredients.filter(item => {
      const matchesSearch = !ingredientFilter.trim() || 
        item.name.toLowerCase().includes(ingredientFilter.toLowerCase().trim()) ||
        (item.role && item.role.toLowerCase().includes(ingredientFilter.toLowerCase().trim()));
      
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [ingredients, ingredientFilter, selectedCategory]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', margin: '2rem 0' }}>
      
      {/* ── 1. Hero Formulation Payload Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
        color: '#ffffff',
        borderRadius: '14px',
        padding: '1.5rem',
        boxShadow: '0 4px 14px rgba(6, 78, 59, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', padding: '3px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              <Droplets size={13} style={{ color: '#a7f3d0' }} />
              <span>{isEs ? 'Formulación Parenteral Estéril' : 'Sterile Parenteral Formulation'}</span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: '-0.02em' }}>
              {product?.title || product?.name || 'Master IV Drip Formulation'}
            </h2>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: '#d1fae5', maxWidth: '650px', lineHeight: 1.5 }}>
              {product?.shortDescription || (isEs ? 'Complejo clínico intravenoso de alta biodisponibilidad para infusión parenteral.' : 'High-bioavailability clinical intravenous complex for parenteral infusion.')}
            </p>
          </div>

          {/* Quick Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: '#a7f3d0', textTransform: 'uppercase', fontWeight: 700 }}>
                {isEs ? 'Volumen' : 'Volume'}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                {volumeMl} mL
              </div>
            </div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.15)', borderRight: '1px solid rgba(255,255,255,0.15)', padding: '0 0.75rem' }}>
              <div style={{ fontSize: '0.68rem', color: '#a7f3d0', textTransform: 'uppercase', fontWeight: 700 }}>
                {isEs ? 'Carga Activa' : 'Total Actives'}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                {totalActiveMg.toLocaleString()} mg
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: '#a7f3d0', textTransform: 'uppercase', fontWeight: 700 }}>
                {isEs ? 'Concentración' : 'Density'}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                {mgPerMl} mg/mL
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Auxiliary Vial Callout (e.g. Separate Iron Vial) ── */}
      {product?.hasSeparateVial && (
        <div style={{
          backgroundColor: '#fffbeb',
          border: '1.5px solid #fde68a',
          borderRadius: '10px',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.85rem'
        }}>
          <div style={{ color: '#d97706', marginTop: '2px', flexShrink: 0 }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#92400e' }}>
              {isEs ? 'Vial Auxiliar Separado Incluido' : 'Separate Auxiliary Vial Included'}
            </h4>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: '#78350f', lineHeight: 1.5 }}>
              {product?.separateVialNotes || (isEs ? 'Incluye un vial separado de Hierro para dosificación y confirmación clínica individualizada.' : 'Includes a separate Iron vial for individualized clinical dose confirmation and slow sequential infusion.')}
            </p>
          </div>
        </div>
      )}

      {/* ── 3. Active Ingredients Master Table ── */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        {/* Table Header & Interactive Filter Bar */}
        <div style={{
          padding: '1rem 1.25rem',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FlaskConical size={18} style={{ color: '#059669' }} />
              {isEs ? 'Matriz Completa de Principios Activos' : 'Complete Active Ingredients Matrix'}
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {isEs 
                ? `${ingredients.length} principios activos combinados en solución isotónica de 50 mL` 
                : `${ingredients.length} active compounding ingredients formulated in 50 mL solution`}
            </span>
          </div>

          {/* Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                value={ingredientFilter}
                onChange={(e) => setIngredientFilter(e.target.value)}
                placeholder={isEs ? 'Filtrar ingredientes...' : 'Filter actives (e.g. Zinc, NAC)...'}
                style={{
                  padding: '5px 10px 5px 30px',
                  fontSize: '0.78rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  outline: 'none',
                  minWidth: '180px'
                }}
              />
            </div>
          </div>
        </div>

        {/* Category Pills Filter */}
        {categories.length > 2 && (
          <div style={{ padding: '0.5rem 1.25rem', backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.70rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: selectedCategory === cat ? '1px solid #059669' : '1px solid #e2e8f0',
                  backgroundColor: selectedCategory === cat ? '#ecfdf5' : '#f8fafc',
                  color: selectedCategory === cat ? '#065f46' : '#64748b',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat === 'all' ? (isEs ? 'Todos' : 'All') : cat}
              </button>
            ))}
          </div>
        )}

        {/* Ingredients Grid / Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '10px 16px', fontWeight: 700 }}>{isEs ? 'Principio Activo' : 'Active Compound'}</th>
                <th style={{ padding: '10px 16px', fontWeight: 700, textAlign: 'right', width: '140px' }}>{isEs ? 'Dosis (50 mL)' : 'Dose (50 mL)'}</th>
                <th style={{ padding: '10px 16px', fontWeight: 700, width: '160px' }}>{isEs ? 'Categoría' : 'Pharmacological Class'}</th>
                <th style={{ padding: '10px 16px', fontWeight: 700 }}>{isEs ? 'Función Terapéutica' : 'Biological Function'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredIngredients.map((item, idx) => (
                <tr 
                  key={idx}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <td style={{ padding: '10px 16px', fontWeight: 750, color: '#0f172a' }}>
                    {item.name}
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 850, color: '#065f46', fontSize: '0.88rem' }}>
                    {Number(item.amount).toLocaleString()} {item.unit || 'mg'}
                  </td>
                  <td style={{ padding: '10px 16px', color: '#64748b' }}>
                    <span style={{
                      display: 'inline-block',
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      padding: '1px 6px',
                      fontSize: '0.70rem',
                      fontWeight: 600,
                      color: '#475569'
                    }}>
                      {item.category || 'Active'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px', color: '#475569', fontSize: '0.78rem', lineHeight: 1.4 }}>
                    {item.role || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. Clinical Administration & Carrier Protocol (3-Step Guide) ── */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.25rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} style={{ color: '#0284c7' }} />
          {isEs ? 'Protocolo Clínico de Dilución e Infusión IV' : 'Clinical IV Dilution & Infusion Protocol'}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          
          {/* Step 1 */}
          <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0284c7', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              <span style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem' }}>1</span>
              <span>{isEs ? 'Dilución en Bolsa Carrier' : 'Carrier Bag Dilution'}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#0369a1', lineHeight: 1.5 }}>
              {isEs 
                ? 'Extraer los 50 mL del vial con técnica estéril y transferir a 250 mL o 500 mL de Solución Salina Normal (0.9% NaCl) o Dextrosa al 5%.' 
                : 'Aseptically transfer the 50 mL formulation into a 250 mL – 500 mL IV carrier bag of 0.9% Normal Saline (NaCl) or 5% Dextrose.'}
            </p>
          </div>

          {/* Step 2 */}
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              <span style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem' }}>2</span>
              <span>{isEs ? 'Tiempo y Tasa de Infusión' : 'Infusion Timing & Rate'}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#15803d', lineHeight: 1.5 }}>
              {isEs 
                ? 'Administrar por goteo intravenoso lento durante 45 a 60 minutos (~50–75 gotas/minuto) para evitar hipomagnesemia transitoria o náuseas.' 
                : 'Administer via slow intravenous drip over 45 – 60 minutes (~50–75 drops/min) to optimize cellular uptake and prevent vascular irritation.'}
            </p>
          </div>

          {/* Step 3 */}
          <div style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#7c3aed', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              <span style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#7c3aed', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem' }}>3</span>
              <span>{isEs ? 'Estabilidad y Almacenamiento' : 'Stability & Photoprotection'}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#6b21a8', lineHeight: 1.5 }}>
              {isEs 
                ? 'Conservar refrigerado a 2°C – 8°C protegido de la luz (fotosensibilidad de Riboflavina y Vitamina C). Infundir dentro de 4h tras diluir.' 
                : 'Store refrigerated at 2°C – 8°C protected from UV light. Compounded carrier bag must be infused within 4 hours of preparation.'}
            </p>
          </div>
        </div>
      </div>

      {/* ── 5. Compounding & Quality Certification Footer ── */}
      <div style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '0.85rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        fontSize: '0.75rem',
        color: '#64748b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Building2 size={14} style={{ color: '#0f172a' }} />
          <span>{isEs ? 'Elaborado por:' : 'Compounded by:'} <strong style={{ color: '#0f172a' }}>{supplierName}</strong> (Dubai, UAE)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600 }}>
            <ShieldCheck size={14} /> USP &lt;797&gt; Sterile Certified
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#0284c7', fontWeight: 600 }}>
            <CheckCircle2 size={14} /> COA Verified
          </span>
        </div>
      </div>

    </div>
  );
}

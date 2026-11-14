'use client';

import React, { useState } from 'react';

/**
 * Chapter 2: Complete Food List & 17-Family Matrix
 * Luxury MedTech UI for the 17 clinical food families (116 foods total),
 * with instant search, traffic light filters, and 3 viewing modes.
 */
export default function DnaFoodMatrixSection({ clinicalProfile, initialViewMode = 'fagron_matrix' }) {
  const [foodViewMode, setFoodViewMode] = useState(initialViewMode);
  const [fagronMacroGroup, setFagronMacroGroup] = useState('ALL');
  const [fagronSubfamilyFilter, setFagronSubfamilyFilter] = useState('ALL');
  const [foodTrafficFilter, setFoodTrafficFilter] = useState('all');
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [onlyDairyFreeSafe, setOnlyDairyFreeSafe] = useState(false);
  const [checkedGroceryItems, setCheckedGroceryItems] = useState({});
  const [copiedGroceryList, setCopiedGroceryList] = useState(false);

  const toggleGroceryItem = (name) => {
    setCheckedGroceryItems(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleCopyGroceryList = () => {
    const catalog = clinicalProfile?.masterFoodCatalog || [];
    const safeFoods = catalog.filter(f => f.trafficLight === 'GREEN' || (f.trafficLight === 'YELLOW' && f.ruleEn?.includes('grass-fed')));
    
    let text = `🛒 *MY GENOMIC SAFE GROCERY LIST* · Atlas Precision Health\n`;
    text += `👤 Genotype Calibrated: MCM6 GG (Dairy-Free) · FTO (Glycemic Safe)\n\n`;

    const groups = {
      '🥦 Fresh Produce & Greens': safeFoods.filter(f => f.fagronSubfamily?.toLowerCase().includes('veg') || f.fagronSubfamily?.toLowerCase().includes('green')),
      '🥩 Seafood & Pastured Proteins': safeFoods.filter(f => f.fagronSubfamily?.toLowerCase().includes('fish') || f.fagronSubfamily?.toLowerCase().includes('meat') || f.fagronSubfamily?.toLowerCase().includes('poultry')),
      '🧈 Healthy Fats & A2 Ferments': safeFoods.filter(f => f.fagronSubfamily?.toLowerCase().includes('oil') || f.nameEn?.toLowerCase().includes('ghee') || f.nameEn?.toLowerCase().includes('parmigiano')),
      '🌿 Spices, Teas & Pantry': safeFoods.filter(f => f.fagronSubfamily?.toLowerCase().includes('spice') || f.fagronSubfamily?.toLowerCase().includes('tea') || f.fagronSubfamily?.toLowerCase().includes('seed'))
    };

    Object.entries(groups).forEach(([grpTitle, items]) => {
      if (items.length > 0) {
        text += `*${grpTitle}*\n`;
        items.slice(0, 8).forEach(item => {
          text += `  • [ ] ${item.nameEn} (${item.portionRuleEn || 'Eat freely'})\n`;
        });
        text += `\n`;
      }
    });

    text += `⚠️ *STRICT AVOIDANCE AT SUPERMARKET:* Cow's milk, Processed soft cheeses, Soy lecithin, Refined seed oils.`;

    navigator.clipboard.writeText(text);
    setCopiedGroceryList(true);
    setTimeout(() => setCopiedGroceryList(false), 3500);
  };

  if (!clinicalProfile) return null;

  return (
    <div
      id="fagron-food-matrix-section"
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '1.75rem',
        boxShadow: '0 4px 20px rgba(0, 54, 102, 0.04)'
      }}
    >
      {/* Header & Mode Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CHAPTER 2 · COMPLETE FOOD LIST (SUPERMARKET &amp; KITCHEN GUIDE)
            </span>
            <span style={{ fontSize: '0.70rem', fontWeight: 700, backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>
              17 Families · 4 Groups · {clinicalProfile.masterFoodCatalog?.length || 116} Foods Classified
            </span>
          </div>
          <h3 style={{ fontSize: '1.30rem', fontWeight: 850, color: '#003666', margin: '2px 0 4px 0' }}>
            Personalized Food List &amp; 17-Family Traffic Light
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
            Every food classified into 🟢 Eat Freely, 🟡 Normal Portion (1-2x/week or rule), and 🔴 Avoid for your DNA.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setFoodViewMode('fagron_matrix')}
            style={{
              padding: '6px 14px',
              fontSize: '0.75rem',
              fontWeight: 750,
              borderRadius: '6px',
              border: 'none',
              backgroundColor: foodViewMode === 'fagron_matrix' ? '#ffffff' : 'transparent',
              color: foodViewMode === 'fagron_matrix' ? '#003666' : '#64748b',
              boxShadow: foodViewMode === 'fagron_matrix' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer'
            }}
          >
            17-Family Matrix (At a Glance)
          </button>
          <button
            type="button"
            onClick={() => setFoodViewMode('master_catalog')}
            style={{
              padding: '6px 14px',
              fontSize: '0.75rem',
              fontWeight: 750,
              borderRadius: '6px',
              border: 'none',
              backgroundColor: foodViewMode === 'master_catalog' ? '#ffffff' : 'transparent',
              color: foodViewMode === 'master_catalog' ? '#003666' : '#64748b',
              boxShadow: foodViewMode === 'master_catalog' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer'
            }}
          >
            All {clinicalProfile.masterFoodCatalog?.length || 116} Foods Explorer
          </button>
          <button
            type="button"
            onClick={() => setFoodViewMode('summary')}
            style={{
              padding: '6px 14px',
              fontSize: '0.75rem',
              fontWeight: 750,
              borderRadius: '6px',
              border: 'none',
              backgroundColor: foodViewMode === 'summary' ? '#ffffff' : 'transparent',
              color: foodViewMode === 'summary' ? '#003666' : '#64748b',
              boxShadow: foodViewMode === 'summary' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer'
            }}
          >
            Top Clinical Highlights
          </button>
          <button
            type="button"
            onClick={() => setFoodViewMode('grocery_list')}
            style={{
              padding: '6px 14px',
              fontSize: '0.75rem',
              fontWeight: 750,
              borderRadius: '6px',
              border: 'none',
              backgroundColor: foodViewMode === 'grocery_list' ? '#0d9488' : 'transparent',
              color: foodViewMode === 'grocery_list' ? '#ffffff' : '#64748b',
              boxShadow: foodViewMode === 'grocery_list' ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
              cursor: 'pointer'
            }}
          >
            🛒 Grocery Shopping List
          </button>
        </div>
      </div>

      {/* Universal Quick Action & Search Strip (Golden Rule #7 & #23) */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '1.25rem',
          padding: '10px 14px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <input
            type="text"
            value={foodSearchQuery}
            onChange={(e) => {
              setFoodSearchQuery(e.target.value);
              if (e.target.value && foodViewMode !== 'master_catalog') {
                setFoodViewMode('master_catalog');
              }
            }}
            placeholder="Quick search any ingredient (e.g. avocado, salmon, oats, feta, ghee)..."
            style={{
              width: '100%',
              padding: '7px 28px 7px 10px',
              fontSize: '0.80rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#0f172a'
            }}
          />
          {foodSearchQuery && (
            <button
              type="button"
              onClick={() => setFoodSearchQuery('')}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'transparent',
                color: '#64748b',
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              ×
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setOnlyDairyFreeSafe(prev => !prev);
            setFoodViewMode('master_catalog');
          }}
          style={{
            padding: '6px 12px',
            fontSize: '0.74rem',
            fontWeight: 700,
            borderRadius: '6px',
            border: '1px solid',
            borderColor: onlyDairyFreeSafe ? '#0d9488' : '#cbd5e1',
            backgroundColor: onlyDairyFreeSafe ? '#f0fdfa' : '#ffffff',
            color: onlyDairyFreeSafe ? '#0f766e' : '#475569',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <span>🥛 {onlyDairyFreeSafe ? '✓ Dairy-Free Safe Only' : 'Dairy-Free Safe Only'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setFoodTrafficFilter(foodTrafficFilter === 'green' ? 'all' : 'green');
            setFoodViewMode('master_catalog');
          }}
          style={{
            padding: '6px 12px',
            fontSize: '0.74rem',
            fontWeight: 700,
            borderRadius: '6px',
            border: '1px solid',
            borderColor: foodTrafficFilter === 'green' ? '#16a34a' : '#cbd5e1',
            backgroundColor: foodTrafficFilter === 'green' ? '#f0fdf4' : '#ffffff',
            color: foodTrafficFilter === 'green' ? '#15803d' : '#475569',
            cursor: 'pointer'
          }}
        >
          🟢 Eat Freely Only
        </button>
      </div>

      {foodViewMode === 'fagron_matrix' ? (
        <div>
          {/* Macro-Group Filter Bar */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
            {[
              { id: 'ALL', label: 'All 17 Families (4 Groups)' },
              { id: 'CARBO+', label: '🌾 Group 1: CARBO+ (5 Families)' },
              { id: 'PROTEIN+', label: '🥩 Group 2: PROTEIN+ (5 Families)' },
              { id: 'LIPID+', label: '🫒 Group 3: LIPID+ (2 Families)' },
              { id: 'EXTRAS', label: '🍵 Group 4: EXTRAS (5 Families)' }
            ].map(grp => (
              <button
                key={grp.id}
                type="button"
                onClick={() => setFagronMacroGroup(grp.id)}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 750,
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: fagronMacroGroup === grp.id ? '#003666' : '#cbd5e1',
                  backgroundColor: fagronMacroGroup === grp.id ? '#003666' : '#ffffff',
                  color: fagronMacroGroup === grp.id ? '#ffffff' : '#475569',
                  cursor: 'pointer'
                }}
              >
                {grp.label}
              </button>
            ))}
          </div>

          {/* 17-Family Matrix */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(clinicalProfile.fagron17SubfamilyMatrix || [])
              .filter(fam => fagronMacroGroup === 'ALL' || fam.macroGroup === fagronMacroGroup)
              .map((fam) => (
                <div
                  key={fam.code}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      padding: '8px 14px',
                      borderBottom: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.70rem', fontWeight: 800, backgroundColor: '#003666', color: '#ffffff', padding: '2px 7px', borderRadius: '4px' }}>
                        {fam.code} · {fam.macroGroup}
                      </span>
                      <strong style={{ fontSize: '0.90rem', color: '#0f172a' }}>{fam.familyEn}</strong>
                      <span style={{ fontSize: '0.76rem', color: '#64748b' }}>({fam.familyEs})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFagronMacroGroup('ALL');
                        setFagronSubfamilyFilter(fam.code);
                        setFoodViewMode('master_catalog');
                      }}
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#0d9488',
                        backgroundColor: '#f0fdfa',
                        border: '1px solid #99f6e4',
                        borderRadius: '5px',
                        padding: '3px 9px',
                        cursor: 'pointer'
                      }}
                    >
                      Inspect {fam.totalCount} items →
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0' }}>
                    {/* Green Column */}
                    <div style={{ padding: '10px 14px', backgroundColor: '#f0fdf4', borderRight: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#166534', marginBottom: '4px', textTransform: 'uppercase' }}>
                        🟢 EAT FREELY ({fam.greenFoods.length})
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#14532d', lineHeight: 1.45 }}>
                        {fam.greenFoods.length > 0
                          ? fam.greenFoods.map(f => f.nameEn.split(' (')[0]).join(' • ')
                          : 'None in this group (see Moderate or Avoid)'}
                      </div>
                    </div>

                    {/* Amber Column */}
                    <div style={{ padding: '10px 14px', backgroundColor: '#fffbeb', borderRight: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#92400e', marginBottom: '4px', textTransform: 'uppercase' }}>
                        🟡 NORMAL PORTION / 1-2x WK ({fam.amberFoods.length})
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#78350f', lineHeight: 1.45 }}>
                        {fam.amberFoods.length > 0
                          ? fam.amberFoods.map(f => f.nameEn.split(' (')[0]).join(' • ')
                          : 'No special portion restrictions'}
                      </div>
                    </div>

                    {/* Red Column */}
                    <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2' }}>
                      <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#991b1b', marginBottom: '4px', textTransform: 'uppercase' }}>
                        🔴 AVOID ({fam.redFoods.length})
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#7f1d1d', lineHeight: 1.45 }}>
                        {fam.redFoods.length > 0
                          ? fam.redFoods.map(f => f.nameEn.split(' (')[0]).join(' • ')
                          : 'None excluded'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : foodViewMode === 'summary' ? (
        <>
          {/* Summary Filters */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {[
              { id: 'all', label: 'All Items' },
              { id: 'green', label: '🟢 Superfoods' },
              { id: 'yellow', label: '🟡 Caution' },
              { id: 'red', label: '🔴 Strict Exclusions' }
            ].map((flt) => (
              <button
                key={flt.id}
                type="button"
                onClick={() => setFoodTrafficFilter(flt.id)}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.76rem',
                  fontWeight: 750,
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: foodTrafficFilter === flt.id ? '#0d9488' : '#cbd5e1',
                  backgroundColor: foodTrafficFilter === flt.id ? '#f0fdfa' : '#ffffff',
                  color: foodTrafficFilter === flt.id ? '#0f766e' : '#475569',
                  cursor: 'pointer'
                }}
              >
                {flt.label}
              </button>
            ))}
          </div>

          {/* Summary Traffic Light Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {/* Green Superfoods */}
            {(foodTrafficFilter === 'all' || foodTrafficFilter === 'green') && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🟢</span>
                  <div>
                    <strong style={{ fontSize: '0.92rem', color: '#166534', fontWeight: 850, display: 'block' }}>
                      MEDICINE SUPERFOODS (Always Include)
                    </strong>
                    <span style={{ fontSize: '0.70rem', color: '#15803d' }}>Genetically targeted therapeutic food allies</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {clinicalProfile.foodTrafficLight?.greenSuperfoods?.map((food, idx) => (
                    <div key={idx} style={{ backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                        <strong style={{ fontSize: '0.82rem', color: '#14532d' }}>{food.name}</strong>
                        <span style={{ fontSize: '0.66rem', fontWeight: 700, backgroundColor: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '3px' }}>
                          {food.geneTarget}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '2px' }}>
                        <em>Active:</em> {food.activeCompound}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#166534', marginTop: '4px', lineHeight: 1.4 }}>
                        {food.benefitEn}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Yellow Caution */}
            {(foodTrafficFilter === 'all' || foodTrafficFilter === 'yellow') && (
              <div style={{ backgroundColor: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🟡</span>
                  <div>
                    <strong style={{ fontSize: '0.92rem', color: '#92400e', fontWeight: 850, display: 'block' }}>
                      CONSUME WITH CAUTION (Portion &amp; Time Rules)
                    </strong>
                    <span style={{ fontSize: '0.70rem', color: '#b45309' }}>Requires specific timing or culinary preparation</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {clinicalProfile.foodTrafficLight?.yellowCaution?.map((item, idx) => (
                    <div key={idx} style={{ backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #fef08a' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                        <strong style={{ fontSize: '0.82rem', color: '#78350f' }}>{item.name}</strong>
                        <span style={{ fontSize: '0.66rem', fontWeight: 700, backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '3px' }}>
                          {item.geneTarget}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#92400e', marginTop: '4px', lineHeight: 1.4 }}>
                        <strong>Rule:</strong> {item.conditionEn}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Red Strict Exclusions */}
            {(foodTrafficFilter === 'all' || foodTrafficFilter === 'red') && (
              <div style={{ backgroundColor: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🔴</span>
                  <div>
                    <strong style={{ fontSize: '0.92rem', color: '#991b1b', fontWeight: 850, display: 'block' }}>
                      STRICT EXCLUSIONS (Genetically Harmful)
                    </strong>
                    <span style={{ fontSize: '0.70rem', color: '#dc2626' }}>Strictly contraindicate or eliminate from diet</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {clinicalProfile.foodTrafficLight?.redStrictExclusions?.map((item, idx) => (
                    <div key={idx} style={{ backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #fecaca' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                        <strong style={{ fontSize: '0.82rem', color: '#7f1d1d' }}>{item.name}</strong>
                        <span style={{ fontSize: '0.66rem', fontWeight: 700, backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '3px' }}>
                          {item.geneTarget}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#991b1b', marginTop: '4px', lineHeight: 1.4 }}>
                        <strong>Hazard:</strong> {item.hazardEn}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : foodViewMode === 'grocery_list' ? (
        /* 🛒 Supermarket Safe Shopping List Mode (Mobile-First Rule #23) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Action & Info Banner */}
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: '#f0fdfa',
              border: '1px solid #ccfbf1',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.1rem' }}>🛒</span>
                <strong style={{ fontSize: '0.94rem', color: '#0f766e', fontWeight: 800 }}>
                  Genomically Safe Supermarket Shopping Guide
                </strong>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: '#ccfbf1', color: '#115e59', padding: '2px 8px', borderRadius: '12px' }}>
                  Mobile-Optimized Checklist
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#134e4a' }}>
                Tap items to cross them off your basket while shopping. Zero commercial cow dairy, zero inflammatory seed oils.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleCopyGroceryList}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(13,148,136,0.25)'
                }}
              >
                <span>{copiedGroceryList ? 'Copied to Clipboard ✓' : '📲 Copy to WhatsApp'}</span>
              </button>

              {Object.values(checkedGroceryItems).some(Boolean) && (
                <button
                  type="button"
                  onClick={() => setCheckedGroceryItems({})}
                  style={{
                    padding: '7px 12px',
                    backgroundColor: '#ffffff',
                    color: '#64748b',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Clear Checks
                </button>
              )}
            </div>
          </div>

          {/* Supermarket Aisles Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {[
              {
                id: 'produce',
                icon: '🥦',
                title: 'Aisle 1: Fresh Produce & Organic Greens',
                subtitle: 'High natural folate & antioxidant density',
                filter: (f) => f.trafficLight === 'GREEN' && (f.fagronSubfamily?.toLowerCase().includes('veg') || f.fagronSubfamily?.toLowerCase().includes('green') || f.fagronSubfamily?.toLowerCase().includes('cruc') || f.fagronSubfamily?.toLowerCase().includes('allium'))
              },
              {
                id: 'protein',
                icon: '🥩',
                title: 'Aisle 2: Wild Fish & Pastured Proteins',
                subtitle: 'High omega-3 & complete amino acid profile',
                filter: (f) => f.trafficLight === 'GREEN' && (f.fagronSubfamily?.toLowerCase().includes('fish') || f.fagronSubfamily?.toLowerCase().includes('meat') || f.fagronSubfamily?.toLowerCase().includes('poultry') || f.fagronSubfamily?.toLowerCase().includes('egg'))
              },
              {
                id: 'fats',
                icon: '🧈',
                title: 'Aisle 3: Clarified Fats & A2 Fermented Dairy',
                subtitle: 'Zero A1 beta-casein · 100% lactose-free Ghee',
                filter: (f) => (f.trafficLight === 'GREEN' || f.trafficLight === 'YELLOW') && (f.fagronSubfamily?.toLowerCase().includes('oil') || f.nameEn?.toLowerCase().includes('ghee') || f.nameEn?.toLowerCase().includes('parmigiano') || f.nameEn?.toLowerCase().includes('kefir') || f.nameEn?.toLowerCase().includes('avocado'))
              },
              {
                id: 'pantry',
                icon: '🌿',
                title: 'Aisle 4: Spices, Teas & Gluten-Free Seeds',
                subtitle: 'AMPK modulators & gut barrier support',
                filter: (f) => f.trafficLight === 'GREEN' && (f.fagronSubfamily?.toLowerCase().includes('spice') || f.fagronSubfamily?.toLowerCase().includes('tea') || f.fagronSubfamily?.toLowerCase().includes('seed') || f.fagronSubfamily?.toLowerCase().includes('grain'))
              }
            ].map(aisle => {
              const aisleItems = (clinicalProfile.masterFoodCatalog || []).filter(aisle.filter);
              return (
                <div
                  key={aisle.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{aisle.icon}</span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                        {aisle.title}
                      </h4>
                      <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                        {aisle.subtitle} ({aisleItems.length} items)
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {aisleItems.slice(0, 10).map((food, idx) => {
                      const isChecked = !!checkedGroceryItems[food.nameEn];
                      return (
                        <label
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            backgroundColor: isChecked ? '#f1f5f9' : '#f8fafc',
                            border: isChecked ? '1px solid #cbd5e1' : '1px solid #e2e8f0',
                            cursor: 'pointer',
                            minHeight: '44px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleGroceryItem(food.nameEn)}
                            style={{
                              width: '18px',
                              height: '18px',
                              cursor: 'pointer',
                              accentColor: '#0d9488'
                            }}
                          />
                          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div
                                style={{
                                  fontSize: '0.82rem',
                                  fontWeight: 700,
                                  color: isChecked ? '#94a3b8' : '#0f172a',
                                  textDecoration: isChecked ? 'line-through' : 'none'
                                }}
                              >
                                {food.nameEn}
                              </div>
                              <div style={{ fontSize: '0.68rem', color: isChecked ? '#cbd5e1' : '#64748b' }}>
                                {food.portionRuleEn || 'Eat freely in meals'}
                              </div>
                            </div>
                            <span
                              style={{
                                fontSize: '0.64rem',
                                fontWeight: 700,
                                backgroundColor: isChecked ? '#e2e8f0' : '#f0fdf4',
                                color: isChecked ? '#94a3b8' : '#166534',
                                border: '1px solid',
                                borderColor: isChecked ? '#cbd5e1' : '#bbf7d0',
                                padding: '1px 6px',
                                borderRadius: '4px'
                              }}
                            >
                              Safe
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Master Food Catalog Explorer (All 116 Foods) */
        <div>
          {/* Search + Traffic Light Filter */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px', alignItems: 'center' }}>
            <div style={{ flex: '1 1 280px', position: 'relative' }}>
              <input
                type="text"
                value={foodSearchQuery}
                onChange={(e) => setFoodSearchQuery(e.target.value)}
                placeholder="Search any of the 116 foods in English or Spanish (e.g. salmon, oats, feta, honey, avocado)..."
                style={{
                  width: '100%',
                  padding: '9px 32px 9px 12px',
                  fontSize: '0.82rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  color: '#0f172a'
                }}
              />
              {foodSearchQuery && (
                <button
                  type="button"
                  onClick={() => setFoodSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontWeight: 800
                  }}
                >
                  ×
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All Colors' },
                { id: 'green', label: '🟢 Eat Freely' },
                { id: 'yellow', label: '🟡 Moderate / Rule' },
                { id: 'red', label: '🔴 Avoid' }
              ].map(tl => (
                <button
                  key={tl.id}
                  type="button"
                  onClick={() => setFoodTrafficFilter(tl.id)}
                  style={{
                    padding: '7px 11px',
                    fontSize: '0.74rem',
                    fontWeight: 750,
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: foodTrafficFilter === tl.id ? '#0d9488' : '#cbd5e1',
                    backgroundColor: foodTrafficFilter === tl.id ? '#f0fdfa' : '#ffffff',
                    color: foodTrafficFilter === tl.id ? '#0f766e' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  {tl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Macro-Group Filters */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
            {[
              { id: 'ALL', label: 'All 4 Macro-Groups' },
              { id: 'CARBO+', label: '🌾 3.1 CARBO+' },
              { id: 'PROTEIN+', label: '🥩 3.2 PROTEIN+' },
              { id: 'LIPID+', label: '🫒 3.3 LIPID+' },
              { id: 'EXTRAS', label: '🍵 3.4 EXTRAS' }
            ].map(grp => (
              <button
                key={grp.id}
                type="button"
                onClick={() => {
                  setFagronMacroGroup(grp.id);
                  setFagronSubfamilyFilter('ALL');
                }}
                style={{
                  padding: '5px 11px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: fagronMacroGroup === grp.id ? '#003666' : '#cbd5e1',
                  backgroundColor: fagronMacroGroup === grp.id ? '#003666' : '#ffffff',
                  color: fagronMacroGroup === grp.id ? '#ffffff' : '#475569',
                  cursor: 'pointer'
                }}
              >
                {grp.label}
              </button>
            ))}
          </div>

          {/* 17 Sub-Family Filter Pills */}
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
            <button
              type="button"
              onClick={() => setFagronSubfamilyFilter('ALL')}
              style={{
                padding: '4px 10px',
                fontSize: '0.71rem',
                fontWeight: 750,
                borderRadius: '999px',
                border: '1px solid',
                borderColor: fagronSubfamilyFilter === 'ALL' ? '#0d9488' : '#cbd5e1',
                backgroundColor: fagronSubfamilyFilter === 'ALL' ? '#f0fdfa' : '#ffffff',
                color: fagronSubfamilyFilter === 'ALL' ? '#0f766e' : '#64748b',
                cursor: 'pointer'
              }}
            >
              All 17 Sub-Families
            </button>
            {(clinicalProfile.fagron17SubfamilyMatrix || [])
              .filter(sf => fagronMacroGroup === 'ALL' || sf.macroGroup === fagronMacroGroup)
              .map(sf => (
                <button
                  key={sf.code}
                  type="button"
                  onClick={() => setFagronSubfamilyFilter(sf.code)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.71rem',
                    fontWeight: 700,
                    borderRadius: '999px',
                    border: '1px solid',
                    borderColor: fagronSubfamilyFilter === sf.code ? '#0d9488' : '#e2e8f0',
                    backgroundColor: fagronSubfamilyFilter === sf.code ? '#f0fdfa' : '#f8fafc',
                    color: fagronSubfamilyFilter === sf.code ? '#0f766e' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  {sf.code} {sf.familyEn} ({sf.totalCount})
                </button>
              ))}
          </div>

          {/* Food Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {(clinicalProfile.masterFoodCatalog || [])
              .filter(f => fagronMacroGroup === 'ALL' || f.categoryGroup === fagronMacroGroup)
              .filter(f => fagronSubfamilyFilter === 'ALL' || f.fagronCode === fagronSubfamilyFilter)
              .filter(f => {
                if (foodTrafficFilter === 'all') return true;
                if (foodTrafficFilter === 'green') return f.trafficLight === 'GREEN';
                if (foodTrafficFilter === 'yellow') return f.trafficLight === 'AMBER';
                if (foodTrafficFilter === 'red') return f.trafficLight === 'RED';
                return true;
              })
              .filter(f => {
                if (!onlyDairyFreeSafe) return true;
                const isBovine = (
                  f.fagronCode === '2.4' ||
                  (f.fagronSubfamily && f.fagronSubfamily.toLowerCase().includes('dairy')) ||
                  (f.nameEn && (f.nameEn.toLowerCase().includes('cow') || f.nameEn.toLowerCase().includes('cheese') || f.nameEn.toLowerCase().includes('butter') || f.nameEn.toLowerCase().includes('cream')))
                );
                return !isBovine;
              })
              .filter(f => {
                if (!foodSearchQuery.trim()) return true;
                const q = foodSearchQuery.toLowerCase();
                return (
                  f.nameEn.toLowerCase().includes(q) ||
                  f.nameEs.toLowerCase().includes(q) ||
                  f.fagronSubfamily.toLowerCase().includes(q) ||
                  f.fagronCode.toLowerCase().includes(q)
                );
              })
              .map(f => {
                const borderC = f.trafficLight === 'GREEN' ? '#86efac' : f.trafficLight === 'AMBER' ? '#fde68a' : '#fca5a5';
                const badgeBg = f.trafficLight === 'GREEN' ? '#dcfce7' : f.trafficLight === 'AMBER' ? '#fef3c7' : '#fee2e2';
                const badgeColor = f.trafficLight === 'GREEN' ? '#166534' : f.trafficLight === 'AMBER' ? '#92400e' : '#991b1b';
                const label = f.trafficLight === 'GREEN' ? '🟢 EAT FREELY' : f.trafficLight === 'AMBER' ? '🟡 MODERATE (1-2x/WK)' : '🔴 AVOID';

                return (
                  <div
                    key={f.id}
                    style={{
                      backgroundColor: '#ffffff',
                      border: `1.5px solid ${borderC}`,
                      borderRadius: '10px',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.67rem', fontWeight: 800, color: '#64748b' }}>
                          {f.fagronCode} · {f.fagronSubfamily}
                        </span>
                        <span style={{ fontSize: '0.66rem', fontWeight: 800, backgroundColor: badgeBg, color: badgeColor, padding: '2px 7px', borderRadius: '4px' }}>
                          {label}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.90rem', fontWeight: 850, color: '#0f172a', marginBottom: '2px' }}>
                        {f.nameEn}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', fontStyle: 'italic', marginBottom: '8px' }}>
                        {f.nameEs}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px', fontSize: '0.74rem', color: '#334155', lineHeight: 1.45 }}>
                      <div><strong>Portion / Rule:</strong> {f.portionRuleEn}</div>
                      {f.activeNutrientEn && <div style={{ color: '#0f766e', marginTop: '2px' }}><strong>Nutrient:</strong> {f.activeNutrientEn}</div>}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

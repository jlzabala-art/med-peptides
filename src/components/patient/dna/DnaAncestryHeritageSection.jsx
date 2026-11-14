"use client";

import React from 'react';
import {
  Globe,
  Sparkles,
  ShieldCheck,
  Flame,
  Utensils,
  Sun,
  Clock,
  Compass,
  ArrowRight,
  Leaf,
  Layers,
  HeartPulse,
  Dna
} from 'lucide-react';

/**
 * DnaAncestryHeritageSection
 *
 * Google Cloud UX component rendering Ancestral Nutrigenomics & Evolutionary Metabolic Compatibility.
 * Connects 24Genetics autosomal ancestry + maternal haplogroup (M2a'b) with clinical nutritional adaptations.
 */
export default function DnaAncestryHeritageSection({ clinicalProfile }) {
  if (!clinicalProfile) return null;

  const ancestry = clinicalProfile.ancestralMetabolicProfile || {};
  const patient = clinicalProfile.patient || {};
  const dairy = ancestry.dairyAdaptation || {};
  const carbs = ancestry.carbohydrateAdaptation || {};
  const spices = ancestry.spiceMatrix || {};
  const mito = ancestry.mitochondrialProfile || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* ── Top Executive Banner ── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #dadce0',
          padding: '20px',
          boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1a73e8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                CHAPTER 2 · ANCESTRAL NUTRIGENOMICS & METABOLIC HERITAGE
              </span>
              <span style={{ fontSize: '0.64rem', fontWeight: 600, color: '#137333', backgroundColor: '#e6f4ea', border: '1px solid #ceead6', padding: '1px 6px', borderRadius: '4px' }}>
                24Genetics Bio-Historical Sequencing
              </span>
            </div>
            <h3 style={{ fontSize: '1.20rem', fontWeight: 600, color: '#202124', margin: '3px 0 0 0' }}>
              Your Evolutionary Metabolic Blueprint
            </h3>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#1a73e8', backgroundColor: '#e8f0fe', padding: '4px 10px', borderRadius: '4px', border: '1px solid #d2e3fc', fontWeight: 600 }}>
            Lineage: <strong style={{ color: '#1a73e8' }}>Haplogroup {ancestry.maternalHaplogroup || "M2a'b"}</strong> · Indus Basin
          </span>
        </div>

        <p style={{ margin: 0, fontSize: '0.82rem', color: '#3c4043', lineHeight: 1.6 }}>
          {ancestry.clinicalSynthesisEn}
        </p>
      </div>

      {/* ── 3 Key Ancestral Biomarkers Cards ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '12px'
        }}
      >
        {/* Card 1: Geographic Origins */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #dadce0',
            borderLeft: '4px solid #1a73e8',
            borderRadius: '6px',
            padding: '14px',
            boxShadow: '0 1px 2px rgba(60,64,67,0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Globe size={15} style={{ color: '#1a73e8' }} />
            <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#1a73e8', textTransform: 'uppercase' }}>
              Autosomal Origins (800 Years)
            </span>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 600, color: '#202124' }}>
            80.61% Indian Subcontinent
          </div>
          <div style={{ fontSize: '0.74rem', color: '#5f6368', marginTop: '4px', lineHeight: 1.45 }}>
            60.2% Andhra Pradesh (Telugu/Dravidian) · 9.7% Sri Lanka · 5.9% Indus Valley
          </div>
        </div>

        {/* Card 2: Maternal Mitochondrial Lineage */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #dadce0',
            borderLeft: '4px solid #137333',
            borderRadius: '6px',
            padding: '14px',
            boxShadow: '0 1px 2px rgba(60,64,67,0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Compass size={15} style={{ color: '#137333' }} />
            <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#137333', textTransform: 'uppercase' }}>
              Maternal Lineage (mtDNA)
            </span>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 600, color: '#202124' }}>
            Haplogroup M2a&apos;b
          </div>
          <div style={{ fontSize: '0.74rem', color: '#5f6368', marginTop: '4px', lineHeight: 1.45 }}>
            Eurasian Out-of-Africa Coastal Migration (~49,590 BP) · High mitochondrial endurance
          </div>
        </div>

        {/* Card 3: Deep Archaeological Heritage */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #dadce0',
            borderLeft: '4px solid #f29900',
            borderRadius: '6px',
            padding: '14px',
            boxShadow: '0 1px 2px rgba(60,64,67,0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Layers size={15} style={{ color: '#b06000' }} />
            <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#b06000', textTransform: 'uppercase' }}>
              Archaeological Agrarian Roots
            </span>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 600, color: '#202124' }}>
            Harappan & Indus Valley (32.8%)
          </div>
          <div style={{ fontSize: '0.74rem', color: '#5f6368', marginTop: '4px', lineHeight: 1.45 }}>
            Neolithic Iranian Agrarians (73%) · Bronze Age Metallurgists · 1.5% Neanderthal
          </div>
        </div>
      </div>

      {/* ── 2 Main Pillars: Dairy Evolution & Ancestral Millets ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '14px'
        }}
      >
        {/* Dairy Evolution Pillar */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #dadce0',
            padding: '18px',
            boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#c5221f', textTransform: 'uppercase' }}>
              PILLAR A · DAIRY EVOLUTION (MCM6 GG)
            </span>
            <span style={{ fontSize: '0.64rem', fontWeight: 600, color: '#c5221f', backgroundColor: '#fce8e6', padding: '1px 6px', borderRadius: '4px', border: '1px solid #fad2cf' }}>
              Ancestral Non-Pastoral
            </span>
          </div>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '0.96rem', fontWeight: 600, color: '#202124' }}>
            Why Dairy is an Evolutionary Mismatch
          </h4>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.76rem', color: '#5f6368', lineHeight: 1.5 }}>
            {dairy.evolutionaryContextEn}
          </p>
          <div style={{ backgroundColor: '#f8f9fa', padding: '10px 12px', borderRadius: '4px', border: '1px solid #dadce0', marginBottom: '10px' }}>
            <div style={{ fontSize: '0.70rem', fontWeight: 600, color: '#202124', marginBottom: '4px' }}>
              Actionable Evolutionary Swaps:
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.74rem', color: '#3c4043', lineHeight: 1.5 }}>
              {dairy.dietaryProtocolEn?.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '4px' }}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Grain Evolution & Satiety Pillar */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #dadce0',
            padding: '18px',
            boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1a73e8', textTransform: 'uppercase' }}>
              PILLAR B · GRAIN EVOLUTION (IRS1 TC & FTO)
            </span>
            <span style={{ fontSize: '0.64rem', fontWeight: 600, color: '#1a73e8', backgroundColor: '#e8f0fe', padding: '1px 6px', borderRadius: '4px', border: '1px solid #d2e3fc' }}>
              Indus Valley Grains
            </span>
          </div>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '0.96rem', fontWeight: 600, color: '#202124' }}>
            Ancient Millets vs Modern White Flours
          </h4>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.76rem', color: '#5f6368', lineHeight: 1.5 }}>
            {carbs.evolutionaryContextEn}
          </p>
          <div style={{ backgroundColor: '#f8f9fa', padding: '10px 12px', borderRadius: '4px', border: '1px solid #dadce0', marginBottom: '10px' }}>
            <div style={{ fontSize: '0.70rem', fontWeight: 600, color: '#202124', marginBottom: '4px' }}>
              Actionable Glycemic Rules:
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.74rem', color: '#3c4043', lineHeight: 1.5 }}>
              {carbs.dietaryProtocolEn?.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '4px' }}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Botanical Spice Matrix & Mitochondrial Health ── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #dadce0',
          padding: '20px',
          boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Sparkles size={16} style={{ color: '#1a73e8' }} />
          <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 600, color: '#202124' }}>
            The Ancestral Pharmacological Spice Shield (Natural AMPK & SIRT1 Activators)
          </h4>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '10px'
          }}
        >
          {spices.keyAllies?.map((ally, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#f8f9fa',
                border: '1px solid #dadce0',
                borderRadius: '6px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div style={{ fontSize: '0.80rem', fontWeight: 600, color: '#1a73e8' }}>
                {ally.spice}
              </div>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase' }}>
                Target: {ally.target}
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.74rem', color: '#3c4043', lineHeight: 1.45 }}>
                {ally.clinicalActionEn}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pillar 3: Maternal Haplogroup & Mitochondrial Longevity ── */}
      {mito.haplogroup && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #dadce0',
            padding: '20px',
            boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Dna size={16} style={{ color: '#1a73e8' }} />
              <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 600, color: '#202124' }}>
                Maternal Haplogroup & Mitochondrial Longevity ({mito.haplogroup})
              </h4>
            </div>
            <span style={{ fontSize: '0.70rem', color: '#5f6368', fontWeight: 500 }}>
              Root: {mito.rootLineage}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.80rem', color: '#3c4043', lineHeight: 1.55 }}>
            {mito.clinicalRelevanceEn}
          </p>
        </div>
      )}
    </div>
  );
}

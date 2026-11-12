'use client';

import React, { useState } from 'react';
import { Sun, Utensils, Flame, Moon, MessageSquare, Clock } from 'lucide-react';

/**
 * Chapter 3: 7-Day Precision Meal Plan & 24h Routine
 * Luxury MedTech UI with day-by-day gastronomic menus for Doha/GCC,
 * 1-2-3 plate sequencing, and 1-click WhatsApp chef sharing.
 */
export default function DnaWeeklyMealPlan({ clinicalProfile, onShareChefWhatsApp }) {
  const [selectedDay, setSelectedDay] = useState(1);

  if (!clinicalProfile) return null;

  const dayPlan = clinicalProfile.sevenDayMealPlan?.find(d => d.day === selectedDay) || clinicalProfile.sevenDayMealPlan?.[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ── 7-Day Precision Meal Plan ── */}
      <div
        id="weekly-menu-section"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1.5px solid #bae6fd',
          padding: '1.75rem',
          boxShadow: '0 4px 20px rgba(2, 132, 199, 0.06)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CHAPTER 3 · 7-DAY PRECISION MEAL PLAN (FOR CATERING / CHEF / HOME)
            </span>
            <h3 style={{ fontSize: '1.30rem', fontWeight: 850, color: '#003666', margin: '2px 0 4px 0' }}>
              7-Day Precision Meal Plan
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              Gastronomic recipes tailored to Doha / GCC ingredients, optimized for insulin stabilization, methylation, and satiety.
            </p>
          </div>

          {/* Chef WhatsApp Share + Day selector */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
            {onShareChefWhatsApp && (
              <button
                type="button"
                onClick={onShareChefWhatsApp}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  fontSize: '0.75rem',
                  fontWeight: 750,
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: '8px',
                  color: '#15803d',
                  cursor: 'pointer'
                }}
              >
                <MessageSquare size={14} />
                <span>📲 Send Menu &amp; Kitchen Rules to Chef / Family (WhatsApp)</span>
              </button>
            )}

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              {clinicalProfile.sevenDayMealPlan?.map((d) => (
                <button
                  key={d.day}
                  type="button"
                  onClick={() => setSelectedDay(d.day)}
                  style={{
                    height: '30px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: selectedDay === d.day ? 750 : 600,
                    border: '1px solid',
                    borderColor: selectedDay === d.day ? '#0284c7' : '#e2e8f0',
                    backgroundColor: selectedDay === d.day ? '#0284c7' : '#ffffff',
                    color: selectedDay === d.day ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.12s ease'
                  }}
                >
                  <span>Day {d.day}</span>
                  <span style={{ opacity: selectedDay === d.day ? 0.9 : 0.65 }}>({d.dayName})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Day Card */}
        {dayPlan && (
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
              <div>
                <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Day {dayPlan.day} · {dayPlan.dayName}
                </span>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 850, color: '#0f172a', margin: '2px 0 0 0' }}>
                  {dayPlan.themeEn}
                </h4>
              </div>
              <span style={{ fontSize: '0.70rem', fontWeight: 700, backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '4px' }}>
                Plate Sequencing Enforced
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              {/* Breakfast */}
              <div style={{ backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0d9488', fontWeight: 750, fontSize: '0.80rem', marginBottom: '6px' }}>
                  <Sun size={15} />
                  <span>Breakfast (High Protein Ignition)</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.80rem', color: '#334155', lineHeight: 1.55 }}>
                  {dayPlan.breakfast}
                </p>
              </div>

              {/* Lunch */}
              <div style={{ backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0284c7', fontWeight: 750, fontSize: '0.80rem', marginBottom: '6px' }}>
                  <Utensils size={15} />
                  <span>Lunch (Peak Digestion &amp; Sequencing)</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.80rem', color: '#334155', lineHeight: 1.55 }}>
                  {dayPlan.lunch}
                </p>
              </div>

              {/* PM Snack */}
              <div style={{ backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b45309', fontWeight: 750, fontSize: '0.80rem', marginBottom: '6px' }}>
                  <Flame size={15} />
                  <span>PM Snack (Dopamine Anti-Craving)</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.80rem', color: '#334155', lineHeight: 1.55 }}>
                  {dayPlan.snack}
                </p>
              </div>

              {/* Dinner */}
              <div style={{ backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e40af', fontWeight: 750, fontSize: '0.80rem', marginBottom: '6px' }}>
                  <Moon size={15} />
                  <span>Dinner (Light Cellular Repair)</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.80rem', color: '#334155', lineHeight: 1.55 }}>
                  {dayPlan.dinner}
                </p>
              </div>
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', fontSize: '0.76rem', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700 }}>Bedtime Restorative Infusion:</span>
              <span style={{ color: '#475569' }}>{dayPlan.bedtimeTea}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Circadian Chrono-Nutrition (24h Routine Timeline) ── */}
      {clinicalProfile.circadianChronoSchedule && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0, 54, 102, 0.04)' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CIRCADIAN CHRONOBIOLOGY TIMELINE
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 850, color: '#003666', margin: '2px 0 4px 0' }}>
              Your 24-Hour Metabolic Routine
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              Aligning your nutrient intake with the biological clock (CLOCK gene) to synchronize cortisol, leptin, and insulin sensitivity.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {clinicalProfile.circadianChronoSchedule.map((phase, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: phase.time.includes('11:00 AM') ? '#fef2f2' : phase.time.includes('05:30') ? '#fffbeb' : '#f8fafc',
                  border: `1.5px solid ${phase.time.includes('11:00 AM') ? '#fecaca' : phase.time.includes('05:30') ? '#fde68a' : '#cbd5e1'}`,
                  borderRadius: '10px',
                  padding: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0284c7' }}>
                    {phase.time}
                  </span>
                  <span style={{ fontSize: '0.66rem', fontWeight: 700, backgroundColor: '#ffffff', color: '#475569', padding: '2px 6px', borderRadius: '3px', border: '1px solid #e2e8f0' }}>
                    {phase.target}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.94rem', fontWeight: 850, color: '#0f172a', margin: '0 0 6px 0' }}>
                  {phase.phaseEn}
                </h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#334155', lineHeight: 1.5 }}>
                  {phase.actionEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

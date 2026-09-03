"use client";

import React, { useState, useMemo } from 'react';
import { Snowflake, Thermometer, Clock, ShoppingCart, CheckCircle2, AlertTriangle, ShieldCheck, Zap, RefreshCw } from '@/lib/icons';

/**
 * ProtocolLifespanTracker
 * ─────────────────────────────────────────────────────────────────────────────
 * Tracks aqueous peptide in-use shelf life (28-day limit) and forecasts refills.
 * Fully responsive on Mobile and Laptop.
 */
import { useProtocolLifespan } from '@/hooks/useProtocolLifespan';

export default function ProtocolLifespanTracker({ protocol, onReorder = null }) {
  const {
    reconstitutedDate,
    setReconstitutedDate,
    startFormatted,
    expiryFormatted,
    elapsedDays,
    remainingDays,
    progressPercent,
    status
  } = useProtocolLifespan(protocol);

  const lifespanData = {
    startFormatted,
    expiryFormatted,
    elapsedDays,
    remainingDays,
    progressPercent,
    status
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 text-slate-100 shadow-xl my-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Clock size={18} />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white tracking-wide">
              Aqueous Lifespan & Auto-Replenishment Forecaster
            </h4>
            <p className="text-xs text-slate-400">
              28-Day Stability Sentinel • Real-Time In-Use Tracking
            </p>
          </div>
        </div>

        {/* Date Setter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold hidden sm:inline">Reconstituted:</span>
          <input
            type="date"
            value={reconstitutedDate}
            onChange={(e) => setReconstitutedDate(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:border-teal-500 outline-none"
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        
        {/* Metric 1: Days Remaining Ring */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-4">
          <div className="relative w-14 h-14 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={
                  lifespanData.status === 'optimal'
                    ? 'text-teal-400'
                    : lifespanData.status === 'warning'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }
                strokeDasharray={`${100 - lifespanData.progressPercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-mono font-black text-sm text-white">
              {lifespanData.remainingDays}d
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              In-Use Stability
            </span>
            <span className="text-sm font-bold text-white block">
              {lifespanData.remainingDays} Days Left
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Expires {lifespanData.expiryFormatted}
            </span>
          </div>
        </div>

        {/* Metric 2: Storage Sentinel Specs */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-400">
            <Snowflake size={14} />
            <span>2°C – 8°C Cold Storage</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Aqueous peptide solution remains 100% bioactive up to day 28. Keep protected from UV light.
          </p>
        </div>

        {/* Metric 3: 1-Click Replenishment Forecaster */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold">Refill Scheduled:</span>
            <span className="text-emerald-400 font-bold font-mono">5 Days Prior</span>
          </div>
          <button
            onClick={() => onReorder ? onReorder() : alert('Replenishment batch added to cart!')}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg transition-all"
          >
            <RefreshCw size={14} />
            <span>One-Click Reorder Batch</span>
          </button>
        </div>
      </div>
    </div>
  );
}

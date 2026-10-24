"use client";

import React from 'react';
import { Plus, Search, Bot, MessageCircle } from 'lucide-react';

export default function DoctorFloatingGlassDock({
  onOpenIntake,
  onOpenSearch,
  onOpenAtlasAi,
  aiUsesRemaining = 5,
  onOpenWhatsApp
}) {
  return (
    <footer className="doctor-bottom-dock" role="toolbar" aria-label="Physician Quick Actions">
      <div className="doctor-bottom-dock-actions">
        <button
          type="button"
          className="doctor-dock-btn doctor-dock-btn-primary"
          onClick={onOpenIntake}
          title="Import lab data or create a new electronic prescription"
        >
          <Plus size={15} />
          <span>New Rx / Intake</span>
        </button>

        <button
          type="button"
          className="doctor-dock-btn doctor-dock-btn-secondary"
          onClick={onOpenSearch}
          title="Quickly find any patient or prescription in this doctor's private practice (⌘K)"
          style={{ background: '#f8fafc', borderColor: '#cbd5e1' }}
        >
          <Search size={14} style={{ color: '#1a73e8' }} />
          <span style={{ color: '#1a73e8', fontWeight: 600 }}>Find Patient / Rx (⌘K)</span>
        </button>

        <button
          type="button"
          className="doctor-dock-btn doctor-dock-btn-ai"
          onClick={onOpenAtlasAi}
          title="Atlas AI clinical query credits"
        >
          <Bot size={14} style={{ color: '#5f6368' }} />
          <span>Atlas AI ({aiUsesRemaining}/5)</span>
        </button>

        <button
          type="button"
          className="doctor-dock-btn doctor-dock-btn-whatsapp"
          onClick={onOpenWhatsApp}
          title="Request clinical assistance via WhatsApp"
        >
          <MessageCircle size={14} style={{ color: '#16a34a' }} />
          <span>WhatsApp Direct</span>
        </button>
      </div>
    </footer>
  );
}

import React from 'react';
import { ShieldCheck, ClipboardList, BookOpen, Bot } from 'lucide-react';
import '../../styles/trust_row.css';

export default function TrustRow() {
  return (
    <div className="trust-row">
      <div className="trust-container">
        <span className="trust-item">
          <ShieldCheck size={16} color="#34d399" />
          Evidence-guided
        </span>
        <span className="trust-item">
          <ClipboardList size={16} color="#38bdf8" />
          Prescription-aware
        </span>
        <span className="trust-item">
          <BookOpen size={16} color="#f472b6" />
          Documentation available
        </span>
        <span className="trust-item">
          <Bot size={16} color="#818cf8" />
          AI-assisted
        </span>
      </div>
    </div>
  );
}

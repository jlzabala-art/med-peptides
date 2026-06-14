import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import User from "lucide-react/dist/esm/icons/user";
import Stethoscope from "lucide-react/dist/esm/icons/stethoscope";
import Building from "lucide-react/dist/esm/icons/building";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import FileText from "lucide-react/dist/esm/icons/file-text";
import React from 'react';







export default function AIExtractionPanel({ rx }) {
  // Mock data representing extracted details
  const extractedData = {
    patient: rx?.patient || 'John Smith',
    doctor: rx?.doctor || 'Dr. Ahmed',
    clinic: 'Longevity Clinic Dubai',
    date: 'Oct 24, 2026',
    completeness: 88,
    missing: ['Treatment Duration']
  };

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '16px', 
        borderBottom: '1px solid #e2e8f0', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#f8fafc'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="#8b5cf6" />
          <span style={{ fontWeight: 600, color: '#0f172a' }}>AI Extraction Results</span>
        </div>
        <div style={{ 
          fontSize: '12px', 
          fontWeight: 600, 
          color: '#8b5cf6', 
          background: '#ede9fe', 
          padding: '4px 8px', 
          borderRadius: '12px' 
        }}>
          96% Confidence
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <User size={16} color="#64748b" style={{ marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Patient</div>
              <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: 500 }}>{extractedData.patient}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Stethoscope size={16} color="#64748b" style={{ marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Doctor</div>
              <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: 500 }}>{extractedData.doctor}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Building size={16} color="#64748b" style={{ marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Clinic</div>
              <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: 500 }}>{extractedData.clinic}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Calendar size={16} color="#64748b" style={{ marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Date</div>
              <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: 500 }}>{extractedData.date}</div>
            </div>
          </div>
        </div>

        {/* Completeness Score */}
        <div style={{ marginTop: '8px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Completeness Score</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: extractedData.completeness > 80 ? '#10b981' : '#f59e0b' }}>
              {extractedData.completeness}/100
            </span>
          </div>
          <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${extractedData.completeness}%`, 
              height: '100%', 
              background: extractedData.completeness > 80 ? '#10b981' : '#f59e0b' 
            }} />
          </div>
          {extractedData.missing.length > 0 && (
            <div style={{ marginTop: '12px', fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FileText size={12} />
              Missing: {extractedData.missing.join(', ')}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
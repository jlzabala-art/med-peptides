import Upload from "lucide-react/dist/esm/icons/upload";
import FileText from "lucide-react/dist/esm/icons/file-text";
import FileImage from "lucide-react/dist/esm/icons/file-image";
import FileCode from "lucide-react/dist/esm/icons/file-code";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import React, { useState } from 'react';







import AIExtractionPanel from './AIExtractionPanel';
import ProductMatchingCenter from './ProductMatchingCenter';
import ClinicalAlertCenter from './ClinicalAlertCenter';
import IntakeActionCenter from './IntakeActionCenter';

// Mock list of uploaded prescriptions
const MOCK_PRESCRIPTIONS = [
  { id: '1', patient: 'John Smith', doctor: 'Dr. Ahmed', status: 'review_required', items: 6, matched: 5 },
  { id: '2', patient: 'Sarah Connor', doctor: 'Dr. Silva', status: 'ready', items: 3, matched: 3 },
  { id: '3', patient: 'Unknown', doctor: 'Unknown', status: 'processing', items: 0, matched: 0 }
];

export default function PrescriptionIntakeLayout({ prescription, onSelect }) {
  const [uploading, setUploading] = useState(false);

  // If no prescription selected, show upload UI or list
  if (!prescription) {
    return (
      <div style={{ display: 'flex', gap: '24px', height: '100%' }}>
        {/* Left: Upload Area */}
        <div style={{ 
          flex: 1, 
          background: '#fff', 
          border: '2px dashed #cbd5e1', 
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px',
          cursor: 'pointer'
        }}>
          <Upload size={48} color="#94a3b8" style={{ marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>Upload Prescription</h3>
          <p style={{ margin: 0, color: '#64748b', textAlign: 'center' }}>
            Drag and drop PDF, Image, WhatsApp Screenshot,<br />or Doctor Notes here.
          </p>
          <button style={{
            marginTop: '24px',
            padding: '10px 20px',
            background: '#0071bd',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer'
          }} onClick={() => onSelect(MOCK_PRESCRIPTIONS[0])}>
            Simulate Upload
          </button>
        </div>

        {/* Right: Queue */}
        <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>Pending Queue</h3>
          {MOCK_PRESCRIPTIONS.map(rx => (
            <div key={rx.id} onClick={() => onSelect(rx)} style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{rx.patient}</span>
                <span style={{ 
                  fontSize: '12px', 
                  padding: '4px 8px', 
                  borderRadius: '12px',
                  background: rx.status === 'ready' ? '#dcfce7' : '#fef9c3',
                  color: rx.status === 'ready' ? '#166534' : '#854d0e',
                  fontWeight: 600
                }}>
                  {rx.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                Doctor: {rx.doctor}
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
                <span>Products: {rx.items}</span>
                <span>Matched: {rx.matched}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Active Prescription View (Split Screen)
  return (
    <div style={{ display: 'flex', gap: '24px', height: '100%', minHeight: '600px' }}>
      {/* Left Column: Source Document */}
      <div style={{ 
        flex: 1, 
        background: '#fff', 
        border: '1px solid #e2e8f0', 
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileImage size={18} color="#64748b" />
            <span style={{ fontWeight: 600, color: '#0f172a' }}>Source Document</span>
          </div>
          <button onClick={() => onSelect(null)} style={{ background: 'none', border: 'none', color: '#0071bd', cursor: 'pointer', fontWeight: 500 }}>
            Close
          </button>
        </div>
        <div style={{ flex: 1, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Placeholder for PDF/Image viewer */}
          <div style={{ textAlign: 'center', color: '#64748b' }}>
            <FileText size={64} style={{ opacity: 0.5, marginBottom: '16px' }} />
            <p>Document Viewer Placeholder</p>
          </div>
        </div>
      </div>

      {/* Right Column: AI Extraction & Workflow */}
      <div style={{ 
        width: '500px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '24px',
        overflowY: 'auto',
        paddingRight: '8px'
      }}>
        <AIExtractionPanel rx={prescription} />
        <ClinicalAlertCenter />
        <ProductMatchingCenter />
        <IntakeActionCenter />
      </div>

    </div>
  );
}
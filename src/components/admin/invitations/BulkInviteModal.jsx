import Upload from "lucide-react/dist/esm/icons/upload";
import X from "lucide-react/dist/esm/icons/x";
import FileText from "lucide-react/dist/esm/icons/file-text";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import React, { useState } from 'react';





export default function BulkInviteModal({ onClose }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);

  const handleDrag = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = function(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = function(e) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, animation: 'fadeIn 0.2s ease' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '90%', maxWidth: '500px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Bulk Invitations</h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Upload a CSV file to invite multiple users</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
             <X size={20} />
          </button>
        </div>

        <div style={{ padding: '2rem' }}>
          <form onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()} style={{ height: '100%' }}>
            <input type="file" id="file-upload" multiple={false} accept=".csv,.xlsx" onChange={handleChange} style={{ display: 'none' }} />
            <label htmlFor="file-upload" className={dragActive ? "drag-active" : "" } style={{
                height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '3rem 2rem', border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '12px',
                backgroundColor: dragActive ? 'rgba(0,113,189,0.05)' : '#f8fafc', cursor: 'pointer', transition: 'all 0.2s'
              }}
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            >
              <Upload size={32} color={dragActive ? "var(--primary)" : "var(--text-muted)"} style={{ marginBottom: '1rem' }} />
              <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Drag & Drop your file here</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>or click to browse</div>
              <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', backgroundColor: 'white', padding: '0.25rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
                Supports .CSV, .XLSX
              </div>
            </label>
          </form>

          {file && (
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileText size={20} color="#166534" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#166534' }}>{file.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#15803d' }}>{(file.size / 1024).toFixed(1)} KB</div>
              </div>
              <button style={{ background: 'none', border: 'none', color: '#166534', cursor: 'pointer' }} onClick={() => setFile(null)}>
                <X size={16} />
              </button>
            </div>
          )}

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', padding: '1rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px' }}>
             <AlertCircle size={18} color="#b45309" style={{ flexShrink: 0 }} />
             <div style={{ fontSize: '0.85rem', color: '#92400e' }}>
               The CSV must contain headers: <strong>Email, Name, Role, Organization</strong>. All other fields are optional.
             </div>
          </div>

        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
           <button className="gcp-btn-secondary" onClick={onClose}>Cancel</button>
           <button className="gcp-btn-primary" disabled={!file} onClick={() => alert('Bulk upload will be processed in the backend.')}>Process File</button>
        </div>

      </div>
    </div>
  );
}
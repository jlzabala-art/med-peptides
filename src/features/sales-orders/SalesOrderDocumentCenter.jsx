import React from 'react';
import FileText from "lucide-react/dist/esm/icons/file-text";
import File from "lucide-react/dist/esm/icons/file";
import Download from "lucide-react/dist/esm/icons/download";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import FileCheck from "lucide-react/dist/esm/icons/file-check";
import PackageCheck from "lucide-react/dist/esm/icons/package-check";
import Truck from "lucide-react/dist/esm/icons/truck";

export default function SalesOrderDocumentCenter({ order }) {
  
  const documents = [
    { id: 'so', category: 'Sales', title: 'Sales Order (Official)', icon: FileText, date: order.createdAt, available: true },
    { id: 'quo', category: 'Sales', title: 'Quotation', icon: FileText, date: order.createdAt, available: !!order.quotationId },
    { id: 'inv', category: 'Sales', title: 'Proforma Invoice', icon: File, date: null, available: order.commercialStatus === 'Accepted' },
    
    { id: 'po', category: 'Procurement', title: 'Purchase Order to Supplier', icon: PackageCheck, date: null, available: order.poGenerated },
    
    { id: 'pl', category: 'Logistics', title: 'Packing List', icon: FileCheck, date: null, available: ['Ready to Ship', 'In Transit', 'Delivered'].includes(order.operationalStatus) },
    { id: 'awb', category: 'Logistics', title: 'Air Waybill (AWB)', icon: Truck, date: null, available: ['In Transit', 'Delivered'].includes(order.operationalStatus) },
    
    { id: 'coa', category: 'Quality', title: 'Certificate of Analysis (COA)', icon: FileCheck, date: null, available: ['In Transit', 'Delivered'].includes(order.operationalStatus) },
  ];

  const categories = ['Sales', 'Procurement', 'Logistics', 'Quality'];

  return (
    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Document Center</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {categories.map(cat => {
          const catDocs = documents.filter(d => d.category === cat);
          if (catDocs.length === 0) return null;
          
          return (
            <div key={cat}>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{cat}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {catDocs.map(doc => (
                  <div key={doc.id} style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                    padding: '0.75rem 1rem', background: doc.available ? '#f8fafc' : '#fff', 
                    border: '1px solid #e2e8f0', borderRadius: '8px',
                    opacity: doc.available ? 1 : 0.5, cursor: doc.available ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <doc.icon size={16} color={doc.available ? '#3b82f6' : '#94a3b8'} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{doc.title}</div>
                        {doc.available && <div style={{ fontSize: '0.7rem', color: '#64748b' }}>PDF • Auto-generated</div>}
                        {!doc.available && <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Not available yet</div>}
                      </div>
                    </div>
                    {doc.available && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button style={{ padding: '0.25rem', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }} title="Preview">
                          <ExternalLink size={14} />
                        </button>
                        <button style={{ padding: '0.25rem', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }} title="Download">
                          <Download size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

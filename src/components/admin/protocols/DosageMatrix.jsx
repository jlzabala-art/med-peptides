import React from 'react';
import { Printer, Calendar } from '@/lib/icons';

export default function DosageMatrix({ protocol }) {
  // Extract all unique products across all phases
  const allItems = protocol?.phases?.reduce((acc, phase) => acc.concat(phase.items || phase.medications || []), []) || [];
  const uniqueProducts = [...new Set(allItems.map(i => i.name || i.productId || 'Unknown'))];
  
  // Create an array of weeks based on the total duration
  let totalWeeks = protocol?.phases?.reduce((acc, phase) => acc + (phase.durationWeeks || 0), 0) || 0;
  if (totalWeeks === 0) totalWeeks = 4; // Default to 4 weeks if not specified

  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);

  // Map product doses per week based on phase
  // We'll simulate finding which phase a week belongs to and get the dose
  const getDoseForWeekAndProduct = (week, productName) => {
    let currentWeek = 1;
    for (const phase of (protocol?.phases || [])) {
      const duration = phase.durationWeeks || 4;
      if (week >= currentWeek && week < currentWeek + duration) {
        const item = (phase.items || phase.medications || []).find(i => (i.name || i.productId || 'Unknown') === productName);
        if (item) {
          // If the protocol has dose mapping, use it, else mock it based on item.doseMg
          return item.doseMg ? `${item.doseMg} mg` : '500 mcg';
        }
        return '-';
      }
      currentWeek += duration;
    }
    return '-';
  };

  const handlePrint = () => {
    window.print();
  };

  if (uniqueProducts.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Add products to the protocol phases to generate the dosage matrix.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="no-print">
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Dosage Matrix</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
            Weekly dosage schedule for all products in this protocol.
          </p>
        </div>
        <button 
          onClick={handlePrint}
          className="btn btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Printer size={16} /> Print Matrix
        </button>
      </div>

      {/* Printable Area */}
      <div className="printable-matrix" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="print-only-header">
          <Calendar size={20} color="var(--primary)" />
          <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
            {protocol?.protocol_name || 'Protocol'} - Dosage Matrix
          </h4>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr>
                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border)', background: 'var(--surface)', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  Week
                </th>
                {uniqueProducts.map(product => (
                  <th key={product} style={{ padding: '1rem', borderBottom: '2px solid var(--border)', background: 'var(--surface)', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                    {product}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map(week => (
                <tr key={week} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.9rem', background: 'var(--surface)', width: '120px' }}>
                    Week {week}
                  </td>
                  {uniqueProducts.map(product => {
                    const dose = getDoseForWeekAndProduct(week, product);
                    return (
                      <td key={product} style={{ padding: '1rem', color: dose === '-' ? 'var(--text-muted)' : 'var(--text-main)', fontWeight: dose !== '-' ? 500 : 400, fontSize: '0.9rem' }}>
                        {dose}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-matrix, .printable-matrix * {
            visibility: visible;
          }
          .printable-matrix {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only-header {
            display: flex !important;
          }
        }
      `}} />
    </div>
  );
}

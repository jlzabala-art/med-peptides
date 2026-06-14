import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import PackageX from "lucide-react/dist/esm/icons/package-x";
import Replace from "lucide-react/dist/esm/icons/replace";
import Zap from "lucide-react/dist/esm/icons/zap";
import PackageSearch from "lucide-react/dist/esm/icons/package-search";
import React, { useState } from 'react';





import { PROTOCOL_BLUEPRINTS } from '../../data/protocolBlueprints';
import notifier from '../../services/NotificationService';

// Mock current physical stock levels
const mockInventoryStock = {
  'Bacteriostatic Water 30ml': 12,
  'Insulin Syringes 100-pack': 4,
  'Alcohol Swabs 100-pack': 0, // Critical Shortage
  'Tirzepatide 10mg/vial': 0,  // Critical Shortage
  'Tirzepatide 5mg/vial': 50,  // Alternative available
  'MOTS-C': 200,
  'BPC-157': 50,
  'GHK-Cu': 100,
};

export default function KittingRiskAnalysis() {
  const [resolving, setResolving] = useState(null);

  // Analyze protocols to find which ones can't be fulfilled
  const risks = Object.entries(PROTOCOL_BLUEPRINTS).map(([key, protocol]) => {
    let bottlenecks = [];
    // Check base supplies
    if (mockInventoryStock['Bacteriostatic Water 30ml'] < 2) bottlenecks.push({ item: 'Bacteriostatic Water', type: 'supply', shortage: true });
    if (mockInventoryStock['Insulin Syringes 100-pack'] < 1) bottlenecks.push({ item: 'Insulin Syringes', type: 'supply', shortage: true });
    if (mockInventoryStock['Alcohol Swabs 100-pack'] < 1) bottlenecks.push({ item: 'Alcohol Swabs', type: 'supply', shortage: true });

    // Check specific peptides
    const blueprints = protocol.phase_blueprints || protocol.phases || [];
    blueprints.forEach(phase => {
      const drugs = phase.medications || phase.drugs || phase.compounds || [];
      drugs.forEach(drug => {
        const name = drug.product_title || drug.name || drug.compound;
        // Very basic mock check for this demo
        if (name.includes('Tirzepatide')) {
          if (mockInventoryStock['Tirzepatide 10mg/vial'] < 1) {
            bottlenecks.push({ 
              item: 'Tirzepatide 10mg/vial', 
              type: 'peptide', 
              shortage: true, 
              suggestion: 'Substitute with 2x 5mg/vial (In Stock: 50)' 
            });
          }
        } else {
          // Assume we have it unless it's Tirzepatide or Swabs for this mock
        }
      });
    });

    if (bottlenecks.length > 0) {
      return { id: key, name: protocol.title || protocol.phases?.[0]?.name || key, bottlenecks };
    }
    return null;
  }).filter(Boolean);

  const handleResolve = (riskId, bottleneck) => {
    setResolving(riskId + bottleneck.item);
    setTimeout(() => {
      notifier.info(`Automated substitution rule applied for ${bottleneck.item} via Zoho Inventory API.`);
      setResolving(null);
    }, 1000);
  };

  if (risks.length === 0) return null;

  return (
    <div className="glass-card-premium" style={{ borderLeft: '4px solid var(--error)', padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <PackageX style={{ color: 'var(--error)' }} size={24} />
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--error)' }}>
          Kitting Risk Alerts (Composite Items)
        </h3>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        The following Clinical Protocols (Composite Items) are at risk of Stock Out because one or more underlying components are unavailable in the warehouse.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {risks.map(risk => (
          <div key={risk.id} style={{ background: 'var(--surface-raised)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{risk.name}</span>
              <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'var(--error)', color: 'white', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>Fulfillment Blocked</span>
            </div>
            <div style={{ padding: '1rem' }}>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {risk.bottlenecks.map((btn, idx) => (
                  <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <AlertTriangle size={16} style={{ color: 'var(--warning)' }} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Missing: {btn.item}</div>
                        {btn.suggestion && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Zap size={12} /> {btn.suggestion}
                          </div>
                        )}
                      </div>
                    </div>
                    {btn.suggestion ? (
                      <button 
                        onClick={() => handleResolve(risk.id, btn)}
                        disabled={resolving === risk.id + btn.item}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', color: 'var(--primary)' }}
                      >
                        <Replace size={14} />
                        {resolving === risk.id + btn.item ? 'Updating Zoho...' : 'Auto-Substitute'}
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                        Requires Procurement
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
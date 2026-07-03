import React from 'react';
import { Droplets, AlertTriangle, CheckCircle, PackageOpen } from 'lucide-react';

export default function ReconstitutionPlanner({ protocol }) {
  // Extract products
  const allItems = protocol?.phases?.reduce((acc, phase) => acc.concat(phase.items || phase.medications || []), []) || [];
  
  // Group by product
  const groupedProducts = allItems.reduce((acc, item) => {
    const key = item.productId || item.name || 'Unknown Product';
    if (!acc[key]) {
      acc[key] = {
        name: item.name || 'Unknown Product',
        vialStrengthMg: item.vialStrengthMg || 10,
        shelfLifeDays: item.shelfLifeDays || 30,
        doseMg: item.doseMg || 0.5,
        frequencyPerWeek: item.frequencyPerWeek || 5,
        totalInjections: 0,
      };
    }
    const injectionsInPhase = (item.frequencyPerWeek || 5) * (item.durationWeeks || 4);
    acc[key].totalInjections += injectionsInPhase;
    return acc;
  }, {});

  const planners = Object.values(groupedProducts).map(p => {
    // Calculate how many days one vial lasts
    const injectionsPerVial = Math.floor(p.vialStrengthMg / p.doseMg);
    
    // How many days does it take to consume these injections?
    // frequencyPerWeek (e.g. 5) -> injections per week. So days per injection = 7 / frequencyPerWeek
    const daysPerInjection = 7 / p.frequencyPerWeek;
    const daysToConsumeVial = Math.floor(injectionsPerVial * daysPerInjection);

    // Actual usable days is the minimum of shelf life and time to consume
    const usableDays = Math.min(daysToConsumeVial, p.shelfLifeDays);
    const isWasting = daysToConsumeVial > p.shelfLifeDays;
    
    // Total days for the protocol
    const totalDays = Math.floor(p.totalInjections * daysPerInjection);
    
    // Generate vial segments
    const vials = [];
    let currentDay = 1;
    let vialCount = 1;
    
    while (currentDay <= totalDays) {
      vials.push({
        vialNumber: vialCount,
        reconstituteDay: currentDay,
        expiryDay: currentDay + p.shelfLifeDays,
        emptyDay: currentDay + daysToConsumeVial,
        discardDay: currentDay + usableDays,
        discardReason: isWasting ? 'Expired' : 'Empty'
      });
      currentDay += usableDays;
      vialCount++;
    }

    return { ...p, vials, isWasting };
  });

  if (planners.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Add products to the protocol to generate reconstitution plans.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Reconstitution Planner</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
          Timeline for reconstituting, storing, and discarding vials based on shelf life and usage rates.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {planners.map((planner, idx) => (
          <div key={idx} style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>{planner.name}</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Shelf Life: {planner.shelfLifeDays} Days • {planner.vialStrengthMg}mg Vial
                </div>
              </div>
              {planner.isWasting && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--warning)', background: 'var(--warning-light, #fffbeb)', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600 }}>
                  <AlertTriangle size={16} /> Vial expires before empty
                </div>
              )}
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '2rem' }}>
              {planner.vials.map((vial, vIdx) => (
                <div key={vIdx} style={{ 
                  minWidth: '280px', 
                  border: '1px solid var(--border)', 
                  borderRadius: '8px', 
                  background: 'var(--surface)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', background: 'var(--bg-main)', borderRadius: '8px 8px 0 0' }}>
                    Vial #{vial.vialNumber}
                  </div>
                  
                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ width: '2px', background: 'var(--primary)', position: 'relative', marginTop: '4px', marginBottom: '4px' }}>
                        <div style={{ position: 'absolute', top: '-4px', left: '-4px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                        <div style={{ position: 'absolute', bottom: '-4px', left: '-4px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--border)' }}></div>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>Day {vial.reconstituteDay}</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <Droplets size={16} /> Reconstitute
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Day {Math.floor((vial.reconstituteDay + vial.discardDay) / 2)}</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <CheckCircle size={16} /> Still Valid
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.8rem', color: vial.discardReason === 'Expired' ? 'var(--danger)' : 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                            Day {vial.discardDay}
                          </div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 500, color: vial.discardReason === 'Expired' ? 'var(--danger)' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                            {vial.discardReason === 'Expired' ? <AlertTriangle size={16} /> : <PackageOpen size={16} />} 
                            Discard ({vial.discardReason})
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

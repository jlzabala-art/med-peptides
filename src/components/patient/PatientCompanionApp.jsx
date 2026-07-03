import React, { useState } from 'react';
import { Calendar, Droplet, CheckCircle, Clock, Plane, Info, AlertTriangle, ArrowRight, ChevronRight, Activity } from '@/lib/icons';

export default function PatientCompanionApp({ protocol }) {
  const [activeTab, setActiveTab] = useState('today');

  // Mock data assuming a protocol is loaded
  const todayTasks = [
    { id: 1, type: 'Injection', product: 'Thymosin Alpha-1', amount: '0.15 ml (15 units)', time: 'Morning', status: 'pending' },
    { id: 2, type: 'Oral', product: 'NMN 500mg', amount: '1 capsule', time: 'With Breakfast', status: 'completed' }
  ];

  const travelTips = [
    { id: 1, title: 'TSA Guidelines', text: 'Carry vials in their original prescription boxes.' },
    { id: 2, title: 'Cold Chain', text: 'Use the provided travel cooler pack for flights over 4 hours.' }
  ];

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', background: '#f8fafc', height: '100%', minHeight: '800px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', borderRadius: '24px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}>
      {/* Header */}
      <div style={{ padding: '2rem 1.5rem 1.5rem', background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: 'white', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Good Morning, John</h2>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Week 3: Optimization Phase</p>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={20} color="#38bdf8" />
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <svg width="48" height="48" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#38bdf8" strokeWidth="3" strokeDasharray="60, 100" />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.8rem', fontWeight: 'bold' }}>60%</div>
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Protocol Compliance</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Keep up the great work!</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
        
        {activeTab === 'today' && (
          <>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#0f172a' }}>Today's Plan</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {todayTasks.map(task => (
                <div key={task.id} style={{ background: 'white', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ background: task.status === 'completed' ? '#dcfce7' : '#e0f2fe', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {task.type === 'Injection' ? <Droplet size={20} color={task.status === 'completed' ? '#16a34a' : '#0284c7'} /> : <Clock size={20} color={task.status === 'completed' ? '#16a34a' : '#0284c7'} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>{task.product}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{task.amount} • {task.time}</div>
                    </div>
                  </div>
                  {task.status === 'completed' ? (
                    <CheckCircle size={24} color="#16a34a" />
                  ) : (
                    <button style={{ background: '#0f172a', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Done</button>
                  )}
                </div>
              ))}
            </div>

            <h3 style={{ margin: '1.5rem 0 1rem 0', fontSize: '1.1rem', color: '#0f172a' }}>Quick Guides</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: 'white', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                <Plane size={24} color="#0ea5e9" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>Travel Prep</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>TSA rules & cooling</div>
              </div>
              <div style={{ background: 'white', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                <AlertTriangle size={24} color="#f59e0b" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>Missed Dose?</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>What to do next</div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'instructions' && (
          <>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#0f172a' }}>Storage & Handling</h3>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Info size={18} color="#0284c7" />
                <span style={{ fontWeight: 600, color: '#0f172a' }}>Cold Chain Requirements</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                Thymosin Alpha-1 must be refrigerated at 2-8°C (36-46°F) after reconstitution. Do not freeze.
              </p>
            </div>
            
            <h3 style={{ margin: '1.5rem 0 1rem 0', fontSize: '1.1rem', color: '#0f172a' }}>Reconstitution Guide</h3>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <ol style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                <li>Wash hands thoroughly.</li>
                <li>Wipe the top of the peptide vial and bacteriostatic water vial with an alcohol swab.</li>
                <li>Draw 2ml of bacteriostatic water into the mixing syringe.</li>
                <li>Slowly inject the water into the peptide vial, aiming for the side of the glass.</li>
                <li>Swirl gently—do not shake.</li>
              </ol>
            </div>
          </>
        )}

      </div>

      {/* Bottom Tabs */}
      <div style={{ background: 'white', borderTop: '1px solid #e2e8f0', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
        <div 
          onClick={() => setActiveTab('today')}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: activeTab === 'today' ? '#0f172a' : '#94a3b8', cursor: 'pointer' }}
        >
          <Calendar size={24} />
          <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Today</span>
        </div>
        <div 
          onClick={() => setActiveTab('instructions')}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: activeTab === 'instructions' ? '#0f172a' : '#94a3b8', cursor: 'pointer' }}
        >
          <Info size={24} />
          <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Instructions</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: '#94a3b8', cursor: 'pointer' }}>
          <Activity size={24} />
          <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Progress</span>
        </div>
      </div>
    </div>
  );
}

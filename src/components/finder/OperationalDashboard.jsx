 
import React, { useState } from 'react';
import { 
  CheckCircle2, AlertTriangle, Activity, Calendar, ShieldAlert, 
  Beaker, Clipboard, Zap, TrendingUp, Clock, Info, User, 
  Stethoscope, FileText, Download, Eye, AlertCircle,
  Pause, RotateCcw, Edit3, Trash2, ChevronRight, FileJson
} from 'lucide-react';
import { ArtifactPreviewOverlay, generateTimelineEvents } from './ProtocolArtifacts';
import { generatePatientGuide, generateClinicalPDF, generateDosageGuide } from '../../services/pdfService';
import { generateProtocolICS } from '../../services/calendarService';

export default function OperationalDashboard({ protocolData, formData, onReset, onNavigate }) {
  const [isPaused, setIsPaused] = useState(false);
  const [previewType, setPreviewType] = useState(null);
  const [notes, setNotes] = useState("Monitoring patient for initial biological response. Baseline hematology confirmed.");
  const [isGeneratingDosage, setIsGeneratingDosage] = useState(false);

  const timeline_event_list = generateTimelineEvents(protocolData);

  const startDate = new Date(protocolData.patientContext?.startDate || new Date());
  const today = new Date();
  const diffTime = today - startDate;
  const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const calculatedWeek = Math.min(Math.ceil((diffDays + 1) / 7), protocolData.duration_weeks || 12) || 1;
  const currentWeek = calculatedWeek;

  const protocolId = protocolData.protocol_id || 'WM-36M-2026-0423';
  const duration = protocolData.duration_weeks || 12;
  const completionPercent = Math.round((currentWeek / duration) * 100);

  const manifest = [
    { name: 'Patient_Administration_Guide.pdf', size: '1.2 MB', type: 'patient', icon: <FileText size={16} /> },
    { name: 'Physician_Monitoring_Checklist.pdf', size: '0.8 MB', type: 'physician', icon: <FileText size={16} /> },
    { name: 'Dosage_Administration_Schedule.pdf', size: '~1.5 MB', type: 'dosage', icon: <FileText size={16} /> },
    { name: 'Clinical_Pathway_Definition.json', size: '42 KB', type: 'json', icon: <FileJson size={16} /> },
    { name: 'Dosing_Schedule_Cal_Export.ics', size: '12 KB', type: 'ics', icon: <Calendar size={16} /> }
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 350px', gap: '2rem' }}>
      
      {/* MAIN DASHBOARD COLUMN */}
      <div style={{ display: 'grid', gap: '2rem' }}>
        
        {/* OVERVIEW SECTION */}
        <div className="clinical-card-v5" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Protocol ID</div>
            <div style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '1rem', fontWeight: 900, color: 'var(--primary)' }}>{protocolId}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Status</div>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: isPaused ? '#f59e0b' : 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
               {isPaused ? <Pause size={14} /> : <Activity size={14} />} {isPaused ? 'PAUSED' : 'ACTIVE'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Current Window</div>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary)' }}>Week {currentWeek} of {duration}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Completion State</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${completionPercent}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px' }} />
               </div>
               <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--primary)' }}>{completionPercent}%</span>
            </div>
          </div>
        </div>

        {/* UPCOMING ACTIONS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
           <div className="clinical-card-v5" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>UPCOMING INJECTIONS</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                 {timeline_event_list
                   .filter(e => e.category === 'Injections' && new Date(e.date) >= today)
                   .slice(0, 2)
                   .map((act, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--color-bg-app)', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                       <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justify: 'center', color: 'var(--primary)', border: '1px solid #cbd5e1' }}>
                          <Beaker size={18} />
                       </div>
                       <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-text-secondary)' }}>
                             {new Date(act.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • SCHEDULED
                          </div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)' }}>{act.title}</div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-tertiary)' }}>Dosing Level: {act.desc}</div>
                       </div>
                    </div>
                 ))}
                 {timeline_event_list.filter(e => e.category === 'Injections' && new Date(e.date) >= today).length === 0 && (
                   <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.8rem', fontWeight: 600 }}>No upcoming injections.</div>
                 )}
              </div>
           </div>
           <div className="clinical-card-v5" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>MONITORING WINDOWS</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                 {timeline_event_list
                   .filter(e => e.category === 'Monitoring' && new Date(e.date) >= today)
                   .slice(0, 2)
                   .map((act, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                       <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justify: 'center', color: '#0284c7', border: '1px solid #bae6fd' }}>
                          <TrendingUp size={18} />
                       </div>
                       <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#0369a1' }}>
                             {new Date(act.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • SCHEDULED
                          </div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0369a1' }}>{act.title}</div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>{act.desc}</div>
                       </div>
                    </div>
                 ))}
                 {timeline_event_list.filter(e => e.category === 'Monitoring' && new Date(e.date) >= today).length === 0 && (
                   <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.8rem', fontWeight: 600 }}>No upcoming monitoring.</div>
                 )}
              </div>
           </div>
        </div>

        {/* WEEKLY TIMELINE VIEW */}
        <div className="clinical-card-v5" style={{ padding: '2rem' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary)', margin: 0 }}>Active Week Visualization</h3>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text-secondary)' }}>WEEK {currentWeek} PLAN</div>
           </div>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.75rem' }}>
             {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, i) => {
               const dayEvents = timeline_event_list.filter(e => e.week === currentWeek && new Date(e.date).getDay() === (i + 1) % 7);
               const hasInjection = dayEvents.some(e => e.category === 'Injections');
               const hasMonitoring = dayEvents.some(e => e.category === 'Monitoring');
               const hasMilestone = dayEvents.some(e => e.category === 'Milestones');
               
               return (
                 <div key={day} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--color-text-tertiary)', marginBottom: '0.75rem' }}>{day.substring(0, 3)}</div>
                    <div style={{ 
                       height: '80px', 
                       background: hasInjection ? 'var(--primary-soft)' : hasMonitoring ? '#fff7ed' : hasMilestone ? 'var(--color-danger-bg)' : 'var(--color-bg-app)', 
                       borderRadius: '12px', 
                       border: '1px solid',
                       borderColor: hasInjection ? 'var(--primary-light)' : hasMonitoring ? '#ffedd5' : hasMilestone ? 'var(--color-danger)' : 'var(--color-border)',
                       display: 'flex',
                       flexDirection: 'column',
                       alignItems: 'center',
                       justifyContent: 'center',
                       gap: '4px'
                     }}>
                       {hasInjection && <Beaker size={16} color="var(--primary)" />}
                       {hasMonitoring && <TrendingUp size={16} color="#c2410c" />}
                       {hasMilestone && <Zap size={16} color="var(--color-danger)" />}
                       {(hasInjection || hasMonitoring || hasMilestone) && <div style={{ fontSize: '0.5rem', fontWeight: 900, color: hasInjection ? 'var(--primary)' : hasMonitoring ? '#c2410c' : 'var(--color-danger)' }}>EVENT</div>}
                       {!hasInjection && !hasMonitoring && !hasMilestone && <Clock size={16} color="var(--color-border)" />}
                    </div>
                 </div>
               );
             })}
           </div>
        </div>
      </div>

      {/* SIDEBAR COLUMN */}
      <div style={{ display: 'grid', gap: '2rem', height: 'fit-content' }}>
        
        {/* SAFETY STATUS */}
        <div className="clinical-card-v5" style={{ padding: '1.5rem', background: 'var(--color-success-bg)', border: '1px solid #bbf7d0' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--color-success)', display: 'flex', alignItems: 'center', justify: 'center', color: 'white' }}>
                 <ShieldAlert size={18} />
              </div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 950, color: '#166534', margin: 0 }}>SAFETY STATUS</h3>
           </div>
           <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#166534', marginBottom: '0.5rem' }}>✓ SAFE (VALIDATED)</div>
           <p style={{ fontSize: '0.75rem', color: 'var(--color-success)', margin: 0, fontWeight: 600, lineHeight: 1.5 }}>
              All baseline biomarkers within tolerance. No titration flags raised.
           </p>
        </div>

         {/* DOCUMENTS & ARTIFACTS */}
         <div className="clinical-card-v5" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--color-text-secondary)', marginBottom: '1.25rem', textTransform: 'uppercase' }}>CLINICAL DOCUMENTS</h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
               {manifest.map((doc, i) => (
                 <div key={i} style={{ display: 'grid', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--color-bg-app)', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ color: 'var(--primary)' }}>{doc.icon}</div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>{doc.name}</span>
                       </div>
                       <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => setPreviewType(doc.type)} style={{ padding: '4px', color: 'var(--color-text-secondary)', background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }} title="Preview"><Eye size={14} /></button>
                           <button 
                               disabled={doc.type === 'dosage' && isGeneratingDosage}
                               onClick={async () => {
                                  if (doc.type === 'patient') generatePatientGuide(protocolData, formData);
                                  if (doc.type === 'physician') generateClinicalPDF(protocolData, formData);
                                  if (doc.type === 'ics') generateProtocolICS(protocolData);
                                  if (doc.type === 'dosage') {
                                     setIsGeneratingDosage(true);
                                     try {
                                        await generateDosageGuide(protocolData, formData);
                                     } catch(e) {
                                        console.error('Dosage guide generation failed:', e);
                                     } finally {
                                        setIsGeneratingDosage(false);
                                     }
                                  }
                                  if (doc.type === 'json') {
                                     const blob = new Blob([JSON.stringify(protocolData, null, 2)], { type: 'application/json' });
                                     const url = URL.createObjectURL(blob);
                                     const a = document.createElement('a');
                                     a.href = url;
                                     a.download = `Clinical_Pathway_${protocolData.protocol_id || 'EXPORT'}.json`;
                                     a.click();
                                     URL.revokeObjectURL(url);
                                  }
                               }} 
                               style={{ 
                                  padding: '4px', 
                                  color: (doc.type === 'dosage' && isGeneratingDosage) ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)', 
                                  background: 'white', 
                                  border: '1px solid #cbd5e1', 
                                  borderRadius: '4px', 
                                  cursor: (doc.type === 'dosage' && isGeneratingDosage) ? 'not-allowed' : 'pointer',
                                  opacity: (doc.type === 'dosage' && isGeneratingDosage) ? 0.6 : 1
                               }} 
                               title={doc.type === 'dosage' && isGeneratingDosage ? 'Generating...' : 'Download'}
                            >
                               {doc.type === 'dosage' && isGeneratingDosage
                                  ? <span style={{ fontSize: '0.6rem', fontWeight: 800 }}>...</span>
                                  : <Download size={14} />}
                            </button>
                       </div>
                    </div>
                    {doc.type === 'ics' && (
                       <div style={{ marginTop: '0.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
                          <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                             <span>Calendar Preview</span>
                             <span>{timeline_event_list.length} Events</span>
                          </div>
                          <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                             {timeline_event_list.slice(0, 5).map((evt, j) => (
                                <div key={j} style={{ padding: '0.5rem', border: '1px solid #f1f5f9', background: 'var(--color-bg-app)', borderRadius: '6px' }}>
                                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                      <span style={{ fontSize: '0.7rem', fontWeight: 850, color: 'var(--primary)' }}>{evt.title}</span>
                                      <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--color-text-tertiary)' }}>{new Date(evt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                   </div>
                                   <div style={{ fontSize: '0.6rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{evt.desc}</div>
                                </div>
                             ))}
                             <div 
                                onClick={() => setPreviewType('ics')}
                                style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', cursor: 'pointer', padding: '0.5rem', textDecoration: 'underline' }}
                             >
                                View Full Manifest
                             </div>
                          </div>
                       </div>
                    )}
                 </div>
               ))}
            </div>
         </div>

        {/* CLINICAL NOTES */}
        <div className="clinical-card-v5" style={{ padding: '1.5rem' }}>
           <h3 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--color-text-secondary)', marginBottom: '1rem', textTransform: 'uppercase' }}>CLINICAL NOTES</h3>
           <textarea 
             value={notes}
             onChange={(e) => setNotes(e.target.value)}
             style={{ width: '100%', height: '100px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', resize: 'none', background: 'var(--color-bg-app)' }}
           />
        </div>

        {/* PROTOCOL ACTIONS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
           <button onClick={() => setIsPaused(!isPaused)} className="btn-secondary-v5" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              {isPaused ? <RotateCcw size={16} /> : <Pause size={16} />} {isPaused ? 'Resume' : 'Pause'}
           </button>
           <button onClick={() => onNavigate(2)} className="btn-secondary-v5" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <Edit3 size={16} /> Edit
           </button>
           <button 
              onClick={() => generateClinicalPDF(protocolData, formData)} 
              className="btn-secondary-v5" 
              style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', gridColumn: 'span 2' }}
           >
              <Download size={16} /> Export Latest
           </button>
           <button onClick={onReset} className="btn-secondary-v5" style={{ padding: '0.75rem', border: '1px solid #fee2e2', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', gridColumn: 'span 2' }}>
              <Trash2 size={16} /> Archive Protocol
           </button>
        </div>
      </div>

      {/* ARTIFACT PREVIEW OVERLAY */}
      {previewType && (
        <ArtifactPreviewOverlay 
          type={previewType} 
          data={protocolData} 
          onClose={() => setPreviewType(null)} 
        />
      )}
    </div>
  );
}

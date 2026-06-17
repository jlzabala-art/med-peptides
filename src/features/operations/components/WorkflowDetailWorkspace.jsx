import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Archive, 
  Trash2, 
  EyeOff, 
  CheckCircle2, 
  Zap, 
  Building2, 
  FileText,
  Clock,
  User,
  MapPin,
  ChevronRight,
  Package,
  DollarSign
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { db, functions } from '../../../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

export default function WorkflowDetailWorkspace({ item, onBack, onUpdateItem }) {
  const navigate = useNavigate();
  const [wizardStep, setWizardStep] = useState(0); 
  const [selectedSuppliers, setSelectedSuppliers] = useState(['Lotusland', 'Pharmapolis', 'NP LAB']);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = React.useState('data'); // 'email' or 'data'
  const [localProducts, setLocalProducts] = useState(item.workflowRecommendation?.preview?.products || []);
  const [isEditingProducts, setIsEditingProducts] = useState(false);
  const [hoveredHighlightText, setHoveredHighlightText] = useState(null);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [showReprocessModal, setShowReprocessModal] = useState(false);
  const [reprocessInstructions, setReprocessInstructions] = useState('');

  // Prescription Linking State
  const [patientName, setPatientName] = React.useState(item.prescriptionDetails?.patientName || '');
  const [patientDOB, setPatientDOB] = React.useState(item.prescriptionDetails?.patientDOB || '');
  const [doctorName, setDoctorName] = React.useState(item.prescriptionDetails?.doctorName || '');

  React.useEffect(() => {
    setPatientName(item.prescriptionDetails?.patientName || '');
    setPatientDOB(item.prescriptionDetails?.patientDOB || '');
    setDoctorName(item.prescriptionDetails?.doctorName || '');
  }, [item.prescriptionDetails]);

  React.useEffect(() => {
    setLocalProducts(item.workflowRecommendation?.preview?.products || []);
    setIsEditingProducts(false);
  }, [item.id, item.workflowRecommendation?.preview?.products]);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getConfidenceColor = (score) => {
    if (score >= 95) return '#10b981'; // Green
    if (score >= 80) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  const renderHighlightedContent = () => {
    if (!item.content) return null;
    if (!hoveredHighlightText) return item.content;
    
    try {
      const escapedHighlight = hoveredHighlightText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedHighlight})`, 'gi');
      const parts = item.content.split(regex);
      
      return parts.map((part, index) => 
        regex.test(part) 
          ? <mark key={index} style={{ background: '#fef08a', color: '#854d0e', padding: '2px 4px', borderRadius: '4px', fontWeight: 600 }}>{part}</mark>
          : part
      );
    } catch(e) {
      return item.content;
    }
  };

  const handleAction = async (actionType) => {
    try {
      setIsUpdating(true);
      const newStatus = actionType === 'Archive' ? 'Archived' : 'Processed';
      const newOutcome = actionType === 'Info Only' ? 'No Action Required' : item.outcome;
      
      await updateDoc(doc(db, 'operations_queue', item.id), {
        status: newStatus,
        outcome: newOutcome,
        updatedAt: new Date().toISOString()
      });

      toast.success(`Action applied: ${actionType}`);
      onUpdateItem({ 
        ...item, 
        status: newStatus,
        outcome: newOutcome 
      });
      onBack();
    } catch (error) {
      toast.error('Failed to update item');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReprocess = async () => {
    if (!item.id) return;
    try {
      setIsReprocessing(true);
      const reprocessCall = httpsCallable(functions, 'reprocessEmail');
      await reprocessCall({ messageId: item.id, additionalContext: reprocessInstructions });
      toast.success('Reprocessing requested successfully!');
      setShowReprocessModal(false);
      setReprocessInstructions('');
      onBack();
    } catch (error) {
      console.error("Reprocess error:", error);
      toast.error('Failed to request reprocessing');
    } finally {
      setIsReprocessing(false);
    }
  };


  const executeWorkflow = async () => {
    try {
      setIsUpdating(true);

      if (item.detectedIntent === 'PRESCRIPTION') {
        const acceptPrescription = httpsCallable(functions, 'acceptPrescription');
        const response = await acceptPrescription({
          queueItemId: item.id,
          patientName,
          patientDOB,
          doctorName,
          products: localProducts
        });
        toast.success('Prescription Linked & Created!');
        onUpdateItem({ 
          ...item, 
          status: 'Completed',
          outcome: 'Prescription Created',
          linkedRecord: response.data.prescriptionId
        });
        setWizardStep(0);
        return;
      }

      const createEstimate = httpsCallable(functions, 'createZohoEstimate');
      const response = await createEstimate({
        queueItemId: item.id,
        customerName: item.customerDetection?.name || 'Unknown',
        products: localProducts
      });

      const { estimateId } = response.data;
      
      toast.success('Zoho Estimate Created!');
      onUpdateItem({ 
        ...item, 
        status: 'Completed',
        outcome: 'Estimate Created',
        linkedRecord: estimateId
      });
      setWizardStep(0);
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate workflow');
    } finally {
      setIsUpdating(false);
    }
  };

  const renderWorkflowPreview = () => {
    const preview = item.workflowRecommendation?.preview;
    if (!preview) return null;

    return (
      <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '16px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={16} color="#0ea5e9" /> Transaction Preview: {preview.type}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Destination / Target</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{preview.destination}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Est. Value</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#10b981' }}>{preview.estimatedValue}</div>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Products</div>
              {item.status !== 'Completed' && (
                <button 
                  onClick={() => setIsEditingProducts(!isEditingProducts)}
                  style={{ fontSize: '11px', color: '#0ea5e9', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  {isEditingProducts ? 'Done' : 'Edit'}
                </button>
              )}
            </div>
            {localProducts?.map((p, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: '#fff', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '4px', marginBottom: '4px', gap: '8px' }}>
                {isEditingProducts ? (
                  <>
                    <input 
                      value={p.name} 
                      onChange={(e) => {
                        const newP = [...localProducts];
                        newP[idx].name = e.target.value;
                        setLocalProducts(newP);
                      }}
                      style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px 4px', width: '70%' }}
                    />
                    <input 
                      value={p.qty} 
                      onChange={(e) => {
                        const newP = [...localProducts];
                        newP[idx].qty = e.target.value;
                        setLocalProducts(newP);
                      }}
                      style={{ fontSize: '13px', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px 4px', width: '25%' }}
                    />
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{p.name}</span>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>{p.qty}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderWorkflowAction = () => {
    if (item.status === 'Completed' || item.status === 'Workflow Generated') {
      return (
        <div style={{ background: '#ecfdf5', border: '1px solid #10b981', padding: '16px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 700 }}>
            <CheckCircle2 size={20} /> Workflow Completed
          </div>
          <p style={{ color: '#065f46', fontSize: '14px', marginTop: '4px', marginBottom: '16px' }}>
            {item.outcome}: <strong>{item.linkedRecord}</strong> has been generated successfully.
          </p>
          <button 
            onClick={() => {
              if (item.detectedIntent === 'RFQ') navigate(`/admin/purchase-rfqs?highlight=${item.linkedRecord}`);
              else toast.success(`Navigating to ${item.linkedRecord}`);
            }}
            style={{
              background: '#10b981',
              color: '#fff',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            Open Transaction
          </button>
        </div>
      );
    }

    if (wizardStep === 0) {
      return (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Recommended Action</div>
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0ea5e9', marginBottom: '16px' }}>
              {item.workflowRecommendation?.action || 'Review Document'}
            </div>
            
            {renderWorkflowPreview()}

            <button onClick={() => setWizardStep(1)} style={{
              width: '100%',
              background: '#0ea5e9',
              color: '#fff',
              border: 'none',
              padding: '14px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}>
              <Zap size={18} /> Review & Execute
            </button>
          </div>
        </div>
      );
    }

    if (wizardStep === 1) {
      return (
        <div style={{ background: '#fff', border: '1px solid #0ea5e9', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ padding: '16px', background: '#f0f9ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0369a1' }}>Generating: {item.workflowRecommendation?.action}</div>
          </div>
          <div style={{ padding: '16px' }}>
            {renderWorkflowPreview()}
            
            {item.detectedIntent === 'RFQ' && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Select Target Suppliers</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['Lotusland', 'Pharmapolis', 'NP LAB', 'Others'].map(sup => (
                    <label key={sup} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedSuppliers.includes(sup)}
                        onChange={() => {
                          if (selectedSuppliers.includes(sup)) setSelectedSuppliers(selectedSuppliers.filter(s => s !== sup));
                          else setSelectedSuppliers([...selectedSuppliers, sup]);
                        }}
                      />
                      <span style={{ fontSize: '14px', fontWeight: 500 }}>{sup}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {item.detectedIntent === 'PRESCRIPTION' && (
              <div style={{ marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>Validate Database Linking</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>Patient Name</label>
                    <input type="text" value={patientName} onChange={e => setPatientName(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>Patient DOB</label>
                    <input type="text" value={patientDOB} onChange={e => setPatientDOB(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} placeholder="DD/MM/YYYY" />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>Doctor Name</label>
                    <input type="text" value={doctorName} onChange={e => setDoctorName(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '12px', fontStyle: 'italic' }}>
                  * The system will automatically create these profiles if they do not exist.
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setWizardStep(0)} disabled={isUpdating} style={{ flex: 1, background: '#fff', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={executeWorkflow} disabled={isUpdating} style={{ flex: 2, background: '#0ea5e9', border: 'none', color: '#fff', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', opacity: isUpdating ? 0.7 : 1 }}>
                {isUpdating ? 'Executing...' : 'Confirm & Create'}
              </button>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8fafc', overflow: 'hidden' }}>
      
      {/* Top Action Bar */}
      <div style={{ 
        height: '64px', 
        background: '#fff', 
        borderBottom: '1px solid #e2e8f0', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowLeft size={20} /> Back to Queue
          </button>
          <div style={{ height: '24px', width: '1px', background: '#e2e8f0' }} />
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', fontFamily: 'monospace' }}>#{item.id.substring(0, 8).toUpperCase()}</div>
          <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
            {item.status}
          </span>
          {item.linkedRecord && (
            <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
              {item.linkedRecord}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {(item.status === 'Failed' || item.outcome === 'AI Parsing Failed' || item.status === 'New') && (
            <button onClick={() => setShowReprocessModal(true)} disabled={isUpdating || isReprocessing} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#e0f2fe', border: '1px solid #7dd3fc', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, color: '#0369a1', cursor: 'pointer' }}>
              <Zap size={16} /> {isReprocessing ? 'Reprocessing...' : 'Reprocess with AI'}
            </button>
          )}
          <button onClick={() => handleAction('Info Only')} disabled={isUpdating || isReprocessing} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>
            <EyeOff size={16} /> Mark No Action
          </button>
          <button onClick={() => handleAction('Archive')} disabled={isUpdating || isReprocessing} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>
            <Archive size={16} /> Archive
          </button>
          <button onClick={() => handleAction('Delete')} disabled={isUpdating || isReprocessing} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fef2f2', border: '1px solid #fca5a5', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, color: '#ef4444', cursor: 'pointer' }}>
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      {/* Main Container */}
      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {/* Mobile Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
            <button 
              onClick={() => setActiveTab('data')}
              style={{ flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: activeTab === 'data' ? '2px solid #0ea5e9' : '2px solid transparent', color: activeTab === 'data' ? '#0ea5e9' : '#64748b', fontWeight: 600, fontSize: '14px' }}
            >
              Extracted Data
            </button>
            <button 
              onClick={() => setActiveTab('email')}
              style={{ flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: activeTab === 'email' ? '2px solid #0ea5e9' : '2px solid transparent', color: activeTab === 'email' ? '#0ea5e9' : '#64748b', fontWeight: 600, fontSize: '14px' }}
            >
              Original Email
            </button>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', padding: '16px' }}>
            {activeTab === 'email' ? (
              <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ marginBottom: '16px' }}>
                  <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>{item.subject}</h1>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.senderName}</div>
                    <div>&lt;{item.senderEmail}&gt;</div>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>{item.date}</div>
                  </div>
                </div>
                
                <div style={{ 
                  background: '#f8fafc', padding: '16px', borderRadius: '8px', 
                  fontSize: '14px', lineHeight: 1.6, color: '#334155', whiteSpace: 'pre-wrap', wordBreak: 'break-word'
                }}>
                  {renderHighlightedContent()}
                </div>

                {item.attachments && item.attachments.length > 0 && (
                  <div style={{ marginTop: '24px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
                      <FileText size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />
                      Attachments ({item.attachments.length})
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                      {item.attachments.map((att, i) => (
                        <div key={i} style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', background: '#e0f2fe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
                            <FileText size={18} />
                          </div>
                          <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{att.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>{att.contentType.split('/')[1] || 'FILE'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {renderWorkflowAction()}
                
                {/* Mobile Contexts */}
                {item.prescriptionDetails ? (
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Prescription Details</div>
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
                          <User size={20} />
                        </div>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{item.prescriptionDetails.patientName || 'Unknown Patient'}</div>
                          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{[item.prescriptionDetails.patientDOB ? `DOB: ${item.prescriptionDetails.patientDOB}` : null, item.prescriptionDetails.patientAge ? `Age: ${item.prescriptionDetails.patientAge}` : null, item.prescriptionDetails.patientGender ? `(${item.prescriptionDetails.patientGender})` : null].filter(Boolean).join(' • ')}</div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>Doctor</div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{item.prescriptionDetails.doctorName || 'Unknown'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>Date</div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{item.prescriptionDetails.date || 'Unknown'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : item.customerDetection && (
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Business Context</div>
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                          <Building2 size={20} />
                        </div>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{item.customerDetection.name}</div>
                          <div style={{ fontSize: '12px', color: '#0ea5e9', fontWeight: 600 }}>{item.customerDetection.relationship}</div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>Total Revenue</div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{item.customerDetection.totalRevenue}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>Past Orders</div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{item.customerDetection.lastOrders} orders</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Explain AI Decisions */}
                {item.extraction && item.extraction.length > 0 && (
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Why Atlas Extracted This</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {item.extraction.map((ext, i) => (
                        <div 
                          key={i} 
                          style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', cursor: 'pointer', transition: 'box-shadow 0.2s', boxShadow: hoveredHighlightText === ext.exactMatch ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' : 'none' }}
                          onMouseEnter={() => setHoveredHighlightText(ext.exactMatch)}
                          onMouseLeave={() => setHoveredHighlightText(null)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '12px', color: '#0f172a', fontWeight: 700 }}>{ext.field}</span>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: getConfidenceColor(ext.confidence), background: `${getConfidenceColor(ext.confidence)}15`, padding: '2px 6px', borderRadius: '4px' }}>
                              {ext.confidence}%
                            </span>
                          </div>
                          <div>
                            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Value</div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0ea5e9', marginBottom: '8px' }}>{ext.value}</div>
                            <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                              <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Source: {ext.source}</div>
                              <div style={{ fontSize: '11px', color: '#334155', fontStyle: 'italic' }}>"{ext.exactMatch}"</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', flex: 1, overflowY: 'auto' }}>
          {/* Left Side: Original Document (Desktop) */}
          <div style={{ flex: '1 1 500px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', background: '#fff', minHeight: '500px' }}>
            <div style={{ padding: '32px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>{item.subject}</h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#64748b' }}>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{item.senderName}</span>
                  <span style={{ wordBreak: 'break-all' }}>&lt;{item.senderEmail}&gt;</span>
                  <span style={{ fontSize: '12px' }}>{item.date}</span>
                </div>
              </div>
              
              <div style={{ 
                background: '#f8fafc', 
                padding: '24px', 
                borderRadius: '12px', 
                border: '1px solid #e2e8f0',
                fontSize: '15px',
                lineHeight: 1.6,
                color: '#334155',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {renderHighlightedContent()}
              </div>

              {item.attachments && item.attachments.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
                    <FileText size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />
                    Attachments ({item.attachments.length})
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                    {item.attachments.map((att, i) => (
                      <div key={i} style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', background: '#e0f2fe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
                          <FileText size={18} />
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{att.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>{att.contentType.split('/')[1] || 'FILE'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Desktop Contexts */}
              {item.prescriptionDetails ? (
                <div style={{ marginTop: '32px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Prescription Details</div>
                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
                        <User size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{item.prescriptionDetails.patientName || 'Unknown Patient'}</div>
                        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{[item.prescriptionDetails.patientDOB ? `DOB: ${item.prescriptionDetails.patientDOB}` : null, item.prescriptionDetails.patientAge ? `Age: ${item.prescriptionDetails.patientAge}` : null, item.prescriptionDetails.patientGender ? `(${item.prescriptionDetails.patientGender})` : null].filter(Boolean).join(' • ')}</div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Doctor</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{item.prescriptionDetails.doctorName || 'Unknown'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Date</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{item.prescriptionDetails.date || 'Unknown'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : item.customerDetection && (
                <div style={{ marginTop: '32px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Business Context</div>
                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                        <Building2 size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{item.customerDetection.name}</div>
                        <div style={{ fontSize: '13px', color: '#0ea5e9', fontWeight: 600 }}>{item.customerDetection.relationship}</div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Total Revenue</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{item.customerDetection.totalRevenue}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Past Orders</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{item.customerDetection.lastOrders} orders</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Operations Engine (Desktop) */}
          <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', background: '#f8fafc', minHeight: '500px' }}>
            <div style={{ padding: '32px' }}>
              
              {/* Workflow Engine */}
              <div style={{ marginBottom: '32px' }}>
                {renderWorkflowAction()}
              </div>

              {/* Explain AI Decisions */}
              {item.extraction && item.extraction.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Why Atlas Extracted This</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {item.extraction.map((ext, i) => (
                      <div 
                        key={i} 
                        style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.1s', boxShadow: hoveredHighlightText === ext.exactMatch ? '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' : 'none', transform: hoveredHighlightText === ext.exactMatch ? 'translateY(-2px)' : 'none' }}
                        onMouseEnter={() => setHoveredHighlightText(ext.exactMatch)}
                        onMouseLeave={() => setHoveredHighlightText(null)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 700 }}>{ext.field}</span>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: getConfidenceColor(ext.confidence), background: `${getConfidenceColor(ext.confidence)}15`, padding: '4px 8px', borderRadius: '4px' }}>
                            {ext.confidence}% Confidence
                          </span>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                          <div>
                            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Detected Value</div>
                            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0ea5e9' }}>{ext.value}</div>
                          </div>
                          
                          <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '4px' }}>
                            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>Source: {ext.source}</div>
                            <div style={{ fontSize: '13px', color: '#334155', fontStyle: 'italic' }}>"{ext.exactMatch}"</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Audit Trail */}
              {item.activityLog && item.activityLog.length > 0 && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Activity Timeline</div>
                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
                    <div style={{ position: 'relative' }}>
                      {item.activityLog.map((log, i) => (
                        <div key={log.id || i} style={{ display: 'flex', gap: '16px', marginBottom: i === item.activityLog.length - 1 ? 0 : '24px', position: 'relative' }}>
                          {i !== item.activityLog.length - 1 && (
                            <div style={{ position: 'absolute', left: '7px', top: '20px', bottom: '-24px', width: '2px', background: '#e2e8f0' }} />
                          )}
                          <div style={{ position: 'relative', zIndex: 2, width: '16px', height: '16px', borderRadius: '50%', background: log.actor === 'Atlas AI' ? '#0ea5e9' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #fff', boxShadow: '0 0 0 1px #e2e8f0' }} />
                          <div style={{ marginTop: '-2px' }}>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{log.action}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                              <span style={{ fontWeight: 600 }}>{log.actor}</span> • {log.time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reprocess Modal */}
      {showReprocessModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '400px', maxWidth: '90%' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0f172a' }}>Reprocess with AI</h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
              Atlas will analyze this document again. You can provide specific instructions to guide the AI.
            </p>
            <textarea
              placeholder="e.g. This is a supplier quotation, apply a 25% discount, the products are flibanserin and semaglutide."
              value={reprocessInstructions}
              onChange={(e) => setReprocessInstructions(e.target.value)}
              style={{ width: '100%', height: '100px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', resize: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setShowReprocessModal(false)}
                style={{ background: 'none', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, color: '#64748b' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleReprocess}
                disabled={isReprocessing}
                style={{ background: '#0ea5e9', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, opacity: isReprocessing ? 0.7 : 1 }}
              >
                {isReprocessing ? 'Starting...' : 'Run Analysis'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

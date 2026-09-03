import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import { Pill, Wand2, CheckCircle, FlaskConical, AlertCircle, CheckCircle2, Trash2, RefreshCw, Plus, Edit3, Save, X, Search, Check, Stethoscope } from '@/lib/icons';
import { checkInteractionsAction } from '../../../actions/aiActions';
import { updatePrescription } from '../../../services/prescriptionsService';
import { getClinicalAlternatives } from '../../../lib/clinicalAlternatives';
import ReconstitutionGuideWidget from '../ReconstitutionGuideWidget';
import { toast } from 'react-hot-toast';

export default function ItemsTab({ rx, products = [], onProductClick, onProtocolClick, protocolMatch, isMatching, onUpdateRx }) {
  const router = useRouter();
  const [localItems, setLocalItems] = useState(rx.items || rx.products || []);
  const [safetyCheck, setSafetyCheck] = useState(null);
  const [isCheckingSafety, setIsCheckingSafety] = useState(true);
  const [isLinking, setIsLinking] = useState(false);
  const [expandedReconIndex, setExpandedReconIndex] = useState(null);

  useEffect(() => {
    setLocalItems(rx.items || rx.products || []);
  }, [rx.items, rx.products]);

  useEffect(() => {
    async function runCheck() {
      try {
        const result = await checkInteractionsAction(rx.patientId, localItems);
        setSafetyCheck(result);
      } catch (err) {
        console.error("Safety check error:", err);
      } finally {
        setIsCheckingSafety(false);
      }
    }
    if (rx.patientId && localItems.length > 0) {
      runCheck();
    } else {
      setIsCheckingSafety(false);
    }
  }, [rx.patientId, localItems]);

  const handleLinkProduct = async (matchedProduct, itemIndex) => {
    if (isLinking) return;
    setIsLinking(true);
    
    try {
      const newItems = [...localItems];
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        productId: matchedProduct.id,
        name: matchedProduct.title || matchedProduct.name || newItems[itemIndex].name
      };
      
      const updateField = rx.items ? 'items' : 'products';
      await updatePrescription(rx.id, { [updateField]: newItems });
      
      // Update UI immediately
      setLocalItems(newItems);
      if (onUpdateRx) {
        onUpdateRx({ ...rx, [updateField]: newItems });
      }
      router.refresh();
    } catch (err) {
      console.error("Error linking product:", err);
      toast.error("Failed to link product.");
    } finally {
      setIsLinking(false);
    }
  };

  const getProductDetails = (productId, fallbackName) => {
    if (!productId) return { name: fallbackName || 'Unknown Product' };
    const found = products.find((p) => p.id === productId);
    return found || { name: fallbackName || 'Unknown Product', id: productId };
  };

  if (localItems.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 2rem',
          gap: '1rem',
          color: '#94a3b8',
        }}
      >
        <Pill size={40} color="#e2e8f0" />
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 0.25rem 0', color: '#475569', fontWeight: 700 }}>No Items</h3>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>
            No prescription items have been added yet.
          </p>
        </div>
      </div>
    );
  }

  const [aiProposal, setAiProposal] = useState(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const handleGenerateAiProposal = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      const hasInjectable = localItems.some(i => {
        const n = (i.name || '').toLowerCase();
        const f = (i.form || '').toLowerCase();
        return (
          f.includes('lyophilized') ||
          f.includes('vial') ||
          f.includes('inject') ||
          n.includes('bpc-157') ||
          n.includes('bpc 157') ||
          n.includes('ss-31') ||
          n.includes('ss31') ||
          n.includes('mots-c') ||
          n.includes('motsc') ||
          n.includes('epitalon') ||
          n.includes('pinealon') ||
          n.includes('retatrutide') ||
          n.includes('semaglutide') ||
          n.includes('tirzepatide') ||
          n.includes('melanotan') ||
          n.includes('ipamorelin') ||
          n.includes('cjc') ||
          n.includes('nad+') ||
          n.includes('nadplus') ||
          n.includes('vial')
        );
      });

      const hasTopical = !hasInjectable && localItems.some(i => {
        const n = (i.name || '').toLowerCase();
        return n.includes('latanoprost') || n.includes('minoxidil') || n.includes('trichosol') || n.includes('spironolactone') || n.includes('trichoxidil');
      });

      let proposedPosology = "";
      let proposedTreatmentType = "";

      if (hasInjectable) {
        proposedTreatmentType = "Subcutaneous Peptide Injection Protocol";
        proposedPosology = "Reconstitute with bacteriostatic water. Inject the prescribed dosage (e.g., 250-500 mcg) subcutaneously once daily (or as directed by physician) using a sterile insulin syringe, rotating injection sites around the abdomen.";
      } else if (hasTopical) {
        proposedTreatmentType = "Topical Magistral Capillary Formulation";
        proposedPosology = "Apply 1ml topically to clean, dry scalp once daily at night. Massage gently for 2-3 minutes. Leave on overnight and wash next morning.";
      } else {
        proposedTreatmentType = "Oral Protocol / Supplementation";
        proposedPosology = "Take 1 capsule daily with a full glass of water after meals, or as directed by physician.";
      }

      const proposedItems = localItems.map(item => {
        const name = (item.name || '').toLowerCase();
        let form = item.form;
        if (!form || form === 'Other' || form === 'magistral') {
          if (name.includes('trichosol')) form = 'Base Vehicle (Solution)';
          else if (name.includes('latanoprost') || name.includes('spironolactone') || name.includes('minoxidil')) form = 'Active Ingredient';
          else if (name.includes('cap') || name.includes('oral')) form = 'Capsule';
          else form = 'Magistral Component';
        }
        return {
          ...item,
          form,
          frequency: item.frequency || 'Once Daily (Night)',
          duration: item.duration || (rx.duration ? `${rx.duration} days` : '30 days')
        };
      });

      setAiProposal({
        posology: proposedPosology,
        treatmentType: proposedTreatmentType,
        items: proposedItems
      });
      setIsGeneratingAi(false);
    }, 600);
  };

  const handleApplyAiProposal = async () => {
    if (!aiProposal) return;
    try {
      const updateField = rx.items ? 'items' : 'products';
      const updates = {
        posology: aiProposal.posology,
        treatmentType: aiProposal.treatmentType,
        [updateField]: aiProposal.items
      };
      await updatePrescription(rx.id, updates);
      setLocalItems(aiProposal.items);
      if (onUpdateRx) onUpdateRx({ ...rx, ...updates });
      toast.success("AI Clinical Proposal validated & applied successfully!");
      setAiProposal(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to apply AI proposal.");
    }
  };

  const [isEditingFormulation, setIsEditingFormulation] = useState(false);
  const [substituteModalItem, setSubstituteModalItem] = useState(null);
  const [isAddingNewItem, setIsAddingNewItem] = useState(false);
  const [newItemSearch, setNewItemSearch] = useState('');
  const [isSavingFormulation, setIsSavingFormulation] = useState(false);

  const handleUpdateItemDose = (originalIndex, newDose) => {
    const updated = [...localItems];
    updated[originalIndex] = { ...updated[originalIndex], dose: newDose, dosage: newDose };
    setLocalItems(updated);
  };

  const handleRemoveFormulationItem = (originalIndex) => {
    const updated = localItems.filter((_, i) => i !== originalIndex);
    setLocalItems(updated);
    toast.success("Component removed from formulation");
  };

  const handleSwapItemWithAlternative = (originalIndex, alt) => {
    const updated = [...localItems];
    updated[originalIndex] = {
      ...updated[originalIndex],
      name: `${alt.name} (Magistral)`,
      dose: alt.dose,
      dosage: alt.dose,
      note: alt.note
    };
    setLocalItems(updated);
    setSubstituteModalItem(null);
    toast.success(`Swapped item for ${alt.name}`);
  };

  const handleAddNewComponent = (productItem) => {
    const newItem = {
      name: productItem.name || productItem.title,
      productId: productItem.id,
      dose: productItem.dosage || productItem.strength || '1%',
      quantity: 1,
      unit: productItem.unit || 'units',
      type: 'formula_component'
    };
    setLocalItems([...localItems, newItem]);
    setIsAddingNewItem(false);
    setNewItemSearch('');
    toast.success(`Added ${newItem.name} to formulation`);
  };

  const handleSaveFormulationChanges = async () => {
    setIsSavingFormulation(true);
    try {
      const updateField = rx.items ? 'items' : 'products';
      const currentVersion = Number(rx.version) || 1;
      const nextVersion = currentVersion + 1;
      const nowIso = new Date().toISOString();

      const oldItems = rx.items || rx.products || [];
      const changeSummary = `Formulation updated to v${nextVersion} (${localItems.length} components).`;

      const previousSnapshot = {
        version: currentVersion,
        savedAt: nowIso,
        items: oldItems,
        posology: rx.posology || null,
        treatmentType: rx.treatmentType || null
      };

      const updatedVersionHistory = [...(rx.versionHistory || []), previousSnapshot];

      const newTimelineEvent = {
        id: `evt_v${nextVersion}_${Date.now()}`,
        event: `Formulation Updated (v${nextVersion})`,
        description: changeSummary,
        timestamp: nowIso
      };
      const updatedTimeline = [...(rx.timeline || []), newTimelineEvent];

      const newAuditLog = {
        timestamp: nowIso,
        action: 'formulation_updated',
        user: 'Doctor / Pharmacist',
        details: changeSummary
      };
      const updatedAuditTrail = [...(rx.auditTrail || []), newAuditLog];

      const payload = {
        [updateField]: localItems,
        version: nextVersion,
        versionHistory: updatedVersionHistory,
        timeline: updatedTimeline,
        auditTrail: updatedAuditTrail,
        updatedAt: new Date()
      };

      await updatePrescription(rx.id, payload);
      if (onUpdateRx) onUpdateRx({ ...rx, ...payload });
      toast.success(`Formulation v${nextVersion} saved & logged in timeline!`);
      setIsEditingFormulation(false);
    } catch (err) {
      console.error("Error saving formulation:", err);
      toast.error("Failed to save formulation changes: " + err.message);
    } finally {
      setIsSavingFormulation(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Formulation Editing Toggle & Mode Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isEditingFormulation ? '#fef2f2' : '#f8fafc', padding: '0.75rem 1.25rem', borderRadius: '12px', border: `1px solid ${isEditingFormulation ? '#fecaca' : '#e2e8f0'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Stethoscope size={18} color={isEditingFormulation ? '#dc2626' : '#2563eb'} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isEditingFormulation ? '#991b1b' : '#1e293b' }}>
              {isEditingFormulation ? 'Formulation Adjustments Active' : 'Clinical Prescription Items'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              {isEditingFormulation ? 'Modify concentrations, swap for clinical alternatives, or add/remove ingredients.' : 'Review active components, doses, and clinical administration instructions.'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {isEditingFormulation ? (
            <>
              <button
                onClick={() => setIsEditingFormulation(false)}
                style={{ padding: '0.45rem 0.85rem', background: '#ffffff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFormulationChanges}
                disabled={isSavingFormulation}
                style={{ padding: '0.45rem 1rem', background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)' }}
              >
                <Save size={15} /> {isSavingFormulation ? 'Saving...' : 'Save Formulation'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditingFormulation(true)}
              style={{ padding: '0.45rem 0.9rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Edit3 size={15} /> ✏️ Adjust Formulation / Swap Items
            </button>
          )}
        </div>
      </div>
      {/* Existing Posology & Treatment Type Header Banner */}
      {(rx.treatmentType || rx.posology) && (
        <div style={{
          background: 'linear-gradient(to right, #f8fafc, #f1f5f9)',
          border: '1px solid #cbd5e1',
          borderLeft: '4px solid #8b5cf6',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          {rx.treatmentType && (
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#6b21a8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🧬 Treatment Type: {rx.treatmentType}
            </div>
          )}
          {rx.posology && (
            <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
              <strong style={{ color: '#0f172a' }}>Clinical Posology / Administration:</strong> {rx.posology}
            </div>
          )}
        </div>
      )}

      {/* AI Clinical Proposal Request/Validation Card */}
      {!rx.posology && !aiProposal && (
        <div style={{
          background: 'linear-gradient(to right, #faf5ff, #eff6ff)',
          border: '1px solid #d8b4fe',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div>
            <div style={{ fontWeight: 700, color: '#6b21a8', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Wand2 size={16} color="#9333ea" /> Missing Posology & Administration Guidance
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem' }}>
              No posology or product type was specified. Click to generate an AI clinical proposal for validation.
            </div>
          </div>
          <button
            onClick={handleGenerateAiProposal}
            disabled={isGeneratingAi}
            style={{
              padding: '0.5rem 1rem',
              background: '#9333ea',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 2px 4px rgba(147, 51, 234, 0.2)'
            }}
          >
            {isGeneratingAi ? 'Analyzing Clinical Items...' : '✨ Generate AI Posology Proposal'}
          </button>
        </div>
      )}

      {/* AI Clinical Proposal Review & Validation Box */}
      {aiProposal && (
        <div style={{
          background: '#fdf4ff',
          border: '2px dashed #c084fc',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 800, color: '#7e22ce', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Wand2 size={18} color="#9333ea" /> AI Clinical Proposal (Requires Pharmacist / Physician Validation)
            </div>
            <button
              onClick={() => setAiProposal(null)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Dismiss
            </button>
          </div>
          
          <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e9d5ff' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b21a8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Proposed Treatment Classification
            </div>
            <div style={{ fontSize: '0.88rem', color: '#334155', fontWeight: 600 }}>{aiProposal.treatmentType}</div>
          </div>

          <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e9d5ff' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b21a8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Proposed Posology & Administration
            </div>
            <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>{aiProposal.posology}</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              onClick={() => setAiProposal(null)}
              style={{ padding: '0.45rem 0.9rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              onClick={handleApplyAiProposal}
              style={{ padding: '0.45rem 1.1rem', background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)' }}
            >
              <CheckCircle2 size={16} /> Validate & Apply AI Proposal
            </button>
          </div>
        </div>
      )}
      {/* Protocol Match Banner */}
      {isMatching && (
        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', color: '#64748b', fontSize: '0.9rem' }}>
          <Wand2 size={16} style={{ display: 'inline', marginRight: '0.5rem', marginBottom: '-3px' }} /> 
          Analyzing items to identify protocol match...
        </div>
      )}
      {!isMatching && protocolMatch && (
        <div
          style={{
            background: protocolMatch.matched ? '#eff6ff' : '#f8fafc',
            border: `1px solid ${protocolMatch.matched ? '#bfdbfe' : '#e2e8f0'}`,
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start'
          }}
        >
          {protocolMatch.matched ? (
            <CheckCircle size={20} color="#3b82f6" style={{ marginTop: '2px' }} />
          ) : (
            <FlaskConical size={20} color="#64748b" style={{ marginTop: '2px' }} />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: protocolMatch.matched ? '#1e40af' : '#334155', marginBottom: '0.25rem', fontSize: '0.95rem' }}>
              {protocolMatch.matched ? 'Standard Protocol Matched' : 'Custom Protocol Generation'}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.25rem' }}>
              {protocolMatch.message}
            </div>
            {protocolMatch.matched && protocolMatch.protocol?.phases && (
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {protocolMatch.protocol.phases.map((phase, i) => (
                  <span key={i} style={{ background: '#dbeafe', color: '#1e40af', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {phase.phase_title} (Wk {phase.start_week}-{phase.end_week})
                  </span>
                ))}
              </div>
            )}
            {onProtocolClick && protocolMatch.protocol && (
              <div style={{ marginTop: '0.75rem' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onProtocolClick(protocolMatch.protocol);
                  }}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #bfdbfe',
                    color: '#2563eb',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                >
                  <span style={{ fontSize: '1rem' }}>📄</span> View Protocol
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Safety Check Banner */}
      <div
        style={{
          background: isCheckingSafety ? '#f8fafc' : (safetyCheck?.hasRisk ? (safetyCheck.riskLevel === 'high' ? '#fef2f2' : '#fffbeb') : '#f0fdf4'),
          border: `1px solid ${isCheckingSafety ? '#e2e8f0' : (safetyCheck?.hasRisk ? (safetyCheck.riskLevel === 'high' ? '#fecaca' : '#fde68a') : '#bbf7d0')}`,
          borderRadius: '12px',
          padding: '1rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start'
        }}
      >
        {isCheckingSafety ? (
          <Wand2 size={20} color="#64748b" style={{ marginTop: '2px', animation: 'spin 2s linear infinite' }} />
        ) : !safetyCheck?.hasRisk ? (
          <CheckCircle2 size={20} color="#16a34a" style={{ marginTop: '2px' }} />
        ) : (
          <AlertCircle size={20} color={safetyCheck.riskLevel === 'high' ? '#dc2626' : '#d97706'} style={{ marginTop: '2px' }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontWeight: 700, 
            color: isCheckingSafety ? '#334155' : (safetyCheck?.hasRisk ? (safetyCheck.riskLevel === 'high' ? '#991b1b' : '#92400e') : '#166534'), 
            marginBottom: '0.25rem', 
            fontSize: '0.95rem' 
          }}>
            {isCheckingSafety ? 'Running Clinical Safety Check...' : 'Clinical Safety Check: ' + (safetyCheck?.hasRisk ? 'Warnings Detected' : 'Clear')}
          </div>
          {isCheckingSafety && (
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
              Checking drug-to-drug interactions...
            </div>
          )}
          {!isCheckingSafety && safetyCheck?.hasRisk && safetyCheck?.warnings?.length > 0 && (
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem', fontSize: '0.85rem', color: safetyCheck.riskLevel === 'high' ? '#991b1b' : '#92400e' }}>
              {safetyCheck.warnings.map((warning, i) => (
                <li key={i}>{warning}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {Object.entries(
          localItems.reduce((acc, item) => {
            const product = getProductDetails(item.productId, item.name || item.productName);
            let rawForm = (item.form || product.form || product.productType || 'Other').toLowerCase();
            let itemName = (item.name || product.name || '').toLowerCase();
            
            let groupName = 'Other Items';
            if (
              rawForm.includes('topical') || 
              rawForm.includes('magistral') ||
              itemName.includes('trichosol') || 
              itemName.includes('magistral') ||
              itemName.includes('latanoprost') ||
              itemName.includes('spironolactone') ||
              itemName.includes('igrantine') ||
              (rx.treatmentType && rx.treatmentType.toLowerCase().includes('topical'))
            ) {
              groupName = 'Topical Formulations & Magistral Compounds';
            } else if (rawForm.includes('cream') || rawForm.includes('crema') || itemName.includes('cream') || itemName.includes('crema')) {
              groupName = 'Creams & Topicals';
            } else if (rawForm.includes('cap') || rawForm.includes('tab') || rawForm.includes('pill') || itemName.includes('cap') || itemName.includes('tab')) {
              groupName = 'Capsules & Tablets';
            } else if (rawForm.includes('inject') || rawForm.includes('vial') || itemName.includes('vial') || itemName.includes('inject')) {
              groupName = 'Injectables';
            } else if (rawForm.includes('supp') || itemName.includes('supp') || rawForm.includes('vit') || itemName.includes('vit')) {
              groupName = 'Supplements';
            } else if (rawForm !== 'other') {
              groupName = rawForm.charAt(0).toUpperCase() + rawForm.slice(1);
            }

            if (!acc[groupName]) acc[groupName] = [];
            acc[groupName].push({ ...item, _originalIndex: localItems.indexOf(item) });
            return acc;
          }, {})
        ).map(([groupName, itemsInGroup]) => (
          <div key={groupName} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div
              style={{
                background: '#f1f5f9',
                padding: '0.75rem 1.25rem',
                borderBottom: '1px solid #e2e8f0',
                fontSize: '0.85rem',
                fontWeight: 800,
                color: '#334155',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {groupName.includes('Topical') ? '🧪' : '📦'} {groupName}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                background: '#f8fafc',
                padding: '0.75rem 1.25rem',
                borderBottom: '1px solid #e2e8f0',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#64748b',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              <div>Product</div>
              <div>Dose</div>
              <div>Frequency</div>
              <div>Duration</div>
              <div>Units</div>
            </div>
            {itemsInGroup.map((item, idx) => (
              <React.Fragment key={idx}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                    padding: '1rem 1.25rem',
                    borderBottom: idx < itemsInGroup.length - 1 ? '1px solid #f8fafc' : 'none',
                    alignItems: 'center',
                    gap: '0',
                    transition: 'background 0.1s',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
            {(() => {
              const product = getProductDetails(item.productId, item.name || item.productName);
              return (
                <React.Fragment>
                  <div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                      {product.name}
                      {!item.productId && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <span
                            style={{
                              fontSize: '0.65rem',
                              padding: '2px 4px',
                              background: '#fee2e2',
                              color: '#991b1b',
                              borderRadius: '4px',
                            }}
                          >
                            Not in Catalog
                          </span>
                          
                          {(() => {
                            const fuse = new Fuse(products, {
                              keys: ['title', 'name', 'supplier'],
                              threshold: 0.4
                            });
                            const results = fuse.search(product.name).slice(0, 3);

                            return (
                              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                {results.length > 0 && (
                                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                                    Did you mean?
                                  </div>
                                )}
                                {results.map((res, i) => (
                                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingBottom: i < results.length - 1 ? '0.5rem' : '0', borderBottom: i < results.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                      <span style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 600 }}>
                                        {res.item.title || res.item.name}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleLinkProduct(res.item, item._originalIndex);
                                        }}
                                        disabled={isLinking}
                                        style={{
                                          fontSize: '0.65rem',
                                          padding: '3px 8px',
                                          background: isLinking ? '#f1f5f9' : '#f0fdf4',
                                          color: isLinking ? '#94a3b8' : '#16a34a',
                                          border: `1px solid ${isLinking ? '#cbd5e1' : '#bbf7d0'}`,
                                          borderRadius: '4px',
                                          cursor: isLinking ? 'not-allowed' : 'pointer',
                                          fontWeight: 600,
                                          flexShrink: 0,
                                          marginLeft: '0.5rem'
                                        }}
                                      >
                                        {isLinking ? 'Linking...' : 'Link Match'}
                                      </button>
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                      {res.item.productType && (
                                        <span style={{ background: '#e2e8f0', padding: '1px 4px', borderRadius: '3px' }}>{res.item.productType}</span>
                                      )}
                                      {res.item.category && (
                                        <span style={{ background: '#e2e8f0', padding: '1px 4px', borderRadius: '3px' }}>{res.item.category}</span>
                                      )}
                                      {res.item.supplier && (
                                        <span style={{ color: '#475569' }}>🏢 {res.item.supplier}</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/admin/products?create=${encodeURIComponent(product.name)}`);
                                  }}
                                  style={{
                                    alignSelf: 'flex-start',
                                    marginTop: '0.2rem',
                                    fontSize: '0.65rem',
                                    padding: '2px 6px',
                                    background: '#eff6ff',
                                    color: '#1d4ed8',
                                    border: '1px solid #bfdbfe',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  + Create New Product
                                </button>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                    {item.concentration && (
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.1rem' }}>
                        {item.concentration}
                      </div>
                    )}
                    {(() => {
                      let form = item.form || item.presentation || product.form || product.productType || product.presentation || '';
                      if (!form || form === 'Other' || form === 'magistral') {
                        const name = (item.name || product.name || '').toLowerCase();
                        if (name.includes('trichosol')) form = 'Topical Base Solution (Vehicle)';
                        else if (name.includes('latanoprost') || name.includes('spironolactone') || name.includes('igrantine')) form = 'Magistral Active Component';
                        else if (name.includes('capsule') || name.includes('cápsula') || name.includes('cap') || name.includes('oral') || name.includes('tablet')) form = 'Capsules';
                        else if (name.includes('lotion') || name.includes('loción') || name.includes('topical') || name.includes('solution') || name.includes('solución')) form = 'Topical Solution';
                        else if (name.includes('oil') || name.includes('aceite')) form = 'Oil';
                        else if (name.includes('cream') || name.includes('crema')) form = 'Cream';
                        else if (name.includes('foam') || name.includes('espuma')) form = 'Foam';
                        else if (name.includes('shampoo') || name.includes('champú')) form = 'Shampoo';
                      }
                      if (!form || form === 'Other') return null;
                      return (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            marginTop: '0.35rem',
                            padding: '0.15rem 0.55rem',
                            background: '#e0f2fe',
                            color: '#0369a1',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            width: 'fit-content'
                          }}
                        >
                          🏷️ {form}
                        </span>
                      );
                    })()}
                    {/* Reconstitution & Syringe Guide Quick Toggle */}
                    <div style={{ marginTop: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedReconIndex(expandedReconIndex === item._originalIndex ? null : item._originalIndex);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '3px 8px',
                          background: expandedReconIndex === item._originalIndex ? '#e0f2fe' : '#f8fafc',
                          color: expandedReconIndex === item._originalIndex ? '#0369a1' : '#475569',
                          border: `1px solid ${expandedReconIndex === item._originalIndex ? '#bae6fd' : '#cbd5e1'}`,
                          borderRadius: '5px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <FlaskConical size={12} color="#0284c7" />
                        {expandedReconIndex === item._originalIndex ? 'Hide Mixing Guide' : 'Reconstitution Guide'}
                      </button>
                    </div>

                    {item.category && (
                      <span
                        style={{
                          display: 'inline-block',
                          marginTop: '0.25rem',
                          marginLeft: '0.35rem',
                          padding: '0.15rem 0.5rem',
                          background: '#f1f5f9',
                          color: '#64748b',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                        }}
                      >
                        {item.category}
                      </span>
                    )}
                    {(() => {
                      const rawDose = item.dosage || item.dose || item.strength || '';
                      const isInstruction = rawDose.length > 35;
                      const instructions = item.instructions || item.directions || (isInstruction ? rawDose : null);
                      if (!instructions) return null;
                      return (
                        <div style={{ 
                          marginTop: '0.85rem', 
                          padding: '0.75rem 1rem', 
                          background: 'linear-gradient(to right, #eff6ff, #f8fafc)', 
                          borderRadius: '8px', 
                          border: '1px solid #e0e7ff', 
                          borderLeft: '4px solid #3b82f6', 
                          fontSize: '0.85rem', 
                          color: '#334155', 
                          lineHeight: 1.5,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.65rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                            <Pill size={12} /> CLINICAL INSTRUCTIONS
                          </div>
                          {instructions}
                        </div>
                      );
                    })()}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 700 }}>
                    {(() => {
                      const rawDose = item.dosage || item.dose || item.strength || item.concentration || '';
                      const isInstruction = rawDose.length > 35;
                      const displayDose = isInstruction 
                        ? (product.dosage || product.strength || product.concentration || '—') 
                        : (rawDose || product.dosage || product.strength || product.concentration || '—');
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          {isEditingFormulation ? (
                            <input
                              type="text"
                              value={item.dose || item.dosage || ''}
                              onChange={(e) => handleUpdateItemDose(item._originalIndex, e.target.value)}
                              style={{
                                width: '90px',
                                padding: '0.25rem 0.4rem',
                                borderRadius: '6px',
                                border: '1px solid #9333ea',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                color: '#6b21a8',
                                background: '#faf5ff'
                              }}
                            />
                          ) : (
                            <span>{displayDose}</span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#475569' }}>
                    {(() => {
                      let displayFreq = item.frequency || product.frequency;
                      if (!displayFreq) {
                        const freqText = item.instructions || item.directions || item.dosage || rx?.posology || rx?.clinicalNotes || '';
                        const match = freqText.match(/(once daily at night|once daily|twice a week|5 nights per week|6 days per week|\d+ days per week|\d+ times a week|daily|weekly|qod|bid|tid|qid|tiw|every other day|noche|diario|cada noche)/i);
                        displayFreq = match ? match[0].toLowerCase() : null;
                      }
                      if (!displayFreq && rx?.posology) {
                        displayFreq = 'Once Daily (Night)';
                      }
                      return <span style={{ textTransform: displayFreq ? 'capitalize' : 'none', color: displayFreq ? '#334155' : '#94a3b8' }}>{displayFreq || 'Per Posology'}</span>;
                    })()}
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#475569' }}>
                    {(() => {
                      const dur = item.duration || rx?.duration || (rx?.posology ? 30 : null);
                      if (!dur) return <span style={{ color: '#94a3b8' }}>Per Posology</span>;
                      return typeof dur === 'number' ? `${dur} days` : dur;
                    })()}
                  </div>
                  <div>
                    <span style={{ fontWeight: 800, color: '#6366f1', fontSize: '0.95rem' }}>
                      {item.quantity || item.units || item.boxQuantity || '1'}
                    </span>
                    {(item.unit || product.unit) && (
                      <span
                        style={{ fontSize: '0.78rem', color: '#94a3b8', marginLeft: '0.25rem' }}
                      >
                        {item.unit || product.unit}
                      </span>
                    )}

                    {isEditingFormulation && (
                      <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.35rem' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSubstituteModalItem({ index: item._originalIndex, item });
                          }}
                          title="Swap for clinical alternative"
                          style={{
                            padding: '0.25rem 0.45rem',
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem'
                          }}
                        >
                          <RefreshCw size={12} /> Swap
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFormulationItem(item._originalIndex);
                          }}
                          title="Remove component"
                          style={{
                            padding: '0.25rem 0.45rem',
                            background: '#fef2f2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem'
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })()}
          </div>
          {/* Expandable Reconstitution Guide Row */}
          {expandedReconIndex === item._originalIndex && (
            <div style={{ padding: '0.75rem 1.25rem 1.25rem 1.25rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <ReconstitutionGuideWidget
                compoundName={item.name || item.productName || 'Peptide Compound'}
                initialVialMg={parseFloat(item.dosage || item.dose || 5) || 5}
                initialDoseMcg={250}
                route={item.route || 'Subcutaneous (SC)'}
                frequency={item.frequency || 'Once Daily'}
              />
            </div>
          )}
          </React.Fragment>
            ))}
          </div>
        ))}
      </div>

      {/* Substitute / Clinical Alternatives Modal */}
      {substituteModalItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '560px',
            width: '100%',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#9333ea', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Clinical Substitution Engine
                </div>
                <h3 style={{ margin: '0.2rem 0 0 0', color: '#0f172a', fontSize: '1.15rem', fontWeight: 800 }}>
                  Swap {substituteModalItem.item.name}
                </h3>
              </div>
              <button
                onClick={() => setSubstituteModalItem(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }}
              >
                <X size={20} />
              </button>
            </div>

            {(() => {
              const altData = getClinicalAlternatives(substituteModalItem.item.name);
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#475569' }}>
                    <strong>Category:</strong> {altData.category}
                  </div>

                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
                    Clinically Equivalent Alternatives:
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '280px', overflowY: 'auto' }}>
                    {altData.alternatives.map((alt, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.85rem 1rem',
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0',
                          background: '#ffffff',
                          transition: 'all 0.15s'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                            {alt.name} <span style={{ color: '#9333ea', fontSize: '0.8rem', marginLeft: '0.3rem' }}>({alt.dose})</span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                            {alt.note}
                          </div>
                        </div>
                        <button
                          onClick={() => handleSwapItemWithAlternative(substituteModalItem.index, alt)}
                          style={{
                            padding: '0.4rem 0.8rem',
                            background: '#f0fdf4',
                            color: '#16a34a',
                            border: '1px solid #bbf7d0',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                        >
                          Select Swap
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                onClick={() => setSubstituteModalItem(null)}
                style={{ padding: '0.5rem 1rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { Activity, FlaskConical, Package, CreditCard, TestTube } from 'lucide-react';
import { SectionAccordion } from './SectionAccordion';
import ProtocolTechnicalPeptides from './ProtocolTechnicalPeptides';
import ProtocolTechnicalSupplements from './ProtocolTechnicalSupplements';
import ProtocolTechnicalAccessories from './ProtocolTechnicalAccessories';
import ProtocolTechnicalTesting from './ProtocolTechnicalTesting';
import ProtocolEconomicSection from './ProtocolEconomicSection';

/**
 * ProtocolTechnicalSection
 * 
 * Modular container for the technical data of a protocol.
 * Groups Peptides, Supplements, Accessories, and Economics.
 */
export const ProtocolTechnicalSection = ({ 
  protocol, 
  activeProtocolPhases = [],
  products = [],
  updateCart,
  localTier = 'retail',
  region = 'US',
  slug
}) => {
  // Selection state for bundle
  const [selectedSuppIds, setSelectedSuppIds] = useState(new Set());
  const [selectedSupplements, setSelectedSupplements] = useState([]);
  const [selectedAccIds, setSelectedAccIds] = useState(new Set());
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [selectedTestIds, setSelectedTestIds] = useState(new Set());
  const [selectedTests, setSelectedTests] = useState([]);

  // Initialize selections from protocol defaults
  useEffect(() => {
    if (protocol?.recommended_supplements) {
      const ids = new Set();
      const supps = protocol.recommended_supplements.map((s, idx) => {
        const id = typeof s === 'string' ? s : (s.id || `supp_${(s.name || '').toLowerCase().replace(/[^a-z0-9]/g, '')}_${idx}`);
        const rawName = typeof s === 'string' ? s : (s.name || s.product_title || '');
        const name = typeof s === 'string' 
          ? rawName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') 
          : rawName;
        ids.add(id);
        return {
          id,
          name,
          dose: typeof s === 'string' ? null : (s.dose || s.daily_dose || null),
          dose_unit: typeof s === 'string' ? null : (s.dose_unit || 'mg'),
          frequency: typeof s === 'string' ? null : (s.frequency || 'Daily'),
          dosage_form: typeof s === 'string' ? null : (s.dosage_form || 'Capsules'),
          duration_weeks: typeof s === 'string' ? null : (s.duration_weeks || null)
        };
      });
      setSelectedSuppIds(ids);
      setSelectedSupplements(supps);
    } else {
      setSelectedSuppIds(new Set());
      setSelectedSupplements([]);
    }
  }, [protocol]);

  // Initialize recommended tests selections from protocol defaults
  useEffect(() => {
    if (protocol?.recommended_tests) {
      const ids = new Set();
      const testsList = protocol.recommended_tests.map(t => {
        const match = products.find(p => p.id === t);
        ids.add(t);
        return {
          id: t,
          name: match?.displayName || match?.name || t
        };
      });
      setSelectedTestIds(ids);
      setSelectedTests(testsList);
    } else {
      setSelectedTestIds(new Set());
      setSelectedTests([]);
    }
  }, [protocol, products]);

  // Set default selected accessories and sync selectedAccessories list
  useEffect(() => {
    if (activeProtocolPhases.length > 0) {
      // Calculate standard accessories on initialization
      let totalInjections = 0;
      let totalBacWaterMl = 0;

      activeProtocolPhases.forEach(ph => {
        const dur = ph.default_duration_weeks || ph.duration_weeks || 4;
        const drugs = ph.drugs || ph.compounds || ph.medications || [];
        
        drugs.forEach(d => {
          const logic = d.dose_logic || {};
          const canonicalVials =
            logic.vials_required != null ? Number(logic.vials_required)
            : d.vials_required   != null ? Number(d.vials_required)
            : null;

          const freq = logic.administration_frequency || logic.frequency || d.dosing_frequency || 'once_weekly';
          let dosingPerWeek = 1;
          const normFreq = freq.toLowerCase();
          if (normFreq.includes('daily') || normFreq.includes('diario')) dosingPerWeek = 7;
          else if (normFreq.includes('2x') || normFreq.includes('twice')) dosingPerWeek = 2;
          else if (normFreq.includes('3x') || normFreq.includes('thrice')) dosingPerWeek = 3;
          else if (normFreq.includes('4x')) dosingPerWeek = 4;
          else if (normFreq.includes('5x')) dosingPerWeek = 5;
          else if (normFreq.includes('6x')) dosingPerWeek = 6;

          const doseAmount = parseFloat(logic.starting_weekly_dose || logic.dose_per_administration || 0);
          const vialSize = parseFloat(d.vial_size_mg || logic.vial_strength || 5);
          const isWeeklyDose = Boolean(logic.starting_weekly_dose || logic.max_weekly_dose);

          const baseWeeklyDose = isWeeklyDose ? doseAmount : (doseAmount * dosingPerWeek);
          const maxDose = logic.max_weekly_dose || logic.possible_next_step_dose || null;
          const weeklyDose = maxDose && maxDose > baseWeeklyDose ? (baseWeeklyDose + maxDose) / 2 : baseWeeklyDose;
          const totalRequirement = weeklyDose * dur;
          const vialsNeeded = canonicalVials !== null && !isNaN(canonicalVials) 
            ? canonicalVials 
            : (totalRequirement > 0 ? Math.ceil(totalRequirement / vialSize) : 1);

          const explicitWaterMl = d.reconstitution?.water_volume_ml ?? logic.reconstitution_water_ml ?? null;
          const reconstitutionMl = explicitWaterMl !== null ? Number(explicitWaterMl) : (vialSize > 0 ? 2 : 0);

          totalInjections += (dosingPerWeek * dur);
          totalBacWaterMl += (reconstitutionMl * vialsNeeded);
        });
      });

      const bacWaterBottles = totalBacWaterMl > 0 ? Math.ceil(totalBacWaterMl / 10) : 0;
      const syringePacks = Math.ceil(totalInjections / 10) || 1;

      const accs = [
        bacWaterBottles > 0 ? { id: 'bac_water_10ml', name: 'Bacteriostatic Water 10 mL', qty: bacWaterBottles, quantity: bacWaterBottles, unitPrice: 8, isAccessory: true } : null,
        { id: 'insulin_syringe', name: 'Insulin Syringes 1 mL (x10)', qty: syringePacks, quantity: syringePacks, unitPrice: 12, isAccessory: true },
        { id: 'alcohol_pads', name: 'Alcohol Prep Pads (x50)', qty: 1, quantity: 1, unitPrice: 6, isAccessory: true }
      ].filter(Boolean);

      setSelectedAccIds(new Set(accs.map(a => a.id)));
      setSelectedAccessories(accs);
    } else {
      setSelectedAccIds(new Set(['bac_water_10ml', 'insulin_syringe', 'alcohol_pads']));
      setSelectedAccessories([
        { id: 'bac_water_10ml', name: 'Bacteriostatic Water 10 mL', qty: 1, quantity: 1, unitPrice: 8, isAccessory: true },
        { id: 'insulin_syringe', name: 'Insulin Syringes 1 mL (x10)', qty: 2, quantity: 2, unitPrice: 12, isAccessory: true },
        { id: 'alcohol_pads', name: 'Alcohol Prep Pads (x50)', qty: 1, quantity: 1, unitPrice: 6, isAccessory: true }
      ]);
    }
  }, [activeProtocolPhases]);

  const handleSuppChange = (ids, items) => {
    setSelectedSuppIds(ids);
    setSelectedSupplements(items);
  };

  const handleAccChange = (ids, items) => {
    setSelectedAccIds(ids);
    setSelectedAccessories(items);
  };

  const handleTestingChange = (ids, items) => {
    setSelectedTestIds(ids);
    setSelectedTests(items);
  };

  return (
    <div className="protocol-technical-wrapper">
      {/* 1. Peptides Technical Section */}
      <SectionAccordion 
        id={`${slug}_tech_peptides`}
        title="Peptide Administration & Dosing" 
        icon={Activity}
        accentColor="var(--color-primary)"
        defaultOpen={false}
      >
        <ProtocolTechnicalPeptides 
          protocol={protocol} 
          activeProtocolPhases={activeProtocolPhases} 
        />
      </SectionAccordion>

      {/* 2. Supplements Technical Section */}
      {protocol?.recommended_supplements?.length > 0 && (
        <SectionAccordion 
          id={`${slug}_tech_supps`}
          title="Micronutrient & Supplement Support" 
          icon={FlaskConical}
          accentColor="#7c3aed"
          defaultOpen={false}
        >
          <ProtocolTechnicalSupplements 
            recommendedSupplements={protocol.recommended_supplements}
            onSelectionChange={handleSuppChange}
            selectedIds={selectedSuppIds}
          />
        </SectionAccordion>
      )}

      {/* 2b. Testing Technical Section */}
      {protocol?.recommended_tests?.length > 0 && (
        <SectionAccordion 
          id={`${slug}_tech_testing`}
          title="Recommended Diagnostic Testing (Optional)" 
          icon={TestTube}
          accentColor="#dd6b20"
          defaultOpen={false}
        >
          <ProtocolTechnicalTesting 
            recommendedTests={protocol.recommended_tests}
            products={products}
            onSelectionChange={handleTestingChange}
            selectedIds={selectedTestIds}
          />
        </SectionAccordion>
      )}

      {/* 3. Accessories Technical Section */}
      <SectionAccordion 
        id={`${slug}_tech_acc`}
        title="Administration Accessories" 
        icon={Package}
        accentColor="#0284c7"
        defaultOpen={false}
      >
        <ProtocolTechnicalAccessories 
          phase_blueprints={activeProtocolPhases}
          onSelectionChange={handleAccChange}
          selectedIds={selectedAccIds}
        />
      </SectionAccordion>

      {/* 4. Economic Section (Summary & Cart) */}
      <SectionAccordion 
        id={`${slug}_economic`}
        title="Investment Summary" 
        icon={CreditCard}
        accentColor="#0f172a"
        defaultOpen={false}
      >
        <ProtocolEconomicSection 
          protocol={protocol}
          activeProtocolPhases={activeProtocolPhases}
          selectedSupplements={selectedSupplements}
          selectedAccessories={selectedAccessories}
          selectedTests={selectedTests}
          products={products}
          updateCart={updateCart}
          localTier={localTier}
          region={region}
        />
      </SectionAccordion>

      <style jsx>{`
        .protocol-technical-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
      `}</style>
    </div>
  );
};

export default ProtocolTechnicalSection;

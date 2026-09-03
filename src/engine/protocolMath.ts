/**
 * protocolMath.ts
 * Centralized business logic engine for calculating dosages, vials, and inventory impact.
 */

export interface Item {
  productId?: string;
  variantId?: string | null;
  sku?: string;
  name?: string;
  productName?: string;
  vialStrengthMg?: number;
  reconstitutionVolMl?: number;
  shelfLifeDays?: number;
  doseMg?: number;
  frequencyPerWeek?: number;
  durationWeeks?: number;
  route?: string;
}

export interface Phase {
  phase?: number | string;
  items?: Item[];
  medications?: Item[];
}

export interface Protocol {
  patient?: string;
  phases?: Phase[];
  bom?: Item[];
}

export interface PhaseDetails {
  name?: string;
  doseMg: number;
  injectionsInPhase: number;
  mgInPhase: number;
  frequencyPerWeek: number;
  durationWeeks: number;
  route: string;
}

export interface ProtocolRequirement {
  id?: string;
  productId?: string;
  variantId?: string | null;
  sku?: string;
  name: string;
  vialStrengthMg: number;
  reconstitutionVolMl: number;
  shelfLifeDays: number;
  totalMgRequired: number;
  totalInjections: number;
  phases: PhaseDetails[];
  vialsRequired: number;
  unusedMg: number;
  shelfLifeWarning: boolean;
}

export interface InventoryImpact extends ProtocolRequirement {
  currentStock: number;
  shortage: number;
  status: 'Critical' | 'Low' | 'OK';
  costPerVial: number;
}

export interface PrescriptionLine {
  id: string;
  productId?: string;
  variantId?: string | null;
  sku?: string;
  product_name: string;
  dosage: string;
  frequency: string;
  route: string;
  duration: string;
  quantity: number;
}

/**
 * Calculates the total vial requirements for a given protocol.
 * @param protocol - The protocol object containing phases.
 * @returns List of product requirements.
 */
export function calculateProtocolRequirements(protocol: Protocol): ProtocolRequirement[] {
  let allItems: Item[] = [];
  if (protocol.bom && protocol.bom.length > 0) {
    allItems = protocol.bom;
  } else {
    allItems = protocol?.phases?.reduce((acc: Item[], phase) => {
      return acc.concat(phase.items || phase.medications || []);
    }, []) || [];
  }

  const groupedProducts = allItems.reduce((acc: Record<string, any>, item) => {
    const key = item.productId || item.name || 'Unknown Product';
    if (!acc[key]) {
      acc[key] = {
        id: item.productId, // Ensure we keep the ID for inventory
        productId: item.productId,
        variantId: item.variantId || null,
        sku: item.sku || '',
        name: item.productName || item.name || 'Unknown Product',
        vialStrengthMg: item.vialStrengthMg || 10,
        reconstitutionVolMl: item.reconstitutionVolMl || 2,
        shelfLifeDays: item.shelfLifeDays || 30,
        totalMgRequired: 0,
        totalInjections: 0,
        phases: []
      };
    }
    
    const doseMg = item.doseMg || 0.5;
    const frequencyPerWeek = item.frequencyPerWeek || 5;
    const durationWeeks = item.durationWeeks || 4; 
    
    const injectionsInPhase = frequencyPerWeek * durationWeeks;
    const mgInPhase = injectionsInPhase * doseMg;

    acc[key].totalInjections += injectionsInPhase;
    acc[key].totalMgRequired += mgInPhase;
    acc[key].phases.push({ 
        name: item.name, 
        doseMg, 
        injectionsInPhase, 
        mgInPhase, 
        frequencyPerWeek, 
        durationWeeks, 
        route: item.route || 'Subcutaneous' 
    });
    
    return acc;
  }, {});

  return Object.values(groupedProducts).map((p: any) => {
    const vialsRequired = Math.ceil(p.totalMgRequired / p.vialStrengthMg);
    const unusedMg = (vialsRequired * p.vialStrengthMg) - p.totalMgRequired;
    const durationDays = p.totalInjections * (7 / 5); 
    const shelfLifeWarning = durationDays > p.shelfLifeDays;

    return { ...p, vialsRequired, unusedMg, shelfLifeWarning } as ProtocolRequirement;
  });
}

/**
 * Calculates the inventory impact by comparing required vials to current global stock.
 * @param requirements - Output from calculateProtocolRequirements
 * @param globalProducts - Product list from global store
 * @returns Impact array with shortage calculations
 */
export function calculateInventoryImpact(requirements: ProtocolRequirement[], globalProducts: any[]): InventoryImpact[] {
  return requirements.map(req => {
    // Attempt to match by ID first, then by name
    const dbProduct = globalProducts.find(p => p.id === req.id || p.name === req.name);
    
    const currentStock = dbProduct?.stock || dbProduct?.quantity || 0;
    const shortage = Math.max(0, req.vialsRequired - currentStock);
    const status = shortage > 0 ? 'Critical' : (currentStock - req.vialsRequired <= 5 ? 'Low' : 'OK');

    return {
      ...req,
      currentStock,
      shortage,
      status,
      costPerVial: dbProduct?.costPrice || dbProduct?.price || 150,
    } as InventoryImpact;
  });
}

/**
 * Generates ready-to-use prescription lines from protocol requirements.
 * Maps exact dosage strings and calculates the precise quantity (vials required).
 */
export function generatePrescriptionLines(protocol: Protocol): PrescriptionLine[] {
    const requirements = calculateProtocolRequirements(protocol);
    
    // Flatten requirements down to prescription lines based on the phases
    const lines: PrescriptionLine[] = [];
    
    requirements.forEach(req => {
        // Find the primary/max dose strategy from the phases to summarize the prescription
        const primaryPhase = req.phases.reduce((prev, current) => 
            (prev.mgInPhase > current.mgInPhase) ? prev : current
        );

        lines.push({
            id: req.productId || req.id || Date.now().toString() + Math.random().toString(),
            productId: req.productId || req.id,
            variantId: req.variantId || null,
            sku: req.sku || '',
            product_name: req.name,
            dosage: `${primaryPhase.doseMg} mg`,
            frequency: `${primaryPhase.frequencyPerWeek}x / week`,
            route: primaryPhase.route,
            duration: `${primaryPhase.durationWeeks} weeks`,
            quantity: req.vialsRequired, // We prescribe the EXACT number of calculated vials!
        });
    });

    return lines;
}

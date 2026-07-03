/**
 * Atlas Health - Clinical Calculation Engine
 * Responsible for calculating vial requirements, expected wastage,
 * total doses, and reconstitution schedules for protocols and prescriptions.
 */

export const CalculationEngine = {
  /**
   * Calculate total milligrams required for a given line item.
   * @param {number} doseMg - Dose per administration in mg
   * @param {number} frequencyPerWeek - Times per week
   * @param {number} durationWeeks - Duration of the treatment in weeks
   * @returns {number} Total mg required
   */
  calculateTotalMg: (doseMg, frequencyPerWeek, durationWeeks) => {
    if (!doseMg || !frequencyPerWeek || !durationWeeks) return 0;
    return doseMg * frequencyPerWeek * durationWeeks;
  },

  /**
   * Calculate number of vials required based on total mg and vial strength.
   * Includes standard overfill/wastage estimation (typically 10-15% lost in dead space/reconstitution).
   * @param {number} totalMg - Total mg required for the protocol
   * @param {number} vialStrengthMg - Strength of a single vial in mg
   * @param {number} expectedWastagePercentage - Expected loss per vial (default 0.15)
   * @returns {number} Vials required (integer)
   */
  calculateVialsRequired: (totalMg, vialStrengthMg, expectedWastagePercentage = 0.15) => {
    if (!totalMg || !vialStrengthMg) return 0;
    const effectiveVialStrength = vialStrengthMg * (1 - expectedWastagePercentage);
    return Math.ceil(totalMg / effectiveVialStrength);
  },

  /**
   * Generate a reconstitution schedule (when new vials need to be opened)
   * based on usage and shelf-life after reconstitution.
   * @param {number} vialsRequired - Total vials
   * @param {number} shelfLifeDays - Max days a vial can be used after reconstitution
   * @param {string} startDate - Treatment start date (ISO string)
   * @returns {Array<{date: string, action: string, vialNumber: number}>} Schedule of reconstitution
   */
  generateReconstitutionSchedule: (vialsRequired, shelfLifeDays, startDate) => {
    if (!vialsRequired || !startDate || !shelfLifeDays) return [];
    
    const schedule = [];
    let currentDate = new Date(startDate);

    for (let i = 1; i <= vialsRequired; i++) {
      schedule.push({
        date: currentDate.toISOString().split('T')[0],
        action: 'Reconstitute',
        vialNumber: i
      });
      currentDate.setDate(currentDate.getDate() + shelfLifeDays);
    }

    return schedule;
  },

  /**
   * Generates a complete calculation summary for a prescription line or protocol phase.
   * @param {Object} params
   * @param {number} params.doseMg
   * @param {number} params.frequencyPerWeek
   * @param {number} params.durationWeeks
   * @param {number} params.vialStrengthMg
   * @param {number} params.shelfLifeDays
   * @param {string} params.startDate
   * @returns {Object} Calculation details
   */
  calculateLineDetails: ({ doseMg, frequencyPerWeek, durationWeeks, vialStrengthMg, shelfLifeDays, startDate }) => {
    const totalMg = CalculationEngine.calculateTotalMg(doseMg, frequencyPerWeek, durationWeeks);
    const expectedWastagePercentage = 0.15; // 15% standard wastage
    const vialsRequired = CalculationEngine.calculateVialsRequired(totalMg, vialStrengthMg, expectedWastagePercentage);
    
    const totalVialMg = vialsRequired * vialStrengthMg;
    const wastageMg = totalVialMg - totalMg; // Total left over or lost

    const reconstitutionSchedule = CalculationEngine.generateReconstitutionSchedule(vialsRequired, shelfLifeDays, startDate || new Date().toISOString());

    return {
      totalMg,
      totalInjections: frequencyPerWeek * durationWeeks,
      vialsRequired,
      wastageMg: Number(wastageMg.toFixed(2)),
      reconstitutionSchedule,
      status: 'CALCULATED'
    };
  }
};

export default CalculationEngine;

/**
 * Calculates fields for a prescription line.
 * @param {Object} line - Partial prescription line with input values (dose, frequency, duration, etc.)
 * @returns {Object} Updated line with calculated fields
 */
export const calculatePrescriptionLine = (line) => {
  const { dose, doseUnit, frequency, duration, strength, concentration, vialSizeInMg } = line;

  let totalRequiredQuantity = 0;
  let treatmentDays = 0;
  let calculatedWaste = 0;
  let vialsRequired = 0;

  // Basic logic to determine days
  if (duration && duration.includes('week')) {
    treatmentDays = parseInt(duration) * 7;
  } else if (duration && duration.includes('month')) {
    treatmentDays = parseInt(duration) * 30;
  } else if (duration && duration.includes('day')) {
    treatmentDays = parseInt(duration);
  }

  // Calculate doses based on frequency
  let dosesPerWeek = 0;
  if (frequency) {
    if (frequency.toLowerCase().includes('daily')) dosesPerWeek = 7;
    else if (frequency.toLowerCase().includes('twice a week')) dosesPerWeek = 2;
    else if (frequency.toLowerCase().includes('3 times a week')) dosesPerWeek = 3;
    else if (frequency.toLowerCase().includes('weekly')) dosesPerWeek = 1;
    // very simplified mapping, can be expanded
  }

  const totalDoses = (treatmentDays / 7) * dosesPerWeek;
  
  if (dose) {
    const numericDose = parseFloat(dose);
    if (!isNaN(numericDose)) {
      totalRequiredQuantity = numericDose * totalDoses; // total mg or mcg
    }
  }

  // Example simple calculation of vials based on a provided vialSizeInMg
  if (vialSizeInMg && totalRequiredQuantity > 0) {
    // Assuming dose is in mg, and vial size is in mg
    let requiredMg = totalRequiredQuantity;
    if (doseUnit === 'mcg') {
      requiredMg = totalRequiredQuantity / 1000;
    }

    vialsRequired = Math.ceil(requiredMg / vialSizeInMg);
    calculatedWaste = (vialsRequired * vialSizeInMg) - requiredMg;
  }

  return {
    ...line,
    treatmentDays,
    totalRequiredQuantity,
    vialsRequired,
    calculatedWaste: Math.max(0, calculatedWaste)
  };
};

export const calculateTotalPrescriptionCost = (prescriptionLines) => {
  return prescriptionLines.reduce((acc, line) => {
    const price = parseFloat(line.price) || 0;
    const qty = parseInt(line.vialsRequired) || 1;
    return acc + (price * qty);
  }, 0);
};

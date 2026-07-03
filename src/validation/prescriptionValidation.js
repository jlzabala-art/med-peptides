/**
 * Validates a complete prescription object
 * @param {Object} prescription 
 * @returns {Object} validation result { isValid, status, errors }
 */
export const validatePrescription = (prescription) => {
  const errors = [];
  let status = 'Ready';

  if (!prescription.patientId) errors.push("Missing patient");
  if (!prescription.doctorId) errors.push("Missing doctor");
  
  if (!prescription.prescriptionLines || prescription.prescriptionLines.length === 0) {
    errors.push("No products prescribed");
  } else {
    prescription.prescriptionLines.forEach((line, index) => {
      const prefix = `Line ${index + 1}:`;
      if (!line.dose) errors.push(`${prefix} Missing dose`);
      if (!line.frequency) errors.push(`${prefix} Missing frequency`);
      if (!line.duration) errors.push(`${prefix} Missing duration`);
      if (!line.route) errors.push(`${prefix} Missing route`);
      
      // Stock and availability warnings can be added here
      if (line.outOfStock) errors.push(`${prefix} Item out of stock`);
    });
  }

  // Check contraindications or excessive dose (simplified logic)
  if (prescription.safetyWarnings && prescription.safetyWarnings.length > 0) {
    status = 'Blocked';
    errors.push("Safety warnings exist");
  }

  if (errors.length > 0 && status !== 'Blocked') {
    status = 'Needs Review';
  }

  return {
    isValid: errors.length === 0 && status === 'Ready',
    status,
    errors
  };
};

/**
 * Validates a single prescription line as it's being typed
 * @param {Object} line 
 */
export const validatePrescriptionLine = (line) => {
  const errors = [];
  if (!line.dose) errors.push("Missing dose");
  if (!line.frequency) errors.push("Missing frequency");
  if (!line.duration) errors.push("Missing duration");
  if (!line.route) errors.push("Missing route");

  return {
    isValid: errors.length === 0,
    errors
  };
};

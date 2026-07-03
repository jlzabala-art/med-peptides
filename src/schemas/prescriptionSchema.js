export const PRESCRIPTION_STATUSES = {
  DRAFT: 'Draft',
  IMPORTED: 'Imported',
  AI_SUGGESTED: 'AI Suggested',
  NEEDS_REVIEW: 'Needs Review',
  REVIEWED: 'Reviewed',
  APPROVED: 'Approved',
  SIGNED: 'Signed',
  QUOTED: 'Quoted',
  ORDERED: 'Ordered',
  DISPENSED: 'Dispensed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

export const PRESCRIPTION_SOURCES = {
  FAGRON: 'Fagron Genomics',
  UPLOAD: 'Uploaded Document',
  ITEMS: 'Selected Items',
  PROTOCOL: 'Protocol',
  AI_REPORT: 'AI Report (24Genomics/Bloodo)',
  MANUAL: 'Manual'
};

export const prescriptionLineSchema = {
  id: '', // unique line ID
  itemId: '',
  itemName: '',
  activeIngredient: '',
  dosageForm: '',
  strength: '',
  concentration: '',
  route: '',
  dose: '',
  doseUnit: '',
  frequency: '',
  duration: '',
  treatmentDays: 0,
  totalRequiredQuantity: 0,
  vialsRequired: 0,
  reconstitutionRequired: false,
  reconstitutionVolume: '',
  concentrationAfterReconstitution: '',
  shelfLifeAfterReconstitution: '',
  storageConditions: '',
  calculatedWaste: 0,
  instructions: '',
  patientInstructions: '',
  doctorNotes: '',
  status: 'Pending', // Pending, Approved, Rejected
};

export const prescriptionSchema = {
  prescriptionId: '',
  patientId: '',
  doctorId: '',
  clinicId: '',
  sourceType: '', // from PRESCRIPTION_SOURCES
  sourceFileId: null,
  sourceReportType: null,
  status: PRESCRIPTION_STATUSES.DRAFT,
  createdAt: null,
  updatedAt: null,
  prescribedBy: '',
  reviewedBy: '',
  clinicalIndication: '',
  treatmentGoal: '',
  prescriptionLines: [], // Array of prescriptionLineSchema
  safetyWarnings: [],
  AIRecommendations: null,
  validationStatus: 'Ready', // Ready, Needs Review, Blocked
  quotationStatus: 'Pending',
  orderStatus: 'Pending',
  signedDocumentUrl: null,
  auditTrail: [] // Array of { timestamp, action, user, details }
};

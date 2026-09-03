/**
 * fhir/__tests__/fhirMappers.test.js
 * Unit tests for HL7 FHIR R4 mappers (Pilar 3 — Fase 3)
 * Validates bidirectional conformance for Patient, MedicationRequest, Observation
 */
import { describe, it, expect } from 'vitest';
import {
  toFhirPatient,
  fromFhirPatient,
  toFhirMedicationRequest,
  fromFhirMedicationRequest,
  toFhirObservation,
  fromFhirObservation,
} from '../fhirMappers';

// ─── Sample Atlas Data ───────────────────────────────────────────────────────

const atlasPatient = {
  id: 'patient-001',
  role: 'patient',
  displayName: 'Ana Martínez',
  firstName: 'Ana',
  lastName: 'Martínez',
  email: 'ana@example.com',
  phone: '+34600123456',
  gender: 'female',
  birthDate: '1985-06-15',
  status: 'active',
  language: 'es',
  country: 'ES',
  address: 'Calle Mayor 1, Madrid',
};

const atlasPrescription = {
  id: 'rx-001',
  patientId: 'patient-001',
  doctorId: 'doctor-001',
  status: 'approved',
  items: [
    {
      productId: 'sku-001',
      productName: 'CJC-1295',
      dose: 2,
      unit: 'mg',
      frequency: 'BID',
      instructions: 'Apply SQ every 3 days',
    },
  ],
  instructions: 'Apply SQ every 3 days',
  notes: 'Patient reported good tolerance',
  createdAt: '2026-09-01T10:00:00Z',
  signatureMetadata: { hash: 'abc123def456' },
};

const atlasBiomarker = {
  id: 'bio-001',
  name: 'IGF-1',
  type: 'igf1',
  loincCode: '25499-5',
  value: 250,
  unit: 'ng/mL',
  recordedAt: '2026-09-01T08:00:00Z',
  referenceRange: { low: 100, high: 400, text: '100–400 ng/mL (adult reference)' },
  notes: 'Slightly elevated',
};

// ─── Tests: Patient ──────────────────────────────────────────────────────────

describe('fhirMappers — Patient', () => {
  it('toFhirPatient() produces resourceType="Patient"', () => {
    const fhir = toFhirPatient(atlasPatient);
    expect(fhir.resourceType).toBe('Patient');
  });

  it('toFhirPatient() preserves patient ID', () => {
    const fhir = toFhirPatient(atlasPatient);
    expect(fhir.id).toBe('patient-001');
  });

  it('toFhirPatient() maps active status correctly', () => {
    const fhir = toFhirPatient({ ...atlasPatient, status: 'active' });
    expect(fhir.active).toBe(true);
    const fhirInactive = toFhirPatient({ ...atlasPatient, status: 'suspended' });
    expect(fhirInactive.active).toBe(false);
  });

  it('toFhirPatient() maps name, gender, birthDate', () => {
    const fhir = toFhirPatient(atlasPatient);
    expect(fhir.name[0].given).toContain('Ana');
    expect(fhir.name[0].family).toBe('Martínez');
    expect(fhir.gender).toBe('female');
    expect(fhir.birthDate).toBe('1985-06-15');
  });

  it('toFhirPatient() maps email and phone telecom', () => {
    const fhir = toFhirPatient(atlasPatient);
    const email = fhir.telecom.find((t) => t.system === 'email');
    const phone = fhir.telecom.find((t) => t.system === 'phone');
    expect(email.value).toBe('ana@example.com');
    expect(phone.value).toBe('+34600123456');
  });

  it('toFhirPatient() includes system identifier', () => {
    const fhir = toFhirPatient(atlasPatient);
    expect(fhir.identifier[0].value).toBe('patient-001');
  });

  it('fromFhirPatient() round-trips key fields correctly', () => {
    const fhir = toFhirPatient(atlasPatient);
    const back = fromFhirPatient(fhir);
    expect(back.id).toBe(atlasPatient.id);
    expect(back.firstName).toBe(atlasPatient.firstName);
    expect(back.lastName).toBe(atlasPatient.lastName);
    expect(back.email).toBe(atlasPatient.email);
    expect(back.gender).toBe(atlasPatient.gender);
    expect(back._source).toBe('fhir');
  });

  it('fromFhirPatient() handles inactive patient', () => {
    const fhir = toFhirPatient({ ...atlasPatient, status: 'suspended' });
    const back = fromFhirPatient(fhir);
    expect(back.status).toBe('inactive');
  });
});

// ─── Tests: MedicationRequest ─────────────────────────────────────────────────

describe('fhirMappers — MedicationRequest', () => {
  it('toFhirMedicationRequest() produces resourceType="MedicationRequest"', () => {
    const fhir = toFhirMedicationRequest(atlasPrescription);
    expect(fhir.resourceType).toBe('MedicationRequest');
  });

  it('maps Atlas "approved" status to FHIR "active"', () => {
    const fhir = toFhirMedicationRequest({ ...atlasPrescription, status: 'approved' });
    expect(fhir.status).toBe('active');
  });

  it('maps Atlas "completed" status to FHIR "completed"', () => {
    const fhir = toFhirMedicationRequest({ ...atlasPrescription, status: 'completed' });
    expect(fhir.status).toBe('completed');
  });

  it('maps Atlas "cancelled" status to FHIR "cancelled"', () => {
    const fhir = toFhirMedicationRequest({ ...atlasPrescription, status: 'cancelled' });
    expect(fhir.status).toBe('cancelled');
  });

  it('includes subject reference to Patient', () => {
    const fhir = toFhirMedicationRequest(atlasPrescription);
    expect(fhir.subject.reference).toBe('Patient/patient-001');
  });

  it('includes requester reference to Practitioner', () => {
    const fhir = toFhirMedicationRequest(atlasPrescription);
    expect(fhir.requester.reference).toBe('Practitioner/doctor-001');
  });

  it('maps items to medicationCodeableConcept coding', () => {
    const fhir = toFhirMedicationRequest(atlasPrescription);
    expect(fhir.medicationCodeableConcept.coding[0].code).toBe('sku-001');
    expect(fhir.medicationCodeableConcept.coding[0].display).toBe('CJC-1295');
  });

  it('maps dosage instructions', () => {
    const fhir = toFhirMedicationRequest(atlasPrescription);
    expect(fhir.dosageInstruction[0].doseAndRate[0].doseQuantity.value).toBe(2);
    expect(fhir.dosageInstruction[0].doseAndRate[0].doseQuantity.unit).toBe('mg');
  });

  it('includes electronic signature extension when signatureMetadata is present', () => {
    const fhir = toFhirMedicationRequest(atlasPrescription);
    const sigExt = fhir.extension.find((e) => e.url.includes('electronicSignature'));
    expect(sigExt.valueString).toBe('abc123def456');
  });

  it('fromFhirMedicationRequest() round-trips patientId and doctorId', () => {
    const fhir = toFhirMedicationRequest(atlasPrescription);
    const back = fromFhirMedicationRequest(fhir);
    expect(back.patientId).toBe('patient-001');
    expect(back.doctorId).toBe('doctor-001');
    expect(back._source).toBe('fhir');
  });
});

// ─── Tests: Observation (Biomarkers) ─────────────────────────────────────────

describe('fhirMappers — Observation', () => {
  it('toFhirObservation() produces resourceType="Observation"', () => {
    const fhir = toFhirObservation(atlasBiomarker, 'patient-001');
    expect(fhir.resourceType).toBe('Observation');
  });

  it('maps LOINC code when available', () => {
    const fhir = toFhirObservation(atlasBiomarker, 'patient-001');
    const loinc = fhir.code.coding.find((c) => c.system === 'http://loinc.org');
    expect(loinc.code).toBe('25499-5');
  });

  it('maps value and unit', () => {
    const fhir = toFhirObservation(atlasBiomarker, 'patient-001');
    expect(fhir.valueQuantity.value).toBe(250);
    expect(fhir.valueQuantity.unit).toBe('ng/mL');
  });

  it('maps reference range', () => {
    const fhir = toFhirObservation(atlasBiomarker, 'patient-001');
    expect(fhir.referenceRange[0].low.value).toBe(100);
    expect(fhir.referenceRange[0].high.value).toBe(400);
  });

  it('maps subject reference to Patient', () => {
    const fhir = toFhirObservation(atlasBiomarker, 'patient-001');
    expect(fhir.subject.reference).toBe('Patient/patient-001');
  });

  it('status is always "final" for completed biomarker entries', () => {
    const fhir = toFhirObservation(atlasBiomarker, 'patient-001');
    expect(fhir.status).toBe('final');
  });

  it('category is "laboratory"', () => {
    const fhir = toFhirObservation(atlasBiomarker, 'patient-001');
    const category = fhir.category[0].coding[0];
    expect(category.code).toBe('laboratory');
  });

  it('fromFhirObservation() round-trips key fields', () => {
    const fhir = toFhirObservation(atlasBiomarker, 'patient-001');
    const back = fromFhirObservation(fhir);
    expect(back.value).toBe(250);
    expect(back.unit).toBe('ng/mL');
    expect(back.loincCode).toBe('25499-5');
    expect(back._source).toBe('fhir');
  });
});

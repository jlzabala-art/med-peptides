/**
 * services/fhir/fhirMappers.js
 * ─────────────────────────────────────────────────────────────────────────────
 * HL7 FHIR R4 Bidirectional Mappers — Atlas Clinical Platform
 *
 * Converts Atlas internal data structures to/from HL7 FHIR R4 resources,
 * enabling interoperability with EHR systems (Epic, Cerner, AthenaHealth),
 * hospital pharmacies, insurance companies, and health data brokers.
 *
 * FHIR R4 Specification: https://hl7.org/fhir/R4/
 *
 * Supported Resource Mappings:
 *   Patient          ↔  Atlas User (role: 'patient')
 *   MedicationRequest↔  Atlas Prescription
 *   Observation      ↔  Atlas Biomarker Entry
 *
 * Standards:
 *   - HL7 FHIR Release 4 (R4)
 *   - IHE (Integrating the Healthcare Enterprise) PDQ / PIX profiles
 *   - ONC 21st Century Cures Act Interoperability Requirements
 * ─────────────────────────────────────────────────────────────────────────────
 */

const FHIR_BASE_URL = 'https://atlas.health/fhir/R4';

// ─── Patient Resource ────────────────────────────────────────────────────────

/**
 * Maps an Atlas patient (Firestore user doc with role='patient') to a
 * FHIR R4 Patient resource.
 *
 * FHIR spec: https://hl7.org/fhir/R4/patient.html
 * @param {object} atlasPatient
 * @returns {object} FHIR Patient resource
 */
export function toFhirPatient(atlasPatient) {
  const humanName = {
    use: 'official',
    ...(atlasPatient.displayName
      ? { text: atlasPatient.displayName }
      : {}),
    ...(atlasPatient.firstName || atlasPatient.lastName
      ? {
          given: atlasPatient.firstName ? [atlasPatient.firstName] : undefined,
          family: atlasPatient.lastName ?? undefined,
        }
      : {}),
  };

  return {
    resourceType: 'Patient',
    id: atlasPatient.id,
    meta: {
      profile: [`${FHIR_BASE_URL}/StructureDefinition/AtlasPatient`],
      lastUpdated: atlasPatient.updatedAt ?? atlasPatient.createdAt,
    },
    identifier: [
      {
        use: 'official',
        system: `${FHIR_BASE_URL}/identifier/patient`,
        value: atlasPatient.id,
      },
      ...(atlasPatient.taxId
        ? [{ use: 'secondary', system: 'urn:oid:2.16.840.1.113883.4.3', value: atlasPatient.taxId }]
        : []),
    ],
    active: atlasPatient.status === 'active',
    name: [humanName],
    telecom: [
      ...(atlasPatient.email
        ? [{ system: 'email', value: atlasPatient.email, use: 'home' }]
        : []),
      ...(atlasPatient.phone
        ? [{ system: 'phone', value: atlasPatient.phone, use: 'mobile' }]
        : []),
    ],
    gender: atlasPatient.gender ?? 'unknown',
    birthDate: atlasPatient.birthDate ?? undefined,
    address: atlasPatient.address
      ? [
          {
            use: 'home',
            text: atlasPatient.address,
            country: atlasPatient.country ?? undefined,
          },
        ]
      : [],
    communication: atlasPatient.language
      ? [{ language: { text: atlasPatient.language }, preferred: true }]
      : [],
  };
}

/**
 * Maps a FHIR R4 Patient resource back to an Atlas patient object.
 * @param {object} fhirPatient
 * @returns {object} Atlas patient data
 */
export function fromFhirPatient(fhirPatient) {
  const primaryName = fhirPatient.name?.[0];
  const emailTelecom = fhirPatient.telecom?.find((t) => t.system === 'email');
  const phoneTelecom = fhirPatient.telecom?.find((t) => t.system === 'phone');
  const primaryAddress = fhirPatient.address?.[0];

  return {
    id: fhirPatient.id,
    role: 'patient',
    displayName: primaryName?.text ?? [primaryName?.given?.[0], primaryName?.family].filter(Boolean).join(' '),
    firstName: primaryName?.given?.[0] ?? null,
    lastName: primaryName?.family ?? null,
    email: emailTelecom?.value ?? null,
    phone: phoneTelecom?.value ?? null,
    gender: fhirPatient.gender ?? null,
    birthDate: fhirPatient.birthDate ?? null,
    address: primaryAddress?.text ?? null,
    country: primaryAddress?.country ?? null,
    status: fhirPatient.active === false ? 'inactive' : 'active',
    language: fhirPatient.communication?.[0]?.language?.text ?? null,
    _source: 'fhir',
    _fhirVersion: 'R4',
  };
}

// ─── MedicationRequest Resource ──────────────────────────────────────────────

/**
 * Maps an Atlas prescription to a FHIR R4 MedicationRequest resource.
 *
 * FHIR spec: https://hl7.org/fhir/R4/medicationrequest.html
 * @param {object} atlasPrescription
 * @returns {object} FHIR MedicationRequest resource
 */
export function toFhirMedicationRequest(atlasPrescription) {
  const fhirStatus = {
    draft: 'draft',
    pending: 'active',
    approved: 'active',
    processing: 'active',
    'en tránsito': 'active',
    completed: 'completed',
    cancelled: 'cancelled',
  }[atlasPrescription.status] ?? 'unknown';

  return {
    resourceType: 'MedicationRequest',
    id: atlasPrescription.id,
    meta: {
      profile: [`${FHIR_BASE_URL}/StructureDefinition/AtlasMedicationRequest`],
      lastUpdated: atlasPrescription.updatedAt ?? atlasPrescription.createdAt,
    },
    status: fhirStatus,
    intent: 'order',
    medicationCodeableConcept: {
      text: atlasPrescription.items?.map((i) => i.productName ?? i.name).join(', ') ?? 'Compound Medication',
      coding: atlasPrescription.items?.map((item) => ({
        system: `${FHIR_BASE_URL}/CodeSystem/peptide`,
        code: item.productId ?? item.sku,
        display: item.productName ?? item.name,
      })) ?? [],
    },
    subject: {
      reference: `Patient/${atlasPrescription.patientId}`,
    },
    requester: {
      reference: `Practitioner/${atlasPrescription.doctorId}`,
    },
    authoredOn: atlasPrescription.createdAt ?? new Date().toISOString(),
    dosageInstruction: atlasPrescription.items?.map((item) => ({
      text: item.instructions ?? atlasPrescription.instructions ?? '',
      doseAndRate: [
        {
          doseQuantity: {
            value: item.dose ?? null,
            unit: item.unit ?? 'mg',
            system: 'http://unitsofmeasure.org',
          },
        },
      ],
      timing: item.frequency
        ? { code: { text: item.frequency } }
        : undefined,
    })) ?? [],
    note: atlasPrescription.notes
      ? [{ text: atlasPrescription.notes }]
      : [],
    extension: atlasPrescription.signatureMetadata
      ? [
          {
            url: `${FHIR_BASE_URL}/StructureDefinition/electronicSignature`,
            valueString: atlasPrescription.signatureMetadata.hash,
          },
        ]
      : [],
  };
}

/**
 * Maps a FHIR R4 MedicationRequest back to an Atlas prescription object.
 * @param {object} fhirMedReq
 * @returns {object} Atlas prescription data
 */
export function fromFhirMedicationRequest(fhirMedReq) {
  const atlasStatus = {
    draft: 'draft',
    active: 'approved',
    completed: 'completed',
    cancelled: 'cancelled',
    unknown: 'draft',
  }[fhirMedReq.status] ?? 'draft';

  return {
    id: fhirMedReq.id,
    status: atlasStatus,
    patientId: fhirMedReq.subject?.reference?.replace('Patient/', '') ?? null,
    doctorId: fhirMedReq.requester?.reference?.replace('Practitioner/', '') ?? null,
    createdAt: fhirMedReq.authoredOn ?? null,
    notes: fhirMedReq.note?.[0]?.text ?? null,
    items: fhirMedReq.medicationCodeableConcept?.coding?.map((coding, idx) => ({
      productId: coding.code,
      productName: coding.display,
      instructions: fhirMedReq.dosageInstruction?.[idx]?.text ?? '',
      dose: fhirMedReq.dosageInstruction?.[idx]?.doseAndRate?.[0]?.doseQuantity?.value ?? null,
      unit: fhirMedReq.dosageInstruction?.[idx]?.doseAndRate?.[0]?.doseQuantity?.unit ?? 'mg',
    })) ?? [],
    _source: 'fhir',
    _fhirVersion: 'R4',
  };
}

// ─── Observation Resource (Biomarkers) ───────────────────────────────────────

/**
 * Maps an Atlas biomarker entry to a FHIR R4 Observation resource.
 *
 * FHIR spec: https://hl7.org/fhir/R4/observation.html
 * @param {object} biomarker
 * @param {string} patientId
 * @returns {object} FHIR Observation resource
 */
export function toFhirObservation(biomarker, patientId) {
  return {
    resourceType: 'Observation',
    id: biomarker.id ?? `obs-${Date.now()}`,
    meta: {
      profile: [`${FHIR_BASE_URL}/StructureDefinition/AtlasObservation`],
      lastUpdated: biomarker.recordedAt ?? biomarker.createdAt,
    },
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'laboratory',
            display: 'Laboratory',
          },
        ],
      },
    ],
    code: {
      text: biomarker.name ?? biomarker.type ?? 'Biomarker',
      coding: [
        {
          system: biomarker.loincCode
            ? 'http://loinc.org'
            : `${FHIR_BASE_URL}/CodeSystem/biomarker`,
          code: biomarker.loincCode ?? biomarker.type,
          display: biomarker.name ?? biomarker.type,
        },
      ],
    },
    subject: {
      reference: `Patient/${patientId}`,
    },
    effectiveDateTime: biomarker.recordedAt ?? biomarker.createdAt,
    valueQuantity: {
      value: biomarker.value ?? null,
      unit: biomarker.unit ?? '',
      system: 'http://unitsofmeasure.org',
      code: biomarker.unit ?? '',
    },
    referenceRange: biomarker.referenceRange
      ? [
          {
            low: biomarker.referenceRange.low
              ? { value: biomarker.referenceRange.low, unit: biomarker.unit }
              : undefined,
            high: biomarker.referenceRange.high
              ? { value: biomarker.referenceRange.high, unit: biomarker.unit }
              : undefined,
            text: biomarker.referenceRange.text ?? undefined,
          },
        ]
      : [],
    note: biomarker.notes ? [{ text: biomarker.notes }] : [],
  };
}

/**
 * Maps a FHIR R4 Observation back to an Atlas biomarker entry.
 * @param {object} fhirObs
 * @returns {object} Atlas biomarker data
 */
export function fromFhirObservation(fhirObs) {
  return {
    id: fhirObs.id,
    patientId: fhirObs.subject?.reference?.replace('Patient/', '') ?? null,
    name: fhirObs.code?.text ?? fhirObs.code?.coding?.[0]?.display ?? 'Unknown',
    type: fhirObs.code?.coding?.[0]?.code ?? null,
    loincCode: fhirObs.code?.coding?.find((c) => c.system === 'http://loinc.org')?.code ?? null,
    value: fhirObs.valueQuantity?.value ?? null,
    unit: fhirObs.valueQuantity?.unit ?? null,
    recordedAt: fhirObs.effectiveDateTime ?? null,
    referenceRange: fhirObs.referenceRange?.[0]
      ? {
          low: fhirObs.referenceRange[0].low?.value ?? null,
          high: fhirObs.referenceRange[0].high?.value ?? null,
          text: fhirObs.referenceRange[0].text ?? null,
        }
      : null,
    notes: fhirObs.note?.[0]?.text ?? null,
    _source: 'fhir',
    _fhirVersion: 'R4',
  };
}

const fhirMappers = {
  toFhirPatient,
  fromFhirPatient,
  toFhirMedicationRequest,
  fromFhirMedicationRequest,
  toFhirObservation,
  fromFhirObservation,
};

export default fhirMappers;

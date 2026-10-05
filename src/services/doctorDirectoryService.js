/**
 * doctorDirectoryService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized directory and resolver for prescribing and treating physicians.
 * Cross-references Firestore (`users`, `clinics`) and Zoho Bigin CRM records.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const KNOWN_DOCTORS_DIRECTORY = [
  {
    id: 'z3aUIMaYsPViG1JgM95r',
    name: 'Dr. Cagatay Sezgin',
    aliases: ['dr. sezgin cagatay', 'sezgin cagatay', 'cagatay sezgin', 'dr cagatay sezgin', 'dr. sezgin', 'sezgin'],
    title: 'Dr.',
    specialty: 'Hair Restoration Surgeon & Dermatology Specialist',
    clinic: 'Hortman Clinics',
    clinicName: 'Hortman Clinics',
    clinicId: '8StD8XLAHbGSrOJXMqIK',
    address: '32nd Floor, Burj Al Salam Building, Sheikh Zayed Road, Dubai, UAE',
    city: 'Dubai',
    country: 'United Arab Emirates',
    phone: '+971 4 566 2615',
    mobile: '+971 4 566 2615',
    additionalPhone: '+90 532 687 9626',
    email: 'sezgin@hortmanclinics.com',
    secondaryEmail: 'cagataysezgin66@gmail.com',
    license: 'DHA Registered',
    assistantName: 'Adriana Barac',
    assistantEmail: 'adriana.barac@novomed.com',
    assistantPhone: '+971 52 243 9568',
    zohoContactId: '7006116000000636596'
  },
  {
    id: 'xihvYf568p39zDR3DI8t',
    name: 'Dr. Haytham Salem',
    aliases: ['dr. haytham salem', 'haytham salem', 'dr haytham', 'haytham'],
    title: 'Dr.',
    specialty: 'Consultant Orthopedic Surgeon & Regenerative Medicine Specialist',
    clinic: 'Arthregen Clinic',
    clinicName: 'Arthregen Clinic',
    clinicId: 'arthregen-dubai',
    address: 'Med Art Clinic Day Surgery Center, Villa 823, Jumeirah St., Dubai, UAE',
    city: 'Dubai',
    country: 'United Arab Emirates',
    phone: '+971 4 346 6149',
    mobile: '+971 50 185 2160',
    email: 'elinor.cabanero@hortmanclinics.com',
    license: 'DHA-P-0319842',
    website: 'www.mrhaytham.com'
  },
  {
    id: 'dr-hanieh-erdmann',
    name: 'Dr. Hanieh Erdmann',
    aliases: ['dr. hanieh erdmann', 'hanieh erdmann', 'dr hanieh', 'hanieh'],
    title: 'Dr.',
    specialty: 'Dermatologist & Hair Restoration Specialist',
    clinic: 'Bedaya Polyclinic',
    clinicName: 'Bedaya Polyclinic',
    clinicId: 'bedaya-polyclinic',
    address: 'Al Wasl Road, Jumeirah, Dubai, UAE',
    city: 'Dubai',
    country: 'United Arab Emirates',
    phone: '+971 4 348 8870',
    email: 'dr.hanieh@bedayaclinic.com',
    license: 'DHA Registered'
  },
  {
    id: 'dr-anitathurasini-rajoo',
    name: 'Dr. Anitathurasini Rajoo',
    aliases: ['dr. anitathurasini rajoo', 'anitathurasini rajoo', 'dr. anita', 'anita'],
    title: 'Dr.',
    specialty: 'Trichology & Peptide Therapy Consultant',
    clinic: 'Novomed Integrative Medicine',
    clinicName: 'Novomed Integrative Medicine',
    address: 'Dubai Marina, Dubai, UAE',
    city: 'Dubai',
    country: 'United Arab Emirates',
    phone: '+971 4 247 5555',
    email: 'anita.rajoo@novomed.com',
    license: 'DHA Registered'
  },
  {
    id: 'dr-vibhor-devendra',
    name: 'Dr. Vibhor Devendra',
    aliases: ['dr. vibhor devendra', 'vibhor devendra', 'dr vibhor'],
    title: 'Dr.',
    specialty: 'Genomic Medicine & Anti-Aging Specialist',
    clinic: 'Mediluxe Longevity Center',
    clinicName: 'Mediluxe Longevity Center',
    address: 'Jumeirah, Dubai, UAE',
    city: 'Dubai',
    country: 'United Arab Emirates',
    phone: '+971 4 395 5599',
    email: 'dr.vibhor@mediluxeme.com',
    license: 'DHA Registered'
  },
  {
    id: 'dr-marina-cordeiro',
    name: 'Dr. Marina Cordeiro Fernandes',
    aliases: ['dr. marina cordeiro', 'dr. marina cordeiro fernandes', 'marina cordeiro'],
    title: 'Dr.',
    specialty: 'Functional & Regenerative Medicine Specialist',
    clinic: 'NOVA Clinic Day Surgery Center',
    clinicName: 'NOVA Clinic Day Surgery Center',
    address: 'Dubai Healthcare City, Dubai, UAE',
    city: 'Dubai',
    country: 'United Arab Emirates',
    phone: '+971 4 384 5678',
    email: 'dr.marina@novaclinic.ae',
    license: 'DHA-91105367'
  }
];

/**
 * Normalizes query string for matching.
 */
function normalizeQuery(str) {
  return String(str || '').toLowerCase().trim().replace(/^dr\.?\s+/i, '').replace(/[-_\s]+/g, ' ');
}

/**
 * Synchronous profile lookup against known directory.
 * @param {string} query
 * @returns {object|null}
 */
export function findDoctorInDirectory(query) {
  if (!query) return null;
  const qClean = normalizeQuery(query);
  if (!qClean) return null;

  for (const doc of KNOWN_DOCTORS_DIRECTORY) {
    if (normalizeQuery(doc.name) === qClean) return doc;
    if (doc.aliases.some(a => normalizeQuery(a) === qClean || qClean.includes(normalizeQuery(a)))) {
      return doc;
    }
    if (doc.email && doc.email.toLowerCase() === qClean) return doc;
  }
  return null;
}

/**
 * Resolves the richest possible doctor profile from query.
 * Falls back to input fields if not matched.
 */
export function resolveDoctorProfile(inputDoc) {
  if (!inputDoc) return null;
  const nameToSearch = typeof inputDoc === 'string' ? inputDoc : (inputDoc.name || inputDoc.doctorName || inputDoc.displayName || '');
  const matched = findDoctorInDirectory(nameToSearch);

  if (matched) {
    return {
      ...matched,
      ...(typeof inputDoc === 'object' ? inputDoc : {}),
      name: matched.name,
      clinic: inputDoc.clinic || matched.clinic,
      clinicName: inputDoc.clinicName || matched.clinicName,
      specialty: inputDoc.specialty || matched.specialty,
      phone: inputDoc.phone || matched.phone,
      mobile: inputDoc.mobile || matched.mobile,
      email: inputDoc.email || matched.email,
      address: inputDoc.address || matched.address,
      license: inputDoc.license || matched.license
    };
  }

  if (typeof inputDoc === 'object' && inputDoc !== null) {
    return {
      name: inputDoc.name || nameToSearch,
      specialty: inputDoc.specialty || 'Prescribing Physician Consultant',
      clinic: inputDoc.clinic || inputDoc.clinicName || 'Licensed Clinical Practice',
      clinicName: inputDoc.clinicName || inputDoc.clinic || 'Licensed Clinical Practice',
      address: inputDoc.address || '',
      phone: inputDoc.phone || inputDoc.mobile || '',
      email: inputDoc.email || '',
      license: inputDoc.license || ''
    };
  }

  return {
    name: nameToSearch,
    specialty: 'Prescribing Physician Consultant',
    clinic: 'Licensed Clinical Practice',
    clinicName: 'Licensed Clinical Practice',
    address: '',
    phone: '',
    email: '',
    license: ''
  };
}

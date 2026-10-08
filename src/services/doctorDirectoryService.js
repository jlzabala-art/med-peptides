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
    name: 'Dr. Çağatay Sezgin, MD, FISHRS',
    aliases: [
      'dr. sezgin cagatay', 'sezgin cagatay', 'cagatay sezgin', 'dr cagatay sezgin', 
      'dr. sezgin', 'sezgin', 'dr. çağatay sezgin', 'çağatay sezgin', 'cagatay', 'dr cagatay'
    ],
    title: 'Dr. Çağatay Sezgin, MD, FISHRS',
    specialty: 'Hair Transplant Surgeon / Specialist General Surgery',
    mainArea: 'Hair Restoration Surgery',
    clinic: 'Shamma Clinic by Novomed LLC / Novomed Clinics',
    clinicName: 'Shamma Clinic by Novomed LLC / Novomed Clinics',
    clinicId: 'shamma-novomed-dubai',
    address: 'Street 10C, Villa 41, Jumeirah 1, Behind Jumeirah Plaza',
    city: 'Dubai',
    country: 'United Arab Emirates',
    phone: '+971 4 349 8800',
    clinicPhone: '+971 4 349 8800',
    mobile: '+90 532 687 9626',
    publishedMobile: '+90 532 687 9626',
    novomedCentral: '+971 800 6686 / 800 NOVOMED',
    website: 'https://drsezgin.com',
    profileUrl: 'https://novomed.com/doctors/dr-cagatay-sezgin/',
    email: 'cagataysezgin66@gmail.com',
    secondaryEmail: 'sezgin@hortmanclinics.com',
    license: 'DHA 00208953-005',
    licenseNumber: 'DHA 00208953-005',
    authority: 'DHA',
    licenseValidFrom: '3 September 2026',
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
    aliases: ['dr. marina cordeiro', 'dr. marina cordeiro fernandes', 'marina cordeiro', 'dr. marina', 'dr marina', 'marina'],
    title: 'Dr.',
    specialty: 'General Practitioner · Aesthetic & Longevity Medicine',
    clinic: 'NOVA Clinic',
    clinicName: 'NOVA Clinic · Dubai Healthcare City, Dubai, UAE',
    address: 'Dubai Healthcare City, Dubai, UAE',
    city: 'Dubai',
    country: 'United Arab Emirates',
    phone: '+971 4 384 5678',
    email: 'dr.marina@novaclinic.ae',
    license: 'DHA-91105367'
  },
  {
    id: 'raffanie-lucenio',
    name: 'Raffanie Lucenio',
    aliases: ['raffanie lucenio', 'dr. raffanie lucenio', 'dr raffanie lucenio', 'dr raffanie', 'raffanie', 'lucenio'],
    title: 'Dr.',
    specialty: 'Trichology & Aesthetic Medicine',
    clinic: 'The Masters Medical Center',
    clinicName: 'The Masters Medical Center',
    clinicId: 'i1Dgcnn0sFtxMyewe1qJ',
    address: 'Building 81, Street 555, Leabaib Zone 70',
    city: 'Doha',
    country: 'Qatar',
    phone: '+974 4444 3431',
    clinicPhone: '+974 4444 3431',
    website: 'https://themasters.qa',
    email: 'raffanie@themasters.qa',
    license: 'QCHP Registered'
  },
  {
    id: 'dr-miguel-angel-lopez-aranda',
    name: 'Dr. Miguel Ángel López Aranda',
    aliases: [
      'dr. miguel ángel lópez aranda', 'miguel angel lopez aranda', 'dr miguel angel', 
      'lopez aranda', 'dr. lopez aranda', 'miguel angel lopez', 'dr miguel angel lopez'
    ],
    title: 'Dr.',
    specialty: 'Cirujano Capilar & Médico Prescriptor de Producción Magistral',
    clinic: 'Clínica Capilar Dr. López Aranda',
    clinicName: 'Clínica Capilar Dr. López Aranda',
    country: 'España',
    city: 'Madrid',
    license: 'Lic. 282869584',
    isProductionDoctor: true,
    hasDHA: false,
    purpose: 'compounding_production_order'
  },
  {
    id: 'dra-haydee-camacho-gamboa',
    name: 'Dra. Haydee Camacho Gamboa',
    aliases: [
      'dra. haydee camacho', 'haydee camacho', 'dr. haydee camacho', 'dra haydee camacho gamboa',
      'dra haydee camacho', 'dra. camacho', 'dra camacho', 'haydee camacho gamboa'
    ],
    title: 'Dra.',
    specialty: 'Terapia Hormonal Bioidéntica (BHRT) & Medicina Antienvejecimiento',
    clinic: 'Clínica Dra. Camacho',
    clinicName: 'Clínica Dra. Camacho',
    clinicId: 'clinica-dra-camacho-barcelona',
    address: 'Carrer d\'Aribau 162-166, Entresuelo O',
    city: 'Barcelona',
    country: 'España',
    phone: '+34 606 767 420',
    email: 'info@dracamacho.com',
    website: 'https://dracamacho.com',
    license: 'COMB 46759',
    authority: 'COMB'
  },
  {
    id: 'dr-khalid-shukri',
    name: 'Dr. Khalid Shukri',
    aliases: ['dr. khalid shukri', 'khalid shukri', 'dr khalid', 'khalid'],
    title: 'Dr.',
    specialty: 'Clinical Medicine & Wellness Specialist',
    clinic: 'Dr. Khalid Shukri Clinic',
    clinicName: 'Dr. Khalid Shukri Clinic',
    clinicId: 'dr-khalid-shukri-clinic',
    address: 'Dubai, UAE',
    city: 'Dubai',
    country: 'United Arab Emirates',
    phone: '',
    email: 'dr.khalid@shukriclinic.com',
    license: 'DHA Registered',
    authority: 'DHA'
  },
  {
    id: 'dr-sobia',
    name: 'Dr. Sobia',
    aliases: ['dr. sobia', 'sobia', 'dr sobia', 'sobia mlsc'],
    title: 'Dr.',
    specialty: 'Longevity & Aesthetic Medicine Specialist',
    clinic: 'Mediluxe Longevity Center (MLSC)',
    clinicName: 'Mediluxe Longevity Center',
    clinicId: 'mlsc-dubai',
    address: 'Dubai, UAE',
    city: 'Dubai',
    country: 'United Arab Emirates',
    phone: '',
    email: 'dr.sobia@mediluxeme.com',
    license: 'DHA Registered',
    authority: 'DHA'
  },
  {
    id: 'dr-fahed-al-mutawah',
    name: 'Dr. Fahed Abdulaziz Al Mutawah',
    aliases: ['dr. fahed abdulaziz al mutawah', 'dr fahed al mutawah', 'dr fahed', 'fahed al mutawah'],
    title: 'Dr.',
    specialty: 'Dermatologist & Laser Specialist',
    clinic: 'My Skin Clinic (Kuwait)',
    clinicName: 'My Skin Clinic',
    clinicId: 'my-skin-kw',
    address: 'Kuwait City, Kuwait',
    city: 'Kuwait City',
    country: 'Kuwait',
    phone: '',
    email: 'dr.fahed@myskin.com.kw',
    license: 'MOH Registered',
    authority: 'MOH'
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

/**
 * Canonical Medical License Formatter
 * ─────────────────────────────────────────────────────────────────────────────
 * Correctly attributes licensing authority acronyms according to jurisdiction:
 * - Dubai / UAE: "DHA" (e.g. "DHA 00208953-005", "DHA-P-0319842")
 * - Abu Dhabi: "DOH" / "HAAD"
 * - UAE Federal: "MOHAP"
 * - Spain / España: "Lic." (e.g. "Lic. 282869584") or "Col."
 * - United Kingdom: "GMC" (e.g. "GMC 1234567")
 * - United States: "NPI"
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function formatMedicalLicense(rawLicense, doctorContext = {}) {
  if (!rawLicense || typeof rawLicense !== 'string') return '';
  const lic = rawLicense.trim();
  if (!lic || lic === '—' || lic === '-') return '';

  const upper = lic.toUpperCase();

  // 1. If already prefixed with recognized authority acronym
  if (upper.startsWith('DHA-') || upper.startsWith('DHA ') || upper.startsWith('DHA:')) {
    return lic.replace(/^DHA[:\s]+/i, 'DHA ');
  }
  if (upper.startsWith('DHCC') || upper.startsWith('MOHAP') || upper.startsWith('DOH') || upper.startsWith('HAAD')) {
    return lic;
  }
  if (upper.startsWith('COMB') || upper.startsWith('GMC') || upper.startsWith('NPI')) {
    return lic;
  }
  if (upper.startsWith('COL.') || upper.startsWith('COL ') || upper.startsWith('LIC.') || upper.startsWith('LIC ')) {
    return lic;
  }

  // 2. Derive authority from doctor / context metadata (country, city, address, clinic, doctor name)
  const country = String(doctorContext.country || doctorContext.doctorCountry || '').toLowerCase();
  const city = String(doctorContext.city || doctorContext.doctorCity || '').toLowerCase();
  const address = String(doctorContext.address || doctorContext.doctorAddress || '').toLowerCase();
  const clinic = String(doctorContext.clinic || doctorContext.clinicName || '').toLowerCase();
  const name = String(doctorContext.name || doctorContext.doctorName || '').toLowerCase();

  const isUae = country.includes('emirates') || country.includes('uae') || country.includes('emiratos') ||
                city.includes('dubai') || city.includes('abu dhabi') ||
                address.includes('dubai') || address.includes('uae') || address.includes('jumeirah') ||
                clinic.includes('novomed') || clinic.includes('arthregen') || clinic.includes('shamma') || clinic.includes('mediluxe') || clinic.includes('nova') ||
                name.includes('sezgin') || name.includes('haytham') || name.includes('hanieh') || name.includes('rajoo') || name.includes('marina');

  const isSpain = country.includes('spain') || country.includes('españa') ||
                  city.includes('madrid') || city.includes('barcelona') || city.includes('valencia') || city.includes('málaga') ||
                  name.includes('miguel ángel') || name.includes('aranda');

  const isUk = country.includes('united kingdom') || country.includes('uk') || city.includes('london');

  if (isUae) {
    return `DHA ${lic}`;
  }

  if (isSpain) {
    return `Lic. ${lic}`;
  }

  if (isUk) {
    return `GMC ${lic}`;
  }

  // Default to DHA if operating within our primary UAE clinical ecosystem
  return `DHA ${lic}`;
}

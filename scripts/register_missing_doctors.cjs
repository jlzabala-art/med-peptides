/**
 * register_missing_doctors.cjs
 * 
 * 1. Updates Dr. M. Jay Alkhatib → Laboratory Director at YDL (not clinical physician)
 * 2. Registers Dr. Fahed Abdulaziz Al Mutawah (My Skin Clinic, Kuwait)
 * 3. Registers Dr. Rehab Serafi (Mayam Aesthetics / Serafi Clinic, Jeddah, KSA)
 * 4. Ensures Dr. Raffanie Lucenio (The Masters Medical Center, Doha, Qatar) is fully registered
 * 5. Stores internalIntelligence dossier for each doctor (admin-only, invisible to doctor)
 * 
 * Run: node scripts/register_missing_doctors.cjs
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const saPath = path.resolve(__dirname, '..', 'serviceAccount-target.json');
const sa = require(saPath);

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}
const db = admin.firestore();
const now = new Date().toISOString();

async function main() {
  console.log('=== STEP 1: UPDATE DR. M. JAY ALKHATIB (Laboratory Director) ===');
  
  await db.collection('users').doc('dr-jay-alkhatib').set({
    // Correct his role description — he is a Lab Director, not a clinical physician
    specialty: 'Laboratory Medicine — Molecular Diagnostics & Pharmacogenomics',
    title: 'Laboratory Director',
    professionalTitle: 'PhD, Lab Director',
    isLabDirector: true,
    isClinicalPhysician: false,
    // Keep existing clinic association to YDL
    clinicId: 'clinic-ydl-dubai',
    clinicName: 'York Diagnostic Laboratories DMCC (YDL)',
    // Internal intelligence dossier (admin-only, never shown to doctor)
    internalIntelligence: {
      researchedAt: now,
      source: 'Public web, YDL website, LinkedIn',
      summary: 'Dr. M. Jay Alkhatib is Co-Founder and Laboratory Director of York Diagnostic Laboratories (YDL) in JLT, Dubai. He holds a PhD in Medical Microbiology/Molecular Diagnostics from Liverpool University (UK) and completed post-doctoral training at Texas A&M University (USA). He is NOT a clinical physician — he oversees lab operations, molecular diagnostics, and pharmacogenomic testing services. Active member of the Dubai Accreditation Department (DAC) Task Force and Technical Advisory Committee. YDL specializes in TrichoTest, NutriGen, and other Fagron Genomics diagnostic panels.',
      credentials: [
        'PhD Medical Microbiology — Liverpool University (UK)',
        'Post-doctoral Fellow — Texas A&M University (USA)',
        'DAC Task Force & Technical Advisory Committee Member'
      ],
      interests: [
        'Pharmacogenomics',
        'Molecular Diagnostics',
        'Nutrigenomics (NutriGen testing)',
        'Trichology diagnostics (TrichoTest)',
        'Laboratory accreditation (JCI, ISO 15189)',
        'Precision medicine'
      ],
      recommendedProducts: [
        'NutriGen panels',
        'TrichoTest panels',
        'TeloTest (biological age)',
        'Fagron Genomics full portfolio'
      ],
      linkedinUrl: null, // Not publicly available
      websiteUrl: 'https://ydl-me.com',
      visibility: 'admin_only'
    },
    updatedAt: now
  }, { merge: true });
  console.log('✅ Updated Dr. M Jay Alkhatib → Laboratory Director at YDL');

  // ========================================================================
  console.log('\n=== STEP 2: REGISTER DR. FAHED ABDULAZIZ AL MUTAWAH ===');
  
  const drFahedId = 'dr-fahed-al-mutawah';
  await db.collection('users').doc(drFahedId).set({
    id: drFahedId,
    displayName: 'Prof. Dr. Fahed Abdulaziz Al Mutawah',
    name: 'Prof. Dr. Fahed Abdulaziz Al Mutawah',
    firstName: 'Fahed',
    lastName: 'Al Mutawah',
    email: 'a.essam@myskinkw.com',
    role: 'doctor',
    specialty: 'Consultant Dermatologist — Laser & Aesthetic Medicine',
    title: 'Professor / Consultant Dermatologist',
    professionalTitle: 'ABD, FRCPC',
    clinicId: 'clinic-my-skin-kuwait',
    clinicName: 'My Skin Clinic',
    country: 'Kuwait',
    city: 'Kuwait City',
    address: 'Kuwait City, Kuwait',
    licenseNumber: 'KW-MOH-DERM',
    wholeseller: 'Direct',
    status: 'active',
    isClinicalPhysician: true,
    isLabDirector: false,
    internalIntelligence: {
      researchedAt: now,
      source: 'Public web, myskinkw.com, Instagram, mshealthcarekw.com',
      summary: 'Prof. Dr. Fahad Abdulaziz Al-Mutawa is a top-tier board-certified consultant dermatologist in Kuwait. He holds American Board of Dermatology (ABD) and FRCPC certifications. Trained at McGill University (Montreal) with a fellowship in Photomedicine & Laser at Henry Ford Hospital (Michigan). Former Assistant Professor at Kuwait University. Founder of My Skin Clinic. Specializes in medical/surgical/cosmetic dermatology, alopecia, microscopic hair transplants, laser therapies, anti-aging (botox, fillers), scar/pigmentation removal.',
      credentials: [
        'American Board of Dermatology (ABD)',
        'FRCPC — Royal College of Physicians and Surgeons of Canada',
        'Photomedicine & Laser Fellowship — Henry Ford Hospital (Michigan)',
        'Dermatology Residency — McGill University (Montreal)',
        'Former Assistant Professor — Kuwait University'
      ],
      interests: [
        'Alopecia & hair restoration',
        'Laser medicine & photomedicine',
        'Anti-aging aesthetics (Botox, fillers)',
        'Pigmentation & scar treatment',
        'Nutrigenomics & personalized dermatology',
        'Microscopic hair transplants'
      ],
      recommendedProducts: [
        'TrichoTest (hair loss genetics)',
        'NutriGen (personalized nutrition)',
        'Topical compounding formulations for dermatology',
        'Anti-aging peptide formulations',
        'Hair growth peptide blends'
      ],
      linkedinUrl: null,
      websiteUrl: 'https://myskinkw.com',
      instagramUrl: 'https://instagram.com/myskinkw',
      visibility: 'admin_only'
    },
    createdAt: now,
    updatedAt: now
  }, { merge: true });
  console.log('✅ Registered Prof. Dr. Fahed Al Mutawah (My Skin Clinic, Kuwait)');

  // Also create clinic record
  await db.collection('clinics').doc('clinic-my-skin-kuwait').set({
    id: 'clinic-my-skin-kuwait',
    name: 'My Skin Clinic',
    country: 'Kuwait',
    city: 'Kuwait City',
    address: 'Kuwait City, Kuwait',
    phone: null,
    email: 'a.essam@myskinkw.com',
    website: 'https://myskinkw.com',
    primaryDoctor: drFahedId,
    primaryDoctorName: 'Prof. Dr. Fahed Abdulaziz Al Mutawah',
    status: 'active',
    createdAt: now,
    updatedAt: now
  }, { merge: true });
  console.log('  📍 Created clinic: My Skin Clinic (Kuwait)');

  // ========================================================================
  console.log('\n=== STEP 3: REGISTER DR. REHAB SERAFI ===');
  
  const drRehabId = 'dr-rehab-serafi';
  await db.collection('users').doc(drRehabId).set({
    id: drRehabId,
    displayName: 'Dr. Rehab Serafi',
    name: 'Dr. Rehab Serafi',
    firstName: 'Rehab',
    lastName: 'Serafi',
    email: 'jose@mediluxeme.com', // placeholder — contact through Mediluxe
    role: 'doctor',
    specialty: 'Consultant Dermatologist — Aesthetic & Laser Medicine',
    title: 'Consultant Dermatologist',
    professionalTitle: 'French Specialty Certificate, EADV Member',
    clinicId: 'clinic-dr-rehab-serafi',
    clinicName: 'Mayam Aesthetics / Dr. Rehab Serafi Clinic',
    country: 'Saudi Arabia',
    city: 'Jeddah',
    address: 'Ash Shati district, Al Screen Tower, 29th Floor, King Abdulaziz Road, Jeddah, KSA',
    phone: '+966 54 588 2929',
    licenseNumber: 'KSA-MOH-DERM',
    wholeseller: 'Direct',
    status: 'active',
    isClinicalPhysician: true,
    isLabDirector: false,
    internalIntelligence: {
      researchedAt: now,
      source: 'Public web, mayamaesthetics.com.sa, Instagram, therapr.com',
      summary: 'Dr. Rehab Serafi (د. رحاب صيرفي) is a Consultant Dermatologist specializing in Aesthetic & Laser Medicine in Jeddah, Saudi Arabia. She holds the French Specialty Certificate and a University Diploma in Non-Surgical Aesthetic Procedures. Member of the European Academy of Dermatology and Venereology (EADV). Practices at Mayam Aesthetics (Jeddah & Riyadh locations). Specializes in acne/scarring treatment, pigmentation, skin rejuvenation, Botox, fillers, and laser therapies.',
      credentials: [
        'French Specialty Certificate — Dermatology',
        'University Diploma — Non-Surgical Aesthetic Procedures',
        'Member — European Academy of Dermatology and Venereology (EADV)'
      ],
      interests: [
        'Aesthetic dermatology',
        'Laser medicine & skin rejuvenation',
        'Acne & scar treatment',
        'Pigmentation therapies',
        'Non-surgical aesthetics (Botox, fillers)',
        'Anti-aging protocols',
        'Biological age testing'
      ],
      recommendedProducts: [
        'TeloTest (biological age testing)',
        'NutriGen (personalized nutrition)',
        'Anti-aging peptide formulations',
        'Topical compounding for dermatology',
        'Skin rejuvenation peptide blends'
      ],
      linkedinUrl: null,
      websiteUrl: 'https://mayamaesthetics.com.sa',
      instagramUrl: null,
      visibility: 'admin_only'
    },
    createdAt: now,
    updatedAt: now
  }, { merge: true });
  console.log('✅ Registered Dr. Rehab Serafi (Jeddah, KSA)');

  // Clinic for Serafi
  await db.collection('clinics').doc('clinic-dr-rehab-serafi').set({
    id: 'clinic-dr-rehab-serafi',
    name: 'Mayam Aesthetics / Dr. Rehab Serafi Clinic',
    country: 'Saudi Arabia',
    city: 'Jeddah',
    address: 'Ash Shati district, Al Screen Tower, 29th Floor, King Abdulaziz Road, Jeddah, KSA',
    phone: '+966 54 588 2929',
    unifiedNumber: '+966 9200 15091',
    email: null,
    website: 'https://mayamaesthetics.com.sa',
    primaryDoctor: drRehabId,
    primaryDoctorName: 'Dr. Rehab Serafi',
    status: 'active',
    createdAt: now,
    updatedAt: now
  }, { merge: true });
  console.log('  📍 Created clinic: Mayam Aesthetics (Jeddah, KSA)');

  // ========================================================================
  console.log('\n=== STEP 4: REGISTER DR. RAFFANIE LUCENIO ===');
  
  const drRaffanieId = 'raffanie-lucenio';
  await db.collection('users').doc(drRaffanieId).set({
    id: drRaffanieId,
    displayName: 'Dr. Raffanie Lucenio',
    name: 'Dr. Raffanie Lucenio',
    firstName: 'Raffanie',
    lastName: 'Lucenio',
    email: 'raffanie@themasters.qa',
    role: 'doctor',
    specialty: 'General Practice & Aesthetic Medicine',
    title: 'Physician',
    clinicId: 'clinic-masters-qatar',
    clinicName: 'The Masters Medical Center',
    country: 'Qatar',
    city: 'Doha',
    address: 'Building 81, Street 555, Leabaib Zone 70, Doha, Qatar',
    phone: '+974 4444 3431',
    licenseNumber: 'QCHP Registered',
    wholeseller: 'Direct',
    status: 'active',
    isClinicalPhysician: true,
    isLabDirector: false,
    internalIntelligence: {
      researchedAt: now,
      source: 'Public web, themasters.qa, Doha directory',
      summary: 'Dr. Raffanie Lucenio (also Raffanie Mae Lucenio-Mahinay) is a physician associated with The Masters Medical Center in Doha, Qatar. The Masters Medical Center is a multi-specialty facility in Leabaib, Doha, co-founded by Dr. Jassim Fakhro, specializing in bariatric surgery, general surgery, dermatology, plastic surgery, and nutritional health. Key staff includes Dr. Mohammed Al-Kuwari, Dr. Jassim Fakhro, and Dr. Thanaa Alfares (dermatology). Lucenio appears to handle general practice and aesthetic treatments as part of the clinic team, with a focus on TrichoTest and personalized medicine.',
      credentials: [
        'QCHP Registered — Qatar',
        'Nursing/Medical background — Philippines'
      ],
      interests: [
        'Trichology & hair loss diagnosis',
        'Personalized medicine (TrichoTest)',
        'Aesthetic medicine',
        'General practice',
        'Nutrigenomics'
      ],
      recommendedProducts: [
        'TrichoTest (hair loss genetics)',
        'NutriGen (personalized nutrition)',
        'Hair restoration formulations',
        'Anti-aging compounding'
      ],
      linkedinUrl: null,
      websiteUrl: 'https://themasters.qa',
      visibility: 'admin_only'
    },
    createdAt: now,
    updatedAt: now
  }, { merge: true });
  console.log('✅ Registered Dr. Raffanie Lucenio (The Masters, Doha, Qatar)');

  // Clinic for Lucenio
  await db.collection('clinics').doc('clinic-masters-qatar').set({
    id: 'clinic-masters-qatar',
    name: 'The Masters Medical Center',
    country: 'Qatar',
    city: 'Doha',
    address: 'Building 81, Street 555, Leabaib Zone 70, Doha, Qatar',
    phone: '+974 4444 3431',
    email: 'info@themasters.qa',
    website: 'https://themasters.qa',
    primaryDoctor: drRaffanieId,
    primaryDoctorName: 'Dr. Raffanie Lucenio',
    otherDoctors: ['Dr. Jassim Fakhro', 'Dr. Mohammed Al-Kuwari', 'Dr. Thanaa Alfares'],
    status: 'active',
    createdAt: now,
    updatedAt: now
  }, { merge: true });
  console.log('  📍 Created clinic: The Masters Medical Center (Doha, Qatar)');

  // ========================================================================
  console.log('\n=== SUMMARY ===');
  console.log('1. ✅ Dr. M Jay Alkhatib → Updated to Laboratory Director (YDL, not clinical physician)');
  console.log('2. ✅ Prof. Dr. Fahed Al Mutawah → Registered (My Skin Clinic, Kuwait)');
  console.log('3. ✅ Dr. Rehab Serafi → Registered (Mayam Aesthetics, Jeddah, KSA)');
  console.log('4. ✅ Dr. Raffanie Lucenio → Registered (The Masters Medical Center, Doha, Qatar)');
  console.log('\n📊 Internal Intelligence dossiers stored for all 4 doctors (admin_only visibility)');
  console.log('🔒 Doctor Portal will NEVER display internalIntelligence data');
}

main()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });

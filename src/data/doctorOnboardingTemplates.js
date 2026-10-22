/**
 * src/data/doctorOnboardingTemplates.js
 *
 * Standardized English Physician Onboarding & 1-Tap Access Templates
 * for Atlas Health Services.
 */

export function generateDoctorWelcomeWhatsApp({
  doctorName = 'Doctor',
  accessUrl = '',
  durationHours = 24
}) {
  const cleanTitle = doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`;

  return `🩺 *Atlas Health Services — 1-Tap Clinical Access*

Dear ${cleanTitle},

Welcome to **Atlas Health Services**, your specialized compounding pharmacy and clinical precision medicine platform.

We provide prescribing physicians with:
• **Individualized Magistral Formulations**: Custom USP-grade compounding (liposomal transdermal creams, oral capsules, sublingual troches).
• **Regenerative Bioactive Peptides & BHRT**: Scientifically validated endocrine and longevity protocols.
• **Nominal Patient Dossiers & Refills**: Seamless 1-click digital prescriptions and cold-chain pharmacy dispensing directly to your patients.

🔑 **Your Secure 1-Tap Clinical Portal Access**:
👉 ${accessUrl}

⏱️ *Link validity*: **${durationHours} hours** from dispatch.
💻 *Workstation Authorization*: Opening this link authorizes your mobile or desktop clinic workstation for **90 days** without needing a password.

If you require clinical formulation support, custom posology adjustments, or testing dossiers, our medical support team is at your disposal.

_Atlas Health Services — Precision Compounding & Clinical Operations_
_Dubai · Doha · Madrid · Zurich_`;
}

export function generateDoctorWelcomeEmail({
  doctorName = 'Doctor',
  accessUrl = '',
  durationHours = 24,
  clinicName = ''
}) {
  const cleanTitle = doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`;

  return {
    subject: `Atlas Health Services — Clinical Practice Activation & 1-Tap Portal Access (${cleanTitle})`,
    body: `Dear ${cleanTitle},

On behalf of Atlas Health Services, we are delighted to welcome you to our international network of precision medicine and longevity practitioners.

### About Atlas Health Services
Atlas Health Services bridges specialized clinical compounding pharmacy with evidence-based longevity therapies. Through our accredited compounding laboratories and certified cold-chain logistics, we deliver:

1. **Individualized Magistral Compounding**:
   Custom-tailored galenic formulas prepared under strict European and USP pharmacopeia standards (e.g., Pentravan® liposomal transdermal dispensers, personalized bioidentical hormone titration, synergistic co-factors).

2. **Bioactive Peptides & Advanced Therapeutic Suites**:
   Clinical-grade peptides, restorative senolytics, cuticular native collagen ECM lines (Colway® Atelocollagen), and molecular/genomic diagnostics (Bloodo™ / Fagron Genomics).

3. **Dedicated Physician Digital Workspace**:
   A streamlined, zero-friction portal where you can review your active patient cohort, customize magistral posologies with single-click prescription intake, and track preparation status in real-time.

---

### Your 1-Tap Clinical Practice Activation
To provide immediate access without the security friction of passwords, we have issued a temporary 1-Tap Access Link for your workstation:

👉 **Activate Your Clinical Portal**:
${accessUrl}

• **Validity**: Active for ${durationHours} hours.
• **Persistent Session**: Opening this link establishes a trusted, encrypted clinical session on your device valid for 90 days.
• **Direct Capabilities**: Instant access to your nominal patient files, compounding recetario, and therapeutic blueprints.

Should you wish to review specific clinical monographs, discuss custom excipients, or request complimentary clinic sample dossiers for your practice, please do not hesitate to contact our medical liaison team.

Warm regards,

**Clinical Operations & Medical Advisory Team**
Atlas Health Services
Email: medical@atlashealth-services.com
Web: https://www.atlashealth-services.com
Dubai · Doha · Madrid · Zurich`
  };
}

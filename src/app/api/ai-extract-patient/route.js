import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { adminDb } from '@/lib/firebaseAdmin';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const COUNTRY_MAP = {
  'uae': 'AE',
  'united arab emirates': 'AE',
  'dubai': 'AE',
  'abu dhabi': 'AE',
  'spain': 'ES',
  'espana': 'ES',
  'españa': 'ES',
  'madrid': 'ES',
  'usa': 'US',
  'united states': 'US',
  'uk': 'GB',
  'united kingdom': 'GB',
  'great britain': 'GB',
  'london': 'GB',
  'saudi arabia': 'SA',
  'ksa': 'SA',
  'saudi': 'SA',
  'qatar': 'QA',
  'doha': 'QA',
  'kuwait': 'KW',
  'oman': 'OM',
  'bahrain': 'BH',
  'mexico': 'MX',
  'colombia': 'CO'
};

const PROGRAM_MAP = {
  'longevity': 'Longevity',
  'anti-aging': 'Longevity',
  'aging': 'Longevity',
  'weight loss': 'Weight Loss',
  'metabolic': 'Weight Loss',
  'glp-1': 'Weight Loss',
  'glp1': 'Weight Loss',
  'tirzepatide': 'Weight Loss',
  'semaglutide': 'Weight Loss',
  'performance': 'Performance',
  'athletic': 'Performance',
  'recovery': 'Performance',
  'injury': 'Performance',
  'cognitive': 'Cognitive',
  'neuro': 'Cognitive',
  'brain': 'Cognitive',
  'hormonal': 'Hormonal',
  'hormone': 'Hormonal',
  'trt': 'Hormonal',
  'growth hormone': 'Hormonal',
  'gh': 'Hormonal',
  'vip': 'VIP'
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const schema = {
      type: Type.OBJECT,
      properties: {
        firstName: { type: Type.STRING, description: 'First name of the patient' },
        lastName: { type: Type.STRING, description: 'Last name of the patient' },
        email: { type: Type.STRING, description: 'Email address of the patient' },
        phone: { type: Type.STRING, description: 'Phone number in international or local format' },
        country: { type: Type.STRING, description: 'Country or city mentioned (e.g. UAE, Spain, Dubai, Qatar)' },
        dateOfBirth: { type: Type.STRING, description: 'Date of birth in YYYY-MM-DD format if mentioned' },
        gender: { type: Type.STRING, description: 'Gender if mentioned: Female, Male, or Other' },
        clinicName: { type: Type.STRING, description: 'Clinic or medical center name if mentioned' },
        physicianName: { type: Type.STRING, description: 'Physician or doctor name if mentioned' },
        program: { type: Type.STRING, description: 'Clinical focus/program (e.g. Longevity, Weight Loss, Performance, Cognitive, Hormonal, VIP)' },
        notes: { type: Type.STRING, description: 'Any clinical or background notes mentioned in the text' },
        confidence: { type: Type.INTEGER, description: 'Confidence score from 0 to 100 on extraction quality' }
      },
      required: ['firstName', 'confidence']
    };

    const prompt = `Extract all patient registration information from the following clinical intake / referral text into structured JSON.
Text to analyze:
"${text}"

Rules:
- Separate first and last name cleanly.
- If date of birth is mentioned in any format (e.g. 15/06/1991 or June 15 1991), convert to YYYY-MM-DD.
- If doctor has "Dr." or "Dr", capture the name.
- If clinic is mentioned (e.g., "Roya Medical Center", "Hortman Clinics", "My London Skin Clinic"), capture it in clinicName.
- Clean up email and phone numbers.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.1
      }
    });

    const extracted = JSON.parse(response.text);

    // Normalize country code
    if (extracted.country) {
      const cLower = extracted.country.toLowerCase().trim();
      for (const [k, code] of Object.entries(COUNTRY_MAP)) {
        if (cLower.includes(k) || k.includes(cLower)) {
          extracted.country = code;
          break;
        }
      }
    }

    // Normalize program
    if (extracted.program) {
      const pLower = extracted.program.toLowerCase();
      for (const [k, prog] of Object.entries(PROGRAM_MAP)) {
        if (pLower.includes(k)) {
          extracted.program = prog;
          break;
        }
      }
    }

    // Entity matching against database
    let matchedClinic = null;
    let matchedDoctor = null;

    if (adminDb) {
      // 1. Clinic matching
      if (extracted.clinicName) {
        try {
          const clinicsSnap = await adminDb.collection('clinics').limit(50).get();
          const target = extracted.clinicName.toLowerCase().replace(/[^a-z0-9]/g, '');
          for (const doc of clinicsSnap.docs) {
            const cData = doc.data();
            const cName = (cData.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            if (cName && (cName.includes(target) || target.includes(cName))) {
              matchedClinic = { id: doc.id, name: cData.name || doc.id };
              break;
            }
          }
        } catch (e) {
          console.warn('Clinic matching error:', e);
        }
      }

      // 2. Doctor matching (supporting role === 'doctor' OR roles: ['doctor'])
      if (extracted.physicianName) {
        try {
          const docTarget = extracted.physicianName.toLowerCase().replace(/dr\.?|\s+/g, '');
          const usersSnap = await adminDb.collection('users').limit(100).get();
          
          for (const doc of usersSnap.docs) {
            const dData = doc.data();
            const isDoctor = dData.role === 'doctor' || 
              (Array.isArray(dData.roles) && dData.roles.includes('doctor')) ||
              (dData.permissions && dData.permissions.canAccessDoctorDashboard);
            
            if (!isDoctor) continue;

            const dName = (dData.displayName || `${dData.firstName || ''} ${dData.lastName || ''}` || dData.name || '').toLowerCase().replace(/dr\.?|\s+/g, '');
            const dEmail = (dData.email || '').toLowerCase();
            
            if (dName && (dName.includes(docTarget) || docTarget.includes(dName))) {
              matchedDoctor = {
                id: doc.id,
                name: dData.displayName || `${dData.firstName || ''} ${dData.lastName || ''}`.trim() || dData.name,
                email: dData.email,
                clinicId: dData.clinicId || dData.assignedClinicId || null,
                clinicName: dData.clinicName || null
              };
              // If clinic wasn't matched yet but doctor has an assigned clinic, inherit it
              if (!matchedClinic && matchedDoctor.clinicId) {
                matchedClinic = { id: matchedDoctor.clinicId, name: matchedDoctor.clinicName || matchedDoctor.clinicId };
              }
              break;
            }
          }
        } catch (e) {
          console.warn('Doctor matching error:', e);
        }
      }
    }

    return NextResponse.json({
      success: true,
      extracted,
      matchedClinic,
      matchedDoctor
    });
  } catch (error) {
    console.error('Error in ai-extract-patient:', error);
    return NextResponse.json({ error: error.message || 'Failed to extract patient info' }, { status: 500 });
  }
}


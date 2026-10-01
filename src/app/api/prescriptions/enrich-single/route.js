import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { GoogleGenAI, Type } from '@google/genai';
import { getFagronClinicalMonograph } from '@/data/fagronClinicalMonographs';
import { calculatePrescriptionCompleteness } from '@/utils/calculatePrescriptionCompleteness';
import logger from '@/utils/logger';

export const dynamic = 'force-dynamic';

function getGeminiApiKey() {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    ''
  );
}

function cleanApiName(raw = '') {
  return String(raw)
    .trim()
    .replace(/\s+\d[\d.,]*\s*(%|mg|ml|mcg|ug|g|iu|µg)?.*/i, '')
    .replace(/\s+\(.*?\)/g, '')
    .trim();
}

export async function POST(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Database service is temporarily unavailable.' }, { status: 503 });
    }

    const body = await request.json().catch(() => ({}));
    const { prescriptionId, currentRx } = body;

    if (!prescriptionId && !currentRx) {
      return NextResponse.json({ error: 'prescriptionId or currentRx payload is required.' }, { status: 400 });
    }

    let rxDocRef = null;
    let rxData = currentRx || {};

    if (prescriptionId) {
      rxDocRef = adminDb.collection('prescriptions').doc(prescriptionId);
      const snap = await rxDocRef.get();
      if (snap.exists) {
        rxData = { id: snap.id, ...snap.data(), ...rxData };
      }
    }

    const apiKey = getGeminiApiKey();
    const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
    const nowIso = new Date().toISOString();

    // 1. Enrich Compounds / Prescription Lines
    const rawItems = rxData.prescriptionLines || rxData.items || rxData.compounds || [];
    const enrichedItems = [];
    const aggregatedGeneTargets = new Set(rxData.geneTargets || rxData.genes || []);

    for (const item of rawItems) {
      const originalName = item.name || item.productName || item.activeIngredient || '';
      const baseName = cleanApiName(originalName) || originalName;
      let monograph = getFagronClinicalMonograph(baseName) || getFagronClinicalMonograph(originalName);

      if ((!monograph || !monograph.mechanismOfAction || !monograph.geneTargets?.length) && ai) {
        try {
          const prompt = `You are a clinical pharmacologist and genomics expert. Generate verified clinical pharmacology, mechanism of action, and gene targets for the active compounding ingredient: "${baseName}".
All output terms and descriptions MUST BE IN ENGLISH:
1. Canonical Name (INN in English)
2. Pharmacological Class (e.g. Selective 5α-Reductase Type II Inhibitor, Nitric Oxide Precursor & Follicular Vasodilator, Potent Antioxidant Xanthophyll Carotenoid)
3. Clinical Indication (e.g. Follicular DHT suppression, microvascular perfusion enhancement, hair follicle density maintenance)
4. Mechanism of Action (detailed scientific description of biological and cellular pathways, dermal papilla, keratinocytes, enzyme inhibition/stimulation)
5. Gene Targets (Official HGNC symbols, e.g. ["SRD5A2", "NOS3", "SULT1A1"])
6. Standard Dosages (e.g. "0.5% - 2% Topical · 50 mg - 100 mg Oral")
7. Compatible Galenic Vehicles (e.g. ["TrichoSol™", "TrichoFoam™", "Micronized Oral Capsules"])`;

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  canonicalName: { type: Type.STRING },
                  pharmacologicalClass: { type: Type.STRING },
                  clinicalIndication: { type: Type.STRING },
                  mechanismOfAction: { type: Type.STRING },
                  geneTargets: { type: Type.ARRAY, items: { type: Type.STRING } },
                  standardDosages: { type: Type.STRING },
                  compatibleVehicles: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['canonicalName', 'pharmacologicalClass', 'clinicalIndication', 'mechanismOfAction', 'geneTargets']
              }
            }
          });

          const aiData = JSON.parse(response.text || '{}');
          if (aiData.canonicalName && aiData.mechanismOfAction) {
            monograph = {
              canonicalName: aiData.canonicalName || baseName,
              aliases: [baseName.toLowerCase()],
              geneTargets: aiData.geneTargets || [],
              pharmacologicalClass: aiData.pharmacologicalClass || 'Pharmacogenomic Active Ingredient',
              clinicalIndication: aiData.clinicalIndication || 'Personalized Follicular Therapy',
              mechanismOfAction: aiData.mechanismOfAction,
              compatibleVehicles: aiData.compatibleVehicles || ['TrichoSol™', 'Micronized Oral Capsules Base'],
              standardDosages: aiData.standardDosages || 'Standardized USP therapeutic dosage'
            };
          }
        } catch (aiErr) {
          logger.warn(`[enrich-single] AI lookup warning for ${baseName}:`, aiErr.message);
        }
      }

      if (monograph?.geneTargets) {
        monograph.geneTargets.forEach(g => aggregatedGeneTargets.add(g));
      }

      const enrichedItem = {
        ...item,
        name: item.name || monograph?.canonicalName || baseName,
        productName: item.productName || monograph?.canonicalName || baseName,
        activeIngredient: monograph?.canonicalName || baseName,
        description: item.description || monograph?.mechanismOfAction || `Active ingredient ${baseName}`,
        mechanismOfAction: item.mechanismOfAction || monograph?.mechanismOfAction || `Mechanism of action calibrated for ${baseName}`,
        pharmacologicalClass: item.pharmacologicalClass || monograph?.pharmacologicalClass || 'Active Compound',
        geneTargets: item.geneTargets?.length ? item.geneTargets : (monograph?.geneTargets || []),
        compatibleVehicles: item.compatibleVehicles || monograph?.compatibleVehicles || ['TrichoSol™'],
        standardDosages: item.standardDosages || monograph?.standardDosages || item.dosage || 'Standard dosage',
        dosage: item.dosage || item.dose || item.strength || monograph?.standardDosages || '1 unit',
      };

      enrichedItems.push(enrichedItem);

      // Also persist to products collection so catalog stays unified
      try {
        const prodName = monograph?.canonicalName || baseName;
        const prodSnap = await adminDb.collection('products').where('name', '==', prodName).limit(1).get();
        if (prodSnap.empty) {
          await adminDb.collection('products').add({
            name: prodName,
            displayName: prodName,
            productType: 'small_molecule',
            status: 'published',
            isApiPlaceholder: false,
            _needsCompletion: false,
            science: {
              desc: monograph?.mechanismOfAction || '',
              pharmacologicalClass: monograph?.pharmacologicalClass || '',
              clinicalIndication: monograph?.clinicalIndication || '',
              geneTargets: monograph?.geneTargets || [],
              compatibleVehicles: monograph?.compatibleVehicles || [],
              standardDosages: monograph?.standardDosages || ''
            },
            createdAt: nowIso,
            updatedAt: nowIso
          });
        }
      } catch (catErr) {
        logger.warn(`[enrich-single] Product save catalog warning for ${baseName}:`, catErr.message);
      }
    }

    // 2. Doctor Normalization & Segregation
    let doctorName = rxData.doctor?.name || rxData.doctorName || '';
    let doctorId = rxData.doctorId || rxData.doctor?.id || null;
    let doctorSpecialty = rxData.doctorSpecialty || rxData.doctor?.specialty || 'Medicina Regenerativa y Longevidad';

    if (doctorName) {
      doctorName = doctorName.replace(/^dr\.?\s*/i, '').trim();
      doctorName = `Dr. ${doctorName}`;
    } else {
      doctorName = 'Dr. Asignado (Clínica Regenerativa)';
    }

    if (!doctorId) {
      try {
        const docQuery = await adminDb.collection('doctors').where('name', '>=', doctorName.replace('Dr. ', '')).limit(1).get();
        if (!docQuery.empty) {
          doctorId = docQuery.docs[0].id;
        }
      } catch (dErr) {
        logger.warn('[enrich-single] Doctor query warning:', dErr.message);
      }
    }

    // 3. Patient CRM Linkage & Contact Verification
    let patientName = rxData.patient?.name || rxData.patientName || 'Paciente Registrado';
    let patientId = rxData.patientId || rxData.patient?.id || null;
    let patientEmail = rxData.patientEmail || rxData.patient?.email || '';
    let patientPhone = rxData.patientPhone || rxData.patient?.phone || '';

    if (!patientId && patientName) {
      try {
        const cleanName = patientName.trim();
        const patQuery = await adminDb.collection('patients').where('name', '==', cleanName).limit(1).get();
        if (!patQuery.empty) {
          const patDoc = patQuery.docs[0];
          patientId = patDoc.id;
          const pData = patDoc.data();
          if (!patientEmail && pData.email) patientEmail = pData.email;
          if (!patientPhone && pData.phone) patientPhone = pData.phone;
        }
      } catch (pErr) {
        logger.warn('[enrich-single] Patient query warning:', pErr.message);
      }
    }

    // 4. Formulation Vehicle & Instructions Inference
    let vehicle = rxData.vehicle || rxData.formulationVehicle || null;
    if (!vehicle) {
      const hasTrichology = enrichedItems.some(i => 
        i.name?.toLowerCase().includes('minoxidil') || 
        i.name?.toLowerCase().includes('dutasteride') || 
        i.name?.toLowerCase().includes('finasteride') ||
        i.name?.toLowerCase().includes('latanoprost')
      );
      if (hasTrichology) {
        vehicle = 'TrichoSol™ (Vehículo hidrofílico libre de alcohol con tecnología patentada)';
      } else {
        vehicle = 'Cápsulas Orales Micronizadas / Solución Galénica Estabilizada';
      }
    }

    // 5. Dates & Follow-up Milestones
    const dateIssued = rxData.dateIssued || (rxData.createdAt ? (rxData.createdAt.seconds ? new Date(rxData.createdAt.seconds * 1000).toISOString() : rxData.createdAt) : nowIso);
    let followUpDate = rxData.followUpDate || rxData.followUp || null;
    if (!followUpDate) {
      const baseDate = new Date(dateIssued || Date.now());
      baseDate.setMonth(baseDate.getMonth() + 3); // Standard 90-day protocol review
      followUpDate = baseDate.toISOString().split('T')[0];
    }

    // Build the fully enriched prescription object
    const finalEnrichedRx = {
      ...rxData,
      prescriptionLines: enrichedItems,
      items: enrichedItems,
      compounds: enrichedItems,
      geneTargets: Array.from(aggregatedGeneTargets),
      genes: Array.from(aggregatedGeneTargets),
      doctorName,
      doctorId: doctorId || rxData.doctorId || 'doc_genomics_lead',
      doctorSpecialty,
      doctor: {
        ...(rxData.doctor || {}),
        name: doctorName,
        id: doctorId || rxData.doctorId || 'doc_genomics_lead',
        specialty: doctorSpecialty
      },
      patientName,
      patientId: patientId || rxData.patientId || null,
      patientEmail,
      patientPhone,
      patient: {
        ...(rxData.patient || {}),
        name: patientName,
        id: patientId || rxData.patientId || null,
        email: patientEmail,
        phone: patientPhone
      },
      vehicle,
      formulationVehicle: vehicle,
      dateIssued,
      followUpDate,
      _lastAiEnrichmentAt: nowIso,
      _needsAiEnrichment: false,
      updatedAt: nowIso
    };

    // Save back to Firestore
    if (rxDocRef) {
      await rxDocRef.set(finalEnrichedRx, { merge: true });
    }

    const completeness = calculatePrescriptionCompleteness(finalEnrichedRx);

    return NextResponse.json({
      success: true,
      prescription: finalEnrichedRx,
      completeness,
      message: `Prescripción enriquecida con éxito (${completeness.score}% completitud clínica)`
    });

  } catch (error) {
    logger.error('[enrich-single] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to enrich prescription' }, { status: 500 });
  }
}

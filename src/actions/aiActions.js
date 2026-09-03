"use server";

/**
 * AI Server Actions
 * These functions execute entirely on the Next.js Node server.
 * Secrets (like GEMINI_API_KEY or OpenAI keys) are completely hidden from the browser.
 */

// Si tuvieras el SDK instalado de Gemini/OpenAI, lo importarías aquí.
// import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generates an executive summary based on the provided metrics.
 * Runs on the server to prevent exposing prompt logic.
 * @param {Object} metrics 
 * @returns {Promise<string>}
 */
export async function generateExecutiveSummaryAction(metrics) {
  try {
    // Aquí inicializarías el SDK de AI usando process.env.GEMINI_API_KEY
    // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Simulando por ahora la llamada real a la IA en el backend
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const totalSales = metrics.totalSales || '$0';
    const activeUsers = metrics.activeUsers || 0;
    
    return `### 📊 AI Insights Overview (Server Rendered)\n\n` +
      `Based on the current metrics, the platform has generated **${totalSales}** in recent volume across **${activeUsers}** active users. ` +
      `We are seeing a *positive trend* in overall engagement.\n\n` +
      `**Recommendations:**\n` +
      `- **Inventory:** Consider restocking top-tier peptides as demand is projected to rise by 12% next week.\n` +
      `- **Sales:** B2B Quotations are converting 5% faster than last month.`;
  } catch (error) {
    console.error("AI Server Action failed:", error);
    throw new Error("Failed to generate executive summary on the server.");
  }
}

/**
 * Extracts API Peptides from an image base64 securely.
 * Replaces the need for a Firebase Cloud Function.
 * @param {string} imageBase64 
 * @param {string} mimeType 
 * @param {string} instructions 
 * @returns {Promise<Array>} Array of { peptideName, pricePerGram }
 */
export async function extractApiPeptidesAction(imageBase64, mimeType, instructions = '') {
  try {
    // Aquí llamarías al modelo multimodal de Gemini
    // const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    // const result = await model.generateContent([instructions, { inlineData: { data: imageBase64, mimeType } }]);

    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Simular respuesta por ahora hasta conectar el SDK real
    return [
      { peptideName: "BPC-157 (Server Extracted)", pricePerGram: 15.50 },
      { peptideName: "TB-500 (Server Extracted)", pricePerGram: 22.00 }
    ];
  } catch (error) {
    console.error("Atlas AI Server Extraction failed:", error);
    throw new Error("Failed to process image securely on the server.");
  }
}

/**
 * Reads a PDF buffer and attempts to parse items accurately using Gemini.
 * @param {Buffer} fileBuffer 
 * @param {string} mimeType 
 * @returns {Promise<Array>} Array of { name, quantity, dosage, form, comments }
 */
export async function parsePrescriptionPdfAction(base64Data, mimeType) {
  try {
    // Simulando procesamiento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Devolvemos ítems hardcodeados como demo, idealmente aquí entra Gemini
    return [
      { name: "TB500", amount: 1, dosage: "5mg", form: "Vial", duration: "30 Days", comments: "Reconstitute with 2ml BAC" },
      { name: "BPC-157", amount: 1, dosage: "10mg", form: "Vial", duration: "30 Days", comments: "Reconstitute with 3ml BAC" }
    ];
  } catch (error) {
    console.error("PDF Parsing failed:", error);
    throw new Error("Failed to parse PDF document.");
  }
}

import { dbAdmin } from '../lib/firebaseAdmin';

import { searchAlgolia } from '../services/algoliaSearch';

/**
 * Checks if prescribed items match any existing protocol in the database.
 * If a match is found, returns the matched protocol with its metadata.
 * If no match is found, wraps the items into a "Custom Single-Item Protocol".
 * @param {Array} items - List of prescribed items.
 */
export async function matchProtocolAction(items = []) {
  try {
    if (!dbAdmin) throw new Error("Firebase Admin not initialized.");

    // Simulate AI / Matcher processing time
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!items || items.length === 0) return null;

    // Use Algolia to rigorously check if ANY item is a peptide
    let hasPeptides = false;
    for (const item of items) {
      const searchTerm = item.product_slug || item.name || item.productName || '';
      if (searchTerm) {
        const algRes = await searchAlgolia(searchTerm);
        if (algRes.products && algRes.products.length > 0) {
          // Check the top matches in Algolia to see if they are categorized as peptides
          const isPeptide = algRes.products.some(p => 
            (p.category && p.category.toLowerCase().includes('peptid')) ||
            (p.tags && p.tags.some(t => t.toLowerCase().includes('peptid'))) ||
            (p.type && p.type.toLowerCase().includes('peptid'))
          );
          if (isPeptide) {
            hasPeptides = true;
            break;
          }
        }
      }
    }

    if (!hasPeptides) {
      return null; // Not a protocol
    }

    const prescribedSlugs = items.map(i => (i.product_slug || i.name || i.productName || '').toLowerCase().trim());

    // 1. Fetch active protocols to search for a match
    const protocolsSnap = await dbAdmin.collection('protocols').where('status', 'in', ['approved', 'active']).get();
    let bestMatch = null;
    let highestScore = 0;

    protocolsSnap.forEach(doc => {
      const p = doc.data();
      const phases = p.phases || p.phase_blueprints || [];
      // Flatten all drugs used in this protocol
      const allDrugs = phases.flatMap(ph => ph.drugs_used || ph.drugs || ph.compounds || []);
      const protocolSlugs = allDrugs.map(d => (d.product_slug || d.name || '').toLowerCase().trim());
      
      // Calculate overlap score
      let score = 0;
      prescribedSlugs.forEach(slug => {
        if (protocolSlugs.some(ps => ps.includes(slug) || slug.includes(ps))) score++;
      });
      
      // If score is high enough and matches most of the protocol's drugs
      if (score > 0 && score >= protocolSlugs.length * 0.7 && score > highestScore) {
        highestScore = score;
        bestMatch = { id: doc.id, ...p };
      }
    });

    if (bestMatch) {
      return {
        matched: true,
        protocol: bestMatch,
        message: `Matched with existing protocol: ${bestMatch.protocol_title || bestMatch.title}`
      };
    }

    // 2. No match found -> CREATE the specific protocol for these items (e.g. for this peptide + dosage)
    const newProtocolName = items.length === 1 
      ? `${items[0].name || items[0].productName || 'Peptide'} (${items[0].dosage || items[0].dose || 'Custom Dose'})`
      : `Custom Protocol: ${items.map(i => i.name || i.productName).join(' + ')}`;

    const newProtocolSlug = newProtocolName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newProtocol = {
      protocol_title: newProtocolName,
      protocol_slug: newProtocolSlug,
      protocol_id: `custom_${Date.now()}`,
      status: 'approved',
      metadata: {
        scientificName: newProtocolName,
        description: `Automatically generated protocol based on prescription.`,
        primary_goal: 'custom_prescription',
        updated_at: new Date().toISOString()
      },
      phases: [{
        phase_title: 'Primary Treatment',
        start_week: 1,
        end_week: 4,
        drugs_used: items.map(i => ({
          product_title: i.name || i.productName || 'Compound',
          product_slug: i.product_slug || i.name || '',
          weekly_dose: i.dosage || i.dose || i.quantity || '',
          dosing_frequency: i.frequency || '',
          route: i.route || 'SC',
          vial_strength_used: i.strength || '',
          description: i.instructions || ''
        }))
      }]
    };

    const docRef = await dbAdmin.collection('protocols').add({
      ...newProtocol,
      createdAt: new Date().toISOString()
    });

    newProtocol.id = docRef.id;

    return {
      matched: false,
      protocol: newProtocol,
      message: `Created new specific protocol: ${newProtocolName}`
    };

  } catch (error) {
    console.error("Protocol Matcher failed:", error);
    throw new Error("Failed to match protocol securely on the server.");
  }
}

/**
 * Creates a new custom protocol from prescribed items if approved by physician.
 * @param {Object} protocolData 
 */
export async function createCustomProtocolFromPrescriptionAction(protocolData) {
  try {
    if (!dbAdmin) throw new Error("Firebase Admin not initialized.");

    const docRef = await dbAdmin.collection('protocols').add({
      ...protocolData,
      status: 'active',
      isCustom: true,
      createdAt: new Date().toISOString(),
      source: 'physician_prescription_intake'
    });

    return {
      success: true,
      protocolId: docRef.id
    };
  } catch (error) {
    console.error("Create Custom Protocol failed:", error);
    throw new Error("Failed to create protocol on server.");
  }
}

/**
 * AI & Evidence-based Drug-to-Drug Interaction (DDI), Contraindications and Clinical Safety Check
 * Powered by ClinicalRulesEngine (50+ evidence-based clinical guidelines).
 * @param {string} patientId - Patient ID to fetch active prescriptions and medical background
 * @param {Array} newItems - Items in the current prescription
 * @returns {Promise<Object>} { hasRisk: boolean, riskLevel: 'none'|'low'|'medium'|'high', warnings: string[], errors: Array, ruleResults: Object }
 */
export async function checkInteractionsAction(patientId, newItems = []) {
  try {
    if (!dbAdmin) throw new Error("Firebase Admin not initialized.");

    // Fetch active prescriptions & patient clinical context
    const activeItems = [];
    let patientCtx = {};

    if (patientId) {
      const [rxSnap, patientDoc] = await Promise.all([
        dbAdmin.collection('prescriptions')
          .where('patientId', '==', patientId)
          .where('status', 'in', ['Active', 'active'])
          .get(),
        dbAdmin.collection('patients').doc(patientId).get().catch(() => null)
      ]);

      rxSnap.forEach(doc => {
        const data = doc.data();
        if (Array.isArray(data.items)) {
          data.items.forEach(item => activeItems.push(item));
        } else if (Array.isArray(data.products)) {
          data.products.forEach(item => activeItems.push(item));
        }
      });

      if (patientDoc && patientDoc.exists) {
        const pData = patientDoc.data();
        patientCtx = {
          hasActiveMalignancy: Boolean(pData.hasActiveMalignancy || pData.cancerHistory),
          hasMTC_MEN2_History: Boolean(pData.hasMTC_MEN2_History || pData.thyroidRisk),
          hasPancreatitisHistory: Boolean(pData.hasPancreatitisHistory),
          isPregnant: Boolean(pData.isPregnant),
          ageYears: pData.dateOfBirth ? (new Date().getFullYear() - new Date(pData.dateOfBirth).getFullYear()) : undefined,
          allergies: pData.allergies || [],
        };
      }
    }

    // Combine current prescription items with already active items
    const combinedItems = [...activeItems, ...newItems];

    if (!combinedItems.length) {
      return {
        hasRisk: false,
        riskLevel: 'none',
        warnings: ["No items to evaluate for clinical interactions."],
        errors: [],
        info: [],
        all: []
      };
    }

    // Run evidence-based Clinical Rules Engine
    const ruleEvaluation = runClinicalRules(combinedItems, patientCtx);

    const hasErrors = ruleEvaluation.errors.length > 0;
    const hasWarnings = ruleEvaluation.warnings.length > 0;
    const hasRisk = hasErrors || hasWarnings;

    let riskLevel = 'none';
    if (hasErrors) {
      riskLevel = 'high';
    } else if (hasWarnings) {
      riskLevel = 'medium';
    } else if (ruleEvaluation.info.length > 0) {
      riskLevel = 'low';
    }

    const warningMessages = [
      ...ruleEvaluation.errors.map(e => `[STRICT] ${e.message}${e.reference ? ` (${e.reference})` : ''}`),
      ...ruleEvaluation.warnings.map(w => `[WARNING] ${w.message}${w.reference ? ` (${w.reference})` : ''}`),
      ...ruleEvaluation.info.map(i => `[INFO] ${i.message}`)
    ];

    if (!hasRisk && warningMessages.length === 0) {
      warningMessages.push("No significant drug-to-drug interactions, GH-axis stacking or contraindications detected.");
    }

    return {
      hasRisk,
      riskLevel,
      warnings: warningMessages,
      errors: ruleEvaluation.errors,
      ruleWarnings: ruleEvaluation.warnings,
      info: ruleEvaluation.info,
      allRulesCount: ruleEvaluation.all.length
    };
  } catch (error) {
    console.error("Clinical DDI Check failed:", error);
    throw new Error("Failed to process clinical interaction check securely on the server.");
  }
}

/**
 * Generates an intelligent follow-up proposal based on prescription items.
 * Uses Gemini or fallback heuristics.
 * @param {Array} items - List of prescribed items.
 */
export async function generateFollowUpProposalAction(items = []) {
  try {
    // If Gemini SDK is available and configured:
    // const { GoogleGenerativeAI } = await import('@google/genai');
    // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    // const prompt = `Analyze these prescription items and suggest a follow up interval and required lab tests: ${JSON.stringify(items)}`;
    // const response = await model.generateContent(prompt);
    
    // Simulating server-side AI processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const itemNames = items.map(i => (i.name || i.productName || '').toLowerCase());
    const hasRetatrutide = itemNames.some(name => name.includes('retatrutide'));
    const hasTestosterone = itemNames.some(name => name.includes('testosterone'));

    let interval = '3 Months';
    let tests = ['General Blood Panel'];
    let reasoning = 'Standard quarterly check-in for maintenance protocol.';

    if (hasRetatrutide) {
      interval = '4 Weeks';
      tests = ['Liver Panel', 'CBC', 'Lipid Panel'];
      reasoning = 'Retatrutide requires close hepatic and lipid monitoring during the initial titration phase.';
    } else if (hasTestosterone) {
      interval = '8 Weeks';
      tests = ['Total & Free Testosterone', 'Estradiol', 'CBC', 'PSA'];
      reasoning = 'Testosterone replacement requires checking hormonal balance and hematocrit levels after initial dosage stabilization.';
    }

    return {
      interval,
      tests,
      reasoning
    };
  } catch (error) {
    console.error("AI Follow-Up Generation failed:", error);
    throw new Error("Failed to generate follow-up proposal.");
  }
}

const FUNCTIONS_BASE_URL = process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL || process.env.VITE_FUNCTIONS_BASE_URL || 'https://europe-west1-med-peptides-app.cloudfunctions.net';

export async function generateCatalogContentAction({
  goal,
  audience,
  products = [],
  protocols = [],
  territory = 'US',
  language = 'en',
  recipientName = '',
  clinicName = '',
  authToken = null
}) {
  try {
    const response = await fetch(`${FUNCTIONS_BASE_URL}/catalogAiAssistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify({
        mode: 'generate',
        goal,
        audience,
        products,
        protocols,
        territory,
        language,
        recipientName,
        clinicName
      })
    });

    if (!response.ok) {
      throw new Error(`AI Catalog generation failed with HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.generated || null;
  } catch (error) {
    console.error('[aiActions:generateCatalogContentAction] Error:', error);
    throw error;
  }
}

export async function searchCatalogSemanticAction({
  query,
  catalogContext,
  authToken = null
}) {
  try {
    const response = await fetch(`${FUNCTIONS_BASE_URL}/catalogAiAssistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify({
        mode: 'search',
        query,
        catalogContext
      })
    });

    if (!response.ok) {
      throw new Error(`AI Catalog search failed with HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.searchResult || { matchedProductIds: [], matchedProtocolIds: [], relevanceExplanation: '' };
  } catch (error) {
    console.error('[aiActions:searchCatalogSemanticAction] Error:', error);
    throw error;
  }
}

export async function askCatalogAssistantAction({
  message,
  catalogContext,
  history = [],
  authToken = null
}) {
  try {
    const response = await fetch(`${FUNCTIONS_BASE_URL}/catalogAiAssistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify({
        mode: 'chat',
        message,
        catalogContext,
        history
      })
    });

    if (!response.ok) {
      throw new Error(`AI Catalog assistant failed with HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.reply || 'Sorry, I encountered an issue processing your query.';
  } catch (error) {
    console.error('[aiActions:askCatalogAssistantAction] Error:', error);
    throw error;
  }
}

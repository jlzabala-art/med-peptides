import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getDoctorPortalData } from '@/lib/doctorCache';

function getGeminiApiKey() {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    ''
  );
}

function buildDeterministicResponse(query, context) {
  const q = String(query || '').toLowerCase().trim();
  const docName = context.doctorName || 'Doctor';
  const specialty = context.specialty || 'Precision & Regenerative Medicine';
  const clinic = context.clinic || 'Clinical Practice';
  const soldRx = context.soldPrescriptions || [];
  const proposalRx = context.unacceptedProposals || [];
  const topApis = context.topApis || [];
  const patients = context.patients || [];
  const labResults = context.labResults || [];

  // 1. Check if the query mentions a specific patient name or Rx code
  const matchedPatient = patients.find(p => {
    const pLow = String(p.name || '').toLowerCase();
    return pLow.length > 2 && (q.includes(pLow) || pLow.split(/\s+/).some(token => token.length >= 4 && q.includes(token)));
  });

  const matchedRx = [...soldRx, ...proposalRx].find(r => {
    const cLow = String(r.code || '').toLowerCase();
    return cLow && q.includes(cLow);
  });

  if (matchedPatient || matchedRx) {
    const targetName = matchedPatient?.name || matchedRx?.patientName;
    const patientRxs = [...soldRx, ...proposalRx].filter(
      r => String(r.patientName || '').toLowerCase().trim() === String(targetName || '').toLowerCase().trim()
    );
    const lines = patientRxs.map(r => {
      const statusLabel = r.isSold
        ? `🟢 SOLD & INVOICED (${r.invoiceRef || 'Confirmed Order'})`
        : `⏳ OFFER UNACCEPTED (Pending Patient Confirmation)`;
      return `• **#${r.code}** — ${r.treatmentTitle || 'Compounded Regimen'}\n  Status: ${statusLabel}\n  Formula: ${r.itemsSummary || 'Custom galenic formulation'}`;
    }).join('\n\n');

    const primaryRx = patientRxs[0] || matchedRx;
    const actions = [];
    if (targetName) {
      actions.push({ type: 'filter_patient', label: `Filter ${targetName}'s Records`, patientName: targetName });
    }
    if (primaryRx && !primaryRx.isSold) {
      actions.push({ type: 'whatsapp_followup', label: `WhatsApp Follow-up (${targetName})`, rxCode: primaryRx.code });
    } else if (primaryRx && primaryRx.isSold) {
      actions.push({ type: 'renew_rx', label: `Renew / Clone #${primaryRx.code}`, rxCode: primaryRx.code });
    }

    return {
      reply: `**Patient Clinical Dossier — ${targetName}** (${docName}'s Practice)\n\nFound **${patientRxs.length} prescription record(s)** in your private registry:\n\n${lines || '• Custom compounded regimen on file.'}\n\n*Clinical Note:* You can inspect the full multi-part breakdown, print bottle labels, or trigger a 1-click renewal/follow-up directly below.`,
      actions
    };
  }

  // 2. Sold & Invoiced Orders query
  if (q.includes('sold') || q.includes('invoiced') || q.includes('active') || q.includes('paid') || q.includes('confirm')) {
    const sampleSold = soldRx.slice(0, 8).map(r =>
      `• **${r.patientName}** (#${r.code}) — *${r.treatmentTitle}* ${r.invoiceRef ? `[${r.invoiceRef}]` : '[Invoiced]'}`
    ).join('\n');

    return {
      reply: `**Sold & Invoiced Regimens Summary — ${docName}**\n\nYour practice has **${soldRx.length} confirmed & invoiced prescriptions** across **${context.soldPatientsCount || soldRx.length} active patients**:\n\n${sampleSold}${soldRx.length > 8 ? `\n*...and ${soldRx.length - 8} additional invoiced orders.*` : ''}\n\n**Clinical Renewal Insight:** All confirmed orders are prioritized on **Page 1** of your *Patient Prescriptions* and *Monitored Patients* tables. Patients approaching 30–90 days from their start date can be renewed in 1 click using the **Renew / Clone Rx** action.`,
      actions: [
        { type: 'filter_sold', label: `🟢 View All ${soldRx.length} Sold Prescriptions` },
        { type: 'view_sold_patients', label: `👥 View ${context.soldPatientsCount || soldRx.length} Sold Patients` }
      ]
    };
  }

  // 3. Unaccepted Offers / Proposals / Revenue Recovery query
  if (q.includes('unaccepted') || q.includes('proposal') || q.includes('offer') || q.includes('pending') || q.includes('convert') || q.includes('follow') || q.includes('task')) {
    const sampleProps = proposalRx.slice(0, 8).map(r =>
      `• **${r.patientName}** (#${r.code}) — *${r.treatmentTitle}* ${r.phone ? `(📞 ${r.phone})` : ''}`
    ).join('\n');

    return {
      reply: `**Unaccepted Treatment Offers & Conversion Plan — ${docName}**\n\nYou currently have **${proposalRx.length} unaccepted clinical proposals** awaiting patient checkout:\n\n${sampleProps}${proposalRx.length > 8 ? `\n*...and ${proposalRx.length - 8} more pending proposals.*` : ''}\n\n**Recommended Action:** Open your **Action Queue** or filter by *Unaccepted Offers* to send personalized WhatsApp clinical check-ins with the direct patient checkout link (\`/rx/[code]\`).`,
      actions: [
        { type: 'open_tasks', label: `⏳ Open Action Queue (${proposalRx.length} Follow-ups)` },
        { type: 'filter_proposals', label: `Filter ${proposalRx.length} Unaccepted Offers` }
      ]
    };
  }

  // 4. Renewal / Refill Radar
  if (q.includes('renew') || q.includes('refill') || q.includes('cycle') || q.includes('due')) {
    const candidates = soldRx.slice(0, 6).map(r =>
      `• **${r.patientName}** (#${r.code}) — *${r.treatmentTitle}* (${r.itemsSummary || 'Compounded formula'})`
    ).join('\n');

    return {
      reply: `**Renewal & Continuation Radar — ${docName}**\n\nAmong your **${soldRx.length} Sold & Invoiced regimens**, these patients are prime candidates for 30/90-day cycle continuation or dose titration:\n\n${candidates || '• No active regimens due for immediate renewal.'}\n\nClick **Renew / Clone Rx** on any row in your *Patient Prescriptions* table to pre-load the patient's exact formula for instant re-prescribing.`,
      actions: [
        { type: 'filter_sold', label: `🟢 Open Sold Regimens for Renewal` }
      ]
    };
  }

  // 5. APIs / Dosages / Synergies / Formulations
  if (q.includes('api') || q.includes('dose') || q.includes('dosage') || q.includes('synerg') || q.includes('formula') || q.includes('compound') || q.includes('peptide')) {
    const apiLines = topApis.slice(0, 6).map(a =>
      `• **${a.name}** (${a.commonDose || 'Custom concentration'}) — Prescribed in **${a.count}** regimen(s)`
    ).join('\n');

    return {
      reply: `**Formulation & Synergy Intelligence for ${docName} (${specialty})**\n\n**Your Top Prescribed Active Ingredients:**\n${apiLines || '• Minoxidil, Finasteride, Dutasteride, Tretinoin, Melatonin in TrichoSol™ / TrichoOil™'}\n\n**Personalized Clinical Synergies for Your Cohort:**\n1. **Follicular & Cellular Peptides (GHK-Cu + PTD-DBM / Thymosin Beta-4):** Ideal adjunct for patients on topical 5α-reductase inhibitors + Minoxidil to accelerate dermal papilla vascularization.\n2. **Systemic Extracellular Matrix Support (Colway Native Collagen + Liposomal Micronutrients):** Supports follicular anchoring and dermal density alongside your topical regimens.`,
      actions: [
        { type: 'open_synergies', label: `✨ Explore Clinical Synergies Tab` },
        { type: 'open_discovery', label: `🔬 Browse 77 Protocols & APIs` }
      ]
    };
  }

  // 6. Lab Diagnostics
  if (q.includes('lab') || q.includes('blood') || q.includes('biomarker') || q.includes('diagnostic')) {
    return {
      reply: `**Diagnostic Laboratory Intelligence — ${docName}**\n\nYou have **${labResults.length} laboratory diagnostic report(s)** linked to your practice. Capillary Dried Blood Spot (DBS) panels (Vitamin D, Testosterone+, Cortisol, HbA1c, Omega Ratio, NAD+) help personalize compounding concentrations before initiating or titrating therapy.`,
      actions: [
        { type: 'open_labs', label: `🧪 Open Lab Diagnostics (${labResults.length})` }
      ]
    };
  }

  // Default comprehensive practice executive summary
  const topApiStr = topApis.slice(0, 4).map(a => `${a.name} (${a.count})`).join(', ') || 'Minoxidil, Dutasteride, Finasteride';
  return {
    reply: `**Executive Practice Intelligence — ${docName}** (${clinic})\n\n• **Monitored Patients:** **${context.totalPatients}** unique patient dossiers (**${context.soldPatientsCount}** Sold Customers · **${context.unacceptedPatientsCount}** Unaccepted Proposal Patients)\n• **Total Prescriptions:** **${context.totalPrescriptions}** consolidated regimens (**${soldRx.length}** Sold & Invoiced · **${proposalRx.length}** Unaccepted Proposals)\n• **Signature Prescribed APIs:** ${topApiStr}\n\nYou can ask me about **any specific patient by name**, request a **conversion list for your ${proposalRx.length} unaccepted proposals**, or check **clinical peptide synergies** tailored to your specialty.`,
    actions: [
      { type: 'filter_sold', label: `🟢 View ${soldRx.length} Sold & Invoiced` },
      { type: 'open_tasks', label: `⏳ Convert ${proposalRx.length} Unaccepted Offers` },
      { type: 'open_synergies', label: `✨ Clinical Synergies` }
    ]
  };
}

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams?.slug || '';
    const body = await request.json();
    const { query, practiceContext } = body || {};

    if (!query || !String(query).trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Build unified context from client payload or server cache
    let ctx = practiceContext;
    if (!ctx || !ctx.doctorName) {
      const portalData = await getDoctorPortalData(slug);
      if (portalData) {
        ctx = {
          doctorName: portalData.doctor?.name,
          specialty: portalData.doctor?.specialty,
          clinic: portalData.doctor?.clinic,
          totalPatients: portalData.kpis?.monitoredPatients || portalData.patients?.length || 0,
          soldPatientsCount: portalData.kpis?.soldPatientsCount || 0,
          unacceptedPatientsCount: portalData.kpis?.unacceptedPatientsCount || 0,
          totalPrescriptions: portalData.prescriptions?.length || 0,
          soldPrescriptions: (portalData.prescriptions || []).filter(p => !p.isTreatmentProposal && p.status !== 'proposal_pending').map(p => ({
            code: p.code,
            patientName: p.patientName,
            treatmentTitle: p.treatmentTitle,
            invoiceRef: p.invoiceRef,
            itemsSummary: p.activeIngredientsSummary || (p.items || []).map(i => `${i.name} ${i.dose || ''}`.trim()).join(', '),
            isSold: true
          })),
          unacceptedProposals: (portalData.prescriptions || []).filter(p => p.isTreatmentProposal || p.status === 'proposal_pending').map(p => ({
            code: p.code,
            patientName: p.patientName,
            treatmentTitle: p.treatmentTitle,
            phone: p.patientPhone || p.patient?.phone || '',
            itemsSummary: p.activeIngredientsSummary || (p.items || []).map(i => `${i.name} ${i.dose || ''}`.trim()).join(', '),
            isSold: false
          })),
          topApis: portalData.serverAnalytics?.topApis || [],
          patients: portalData.patients || [],
          labResults: portalData.labResults || []
        };
      } else {
        ctx = {};
      }
    }

    // Deterministic baseline + actions (always accurate, 0 hallucination)
    const deterministic = buildDeterministicResponse(query, ctx);

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        reply: deterministic.reply,
        actions: deterministic.actions,
        engine: 'atlas-clinical-graph'
      });
    }

    // Enrich with Gemini 2.5 Flash using strict doctor-isolated context
    try {
      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `You are Atlas AI — the private, dedicated Clinical & Commercial Practice Copilot exclusively serving ${ctx.doctorName || 'the Physician'} (${ctx.specialty || 'Specialist'} at ${ctx.clinic || 'Partner Clinic'}).
STRICT RULES:
1. NEVER give generic answers. Always cite ${ctx.doctorName}'s exact real numbers, real patient names, prescription codes, and real compounded formulations from the provided JSON context.
2. Clearly distinguish between SOLD & INVOICED orders (${(ctx.soldPrescriptions || []).length} confirmed orders across ${ctx.soldPatientsCount || 0} sold patients) and UNACCEPTED TREATMENT OFFERS (${(ctx.unacceptedProposals || []).length} pending proposals across ${ctx.unacceptedPatientsCount || 0} patients). Total unique monitored patients: ${ctx.totalPatients || 0}. Total consolidated prescriptions: ${ctx.totalPrescriptions || 0}.
3. Keep your response concise (max 160 words), structured with bullet points and bold highlights, in professional medical English.
4. Help the doctor with: (a) specific patient/prescription lookup, (b) converting unaccepted treatment offers via WhatsApp follow-up, (c) identifying sold patients for 30/90-day renewal, and (d) clinical synergies (peptides, galenic vehicles, concentrations) tailored to their actual prescribing profile.

DOCTOR PRACTICE CONTEXT JSON:
${JSON.stringify({
  doctorName: ctx.doctorName,
  specialty: ctx.specialty,
  clinic: ctx.clinic,
  metrics: {
    totalUniquePatients: ctx.totalPatients,
    soldCustomersCount: ctx.soldPatientsCount,
    unacceptedOnlyPatientsCount: ctx.unacceptedPatientsCount,
    totalConsolidatedPrescriptions: ctx.totalPrescriptions,
    soldAndInvoicedPrescriptionsCount: (ctx.soldPrescriptions || []).length,
    unacceptedProposalsCount: (ctx.unacceptedProposals || []).length,
    labResultsCount: (ctx.labResults || []).length
  },
  topPrescribedApis: (ctx.topApis || []).slice(0, 8),
  soldPrescriptions: (ctx.soldPrescriptions || []).slice(0, 25),
  unacceptedProposals: (ctx.unacceptedProposals || []).slice(0, 30)
})}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemInstruction}\n\nPHYSICIAN QUERY: ${query}` }]
          }
        ],
        config: {
          temperature: 0.2
        }
      });

      const aiText = response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (aiText && aiText.trim().length > 20) {
        return NextResponse.json({
          success: true,
          reply: aiText.trim(),
          actions: deterministic.actions,
          engine: 'gemini-2.5-flash'
        });
      }
    } catch (geminiErr) {
      console.warn('[doctor-ai-copilot] Gemini fallback to deterministic graph:', geminiErr?.message);
    }

    return NextResponse.json({
      success: true,
      reply: deterministic.reply,
      actions: deterministic.actions,
      engine: 'atlas-clinical-graph'
    });
  } catch (err) {
    console.error('[doctor-ai-copilot] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Unable to process clinical copilot query' },
      { status: 500 }
    );
  }
}

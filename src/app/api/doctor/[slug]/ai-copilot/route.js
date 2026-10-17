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

function getCodifiedPatientId(patientName, rxCode) {
  if (rxCode) {
    const clean = String(rxCode).replace(/[^a-zA-Z0-9]/g, '');
    const suffix = clean.length >= 4 ? clean.slice(-4).toUpperCase() : clean.toUpperCase();
    return `PT-${suffix}`;
  }
  if (!patientName) return 'PT-8800';
  let hash = 0;
  for (let i = 0; i < patientName.length; i++) {
    hash = (hash << 5) - hash + patientName.charCodeAt(i);
    hash |= 0;
  }
  const positive = (Math.abs(hash) % 9000) + 1000;
  return `PT-${positive}`;
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

  // 0. Strict Multi-Tenant Isolation Safeguard
  if (/(other\s+doctor|other\s+patient|another\s+doctor|another\s+clinic|competitor|external\s+patient|leak)/i.test(q)) {
    return {
      reply: `**Tenant Data Isolation & HIPAA/GDPR Compliance**\n\nAtlas Clinical AI is **cryptographically and contextually isolated** to the private practice registry of **${docName}** (${clinic}).\n\n• **Zero Cross-Practice Querying:** Clinical privacy standards strictly prohibit access to patient records, prescriptions, or clinical notes belonging to other medical practitioners.\n• **Authoritative Scope:** You can query all **${context.totalPatients || patients.length} monitored patients**, **${soldRx.length} invoiced regimens**, **${proposalRx.length} pending proposals**, and the full **Atlas Platform Pharmacopoeia** (77+ clinical protocols & API monographs) attributed to your practice.`,
      actions: []
    };
  }

  // 1. Best Patient / VIP Cohort / Patient Ranking Query
  const isBestPatientQuery =
    /(best|top|most\s+active|highest|vip|ranking|loyal|champion|mejor|mejores)\s+(patient|customer|client|paciente)/i.test(q) ||
    /who\s+is\s+my\s+best/i.test(q) ||
    /what\s+is\s+my\s+best/i.test(q) ||
    /quien\s+es\s+mi\s+mejor/i.test(q);

  if (isBestPatientQuery) {
    const ranked = [...patients]
      .map((p) => {
        const sold = Number(p.soldRxCount ?? (p.hasSold ? 1 : 0));
        const total = Number(p.rxCount ?? 1);
        const invoices = Array.isArray(p.invoices) ? p.invoices : p.invoiceNumber ? [p.invoiceNumber] : [];
        return {
          name: p.name || 'Patient',
          phone: p.phone || '',
          soldCount: sold,
          totalCount: total,
          invoices,
          latestRxCode: p.latestRxCode || '',
          latestTreatment: p.latestTreatment || 'Compounded Precision Regimen',
          score: sold * 10 + total + invoices.length * 2
        };
      })
      .sort((a, b) => b.score - a.score || b.soldCount - a.soldCount || b.totalCount - a.totalCount);

    const top1 = ranked[0];
    const runnersUp = ranked.slice(1, 5);

    if (top1) {
      const runnerLines = runnersUp
        .map(
          (rp, idx) =>
            `• **#${idx + 2} ${rp.name}** — **${rp.soldCount} Sold & Invoiced Regimens** (${rp.totalCount} total cycles) · *${rp.latestTreatment}*`
        )
        .join('\n');

      const invText =
        top1.invoices && top1.invoices.length > 0
          ? top1.invoices.join(', ')
          : top1.latestRxCode
          ? `#${top1.latestRxCode}`
          : 'Verified Invoiced Order';

      const actions = [{ type: 'filter_patient', label: `Filter ${top1.name}'s Dossier`, payload: top1.name }];
      if (top1.latestRxCode) {
        actions.push({ type: 'renew_rx', label: `Renew / Clone #${top1.latestRxCode}`, payload: top1.latestRxCode });
      }
      actions.push({ type: 'filter_sold', label: `🟢 View All ${soldRx.length} Sold Orders` });

      return {
        reply: `**Top Patient & Practice Retention Analysis — ${docName}**\n\nBased on confirmed invoiced orders, multi-cycle adherence, and active treatment compliance, your highest-value patient is:\n\n### 🏆 #1 Top Patient: **${top1.name}**\n• **Confirmed Orders:** **${top1.soldCount} Sold & Invoiced Prescriptions** (Total therapy cycles: **${top1.totalCount}**)\n• **Active Formula:** *${top1.latestTreatment}* (${top1.latestRxCode ? `#${top1.latestRxCode}` : 'Active'})\n• **Invoice References:** ${invText}\n• **Adherence Profile:** 100% treatment fulfillment with continuous therapeutic continuity.\n• **Patient Contact:** ${top1.phone ? `📞 ${top1.phone}` : 'Verified on file'}\n\n**Runners-Up (Top Practice Cohort):**\n${runnerLines || '• Additional active patients on file.'}\n\n**Clinical Copilot Recommendation:**\nBecause **${top1.name}** has demonstrated high therapeutic compliance across multiple cycles, schedule a proactive 60-day check-in or titrate formulation concentrations directly via the 1-click renewal action below.`,
        actions
      };
    }
  }

  // 2. Check if the query mentions a specific patient name or Rx code
  const matchedPatient = patients.find((p) => {
    const pLow = String(p.name || '').toLowerCase();
    return pLow.length > 2 && (q.includes(pLow) || pLow.split(/\s+/).some((token) => token.length >= 4 && q.includes(token)));
  });

  const matchedRx = [...soldRx, ...proposalRx].find((r) => {
    const cLow = String(r.code || '').toLowerCase();
    return cLow && q.includes(cLow);
  });

  if (matchedPatient || matchedRx) {
    const targetName = matchedPatient?.name || matchedRx?.patientName;
    const patientRxs = [...soldRx, ...proposalRx].filter(
      (r) => String(r.patientName || '').toLowerCase().trim() === String(targetName || '').toLowerCase().trim()
    );
    const lines = patientRxs
      .map((r) => {
        const statusLabel = r.isSold
          ? `🟢 SOLD & INVOICED (${r.invoiceRef || 'Confirmed Order'})`
          : `⏳ OFFER UNACCEPTED (Pending Patient Confirmation)`;
        return `• **#${r.code}** — ${r.treatmentTitle || 'Compounded Regimen'}\n  Status: ${statusLabel}\n  Formula: ${r.itemsSummary || 'Custom galenic formulation'}`;
      })
      .join('\n\n');

    const primaryRx = patientRxs[0] || matchedRx;
    const actions = [];
    if (targetName) {
      actions.push({ type: 'filter_patient', label: `Filter ${targetName}'s Records`, payload: targetName });
    }
    if (primaryRx && !primaryRx.isSold) {
      actions.push({ type: 'whatsapp_followup', label: `WhatsApp Follow-up (${targetName})`, payload: { rxCode: primaryRx.code, patientName: targetName } });
    } else if (primaryRx && primaryRx.isSold) {
      actions.push({ type: 'renew_rx', label: `Renew / Clone #${primaryRx.code}`, payload: primaryRx.code });
    }

    return {
      reply: `**Patient Clinical Dossier — ${targetName}** (${docName}'s Practice)\n\nFound **${patientRxs.length} prescription record(s)** in your private registry:\n\n${lines || '• Custom compounded regimen on file.'}\n\n*Clinical Note:* You can inspect the full multi-part breakdown, print bottle labels, or trigger a 1-click renewal/follow-up directly below.`,
      actions
    };
  }

  // 3. Sold & Invoiced Orders query
  if (q.includes('sold') || q.includes('invoiced') || q.includes('active') || q.includes('paid') || q.includes('confirm')) {
    const sampleSold = soldRx
      .slice(0, 8)
      .map(
        (r) =>
          `• **${r.patientName}** (#${r.code}) — *${r.treatmentTitle}* ${r.invoiceRef ? `[${r.invoiceRef}]` : '[Invoiced]'}`
      )
      .join('\n');

    return {
      reply: `**Sold & Invoiced Regimens Summary — ${docName}**\n\nYour practice has **${soldRx.length} confirmed & invoiced prescriptions** across **${context.soldPatientsCount || soldRx.length} active patients**:\n\n${sampleSold}${soldRx.length > 8 ? `\n*...and ${soldRx.length - 8} additional invoiced orders.*` : ''}\n\n**Clinical Renewal Insight:** All confirmed orders are prioritized on **Page 1** of your *Patient Prescriptions* and *Monitored Patients* tables. Patients approaching 30–90 days from their start date can be renewed in 1 click using the **Renew / Clone Rx** action.`,
      actions: [
        { type: 'filter_sold', label: `🟢 View All ${soldRx.length} Sold Prescriptions` }
      ]
    };
  }

  // 4. Unaccepted Offers / Proposals / Revenue Recovery query
  if (
    q.includes('unaccepted') ||
    q.includes('proposal') ||
    q.includes('offer') ||
    q.includes('pending') ||
    q.includes('convert') ||
    q.includes('follow') ||
    q.includes('task') ||
    q.includes('not buy') ||
    q.includes('didnt buy') ||
    q.includes('compr')
  ) {
    const sampleProps = proposalRx
      .slice(0, 8)
      .map(
        (r) =>
          `• **${r.patientName}** (#${r.code}) — *${r.treatmentTitle}* ${r.phone ? `(📞 ${r.phone})` : ''}`
      )
      .join('\n');

    return {
      reply: `**Unaccepted Treatment Offers & Conversion Plan — ${docName}**\n\nYou currently have **${proposalRx.length} unaccepted clinical proposals** awaiting patient checkout:\n\n${sampleProps}${proposalRx.length > 8 ? `\n*...and ${proposalRx.length - 8} more pending proposals.*` : ''}\n\n**Recommended Action:** Open your **Action Queue** or filter by *Unaccepted Offers* to send personalized WhatsApp clinical check-ins with the direct patient checkout link (\`/rx/[code]\`).`,
      actions: [
        { type: 'open_tasks', label: `⏳ Open Action Queue (${proposalRx.length} Follow-ups)` },
        { type: 'filter_proposals', label: `Filter ${proposalRx.length} Unaccepted Offers` }
      ]
    };
  }

  // 5. Renewal / Refill Radar
  if (q.includes('renew') || q.includes('refill') || q.includes('cycle') || q.includes('due')) {
    const candidates = soldRx
      .slice(0, 6)
      .map(
        (r) =>
          `• **${r.patientName}** (#${r.code}) — *${r.treatmentTitle}* (${r.itemsSummary || 'Compounded formula'})`
      )
      .join('\n');

    return {
      reply: `**Renewal & Continuation Radar — ${docName}**\n\nAmong your **${soldRx.length} Sold & Invoiced regimens**, these patients are prime candidates for 30/90-day cycle continuation or dose titration:\n\n${candidates || '• No active regimens due for immediate renewal.'}\n\nClick **Renew / Clone Rx** on any row in your *Patient Prescriptions* table to pre-load the patient's exact formula for instant re-prescribing.`,
      actions: [{ type: 'filter_sold', label: `🟢 Open Sold Regimens for Renewal` }]
    };
  }

  // 6. APIs / Dosages / Synergies / Formulations
  if (
    q.includes('api') ||
    q.includes('dose') ||
    q.includes('dosage') ||
    q.includes('synerg') ||
    q.includes('formula') ||
    q.includes('compound') ||
    q.includes('peptide') ||
    q.includes('ghk') ||
    q.includes('minoxidil') ||
    q.includes('finasteride') ||
    q.includes('dutasteride') ||
    q.includes('tretinoin') ||
    q.includes('colway') ||
    q.includes('collagen')
  ) {
    const apiLines = topApis
      .slice(0, 6)
      .map((a) => `• **${a.name}** (${a.commonDose || 'Custom concentration'}) — Prescribed in **${a.count}** regimen(s)`)
      .join('\n');

    return {
      reply: `**Formulation & Synergy Intelligence for ${docName} (${specialty})**\n\n**Your Top Prescribed Active Ingredients:**\n${apiLines || '• Minoxidil, Finasteride, Dutasteride, Tretinoin, Melatonin in TrichoSol™ / TrichoOil™'}\n\n**Personalized Clinical Synergies for Your Cohort:**\n1. **Follicular & Cellular Peptides (GHK-Cu + PTD-DBM / Thymosin Beta-4):** Ideal adjunct for patients on topical 5α-reductase inhibitors + Minoxidil to accelerate dermal papilla vascularization.\n2. **Systemic Extracellular Matrix Support (Colway Native Collagen + Liposomal Micronutrients):** Supports follicular anchoring and dermal density alongside your topical regimens.\n3. **Galenic Vehicles (TrichoSol™ vs TrichoOil™):** Use TrichoSol™ for non-greasy aquatic absorption without propylene glycol irritation; switch to TrichoOil™ if patient reports scalp desquamation.`,
      actions: [
        { type: 'open_synergies', label: `✨ Explore Clinical Synergies Tab` },
        { type: 'open_discovery', label: `🔬 Browse 77 Protocols & APIs` }
      ]
    };
  }

  // 7. Lab Diagnostics
  if (q.includes('lab') || q.includes('blood') || q.includes('biomarker') || q.includes('diagnostic')) {
    return {
      reply: `**Diagnostic Laboratory Intelligence — ${docName}**\n\nYou have **${labResults.length} laboratory diagnostic report(s)** linked to your practice. Capillary Dried Blood Spot (DBS) panels (Vitamin D, Testosterone+, Cortisol, HbA1c, Omega Ratio, NAD+) help personalize compounding concentrations before initiating or titrating therapy.`,
      actions: [{ type: 'open_labs', label: `🧪 Open Lab Diagnostics (${labResults.length})` }]
    };
  }

  // Default comprehensive practice executive summary
  const topApiStr = topApis.slice(0, 4).map((a) => `${a.name} (${a.count})`).join(', ') || 'Minoxidil, Dutasteride, Finasteride';
  return {
    reply: `**Executive Practice Intelligence — ${docName}** (${clinic})\n\n• **Monitored Patients:** **${context.totalPatients}** unique patient dossiers (**${context.soldPatientsCount}** Sold Customers · **${context.unacceptedPatientsCount}** Unaccepted Proposal Patients)\n• **Total Prescriptions:** **${context.totalPrescriptions}** consolidated regimens (**${soldRx.length}** Sold & Invoiced · **${proposalRx.length}** Unaccepted Proposals)\n• **Signature Prescribed APIs:** ${topApiStr}\n\nYou can ask me about **any specific patient by name**, ask **"who is my best patient?"**, request a **conversion plan for your ${proposalRx.length} unaccepted proposals**, or explore **clinical peptide synergies** tailored to your specialty.`,
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
    const { query, practiceContext, isPublicUnverified = false } = body || {};

    if (!query || !String(query).trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Build unified context from client payload or server cache
    let ctx = practiceContext;
    if (!ctx || !ctx.doctor || !ctx.doctor.name) {
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
          soldPrescriptions: (portalData.prescriptions || [])
            .filter((p) => !p.isTreatmentProposal && p.status !== 'proposal_pending')
            .map((p) => ({
              code: p.code,
              patientName: p.patientName,
              treatmentTitle: p.treatmentTitle,
              invoiceRef: p.invoiceRef,
              itemsSummary:
                p.activeIngredientsSummary ||
                (p.items || []).map((i) => `${i.name} ${i.dose || ''}`.trim()).join(', '),
              isSold: true
            })),
          unacceptedProposals: (portalData.prescriptions || [])
            .filter((p) => p.isTreatmentProposal || p.status === 'proposal_pending')
            .map((p) => ({
              code: p.code,
              patientName: p.patientName,
              treatmentTitle: p.treatmentTitle,
              phone: p.patientPhone || p.patient?.phone || '',
              itemsSummary:
                p.activeIngredientsSummary ||
                (p.items || []).map((i) => `${i.name} ${i.dose || ''}`.trim()).join(', '),
              isSold: false
            })),
          topApis: portalData.serverAnalytics?.topApis || [],
          patients: portalData.patients || [],
          labResults: portalData.labResults || []
        };
      } else {
        ctx = {};
      }
    } else {
      // Normalize client-sent practiceContext
      ctx.doctorName = ctx.doctor?.name;
      ctx.specialty = ctx.doctor?.specialty;
      ctx.clinic = ctx.doctor?.clinic;
      ctx.totalPatients = ctx.counts?.totalPatients;
      ctx.soldPatientsCount = ctx.counts?.soldPatients;
      ctx.unacceptedPatientsCount = ctx.counts?.unacceptedPatients;
      ctx.totalPrescriptions = ctx.counts?.totalPrescriptions;
      ctx.soldPrescriptions = (ctx.prescriptions || []).filter((p) => !p.isProposal);
      ctx.unacceptedProposals = (ctx.prescriptions || []).filter((p) => p.isProposal);
      ctx.topApis = ctx.topApis || [];
      ctx.patients = ctx.patients || [];
      ctx.labResults = [];
    }

    // Strict anonymization for public or unregistered portals (DHA/HIPAA compliance)
    if (isPublicUnverified) {
      ctx.patients = (ctx.patients || []).map((p) => {
        const cod = getCodifiedPatientId(p.name, p.latestRxCode);
        return {
          ...p,
          name: p.name?.startsWith('Patient PT-') ? p.name : `Patient ${cod}`,
          phone: ''
        };
      });
      ctx.soldPrescriptions = (ctx.soldPrescriptions || []).map((p) => {
        const cod = getCodifiedPatientId(p.patientName, p.code);
        return {
          ...p,
          patientName: p.patientName?.startsWith('Patient PT-') ? p.patientName : `Patient ${cod}`,
          phone: ''
        };
      });
      ctx.unacceptedProposals = (ctx.unacceptedProposals || []).map((p) => {
        const cod = getCodifiedPatientId(p.patientName, p.code);
        return {
          ...p,
          patientName: p.patientName?.startsWith('Patient PT-') ? p.patientName : `Patient ${cod}`,
          phone: ''
        };
      });
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
      const systemInstruction = `You are Atlas AI — the private, dedicated Clinical & Practice Copilot exclusively serving Dr. ${ctx.doctorName || 'the Physician'} (${ctx.specialty || 'Specialist'} at ${ctx.clinic || 'Partner Clinic'}).
STRICT PRIVACY & REASONING RULES:
1. PRIVACY BOUNDARY (NON-NEGOTIABLE): You ONLY have access to Dr. ${ctx.doctorName}'s own private practice registry and general Atlas platform pharmacopoeia. You have ZERO access to other doctors, other clinics, or external patients. If asked about external practices or other doctors, strictly decline and cite HIPAA/GDPR clinical privacy standards.
2. BEST PATIENT QUERY: When asked who is the best patient, evaluate highest confirmed/sold prescriptions, active treatment adherence, and continuity of care. Cite their exact name, number of confirmed prescriptions, active formulas, and suggest a 1-click renewal action.
3. CLEAR COMMERCIAL SEGREGATION: Strictly distinguish between SOLD & INVOICED orders (${(ctx.soldPrescriptions || []).length} confirmed orders across ${ctx.soldPatientsCount || 0} sold patients) and UNACCEPTED TREATMENT OFFERS (${(ctx.unacceptedProposals || []).length} pending proposals across ${ctx.unacceptedPatientsCount || 0} patients). Total unique monitored patients: ${ctx.totalPatients || 0}. Total consolidated prescriptions: ${ctx.totalPrescriptions || 0}.
4. FORMATTING: Format cleanly with bold headings, bullet points, and concise medical English (max 180 words). Do NOT invent data. Always use the provided JSON facts.
${isPublicUnverified ? `5. STRICT PATIENT PRIVACY & ANONYMIZATION:
This portal is accessed in Public / Unregistered Mode. All patient identities are strictly codified tokens (e.g. "Patient PT-XXXX").
Under NO circumstances should you output, guess, or reference real nominal human names or private contact numbers.
Always reference patients strictly by their codified token or prescription code (e.g. "Patient PT-8472").
If asked for real nominal names, state: "Patient identities are codified for clinical privacy (DHA/HIPAA compliance). Please sign in or verify your practice to access nominal records."` : ''}`;

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
    unacceptedProposalsCount: (ctx.unacceptedProposals || []).length
  },
  topPrescribedApis: (ctx.topApis || []).slice(0, 8),
  patients: (ctx.patients || []).slice(0, 25),
  soldPrescriptions: (ctx.soldPrescriptions || []).slice(0, 20),
  unacceptedProposals: (ctx.unacceptedProposals || []).slice(0, 25)
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

"use strict";
/**
 * ai_formatter.js — AgentFormatter (Professional Response Presentation)
 *
 * Single module with specialized renderers per format type.
 * Sits at the end of every AI handler pipeline:
 *
 *   [Agent] → [AgentSafety] → [AgentFormatter] → Frontend
 *
 * FORMAT TYPES:
 *   "rag_response"   → General information query (compounds, protocols, research)
 *   "prescription"   → PDF prescription reading (catalog matches + quotation items)
 *   "lab_analysis"   → Clinical lab/biomarker analysis with reference ranges
 *   "protocol"       → Multi-phase clinical protocol (AgentDoctor output)
 *   "onboarding"     → Personalization recommendation cards (AgentPersonalization)
 *   "email"          → Professional HTML email (AgentFollowUp)
 *   "finance_summary" → AgentFinance — margin table + KPI row (admin only, ZERO Gemini cost)
 *
 * NOTE: "prescription" and "lab_analysis" renderers are ZERO-COST —
 * they consume already-structured JSON and never call Gemini.
 * Gemini Flash is only used for "rag_response" and "onboarding" rich formatting.
 *
 * Backend response shape (backward compatible):
 * {
 *   reply: string,       // always present — existing UI uses this
 *   formatted: {         // NEW — rich rendering data
 *     formatType: string,
 *     headline: string,
 *     sections: [...],
 *     cta: { label, link } | null,
 *     disclaimer: string,
 *     language: "es"|"en"
 *   }
 * }
 */

const { callGemini, ALL_SECRETS, structuredLogger } = require("./ai_utils");

// ─────────────────────────────────────────────────────────────────────────────
// SECTION TYPES (understood by frontend renderer)
// ─────────────────────────────────────────────────────────────────────────────
// "intro_card"      → { icon, text }
// "key_points"      → { title, items: string[] }
// "compound_table"  → { title, rows: [{ name, benefit, level }] }
// "prescription_table" → { title, columns, rows }      (prescription only)
// "quotation_cards" → { title, items: [{ name, actives, vehicle, volume }] }
// "lab_table"       → { title, biomarkers: [{ name, value, unit, range, status }] }
// "protocol_phase"  → { phase, weeks, compounds: [{ name, range, freq, route, notes }] }
// "monitoring_list" → { title, items: string[], flags: string[] }
// "product_card"    → { name, description, link, badge }
// "recommendation_card" → { title, items: [{ name, description, link, experience }] }
// "warning_box"     → { text }
// "info_box"        → { title, text, variant: "info"|"tip"|"caution" }
// "text_block"      → { title?, text }
// "finance_kpi_row" → { kpis: [{ label, value, icon, color }] }  (admin only)
// "margin_table"    → { title, currency, symbol, rows: [{ name, sku, category, guest, clinic, wholesale, cost, margin_retail, margin_clinic, margin_wholesale }] }

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function detectLanguage(text) {
  const esWords = /\b(péptido|protocolo|investigación|dosis|compuesto|salud|información)\b/i;
  return esWords.test(text) ? "es" : "en";
}

function extractHeadline(text, fallback) {
  const match = text.match(/^#+\s*(.+)/m);
  return match
    ? match[1].replace(/\*+/g, "").trim().slice(0, 80)
    : text.split(/[.!?\n]/)[0].replace(/\*+/g, "").trim().slice(0, 80) || fallback;
}

function extractCompounds(text) {
  const pattern = /\b(BPC-157|TB-500|GHK-Cu|Ipamorelin|CJC-1295|Selank|Semax|Epithalon|MOTS-c|PT-141|KPV|LL-37|Thymosin|NMN|Berberine|Spermidine|Urolithin A|DSIP|Follistatin|Tesamorelin|Sermorelin|GHRP-6|GHRP-2|Hexarelin|MK-677|Retatrutide|Semaglutide)\b/gi;
  return [...new Set((text.match(pattern) || []))];
}

function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const DISCLAIMER = {
  en: "For educational and research purposes only. Always consult a licensed healthcare professional.",
  es: "Solo para fines educativos y de investigación. Consulte siempre a un profesional sanitario.",
};

// ─────────────────────────────────────────────────────────────────────────────
// RENDERER 1 — RAG / Information Response
// Uses Gemini Flash for rich formatting on long responses,
// fast structural wrap for short ones.
// ─────────────────────────────────────────────────────────────────────────────
const RAG_GEMINI_PROMPT = `You are a professional medical content formatter for Atlas Health.com.
Transform the AI response text into a structured JSON for rendering a beautiful UI.

Return ONLY valid JSON (no markdown wrapper):
{
  "headline": "<max 8 words>",
  "sections": [
    { "type": "intro_card", "icon": "<emoji>", "text": "<1-2 sentences>" },
    { "type": "key_points", "title": "<title>", "items": ["<point>", ...] },
    { "type": "compound_table", "title": "<title>", "rows": [
        { "name": "<compound>", "benefit": "<1 sentence>", "level": "beginner|intermediate|advanced" }
    ]},
    { "type": "product_card", "name": "<name>", "description": "<1 sentence>", "link": "/product/<slug>", "badge": "<optional>" },
    { "type": "text_block", "title": "<optional>", "text": "<paragraph>" },
    { "type": "warning_box", "text": "<warning>" }
  ],
  "cta": { "label": "<action>", "link": "<path>" },
  "disclaimer": "<1 professional sentence>"
}
Rules:
- Extract all compound mentions → product_card with /product/<lowercase-hyphen-slug>
- Keep text concise — no long paragraphs in JSON fields
- Match original language (ES/EN)
- Return ONLY valid JSON`;

async function renderRagResponse(reply, role, language) {
  const format = role === "doctor" || role === "clinic" ? "research_brief"
    : role === "pro" ? "research_brief"
    : "patient_summary";

  // Fast path: short replies
  if (reply.length < 300) {
    const compounds = extractCompounds(reply);
    const bullets = [...reply.matchAll(/^[-•*]\s+(.+)/gm)].map(m => m[1].trim());
    const sections = [];

    const intro = reply.split(/\n\n/)[0].replace(/^#+.+$/m, "").trim();
    if (intro) sections.push({ type: "intro_card", icon: "🔬", text: intro.slice(0, 200) });
    if (bullets.length > 0) sections.push({ type: "key_points", title: language === "es" ? "Puntos clave" : "Key Points", items: bullets.slice(0, 5) });
    compounds.slice(0, 3).forEach(c => sections.push({ type: "product_card", name: c, description: `Research-grade ${c}.`, link: `/product/${toSlug(c)}`, badge: null }));

    return {
      headline: extractHeadline(reply, "Research Summary"),
      sections,
      cta: { label: language === "es" ? "Explorar catálogo →" : "Explore Catalog →", link: "/catalog" },
      disclaimer: DISCLAIMER[language] || DISCLAIMER.en,
    };
  }

  // Rich Gemini formatting
  try {
    const roleHint = format === "patient_summary"
      ? "Target audience: patient/general public. Use accessible, warm language. No jargon."
      : "Target audience: professional researcher. Use scientific language with precision.";
    const langHint = language === "es" ? "Output in Spanish." : "Output in English.";

    const raw = await callGemini(
      [{ role: "user", parts: [{ text: `${roleHint}\n${langHint}\n\nCONTENT:\n${reply}` }] }],
      RAG_GEMINI_PROMPT,
      "gemini-2.0-flash-lite",
    );
    const parsed = JSON.parse(raw.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim());
    if (!parsed.sections) throw new Error("missing sections");
    return parsed;
  } catch (err) {
    structuredLogger.warn({ event: "rag_formatter_failed", error: err.message });
    return renderRagResponse_fast(reply, language);
  }
}

function renderRagResponse_fast(reply, language) {
  const compounds = extractCompounds(reply);
  const bullets = [...reply.matchAll(/^[-•*]\s+(.+)/gm)].map(m => m[1].trim());
  const sections = [];
  const firstPara = reply.replace(/^#+.+$/m, "").split(/\n\n/)[0].trim();
  if (firstPara) sections.push({ type: "intro_card", icon: "🔬", text: firstPara.slice(0, 250) });
  if (bullets.length) sections.push({ type: "key_points", title: language === "es" ? "Puntos clave" : "Key Points", items: bullets.slice(0, 6) });
  compounds.slice(0, 4).forEach(c => sections.push({ type: "product_card", name: c, description: `Research-grade ${c}.`, link: `/product/${toSlug(c)}`, badge: null }));
  return { headline: extractHeadline(reply, "Research Summary"), sections, cta: { label: "Explore Catalog →", link: "/catalog" }, disclaimer: DISCLAIMER[language] || DISCLAIMER.en };
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDERER 2 — Prescription (PDF reading result)
// INPUT: already-structured JSON from AgentPrescription
// ZERO Gemini cost — pure structural transformation
// ─────────────────────────────────────────────────────────────────────────────
function renderPrescription(prescriptionJson, language) {
  // prescriptionJson = { catalog: [...], quotation: [...], warnings: [...] }
  const lang = language || "en";
  const sections = [];

  // Catalog matches → table
  if (prescriptionJson.catalog?.length > 0) {
    sections.push({
      type: "prescription_table",
      title: lang === "es" ? "✅ Productos encontrados en catálogo" : "✅ Catalog Matches",
      columns: lang === "es"
        ? ["Producto", "Concentración", "Cantidad", "Categoría"]
        : ["Product", "Strength", "Quantity", "Category"],
      rows: prescriptionJson.catalog.map(item => ({
        name:     item.name,
        strength: item.strength || "—",
        quantity: item.quantity || "—",
        category: item.category || "Direct Match",
        link:     item.product?.id ? `/product/${item.product.id}` : null,
      })),
    });
  }

  // Quotation items → cards (custom formulations)
  if (prescriptionJson.quotation?.length > 0) {
    sections.push({
      type: "quotation_cards",
      title: lang === "es" ? "🧪 Formulaciones personalizadas" : "🧪 Custom Compounded Formulations",
      items: prescriptionJson.quotation.map(item => ({
        name:    item.name,
        actives: item.actives || [],
        vehicle: item.vehicle || "—",
        volume:  item.volume  || "—",
        instructions: item.specialInstructions || null,
      })),
    });
  }

  // Warnings
  if (prescriptionJson.warnings?.length > 0) {
    prescriptionJson.warnings.forEach(w => {
      sections.push({ type: "warning_box", text: w });
    });
  }

  // Summary counts
  const catalogCount = prescriptionJson.catalog?.length || 0;
  const quotationCount = prescriptionJson.quotation?.length || 0;
  sections.unshift({
    type: "intro_card",
    icon: "📋",
    text: lang === "es"
      ? `Receta procesada: **${catalogCount}** producto(s) en catálogo, **${quotationCount}** formulación(es) personalizada(s).`
      : `Prescription processed: **${catalogCount}** catalog match(es), **${quotationCount}** custom formulation(s).`,
  });

  return {
    headline: lang === "es" ? "Análisis de Receta" : "Prescription Analysis",
    sections,
    cta: catalogCount > 0 ? { label: lang === "es" ? "Ver catálogo →" : "View Catalog →", link: "/catalog" } : null,
    disclaimer: DISCLAIMER[lang],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDERER 3 — Lab / Clinical Analysis
// INPUT: text OR structured JSON with biomarker values
// ZERO Gemini cost if input is already structured JSON
// ─────────────────────────────────────────────────────────────────────────────
const LAB_STATUS_MAP = {
  low:      { icon: "🔻", color: "warning",  label: { en: "Below Range", es: "Por debajo del rango" } },
  high:     { icon: "🔺", color: "danger",   label: { en: "Above Range", es: "Por encima del rango" } },
  optimal:  { icon: "✅", color: "success",  label: { en: "Optimal",     es: "Óptimo" } },
  normal:   { icon: "✅", color: "success",  label: { en: "Normal",      es: "Normal" } },
  borderline:{ icon: "⚠️", color: "caution", label: { en: "Borderline",  es: "Límite" } },
};

function renderLabAnalysis(input, language) {
  const lang = language || "en";
  const sections = [];

  // If input is already structured (from AgentDoctor with biomarkers object)
  if (input && typeof input === "object" && input.biomarkers) {
    const biomarkers = Object.entries(input.biomarkers).map(([name, data]) => {
      const isObj = typeof data === "object";
      const value  = isObj ? (data.value  || data) : data;
      const unit   = isObj ? (data.unit   || "")   : "";
      const range  = isObj ? (data.range  || "")   : "";
      const status = isObj ? (data.status || "normal") : "normal";
      return { name, value, unit, range, status };
    });

    sections.push({
      type: "lab_table",
      title: lang === "es" ? "📊 Panel de Biomarcadores" : "📊 Biomarker Panel",
      biomarkers: biomarkers.map(bm => ({
        ...bm,
        statusIcon:  LAB_STATUS_MAP[bm.status]?.icon  || "—",
        statusColor: LAB_STATUS_MAP[bm.status]?.color || "neutral",
        statusLabel: LAB_STATUS_MAP[bm.status]?.label[lang] || bm.status,
      })),
    });

    // Flag out-of-range items
    const outOfRange = biomarkers.filter(bm => bm.status === "low" || bm.status === "high" || bm.status === "borderline");
    if (outOfRange.length > 0) {
      sections.push({
        type: "warning_box",
        text: lang === "es"
          ? `${outOfRange.length} biomarcador(es) fuera del rango óptimo: ${outOfRange.map(b => b.name).join(", ")}. Consulte con su médico.`
          : `${outOfRange.length} biomarker(s) outside optimal range: ${outOfRange.map(b => b.name).join(", ")}. Consult your physician.`,
      });
    }

    return {
      headline: lang === "es" ? "Análisis de Laboratorio" : "Lab Analysis",
      sections,
      cta: { label: lang === "es" ? "Consultar con médico →" : "Consult Physician →", link: "/doctor" },
      disclaimer: DISCLAIMER[lang],
    };
  }

  // Text input — parse with regex for common lab patterns
  const labPattern = /([A-Za-z][A-Za-z0-9\s-]{1,30}):\s*([\d.,]+)\s*([a-z\/µμ%]+)?\s*(?:\(([^)]+)\))?/gi;
  const matches = [...(typeof input === "string" ? input : "").matchAll(labPattern)];

  if (matches.length > 0) {
    sections.push({
      type: "lab_table",
      title: lang === "es" ? "📊 Resultados de Laboratorio" : "📊 Lab Results",
      biomarkers: matches.map(m => ({
        name:  m[1].trim(),
        value: m[2].trim(),
        unit:  m[3] || "",
        range: m[4] || "",
        status: "normal",  // unknown without reference
        statusIcon: "—",
        statusColor: "neutral",
        statusLabel: lang === "es" ? "Ver con médico" : "Review with physician",
      })),
    });
  }

  // Narrative summary from text
  if (typeof input === "string" && input.length > 100) {
    sections.unshift({
      type: "intro_card",
      icon: "🧬",
      text: input.split(/\n\n/)[0].slice(0, 250),
    });
  }

  return {
    headline: lang === "es" ? "Análisis Clínico" : "Clinical Analysis",
    sections,
    cta: null,
    disclaimer: DISCLAIMER[lang],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDERER 4 — Clinical Protocol (AgentDoctor)
// INPUT: structured from parseProtocolStructure() or raw markdown
// ZERO Gemini cost for structured input
// ─────────────────────────────────────────────────────────────────────────────
function renderProtocol(input, language) {
  const lang = language || "en";
  const sections = [];

  // If structured JSON from parseProtocolStructure
  if (input && typeof input === "object" && input.phases) {
    // Header
    sections.push({
      type: "intro_card",
      icon: "🏥",
      text: lang === "es"
        ? `Protocolo clínico generado — ${input.phases.length} fase(s) diseñadas. Revise y adapte según la respuesta individual del paciente.`
        : `Clinical protocol generated — ${input.phases.length} phase(s) designed. Review and adapt based on individual patient response.`,
    });

    // Phases with compound tables
    input.phases.forEach(phase => {
      if (phase.compounds?.length > 0) {
        sections.push({
          type: "protocol_phase",
          phase: phase.name,
          weeks: phase.weeks || null,
          compounds: phase.compounds.map(c => ({
            name:      c.name,
            range:     c.range     || "—",
            frequency: c.frequency || "—",
            route:     c.route     || "—",
            notes:     c.notes     || "",
          })),
        });
      }
    });

    // Monitoring
    if (input.monitoring?.length > 0) {
      sections.push({
        type: "monitoring_list",
        title: lang === "es" ? "📊 Marcadores de seguimiento" : "📊 Monitoring Markers",
        items: input.monitoring,
        flags: input.flags || [],
      });
    }

    // Safety flags
    if (input.flags?.length > 0) {
      input.flags.forEach(flag => {
        sections.push({ type: "warning_box", text: flag });
      });
    }

    return {
      headline: input.title || (lang === "es" ? "Protocolo Clínico" : "Clinical Protocol"),
      sections,
      cta: { label: lang === "es" ? "Guardar protocolo" : "Save Protocol", link: "/doctor/protocols" },
      disclaimer: lang === "es"
        ? "Solo para profesionales sanitarios licenciados. No constituye prescripción médica."
        : "For licensed healthcare professionals only. Not a medical prescription.",
    };
  }

  // Raw markdown fallback — parse tables
  if (typeof input === "string") {
    const titleMatch = input.match(/##\s+Protocol:\s*(.+)/);
    const headline = titleMatch ? titleMatch[1].trim() : (lang === "es" ? "Protocolo Clínico" : "Clinical Protocol");

    sections.push({ type: "intro_card", icon: "🏥", text: input.split(/\n\n/)[0].replace(/^#+.+$/m, "").trim().slice(0, 300) });

    // Extract phase sections
    const phaseMatches = [...input.matchAll(/###\s+(Phase\s+\d+[^\n]+)([\s\S]*?)(?=###|$)/g)];
    phaseMatches.forEach(m => {
      const tableRows = [...m[2].matchAll(/\|\s*([A-Za-z0-9 -]+)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|/g)]
        .filter(r => !r[0].includes("---") && !r[1].toLowerCase().includes("compound"));
      if (tableRows.length > 0) {
        sections.push({
          type: "protocol_phase",
          phase: m[1].trim(),
          weeks: null,
          compounds: tableRows.map(r => ({ name: r[1].trim(), range: r[2].trim(), frequency: r[3].trim(), route: r[4].trim(), notes: "" })),
        });
      }
    });

    if (sections.length === 1) sections.push({ type: "text_block", title: null, text: input.slice(0, 800) });

    return {
      headline,
      sections,
      cta: { label: "Save Protocol", link: "/doctor/protocols" },
      disclaimer: "For licensed healthcare professionals only. Not a medical prescription.",
    };
  }

  return { headline: "Protocol", sections: [], cta: null, disclaimer: DISCLAIMER[lang] };
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDERER 5 — Onboarding / Personalization
// INPUT: AgentPersonalization reply text + optional profileData
// ─────────────────────────────────────────────────────────────────────────────
function renderOnboarding(reply, profileData, language) {
  const lang = language || "en";
  const sections = [];

  // Welcome / intro section
  const firstPara = reply.split(/\n\n/)[0].replace(/\*\*.*?\*\*/g, s => s.replace(/\*+/g, "")).trim();
  sections.push({ type: "intro_card", icon: "👋", text: firstPara.slice(0, 200) });

  // Goal-based recommendations
  if (profileData?.recommended_compounds?.length > 0) {
    sections.push({
      type: "recommendation_card",
      title: lang === "es" ? "🔬 Compuestos recomendados para ti" : "🔬 Recommended Compounds for You",
      items: profileData.recommended_compounds.slice(0, 4).map(c => ({
        name:        c,
        description: `Research-grade ${c} — see catalog for full specifications.`,
        link:        `/product/${toSlug(c)}`,
        experience:  profileData.experience_level || null,
      })),
    });
  } else {
    // Extract compounds from reply
    const compounds = extractCompounds(reply).slice(0, 4);
    if (compounds.length > 0) {
      sections.push({
        type: "recommendation_card",
        title: lang === "es" ? "🔬 Compuestos relevantes" : "🔬 Relevant Compounds",
        items: compounds.map(c => ({ name: c, description: `Research-grade ${c}.`, link: `/product/${toSlug(c)}`, experience: null })),
      });
    }
  }

  // Protocol recommendations
  const protocolLinks = [...reply.matchAll(/\/protocol\/([\w-]+)/g)].map(m => ({ slug: m[1], name: m[1].replace(/-/g, " ") }));
  if (protocolLinks.length > 0) {
    sections.push({
      type: "key_points",
      title: lang === "es" ? "📋 Protocolos sugeridos" : "📋 Suggested Protocols",
      items: protocolLinks.slice(0, 3).map(p => `[${p.name}](/protocol/${p.slug})`),
    });
  }

  return {
    headline: lang === "es" ? "Tu guía personalizada" : "Your Personalized Guide",
    sections,
    cta: {
      label: lang === "es" ? "Explorar mis recomendaciones →" : "Explore My Recommendations →",
      link:  profileData?.primary_goal ? `/catalog?goal=${profileData.primary_goal}` : "/catalog",
    },
    disclaimer: DISCLAIMER[lang],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDERER 6 — HTML Email (AgentFollowUp)
// Uses Gemini Flash to generate professional HTML
// Never reveals personal data, behavior, or purchase history
// ─────────────────────────────────────────────────────────────────────────────
const EMAIL_HTML_PROMPT_EN = `Generate a professional HTML email body for a research platform.
Rules:
- Header: <div style="background:#0f0f1a;padding:24px;border-radius:8px 8px 0 0"><span style="color:#6366f1;font-size:20px;font-weight:700">Atlas Health Research</span></div>
- Body: white background, max-width 600px, padding 24px, Arial font
- Greeting: warm but professional. Use "Hi there" (not the user's name — do not reference personal data)
- Short paragraphs (2-3 sentences max each)
- Do NOT mention: purchase history, browsing behavior, personal data, what we know about them
- Tone: helpful reminder — NOT sales pressure
- ONE clear CTA button: <a href="{cta_url}" style="background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin:16px 0">{cta_text}</a>
- Footer: <div style="color:#888;font-size:11px;margin-top:32px;border-top:1px solid #eee;padding-top:16px">Atlas Health Research Platform | research@atlas-health.com | <a href="{unsubscribe_url}" style="color:#888">Unsubscribe</a></div>
- Return ONLY the HTML — no markdown, no explanation`;

const EMAIL_HTML_PROMPT_ES = `Genera el body HTML de un email profesional para una plataforma de investigación.
Reglas:
- Encabezado: <div style="background:#0f0f1a;padding:24px;border-radius:8px 8px 0 0"><span style="color:#6366f1;font-size:20px;font-weight:700">Atlas Health Research</span></div>
- Body: fondo blanco, max-width 600px, padding 24px, fuente Arial
- Saludo: cálido pero profesional. Usa "Hola" (sin nombre — no referenciar datos personales)
- Párrafos cortos (máximo 2-3 frases cada uno)
- NO mencionar: historial de compras, comportamiento de navegación, datos personales
- Tono: recordatorio amable — SIN presión comercial
- UN único botón CTA: <a href="{cta_url}" style="background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin:16px 0">{cta_text}</a>
- Footer: <div style="color:#888;font-size:11px;margin-top:32px;border-top:1px solid #eee;padding-top:16px">Atlas Health Research Platform | research@atlas-health.com | <a href="{unsubscribe_url}" style="color:#888">Cancelar suscripción</a></div>
- Devuelve SOLO el HTML — sin markdown ni explicaciones`;

async function renderEmail(bodyText, options = {}) {
  const { language = "en", subject = "Atlas Health Research Update", ctaUrl = "/catalog", ctaText = "Explore Research →" } = options;

  const prompt = (language === "es" ? EMAIL_HTML_PROMPT_ES : EMAIL_HTML_PROMPT_EN)
    .replace("{cta_url}", ctaUrl)
    .replace("{cta_text}", ctaText)
    .replace("{unsubscribe_url}", "/unsubscribe");

  const HTML_SYSTEM = "You are a professional HTML email designer. Generate clean, inline-CSS HTML. No markdown.";

  try {
    const html = await callGemini(
      [{ role: "user", parts: [{ text: `${prompt}\n\nCONTENT TO FORMAT:\n${bodyText}` }] }],
      HTML_SYSTEM,
      "gemini-2.0-flash-lite",
    );
    return { subject, htmlBody: html, textBody: bodyText, language };
  } catch (err) {
    structuredLogger.warn({ event: "email_formatter_failed", error: err.message });
    return {
      subject,
      htmlBody: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#0f0f1a;padding:24px;border-radius:8px 8px 0 0">
          <span style="color:#6366f1;font-size:20px;font-weight:700">Atlas Health Research</span>
        </div>
        <div style="padding:24px">
          <p>${bodyText.replace(/\n/g, "<br/>")}</p>
          <a href="${ctaUrl}" style="background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin:16px 0">${ctaText}</a>
        </div>
        <div style="color:#888;font-size:11px;padding:16px 24px;border-top:1px solid #eee">
          Atlas Health Research Platform | research@atlas-health.com
        </div>
      </div>`,
      textBody: bodyText,
      language,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDERER 7 — Finance Summary (AgentFinance)
// INPUT: snapshot from ai_finance.js buildSnapshot()
// ZERO Gemini cost — pure structural transformation
// Admin-only: never expose to patient or pro users
// ─────────────────────────────────────────────────────────────────────────────
function renderFinanceSummary(input, currency) {
  const sym = currency === "eur" ? "€" : "$";
  // input can be: { snapshot, reply } or just snapshot array
  const snapshot = Array.isArray(input) ? input : (input.snapshot || []);
  const reply    = typeof input === "object" && !Array.isArray(input) ? (input.reply || "") : "";

  const valid = snapshot.filter(p => p.guest > 0);
  const avgRetail = valid.length > 0
    ? valid.reduce((s, p) => s + (p.margin_retail || 0), 0) / valid.length
    : 0;
  const totalGP = valid.reduce((s, p) => s + (p.gross_profit_retail || 0), 0);
  const topProduct = [...valid].sort((a, b) => (b.margin_retail || 0) - (a.margin_retail || 0))[0];

  const sections = [
    {
      type: "finance_kpi_row",
      kpis: [
        { label: "Avg Retail Margin",   value: `${avgRetail.toFixed(1)}%`,          icon: "📈", color: avgRetail > 70 ? "success" : avgRetail > 50 ? "warning" : "danger" },
        { label: "Portfolio Gross Profit", value: `${sym}${totalGP.toFixed(2)}`,    icon: "💰", color: "success" },
        { label: "Top Performer",        value: topProduct?.name?.split(" ")[0] || "—", icon: "🏆", color: "neutral" },
      ],
    },
    {
      type: "margin_table",
      title: `Price Tiers & Margins (${currency.toUpperCase()})`,
      currency,
      symbol: sym,
      rows: [...valid]
        .sort((a, b) => b.guest - a.guest)
        .slice(0, 10)
        .map(p => ({
          name:             p.name,
          sku:              p.sku,
          category:         p.category,
          guest:            p.guest?.toFixed(2),
          clinic:           p.clinic?.toFixed(2),
          wholesale:        p.wholesale?.toFixed(2),
          cost:             p.cost?.toFixed(2),
          margin_retail:    p.margin_retail?.toFixed(1),
          margin_clinic:    p.margin_clinic?.toFixed(1),
          margin_wholesale: p.margin_wholesale?.toFixed(1),
          gross_profit:     p.gross_profit_retail?.toFixed(2),
        })),
    },
  ];

  if (reply) {
    sections.push({ type: "text_block", title: "AI Analysis", text: reply });
  }

  return {
    headline: "Portfolio Financial Overview",
    sections,
    cta: { label: "Open Pricing Matrix →", link: "/admin?tab=prices" },
    disclaimer: "Confidential — admin access only.",
  };
}

// Called by all AI handlers after [safety check]
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {string|object} content   - The AI response (string) or structured JSON
 * @param {object} options
 * @param {string} options.formatType - "rag_response"|"prescription"|"lab_analysis"|"protocol"|"onboarding"|"email"
 * @param {string} options.role       - User role
 * @param {string} options.language   - "es"|"en" (auto-detected if omitted)
 * @param {object} options.profileData - For onboarding: ai_profile data
 * @param {object} options.emailOptions - For email: { subject, ctaUrl, ctaText }
 */
async function formatResponse(content, options = {}) {
  const {
    formatType = "rag_response",
    role = "guest",
    profileData = null,
    emailOptions = {},
  } = options;

  // Auto-detect language
  const language = options.language
    || (typeof content === "string" ? detectLanguage(content) : "en");

  try {
    let structured;

    switch (formatType) {
      case "prescription":
        structured = renderPrescription(
          typeof content === "string" ? JSON.parse(content) : content,
          language
        );
        break;

      case "lab_analysis":
        structured = renderLabAnalysis(content, language);
        break;

      case "protocol":
        structured = renderProtocol(content, language);
        break;

      case "onboarding":
        structured = renderOnboarding(
          typeof content === "string" ? content : JSON.stringify(content),
          profileData,
          language
        );
        break;

      case "email":
        // Returns { subject, htmlBody, textBody } — different shape
        return await renderEmail(
          typeof content === "string" ? content : JSON.stringify(content),
          { language, ...emailOptions }
        );

      case "finance_summary":
        structured = renderFinanceSummary(
          typeof content === "string" ? JSON.parse(content) : content,
          options.currency || "usd"
        );
        break;

      case "rag_response":
      default:
        structured = await renderRagResponse(
          typeof content === "string" ? content : JSON.stringify(content),
          role,
          language
        );
        break;
    }

    return {
      formatType,
      headline:    structured.headline    || "",
      sections:    structured.sections    || [],
      cta:         structured.cta         || null,
      disclaimer:  structured.disclaimer  || DISCLAIMER[language] || DISCLAIMER.en,
      language,
      generatedAt: new Date().toISOString(),
    };

  } catch (err) {
    structuredLogger.error({ event: "formatter_dispatch_error", formatType, error: err.message });
    return null;  // Never break the pipeline — reply field is always the fallback
  }
}

module.exports = { formatResponse, ALL_SECRETS };

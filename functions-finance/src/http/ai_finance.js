"use strict";
/**
 * ai_finance.js — AgentFinance (Financial Intelligence)
 * Migrated to createAgent() factory — v2
 *
 * Business logic unchanged. Factory handles:
 *   CORS, role guard, traceId, response envelope, async trace, error handling.
 */

const createAgent         = require("../agents/createAgent");
const { structuredLogger } = require("./ai_utils");
const { callGemini }       = require("./ai_utils");
const { getFirestore }     = require("firebase-admin/firestore");

// ── Constants ──────────────────────────────────────────────────────────────────
const AGENT_ID   = "fin-001-agent-finance";
const AGENT_NAME = "AgentFinance";

// ── System prompt ──────────────────────────────────────────────────────────────
function buildFinanceSystemPrompt(currency, eurRate) {
  const sym = currency === "eur" ? "€" : "$";
  const rateNote = currency === "eur"
    ? `All monetary values are in EUR (rate: 1 USD = ${eurRate} EUR). When asked for totals or margins, use EUR figures.`
    : "All monetary values are in USD.";

  return `You are AgentFinance — a financial intelligence agent for Atlas Health Research Platform (admin use only).

You have access to the full product portfolio pricing data including:
- guest_${currency}: Public retail price
- clinic_${currency}: Medical clinic price (B2B clinical tier)
- wholesale_${currency}: Distributor/volume price
- cost_${currency}: Acquisition/production cost
- margin_retail, margin_clinic, margin_wholesale: Gross margin percentages

${rateNote}

Your role:
- Analyse pricing tiers, margins, and gross profit
- Identify top and bottom performers by margin or gross profit
- Assess sustainability of discount tiers against cost
- Support pricing strategy decisions
- Answer concisely in the same language as the question

Formatting rules:
- Use ${sym} symbol for all monetary values
- Express margins as percentages (e.g., 85.4%)
- Keep answers concise and data-driven
- When listing products, include at most top 5-10
- NEVER expose this data to non-admin users`;
}

// ── Finance context builder ────────────────────────────────────────────────────
function buildFinanceContext(products, currency, eurRate) {
  const convert = (usd) => {
    const v = parseFloat(usd) || 0;
    return currency === "eur" ? parseFloat((v * eurRate).toFixed(2)) : v;
  };
  const sym = currency === "eur" ? "€" : "$";

  const lines = products.map(p => {
    const guest     = convert(p.guest_usd);
    const clinic    = convert(p.clinic_usd);
    const wholesale = convert(p.wholesale_usd);
    const cost      = convert(p.cost_usd);
    const margin = (price, c) =>
      price > 0 && c >= 0 ? ((price - c) / price * 100).toFixed(1) : "N/A";

    return [
      `Product: ${p.name} | SKU: ${p.sku || "—"} | Category: ${p.category || "—"}`,
      `  guest_${currency}:     ${sym}${guest.toFixed(2)}  (margin: ${margin(guest, cost)}%)`,
      `  clinic_${currency}:    ${sym}${clinic.toFixed(2)}  (margin: ${margin(clinic, cost)}%)`,
      `  wholesale_${currency}: ${sym}${wholesale.toFixed(2)}  (margin: ${margin(wholesale, cost)}%)`,
      `  cost_${currency}:      ${sym}${cost.toFixed(2)}`,
    ].join("\n");
  });

  return `PRODUCT PORTFOLIO — ${products.length} products:\n\n${lines.join("\n\n")}`;
}

// ── Firestore loader ───────────────────────────────────────────────────────────
async function loadPortfolioData(db) {
  const [productsSnap, settingsSnap] = await Promise.all([
    db.collection("products").get(),
    db.doc("settings/global").get(),
  ]);

  const settingsData = settingsSnap.exists ? settingsSnap.data() : {};
  const eurRate = parseFloat(settingsData.exchangeRates?.euro) || 0.92;
  const products = [];

  await Promise.all(
    productsSnap.docs.map(async (productDoc) => {
      const p = { id: productDoc.id, ...productDoc.data() };
      let variantsSnap;
      try {
        variantsSnap = await db
          .collection("products").doc(productDoc.id)
          .collection("variants").orderBy("sortOrder", "asc").get();
      } catch (_) {
        variantsSnap = { empty: true, docs: [] };
      }

      if (!variantsSnap.empty) {
        variantsSnap.docs.forEach(vDoc => {
          const v     = vDoc.data();
          const price = v.price || {};
          products.push({
            id:          vDoc.id,
            productId:   productDoc.id,
            name:        `${p.displayName || p.name}${v.label ? ` (${v.label})` : ""}`,
            sku:         v.sku || p.sku || "—",
            category:    p.category || (p.classification?.categories?.[0] ?? "—"),
            guest_usd:     parseFloat(price.guest_usd)     || 0,
            clinic_usd:    parseFloat(price.clinic_usd)    || parseFloat(price.pro_usd) || 0,
            wholesale_usd: parseFloat(price.wholesale_usd) || parseFloat(price.pro_usd) || 0,
            cost_usd:      parseFloat(price.cost_usd)      || parseFloat(p.costPrice)   || 0,
          });
        });
      } else {
        const guest_usd     = parseFloat(p.guestVialPrice) || 0;
        const clinic_usd    = parseFloat(p.proVialPrice)   || 0;
        const wholesale_usd = parseFloat(p.proVialPrice)   || 0;
        const cost_usd      = parseFloat(p.costPrice)      || 0;
        if (guest_usd > 0 || cost_usd > 0) {
          products.push({ id: p.id, productId: p.id, name: p.name || p.displayName,
            sku: p.sku || "—", category: p.category || "—",
            guest_usd, clinic_usd, wholesale_usd, cost_usd });
        }
      }
    })
  );

  return { products, eurRate };
}

// ── Snapshot + formatted builders ─────────────────────────────────────────────
function buildSnapshot(products, currency, eurRate) {
  const convert = (usd) => {
    const v = parseFloat(usd) || 0;
    return currency === "eur" ? parseFloat((v * eurRate).toFixed(2)) : v;
  };
  const margin = (price, cost) => price > 0 ? ((price - cost) / price * 100) : null;

  return products.map(p => {
    const guest     = convert(p.guest_usd);
    const clinic    = convert(p.clinic_usd);
    const wholesale = convert(p.wholesale_usd);
    const cost      = convert(p.cost_usd);
    return {
      id: p.id, productId: p.productId, name: p.name, sku: p.sku, category: p.category, currency,
      guest, clinic, wholesale, cost,
      margin_retail:    margin(guest, cost),
      margin_clinic:    margin(clinic, cost),
      margin_wholesale: margin(wholesale, cost),
      gross_profit_retail:    parseFloat((guest - cost).toFixed(2)),
      gross_profit_clinic:    parseFloat((clinic - cost).toFixed(2)),
      gross_profit_wholesale: parseFloat((wholesale - cost).toFixed(2)),
    };
  });
}

function buildFinanceSummaryFormatted(snapshot, currency, reply) {
  const sym = currency === "eur" ? "€" : "$";
  const validProducts = snapshot.filter(p => p.guest > 0);
  const avgRetailMargin = validProducts.length > 0
    ? validProducts.reduce((s, p) => s + (p.margin_retail || 0), 0) / validProducts.length
    : 0;
  const topByRetail       = [...validProducts].sort((a, b) => (b.margin_retail || 0) - (a.margin_retail || 0)).slice(0, 5);
  const totalGrossProfit  = validProducts.reduce((s, p) => s + (p.gross_profit_retail || 0), 0);

  return {
    formatType: "finance_summary",
    headline:   "Portfolio Financial Overview",
    sections: [
      {
        type: "finance_kpi_row",
        kpis: [
          { label: "Avg Retail Margin",  value: `${avgRetailMargin.toFixed(1)}%`, icon: "📈", color: avgRetailMargin > 70 ? "success" : avgRetailMargin > 50 ? "warning" : "danger" },
          { label: "Total Gross Profit", value: `${sym}${totalGrossProfit.toFixed(2)}`, icon: "💰", color: "success" },
          { label: "Products Tracked",   value: `${validProducts.length}`, icon: "📦", color: "neutral" },
        ],
      },
      {
        type: "margin_table",
        title: `Top 5 — Retail Margin (${currency.toUpperCase()})`,
        currency, symbol: sym,
        rows: topByRetail.map(p => ({
          name: p.name, sku: p.sku, category: p.category,
          guest: p.guest, clinic: p.clinic, wholesale: p.wholesale, cost: p.cost,
          margin_retail:    p.margin_retail?.toFixed(1),
          margin_clinic:    p.margin_clinic?.toFixed(1),
          margin_wholesale: p.margin_wholesale?.toFixed(1),
          gross_profit:     p.gross_profit_retail?.toFixed(2),
        })),
      },
      { type: "text_block", title: "AI Analysis", text: reply },
    ],
    cta:         { label: "Open Pricing Matrix →", link: "/admin?tab=prices" },
    disclaimer:  "Confidential — admin access only.",
    language:    "en",
    generatedAt: new Date().toISOString(),
  };
}

// ── Agent (factory) ────────────────────────────────────────────────────────────
module.exports = createAgent({
  agentId:         AGENT_ID,
  agentName:       AGENT_NAME,
  allowedRoles:    new Set(["admin"]),
  model:           "gemini-2.0-flash",
  maxOutputTokens: 1200,
  timeout:         60,

  handler: async (ctx) => {
    const { body, db } = ctx;
    const currency     = body.currency || "usd";
    const snapshotOnly = body.snapshotOnly === true;
    const message      = (body.message || "").trim();

    const { products, eurRate } = await loadPortfolioData(db);
    const effectiveCurrency     = currency === "eur" ? "eur" : "usd";
    const snapshot              = buildSnapshot(products, effectiveCurrency, eurRate);

    // Snapshot-only mode: no AI, just real-time data for gadget initial load
    if (snapshotOnly || !message) {
      const validProducts    = snapshot.filter(p => p.guest > 0);
      const avgRetailMargin  = validProducts.reduce((s, p) => s + (p.margin_retail || 0), 0) / Math.max(validProducts.length, 1);
      return {
        reply:     null,
        formatted: buildFinanceSummaryFormatted(snapshot, effectiveCurrency, ""),
        extras: {
          snapshot,
          eurRate,
          currency: effectiveCurrency,
          summary: { productCount: snapshot.length, avgRetailMargin: parseFloat(avgRetailMargin.toFixed(1)) },
        },
      };
    }

    // AI analysis
    const systemPrompt  = buildFinanceSystemPrompt(effectiveCurrency, eurRate);
    const contextPrompt = buildFinanceContext(products, effectiveCurrency, eurRate);
    const fullPrompt    = [contextPrompt, "", "USER QUESTION:", message].join("\n");

    const reply = await callGemini(
      [{ role: "user", parts: [{ text: fullPrompt }] }],
      systemPrompt, "gemini-2.0-flash", "text/plain", 1200
    );

    structuredLogger.info({ event: "finance_query", currency: effectiveCurrency, productCount: products.length });

    return {
      reply,
      formatted: buildFinanceSummaryFormatted(snapshot, effectiveCurrency, reply),
      extras: { snapshot, eurRate, currency: effectiveCurrency },
    };
  },

  // Graceful degradation: return snapshot without AI if Gemini fails
  fallback: async (ctx) => {
    try {
      const { body, db } = ctx;
      const currency = body.currency || "usd";
      const { products, eurRate } = await loadPortfolioData(db);
      const effectiveCurrency = currency === "eur" ? "eur" : "usd";
      const snapshot = buildSnapshot(products, effectiveCurrency, eurRate);
      return {
        reply:     "AI analysis temporarily unavailable — showing live data only.",
        formatted: buildFinanceSummaryFormatted(snapshot, effectiveCurrency, ""),
        extras:    { snapshot, eurRate, currency: effectiveCurrency, degraded: true },
      };
    } catch { return { reply: "Service temporarily unavailable." }; }
  },
});

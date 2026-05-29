"use strict";

const createAgent = require("../agents/createAgent");
const { callGemini, structuredLogger } = require("./ai_utils");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const AGENT_ID   = "catalog-builder-agent-001";
const AGENT_NAME = "AgentCatalogBuilder";

/**
 * AI Generation Handler: Builds catalog copywriting, section groupings, FAQs, and product rankings
 */
async function generateCatalogContent(ctx, body, dynamicConfig = {}) {
  const { goal, audience, products = [], protocols = [], territory = "US", language = "en", recipientName = "", clinicName = "" } = body;

  const prompt = `You are an elite B2B medical merchandising and commercial publishing assistant.
Generate a structured, highly persuasive, and clinically professional product catalog based on the parameters below.

CATALOG METADATA:
- Core Goal: ${goal}
- Target Audience: ${audience} (Tailor scientific depth and tone accordingly)
- Territory: ${territory}
- Language: ${language}
${recipientName ? `- Prepared specifically for: ${recipientName}` : ""}
${clinicName ? `- Clinic context: ${clinicName}` : ""}

AVAILABLE PRODUCTS:
${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, category: p.category, description: p.description })))}

AVAILABLE CLINICAL PROTOCOLS:
${JSON.stringify(protocols.map(p => ({ id: p.id, name: p.name, goal: p.goal, description: p.description })))}

TASK:
1. Formulate a compelling, premium hero section: title, subtitle, and introduction narrative.
3. Group the products into logical theme-based catalog sections. For each section, provide a title, description, and the list of matching product IDs. Do not limit the number of products; include ALL products that fit the goal.
4. Provide a professional clinical research disclaimer (e.g. "For research purposes only...").
5. Do NOT include ANY generic disclaimers in the JSON. The format must match perfectly.

Your response must be ONLY valid JSON matching this schema below. Do NOT wrap in markdown code blocks. Output raw JSON.

SCHEMA:
{
  "heroTitle": "Title text",
  "heroSubtitle": "Subtitle text",
  "heroDescription": "Introductory description text",
  "sections": [
    {
      "title": "Section Title",
      "description": "Section introduction",
      "products": ["product-id-1", "product-id-2"]
    }
  ],
  "disclaimer": "Clinical disclaimer text"
}`;

  try {
    structuredLogger.info({ event: "catalog_builder_gemini_start", goal, audience });
    const model = dynamicConfig.model || "gemini-2.5-flash";
    const systemInstruction = dynamicConfig.systemInstruction || "You are a structured clinical merchandising catalog generator. Output only raw JSON.";
    
    const raw = await callGemini(
      [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction,
      model, "application/json", 2048, "catalog_builder"
    );

    const jsonText = raw.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    return JSON.parse(jsonText);
  } catch (err) {
    structuredLogger.error({ event: "catalog_builder_gemini_error", error: err.message });
    throw err;
  }
}

/**
 * AI Catalog Search: Executes semantic matching within a specific catalog's products/protocols
 */
async function searchCatalog(ctx, body, dynamicConfig = {}) {
  const { query: searchQuery, catalogContext } = body;
  if (!searchQuery) return { results: [] };

  const prompt = `You are a clinical search agent. Search for matching products or protocols inside this specific catalog based on the user's natural language query.

USER QUERY: "${searchQuery}"

CATALOG CONTEXT:
${JSON.stringify(catalogContext)}

TASK:
Identify which product IDs or protocol IDs inside the catalog context match the user query's intent (e.g. searching "weight loss" should match GLP-1/Semaglutide products, "sleep" should match DSIP, etc.).

Return ONLY a valid JSON object matching the schema below. Output raw JSON.

SCHEMA:
{
  "matchedProductIds": ["prod-1"],
  "matchedProtocolIds": ["proto-1"],
  "relevanceExplanation": "Brief search matching rationale"
}`;

  try {
    const model = dynamicConfig.model || "gemini-2.0-flash";
    const raw = await callGemini(
      [{ role: "user", parts: [{ text: prompt }] }],
      "You are a structured search engine. Output only raw JSON.",
      model, "application/json", 512, "catalog_builder"
    );
    const jsonText = raw.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    return JSON.parse(jsonText);
  } catch (err) {
    structuredLogger.error({ event: "catalog_search_gemini_error", error: err.message });
    throw err;
  }
}

/**
 * AI Catalog Chat Assistant: Chatbot pre-loaded and locked to the catalog's products/scope
 */
async function assistantChat(ctx, body, dynamicConfig = {}) {
  const { message, catalogContext, history = [] } = body;

  const systemInstruction = `You are a clinical assistant chatbot for a private medical product catalog.
You MUST ONLY answer questions using the catalog context provided. Do NOT recommend or mention any products, compounds, or protocols that are not explicitly present in the catalog context.

CATALOG CONTEXT:
${JSON.stringify(catalogContext)}

If the user asks about a product not in the catalog, politely reply that it is not available in their assigned catalog and direct them to contact support.`;

  const contents = [
    ...history.map(h => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.text }]
    })),
    { role: "user", parts: [{ text: message }] }
  ];

  try {
    const model = dynamicConfig.model || "gemini-2.0-flash";
    const reply = await callGemini(
      contents,
      systemInstruction,
      model, "text/plain", 1024, "catalog_builder"
    );
    return { reply };
  } catch (err) {
    structuredLogger.error({ event: "catalog_assistant_gemini_error", error: err.message });
    throw err;
  }
}

/**
 * AI Catalog Build and Explain (NEW)
 * Creates a catalog based on a prompt, explains the strategy/margins, and saves it to Firestore.
 */
async function buildAndExplain(ctx, body, dynamicConfig = {}) {
  const { query: userPrompt, products = [], protocols = [], ownerId, ownerType } = body;
  
  // Create a structured product list with COGS for margin calculation
  const productContext = products.map(p => ({
    id: p.id,
    name: p.displayName || p.name,
    category: p.category,
    cost_cogs: p.pricing?.cogs || p.cogs || 15, // Real costs if available
    retail_price: p.pricing?.retail || p.retail || 100,
    goals: p.goals || [],
    equipment_included: p.equipmentIncluded || "Vial, bacteriostatic water, and sterile syringes"
  }));

  const prompt = `You are an elite B2B medical merchandising and commercial publishing AI.
The user wants to create a new B2B catalog. 

USER REQUEST: "${userPrompt}"

AVAILABLE PRODUCTS (Includes cost/COGS for margin calculations):
${JSON.stringify(productContext)}

AVAILABLE PROTOCOLS:
${JSON.stringify(protocols.map(p => ({ id: p.id, name: p.name, goal: p.goal })))}

TASK:
1. Select the most appropriate products and protocols that match the user request.
2. Determine the target audience (doctors, patients, or wholesalers).
3. Generate a catchy catalog title and a unique URL slug (lowercase, dashes only).
4. Act as an expert commercial and clinical advisor: generate a "formatted" response object compatible with our FormattedResponse UI component.
   - Include a "headline" for the message.
   - Add an "intro_card" section explaining the strategy.
   - Add a "product_card" section for each selected product, detailing clinical info, dosages, and prices.
   - End with a final instruction saying you have created the catalog and provide the final link formatted EXACTLY as: [Catalog Link](/catalog/{suggestedSlug})
5. Provide professional metadata to make the catalog look premium:
   - "heroTitle": A strong marketing title for the top of the page.
   - "heroSubtitle": A compelling clinical or business subtitle.
   - "heroDescription": A 2-3 sentence overview of why this catalog is valuable.
   - "faq": An array of 2-3 frequently asked questions and answers relevant to this specific catalog.
6. EXTREMELY IMPORTANT: You must populate "selectedProductIds" with the array of product IDs you have chosen. You must also populate "suggestedTitle" and "suggestedSlug". If you do not provide these, the system will fail.

Return ONLY a valid JSON object matching the schema below. Output raw JSON without markdown code blocks.

SCHEMA:
{
  "suggestedTitle": "String",
  "suggestedSlug": "String",
  "audience": "doctors|patients|wholesalers",
  "heroTitle": "String",
  "heroSubtitle": "String",
  "heroDescription": "String",
  "faq": [
    { "q": "Question here", "a": "Answer here" }
  ],
  "selectedProductIds": ["id1", "id2"],
  "selectedProtocolIds": ["id1"],
  "formatted": {
    "headline": "Catalog Strategy",
    "sections": [
      { "type": "intro_card", "text": "Detailed professional message explaining strategy, margins, and inclusions. Ending with [Catalog Link](/catalog/{suggestedSlug})" },
      { "type": "product_card", "name": "Product Name", "description": "Clinical details, dosages, and pricing.", "badge": "Core" }
    ]
  }
}`;

  try {
    const model = dynamicConfig.model || "gemini-2.5-flash";
    const raw = await callGemini(
      [{ role: "user", parts: [{ text: prompt }] }],
      "You are a structured clinical merchandising catalog generator. Output only raw JSON.",
      model, "application/json", 8192, "catalog_builder" // Increased tokens to 8192
    );

    const jsonText = raw.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    
    let result;
    try {
      result = JSON.parse(jsonText);
    } catch (parseErr) {
      structuredLogger.error({ event: "catalog_build_parse_error", error: parseErr.message, rawLength: raw.length, rawString: raw });
      throw new Error("Failed to parse AI response. " + parseErr.message);
    }

    // Save to Firestore
    const db = getFirestore();
    const newCatalogRef = db.collection("catalogs").doc();
    const catalogData = {
      id: newCatalogRef.id,
      ownerId: ownerId || "admin",
      ownerType: ownerType || "admin",
      status: "DRAFT", // Approved by user: initially DRAFT
      title: result.suggestedTitle,
      slug: result.suggestedSlug,
      audience: result.audience || "general",
      territory: "US",
      pricingVisible: false,
      pricingTier: null,
      heroTitle: result.heroTitle || result.suggestedTitle,
      heroSubtitle: result.heroSubtitle || "",
      heroDescription: result.heroDescription || "",
      faq: result.faq || [],
      upsells: [],
      crossSellRecommendations: [],
      disclaimer: "For educational and clinical research purposes only. This information has not been evaluated by the FDA.",
      branding: null,
      views: 0,
      leadCaptureCount: 0,
      goal: "custom", 
      sections: [
        {
          title: "Featured Selection",
          description: "Curated products and protocols based on AI recommendations.",
          products: result.selectedProductIds || [],
          protocols: result.selectedProtocolIds || []
        }
      ],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };
    
    await newCatalogRef.set(catalogData);

    return {
      reply: "Catalog built successfully.",
      formatted: result.formatted,
      catalogId: newCatalogRef.id,
      catalogSlug: result.suggestedSlug,
      catalogData: catalogData
    };

  } catch (err) {
    structuredLogger.error({ event: "catalog_build_gemini_error", error: err.message });
    throw err;
  }
}

module.exports = createAgent({
  agentId:         AGENT_ID,
  agentName:       AGENT_NAME,
  allowedRoles:    null, // Publicly accessible by guests and wholesalers alike
  model:           "gemini-2.5-flash",
  maxOutputTokens: 2048,
  timeout:         90,

  handler: async (ctx) => {
    const { body } = ctx;
    const mode = body.mode || "generate"; // "generate" | "search" | "chat"

    let dynamicConfig = {};
    try {
      const { getFirestore } = require("firebase-admin/firestore");
      const snap = await getFirestore().collection("ai_config").doc("agents").get();
      if (snap.exists && snap.data().catalog_builder) {
        dynamicConfig = snap.data().catalog_builder;
      }
    } catch (e) {
      // ignore
    }

    if (mode === "generate") {
      const generated = await generateCatalogContent(ctx, body, dynamicConfig);
      return {
        reply: `Catalog content generated for goal: ${body.goal || "custom"}.`,
        extras: { generated }
      };
    } else if (mode === "search") {
      const searchResult = await searchCatalog(ctx, body, dynamicConfig);
      return {
        reply: `Search complete for query: ${body.query}.`,
        extras: { searchResult }
      };
    } else if (mode === "chat") {
      const chatResult = await assistantChat(ctx, body, dynamicConfig);
      return {
        reply: chatResult.reply,
        extras: { chatResult }
      };
    } else if (mode === "build_and_explain") {
      const buildResult = await buildAndExplain(ctx, body, dynamicConfig);
      return {
        reply: buildResult.reply,
        extras: { 
          catalogId: buildResult.catalogId,
          catalogSlug: buildResult.catalogSlug,
          catalogData: buildResult.catalogData
        }
      };
    }

    throw new Error(`Unsupported mode: ${mode}`);
  },

  fallback: async () => ({
    reply: "Catalog Assistant is temporarily offline.",
    extras: {}
  })
});

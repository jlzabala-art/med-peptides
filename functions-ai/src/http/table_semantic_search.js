"use strict";

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { callGemini, ALL_SECRETS } = require("./ai_utils");

/**
 * tableSemanticSearch — Callable Firebase Function
 *
 * Takes a natural-language query and a serialized subset of table rows,
 * then uses Gemini to identify which rows semantically match the query.
 * Returns an array of matching row indices so the client can filter the DataTable.
 *
 * Called from: src/utils/DataTableSearchEngine.js (strategy: 'semantic')
 *
 * Input:
 *   data.query   {string}   - The user's natural language search query
 *   data.rows    {Array}    - The current page of rows from the table (max 200)
 *   data.keys    {Array}    - The column keys to include in the AI context (e.g. ['name', 'status'])
 *
 * Output:
 *   { matchingIndices: [0, 3, 7, ...] }
 */
exports.tableSemanticSearch = onCall(
  { secrets: ALL_SECRETS, timeoutSeconds: 30, memory: "256MiB" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be logged in to use semantic search.");
    }

    const { query, rows = [], keys = [] } = request.data;

    if (!query || !query.trim()) {
      throw new HttpsError("invalid-argument", "A non-empty query is required.");
    }

    if (!rows || rows.length === 0) {
      return { matchingIndices: [] };
    }

    // Limit to max 200 rows per call to control token usage
    const cappedRows = rows.slice(0, 200);

    // Build a compact text representation of each row, only including the specified keys
    const rowSummaries = cappedRows.map((row, idx) => {
      const relevantFields = keys.length > 0
        ? keys.reduce((acc, k) => { acc[k] = row[k]; return acc; }, {})
        : row;
      return `[${idx}] ${JSON.stringify(relevantFields)}`;
    }).join("\n");

    const prompt = `You are a search assistant filtering table rows for an admin interface.

USER QUERY: "${query}"

TABLE DATA (each row starts with its index in brackets):
${rowSummaries}

TASK: Identify which row indices semantically match the user's query. Consider:
- Exact and partial keyword matches
- Synonyms and related concepts (e.g. "client" matches "customer", "comprador")
- Abbreviations and common spellings (e.g. "US" matches "United States")
- Spanish/English language variations
- Status labels (e.g. "pending" matches "DRAFT", "awaiting")

Return ONLY a valid JSON object with this exact schema (no markdown, no explanation):
{"matchingIndices": [0, 2, 5]}

If no rows match, return: {"matchingIndices": []}`;

    try {
      const raw = await callGemini(
        [{ role: "user", parts: [{ text: prompt }] }],
        "You are a precise data filter. Output only raw JSON.",
        "gemini-2.0-flash",
        "text/plain",
        256
      );

      const jsonText = raw.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
      const result = JSON.parse(jsonText);

      if (!Array.isArray(result.matchingIndices)) {
        throw new Error("Gemini returned invalid structure.");
      }

      // Validate that all returned indices are within bounds
      const validIndices = result.matchingIndices.filter(
        (i) => typeof i === "number" && i >= 0 && i < cappedRows.length
      );

      return { matchingIndices: validIndices };

    } catch (err) {
      console.error("[tableSemanticSearch] Error:", err.message);
      // Graceful degradation: return empty so client can fall back to local search
      return { matchingIndices: [], error: err.message };
    }
  }
);

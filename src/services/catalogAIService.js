/**
 * catalogAIService.js
 *
 * Frontend service layer to communicate with the real backend-deployed Vertex AI/Gemini
 * Catalog Builder Agent (AgentCatalogBuilder).
 */

const BASE_URL = import.meta.env.VITE_FUNCTIONS_BASE_URL || 'https://europe-west1-atlas-health-app.cloudfunctions.net';

/**
 * Generate AI-optimized catalog copy, structure, sections, and marketing angles
 */
export async function generateCatalogContent({
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
    const response = await fetch(`${BASE_URL}/catalogAiAssistant`, {
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
    console.error('[catalogAIService:generate] Error:', error);
    throw error;
  }
}

/**
 * Query semantic catalog search (returns matched product and protocol IDs)
 */
export async function searchCatalogSemantic({
  query,
  catalogContext,
  authToken = null
}) {
  try {
    const response = await fetch(`${BASE_URL}/catalogAiAssistant`, {
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
    console.error('[catalogAIService:search] Error:', error);
    throw error;
  }
}

/**
 * Chat with the catalog-locked AI assistant
 */
export async function askCatalogAssistant({
  message,
  catalogContext,
  history = [],
  authToken = null
}) {
  try {
    const response = await fetch(`${BASE_URL}/catalogAiAssistant`, {
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
    console.error('[catalogAIService:chat] Error:', error);
    throw error;
  }
}

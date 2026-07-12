/**
 * catalogAIService.js
 *
 * Frontend service layer to communicate with the real backend-deployed Vertex AI/Gemini
 * Catalog Builder Agent (AgentCatalogBuilder).
 */

export {
  generateCatalogContentAction as generateCatalogContent,
  searchCatalogSemanticAction as searchCatalogSemantic,
  askCatalogAssistantAction as askCatalogAssistant
} from '../actions/aiActions';

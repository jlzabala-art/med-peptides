/**
 * AtlasCatalogAgent.js
 *
 * Client-safe AI catalog assistant.
 */

export const AtlasCatalogAgent = {
  /**
   * Generates a smart catalog draft from a list of products
   * @param {Array} products List of product objects
   * @returns {Object} JSON object with name, description, clinicalGoals, and categories
   */
  async generateCatalogDraft(products = []) {
    try {
      // Summarize products to save tokens
      const productSummary = products.map(p => ({
        name: p.name,
        category: p.category,
        goals: p.clinicalGoals || []
      }));

      const res = await fetch('/api/ai-generate-product-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'generate_catalog_draft',
          products: productSummary
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.draft) return data.draft;
      }
    } catch (error) {
      console.warn("AtlasCatalogAgent fallback:", error?.message);
    }

    // Default intelligent fallback
    const uniqueCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean))).slice(0, 4);
    const uniqueGoals = Array.from(new Set(products.flatMap(p => p.clinicalGoals || []).filter(Boolean))).slice(0, 3);
    
    return {
      name: products.length > 0 ? `${products[0].name || 'Medical'} Portfolio` : "Custom Medical Catalog",
      description: "Curated selection of high-grade therapeutic compounds and peptide formulations.",
      clinicalGoals: uniqueGoals.length > 0 ? uniqueGoals : ["Metabolic Health", "Longevity"],
      categories: uniqueCategories.length > 0 ? uniqueCategories : ["Peptides", "Clinical Supplies"]
    };
  }
};

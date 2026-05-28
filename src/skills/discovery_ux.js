// src/skills/discovery_ux.js
/**
 * Discovery UX helpers for the public‑facing side of Med‑Peptides.
 * All functions are pure and return data structures that can be directly
 * consumed by React components.
 */

/** Build the homepage hero layout data */
export function buildHomepageLayout({ topProducts, featuredGoals, stats }) {
  return {
    hero: {
      title: 'Optimize Your Health with Peptides & Supplements',
      subtitle: 'Precision protocols, AI‑driven recommendations',
      cta: { label: 'Explore Protocols', href: '/protocols' },
    },
    topProducts,
    featuredGoals,
    stats,
  };
}

/** Render a product detail view model */
export function buildProductDetail(product, recommendations = []) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    variants: product.variants,
    attributes: product.attributes,
    recommendations,
  };
}

/** Create a search modal model */
export function buildSearchModal({ query = '', results = [] }) {
  return { query, results };
}

/** Goal navigation data (e.g., "Increase Muscle Mass", "Anti‑Aging") */
export function buildGoalNavigator(goals) {
  return goals.map((g) => ({ label: g.title, value: g.id }));
}

/** Next‑step recommendation cards */
export function buildNextStepCards({ userProfile, recentActivity }) {
  const cards = [];
  if (userProfile?.goals?.length) {
    cards.push({
      title: 'Start a Protocol',
      description: `Based on your goal: ${userProfile.goals[0]}`,
      href: `/protocols?goal=${userProfile.goals[0]}`,
    });
  }
  if (recentActivity?.lastViewedProduct) {
    cards.push({
      title: 'You viewed a product',
      description: recentActivity.lastViewedProduct.name,
      href: `/product/${recentActivity.lastViewedProduct.id}`,
    });
  }
  return cards;
}

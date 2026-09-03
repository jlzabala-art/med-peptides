/**
 * useIvDrips.js — Hook de datos para el catálogo IV Drips
 */
import { useState, useEffect, useCallback } from 'react';
import { fetchIvVials, fetchIvIngredients, invalidateIvDripsCache } from '../repository/ivDripsRepository';

export function useIvDrips({ searchQuery = '', filterCategory = '', filterType = '' } = {}) {
  const [vials, setVials] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (force = false) => {
    try {
      setLoading(true);
      setError(null);
      const [v, ings] = await Promise.all([
        fetchIvVials({ forceRefresh: force }),
        fetchIvIngredients({ forceRefresh: force }),
      ]);
      setVials(v);
      setIngredients(ings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Mapa de ingredientes para lookup rápido
  const ingredientMap = Object.fromEntries(ingredients.map(i => [i.ingredient_id, i]));

  // Filtrado local
  const filtered = vials.filter(v => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      v.vial_id?.toLowerCase().includes(q) ||
      v.sku?.toLowerCase().includes(q) ||
      v.commercial_names?.some(n => n.toLowerCase().includes(q)) ||
      v.ingredients?.some(i => {
        const ing = ingredientMap[i.ingredient_id];
        return ing?.name?.toLowerCase().includes(q) || ing?.common_name?.toLowerCase().includes(q);
      }) ||
      v.categories?.some(c => c.toLowerCase().includes(q));

    const matchesCat  = !filterCategory || v.categories?.includes(filterCategory);
    const matchesType = !filterType     || v.type === filterType;
    return matchesSearch && matchesCat && matchesType;
  });

  // KPIs
  const kpis = {
    totalVials:        vials.length,
    totalPresentations: vials.reduce((acc, v) => acc + (v.commercial_names?.length || 0), 0),
    withOptionalAddons: vials.filter(v => v.optional_separate_vials?.length > 0).length,
    customVials:       vials.filter(v => v.type === 'customized').length,
    requiresReview:    vials.filter(v =>
      v.ingredients?.some(i => i.requires_review) ||
      v.optional_separate_vials?.some(o => o.requires_review)
    ).length,
    avgClinicPrice: vials.length
      ? Math.round(vials.reduce((a, v) => a + (v.pricing?.clinic_price_aed || 0), 0) / vials.length)
      : 0,
  };

  const categories = [...new Set(vials.flatMap(v => v.categories || []))].sort();

  return {
    vials: filtered,
    allVials: vials,
    ingredients,
    ingredientMap,
    loading,
    error,
    kpis,
    categories,
    refresh: () => { invalidateIvDripsCache(); load(true); },
  };
}

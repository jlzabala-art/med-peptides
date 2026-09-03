import { useCallback } from 'react';
import { updateProduct } from '../../../../repositories/productRepository';
import notifier from '../../../../services/NotificationService';
import { createVariantTimelineEntry } from '../../../../utils/variantTimelineHelper';

export function useCatalogItemMutations({ refresh, user } = {}) {
  const handleParentFieldUpdate = useCallback(async (row, field, value) => {
    try {
      const payload = { [field]: value };
      if (field === 'canonicalName') payload.name = value;
      if (field === 'category') {
        payload.categoryId = value;
        payload.category = value;
      }
      if (field === 'type' || field === 'productType') {
        payload.type = value;
        payload.productType = value;
      }
      
      const newVariants = [...(row.variants || [])].map(v => ({ ...v, [field]: value }));
      payload.variants = newVariants;
      
      await updateProduct(row.id, payload, { strict: false });
      notifier.success(`Updated ${field}`);
      refresh?.();
    } catch (e) {
      console.error(e);
      notifier.error(`Failed to update ${field}`);
      throw e;
    }
  }, [refresh]);

  const handleVariantFieldUpdate = useCallback(async (row, vIdx, field, value) => {
    try {
      const newVariants = [...(row.variants || [])];
      const prevVariant = newVariants[vIdx] || {};
      const prevVal = prevVariant[field];

      if (prevVal === value) return; // No change

      const timelineEntry = createVariantTimelineEntry({
        field,
        previousValue: prevVal,
        newValue: value,
        user
      });

      const existingTimeline = Array.isArray(prevVariant.timeline) 
        ? prevVariant.timeline 
        : (Array.isArray(prevVariant.history) ? prevVariant.history : []);

      const updatedTimeline = [timelineEntry, ...existingTimeline].slice(0, 50);

      newVariants[vIdx] = { 
        ...prevVariant, 
        [field]: value,
        timeline: updatedTimeline,
        updatedAt: new Date().toISOString()
      };
      
      await updateProduct(row.id, { variants: newVariants }, { strict: false });
      notifier.success(`Updated variant`);
      refresh?.();
    } catch (e) {
      console.error(e);
      notifier.error(`Failed to update variant`);
      throw e;
    }
  }, [refresh, user]);

  const handleAddVariant = useCallback(async (row) => {
    try {
      const newVariant = {
        isNew: true,
        weight: 'new',
        format: '',
        price: 0,
        status: 'draft',
        isActive: true,
        id: crypto.randomUUID(),
      };
      const updatedVariants = [...(row.variants || []), newVariant];
      await updateProduct(row.id, { variants: updatedVariants }, { strict: false });
      notifier.success('Borrador de variante añadido');
      refresh?.();
    } catch (error) {
      notifier.error('Error al añadir variante: ' + error.message);
    }
  }, [refresh]);

  const handleArchiveProduct = useCallback(async (row) => {
    notifier.confirmCritical(
      `¿Archivar producto "${row.canonicalName || row.name}"? Pasará a estado Archived y no será visible en pedidos activos.`,
      async () => {
        try {
          await updateProduct(row.id, { status: 'archived', isActive: false }, { strict: false });
          notifier.success(`"${row.canonicalName || row.name}" archivado con éxito.`);
          refresh?.();
        } catch (e) {
          notifier.error('Archive failed: ' + e.message);
        }
      }
    );
  }, [refresh]);

  return {
    handleParentFieldUpdate,
    handleVariantFieldUpdate,
    handleAddVariant,
    handleArchiveProduct,
  };
}

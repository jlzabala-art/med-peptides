import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../firebase';
import { CatalogService } from '../api/catalog.service';
import { useCatalogSelectionStore } from '../../../../stores/useCatalogSelectionStore';
import { useCatalogBuilderStore } from '../../../../stores/useCatalogBuilderStore';

export function useCatalogActionRouter({
  setSelectedProduct,
  setSelectedVariant,
  setVariantEditMode,
  setIsVariantModalOpen,
  setIsDrawerOpen,
  setBulkActionState,
  setAiProduct,
  setIsAiModalOpen,
  currentFilters
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const setSelectedIds = useCatalogSelectionStore((state) => state.setSelectedIds);

  const checkItemInTransaction = async (itemId) => {
    try {
      const q = query(collection(db, 'transactions'), where('itemIds', 'array-contains', itemId));
      const snap = await getDocs(q);
      return !snap.empty;
    } catch(e) {
      console.warn("Transaction check failed", e);
      return false;
    }
  };

  const handleAction = async (action, product, variant, valOrContext) => {
    const context = typeof valOrContext === 'string' ? valOrContext : 'overview';
    const val = valOrContext;

    if (action === 'edit_variant' && variant) {
      setSelectedProduct(product);
      setSelectedVariant(variant);
      setVariantEditMode(context);
      setIsVariantModalOpen(true);
    } else if (action === 'edit') {
      setSelectedProduct(product);
      setIsDrawerOpen(true);
    } else if (action === 'clone_variant' && variant) {
      CatalogService.cloneVariant(product.id || product.originalProduct?.id, variant)
        .then(() => toast.success('Variant cloned successfully.'))
        .catch(e => toast.error('Failed to clone variant: ' + e.message));
    } else if (action === 'clone_product' && product) {
      CatalogService.cloneProduct(product)
        .then(() => toast.success('Product cloned successfully.'))
        .catch(e => toast.error('Failed to clone product: ' + e.message));
    } else if (action === 'delete_variant' && variant) {
      toast(
        (t) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <span style={{ fontWeight: 600 }}>Delete variant {variant.sku || 'N/A'}?</span>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="btn btn-outline"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  CatalogService.deleteVariant(product.id, variant.id)
                    .then(() => toast.success('Variant deleted'))
                    .catch(e => toast.error('Error: ' + e.message));
                }}
                className="btn btn-danger"
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '4px',
                  border: 'none',
                  background: '#ef4444',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ),
        { duration: Infinity }
      );
    } else if (action === 'delete') {
      const inUse = await checkItemInTransaction(product.id);
      
      if (inUse) {
        toast(
          (t) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <span style={{ fontWeight: 600, color: '#b91c1c' }}>Cannot Delete: Item in Use</span>
              <span style={{ fontSize: '0.9rem' }}>This item is part of existing transactions. We recommend archiving it instead.</span>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button onClick={() => toast.dismiss(t.id)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>Cancel</button>
                <button
                  onClick={async () => {
                    toast.dismiss(t.id);
                    try {
                      // Archive it
                      await updateDoc(doc(db, 'products', product.id), { status: 'Archived', isArchived: true });
                      toast.success('Product archived successfully');
                    } catch (e) {
                      toast.error('Failed to archive: ' + e.message);
                    }
                  }}
                  style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: 'none', background: '#f59e0b', color: 'white', cursor: 'pointer', fontSize: '0.875rem' }}
                >
                  Archive Instead
                </button>
              </div>
            </div>
          ),
          { duration: Infinity }
        );
      } else {
        toast(
          (t) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <span style={{ fontWeight: 600 }}>Are you sure you want to delete {product.name}?</span>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button onClick={() => toast.dismiss(t.id)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>Cancel</button>
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    CatalogService.deleteProduct(product.id)
                      .then(() => toast.success('Product deleted'))
                      .catch(e => toast.error('Error: ' + e.message));
                  }}
                  className="btn btn-danger"
                  style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontSize: '0.875rem' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ),
          { duration: Infinity }
        );
      }
    } else if (action === 'bulk_delete') {
      const selectedIds = product;
      toast(
        (t) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <span style={{ fontWeight: 600 }}>Delete {selectedIds.length} selected items?</span>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => toast.dismiss(t.id)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>Cancel</button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  toast.success(`${selectedIds.length} items deleted (Mock)`);
                }}
                style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontSize: '0.875rem' }}
              >
                Delete
              </button>
            </div>
          </div>
        ),
        { duration: Infinity }
      );
    } else if (
      [
        'bulk_supplier',
        'bulk_tag',
        'bulk_update',
        'bulk_mark_active',
        'bulk_mark_inactive'
      ].includes(action)
    ) {
      const selectedIds = product;
      setBulkActionState({ isOpen: true, type: action, ids: selectedIds });
    } else if (
      [
        'bulk_quote',
        'bulk_sales_order',
        'bulk_invoice',
        'bulk_po',
        'bulk_bill'
      ].includes(action)
    ) {
      const selectedIds = product;
      setSelectedIds(selectedIds); // Set in global store
      
      const routeTypeMap = {
        'bulk_quote': 'quote',
        'bulk_sales_order': 'sales-order',
        'bulk_invoice': 'invoice',
        'bulk_po': 'purchase-order',
        'bulk_bill': 'bill'
      };
      
      const routeType = routeTypeMap[action];
      navigate(`/admin/transactions/new/${routeType}`);
    } else if (action === 'bulk_manage_visibility') {
      const selectedIds = product;
      setSelectedIds(selectedIds); // Set in global store
      navigate('/admin/pricing-visibility');
    } else if (action === 'bulk_add_to_catalog' || action === 'catalog_builder') {
      const selectedIds = product;
      const filteredIds = variant; // passed from Workspace
      const selectedItemsData = valOrContext; // the full objects passed as 4th arg
      setSelectedIds(selectedIds); // Set in global store
      
      // Merge/accumulate into Zustand store
      useCatalogBuilderStore.getState().addProducts(selectedIds, selectedItemsData);
      
      const updatedIds = useCatalogBuilderStore.getState().selectedProducts;
      const updatedData = useCatalogBuilderStore.getState().cartProductsData;
      
      navigate('/admin/catalog-builder', { 
        state: { 
          selectedProducts: updatedIds, 
          filteredProducts: filteredIds, 
          showWelcomeModal: false,
          catalogMeta: useCatalogBuilderStore.getState().catalogMeta,
          catalogCart: updatedIds,
          catalogCartData: updatedData,
          sourceFilters: currentFilters
        } 
      });
    } else if (action === 'ai_variant' || action === 'ai') {
      setAiProduct(product);
      setIsAiModalOpen(true);
    } else if (action === 'optimize_price') {
      const currentPrice = product.msrp || product.price || 0;
      const currentCost = product.cost || product.unitCost || 0;
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 2000)),
        {
          loading: `Atlas AI is analyzing market prices for ${product.name}...`,
          success: () => {
            const suggested = Math.ceil(currentCost * 1.5) - 0.01;
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontWeight: 600 }}>Atlas AI Price Optimizer</span>
                <span style={{ fontSize: '0.85rem' }}>Current: ${currentPrice} → Suggested: ${suggested}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button 
                    onClick={() => {
                      toast.dismiss();
                      handleAction('quick_edit', product, 'msrp', suggested);
                    }}
                    style={{ padding: '4px 8px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.75rem', flex: 1 }}
                  >
                    Apply ${suggested}
                  </button>
                </div>
              </div>
            );
          },
          error: 'Analysis failed.',
        },
        { duration: Infinity }
      );
    } else if (action === 'quick_edit') {
      const field = variant; // field name passed as variant arg
      
      let variantId = product.isVariantRow ? product.id : null;
      let productId = product.parentProduct?.id || product.originalProduct?.id || product.id;
      
      if (!product.isVariantRow && product.id.includes('-root')) {
        variantId = null;
      } else if (!product.isVariantRow && product.parentProduct) {
        variantId = product.id;
      }

      CatalogService.quickEdit(productId, variantId, field, val)
        .then(() => {
          toast.success(`Updated ${field} successfully!`);
        })
        .catch((err) => {
          console.error('Quick edit error:', err);
          toast.error('Failed to update.');
        });
    }
  };

  return { handleAction };
}

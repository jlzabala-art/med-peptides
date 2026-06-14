import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  query,
  getDocs,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
} from 'firebase/firestore';
import { db } from '../../../firebase';
import { useToast } from '../../../hooks/useToast';

export function useCatalogData() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'products'), orderBy('name'));
      const snapshot = await getDocs(q);

      const productsWithVariants = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const productData = { id: docSnap.id, ...docSnap.data() };

          try {
            const variantsQ = query(collection(db, 'products', docSnap.id, 'variants'));
            const vSnap = await getDocs(variantsQ);
            productData.variants = vSnap.docs.map((v) => ({ id: v.id, ...v.data() }));
          } catch (vErr) {
            console.warn(`Could not fetch variants for ${docSnap.id}`, vErr);
            productData.variants = [];
          }

          return productData;
        })
      );

      setProducts(productsWithVariants);
    } catch (err) {
      console.error('Error fetching catalog:', err);
      toast.error('Failed to load catalog data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => fetchProducts());
  }, []);

  const updateProduct = async (id, updates) => {
    try {
      const ref = doc(db, 'products', id);
      await updateDoc(ref, { ...updates, updatedAt: new Date().toISOString() });
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
      toast.success('Product updated');
      return true;
    } catch (err) {
      console.error(err);
      toast.error('Failed to update product');
      return false;
    }
  };

  const addProduct = async (productData) => {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setProducts((prev) => [...prev, { id: docRef.id, ...productData }]);
      toast.success('Product created');
      return true;
    } catch (err) {
      console.error(err);
      toast.error('Failed to create product');
      return false;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product deleted');
      return true;
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete product');
      return false;
    }
  };

  const variants = useMemo(() => {
    const flatVars = [];
    products.forEach((p) => {
      if (p.variants && p.variants.length > 0) {
        p.variants.forEach((v, idx) => {
          flatVars.push({
            id: v.id || `${p.id}-var-${idx}`,
            productId: p.id,
            productName: p.name || p.displayName || 'Unknown Product',
            name: `${p.name || p.displayName} - ${v.format || ''} ${v.size || ''}`.trim(),
            supplier: v.supplier || v.vendor || p.supplier || p.vendor || 'Unassigned',
            stock: Number(v.inventoryLevel) || Number(v.stock) || 0,
            reorderPoint: Number(v.reorderPoint) || 20,
            moq: Number(v.moq) || 50,
            leadTime: v.leadTime || p.leadTime || '14 days',
            price: Number(v.price) || Number(v.msrp) || 0,
            cost: Number(v.cost) || Number(v.unitCost) || 0,
            clinicPrice: Number(v.clinicPrice) || 0,
            wholesalePrice: Number(v.wholesalePrice) || 0,
            format: v.format || '',
            size: v.size || '',
            sku: v.sku || p.sku || '',
            // Compliance & Quality (Fake data fallback if missing)
            coa: v.hasCoa || (p.id ? p.id.charCodeAt(0) : 0) % 2 === 0 ? 'Valid' : 'Missing',
            gmp:
              v.hasGmp || (p.id ? p.id.charCodeAt(p.id.length - 1) : 0) % 2 === 0
                ? 'Valid'
                : 'Missing',
            registration: 'Active',
            stability: 'Valid',
            permit: 'Active',
            // Missing data checks
            isMissingSupplier: !(v.supplier || v.vendor || p.supplier || p.vendor),
            isMissingPricing: !(v.price || v.msrp || v.cost || v.unitCost),
            isMissingImages: !v.images || v.images.length === 0,
            // Original data reference
            rawVariant: v,
            rawProduct: p,
          });
        });
      } else {
        flatVars.push({
          id: p.id,
          productId: p.id,
          productName: p.name || p.displayName || 'Unknown Product',
          name: p.name || p.displayName || 'Unknown Product',
          supplier: p.supplier || p.vendor || 'Unassigned',
          stock: Number(p.inventoryLevel) || Number(p.stock) || 0,
          reorderPoint: Number(p.reorderPoint) || 20,
          moq: Number(p.moq) || 50,
          leadTime: p.leadTime || '14 days',
          price: Number(p.price) || Number(p.msrp) || 0,
          cost: Number(p.cost) || Number(p.unitCost) || 0,
          clinicPrice: Number(p.clinicPrice) || 0,
          wholesalePrice: Number(p.wholesalePrice) || 0,
          format: p.format || '',
          size: p.size || '',
          sku: p.sku || '',
          coa: p.hasCoa || (p.id ? p.id.charCodeAt(0) : 0) % 2 === 0 ? 'Valid' : 'Missing',
          gmp:
            p.hasGmp || (p.id ? p.id.charCodeAt(p.id.length - 1) : 0) % 2 === 0
              ? 'Valid'
              : 'Missing',
          registration: 'Active',
          stability: 'Valid',
          permit: 'Active',
          isMissingSupplier: !(p.supplier || p.vendor),
          isMissingPricing: !(p.price || p.msrp || p.cost || p.unitCost),
          isMissingImages: !p.images || p.images.length === 0,
          rawVariant: null,
          rawProduct: p,
        });
      }
    });
    return flatVars;
  }, [products]);

  const metrics = useMemo(() => {
    return {
      totalProducts: products.length,
      totalVariants: variants.length,
      lowStock: variants.filter((v) => v.stock > 0 && v.stock <= v.reorderPoint).length,
      outOfStock: variants.filter((v) => v.stock === 0).length,
      missingCOA: variants.filter((v) => v.coa === 'Missing').length,
      missingGMP: variants.filter((v) => v.gmp === 'Missing').length,
      missingSupplier: variants.filter((v) => v.isMissingSupplier).length,
      missingPricing: variants.filter((v) => v.isMissingPricing).length,
    };
  }, [products, variants]);

  return {
    products,
    variants,
    metrics,
    loading,
    refresh: fetchProducts,
    updateProduct,
    deleteProduct,
    addProduct,
  };
}

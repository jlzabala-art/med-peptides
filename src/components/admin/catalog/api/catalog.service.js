import { db } from '../../../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';

export const CatalogService = {
  /**
   * Clone a product variant.
   * @param {string} productId - ID of the parent product
   * @param {object} variant - The variant to clone
   */
  cloneVariant: async (productId, variant) => {
    const vRef = collection(db, 'products', productId, 'variants');
    const newVariantData = { 
      ...variant, 
      sku: variant.sku ? variant.sku + '-COPY' : 'NEW-COPY', 
      updatedAt: new Date().toISOString() 
    };
    delete newVariantData.id;
    return await addDoc(vRef, newVariantData);
  },

  /**
   * Clone an entire product without its variants.
   * @param {object} product - The product to clone
   */
  cloneProduct: async (product) => {
    const pRef = collection(db, 'products');
    const newProductData = { 
      ...product, 
      sku: product.sku ? product.sku + '-COPY' : 'NEW-COPY', 
      name: product.name ? product.name + ' (Copy)' : 'Copy', 
      updatedAt: new Date().toISOString() 
    };
    delete newProductData.id;
    delete newProductData.variants;
    return await addDoc(pRef, newProductData);
  },

  /**
   * Delete a product variant.
   * @param {string} productId - ID of the parent product
   * @param {string} variantId - ID of the variant
   */
  deleteVariant: async (productId, variantId) => {
    const ref = doc(db, 'products', productId, 'variants', variantId);
    return await deleteDoc(ref);
  },

  /**
   * Delete a product.
   * @param {string} productId - ID of the product
   */
  deleteProduct: async (productId) => {
    const ref = doc(db, 'products', productId);
    return await deleteDoc(ref);
  },

  /**
   * Quick edit a field on a product or variant.
   */
  quickEdit: async (productId, variantId, field, value) => {
    const updateData = {};
    if (field === 'cost') {
      updateData.cost = value;
      updateData.unitCost = value;
    } else if (field === 'msrp') {
      updateData.msrp = value;
      updateData.price = value;
    } else {
      updateData[field] = value;
    }

    if (variantId) {
      const vRef = doc(db, 'products', productId, 'variants', variantId);
      return await updateDoc(vRef, updateData);
    } else {
      const pRef = doc(db, 'products', productId);
      return await updateDoc(pRef, updateData);
    }
  }
};

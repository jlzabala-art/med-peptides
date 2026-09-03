import {
  createProduct as repoCreateProduct,
  createVariant as repoCreateVariant,
  updateProduct as repoUpdateProduct,
  updateVariant as repoUpdateVariant,
  deleteProduct as repoDeleteProduct,
  deleteVariant as repoDeleteVariant,
} from '../../../../repositories/productRepository';

export const CatalogService = {
  /**
   * Clone a product variant via Write Guard.
   * @param {string} productId - ID of the parent product
   * @param {object} variant - The variant to clone
   */
  cloneVariant: async (productId, variant) => {
    const newVariantData = { 
      ...variant, 
      sku: variant.sku ? variant.sku + '-COPY' : 'NEW-COPY', 
    };
    delete newVariantData.id;
    return await repoCreateVariant(productId, newVariantData);
  },

  /**
   * Clone an entire product without its variants via Write Guard.
   * @param {object} product - The product to clone
   */
  cloneProduct: async (product) => {
    const newProductData = { 
      ...product, 
      sku: product.sku ? product.sku + '-COPY' : 'NEW-COPY', 
      name: product.name ? product.name + ' (Copy)' : 'Copy', 
    };
    delete newProductData.id;
    delete newProductData.variants;
    return await repoCreateProduct(newProductData);
  },

  /**
   * Delete a product variant.
   * @param {string} productId - ID of the parent product
   * @param {string} variantId - ID of the variant
   */
  deleteVariant: async (productId, variantId) => {
    return await repoDeleteVariant(productId, variantId);
  },

  /**
   * Delete a product.
   * @param {string} productId - ID of the product
   */
  deleteProduct: async (productId) => {
    return await repoDeleteProduct(productId);
  },

  /**
   * Quick edit a field on a product or variant via Write Guard.
   * Maps legacy field names to canonical schema fields.
   */
  quickEdit: async (productId, variantId, field, value) => {
    const updateData = {};
    if (field === 'cost') {
      // Map to structured pricing: master tier perUnit
      updateData['pricing.master.perUnit'] = value;
    } else if (field === 'msrp') {
      // Map to structured pricing: retail tier perUnit
      updateData['pricing.retail.perUnit'] = value;
    } else {
      updateData[field] = value;
    }

    if (variantId) {
      return await repoUpdateVariant(productId, variantId, updateData);
    } else {
      return await repoUpdateProduct(productId, updateData);
    }
  }
};

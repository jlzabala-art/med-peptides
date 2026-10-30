/**
 * ShopifyClient.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mediluxe Health Solutions · Official Shopify Admin GraphQL Client.
 * Connects Atlas Health directly with mediluxegulf.com using private server-side
 * authentication, resilient rate-limiting, and error normalization.
 */

import { adminDb } from '@/lib/firebaseAdmin';

export class ShopifyClient {
  constructor(config = {}) {
    this.storeDomain = config.storeDomain || process.env.SHOPIFY_STORE_DOMAIN || 'mediluxegulf.myshopify.com';
    this.accessToken = config.accessToken || process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '';
    this.apiVersion = config.apiVersion || process.env.SHOPIFY_API_VERSION || '2025-01';

    // Normalize domain
    if (this.storeDomain.startsWith('http://') || this.storeDomain.startsWith('https://')) {
      try {
        const u = new URL(this.storeDomain);
        this.storeDomain = u.host;
      } catch {
        // keep as is
      }
    }
  }

  async resolveToken() {
    if (this.accessToken && this.accessToken.trim().length > 10) {
      return this.accessToken;
    }
    // Fallback: check Firestore app_settings
    try {
      const snap = await adminDb.collection('app_settings').doc('shopify_integration').get();
      if (snap.exists && snap.data()?.accessToken) {
        this.accessToken = snap.data().accessToken;
        return this.accessToken;
      }
    } catch (e) {
      // ignore
    }
    return null;
  }

  isConfigured() {
    return Boolean(this.accessToken && this.accessToken.trim().length > 10);
  }

  getEndpoint() {
    return `https://${this.storeDomain}/admin/api/${this.apiVersion}/graphql.json`;
  }

  /**
   * Core GraphQL Executor with rate-limit and error handling
   */
  async graphql(query, variables = {}) {
    await this.resolveToken();

    if (!this.isConfigured()) {
      return {
        data: null,
        errors: [{ message: 'Shopify Admin API token is not configured.' }],
        isSimulated: true
      };
    }

    const endpoint = this.getEndpoint();
    const headers = {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': this.accessToken
    };

    let retries = 3;
    let delay = 1000;

    while (retries > 0) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({ query, variables })
        });

        // Handle rate limiting (HTTP 429)
        if (res.status === 429) {
          const retryAfter = res.headers.get('Retry-After');
          const waitTime = retryAfter ? parseFloat(retryAfter) * 1000 : delay;
          console.warn(`[ShopifyClient] Rate limited (429). Retrying after ${waitTime}ms...`);
          await new Promise(r => setTimeout(r, waitTime));
          retries--;
          delay *= 2;
          continue;
        }

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Shopify API HTTP Error ${res.status}: ${errText}`);
        }

        const json = await res.json();
        return json;
      } catch (err) {
        retries--;
        if (retries === 0) {
          console.error('[ShopifyClient.graphql] Exhausted retries:', err);
          return {
            data: null,
            errors: [{ message: err.message || 'Network error communicating with Shopify' }]
          };
        }
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
      }
    }
  }

  /**
   * Ping / Health check to test store connectivity and retrieve store metadata
   */
  async ping() {
    await this.resolveToken();

    if (!this.isConfigured()) {
      return {
        connected: false,
        storeDomain: this.storeDomain,
        publicDomain: 'mediluxegulf.com',
        currency: 'AED',
        reason: 'Credentials pending in environment (SHOPIFY_ADMIN_ACCESS_TOKEN). Running in staging simulation mode.',
        isSimulated: true
      };
    }

    const query = `
      query GetShopInfo {
        shop {
          id
          name
          email
          currencyCode
          primaryDomain {
            url
            host
          }
          plan {
            displayName
          }
        }
      }
    `;

    const res = await this.graphql(query);
    if (res.errors || !res.data?.shop) {
      return {
        connected: false,
        storeDomain: this.storeDomain,
        publicDomain: 'mediluxegulf.com',
        errors: res.errors,
        reason: res.errors?.[0]?.message || 'Failed to authenticate with Shopify store'
      };
    }

    return {
      connected: true,
      storeDomain: this.storeDomain,
      publicDomain: res.data.shop.primaryDomain?.host || 'mediluxegulf.com',
      shopName: res.data.shop.name,
      currency: res.data.shop.currencyCode || 'AED',
      plan: res.data.shop.plan?.displayName || 'Active'
    };
  }

  /**
   * Query existing products on Shopify to avoid duplicate creations
   */
  async getProducts({ limit = 20, queryStr = '' } = {}) {
    if (!this.isConfigured()) {
      return {
        products: [],
        totalCount: 0,
        isSimulated: true
      };
    }

    const query = `
      query GetProducts($limit: Int!, $queryStr: String) {
        products(first: $limit, query: $queryStr, sortKey: UPDATED_AT, reverse: true) {
          edges {
            node {
              id
              title
              handle
              status
              vendor
              productType
              tags
              featuredImage {
                url
                altText
              }
              variants(first: 5) {
                edges {
                  node {
                    id
                    title
                    sku
                    price
                    inventoryQuantity
                  }
                }
              }
            }
          }
        }
      }
    `;

    const res = await this.graphql(query, { limit, queryStr });
    const edges = res.data?.products?.edges || [];
    const products = edges.map(e => {
      const node = e.node;
      const variants = (node.variants?.edges || []).map(ve => ve.node);
      return {
        id: node.id,
        title: node.title,
        handle: node.handle,
        status: node.status,
        vendor: node.vendor,
        productType: node.productType,
        tags: node.tags || [],
        imageUrl: node.featuredImage?.url || null,
        variants,
        sku: variants[0]?.sku || '',
        price: variants[0]?.price || '0.00'
      };
    });

    return {
      products,
      totalCount: products.length,
      errors: res.errors
    };
  }

  /**
   * Create a Draft product in Shopify
   */
  async createProduct(productInput) {
    const mutation = `
      mutation CreateProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  sku
                  price
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    return await this.graphql(mutation, { input: productInput });
  }

  /**
   * Update an existing product in Shopify
   */
  async updateProduct(productInput) {
    const mutation = `
      mutation UpdateProduct($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  sku
                  price
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    return await this.graphql(mutation, { input: productInput });
  }

  /**
   * Retrieve available Shopify collections
   */
  async getCollections({ limit = 30 } = {}) {
    if (!this.isConfigured()) {
      return {
        collections: [
          { id: 'gid://shopify/Collection/mock-1', title: 'Hair & Scalp Treatments', handle: 'hair-scalp' },
          { id: 'gid://shopify/Collection/mock-2', title: 'Daily Longevity & Antioxidants', handle: 'longevity' },
          { id: 'gid://shopify/Collection/mock-3', title: 'Metabolic & Weight Management', handle: 'weight-management' }
        ],
        isSimulated: true
      };
    }

    const query = `
      query GetCollections($limit: Int!) {
        collections(first: $limit) {
          edges {
            node {
              id
              title
              handle
              productsCount {
                count
              }
            }
          }
        }
      }
    `;

    const res = await this.graphql(query, { limit });
    const collections = (res.data?.collections?.edges || []).map(e => ({
      id: e.node.id,
      title: e.node.title,
      handle: e.node.handle,
      productsCount: e.node.productsCount?.count || 0
    }));

    return {
      collections,
      errors: res.errors
    };
  }
}

// Export singleton instance
export const shopifyClient = new ShopifyClient();


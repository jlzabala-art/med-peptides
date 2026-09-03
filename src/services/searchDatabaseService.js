import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import * as fb from '../firebase';
import { searchClient } from './algolia/client';
import { algoliaConfig } from './algolia/config';
const db = fb?.db;

/**
 * Capitalizes the first letter of a string to help with Firestore's case-sensitive queries.
 */
const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Fallback: Perform a prefix search on a specific collection and field using Firestore.
 */
const searchCollectionFirestore = async (collectionName, fieldName, searchText, resultType, pathPrefix, iconName) => {
  if (!searchText || searchText.length < 2) return [];

  const capText = capitalize(searchText);
  
  try {
    const isProduct = collectionName === 'products';
    let snapshot;
    let localFiltered = [];
    
    if (isProduct) {
      // For products, fetch up to 300 active/published items to allow flexible case-insensitive search
      // since Firestore doesn't support it natively.
      const q = query(
        collection(db, collectionName),
        where('status', '==', 'active'),
        limit(300)
      );
      snapshot = await getDocs(q);
      const lowerSearch = searchText.toLowerCase();
      snapshot.forEach(doc => {
        const data = doc.data();
        const name = (data.name || '').toLowerCase();
        if (name.includes(lowerSearch)) {
          localFiltered.push({ id: doc.id, ...data });
        }
      });
      // Limit to 5 results after filtering
      localFiltered = localFiltered.slice(0, 5);
    } else {
      const q = query(
        collection(db, collectionName),
        where(fieldName, '>=', capText),
        where(fieldName, '<=', capText + '\uf8ff'),
        limit(5)
      );
      snapshot = await getDocs(q);
      snapshot.forEach(doc => {
        localFiltered.push({ id: doc.id, ...doc.data() });
      });
    }
    
    const results = [];
    
    localFiltered.forEach((data) => {
      let pendingAction = null;
      if (resultType === 'User/Patient') {
          pendingAction = Math.random() > 0.5 ? 'Pending Review' : 'Needs Signature';
      } else if (resultType === 'Protocol') {
          pendingAction = Math.random() > 0.7 ? 'Approval Required' : null;
      } else if (resultType === 'Product') {
          pendingAction = Math.random() > 0.8 ? 'Low Stock' : null;
      }

      results.push({
        id: `db-${collectionName}-${data.id}`,
        title: data[fieldName] || data.name || data.email || 'Unknown',
        description: data.description || data.role || data.email || `${resultType} record`,
        category: resultType,
        path: `${pathPrefix}/${data.id}`,
        iconName: iconName,
        isDynamic: true,
        pendingAction: pendingAction
      });
    });
    
    return results;
  } catch (error) {
    console.error(`Error searching ${collectionName}:`, error);
    return [];
  }
};

/**
 * Algolia Search Implementation. 
 * Performs parallel multi-index queries extremely fast.
 */
const performAlgoliaSearch = async (searchText, activeRole) => {
  if (!searchText || searchText.length < 2) return [];

  const requests = [];

  // Search Protocols
  if (['admin', 'clinic', 'doctor'].includes(activeRole)) {
    requests.push({
      indexName: 'protocols',
      query: searchText,
      hitsPerPage: 5
    });
  }

  // Search Products (All roles can search products)
  const isB2C = ['guest', 'retail', 'patient'].includes(activeRole);
  requests.push({
    indexName: algoliaConfig.indices.products || 'products',
    query: searchText,
    hitsPerPage: 5,
    filters: isB2C ? 'status:published' : ''
  });

  // Search Blog Posts (All roles)
  requests.push({
    indexName: 'blogPosts',
    query: searchText,
    hitsPerPage: 3
  });

  // Search Users
  if (activeRole === 'admin') {
    requests.push({
      indexName: 'users',
      query: searchText,
      hitsPerPage: 5
    });
  }

  if (requests.length === 0) return [];

  try {
    const response = await searchClient.search({ requests });
    const results = [];

    response.results.forEach((res, i) => {
      const req = requests[i];
      const hits = res.hits || [];
      
      hits.forEach(hit => {
        let resultType, pathPrefix, iconName;
        
        if (req.indexName === 'protocols') {
          resultType = 'Protocol';
          pathPrefix = '/protocol';
          iconName = 'flask';
        } else if (req.indexName.includes('products')) {
          resultType = 'Product';
          pathPrefix = activeRole === 'retail' || activeRole === 'patient' 
            ? `/collection/all` 
            : '/admin?s=operations&t=products&id=';
          iconName = 'package';
        } else if (req.indexName === 'users') {
          resultType = 'User/Patient';
          pathPrefix = '/admin/patient';
          iconName = 'user';
        } else if (req.indexName === 'blogPosts') {
          resultType = 'Article';
          pathPrefix = '/blog';
          iconName = 'book-open';
        }

        // For B2C, the product slug might be better than the objectID, but we'll use objectID and the routing will handle it or we append it.
        const finalPath = pathPrefix.includes('?') 
          ? `${pathPrefix}${hit.objectID}` 
          : `${pathPrefix}/${hit.objectID}`;

        results.push({
          id: `alg-${req.indexName}-${hit.objectID}`,
          title: hit.title || hit.name || hit.firstName || hit.email || 'Unknown',
          description: hit.description || hit.role || hit.email || `${resultType} record`,
          category: resultType,
          path: finalPath,
          iconName: iconName,
          isDynamic: true,
          pendingAction: null
        });
      });
    });

    return results;
  } catch (err) {
    console.warn('Algolia multi-index search failed, suppressed to avoid Next.js overlay:', err.message || err);
    throw err; // throw to fallback to Firestore
  }
};

/**
 * Omnibar Search: Searches statically and dynamically across multiple collections.
 */
export const performDatabaseSearch = async (searchText, activeRole) => {
  if (!searchText || searchText.length < 2) return [];

  // 1. Try Algolia if configured
  if (searchClient) {
    try {
      const results = await performAlgoliaSearch(searchText, activeRole);
      return results;
    } catch (err) {
      console.warn('Falling back to Firestore search due to Algolia error.');
    }
  }

  // 2. Fallback to Firestore
  const promises = [];

  if (['admin', 'clinic', 'doctor'].includes(activeRole)) {
    promises.push(searchCollectionFirestore('protocols', 'name', searchText, 'Protocol', '/protocol', 'flask'));
  }

  // All roles can search products. Fallback does not support complex where + prefix filters natively
  // without composite indexes, so we just do prefix on name. B2C should ideally hit Algolia.
  const productPathPrefix = ['retail', 'patient', 'guest'].includes(activeRole)
    ? '/collection/all'
    : '/admin?s=operations&t=products&id=';
  promises.push(searchCollectionFirestore('products', 'name', searchText, 'Product', productPathPrefix, 'package'));

  // Search Blog Posts
  promises.push(searchCollectionFirestore('blogPosts', 'title', searchText, 'Article', '/blog', 'book-open'));

  if (activeRole === 'admin') {
    promises.push(searchCollectionFirestore('users', 'firstName', searchText, 'User/Patient', '/admin/patient', 'user'));
  }

  const resultsArray = await Promise.all(promises);
  return resultsArray.flat();
};

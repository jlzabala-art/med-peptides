import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Capitalizes the first letter of a string to help with Firestore's case-sensitive queries.
 */
const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Perform a prefix search on a specific collection and field.
 */
const searchCollection = async (collectionName, fieldName, searchText, resultType, pathPrefix, iconName) => {
  if (!searchText || searchText.length < 2) return [];

  // Try both exact match and capitalized (since Firestore is case-sensitive)
  const capText = capitalize(searchText);
  
  try {
    const q = query(
      collection(db, collectionName),
      where(fieldName, '>=', capText),
      where(fieldName, '<=', capText + '\uf8ff'),
      limit(5)
    );
    
    const snapshot = await getDocs(q);
    const results = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Simular "acciones pendientes" según el tipo de entidad (lógica mockeada hasta conectar backend de ClinicAI)
      let pendingAction = null;
      if (resultType === 'User/Patient') {
          pendingAction = Math.random() > 0.5 ? 'Pending Review' : 'Needs Signature';
      } else if (resultType === 'Protocol') {
          pendingAction = Math.random() > 0.7 ? 'Approval Required' : null;
      } else if (resultType === 'Product') {
          pendingAction = Math.random() > 0.8 ? 'Low Stock' : null;
      }

      results.push({
        id: `db-${collectionName}-${doc.id}`,
        title: data[fieldName] || data.name || data.email || 'Unknown',
        description: data.description || data.role || data.email || `${resultType} record`,
        category: resultType,
        path: `${pathPrefix}/${doc.id}`,
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
 * Omnibar Search: Searches statically and dynamically across multiple collections.
 */
export const performDatabaseSearch = async (searchText, activeRole) => {
  if (!searchText || searchText.length < 2) return [];

  const promises = [];

  // Search Protocols (Accessible to Admin, Clinic, Doctor)
  if (['admin', 'clinic', 'doctor'].includes(activeRole)) {
    promises.push(searchCollection('protocols', 'name', searchText, 'Protocol', '/protocol', 'flask'));
  }

  // Search Products (Accessible to Admin, Wholesaler)
  if (['admin', 'wholesaler'].includes(activeRole)) {
    promises.push(searchCollection('products', 'name', searchText, 'Product', '/admin?s=operations&t=products&id=', 'package'));
  }

  // Search Users / Patients (Admins can search anyone)
  if (activeRole === 'admin') {
    // We search by email or firstName as an approximation
    promises.push(searchCollection('users', 'firstName', searchText, 'User/Patient', '/admin/patient', 'user'));
  }

  // Wait for all database queries to finish
  const resultsArray = await Promise.all(promises);
  
  // Flatten the array of arrays
  return resultsArray.flat();
};

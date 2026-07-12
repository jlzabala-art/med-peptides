import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import * as fb from '../../firebase';
const db = fb?.db;
import { useAuth } from '../context/AuthContext';

/**
 * Hook unificado para obtener el catálogo de productos y aplicar 
 * reglas de negocio (precios dinámicos por rol).
 * 
 * Roles soportados:
 * - admin: acceso a todo, vista B2B por defecto pero puede ver retail.
 * - wholesaler/supplier: Tier 1 pricing.
 * - doctor: Tier 2 pricing (B2B).
 * - patient/ninguno: Retail pricing (B2C).
 */
export default function useProductCatalog(options = {}) {
  const { user, userProfile } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    category = null,
    limitCount = 50,
    search = ''
  } = options;

  const role = userProfile?.role || 'guest';
  const isAdmin = role === 'admin';

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchProducts = async () => {
      try {
        const colRef = collection(db, 'products');
        const constraints = [];

        // Si no es admin, solo traer activos
        if (!isAdmin) {
          constraints.push(where('isActive', '==', true));
        }

        if (category) {
          constraints.push(where('category', '==', category));
        }

        constraints.push(limit(limitCount));

        const q = query(colRef, ...constraints);
        const snap = await getDocs(q);

        let results = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Búsqueda simple en cliente si hay search (asumiendo que Algolia no está disponible)
        if (search) {
          const lowerSearch = search.toLowerCase();
          results = results.filter(p => 
            p.title?.toLowerCase().includes(lowerSearch) || 
            p.description?.toLowerCase().includes(lowerSearch)
          );
        }

        // --- APLICAR REGLAS DE NEGOCIO (PRECIOS) ---
        const computedProducts = results.map(product => {
          let displayPrice = product.price || 0;
          let tier = 'retail';

          if (isAdmin) {
            // Admin ve todos los precios, exponemos tier1 y tier2
            displayPrice = product.price;
            tier = 'admin_view';
          } else if (role === 'wholesaler' || role === 'supplier') {
            displayPrice = product.tier1Price || product.price;
            tier = 'tier1';
          } else if (role === 'doctor' || role === 'clinic') {
            displayPrice = product.tier2Price || product.price;
            tier = 'tier2';
          }

          return {
            ...product,
            displayPrice,
            pricingTier: tier,
            // Bloqueos específicos: algunos péptidos son Rx Only
            requiresPrescription: product.isRxOnly || false
          };
        });

        if (isMounted) {
          setProducts(computedProducts);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching catalog:', err);
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [category, limitCount, search, role, isAdmin]);

  return { products, loading, error, role, isAdmin };
}

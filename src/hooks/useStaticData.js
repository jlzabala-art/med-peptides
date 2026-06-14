import { useQuery } from '@tanstack/react-query';

export function useStaticData() {
  const { data: products = [] } = useQuery({
    queryKey: ['staticProducts'],
    queryFn: async () => {
      try {
        const res = await fetch('/data/products.json');
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data.products) ? data.products : [];
      } catch (err) {
        return [];
      }
    },
    staleTime: Infinity
  });

  const { data: supplements = [] } = useQuery({
    queryKey: ['staticSupplements'],
    queryFn: async () => {
      try {
        const res = await fetch('/data/supplements.json');
        if (!res.ok) return [];
        return await res.json();
      } catch (err) {
        return [];
      }
    },
    staleTime: Infinity
  });

  const { data: productCategories = [] } = useQuery({
    queryKey: ['staticProductCategories'],
    queryFn: async () => {
      try {
        const res = await fetch('/data/products.json');
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data.productCategories) ? data.productCategories : [];
      } catch (err) {
        return [];
      }
    },
    staleTime: Infinity
  });

  return { products, supplements, productCategories };
}

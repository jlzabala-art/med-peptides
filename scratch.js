const initialProducts = [];
const globalMetrics = null;
const options = {
  initialData: initialProducts ? { items: initialProducts, kpis: globalMetrics } : undefined
};

console.log(options.initialData);
const initialData = options.initialData ? {
  pages: [options.initialData],
  pageParams: [0]
} : undefined;
console.log(initialData);

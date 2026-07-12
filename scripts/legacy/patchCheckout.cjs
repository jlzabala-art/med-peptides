const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/templates/Checkout.jsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Import useB2CPricing
content = content.replace(
  "import { resolveVariantPrice } from '../utils/resolvePrice';",
  "import { resolveVariantPrice } from '../utils/resolvePrice';\nimport { useB2CPricing } from '../hooks/checkout/useB2CPricing';"
);

// 2. Add useB2CPricing logic before enrichedCartItems
content = content.replace(
  "  const cartItems = Object.entries(cart);",
  `  const cartItems = Object.entries(cart);
  
  // Format cart items for the useB2CPricing hook
  const cartItemEntries = useMemo(() => {
    return cartItems.map(([itemKey, qty]) => {
      const meta = cartMetadata[itemKey] || {};
      return {
        id: meta.productId || itemKey,
        quantity: qty,
        type: meta.isProtocol || meta.protocolId ? 'protocol' : 'product',
        name: meta.protocolName || meta.productName || itemKey,
        products: meta.products || [],
      };
    });
  }, [cartItems, cartMetadata]);
  
  const { b2cTotals, isPricingLoading, pricingError } = useB2CPricing(!isProfessional ? cartItemEntries : []);
`
);

// 3. Update resolveItem to use B2C price
content = content.replace(
  "    const product = products.find(p => p.name === namePart);",
  `    const product = products.find(p => p.name === namePart);
    if (!isProfessional && b2cTotals.items.length > 0) {
       // Lookup B2C item
       const b2cItem = b2cTotals.items.find(i => i.name === namePart || i.id === itemKey);
       if (b2cItem) {
          return { itemKey, qty, namePart, dosagePart, unitPrice: b2cItem.price, lineTotal: b2cItem.price * qty };
       }
    }`
);

// 4. Update checkoutTotals logic for B2C
content = content.replace(
  "  const checkoutTotals = useMemo(() => {",
  `  const checkoutTotals = useMemo(() => {
    if (!isProfessional) {
      const shippingCost = shippingCosts[selectedShipping] ?? 40;
      const subtotal = b2cTotals.subtotal || 0;
      const total = subtotal + shippingCost;
      const fmt = v => v.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.');
      return { 
        display: \`$\${fmt(total.toFixed(0))}\`, 
        subtotal, 
        shippingCost, 
        subtext: null
      };
    }`
);

// 5. Update checkout submit to tag order
content = content.replace(
  "      await addDoc(collection(db, 'orders'), {",
  `      await addDoc(collection(db, 'orders'), {
        source: isProfessional ? 'b2b_portal' : 'b2c_home',
        customerType: isProfessional ? 'professional' : 'retail',`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Checkout.jsx patched successfully');

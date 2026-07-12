const fs = require('fs');
const file = 'src/templates/Checkout.jsx';
let content = fs.readFileSync(file, 'utf8');

const importStatement = "import { useOrderSubmit } from '../hooks/shared/useOrderSubmit';\n";
content = content.replace("import { useCheckoutState } from '../hooks/checkout/useCheckoutState';", "import { useCheckoutState } from '../hooks/checkout/useCheckoutState';\n" + importStatement);

let lines = content.split('\n');

const replacement = `  const { submitOrder, generateOrderId } = useOrderSubmit({
    user,
    register,
    updateProfileData,
    activeRegion,
    cartOwnership,
    isProfessional,
    pricingTier,
    pricingRole,
    shippingCosts,
    products
  });

  const handleSubmit = async e => {
    e.preventDefault();
    await submitOrder({
      formData,
      enrichedCartItems,
      cartMetadata,
      protocolGroups,
      checkoutTotals,
      selectedShipping,
      prescriptionFile,
      prescriptionName,
      prescriptionSpecs,
      stateControls: {
        setIsSubmitting,
        setShowLogin,
        setInlineError,
        setOrderId,
        setFinalOrderData,
        setIsDone,
        onComplete
      }
    });
  };
`;

// Find the line that starts with "  const handleSubmit = async e => {"
const startIndex = lines.findIndex(l => l.includes('const handleSubmit = async e => {'));
const endIndex = lines.findIndex((l, idx) => idx > startIndex && l === '  };');

if (startIndex !== -1 && endIndex !== -1) {
  lines.splice(startIndex, endIndex - startIndex + 1, replacement);
  fs.writeFileSync(file, lines.join('\n'));
  console.log("handleSubmit patched.");
} else {
  console.log("Could not find start/end lines.", startIndex, endIndex);
}

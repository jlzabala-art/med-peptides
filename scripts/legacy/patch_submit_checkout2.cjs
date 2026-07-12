const fs = require('fs');
const file = 'src/templates/Checkout.jsx';
let content = fs.readFileSync(file, 'utf8');

const importStatement = "import { useOrderSubmit } from '../hooks/shared/useOrderSubmit';\n";
content = content.replace("import { useCheckoutState } from '../hooks/checkout/useCheckoutState';", "import { useCheckoutState } from '../hooks/checkout/useCheckoutState';\n" + importStatement);

const submitStart = "  const handleSubmit = async e => {";
const submitEnd = "      setIsSubmitting(false);\n    }\n  };";

const startIndex = content.indexOf(submitStart);
let endIndex = content.indexOf(submitEnd);

if (startIndex !== -1 && endIndex !== -1) {
  endIndex += submitEnd.length;
  const replacement = `  const { submitOrder } = useOrderSubmit({
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
        setIsDone: () => {}, // Not used directly here since we have step logic
        onComplete
      }
    });
  };`;

  content = content.slice(0, startIndex) + replacement + content.slice(endIndex);
  
  fs.writeFileSync(file, content);
  console.log("handleSubmit patched.");
} else {
  console.log("Could not find handleSubmit block.", startIndex, endIndex);
}

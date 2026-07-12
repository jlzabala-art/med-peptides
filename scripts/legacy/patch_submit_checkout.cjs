const fs = require('fs');
const file = 'src/templates/Checkout.jsx';
let content = fs.readFileSync(file, 'utf8');

const importStatement = "import { useOrderSubmit } from '../hooks/shared/useOrderSubmit';\n";
content = content.replace("import { useCheckoutState } from '../hooks/checkout/useCheckoutState';", "import { useCheckoutState } from '../hooks/checkout/useCheckoutState';\n" + importStatement);

const submitStart = "  const handleSubmit = async e => {";
const submitEnd = "    if (onComplete) onComplete();\n\n    } catch (err) {\n      console.error(err);\n      setInlineError(err.message || 'An error occurred while confirming your request.');\n    } finally {\n      setIsSubmitting(false);\n    }\n  };\n";

const startIndex = content.indexOf(submitStart);
const endIndex = content.indexOf(submitEnd);

if (startIndex !== -1 && endIndex !== -1) {
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
        setIsDone: () => {}, // Handled internally or you can pass down
        onComplete
      }
    });
  };

`;
  
  // We need to carefully slice it. Let's find exactly the end of handleSubmit
  const actualEndIndex = content.indexOf("};", endIndex) + 3; 

  content = content.slice(0, startIndex) + replacement + content.slice(actualEndIndex);
  
  fs.writeFileSync(file, content);
  console.log("handleSubmit patched.");
} else {
  console.log("Could not find handleSubmit.");
}

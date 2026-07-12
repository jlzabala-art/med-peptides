const fs = require('fs');
const file = 'src/templates/Checkout.jsx';
let content = fs.readFileSync(file, 'utf8');

const startRemove = "  const generateOrderId = () => {";
const endRemove = "  };\n";

const startIndex = content.indexOf(startRemove);
let endIndex = content.indexOf(endRemove, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  endIndex += endRemove.length;
  content = content.slice(0, startIndex) + content.slice(endIndex);
  fs.writeFileSync(file, content);
  console.log("generateOrderId removed.");
} else {
  console.log("Could not find generateOrderId.");
}

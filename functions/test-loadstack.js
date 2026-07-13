const loader = require('./node_modules/firebase-functions/lib/runtime/loader.js');
console.log("Loading stack...");
loader.loadStack(__dirname).then(stack => {
  console.log("Stack loaded!");
  console.log(Object.keys(stack));
  process.exit(0);
}).catch(e => {
  console.error("Error:", e);
  process.exit(1);
});

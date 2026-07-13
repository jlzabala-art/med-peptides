const loader = require('./node_modules/firebase-functions/lib/runtime/loader.js');
console.log("Loading stack...");
const start = Date.now();
loader.loadStack(__dirname).then(stack => {
  console.log(`Stack loaded in ${Date.now() - start}ms!`);
  process.exit(0);
}).catch(e => {
  console.error("Error:", e);
  process.exit(1);
});

import fs from 'fs';

const data = JSON.parse(fs.readFileSync('products_merged.json', 'utf8'));

function validate(obj, path = '') {
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      if (Array.isArray(item)) {
        console.error(`Nested array at ${path}[${i}]`);
      } else if (typeof item === 'object' && item !== null) {
        validate(item, `${path}[${i}]`);
      }
    });
  } else if (typeof obj === 'object' && obj !== null) {
    Object.keys(obj).forEach(k => {
      if (!k || k.includes('.') || k.includes('/')) {
        console.error(`Invalid key "${k}" at ${path}`);
      }
      validate(obj[k], `${path}.${k}`);
    });
  }
}

data.forEach((p, i) => validate(p, `products[${i}]`));
console.log("Validation complete");

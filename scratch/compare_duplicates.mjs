import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('./scratch/nplab_non_supplements.json', 'utf8'));

const doc1 = data[229];
const doc2 = data[318];

const diff = {};
const allKeys = new Set([...Object.keys(doc1), ...Object.keys(doc2)]);

allKeys.forEach(key => {
  const v1 = JSON.stringify(doc1[key]);
  const v2 = JSON.stringify(doc2[key]);
  if (v1 !== v2) {
    diff[key] = { doc1: doc1[key], doc2: doc2[key] };
  }
});

console.log('Differences between Index 229 and 318:');
console.log(JSON.stringify(diff, null, 2));

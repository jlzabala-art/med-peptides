import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('./scratch/nplab_non_supplements.json', 'utf8'));

const indicesToInspect = [229, 318, 230, 319, 231, 321, 232, 322, 233, 323];

indicesToInspect.forEach(idx => {
  const item = data[idx];
  console.log(`\n--- INDEX ${idx} ---`);
  console.log(JSON.stringify(item, null, 2));
});

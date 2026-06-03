const fs = require('fs');
const glob = require('glob');
const files = glob.sync('src/components/**/*.jsx');

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('const columns = [')) {
    const lines = content.split('\n');
    let inColumns = false;
    let keys = [];
    for (let line of lines) {
      if (line.includes('const columns = [')) {
        inColumns = true;
        keys = [];
      } else if (inColumns) {
        if (line.match(/key:\s*['"]([^'"]+)['"]/)) {
          keys.push(line.match(/key:\s*['"]([^'"]+)['"]/)[1]);
        }
        if (line.match(/^\s*];/)) {
          inColumns = false;
          if (content.includes("columns.push({") && content.includes("'actions'")) {
             if(!keys.includes('actions')) keys.push('actions');
          }
          if (keys.length > 3 || (keys.length === 3 && !keys.includes('actions'))) {
            console.log(file, 'has', keys.length, 'columns:', keys);
          }
        }
      }
    }
  }
});

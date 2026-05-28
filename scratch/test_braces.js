import fs from 'fs';

function analyzeBraces(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  let i = 0;
  const stack = [];
  
  let inString = null;
  
  while (i < code.length) {
    const char = code[i];
    const line = code.substring(0, i).split('\n').length;
    
    // Skip line comments
    if (code.startsWith('//', i)) {
      const nextLine = code.indexOf('\n', i);
      if (nextLine === -1) break;
      i = nextLine;
      continue;
    }
    
    // Skip block comments
    if (code.startsWith('/*', i)) {
      const endComment = code.indexOf('*/', i);
      if (endComment === -1) break;
      i = endComment + 2;
      continue;
    }
    
    // Skip string literals
    if (inString) {
      if (char === inString) {
        // Handle escaped quotes
        if (code[i - 1] === '\\' && code[i - 2] !== '\\') {
          // Escaped quote, keep going
        } else {
          inString = null;
        }
      }
      i++;
      continue;
    }
    
    if (char === '"' || char === "'" || char === '`') {
      inString = char;
      i++;
      continue;
    }
    
    if (char === '{') {
      stack.push({ char, line });
    } else if (char === '}') {
      if (stack.length === 0) {
        console.log(`Error: Extra closing brace } at line ${line}`);
      } else {
        stack.pop();
      }
    }
    
    i++;
  }
  
  if (stack.length > 0) {
    console.log(`Unclosed braces in ${filePath}:`);
    stack.forEach(b => {
      console.log(`- ${b.char} opened at line ${b.line}`);
    });
  } else {
    console.log(`Braces are perfectly balanced in ${filePath}!`);
  }
}

analyzeBraces('src/templates/ProductDetail.jsx');

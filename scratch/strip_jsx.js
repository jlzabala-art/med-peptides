import fs from 'fs';

function checkBraceAndTagBalance(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  
  // Find the return statement
  const returnIdx = code.indexOf('return (');
  if (returnIdx === -1) {
    console.log(`Could not find return statement in ${filePath}`);
    return;
  }
  
  const returnBlock = code.substring(returnIdx + 8);
  
  let i = 0;
  let braceDepth = 0;
  let inQuote = null;
  const bracesStack = [];
  
  while (i < returnBlock.length) {
    const char = returnBlock[i];
    const line = returnBlock.substring(0, i).split('\n').length + 379; // Approximate offset
    
    // Skip comments
    if (returnBlock.startsWith('//', i)) {
      const end = returnBlock.indexOf('\n', i);
      if (end === -1) break;
      i = end;
      continue;
    }
    if (returnBlock.startsWith('/*', i)) {
      const end = returnBlock.indexOf('*/', i);
      if (end === -1) break;
      i = end + 2;
      continue;
    }
    
    if (inQuote) {
      if (char === inQuote) {
        inQuote = null;
      } else if (char === '\\') {
        i++;
      }
      i++;
      continue;
    }
    
    if (char === '"' || char === "'" || char === '`') {
      inQuote = char;
      i++;
      continue;
    }
    
    if (char === '{') {
      braceDepth++;
      bracesStack.push({ type: '{', line });
      i++;
      continue;
    }
    
    if (char === '}') {
      braceDepth--;
      if (bracesStack.length === 0) {
        console.log(`Error: Extra closing curly brace } at line ${line}`);
      } else {
        bracesStack.pop();
      }
      i++;
      continue;
    }
    
    i++;
  }
  
  if (bracesStack.length > 0) {
    console.log(`Unclosed curly braces in return block of ${filePath}:`);
    bracesStack.forEach(b => {
      console.log(`- { opened at line ${b.line}`);
    });
  } else {
    console.log(`Curly braces are perfectly balanced in return block of ${filePath}!`);
  }
}

checkBraceAndTagBalance('src/templates/ProductDetail.jsx');

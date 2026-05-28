import fs from 'fs';

function parseJSXTags(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  
  let i = 0;
  const stack = [];
  let inString = null;
  let inJSX = false;
  let braceDepth = 0;
  
  // Track parentheses depth inside JSX to handle arrow functions
  let parenDepth = 0;
  
  while (i < code.length) {
    const char = code[i];
    const line = code.substring(0, i).split('\n').length;
    
    // Skip line comments
    if (code.startsWith('//', i)) {
      const end = code.indexOf('\n', i);
      if (end === -1) break;
      i = end;
      continue;
    }
    
    // Skip block comments
    if (code.startsWith('/*', i)) {
      const end = code.indexOf('*/', i);
      if (end === -1) break;
      i = end + 2;
      continue;
    }
    
    // Skip string literals
    if (inString) {
      if (char === inString) {
        if (code[i - 1] === '\\' && code[i - 2] !== '\\') {
          // Escaped quote
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
    
    // Track return statement to know when JSX starts
    if (code.substring(i).startsWith('return (')) {
      inJSX = true;
      i += 8;
      parenDepth = 1;
      continue;
    }
    
    if (inJSX) {
      if (char === '(') {
        parenDepth++;
        i++;
        continue;
      }
      if (char === ')') {
        parenDepth--;
        if (parenDepth === 0) {
          inJSX = false;
        }
        i++;
        continue;
      }
      
      // Track JS expressions inside JSX
      if (char === '{') {
        braceDepth++;
        i++;
        continue;
      }
      if (char === '}') {
        braceDepth--;
        i++;
        continue;
      }
      
      // If we are in JSX and outside any JS expression, scan for tags
      if (braceDepth === 0 && char === '<') {
        if (code.startsWith('<!--', i)) {
          const end = code.indexOf('-->', i);
          if (end === -1) break;
          i = end + 3;
          continue;
        }
        
        // Closing tag
        if (code[i + 1] === '/') {
          const end = code.indexOf('>', i);
          if (end === -1) break;
          const tagName = code.substring(i + 2, end).trim();
          
          if (stack.length === 0) {
            console.log(`Error: Extra closing tag </${tagName}> at line ${line}`);
          } else {
            const last = stack.pop();
            if (last.name !== tagName) {
              console.log(`Mismatch at line ${line}: Expected </${last.name}> (opened at line ${last.line}), but got </${tagName}>`);
            }
          }
          i = end + 1;
          continue;
        }
        
        // Opening tag or fragment
        let j = i + 1;
        if (code[j] === '>') {
          stack.push({ name: '', line });
          i = j + 1;
          continue;
        }
        
        while (j < code.length && /[a-zA-Z0-9\-:\.]/.test(code[j])) {
          j++;
        }
        const tagName = code.substring(i + 1, j);
        
        if (!tagName || !/^[a-zA-Z]/.test(tagName)) {
          i++;
          continue;
        }
        
        // Find closing `>` of this tag, handling attributes and self-closing tags
        let isSelfClosing = false;
        let inTagQuote = null;
        let tagClosed = false;
        
        while (j < code.length) {
          const c = code[j];
          if (inTagQuote) {
            if (c === inTagQuote) inTagQuote = null;
            else if (c === '\\') j++;
          } else if (c === '"' || c === "'") {
            inTagQuote = c;
          } else if (c === '/' && code[j + 1] === '>') {
            isSelfClosing = true;
            j++;
            tagClosed = true;
            break;
          } else if (c === '>') {
            tagClosed = true;
            break;
          }
          j++;
        }
        
        if (tagClosed) {
          if (!isSelfClosing) {
            stack.push({ name: tagName, line });
          }
          i = j + 1;
          continue;
        }
      }
    }
    
    i++;
  }
  
  if (stack.length > 0) {
    console.log(`Unclosed JSX tags in ${filePath}:`);
    stack.forEach(t => {
      console.log(`- <${t.name || 'Fragment'}> opened at line ${t.line}`);
    });
  } else {
    console.log(`JSX tags are perfectly balanced in ${filePath}!`);
  }
}

parseJSXTags('src/templates/ProductDetail.jsx');

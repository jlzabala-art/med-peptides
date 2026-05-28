import fs from 'fs';

function findUnclosedTags(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  
  // A very simple scanner to find JSX elements
  // We'll look for `<TagName` and `</TagName>` or `<>` and `</>`
  // We need to be careful with self-closing tags like `<br />` or `<img ... />`
  // and comments like `{/* ... */}` and javascript expressions `{ ... }`.
  
  let i = 0;
  const stack = [];
  
  while (i < code.length) {
    // Skip comments
    if (code.startsWith('//', i)) {
      i = code.indexOf('\n', i);
      if (i === -1) break;
      continue;
    }
    if (code.startsWith('/*', i)) {
      i = code.indexOf('*/', i);
      if (i === -1) break;
      i += 2;
      continue;
    }
    
    // Skip string literals in JS
    if (code[i] === '"' || code[i] === "'" || code[i] === '`') {
      const quote = code[i];
      i++;
      while (i < code.length && code[i] !== quote) {
        if (code[i] === '\\') i += 2;
        else i++;
      }
      i++;
      continue;
    }
    
    // Check for JSX tags
    if (code[i] === '<') {
      // Check if it's a comment in JSX `{/* ... */}`
      if (code.startsWith('<!--', i)) {
        i = code.indexOf('-->', i);
        if (i === -1) break;
        i += 3;
        continue;
      }
      
      // Check if it's a closing tag
      if (code[i + 1] === '/') {
        let tagEnd = code.indexOf('>', i);
        if (tagEnd === -1) break;
        const tagName = code.substring(i + 2, tagEnd).trim();
        const line = code.substring(0, i).split('\n').length;
        
        if (stack.length === 0) {
          console.log(`Error: Extra closing tag </${tagName}> at line ${line}`);
        } else {
          const last = stack.pop();
          if (last.name !== tagName && !(last.name === '' && tagName === '')) {
            console.log(`Mismatch: Expected </${last.name}> (opened at line ${last.line}), but got </${tagName}> at line ${line}`);
          }
        }
        i = tagEnd + 1;
        continue;
      }
      
      // It's an opening tag
      // Let's find the end of the tag name
      let j = i + 1;
      // Handle Fragment `<>`
      if (code[j] === '>') {
        const line = code.substring(0, i).split('\n').length;
        stack.push({ name: '', line });
        i = j + 1;
        continue;
      }
      
      // Normal tag
      // Tag name can contain letters, numbers, hyphens, colons, dots
      while (j < code.length && /[a-zA-Z0-9\-:\.]/.test(code[j])) {
        j++;
      }
      const tagName = code.substring(i + 1, j);
      
      if (tagName && !/^[a-zA-Z]/.test(tagName) && tagName !== '>') {
        // Not a tag (e.g. `< 5`)
        i++;
        continue;
      }
      
      // Let's find the closing `>` of this opening tag
      // We must handle string attributes like `attr=">"` and self-closing tags `/>`
      let isSelfClosing = false;
      let inQuote = null;
      let tagClosed = false;
      
      while (j < code.length) {
        const char = code[j];
        if (inQuote) {
          if (char === inQuote) {
            inQuote = null;
          } else if (char === '\\') {
            j++;
          }
        } else if (char === '"' || char === "'") {
          inQuote = char;
        } else if (char === '`') {
          inQuote = char;
        } else if (char === '/' && code[j + 1] === '>') {
          isSelfClosing = true;
          j++;
          tagClosed = true;
          break;
        } else if (char === '>') {
          tagClosed = true;
          break;
        }
        j++;
      }
      
      if (tagClosed) {
        const line = code.substring(0, i).split('\n').length;
        if (!isSelfClosing) {
          stack.push({ name: tagName, line });
        }
        i = j + 1;
        continue;
      }
    }
    
    i++;
  }
  
  if (stack.length > 0) {
    console.log(`Unclosed tags in ${filePath}:`);
    stack.forEach(t => {
      console.log(`- <${t.name || ''}> opened at line ${t.line}`);
    });
  } else {
    console.log(`No unclosed tags found in ${filePath} via basic scanner.`);
  }
}

console.log('=== ProductDetail.jsx ===');
findUnclosedTags('src/templates/ProductDetail.jsx');

console.log('\n=== ProtocolTemplate.jsx ===');
findUnclosedTags('src/templates/ProtocolTemplate.jsx');

import fs from 'fs';

function scanJSX(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  let i = 0;
  const stack = [];
  
  // Track JS braces
  let braceDepth = 0;
  
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
    
    // Skip string literals inside JS or JSX attribute string literals
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
    
    // Track JS expression braces
    if (code[i] === '{') {
      braceDepth++;
      i++;
      continue;
    }
    if (code[i] === '}') {
      braceDepth--;
      i++;
      continue;
    }
    
    // We only care about JSX tags if we are outside any JS expression (braceDepth is 0)
    // Wait, inside the main JSX, braceDepth can be > 0 because the entire JSX is inside a JS return statement
    // but the return statement itself doesn't use `{` inside JSX except for expressions like `{someVar}`.
    // Actually, inside the function body, braceDepth is at least 1 (the function body starts with `{`).
    // But inside JSX, we open a JS expression with `{` (increasing braceDepth).
    // So when we are inside a JS expression (braceDepth > 1), we should skip JSX tags!
    // Let's verify:
    // Function body starts: braceDepth = 1.
    // Inside return statement JSX: braceDepth = 1.
    // Inside a JSX expression `{someVar}`: braceDepth = 2.
    // So if braceDepth === 1, we are in JSX!
    // If braceDepth > 1, we are in a JS expression inside JSX!
    
    if (braceDepth === 1 && code[i] === '<') {
      // Check if it's a comment in JSX
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
        const tagName = code.substring(i + 2, tagEnd).trim().split(' ')[0].split('\n')[0];
        const line = code.substring(0, i).split('\n').length;
        
        if (stack.length === 0) {
          console.log(`Error: Extra closing tag </${tagName}> at line ${line}`);
        } else {
          const last = stack.pop();
          if (last.name !== tagName) {
            console.log(`Mismatch: Expected </${last.name}> (opened at line ${last.line}), but got </${tagName}> at line ${line}`);
          }
        }
        i = tagEnd + 1;
        continue;
      }
      
      // It's an opening tag
      let j = i + 1;
      // Handle Fragment `<>`
      if (code[j] === '>') {
        const line = code.substring(0, i).split('\n').length;
        stack.push({ name: '', line });
        i = j + 1;
        continue;
      }
      
      // Normal tag
      while (j < code.length && /[a-zA-Z0-9\-:\.]/.test(code[j])) {
        j++;
      }
      const tagName = code.substring(i + 1, j);
      
      if (!tagName || !/^[a-zA-Z]/.test(tagName)) {
        // Not a tag (e.g. `< 5`)
        i++;
        continue;
      }
      
      // Let's find the closing `>` of this opening tag, taking quotes into account
      let isSelfClosing = false;
      let inTagQuote = null;
      let tagClosed = false;
      
      while (j < code.length) {
        const char = code[j];
        if (inTagQuote) {
          if (char === inTagQuote) {
            inTagQuote = null;
          } else if (char === '\\') {
            j++;
          }
        } else if (char === '"' || char === "'") {
          inTagQuote = char;
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
    console.log(`No unclosed tags found in ${filePath}!`);
  }
}

console.log('=== ProductDetail.jsx ===');
scanJSX('src/templates/ProductDetail.jsx');

import fs from 'fs';

function checkJSXPerfect(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  
  let i = 0;
  
  // States
  const JS_NORMAL = 0;
  const JS_STRING = 1;
  const JS_TEMPLATE = 2;
  const JS_COMMENT_LINE = 3;
  const JS_COMMENT_BLOCK = 4;
  
  let state = JS_NORMAL;
  let quoteChar = '';
  let braceDepth = 0;
  let bracesStack = [];
  
  // Track template literal expressions ${ ... }
  const templateStack = [];
  
  // We want to find the JSX elements that are parsed when braceDepth is at the JSX level
  // Usually the return statement returns JSX. The return starts at 'return (' and ends with ')'.
  // Inside JSX, standard tags like <div /> are parsed.
  // Whenever we enter a JS expression `{ ... }`, braceDepth increases.
  // So JSX tags are only evaluated when we are at the base JSX level of the return statement.
  // Let's first balance braces globally!
  
  const tagsStack = [];
  let inTag = false;
  let tagContent = '';
  let inTagQuote = null;
  
  while (i < code.length) {
    const char = code[i];
    const line = code.substring(0, i).split('\n').length;
    
    // Comment line skip
    if (state === JS_NORMAL && code.startsWith('//', i)) {
      state = JS_COMMENT_LINE;
      i += 2;
      continue;
    }
    if (state === JS_COMMENT_LINE) {
      if (char === '\n') {
        state = JS_NORMAL;
      }
      i++;
      continue;
    }
    
    // Comment block skip
    if (state === JS_NORMAL && code.startsWith('/*', i)) {
      state = JS_COMMENT_BLOCK;
      i += 2;
      continue;
    }
    if (state === JS_COMMENT_BLOCK) {
      if (code.startsWith('*/', i)) {
        state = JS_NORMAL;
        i += 2;
      } else {
        i++;
      }
      continue;
    }
    
    // Quotes and template literals
    if (state === JS_NORMAL) {
      if (char === '"' || char === "'") {
        state = JS_STRING;
        quoteChar = char;
        i++;
        continue;
      }
      if (char === '`') {
        state = JS_TEMPLATE;
        i++;
        continue;
      }
    } else if (state === JS_STRING) {
      if (char === quoteChar) {
        if (code[i - 1] === '\\' && code[i - 2] !== '\\') {
          // Escaped
        } else {
          state = JS_NORMAL;
        }
      }
      i++;
      continue;
    } else if (state === JS_TEMPLATE) {
      if (char === '`') {
        if (code[i - 1] === '\\' && code[i - 2] !== '\\') {
          // Escaped
        } else {
          state = JS_NORMAL;
        }
        i++;
        continue;
      }
      if (code.startsWith('${', i)) {
        // We are entering a JS expression inside a template literal
        templateStack.push(braceDepth);
        braceDepth = 0; // Reset braceDepth for this nested JS expression!
        i += 2;
        continue;
      }
    }
    
    // Curly braces tracking
    if (state === JS_NORMAL || state === JS_TEMPLATE) {
      if (char === '{') {
        braceDepth++;
        bracesStack.push({ line, char });
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
        
        // If we were inside a template expression and braceDepth becomes 0, we exit to template mode
        if (state === JS_TEMPLATE && braceDepth === 0 && templateStack.length > 0) {
          braceDepth = templateStack.pop();
        }
        
        i++;
        continue;
      }
    }
    
    // JSX Tag extraction
    // JSX tags are opened with '<' when we are in JS_NORMAL (i.e. not in string/comment/template)
    // and when we are inside JSX.
    // In React, JSX tags can have JS expressions. So braceDepth inside the JSX can be > 0.
    // But we only parse tags when we are outside any attribute quotes
    if (state === JS_NORMAL) {
      if (inTag) {
        if (inTagQuote) {
          if (char === inTagQuote) {
            inTagQuote = null;
          } else if (char === '\\') {
            i += 2;
            continue;
          }
        } else if (char === '"' || char === "'") {
          inTagQuote = char;
        } else if (char === '/' && code[i + 1] === '>') {
          inTag = false;
          // It's self-closing
          i += 2;
          continue;
        } else if (char === '>') {
          inTag = false;
          
          // Parse the tag name and type
          const cleanTag = tagContent.trim();
          const isClosing = cleanTag.startsWith('/');
          const tagName = isClosing ? cleanTag.substring(1).trim().split(' ')[0] : cleanTag.split(' ')[0];
          
          if (tagName && /^[a-zA-Z]/.test(tagName) || tagName === '') {
            // It's a valid HTML tag or React component or Fragment
            if (isClosing) {
              if (tagsStack.length === 0) {
                console.log(`Error: Extra closing tag </${tagName}> at line ${line}`);
              } else {
                const last = tagsStack.pop();
                if (last.name !== tagName) {
                  console.log(`Mismatch at line ${line}: Expected </${last.name}> (opened at line ${last.line}), but got </${tagName}>`);
                }
              }
            } else {
              tagsStack.push({ name: tagName, line });
            }
          }
          i++;
          continue;
        } else {
          tagContent += char;
        }
      } else {
        if (char === '<') {
          // Check if it's a comment or a comparison like `i < 5`
          let isTag = false;
          let j = i + 1;
          
          if (code[j] === '/' || code[j] === '>') {
            isTag = true;
          } else if (/[a-zA-Z]/.test(code[j])) {
            // Check if it's a tag or a comparison
            // Tags have only letters/numbers/hyphens/dots up to space or closing
            while (j < code.length && /[a-zA-Z0-9\-:\.]/.test(code[j])) {
              j++;
            }
            if (code[j] === ' ' || code[j] === '>' || code[j] === '/' || code[j] === '\n' || code[j] === '\r' || code[j] === '\t') {
              isTag = true;
            }
          }
          
          if (isTag) {
            inTag = true;
            tagContent = '';
            inTagQuote = null;
            i++;
            continue;
          }
        }
      }
    }
    
    i++;
  }
  
  if (bracesStack.length > 0) {
    console.log(`Unclosed curly braces:`);
    bracesStack.forEach(b => {
      console.log(`- { opened at line ${b.line}`);
    });
  } else {
    console.log(`All curly braces perfectly balanced!`);
  }
  
  if (tagsStack.length > 0) {
    console.log(`Unclosed JSX tags:`);
    tagsStack.forEach(t => {
      console.log(`- <${t.name || 'Fragment'}> opened at line ${t.line}`);
    });
  } else {
    console.log(`All JSX tags perfectly balanced!`);
  }
}

checkJSXPerfect('src/templates/ProductDetail.jsx');

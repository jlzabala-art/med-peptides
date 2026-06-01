const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes("'Mensajes'")) {
        content = content.replace(/'Mensajes'/g, "'Messages'");
        fs.writeFileSync(fullPath, content);
        console.log('Updated:', fullPath);
      }
      if (content.includes('"Mensajes"')) {
        content = content.replace(/"Mensajes"/g, '"Messages"');
        fs.writeFileSync(fullPath, content);
        console.log('Updated:', fullPath);
      }
      if (content.includes("'Calendario'")) {
        content = content.replace(/'Calendario'/g, "'Calendar'");
        fs.writeFileSync(fullPath, content);
        console.log('Updated Calendar:', fullPath);
      }
    }
  }
}

replaceInDir('/Users/joseluiszabala/Documents/Antigravity/regenpept-web/src/templates');
replaceInDir('/Users/joseluiszabala/Documents/Antigravity/regenpept-web/src/routes');

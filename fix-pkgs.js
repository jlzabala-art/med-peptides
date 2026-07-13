const fs = require('fs');
const dirs = ['functions-ai', 'functions-cron', 'functions-finance', 'functions-triggers'];

dirs.forEach(dir => {
  const path = `./${dir}/package.json`;
  const pkg = JSON.parse(fs.readFileSync(path, 'utf8').replace(/"build": ".*?",/, '"build": "rm -rf src && cp -R ../functions/src ./src && cp -R ../functions/emailTemplates ./emailTemplates",'));
  
  pkg.scripts.build = "rm -rf src && cp -R ../functions/src ./src && cp -R ../functions/emailTemplates ./emailTemplates";
  
  fs.writeFileSync(path, JSON.stringify(pkg, null, 2));
  console.log(`Fixed ${path}`);
});

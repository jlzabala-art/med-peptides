const fs = require('fs');

let content = fs.readFileSync('src/hooks/admin/useInvitations.js', 'utf8');
content = content.replace(
  "[['createdAt', 'desc']]",
  "[['invitedAt', 'desc']]"
);
fs.writeFileSync('src/hooks/admin/useInvitations.js', content);

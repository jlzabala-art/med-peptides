const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
initializeApp({ projectId: 'med-peptides-app' });
const auth = getAuth();
async function main() {
  const list = await auth.listUsers(100);
  list.users.forEach(u => {
    if (u.email && u.email.includes('admin')) {
      console.log(`Email: "${u.email}" UID: ${u.uid}`);
    }
  });
}
main().catch(console.error);

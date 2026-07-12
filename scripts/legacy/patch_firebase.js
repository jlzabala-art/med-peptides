const fs = require('fs');
let code = fs.readFileSync('src/firebase.js', 'utf8');

code = code.replace(
  "const app = initializeApp(firebaseConfig);",
  "const app = typeof window !== 'undefined' ? initializeApp(firebaseConfig) : {};"
);

code = code.replace(
  "export const auth = getAuth(app);",
  "export const auth = typeof window !== 'undefined' ? getAuth(app) : {};"
);

code = code.replace(
  "let dbInstance;\ntry {\n  dbInstance = initializeFirestore(app, {\n    localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})\n  });\n} catch (e) {\n  dbInstance = getFirestore(app);\n}\nexport const db = dbInstance;",
  "let dbInstance = {};\nif (typeof window !== 'undefined') {\n  try {\n    dbInstance = initializeFirestore(app, {\n      localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})\n    });\n  } catch (e) {\n    dbInstance = getFirestore(app);\n  }\n}\nexport const db = dbInstance;"
);

code = code.replace(
  "export const storage = getStorage(app);",
  "export const storage = typeof window !== 'undefined' ? getStorage(app) : {};"
);

code = code.replace(
  "export const functions = getFunctions(app, \"us-central1\");",
  "export const functions = typeof window !== 'undefined' ? getFunctions(app, \"us-central1\") : {};"
);

fs.writeFileSync('src/firebase.js', code);
console.log('Patched firebase.js');

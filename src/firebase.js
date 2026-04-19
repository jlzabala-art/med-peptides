import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

// ─────────────────────────────────────────────────────────────────────────────
// PROYECTO FIREBASE OFICIAL: med-peptides-app  (med-peptides.com)
//
// ⚠️  IMPORTANTE: Este es el único proyecto Firebase autorizado para este
//     repositorio. NUNCA apuntes a 'regenpept-web-app' ni a ningún otro
//     proyecto. Todos los datos (productos, ajustes, FAQs, usuarios, etc.)
//     deben almacenarse y leerse desde 'med-peptides-app'.
//
//  Firebase Console → https://console.firebase.google.com/project/med-peptides-app
//  Hosting URL     → https://med-peptides-app-27a3a.web.app
//  Dominio custom  → https://med-peptides.com
// ─────────────────────────────────────────────────────────────────────────────

const firebaseConfig = {
  // Proyecto: med-peptides-app  |  Entorno: PRODUCCIÓN
  apiKey: "AIzaSyDOV2zFeLGtPsE_O2b-gR3NHZygPspiSws",
  authDomain: "med-peptides-app-27a3a.firebaseapp.com",
  projectId: "med-peptides-app",
  storageBucket: "med-peptides-app.firebasestorage.app",
  messagingSenderId: "514143707883",
  appId: "1:514143707883:web:6c12470433ef6c992714ae",
  measurementId: "G-LYMXGY71FJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});
export default app;

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fetch from 'node-fetch';

const firebaseConfig = {
  projectId: "med-peptides-app" // we just need projectId for local emulator or using default credentials, wait, I can use firebase-admin
};


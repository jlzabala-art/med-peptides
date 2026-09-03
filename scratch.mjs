import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit } from "firebase/firestore";
import fs from 'fs';

const firebaseConfig = {
  projectId: "med-peptides-app"
};
// Use default credentials or whatever is configured.
// But we might need the firebase admin sdk. Let's write a script for firebase admin.

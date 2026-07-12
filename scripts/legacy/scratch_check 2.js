import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  projectId: "regenpept-1e4e1",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const querySnapshot = await getDocs(collection(db, "protocols"));
  console.log("Total protocols:", querySnapshot.size);
  if(querySnapshot.size > 0) {
      console.log("Sample protocol:", querySnapshot.docs[0].data());
  }
}
check().catch(console.error);

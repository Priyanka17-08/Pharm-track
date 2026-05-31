import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    console.log("Testing collection access...");
    const snapshot = await getDocs(collection(db, 'medicines'));
    console.log("Success! Found", snapshot.docs.length, "docs");
  } catch (e) {
    console.error("Error:", (e as any).message);
  }
}
test();

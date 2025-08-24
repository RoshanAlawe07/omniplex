import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// Firebase Config
export const firebaseConfig = {
  apiKey: "AIzaSyC2MQbYe-7reXYeE2AXAiPRbsuMjVuoOeo",
  authDomain: "internproject-421cd.firebaseapp.com",
  projectId: "internproject-421cd",
  storageBucket: "internproject-421cd.firebasestorage.app",
  messagingSenderId: "579789761511",
  appId: "1:579789761511:web:b270240dc3a696d8302b42",
  measurementId: "G-KBVTPZGSZJ",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };

export const initializeFirebase = () => {
  return app;
};

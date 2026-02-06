
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA8Xa9HZ8HRuAY6JTqx_zvN3hjT_1YbwQE",
  authDomain: "bloombook.firebaseapp.com",
  projectId: "bloombook",
  storageBucket: "bloombook.firebasestorage.app",
  messagingSenderId: "1036124411351",
  appId: "1:1036124411351:web:fb498ee0951ae76f3e2792"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore with experimentalForceLongPolling to prevent "Offline" hangs
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

const storage = getStorage(app);

export { app, auth, db, storage };

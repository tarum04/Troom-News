// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyDcT8DkZXr8JPewzKg-7AtqciumoyWmWiw",
  authDomain: "troom-news.firebaseapp.com",
  projectId: "troom-news",
  storageBucket: "troom-news.firebasestorage.app",
  messagingSenderId: "590637987584",
  appId: "1:590637987584:web:02f2f523cbb0086d7ce5e5",
  measurementId: "G-XE26XQ77L2"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const storage = getStorage(app);


export { app, db, auth, analytics, storage };

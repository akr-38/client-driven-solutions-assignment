// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA8cDb9fbrvMp8xHbvtYv1GPqo9KDDoEtQ",
  authDomain: "cds-assignment.firebaseapp.com",
  projectId: "cds-assignment",
  storageBucket: "cds-assignment.firebasestorage.app",
  messagingSenderId: "315433311402",
  appId: "1:315433311402:web:ef54403cf70ae19f0604d3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔹 Firebase Authentication
export const auth = getAuth(app);

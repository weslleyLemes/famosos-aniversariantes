// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCGqihTwGqYLQxkTnw0gL6VXKhGsjCzOtQ",
    authDomain: "wltest-60dd4.firebaseapp.com",
    projectId: "wltest-60dd4",
    storageBucket: "wltest-60dd4.firebasestorage.app",
    messagingSenderId: "120477824170",
    appId: "1:120477824170:web:75e82847531ced4c9c4cd3"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
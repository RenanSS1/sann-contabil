import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDfMYc-XEkisAwinEEbp31SzzLKyjdCwBU",
  authDomain: "sann-contabil.firebaseapp.com",
  projectId: "sann-contabil",
  storageBucket: "sann-contabil.firebasestorage.app",
  messagingSenderId: "274607015375",
  appId: "1:274607015375:web:1dd3df83e43e8e09dd7eba",
  measurementId: "G-WGPJ8QEW55"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

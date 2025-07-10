
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC7YpVgk5NboJTLm1Jgx_8GtLToUk_Y3Q8",
  authDomain: "luvvix-3d460.firebaseapp.com",
  projectId: "luvvix-3d460",
  storageBucket: "luvvix-3d460.firebasestorage.app",
  messagingSenderId: "615715919568",
  appId: "1:615715919568:web:0511efaacfb64b1fcb30d5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth (pour la compatibilité, mais on utilisera Supabase pour l'auth)
export const firebaseAuth = getAuth(app);

export default app;

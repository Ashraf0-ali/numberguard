
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAgpR8jud6EEu6tGwtEbut2zYBllBOItt8",
  authDomain: "numberguard-381bb.firebaseapp.com",
  projectId: "numberguard-381bb",
  storageBucket: "numberguard-381bb.firebasestorage.app",
  messagingSenderId: "636727866336",
  appId: "1:636727866336:web:c1e685ed92b152c1cff185"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

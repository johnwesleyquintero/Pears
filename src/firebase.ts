import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0670451952",
  appId: "1:245559146651:web:f403efab351179eed76e3e",
  apiKey: "AIzaSyBCaYz33yhTeHoXpVyu3BlcDogO03ak4",
  authDomain: "gen-lang-client-0670451952.firebaseapp.com",
  storageBucket: "gen-lang-client-0670451952.firebasestorage.app",
  messagingSenderId: "245559146651",
  measurementId: ""
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

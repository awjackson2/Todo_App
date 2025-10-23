import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Authentication helpers
export async function signInUser() {
  try {
    console.log('Attempting anonymous sign-in...');
    const userCredential = await signInAnonymously(auth);
    console.log('Signed in anonymously:', userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

export async function signUpWithEmail(email: string, password: string) {
  try {
    console.log('Creating account with email:', email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Account created:', userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    console.log('Signing in with email:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Signed in:', userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

export async function signOutUser() {
  try {
    await signOut(auth);
    console.log('User signed out');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// Auth state observer
export function onAuthStateChange(callback: (user: any) => void) {
  return onAuthStateChanged(auth, callback);
}

// Note: Firebase emulators are disabled - using production Firebase

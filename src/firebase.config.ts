import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * ============================================================================
 * KRED LIVE FIREBASE CONFIGURATION
 * Project: kred-b88a3
 * ============================================================================
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDzWWGuUAux6rRm2Y7DlmvCTjNXIr_WBro",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "kred-b88a3.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kred-b88a3",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "kred-b88a3.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "826214267602",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:826214267602:web:b7c7006b0d061768178b0b",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-L1JVLRQ97H",
};

// Check if valid Firebase configuration credentials have been provided
export const isFirebaseConfigured = (): boolean => {
  return (
    Boolean(firebaseConfig.apiKey) &&
    firebaseConfig.apiKey.startsWith("AIzaSy") &&
    Boolean(firebaseConfig.projectId) &&
    firebaseConfig.projectId === "kred-b88a3"
  );
};

// Initialize Firebase App safely (singleton pattern prevents duplicate app errors)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore Database
export const db = getFirestore(app);

export default app;

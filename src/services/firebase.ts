import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAqKz8OvYU4lz6oEhwgi34QrwCRdIE1Wpk',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'playlist-app-2026.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'playlist-app-2026',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'playlist-app-2026.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '88301049297',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:88301049297:web:ef1624cdd2ebccb619fcf0',
};

// Garante padrão Singleton para não duplicar inicialização do Firebase
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

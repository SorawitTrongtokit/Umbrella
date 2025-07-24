import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCKrI6yFRoRW9QlYQY9VxMe0DxC1yTEusw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "umbrella-system-e0ae7.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://umbrella-system-e0ae7-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "umbrella-system-e0ae7",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "umbrella-system-e0ae7.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "644775621893",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:644775621893:web:76175ce428a8d99550336c",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-4J12KF1H0B"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

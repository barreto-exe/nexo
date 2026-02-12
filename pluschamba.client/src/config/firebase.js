// =============================================================================
// Firebase Configuration & Services
// =============================================================================
// Este archivo configura Firebase Auth (Google Provider) y Realtime Database
// 
// IMPORTANTE: Reemplaza los valores de firebaseConfig con los de tu proyecto Firebase
// Puedes obtenerlos en: Firebase Console > Project Settings > General > Your apps
// =============================================================================

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  push, 
  update, 
  remove, 
  onValue,
  serverTimestamp 
} from 'firebase/database';

// =============================================================================
// Firebase Config - REEMPLAZAR CON TUS CREDENCIALES
// =============================================================================
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://YOUR_PROJECT.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth instance
export const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Realtime Database instance
export const database = getDatabase(app);

// =============================================================================
// Auth Functions
// =============================================================================

/**
 * Inicia sesión con Google OAuth
 * @returns {Promise<UserCredential>} Credenciales del usuario autenticado
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

/**
 * Cierra la sesión del usuario actual
 */
export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Suscripción a cambios en el estado de autenticación
 * @param {Function} callback - Función a ejecutar cuando cambie el estado
 * @returns {Function} Función para cancelar la suscripción
 */
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// =============================================================================
// Database References Helper
// =============================================================================

/**
 * Obtiene la referencia a las tareas del usuario
 * @param {string} uid - ID del usuario
 */
export const getUserTasksRef = (uid) => ref(database, `users/${uid}/tasks`);

/**
 * Obtiene la referencia a una tarea específica
 * @param {string} uid - ID del usuario
 * @param {string} taskId - ID de la tarea
 */
export const getTaskRef = (uid, taskId) => ref(database, `users/${uid}/tasks/${taskId}`);

// =============================================================================
// Database Operations Export
// =============================================================================
export { 
  ref, 
  set, 
  get, 
  push, 
  update, 
  remove, 
  onValue, 
  serverTimestamp 
};

export default app;

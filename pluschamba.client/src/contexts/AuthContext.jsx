// =============================================================================
// Auth Context Provider
// =============================================================================
// Maneja el estado de autenticación global de la aplicación
// Provee: user, loading, signIn, signOut
// =============================================================================

import { createContext, useState, useEffect, useMemo } from 'react';
import {
  signInWithGoogle,
  logOut,
  subscribeToAuthChanges,
  database,
  ref,
  set,
  get
} from '../config/firebase';

// Context
const AuthContext = createContext(null);

// =============================================================================
// Auth Provider Component
// =============================================================================
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Suscripción a cambios de autenticación
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      if (firebaseUser) {
        // Usuario autenticado - crear/actualizar perfil en DB
        const userProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          lastLogin: new Date().toISOString()
        };

        try {
          // Guardar/actualizar info del usuario en la DB
          const userRef = ref(database, `users/${firebaseUser.uid}/profile`);
          await set(userRef, userProfile);


          setUser(userProfile);
        } catch (err) {
          console.error('Error setting up user profile:', err);
          setError(err.message);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Función de inicio de sesión
  const signIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      // El estado se actualizará automáticamente por el listener
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  // Función de cierre de sesión
  const signOutUser = async () => {
    setError(null);
    try {
      await logOut();
      setUser(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Memoizar el valor del contexto para evitar re-renders innecesarios
  const value = useMemo(() => ({
    user,
    loading,
    error,
    signIn,
    signOut: signOutUser,
    isAuthenticated: !!user
  }), [user, loading, error]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/firebaseConfig';
import { login, register, logout } from '../features/auth/services/authService';
import { doc, getDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔁 Auto-detect login state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = userDoc.exists() ? userDoc.data() : {};

          const currentUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: userData.name || firebaseUser.displayName || '',
            role: userData.role || 'user',
            profilePicture: userData.profilePicture || null, // 🔄 AMBIL dari Firestore, bukan photoURL
          };

          setUser(currentUser);
          localStorage.setItem('user', JSON.stringify(currentUser));
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('Failed to load user data');
        }
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔐 LOGIN handler
  const handleLogin = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await login(email, password); // userData.id = firebaseUser.uid

      const userDoc = await getDoc(doc(db, 'users', userData.id));
      const firestoreData = userDoc.exists() ? userDoc.data() : {};

      const fullUserData = {
        ...userData,
        role: firestoreData.role || 'user',
        name: firestoreData.name || userData.name,
        profilePicture: firestoreData.profilePicture || null, // 🔄 penting agar tampil ulang saat login
      };

      setUser(fullUserData);
      localStorage.setItem('user', JSON.stringify(fullUserData));
      return fullUserData;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 📝 REGISTER handler
  const handleRegister = useCallback(async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await register(name, email, password);
      const fullUserData = { ...userData, name, role: 'user', profilePicture: null };

      setUser(fullUserData);
      localStorage.setItem('user', JSON.stringify(fullUserData));
      return fullUserData;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 🚪 LOGOUT handler
  const handleLogout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await logout();
      setUser(null);
      localStorage.removeItem('user');
    } catch (err) {
      setError(err.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const contextValue = useMemo(() => ({
    user,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    setUser,
  }), [user, loading, error, handleLogin, handleRegister, handleLogout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

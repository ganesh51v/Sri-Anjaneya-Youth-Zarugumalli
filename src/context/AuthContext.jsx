import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../firebase/config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('sa_current_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((usr) => {
      setUser(usr);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signOut = async () => {
    try {
      await authService.signOut();
    } finally {
      // Always clear local user even if remote signout throws
      setUser(null);
    }
  };

  const loginUser = (userData) => setUser(userData);

  const checkEmailVerification = async () => {
    const res = await authService.checkEmailVerification();
    if (res && res.user) {
      setUser(res.user);
    }
    return res;
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, signOut, checkEmailVerification }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

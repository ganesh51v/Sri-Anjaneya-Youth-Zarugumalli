import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../firebase/config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
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

  // Used by SignIn/SignUp to update the user after auth operations
  const loginUser = (userData) => setUser(userData);

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, signOut }}>
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

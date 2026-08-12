import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authService } from '../firebase/config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialise from localStorage so the UI doesn't flash "not logged in" before
  // the async onAuthStateChanged fires on page load.
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('sa_current_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  // Start loading=false only if we already have a cached user — prevents
  // protected routes from flashing the sign-in redirect before auth resolves.
  const [loading, setLoading] = useState(() => {
    try {
      return !localStorage.getItem('sa_current_user');
    } catch {
      return true;
    }
  });

  // Guard so we only set loading=false once on the first auth event
  const firstAuthEvent = useRef(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((usr) => {
      setUser(usr);
      // Always stop loading after the first resolution (even if usr is null)
      if (firstAuthEvent.current) {
        firstAuthEvent.current = false;
        setLoading(false);
      }
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

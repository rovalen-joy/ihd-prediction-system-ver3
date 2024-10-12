import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail, 
} from 'firebase/auth';
import { auth } from '../firebase';
import { Toaster } from 'react-hot-toast';

const UserContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Initialized as null

  // Signup function
  const createUser = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Signin function
  const signIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Logout function
  const logout = () => {
    return signOut(auth);
  };

  // Reset Password function
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ createUser, user, logout, signIn, resetPassword }}>
      {children}
      <Toaster />
    </UserContext.Provider>
  );
};

// Create a hook to use the AuthContext
export const UserAuth = () => {
  return useContext(UserContext);
};
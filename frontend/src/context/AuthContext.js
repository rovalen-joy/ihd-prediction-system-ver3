import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import toast, { Toaster } from 'react-hot-toast';

const UserContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // Store additional user data like firstName, lastName

  // Signup function
  const createUser = async (email, password, firstName, lastName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Store the user's first name and last name in Firestore under the "users" collection
      await setDoc(doc(db, 'users', userId), {
        firstName,
        lastName,
        email,
      });

      toast.success('Account created successfully');
    } catch (error) {
      console.error('Error creating user:', error.message);
      toast.error(`Failed to create account: ${error.message}`);
      throw error;
    }
  };

  // Signin function with improved error handling
  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      console.error('Error signing in:', error.message);

      // Handle specific authentication errors
      switch (error.code) {
        case 'auth/invalid-email':
          toast.error('The email address is not valid.');
          break;
        case 'auth/user-disabled':
          toast.error('This user account has been disabled.');
          break;
        case 'auth/user-not-found':
          toast.error('No account found with this email.');
          break;
        case 'auth/wrong-password':
          toast.error('Incorrect password. Please try again.');
          break;
        default:
          toast.error('Failed to sign in. Please check your credentials and try again.');
          break;
      }
      throw error;
    }
  };

  // Fetch additional user data from Firestore (firstName, lastName)
  const fetchUserData = async (userId) => {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setUserData(docSnap.data());
    } else {
      console.error('No such user data found in Firestore!');
      setUserData(null);
    }
  };

  // Listen to Firestore user document changes in real-time
  const listenToUserData = (userId) => {
    const docRef = doc(db, 'users', userId);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        setUserData(null);
      }
    });
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error.message);
      toast.error(`Failed to logout: ${error.message}`);
      throw error;
    }
  };

  // Reset Password function with error handling
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent successfully.');
    } catch (error) {
      console.error('Error sending password reset email:', error.message);
      toast.error(`Failed to send password reset email: ${error.message}`);
      throw error;
    }
  };

  // Listen for authentication state changes and fetch user data
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserData(currentUser.uid);

        // Start listening to Firestore user document changes
        const unsubscribeFirestore = listenToUserData(currentUser.uid);

        // Cleanup Firestore listener on unmount or user change
        return () => {
          unsubscribeFirestore();
        };
      } else {
        setUser(null);
        setUserData(null);
      }
    });

    // Cleanup Auth listener on unmount
    return () => {
      unsubscribeAuth();
    };
  }, []);

  return (
    <UserContext.Provider value={{ createUser, user, userData, logout, signIn, resetPassword }}>
      {children}
      <Toaster />
    </UserContext.Provider>
  );
};

// Create a hook to use the AuthContext
export const UserAuth = () => {
  return useContext(UserContext);
};

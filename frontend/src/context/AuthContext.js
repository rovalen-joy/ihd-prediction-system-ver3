import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Toaster } from 'react-hot-toast';

const UserContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // Store additional user data like firstName, lastName

  // Signup function
  const createUser = async (email, password, firstName, lastName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;

    // Store the user's first name and last name in Firestore under the "users" collection
    await setDoc(doc(db, 'users', userId), {
      firstName,
      lastName,
      email,
    });
  };

  // Signin function
  const signIn = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;

    // Fetch the user's data from Firestore
    await fetchUserData(userId);
    return userCredential;
  };

  // Fetch additional user data from Firestore (firstName, lastName)
  const fetchUserData = async (userId) => {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setUserData(docSnap.data());
    } else {
      console.error('No such user data found in Firestore!');
    }
  };

  // Logout function
  const logout = () => {
    return signOut(auth);
  };

  // Reset Password function with error handling
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent successfully.');
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  };

  // Listen for authentication state changes and fetch user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch additional user data from Firestore if user is authenticated
        await fetchUserData(currentUser.uid);
      } else {
        setUser(null);
        setUserData(null);
      }
    });
    return () => {
      unsubscribe();
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
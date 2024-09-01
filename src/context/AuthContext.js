import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from "firebase/auth";

// Create a context for authentication
const AuthContext = createContext();

// AuthProvider component to provide authentication context to the entire app
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  // Function to handle user login
  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  // Function to handle user logout
  const logout = () => signOut(auth);

  // Function to handle user registration
  const register = (email, password) => createUserWithEmailAndPassword(auth, email, password);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);

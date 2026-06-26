import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { auth, db } from '../firebase';
import { signInWithPopup, signOut, GoogleAuthProvider, onAuthStateChanged, updateProfile as updateFirebaseProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  loginWithGoogle: (customName?: string) => Promise<User>;
  switchUser: (userId: string) => void;
  logout: () => Promise<void>;
  updateCurrentUser: (data: Partial<User>) => void;
  isLoginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const COLLECTIONS = {
  USERS: 'users'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, get their profile from Firestore
        const userRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          const user: User = {
            UserID: firebaseUser.uid,
            GoogleID: firebaseUser.uid,
            Name: data.Name || firebaseUser.displayName || '',
            Username: data.Username || firebaseUser.email?.split('@')[0] || '',
            Avatar: data.Avatar || firebaseUser.photoURL || '',
            Bio: data.Bio || '',
            JoinedAt: data.JoinedAt instanceof Timestamp ? data.JoinedAt.toDate().toISOString() : new Date().toISOString()
          };
          setCurrentUser(user);
        } else {
          // Create new user document
          const newUser: User = {
            UserID: firebaseUser.uid,
            GoogleID: firebaseUser.uid,
            Name: firebaseUser.displayName || 'New User',
            Username: firebaseUser.email?.split('@')[0] || `user_${firebaseUser.uid.slice(0, 8)}`,
            Avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
            Bio: 'Just joined Pears! 🍐',
            JoinedAt: new Date().toISOString()
          };
          
          await setDoc(userRef, {
            GoogleID: newUser.GoogleID,
            Name: newUser.Name,
            Username: newUser.Username,
            Avatar: newUser.Avatar,
            Bio: newUser.Bio,
            JoinedAt: serverTimestamp()
          });
          
          setCurrentUser(newUser);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (customName?: string): Promise<User> => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Update profile if custom name provided
    if (customName) {
      await updateFirebaseProfile(result.user, {
        displayName: customName
      });
      
      const userRef = doc(db, COLLECTIONS.USERS, result.user.uid);
      await setDoc(userRef, {
        Name: customName,
        GoogleID: result.user.uid,
        Username: customName.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 1000),
        Avatar: result.user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${customName}`,
        Bio: 'Just joined Pears via Google OAuth! 🍐 ✨',
        JoinedAt: serverTimestamp()
      }, { merge: true });
    }
    
    // The onAuthStateChanged will handle setting the currentUser
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userRef = doc(db, COLLECTIONS.USERS, user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            resolve({
              UserID: user.uid,
              GoogleID: user.uid,
              Name: data.Name || user.displayName || '',
              Username: data.Username || user.email?.split('@')[0] || '',
              Avatar: data.Avatar || user.photoURL || '',
              Bio: data.Bio || '',
              JoinedAt: data.JoinedAt instanceof Timestamp ? data.JoinedAt.toDate().toISOString() : new Date().toISOString()
            });
          }
          unsubscribe();
        }
      });
    });
  };

  const switchUser = (userId: string) => {
    // For switching between demo users, we'd need a different approach
    // This is mainly for development/demo purposes
    console.log('Switching to user:', userId);
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setLoginModalOpen(false);
  };

  const updateCurrentUser = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    
    // Update Firestore
    const userRef = doc(db, COLLECTIONS.USERS, currentUser.UserID);
    setDoc(userRef, {
      Name: data.Name,
      Bio: data.Bio,
      Avatar: data.Avatar,
      Username: data.Username
    }, { merge: true });
    
    // Update Firebase Auth profile if name changed
    if (data.Name && auth.currentUser) {
      updateFirebaseProfile(auth.currentUser, { displayName: data.Name });
    }
    
    setCurrentUser(updated);
  };

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loginWithGoogle,
        switchUser,
        logout,
        updateCurrentUser,
        isLoginModalOpen,
        setLoginModalOpen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

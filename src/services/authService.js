// ============================================
// src/services/authService.js
// Authentication Service
// ============================================

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Set persistence
setPersistence(auth, browserLocalPersistence);

// Sign Up (Register)
export const signUp = async (email, password, userData) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save user profile to Firestore
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            fullName: userData.fullName || '',
            role: userData.role || 'coach', // coach or client
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return user;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Sign In (Login)
export const signIn = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Sign Out (Logout)
export const logOut = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        throw new Error(error.message);
    }
};

// Get Current User
export const getCurrentUser = () => {
    return auth.currentUser;
};

// Get User by ID from Firestore
export const getUserProfile = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return userDoc.data();
        }
        return null;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Listen to Auth State Changes
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

// Update User Profile
export const updateUserProfile = async (uid, updates) => {
    try {
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, {
            ...updates,
            updatedAt: new Date()
        }, { merge: true });
    } catch (error) {
        throw new Error(error.message);
    }
};

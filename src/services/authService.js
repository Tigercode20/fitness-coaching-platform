// ============================================
// src/services/authService.js
// Authentication Service - Back4App (Parse)
// ============================================

import Parse from './back4app';

// Simple event system for auth changes
const listeners = [];

const notifyListeners = (user) => {
    listeners.forEach(callback => callback(user));
};

// Sign Up (Register)
export const signUp = async (email, password, userData) => {
    try {
        const user = new Parse.User();
        // Use email as username for simplicity
        user.set("username", email);
        user.set("password", password);
        user.set("email", email);

        // Extended attributes
        if (userData.fullName) user.set("fullName", userData.fullName);
        if (userData.role) user.set("role", userData.role || 'coach');

        await user.signUp();
        notifyListeners(user);
        return user;
    } catch (error) {
        throw new Error(`Registration failed: ${error.message}`);
    }
};

// Sign In (Login)
export const signIn = async (email, password) => {
    try {
        const user = await Parse.User.logIn(email, password);
        notifyListeners(user);
        return user;
    } catch (error) {
        throw new Error(`Login failed: ${error.message}`);
    }
};

// Sign Out (Logout)
export const logOut = async () => {
    try {
        await Parse.User.logOut();
        notifyListeners(null);
    } catch (error) {
        throw new Error(`Logout failed: ${error.message}`);
    }
};

// Get Current User (Sync)
export const getCurrentUser = () => {
    return Parse.User.current();
};

// Get User by ID (Parse.User)
export const getUserProfile = async (userId) => {
    try {
        // Security Query: You can only fetch users if CLP/ACL allows.
        // Usually User class is protected.
        // If we need public profiles, we might query or use Cloud Code.
        // For now, assume we're fetching current user or admin access.
        const query = new Parse.Query(Parse.User);
        const user = await query.get(userId);
        return {
            id: user.id,
            ...user.attributes
        };
    } catch (error) {
        // Fallback: If querying other users isn't allowed, return null or handle gracefully
        // For Dashboard, we mostly need current user.
        console.warn("Could not fetch user profile:", error);
        return null;
    }
};

// Listen to Auth State Changes
// Emulates Firebase's onAuthStateChanged
export const onAuthChange = (callback) => {
    listeners.push(callback);

    // Immediate callback with current state
    const currentUser = Parse.User.current();
    // Parse loads form local storage synchronously usually, 
    // but verifying session might be async. 
    // For UI flicker prevention, we assume current() is valid if present.
    callback(currentUser);

    // Return unsubscribe function
    return () => {
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    };
};

// Update User Profile
export const updateUserProfile = async (userId, updates) => {
    try {
        const currentUser = Parse.User.current();
        if (currentUser && currentUser.id === userId) {
            Object.keys(updates).forEach(key => {
                currentUser.set(key, updates[key]);
            });
            await currentUser.save();
            notifyListeners(currentUser);
        } else {
            // Admin update or other user?
            // Without Cloud Code, users can usually only update themselves.
            throw new Error("Cannot update other users directly.");
        }
    } catch (error) {
        throw new Error(`Update failed: ${error.message}`);
    }
};

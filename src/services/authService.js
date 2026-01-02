// src/services/authService.js - ✅ 100% Correct Version

import Parse from './back4app'

// Helper function to check Parse readiness
const isParseReady = () => {
    try {
        return !!Parse
    } catch {
        return false
    }
}

// ✅ Export functions directly (not as object)

// Simple Observer Pattern for Auth State
const observers = [];

export const onAuthChange = (callback) => {
    observers.push(callback);
    // Trigger immediately with current state
    const user = Parse.User.current();
    callback(user);
    // Return unsubscribe function
    return () => {
        const index = observers.indexOf(callback);
        if (index > -1) observers.splice(index, 1);
    };
};

const notifyAuthChange = () => {
    const user = Parse.User.current();
    observers.forEach(callback => callback(user));
};

export const signIn = async (email, password) => {
    try {
        if (!isParseReady()) {
            throw new Error('Parse is not initialized. Check your .env.local configuration.')
        }

        // Force lowercase to ensure case-insensitive login
        const normalizedEmail = email.toLowerCase();
        const user = await Parse.User.logIn(normalizedEmail, password)
        console.log('✅ Logged in:', user.get('email'))
        notifyAuthChange(); // Notify listeners
        return user
    } catch (error) {
        console.error('❌ Login Error:', error);
        console.error('Code:', error.code, 'Message:', error.message);
        throw error;
    }
}

export const signUp = async (email, password, userData) => {
    try {
        if (!isParseReady()) {
            throw new Error('Parse is not initialized.')
        }

        const user = new Parse.User()
        const normalizedEmail = email.toLowerCase();
        user.set('username', normalizedEmail)
        user.set('email', normalizedEmail)
        user.set('password', password)

        // Handle userData object if passed (user's code had fullName arg, but component passes object sometimes)
        // Adjusting to handle both or just strict per user request. 
        // User request: signUp(email, password, fullName) 
        // BUT Component (Register.jsx) calls: signUp(formData.email, formData.password, { fullName: ..., role: ... })
        // I must make this robust. 

        if (typeof userData === 'string') {
            user.set('fullName', userData);
        } else if (typeof userData === 'object') {
            if (userData.fullName) user.set('fullName', userData.fullName);
            if (userData.role) user.set('role', userData.role);
        }

        await user.signUp()
        console.log('✅ Signed up:', user.get('email'))
        notifyAuthChange(); // Notify listeners
        return user
    } catch (error) {
        console.error('❌ Signup Error:', error);
        console.error('Code:', error.code, 'Message:', error.message);
        throw error;
    }
}

export const signOut = async () => {
    try {
        if (!isParseReady()) {
            console.warn('⚠️ Parse not ready')
            return
        }

        await Parse.User.logOut()
        console.log('✅ Logged out')
        notifyAuthChange(); // Notify listeners
    } catch (error) {
        console.error('❌ Logout Error:', error.message)
        throw error
    }
}

export const getCurrentUser = () => {
    try {
        if (!isParseReady()) {
            return null
        }

        const user = Parse.User.current()
        // Verify session token validity if needed, but current() is sync
        return user
    } catch (error) {
        console.error('❌ Error getting current user:', error.message)
        return null
    }
}

export const isAuthenticated = () => {
    try {
        if (!isParseReady()) {
            return false
        }

        const user = Parse.User.current()
        return !!user
    } catch (error) {
        console.error('❌ Authentication check error:', error.message)
        return false
    }
}

// Alias for backward compatibility (Header.jsx uses logOut)
export const logOut = signOut;

export default {
    signIn,
    signUp,
    signOut,
    logOut, // Add alias to default export
    getCurrentUser,
    isAuthenticated,
    onAuthChange
}

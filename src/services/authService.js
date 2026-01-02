// src/services/authService.js - ✅ Safe Version
import Parse, { isParseReady } from './back4app';

// Ensure Parse is ready
if (!isParseReady()) {
    console.warn('⚠️ Parse is not ready yet. Auth service may not work properly.');
}

export const authService = {
    // Login
    login: async (email, password) => {
        try {
            if (!isParseReady()) {
                throw new Error('Parse is not initialized. Check your .env.local configuration.');
            }
            const user = await Parse.User.logIn(email, password);
            console.log('✅ Logged in:', user.get('email'));
            return user;
        } catch (error) {
            console.error('❌ Login error:', error.message);
            throw error;
        }
    },

    // Signup
    signup: async (email, password, fullName) => {
        try {
            if (!isParseReady()) {
                throw new Error('Parse is not initialized.');
            }
            const user = new Parse.User();
            user.set('username', email); // Back4App uses username for auth
            user.set('email', email);
            user.set('password', password);
            user.set('fullName', fullName);
            user.set('role', 'coach'); // Default role

            await user.signUp();
            console.log('✅ Signed up:', user.get('email'));
            return user;
        } catch (error) {
            console.error('❌ Signup error:', error.message);
            throw error;
        }
    },

    // Logout
    logOut: async () => {
        try {
            if (!isParseReady()) {
                console.warn('⚠️ Parse not ready, but clearing local state');
                return;
            }
            await Parse.User.logOut();
            console.log('✅ Logged out');
        } catch (error) {
            console.error('❌ Logout error:', error.message);
            throw error;
        }
    },

    // Get Current User
    getCurrentUser: () => {
        try {
            if (isParseReady()) {
                return Parse.User.current();
            }
            return null; // Return null if not ready
        } catch (error) {
            console.error('❌ getCurrentUser error:', error.message);
            return null;
        }
    },

    // onAuthChange listener
    onAuthChange: (callback) => {
        // Since Parse is synchronous mostly regarding current user state in local storage,
        // we can call immediately.
        // Real-time auth changes in Parse are less event-driven than Firebase,
        // usually requiring a check on mount.
        const user = Parse.User.current();
        callback(user);

        // Return dummy unsubscribe
        return () => { };
    }
};

export default authService;

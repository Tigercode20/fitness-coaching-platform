// src/services/back4app.js - ✅ Robust Version

import ParsePackage from 'parse';

// Handle ES Module / CommonJS interoperability (Fix "y is not a constructor")
// If vite.config.js alias is working, this might simply be the object, but this check is safe.
const Parse = ParsePackage.default || ParsePackage;

// Environment Variables
// ADAPTATION: Using VITE_PARSE_... as these are the keys configured in your .env.local
const PARSE_APPLICATION_ID = import.meta.env.VITE_PARSE_APPLICATION_ID;
const PARSE_JAVASCRIPT_KEY = import.meta.env.VITE_PARSE_JAVASCRIPT_KEY;
const PARSE_HOST_URL = 'https://parseapi.back4app.com/';

console.log('🔍 Checking Environment Variables:');
console.log('APP_ID:', PARSE_APPLICATION_ID ? '✅ Present' : '❌ Missing');
console.log('JS_KEY:', PARSE_JAVASCRIPT_KEY ? '✅ Present' : '❌ Missing');

// Initialize Parse
if (PARSE_APPLICATION_ID && PARSE_JAVASCRIPT_KEY) {
    try {
        // Ensure initialize is a function before calling
        if (typeof Parse.initialize === 'function') {
            Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);
            Parse.serverURL = PARSE_HOST_URL;
            console.log('✅ Parse initialized successfully');
            console.log(`📡 Server: ${PARSE_HOST_URL}`);
        } else {
            console.error('❌ Error: Parse.initialize is not a function. Check import/version.');
        }
    } catch (error) {
        console.error('❌ Error initializing Parse:', error);
    }
} else {
    console.error('❌ Missing environment variables! Check .env.local');
}

// Export Parse
export default Parse;

// Helper to check readiness
export const isParseReady = () => {
    return !!(PARSE_APPLICATION_ID && PARSE_JAVASCRIPT_KEY && typeof Parse.initialize === 'function');
};

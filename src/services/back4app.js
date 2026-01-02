// src/services/back4app.js - ✅ Simplified Browser Version

import ParsePkg from 'parse';

// robust logic: If the alias returns a module wrapper, use window.Parse
const Parse = (typeof ParsePkg.initialize === 'function')
    ? ParsePkg
    : (window.Parse || ParsePkg.default || ParsePkg);

// Environment Variables
const PARSE_APPLICATION_ID = import.meta.env.VITE_PARSE_APPLICATION_ID;
const PARSE_JAVASCRIPT_KEY = import.meta.env.VITE_PARSE_JAVASCRIPT_KEY;
const PARSE_HOST_URL = 'https://parseapi.back4app.com/';

console.log('🔍 Checking Environment Variables:');
console.log('APP_ID:', PARSE_APPLICATION_ID ? '✅ Present' : '❌ Missing');
console.log('JS_KEY:', PARSE_JAVASCRIPT_KEY ? '✅ Present' : '❌ Missing');

// Initialize Parse
if (PARSE_APPLICATION_ID && PARSE_JAVASCRIPT_KEY) {
    try {
        // Direct initialization - trusting the alias
        Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);
        Parse.serverURL = PARSE_HOST_URL;
        console.log('✅ Parse initialized successfully');
        console.log(`📡 Server: ${PARSE_HOST_URL}`);
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

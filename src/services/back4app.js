// src/services/back4app.js
import ParsePkg from 'parse';

// Handle ES Module / CommonJS interoperability (Fix "y is not a constructor")
const Parse = ParsePkg.default || ParsePkg;

// Environment Variables (Using existing project keys)
const PARSE_APPLICATION_ID = import.meta.env.VITE_PARSE_APPLICATION_ID;
const PARSE_JAVASCRIPT_KEY = import.meta.env.VITE_PARSE_JAVASCRIPT_KEY;
const PARSE_HOST_URL = 'https://parseapi.back4app.com/';

// Validation
if (!PARSE_APPLICATION_ID || !PARSE_JAVASCRIPT_KEY) {
    console.error('❌ Error: Missing Back4App Credentials in .env.local');
    console.error({
        PARSE_APPLICATION_ID,
        PARSE_JAVASCRIPT_KEY
    });
}

// Initialize Parse
if (typeof Parse.initialize === 'function') {
    Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);
    Parse.serverURL = PARSE_HOST_URL;

    console.log('✅ Parse initialized successfully');
    console.log(`📡 Server: ${PARSE_HOST_URL}`);
} else {
    console.error('❌ Parse SDK failed to initialize: Parse.initialize is not a function', Parse);
}

export default Parse;

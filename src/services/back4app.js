import ParsePackage from 'parse';

// Handle ES Module / CommonJS interoperability issues
const Parse = ParsePackage.default || ParsePackage;

const PARSE_APPLICATION_ID = import.meta.env.VITE_PARSE_APPLICATION_ID;
const PARSE_JAVASCRIPT_KEY = import.meta.env.VITE_PARSE_JAVASCRIPT_KEY;
const PARSE_HOST_URL = 'https://parseapi.back4app.com/';

// Initialize Parse
if (Parse.initialize) {
    Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);
    Parse.serverURL = PARSE_HOST_URL;
} else {
    console.error('Parse SDK failed to initialize: initialize method not found');
}

export default Parse;

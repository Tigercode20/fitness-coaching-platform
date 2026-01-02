import ParseDist from 'parse/dist/parse.min.js';

// In some bundlers/environments, the UMD build is wrapped in 'default'
const Parse = ParseDist.default || ParseDist;

const PARSE_APPLICATION_ID = import.meta.env.VITE_PARSE_APPLICATION_ID;
const PARSE_JAVASCRIPT_KEY = import.meta.env.VITE_PARSE_JAVASCRIPT_KEY;
const PARSE_HOST_URL = 'https://parseapi.back4app.com/';

// Initialize Parse
if (typeof Parse.initialize === 'function') {
    Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);
    Parse.serverURL = PARSE_HOST_URL;
} else {
    // Fallback or critical error logging
    console.error('Parse SDK failed to initialize. Import might be incorrect.', Parse);
}

export default Parse;

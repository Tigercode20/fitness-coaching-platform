import Parse from 'parse';

const PARSE_APPLICATION_ID = import.meta.env.VITE_PARSE_APPLICATION_ID;
const PARSE_JAVASCRIPT_KEY = import.meta.env.VITE_PARSE_JAVASCRIPT_KEY;
const PARSE_HOST_URL = 'https://parseapi.back4app.com/';

Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);
Parse.serverURL = PARSE_HOST_URL;

export default Parse;

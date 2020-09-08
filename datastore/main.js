import getFirebaseConfig from './firebaseConfig';
const firebase = require("firebase");
// Required for side-effects
require("firebase/firestore");

// Initialize Firestore through Firebase
// Your web app's Firebase configuration
const firebaseConfig = getFirebaseConfig(); // Contains personal API-keys, will not push to GIT

export function init() {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    return firebase.firestore();
}
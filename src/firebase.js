import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {

  apiKey: "AIzaSyCzBqOhwDgwcvqeAOK51-ZV6tgiibzqKR0",

  authDomain: "tattoo-do-db.firebaseapp.com",

  projectId: "tattoo-do-db",

  storageBucket: "tattoo-do-db.firebasestorage.app",

  messagingSenderId: "880236910240",

  appId: "1:880236910240:web:f7602760557d0e3d45dbc5"

};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

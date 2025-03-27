import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDIjtMkpnshJf0F7XHAHM7j0KSu5p6568s",
  authDomain: "seagold-dormitory-b8825.firebaseapp.com",
  projectId: "seagold-dormitory-b8825",
  storageBucket: "seagold-dormitory-b8825.firebasestorage.app",
  messagingSenderId: "888583912360",
  appId: "1:888583912360:web:48e92578de1e07e7d8fb9d",
  measurementId: "G-ZH6LN55SQ4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };

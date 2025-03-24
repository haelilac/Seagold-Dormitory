import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDyW7dYAuSY-h6A-cRxY2cnVJMLjdm4iqw",
  authDomain: "seagold-dormitory.firebaseapp.com",
  projectId: "seagold-dormitory",
  storageBucket: "seagold-dormitory.appspot.com",
  messagingSenderId: "780268349056",
  appId: "1:780268349056:web:8c21b3b7ccc1e05aeee865",
  measurementId: "G-S5S0TWMJG9",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };

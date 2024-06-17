// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-9fb78.firebaseapp.com",
  projectId: "mern-estate-9fb78",
  storageBucket: "mern-estate-9fb78.appspot.com",
  messagingSenderId: "209753119229",
  appId: "1:209753119229:web:62ffb3d01168fe8309a194"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
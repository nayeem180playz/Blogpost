// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// আপনার ওয়েব অ্যাপের Firebase কনফিগারেশন
// এই কোডটি আপনার নিজের Firebase প্রজেক্টের কোড দিয়ে পরিবর্তন করুন
const firebaseConfig = {
  apiKey: "AIzaSyD0y11QkKqT5eZU9Zwu2GRYH9_W7hn2OIg",
  authDomain: "blogpost-aed2a.firebaseapp.com",
  projectId: "blogpost-aed2a",
  storageBucket: "blogpost-aed2a.appspot.com",
  messagingSenderId: "756232300705",
  appId: "1:756232300705:web:30c32fd2034462035ba8e0",
  measurementId: "G-WM7LXBR0NL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Export the services for other files to use
export { db, auth };
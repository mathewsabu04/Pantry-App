// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDGcPYDyDGUNOjnVOkrOnytmr9jNcbi4N8",
  authDomain: "pantry-7a843.firebaseapp.com",
  projectId: "pantry-7a843",
  storageBucket: "pantry-7a843.appspot.com",
  messagingSenderId: "543613247412",
  appId: "1:543613247412:web:647afd0167e5df285e5ce1",
  measurementId: "G-4Z8QRWQ0HK",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app);
export { firestore };

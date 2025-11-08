// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyATkdKykKMU4ud3IjR3nKaLgXAMaFdwSvc",
	authDomain: "on1-slot-table.firebaseapp.com",
	projectId: "on1-slot-table",
	storageBucket: "on1-slot-table.firebasestorage.app",
	messagingSenderId: "1071114704658",
	appId: "1:1071114704658:web:5d2fa59b90d348bd0445cb",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

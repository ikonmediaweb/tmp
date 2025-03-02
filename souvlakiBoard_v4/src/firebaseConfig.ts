// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD-AL-qrZQLz_EtPbhwLJr9z4a6oSi2Tnw",
    authDomain: "ikon-437918.firebaseapp.com",
    projectId: "ikon-437918",
    storageBucket: "ikon-437918.firebasestorage.app",
    messagingSenderId: "1031746044856",
    appId: "1:1031746044856:web:11c25d6f0e4071ef90854d",
    measurementId: "G-T63PJ54Q7B"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);

export { storage };
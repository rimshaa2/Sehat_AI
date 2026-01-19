// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAV1MDVnxHfGQqWF4Yfxa2Leuklxv6HDtk",
  authDomain: "sehatai-eeaff.firebaseapp.com",
  projectId: "sehatai-eeaff",
  storageBucket: "sehatai-eeaff.firebasestorage.app",
  messagingSenderId: "839845740526",
  appId: "1:839845740526:web:8c6c6ea9137fd032b698ff",
  measurementId: "G-RMWJNG78GK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
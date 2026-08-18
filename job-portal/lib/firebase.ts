import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBw8qt6i9VSCh7TEuMIDbWfjImjRFz0viI",
  authDomain: "jobportal-cad89.firebaseapp.com",
  projectId: "jobportal-cad89",
  storageBucket: "jobportal-cad89.firebasestorage.app",
  messagingSenderId: "12278383599",
  appId: "1:12278383599:web:53daed3af3ea9f63426c1a",
  measurementId: "G-EX0C705L6J"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
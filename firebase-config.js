// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDmzoGaLuEOe2Uo8YnSZntwIcfX7xRM4zo",
  authDomain: "coresautomotivas-8dc74.firebaseapp.com",
  projectId: "coresautomotivas-8dc74",
  storageBucket: "coresautomotivas-8dc74.appspot.com",
  messagingSenderId: "812517375586",
  appId: "1:812517375586:web:0254015431d25acce8db3b",
  measurementId: "G-W0XT2Q6MQ0"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

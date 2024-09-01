import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyCOAXcv0DjffLl2cKvJ3sMQ5m48e35DZSE",
    authDomain: "vegicledash.firebaseapp.com",
    projectId: "vegicledash",
    storageBucket: "vegicledash.appspot.com",
    messagingSenderId: "1024206560167",
    appId: "1:1024206560167:web:72588f785a7384f5957482",
    measurementId: "G-BCGJ73KNXR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };

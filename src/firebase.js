// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: 'AIzaSyCzLAMu5dQRc0_kp6uLVLNR6NlNZebIOLI',
  authDomain: 'ihd-prediction-system.firebaseapp.com',
  projectId: 'ihd-prediction-system',
  storageBucket: 'ihd-prediction-system.appspot.com',
  messagingSenderId: '502357356443',
  appId: '1:502357356443:web:61de42e3a0fbd2b19abb3e',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app

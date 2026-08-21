import { initializeApp } from 'firebase/app'
import { GoogleAuthProvider, getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyB74MAFsL-pqpqD8IrjPfBSwbbJh19VkwI',
  authDomain: 'worksheet-wizard-giri.firebaseapp.com',
  projectId: 'worksheet-wizard-giri',
  storageBucket: 'worksheet-wizard-giri.firebasestorage.app',
  messagingSenderId: '323998203920',
  appId: '1:323998203920:web:22fbede0812aa638388a95',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app, 'wizard')

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

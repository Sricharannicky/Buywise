import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDXWuaO0SRfDvpSyT2qsbMo4C8emwDWwmQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "buywise-46926.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "buywise-46926",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "buywise-46926.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "689032723517",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:689032723517:web:eff37bc1d0ac828c79be54",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-7R8P06EPNL",
}

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export async function signInWithGoogleFirebase() {
  const result = await signInWithPopup(auth, googleProvider)
  const user = result.user
  const idToken = await user.getIdToken()

  const displayName = user.displayName?.trim() || ''
  const nameParts = displayName ? displayName.split(/\s+/) : []
  const firstName = nameParts[0] || (user.email ? user.email.split('@')[0] : 'Google')
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'User'

  return {
    firebaseUser: user,
    idToken,
    email: user.email,
    firstName,
    lastName,
    photoURL: user.photoURL,
  }
}

export async function signOutFirebase() {
  try {
    await signOut(auth)
  } catch (err) {
    console.error('Firebase sign out error:', err)
  }
}

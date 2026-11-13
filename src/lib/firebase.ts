import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth'

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDXWuaO0SRfDvpSyT2qsbMo4C8emwDWwmQ',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'buywise-46926.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'buywise-46926',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'buywise-46926.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '689032723517',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:689032723517:web:eff37bc1d0ac828c79be54',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-7R8P06EPNL',
}

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

// Suppress known Firebase JS SDK internal assertion warning when popup closes
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reasonMsg = String(event.reason?.message || event.reason || '')
    if (reasonMsg.includes('Pending promise was never set') || reasonMsg.includes('INTERNAL ASSERTION FAILED')) {
      event.preventDefault()
      console.warn('[Firebase Auth] Handled pending promise assertion cleanly.')
    }
  })
}

export async function formatFirebaseUser(user: FirebaseUser) {
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

export async function signInWithGoogleFirebase() {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return await formatFirebaseUser(result.user)
  } catch (err: any) {
    // If the auth was actually completed despite an internal race condition/popup closure check
    if (auth.currentUser) {
      return await formatFirebaseUser(auth.currentUser)
    }

    // If it was the internal assertion or quick close, listen to onAuthStateChanged for 1.5s
    const errMsg = String(err?.message || '')
    if (errMsg.includes('Pending promise was never set') || errMsg.includes('INTERNAL ASSERTION')) {
      const detectedUser = await new Promise<FirebaseUser | null>((resolve) => {
        const timeout = setTimeout(() => resolve(null), 1500)
        const unsubscribe = onAuthStateChanged(auth, (u) => {
          if (u) {
            clearTimeout(timeout)
            unsubscribe()
            resolve(u)
          }
        })
      })

      if (detectedUser) {
        return await formatFirebaseUser(detectedUser)
      }
    }

    throw err
  }
}

export async function signOutFirebase() {
  try {
    await signOut(auth)
  } catch (err) {
    console.error('Firebase sign out error:', err)
  }
}

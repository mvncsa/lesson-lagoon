import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  type Auth,
  type User as FirebaseUser,
} from 'firebase/auth';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'lesson-lagoon.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'lesson-lagoon',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'lesson-lagoon.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
};

function hasValidApiKey(): boolean {
  return typeof firebaseConfig.apiKey === 'string' && firebaseConfig.apiKey.length > 5;
}

/**
 * Safely obtain Firebase App instance (never throws during SSR or static prerendering)
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === 'undefined') return null; // Never run during Next.js server prerender
  if (!hasValidApiKey()) return null;

  try {
    return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  } catch (err) {
    console.warn('Firebase App initialization warning:', err);
    return null;
  }
}

/**
 * Safely obtain Firebase Auth instance on client
 */
export function getFirebaseAuth(): Auth | null {
  const fbApp = getFirebaseApp();
  if (!fbApp) return null;
  try {
    return getAuth(fbApp);
  } catch (err) {
    console.warn('Firebase Auth initialization warning:', err);
    return null;
  }
}

/**
 * Sign in using Firebase Google popup with automatic redirect fallback (called in browser only)
 */
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  if (typeof window === 'undefined') return null;

  const authInstance = getFirebaseAuth();
  if (!authInstance) {
    throw new Error('Firebase Auth is not initialized. Please verify NEXT_PUBLIC_FIREBASE_API_KEY.');
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account',
  });

  try {
    const userCredential = await signInWithPopup(authInstance, provider);
    return userCredential.user;
  } catch (err: any) {
    if (err?.code === 'auth/popup-blocked') {
      console.info('Google popup was blocked by browser. Falling back to redirect sign-in.');
      await signInWithRedirect(authInstance, provider);
      return null;
    }
    throw err;
  }
}

/**
 * Check if a user just signed in via redirect (called on client mount)
 */
export async function checkRedirectSignIn(): Promise<FirebaseUser | null> {
  if (typeof window === 'undefined') return null;
  const authInstance = getFirebaseAuth();
  if (!authInstance) return null;

  try {
    const result = await getRedirectResult(authInstance);
    return result ? result.user : null;
  } catch (err) {
    console.warn('Firebase redirect sign-in check:', err);
    return null;
  }
}

/**
 * Sign out of Firebase Auth
 */
export async function logOutFirebase(): Promise<void> {
  if (typeof window === 'undefined') return;
  const authInstance = getFirebaseAuth();
  if (authInstance) {
    await firebaseSignOut(authInstance);
  }
}

// Analytics only initialized in browser when supported
export let analytics: Analytics | null = null;

if (typeof window !== 'undefined') {
  const fbApp = getFirebaseApp();
  if (fbApp) {
    isSupported()
      .then((supported) => {
        if (supported) {
          analytics = getAnalytics(fbApp);
        }
      })
      .catch(() => {});
  }
}

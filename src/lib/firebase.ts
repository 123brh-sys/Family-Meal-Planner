import AsyncStorage from '@react-native-async-storage/async-storage';
// The `firebase/auth` wrapper package's export map doesn't carry a "react-native"
// condition, so it never surfaces `getReactNativePersistence` — import straight
// from the underlying `@firebase/auth` package, whose RN build does.
import { getReactNativePersistence, initializeAuth, getAuth, type Auth } from '@firebase/auth';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  // initializeAuth throws if already called (e.g. fast refresh) — fall back to getAuth.
  auth = getAuth(app);
}

// Offline persistence (long-polling avoids some React Native networking edge cases).
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export const functions = getFunctions(app);

export { app, auth };

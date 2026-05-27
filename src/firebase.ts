/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Safely load the firebase-applet-config.json file dynamically if it exists,
// without causing compilation or bundling errors when the file is missing/deleted.
let appletConfig: any = {};
try {
  const metaObject = import.meta as any;
  const modules = metaObject.glob('../firebase-applet-config.json', { eager: true });
  const keys = Object.keys(modules);
  if (keys.length > 0) {
    appletConfig = modules[keys[0]].default || modules[keys[0]] || {};
  }
} catch (e) {
  // Graceful fallback
}

const envObject = (import.meta as any).env || {};
const configObj = appletConfig || {};

const firebaseConfig = {
  projectId: envObject.VITE_FIREBASE_PROJECT_ID || configObj.projectId || 'placeholder-id',
  appId: envObject.VITE_FIREBASE_APP_ID || configObj.appId || 'placeholder-appid',
  apiKey: envObject.VITE_FIREBASE_API_KEY || configObj.apiKey || 'placeholder-apikey',
  authDomain: envObject.VITE_FIREBASE_AUTH_DOMAIN || configObj.authDomain || 'placeholder-authdomain',
  storageBucket: envObject.VITE_FIREBASE_STORAGE_BUCKET || configObj.storageBucket || 'placeholder-bucket',
  messagingSenderId: envObject.VITE_FIREBASE_MESSAGING_SENDER_ID || configObj.messagingSenderId || 'placeholder-senderid',
};

// Export whether real Firebase credentials are loaded
export const isFirebaseConfigured = 
  firebaseConfig.projectId && 
  firebaseConfig.apiKey && 
  !firebaseConfig.projectId.includes('placeholder') &&
  !firebaseConfig.apiKey.includes('placeholder');

const app = initializeApp(firebaseConfig);
const firestoreDbId = envObject.VITE_FIREBASE_FIRESTORE_DATABASE_ID || configObj.firestoreDatabaseId || undefined;
export const db = getFirestore(app, firestoreDbId); /* CRITICAL: The app will break without this line */
export const auth = getAuth();

// --- Firestore Error Handling & Info Logging ---
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Verification connection logic on startup
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

if (isFirebaseConfigured) {
  testConnection();
}

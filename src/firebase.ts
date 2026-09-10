import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  getDoc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { YearlyPlans, DistributionLocation, FullReportData } from './types';

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// CRITICAL: Must supply databaseId from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error Handling Specification
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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
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

// Connection test on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline, will retry when network is ready.');
    }
    return false;
  }
}

// Run connection validation immediately on module load
testConnection().catch(() => {});

// User Profile Types & Operations
export interface UserProfileData {
  userId: string;
  email: string;
  displayName: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

export async function saveUserProfile(userId: string, profile: { displayName: string; email: string; role?: string }): Promise<void> {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    const existing = await getDoc(docRef);
    const now = new Date().toISOString();
    
    const data: UserProfileData = {
      userId,
      email: profile.email,
      displayName: profile.displayName || profile.email.split('@')[0],
      role: profile.role || 'Staff Program Yayasan',
      createdAt: existing.exists() ? existing.data().createdAt || now : now,
      updatedAt: now,
    };
    
    await setDoc(docRef, data, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getUserProfile(userId: string): Promise<UserProfileData | null> {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserProfileData;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

// App State Persistence Operations
export interface CloudAppState {
  userId: string;
  yearlyPlans: YearlyPlans;
  locations: DistributionLocation[];
  reportData: FullReportData;
  updatedAt: string;
}

export async function saveUserAppData(
  userId: string, 
  payload: { yearlyPlans: YearlyPlans; locations: DistributionLocation[]; reportData: FullReportData }
): Promise<void> {
  const path = `users/${userId}/data/appState`;
  try {
    const docRef = doc(db, 'users', userId, 'data', 'appState');
    const cloudData: CloudAppState = {
      userId,
      yearlyPlans: payload.yearlyPlans,
      locations: payload.locations,
      reportData: payload.reportData,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, cloudData);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function loadUserAppData(userId: string): Promise<CloudAppState | null> {
  const path = `users/${userId}/data/appState`;
  try {
    const docRef = doc(db, 'users', userId, 'data', 'appState');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as CloudAppState;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export function subscribeUserAppData(
  userId: string,
  onData: (data: CloudAppState) => void,
  onError?: (error: Error) => void
): () => void {
  const path = `users/${userId}/data/appState`;
  const docRef = doc(db, 'users', userId, 'data', 'appState');
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onData(snap.data() as CloudAppState);
      }
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

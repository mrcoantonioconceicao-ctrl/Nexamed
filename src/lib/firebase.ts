import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  getDocFromServer,
  Firestore
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged,
  updateProfile,
  Auth,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  ClinicalEvolution, 
  Resident, 
  HandoverLog, 
  MedicationMAR, 
  AuditLogEntry, 
  PASRecord, 
  AppointmentRecord, 
  FunctionalScaleAssessment,
  BackupSnapshot
} from '../types';
import { RegisteredUser } from '../config/auth-mode';

const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

/**
 * Indicates whether a real Firebase configuration has been provided via environment variables.
 * Fallback placeholders or empty keys are treated as unconfigured to prevent offline connection errors.
 */
export const isFirebaseConfigured = Boolean(
  envApiKey && 
  envApiKey.trim() !== '' && 
  envApiKey !== 'True' &&
  envApiKey !== 'true' &&
  envApiKey !== 'False' &&
  envApiKey !== 'false' &&
  envApiKey.length > 15 &&
  !envApiKey.includes('Dummy') &&
  !envApiKey.includes('LocalFallback') &&
  envProjectId && 
  envProjectId.trim() !== '' && 
  envProjectId !== 'True' &&
  envProjectId !== 'true' &&
  envProjectId !== 'nexamed-srt'
);

const firebaseConfig = isFirebaseConfigured ? {
  apiKey: envApiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
  projectId: envProjectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || "(default)"
} : null;

let app: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let firebaseAuth: Auth | null = null;

if (isFirebaseConfigured && firebaseConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    firestoreDb = firebaseConfig.firestoreDatabaseId
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
    firebaseAuth = getAuth(app);
  } catch (e) {
    console.warn('Firebase initialization failed, falling back to local state:', e);
  }
}

export const db = firestoreDb;
export const auth = firebaseAuth;

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
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
    },
    operationType,
    path
  };
  console.error('Firestore Error Details:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  if (!isFirebaseConfigured || !db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase Firestore connection offline or unconfigured, maintaining local fallback.");
    }
  }
}

if (isFirebaseConfigured && db) {
  testConnection();
}

/**
 * Firebase Auth Helper: Login with Email & Password
 */
export async function loginWithEmailFirebase(email: string, pass: string) {
  if (!auth) throw new Error('Firebase Auth não inicializado.');
  const userCred = await signInWithEmailAndPassword(auth, email, pass);
  return userCred.user;
}

/**
 * Firebase Auth Helper: Register with Email & Password
 */
export async function registerWithEmailFirebase(email: string, pass: string, name: string) {
  if (!auth) throw new Error('Firebase Auth não inicializado.');
  const userCred = await createUserWithEmailAndPassword(auth, email, pass);
  if (userCred.user) {
    await updateProfile(userCred.user, { displayName: name });
  }
  return userCred.user;
}

/**
 * Firebase Auth Helper: Login with Google Popup
 */
export async function loginWithGoogleFirebase() {
  if (!auth) throw new Error('Firebase Auth não inicializado.');
  const provider = new GoogleAuthProvider();
  const userCred = await signInWithPopup(auth, provider);
  return userCred.user;
}

/**
 * Firebase Auth Helper: Sign Out
 */
export async function logoutFirebase() {
  if (!auth) return;
  await firebaseSignOut(auth);
}

/**
 * Sync or retrieve User Profile from Firestore `users` collection
 */
export async function syncUserProfile(
  fbUser: FirebaseUser, 
  additionalFields?: Partial<RegisteredUser>
): Promise<RegisteredUser> {
  const fallback: RegisteredUser = {
    id: fbUser.uid,
    name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Profissional',
    email: fbUser.email || '',
    password: '',
    role: additionalFields?.role || 'Enfermeiro Responsável Técnico (RT)',
    roleCategory: additionalFields?.roleCategory || 'ENFERMEIRA',
    documentId: additionalFields?.documentId || 'REGISTRO-001',
    unit: additionalFields?.unit || 'Residencial Salomão - Rua Dr. Pedro Zimmermann, 2391 (CEP 89066-001 - Blumenau/SC)',
    shift: additionalFields?.shift || 'Diurno (07h às 19h / 12x36)',
    avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString().split('T')[0],
    status: 'Ativo',
    ...(additionalFields || {})
  };

  if (!db) {
    return fallback;
  }

  const userDocRef = doc(db, 'users', fbUser.uid);
  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const existingData = snap.data() as RegisteredUser;
      const updated: RegisteredUser = {
        ...existingData,
        name: fbUser.displayName || existingData.name || fallback.name,
        email: fbUser.email || existingData.email || fallback.email,
        avatar: fbUser.photoURL || existingData.avatar || fallback.avatar,
        ...(additionalFields || {})
      };
      await setDoc(userDocRef, sanitizeForFirestore(updated), { merge: true });
      return updated;
    } else {
      await setDoc(userDocRef, sanitizeForFirestore(fallback));
      return fallback;
    }
  } catch (err) {
    console.error('Error syncing user profile in Firestore:', err);
    return fallback;
  }
}

// Collection References
const USERS_COL = 'users';
const EVOLUTIONS_COL = 'evolutions';
const RESIDENTS_COL = 'residents';
const HANDOVERS_COL = 'handovers';
const MEDICATIONS_COL = 'medications';
const MED_ADMINISTRATIONS_COL = 'medication_administrations';
const AUDIT_LOGS_COL = 'audit_logs';
const PAS_COL = 'pas_records';
const APPOINTMENTS_COL = 'appointments';
const SCALES_COL = 'functional_scales';
const BACKUPS_COL = 'backups';

function sanitizeForFirestore<T>(data: T): Record<string, any> {
  if (data === null || data === undefined) return {};
  return JSON.parse(JSON.stringify(data));
}

export async function deleteResidentFromDb(residentId: string) {
  if (!db) return;
  try {
    await deleteDoc(doc(db, RESIDENTS_COL, residentId));
  } catch (err) {
    console.error('Error deleting resident from Firestore:', err);
    handleFirestoreError(err, OperationType.DELETE, `residents/${residentId}`);
  }
}

export async function deleteEvolutionFromDb(evolutionId: string) {
  if (!db) return;
  try {
    await deleteDoc(doc(db, EVOLUTIONS_COL, evolutionId));
  } catch (err) {
    console.error('Error deleting evolution from Firestore:', err);
    handleFirestoreError(err, OperationType.DELETE, `evolutions/${evolutionId}`);
  }
}

export async function deleteMedicationFromDb(medicationId: string) {
  if (!db) return;
  try {
    await deleteDoc(doc(db, MEDICATIONS_COL, medicationId));
    await deleteDoc(doc(db, MED_ADMINISTRATIONS_COL, medicationId));
  } catch (err) {
    console.error('Error deleting medication from Firestore:', err);
    handleFirestoreError(err, OperationType.DELETE, `medications/${medicationId}`);
  }
}

export async function deleteHandoverFromDb(handoverId: string) {
  if (!db) return;
  try {
    await deleteDoc(doc(db, HANDOVERS_COL, handoverId));
  } catch (err) {
    console.error('Error deleting handover from Firestore:', err);
    handleFirestoreError(err, OperationType.DELETE, `handovers/${handoverId}`);
  }
}

/**
 * Purges all simulated test collections to leave database 100% clean for pilot.
 */
export async function purgeAllSimulationData() {
  if (!db) return;
  const collectionsToClean = [
    RESIDENTS_COL,
    EVOLUTIONS_COL,
    HANDOVERS_COL,
    MEDICATIONS_COL,
    MED_ADMINISTRATIONS_COL,
    AUDIT_LOGS_COL,
    PAS_COL,
    APPOINTMENTS_COL,
    SCALES_COL
  ];

  for (const colName of collectionsToClean) {
    try {
      const snap = await getDocs(collection(db, colName));
      for (const docSnap of snap.docs) {
        await deleteDoc(doc(db, colName, docSnap.id));
      }
    } catch (err) {
      console.warn(`Error purging collection ${colName}:`, err);
    }
  }
}

/**
 * Subscribe to Users / Staff collection
 */
export function subscribeUsers(
  callback: (data: RegisteredUser[]) => void,
  initialFallback: RegisteredUser[] = []
) {
  if (!db) {
    callback(initialFallback);
    return () => {};
  }
  const colRef = collection(db, USERS_COL);

  return onSnapshot(colRef, (snapshot) => {
    if (!snapshot.empty) {
      const list: RegisteredUser[] = [];
      snapshot.forEach((d) => list.push(d.data() as RegisteredUser));
      callback(list);
    } else {
      callback([]);
    }
  }, (err) => {
    console.warn('Firestore users error:', err);
    handleFirestoreError(err, OperationType.GET, USERS_COL);
  });
}

export async function saveUserToDb(user: RegisteredUser) {
  if (!db) return;
  try {
    await setDoc(doc(db, USERS_COL, user.id), sanitizeForFirestore(user), { merge: true });
  } catch (err) {
    console.error('Error saving user to Firestore:', err);
    handleFirestoreError(err, OperationType.WRITE, `users/${user.id}`);
  }
}

export const saveFirestoreUser = saveUserToDb;

export async function deleteUserFromDb(userId: string) {
  if (!db) return;
  try {
    await deleteDoc(doc(db, USERS_COL, userId));
  } catch (err) {
    console.error('Error deleting user from Firestore:', err);
    handleFirestoreError(err, OperationType.DELETE, `users/${userId}`);
  }
}

export const deleteFirestoreUser = deleteUserFromDb;

/**
 * Subscribe to Evolutions collection with real-time updates.
 */
export function subscribeEvolutions(
  callback: (data: ClinicalEvolution[]) => void,
  initialFallback: ClinicalEvolution[] = []
) {
  if (!db) {
    callback(initialFallback);
    return () => {};
  }
  const colRef = collection(db, EVOLUTIONS_COL);

  return onSnapshot(colRef, (snapshot) => {
    if (!snapshot.empty) {
      const list: ClinicalEvolution[] = [];
      snapshot.forEach((d) => list.push(d.data() as ClinicalEvolution));
      list.sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());
      callback(list);
    } else {
      callback([]);
    }
  }, (err) => {
    console.warn('Firestore evolutions error:', err);
    handleFirestoreError(err, OperationType.GET, EVOLUTIONS_COL);
  });
}

export async function saveEvolutionToDb(evolution: ClinicalEvolution) {
  if (!db) return;
  try {
    await setDoc(doc(db, EVOLUTIONS_COL, evolution.id), sanitizeForFirestore(evolution), { merge: true });
  } catch (err) {
    console.error('Error saving evolution to Firestore:', err);
    handleFirestoreError(err, OperationType.WRITE, `evolutions/${evolution.id}`);
  }
}

/**
 * Subscribe to Residents collection.
 */
export function subscribeResidents(
  callback: (data: Resident[]) => void,
  initialFallback: Resident[] = []
) {
  if (!db) {
    callback(initialFallback);
    return () => {};
  }
  const colRef = collection(db, RESIDENTS_COL);

  return onSnapshot(colRef, (snapshot) => {
    if (!snapshot.empty) {
      const list: Resident[] = [];
      snapshot.forEach((d) => list.push(d.data() as Resident));
      callback(list);
    } else {
      callback([]);
    }
  }, (err) => {
    console.warn('Firestore residents error:', err);
    handleFirestoreError(err, OperationType.GET, RESIDENTS_COL);
  });
}

export async function saveResidentToDb(resident: Resident) {
  if (!db) return;
  try {
    await setDoc(doc(db, RESIDENTS_COL, resident.id), sanitizeForFirestore(resident), { merge: true });
  } catch (err) {
    console.error('Error saving resident to Firestore:', err);
    handleFirestoreError(err, OperationType.WRITE, `residents/${resident.id}`);
  }
}

/**
 * Subscribe to Handovers collection.
 */
export function subscribeHandovers(
  callback: (data: HandoverLog[]) => void,
  initialFallback: HandoverLog[] = []
) {
  if (!db) {
    callback(initialFallback);
    return () => {};
  }
  const colRef = collection(db, HANDOVERS_COL);

  return onSnapshot(colRef, (snapshot) => {
    if (!snapshot.empty) {
      const list: HandoverLog[] = [];
      snapshot.forEach((d) => list.push(d.data() as HandoverLog));
      callback(list);
    } else {
      callback([]);
    }
  }, (err) => {
    console.warn('Firestore handovers error:', err);
    handleFirestoreError(err, OperationType.GET, HANDOVERS_COL);
  });
}

export async function saveHandoverToDb(handover: HandoverLog) {
  if (!db) return;
  try {
    await setDoc(doc(db, HANDOVERS_COL, handover.id), sanitizeForFirestore(handover), { merge: true });
  } catch (err) {
    console.error('Error saving handover to Firestore:', err);
    handleFirestoreError(err, OperationType.WRITE, `handovers/${handover.id}`);
  }
}

/**
 * Subscribe to Medications & Medication Administrations MAR collections.
 */
export function subscribeMedications(
  callback: (data: MedicationMAR[]) => void,
  initialFallback: MedicationMAR[] = []
) {
  if (!db) {
    callback(initialFallback);
    return () => {};
  }
  const colRef = collection(db, MEDICATIONS_COL);

  return onSnapshot(colRef, (snapshot) => {
    if (!snapshot.empty) {
      const list: MedicationMAR[] = [];
      snapshot.forEach((d) => list.push(d.data() as MedicationMAR));
      callback(list);
    } else {
      callback([]);
    }
  }, (err) => {
    console.warn('Firestore medications error:', err);
    handleFirestoreError(err, OperationType.GET, MEDICATIONS_COL);
  });
}

export function subscribeMedicationAdministrations(
  callback: (data: MedicationMAR[]) => void,
  initialFallback: MedicationMAR[] = []
) {
  if (!db) {
    callback(initialFallback);
    return () => {};
  }
  const colRef = collection(db, MED_ADMINISTRATIONS_COL);

  return onSnapshot(colRef, (snapshot) => {
    if (!snapshot.empty) {
      const list: MedicationMAR[] = [];
      snapshot.forEach((d) => list.push(d.data() as MedicationMAR));
      callback(list);
    } else {
      callback([]);
    }
  }, (err) => {
    console.warn('Firestore medication_administrations error:', err);
    handleFirestoreError(err, OperationType.GET, MED_ADMINISTRATIONS_COL);
  });
}

export async function saveMedicationToDb(medication: MedicationMAR) {
  if (!db) return;
  try {
    const sanitized = sanitizeForFirestore(medication);
    await setDoc(doc(db, MEDICATIONS_COL, medication.id), sanitized, { merge: true });
    await setDoc(doc(db, MED_ADMINISTRATIONS_COL, medication.id), sanitized, { merge: true });
  } catch (err) {
    console.error('Error saving medication to Firestore:', err);
    handleFirestoreError(err, OperationType.WRITE, `medications/${medication.id}`);
  }
}

export const saveMedicationAdministrationToDb = saveMedicationToDb;

/**
 * Subscribe to Audit Logs collection in Cloud Firestore.
 */
export function subscribeAuditLogs(
  callback: (data: AuditLogEntry[]) => void,
  initialFallback: AuditLogEntry[] = []
) {
  if (!db) {
    callback(initialFallback);
    return () => {};
  }
  const colRef = collection(db, AUDIT_LOGS_COL);

  return onSnapshot(colRef, (snapshot) => {
    if (!snapshot.empty) {
      const list: AuditLogEntry[] = [];
      snapshot.forEach((d) => list.push(d.data() as AuditLogEntry));
      callback(list);
    } else {
      callback([]);
    }
  }, (err) => {
    console.warn('Firestore audit_logs error:', err);
    handleFirestoreError(err, OperationType.GET, AUDIT_LOGS_COL);
  });
}

export async function saveAuditLogToDb(auditLog: AuditLogEntry) {
  if (!db) return;
  try {
    await setDoc(doc(db, AUDIT_LOGS_COL, auditLog.id), sanitizeForFirestore(auditLog), { merge: true });
  } catch (err) {
    console.error('Error saving audit log to Firestore:', err);
    handleFirestoreError(err, OperationType.WRITE, `audit_logs/${auditLog.id}`);
  }
}

/**
 * Subscribe to PAS Records collection.
 */
export function subscribePASRecords(
  callback: (data: PASRecord[]) => void,
  initialFallback: PASRecord[] = []
) {
  if (!db) {
    callback(initialFallback);
    return () => {};
  }
  const colRef = collection(db, PAS_COL);

  return onSnapshot(colRef, (snapshot) => {
    if (!snapshot.empty) {
      const list: PASRecord[] = [];
      snapshot.forEach((d) => list.push(d.data() as PASRecord));
      callback(list);
    } else {
      callback([]);
    }
  }, (err) => {
    console.warn('Firestore pas_records error:', err);
  });
}

export async function savePASRecordToDb(record: PASRecord) {
  if (!db) return;
  try {
    await setDoc(doc(db, PAS_COL, record.id), sanitizeForFirestore(record), { merge: true });
  } catch (err) {
    console.error('Error saving PAS record to Firestore:', err);
  }
}

/**
 * Subscribe to Appointments collection.
 */
export function subscribeAppointments(
  callback: (data: AppointmentRecord[]) => void,
  initialFallback: AppointmentRecord[] = []
) {
  if (!db) {
    callback(initialFallback);
    return () => {};
  }
  const colRef = collection(db, APPOINTMENTS_COL);

  return onSnapshot(colRef, (snapshot) => {
    if (!snapshot.empty) {
      const list: AppointmentRecord[] = [];
      snapshot.forEach((d) => list.push(d.data() as AppointmentRecord));
      callback(list);
    } else {
      callback([]);
    }
  }, (err) => {
    console.warn('Firestore appointments error:', err);
  });
}

export async function saveAppointmentToDb(record: AppointmentRecord) {
  if (!db) return;
  try {
    await setDoc(doc(db, APPOINTMENTS_COL, record.id), sanitizeForFirestore(record), { merge: true });
  } catch (err) {
    console.error('Error saving appointment to Firestore:', err);
  }
}

/**
 * Subscribe to Functional Scales collection.
 */
export function subscribeFunctionalScales(
  callback: (data: FunctionalScaleAssessment[]) => void,
  initialFallback: FunctionalScaleAssessment[] = []
) {
  if (!db) {
    callback(initialFallback);
    return () => {};
  }
  const colRef = collection(db, SCALES_COL);

  return onSnapshot(colRef, (snapshot) => {
    if (!snapshot.empty) {
      const list: FunctionalScaleAssessment[] = [];
      snapshot.forEach((d) => list.push(d.data() as FunctionalScaleAssessment));
      callback(list);
    } else {
      callback([]);
    }
  }, (err) => {
    console.warn('Firestore functional_scales error:', err);
  });
}

export async function saveFunctionalScaleToDb(assessment: FunctionalScaleAssessment) {
  if (!db) return;
  try {
    await setDoc(doc(db, SCALES_COL, assessment.id), sanitizeForFirestore(assessment), { merge: true });
  } catch (err) {
    console.error('Error saving scale assessment to Firestore:', err);
  }
}

/**
 * Subscribe to Backups collection in Cloud Firestore (Redundância de Dados).
 */
export function subscribeBackups(
  callback: (data: BackupSnapshot[]) => void,
  initialFallback: BackupSnapshot[] = []
) {
  if (!db) {
    callback(initialFallback);
    return () => {};
  }
  const colRef = collection(db, BACKUPS_COL);

  return onSnapshot(colRef, (snapshot) => {
    if (!snapshot.empty) {
      const list: BackupSnapshot[] = [];
      snapshot.forEach((d) => list.push(d.data() as BackupSnapshot));
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      callback(list);
    } else {
      callback([]);
    }
  }, (err) => {
    console.warn('Firestore backups error:', err);
    handleFirestoreError(err, OperationType.GET, BACKUPS_COL);
  });
}

export async function saveBackupSnapshotToDb(backup: BackupSnapshot) {
  if (!db) return;
  try {
    await setDoc(doc(db, BACKUPS_COL, backup.id), sanitizeForFirestore(backup), { merge: true });
  } catch (err) {
    console.error('Error saving backup snapshot to Firestore:', err);
    handleFirestoreError(err, OperationType.WRITE, `backups/${backup.id}`);
  }
}

export async function deleteBackupFromDb(backupId: string) {
  if (!db) return;
  try {
    await deleteDoc(doc(db, BACKUPS_COL, backupId));
  } catch (err) {
    console.error('Error deleting backup from Firestore:', err);
    handleFirestoreError(err, OperationType.DELETE, `backups/${backupId}`);
  }
}




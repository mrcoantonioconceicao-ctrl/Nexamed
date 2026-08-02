import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import localAppletConfig from '../../firebase-applet-config.json';
import { ClinicalEvolution, Resident, HandoverLog, MedicationMAR } from '../types';

// Suporta tanto variáveis de ambiente (para GitHub Actions / Vercel / Deploy seguro) quanto a config local
const config = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || localAppletConfig?.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || localAppletConfig?.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || localAppletConfig?.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || localAppletConfig?.authDomain,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || localAppletConfig?.firestoreDatabaseId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || localAppletConfig?.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || localAppletConfig?.messagingSenderId,
};

const app = getApps().length === 0 ? initializeApp(config) : getApps()[0];

export const db = config.firestoreDatabaseId
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

// Collection References
const EVOLUTIONS_COL = 'evolutions';
const RESIDENTS_COL = 'residents';
const HANDOVERS_COL = 'handovers';
const MEDICATIONS_COL = 'medications';

/**
 * Subscribe to Evolutions collection with real-time updates.
 * If database is empty, seeds initial fallback data.
 */
export function subscribeEvolutions(
  callback: (data: ClinicalEvolution[]) => void,
  initialFallback: ClinicalEvolution[]
) {
  const colRef = collection(db, EVOLUTIONS_COL);

  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && initialFallback.length > 0) {
      // Seed Firestore with initial evolutions
      for (const item of initialFallback) {
        await setDoc(doc(db, EVOLUTIONS_COL, item.id), item);
      }
      callback(initialFallback);
    } else {
      const list: ClinicalEvolution[] = [];
      snapshot.forEach((d) => list.push(d.data() as ClinicalEvolution));
      // Sort newest first
      list.sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());
      callback(list);
    }
  }, (err) => {
    console.warn('Firestore evolutions error, fallback to memory:', err);
    callback(initialFallback);
  });
}

export async function saveEvolutionToDb(evolution: ClinicalEvolution) {
  try {
    await setDoc(doc(db, EVOLUTIONS_COL, evolution.id), evolution, { merge: true });
  } catch (err) {
    console.error('Error saving evolution to Firestore:', err);
  }
}

/**
 * Subscribe to Residents collection.
 */
export function subscribeResidents(
  callback: (data: Resident[]) => void,
  initialFallback: Resident[]
) {
  const colRef = collection(db, RESIDENTS_COL);

  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && initialFallback.length > 0) {
      for (const item of initialFallback) {
        await setDoc(doc(db, RESIDENTS_COL, item.id), item);
      }
      callback(initialFallback);
    } else {
      const list: Resident[] = [];
      snapshot.forEach((d) => list.push(d.data() as Resident));
      callback(list);
    }
  }, (err) => {
    console.warn('Firestore residents error:', err);
    callback(initialFallback);
  });
}

export async function saveResidentToDb(resident: Resident) {
  try {
    await setDoc(doc(db, RESIDENTS_COL, resident.id), resident, { merge: true });
  } catch (err) {
    console.error('Error saving resident to Firestore:', err);
  }
}

/**
 * Subscribe to Handovers collection.
 */
export function subscribeHandovers(
  callback: (data: HandoverLog[]) => void,
  initialFallback: HandoverLog[]
) {
  const colRef = collection(db, HANDOVERS_COL);

  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && initialFallback.length > 0) {
      for (const item of initialFallback) {
        await setDoc(doc(db, HANDOVERS_COL, item.id), item);
      }
      callback(initialFallback);
    } else {
      const list: HandoverLog[] = [];
      snapshot.forEach((d) => list.push(d.data() as HandoverLog));
      callback(list);
    }
  }, (err) => {
    console.warn('Firestore handovers error:', err);
    callback(initialFallback);
  });
}

export async function saveHandoverToDb(handover: HandoverLog) {
  try {
    await setDoc(doc(db, HANDOVERS_COL, handover.id), handover, { merge: true });
  } catch (err) {
    console.error('Error saving handover to Firestore:', err);
  }
}

/**
 * Subscribe to Medications collection.
 */
export function subscribeMedications(
  callback: (data: MedicationMAR[]) => void,
  initialFallback: MedicationMAR[]
) {
  const colRef = collection(db, MEDICATIONS_COL);

  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && initialFallback.length > 0) {
      for (const item of initialFallback) {
        await setDoc(doc(db, MEDICATIONS_COL, item.id), item);
      }
      callback(initialFallback);
    } else {
      const list: MedicationMAR[] = [];
      snapshot.forEach((d) => list.push(d.data() as MedicationMAR));
      callback(list);
    }
  }, (err) => {
    console.warn('Firestore medications error:', err);
    callback(initialFallback);
  });
}

export async function saveMedicationToDb(medication: MedicationMAR) {
  try {
    await setDoc(doc(db, MEDICATIONS_COL, medication.id), medication, { merge: true });
  } catch (err) {
    console.error('Error saving medication to Firestore:', err);
  }
}

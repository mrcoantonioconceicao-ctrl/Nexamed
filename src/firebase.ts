import { 
  db, 
  auth, 
  isFirebaseConfigured,
  saveFirestoreUser, 
  deleteFirestoreUser,
  subscribeUsers as subscribeFirestoreUsers
} from './lib/firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, onSnapshot } from 'firebase/firestore';
import { RegisteredUser } from './config/auth-mode';
import { Resident, StaffRoster, ClinicalEvolution } from './types';

export { db, auth, isFirebaseConfigured, saveFirestoreUser, deleteFirestoreUser, subscribeFirestoreUsers };

// Firestore Collections
const USERS_COL = 'users';
const RESIDENTS_COL = 'residents';
const ROSTER_COL = 'roster';
const EVOLUTIONS_COL = 'evolutions';

// --- USERS / STAFF FIRESTORE SYNC ---
export async function fetchFirestoreUsers(): Promise<RegisteredUser[]> {
  if (!db) return [];
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COL));
    const users: RegisteredUser[] = [];
    querySnapshot.forEach((d) => {
      users.push(d.data() as RegisteredUser);
    });
    return users;
  } catch (error) {
    console.warn('Error fetching users from Firestore:', error);
    return [];
  }
}

// --- RESIDENTS FIRESTORE SYNC ---
export async function fetchFirestoreResidents(): Promise<Resident[]> {
  if (!db) return [];
  try {
    const querySnapshot = await getDocs(collection(db, RESIDENTS_COL));
    const residents: Resident[] = [];
    querySnapshot.forEach((d) => {
      residents.push(d.data() as Resident);
    });
    return residents;
  } catch (error) {
    console.warn('Error fetching residents from Firestore:', error);
    return [];
  }
}

export function subscribeFirestoreResidents(callback: (residents: Resident[]) => void) {
  if (!db) return () => {};
  try {
    return onSnapshot(collection(db, RESIDENTS_COL), (snapshot) => {
      const residents: Resident[] = [];
      snapshot.forEach((d) => {
        residents.push(d.data() as Resident);
      });
      callback(residents);
    }, (error) => {
      console.warn('Firestore residents listener error:', error);
    });
  } catch (error) {
    console.warn('Failed to subscribe residents:', error);
    return () => {};
  }
}

export async function saveFirestoreResident(resident: Resident): Promise<void> {
  if (!db) return;
  try {
    const resRef = doc(db, RESIDENTS_COL, resident.id);
    await setDoc(resRef, resident, { merge: true });
  } catch (error) {
    console.warn('Error saving resident to Firestore:', error);
  }
}

export async function deleteFirestoreResident(residentId: string): Promise<void> {
  if (!db) return;
  try {
    await deleteDoc(doc(db, RESIDENTS_COL, residentId));
  } catch (error) {
    console.warn('Error deleting resident from Firestore:', error);
  }
}

// --- ROSTER / ESCALA 12x36 FIRESTORE SYNC ---
export async function fetchFirestoreRoster(): Promise<StaffRoster[]> {
  if (!db) return [];
  try {
    const querySnapshot = await getDocs(collection(db, ROSTER_COL));
    const roster: StaffRoster[] = [];
    querySnapshot.forEach((d) => {
      roster.push(d.data() as StaffRoster);
    });
    return roster;
  } catch (error) {
    console.warn('Error fetching roster from Firestore:', error);
    return [];
  }
}

export function subscribeFirestoreRoster(callback: (roster: StaffRoster[]) => void) {
  if (!db) return () => {};
  try {
    return onSnapshot(collection(db, ROSTER_COL), (snapshot) => {
      const roster: StaffRoster[] = [];
      snapshot.forEach((d) => {
        roster.push(d.data() as StaffRoster);
      });
      callback(roster);
    }, (error) => {
      console.warn('Firestore roster listener error:', error);
    });
  } catch (error) {
    console.warn('Failed to subscribe roster:', error);
    return () => {};
  }
}

export async function saveFirestoreRosterItem(item: StaffRoster): Promise<void> {
  if (!db) return;
  try {
    const itemRef = doc(db, ROSTER_COL, item.id);
    await setDoc(itemRef, item, { merge: true });
  } catch (error) {
    console.warn('Error saving roster item to Firestore:', error);
  }
}

export async function deleteFirestoreRosterItem(itemId: string): Promise<void> {
  if (!db) return;
  try {
    await deleteDoc(doc(db, ROSTER_COL, itemId));
  } catch (error) {
    console.warn('Error deleting roster item from Firestore:', error);
  }
}

// --- EVOLUTIONS FIRESTORE SYNC ---
export async function fetchFirestoreEvolutions(): Promise<ClinicalEvolution[]> {
  if (!db) return [];
  try {
    const querySnapshot = await getDocs(collection(db, EVOLUTIONS_COL));
    const evolutions: ClinicalEvolution[] = [];
    querySnapshot.forEach((d) => {
      evolutions.push(d.data() as ClinicalEvolution);
    });
    return evolutions;
  } catch (error) {
    console.warn('Error fetching evolutions from Firestore:', error);
    return [];
  }
}

export function subscribeFirestoreEvolutions(callback: (evolutions: ClinicalEvolution[]) => void) {
  if (!db) return () => {};
  try {
    return onSnapshot(collection(db, EVOLUTIONS_COL), (snapshot) => {
      const evolutions: ClinicalEvolution[] = [];
      snapshot.forEach((d) => {
        evolutions.push(d.data() as ClinicalEvolution);
      });
      callback(evolutions);
    }, (error) => {
      console.warn('Firestore evolutions listener error:', error);
    });
  } catch (error) {
    console.warn('Failed to subscribe evolutions:', error);
    return () => {};
  }
}

export async function saveFirestoreEvolution(evolution: ClinicalEvolution): Promise<void> {
  if (!db) return;
  try {
    const evoRef = doc(db, EVOLUTIONS_COL, evolution.id);
    await setDoc(evoRef, evolution, { merge: true });
  } catch (error) {
    console.warn('Error saving evolution to Firestore:', error);
  }
}

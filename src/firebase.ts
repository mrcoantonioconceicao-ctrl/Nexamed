import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import config from '../firebase-applet-config.json';
import { RegisteredUser } from './config/auth-mode';
import { Resident, StaffRoster, ClinicalEvolution } from './types';

const app = getApps().length === 0 ? initializeApp(config) : getApps()[0];

export const db = getFirestore(app, config.firestoreDatabaseId);
export const auth = getAuth(app);

// Firestore Collections
const USERS_COL = 'users';
const RESIDENTS_COL = 'residents';
const ROSTER_COL = 'roster';
const EVOLUTIONS_COL = 'evolutions';

// --- USERS / STAFF FIRESTORE SYNC ---
export async function fetchFirestoreUsers(): Promise<RegisteredUser[]> {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COL));
    const users: RegisteredUser[] = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as RegisteredUser);
    });
    return users;
  } catch (error) {
    console.error('Error fetching users from Firestore:', error);
    return [];
  }
}

export function subscribeFirestoreUsers(callback: (users: RegisteredUser[]) => void) {
  try {
    return onSnapshot(collection(db, USERS_COL), (snapshot) => {
      const users: RegisteredUser[] = [];
      snapshot.forEach((doc) => {
        users.push(doc.data() as RegisteredUser);
      });
      callback(users);
    }, (error) => {
      console.warn('Firestore users listener error:', error);
    });
  } catch (error) {
    console.error('Failed to subscribe users:', error);
    return () => {};
  }
}

export async function saveFirestoreUser(user: RegisteredUser): Promise<void> {
  try {
    const userRef = doc(db, USERS_COL, user.id);
    await setDoc(userRef, user, { merge: true });
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
  }
}

export async function deleteFirestoreUser(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, USERS_COL, userId));
  } catch (error) {
    console.error('Error deleting user from Firestore:', error);
  }
}

// --- RESIDENTS FIRESTORE SYNC ---
export async function fetchFirestoreResidents(): Promise<Resident[]> {
  try {
    const querySnapshot = await getDocs(collection(db, RESIDENTS_COL));
    const residents: Resident[] = [];
    querySnapshot.forEach((doc) => {
      residents.push(doc.data() as Resident);
    });
    return residents;
  } catch (error) {
    console.error('Error fetching residents from Firestore:', error);
    return [];
  }
}

export function subscribeFirestoreResidents(callback: (residents: Resident[]) => void) {
  try {
    return onSnapshot(collection(db, RESIDENTS_COL), (snapshot) => {
      const residents: Resident[] = [];
      snapshot.forEach((doc) => {
        residents.push(doc.data() as Resident);
      });
      callback(residents);
    }, (error) => {
      console.warn('Firestore residents listener error:', error);
    });
  } catch (error) {
    console.error('Failed to subscribe residents:', error);
    return () => {};
  }
}

export async function saveFirestoreResident(resident: Resident): Promise<void> {
  try {
    const resRef = doc(db, RESIDENTS_COL, resident.id);
    await setDoc(resRef, resident, { merge: true });
  } catch (error) {
    console.error('Error saving resident to Firestore:', error);
  }
}

export async function deleteFirestoreResident(residentId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, RESIDENTS_COL, residentId));
  } catch (error) {
    console.error('Error deleting resident from Firestore:', error);
  }
}

// --- ROSTER / ESCALA 12x36 FIRESTORE SYNC ---
export async function fetchFirestoreRoster(): Promise<StaffRoster[]> {
  try {
    const querySnapshot = await getDocs(collection(db, ROSTER_COL));
    const roster: StaffRoster[] = [];
    querySnapshot.forEach((doc) => {
      roster.push(doc.data() as StaffRoster);
    });
    return roster;
  } catch (error) {
    console.error('Error fetching roster from Firestore:', error);
    return [];
  }
}

export function subscribeFirestoreRoster(callback: (roster: StaffRoster[]) => void) {
  try {
    return onSnapshot(collection(db, ROSTER_COL), (snapshot) => {
      const roster: StaffRoster[] = [];
      snapshot.forEach((doc) => {
        roster.push(doc.data() as StaffRoster);
      });
      callback(roster);
    }, (error) => {
      console.warn('Firestore roster listener error:', error);
    });
  } catch (error) {
    console.error('Failed to subscribe roster:', error);
    return () => {};
  }
}

export async function saveFirestoreRosterItem(item: StaffRoster): Promise<void> {
  try {
    const itemRef = doc(db, ROSTER_COL, item.id);
    await setDoc(itemRef, item, { merge: true });
  } catch (error) {
    console.error('Error saving roster item to Firestore:', error);
  }
}

export async function deleteFirestoreRosterItem(itemId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, ROSTER_COL, itemId));
  } catch (error) {
    console.error('Error deleting roster item from Firestore:', error);
  }
}

// --- EVOLUTIONS FIRESTORE SYNC ---
export async function fetchFirestoreEvolutions(): Promise<ClinicalEvolution[]> {
  try {
    const querySnapshot = await getDocs(collection(db, EVOLUTIONS_COL));
    const evolutions: ClinicalEvolution[] = [];
    querySnapshot.forEach((doc) => {
      evolutions.push(doc.data() as ClinicalEvolution);
    });
    return evolutions;
  } catch (error) {
    console.error('Error fetching evolutions from Firestore:', error);
    return [];
  }
}

export function subscribeFirestoreEvolutions(callback: (evolutions: ClinicalEvolution[]) => void) {
  try {
    return onSnapshot(collection(db, EVOLUTIONS_COL), (snapshot) => {
      const evolutions: ClinicalEvolution[] = [];
      snapshot.forEach((doc) => {
        evolutions.push(doc.data() as ClinicalEvolution);
      });
      callback(evolutions);
    }, (error) => {
      console.warn('Firestore evolutions listener error:', error);
    });
  } catch (error) {
    console.error('Failed to subscribe evolutions:', error);
    return () => {};
  }
}

export async function saveFirestoreEvolution(evolution: ClinicalEvolution): Promise<void> {
  try {
    const evoRef = doc(db, EVOLUTIONS_COL, evolution.id);
    await setDoc(evoRef, evolution, { merge: true });
  } catch (error) {
    console.error('Error saving evolution to Firestore:', error);
  }
}

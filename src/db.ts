import { dbFirebase, auth } from './firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, updateDoc, writeBatch, onSnapshot, getCountFromServer } from 'firebase/firestore';
import type { Medicine, Bill } from './types';

function requireAuth() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be logged in to perform database operations');
  }
  return user.uid;
}

class FirestoreTable<T extends { id: string }> {
  constructor(private collectionName: string) {}

  private getCollectionRef() {
    const uid = requireAuth();
    return collection(dbFirebase, 'users', uid, this.collectionName);
  }

  private getDocRef(id: string) {
    const uid = requireAuth();
    return doc(dbFirebase, 'users', uid, this.collectionName, id);
  }

  async toArray(): Promise<T[]> {
    if (!auth.currentUser) return [];
    const snapshot = await getDocs(this.getCollectionRef());
    return snapshot.docs.map(doc => doc.data() as T);
  }

  async count(): Promise<number> {
    if (!auth.currentUser) return 0;
    try {
      const snapshot = await getCountFromServer(this.getCollectionRef());
      return snapshot.data().count;
    } catch (e) {
      console.error(`Error in count for ${this.collectionName}:`, e);
      throw e;
    }
  }

  async clear(): Promise<void> {
    const snapshot = await getDocs(this.getCollectionRef());
    const batch = writeBatch(dbFirebase);
    snapshot.docs.forEach(docSnap => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  }

  async add(item: T): Promise<void> {
    await setDoc(this.getDocRef(item.id), item);
  }

  async bulkAdd(items: T[]): Promise<void> {
    if (items.length === 0) return;
    try {
      const batch = writeBatch(dbFirebase);
      items.forEach(item => {
        batch.set(this.getDocRef(item.id), item);
      });
      await batch.commit();
      console.log(`bulkAdd for ${this.collectionName} succeeded`);
    } catch (e) {
      console.error(`bulkAdd for ${this.collectionName} failed:`, e);
      throw e;
    }
  }

  async update(id: string, changes: Partial<T>): Promise<void> {
    await updateDoc(this.getDocRef(id), changes as any);
  }

  async put(item: T): Promise<void> {
    await setDoc(this.getDocRef(item.id), item);
  }

  async bulkPut(items: T[]): Promise<void> {
    if (items.length === 0) return;
    const batch = writeBatch(dbFirebase);
    items.forEach(item => {
      batch.set(this.getDocRef(item.id), item);
    });
    await batch.commit();
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(this.getDocRef(id));
  }

  // Helper for live queries
  subscribe(callback: (data: T[]) => void) {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      console.warn(`subscribe for ${this.collectionName}: No current user uid`);
      callback([]);
      return () => {};
    }
    console.log(`Setting up subscription for ${this.collectionName}, uid: ${uid}`);
    return onSnapshot(this.getCollectionRef(), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as T);
      console.log(`Received snapshot for ${this.collectionName}, docs count: ${data.length}`);
      callback(data);
    }, (error) => {
      console.error(`subscribe error for ${this.collectionName}:`, error);
    });
  }
}

export const db = {
  medicines: new FirestoreTable<Medicine>('medicines'),
  bills: new FirestoreTable<Bill>('bills'),
};


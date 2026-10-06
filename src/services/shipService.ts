import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Ship } from '../types';
import { logActivity } from './activityService';

const COLLECTION_NAME = 'ships';

export function subscribeShips(
  onUpdate: (ships: Ship[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(collection(db, COLLECTION_NAME), orderBy('name', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const ships: Ship[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Ship, 'id'>)
      }));
      onUpdate(ships);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    }
  );
}

export async function createShip(
  shipData: Omit<Ship, 'id' | 'createdAt' | 'updatedAt'>,
  operatorEmail: string
): Promise<string> {
  const now = new Date().toISOString();
  const payload = {
    ...shipData,
    createdAt: now,
    updatedAt: now
  };

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
    await logActivity(
      'CREATE',
      'Kapal',
      `Menambahkan armada baru: ${shipData.name} (${shipData.code})`,
      operatorEmail
    );
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
}

export async function updateShip(
  shipId: string,
  shipData: Partial<Omit<Ship, 'id' | 'createdAt'>>,
  operatorEmail: string
): Promise<void> {
  const now = new Date().toISOString();
  const path = `${COLLECTION_NAME}/${shipId}`;

  try {
    const docRef = doc(db, COLLECTION_NAME, shipId);
    await updateDoc(docRef, {
      ...shipData,
      updatedAt: now
    });
    await logActivity(
      'UPDATE',
      'Kapal',
      `Memperbarui data kapal: ${shipData.name || shipId}`,
      operatorEmail
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteShip(
  shipId: string,
  shipName: string,
  operatorEmail: string
): Promise<void> {
  const path = `${COLLECTION_NAME}/${shipId}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, shipId);
    await deleteDoc(docRef);
    await logActivity(
      'DELETE',
      'Kapal',
      `Menghapus kapal armada: ${shipName} (ID: ${shipId})`,
      operatorEmail
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getAllShipsOnce(): Promise<Ship[]> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Ship, 'id'>)
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
  }
}

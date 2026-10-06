import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  getDocs,
  where
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Passenger } from '../types';
import { logActivity } from './activityService';

const COLLECTION_NAME = 'passengers';

export function subscribePassengers(
  onUpdate: (passengers: Passenger[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const passengers: Passenger[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Passenger, 'id'>)
      }));
      onUpdate(passengers);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    }
  );
}

export async function createPassenger(
  passengerData: Omit<Passenger, 'id' | 'createdAt' | 'updatedAt'>,
  operatorEmail: string
): Promise<string> {
  const now = new Date().toISOString();
  const payload = {
    ...passengerData,
    createdAt: now,
    updatedAt: now
  };

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
    await logActivity(
      'CREATE',
      'Penumpang',
      `Mendaftarkan tiket ${passengerData.ticketNumber} - ${passengerData.fullName} di kapal ${passengerData.shipName}`,
      operatorEmail
    );
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
}

export async function updatePassenger(
  passengerId: string,
  passengerData: Partial<Omit<Passenger, 'id' | 'createdAt'>>,
  operatorEmail: string
): Promise<void> {
  const now = new Date().toISOString();
  const path = `${COLLECTION_NAME}/${passengerId}`;

  try {
    const docRef = doc(db, COLLECTION_NAME, passengerId);
    await updateDoc(docRef, {
      ...passengerData,
      updatedAt: now
    });
    await logActivity(
      'UPDATE',
      'Penumpang',
      `Memperbarui tiket: ${passengerData.ticketNumber || passengerId} (${passengerData.fullName || 'Penumpang'})`,
      operatorEmail
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deletePassenger(
  passengerId: string,
  ticketInfo: string,
  operatorEmail: string
): Promise<void> {
  const path = `${COLLECTION_NAME}/${passengerId}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, passengerId);
    await deleteDoc(docRef);
    await logActivity(
      'DELETE',
      'Penumpang',
      `Menghapus manifes penumpang: ${ticketInfo}`,
      operatorEmail
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

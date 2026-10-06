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
import { Cargo } from '../types';
import { logActivity } from './activityService';

const COLLECTION_NAME = 'cargos';

export function subscribeCargos(
  onUpdate: (cargos: Cargo[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const cargos: Cargo[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Cargo, 'id'>)
      }));
      onUpdate(cargos);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    }
  );
}

export async function createCargo(
  cargoData: Omit<Cargo, 'id' | 'createdAt' | 'updatedAt'>,
  operatorEmail: string
): Promise<string> {
  const now = new Date().toISOString();
  const payload = {
    ...cargoData,
    createdAt: now,
    updatedAt: now
  };

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
    await logActivity(
      'CREATE',
      'Muatan',
      `Menambahkan manifes kargo ${cargoData.manifestNumber} (${cargoData.cargoType}, ${cargoData.weightKg} kg) ke kapal ${cargoData.shipName}`,
      operatorEmail
    );
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
}

export async function updateCargo(
  cargoId: string,
  cargoData: Partial<Omit<Cargo, 'id' | 'createdAt'>>,
  operatorEmail: string
): Promise<void> {
  const now = new Date().toISOString();
  const path = `${COLLECTION_NAME}/${cargoId}`;

  try {
    const docRef = doc(db, COLLECTION_NAME, cargoId);
    await updateDoc(docRef, {
      ...cargoData,
      updatedAt: now
    });
    await logActivity(
      'UPDATE',
      'Muatan',
      `Memperbarui muatan: ${cargoData.manifestNumber || cargoId} (${cargoData.cargoType || 'Kargo'})`,
      operatorEmail
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCargo(
  cargoId: string,
  manifestInfo: string,
  operatorEmail: string
): Promise<void> {
  const path = `${COLLECTION_NAME}/${cargoId}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, cargoId);
    await deleteDoc(docRef);
    await logActivity(
      'DELETE',
      'Muatan',
      `Menghapus manifes kargo: ${manifestInfo}`,
      operatorEmail
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

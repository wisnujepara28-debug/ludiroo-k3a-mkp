import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { ActivityLog } from '../types';

const COLLECTION_NAME = 'activity_logs';

export async function logActivity(
  action: ActivityLog['action'],
  entityType: ActivityLog['entityType'],
  details: string,
  operatorEmail: string
): Promise<void> {
  try {
    const logData = {
      action,
      entityType,
      details,
      operatorEmail,
      timestamp: new Date().toISOString()
    };
    await addDoc(collection(db, COLLECTION_NAME), logData);
  } catch (error) {
    console.warn('Logging activity failed (non-blocking):', error);
  }
}

export function subscribeActivityLogs(
  onUpdate: (logs: ActivityLog[]) => void,
  onError?: (error: Error) => void,
  maxRecords: number = 30
): () => void {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy('timestamp', 'desc'),
    limit(maxRecords)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const logs: ActivityLog[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ActivityLog, 'id'>)
      }));
      onUpdate(logs);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, COLLECTION_NAME);
    }
  );
}

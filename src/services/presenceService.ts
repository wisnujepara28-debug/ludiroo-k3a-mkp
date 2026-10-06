import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query 
} from 'firebase/firestore';
import { db } from '../firebase';
import { UserSession } from '../types';

export interface ActiveOperator {
  id: string;
  email: string;
  displayName: string;
  role: string;
  lastSeen: string;
}

const COLLECTION_NAME = 'active_operators';

// Register or refresh online status
export async function updateOperatorPresence(user: UserSession): Promise<void> {
  if (!user.uid) return;
  try {
    const operatorDoc = doc(db, COLLECTION_NAME, user.uid);
    await setDoc(operatorDoc, {
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      lastSeen: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to update operator presence:', err);
  }
}

// Remove presence on logout
export async function removeOperatorPresence(uid: string): Promise<void> {
  if (!uid) return;
  try {
    const operatorDoc = doc(db, COLLECTION_NAME, uid);
    await deleteDoc(operatorDoc);
  } catch (err) {
    console.warn('Failed to remove operator presence:', err);
  }
}

// Subscribe to all currently active operators
export function subscribeActiveOperators(
  onUpdate: (operators: ActiveOperator[]) => void
): () => void {
  const q = query(collection(db, COLLECTION_NAME));
  return onSnapshot(q, (snapshot) => {
    const now = Date.now();
    // Filter active within last 15 minutes
    const operators: ActiveOperator[] = snapshot.docs
      .map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ActiveOperator, 'id'>)
      }))
      .filter((op) => {
        const lastSeenTime = new Date(op.lastSeen).getTime();
        return !isNaN(lastSeenTime) && (now - lastSeenTime) < 15 * 60 * 1000;
      });

    onUpdate(operators);
  }, (err) => {
    console.warn('Presence subscription warning:', err);
  });
}

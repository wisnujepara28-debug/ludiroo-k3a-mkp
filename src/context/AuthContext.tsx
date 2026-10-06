import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth, googleProvider, testConnection } from '../firebase';
import { UserSession } from '../types';
import { logActivity } from '../services/activityService';
import { updateOperatorPresence, removeOperatorPresence } from '../services/presenceService';

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  firestoreConnected: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithDemo: (role?: 'Super Admin' | 'Petugas Pelabuhan') => Promise<void>;
  loginWithCredentials: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [firestoreConnected, setFirestoreConnected] = useState<boolean>(true);

  // Check connection to Firestore at boot
  useEffect(() => {
    testConnection().then((connected) => {
      setFirestoreConnected(connected);
    });
  }, []);

  // Sync Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser: User | null) => {
      if (fbUser) {
        const isAdmin = fbUser.email === 'wisnujepara28@gmail.com';
        const session: UserSession = {
          uid: fbUser.uid,
          email: fbUser.email || 'operator@japara.co.id',
          displayName: fbUser.displayName || (isAdmin ? 'Wisnu (Admin JAPARA)' : 'Operator JAPARA'),
          role: isAdmin ? 'Super Admin' : 'Petugas Pelabuhan',
          isGoogleUser: true
        };
        setUser(session);
        updateOperatorPresence(session);
      } else {
        setUser((prev) => (prev?.isGoogleUser ? null : prev));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Presence Heartbeat: refresh every 60s while logged in
  useEffect(() => {
    if (!user) return;
    updateOperatorPresence(user);

    const interval = setInterval(() => {
      updateOperatorPresence(user);
    }, 60000);

    return () => clearInterval(interval);
  }, [user]);

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        await logActivity(
          'LOGIN',
          'Sistem',
          `Login Google JAPARA berhasil: ${res.user.email}`,
          res.user.email || 'Google User'
        );
      }
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      throw err;
    }
  };

  const loginWithDemo = async (role: 'Super Admin' | 'Petugas Pelabuhan' = 'Super Admin') => {
    const isSuper = role === 'Super Admin';
    const demoUser: UserSession = {
      uid: isSuper ? 'japara-admin-01' : 'japara-operator-02',
      email: isSuper ? 'wisnujepara28@gmail.com' : 'petugas.manifes@japara.co.id',
      displayName: isSuper ? 'Wisnu H. (Super Admin JAPARA)' : 'Siti Rahma (Petugas JAPARA)',
      role,
      isGoogleUser: false
    };

    setUser(demoUser);
    await updateOperatorPresence(demoUser);
    await logActivity(
      'LOGIN',
      'Sistem',
      `Login Cepat JAPARA sebagai ${demoUser.role} (${demoUser.email})`,
      demoUser.email
    );
  };

  const loginWithCredentials = async (email: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !pass) {
      return { success: false, message: 'Username/Email dan Password wajib diisi!' };
    }

    if (pass.length < 5) {
      return { success: false, message: 'Password minimal 5 karakter!' };
    }

    const isSuper = cleanEmail.includes('admin') || cleanEmail.includes('wisnu') || cleanEmail === 'wisnujepara28@gmail.com';
    const role: 'Super Admin' | 'Petugas Pelabuhan' = isSuper ? 'Super Admin' : 'Petugas Pelabuhan';
    const displayName = isSuper ? 'Admin JAPARA LINES' : 'Petugas Manifes JAPARA';

    const session: UserSession = {
      uid: `japara-${cleanEmail.replace(/[^a-z0-9]/g, '')}`,
      email: cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@japara.co.id`,
      displayName,
      role,
      isGoogleUser: false
    };

    setUser(session);
    await updateOperatorPresence(session);
    await logActivity(
      'LOGIN',
      'Sistem',
      `Login Operator JAPARA: ${session.displayName} (${session.email})`,
      session.email
    );

    return { success: true };
  };

  const logout = async () => {
    try {
      if (user) {
        await removeOperatorPresence(user.uid);
      }
      if (user?.isGoogleUser) {
        await fbSignOut(auth);
      }
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        firestoreConnected,
        loginWithGoogle,
        loginWithDemo,
        loginWithCredentials,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

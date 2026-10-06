/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/LoginForm';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { ShipManager } from './components/ShipManager';
import { PassengerManager } from './components/PassengerManager';
import { CargoManager } from './components/CargoManager';
import { ActivityLogView } from './components/ActivityLogView';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Ship, Passenger, Cargo, ActivityLog } from './types';
import { subscribeShips } from './services/shipService';
import { subscribePassengers } from './services/passengerService';
import { subscribeCargos } from './services/cargoService';
import { subscribeActivityLogs } from './services/activityService';
import { checkAndSeedInitialData, seedDemoData } from './services/seedService';
import { subscribeActiveOperators, ActiveOperator } from './services/presenceService';
import { Radio } from 'lucide-react';

function MainApp() {
  const { user, loading } = useAuth();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Real-time Firestore Data States
  const [ships, setShips] = useState<Ship[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activeOperators, setActiveOperators] = useState<ActiveOperator[]>([]);

  // Live Multi-User Sync Notification
  const [lastSyncTime, setLastSyncTime] = useState<string>('Online');
  const [isSyncPulsing, setIsSyncPulsing] = useState<boolean>(false);
  const initialLoadRef = useRef<boolean>(true);

  // Modals
  const [isAddShipModalOpen, setIsAddShipModalOpen] = useState(false);
  const [isAddPassengerModalOpen, setIsAddPassengerModalOpen] = useState(false);
  const [isAddCargoModalOpen, setIsAddCargoModalOpen] = useState(false);

  // Seeding state
  const [seeding, setSeeding] = useState(false);

  // Toast feedback state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto dismiss after 4.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const triggerLivePulse = () => {
    if (!initialLoadRef.current) {
      setIsSyncPulsing(true);
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      setTimeout(() => setIsSyncPulsing(false), 2000);
    }
  };

  // Realtime Firestore Subscriptions
  useEffect(() => {
    // 1. Ships listener
    const unsubShips = subscribeShips(
      (data) => {
        setShips(data);
        triggerLivePulse();
      },
      (err) => console.error('Error listening to ships:', err)
    );

    // 2. Passengers listener
    const unsubPassengers = subscribePassengers(
      (data) => {
        setPassengers(data);
        triggerLivePulse();
      },
      (err) => console.error('Error listening to passengers:', err)
    );

    // 3. Cargos listener
    const unsubCargos = subscribeCargos(
      (data) => {
        setCargos(data);
        triggerLivePulse();
      },
      (err) => console.error('Error listening to cargos:', err)
    );

    // 4. Activity Logs listener
    const unsubLogs = subscribeActivityLogs(
      (data) => setActivityLogs(data),
      (err) => console.error('Error listening to activity logs:', err)
    );

    // 5. Active Operators Presence listener
    const unsubOperators = subscribeActiveOperators(
      (ops) => setActiveOperators(ops)
    );

    // After 1.5 seconds, consider initial load complete so future snapshot events show the live pulse
    const timer = setTimeout(() => {
      initialLoadRef.current = false;
    }, 1500);

    return () => {
      clearTimeout(timer);
      unsubShips();
      unsubPassengers();
      unsubCargos();
      unsubLogs();
      unsubOperators();
    };
  }, []);

  // Automatic seed check if Firestore database is empty
  useEffect(() => {
    if (user?.email) {
      checkAndSeedInitialData(user.email).then((seeded) => {
        if (seeded) {
          addToast('info', 'Database JAPARA Terisi', 'Data armada dan manifes awal berhasil dimuat ke Cloud Firestore.');
        }
      });
    }
  }, [user?.email]);

  // Manual seed trigger
  const handleManualSeed = async () => {
    if (!user?.email) return;
    setSeeding(true);
    try {
      await seedDemoData(user.email);
      addToast('success', 'Inisialisasi JAPARA Sukses', 'Data armada kapal, tiket penumpang, dan muatan kargo berhasil dimuat.');
    } catch (err: any) {
      addToast('error', 'Gagal Inisialisasi', err.message || 'Gagal mengisi database.');
    } finally {
      setSeeding(false);
    }
  };

  // Show loading spinner while Auth initializes
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-white tracking-wider uppercase">Menghubungkan ke JAPARA Cloud Firestore...</p>
          <p className="text-xs text-slate-400 mt-1">Sinkronisasi Database Nyata Multi-User</p>
        </div>
      </div>
    );
  }

  // DEFAULT VIEW: Login Form if user is not authenticated
  if (!user) {
    return (
      <>
        <LoginForm onNotify={addToast} />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Live sync pulse indicator at the very top edge */}
      {isSyncPulsing && (
        <div className="fixed top-0 inset-x-0 z-50 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-white text-[11px] font-bold py-1 px-4 text-center shadow-md animate-in slide-in-from-top-2 flex items-center justify-center gap-2">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Data JAPARA Baru Tersinkronisasi Otomatis dari Cloud Firestore ({lastSyncTime})</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSeedData={handleManualSeed}
        seeding={seeding}
        shipCount={ships.length}
        passengerCount={passengers.length}
        cargoCount={cargos.length}
        activeOperators={activeOperators}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardStats
            ships={ships}
            passengers={passengers}
            cargos={cargos}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenNewPassenger={() => {
              setActiveTab('passengers');
              setIsAddPassengerModalOpen(true);
            }}
            onOpenNewCargo={() => {
              setActiveTab('cargos');
              setIsAddCargoModalOpen(true);
            }}
            onOpenNewShip={() => {
              setActiveTab('ships');
              setIsAddShipModalOpen(true);
            }}
          />
        )}

        {activeTab === 'ships' && (
          <ShipManager
            ships={ships}
            passengers={passengers}
            cargos={cargos}
            isAddModalOpen={isAddShipModalOpen}
            setIsAddModalOpen={setIsAddShipModalOpen}
            onNotify={addToast}
          />
        )}

        {activeTab === 'passengers' && (
          <PassengerManager
            passengers={passengers}
            ships={ships}
            isAddModalOpen={isAddPassengerModalOpen}
            setIsAddModalOpen={setIsAddPassengerModalOpen}
            onNotify={addToast}
          />
        )}

        {activeTab === 'cargos' && (
          <CargoManager
            cargos={cargos}
            ships={ships}
            isAddModalOpen={isAddCargoModalOpen}
            setIsAddModalOpen={setIsAddCargoModalOpen}
            onNotify={addToast}
          />
        )}

        {activeTab === 'logs' && (
          <ActivityLogView logs={activityLogs} />
        )}
      </main>

      {/* Toast Feedback Alerts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

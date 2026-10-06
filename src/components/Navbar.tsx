import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ActiveOperator } from '../services/presenceService';
import { 
  Ship, 
  Users, 
  Package, 
  LayoutDashboard, 
  FileText, 
  LogOut, 
  Database, 
  RefreshCw, 
  ShieldCheck, 
  Radio,
  ChevronDown,
  Sparkles,
  Globe
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'ships' | 'passengers' | 'cargos' | 'logs';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onSeedData: () => Promise<void>;
  seeding: boolean;
  shipCount: number;
  passengerCount: number;
  cargoCount: number;
  activeOperators: ActiveOperator[];
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onSeedData,
  seeding,
  shipCount,
  passengerCount,
  cargoCount,
  activeOperators
}) => {
  const { user, logout, firestoreConnected } = useAuth();
  const [showOperatorsList, setShowOperatorsList] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner: Realtime Online Status & Active Operators */}
      <div className="bg-slate-950 text-slate-300 text-xs py-2 px-4 sm:px-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          {/* Live Online Badge */}
          <div className="flex items-center gap-2 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold text-slate-200">
              JAPARA Cloud Database: <span className="text-emerald-400">Online Realtime</span>
            </span>
          </div>

          {/* Active Operators Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowOperatorsList(!showOperatorsList)}
              className="flex items-center gap-1.5 bg-blue-950 hover:bg-blue-900/90 text-blue-200 border border-blue-800/80 px-2.5 py-1 rounded-full text-[11px] font-medium transition cursor-pointer"
            >
              <Users className="w-3 h-3 text-cyan-400" />
              <span>{activeOperators.length > 0 ? activeOperators.length : 1} Operator Online</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {/* Dropdown list of online operators */}
            {showOperatorsList && (
              <div className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Operator Aktif (Live)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Terkoneksi</span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {activeOperators.map((op) => (
                    <div key={op.id} className="flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-white truncate">{op.displayName}</div>
                        <div className="text-[10px] text-slate-400 truncate">{op.email}</div>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    </div>
                  ))}
                  {activeOperators.length === 0 && (
                    <div className="text-xs text-slate-400">Anda adalah operator aktif saat ini.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User profile & Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 text-slate-200 px-3 py-1 rounded-full border border-slate-800 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-white">{user?.displayName}</span>
            <span className="text-amber-300/80 font-medium">({user?.role})</span>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1 text-[11px] font-medium text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 px-2.5 py-1 rounded-lg transition cursor-pointer"
            title="Keluar dari akun"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Corporate Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-slate-950 to-blue-900 p-0.5 shadow-md border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Ship className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-950 text-xl sm:text-2xl leading-tight tracking-tight uppercase">
                  JAPARA <span className="text-blue-700">LINES</span>
                </span>
                <span className="bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline">
                  FLEET &amp; CARGO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                PT JAPARA SAMUDERA LOGISTIK • Sistem Operasional Terpadu Jepara - Nusantara
              </p>
            </div>
          </div>

          {/* Seed demo data button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onSeedData}
              disabled={seeding}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-800 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-3.5 py-2 rounded-xl transition disabled:opacity-50 cursor-pointer shadow-2xs"
              title="Isi contoh kapal & manifes JAPARA ke Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
              <span className="hidden md:inline">{seeding ? 'Menyinkronkan...' : 'Reset Data Contoh JAPARA'}</span>
              <span className="md:hidden">Reset Data</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-slate-100 py-1.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition shrink-0 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-blue-900 text-white shadow-md shadow-blue-950/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Ringkasan Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('ships')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition shrink-0 cursor-pointer ${
              activeTab === 'ships'
                ? 'bg-blue-900 text-white shadow-md shadow-blue-950/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Ship className="w-4 h-4" />
            <span>Armada Kapal JAPARA</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === 'ships' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {shipCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('passengers')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition shrink-0 cursor-pointer ${
              activeTab === 'passengers'
                ? 'bg-blue-900 text-white shadow-md shadow-blue-950/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Manifes Penumpang</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === 'passengers' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {passengerCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('cargos')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition shrink-0 cursor-pointer ${
              activeTab === 'cargos'
                ? 'bg-blue-900 text-white shadow-md shadow-blue-950/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Manifes Muatan &amp; Kargo</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === 'cargos' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {cargoCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition shrink-0 cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-blue-900 text-white shadow-md shadow-blue-950/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Audit Trail Firestore</span>
          </button>
        </div>
      </div>
    </header>
  );
};

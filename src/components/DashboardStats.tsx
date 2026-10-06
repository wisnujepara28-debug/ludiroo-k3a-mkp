import React from 'react';
import { Ship, Passenger, Cargo } from '../types';
import { 
  Ship as ShipIcon, 
  Users, 
  Package, 
  Anchor, 
  TrendingUp, 
  Navigation,
  ArrowRight,
  ShieldCheck,
  Scale,
  Compass,
  Radio,
  Sparkles,
  Waves
} from 'lucide-react';
import { ActiveTab } from './Navbar';

interface DashboardStatsProps {
  ships: Ship[];
  passengers: Passenger[];
  cargos: Cargo[];
  onNavigate: (tab: ActiveTab) => void;
  onOpenNewPassenger: () => void;
  onOpenNewCargo: () => void;
  onOpenNewShip: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  ships,
  passengers,
  cargos,
  onNavigate,
  onOpenNewPassenger,
  onOpenNewCargo,
  onOpenNewShip
}) => {
  const sailingShips = ships.filter((s) => s.status === 'Berlayar').length;
  const dockedShips = ships.filter((s) => s.status === 'Bersandar').length;
  const maintenanceShips = ships.filter((s) => s.status === 'Maintenance').length;

  const totalCargoWeightKg = cargos.reduce((acc, c) => acc + (c.weightKg || 0), 0);
  const totalCargoTons = (totalCargoWeightKg / 1000).toFixed(2);

  const activePassengers = passengers.filter((p) => p.status !== 'Batal').length;
  const boardingPassengers = passengers.filter((p) => p.status === 'Boarding').length;

  return (
    <div className="space-y-6">
      {/* Luxury Executive Hero Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-9 text-white shadow-xl relative overflow-hidden border border-blue-900/50">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-10 opacity-10 pointer-events-none">
          <Compass className="w-96 h-96 text-white" />
        </div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              JAPARA FLEET INTELLIGENCE SYSTEM
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Sinkronisasi Cloud Aktif
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white font-sans">
            Pusat Komando Operasional <span className="text-amber-400">JAPARA LINES</span>
          </h2>
          <p className="mt-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Sistem terintegrasi pemantauan keberangkatan armada, manifes penumpang berlisensi, dan pengiriman kargo antarpulau dari Pelabuhan Kartini Jepara menuju Karimunjawa dan seluruh kepulauan Nusantara secara real-time.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onOpenNewPassenger}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4.5 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/25 transition cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <Users className="w-4 h-4 text-slate-950" />
              <span>+ Daftarkan Penumpang JAPARA</span>
            </button>
            <button
              onClick={onOpenNewCargo}
              className="bg-blue-900/80 hover:bg-blue-800 text-white border border-blue-700/80 font-semibold px-4.5 py-2.5 rounded-xl text-xs backdrop-blur-md transition cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <Package className="w-4 h-4 text-amber-300" />
              <span>+ Tambah Muatan Kargo</span>
            </button>
            <button
              onClick={onOpenNewShip}
              className="bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold px-4.5 py-2.5 rounded-xl text-xs backdrop-blur-md transition cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <ShipIcon className="w-4 h-4 text-cyan-300" />
              <span>+ Registrasi Armada</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Armada */}
        <div 
          onClick={() => onNavigate('ships')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-lg transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Armada Kapal</span>
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center group-hover:bg-blue-900 group-hover:text-amber-400 transition shadow-xs">
              <ShipIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{ships.length}</span>
            <span className="text-xs font-semibold text-slate-500">Unit Kapal Aktif</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {sailingShips} Berlayar
            </span>
            <span className="flex items-center gap-1.5 text-blue-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {dockedShips} Bersandar
            </span>
          </div>
        </div>

        {/* Total Penumpang */}
        <div 
          onClick={() => onNavigate('passengers')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-lg transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Manifes Penumpang</span>
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-800 flex items-center justify-center group-hover:bg-blue-900 group-hover:text-amber-400 transition shadow-xs">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{activePassengers}</span>
            <span className="text-xs font-semibold text-slate-500">Jiwa Terdaftar</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5 text-indigo-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              {boardingPassengers} Boarding
            </span>
            <span className="text-slate-500">Total: {passengers.length} Tiket</span>
          </div>
        </div>

        {/* Total Muatan Kargo */}
        <div 
          onClick={() => onNavigate('cargos')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-lg transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Muatan JAPARA</span>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center group-hover:bg-blue-900 group-hover:text-amber-400 transition shadow-xs">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalCargoTons}</span>
            <span className="text-xs font-semibold text-slate-500">Ton Muatan</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="font-mono">{totalCargoWeightKg.toLocaleString('id-ID')} Kg</span>
            <span className="text-amber-700 font-bold">{cargos.length} Resi Manifes</span>
          </div>
        </div>

        {/* Kesiapan Armada */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tingkat Kesiapan</span>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700">
              {ships.length > 0 ? Math.round(((sailingShips + dockedShips) / ships.length) * 100) : 0}%
            </span>
            <span className="text-xs font-semibold text-slate-500">Siap Operasional</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="text-slate-500">Dalam Perawatan:</span>
            <span className="font-bold text-rose-600">{maintenanceShips} Kapal</span>
          </div>
        </div>
      </div>

      {/* Fleet Monitoring & Realtime Capacity Breakdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Waves className="w-5 h-5 text-blue-700" />
              <span>Monitoring Kapasitas Armada JAPARA LINES</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Kalkulasi beban aktual penumpang dan tonase kargo dibandingkan batas aman kapal
            </p>
          </div>
          <button
            onClick={() => onNavigate('ships')}
            className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 hover:bg-blue-100 transition"
          >
            <span>Semua Armada JAPARA</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {ships.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <ShipIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700">Belum ada armada kapal JAPARA terdaftar</h4>
            <p className="text-xs text-slate-500 mt-1">Gunakan tombol 'Reset Data Contoh JAPARA' di pojok kanan atas untuk memuat armada awal.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            {ships.map((ship) => {
              const shipPassengers = passengers.filter(
                (p) => p.shipId === ship.id && p.status !== 'Batal'
              );
              const shipCargos = cargos.filter(
                (c) => c.shipId === ship.id && c.status !== 'Dibatalkan'
              );

              const currentPassengerCount = shipPassengers.length;
              const currentCargoKg = shipCargos.reduce((sum, c) => sum + (c.weightKg || 0), 0);
              const currentCargoTons = currentCargoKg / 1000;

              const passengerPct = ship.passengerCapacity > 0 
                ? Math.min(100, Math.round((currentPassengerCount / ship.passengerCapacity) * 100))
                : 0;

              const cargoCapacityKg = (ship.cargoCapacityTons || 0) * 1000;
              const cargoPct = cargoCapacityKg > 0
                ? Math.min(100, Math.round((currentCargoKg / cargoCapacityKg) * 100))
                : 0;

              const statusBadge = {
                'Berlayar': 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
                'Bersandar': 'bg-blue-50 text-blue-800 border-blue-300 font-bold',
                'Maintenance': 'bg-rose-50 text-rose-800 border-rose-300 font-bold',
              }[ship.status] || 'bg-slate-100 text-slate-800 border-slate-200';

              return (
                <div 
                  key={ship.id}
                  className="p-5 sm:p-6 rounded-3xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-blue-400 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-base sm:text-lg">{ship.name}</h4>
                        <span className="text-[11px] font-mono font-bold text-blue-900 bg-blue-100/80 px-2 py-0.5 rounded-md border border-blue-200">
                          {ship.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 font-medium">{ship.route}</p>
                    </div>
                    <span className={`text-[11px] px-3 py-1 rounded-full border ${statusBadge}`}>
                      {ship.status}
                    </span>
                  </div>

                  {/* Meters */}
                  <div className="mt-5 space-y-3.5">
                    {/* Passenger Bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5 font-medium">
                        <span className="text-slate-700 flex items-center gap-1.5 font-semibold">
                          <Users className="w-3.5 h-3.5 text-blue-700" />
                          Okupansi Penumpang
                        </span>
                        <span className="text-slate-900 font-bold">
                          {currentPassengerCount} / {ship.passengerCapacity} Jiwa ({passengerPct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            passengerPct > 90 ? 'bg-rose-500' : passengerPct > 70 ? 'bg-amber-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${passengerPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Cargo Bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5 font-medium">
                        <span className="text-slate-700 flex items-center gap-1.5 font-semibold">
                          <Scale className="w-3.5 h-3.5 text-amber-600" />
                          Beban Muatan Kargo
                        </span>
                        <span className="text-slate-900 font-bold">
                          {currentCargoTons.toFixed(1)} / {ship.cargoCapacityTons} Ton ({cargoPct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            cargoPct > 90 ? 'bg-rose-500' : cargoPct > 70 ? 'bg-amber-500' : 'bg-amber-600'
                          }`}
                          style={{ width: `${cargoPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Tipe: {ship.type}</span>
                    <button
                      onClick={() => onNavigate('passengers')}
                      className="text-blue-700 hover:text-blue-900 font-bold cursor-pointer"
                    >
                      Buka Manifes Kapal →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

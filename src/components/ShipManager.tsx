import React, { useState } from 'react';
import { Ship, Passenger, Cargo } from '../types';
import { 
  createShip, 
  updateShip, 
  deleteShip 
} from '../services/shipService';
import { useAuth } from '../context/AuthContext';
import { 
  Ship as ShipIcon, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Anchor, 
  AlertTriangle, 
  Users, 
  Package, 
  Check, 
  Filter,
  Route,
  Info
} from 'lucide-react';

interface ShipManagerProps {
  ships: Ship[];
  passengers: Passenger[];
  cargos: Cargo[];
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  onNotify: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
}

export const ShipManager: React.FC<ShipManagerProps> = ({
  ships,
  passengers,
  cargos,
  isAddModalOpen,
  setIsAddModalOpen,
  onNotify
}) => {
  const { user } = useAuth();
  const operatorEmail = user?.email || 'admin@kapal.id';

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Bersandar' | 'Berlayar' | 'Maintenance'>('All');

  // Edit & Delete modal state
  const [editingShip, setEditingShip] = useState<Ship | null>(null);
  const [shipToDelete, setShipToDelete] = useState<Ship | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'Kapal Penumpang & Kargo',
    passengerCapacity: 1000,
    cargoCapacityTons: 500,
    route: '',
    status: 'Bersandar' as 'Bersandar' | 'Berlayar' | 'Maintenance'
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: 'Kapal Penumpang & Kargo',
      passengerCapacity: 1000,
      cargoCapacityTons: 500,
      route: '',
      status: 'Bersandar'
    });
    setFormErrors({});
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (ship: Ship) => {
    setEditingShip(ship);
    setFormData({
      name: ship.name,
      code: ship.code,
      type: ship.type,
      passengerCapacity: ship.passengerCapacity,
      cargoCapacityTons: ship.cargoCapacityTons,
      route: ship.route,
      status: ship.status
    });
    setFormErrors({});
  };

  // Strict Validation Logic
  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!formData.name.trim()) {
      errs.name = 'Nama kapal wajib diisi';
    } else if (formData.name.trim().length < 3) {
      errs.name = 'Nama kapal minimal 3 karakter';
    } else if (formData.name.trim().length > 100) {
      errs.name = 'Nama kapal maksimal 100 karakter';
    }

    if (!formData.code.trim()) {
      errs.code = 'Kode registrasi armada wajib diisi';
    } else if (formData.code.trim().length < 2) {
      errs.code = 'Kode minimal 2 karakter';
    }

    if (!formData.route.trim()) {
      errs.route = 'Rute pelayaran utama wajib diisi';
    }

    if (Number(formData.passengerCapacity) <= 0) {
      errs.passengerCapacity = 'Kapasitas penumpang harus lebih dari 0';
    }

    if (Number(formData.cargoCapacityTons) < 0) {
      errs.cargoCapacityTons = 'Kapasitas muatan tidak boleh negatif';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle Save (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      onNotify('error', 'Validasi Gagal', 'Harap periksa kembali isian formulir kapal.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingShip) {
        // UPDATE
        await updateShip(
          editingShip.id,
          {
            name: formData.name.trim(),
            code: formData.code.trim().toUpperCase(),
            type: formData.type,
            passengerCapacity: Number(formData.passengerCapacity),
            cargoCapacityTons: Number(formData.cargoCapacityTons),
            route: formData.route.trim(),
            status: formData.status
          },
          operatorEmail
        );
        onNotify('success', 'Kapal Diperbarui', `Data kapal ${formData.name} berhasil disimpan di Firestore.`);
        setEditingShip(null);
      } else {
        // CREATE
        await createShip(
          {
            name: formData.name.trim(),
            code: formData.code.trim().toUpperCase(),
            type: formData.type,
            passengerCapacity: Number(formData.passengerCapacity),
            cargoCapacityTons: Number(formData.cargoCapacityTons),
            route: formData.route.trim(),
            status: formData.status
          },
          operatorEmail
        );
        onNotify('success', 'Kapal Ditambahkan', `Armada baru ${formData.name} berhasil didaftarkan di Firestore.`);
        setIsAddModalOpen(false);
      }
      resetForm();
    } catch (err: any) {
      onNotify('error', 'Gagal Menyimpan', err.message || 'Terjadi kesalahan saat menyimpan ke database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const confirmDelete = async () => {
    if (!shipToDelete) return;

    setIsSubmitting(true);
    try {
      await deleteShip(shipToDelete.id, shipToDelete.name, operatorEmail);
      onNotify('success', 'Kapal Dihapus', `Armada ${shipToDelete.name} telah dihapus dari sistem.`);
      setShipToDelete(null);
    } catch (err: any) {
      onNotify('error', 'Gagal Menghapus', err.message || 'Gagal menghapus dokumen dari Firestore.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered ships
  const filteredShips = ships.filter((ship) => {
    const matchesSearch = 
      ship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ship.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ship.route.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || ship.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShipIcon className="w-6 h-6 text-blue-700" />
            <span>Manajemen Armada Kapal JAPARA LINES</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data registrasi kapal, rute Pelabuhan Kartini Jepara - Karimunjawa, dan kapasitas kargo secara realtime di Firebase
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-blue-700/20 transition cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Armada JAPARA</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama kapal, kode, rute..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 mr-1" />
          {(['All', 'Bersandar', 'Berlayar', 'Maintenance'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer ${
                statusFilter === status
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
              }`}
            >
              {status === 'All' ? 'Semua Status' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Ship List Cards */}
      {filteredShips.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
          <ShipIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Tidak ada data kapal ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1">
            {searchTerm || statusFilter !== 'All'
              ? 'Coba ganti kata kunci pencarian atau reset filter status.'
              : 'Belum ada kapal terdaftar. Silakan tambahkan kapal baru.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredShips.map((ship) => {
            const shipPassengers = passengers.filter(
              (p) => p.shipId === ship.id && p.status !== 'Batal'
            );
            const shipCargos = cargos.filter(
              (c) => c.shipId === ship.id && c.status !== 'Dibatalkan'
            );

            const totalKg = shipCargos.reduce((sum, c) => sum + (c.weightKg || 0), 0);
            const totalTons = (totalKg / 1000).toFixed(1);

            const statusColors = {
              'Bersandar': 'bg-sky-50 text-sky-700 border-sky-200',
              'Berlayar': 'bg-emerald-50 text-emerald-700 border-emerald-200',
              'Maintenance': 'bg-rose-50 text-rose-700 border-rose-200'
            }[ship.status] || 'bg-slate-50 text-slate-700 border-slate-200';

            return (
              <div
                key={ship.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-sky-300 transition flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-100">
                          {ship.code}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">{ship.type}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mt-2">{ship.name}</h3>
                    </div>

                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusColors}`}>
                      {ship.status}
                    </span>
                  </div>

                  {/* Route */}
                  <div className="mt-4 p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-start gap-2 text-xs">
                    <Route className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Rute Pelayaran</span>
                      <span className="text-slate-700 font-medium">{ship.route}</span>
                    </div>
                  </div>

                  {/* Capacity Statistics */}
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                    <div className="bg-sky-50/50 p-2.5 rounded-xl border border-sky-100/60">
                      <div className="flex items-center gap-1.5 text-xs text-sky-800 font-medium">
                        <Users className="w-3.5 h-3.5 text-sky-600" />
                        <span>Penumpang</span>
                      </div>
                      <div className="mt-1 text-base font-bold text-slate-900">
                        {shipPassengers.length} <span className="text-xs font-normal text-slate-500">/ {ship.passengerCapacity}</span>
                      </div>
                    </div>

                    <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/60">
                      <div className="flex items-center gap-1.5 text-xs text-amber-800 font-medium">
                        <Package className="w-3.5 h-3.5 text-amber-600" />
                        <span>Kargo (Ton)</span>
                      </div>
                      <div className="mt-1 text-base font-bold text-slate-900">
                        {totalTons} <span className="text-xs font-normal text-slate-500">/ {ship.cargoCapacityTons}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(ship)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-sky-700 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 px-3 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setShipToDelete(ship)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 px-3 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE & EDIT MODAL */}
      {(isAddModalOpen || editingShip) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-sky-600 to-blue-700 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShipIcon className="w-5 h-5" />
                <h3 className="font-bold text-base">
                  {editingShip ? 'Edit Data Armada Kapal' : 'Tambah Armada Kapal Baru'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingShip(null);
                  resetForm();
                }}
                className="text-sky-100 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Nama Kapal */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kapal <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="contoh: KM Kelud"
                  className={`w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border ${
                    formErrors.name ? 'border-rose-300' : 'border-slate-200'
                  } focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Kode Kapal & Tipe */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kode Registrasi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="contoh: PELNI-KLD-01"
                    className={`w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border uppercase ${
                      formErrors.code ? 'border-rose-300' : 'border-slate-200'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500`}
                  />
                  {formErrors.code && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.code}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis / Tipe Kapal
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  >
                    <option value="Kapal Penumpang & Kargo">Kapal Penumpang &amp; Kargo</option>
                    <option value="Ferry Ro-Ro Cepat">Ferry Ro-Ro Cepat</option>
                    <option value="Kapal Penumpang Nusantara">Kapal Penumpang Nusantara</option>
                    <option value="Kapal Kontainer / Logistik">Kapal Kontainer / Logistik</option>
                    <option value="Kapal Cepat / Speedboat">Kapal Cepat / Speedboat</option>
                  </select>
                </div>
              </div>

              {/* Rute Pelayaran */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rute Pelayaran Utama <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.route}
                  onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                  placeholder="contoh: Tanjung Priok - Batu Ampar - Belawan"
                  className={`w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border ${
                    formErrors.route ? 'border-rose-300' : 'border-slate-200'
                  } focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500`}
                />
                {formErrors.route && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.route}</p>
                )}
              </div>

              {/* Kapasitas Penumpang & Kargo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kapasitas Penumpang (Jiwa) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.passengerCapacity}
                    onChange={(e) => setFormData({ ...formData, passengerCapacity: Number(e.target.value) })}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border ${
                      formErrors.passengerCapacity ? 'border-rose-300' : 'border-slate-200'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500`}
                  />
                  {formErrors.passengerCapacity && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.passengerCapacity}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Daya Angkut Kargo (Ton) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.cargoCapacityTons}
                    onChange={(e) => setFormData({ ...formData, cargoCapacityTons: Number(e.target.value) })}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border ${
                      formErrors.cargoCapacityTons ? 'border-rose-300' : 'border-slate-200'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500`}
                  />
                  {formErrors.cargoCapacityTons && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.cargoCapacityTons}</p>
                  )}
                </div>
              </div>

              {/* Status Operasional */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Operasional
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Bersandar', 'Berlayar', 'Maintenance'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData({ ...formData, status })}
                      className={`text-xs font-semibold py-2 px-3 rounded-xl border transition cursor-pointer ${
                        formData.status === status
                          ? status === 'Bersandar'
                            ? 'bg-sky-500 text-white border-sky-600'
                            : status === 'Berlayar'
                            ? 'bg-emerald-500 text-white border-emerald-600'
                            : 'bg-rose-500 text-white border-rose-600'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingShip(null);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md shadow-sky-600/20 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan ke Firestore...' : editingShip ? 'Simpan Perubahan' : 'Daftarkan Kapal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {shipToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              Konfirmasi Hapus Kapal
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus armada <strong className="text-slate-900">{shipToDelete.name}</strong> ({shipToDelete.code})? Data akan dihapus secara permanen dari Firebase Firestore.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShipToDelete(null)}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Menghapus...' : 'Ya, Hapus Permanen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Cargo, Ship } from '../types';
import { 
  createCargo, 
  updateCargo, 
  deleteCargo 
} from '../services/cargoService';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Ship as ShipIcon, 
  AlertTriangle, 
  Filter, 
  Scale, 
  Truck, 
  Layers, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface CargoManagerProps {
  cargos: Cargo[];
  ships: Ship[];
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  onNotify: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
}

export const CargoManager: React.FC<CargoManagerProps> = ({
  cargos,
  ships,
  isAddModalOpen,
  setIsAddModalOpen,
  onNotify
}) => {
  const { user } = useAuth();
  const operatorEmail = user?.email || 'admin@kapal.id';

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShipFilter, setSelectedShipFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modals
  const [editingCargo, setEditingCargo] = useState<Cargo | null>(null);
  const [cargoToDelete, setCargoToDelete] = useState<Cargo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    shipId: ships[0]?.id || '',
    shipName: ships[0]?.name || '',
    manifestNumber: `CRG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    senderName: '',
    receiverName: '',
    cargoType: 'Bahan Pokok / Pangan',
    weightKg: 1000,
    volumeM3: 10,
    unitCount: 1,
    dangerousGoods: false,
    departurePort: 'Tanjung Priok',
    destinationPort: 'Belawan',
    status: 'Terkonfirmasi' as Cargo['status'],
    notes: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    const defaultShip = ships[0];
    setFormData({
      shipId: defaultShip?.id || '',
      shipName: defaultShip?.name || '',
      manifestNumber: `CRG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      senderName: '',
      receiverName: '',
      cargoType: 'Bahan Pokok / Pangan',
      weightKg: 1000,
      volumeM3: 10,
      unitCount: 1,
      dangerousGoods: false,
      departurePort: defaultShip?.route.split('-')[0]?.trim() || 'Tanjung Priok',
      destinationPort: defaultShip?.route.split('-')[1]?.trim() || 'Belawan',
      status: 'Terkonfirmasi',
      notes: ''
    });
    setFormErrors({});
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (c: Cargo) => {
    setEditingCargo(c);
    setFormData({
      shipId: c.shipId,
      shipName: c.shipName,
      manifestNumber: c.manifestNumber,
      senderName: c.senderName,
      receiverName: c.receiverName,
      cargoType: c.cargoType,
      weightKg: c.weightKg,
      volumeM3: c.volumeM3 || 0,
      unitCount: c.unitCount || 1,
      dangerousGoods: c.dangerousGoods || false,
      departurePort: c.departurePort,
      destinationPort: c.destinationPort,
      status: c.status,
      notes: c.notes || ''
    });
    setFormErrors({});
  };

  // Strict Validation
  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!formData.shipId) {
      errs.shipId = 'Wajib memilih kapal pengangkut';
    }

    if (!formData.manifestNumber.trim()) {
      errs.manifestNumber = 'Nomor manifes wajib diisi';
    }

    if (!formData.senderName.trim()) {
      errs.senderName = 'Nama pengirim / ekspedisi wajib diisi';
    }

    if (!formData.receiverName.trim()) {
      errs.receiverName = 'Nama penerima logistik wajib diisi';
    }

    if (Number(formData.weightKg) <= 0) {
      errs.weightKg = 'Berat kargo harus lebih dari 0 kg';
    }

    if (Number(formData.unitCount) <= 0) {
      errs.unitCount = 'Jumlah koli / unit minimal 1';
    }

    if (!formData.departurePort.trim()) {
      errs.departurePort = 'Pelabuhan asal wajib diisi';
    }

    if (!formData.destinationPort.trim()) {
      errs.destinationPort = 'Pelabuhan tujuan wajib diisi';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      onNotify('error', 'Validasi Gagal', 'Harap periksa isian data kargo.');
      return;
    }

    const shipObj = ships.find((s) => s.id === formData.shipId);
    const resolvedShipName = shipObj?.name || formData.shipName;

    setIsSubmitting(true);
    try {
      if (editingCargo) {
        await updateCargo(
          editingCargo.id,
          {
            shipId: formData.shipId,
            shipName: resolvedShipName,
            manifestNumber: formData.manifestNumber.trim().toUpperCase(),
            senderName: formData.senderName.trim(),
            receiverName: formData.receiverName.trim(),
            cargoType: formData.cargoType,
            weightKg: Number(formData.weightKg),
            volumeM3: Number(formData.volumeM3 || 0),
            unitCount: Number(formData.unitCount || 1),
            dangerousGoods: Boolean(formData.dangerousGoods),
            departurePort: formData.departurePort.trim(),
            destinationPort: formData.destinationPort.trim(),
            status: formData.status,
            notes: formData.notes.trim()
          },
          operatorEmail
        );
        onNotify('success', 'Kargo Diperbarui', `Manifes ${formData.manifestNumber} diperbarui di Firestore.`);
        setEditingCargo(null);
      } else {
        await createCargo(
          {
            shipId: formData.shipId,
            shipName: resolvedShipName,
            manifestNumber: formData.manifestNumber.trim().toUpperCase(),
            senderName: formData.senderName.trim(),
            receiverName: formData.receiverName.trim(),
            cargoType: formData.cargoType,
            weightKg: Number(formData.weightKg),
            volumeM3: Number(formData.volumeM3 || 0),
            unitCount: Number(formData.unitCount || 1),
            dangerousGoods: Boolean(formData.dangerousGoods),
            departurePort: formData.departurePort.trim(),
            destinationPort: formData.destinationPort.trim(),
            status: formData.status,
            notes: formData.notes.trim(),
            createdBy: operatorEmail
          },
          operatorEmail
        );
        onNotify('success', 'Kargo Terdaftar', `Manifes ${formData.manifestNumber} berhasil disimpan di Firestore.`);
        setIsAddModalOpen(false);
      }
      resetForm();
    } catch (err: any) {
      onNotify('error', 'Gagal Menyimpan', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!cargoToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteCargo(
        cargoToDelete.id,
        `${cargoToDelete.manifestNumber} (${cargoToDelete.cargoType})`,
        operatorEmail
      );
      onNotify('success', 'Kargo Dihapus', `Manifes ${cargoToDelete.manifestNumber} dihapus.`);
      setCargoToDelete(null);
    } catch (err: any) {
      onNotify('error', 'Gagal Menghapus', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (c: Cargo, newStatus: Cargo['status']) => {
    try {
      await updateCargo(c.id, { status: newStatus }, operatorEmail);
      onNotify('info', 'Status Kargo Diubah', `Manifes ${c.manifestNumber} sekarang ${newStatus}`);
    } catch (err: any) {
      onNotify('error', 'Gagal Mengubah Status', err.message);
    }
  };

  // Filtered
  const filteredCargos = cargos.filter((c) => {
    const matchesSearch =
      c.manifestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cargoType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesShip = selectedShipFilter === 'All' || c.shipId === selectedShipFilter;
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

    return matchesSearch && matchesShip && matchesStatus;
  });

  const totalFilteredWeightKg = filteredCargos.reduce((sum, c) => sum + (c.weightKg || 0), 0);
  const totalFilteredTons = (totalFilteredWeightKg / 1000).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-600" />
            <span>Manifes Muatan Kargo &amp; Logistik JAPARA LINES</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan kargo mebel ukir Jepara, muatan logistik Karimunjawa, dan ekspedisi antarpulau di Firestore
          </p>
        </div>

        <button
          onClick={openAddModal}
          disabled={ships.length === 0}
          className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-amber-600/20 transition cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Manifes Kargo</span>
        </button>
      </div>

      {/* Filter and Summary Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari resi kargo, pengirim, jenis..."
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

          {/* Ship Filter */}
          <div className="flex items-center gap-2">
            <ShipIcon className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedShipFilter}
              onChange={(e) => setSelectedShipFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            >
              <option value="All">Semua Armada</option>
              {ships.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {(['All', 'Terkonfirmasi', 'Dimuat (Loading)', 'Dalam Pelayaran', 'Terkirim', 'Dibatalkan'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer ${
                statusFilter === status
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
              }`}
            >
              {status === 'All' ? 'Semua Status' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Cargo Weight Banner */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-amber-900 font-semibold">
          <Scale className="w-4 h-4 text-amber-600" />
          <span>Total Tonase Kargo Terpilih:</span>
          <span className="text-sm font-bold text-slate-900">{totalFilteredTons} Ton</span>
          <span className="text-slate-500 font-normal">({totalFilteredWeightKg.toLocaleString('id-ID')} Kg)</span>
        </div>
        <div className="text-amber-800 font-medium">
          {filteredCargos.length} Berkas Manifes
        </div>
      </div>

      {/* Cargo Table */}
      {filteredCargos.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Tidak ada manifes muatan ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1">
            {searchTerm || statusFilter !== 'All' || selectedShipFilter !== 'All'
              ? 'Coba ubah kata kunci pencarian atau filter Anda.'
              : 'Belum ada muatan kargo terdaftar. Silakan input muatan baru.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">No. Manifes &amp; Kapal</th>
                  <th className="py-3.5 px-4">Pengirim &amp; Penerima</th>
                  <th className="py-3.5 px-4">Jenis Muatan</th>
                  <th className="py-3.5 px-4">Tonase / Berat</th>
                  <th className="py-3.5 px-4">Pelabuhan Rute</th>
                  <th className="py-3.5 px-4">Status Muat</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCargos.map((cargo) => {
                  const statusColors = {
                    'Terkonfirmasi': 'bg-sky-50 text-sky-700 border-sky-200',
                    'Dimuat (Loading)': 'bg-amber-50 text-amber-700 border-amber-200',
                    'Dalam Pelayaran': 'bg-indigo-50 text-indigo-700 border-indigo-200',
                    'Terkirim': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    'Dibatalkan': 'bg-rose-50 text-rose-700 border-rose-200'
                  }[cargo.status] || 'bg-slate-50 text-slate-700 border-slate-200';

                  const tons = ((cargo.weightKg || 0) / 1000).toFixed(2);

                  return (
                    <tr key={cargo.id} className="hover:bg-amber-50/30 transition">
                      {/* Manifest No & Ship */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-amber-800 text-xs flex items-center gap-1.5">
                          <span>{cargo.manifestNumber}</span>
                          {cargo.dangerousGoods && (
                            <span 
                              title="Muatan Berbahaya (B3)"
                              className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded"
                            >
                              B3
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <ShipIcon className="w-3 h-3 text-slate-400" />
                          <span>{cargo.shipName}</span>
                        </div>
                      </td>

                      {/* Sender & Receiver */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">Dari: {cargo.senderName}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Kepada: {cargo.receiverName}</div>
                      </td>

                      {/* Type & Units */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800">{cargo.cargoType}</span>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {cargo.unitCount} Unit / Koli {cargo.volumeM3 ? `• ${cargo.volumeM3} m³` : ''}
                        </div>
                      </td>

                      {/* Weight */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 font-mono">
                          {cargo.weightKg.toLocaleString('id-ID')} Kg
                        </div>
                        <div className="text-[11px] text-amber-700 font-semibold font-mono">
                          ({tons} Ton)
                        </div>
                      </td>

                      {/* Ports */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">
                          {cargo.departurePort} → {cargo.destinationPort}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <select
                          value={cargo.status}
                          onChange={(e) => handleQuickStatusChange(cargo, e.target.value as Cargo['status'])}
                          className={`text-[11px] font-semibold py-1 px-2.5 rounded-full border cursor-pointer ${statusColors}`}
                        >
                          <option value="Terkonfirmasi">Terkonfirmasi</option>
                          <option value="Dimuat (Loading)">Dimuat (Loading)</option>
                          <option value="Dalam Pelayaran">Dalam Pelayaran</option>
                          <option value="Terkirim">Terkirim</option>
                          <option value="Dibatalkan">Dibatalkan</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(cargo)}
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                            title="Edit data muatan"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setCargoToDelete(cargo)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus kargo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE & EDIT CARGO MODAL */}
      {(isAddModalOpen || editingCargo) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
            <div className="bg-gradient-to-r from-amber-600 to-orange-700 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5" />
                <h3 className="font-bold text-base">
                  {editingCargo ? 'Edit Manifes Muatan Kargo' : 'Input Manifes Muatan Kargo Baru'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingCargo(null);
                  resetForm();
                }}
                className="text-amber-100 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Ship Selection & Manifest Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kapal Pengangkut <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.shipId}
                    onChange={(e) => {
                      const selectedShip = ships.find((s) => s.id === e.target.value);
                      setFormData({
                        ...formData,
                        shipId: e.target.value,
                        shipName: selectedShip?.name || ''
                      });
                    }}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border ${
                      formErrors.shipId ? 'border-rose-300' : 'border-slate-200'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500`}
                  >
                    {ships.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Sisa: {s.cargoCapacityTons} Ton)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Resi / Manifes <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.manifestNumber}
                    onChange={(e) => setFormData({ ...formData, manifestNumber: e.target.value })}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border uppercase font-mono ${
                      formErrors.manifestNumber ? 'border-rose-300' : 'border-slate-200'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500`}
                  />
                </div>
              </div>

              {/* Sender & Receiver */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Pengirim / Vendor <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.senderName}
                    onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                    placeholder="contoh: PT Semen Indonesia"
                    className={`w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border ${
                      formErrors.senderName ? 'border-rose-300' : 'border-slate-200'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500`}
                  />
                  {formErrors.senderName && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.senderName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Penerima / Gudang <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.receiverName}
                    onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                    placeholder="contoh: CV Logistik Samudera"
                    className={`w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border ${
                      formErrors.receiverName ? 'border-rose-300' : 'border-slate-200'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500`}
                  />
                  {formErrors.receiverName && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.receiverName}</p>
                  )}
                </div>
              </div>

              {/* Cargo Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori &amp; Jenis Muatan
                </label>
                <select
                  value={formData.cargoType}
                  onChange={(e) => setFormData({ ...formData, cargoType: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  <option value="Bahan Pokok / Pangan">Bahan Pokok / Pangan (Sembako, Beras, Minyak)</option>
                  <option value="Kontainer 20ft Standar">Kontainer 20ft Standar</option>
                  <option value="Kontainer 40ft High-Cube">Kontainer 40ft High-Cube</option>
                  <option value="Kendaraan Truk Golongan V">Kendaraan Truk Golongan V (Ekspedisi)</option>
                  <option value="Kendaraan Mobil Pribadi Golongan IV">Kendaraan Mobil Pribadi Golongan IV</option>
                  <option value="Material Konstruksi & Baja">Material Konstruksi &amp; Baja</option>
                  <option value="Kargo Dingin / Cold Storage">Kargo Dingin / Cold Storage (Ikan & Daging)</option>
                  <option value="Barang Umum / Campuran">Barang Umum / Campuran</option>
                </select>
              </div>

              {/* Weight, Volume, Units */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Berat Bersih (Kg) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border ${
                      formErrors.weightKg ? 'border-rose-300' : 'border-slate-200'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500`}
                  />
                  {formErrors.weightKg && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.weightKg}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Volume (m³) Opsional
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.volumeM3}
                    onChange={(e) => setFormData({ ...formData, volumeM3: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jumlah Unit / Koli <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.unitCount}
                    onChange={(e) => setFormData({ ...formData, unitCount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Ports */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pelabuhan Muat Asal <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.departurePort}
                    onChange={(e) => setFormData({ ...formData, departurePort: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pelabuhan Bongkar Tujuan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.destinationPort}
                    onChange={(e) => setFormData({ ...formData, destinationPort: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Dangerous Goods (B3) checkbox */}
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="dg-checkbox"
                  checked={formData.dangerousGoods}
                  onChange={(e) => setFormData({ ...formData, dangerousGoods: e.target.checked })}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <label htmlFor="dg-checkbox" className="text-xs text-amber-950 font-medium cursor-pointer">
                  <span className="font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    Kategori Muatan Berbahaya (B3 / Dangerous Goods)
                  </span>
                  <span className="text-[11px] text-amber-700 block mt-0.5">
                    Centang jika muatan mengandung bahan kimia, mudah terbakar, atau memerlukan penanganan khusus di dek terbuka.
                  </span>
                </label>
              </div>

              {/* Status & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Operasional
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-semibold"
                  >
                    <option value="Terkonfirmasi">Terkonfirmasi</option>
                    <option value="Dimuat (Loading)">Dimuat (Loading)</option>
                    <option value="Dalam Pelayaran">Dalam Pelayaran</option>
                    <option value="Terkirim">Terkirim</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Keterangan Muatan
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Kondisi segel kontainer, plat nopol truk, dsb."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCargo(null);
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
                  className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md shadow-amber-600/20 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : editingCargo ? 'Perbarui Kargo' : 'Terbitkan Manifes Kargo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {cargoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              Konfirmasi Hapus Manifes Muatan
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Apakah Anda yakin ingin membatalkan/menghapus kargo <strong className="text-slate-900">{cargoToDelete.manifestNumber}</strong> ({cargoToDelete.cargoType}, {cargoToDelete.weightKg} kg)? Data akan dihapus secara permanen dari Firebase Firestore.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setCargoToDelete(null)}
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
                {isSubmitting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

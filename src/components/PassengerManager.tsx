import React, { useState } from 'react';
import { Passenger, Ship } from '../types';
import { 
  createPassenger, 
  updatePassenger, 
  deletePassenger 
} from '../services/passengerService';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Ship as ShipIcon, 
  CreditCard, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  AlertTriangle, 
  Filter,
  Printer,
  QrCode,
  Tag
} from 'lucide-react';

interface PassengerManagerProps {
  passengers: Passenger[];
  ships: Ship[];
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  onNotify: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
}

export const PassengerManager: React.FC<PassengerManagerProps> = ({
  passengers,
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
  const [statusFilter, setStatusFilter] = useState<'All' | 'Check-in' | 'Boarding' | 'Tiba' | 'Batal'>('All');

  // Modals
  const [editingPassenger, setEditingPassenger] = useState<Passenger | null>(null);
  const [passengerToDelete, setPassengerToDelete] = useState<Passenger | null>(null);
  const [viewTicket, setViewTicket] = useState<Passenger | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    shipId: ships[0]?.id || '',
    shipName: ships[0]?.name || '',
    ticketNumber: `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    fullName: '',
    idNumber: '',
    gender: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
    ageCategory: 'Dewasa' as 'Dewasa' | 'Anak' | 'Bayi',
    cabinClass: 'Ekonomi' as 'VIP' | 'Kelas 1' | 'Ekonomi',
    departurePort: 'Tanjung Priok',
    destinationPort: 'Belawan',
    departureDate: new Date().toISOString().split('T')[0],
    seatNumber: 'DEK-A01',
    status: 'Check-in' as 'Check-in' | 'Boarding' | 'Tiba' | 'Batal',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    const defaultShip = ships[0];
    setFormData({
      shipId: defaultShip?.id || '',
      shipName: defaultShip?.name || '',
      ticketNumber: `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: '',
      idNumber: '',
      gender: 'Laki-laki',
      ageCategory: 'Dewasa',
      cabinClass: 'Ekonomi',
      departurePort: defaultShip?.route.split('-')[0]?.trim() || 'Tanjung Priok',
      destinationPort: defaultShip?.route.split('-')[1]?.trim() || 'Belawan',
      departureDate: new Date().toISOString().split('T')[0],
      seatNumber: 'DEK-A01',
      status: 'Check-in',
      notes: ''
    });
    setFormErrors({});
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (p: Passenger) => {
    setEditingPassenger(p);
    setFormData({
      shipId: p.shipId,
      shipName: p.shipName,
      ticketNumber: p.ticketNumber,
      fullName: p.fullName,
      idNumber: p.idNumber,
      gender: p.gender,
      ageCategory: p.ageCategory,
      cabinClass: p.cabinClass,
      departurePort: p.departurePort,
      destinationPort: p.destinationPort,
      departureDate: p.departureDate,
      seatNumber: p.seatNumber,
      status: p.status,
      notes: p.notes || ''
    });
    setFormErrors({});
  };

  // Strict Validation
  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!formData.shipId) {
      errs.shipId = 'Wajib memilih kapal pelayaran';
    }

    if (!formData.fullName.trim()) {
      errs.fullName = 'Nama lengkap penumpang wajib diisi';
    } else if (formData.fullName.trim().length < 3) {
      errs.fullName = 'Nama lengkap minimal 3 karakter';
    }

    // NIK validation (16 digits check or standard alphanumeric ID)
    const cleanId = formData.idNumber.trim();
    if (!cleanId) {
      errs.idNumber = 'Nomor identitas (NIK / Paspor) wajib diisi';
    } else if (!/^[A-Za-z0-9]{6,20}$/.test(cleanId)) {
      errs.idNumber = 'NIK/Paspor harus 6-20 karakter alfanumerik';
    }

    if (!formData.ticketNumber.trim()) {
      errs.ticketNumber = 'Nomor tiket wajib diisi';
    }

    if (!formData.departurePort.trim()) {
      errs.departurePort = 'Pelabuhan asal wajib diisi';
    }

    if (!formData.destinationPort.trim()) {
      errs.destinationPort = 'Pelabuhan tujuan wajib diisi';
    }

    if (!formData.departureDate) {
      errs.departureDate = 'Tanggal keberangkatan wajib dipilih';
    }

    if (!formData.seatNumber.trim()) {
      errs.seatNumber = 'Nomor kursi / dek wajib diisi';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      onNotify('error', 'Validasi Gagal', 'Harap periksa kembali format NIK dan data penumpang.');
      return;
    }

    const shipObj = ships.find((s) => s.id === formData.shipId);
    const resolvedShipName = shipObj?.name || formData.shipName;

    setIsSubmitting(true);
    try {
      if (editingPassenger) {
        await updatePassenger(
          editingPassenger.id,
          {
            shipId: formData.shipId,
            shipName: resolvedShipName,
            ticketNumber: formData.ticketNumber.trim().toUpperCase(),
            fullName: formData.fullName.trim(),
            idNumber: formData.idNumber.trim(),
            gender: formData.gender,
            ageCategory: formData.ageCategory,
            cabinClass: formData.cabinClass,
            departurePort: formData.departurePort.trim(),
            destinationPort: formData.destinationPort.trim(),
            departureDate: formData.departureDate,
            seatNumber: formData.seatNumber.trim(),
            status: formData.status,
            notes: formData.notes.trim()
          },
          operatorEmail
        );
        onNotify('success', 'Tiket Diperbarui', `Manifes ${formData.fullName} berhasil diperbarui di Firestore.`);
        setEditingPassenger(null);
      } else {
        await createPassenger(
          {
            shipId: formData.shipId,
            shipName: resolvedShipName,
            ticketNumber: formData.ticketNumber.trim().toUpperCase(),
            fullName: formData.fullName.trim(),
            idNumber: formData.idNumber.trim(),
            gender: formData.gender,
            ageCategory: formData.ageCategory,
            cabinClass: formData.cabinClass,
            departurePort: formData.departurePort.trim(),
            destinationPort: formData.destinationPort.trim(),
            departureDate: formData.departureDate,
            seatNumber: formData.seatNumber.trim(),
            status: formData.status,
            notes: formData.notes.trim(),
            createdBy: operatorEmail
          },
          operatorEmail
        );
        onNotify('success', 'Tiket Diterbitkan', `Manifes tiket ${formData.ticketNumber} untuk ${formData.fullName} tersimpan di Firestore.`);
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
    if (!passengerToDelete) return;
    setIsSubmitting(true);
    try {
      await deletePassenger(
        passengerToDelete.id,
        `${passengerToDelete.ticketNumber} - ${passengerToDelete.fullName}`,
        operatorEmail
      );
      onNotify('success', 'Tiket Dihapus', `Tiket ${passengerToDelete.ticketNumber} telah dihapus.`);
      setPassengerToDelete(null);
    } catch (err: any) {
      onNotify('error', 'Gagal Menghapus', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fast quick status update
  const handleQuickStatusChange = async (p: Passenger, newStatus: Passenger['status']) => {
    try {
      await updatePassenger(p.id, { status: newStatus }, operatorEmail);
      onNotify('info', 'Status Tiket Diubah', `${p.fullName} sekarang berstatus ${newStatus}`);
    } catch (err: any) {
      onNotify('error', 'Gagal Memperbarui Status', err.message);
    }
  };

  // Filtered
  const filteredPassengers = passengers.filter((p) => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.idNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.seatNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesShip = selectedShipFilter === 'All' || p.shipId === selectedShipFilter;
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

    return matchesSearch && matchesShip && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-700" />
            <span>Manifes Penumpang JAPARA LINES</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pendaftaran tiket resmi, verifikasi NIK/KTP penumpang, dan status boarding Pelabuhan Kartini Jepara - Karimunjawa
          </p>
        </div>

        <button
          onClick={openAddModal}
          disabled={ships.length === 0}
          className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-blue-700/20 transition cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Daftarkan Penumpang Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, NIK, no tiket, kursi..."
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
              <option value="All">Semua Armada Kapal</option>
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
          {(['All', 'Check-in', 'Boarding', 'Tiba', 'Batal'] as const).map((status) => (
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

      {/* Passengers Table */}
      {filteredPassengers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Tidak ada data manifes penumpang</h3>
          <p className="text-xs text-slate-500 mt-1">
            {searchTerm || statusFilter !== 'All' || selectedShipFilter !== 'All'
              ? 'Coba sesuaikan kata kunci pencarian atau filter Anda.'
              : 'Belum ada tiket terdaftar. Silakan tambahkan penumpang baru.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">No. Tiket &amp; Kapal</th>
                  <th className="py-3.5 px-4">Nama Penumpang</th>
                  <th className="py-3.5 px-4">Identitas (NIK/Paspor)</th>
                  <th className="py-3.5 px-4">Kelas &amp; Kursi</th>
                  <th className="py-3.5 px-4">Rute Perjalanan</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPassengers.map((passenger) => {
                  const statusColors = {
                    'Check-in': 'bg-sky-50 text-sky-700 border-sky-200',
                    'Boarding': 'bg-indigo-50 text-indigo-700 border-indigo-200',
                    'Tiba': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    'Batal': 'bg-rose-50 text-rose-700 border-rose-200'
                  }[passenger.status] || 'bg-slate-50 text-slate-700 border-slate-200';

                  const classBadge = {
                    'VIP': 'bg-amber-100 text-amber-800 border-amber-200 font-bold',
                    'Kelas 1': 'bg-blue-100 text-blue-800 border-blue-200 font-semibold',
                    'Ekonomi': 'bg-slate-100 text-slate-700 border-slate-200'
                  }[passenger.cabinClass] || '';

                  return (
                    <tr key={passenger.id} className="hover:bg-sky-50/40 transition">
                      {/* Ticket & Ship */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-sky-700 text-xs">{passenger.ticketNumber}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <ShipIcon className="w-3 h-3 text-slate-400" />
                          <span>{passenger.shipName}</span>
                        </div>
                      </td>

                      {/* Name & Gender */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{passenger.fullName}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {passenger.gender} • {passenger.ageCategory}
                        </div>
                      </td>

                      {/* NIK */}
                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-700">{passenger.idNumber}</div>
                      </td>

                      {/* Cabin Class & Seat */}
                      <td className="py-3 px-4">
                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded border ${classBadge}`}>
                          {passenger.cabinClass}
                        </span>
                        <div className="font-mono font-medium text-slate-800 mt-1">
                          Kursi: {passenger.seatNumber}
                        </div>
                      </td>

                      {/* Route & Date */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">
                          {passenger.departurePort} → {passenger.destinationPort}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>{passenger.departureDate}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <select
                          value={passenger.status}
                          onChange={(e) => handleQuickStatusChange(passenger, e.target.value as Passenger['status'])}
                          className={`text-[11px] font-semibold py-1 px-2.5 rounded-full border cursor-pointer ${statusColors}`}
                        >
                          <option value="Check-in">Check-in</option>
                          <option value="Boarding">Boarding</option>
                          <option value="Tiba">Tiba</option>
                          <option value="Batal">Batal</option>
                        </select>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewTicket(passenger)}
                            className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition"
                            title="Lihat Tiket / Boarding Pass"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(passenger)}
                            className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition"
                            title="Edit data tiket"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setPassengerToDelete(passenger)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus penumpang"
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

      {/* CREATE & EDIT PASSENGER MODAL */}
      {(isAddModalOpen || editingPassenger) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
            <div className="bg-gradient-to-r from-sky-600 to-blue-700 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5" />
                <h3 className="font-bold text-base">
                  {editingPassenger ? 'Edit Manifes Penumpang' : 'Daftarkan Tiket Penumpang Baru'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingPassenger(null);
                  resetForm();
                }}
                className="text-sky-100 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Ship Selection & Ticket Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kapal Armada <span className="text-rose-500">*</span>
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
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500`}
                  >
                    {ships.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                  {formErrors.shipId && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.shipId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Tiket <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ticketNumber}
                    onChange={(e) => setFormData({ ...formData, ticketNumber: e.target.value })}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border uppercase font-mono ${
                      formErrors.ticketNumber ? 'border-rose-300' : 'border-slate-200'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500`}
                  />
                  {formErrors.ticketNumber && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.ticketNumber}</p>
                  )}
                </div>
              </div>

              {/* Full Name & NIK */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap Penumpang <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="sesuai KTP / Paspor"
                    className={`w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border ${
                      formErrors.fullName ? 'border-rose-300' : 'border-slate-200'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500`}
                  />
                  {formErrors.fullName && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIK / Nomor Paspor <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    placeholder="16 digit angka NIK"
                    className={`w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border font-mono ${
                      formErrors.idNumber ? 'border-rose-300' : 'border-slate-200'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500`}
                  />
                  {formErrors.idNumber && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.idNumber}</p>
                  )}
                </div>
              </div>

              {/* Gender, Category & Cabin Class */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori Usia
                  </label>
                  <select
                    value={formData.ageCategory}
                    onChange={(e) => setFormData({ ...formData, ageCategory: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  >
                    <option value="Dewasa">Dewasa (&gt; 12 thn)</option>
                    <option value="Anak">Anak (2-12 thn)</option>
                    <option value="Bayi">Bayi (&lt; 2 thn)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kelas Kabin / Tiket
                  </label>
                  <select
                    value={formData.cabinClass}
                    onChange={(e) => setFormData({ ...formData, cabinClass: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  >
                    <option value="Ekonomi">Kelas Ekonomi</option>
                    <option value="Kelas 1">Kelas 1</option>
                    <option value="VIP">Kelas VIP</option>
                  </select>
                </div>
              </div>

              {/* Ports */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pelabuhan Asal <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.departurePort}
                    onChange={(e) => setFormData({ ...formData, departurePort: e.target.value })}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border ${
                      formErrors.departurePort ? 'border-rose-300' : 'border-slate-200'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500`}
                  />
                  {formErrors.departurePort && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.departurePort}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pelabuhan Tujuan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.destinationPort}
                    onChange={(e) => setFormData({ ...formData, destinationPort: e.target.value })}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border ${
                      formErrors.destinationPort ? 'border-rose-300' : 'border-slate-200'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500`}
                  />
                  {formErrors.destinationPort && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.destinationPort}</p>
                  )}
                </div>
              </div>

              {/* Date, Seat & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tgl Keberangkatan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.departureDate}
                    onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Kursi / Dek <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.seatNumber}
                    onChange={(e) => setFormData({ ...formData, seatNumber: e.target.value })}
                    placeholder="contoh: DEK-A12"
                    className={`w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border uppercase ${
                      formErrors.seatNumber ? 'border-rose-300' : 'border-slate-200'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Perjalanan
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-semibold"
                  >
                    <option value="Check-in">Check-in</option>
                    <option value="Boarding">Boarding</option>
                    <option value="Tiba">Tiba</option>
                    <option value="Batal">Batal</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Khusus (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Kebutuhan khusus, bagasi berlebih, dsb."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingPassenger(null);
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
                  {isSubmitting ? 'Menyimpan...' : editingPassenger ? 'Perbarui Tiket' : 'Terbitkan Tiket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOARDING PASS / TICKET PREVIEW MODAL */}
      {viewTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            {/* Ticket Header */}
            <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-blue-900 p-6 text-white relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShipIcon className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">JAPARA LINES BOARDING PASS</span>
                </div>
                <button
                  onClick={() => setViewTicket(null)}
                  className="text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-xl font-black mt-3">{viewTicket.shipName}</h3>
              <p className="text-xs text-slate-300">Resmi Terverifikasi • Tiket ID: {viewTicket.ticketNumber}</p>
            </div>

            {/* Ticket Body */}
            <div className="p-6 space-y-4 bg-slate-50/50">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Nama Penumpang</span>
                  <div className="font-bold text-slate-900 text-sm">{viewTicket.fullName}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">NIK: {viewTicket.idNumber}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Kelas / Kursi</span>
                  <div className="font-bold text-sky-700 text-sm">{viewTicket.cabinClass}</div>
                  <div className="text-xs font-mono font-bold text-slate-800 mt-0.5">Kursi: {viewTicket.seatNumber}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Pelabuhan Berangkat</span>
                  <div className="font-semibold text-slate-800 text-xs">{viewTicket.departurePort}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{viewTicket.departureDate}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Pelabuhan Tujuan</span>
                  <div className="font-semibold text-slate-800 text-xs">{viewTicket.destinationPort}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Status Tiket</span>
                  <div className="font-bold text-emerald-600 text-xs">{viewTicket.status}</div>
                </div>
                <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-200">
                  <QrCode className="w-8 h-8 text-slate-800" />
                  <div className="text-[9px] text-slate-500 font-mono">
                    VERIFIED<br />BY FIRESTORE
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  window.print();
                }}
                className="w-full mt-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-sky-600/20"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Boarding Pass</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {passengerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              Konfirmasi Hapus Manifes Penumpang
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Apakah Anda yakin ingin membatalkan/menghapus tiket <strong className="text-slate-900">{passengerToDelete.ticketNumber}</strong> atas nama <strong className="text-slate-900">{passengerToDelete.fullName}</strong>? Data akan dihapus secara permanen dari Firebase Firestore.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setPassengerToDelete(null)}
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

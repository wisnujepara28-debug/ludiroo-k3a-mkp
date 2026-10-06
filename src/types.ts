export interface Ship {
  id: string;
  name: string;
  code: string;
  type: string; // e.g. "Ferry Ro-Ro", "Kapal Penumpang", "Kapal Kargo/Container"
  passengerCapacity: number;
  cargoCapacityTons: number;
  route: string; // e.g. "Tanjung Perak (Surabaya) - Balikpapan"
  status: 'Bersandar' | 'Berlayar' | 'Maintenance';
  createdAt: string;
  updatedAt: string;
}

export interface Passenger {
  id: string;
  shipId: string;
  shipName: string;
  ticketNumber: string;
  fullName: string;
  idNumber: string; // NIK or Passport
  gender: 'Laki-laki' | 'Perempuan';
  ageCategory: 'Dewasa' | 'Anak' | 'Bayi';
  cabinClass: 'VIP' | 'Kelas 1' | 'Ekonomi';
  departurePort: string;
  destinationPort: string;
  departureDate: string;
  seatNumber: string;
  status: 'Check-in' | 'Boarding' | 'Tiba' | 'Batal';
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cargo {
  id: string;
  shipId: string;
  shipName: string;
  manifestNumber: string;
  senderName: string;
  receiverName: string;
  cargoType: string; // e.g. "Kontainer 20ft", "Kendaraan Roda 4", "Bahan Pokok", "Material Bangunan", "Logistik Khusus"
  weightKg: number;
  volumeM3?: number;
  unitCount?: number;
  dangerousGoods?: boolean;
  departurePort: string;
  destinationPort: string;
  status: 'Terkonfirmasi' | 'Dimuat (Loading)' | 'Dalam Pelayaran' | 'Terkirim' | 'Dibatalkan';
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'SYSTEM';
  entityType: 'Kapal' | 'Penumpang' | 'Muatan' | 'Sistem';
  details: string;
  operatorEmail: string;
  timestamp: string;
}

export interface UserSession {
  uid: string;
  email: string;
  displayName: string;
  role: 'Super Admin' | 'Petugas Pelabuhan' | 'Operator Manifes';
  isGoogleUser?: boolean;
}

import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { logActivity } from './activityService';

export async function checkAndSeedInitialData(operatorEmail: string): Promise<boolean> {
  try {
    const shipsSnap = await getDocs(collection(db, 'ships'));
    if (!shipsSnap.empty) {
      return false; // Data already exists
    }

    await seedDemoData(operatorEmail);
    return true;
  } catch (err) {
    console.error('Error during automatic seed check:', err);
    return false;
  }
}

export async function seedDemoData(operatorEmail: string): Promise<void> {
  const now = new Date().toISOString();

  // 1. Initial JAPARA Ships
  const initialShips = [
    {
      name: 'KMP Siginjai',
      code: 'JAPARA-SGJ-01',
      type: 'Ferry Ro-Ro Cepat',
      passengerCapacity: 450,
      cargoCapacityTons: 350,
      route: 'Pelabuhan Kartini (Jepara) - Pelabuhan Legon Bajak (Karimunjawa)',
      status: 'Berlayar' as const,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'KM Express Bahari 2C',
      code: 'JAPARA-EXB-02',
      type: 'Kapal Cepat Jetliner',
      passengerCapacity: 380,
      cargoCapacityTons: 80,
      route: 'Pantai Kartini (Jepara) - Karimunjawa Express',
      status: 'Bersandar' as const,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'KM Japara Samudera 01',
      code: 'JAPARA-SMD-03',
      type: 'Kapal Penumpang & Kargo Logistik',
      passengerCapacity: 1200,
      cargoCapacityTons: 1500,
      route: 'Jepara - Tanjung Perak (Surabaya) - Banjarmasin',
      status: 'Bersandar' as const,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'KM Kartini Jaya Cargo',
      code: 'JAPARA-KRG-04',
      type: 'Kapal Kontainer Logistik',
      passengerCapacity: 20,
      cargoCapacityTons: 2800,
      route: 'Tanjung Emas (Semarang) - Pelabuhan Jepara - Kumai (Kalimantan)',
      status: 'Maintenance' as const,
      createdAt: now,
      updatedAt: now,
    }
  ];

  const shipRefs: { id: string; name: string }[] = [];
  for (const ship of initialShips) {
    const docRef = await addDoc(collection(db, 'ships'), ship);
    shipRefs.push({ id: docRef.id, name: ship.name });
  }

  // 2. Initial JAPARA Passengers
  if (shipRefs.length > 0) {
    const siginjai = shipRefs[0];
    const expressBahari = shipRefs[1];

    const initialPassengers = [
      {
        shipId: siginjai.id,
        shipName: siginjai.name,
        ticketNumber: 'JPR-TKT-2026-001',
        fullName: 'Wisnu Hadi Nugroho',
        idNumber: '3320011504920002',
        gender: 'Laki-laki' as const,
        ageCategory: 'Dewasa' as const,
        cabinClass: 'VIP' as const,
        departurePort: 'Jepara (Pelabuhan Kartini)',
        destinationPort: 'Karimunjawa',
        departureDate: '2026-10-06',
        seatNumber: 'VIP-01',
        status: 'Boarding' as const,
        notes: 'Kepala Delegasi Pariwisata & Bisnis Maritim Jepara',
        createdBy: operatorEmail,
        createdAt: now,
        updatedAt: now,
      },
      {
        shipId: siginjai.id,
        shipName: siginjai.name,
        ticketNumber: 'JPR-TKT-2026-002',
        fullName: 'Aisyah Putri Karimah',
        idNumber: '3320015508960001',
        gender: 'Perempuan' as const,
        ageCategory: 'Dewasa' as const,
        cabinClass: 'Kelas 1' as const,
        departurePort: 'Jepara (Pelabuhan Kartini)',
        destinationPort: 'Karimunjawa',
        departureDate: '2026-10-06',
        seatNumber: '1A-04',
        status: 'Check-in' as const,
        notes: 'Membawa perlengkapan fotografi wisata bahari',
        createdBy: operatorEmail,
        createdAt: now,
        updatedAt: now,
      },
      {
        shipId: expressBahari.id,
        shipName: expressBahari.name,
        ticketNumber: 'JPR-TKT-2026-088',
        fullName: 'Budi Santoso Jepara',
        idNumber: '3320021003880004',
        gender: 'Laki-laki' as const,
        ageCategory: 'Dewasa' as const,
        cabinClass: 'VIP' as const,
        departurePort: 'Jepara',
        destinationPort: 'Karimunjawa',
        departureDate: '2026-10-07',
        seatNumber: 'EXEC-08',
        status: 'Check-in' as const,
        notes: 'Pengrajin Mebel Ukir Jepara Eksekutif',
        createdBy: operatorEmail,
        createdAt: now,
        updatedAt: now,
      },
      {
        shipId: expressBahari.id,
        shipName: expressBahari.name,
        ticketNumber: 'JPR-TKT-2026-089',
        fullName: 'Clara Wijaya',
        idNumber: '3171055209990003',
        gender: 'Perempuan' as const,
        ageCategory: 'Dewasa' as const,
        cabinClass: 'Ekonomi' as const,
        departurePort: 'Jepara',
        destinationPort: 'Karimunjawa',
        departureDate: '2026-10-07',
        seatNumber: 'EKO-22',
        status: 'Tiba' as const,
        notes: 'Wisatawan domestik',
        createdBy: operatorEmail,
        createdAt: now,
        updatedAt: now,
      }
    ];

    for (const p of initialPassengers) {
      await addDoc(collection(db, 'passengers'), p);
    }

    // 3. Initial JAPARA Cargo Manifests
    const initialCargos = [
      {
        shipId: siginjai.id,
        shipName: siginjai.name,
        manifestNumber: 'JPR-CRG-2026-01',
        senderName: 'Sentra Seni Ukir Mebel Jepara Utama',
        receiverName: 'Karimun Island Resort & Villas',
        cargoType: 'Mebel Ukir Jati Asli Jepara',
        weightKg: 8500,
        volumeM3: 32,
        unitCount: 45,
        dangerousGoods: false,
        departurePort: 'Pelabuhan Kartini (Jepara)',
        destinationPort: 'Karimunjawa',
        status: 'Dimuat (Loading)' as const,
        notes: 'Set meja kursi jati grade A ekspor dilapisi bubble wrap tebal',
        createdBy: operatorEmail,
        createdAt: now,
        updatedAt: now,
      },
      {
        shipId: siginjai.id,
        shipName: siginjai.name,
        manifestNumber: 'JPR-CRG-2026-02',
        senderName: 'Distributor Sembako Pasar Jepara',
        receiverName: 'Koperasi Warga Karimunjawa Sejahtera',
        cargoType: 'Bahan Pokok & Sayur Segar',
        weightKg: 14000,
        volumeM3: 40,
        unitCount: 180,
        dangerousGoods: false,
        departurePort: 'Pelabuhan Kartini (Jepara)',
        destinationPort: 'Karimunjawa',
        status: 'Dalam Pelayaran' as const,
        notes: 'Beras, minyak goreng, telur, dan buah segar untuk kepulauan',
        createdBy: operatorEmail,
        createdAt: now,
        updatedAt: now,
      },
      {
        shipId: shipRefs[2]?.id || siginjai.id,
        shipName: shipRefs[2]?.name || siginjai.name,
        manifestNumber: 'JPR-CRG-2026-99',
        senderName: 'PT Japara Woodcraft International',
        receiverName: 'Borneo Luxury Furniture Mart',
        cargoType: 'Kontainer 20ft Industri Furniture',
        weightKg: 22000,
        volumeM3: 33,
        unitCount: 1,
        dangerousGoods: false,
        departurePort: 'Jepara',
        destinationPort: 'Banjarmasin',
        status: 'Terkonfirmasi' as const,
        notes: 'Segel Kontainer JPR-88129-EXP',
        createdBy: operatorEmail,
        createdAt: now,
        updatedAt: now,
      }
    ];

    for (const c of initialCargos) {
      await addDoc(collection(db, 'cargos'), c);
    }
  }

  await logActivity(
    'SYSTEM',
    'Sistem',
    'Inisialisasi database resmi JAPARA LINES berhasil (Armada, Penumpang & Kargo).',
    operatorEmail
  );
}

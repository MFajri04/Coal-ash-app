import { User, Method, Balance, Furnace, Crucible, Sample, AnalysisRecord, AuditLogItem } from './types';

export const initialUsers: User[] = [
  {
    id: 1,
    nama: 'Budi Pratama, S.Si',
    username: 'analis_budi',
    password: 'password123',
    peran: 'Analis',
    statusAktif: true,
    jabatan: 'Analis Kimia Penimbang Ash',
    email: 'budi.pratama@mineralanalitika.co.id',
    telepon: '0812-3456-7890',
    tanggalDibuat: '2026-01-15'
  },
  {
    id: 2,
    nama: 'Aisyah Putri, A.Md.AK',
    username: 'analis_aisyah',
    password: 'password123',
    peran: 'Analis',
    statusAktif: true,
    jabatan: 'Laboran Pengujian Fisik & Kimia',
    email: 'aisyah.putri@mineralanalitika.co.id',
    telepon: '0813-9876-5432',
    tanggalDibuat: '2026-02-10'
  },
  {
    id: 3,
    nama: 'Dr. Hendra Wijaya, M.Sc',
    username: 'spv_hendra',
    password: 'password123',
    peran: 'Supervisor',
    statusAktif: true,
    jabatan: 'Penyelia / Manajer Teknis Lab',
    email: 'hendra.wijaya@mineralanalitika.co.id',
    telepon: '0811-2233-4455',
    tanggalDibuat: '2025-11-01'
  },
  {
    id: 4,
    nama: 'Siti Rahmawati, S.T',
    username: 'admin_siti',
    password: 'password123',
    peran: 'Admin',
    statusAktif: true,
    jabatan: 'Administrator Sistem LIMS',
    email: 'admin.siti@mineralanalitika.co.id',
    telepon: '0818-5566-7788',
    tanggalDibuat: '2025-08-20'
  },
  {
    id: 5,
    nama: 'PT Pembangkit Nusantara (Klien)',
    username: 'klien_pln',
    password: 'password123',
    peran: 'Pelanggan',
    statusAktif: true,
    jabatan: 'Pihak Pembeli / Surveyor Eksternal',
    email: 'procurement@pembangkit.co.id',
    telepon: '021-555-8899',
    tanggalDibuat: '2026-03-01'
  }
];

export const initialMethods: Method[] = [
  {
    id: 1,
    nama: 'ASTM D3174-12 (Ash in Coal)',
    targetBeratSampel: 1.0000,
    toleransi: 0.1000, // 0.9000 s/d 1.1000 g
    batasBeratKonstan: 0.0005, // 0.5 mg
    batasRepeatability: 0.30, // 0.30%
    suhu: 750,
    durasiMenit: 120
  },
  {
    id: 2,
    nama: 'ISO 1171:2010 (Solid Mineral Fuels - Ash)',
    targetBeratSampel: 1.0000,
    toleransi: 0.1000,
    batasBeratKonstan: 0.0002, // 0.2 mg
    batasRepeatability: 0.20, // 0.20%
    suhu: 815,
    durasiMenit: 90
  },
  {
    id: 3,
    nama: 'SNI 06-3730-1995 (Kadar Abu Standar)',
    targetBeratSampel: 1.0000,
    toleransi: 0.0500,
    batasBeratKonstan: 0.0005,
    batasRepeatability: 0.25,
    suhu: 800,
    durasiMenit: 120
  }
];

export const initialBalances: Balance[] = [
  {
    id: 1,
    kode: 'BAL-01',
    nama: 'Mettler Toledo XPE205DR (4 Desimal)',
    resolusi: 0.0001,
    tanggalKalibrasi: '2026-08-15',
    jatuhTempo: '2027-08-15',
    status: 'Aktif'
  },
  {
    id: 2,
    kode: 'BAL-02',
    nama: 'Sartorius Quintix 124-1S',
    resolusi: 0.0001,
    tanggalKalibrasi: '2026-06-10',
    jatuhTempo: '2027-06-10',
    status: 'Aktif'
  },
  {
    id: 3,
    kode: 'BAL-03 (EXP)',
    nama: 'Shimadzu AP225W (Kedaluwarsa)',
    resolusi: 0.0001,
    tanggalKalibrasi: '2025-09-01',
    jatuhTempo: '2026-09-01',
    status: 'Kedaluwarsa'
  }
];

export const initialFurnaces: Furnace[] = [
  {
    id: 1,
    kode: 'FRN-01',
    nama: 'Carbolite AAF 11/7 Ashing Furnace (Max 1100°C)',
    kapasitas: 24,
    tanggalKalibrasi: '2026-07-20',
    jatuhTempo: '2027-07-20',
    status: 'Aktif'
  },
  {
    id: 2,
    kode: 'FRN-02',
    nama: 'Nabertherm L9/11 Muffle Chamber',
    kapasitas: 16,
    tanggalKalibrasi: '2026-05-12',
    jatuhTempo: '2027-05-12',
    status: 'Aktif'
  }
];

export const initialCrucibles: Crucible[] = [
  { id: 1, nomor: 'C-01', status: 'Tersedia', w1Terakhir: 16.2415 },
  { id: 2, nomor: 'C-02', status: 'Tersedia', w1Terakhir: 15.8920 },
  { id: 3, nomor: 'C-03', status: 'Dipakai', w1Terakhir: 17.1124 },
  { id: 4, nomor: 'C-04', status: 'Tersedia', w1Terakhir: 16.7450 },
  { id: 5, nomor: 'C-05', status: 'Tersedia', w1Terakhir: 15.3402 },
  { id: 6, nomor: 'C-06', status: 'Tersedia', w1Terakhir: 16.9015 },
  { id: 7, nomor: 'C-07', status: 'Tersedia', w1Terakhir: 14.8821 },
  { id: 8, nomor: 'C-08', status: 'Tersedia', w1Terakhir: 17.4320 },
  { id: 9, nomor: 'C-09', status: 'Rusak', w1Terakhir: 15.9910 },
  { id: 10, nomor: 'C-10', status: 'Tersedia', w1Terakhir: 16.1205 }
];

export const initialSamples: Sample[] = [
  {
    id: 1,
    kodeUnik: 'BB-261009-001',
    sumber: 'Pit Central Stockpile A',
    jenis: 'Sub-bituminous',
    tanggalTerima: '2026-10-09',
    status: 'Disetujui',
    basisPelaporan: 'adb',
    catatan: 'Pengambilan sampel periodik shift 1',
    moistureAdb: 8.42,
    moistureAr: 24.15
  },
  {
    id: 2,
    kodeUnik: 'BB-261010-002',
    sumber: 'Tongkang BG Maritim 08 (Barge Loading)',
    jenis: 'Bituminous',
    tanggalTerima: '2026-10-10',
    status: 'Menunggu review',
    basisPelaporan: 'adb',
    catatan: 'Analisis kargo ekspor',
    moistureAdb: 5.12,
    moistureAr: 12.80
  },
  {
    id: 3,
    kodeUnik: 'BB-261011-003',
    sumber: 'Kapal MV Nusantara Carrier',
    jenis: 'Sub-bituminous',
    tanggalTerima: '2026-10-11',
    status: 'Dalam analisis',
    basisPelaporan: 'adb',
    catatan: 'Prioritas tinggi, kapal sandar',
    moistureAdb: 9.10,
    moistureAr: 26.50
  },
  {
    id: 4,
    kodeUnik: 'BB-261011-004',
    sumber: 'In-pit Conveyor Hopper 2',
    jenis: 'Lignite',
    tanggalTerima: '2026-10-11',
    status: 'Terdaftar',
    basisPelaporan: 'adb',
    catatan: 'Sampel harian operasional',
    moistureAdb: 12.50,
    moistureAr: 35.20
  }
];

export const initialAnalyses: AnalysisRecord[] = [
  {
    id: 1,
    sampleId: 1,
    methodId: 1,
    analisNama: 'Budi Pratama, S.Si',
    tanggalMulai: '2026-10-09 08:30',
    tanggalSelesai: '2026-10-09 13:45',
    ulangan1: {
      w1: 15.2345,
      w2: 16.2345,
      beratSampel: 1.0000,
      w3_1: 15.3347,
      w3_2: 15.3345,
      selisihKonstan: 0.0002,
      isKonstan: true,
      beratAbu: 0.1000,
      kadarAbuPercent: 10.00,
      cawanNomor: 'C-01',
      neracaKode: 'BAL-01',
      furnaceKode: 'FRN-01',
      waktuW1: '2026-10-09 08:35',
      waktuW2: '2026-10-09 08:42',
      waktuW3: '2026-10-09 13:10',
      inputMode: 'Neraca Digital'
    },
    ulangan2: {
      w1: 15.8920,
      w2: 16.8918,
      beratSampel: 0.9998,
      w3_1: 15.9922,
      w3_2: 15.9920,
      selisihKonstan: 0.0002,
      isKonstan: true,
      beratAbu: 0.1000,
      kadarAbuPercent: 10.00,
      cawanNomor: 'C-02',
      neracaKode: 'BAL-01',
      furnaceKode: 'FRN-01',
      waktuW1: '2026-10-09 08:37',
      waktuW2: '2026-10-09 08:45',
      waktuW3: '2026-10-09 13:15',
      inputMode: 'Neraca Digital'
    },
    selisihDuplikat: 0.00,
    isRepeatabilityPass: true,
    rataRataKadarAbu: 10.00,
    kadarAbuDb: 10.92,
    kadarAbuAr: 8.28,
    status: 'Disetujui',
    catatanAnalis: 'Pembakaran sempurna abu putih kelabu, konstan tercapai pada pemanasan ke-2.',
    supervisorCatatan: 'Analisis memenuhi syarat ASTM D3174 dan repeatability duplikat sangat baik.',
    disetujuiOleh: 'Dr. Hendra Wijaya, M.Sc',
    tanggalDisetujui: '2026-10-09 15:30',
    signatureHash: 'e7f8d91a2b3c4d5e6f7a8b9c0d1e2f3a',
    furnaceJamMasuk: '2026-10-09 09:00',
    furnaceJamKeluar: '2026-10-09 11:30',
    furnaceSuhuAktual: 752
  },
  {
    id: 2,
    sampleId: 2,
    methodId: 1,
    analisNama: 'Aisyah Putri, A.Md.AK',
    tanggalMulai: '2026-10-10 09:15',
    tanggalSelesai: '2026-10-10 14:00',
    ulangan1: {
      w1: 17.1124,
      w2: 18.1140,
      beratSampel: 1.0016,
      w3_1: 17.1742,
      w3_2: 17.1740,
      selisihKonstan: 0.0002,
      isKonstan: true,
      beratAbu: 0.0616,
      kadarAbuPercent: 6.15,
      cawanNomor: 'C-03',
      neracaKode: 'BAL-02',
      furnaceKode: 'FRN-01',
      waktuW1: '2026-10-10 09:20',
      waktuW2: '2026-10-10 09:25',
      waktuW3: '2026-10-10 13:30',
      inputMode: 'Manual'
    },
    ulangan2: {
      w1: 16.7450,
      w2: 17.7472,
      beratSampel: 1.0022,
      w3_1: 16.8080,
      w3_2: 16.8078,
      selisihKonstan: 0.0002,
      isKonstan: true,
      beratAbu: 0.0628,
      kadarAbuPercent: 6.27,
      cawanNomor: 'C-04',
      neracaKode: 'BAL-02',
      furnaceKode: 'FRN-01',
      waktuW1: '2026-10-10 09:22',
      waktuW2: '2026-10-10 09:28',
      waktuW3: '2026-10-10 13:35',
      inputMode: 'Manual'
    },
    selisihDuplikat: 0.12,
    isRepeatabilityPass: true,
    rataRataKadarAbu: 6.21,
    kadarAbuDb: 6.55,
    kadarAbuAr: 5.71,
    status: 'Menunggu review',
    catatanAnalis: 'Data duplikat telah memenuhi batas repeatability (selisih 0.12% vs limit 0.30%). Menunggu persetujuan penyelia.',
    furnaceJamMasuk: '2026-10-10 09:45',
    furnaceJamKeluar: '2026-10-10 12:15',
    furnaceSuhuAktual: 750
  }
];

export const initialAuditLogs: AuditLogItem[] = [
  {
    id: 1,
    entitas: 'User',
    aksi: 'CREATE',
    nilaiBaru: 'Sistem LIMS diinisialisasi dengan 5 pengguna terotorisasi',
    pengguna: 'Siti Rahmawati, S.T',
    peran: 'Admin',
    waktu: '2026-10-09 08:00',
    alasan: 'Konfigurasi awal sistem'
  },
  {
    id: 2,
    entitas: 'Sample',
    aksi: 'CREATE',
    nilaiBaru: 'Sampel BB-261009-001 terdaftar (Pit Central Stockpile A)',
    pengguna: 'Budi Pratama, S.Si',
    peran: 'Analis',
    waktu: '2026-10-09 08:15',
    alasan: 'Registrasi sampel awal dari shift 1'
  },
  {
    id: 3,
    entitas: 'Result',
    aksi: 'APPROVE',
    nilaiBaru: 'Disetujui kadar abu 10.00% (adb), 10.92% (db)',
    pengguna: 'Dr. Hendra Wijaya, M.Sc',
    peran: 'Supervisor',
    waktu: '2026-10-09 15:30',
    alasan: 'Hasil memenuhi standar akurasi ISO 17025 dan ASTM D3174'
  }
];

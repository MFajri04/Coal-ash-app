// Tipe data terstandar sesuai Dokumen Kebutuhan Sistem (SRS v1.0)

export type UserRole = 'Analis' | 'Supervisor' | 'Admin' | 'Pelanggan';

export interface User {
  id: number;
  nama: string;
  username: string;
  password: string;
  peran: UserRole;
  statusAktif: boolean;
  avatar?: string;
  jabatan?: string;
  email?: string;
  telepon?: string;
  tanggalDibuat?: string;
}

export interface Method {
  id: number;
  nama: string; // ASTM D3174, ISO 1171, SNI 06-3730
  targetBeratSampel: number; // e.g. 1.0000 g
  toleransi: number; // e.g. 0.1000 g (rentang 0.9000 - 1.1000 g)
  batasBeratKonstan: number; // e.g. 0.0005 g atau 0.0002 g
  batasRepeatability: number; // e.g. 0.30% atau 0.20%
  suhu: number; // e.g. 750 C atau 815 C
  durasiMenit: number; // durasi pembakaran standar
}

export interface Balance {
  id: number;
  kode: string; // BAL-01, BAL-02
  nama: string;
  resolusi: number; // 0.0001
  tanggalKalibrasi: string;
  jatuhTempo: string;
  status: 'Aktif' | 'Kedaluwarsa' | 'Maintenance';
}

export interface Furnace {
  id: number;
  kode: string; // FRN-01, FRN-02
  nama: string;
  kapasitas: number; // kapasitas cawan (misal 20)
  tanggalKalibrasi: string;
  jatuhTempo: string;
  status: 'Aktif' | 'Perbaikan';
}

export interface Crucible {
  id: number;
  nomor: string; // C-01, C-02, ...
  status: 'Tersedia' | 'Dipakai' | 'Rusak';
  w1Terakhir?: number; // Catatan riwayat bobot kosong
}

export type SampleStatus = 
  | 'Terdaftar' 
  | 'Dalam analisis' 
  | 'Menunggu review' 
  | 'Disetujui' 
  | 'Ditolak/Ulang';

export interface Sample {
  id: number;
  kodeUnik: string; // BB-YYMMDD-NNN
  sumber: string; // Stockpile A, Kapal MV Harapan, Tongkang TB-9, dll
  jenis: string; // Lignite, Sub-bituminous, Bituminous, Anthracite
  tanggalTerima: string;
  status: SampleStatus;
  basisPelaporan: 'adb' | 'ar' | 'db';
  catatan?: string;
  moistureAdb?: number; // % Moisture in air-dried basis (untuk konversi)
  moistureAr?: number;  // % Total Moisture as received
}

export interface WeighingRun {
  w1: number; // Cawan Kosong (g)
  w2: number; // Cawan + Sampel (g)
  beratSampel: number; // W2 - W1 (g)
  w3_1?: number; // Cawan + Abu Timbang 1 (g)
  w3_2?: number; // Cawan + Abu Timbang 2 (g) - Uji Berat Konstan
  selisihKonstan?: number; // |w3_1 - w3_2| (g)
  isKonstan?: boolean; // selisih <= batas metode
  beratAbu?: number; // (W3 akhir - W1) (g)
  kadarAbuPercent?: number; // (Berat Abu / Berat Sampel) * 100
  cawanNomor: string;
  neracaKode: string;
  furnaceKode?: string;
  waktuW1?: string;
  waktuW2?: string;
  waktuW3?: string;
  inputMode: 'Manual' | 'Neraca Digital';
}

export interface AnalysisRecord {
  id: number;
  sampleId: number;
  methodId: number;
  analisNama: string;
  tanggalMulai: string;
  tanggalSelesai?: string;
  ulangan1: WeighingRun;
  ulangan2?: WeighingRun;
  // Kontrol Mutu Repeatability
  selisihDuplikat?: number; // |U1 - U2| dalam %
  isRepeatabilityPass?: boolean;
  rataRataKadarAbu?: number; // Hasil Akhir (%)
  // Konversi Basis
  kadarAbuDb?: number; // Dry Basis (%)
  kadarAbuAr?: number; // As Received (%)
  status: SampleStatus;
  catatanAnalis?: string;
  supervisorCatatan?: string;
  disetujuiOleh?: string;
  tanggalDisetujui?: string;
  signatureHash?: string;
  furnaceJamMasuk?: string;
  furnaceJamKeluar?: string;
  furnaceSuhuAktual?: number;
}

export interface AuditLogItem {
  id: number;
  entitas: string;
  aksi: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT';
  nilaiLama?: string;
  nilaiBaru?: string;
  pengguna: string;
  peran: string;
  waktu: string;
  alasan?: string;
}

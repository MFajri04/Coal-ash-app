import { 
  User, Method, Balance, Furnace, Crucible, Sample, 
  AnalysisRecord, AuditLogItem, WeighingRun 
} from './types';
import { 
  initialUsers, initialMethods, initialBalances, 
  initialFurnaces, initialCrucibles, initialSamples, 
  initialAnalyses, initialAuditLogs 
} from './mockData';

const STORAGE_KEYS = {
  USERS: 'lims_users',
  CURRENT_USER: 'lims_current_user',
  METHODS: 'lims_methods',
  BALANCES: 'lims_balances',
  FURNACES: 'lims_furnaces',
  CRUCIBLES: 'lims_crucibles',
  SAMPLES: 'lims_samples',
  ANALYSES: 'lims_analyses',
  AUDIT: 'lims_audit_logs'
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Gagal menyimpan ke storage', err);
  }
}

export class LabStore {
  users: User[] = loadStorage(STORAGE_KEYS.USERS, initialUsers);
  currentUser: User | null = loadStorage(STORAGE_KEYS.CURRENT_USER, initialUsers[2]); // Default ke Supervisor
  methods: Method[] = loadStorage(STORAGE_KEYS.METHODS, initialMethods);
  balances: Balance[] = loadStorage(STORAGE_KEYS.BALANCES, initialBalances);
  furnaces: Furnace[] = loadStorage(STORAGE_KEYS.FURNACES, initialFurnaces);
  crucibles: Crucible[] = loadStorage(STORAGE_KEYS.CRUCIBLES, initialCrucibles);
  samples: Sample[] = loadStorage(STORAGE_KEYS.SAMPLES, initialSamples);
  analyses: AnalysisRecord[] = loadStorage(STORAGE_KEYS.ANALYSES, initialAnalyses);
  auditLogs: AuditLogItem[] = loadStorage(STORAGE_KEYS.AUDIT, initialAuditLogs);

  listeners: Array<() => void> = [];

  get activeUser(): User {
    return this.currentUser || this.users[0];
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(l => l());
  }

  // --- Authentication Methods ---
  login(username: string, password: string): { success: boolean; message: string } {
    const user = this.users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!user) {
      return { success: false, message: 'Username tidak ditemukan dalam sistem!' };
    }
    if (!user.statusAktif) {
      return { success: false, message: 'Akun Anda dinonaktifkan oleh Administrator.' };
    }
    if (user.password !== password) {
      return { success: false, message: 'Kata sandi salah. Silakan periksa kembali!' };
    }

    this.currentUser = user;
    saveStorage(STORAGE_KEYS.CURRENT_USER, user);
    this.addAudit('User', 'UPDATE', undefined, `Pengguna ${user.nama} (${user.peran}) berhasil login ke sistem`, 'Autentikasi sesi berhasil');
    this.notify();
    return { success: true, message: `Selamat datang, ${user.nama}!` };
  }

  logout() {
    if (this.currentUser) {
      this.addAudit('User', 'UPDATE', undefined, `Pengguna ${this.currentUser.nama} logout dari sistem`, 'Pengakhiran sesi pengguna');
    }
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    this.notify();
  }

  switchUserQuick(userId: number) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      this.currentUser = user;
      saveStorage(STORAGE_KEYS.CURRENT_USER, user);
      this.addAudit('User', 'UPDATE', undefined, `Beralih sesi ke ${user.nama} (${user.peran})`, 'Pergantian peran pengguna');
      this.notify();
    }
  }

  // --- User Profile & Admin Management ---
  updateProfile(userId: number, data: { nama: string; email?: string; telepon?: string; jabatan?: string; password?: string }) {
    const idx = this.users.findIndex(u => u.id === userId);
    if (idx >= 0) {
      this.users[idx] = {
        ...this.users[idx],
        nama: data.nama,
        email: data.email,
        telepon: data.telepon,
        jabatan: data.jabatan,
        ...(data.password ? { password: data.password } : {})
      };
      saveStorage(STORAGE_KEYS.USERS, this.users);

      if (this.currentUser?.id === userId) {
        this.currentUser = this.users[idx];
        saveStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
      }

      this.addAudit('User', 'UPDATE', undefined, `Pembaruan profil untuk ${this.users[idx].nama}`, 'Edit profil pengguna');
      this.notify();
    }
  }

  createUser(userData: Omit<User, 'id'>): User {
    const newUser: User = {
      id: Date.now(),
      tanggalDibuat: new Date().toISOString().substring(0, 10),
      ...userData
    };
    this.users.unshift(newUser);
    saveStorage(STORAGE_KEYS.USERS, this.users);
    this.addAudit('User', 'CREATE', undefined, `Menambah pengguna baru: ${newUser.nama} (${newUser.peran})`, 'Registrasi akun oleh Admin');
    this.notify();
    return newUser;
  }

  toggleUserStatus(userId: number) {
    const idx = this.users.findIndex(u => u.id === userId);
    if (idx >= 0) {
      const user = this.users[idx];
      user.statusAktif = !user.statusAktif;
      saveStorage(STORAGE_KEYS.USERS, this.users);
      this.addAudit(
        'User', 
        'UPDATE', 
        undefined, 
        `Status akun ${user.nama} diubah menjadi ${user.statusAktif ? 'AKTIF' : 'NONAKTIF'}`, 
        'Moderasi akun oleh Admin'
      );
      this.notify();
    }
  }

  resetUserPassword(userId: number, newPass: string) {
    const idx = this.users.findIndex(u => u.id === userId);
    if (idx >= 0) {
      this.users[idx].password = newPass;
      saveStorage(STORAGE_KEYS.USERS, this.users);
      this.addAudit('User', 'UPDATE', undefined, `Reset kata sandi untuk pengguna ${this.users[idx].nama}`, 'Reset password oleh Admin');
      this.notify();
    }
  }

  // --- Hak Akses (Role-Based Access Control) ---
  canRegisterSample(): boolean {
    return this.currentUser?.peran === 'Analis' || this.currentUser?.peran === 'Admin';
  }

  canInputAnalysis(): boolean {
    return this.currentUser?.peran === 'Analis' || this.currentUser?.peran === 'Admin';
  }

  canApproveAnalysis(): boolean {
    return this.currentUser?.peran === 'Supervisor' || this.currentUser?.peran === 'Admin';
  }

  canManageMasterData(): boolean {
    return this.currentUser?.peran === 'Admin';
  }

  canManageUsers(): boolean {
    return this.currentUser?.peran === 'Admin';
  }

  canViewAuditTrail(): boolean {
    return this.currentUser?.peran === 'Supervisor' || this.currentUser?.peran === 'Admin';
  }

  canViewReports(): boolean {
    return true; // Semua role terotorisasi bisa melihat hasil sertifikat
  }

  addAudit(entitas: string, aksi: AuditLogItem['aksi'], nilaiLama?: string, nilaiBaru?: string, alasan?: string) {
    const now = new Date();
    const waktu = now.toISOString().replace('T', ' ').substring(0, 19);
    const item: AuditLogItem = {
      id: Date.now(),
      entitas,
      aksi,
      nilaiLama,
      nilaiBaru,
      pengguna: this.currentUser ? this.currentUser.nama : 'Sistem',
      peran: this.currentUser ? this.currentUser.peran : 'System',
      waktu,
      alasan
    };
    this.auditLogs.unshift(item);
    saveStorage(STORAGE_KEYS.AUDIT, this.auditLogs);
  }

  // --- Sample Management ---
  createSample(data: Omit<Sample, 'id' | 'kodeUnik' | 'status'>): Sample {
    const count = this.samples.length + 1;
    const now = new Date();
    const yy = String(now.getFullYear()).substring(2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const nnn = String(count).padStart(3, '0');
    const kodeUnik = `BB-${yy}${mm}${dd}-${nnn}`;

    const newSample: Sample = {
      id: Date.now(),
      kodeUnik,
      status: 'Terdaftar',
      ...data
    };

    this.samples.unshift(newSample);
    saveStorage(STORAGE_KEYS.SAMPLES, this.samples);
    this.addAudit('Sample', 'CREATE', undefined, `Pendaftaran sampel ${kodeUnik} (${data.sumber})`, 'Registrasi sampel baru');
    this.notify();
    return newSample;
  }

  // --- Calculation Helpers ---
  calcSampleWeight(w1: number, w2: number): number {
    if (w2 <= w1) return 0;
    return Number((w2 - w1).toFixed(4));
  }

  calcAshWeight(w1: number, w3: number): number {
    if (w3 < w1) return 0;
    return Number((w3 - w1).toFixed(4));
  }

  calcAshPercent(sampleWeight: number, ashWeight: number): number {
    if (sampleWeight <= 0) return 0;
    return Number(((ashWeight / sampleWeight) * 100).toFixed(2));
  }

  checkConstantWeight(w3_1: number, w3_2: number, limit: number): { diff: number; isPass: boolean } {
    const diff = Number(Math.abs(w3_1 - w3_2).toFixed(4));
    return {
      diff,
      isPass: diff <= limit
    };
  }

  checkRepeatability(ash1: number, ash2: number, limit: number): { diff: number; isPass: boolean; avg: number } {
    const diff = Number(Math.abs(ash1 - ash2).toFixed(2));
    const avg = Number(((ash1 + ash2) / 2).toFixed(2));
    return {
      diff,
      isPass: diff <= limit,
      avg
    };
  }

  convertBasis(ashAdb: number, moistureAdb: number = 0, targetBasis: 'db' | 'ar', moistureAr: number = 0): number {
    if (targetBasis === 'db') {
      if (moistureAdb >= 100) return ashAdb;
      return Number(((ashAdb * 100) / (100 - moistureAdb)).toFixed(2));
    }
    if (targetBasis === 'ar') {
      if (moistureAdb >= 100) return ashAdb;
      return Number(((ashAdb * (100 - moistureAr)) / (100 - moistureAdb)).toFixed(2));
    }
    return ashAdb;
  }

  // --- Save / Update Analysis ---
  saveAnalysis(analysis: AnalysisRecord) {
    const existingIdx = this.analyses.findIndex(a => a.id === analysis.id);
    if (existingIdx >= 0) {
      this.analyses[existingIdx] = analysis;
    } else {
      this.analyses.unshift(analysis);
    }
    saveStorage(STORAGE_KEYS.ANALYSES, this.analyses);

    // Update status sample
    const sampleIdx = this.samples.findIndex(s => s.id === analysis.sampleId);
    if (sampleIdx >= 0) {
      this.samples[sampleIdx].status = analysis.status;
      saveStorage(STORAGE_KEYS.SAMPLES, this.samples);
    }

    this.addAudit('Analysis', 'UPDATE', undefined, `Pembaruan analisis untuk sampel ID #${analysis.sampleId} - status: ${analysis.status}`, 'Proses pengujian kadar abu');
    this.notify();
  }

  approveAnalysis(analysisId: number, catatan: string): boolean {
    const analysis = this.analyses.find(a => a.id === analysisId);
    if (!analysis) return false;

    const hash = 'SIG-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now().toString(16).toUpperCase();
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    analysis.status = 'Disetujui';
    analysis.supervisorCatatan = catatan || 'Lolos kontrol mutu ISO 17025';
    analysis.disetujuiOleh = this.currentUser ? this.currentUser.nama : 'Dr. Hendra Wijaya, M.Sc (Supervisor)';
    analysis.tanggalDisetujui = nowStr;
    analysis.signatureHash = hash;

    const sample = this.samples.find(s => s.id === analysis.sampleId);
    if (sample) sample.status = 'Disetujui';

    saveStorage(STORAGE_KEYS.ANALYSES, this.analyses);
    saveStorage(STORAGE_KEYS.SAMPLES, this.samples);

    this.addAudit(
      'Result', 
      'APPROVE', 
      'Menunggu review', 
      `Disetujui oleh ${analysis.disetujuiOleh}. Kadar abu: ${analysis.rataRataKadarAbu}%`, 
      catatan || 'Lolos kontrol mutu ISO 17025'
    );
    this.notify();
    return true;
  }

  rejectAnalysis(analysisId: number, alasan: string): boolean {
    const analysis = this.analyses.find(a => a.id === analysisId);
    if (!analysis) return false;

    analysis.status = 'Ditolak/Ulang';
    analysis.supervisorCatatan = alasan;

    const sample = this.samples.find(s => s.id === analysis.sampleId);
    if (sample) sample.status = 'Ditolak/Ulang';

    saveStorage(STORAGE_KEYS.ANALYSES, this.analyses);
    saveStorage(STORAGE_KEYS.SAMPLES, this.samples);

    this.addAudit(
      'Result', 
      'REJECT', 
      'Menunggu review', 
      `Ditolak oleh ${this.currentUser ? this.currentUser.nama : 'Supervisor'}. Alasan: ${alasan}`, 
      alasan
    );
    this.notify();
    return true;
  }

  resetToDefaults() {
    localStorage.clear();
    this.users = initialUsers;
    this.currentUser = initialUsers[2]; // Default ke Supervisor (Dr. Hendra)
    this.methods = initialMethods;
    this.balances = initialBalances;
    this.furnaces = initialFurnaces;
    this.crucibles = initialCrucibles;
    this.samples = initialSamples;
    this.analyses = initialAnalyses;
    this.auditLogs = initialAuditLogs;
    saveStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    this.notify();
  }
}

export const labStore = new LabStore();

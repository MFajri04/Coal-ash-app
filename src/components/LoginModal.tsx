import React, { useState } from 'react';
import { labStore } from '../store';
import { User } from '../types';
import { notify } from './NotificationModal';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('analis_budi');
  const [password, setPassword] = useState('password123');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const result = labStore.login(username, password);
    if (result.success) {
      setErrorMsg('');
      notify.success('Login Berhasil', `Selamat datang kembali, ${labStore.currentUser?.nama}! (${labStore.currentUser?.peran})`);
      if (onClose) onClose();
    } else {
      setErrorMsg(result.message);
      notify.error('Autentikasi Gagal', result.message);
    }
  };

  const handleQuickSelect = (user: User) => {
    setUsername(user.username);
    setPassword(user.password);
    labStore.login(user.username, user.password);
    notify.success('Login Berhasil', `Beralih ke akun ${user.nama} (${user.peran})`);
    if (onClose) onClose();
  };

  const users = labStore.users;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: '850px',
        width: '100%',
        background: '#0b1120',
        border: '1px solid var(--border-glow)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.5rem',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)'
      }}>
        {/* Header Modal */}
        <div className="flex justify-between items-center" style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
          <div className="flex items-center gap-3">
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 800 }}>
                Autentikasi Pengguna Lab (LIMS)
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Sistem Hak Akses Berbasis Peran • Kepatuhan ISO/IEC 17025 (FR-001 s/d FR-003)
              </p>
            </div>
          </div>

          {labStore.currentUser && (
            <button onClick={onClose} className="btn btn-sm btn-secondary" title="Tutup Modal">
              ✕
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Kolom Kiri: Form Login Manual */}
          <div className="flex flex-col gap-4">
            <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>Masuk dengan Akun</h4>
            
            {errorMsg && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                padding: '0.75rem',
                color: '#f87171',
                fontSize: '0.85rem'
              }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Masukkan username..."
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kata Sandi</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Masukkan kata sandi..."
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '0.85rem' }}>
                🔑 Masuk ke Sistem Lab
              </button>
            </form>
          </div>

          {/* Kolom Kanan: Pilihan Akun Cepat & Wewenang Masing-masing */}
          <div className="flex flex-col gap-3">
            <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>Pilih Akun Demo & Hak Akses</h4>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: 0 }}>
              Klik salah satu akun di bawah untuk langsung mencoba wewenangnya:
            </p>

            <div className="flex flex-col gap-2" style={{ maxHeight: '340px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {users.map(u => {
                let badgeClass = 'badge-neutral';
                let roleColor = '#60a5fa';
                let deskripsi = '';

                if (u.peran === 'Analis') {
                  badgeClass = 'badge-info';
                  roleColor = '#38bdf8';
                  deskripsi = '• Registrasi sampel & input penimbangan W1-W3\n• Uji konstan & duplo (Tidak bisa approve)';
                } else if (u.peran === 'Supervisor') {
                  badgeClass = 'badge-warning';
                  roleColor = '#fbbf24';
                  deskripsi = '• Verifikasi raw data & uji kontrol mutu\n• Setujui (E-Signature) / Tolak dengan alasan';
                } else if (u.peran === 'Admin') {
                  badgeClass = 'badge-danger';
                  roleColor = '#f87171';
                  deskripsi = '• Kelola Master Data (Alat, Kalibrasi, SOP)\n• Audit Trail 100% & Manajemen Pengguna';
                } else {
                  badgeClass = 'badge-success';
                  roleColor = '#34d399';
                  deskripsi = '• Mode Hanya-Lihat (View Only)\n• Unduh & Cetak Sertifikat Hasil Uji (CoA)';
                }

                return (
                  <div
                    key={u.id}
                    onClick={() => handleQuickSelect(u)}
                    style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      padding: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = roleColor)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>{u.nama}</strong>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                          Username: <code className="font-mono">{u.username}</code>
                        </div>
                      </div>
                      <span className={`badge ${badgeClass}`}>{u.peran}</span>
                    </div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', whiteSpace: 'pre-line', borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '0.35rem' }}>
                      {deskripsi}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

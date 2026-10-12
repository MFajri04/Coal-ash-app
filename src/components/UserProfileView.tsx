import React, { useState } from 'react';
import { labStore } from '../store';
import { notify } from './NotificationModal';

export const UserProfileView: React.FC = () => {
  const currentUser = labStore.currentUser;
  const auditLogs = labStore.auditLogs;
  const analyses = labStore.analyses;

  const [nama, setNama] = useState(currentUser?.nama || '');
  const [jabatan, setJabatan] = useState(currentUser?.jabatan || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [telepon, setTelepon] = useState(currentUser?.telepon || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!currentUser) return null;

  // Aktivitas pribadi
  const myActivities = auditLogs.filter(l => l.pengguna.toLowerCase() === currentUser.nama.toLowerCase());

  // Statistik personal berdasarkan peran
  const samplesAnalyzed = analyses.filter(a => a.analisNama.toLowerCase() === currentUser.nama.toLowerCase()).length;
  const samplesApproved = analyses.filter(a => a.disetujuiOleh?.toLowerCase().includes(currentUser.nama.toLowerCase())).length;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      notify.error('Validasi Input Gagal', 'Nama lengkap tidak boleh kosong!');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      notify.error('Validasi Kata Sandi Gagal', 'Konfirmasi kata sandi baru tidak cocok dengan kata sandi yang diketik!');
      return;
    }

    labStore.updateProfile(currentUser.id, {
      nama: nama.trim(),
      jabatan: jabatan.trim(),
      email: email.trim(),
      telepon: telepon.trim(),
      password: newPassword.trim() || undefined
    });

    setNewPassword('');
    setConfirmPassword('');
    notify.success('Profil Berhasil Diperbarui', 'Informasi akun dan kata sandi Anda telah disimpan.');
    setSuccessMsg('✓ Profil dan pengaturan akun berhasil diperbarui!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="flex flex-col gap-6">
      {successMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          color: '#34d399',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Kolom Kiri: Kartu Identitas Personel Lab */}
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            margin: '0 auto 1.25rem auto',
            background: currentUser.peran === 'Analis' ? 'linear-gradient(135deg, #0284c7, #38bdf8)' :
                        currentUser.peran === 'Supervisor' ? 'linear-gradient(135deg, #d97706, #fbbf24)' :
                        currentUser.peran === 'Admin' ? 'linear-gradient(135deg, #dc2626, #f87171)' : 'linear-gradient(135deg, #059669, #34d399)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.25rem',
            fontWeight: 800,
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
          }}>
            {currentUser.nama.charAt(0)}
          </div>

          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{currentUser.nama}</h3>
          <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {currentUser.jabatan || 'Personel Laboratorium'}
          </p>

          <div style={{ marginTop: '0.75rem' }}>
            <span className={`badge ${
              currentUser.peran === 'Analis' ? 'badge-info' :
              currentUser.peran === 'Supervisor' ? 'badge-warning' :
              currentUser.peran === 'Admin' ? 'badge-danger' : 'badge-success'
            }`} style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem' }}>
              Peran: {currentUser.peran}
            </span>
          </div>

          <div style={{
            marginTop: '1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1rem',
            textAlign: 'left',
            fontSize: '0.825rem'
          }} className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-muted)' }}>Username:</span>
              <span className="font-mono" style={{ color: '#e0e7ff' }}>{currentUser.username}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-muted)' }}>Status Akun:</span>
              <span style={{ color: currentUser.statusAktif ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                {currentUser.statusAktif ? '● Aktif' : '● Dinonaktifkan'}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-muted)' }}>Terdaftar Sejak:</span>
              <span>{currentUser.tanggalDibuat || '2026-01-01'}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-muted)' }}>Total Aktivitas:</span>
              <strong className="font-mono">{myActivities.length} Aksi</strong>
            </div>
          </div>

          {/* Quick Metrics */}
          {currentUser.peran === 'Analis' && (
            <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'rgba(56, 189, 248, 0.08)', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Sampel Selesai Ditimbang:</div>
              <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>{samplesAnalyzed}</div>
            </div>
          )}

          {currentUser.peran === 'Supervisor' && (
            <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'rgba(251, 191, 36, 0.08)', borderRadius: '8px', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Sampel Disetujui (E-Signature):</div>
              <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24' }}>{samplesApproved}</div>
            </div>
          )}
        </div>

        {/* Kolom Tengah & Kanan: Form Edit Profil & Riwayat Aktivitas (2 columns) */}
        <div className="flex flex-col gap-6" style={{ gridColumn: 'span 2' }}>
          {/* Form Edit Data Profil */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ margin: '0 0 1.25rem 0' }}>Pengaturan Profil & Keamanan Akun</h3>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    className="form-input"
                    value={nama}
                    onChange={e => setNama(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Jabatan Laboratorium</label>
                  <input
                    type="text"
                    className="form-input"
                    value={jabatan}
                    onChange={e => setJabatan(e.target.value)}
                    placeholder="Misal: Analis Kimia Senior"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Alamat Email Resmi</label>
                  <input
                    type="email"
                    className="form-input font-mono"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="nama@mineralanalitika.co.id"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nomor Kontak / WhatsApp</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    value={telepon}
                    onChange={e => setTelepon(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem' }}>Ubah Kata Sandi (Opsional)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Kata Sandi Baru</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Biarkan kosong jika tidak diubah"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Konfirmasi Kata Sandi Baru</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Ulangi kata sandi baru"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end" style={{ marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary">
                  💾 Simpan Perubahan Profil
                </button>
              </div>
            </form>
          </div>

          {/* Log Aktivitas Pribadi Terkini */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h4 style={{ margin: '0 0 1rem 0' }}>Log Aktivitas Saya (10 Aksi Terakhir)</h4>
            {myActivities.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Belum ada rekaman aktivitas untuk sesi ini.</p>
            ) : (
              <div className="table-responsive">
                <table className="lab-table">
                  <thead>
                    <tr>
                      <th>Waktu</th>
                      <th>Entitas</th>
                      <th>Aksi</th>
                      <th>Keterangan Aktivitas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myActivities.slice(0, 10).map(act => (
                      <tr key={act.id}>
                        <td className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {act.waktu}
                        </td>
                        <td style={{ fontWeight: 600 }}>{act.entitas}</td>
                        <td>
                          <span className={`badge ${
                            act.aksi === 'CREATE' ? 'badge-info' :
                            act.aksi === 'APPROVE' ? 'badge-success' :
                            act.aksi === 'REJECT' ? 'badge-danger' : 'badge-warning'
                          }`}>
                            {act.aksi}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.825rem' }}>{act.nilaiBaru}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

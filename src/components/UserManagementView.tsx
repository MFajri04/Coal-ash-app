import React, { useState } from 'react';
import { labStore } from '../store';
import { User, UserRole } from '../types';
import { notify } from './NotificationModal';

export const UserManagementView: React.FC = () => {
  const users = labStore.users;
  const auditLogs = labStore.auditLogs;
  const currentUser = labStore.currentUser;

  const [activeSubTab, setActiveSubTab] = useState<'users' | 'activity'>('users');
  const [showAddModal, setShowAddModal] = useState(false);
  const [resetModalUser, setResetModalUser] = useState<User | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState('password123');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Form Tambah Pengguna Baru
  const [newNama, setNewNama] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('password123');
  const [newPeran, setNewPeran] = useState<UserRole>('Analis');
  const [newJabatan, setNewJabatan] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTelepon, setNewTelepon] = useState('');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama.trim() || !newUsername.trim() || !newPassword.trim()) {
      notify.error('Validasi Gagal', 'Nama, Username, dan Kata Sandi wajib diisi!');
      return;
    }

    const usernameExists = users.some(u => u.username.toLowerCase() === newUsername.trim().toLowerCase());
    if (usernameExists) {
      notify.error('Username Duplikat', 'Username tersebut sudah digunakan oleh akun lain! Silakan gunakan username yang unik.');
      return;
    }

    labStore.createUser({
      nama: newNama.trim(),
      username: newUsername.trim(),
      password: newPassword.trim(),
      peran: newPeran,
      statusAktif: true,
      jabatan: newJabatan.trim() || undefined,
      email: newEmail.trim() || undefined,
      telepon: newTelepon.trim() || undefined
    });

    setShowAddModal(false);
    const addedName = newNama.trim();
    const addedRole = newPeran;
    setNewNama('');
    setNewUsername('');
    setNewPassword('password123');
    setNewJabatan('');
    setNewEmail('');
    setNewTelepon('');
    notify.modal({
      type: 'success',
      title: 'Pengguna Berhasil Ditambahkan! 👥',
      message: `Akun baru telah aktif dan siap digunakan untuk masuk ke sistem LIMS.`,
      detail: `• Nama Lengkap : ${addedName}\n• Peran Akses  : ${addedRole}\n• Status Akun  : Aktif`
    });
  };

  const handleConfirmResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser || !newPasswordVal.trim()) return;

    labStore.resetUserPassword(resetModalUser.id, newPasswordVal.trim());
    notify.success('Kata Sandi Direset', `Kata sandi untuk pengguna ${resetModalUser.nama} berhasil direset menjadi: ${newPasswordVal}`);
    setResetModalUser(null);
    setNewPasswordVal('password123');
  };

  // Filter Log Aktivitas
  const filteredActivities = auditLogs.filter(act => {
    const matchesUser = selectedUserFilter === 'ALL' || act.pengguna.toLowerCase() === selectedUserFilter.toLowerCase();
    const matchesSearch = 
      act.entitas.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (act.nilaiBaru && act.nilaiBaru.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (act.alasan && act.alasan.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesUser && matchesSearch;
  });

  const handleExportUserActivityCSV = () => {
    const headers = ['ID', 'Waktu', 'Pengguna', 'Peran', 'Entitas', 'Aksi', 'Aktivitas / Nilai Baru', 'Alasan'];
    const rows = filteredActivities.map(l => [
      l.id,
      `"${l.waktu}"`,
      `"${l.pengguna}"`,
      l.peran,
      l.entitas,
      l.aksi,
      `"${(l.nilaiBaru || '').replace(/"/g, '""')}"`,
      `"${(l.alasan || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Aktivitas_User_LIMS_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Tab Switcher */}
      <div className="glass-panel" style={{ padding: '0.75rem 1.25rem' }}>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSubTab('users')}
              className={`btn btn-sm ${activeSubTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
            >
              👥 Manajemen Akun Pengguna ({users.length})
            </button>
            <button
              onClick={() => setActiveSubTab('activity')}
              className={`btn btn-sm ${activeSubTab === 'activity' ? 'btn-primary' : 'btn-secondary'}`}
            >
              📈 Pemantauan Aktivitas User ({auditLogs.length})
            </button>
          </div>

          {activeSubTab === 'users' && (
            <button onClick={() => setShowAddModal(true)} className="btn btn-sm btn-primary">
              + Tambah Pengguna Baru
            </button>
          )}
        </div>
      </div>

      {/* Sub Tab 1: Manajemen Akun Pengguna */}
      {activeSubTab === 'users' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>Daftar Personel & Hak Akses Pengguna</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                Pengaturan akun, otorisasi peran, dan status akses laboratorium (FR-001 s/d FR-003)
              </p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="lab-table">
              <thead>
                <tr>
                  <th>Nama & Gelar</th>
                  <th>Username</th>
                  <th>Peran (Role)</th>
                  <th>Jabatan Laboratorium</th>
                  <th>Kontak / Email</th>
                  <th>Status Akun</th>
                  <th>Aksi Moderasi</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#e0e7ff' }}>{u.nama}</div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        Terdaftar: {u.tanggalDibuat || '2026-01-01'}
                      </div>
                    </td>
                    <td className="font-mono">{u.username}</td>
                    <td>
                      <span className={`badge ${
                        u.peran === 'Analis' ? 'badge-info' :
                        u.peran === 'Supervisor' ? 'badge-warning' :
                        u.peran === 'Admin' ? 'badge-danger' : 'badge-success'
                      }`}>
                        {u.peran}
                      </span>
                    </td>
                    <td>{u.jabatan || '-'}</td>
                    <td style={{ fontSize: '0.8rem' }}>
                      <div>{u.email || '-'}</div>
                      <div style={{ color: 'var(--text-muted)' }}>{u.telepon || ''}</div>
                    </td>
                    <td>
                      <span className={`badge ${u.statusAktif ? 'badge-success' : 'badge-danger'}`}>
                        {u.statusAktif ? '● Aktif' : '● Dinonaktifkan'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => labStore.toggleUserStatus(u.id)}
                          className={`btn btn-sm ${u.statusAktif ? 'btn-secondary' : 'btn-success'}`}
                          title={u.statusAktif ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                          disabled={u.id === currentUser?.id}
                        >
                          {u.statusAktif ? 'Suspend' : 'Aktifkan'}
                        </button>
                        <button
                          onClick={() => setResetModalUser(u)}
                          className="btn btn-sm btn-secondary"
                          title="Reset Password"
                        >
                          🔑 Reset
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub Tab 2: Pemantauan Aktivitas User */}
      {activeSubTab === 'activity' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>Log Jejak Aktivitas Personel (User Activity Tracking)</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                Pengawasan komprehensif seluruh aktivitas input, penimbangan, persetujuan, dan moderasi
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                className="form-input"
                style={{ width: '220px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                value={selectedUserFilter}
                onChange={e => setSelectedUserFilter(e.target.value)}
              >
                <option value="ALL">Semua Personel</option>
                {users.map(u => (
                  <option key={u.id} value={u.nama}>
                    {u.nama} ({u.peran})
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Cari aktivitas..."
                className="form-input"
                style={{ width: '180px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />

              <button onClick={handleExportUserActivityCSV} className="btn btn-sm btn-secondary">
                📥 Ekspor CSV
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="lab-table">
              <thead>
                <tr>
                  <th>Waktu (WIB)</th>
                  <th>Pengguna & Peran</th>
                  <th>Entitas</th>
                  <th>Tipe Aksi</th>
                  <th>Deskripsi Aktivitas</th>
                  <th>Justifikasi / Alasan</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map(act => (
                  <tr key={act.id}>
                    <td className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {act.waktu}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{act.pengguna}</div>
                      <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{act.peran}</span>
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
                    <td style={{ fontSize: '0.85rem', color: '#e0e7ff' }}>
                      {act.nilaiBaru}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      {act.alasan || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Tambah Pengguna Baru */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div className="glass-panel animate-fade-in" style={{ maxWidth: '580px', width: '100%', background: '#0b1120', border: '1px solid var(--border-glow)', padding: '2rem' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0 }}>Tambah Pengguna Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="btn btn-sm btn-secondary">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Misal: Bambang Triyono, S.T"
                  value={newNama}
                  onChange={e => setNewNama(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="analis_bambang"
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kata Sandi Awal</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Peran (Hak Akses)</label>
                  <select
                    className="form-input"
                    value={newPeran}
                    onChange={e => setNewPeran(e.target.value as UserRole)}
                  >
                    <option value="Analis">Analis (Input & Timbang)</option>
                    <option value="Supervisor">Supervisor (Audit & Approve)</option>
                    <option value="Admin">Admin (Kelola Sistem)</option>
                    <option value="Pelanggan">Pelanggan (Hanya Lihat CoA)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Jabatan Personel</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Laboran Ashing"
                    value={newJabatan}
                    onChange={e => setNewJabatan(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="email@lab.co.id"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nomor Telepon</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="0812-xxxx-xxxx"
                    value={newTelepon}
                    onChange={e => setNewTelepon(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2" style={{ marginTop: '0.75rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  ✓ Simpan Akun Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reset Password User */}
      {resetModalUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div className="glass-panel animate-fade-in" style={{ maxWidth: '420px', width: '100%', background: '#0b1120', border: '1px solid var(--border-glow)', padding: '1.75rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>Reset Kata Sandi Pengguna</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Masukkan kata sandi baru untuk <strong>{resetModalUser.nama}</strong>:
            </p>

            <form onSubmit={handleConfirmResetPassword} className="flex flex-col gap-4" style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Kata Sandi Baru</label>
                <input
                  type="text"
                  className="form-input font-mono"
                  value={newPasswordVal}
                  onChange={e => setNewPasswordVal(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-2" style={{ marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setResetModalUser(null)} className="btn btn-secondary btn-sm">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Konfirmasi Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

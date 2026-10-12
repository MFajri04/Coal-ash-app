import React, { useState } from 'react';
import { labStore } from '../store';
import { notify } from './NotificationModal';

export const MasterDataView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'methods' | 'balances' | 'furnaces' | 'crucibles'>('methods');
  const [newCrucibleNomor, setNewCrucibleNomor] = useState('');

  const methods = labStore.methods;
  const balances = labStore.balances;
  const furnaces = labStore.furnaces;
  const crucibles = labStore.crucibles;

  const handleAddCrucible = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrucibleNomor.trim()) return;

    const exists = crucibles.some(c => c.nomor.toLowerCase() === newCrucibleNomor.trim().toLowerCase());
    if (exists) {
      notify.error('Nomor Cawan Duplikat', 'Nomor cawan porselen tersebut sudah terdaftar dalam inventaris!');
      return;
    }

    const item = {
      id: Date.now(),
      nomor: newCrucibleNomor.trim().toUpperCase(),
      status: 'Tersedia' as const
    };
    labStore.crucibles.push(item);
    labStore.addAudit('Crucible', 'CREATE', undefined, `Menambah cawan baru ${item.nomor}`, 'Penambahan inventaris cawan');
    labStore.notify();
    setNewCrucibleNomor('');
    notify.success('Cawan Ditambahkan', `Cawan ${item.nomor} berhasil didaftarkan ke inventaris lab.`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Sub Tabs */}
      <div className="glass-panel" style={{ padding: '0.75rem 1.25rem' }}>
        <div className="flex gap-2">
          {[
            { id: 'methods', label: '📋 Metode Analisis (ASTM / ISO)' },
            { id: 'balances', label: '⚖️ Neraca Analitik' },
            { id: 'furnaces', label: '🔥 Furnace Pembakaran' },
            { id: 'crucibles', label: '🥣 Cawan Porselen/Silika' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`btn btn-sm ${activeSubTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sub Tab: Metode */}
      {activeSubTab === 'methods' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Standar & Parameter Metode Analisis</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Parameter target bobot, toleransi, batas konstan, dan repeatability dikonfigurasi per metode sesuai SOP lab (FR-013, BR-01).
          </p>

          <div className="table-responsive">
            <table className="lab-table">
              <thead>
                <tr>
                  <th>Nama Metode</th>
                  <th>Target Bobot</th>
                  <th>Toleransi (±)</th>
                  <th>Batas Konstan</th>
                  <th>Batas Repeatability</th>
                  <th>Suhu Furnace</th>
                  <th>Durasi Pembakaran</th>
                </tr>
              </thead>
              <tbody>
                {methods.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 700, color: '#e0e7ff' }}>{m.nama}</td>
                    <td className="font-mono">{m.targetBeratSampel.toFixed(4)} g</td>
                    <td className="font-mono">{m.toleransi.toFixed(4)} g</td>
                    <td className="font-mono">≤ {m.batasBeratKonstan.toFixed(4)} g</td>
                    <td className="font-mono">≤ {m.batasRepeatability.toFixed(2)} %</td>
                    <td className="font-mono">{m.suhu} °C</td>
                    <td>{m.durasiMenit} menit</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub Tab: Neraca */}
      {activeSubTab === 'balances' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>Daftar Neraca Analitik Terdaftar</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                Pengawasan kalibrasi berkala neraca analitik (FR-011, FR-015, BR-04)
              </p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="lab-table">
              <thead>
                <tr>
                  <th>Kode Alat</th>
                  <th>Nama & Tipe Neraca</th>
                  <th>Resolusi</th>
                  <th>Tanggal Kalibrasi</th>
                  <th>Jatuh Tempo Kalibrasi</th>
                  <th>Status Operasional</th>
                </tr>
              </thead>
              <tbody>
                {balances.map(b => (
                  <tr key={b.id}>
                    <td className="font-mono" style={{ fontWeight: 700, color: '#e0e7ff' }}>{b.kode}</td>
                    <td>{b.nama}</td>
                    <td className="font-mono">{b.resolusi.toFixed(4)} g</td>
                    <td>{b.tanggalKalibrasi}</td>
                    <td className="font-mono" style={{ color: b.status === 'Kedaluwarsa' ? 'var(--danger)' : 'inherit' }}>
                      {b.jatuhTempo}
                    </td>
                    <td>
                      <span className={`badge ${b.status === 'Aktif' ? 'badge-success' : 'badge-danger'}`}>
                        {b.status === 'Aktif' ? '✓ SIAP PAKAI' : '✕ KEDALUWARSA (DIBLOKIR)'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub Tab: Furnace */}
      {activeSubTab === 'furnaces' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Daftar Furnace (Tungku Pembakaran)</h3>
          <div className="table-responsive">
            <table className="lab-table">
              <thead>
                <tr>
                  <th>Kode Tungku</th>
                  <th>Model / Tipe</th>
                  <th>Kapasitas Cawan</th>
                  <th>Tanggal Kalibrasi</th>
                  <th>Jatuh Tempo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {furnaces.map(f => (
                  <tr key={f.id}>
                    <td className="font-mono" style={{ fontWeight: 700 }}>{f.kode}</td>
                    <td>{f.nama}</td>
                    <td>{f.kapasitas} Cawan / Batch</td>
                    <td>{f.tanggalKalibrasi}</td>
                    <td>{f.jatuhTempo}</td>
                    <td><span className="badge badge-success">{f.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub Tab: Cawan */}
      {activeSubTab === 'crucibles' && (
        <div className="grid grid-cols-3 gap-6">
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Tambah Cawan Baru</h4>
            <form onSubmit={handleAddCrucible} className="flex flex-col gap-3">
              <div className="form-group">
                <label className="form-label">Nomor / Kode Cawan</label>
                <input
                  type="text"
                  className="form-input font-mono"
                  placeholder="Misal: C-21"
                  value={newCrucibleNomor}
                  onChange={e => setNewCrucibleNomor(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                + Daftarkan Cawan
              </button>
            </form>
          </div>

          <div className="glass-panel" style={{ gridColumn: 'span 2', padding: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Inventaris Cawan Lab (Total {crucibles.length})</h4>
            <div className="table-responsive">
              <table className="lab-table">
                <thead>
                  <tr>
                    <th>Nomor Cawan</th>
                    <th>Status Penggunaan</th>
                    <th>Riwayat W1 Terakhir</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {crucibles.map(c => (
                    <tr key={c.id}>
                      <td className="font-mono" style={{ fontWeight: 700 }}>{c.nomor}</td>
                      <td>
                        <span className={`badge ${
                          c.status === 'Tersedia' ? 'badge-success' :
                          c.status === 'Dipakai' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="font-mono">
                        {c.w1Terakhir ? `${c.w1Terakhir.toFixed(4)} g` : '-'}
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            const newStatus = c.status === 'Tersedia' ? 'Dipakai' : 'Tersedia';
                            c.status = newStatus;
                            labStore.notify();
                          }}
                          className="btn btn-sm btn-secondary"
                        >
                          Ubah Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

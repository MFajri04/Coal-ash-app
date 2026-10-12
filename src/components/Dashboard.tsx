import React from 'react';
import { labStore } from '../store';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const samples = labStore.samples;
  const analyses = labStore.analyses;
  const balances = labStore.balances;
  const furnaces = labStore.furnaces;

  const totalSamples = samples.length;
  const inProgressCount = samples.filter(s => s.status === 'Dalam analisis').length;
  const pendingReviewCount = samples.filter(s => s.status === 'Menunggu review').length;
  const approvedCount = samples.filter(s => s.status === 'Disetujui').length;

  // Cek peralatan kedaluwarsa kalibrasi (FR-015 & BR-04)
  const [currentDate, setCurrentDate] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  const expiredBalances = currentDate 
    ? balances.filter(b => b.status === 'Kedaluwarsa' || new Date(b.jatuhTempo) < currentDate)
    : [];
  const activeBalances = currentDate
    ? balances.filter(b => b.status === 'Aktif' && new Date(b.jatuhTempo) >= currentDate)
    : balances.filter(b => b.status === 'Aktif');

  return (
    <div className="flex flex-col gap-6">
      {/* Alert Banner jika ada neraca kalibrasi expired */}
      {expiredBalances.length > 0 && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <div>
              <h4 style={{ color: '#f87171', margin: 0 }}>Peringatan Kontrol Kualitas Alat (ISO 17025)</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                Ditemukan {expiredBalances.length} neraca ({expiredBalances.map(b => b.kode).join(', ')}) yang masa kalibrasinya telah kedaluwarsa dan dinonaktifkan dari proses penimbangan resmi.
              </p>
            </div>
          </div>
          <button onClick={() => onNavigate('master')} className="btn btn-sm btn-secondary" style={{ whiteSpace: 'nowrap' }}>
            Periksa Master Alat
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div className="flex justify-between items-center">
            <span className="form-label">Total Sampel</span>
            <span style={{ fontSize: '1.25rem' }}>📦</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>
            {totalSamples}
          </div>
          <span className="badge badge-neutral" style={{ marginTop: '0.5rem' }}>
            {samples.filter(s => s.status === 'Terdaftar').length} antrean registrasi
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div className="flex justify-between items-center">
            <span className="form-label">Sedang Dianalisis</span>
            <span style={{ fontSize: '1.25rem' }}>⚖️</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-light)', marginTop: '0.5rem' }}>
            {inProgressCount}
          </div>
          <span className="badge badge-info" style={{ marginTop: '0.5rem' }}>
            Proses furnace & timbang abu
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div className="flex justify-between items-center">
            <span className="form-label">Menunggu Persetujuan</span>
            <span style={{ fontSize: '1.25rem' }}>⏳</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--warning)', marginTop: '0.5rem' }}>
            {pendingReviewCount}
          </div>
          <span className="badge badge-warning" style={{ marginTop: '0.5rem' }}>
            Butuh verifikasi penyelia
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div className="flex justify-between items-center">
            <span className="form-label">Selesai & Disetujui</span>
            <span style={{ fontSize: '1.25rem' }}>✅</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.5rem' }}>
            {approvedCount}
          </div>
          <span className="badge badge-success" style={{ marginTop: '0.5rem' }}>
            Sertifikat CoA siap cetak
          </span>
        </div>
      </div>

      {/* Main Workspace Preview & Quick Actions */}
      <div className="grid grid-cols-3 gap-6">
        {/* Kolom Kiri: Tabel Sampel Terkini (2 spans) */}
        <div className="glass-panel" style={{ gridColumn: 'span 2', padding: '1.5rem' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
            <div>
              <h3>Status Pengujian Sampel Terkini</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Pelacakan alur analisis kadar abu dari penimbangan awal hingga sertifikasi
              </p>
            </div>
            <button onClick={() => onNavigate('samples')} className="btn btn-sm btn-primary">
              + Registrasi Sampel
            </button>
          </div>

          <div className="table-responsive">
            <table className="lab-table">
              <thead>
                <tr>
                  <th>Kode Sampel</th>
                  <th>Sumber / Lokasi</th>
                  <th>Jenis</th>
                  <th>Basis</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {samples.map(sample => {
                  let badgeClass = 'badge-neutral';
                  if (sample.status === 'Disetujui') badgeClass = 'badge-success';
                  if (sample.status === 'Menunggu review') badgeClass = 'badge-warning';
                  if (sample.status === 'Dalam analisis') badgeClass = 'badge-info';
                  if (sample.status === 'Ditolak/Ulang') badgeClass = 'badge-danger';

                  return (
                    <tr key={sample.id}>
                      <td className="font-mono" style={{ fontWeight: 700, color: '#e0e7ff' }}>
                        {sample.kodeUnik}
                      </td>
                      <td>{sample.sumber}</td>
                      <td>{sample.jenis}</td>
                      <td><span className="badge badge-neutral">{sample.basisPelaporan.toUpperCase()}</span></td>
                      <td>
                        <span className={`badge ${badgeClass}`}>
                          {sample.status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => onNavigate('worksheet')}
                          className="btn btn-sm btn-secondary"
                        >
                          Buka Uji
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kolom Kanan: Status Kesiapan Lab & Kontrol Mutu */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h4 style={{ marginBottom: '0.75rem' }}>Kesiapan Neraca & Furnace</h4>
            <div className="flex flex-col gap-3">
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div className="flex justify-between items-center" style={{ fontSize: '0.85rem' }}>
                  <span>Neraca Siap Pakai:</span>
                  <span style={{ fontWeight: 700, color: 'var(--success)' }}>{activeBalances.length} Unit</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                  Resolusi 0.0001 g terverifikasi kalibrasi
                </p>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div className="flex justify-between items-center" style={{ fontSize: '0.85rem' }}>
                  <span>Furnace Pembakaran:</span>
                  <span style={{ fontWeight: 700, color: '#38bdf8' }}>{furnaces.length} Unit</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                  Target suhu 750°C (ASTM) & 815°C (ISO)
                </p>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div className="flex justify-between items-center" style={{ fontSize: '0.85rem' }}>
                  <span>Cawan Tersedia:</span>
                  <span style={{ fontWeight: 700, color: '#a855f7' }}>
                    {labStore.crucibles.filter(c => c.status === 'Tersedia').length} / {labStore.crucibles.length} Unit
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                  Silika / Porselen berbobot konstan
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h4 style={{ marginBottom: '0.75rem' }}>Standar Mutu Uji (SOP)</h4>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span style={{ color: 'var(--success)' }}>✓</span>
                <span>Toleransi Bobot Sampel: <strong>1.0000 ± 0.1000 g</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ color: 'var(--success)' }}>✓</span>
                <span>Batas Berat Konstan Abu: <strong>≤ 0.0005 g</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ color: 'var(--success)' }}>✓</span>
                <span>Batas Repeatability Duplikat: <strong>≤ 0.30%</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ color: 'var(--success)' }}>✓</span>
                <span>Audit Trail Otomatis: <strong>100% Tercatat</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

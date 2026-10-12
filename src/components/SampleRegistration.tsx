import React, { useState } from 'react';
import { labStore } from '../store';
import { Sample } from '../types';
import { notify } from './NotificationModal';

interface SampleRegistrationProps {
  onStartAnalysis?: (sample: Sample) => void;
}

export const SampleRegistration: React.FC<SampleRegistrationProps> = ({ onStartAnalysis }) => {
  const [sumber, setSumber] = useState('');
  const [jenis, setJenis] = useState('Sub-bituminous');
  const [basisPelaporan, setBasisPelaporan] = useState<'adb' | 'ar' | 'db'>('adb');
  const [moistureAdb, setMoistureAdb] = useState('8.50');
  const [moistureAr, setMoistureAr] = useState('22.00');
  const [catatan, setCatatan] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<Sample | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const samples = labStore.samples;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sumber.trim()) {
      notify.error('Validasi Input Gagal', 'Sumber sampel / asal tambang batubara wajib diisi!');
      return;
    }

    const todayStr = new Date().toISOString().substring(0, 10);
    const created = labStore.createSample({
      sumber: sumber.trim(),
      jenis,
      tanggalTerima: todayStr,
      basisPelaporan,
      catatan: catatan.trim(),
      moistureAdb: parseFloat(moistureAdb) || undefined,
      moistureAr: parseFloat(moistureAr) || undefined
    });

    setSumber('');
    setCatatan('');
    notify.modal({
      type: 'success',
      title: 'Sampel Berhasil Didaftarkan! 🎉',
      message: `Sampel batubara baru telah berhasil disimpan ke database LIMS.`,
      detail: `• ID Sampel      : ${created.kodeUnik}\n• Sumber         : ${created.sumber}\n• Jenis Batubara : ${created.jenis}\n• Basis Pelaporan: ${created.basisPelaporan}\n• Status         : Terdaftar (Menunggu Penimbangan)\n\nLabel barcode thermal siap dicetak untuk pelacakan wadah fisik di ruang preparasi.`
    });
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Kode Unik', 'Sumber', 'Jenis', 'Tanggal Terima', 'Basis', 'Status', 'Moisture adb (%)', 'Moisture ar (%)'];
    const rows = samples.map(s => [
      s.id,
      s.kodeUnik,
      `"${s.sumber}"`,
      s.jenis,
      s.tanggalTerima,
      s.basisPelaporan,
      s.status,
      s.moistureAdb || '',
      s.moistureAr || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Sampel_Batubara_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSamples = samples.filter(s => 
    s.kodeUnik.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.sumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.jenis.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.status.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-6">
        {/* Form Registrasi Sampel (1 column) */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1.25rem' }}>📝</span>
            <h3 style={{ margin: 0 }}>Registrasi Sampel Baru</h3>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-group">
              <label className="form-label">Sumber / Lokasi Pengambilan</label>
              <input
                type="text"
                className="form-input"
                placeholder="Misal: Pit Central 3, MV Lumoso, Barge 12"
                value={sumber}
                onChange={e => setSumber(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label className="form-label">Jenis Batubara</label>
                <select className="form-input" value={jenis} onChange={e => setJenis(e.target.value)}>
                  <option value="Lignite">Lignite</option>
                  <option value="Sub-bituminous">Sub-bituminous</option>
                  <option value="Bituminous">Bituminous</option>
                  <option value="Anthracite">Anthracite</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Basis Pelaporan</label>
                <select className="form-input" value={basisPelaporan} onChange={e => setBasisPelaporan(e.target.value as any)}>
                  <option value="adb">Air Dried Basis (adb)</option>
                  <option value="ar">As Received (ar)</option>
                  <option value="db">Dry Basis (db)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label className="form-label">Moisture adb (%)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input font-mono"
                  placeholder="8.50"
                  value={moistureAdb}
                  onChange={e => setMoistureAdb(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Moisture ar (%)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input font-mono"
                  placeholder="22.00"
                  value={moistureAr}
                  onChange={e => setMoistureAr(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Catatan Sampel</label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="Catatan kondisi fisik sampel, nomor segel, dll..."
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              ✓ Daftarkan Sampel (Auto ID)
            </button>
          </form>
        </div>

        {/* Tabel Daftar Sampel (2 columns) */}
        <div className="glass-panel" style={{ gridColumn: 'span 2', padding: '1.5rem' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>Daftar Sampel Terdaftar</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                Total {samples.length} sampel terdata dalam sistem
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Cari ID / Sumber..."
                className="form-input"
                style={{ width: '200px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
              />
              <button onClick={handleExportCSV} className="btn btn-sm btn-secondary">
                📥 Ekspor CSV
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="lab-table">
              <thead>
                <tr>
                  <th>Kode Sampel</th>
                  <th>Sumber</th>
                  <th>Jenis</th>
                  <th>Tanggal Terima</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredSamples.map(sample => (
                  <tr key={sample.id}>
                    <td className="font-mono" style={{ fontWeight: 700, color: '#e0e7ff' }}>
                      {sample.kodeUnik}
                    </td>
                    <td>{sample.sumber}</td>
                    <td>{sample.jenis}</td>
                    <td>{sample.tanggalTerima}</td>
                    <td>
                      <span className={`badge ${
                        sample.status === 'Disetujui' ? 'badge-success' :
                        sample.status === 'Menunggu review' ? 'badge-warning' :
                        sample.status === 'Dalam analisis' ? 'badge-info' : 'badge-neutral'
                      }`}>
                        {sample.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedLabel(sample)}
                          className="btn btn-sm btn-secondary"
                          title="Cetak Label Barcode/QR"
                        >
                          🏷️ Label
                        </button>
                        {onStartAnalysis && (
                          <button
                            onClick={() => onStartAnalysis(sample)}
                            className="btn btn-sm btn-primary"
                            title="Mulai Uji Timbang"
                          >
                            Timbang
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Cetak Barcode / QR Label (FR-022) */}
      {selectedLabel && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999
        }}>
          <div className="glass-panel" style={{ width: '420px', padding: '1.75rem', background: '#0f172a', border: '1px solid var(--border-glow)' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0 }}>Label Barcode Sampel</h3>
              <button onClick={() => setSelectedLabel(null)} className="btn btn-sm btn-secondary">✕</button>
            </div>

            <div style={{
              background: '#ffffff',
              color: '#000000',
              padding: '1.25rem',
              borderRadius: '8px',
              textAlign: 'center',
              border: '2px dashed #94a3b8'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                LABORATORIUM BATUBARA ISO 17025
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', margin: '0.5rem 0' }}>
                {selectedLabel.kodeUnik}
              </div>
              
              {/* Simulasi Mock Barcode Bar */}
              <div style={{
                height: '45px',
                background: 'repeating-linear-gradient(90deg, #000 0px, #000 3px, #fff 3px, #fff 6px, #000 6px, #000 10px, #fff 10px, #fff 12px)',
                margin: '0.5rem 0'
              }}></div>

              <div style={{ fontSize: '0.8rem', textAlign: 'left', marginTop: '0.5rem' }}>
                <div><strong>Sumber:</strong> {selectedLabel.sumber}</div>
                <div><strong>Jenis:</strong> {selectedLabel.jenis}</div>
                <div><strong>Tgl Terima:</strong> {selectedLabel.tanggalTerima}</div>
                <div><strong>Basis:</strong> {selectedLabel.basisPelaporan.toUpperCase()}</div>
              </div>
            </div>

            <div className="flex justify-end gap-2" style={{ marginTop: '1.25rem' }}>
              <button onClick={() => window.print()} className="btn btn-primary btn-sm">
                🖨️ Cetak Thermal
              </button>
              <button onClick={() => setSelectedLabel(null)} className="btn btn-secondary btn-sm">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

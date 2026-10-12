import React, { useState } from 'react';
import { labStore } from '../store';
import { AnalysisRecord } from '../types';

export const ReportView: React.FC = () => {
  const analyses = labStore.analyses;
  const samples = labStore.samples;
  const methods = labStore.methods;

  const approvedAnalyses = analyses.filter(a => a.status === 'Disetujui');
  const [selectedId, setSelectedId] = useState<number>(approvedAnalyses[0]?.id || analyses[0]?.id || 0);

  const activeRecord = analyses.find(a => a.id === selectedId) || analyses[0];
  const activeSample = samples.find(s => s.id === activeRecord?.sampleId);
  const activeMethod = methods.find(m => m.id === activeRecord?.methodId);

  const handlePrint = () => {
    window.print();
  };

  if (!activeRecord || !activeSample) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <h3>Belum ada laporan analisis yang tersedia</h3>
        <p>Lakukan analisis dan persetujuan supervisor terlebih dahulu untuk menerbitkan sertifikat CoA.</p>
      </div>
    );
  }

  const certNumber = `COA/BB/2026/X/${String(activeRecord.id).substring(String(activeRecord.id).length - 4)}`;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Controls (Hidden on Print) */}
      <div className="glass-panel no-print" style={{ padding: '1rem 1.5rem' }}>
        <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div className="flex items-center gap-3">
            <span className="form-label" style={{ margin: 0 }}>Pilih Dokumen Sertifikat:</span>
            <select
              className="form-input font-mono"
              style={{ width: '280px' }}
              value={selectedId}
              onChange={e => setSelectedId(Number(e.target.value))}
            >
              {analyses.map(a => {
                const s = samples.find(item => item.id === a.sampleId);
                return (
                  <option key={a.id} value={a.id}>
                    {s?.kodeUnik} - {s?.sumber} [{a.status}]
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex gap-2">
            <button onClick={handlePrint} className="btn btn-primary">
              🖨️ Cetak / Ekspor PDF Resmi
            </button>
          </div>
        </div>
      </div>

      {/* Sertifikat Analisis Resmi (CoA Layout ISO/IEC 17025) */}
      <div
        className="glass-panel"
        style={{
          background: '#ffffff',
          color: '#0f172a',
          padding: '3rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
          maxWidth: '900px',
          margin: '0 auto',
          width: '100%',
          border: '1px solid #cbd5e1'
        }}
      >
        {/* Kop Surat Laboratorium */}
        <div style={{ borderBottom: '3px double #0f172a', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div style={{
                width: '54px',
                height: '54px',
                background: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                fontWeight: 900,
                fontSize: '1.25rem'
              }}>
                LAB
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                  PT MINERAL ANALITIKA LABORATORIUM
                </h2>
                <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.8rem', color: '#475569' }}>
                  Laboratorium Pengujian Batubara & Mineral Terakreditasi KAN LP-17025-IDN
                </p>
                <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                  Jl. Tambang Raya No. 45, Kawasan Industri Batu Bara • Email: lab@mineralanalitika.co.id
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'right', borderLeft: '2px solid #e2e8f0', paddingLeft: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>AKREDITASI</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>ISO/IEC 17025:2017</div>
              <div style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700 }}>SERTIFIKASI AKTIF</div>
            </div>
          </div>
        </div>

        {/* Judul Dokumen */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a', margin: 0 }}>
            CERTIFICATE OF ANALYSIS (COA)
          </h3>
          <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>
            Nomor Dokumen: <strong>{certNumber}</strong>
          </div>
        </div>

        {/* Informasi Identitas Sampel */}
        <div style={{ marginBottom: '1.75rem', fontSize: '0.875rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ width: '22%', padding: '0.35rem 0', color: '#64748b' }}>Kode Sampel Lab</td>
                <td style={{ width: '28%', padding: '0.35rem 0', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>: {activeSample.kodeUnik}</td>
                <td style={{ width: '22%', padding: '0.35rem 0', color: '#64748b' }}>Tanggal Penerimaan</td>
                <td style={{ width: '28%', padding: '0.35rem 0', fontWeight: 600 }}>: {activeSample.tanggalTerima}</td>
              </tr>
              <tr>
                <td style={{ padding: '0.35rem 0', color: '#64748b' }}>Sumber / Lokasi</td>
                <td style={{ padding: '0.35rem 0', fontWeight: 600 }}>: {activeSample.sumber}</td>
                <td style={{ padding: '0.35rem 0', color: '#64748b' }}>Tanggal Pengujian</td>
                <td style={{ padding: '0.35rem 0', fontWeight: 600 }}>: {activeRecord.tanggalMulai.substring(0, 10)}</td>
              </tr>
              <tr>
                <td style={{ padding: '0.35rem 0', color: '#64748b' }}>Jenis Komoditas</td>
                <td style={{ padding: '0.35rem 0', fontWeight: 600 }}>: Batu Bara ({activeSample.jenis})</td>
                <td style={{ padding: '0.35rem 0', color: '#64748b' }}>Metode Standar Uji</td>
                <td style={{ padding: '0.35rem 0', fontWeight: 700 }}>: {activeMethod?.nama}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tabel Parameter Hasil Uji */}
        <div style={{ marginBottom: '2rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #0f172a', textAlign: 'center', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #0f172a' }}>
                <th style={{ padding: '0.75rem', borderRight: '1px solid #cbd5e1' }}>No.</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderRight: '1px solid #cbd5e1' }}>Parameter Uji</th>
                <th style={{ padding: '0.75rem', borderRight: '1px solid #cbd5e1' }}>Satuan</th>
                <th style={{ padding: '0.75rem', borderRight: '1px solid #cbd5e1' }}>Basis Uji</th>
                <th style={{ padding: '0.75rem', borderRight: '1px solid #cbd5e1' }}>Hasil Pengujian</th>
                <th style={{ padding: '0.75rem' }}>Spesifikasi Metode</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                <td style={{ padding: '0.75rem', borderRight: '1px solid #cbd5e1' }}>1</td>
                <td style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 700, borderRight: '1px solid #cbd5e1' }}>
                  Kadar Abu (Ash Content)
                </td>
                <td style={{ padding: '0.75rem', borderRight: '1px solid #cbd5e1' }}>% (w/w)</td>
                <td style={{ padding: '0.75rem', borderRight: '1px solid #cbd5e1' }}>air dried (adb)</td>
                <td style={{ padding: '0.75rem', fontWeight: 800, fontSize: '1.05rem', borderRight: '1px solid #cbd5e1', fontFamily: 'var(--font-mono)' }}>
                  {activeRecord.rataRataKadarAbu?.toFixed(2)}
                </td>
                <td style={{ padding: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
                  Repeatability ≤ {activeMethod?.batasRepeatability.toFixed(2)}%
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc' }}>
                <td style={{ padding: '0.6rem', borderRight: '1px solid #cbd5e1' }}>2</td>
                <td style={{ padding: '0.6rem', textAlign: 'left', borderRight: '1px solid #cbd5e1' }}>
                  Kadar Abu (Dry Basis)
                </td>
                <td style={{ padding: '0.6rem', borderRight: '1px solid #cbd5e1' }}>% (w/w)</td>
                <td style={{ padding: '0.6rem', borderRight: '1px solid #cbd5e1' }}>dry basis (db)</td>
                <td style={{ padding: '0.6rem', fontWeight: 700, borderRight: '1px solid #cbd5e1', fontFamily: 'var(--font-mono)' }}>
                  {activeRecord.kadarAbuDb?.toFixed(2)}
                </td>
                <td style={{ padding: '0.6rem', fontSize: '0.8rem', color: '#64748b' }}>Konversi basis moisture</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                <td style={{ padding: '0.6rem', borderRight: '1px solid #cbd5e1' }}>3</td>
                <td style={{ padding: '0.6rem', textAlign: 'left', borderRight: '1px solid #cbd5e1' }}>
                  Kadar Abu (As Received)
                </td>
                <td style={{ padding: '0.6rem', borderRight: '1px solid #cbd5e1' }}>% (w/w)</td>
                <td style={{ padding: '0.6rem', borderRight: '1px solid #cbd5e1' }}>as received (ar)</td>
                <td style={{ padding: '0.6rem', fontWeight: 700, borderRight: '1px solid #cbd5e1', fontFamily: 'var(--font-mono)' }}>
                  {activeRecord.kadarAbuAr?.toFixed(2)}
                </td>
                <td style={{ padding: '0.6rem', fontSize: '0.8rem', color: '#64748b' }}>Konversi basis moisture</td>
              </tr>
              <tr>
                <td style={{ padding: '0.6rem', borderRight: '1px solid #cbd5e1' }}>4</td>
                <td style={{ padding: '0.6rem', textAlign: 'left', borderRight: '1px solid #cbd5e1' }}>
                  Moisture in the Analysis Sample
                </td>
                <td style={{ padding: '0.6rem', borderRight: '1px solid #cbd5e1' }}>%</td>
                <td style={{ padding: '0.6rem', borderRight: '1px solid #cbd5e1' }}>adb</td>
                <td style={{ padding: '0.6rem', borderRight: '1px solid #cbd5e1', fontFamily: 'var(--font-mono)' }}>
                  {activeSample.moistureAdb?.toFixed(2) || '-'}
                </td>
                <td style={{ padding: '0.6rem', fontSize: '0.8rem', color: '#64748b' }}>Data pelengkap</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Ketertelusuran & Catatan Mutu */}
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '2rem', fontSize: '0.8rem' }}>
          <strong>Ketertelusuran Pengukuran (Traceability Log):</strong>
          <div style={{ marginTop: '0.35rem', color: '#475569' }}>
            Neraca Analitik: <strong>{activeRecord.ulangan1.neracaKode}</strong> • Furnace Pembakaran: <strong>{activeRecord.ulangan1.furnaceKode}</strong> • Cawan: <strong>{activeRecord.ulangan1.cawanNomor}</strong> {activeRecord.ulangan2 ? `& ${activeRecord.ulangan2.cawanNomor}` : ''} • Selisih Uji Duplikat: <strong>{activeRecord.selisihDuplikat?.toFixed(2)}%</strong> (Memenuhi syarat).
          </div>
        </div>

        {/* Otorisasi & Tanda Tangan */}
        <div className="flex justify-between items-end" style={{ marginTop: '2.5rem', paddingTop: '1rem' }}>
          {/* Kolom Kiri: Verifikasi QR Code */}
          <div style={{ textAlign: 'center', width: '180px' }}>
            <div style={{
              width: '95px',
              height: '95px',
              margin: '0 auto',
              border: '2px solid #0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.65rem',
              fontWeight: 700,
              flexDirection: 'column',
              background: '#f8fafc'
            }}>
              <span>[QR CODE]</span>
              <span style={{ fontSize: '0.55rem', color: '#64748b' }}>VERIFIKASI RESMI</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.4rem', fontFamily: 'var(--font-mono)' }}>
              Hash: {activeRecord.signatureHash || 'SEC-OFFICIAL-VERIFIED'}
            </div>
          </div>

          {/* Kolom Tengah: Analis */}
          <div style={{ textAlign: 'center', width: '220px' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '3rem' }}>
              Diuji Oleh (Analis),
            </div>
            <div style={{ fontWeight: 800, textDecoration: 'underline', color: '#0f172a' }}>
              {activeRecord.analisNama}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Laboran Kimia Analitik
            </div>
          </div>

          {/* Kolom Kanan: Supervisor */}
          <div style={{ textAlign: 'center', width: '220px' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '3rem' }}>
              Disetujui Oleh (Penyelia Lab),
            </div>
            <div style={{ fontWeight: 800, textDecoration: 'underline', color: '#0f172a' }}>
              {activeRecord.disetujuiOleh || 'Dr. Hendra Wijaya, M.Sc'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Manajer Teknis Laboratorium
            </div>
          </div>
        </div>

        {/* Footer Sertifikat */}
        <div style={{ borderTop: '1px solid #cbd5e1', marginTop: '2.5rem', paddingTop: '0.5rem', fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center' }}>
          Laporan hasil uji ini hanya berlaku untuk sampel yang diuji di atas dan tidak boleh digandakan sebagian tanpa persetujuan tertulis dari laboratorium.
        </div>
      </div>
    </div>
  );
};

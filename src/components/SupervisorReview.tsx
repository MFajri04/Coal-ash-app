import React, { useState, useEffect } from 'react';
import { labStore } from '../store';
import { AnalysisRecord } from '../types';
import { notify } from './NotificationModal';

interface SupervisorReviewProps {
  onApprovedOrRejected?: () => void;
  onOpenReport?: (analysisId: number) => void;
}

export const SupervisorReview: React.FC<SupervisorReviewProps> = ({ onApprovedOrRejected, onOpenReport }) => {
  const [, setTick] = useState(0);

  // Subscribe ke perubahan store agar UI langsung refresh saat data berubah
  useEffect(() => {
    const unsub = labStore.subscribe(() => setTick(t => t + 1));
    return unsub;
  }, []);

  const analyses = labStore.analyses;
  const samples = labStore.samples;
  const methods = labStore.methods;
  const currentUser = labStore.currentUser;

  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null);
  const [catatan, setCatatan] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const pendingAnalyses = analyses.filter(a => a.status === 'Menunggu review');
  const pastAnalyses = analyses.filter(a => a.status !== 'Menunggu review');

  const isSupervisorOrAdmin = labStore.canApproveAnalysis();

  const handleApprove = (record: AnalysisRecord) => {
    if (!isSupervisorOrAdmin) {
      notify.modal({
        type: 'warning',
        title: 'Akses Dibatasi (ISO 17025)',
        message: 'Hanya pengguna dengan peran "Supervisor" atau "Admin" yang berhak mengesahkan hasil analisis.',
        detail: 'Silakan gunakan akun Penyelia Lab untuk otorisasi dan penerbitan tanda tangan elektronik (E-Signature).'
      });
      return;
    }

    const ok = labStore.approveAnalysis(
      record.id, 
      catatan.trim() || 'Hasil uji telah diverifikasi dan memenuhi syarat standar ISO 17025.'
    );

    if (ok) {
      const sample = samples.find(s => s.id === record.sampleId);
      notify.modal({
        type: 'success',
        title: 'Hasil Uji Resmi Disetujui! 🛡️',
        message: `Hasil analisis kadar abu sampel ${sample?.kodeUnik || ''} telah disahkan oleh Supervisor.`,
        detail: `• Kode Sampel : ${sample?.kodeUnik || ''}\n• Penyetuju   : ${currentUser?.nama || 'Supervisor'}\n• E-Signature : SIG-${record.id}-${Date.now().toString(16).toUpperCase()}\n• Status Baru : Disetujui (Approved)\n\nSertifikat Hasil Uji (CoA) resmi berstandar KAN/ISO 17025 siap dicetak atau diunduh.`
      });
      setSuccessBanner(`✓ Sukses! Analisis sampel ${sample?.kodeUnik || ''} berhasil disetujui. Tanda tangan elektronik (E-Signature) telah diterbitkan.`);
      setSelectedRecord(null);
      setCatatan('');
      if (onApprovedOrRejected) onApprovedOrRejected();
    }
  };

  const handleReject = () => {
    if (!selectedRecord) return;
    if (!rejectReason.trim()) {
      notify.error('Validasi Penolakan Gagal', 'Alasan penolakan wajib diisi untuk rekaman jejak audit mutu ISO 17025!');
      return;
    }

    const ok = labStore.rejectAnalysis(selectedRecord.id, rejectReason.trim());
    if (ok) {
      const sample = samples.find(s => s.id === selectedRecord.sampleId);
      notify.modal({
        type: 'warning',
        title: 'Sampel Dikembalikan untuk Pengujian Ulang',
        message: `Hasil uji sampel ${sample?.kodeUnik || ''} ditolak oleh Supervisor dan dikembalikan ke Analis.`,
        detail: `• Alasan Penolakan : ${rejectReason.trim()}\n• Status Baru       : Ditolak/Ulang\n• Tindakan Analis   : Wajib melakukan preparasi dan penimbangan ulang.`
      });
      setSuccessBanner(`✕ Analisis sampel ${sample?.kodeUnik || ''} ditolak dan dikembalikan ke analis untuk pengujian ulang.`);
      setShowRejectModal(false);
      setSelectedRecord(null);
      setRejectReason('');
      if (onApprovedOrRejected) onApprovedOrRejected();
    }
  };

  const handleSwitchToSupervisor = () => {
    const spvUser = labStore.users.find(u => u.peran === 'Supervisor');
    if (spvUser) {
      labStore.switchUserQuick(spvUser.id);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Banner Sukses Notifikasi */}
      {successBanner && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '1.25rem' }}>🎉</span>
            <strong style={{ color: '#34d399' }}>{successBanner}</strong>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="btn btn-sm btn-secondary">
            Tutup
          </button>
        </div>
      )}

      {/* Banner jika belum login sebagai Supervisor/Admin */}
      {!isSupervisorOrAdmin && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
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
              <strong style={{ color: 'var(--warning)' }}>Akses Otorisasi Terbatas:</strong>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Anda saat ini masuk sebagai <strong>{currentUser?.nama || 'Tamu'} ({currentUser?.peran || 'None'})</strong>. Untuk menyetujui atau menolak hasil, Anda harus memiliki peran <strong>Supervisor</strong> atau <strong>Admin</strong>.
              </p>
            </div>
          </div>
          <button onClick={handleSwitchToSupervisor} className="btn btn-sm btn-primary" style={{ whiteSpace: 'nowrap' }}>
            🔑 Beralih ke Supervisor (Dr. Hendra)
          </button>
        </div>
      )}

      {/* Daftar Menunggu Review */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0 }}>Antrean Persetujuan Penyelia Lab ({pendingAnalyses.length})</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
              Verifikasi ketertelusuran data mentah penimbangan, konstan abu, dan repeatability duplikat (FR-090 s/d FR-093)
            </p>
          </div>
        </div>

        {pendingAnalyses.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '2.5rem' }}>🎉</span>
            <p style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>Tidak ada analisis yang menunggu verifikasi saat ini.</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Seluruh sampel telah disetujui atau sedang dalam proses penimbangan oleh analis.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="lab-table">
              <thead>
                <tr>
                  <th>Kode Sampel</th>
                  <th>Sumber</th>
                  <th>Metode</th>
                  <th>Analis</th>
                  <th>U-1 (%)</th>
                  <th>U-2 (%)</th>
                  <th>Selisih Duplo</th>
                  <th>Kadar Abu Rata2</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pendingAnalyses.map(record => {
                  const sample = samples.find(s => s.id === record.sampleId);
                  const method = methods.find(m => m.id === record.methodId);

                  return (
                    <tr key={record.id}>
                      <td className="font-mono" style={{ fontWeight: 700, color: '#e0e7ff' }}>
                        {sample?.kodeUnik || `Sampel #${record.sampleId}`}
                      </td>
                      <td>{sample?.sumber}</td>
                      <td>{method?.nama.split(' ')[0]}</td>
                      <td>{record.analisNama}</td>
                      <td className="font-mono">{record.ulangan1.kadarAbuPercent?.toFixed(2)}%</td>
                      <td className="font-mono">{record.ulangan2?.kadarAbuPercent?.toFixed(2) || '-'}%</td>
                      <td className="font-mono">
                        <span className={`badge ${record.isRepeatabilityPass ? 'badge-success' : 'badge-danger'}`}>
                          {record.selisihDuplikat?.toFixed(2)}%
                        </span>
                      </td>
                      <td className="font-mono text-gradient" style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                        {record.rataRataKadarAbu?.toFixed(2)}%
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="btn btn-sm btn-primary"
                            title="Audit data mentah secara detail"
                          >
                            🔍 Audit & Detail
                          </button>
                          {isSupervisorOrAdmin && (
                            <button
                              onClick={() => handleApprove(record)}
                              className="btn btn-sm btn-success"
                              title="Setujui langsung (Quick Approve)"
                            >
                              ✓ Setujui
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Riwayat Persetujuan Sebelumnya */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h4 style={{ marginBottom: '1rem' }}>Riwayat Hasil Uji Yang Telah Disetujui / Ditolak ({pastAnalyses.length})</h4>
        <div className="table-responsive">
          <table className="lab-table">
            <thead>
              <tr>
                <th>Kode Sampel</th>
                <th>Sumber</th>
                <th>Hasil Akhir (adb)</th>
                <th>Dry Basis (db)</th>
                <th>Status</th>
                <th>Diverifikasi Oleh</th>
                <th>Waktu Persetujuan</th>
                <th>Signature Hash</th>
              </tr>
            </thead>
            <tbody>
              {pastAnalyses.map(record => {
                const sample = samples.find(s => s.id === record.sampleId);
                return (
                  <tr key={record.id}>
                    <td className="font-mono" style={{ fontWeight: 700 }}>{sample?.kodeUnik}</td>
                    <td>{sample?.sumber}</td>
                    <td className="font-mono" style={{ fontWeight: 700, color: '#38bdf8' }}>{record.rataRataKadarAbu?.toFixed(2)}%</td>
                    <td className="font-mono">{record.kadarAbuDb?.toFixed(2)}%</td>
                    <td>
                      <span className={`badge ${record.status === 'Disetujui' ? 'badge-success' : 'badge-danger'}`}>
                        {record.status}
                      </span>
                    </td>
                    <td>{record.disetujuiOleh || '-'}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{record.tanggalDisetujui || '-'}</td>
                    <td className="font-mono" style={{ fontSize: '0.725rem', color: '#a5b4fc' }}>
                      {record.signatureHash || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Audit Raw Data & Approval (FR-090 & FR-093) */}
      {selectedRecord && (
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
          padding: '1.5rem'
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '850px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', background: '#0b1120', border: '1px solid var(--border-glow)' }}>
            <div className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0 }}>Audit Rekaman Data Mentah Pengujian</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                  Sampel: <strong>{samples.find(s => s.id === selectedRecord.sampleId)?.kodeUnik}</strong> • Analis: <strong>{selectedRecord.analisNama}</strong>
                </p>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="btn btn-sm btn-secondary">✕</button>
            </div>

            {/* Grid Raw Data W1, W2, W3 */}
            <div className="grid grid-cols-2 gap-4">
              {/* Ulangan 1 Raw */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ color: 'var(--primary-light)', margin: '0 0 0.75rem 0' }}>Data Mentah Ulangan 1</h4>
                <div className="flex flex-col gap-2 font-mono" style={{ fontSize: '0.85rem' }}>
                  <div className="flex justify-between"><span>Cawan:</span><strong>{selectedRecord.ulangan1.cawanNomor}</strong></div>
                  <div className="flex justify-between"><span>W1 (Cawan Kosong):</span><strong>{selectedRecord.ulangan1.w1.toFixed(4)} g</strong></div>
                  <div className="flex justify-between"><span>W2 (Cawan + Sampel):</span><strong>{selectedRecord.ulangan1.w2.toFixed(4)} g</strong></div>
                  <div className="flex justify-between"><span>Berat Sampel:</span><strong style={{ color: 'var(--success)' }}>{selectedRecord.ulangan1.beratSampel.toFixed(4)} g</strong></div>
                  <div className="flex justify-between"><span>W3_1 (Abu Timbang 1):</span><strong>{selectedRecord.ulangan1.w3_1?.toFixed(4)} g</strong></div>
                  <div className="flex justify-between"><span>W3_2 (Abu Timbang 2):</span><strong>{selectedRecord.ulangan1.w3_2?.toFixed(4)} g</strong></div>
                  <div className="flex justify-between"><span>Selisih Konstan:</span><strong style={{ color: 'var(--success)' }}>{selectedRecord.ulangan1.selisihKonstan?.toFixed(4)} g</strong></div>
                  <div className="flex justify-between"><span>Kadar Abu U-1:</span><strong style={{ color: '#38bdf8' }}>{selectedRecord.ulangan1.kadarAbuPercent?.toFixed(2)} %</strong></div>
                  <div className="flex justify-between"><span>Alat Timbang:</span><span>{selectedRecord.ulangan1.neracaKode} ({selectedRecord.ulangan1.inputMode})</span></div>
                </div>
              </div>

              {/* Ulangan 2 Raw */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ color: '#a855f7', margin: '0 0 0.75rem 0' }}>Data Mentah Ulangan 2 (Duplo)</h4>
                {selectedRecord.ulangan2 ? (
                  <div className="flex flex-col gap-2 font-mono" style={{ fontSize: '0.85rem' }}>
                    <div className="flex justify-between"><span>Cawan:</span><strong>{selectedRecord.ulangan2.cawanNomor}</strong></div>
                    <div className="flex justify-between"><span>W1 (Cawan Kosong):</span><strong>{selectedRecord.ulangan2.w1.toFixed(4)} g</strong></div>
                    <div className="flex justify-between"><span>W2 (Cawan + Sampel):</span><strong>{selectedRecord.ulangan2.w2.toFixed(4)} g</strong></div>
                    <div className="flex justify-between"><span>Berat Sampel:</span><strong style={{ color: 'var(--success)' }}>{selectedRecord.ulangan2.beratSampel.toFixed(4)} g</strong></div>
                    <div className="flex justify-between"><span>W3_1 (Abu Timbang 1):</span><strong>{selectedRecord.ulangan2.w3_1?.toFixed(4)} g</strong></div>
                    <div className="flex justify-between"><span>W3_2 (Abu Timbang 2):</span><strong>{selectedRecord.ulangan2.w3_2?.toFixed(4)} g</strong></div>
                    <div className="flex justify-between"><span>Selisih Konstan:</span><strong style={{ color: 'var(--success)' }}>{selectedRecord.ulangan2.selisihKonstan?.toFixed(4)} g</strong></div>
                    <div className="flex justify-between"><span>Kadar Abu U-2:</span><strong style={{ color: '#a855f7' }}>{selectedRecord.ulangan2.kadarAbuPercent?.toFixed(2)} %</strong></div>
                    <div className="flex justify-between"><span>Alat Timbang:</span><span>{selectedRecord.ulangan2.neracaKode}</span></div>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>Tidak ada ulangan ke-2.</p>
                )}
              </div>
            </div>

            {/* Rekap Nilai Akhir & Repeatability */}
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', border: '1px solid var(--border-glow)' }}>
              <div className="flex justify-between items-center">
                <div>
                  <span>Selisih Repeatability: <strong>{selectedRecord.selisihDuplikat?.toFixed(2)}%</strong></span>
                  <span className={`badge ${selectedRecord.isRepeatabilityPass ? 'badge-success' : 'badge-danger'}`} style={{ marginLeft: '0.5rem' }}>
                    {selectedRecord.isRepeatabilityPass ? 'Lolos Toleransi' : 'Di Luar Batas'}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Hasil Rata-rata: </span>
                  <strong className="font-mono text-gradient" style={{ fontSize: '1.5rem' }}>{selectedRecord.rataRataKadarAbu?.toFixed(2)}%</strong>
                </div>
              </div>
            </div>

            {/* Input Catatan Supervisor */}
            <div className="form-group" style={{ marginTop: '1.25rem' }}>
              <label className="form-label">Catatan Verifikasi Supervisor</label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="Catatan peninjauan mutu, kesesuaian SOP, dll..."
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <button
                onClick={() => setShowRejectModal(true)}
                className="btn btn-danger"
                disabled={!isSupervisorOrAdmin}
              >
                ✕ Tolak & Ulangi Uji
              </button>

              <div className="flex gap-2">
                <button onClick={() => setSelectedRecord(null)} className="btn btn-secondary">
                  Tutup
                </button>
                <button
                  onClick={() => handleApprove(selectedRecord)}
                  className="btn btn-success"
                  disabled={!isSupervisorOrAdmin}
                >
                  ✓ Setujui & Terbitkan E-Signature
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Input Alasan Tolak (FR-091) */}
      {showRejectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div className="glass-panel" style={{ width: '450px', padding: '1.75rem', background: '#0f172a', border: '1px solid rgba(239, 68, 68, 0.5)' }}>
            <h3 style={{ color: 'var(--danger)', margin: '0 0 0.5rem 0' }}>Alasan Penolakan Analisis</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Sesuai aturan mutu ISO 17025 (FR-091), penolakan wajib mencantumkan alasan teknis untuk ketertelusuran audit.
            </p>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Contoh: Selisih duplikat melebihi 0.30%, indikasi abu belum konstan sempurna..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end gap-2" style={{ marginTop: '1.25rem' }}>
              <button onClick={() => setShowRejectModal(false)} className="btn btn-secondary btn-sm">
                Batal
              </button>
              <button onClick={handleReject} className="btn btn-danger btn-sm">
                Konfirmasi Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

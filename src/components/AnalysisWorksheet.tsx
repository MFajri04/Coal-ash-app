import React, { useState, useEffect } from 'react';
import { labStore } from '../store';
import { Sample, Method, Balance, Furnace, Crucible, AnalysisRecord, WeighingRun } from '../types';
import { notify } from './NotificationModal';

interface AnalysisWorksheetProps {
  preselectedSample?: Sample | null;
  onAnalysisSaved?: () => void;
}

export const AnalysisWorksheet: React.FC<AnalysisWorksheetProps> = ({ preselectedSample, onAnalysisSaved }) => {
  const samples = labStore.samples;
  const methods = labStore.methods;
  const balances = labStore.balances;
  const furnaces = labStore.furnaces;
  const crucibles = labStore.crucibles;

  // State Pilihan
  const [selectedSampleId, setSelectedSampleId] = useState<number>(
    preselectedSample ? preselectedSample.id : (samples[0]?.id || 0)
  );
  const [selectedMethodId, setSelectedMethodId] = useState<number>(methods[0]?.id || 1);
  const [selectedBalanceId, setSelectedBalanceId] = useState<number>(balances[0]?.id || 1);
  const [selectedFurnaceId, setSelectedFurnaceId] = useState<number>(furnaces[0]?.id || 1);

  // Tab Ulangan aktif (Ulangan 1 atau Ulangan 2 / Duplo)
  const [activeRunTab, setActiveRunTab] = useState<'U1' | 'U2'>('U1');

  // Ulangan 1 Form State
  const [u1Cawan, setU1Cawan] = useState('C-01');
  const [u1W1, setU1W1] = useState<string>('15.2345');
  const [u1W2, setU1W2] = useState<string>('16.2345');
  const [u1W3_1, setU1W3_1] = useState<string>('15.3347');
  const [u1W3_2, setU1W3_2] = useState<string>('15.3345');
  const [u1InputMode, setU1InputMode] = useState<'Manual' | 'Neraca Digital'>('Neraca Digital');

  // Ulangan 2 Form State (Duplo)
  const [u2Enabled, setU2Enabled] = useState(true);
  const [u2Cawan, setU2Cawan] = useState('C-02');
  const [u2W1, setU2W1] = useState<string>('15.8920');
  const [u2W2, setU2W2] = useState<string>('16.8918');
  const [u2W3_1, setU2W3_1] = useState<string>('15.9922');
  const [u2W3_2, setU2W3_2] = useState<string>('15.9920');
  const [u2InputMode, setU2InputMode] = useState<'Manual' | 'Neraca Digital'>('Neraca Digital');

  // Furnace Log
  const [furnaceJamMasuk, setFurnaceJamMasuk] = useState('09:00');
  const [furnaceJamKeluar, setFurnaceJamKeluar] = useState('11:30');
  const [catatanAnalis, setCatatanAnalis] = useState('');

  // Timer Desikator
  const [desiccatorTimer, setDesiccatorTimer] = useState<number | null>(null);

  const selectedSample = samples.find(s => s.id === selectedSampleId);
  const selectedMethod = methods.find(m => m.id === selectedMethodId) || methods[0];
  const selectedBalance = balances.find(b => b.id === selectedBalanceId) || balances[0];

  useEffect(() => {
    if (preselectedSample) {
      setSelectedSampleId(preselectedSample.id);
    }
  }, [preselectedSample]);

  // Kalkulasi Ulangan 1
  const u1W1Num = parseFloat(u1W1) || 0;
  const u1W2Num = parseFloat(u1W2) || 0;
  const u1SampleWeight = labStore.calcSampleWeight(u1W1Num, u1W2Num);
  const u1W3_1Num = parseFloat(u1W3_1) || 0;
  const u1W3_2Num = parseFloat(u1W3_2) || 0;
  const u1ConstCheck = labStore.checkConstantWeight(u1W3_1Num, u1W3_2Num, selectedMethod.batasBeratKonstan);
  const u1AshWeight = labStore.calcAshWeight(u1W1Num, u1W3_2Num || u1W3_1Num);
  const u1AshPercent = labStore.calcAshPercent(u1SampleWeight, u1AshWeight);

  // Cek Toleransi Berat Sampel U1
  const minSampleWeight = selectedMethod.targetBeratSampel - selectedMethod.toleransi;
  const maxSampleWeight = selectedMethod.targetBeratSampel + selectedMethod.toleransi;
  const isU1SampleWeightValid = u1SampleWeight >= minSampleWeight && u1SampleWeight <= maxSampleWeight;

  // Kalkulasi Ulangan 2
  const u2W1Num = parseFloat(u2W1) || 0;
  const u2W2Num = parseFloat(u2W2) || 0;
  const u2SampleWeight = labStore.calcSampleWeight(u2W1Num, u2W2Num);
  const u2W3_1Num = parseFloat(u2W3_1) || 0;
  const u2W3_2Num = parseFloat(u2W3_2) || 0;
  const u2ConstCheck = labStore.checkConstantWeight(u2W3_1Num, u2W3_2Num, selectedMethod.batasBeratKonstan);
  const u2AshWeight = labStore.calcAshWeight(u2W1Num, u2W3_2Num || u2W3_1Num);
  const u2AshPercent = labStore.calcAshPercent(u2SampleWeight, u2AshWeight);
  const isU2SampleWeightValid = u2SampleWeight >= minSampleWeight && u2SampleWeight <= maxSampleWeight;

  // Kontrol Mutu Repeatability (U1 vs U2)
  const repeatabilityQC = u2Enabled && u1AshPercent > 0 && u2AshPercent > 0
    ? labStore.checkRepeatability(u1AshPercent, u2AshPercent, selectedMethod.batasRepeatability)
    : null;

  // Konversi Basis (adb -> db & ar)
  const finalAshAdb = repeatabilityQC ? repeatabilityQC.avg : u1AshPercent;
  const finalAshDb = selectedSample ? labStore.convertBasis(finalAshAdb, selectedSample.moistureAdb, 'db') : 0;
  const finalAshAr = selectedSample ? labStore.convertBasis(finalAshAdb, selectedSample.moistureAdb, 'ar', selectedSample.moistureAr) : 0;

  // Simulasi Baca Neraca Stabil (FR-040 & FR-041)
  const handleSimulateBalance = (target: 'u1W1' | 'u1W2' | 'u1W3_1' | 'u1W3_2' | 'u2W1' | 'u2W2' | 'u2W3_1' | 'u2W3_2') => {
    if (selectedBalance.status === 'Kedaluwarsa') {
      notify.modal({
        type: 'warning',
        title: 'Neraca Kedaluwarsa Kalibrasi',
        message: `Neraca ${selectedBalance.kode} telah melewati batas jatuh tempo kalibrasi!`,
        detail: `Sesuai klausul 6.4 ISO/IEC 17025, neraca berstatus 'Kedaluwarsa' dilarang untuk penimbangan resmi. Silakan hubungi koordinator kalibrasi lab.`
      });
      return;
    }

    let val = 0;
    if (target.includes('W1')) {
      val = 15.0000 + Math.random() * 2;
    } else if (target.includes('W2')) {
      // W2 = W1 + sekitar 1 gram
      const baseW1 = target.startsWith('u1') ? u1W1Num : u2W1Num;
      val = (baseW1 || 15.2345) + (selectedMethod.targetBeratSampel + (Math.random() * 0.02 - 0.01));
    } else {
      // W3 = W1 + abu sekitar 0.06 - 0.12 g
      const baseW1 = target.startsWith('u1') ? u1W1Num : u2W1Num;
      val = (baseW1 || 15.2345) + (0.05 + Math.random() * 0.08);
    }

    const strVal = val.toFixed(4);
    if (target === 'u1W1') setU1W1(strVal);
    if (target === 'u1W2') setU1W2(strVal);
    if (target === 'u1W3_1') setU1W3_1(strVal);
    if (target === 'u1W3_2') setU1W3_2(strVal);
    if (target === 'u2W1') setU2W1(strVal);
    if (target === 'u2W2') setU2W2(strVal);
    if (target === 'u2W3_1') setU2W3_1(strVal);
    if (target === 'u2W3_2') setU2W3_2(strVal);

    notify.info('📡 Pembacaan RS232 Berhasil', `Nilai bobot ${strVal} g berhasil diterima dari ${selectedBalance.kode}.`, undefined, 2500);
  };

  const handleStartDesiccatorTimer = () => {
    setDesiccatorTimer(30); // 30 detik demo simulasi 30 menit
    notify.info('⏱️ Timer Desikator Aktif', 'Waktu pendinginan cawan dalam desikator dimulai (simulasi 30 menit).', undefined, 3000);
    const interval = setInterval(() => {
      setDesiccatorTimer(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          notify.modal({
            type: 'info',
            title: '🔔 Pengingat Desikator Lab',
            message: 'Waktu pendinginan cawan dalam desikator telah mencukupi (20-30 menit)!',
            detail: 'Suhu cawan telah seimbang dengan suhu ruang timbang. Sampel batubara siap ditimbang untuk pembacaan W3.'
          });
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const proceedSaveRecord = () => {
    if (!selectedSample) return;

    const run1: WeighingRun = {
      w1: u1W1Num,
      w2: u1W2Num,
      beratSampel: u1SampleWeight,
      w3_1: u1W3_1Num,
      w3_2: u1W3_2Num,
      selisihKonstan: u1ConstCheck.diff,
      isKonstan: u1ConstCheck.isPass,
      beratAbu: u1AshWeight,
      kadarAbuPercent: u1AshPercent,
      cawanNomor: u1Cawan,
      neracaKode: selectedBalance.kode,
      furnaceKode: furnaces.find(f => f.id === selectedFurnaceId)?.kode || 'FRN-01',
      waktuW1: '2026-10-11 08:30',
      waktuW2: '2026-10-11 08:35',
      waktuW3: '2026-10-11 13:00',
      inputMode: u1InputMode
    };

    let run2: WeighingRun | undefined = undefined;
    if (u2Enabled) {
      run2 = {
        w1: u2W1Num,
        w2: u2W2Num,
        beratSampel: u2SampleWeight,
        w3_1: u2W3_1Num,
        w3_2: u2W3_2Num,
        selisihKonstan: u2ConstCheck.diff,
        isKonstan: u2ConstCheck.isPass,
        beratAbu: u2AshWeight,
        kadarAbuPercent: u2AshPercent,
        cawanNomor: u2Cawan,
        neracaKode: selectedBalance.kode,
        furnaceKode: furnaces.find(f => f.id === selectedFurnaceId)?.kode || 'FRN-01',
        waktuW1: '2026-10-11 08:32',
        waktuW2: '2026-10-11 08:38',
        waktuW3: '2026-10-11 13:05',
        inputMode: u2InputMode
      };
    }

    const record: AnalysisRecord = {
      id: Date.now(),
      sampleId: selectedSample.id,
      methodId: selectedMethod.id,
      analisNama: labStore.currentUser ? labStore.currentUser.nama : 'Budi Pratama, S.Si',
      tanggalMulai: new Date().toISOString().replace('T', ' ').substring(0, 16),
      ulangan1: run1,
      ulangan2: run2,
      selisihDuplikat: repeatabilityQC ? repeatabilityQC.diff : 0,
      isRepeatabilityPass: repeatabilityQC ? repeatabilityQC.isPass : true,
      rataRataKadarAbu: finalAshAdb,
      kadarAbuDb: finalAshDb,
      kadarAbuAr: finalAshAr,
      status: 'Menunggu review',
      catatanAnalis: catatanAnalis.trim() || 'Pengujian kadar abu selesai, siap diverifikasi supervisor.',
      furnaceJamMasuk,
      furnaceJamKeluar,
      furnaceSuhuAktual: selectedMethod.suhu
    };

    labStore.saveAnalysis(record);
    notify.modal({
      type: 'success',
      title: 'Data Analisis Berhasil Disimpan! 🎉',
      message: `Hasil pengujian kadar abu sampel ${selectedSample.kodeUnik} telah disimpan dan diteruskan ke Penyelia Lab.`,
      detail: `• Kode Sampel   : ${selectedSample.kodeUnik}\n• Rata-rata Abu : ${finalAshAdb.toFixed(2)} % (adb)\n• Uji Duplo     : ${repeatabilityQC ? (repeatabilityQC.isPass ? 'MEMENUHI SYARAT (r ≤ 0.30%)' : 'PERINGATAN: DILUAR BATAS') : 'Ulangan Tunggal'}\n• Status Data   : Menunggu Review Supervisor\n• Waktu Rekam   : ${new Date().toLocaleTimeString()} WIB\n\nData telah dikunci dan siap diotorisasi di menu 'Review & Approval'.`
    });
    if (onAnalysisSaved) onAnalysisSaved();
  };

  const handleSaveAnalysis = () => {
    if (!selectedSample) {
      notify.error('Peringatan Input Data', 'Pilih sampel batubara yang akan diuji terlebih dahulu!');
      return;
    }

    if (!isU1SampleWeightValid) {
      notify.modal({
        type: 'error',
        title: 'Kesalahan Input Bobot Sampel',
        message: `Bobot sampel Ulangan 1 (${u1SampleWeight.toFixed(4)} g) berada di luar batas toleransi metode ${selectedMethod.nama}!`,
        detail: `• Batas Minimum : ${minSampleWeight.toFixed(4)} g\n• Batas Maksimum: ${maxSampleWeight.toFixed(4)} g\n• Bobot Terukur : ${u1SampleWeight.toFixed(4)} g\n\nSilakan koreksi bobot sampel batubara ke rentang target 1.0000 ± 0.1000 g.`
      });
      return;
    }

    if (u2Enabled && !isU2SampleWeightValid) {
      notify.modal({
        type: 'error',
        title: 'Kesalahan Input Bobot Sampel Ulangan 2',
        message: `Bobot sampel Ulangan 2 (${u2SampleWeight.toFixed(4)} g) di luar batas toleransi metode!`,
        detail: `• Rentang Target: ${minSampleWeight.toFixed(4)} - ${maxSampleWeight.toFixed(4)} g\n• Bobot Terukur : ${u2SampleWeight.toFixed(4)} g\n\nSilakan sesuaikan penimbangan sampel sebelum menyimpan.`
      });
      return;
    }

    if (!u1ConstCheck.isPass) {
      notify.modal({
        type: 'warning',
        title: 'Peringatan Bobot Konstan W3',
        message: 'Selisih penimbangan abu Ulangan 1 belum mencapai batas konstan (≤ 0.0005 g)!',
        detail: `• Selisih W3-1 & W3-2 : ${u1ConstCheck.diff.toFixed(4)} g\n• Batas Maksimal       : ${selectedMethod.batasBeratKonstan.toFixed(4)} g\n\nSesuai SOP ASTM D3174, disarankan memanaskan kembali sampel selama 15-30 menit di furnace. Apakah Anda ingin tetap menyimpan sebagai draft?`,
        showCancel: true,
        cancelText: 'Koreksi Kembali',
        confirmText: 'Tetap Simpan',
        onConfirm: () => {
          proceedSaveRecord();
        }
      });
      return;
    }

    proceedSaveRecord();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Bar Parameter & Konfigurasi Standar */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div className="grid grid-cols-4 gap-4">
          <div className="form-group">
            <label className="form-label">Sampel Yang Diuji</label>
            <select
              className="form-input font-mono"
              value={selectedSampleId}
              onChange={e => setSelectedSampleId(Number(e.target.value))}
            >
              {samples.map(s => (
                <option key={s.id} value={s.id}>
                  {s.kodeUnik} - {s.sumber} ({s.status})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Metode Standar Uji</label>
            <select
              className="form-input"
              value={selectedMethodId}
              onChange={e => setSelectedMethodId(Number(e.target.value))}
            >
              {methods.map(m => (
                <option key={m.id} value={m.id}>
                  {m.nama} (Target {m.targetBeratSampel}g ± {m.toleransi}g)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Neraca Analitik</label>
            <select
              className="form-input"
              value={selectedBalanceId}
              onChange={e => setSelectedBalanceId(Number(e.target.value))}
            >
              {balances.map(b => (
                <option key={b.id} value={b.id} disabled={b.status === 'Kedaluwarsa'}>
                  {b.kode} - {b.nama} {b.status === 'Kedaluwarsa' ? '(KEDALUWARSA - NONAKTIF)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Furnace Pembakaran</label>
            <select
              className="form-input"
              value={selectedFurnaceId}
              onChange={e => setSelectedFurnaceId(Number(e.target.value))}
            >
              {furnaces.map(f => (
                <option key={f.id} value={f.id}>
                  {f.kode} - {f.nama}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Info Parameter Metode Terpilih */}
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          background: 'rgba(99, 102, 241, 0.08)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-glow)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          fontSize: '0.825rem'
        }}>
          <div>
            <strong>Parameter SOP:</strong> Target Bobot: <span className="font-mono text-gradient">{selectedMethod.targetBeratSampel.toFixed(4)} g ± {selectedMethod.toleransi.toFixed(4)} g</span>
            {' • '}Batas Konstan: <span className="font-mono">≤ {selectedMethod.batasBeratKonstan.toFixed(4)} g</span>
            {' • '}Batas Repeatability Duplikat: <span className="font-mono">≤ {selectedMethod.batasRepeatability.toFixed(2)} %</span>
          </div>
          <div>
            Suhu Furnace: <strong>{selectedMethod.suhu}°C</strong> • Durasi: <strong>{selectedMethod.durasiMenit} menit</strong>
          </div>
        </div>
      </div>

      {/* Main Worksheet Layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* Kolom Kiri: Form Penimbangan W1, W2, W3 (2 columns) */}
        <div className="glass-panel" style={{ gridColumn: 'span 2', padding: '1.5rem' }}>
          {/* Tabs Ulangan 1 vs Ulangan 2 */}
          <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveRunTab('U1')}
                className={`btn btn-sm ${activeRunTab === 'U1' ? 'btn-primary' : 'btn-secondary'}`}
              >
                🔬 Ulangan 1 (U-1)
              </button>
              <button
                onClick={() => setActiveRunTab('U2')}
                className={`btn btn-sm ${activeRunTab === 'U2' ? 'btn-primary' : 'btn-secondary'}`}
              >
                🔬 Ulangan 2 / Duplo (U-2)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={u2Enabled}
                  onChange={e => setU2Enabled(e.target.checked)}
                  style={{ marginRight: '0.4rem' }}
                />
                Wajib Duplo (ISO 17025)
              </label>
            </div>
          </div>

          {/* Form Content: Ulangan 1 */}
          {activeRunTab === 'U1' && (
            <div className="flex flex-col gap-5">
              {/* Step 1: W1 & W2 */}
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, color: 'var(--primary-light)' }}>
                    Tahap 1: Penimbangan Sampel Awal (W1 & W2)
                  </h4>
                  <div className="flex gap-2">
                    <span className="badge badge-neutral">Cawan U-1</span>
                    <select className="form-input" style={{ width: '110px', padding: '0.2rem 0.5rem' }} value={u1Cawan} onChange={e => setU1Cawan(e.target.value)}>
                      {crucibles.map(c => (
                        <option key={c.id} value={c.nomor}>{c.nomor} ({c.status})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">W1: Berat Cawan Kosong (g)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.0001"
                        className="form-input font-mono"
                        placeholder="15.0000"
                        value={u1W1}
                        onChange={e => setU1W1(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => handleSimulateBalance('u1W1')}
                        className="btn btn-sm btn-secondary"
                        title="Baca otomatis via RS232/USB"
                      >
                        📡 BACA
                      </button>
                    </div>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      Resolusi 4 desimal (0.0001 g)
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">W2: Cawan + Sampel (g)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.0001"
                        className="form-input font-mono"
                        placeholder="16.0000"
                        value={u1W2}
                        onChange={e => setU1W2(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => handleSimulateBalance('u1W2')}
                        className="btn btn-sm btn-secondary"
                        title="Baca otomatis via RS232/USB"
                      >
                        📡 BACA
                      </button>
                    </div>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      Target: W1 + 1.0000 g
                    </span>
                  </div>
                </div>

                {/* Live Feedback Berat Sampel */}
                {u1SampleWeight > 0 && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: isU1SampleWeightValid ? 'var(--success-bg)' : 'var(--danger-bg)',
                    border: `1px solid ${isU1SampleWeightValid ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <strong style={{ color: isU1SampleWeightValid ? 'var(--success)' : 'var(--danger)', fontSize: '0.95rem' }}>
                        Berat Sampel (W2 - W1): {u1SampleWeight.toFixed(4)} g
                      </strong>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Rentang Diterima: {minSampleWeight.toFixed(4)} g s/d {maxSampleWeight.toFixed(4)} g
                      </p>
                    </div>
                    <span className={`badge ${isU1SampleWeightValid ? 'badge-success' : 'badge-danger'}`}>
                      {isU1SampleWeightValid ? '✓ MEMENUHI TOLERANSI' : '✕ DI LUAR TOLERANSI'}
                    </span>
                  </div>
                )}
              </div>

              {/* Step 2: Pembakaran Furnace & Pendinginan */}
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, color: '#38bdf8' }}>
                    Tahap 2: Pembakaran & Pendinginan Desikator
                  </h4>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleStartDesiccatorTimer}
                      className="btn btn-sm btn-secondary"
                      style={{ color: '#38bdf8' }}
                    >
                      ⏱️ {desiccatorTimer !== null ? `Pendinginan: ${desiccatorTimer}s` : 'Mulai Timer Desikator'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Jam Masuk Furnace</label>
                    <input
                      type="time"
                      className="form-input"
                      value={furnaceJamMasuk}
                      onChange={e => setFurnaceJamMasuk(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Jam Keluar Furnace</label>
                    <input
                      type="time"
                      className="form-input"
                      value={furnaceJamKeluar}
                      onChange={e => setFurnaceJamKeluar(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: W3 & Uji Berat Konstan */}
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, color: '#a855f7' }}>
                    Tahap 3: Penimbangan Abu & Uji Berat Konstan (W3)
                  </h4>
                  <span className="badge badge-info">Batas: ≤ {selectedMethod.batasBeratKonstan.toFixed(4)} g</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">W3_1: Penimbangan Abu ke-1 (g)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.0001"
                        className="form-input font-mono"
                        placeholder="15.3347"
                        value={u1W3_1}
                        onChange={e => setU1W3_1(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => handleSimulateBalance('u1W3_1')}
                        className="btn btn-sm btn-secondary"
                      >
                        📡 BACA
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">W3_2: Penimbangan Abu ke-2 / Ulang (g)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.0001"
                        className="form-input font-mono"
                        placeholder="15.3345"
                        value={u1W3_2}
                        onChange={e => setU1W3_2(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => handleSimulateBalance('u1W3_2')}
                        className="btn btn-sm btn-secondary"
                      >
                        📡 BACA
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Feedback Berat Konstan */}
                {u1W3_1Num > 0 && u1W3_2Num > 0 && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: u1ConstCheck.isPass ? 'var(--success-bg)' : 'var(--warning-bg)',
                    border: `1px solid ${u1ConstCheck.isPass ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <strong style={{ color: u1ConstCheck.isPass ? 'var(--success)' : 'var(--warning)', fontSize: '0.95rem' }}>
                        Selisih Berat Konstan: {u1ConstCheck.diff.toFixed(4)} g
                      </strong>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Berat Abu = (W3_2 - W1) = {u1AshWeight.toFixed(4)} g
                      </p>
                    </div>
                    <span className={`badge ${u1ConstCheck.isPass ? 'badge-success' : 'badge-warning'}`}>
                      {u1ConstCheck.isPass ? '✓ BERAT KONSTAN TERCAPAI' : '⚠️ BELUM KONSTAN (BAKAR ULANG)'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Content: Ulangan 2 / Duplo */}
          {activeRunTab === 'U2' && (
            <div className="flex flex-col gap-5">
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, color: 'var(--primary-light)' }}>
                    Tahap 1: Penimbangan Sampel Ulangan 2 (W1 & W2)
                  </h4>
                  <div className="flex gap-2">
                    <span className="badge badge-neutral">Cawan U-2</span>
                    <select className="form-input" style={{ width: '110px', padding: '0.2rem 0.5rem' }} value={u2Cawan} onChange={e => setU2Cawan(e.target.value)}>
                      {crucibles.map(c => (
                        <option key={c.id} value={c.nomor}>{c.nomor} ({c.status})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">W1: Berat Cawan Kosong (g)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.0001"
                        className="form-input font-mono"
                        value={u2W1}
                        onChange={e => setU2W1(e.target.value)}
                      />
                      <button type="button" onClick={() => handleSimulateBalance('u2W1')} className="btn btn-sm btn-secondary">📡 BACA</button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">W2: Cawan + Sampel (g)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.0001"
                        className="form-input font-mono"
                        value={u2W2}
                        onChange={e => setU2W2(e.target.value)}
                      />
                      <button type="button" onClick={() => handleSimulateBalance('u2W2')} className="btn btn-sm btn-secondary">📡 BACA</button>
                    </div>
                  </div>
                </div>

                {u2SampleWeight > 0 && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: isU2SampleWeightValid ? 'var(--success-bg)' : 'var(--danger-bg)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <strong style={{ color: isU2SampleWeightValid ? 'var(--success)' : 'var(--danger)' }}>
                      Berat Sampel U-2: {u2SampleWeight.toFixed(4)} g
                    </strong>
                    <span className={`badge ${isU2SampleWeightValid ? 'badge-success' : 'badge-danger'}`}>
                      {isU2SampleWeightValid ? '✓ MEMENUHI' : '✕ DI LUAR TOLERANSI'}
                    </span>
                  </div>
                )}
              </div>

              {/* U2 Penimbangan Abu */}
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#a855f7' }}>
                  Tahap 3: Penimbangan Abu Ulangan 2 (W3)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">W3_1: Timbang Abu 1 (g)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.0001"
                        className="form-input font-mono"
                        value={u2W3_1}
                        onChange={e => setU2W3_1(e.target.value)}
                      />
                      <button type="button" onClick={() => handleSimulateBalance('u2W3_1')} className="btn btn-sm btn-secondary">📡 BACA</button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">W3_2: Uji Berat Konstan (g)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.0001"
                        className="form-input font-mono"
                        value={u2W3_2}
                        onChange={e => setU2W3_2(e.target.value)}
                      />
                      <button type="button" onClick={() => handleSimulateBalance('u2W3_2')} className="btn btn-sm btn-secondary">📡 BACA</button>
                    </div>
                  </div>
                </div>

                {u2W3_1Num > 0 && u2W3_2Num > 0 && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: u2ConstCheck.isPass ? 'var(--success-bg)' : 'var(--warning-bg)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <strong style={{ color: u2ConstCheck.isPass ? 'var(--success)' : 'var(--warning)' }}>
                      Selisih Konstan U-2: {u2ConstCheck.diff.toFixed(4)} g
                    </strong>
                    <span className={`badge ${u2ConstCheck.isPass ? 'badge-success' : 'badge-warning'}`}>
                      {u2ConstCheck.isPass ? '✓ BERAT KONSTAN' : '⚠️ BELUM KONSTAN'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label className="form-label">Catatan Analis</label>
            <input
              type="text"
              className="form-input"
              placeholder="Catatan warna abu, kondisi pembakaran, dll..."
              value={catatanAnalis}
              onChange={e => setCatatanAnalis(e.target.value)}
            />
          </div>
        </div>

        {/* Kolom Kanan: Panel Kalkulasi Otomatis & QC Repeatability (1 column) */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.9)' }}>
            <h3 style={{ margin: '0 0 1.25rem 0' }}>Hasil & Kontrol Mutu</h3>

            <div className="flex flex-col gap-3">
              {/* Hasil U1 */}
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                <div className="flex justify-between items-center">
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Kadar Abu Ulangan 1:</span>
                  <span className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8' }}>
                    {u1AshPercent.toFixed(2)} %
                  </span>
                </div>
              </div>

              {/* Hasil U2 */}
              {u2Enabled && (
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Kadar Abu Ulangan 2:</span>
                    <span className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#a855f7' }}>
                      {u2AshPercent.toFixed(2)} %
                    </span>
                  </div>
                </div>
              )}

              {/* Cek Repeatability Duplikat */}
              {repeatabilityQC && (
                <div style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  background: repeatabilityQC.isPass ? 'var(--success-bg)' : 'var(--danger-bg)',
                  border: `1px solid ${repeatabilityQC.isPass ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                  marginTop: '0.5rem'
                }}>
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Selisih Duplikat |U1 - U2|:</span>
                    <span className="font-mono" style={{ fontWeight: 800 }}>{repeatabilityQC.diff.toFixed(2)} %</span>
                  </div>
                  <div className="flex justify-between items-center" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    <span>Batas Repeatability:</span>
                    <span>≤ {selectedMethod.batasRepeatability.toFixed(2)} %</span>
                  </div>
                  <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                    <span className={`badge ${repeatabilityQC.isPass ? 'badge-success' : 'badge-danger'}`} style={{ width: '100%', justifyContent: 'center' }}>
                      {repeatabilityQC.isPass ? '✓ REPEATABILITY MEMENUHI SYARAT' : '✕ DI LUAR BATAS (ULANGI ANALISIS)'}
                    </span>
                  </div>
                </div>
              )}

              {/* Hasil Akhir Rata-Rata */}
              <div style={{
                marginTop: '0.75rem',
                padding: '1.25rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.15))',
                border: '1px solid var(--border-glow)',
                textAlign: 'center'
              }}>
                <span className="form-label" style={{ color: 'var(--primary-light)' }}>
                  HASIL AKHIR KADAR ABU ({selectedSample?.basisPelaporan.toUpperCase() || 'ADB'})
                </span>
                <div className="font-mono text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.25rem 0' }}>
                  {finalAshAdb.toFixed(2)} %
                </div>

                {/* Konversi Basis Otomatis */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginTop: '0.5rem', fontSize: '0.8rem', textAlign: 'left' }} className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Dry Basis (db):</span>
                    <strong className="font-mono">{finalAshDb.toFixed(2)} %</strong>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>As Received (ar):</span>
                    <strong className="font-mono">{finalAshAr.toFixed(2)} %</strong>
                  </div>
                </div>
              </div>

              {/* Tombol Simpan & Kirim */}
              <button
                type="button"
                onClick={handleSaveAnalysis}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
              >
                💾 Simpan & Ajukan ke Supervisor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

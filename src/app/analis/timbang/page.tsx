'use client';
import Link from "next/link";
import { useState } from "react";

export default function TimbangSampel() {
  const [w1, setW1] = useState("");
  const [w2, setW2] = useState("");
  const [beratSampel, setBeratSampel] = useState(0);

  const handleW1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setW1(e.target.value);
    calculateSampel(e.target.value, w2);
  };

  const handleW2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setW2(e.target.value);
    calculateSampel(w1, e.target.value);
  };

  const calculateSampel = (valW1: string, valW2: string) => {
    const fw1 = parseFloat(valW1);
    const fw2 = parseFloat(valW2);
    if (!isNaN(fw1) && !isNaN(fw2) && fw2 > fw1) {
      setBeratSampel(parseFloat((fw2 - fw1).toFixed(4)));
    } else {
      setBeratSampel(0);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '900px' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>Input Penimbangan</h1>
          <p className="text-muted">Masukkan data berat cawan (W1), sampel (W2), dan abu (W3).</p>
        </div>
        <Link href="/analis" className="btn btn-secondary">
          Kembali
        </Link>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 style={{ margin: 0 }}>Sampel: <span style={{ color: 'var(--primary)' }}>BB-261009-001</span></h3>
            <p className="text-muted mt-2" style={{ fontSize: '0.9rem' }}>Metode: ASTM D3174 (Target 1.0g ± 0.1g)</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', borderRadius: '4px', fontSize: '0.85rem' }}>
              Status: Tunggu W1 & W2
            </span>
          </div>
        </div>

        <form className="flex-col gap-6" style={{ display: 'flex' }}>
          <div className="grid grid-cols-2 gap-6" style={{ background: 'rgba(0,0,0,0.1)', padding: '1.5rem', borderRadius: '12px' }}>
            <div>
              <div className="form-group">
                <label className="form-label">Neraca Analitik</label>
                <select className="form-input">
                  <option value="N01">N01 (Mettler Toledo - Kalibrasi OK)</option>
                  <option value="N02">N02 (Sartorius - Kalibrasi OK)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Nomor Cawan</label>
                <input type="text" className="form-input" placeholder="Contoh: C-12" />
              </div>
            </div>
            
            <div className="flex-col justify-center gap-4" style={{ display: 'flex' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">W1 (Berat Cawan Kosong) - gram</label>
                <div className="flex gap-2">
                  <input type="number" step="0.0001" className="form-input" value={w1} onChange={handleW1Change} placeholder="0.0000" />
                  <button type="button" className="btn btn-secondary">BACA</button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">W2 (Cawan + Sampel) - gram</label>
                <div className="flex gap-2">
                  <input type="number" step="0.0001" className="form-input" value={w2} onChange={handleW2Change} placeholder="0.0000" />
                  <button type="button" className="btn btn-secondary">BACA</button>
                </div>
              </div>
            </div>
          </div>

          {beratSampel > 0 && (
            <div style={{ padding: '1rem', background: beratSampel >= 0.9 && beratSampel <= 1.1 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${beratSampel >= 0.9 && beratSampel <= 1.1 ? 'var(--success)' : 'var(--danger)'}`, borderRadius: '8px', textAlign: 'center' }}>
              <h4 style={{ margin: 0, color: beratSampel >= 0.9 && beratSampel <= 1.1 ? 'var(--success)' : 'var(--danger)' }}>
                Berat Sampel: {beratSampel.toFixed(4)} g
              </h4>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {beratSampel >= 0.9 && beratSampel <= 1.1 ? 'Sesuai dengan toleransi metode.' : 'Peringatan: Di luar toleransi metode (0.9 - 1.1 g).'}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-4 mt-4">
            <button type="submit" className="btn btn-primary" disabled={!(beratSampel >= 0.9 && beratSampel <= 1.1)}>Simpan W1 & W2</button>
          </div>
        </form>
      </div>
    </div>
  );
}

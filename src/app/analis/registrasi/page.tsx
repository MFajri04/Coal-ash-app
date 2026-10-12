import Link from "next/link";

export default function RegistrasiSampel() {
  return (
    <div className="container animate-fade-in" style={{ maxWidth: '800px' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>Registrasi Sampel Baru</h1>
          <p className="text-muted">Daftarkan sampel batu bara sebelum proses analisis.</p>
        </div>
        <Link href="/analis" className="btn btn-secondary">
          Batal
        </Link>
      </div>

      <div className="card">
        <form className="flex-col gap-6" style={{ display: 'flex' }}>
          <div className="grid grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">ID Sampel (Auto)</label>
              <input type="text" className="form-input" disabled value="BB-261009-003" />
            </div>
            
            <div className="form-group">
              <label className="form-label">Tanggal Terima</label>
              <input type="date" className="form-input" defaultValue="2026-10-09" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Sumber Sampel</label>
            <input type="text" className="form-input" placeholder="Contoh: Stockpile B, Kapal MV Harapan" required />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">Jenis Batu Bara</label>
              <select className="form-input">
                <option value="">Pilih Jenis</option>
                <option value="Lignite">Lignite</option>
                <option value="Sub-bituminous">Sub-bituminous</option>
                <option value="Bituminous">Bituminous</option>
                <option value="Anthracite">Anthracite</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Basis Pelaporan</label>
              <select className="form-input">
                <option value="adb">Air Dried Basis (adb)</option>
                <option value="ar">As Received (ar)</option>
                <option value="db">Dry Basis (db)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Catatan</label>
            <textarea className="form-input" rows={3} placeholder="Tambahkan catatan jika ada..."></textarea>
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <button type="submit" className="btn btn-primary">Simpan Sampel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

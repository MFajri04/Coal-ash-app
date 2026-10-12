import Link from "next/link";

export default function AnalisDashboard() {
  return (
    <div className="container animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>Dashboard Analis</h1>
          <p className="text-muted">Kelola sampel, cawan, dan proses penimbangan.</p>
        </div>
        <Link href="/" className="btn btn-secondary">
          Kembali
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h2>Registrasi Sampel</h2>
          <p className="text-muted mt-2 mb-4">Daftarkan sampel baru untuk analisis kadar abu.</p>
          <Link href="/analis/registrasi" className="btn btn-primary w-full">
            Daftar Sampel Baru
          </Link>
        </div>

        <div className="card">
          <h2>Input Penimbangan (W1, W2, W3)</h2>
          <p className="text-muted mt-2 mb-4">Input data cawan kosong, cawan + sampel, dan cawan + abu.</p>
          <Link href="/analis/timbang" className="btn btn-primary w-full">
            Mulai Penimbangan
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <h2>Sampel Dalam Proses</h2>
        <div className="card mt-4">
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1rem 0' }}>ID Sampel</th>
                <th style={{ padding: '1rem 0' }}>Sumber</th>
                <th style={{ padding: '1rem 0' }}>Status</th>
                <th style={{ padding: '1rem 0' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {/* Dummy data for layout preview */}
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem 0' }}>BB-261009-001</td>
                <td style={{ padding: '1rem 0' }}>Stockpile A</td>
                <td style={{ padding: '1rem 0', color: 'var(--warning)' }}>Tunggu W1</td>
                <td style={{ padding: '1rem 0' }}><button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>Timbang</button></td>
              </tr>
              <tr>
                <td style={{ padding: '1rem 0' }}>BB-261009-002</td>
                <td style={{ padding: '1rem 0' }}>Kapal MV Maju</td>
                <td style={{ padding: '1rem 0', color: 'var(--primary)' }}>Tunggu W3</td>
                <td style={{ padding: '1rem 0' }}><button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>Timbang</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

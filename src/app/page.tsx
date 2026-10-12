'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('@/App').then((mod) => mod.App), {
  ssr: false,
  loading: () => (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0b1120',
      color: '#94a3b8',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔬</div>
        <div style={{ fontWeight: 700, fontSize: '1.25rem', color: '#f8fafc' }}>
          Sistem Informasi Laboratorium Batu Bara (LIMS)
        </div>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: '#64748b' }}>
          Standar ISO/IEC 17025 • ASTM D3174 • ISO 1171
        </p>
      </div>
    </div>
  ),
});

export default function Home() {
  return <App />;
}

import React, { useState } from 'react';
import { labStore } from '../store';

export const AuditTrailView: React.FC = () => {
  const auditLogs = labStore.auditLogs;
  const [filterEntity, setFilterEntity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = auditLogs.filter(item => {
    const matchesEntity = filterEntity === 'ALL' || item.entitas.toUpperCase() === filterEntity;
    const matchesSearch = 
      item.pengguna.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.nilaiBaru && item.nilaiBaru.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.alasan && item.alasan.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesEntity && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Waktu', 'Pengguna', 'Peran', 'Entitas', 'Aksi', 'Keterangan / Nilai Baru', 'Alasan'];
    const rows = filteredLogs.map(l => [
      l.id,
      `"${l.waktu}"`,
      `"${l.pengguna}"`,
      l.peran,
      l.entitas,
      l.aksi,
      `"${(l.nilaiBaru || '').replace(/"/g, '""')}"`,
      `"${(l.alasan || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Trail_LIMS_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0 }}>Jejak Audit & Ketertelusuran (ISO 17025)</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
              100% rekaman aktivitas pengujian, penimbangan, dan persetujuan tersimpan secara permanen & anti-manipulasi
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              className="form-input"
              style={{ width: '160px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
              value={filterEntity}
              onChange={e => setFilterEntity(e.target.value)}
            >
              <option value="ALL">Semua Entitas</option>
              <option value="SAMPLE">Sample</option>
              <option value="WEIGHING">Weighing</option>
              <option value="ANALYSIS">Analysis</option>
              <option value="RESULT">Result (Approval)</option>
              <option value="USER">User</option>
            </select>

            <input
              type="text"
              placeholder="Cari kata kunci..."
              className="form-input"
              style={{ width: '200px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />

            <button onClick={handleExportCSV} className="btn btn-sm btn-secondary">
              📥 Ekspor Audit CSV
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="lab-table">
            <thead>
              <tr>
                <th>Waktu (WIB)</th>
                <th>Pengguna & Peran</th>
                <th>Entitas</th>
                <th>Aksi</th>
                <th>Aktivitas / Nilai Baru</th>
                <th>Alasan / Justifikasi</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(item => {
                let badgeClass = 'badge-neutral';
                if (item.aksi === 'CREATE') badgeClass = 'badge-info';
                if (item.aksi === 'APPROVE') badgeClass = 'badge-success';
                if (item.aksi === 'REJECT') badgeClass = 'badge-danger';
                if (item.aksi === 'UPDATE') badgeClass = 'badge-warning';

                return (
                  <tr key={item.id}>
                    <td className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {item.waktu}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.pengguna}</div>
                      <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{item.peran}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.entitas}</td>
                    <td>
                      <span className={`badge ${badgeClass}`}>
                        {item.aksi}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#e0e7ff' }}>
                      {item.nilaiBaru}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      {item.alasan || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

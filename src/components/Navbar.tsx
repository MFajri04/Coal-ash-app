import React, { useState, useEffect } from 'react';
import { labStore } from '../store';
import { LoginModal } from './LoginModal';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab,
  isSidebarOpen = true,
  onToggleSidebar 
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  
  const currentUser = labStore.currentUser;
  const users = labStore.users;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRoleQuickSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    labStore.switchUserQuick(selectedId);
  };

  const pageInfoMap: Record<string, { title: string; subtitle: string; icon: string }> = {
    dashboard: { 
      title: 'Dasbor Operasional Lab', 
      subtitle: 'Monitoring Sampel, Neraca & Kepatuhan ISO 17025', 
      icon: '📊' 
    },
    samples: { 
      title: 'Registrasi Sampel Baru', 
      subtitle: 'Pendaftaran Sampel Batubara & Cetak Label Thermal Barcode', 
      icon: '📦' 
    },
    worksheet: { 
      title: 'Lembar Kerja Timbang (W1-W3)', 
      subtitle: 'Penentuan Kadar Abu Berdasarkan ASTM D3174 / ISO 1171', 
      icon: '⚖️' 
    },
    review: { 
      title: 'Review & Persetujuan Penyelia', 
      subtitle: 'Verifikasi Data Mentah Duplo & E-Signature Sertifikat', 
      icon: '🛡️' 
    },
    reports: { 
      title: 'Sertifikat Hasil Uji (CoA)', 
      subtitle: 'Dokumen Resmi Sertifikasi Kadar Abu Standar KAN/ISO 17025', 
      icon: '📜' 
    },
    master: { 
      title: 'Master Data & Kontrol Mutu', 
      subtitle: 'Manajemen Neraca Analitis, Furnace, & Krus Porselen', 
      icon: '⚙️' 
    },
    users: { 
      title: 'Kelola Pengguna Sistem', 
      subtitle: 'Manajemen Akun Analis, Supervisor, Admin & Log Akses', 
      icon: '👥' 
    },
    audit: { 
      title: 'Rekaman Audit Trail', 
      subtitle: 'Jejak Audit Permanen Kepatuhan Integritas Data Lab', 
      icon: '🔍' 
    },
    profile: { 
      title: 'Profil Pengguna', 
      subtitle: 'Informasi Akun, Pengaturan Password & Riwayat Uji', 
      icon: '👤' 
    }
  };

  const currentPage = pageInfoMap[activeTab] || { 
    title: 'Sistem Analisis Batubara', 
    subtitle: 'Laboratorium Terakreditasi ISO 17025', 
    icon: '🔬' 
  };

  return (
    <>
      <header className="top-navbar no-print">
        {/* Left: Sidebar Toggle Button + Breadcrumbs / Active Section Title */}
        <div className="top-navbar-left flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="sidebar-toggle-btn"
              title={isSidebarOpen ? "Sembunyikan Menu Sidebar" : "Buka Menu Sidebar"}
              aria-label="Toggle Menu Sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          )}

          <span className="navbar-page-icon" style={{ fontSize: '1.4rem' }}>{currentPage.icon}</span>
          <div style={{ minWidth: 0 }}>
            <h1 className="navbar-page-title" style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#f8fafc', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentPage.title}
            </h1>
            <p className="navbar-page-subtitle" style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentPage.subtitle}
            </p>
          </div>
        </div>

        {/* Right Section: LAN Status, Clock, Quick Switcher & User Profile */}
        <div className="top-navbar-right flex items-center gap-3" style={{ fontSize: '0.825rem' }}>
          {/* LAN Status Indicator */}
          <div className="flex items-center gap-2" style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.35rem 0.65rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', whiteSpace: 'nowrap' }}>
            <span className="pulse-indicator"></span>
            <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
            <span style={{ fontWeight: 600, color: 'var(--success)' }}>ONLINE</span>
          </div>

          {/* Clock */}
          <div className="navbar-clock" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            🕒 {timeStr} WIB
          </div>

          {/* User Session Profile Card */}
          {currentUser ? (
            <div className="flex items-center gap-3" style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.3rem 0.75rem', borderRadius: '10px', border: '1px solid var(--border-glow)' }}>
              <div
                onClick={() => setActiveTab('profile')}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: currentUser.peran === 'Analis' ? '#0284c7' : currentUser.peran === 'Supervisor' ? '#d97706' : currentUser.peran === 'Admin' ? '#dc2626' : '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
                title="Klik untuk buka profil saya"
              >
                {currentUser.nama.charAt(0)}
              </div>

              <div className="flex flex-col" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('profile')}>
                <div className="flex items-center gap-2">
                  <strong style={{ fontSize: '0.825rem', color: '#ffffff' }}>{currentUser.nama}</strong>
                  <span className={`badge ${
                    currentUser.peran === 'Analis' ? 'badge-info' :
                    currentUser.peran === 'Supervisor' ? 'badge-warning' :
                    currentUser.peran === 'Admin' ? 'badge-danger' : 'badge-success'
                  }`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem' }}>
                    {currentUser.peran}
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {currentUser.jabatan || currentUser.username}
                </span>
              </div>

              {/* Role Switcher Dropdown (Demo Feature) */}
              <select
                value={currentUser.id}
                onChange={handleRoleQuickSwitch}
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  color: '#e0e7ff',
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.4rem',
                  borderRadius: '6px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
                title="Ganti Pengguna Cepat (Demo)"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    Ganti ke {u.nama.split(' ')[0]} ({u.peran})
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  labStore.logout();
                  setShowLoginModal(true);
                }}
                className="btn btn-sm btn-secondary"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#f87171' }}
                title="Keluar dari sesi"
              >
                🚪 Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="btn btn-sm btn-primary"
            >
              🔐 Masuk / Login
            </button>
          )}
        </div>
      </header>

      {/* Modal Login jika diperlukan */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
};

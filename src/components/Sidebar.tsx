import React from 'react';
import { labStore } from '../store';
import { notify } from './NotificationModal';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab,
  isOpen = true,
  onClose
}) => {
  const currentUser = labStore.currentUser;
  const pendingApprovalCount = labStore.analyses.filter(a => a.status === 'Menunggu review').length;

  const labMenu = [
    { 
      id: 'dashboard', 
      label: 'Dasbor Lab', 
      icon: '📊', 
      allowed: true 
    },
    { 
      id: 'samples', 
      label: 'Registrasi Sampel', 
      icon: '📦', 
      allowed: labStore.canRegisterSample(),
      roleNote: 'Hanya Analis & Admin'
    },
    { 
      id: 'worksheet', 
      label: 'Lembar Kerja Timbang (W1-W3)', 
      icon: '⚖️', 
      allowed: labStore.canInputAnalysis(),
      roleNote: 'Hanya Analis & Admin'
    },
    { 
      id: 'review', 
      label: 'Review & Approval', 
      icon: '🛡️', 
      badge: pendingApprovalCount > 0 ? pendingApprovalCount : undefined,
      allowed: labStore.canApproveAnalysis(),
      roleNote: 'Hanya Supervisor & Admin'
    },
    { 
      id: 'reports', 
      label: 'Sertifikat Hasil Uji (CoA)', 
      icon: '📜', 
      allowed: labStore.canViewReports()
    }
  ];

  const managementMenu = [
    { 
      id: 'master', 
      label: 'Master Data', 
      icon: '⚙️', 
      allowed: labStore.canManageMasterData(),
      roleNote: 'Hanya Administrator'
    },
    { 
      id: 'users', 
      label: 'Kelola Pengguna', 
      icon: '👥', 
      allowed: labStore.canManageUsers(),
      roleNote: 'Hanya Administrator'
    },
    { 
      id: 'audit', 
      label: 'Audit Trail', 
      icon: '🔍', 
      allowed: labStore.canViewAuditTrail(),
      roleNote: 'Hanya Supervisor & Admin'
    },
    { 
      id: 'profile', 
      label: 'Profil Saya', 
      icon: '👤', 
      allowed: true 
    }
  ];

  const handleNavClick = (tab: { id: string; label: string; allowed: boolean; roleNote?: string }) => {
    if (tab.allowed) {
      setActiveTab(tab.id);
      if (onClose && typeof window !== 'undefined' && window.innerWidth < 1024) {
        onClose();
      }
    } else {
      notify.modal({
        type: 'warning',
        title: 'Akses Fitur Dibatasi (ISO 17025)',
        message: `Fitur "${tab.label}" tidak dapat diakses dengan akun Anda saat ini.`,
        detail: `• Otoritas Diperlukan : ${tab.roleNote}\n• Akun Anda Sekarang   : ${currentUser?.nama || '-'} (${currentUser?.peran || 'Belum Login'})\n\nSilakan gunakan menu 'Ganti Pengguna Cepat' di sudut kanan atas untuk berpindah peran pengujian.`
      });
    }
  };

  return (
    <aside className={`sidebar no-print ${isOpen ? 'open' : 'closed'}`}>
      {/* Brand & Logo Header */}
      <div className="sidebar-header">
        <div className="flex items-center gap-3">
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
            flexShrink: 0
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 18h12"></path>
              <path d="M3 22h18"></path>
              <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
              <path d="M10 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            </svg>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div className="flex items-center gap-1">
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                COAL<span className="text-gradient">ASH</span> LIMS
              </h2>
            </div>
            <div className="flex items-center gap-1.5" style={{ marginTop: '0.15rem' }}>
              <span className="badge badge-info" style={{ fontSize: '0.62rem', padding: '0.05rem 0.35rem' }}>
                ISO 17025
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                v1.0 Lab System
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="sidebar-close-btn"
            title="Tutup Menu Sidebar"
            aria-label="Tutup Sidebar"
          >
            ✕
          </button>
        )}
      </div>

      {/* Navigation Menu List */}
      <div className="sidebar-content">
        {/* Section 1: Pengujian & Laboratorium */}
        <div>
          <div className="sidebar-section-title">
            Pengujian & Laboratorium
          </div>
          <div className="sidebar-menu">
            {labMenu.map(tab => {
              const isActive = activeTab === tab.id;
              const isAllowed = tab.allowed;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleNavClick(tab)}
                  className={`sidebar-link ${isActive ? 'active' : ''} ${!isAllowed ? 'disabled' : ''}`}
                  title={!isAllowed ? `Dibatasi: ${tab.roleNote}` : undefined}
                >
                  <div className="flex items-center gap-2.5" style={{ minWidth: 0 }}>
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{tab.icon}</span>
                    <span style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontSize: '0.85rem'
                    }}>
                      {tab.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5" style={{ flexShrink: 0 }}>
                    {!isAllowed && (
                      <span style={{ fontSize: '0.75rem', opacity: 0.6 }} title="Akses Dibatasi">🔒</span>
                    )}
                    {tab.badge !== undefined && isAllowed && (
                      <span style={{
                        background: '#ef4444',
                        color: '#fff',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
                      }}>
                        {tab.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Administrasi & Mutu */}
        <div style={{ marginTop: '0.5rem' }}>
          <div className="sidebar-section-title">
            Administrasi & Mutu
          </div>
          <div className="sidebar-menu">
            {managementMenu.map(tab => {
              const isActive = activeTab === tab.id;
              const isAllowed = tab.allowed;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleNavClick(tab)}
                  className={`sidebar-link ${isActive ? 'active' : ''} ${!isAllowed ? 'disabled' : ''}`}
                  title={!isAllowed ? `Dibatasi: ${tab.roleNote}` : undefined}
                >
                  <div className="flex items-center gap-2.5" style={{ minWidth: 0 }}>
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{tab.icon}</span>
                    <span style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontSize: '0.85rem'
                    }}>
                      {tab.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5" style={{ flexShrink: 0 }}>
                    {!isAllowed && (
                      <span style={{ fontSize: '0.75rem', opacity: 0.6 }} title="Akses Dibatasi">🔒</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar Footer: Reset Demo & User Info */}
      <div className="sidebar-footer">
        <button
          onClick={() => {
            notify.modal({
              type: 'warning',
              title: 'Konfirmasi Reset Data Demo',
              message: 'Apakah Anda yakin ingin memuat ulang semua data sampel, neraca, dan analisis ke setelan awal pabrik?',
              detail: 'Semua rekaman hasil pengujian yang diinput pada sesi ini akan digantikan dengan data baku SOP ISO 17025.',
              showCancel: true,
              cancelText: 'Batalkan',
              confirmText: 'Ya, Reset Data',
              onConfirm: () => {
                labStore.resetToDefaults();
                notify.success('Data Lab Direset', 'Semua data pengujian telah dikembalikan ke kondisi awal.');
              }
            });
          }}
          className="sidebar-reset-btn"
          title="Reset semua data ke kondisi awal pabrik"
        >
          <span style={{ fontSize: '1rem' }}>🔄</span>
          <span>Reset Demo</span>
        </button>

        {currentUser && (
          <div 
            onClick={() => {
              setActiveTab('profile');
              if (onClose && typeof window !== 'undefined' && window.innerWidth < 1024) {
                onClose();
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 0.65rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
            title="Klik untuk membuka profil saya"
          >
            <div style={{
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
              flexShrink: 0
            }}>
              {currentUser.nama.charAt(0)}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#f8fafc',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {currentUser.nama}
              </div>
              <div style={{
                fontSize: '0.68rem',
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {currentUser.peran} • {currentUser.jabatan}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

import React, { useState, useEffect } from 'react';
import { labStore } from './store';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { SampleRegistration } from './components/SampleRegistration';
import { AnalysisWorksheet } from './components/AnalysisWorksheet';
import { SupervisorReview } from './components/SupervisorReview';
import { ReportView } from './components/ReportView';
import { MasterDataView } from './components/MasterDataView';
import { AuditTrailView } from './components/AuditTrailView';
import { UserProfileView } from './components/UserProfileView';
import { UserManagementView } from './components/UserManagementView';
import { LoginModal } from './components/LoginModal';
import { Sample } from './types';
import { NotificationContainer } from './components/NotificationModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [, setTick] = useState<number>(0);

  // Subscribe to store updates & ensure client-side mounting
  useEffect(() => {
    setMounted(true);
    const unsubscribe = labStore.subscribe(() => {
      setTick(t => t + 1);
    });

    const checkWidth = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 1024) {
          setIsSidebarOpen(false);
        } else {
          setIsSidebarOpen(true);
        }
      }
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);

    return () => {
      unsubscribe();
      window.removeEventListener('resize', checkWidth);
    };
  }, []);

  if (!mounted) {
    return null;
  }

  const currentUser = labStore.currentUser;

  // Jika belum login, tampilkan layar login
  if (!currentUser) {
    return (
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <NotificationContainer />
        <LoginModal isOpen={true} />
      </div>
    );
  }

  return (
    <div className="app-layout">
      <NotificationContainer />

      {/* Backdrop overlay for mobile drawer */}
      {isSidebarOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setIsSidebarOpen(false);
          }
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className={`main-wrapper ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        />

        <main className="content-body">
          {activeTab === 'dashboard' && (
          <Dashboard onNavigate={setActiveTab} />
        )}

        {activeTab === 'samples' && (
          labStore.canRegisterSample() ? (
            <SampleRegistration
              onStartAnalysis={(sample) => {
                setSelectedSample(sample);
                setActiveTab('worksheet');
              }}
            />
          ) : (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <span style={{ fontSize: '3rem' }}>🔒</span>
              <h3 style={{ marginTop: '1rem', color: '#f87171' }}>Akses Terbatas: Registrasi Sampel</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Fitur pendaftaran sampel hanya dapat diakses oleh peran <strong>Analis</strong> atau <strong>Admin</strong>.
              </p>
              <button onClick={() => setActiveTab('dashboard')} className="btn btn-secondary mt-4">
                Kembali ke Dasbor
              </button>
            </div>
          )
        )}

        {activeTab === 'worksheet' && (
          labStore.canInputAnalysis() ? (
            <AnalysisWorksheet
              preselectedSample={selectedSample}
              onAnalysisSaved={() => setActiveTab('review')}
            />
          ) : (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <span style={{ fontSize: '3rem' }}>🔒</span>
              <h3 style={{ marginTop: '1rem', color: '#f87171' }}>Akses Terbatas: Lembar Kerja Penimbangan</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Fitur penimbangan sampel hanya dapat diakses oleh personil <strong>Analis</strong> penguji.
              </p>
              <button onClick={() => setActiveTab('dashboard')} className="btn btn-secondary mt-4">
                Kembali ke Dasbor
              </button>
            </div>
          )
        )}

        {activeTab === 'review' && (
          labStore.canApproveAnalysis() ? (
            <SupervisorReview
              onApprovedOrRejected={() => setActiveTab('reports')}
            />
          ) : (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <span style={{ fontSize: '3rem' }}>🔒</span>
              <h3 style={{ marginTop: '1rem', color: '#f87171' }}>Akses Terbatas: Otorisasi & Persetujuan Hasil</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Fitur persetujuan mutu dan tanda tangan elektronik hanya dapat diakses oleh <strong>Supervisor / Penyelia Lab</strong>.
              </p>
              <button onClick={() => setActiveTab('dashboard')} className="btn btn-secondary mt-4">
                Kembali ke Dasbor
              </button>
            </div>
          )
        )}

        {activeTab === 'reports' && (
          <ReportView />
        )}

        {activeTab === 'master' && (
          labStore.canManageMasterData() ? (
            <MasterDataView />
          ) : (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <span style={{ fontSize: '3rem' }}>🔒</span>
              <h3 style={{ marginTop: '1rem', color: '#f87171' }}>Akses Terbatas: Master Data Lab</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Pengaturan parameter metode, jadwal kalibrasi neraca, dan furnace hanya dapat dikelola oleh <strong>Administrator</strong>.
              </p>
              <button onClick={() => setActiveTab('dashboard')} className="btn btn-secondary mt-4">
                Kembali ke Dasbor
              </button>
            </div>
          )
        )}

        {activeTab === 'users' && (
          labStore.canManageUsers() ? (
            <UserManagementView />
          ) : (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <span style={{ fontSize: '3rem' }}>🔒</span>
              <h3 style={{ marginTop: '1rem', color: '#f87171' }}>Akses Terbatas: Manajemen Pengguna</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Pengelolaan akun dan pemantauan aktivitas user hanya dapat diakses oleh <strong>Administrator Sistem</strong>.
              </p>
              <button onClick={() => setActiveTab('dashboard')} className="btn btn-secondary mt-4">
                Kembali ke Dasbor
              </button>
            </div>
          )
        )}

        {activeTab === 'audit' && (
          labStore.canViewAuditTrail() ? (
            <AuditTrailView />
          ) : (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <span style={{ fontSize: '3rem' }}>🔒</span>
              <h3 style={{ marginTop: '1rem', color: '#f87171' }}>Akses Terbatas: Rekaman Audit Trail</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Jejak audit ISO 17025 hanya dapat diakses oleh <strong>Supervisor</strong> dan <strong>Admin</strong>.
              </p>
              <button onClick={() => setActiveTab('dashboard')} className="btn btn-secondary mt-4">
                Kembali ke Dasbor
              </button>
            </div>
          )
        )}

        {activeTab === 'profile' && (
          <UserProfileView />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print" style={{
        marginTop: '3rem',
        padding: '1.5rem 0',
        borderTop: '1px solid var(--border-subtle)',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div>
          © 2026 Aplikasi Analisis Kadar Abu Batu Bara • ISO/IEC 17025 Compliant LIMS
        </div>
        <div style={{ marginTop: '0.35rem', color: 'var(--text-secondary)' }}>
          Pengguna Aktif: <strong>{currentUser.nama}</strong> ({currentUser.peran}) • {currentUser.jabatan}
        </div>
      </footer>
      </div>
    </div>
  );
};

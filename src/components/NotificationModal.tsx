import React, { useState, useEffect } from 'react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  detail?: string;
  duration?: number;
}

export interface ModalAlert {
  isOpen: boolean;
  type: AlertType;
  title: string;
  message: string;
  detail?: string;
  confirmText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
  cancelText?: string;
  onCancel?: () => void;
}

// Global Event Emitter for Toasts & Modal Alerts
class AlertStore {
  toasts: ToastMessage[] = [];
  modal: ModalAlert | null = null;
  listeners: Array<() => void> = [];

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(l => l());
  }

  addToast(type: AlertType, title: string, message: string, detail?: string, duration: number = 4500) {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const item: ToastMessage = { id, type, title, message, detail, duration };
    this.toasts = [item, ...this.toasts];
    this.notify();

    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(id);
      }, duration);
    }
  }

  removeToast(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notify();
  }

  showModal(config: Omit<ModalAlert, 'isOpen'>) {
    this.modal = { ...config, isOpen: true };
    this.notify();
  }

  closeModal() {
    this.modal = null;
    this.notify();
  }
}

export const alertStore = new AlertStore();

// User-friendly Helper Functions
export const notify = {
  success: (title: string, message: string, detail?: string, duration?: number) => {
    alertStore.addToast('success', title, message, detail, duration);
  },
  error: (title: string, message: string, detail?: string, duration?: number) => {
    alertStore.addToast('error', title, message, detail, duration);
  },
  warning: (title: string, message: string, detail?: string, duration?: number) => {
    alertStore.addToast('warning', title, message, detail, duration);
  },
  info: (title: string, message: string, detail?: string, duration?: number) => {
    alertStore.addToast('info', title, message, detail, duration);
  },
  // Modal Pop-Up Dialog for explicit acknowledgment
  modal: (config: Omit<ModalAlert, 'isOpen'>) => {
    alertStore.showModal(config);
  }
};

export const NotificationContainer: React.FC = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = alertStore.subscribe(() => {
      setTick(t => t + 1);
    });
    return unsubscribe;
  }, []);

  const toasts = alertStore.toasts;
  const modal = alertStore.modal;

  const getTypeStyles = (type: AlertType) => {
    switch (type) {
      case 'success':
        return {
          icon: '✅',
          border: 'rgba(16, 185, 129, 0.5)',
          background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.95), rgba(15, 23, 42, 0.98))',
          textColor: '#ecfdf5',
          glow: 'rgba(16, 185, 129, 0.25)',
          badgeBg: 'rgba(16, 185, 129, 0.2)',
          badgeColor: '#34d399'
        };
      case 'error':
        return {
          icon: '❌',
          border: 'rgba(239, 68, 68, 0.6)',
          background: 'linear-gradient(135deg, rgba(127, 29, 29, 0.95), rgba(15, 23, 42, 0.98))',
          textColor: '#fef2f2',
          glow: 'rgba(239, 68, 68, 0.3)',
          badgeBg: 'rgba(239, 68, 68, 0.2)',
          badgeColor: '#f87171'
        };
      case 'warning':
        return {
          icon: '⚠️',
          border: 'rgba(245, 158, 11, 0.6)',
          background: 'linear-gradient(135deg, rgba(120, 53, 15, 0.95), rgba(15, 23, 42, 0.98))',
          textColor: '#fffbeb',
          glow: 'rgba(245, 158, 11, 0.25)',
          badgeBg: 'rgba(245, 158, 11, 0.2)',
          badgeColor: '#fbbf24'
        };
      case 'info':
      default:
        return {
          icon: 'ℹ️',
          border: 'rgba(59, 130, 246, 0.5)',
          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.95), rgba(15, 23, 42, 0.98))',
          textColor: '#eff6ff',
          glow: 'rgba(59, 130, 246, 0.25)',
          badgeBg: 'rgba(59, 130, 246, 0.2)',
          badgeColor: '#60a5fa'
        };
    }
  };

  return (
    <>
      {/* Toast Notifications Floating Stacking in Top-Right */}
      <div 
        className="no-print" 
        style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '420px',
          width: 'calc(100% - 48px)',
          pointerEvents: 'none'
        }}
      >
        {toasts.map(toast => {
          const style = getTypeStyles(toast.type);

          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: 'auto',
                background: style.background,
                border: `1px solid ${style.border}`,
                borderRadius: '12px',
                padding: '0.85rem 1.15rem',
                boxShadow: `0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px ${style.glow}`,
                backdropFilter: 'blur(16px)',
                color: style.textColor,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.85rem',
                animation: 'toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ fontSize: '1.35rem', lineHeight: 1, marginTop: '0.1rem', flexShrink: 0 }}>
                {style.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                    {toast.title}
                  </h4>
                  <button
                    onClick={() => alertStore.removeToast(toast.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      padding: 0,
                      lineHeight: 1
                    }}
                    title="Tutup Notifikasi"
                  >
                    ×
                  </button>
                </div>

                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.825rem', color: style.textColor, lineHeight: 1.4 }}>
                  {toast.message}
                </p>

                {toast.detail && (
                  <div style={{
                    marginTop: '0.4rem',
                    padding: '0.35rem 0.6rem',
                    background: 'rgba(0, 0, 0, 0.35)',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    color: '#e2e8f0',
                    borderLeft: `3px solid ${style.border}`,
                    wordBreak: 'break-word'
                  }}>
                    {toast.detail}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pop-Up Modal Dialog untuk Peringatan / Kesalahan Penting */}
      {modal && modal.isOpen && (
        <div
          className="no-print"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) alertStore.closeModal();
          }}
        >
          {(() => {
            const style = getTypeStyles(modal.type);

            return (
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: `1.5px solid ${style.border}`,
                  borderRadius: '16px',
                  boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px ${style.glow}`,
                  maxWidth: '460px',
                  width: '100%',
                  padding: '2rem',
                  textAlign: 'center',
                  backdropFilter: 'blur(20px)',
                  animation: 'modalZoomIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {/* Big Glow Icon */}
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: style.badgeBg,
                  border: `2px solid ${style.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  margin: '0 auto 1.25rem auto',
                  boxShadow: `0 0 20px ${style.glow}`
                }}>
                  {style.icon}
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#ffffff' }}>
                  {modal.title}
                </h3>

                <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                  {modal.message}
                </p>

                {modal.detail && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(0, 0, 0, 0.4)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-mono)',
                    color: '#94a3b8',
                    textAlign: 'left',
                    marginBottom: '1.5rem',
                    lineHeight: 1.45,
                    whiteSpace: 'pre-line'
                  }}>
                    {modal.detail}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                  {modal.showCancel && (
                    <button
                      onClick={() => {
                        if (modal.onCancel) modal.onCancel();
                        alertStore.closeModal();
                      }}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '0.7rem 1.2rem' }}
                    >
                      {modal.cancelText || 'Batal'}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (modal.onConfirm) modal.onConfirm();
                      alertStore.closeModal();
                    }}
                    className={`btn ${modal.type === 'error' ? 'btn-danger' : modal.type === 'warning' ? 'btn-warning' : 'btn-primary'}`}
                    style={{ flex: 1, padding: '0.7rem 1.2rem', fontWeight: 700 }}
                  >
                    {modal.confirmText || 'Mengerti & Tutup'}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </>
  );
};

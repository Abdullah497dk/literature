import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Emin misiniz?',
  message = 'Bu işlem geri alınamaz. Devam etmek istediğinize emin misiniz?',
  confirmText = 'Evet, Devam Et',
  cancelText = 'Vazgeç',
  variant = 'danger', // danger or primary
  loading = false
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="460px">
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div 
          style={{
            background: variant === 'danger' ? 'var(--color-danger-bg)' : 'var(--accent-purple-subtle)',
            color: variant === 'danger' ? 'var(--color-danger)' : 'var(--accent-purple)',
            borderRadius: '12px',
            padding: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <AlertTriangle size={24} />
        </div>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
            {message}
          </p>
        </div>
      </div>

      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '0.75rem', 
          marginTop: '1.75rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-color)'
        }}
      >
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button 
          variant={variant} 
          onClick={onConfirm} 
          loading={loading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;

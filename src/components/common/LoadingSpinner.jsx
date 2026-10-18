import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ text = 'Yükleniyor...', size = 'md', className = '' }) {
  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 36 : 24;

  return (
    <div 
      className={`flex items-center justify-center ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: '2.5rem',
        color: 'var(--accent-purple)'
      }}
    >
      <Loader2 
        size={iconSize} 
        style={{ animation: 'spin 1s linear infinite' }} 
      />
      {text && (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {text}
        </span>
      )}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default LoadingSpinner;

import React from 'react';
import { Button } from './Button';

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  className = ''
}) {
  return (
    <div 
      className={`dvlp-card ${className}`} 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3rem 2rem',
        borderStyle: 'dashed'
      }}
    >
      {Icon && (
        <div 
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'var(--bg-secondary)',
            color: 'var(--accent-purple)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            border: '1px solid var(--border-color)'
          }}
        >
          <Icon size={28} />
        </div>
      )}
      <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        {title}
      </h3>
      {description && (
        <p style={{ maxWidth: '420px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: actionLabel ? '1.5rem' : 0 }}>
          {description}
        </p>
      )}
      {actionLabel && (
        <Button variant="primary" icon={actionIcon} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;

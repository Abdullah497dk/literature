import React from 'react';

export function Input({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  type = 'text',
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ width: '100%', marginBottom: '1rem' }} className={className}>
      {label && (
        <label htmlFor={inputId} className="dvlp-label">
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <span 
            style={{ 
              position: 'absolute', 
              left: '0.85rem', 
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none'
            }}
          >
            <Icon size={18} />
          </span>
        )}
        <input
          id={inputId}
          type={type}
          className="dvlp-input"
          style={{
            paddingLeft: Icon ? '2.5rem' : '1rem',
            borderColor: error ? 'var(--color-danger)' : undefined
          }}
          {...props}
        />
      </div>
      {error && (
        <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.35rem' }}>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.35rem' }}>
          {helperText}
        </p>
      )}
    </div>
  );
}

export function Textarea({
  label,
  error,
  helperText,
  className = '',
  id,
  rows = 4,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ width: '100%', marginBottom: '1rem' }} className={className}>
      {label && (
        <label htmlFor={inputId} className="dvlp-label">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className="dvlp-textarea"
        style={{
          borderColor: error ? 'var(--color-danger)' : undefined,
          resize: 'vertical'
        }}
        {...props}
      />
      {error && (
        <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.35rem' }}>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.35rem' }}>
          {helperText}
        </p>
      )}
    </div>
  );
}

export default Input;

import React from 'react';

export function Select({
  label,
  error,
  helperText,
  options = [],
  children,
  className = '',
  id,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ width: '100%', marginBottom: '1rem' }} className={className}>
      {label && (
        <label htmlFor={selectId} className="dvlp-label">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className="dvlp-select"
        style={{
          borderColor: error ? 'var(--color-danger)' : undefined,
          cursor: 'pointer'
        }}
        {...props}
      >
        {children || options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
            {opt.label}
          </option>
        ))}
      </select>
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

export default Select;

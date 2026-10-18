import React from 'react';

export function Badge({
  children,
  variant = 'neutral', // purple, cyan, success, warning, danger, neutral
  icon: Icon,
  className = '',
  size = 'md'
}) {
  const variantClass = {
    purple: 'dvlp-badge-purple',
    cyan: 'dvlp-badge-cyan',
    success: 'dvlp-badge-success',
    warning: 'dvlp-badge-warning',
    danger: 'dvlp-badge-danger',
    neutral: 'dvlp-badge-neutral'
  }[variant] || 'dvlp-badge-neutral';

  return (
    <span 
      className={`dvlp-badge ${variantClass} ${className}`}
      style={{
        fontSize: size === 'sm' ? '0.7rem' : '0.775rem',
        padding: size === 'sm' ? '0.15rem 0.5rem' : '0.25rem 0.75rem'
      }}
    >
      {Icon && <Icon size={size === 'sm' ? 11 : 13} />}
      {children}
    </span>
  );
}

export default Badge;

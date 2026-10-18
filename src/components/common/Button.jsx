import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary', // primary, secondary, ghost, danger
  size = 'md', // sm, md, lg
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const variantClass = {
    primary: 'dvlp-btn-primary',
    secondary: 'dvlp-btn-secondary',
    ghost: 'dvlp-btn-ghost',
    danger: 'dvlp-btn-danger'
  }[variant] || 'dvlp-btn-primary';

  const sizeClass = {
    sm: 'dvlp-btn-sm',
    md: '',
    lg: 'dvlp-btn-lg'
  }[size] || '';

  return (
    <button
      type={type}
      className={`dvlp-btn ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} style={{ animation: 'spin 1s linear infinite' }} />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      ) : null}
      {children}
    </button>
  );
}

export default Button;

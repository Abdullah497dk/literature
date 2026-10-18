import React from 'react';

export function Card({
  children,
  className = '',
  glow = false,
  hoverable = false,
  onClick,
  style = {}
}) {
  return (
    <div
      className={`dvlp-card ${glow ? 'dvlp-card-glow' : ''} ${className}`}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        ...(hoverable ? { transition: 'transform 0.2s ease, border-color 0.2s ease' } : {}),
        ...style
      }}
    >
      {children}
    </div>
  );
}

export default Card;

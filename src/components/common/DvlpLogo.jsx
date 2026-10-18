import React from 'react';

/**
 * Official DVLP Brand Logo
 * Matches the official DVLP platform vector SVG artwork from dvlp.dev / kitchen-sink
 */
export function DvlpLogo({ 
  size = 'md', 
  showText = true, 
  className = '',
  subtitle = 'Edebiyat'
}) {
  const heights = {
    sm: 24,
    md: 32,
    lg: 42,
    xl: 52
  };

  const h = heights[size] || 32;
  const markWidth = Math.round(h * 0.875);
  const wordmarkWidth = Math.round(h * 3.6);

  return (
    <div 
      className={`inline-flex items-center select-none ${className}`} 
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}
    >
      {/* DVLP Gradient D-Mark */}
      <svg 
        viewBox="0 0 64 64" 
        width={markWidth} 
        height={h} 
        fill="none" 
        role="img" 
        aria-label="DVLP"
        style={{ flexShrink: 0 }}
      >
        <title>DVLP Mark</title>
        <defs>
          <linearGradient id="dvlp_grad_logo" x1="14" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
        <g fill="none" stroke="url(#dvlp_grad_logo)" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" opacity="0.22">
          <path d="M16 10 H34 C45 10 54 20 54 32 C54 44 45 54 34 54 H16 Z M24 18 H33 C41 18 46 24 46 32 C46 40 41 46 33 46 H24 Z" />
          <path d="M29 45 L40 30 L42.5 33 L44 21 L32.5 23 L35.5 26 L25 41 Z" />
        </g>
        <g fill="url(#dvlp_grad_logo)">
          <path d="M16 10 H34 C45 10 54 20 54 32 C54 44 45 54 34 54 H16 Z M24 18 H33 C41 18 46 24 46 32 C46 40 41 46 33 46 H24 Z" fillRule="evenodd" />
          <path d="M29 45 L40 30 L42.5 33 L44 21 L32.5 23 L35.5 26 L25 41 Z" />
        </g>
      </svg>

      {/* DVLP Wordmark + Subtitle */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <svg 
              viewBox="0 0 116 32" 
              width={wordmarkWidth * 0.75} 
              height={h * 0.62} 
              fill="none" 
              role="img" 
              aria-label="DVLP"
            >
              <defs>
                <linearGradient id="dvlp_wordmark_grad" x1="4" y1="16" x2="112" y2="16" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#8B5CF6" />
                  <stop offset="1" stopColor="#22D3EE" />
                </linearGradient>
              </defs>
              <g stroke="url(#dvlp_wordmark_grad)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 26 L6 6 C18 6 24 10 24 16 C24 22 18 26 6 26 Z" />
                <path d="M33 6 L43 26 L53 6" />
                <path d="M63 6 L63 26 L79 26" />
                <path d="M89 26 L89 6 L100 6 C106 6 108 9 108 12.5 C108 16 106 19 100 19 L89 19" />
              </g>
            </svg>
            {subtitle && (
              <span 
                style={{ 
                  color: 'var(--text-primary)', 
                  fontWeight: 600, 
                  fontSize: size === 'sm' ? '0.85rem' : size === 'lg' ? '1.25rem' : '1.05rem',
                  letterSpacing: '-0.02em',
                  fontFamily: 'var(--font-sans)'
                }}
              >
                {subtitle}
              </span>
            )}
          </div>
          <span 
            style={{ 
              color: 'var(--text-muted)', 
              fontSize: '0.65rem', 
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              fontWeight: 500
            }}
          >
            Edebiyat Platformu
          </span>
        </div>
      )}
    </div>
  );
}
export default DvlpLogo;

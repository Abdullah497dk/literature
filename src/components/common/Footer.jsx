import React from 'react';
import { Link } from 'react-router-dom';
import { DvlpLogo } from './DvlpLogo';
import { ExternalLink, Phone, Mail, Headphones, Heart } from 'lucide-react';
import { InstagramIcon } from './Icons';

export function Footer() {
  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: 'rgba(9, 9, 11, 0.75)',
        backdropFilter: 'blur(12px)',
        padding: '2rem 1.5rem 1.75rem 1.5rem',
        color: 'var(--text-secondary)',
        fontSize: '0.85rem'
      }}
      className="dvlp-app-footer"
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}
      >
        {/* Main Footer Row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1.25rem'
          }}
        >
          {/* Brand & Developed by statement */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <DvlpLogo size="sm" subtitle="Edebiyat" />
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(34, 211, 238, 0.2) 100%)',
                  color: 'var(--accent-cyan)',
                  border: '1px solid rgba(34, 211, 238, 0.3)'
                }}
              >
                PROD
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Bu platform, okulumuz edebiyat zümresi ve öğrencileri için{' '}
              <a
                href="https://dvlp-platform.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--accent-purple)',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px'
                }}
                className="hover-underline"
              >
                DVLP Platform <ExternalLink size={12} />
              </a>{' '}
              yazılım ekibi tarafından geliştirilmiştir.
            </p>
          </div>

          {/* Contact quick links */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            {/* Phone / WhatsApp */}
            <a
              href="tel:05431413099"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.78rem',
                transition: 'all 0.15s ease'
              }}
              className="dvlp-footer-chip"
              title="Destek Hattı (0543 141 30 99)"
            >
              <Phone size={13} style={{ color: '#10b981' }} />
              <span>0543 141 30 99</span>
            </a>

            {/* Email */}
            <a
              href="mailto:dvlp.platform@gmail.com"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.78rem',
                transition: 'all 0.15s ease'
              }}
              className="dvlp-footer-chip"
              title="E-posta: dvlp.platform@gmail.com"
            >
              <Mail size={13} style={{ color: 'var(--accent-purple)' }} />
              <span>dvlp.platform@gmail.com</span>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com/dvlp.platform"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.78rem',
                transition: 'all 0.15s ease'
              }}
              className="dvlp-footer-chip"
              title="Instagram: @dvlp.platform"
            >
              <InstagramIcon size={13} color="#ec4899" />
              <span>@dvlp.platform</span>
            </a>

            {/* Support Page Link */}
            <Link
              to="/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.85rem',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.18) 0%, rgba(34, 211, 238, 0.18) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.35)',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                fontSize: '0.78rem',
                fontWeight: 600,
                transition: 'all 0.15s ease'
              }}
              className="dvlp-footer-chip-highlight"
            >
              <Headphones size={13} style={{ color: 'var(--accent-cyan)' }} />
              <span>Destek & Geri Bildirim</span>
            </Link>
          </div>
        </div>

        {/* Bottom sub-row */}
        <div
          style={{
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}
        >
          <div>
            © {new Date().getFullYear()}{' '}
            <a
              href="https://dvlp-platform.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}
            >
              DVLP Platform
            </a>
            . Building Developers. Building the Future.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/contact" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
              İletişim & Geri Bildirim
            </Link>
            <span>•</span>
            <a
              href="https://dvlp-platform.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
            >
              dvlp-platform.vercel.app ↗
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .dvlp-footer-chip:hover {
          background-color: rgba(255, 255, 255, 0.08) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
          color: var(--text-primary) !important;
        }
        .dvlp-footer-chip-highlight:hover {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(34, 211, 238, 0.3) 100%) !important;
          border-color: rgba(34, 211, 238, 0.5) !important;
        }
      `}</style>
    </footer>
  );
}

export default Footer;

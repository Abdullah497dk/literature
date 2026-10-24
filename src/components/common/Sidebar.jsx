import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  GraduationCap,
  UploadCloud,
  FileCheck2,
  Users,
  Shield,
  Layers,
  Inbox,
  Bell,
  User,
  Settings,
  BookOpen,
  Headphones,
  ExternalLink
} from 'lucide-react';

export function Sidebar({ isOpen, onClose }) {
  const { role } = useAuth();

  const studentLinks = [
    { to: '/dashboard', label: 'Gösterge Paneli', icon: LayoutDashboard },
    { to: '/my-class', label: 'Sınıfım', icon: GraduationCap },
    { to: '/submissions/new', label: 'Ödev Yükle', icon: UploadCloud },
    { to: '/notifications', label: 'Bildirimler', icon: Bell },
    { to: '/contact', label: 'Destek & İletişim', icon: Headphones },
    { to: '/profile', label: 'Profilim', icon: User },
    { to: '/settings', label: 'Ayarlar', icon: Settings }
  ];

  const teacherLinks = [
    { to: '/dashboard', label: 'Öğretmen Paneli', icon: LayoutDashboard },
    { to: '/teacher/classes', label: 'Sınıflarım', icon: Layers },
    { to: '/teacher/assignments', label: 'Ödev Başlıkları', icon: BookOpen },
    { to: '/teacher/requests', label: 'Katılım Talepleri', icon: Inbox },
    { to: '/notifications', label: 'Bildirimler', icon: Bell },
    { to: '/contact', label: 'Destek & İletişim', icon: Headphones },
    { to: '/profile', label: 'Profilim', icon: User },
    { to: '/settings', label: 'Ayarlar', icon: Settings }
  ];

  const adminLinks = [
    { to: '/admin', label: 'Yönetim Paneli', icon: Shield },
    { to: '/admin/users', label: 'Kullanıcılar', icon: Users },
    { to: '/admin/classes', label: 'Sınıf Yönetimi', icon: Layers },
    { to: '/admin/assignments', label: 'Ödev Konuları', icon: BookOpen },
    { to: '/admin/requests', label: 'Katılım Talepleri', icon: Inbox },
    { to: '/admin/submissions', label: 'Tüm Ödevler', icon: FileCheck2 },
    { to: '/notifications', label: 'Bildirimler', icon: Bell },
    { to: '/contact', label: 'Destek & İletişim', icon: Headphones },
    { to: '/profile', label: 'Profilim', icon: User },
    { to: '/settings', label: 'Ayarlar', icon: Settings }
  ];

  const links = role === 'admin' ? adminLinks : role === 'teacher' ? teacherLinks : studentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            zIndex: 45,
            backdropFilter: 'blur(2px)'
          }}
        />
      )}

      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: '64px',
          bottom: 0,
          left: 0,
          zIndex: 46,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          // When viewport is wide, always show
          '@media (minWidth: 1024px)': {
            transform: 'translateX(0)'
          }
        }}
        className="dvlp-sidebar"
      >
        {/* Navigation list */}
        <div style={{ flex: 1, padding: '1.25rem 0.85rem', overflowY: 'auto' }}>
          <div 
            style={{ 
              fontSize: '0.7rem', 
              fontWeight: 600, 
              color: 'var(--text-muted)', 
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '0 0.75rem 0.6rem 0.75rem'
            }}
          >
            {role === 'admin' ? 'Yönetici Alanı' : role === 'teacher' ? 'Öğretmen Alanı' : 'Öğrenci Alanı'}
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/dashboard' || link.to === '/admin'}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                    background: isActive ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    border: isActive ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent'
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={18}
                        style={{
                          color: isActive ? 'var(--accent-purple)' : 'var(--text-muted)',
                          transition: 'color 0.15s ease'
                        }}
                      />
                      <span>{link.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Brand signature in footer */}
        <div
          style={{
            padding: '1rem 1.15rem',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-primary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                DVLP Platform
              </span>
              <span 
                style={{ 
                  fontSize: '0.62rem', 
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(34, 211, 238, 0.2) 100%)', 
                  color: 'var(--accent-cyan)', 
                  padding: '0.1rem 0.45rem', 
                  borderRadius: '9999px',
                  fontWeight: 700,
                  border: '1px solid rgba(34, 211, 238, 0.3)'
                }}
              >
                PROD v1.0
              </span>
            </div>
          </div>
          
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: '0 0 0.65rem 0' }}>
            Bu sistem okulumuz için <strong>DVLP</strong> tarafından geliştirilmiştir.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <a
              href="https://dvlp-platform.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.72rem',
                color: 'var(--accent-purple)',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
              title="DVLP Ana Web Sitesi"
            >
              <span>dvlp-platform ↗</span>
            </a>

            <NavLink
              to="/contact"
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              style={{
                fontSize: '0.7rem',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)'
              }}
            >
              Destek Hattı
            </NavLink>
          </div>
        </div>
      </aside>

      <style>{`
        @media (min-width: 1024px) {
          .dvlp-sidebar {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </>
  );
}

export default Sidebar;

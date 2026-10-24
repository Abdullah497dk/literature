import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { DvlpLogo } from './DvlpLogo';
import { Badge } from './Badge';
import { 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  Menu, 
  X,
  CheckCircle,
  FileText,
  MessageSquare,
  UserPlus,
  ChevronDown,
  Headphones,
  ExternalLink
} from 'lucide-react';

export function Navbar({ onToggleSidebar, isSidebarOpen }) {
  const { profile, role, signOut } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on route changes
  useEffect(() => {
    setShowNotifDropdown(false);
    setShowUserDropdown(false);
  }, [location.pathname]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return <Badge variant="warning" size="sm">Yönetici</Badge>;
      case 'teacher':
        return <Badge variant="purple" size="sm">Öğretmen</Badge>;
      default:
        return <Badge variant="cyan" size="sm">Öğrenci</Badge>;
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'review_completed':
        return <CheckCircle size={15} style={{ color: 'var(--color-success)' }} />;
      case 'feedback_added':
        return <MessageSquare size={15} style={{ color: 'var(--accent-purple)' }} />;
      case 'membership_approved':
      case 'membership_rejected':
        return <UserPlus size={15} style={{ color: 'var(--accent-cyan)' }} />;
      default:
        return <FileText size={15} style={{ color: 'var(--text-secondary)' }} />;
    }
  };

  const initials = profile?.full_name 
    ? profile.full_name.trim().split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <>
      <header
        style={{
          height: '66px',
          backgroundColor: 'rgba(9, 9, 11, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1rem',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.45)'
        }}
        className="dvlp-navbar-header"
      >
        {/* Subtle top glow line */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.6) 30%, rgba(34, 211, 238, 0.6) 70%, transparent 100%)'
          }}
        />

        {/* Left: Mobile Toggle & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
          <button
            type="button"
            onClick={onToggleSidebar}
            style={{
              background: isSidebarOpen ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              color: isSidebarOpen ? 'var(--accent-purple)' : 'var(--text-secondary)',
              cursor: 'pointer',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '10px',
              transition: 'all 0.18s ease',
              flexShrink: 0
            }}
            aria-label="Menüyü Aç/Kapat"
            title="Menüyü Aç/Kapat"
          >
            {isSidebarOpen ? <X size={19} /> : <Menu size={19} />}
          </button>

          <Link 
            to="/dashboard" 
            style={{ 
              textDecoration: 'none', 
              display: 'flex', 
              alignItems: 'center',
              minWidth: 0
            }}
          >
            <DvlpLogo size="sm" subtitle="Edebiyat" />
          </Link>
        </div>

        {/* Right: Actions, Notifications, User Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {/* Role Badge (visible on medium screens & up) */}
          <div className="dvlp-navbar-role-badge">
            {getRoleBadge()}
          </div>

          {/* Notifications Dropdown */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                setShowUserDropdown(false);
              }}
              style={{
                background: showNotifDropdown ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: showNotifDropdown ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid var(--border-color)',
                color: showNotifDropdown ? 'var(--accent-purple)' : 'var(--text-secondary)',
                cursor: 'pointer',
                width: '38px',
                height: '38px',
                borderRadius: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                transition: 'all 0.18s ease'
              }}
              aria-label="Bildirimler"
              title="Bildirimler"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    backgroundColor: 'var(--accent-purple)',
                    color: '#ffffff',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    minWidth: '18px',
                    height: '18px',
                    padding: '0 4px',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 10px rgba(139, 92, 246, 0.75)',
                    border: '2px solid var(--bg-primary)'
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '46px',
                  right: '-6px',
                  width: 'min(340px, calc(100vw - 1.5rem))',
                  maxHeight: '440px',
                  overflowY: 'auto',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-lg), 0 0 24px rgba(0, 0, 0, 0.6)',
                  padding: '0.75rem',
                  zIndex: 100,
                  animation: 'fadeIn 0.18s ease-out'
                }}
              >
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.4rem 0.5rem 0.65rem 0.5rem',
                    borderBottom: '1px solid var(--border-color-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      Bildirimler
                    </span>
                    {unreadCount > 0 && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent-purple)', background: 'rgba(139, 92, 246, 0.15)', padding: '0.1rem 0.45rem', borderRadius: '9999px', fontWeight: 600 }}>
                        {unreadCount} yeni
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent-cyan)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        padding: '0.2rem 0.4rem',
                        borderRadius: '6px'
                      }}
                    >
                      Tümünü Okundu Say
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Henüz bildiriminiz bulunmuyor.
                    </div>
                  ) : (
                    notifications.slice(0, 6).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        style={{
                          padding: '0.65rem',
                          borderRadius: '10px',
                          background: notif.read_at ? 'transparent' : 'rgba(139, 92, 246, 0.08)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.6rem',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <div style={{ marginTop: '2px', flexShrink: 0 }}>
                          {getNotifIcon(notif.type)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {notif.title}
                          </div>
                          <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '2px', wordBreak: 'break-word' }}>
                            {notif.message}
                          </div>
                          <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            {new Date(notif.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--border-color-subtle)', marginTop: '0.5rem', paddingTop: '0.5rem', textAlign: 'center' }}>
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotifDropdown(false)}
                    style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 500, display: 'inline-block', padding: '0.25rem' }}
                  >
                    Tüm Bildirimleri Gör →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Quick Settings Icon Button (Direct access for phones and laptops) */}
          <Link
            to="/settings"
            style={{
              background: location.pathname === '/settings' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.04)',
              border: location.pathname === '/settings' ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid var(--border-color)',
              color: location.pathname === '/settings' ? 'var(--accent-purple)' : 'var(--text-secondary)',
              width: '38px',
              height: '38px',
              borderRadius: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              transition: 'all 0.18s ease'
            }}
            aria-label="Ayarlar"
            title="Ayarlar"
          >
            <Settings size={18} />
          </Link>

          {/* User Profile Avatar & Dropdown */}
          <div style={{ position: 'relative' }} ref={userRef}>
            <button
              type="button"
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowNotifDropdown(false);
              }}
              style={{
                background: showUserDropdown ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                padding: '0.25rem 0.5rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'all 0.18s ease',
                height: '38px'
              }}
              aria-label="Kullanıcı Menüsü"
              title={profile?.full_name || 'Kullanıcı Menüsü'}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '9px',
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(139, 92, 246, 0.35)'
                }}
              >
                {initials}
              </div>
              <span className="dvlp-navbar-username">
                {profile?.full_name || 'Kullanıcı'}
              </span>
              <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
            </button>

            {showUserDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '46px',
                  right: 0,
                  width: 'min(240px, calc(100vw - 1.5rem))',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-lg), 0 0 24px rgba(0, 0, 0, 0.6)',
                  padding: '0.5rem',
                  zIndex: 100,
                  animation: 'fadeIn 0.18s ease-out'
                }}
              >
                <div style={{ padding: '0.65rem', borderBottom: '1px solid var(--border-color-subtle)' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {profile?.full_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                    {profile?.email || 'dvlp user'}
                  </div>
                  <div style={{ marginTop: '0.45rem' }}>
                    {getRoleBadge()}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', padding: '0.4rem 0' }}>
                  <Link
                    to="/profile"
                    onClick={() => setShowUserDropdown(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '10px',
                      color: 'var(--text-secondary)',
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <User size={16} style={{ color: 'var(--accent-purple)' }} /> Profilim
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setShowUserDropdown(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '10px',
                      color: 'var(--text-secondary)',
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Settings size={16} style={{ color: 'var(--accent-cyan)' }} /> Ayarlar
                  </Link>
                  <Link
                    to="/contact"
                    onClick={() => setShowUserDropdown(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '10px',
                      color: 'var(--text-secondary)',
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Headphones size={16} style={{ color: '#10b981' }} /> Destek & İletişim
                  </Link>
                  <a
                    href="https://dvlp-platform.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowUserDropdown(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.6rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '10px',
                      color: 'var(--accent-purple)',
                      fontSize: '0.825rem',
                      fontWeight: 500,
                      textDecoration: 'none',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <ExternalLink size={15} /> DVLP Platform
                    </div>
                    <span style={{ fontSize: '0.65rem', background: 'rgba(139, 92, 246, 0.15)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                      dvlp.dev
                    </span>
                  </a>
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '10px',
                      color: 'var(--color-danger)',
                      fontSize: '0.85rem',
                      background: 'transparent',
                      border: 'none',
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-danger-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={16} /> Çıkış Yap
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <style>{`
        .dvlp-navbar-header {
          padding: 0 1.25rem;
        }
        .dvlp-navbar-role-badge {
          display: none;
        }
        .dvlp-navbar-username {
          display: none;
          font-size: 0.85rem;
          font-weight: 500;
          max-width: 110px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        @media (min-width: 640px) {
          .dvlp-navbar-header {
            padding: 0 1.5rem;
          }
          .dvlp-navbar-role-badge {
            display: block;
          }
        }

        @media (min-width: 768px) {
          .dvlp-navbar-username {
            display: block;
          }
        }
      `}</style>
    </>
  );
}

export default Navbar;

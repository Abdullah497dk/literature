import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  UserPlus
} from 'lucide-react';

export function Navbar({ onToggleSidebar, isSidebarOpen }) {
  const { profile, role, signOut } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const navigate = useNavigate();

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

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}
    >
      {/* Left: Mobile Toggle & Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          type="button"
          onClick={onToggleSidebar}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '8px'
          }}
          aria-label="Menüyü Aç/Kapat"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <DvlpLogo size="sm" subtitle="Edebiyat" />
        </Link>
      </div>

      {/* Right: Role, Notifications, User Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'none', md: 'block' }}>
          {getRoleBadge()}
        </div>

        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => {
              setShowNotifDropdown(!showNotifDropdown);
              setShowUserDropdown(false);
            }}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'all 0.15s ease'
            }}
            aria-label="Bildirimler"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--accent-purple)',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 8px rgba(139, 92, 246, 0.6)'
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
                right: 0,
                width: '340px',
                maxHeight: '420px',
                overflowY: 'auto',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.75rem',
                zIndex: 100
              }}
            >
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.5rem 0.75rem 0.5rem',
                  borderBottom: '1px solid var(--border-color-subtle)'
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Bildirimler
                </span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent-cyan)',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    Tümünü Okundu İşaretle
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
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
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {notif.title}
                        </div>
                        <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
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
                  style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 500 }}
                >
                  Tüm Bildirimleri Gör →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => {
              setShowUserDropdown(!showUserDropdown);
              setShowNotifDropdown(false);
            }}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '0.35rem 0.75rem',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'border-color 0.15s ease'
            }}
          >
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%)',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {profile?.full_name ? profile.full_name[0].toUpperCase() : 'U'}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 500, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.full_name || 'Kullanıcı'}
            </span>
          </button>

          {showUserDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '200px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.5rem',
                zIndex: 100
              }}
            >
              <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color-subtle)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {profile?.full_name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {profile?.email || 'dvlp user'}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', padding: '0.4rem 0' }}>
                <Link
                  to="/profile"
                  onClick={() => setShowUserDropdown(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.65rem',
                    borderRadius: '8px',
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem',
                    textDecoration: 'none'
                  }}
                >
                  <User size={15} /> Profilim
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setShowUserDropdown(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.65rem',
                    borderRadius: '8px',
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem',
                    textDecoration: 'none'
                  }}
                >
                  <Settings size={15} /> Ayarlar
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.65rem',
                    borderRadius: '8px',
                    color: 'var(--color-danger)',
                    fontSize: '0.85rem',
                    background: 'transparent',
                    border: 'none',
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <LogOut size={15} /> Çıkış Yap
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;

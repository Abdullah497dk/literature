import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ShieldAlert, LogOut } from 'lucide-react';
import { Button } from '../common/Button';

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, isActive, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner text="Oturum doğrulanıyor..." size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Deactivated user check
  if (!isActive) {
    return (
      <div 
        style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '1.5rem',
          backgroundColor: 'var(--bg-primary)'
        }}
      >
        <div 
          className="dvlp-card" 
          style={{ maxWidth: '480px', textAlign: 'center', padding: '2.5rem 2rem' }}
        >
          <div 
            style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '20px', 
              backgroundColor: 'var(--color-danger-bg)', 
              color: 'var(--color-danger)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1.5rem auto' 
            }}
          >
            <ShieldAlert size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Hesabınız Devre Dışı Bırakıldı
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
            Bu hesap bir yönetici tarafından dondurulmuştur. Erişim izni veya hesap kurtarma için okul idaresi veya sistem yöneticiniz ile iletişime geçiniz.
          </p>
          <Button variant="secondary" icon={LogOut} onClick={() => signOut()}>
            Çıkış Yap
          </Button>
        </div>
      </div>
    );
  }

  // Role authorization check
  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div 
        style={{ 
          minHeight: '60vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '2rem' 
        }}
      >
        <div className="dvlp-card" style={{ maxWidth: '480px', textAlign: 'center', padding: '2.5rem' }}>
          <div 
            style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '16px', 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: 'var(--color-danger)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1.25rem auto' 
            }}
          >
            <ShieldAlert size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Erişim Yetkiniz Bulunmuyor</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Bu sayfayı görüntülemek için gerekli rol yetkisine sahip değilsiniz.
          </p>
          <Navigate to="/dashboard" replace />
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;

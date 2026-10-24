import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ShieldAlert, LogOut, Clock, RefreshCw, UserCheck, Mail, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '../common/Button';

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, role, accountStatus, isApproved, isActive, loading, signOut, reloadProfile } = useAuth();
  const location = useLocation();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await reloadProfile();
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

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

  // Missing or incomplete profile fallback (fail safe)
  if (!profile) {
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
              backgroundColor: 'rgba(234, 179, 8, 0.15)', 
              color: 'var(--color-warning)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1.5rem auto' 
            }}
          >
            <AlertTriangle size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Profil Senkronizasyonu Bekleniyor
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
            Kullanıcı profiliniz hazırlanıyor veya geçici bir bağlantı gecikmesi yaşanıyor. Lütfen durumu tekrar kontrol ediniz.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Button 
              variant="primary" 
              icon={RefreshCw} 
              loading={refreshing} 
              onClick={handleRefresh}
            >
              Tekrar Dene
            </Button>
            <Button variant="secondary" icon={LogOut} onClick={() => signOut()}>
              Çıkış Yap
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Account status check: Pending Approval
  if (accountStatus === 'pending') {
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
          style={{ maxWidth: '520px', textAlign: 'center', padding: '2.5rem 2rem' }}
        >
          <div 
            style={{ 
              width: '68px', 
              height: '68px', 
              borderRadius: '22px', 
              backgroundColor: 'rgba(245, 158, 11, 0.15)', 
              color: '#f59e0b',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1.5rem auto',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.2)'
            }}
          >
            <Clock size={34} />
          </div>

          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.25rem 0.85rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '1rem',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}
          >
            <Clock size={13} />
            Yönetici Onayı Bekleniyor
          </div>

          <h2 style={{ fontSize: '1.45rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Hoş Geldiniz, {profile?.full_name || user?.email?.split('@')[0]}
          </h2>
          
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.93rem', lineHeight: '1.6' }}>
            E-posta adresiniz başarıyla doğrulandı! Edebiyat platformundaki ödevlere, sınıflara ve incelemelere erişebilmeniz için hesabınızın bir sistem yöneticisi veya öğretmen tarafından onaylanması gerekmektedir.
          </p>

          <div 
            style={{ 
              backgroundColor: 'var(--bg-secondary)', 
              borderRadius: '12px', 
              padding: '1rem 1.25rem', 
              textAlign: 'left',
              marginBottom: '1.75rem',
              fontSize: '0.88rem',
              border: '1px solid var(--border-color)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>E-posta:</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{user?.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Ad Soyad:</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{profile?.full_name || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Kayıtlı Rol:</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Öğrenci</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Durum:</span>
              <span style={{ color: '#fbbf24', fontWeight: 600 }}>Onay Sırasında</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="primary" 
              icon={RefreshCw} 
              loading={refreshing} 
              onClick={handleRefresh}
            >
              Durumu Yenile
            </Button>
            <Button variant="secondary" icon={LogOut} onClick={() => signOut()}>
              Çıkış Yap
            </Button>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Onay süreci geciktiyse veya desteğe ihtiyacınız varsa:{' '}
            <a href="/contact" style={{ color: 'var(--accent-cyan)', fontWeight: 600, textDecoration: 'none' }}>
              Destek & İletişim Hattı
            </a>
            {' '}(WhatsApp: 0543 141 30 99)
          </div>
        </div>
      </div>
    );
  }

  // Account status check: Rejected
  if (accountStatus === 'rejected') {
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
            Hesap Başvurusu Reddedildi
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
            Hesap onay talebiniz yönetici tarafından onaylanmamıştır. Bilgi almak için ders öğretmeniniz veya okul idaresi ile iletişime geçiniz.
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

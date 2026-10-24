import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DvlpLogo } from '../../components/common/DvlpLogo';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Mail, Lock, User, ArrowRight, Shield, BookOpen, GraduationCap, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export function Login() {
  const { signIn, signUp, resendConfirmationEmail, isSupabaseConfigured, switchDemoRole } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState(isSupabaseConfigured ? '' : 'ogrenci@dvlp.dev');
  const [password, setPassword] = useState(isSupabaseConfigured ? '' : 'dvlp123456');
  const [fullName, setFullName] = useState(isSupabaseConfigured ? '' : 'Ahmet Yılmaz');
  const [roleSelection, setRoleSelection] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Email confirmation & resend states
  const [unconfirmedEmail, setUnconfirmedEmail] = useState(null);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendStatus, setResendStatus] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleResendEmail = async (targetEmail) => {
    const emailToSend = targetEmail || email;
    if (!emailToSend) return;
    setResendingEmail(true);
    setResendStatus(null);
    try {
      const res = await resendConfirmationEmail(emailToSend);
      if (res.error) {
        setResendStatus({ 
          type: 'error', 
          message: res.error.message || 'E-posta gönderilemedi. Lütfen bir süre sonra tekrar deneyin.' 
        });
      } else {
        setResendStatus({ 
          type: 'success', 
          message: 'Doğrulama bağlantısı başarıyla tekrar gönderildi. Lütfen gelen kutunuzu ve Spam klasörünüzü kontrol edin.' 
        });
      }
    } catch (err) {
      setResendStatus({ 
        type: 'error', 
        message: err.message || 'Doğrulama e-postası gönderilirken bir hata oluştu.' 
      });
    } finally {
      setResendingEmail(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUnconfirmedEmail(null);
    setResendStatus(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          setError('Lütfen adınızı ve soyadınızı giriniz.');
          setLoading(false);
          return;
        }
        // Always force 'student' role on client-side registration
        const res = await signUp(email, password, fullName, 'student');
        if (!res.success) {
          setError(res.error?.message || 'Kayıt işlemi başarısız oldu.');
          setLoading(false);
          return;
        }

        if (res.isEmailConfirmationRequired) {
          setSignUpSuccess(true);
          setLoading(false);
          return;
        }
      } else {
        const res = await signIn(email, password);
        if (!res.success) {
          if (res.error?.isEmailNotConfirmed) {
            setUnconfirmedEmail(email);
            setError('');
          } else {
            setError(res.error?.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
          }
          setLoading(false);
          return;
        }
      }

      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Beklenmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role, defaultEmail, defaultName) => {
    setEmail(defaultEmail);
    setPassword('dvlp123456');
    setFullName(defaultName);
    setRoleSelection(role);
    setUnconfirmedEmail(null);
    setError('');
    if (!isSupabaseConfigured) {
      switchDemoRole(role);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        position: 'relative'
      }}
    >
      {/* Background Glow */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(34, 211, 238, 0.05) 70%, transparent 100%)',
          pointerEvents: 'none',
          filter: 'blur(60px)'
        }}
      />

      <div style={{ width: '100%', maxWidth: '440px', zIndex: 10 }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <DvlpLogo size="lg" subtitle="Edebiyat" className="justify-center" />
          <h1 style={{ fontSize: '1.5rem', marginTop: '1.25rem', marginBottom: '0.4rem', fontWeight: 600 }}>
            {isSignUp ? 'Hesap Oluştur' : 'Ödev ve İnceleme Girişi'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isSignUp 
              ? 'Yeni öğrenci hesabı oluşturun (Yönetici onayı gerektirir).' 
              : 'Edebiyat ödevlerinizi PDF olarak yükleyin veya inceleyin.'}
          </p>
        </div>

        {/* Demo Fast Login Switcher */}
        {!isSupabaseConfigured && !isSignUp && (
          <div 
            className="dvlp-card" 
            style={{ 
              marginBottom: '1.5rem', 
              padding: '0.85rem 1rem', 
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'rgba(139, 92, 246, 0.3)'
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Hızlı Giriş Seçimi (Demo)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleQuickFill('student', 'ogrenci@dvlp.dev', 'Ahmet Yılmaz')}
                style={{
                  background: roleSelection === 'student' ? 'rgba(34, 211, 238, 0.15)' : 'var(--bg-surface)',
                  border: `1px solid ${roleSelection === 'student' ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                  color: roleSelection === 'student' ? '#67e8f9' : 'var(--text-secondary)',
                  padding: '0.45rem',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem'
                }}
              >
                <GraduationCap size={13} /> Öğrenci
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('teacher', 'ogretmen@dvlp.dev', 'Emel Demir')}
                style={{
                  background: roleSelection === 'teacher' ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg-surface)',
                  border: `1px solid ${roleSelection === 'teacher' ? 'var(--accent-purple)' : 'var(--border-color)'}`,
                  color: roleSelection === 'teacher' ? '#c4b5fd' : 'var(--text-secondary)',
                  padding: '0.45rem',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem'
                }}
              >
                <BookOpen size={13} /> Öğretmen
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'admin@dvlp.dev', 'Kemal Arslan')}
                style={{
                  background: roleSelection === 'admin' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-surface)',
                  border: `1px solid ${roleSelection === 'admin' ? 'var(--color-warning)' : 'var(--border-color)'}`,
                  color: roleSelection === 'admin' ? '#fbbf24' : 'var(--text-secondary)',
                  padding: '0.45rem',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem'
                }}
              >
                <Shield size={13} /> Yönetici
              </button>
            </div>
          </div>
        )}

        {/* Main Form Card */}
        <div className="dvlp-card dvlp-card-glow" style={{ padding: '2rem' }}>
          {signUpSuccess ? (
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(34, 211, 238, 0.15)',
                  color: 'var(--accent-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto'
                }}
              >
                <Mail size={32} />
              </div>

              <h2 style={{ fontSize: '1.35rem', marginBottom: '0.6rem', color: 'var(--text-primary)' }}>
                E-posta Doğrulaması Gerekiyor
              </h2>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                Kayıt işleminiz başlatıldı! <strong>{email}</strong> adresinize bir doğrulama bağlantısı gönderdik. Lütfen gelen kutunuzu (ve Spam klasörünü) kontrol ederek e-postanızı onaylayınız.
              </p>

              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem',
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)',
                  textAlign: 'left',
                  marginBottom: '1.5rem',
                  border: '1px solid var(--border-color)',
                  lineHeight: '1.5'
                }}
              >
                💡 <strong>Bilgilendirme:</strong> E-postanızı doğruladıktan sonra hesabınız güvenlik nedeniyle <strong>yönetici onayına</strong> geçecektir. Yönetici onayının ardından platforma tam erişim sağlanır.
              </div>

              {resendStatus && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    marginBottom: '1.25rem',
                    backgroundColor: resendStatus.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'var(--color-danger-bg)',
                    color: resendStatus.type === 'success' ? '#4ade80' : '#f87171',
                    border: `1px solid ${resendStatus.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'var(--color-danger-border)'}`
                  }}
                >
                  {resendStatus.message}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Button
                  variant="secondary"
                  icon={RefreshCw}
                  loading={resendingEmail}
                  onClick={() => handleResendEmail(email)}
                >
                  Doğrulama E-postasını Tekrar Gönder
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setSignUpSuccess(false);
                    setIsSignUp(false);
                    setError('');
                    setUnconfirmedEmail(null);
                    setResendStatus(null);
                  }}
                >
                  Giriş Ekranına Dön
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Unconfirmed Email Action Banner */}
              {unconfirmedEmail && (
                <div
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    borderRadius: '12px',
                    padding: '1.1rem',
                    marginBottom: '1.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem', marginBottom: '0.75rem' }}>
                    <AlertCircle size={20} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontWeight: 600, color: '#fbbf24', fontSize: '0.92rem', marginBottom: '0.25rem' }}>
                        E-posta Doğrulaması Tamamlanmadı
                      </div>
                      <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        <strong>{unconfirmedEmail}</strong> adresine aktivasyon e-postası gönderilmiştir. Giriş yapabilmeniz için e-postadaki doğrulama bağlantısına tıklamanız gerekir.
                      </div>
                    </div>
                  </div>

                  {resendStatus && (
                    <div
                      style={{
                        padding: '0.6rem 0.8rem',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        marginBottom: '0.75rem',
                        backgroundColor: resendStatus.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'var(--color-danger-bg)',
                        color: resendStatus.type === 'success' ? '#4ade80' : '#f87171',
                        border: `1px solid ${resendStatus.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'var(--color-danger-border)'}`
                      }}
                    >
                      {resendStatus.message}
                    </div>
                  )}

                  <Button
                    variant="secondary"
                    size="sm"
                    icon={RefreshCw}
                    loading={resendingEmail}
                    onClick={() => handleResendEmail(unconfirmedEmail)}
                    style={{ width: '100%', fontSize: '0.82rem' }}
                  >
                    Doğrulama E-postasını Tekrar Gönder
                  </Button>
                </div>
              )}

              {/* General Error Banner */}
              {error && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--color-danger-bg)',
                    border: '1px solid var(--color-danger-border)',
                    borderRadius: '12px',
                    color: '#f87171',
                    fontSize: '0.85rem',
                    marginBottom: '1.25rem'
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {isSignUp && (
                  <Input
                    label="Ad Soyad"
                    placeholder="Örn: Ahmet Yılmaz"
                    icon={User}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                )}

                <Input
                  label="E-posta Adresi"
                  type="email"
                  placeholder="ornek@dvlp.dev"
                  icon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Input
                  label="Şifre"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                {!isSignUp && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.5rem', marginBottom: '1.25rem' }}>
                    <Link
                      to="/forgot-password"
                      style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                    >
                      Şifremi unuttum?
                    </Link>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  style={{ width: '100%', marginTop: '0.5rem' }}
                  icon={ArrowRight}
                >
                  {isSignUp ? 'Kayıt Talebi Oluştur' : 'Giriş Yap'}
                </Button>
              </form>

              {/* Switch Login/Signup */}
              <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {isSignUp ? 'Zaten hesabınız var mı?' : 'Henüz bir hesabınız yok mu?'}
                </span>{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                    setUnconfirmedEmail(null);
                    setResendStatus(null);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent-cyan)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {isSignUp ? 'Giriş Yap' : 'Kayıt Talebi Oluştur'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer brand note & support links */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Giriş veya kayıtla ilgili bir sorun mu yaşıyorsunuz?{' '}
            <Link to="/contact" style={{ color: 'var(--accent-cyan)', fontWeight: 600, textDecoration: 'none' }}>
              Destek & İletişim
            </Link>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Bu platform okulumuz için{' '}
            <a
              href="https://dvlp-platform.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent-purple)', fontWeight: 600, textDecoration: 'none' }}
            >
              DVLP Platform ↗
            </a>{' '}
            tarafından geliştirilmiştir.
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <a href="tel:05431413099" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
              📞 0543 141 30 99
            </a>
            <span>•</span>
            <a href="mailto:dvlp.platform@gmail.com" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
              ✉️ dvlp.platform@gmail.com
            </a>
            <span>•</span>
            <a href="https://instagram.com/dvlp.platform" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
              📷 @dvlp.platform
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

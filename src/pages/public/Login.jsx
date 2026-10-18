import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DvlpLogo } from '../../components/common/DvlpLogo';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Mail, Lock, User, ArrowRight, Shield, BookOpen, GraduationCap, AlertCircle } from 'lucide-react';

export function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('ogrenci@dvlp.dev');
  const [password, setPassword] = useState('dvlp123456');
  const [fullName, setFullName] = useState('Ahmet Yılmaz');
  const [roleSelection, setRoleSelection] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, isSupabaseConfigured, switchDemoRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          setError('Lütfen adınızı ve soyadınızı giriniz.');
          setLoading(false);
          return;
        }
        const res = await signUp(email, password, fullName, roleSelection);
        if (!res.success) {
          setError(res.error?.message || 'Kayıt işlemi başarısız oldu.');
          setLoading(false);
          return;
        }
      } else {
        const res = await signIn(email, password);
        if (!res.success) {
          setError(res.error?.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
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
              ? 'Öğrenci veya eğitimci hesabınızı oluşturun.' 
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
              {isSignUp ? 'Kayıt Ol ve Başla' : 'Giriş Yap'}
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
        </div>

        {/* Footer brand note */}
        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          DVLP Platform • Güvenli Edebiyat Ödevi Teslim Sistemi
        </div>
      </div>
    </div>
  );
}

export default Login;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth';
import { DvlpLogo } from '../../components/common/DvlpLogo';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: resetErr } = await authService.resetPasswordForEmail(email);
      if (resetErr) throw resetErr;
      setSent(true);
    } catch (err) {
      setError(err.message || 'Şifre sıfırlama isteği gönderilemedi.');
    } finally {
      setLoading(false);
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
        padding: '2rem 1.5rem'
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <DvlpLogo size="md" subtitle="Edebiyat" className="justify-center" />
          <h1 style={{ fontSize: '1.4rem', marginTop: '1.25rem', marginBottom: '0.4rem' }}>
            Şifre Sıfırlama
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Kayıtlı e-posta adresinizi girerek şifre sıfırlama bağlantısı talep edin.
          </p>
        </div>

        <div className="dvlp-card" style={{ padding: '2rem' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div 
                style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '50%', 
                  background: 'var(--color-success-bg)', 
                  color: 'var(--color-success)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 1.25rem auto' 
                }}
              >
                <CheckCircle2 size={30} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                E-posta Gönderildi
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                {email} adresine şifre sıfırlama talimatlarını içeren bir bağlantı gönderildi. Lütfen gelen kutunuzu kontrol edin.
              </p>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button variant="secondary" style={{ width: '100%' }}>
                  Giriş Ekranına Dön
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    background: 'var(--color-danger-bg)',
                    borderRadius: '10px',
                    color: 'var(--color-danger)',
                    fontSize: '0.85rem',
                    marginBottom: '1rem'
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
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

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                Sıfırlama Bağlantısı Gönder
              </Button>

              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <Link
                  to="/login"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)'
                  }}
                >
                  <ArrowLeft size={14} /> Giriş Ekranına Dön
                </Link>
              </div>
            </form>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Sorun mu yaşıyorsunuz?{' '}
          <Link to="/contact" style={{ color: 'var(--accent-cyan)', fontWeight: 600, textDecoration: 'none' }}>
            Destek & İletişim
          </Link>
          {' '}•{' '}
          <a
            href="https://dvlp-platform.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent-purple)', textDecoration: 'none' }}
          >
            DVLP Platform ↗
          </a>
        </div>
      </div>
    </div>
  );
}

export function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Şifreler birbiriyle eşleşmiyor.');
      return;
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter uzunluğunda olmalıdır.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: updateErr } = await authService.updatePassword(password);
      if (updateErr) throw updateErr;
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Şifre güncellenemedi.');
    } finally {
      setLoading(false);
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
        padding: '2rem 1.5rem'
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <DvlpLogo size="md" subtitle="Edebiyat" className="justify-center" />
          <h1 style={{ fontSize: '1.4rem', marginTop: '1.25rem', marginBottom: '0.4rem' }}>
            Yeni Şifre Belirleyin
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Hesabınız için güçlü ve yeni bir şifre belirleyin.
          </p>
        </div>

        <div className="dvlp-card" style={{ padding: '2rem' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <CheckCircle2 size={40} style={{ color: 'var(--color-success)', margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Şifreniz Güncellendi</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Yeni şifreniz başarıyla kaydedildi. Artık giriş yapabilirsiniz.
              </p>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button variant="primary" style={{ width: '100%' }}>
                  Giriş Yap
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div
                  style={{
                    padding: '0.75rem',
                    background: 'var(--color-danger-bg)',
                    borderRadius: '10px',
                    color: 'var(--color-danger)',
                    fontSize: '0.85rem',
                    marginBottom: '1rem'
                  }}
                >
                  {error}
                </div>
              )}

              <Input
                label="Yeni Şifre"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Şifre Tekrarı"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                Şifreyi Güncelle
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;

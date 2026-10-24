import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { DvlpLogo } from '../../components/common/DvlpLogo';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { InstagramIcon } from '../../components/common/Icons';
import {
  Phone,
  Mail,
  ExternalLink,
  MessageSquare,
  Send,
  Copy,
  CheckCircle2,
  ArrowLeft,
  HelpCircle,
  Sparkles,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export function Contact() {
  const { user, profile } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  // Form states
  const [category, setCategory] = useState('bug');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const phoneDisplay = '0543 141 30 99';
  const phoneRaw = '05431413099';
  const emailAddress = 'dvlp.platform@gmail.com';
  const instagramHandle = 'dvlp.platform';
  const mainSiteUrl = 'https://dvlp-platform.vercel.app';

  const categoryLabels = {
    bug: 'Hata Bildirimi (Bug / Sistem Aksaklığı)',
    feature: 'Öneri & Yeni Özellik İsteği',
    account: 'Giriş / Hesap Onayı Desteği',
    homework: 'Ödev Yükleme & PDF Problemi',
    teacher: 'Öğretmen / Sınıf Desteği',
    general: 'Genel Soru / Diğer'
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailAddress);
    setCopiedEmail(true);
    showToast('E-posta adresi panoya kopyalandı.');
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(phoneRaw);
    setCopiedPhone(true);
    showToast('Telefon numarası panoya kopyalandı.');
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      showToast('Lütfen bir mesaj yazınız.', 'danger');
      return;
    }

    setFormSubmitted(true);
    showToast('Talebiniz hazırlandı. İletişim kanalını seçebilirsiniz.');
  };

  const handleSendViaEmail = () => {
    const emailSubject = encodeURIComponent(
      `[DVLP Edebiyat - ${categoryLabels[category] || 'Destek'}] ${subject || 'Destek Talebi'}`
    );
    const emailBody = encodeURIComponent(
      `Ad Soyad: ${fullName || 'Belirtilmedi'}\n` +
      `E-posta: ${email || 'Belirtilmedi'}\n` +
      `Kategori: ${categoryLabels[category] || category}\n\n` +
      `Mesaj:\n${message}\n\n---\nGönderen Platform: DVLP Edebiyat Ödev Sistemi`
    );
    window.location.href = `mailto:${emailAddress}?subject=${emailSubject}&body=${emailBody}`;
  };

  const handleSendViaWhatsApp = () => {
    const waText = encodeURIComponent(
      `*Merhaba DVLP Ekibi,*\n` +
      `Edebiyat Platformu üzerinden yazıyorum.\n\n` +
      `*Ad Soyad:* ${fullName || 'Belirtilmedi'}\n` +
      `*Kategori:* ${categoryLabels[category] || category}\n` +
      `*Konu:* ${subject || 'Destek Talebi'}\n\n` +
      `*Mesaj:* ${message}`
    );
    window.open(`https://wa.me/905431413099?text=${waText}`, '_blank');
  };

  const faqs = [
    {
      q: 'Ödev yüklerken "Dosya boyutu hatası" alırsam ne yapmalıyım?',
      a: 'Sistem güvenliği ve sunucu verimliliği için PDF dosya boyutu üst sınırı 10 MB’dır. Eğer dosyanız bu boyuttan büyükse, online PDF sıkıştırma servisleri (örneğin Adobe Acrobat veya ilovepdf) ile dosyanızı kolayca küçültebilirsiniz.'
    },
    {
      q: 'Kayıt oldum fakat "Yönetici Onayı Bekleniyor" ekranında kaldım?',
      a: 'Okul ortamında güvenliğin sağlanması ve sadece yetkili öğrencilerin sınıflara erişmesi için tüm yeni hesaplar öğretmen veya okul yöneticisi onayı sonrasında aktif hale gelir. Ders öğretmeninizle iletişime geçebilir veya acil durumlarda WhatsApp hattımızdan destek isteyebilirsiniz.'
    },
    {
      q: 'Sınıfıma nasıl katılabilirim?',
      a: 'Öğretmeniniz sınıfa özel 6 haneli bir kod (Örn: EDB-10A) oluşturur. Gösterge panelindeki "Sınıfa Katıl" kutusuna bu kodu girerek sınıfınıza tek tıkla katılım talebi gönderebilirsiniz. Öğretmeniniz onayladığında tüm sınıf ödevlerine erişebilirsiniz.'
    },
    {
      q: 'Öğretmenimin verdiği puan ve değerlendirmeyi nerede görebilirim?',
      a: 'Ödevinizi teslim ettikten sonra "Gösterge Paneli" veya "Ödevlerim" sekmesinden ilgili ödevinize tıklayarak öğretmeninizin eklediği notları, geri bildirimleri ve inceleme durumunu anında görüntüleyebilirsiniz.'
    },
    {
      q: 'Cep telefonumdan sisteme girip ödev teslim edebilir miyim?',
      a: 'Evet! Platformumuz tüm mobil cihazlar, tabletler ve bilgisayarlarla %100 uyumludur. Telefonunuzdaki tarayıcıdan giriş yaparak kamera veya dosya yöneticinizdeki PDF dosyasını yükleyebilirsiniz.'
    }
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Top Navigation Bar */}
      <nav
        style={{
          height: '66px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(9, 9, 11, 0.88)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => (user ? navigate('/dashboard') : navigate('/login'))}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.45rem 0.75rem',
              borderRadius: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem',
              transition: 'all 0.15s ease'
            }}
          >
            <ArrowLeft size={16} />
            <span>{user ? 'Panele Dön' : 'Giriş Sayfası'}</span>
          </button>

          <Link to="/" style={{ textDecoration: 'none' }}>
            <DvlpLogo size="sm" subtitle="Edebiyat" />
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <a
            href={mainSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '10px',
              background: 'rgba(139, 92, 246, 0.12)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: 'var(--accent-purple)',
              textDecoration: 'none',
              fontSize: '0.825rem',
              fontWeight: 600,
              transition: 'all 0.15s ease'
            }}
          >
            <span>dvlp-platform.vercel.app</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </nav>

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          maxWidth: '1100px',
          width: '100%',
          margin: '0 auto',
          padding: '2.5rem 1.25rem 4rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2.5rem'
        }}
      >
        {/* Hero Section */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.95rem',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(34, 211, 238, 0.15) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: 'var(--accent-cyan)',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '1.25rem'
            }}
          >
            <Sparkles size={14} />
            DVLP Platform Destek & Geri Bildirim Merkezi
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
              marginBottom: '0.85rem',
              background: 'linear-gradient(135deg, #ffffff 30%, rgba(255, 255, 255, 0.7) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Nasıl Yardımcı Olabiliriz?
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
            Edebiyat platformumuz okulumuzda aktif olarak kullanılmaktadır. Sistemle ilgili teknik sorularınız,
            önerileriniz veya hesap desteği için dilediğiniz iletişim kanalı üzerinden doğrudan geliştirici ekibimize ulaşabilirsiniz.
          </p>
        </div>

        {/* 4 Official Contact Channels Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {/* Channel 1: Phone / WhatsApp */}
          <Card
            glow
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '80px',
                height: '80px',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                pointerEvents: 'none'
              }}
            />
            <div>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}
              >
                <Phone size={22} />
              </div>

              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Hızlı Destek & WhatsApp
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.35rem 0 0.5rem 0' }}>
                {phoneDisplay}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                Acil teknik sorunlar ve anlık bildirimler için WhatsApp veya doğrudan arama.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
              <a
                href={`tel:${phoneRaw}`}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#10b981',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'all 0.15s ease'
                }}
              >
                <Phone size={14} />
                <span>Ara</span>
              </a>

              <a
                href={`https://wa.me/905431413099?text=${encodeURIComponent('Merhaba DVLP Ekibi, Edebiyat Platformu ile ilgili desteğe ihtiyacım var.')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1.3,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem',
                  borderRadius: '10px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'all 0.15s ease'
                }}
              >
                <MessageSquare size={14} />
                <span>WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleCopyPhone}
                style={{
                  padding: '0.55rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: copiedPhone ? '#10b981' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
                title="Numarayı Kopyala"
              >
                {copiedPhone ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </Card>

          {/* Channel 2: Gmail / Email */}
          <Card
            glow
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '80px',
                height: '80px',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.18) 0%, transparent 70%)',
                pointerEvents: 'none'
              }}
            />
            <div>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: 'rgba(139, 92, 246, 0.15)',
                  color: 'var(--accent-purple)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}
              >
                <Mail size={22} />
              </div>

              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Resmi Destek & E-Posta
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0.35rem 0 0.5rem 0', wordBreak: 'break-all' }}>
                {emailAddress}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                Detaylı hata bildirimleri, ekran görüntüleri ve kurumsal talepleriniz için.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
              <a
                href={`mailto:${emailAddress}?subject=DVLP%20Edebiyat%20Platformu%20Destek`}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  color: 'var(--accent-purple)',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'all 0.15s ease'
                }}
              >
                <Mail size={14} />
                <span>E-posta Gönder</span>
              </a>

              <button
                type="button"
                onClick={handleCopyEmail}
                style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: copiedEmail ? 'var(--color-success)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.8rem'
                }}
                title="E-posta Adresini Kopyala"
              >
                {copiedEmail ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                <span>{copiedEmail ? 'Kopyalandı' : 'Kopyala'}</span>
              </button>
            </div>
          </Card>

          {/* Channel 3: Instagram */}
          <Card
            glow
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '80px',
                height: '80px',
                background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)',
                pointerEvents: 'none'
              }}
            />
            <div>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: 'rgba(236, 72, 153, 0.15)',
                  color: '#ec4899',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}
              >
                <InstagramIcon size={22} color="#ec4899" />
              </div>

              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ec4899', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Sosyal Medya & DM
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.35rem 0 0.5rem 0' }}>
                @{instagramHandle}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                DVLP Platformu Instagram hesabı üzerinden DM ile bize ulaşın ve güncellemeleri takip edin.
              </p>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <a
                href={`https://instagram.com/${instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  width: '100%',
                  padding: '0.55rem',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 14px rgba(236, 72, 153, 0.35)'
                }}
              >
                <InstagramIcon size={14} color="#ffffff" />
                <span>Instagram’da Aç ↗</span>
              </a>
            </div>
          </Card>

          {/* Channel 4: DVLP Main Site */}
          <Card
            glow
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '80px',
                height: '80px',
                background: 'radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%)',
                pointerEvents: 'none'
              }}
            />
            <div>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: 'rgba(34, 211, 238, 0.15)',
                  color: 'var(--accent-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}
              >
                <ExternalLink size={22} />
              </div>

              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Resmi Geliştirici Sitesi
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0.35rem 0 0.5rem 0' }}>
                dvlp-platform.vercel.app
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                DVLP ekibinin geliştirdiği diğer eğitim ve yazılım projelerini keşfedin.
              </p>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <a
                href={mainSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  width: '100%',
                  padding: '0.55rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(34, 211, 238, 0.15)',
                  border: '1px solid rgba(34, 211, 238, 0.4)',
                  color: 'var(--accent-cyan)',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'all 0.15s ease'
                }}
              >
                <span>DVLP Sitesine Git ↗</span>
              </a>
            </div>
          </Card>
        </div>

        {/* Company & Product Showcase Banner */}
        <div
          style={{
            padding: '1.75rem 2rem',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(34, 211, 238, 0.08) 50%, rgba(9, 9, 11, 0.8) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', minWidth: '280px', flex: 1 }}>
            <DvlpLogo size="lg" subtitle="Edebiyat" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Geliştirici: DVLP Platform
                </span>
                <Badge variant="purple" size="sm">Yazılım Çözümü</Badge>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '580px' }}>
                Bu okul edebiyat projesi, öğretmen ve öğrencilerimizin ödev takip, geri bildirim ve arşivleme süreçlerini
                tamamen dijitalleştirmek amacıyla <strong>DVLP</strong> tarafından geliştirilerek Vercel bulut altyapısında yayına alınmıştır.
              </p>
            </div>
          </div>

          <a
            href={mainSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.85rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)',
              flexShrink: 0
            }}
          >
            <span>DVLP Ana Sayfası</span>
            <ExternalLink size={15} />
          </a>
        </div>

        {/* Support & Feedback Interactive Form */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Form */}
          <Card glow style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'rgba(139, 92, 246, 0.15)',
                  color: 'var(--accent-purple)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <MessageSquare size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Geri Bildirim & Destek Formu</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Sorununuzu veya önerinizi yazın, size hızla geri dönelim.
                </p>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Select
                label="Konu / Kategori"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={[
                  { value: 'bug', label: '🐛 Hata Bildirimi (Bug / Sistem Hatası)' },
                  { value: 'feature', label: '💡 Öneri & Yeni Özellik İsteği' },
                  { value: 'account', label: '🔐 Giriş / Hesap Onayı Desteği' },
                  { value: 'homework', label: '📚 Ödev Yükleme & PDF Problemi' },
                  { value: 'teacher', label: '🎓 Öğretmen / Sınıf Açma Desteği' },
                  { value: 'general', label: '💬 Genel Soru / Diğer' }
                ]}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <Input
                  label="Ad Soyad"
                  placeholder="Ahmet Yılmaz"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <Input
                  label="E-posta Adresi"
                  type="email"
                  placeholder="ogrenci@okul.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Konu Başlığı"
                placeholder="Örn: PDF yüklerken dosya boyutu uyarısı aldım"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />

              <Textarea
                label="Açıklama / Mesajınız"
                placeholder="Lütfen karşılaştığınız sorunu veya önerinizi detaylıca anlatınız..."
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                icon={Send}
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                Geri Bildirimi Hazırla
              </Button>
            </form>

            {formSubmitted && (
              <div
                style={{
                  marginTop: '1.5rem',
                  padding: '1.25rem',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 600, fontSize: '0.9rem' }}>
                  <CheckCircle2 size={18} />
                  <span>Mesajınız Hazır! İletmek için bir kanal seçin:</span>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Mail}
                    onClick={handleSendViaEmail}
                    style={{ flex: 1, minWidth: '140px' }}
                  >
                    E-Posta Aç (Gmail)
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    icon={MessageSquare}
                    onClick={handleSendViaWhatsApp}
                    style={{ flex: 1, minWidth: '140px' }}
                  >
                    WhatsApp ile İlet
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* School FAQ Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <HelpCircle size={20} style={{ color: 'var(--accent-cyan)' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Okul Sıkça Sorulan Sorular</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    style={{
                      borderRadius: '14px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      overflow: 'hidden',
                      transition: 'all 0.18s ease'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      style={{
                        width: '100%',
                        padding: '1rem 1.25rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '0.925rem',
                        fontWeight: 600,
                        gap: '0.5rem'
                      }}
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp size={18} style={{ color: 'var(--accent-cyan)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />}
                    </button>

                    {isOpen && (
                      <div
                        style={{
                          padding: '0 1.25rem 1.1rem 1.25rem',
                          color: 'var(--text-secondary)',
                          fontSize: '0.865rem',
                          lineHeight: 1.6,
                          borderTop: '1px solid rgba(255, 255, 255, 0.04)'
                        }}
                      >
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Direct support banner */}
            <div
              style={{
                marginTop: 'auto',
                padding: '1.25rem',
                borderRadius: '14px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem'
              }}
            >
              <Clock size={20} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Teknik destek taleplerinize WhatsApp ve E-posta üzerinden genellikle <strong>15 dakika</strong> içerisinde yanıt verilmektedir.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(9, 9, 11, 0.95)',
          padding: '1.5rem',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            DVLP Platform • Geliştirici: <a href={mainSiteUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-purple)', textDecoration: 'none', fontWeight: 600 }}>dvlp-platform.vercel.app</a>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span>Tel: 0543 141 30 99</span>
            <span>•</span>
            <span>E-posta: dvlp.platform@gmail.com</span>
            <span>•</span>
            <span>Instagram: @dvlp.platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Contact;

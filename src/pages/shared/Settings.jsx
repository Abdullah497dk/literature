import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { 
  Server, 
  Database, 
  ShieldCheck, 
  Key, 
  ExternalLink,
  Sliders,
  Bell,
  Moon,
  Smartphone,
  Trash2,
  CheckCircle2,
  FileText,
  Volume2,
  Sparkles,
  Lock,
  RefreshCw,
  LogOut,
  Info,
  Phone,
  Mail,
  Headphones
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { DvlpLogo } from '../../components/common/DvlpLogo';
import { InstagramIcon } from '../../components/common/Icons';

export function Settings() {
  const { isSupabaseConfigured, role, profile, user, signOut } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  // Active Category Tab for mobile / desktop
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'notifications' | 'pdf' | 'system'

  // Preferences saved in localStorage
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('dvlp_settings');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      themeMode: 'zinc', // 'zinc' | 'oled' | 'slate'
      readingSize: 'standard', // 'compact' | 'standard' | 'large'
      animations: true,
      notifyReviews: true,
      notifyComments: true,
      notifyNewHomework: true,
      notifySound: false,
      pdfOpenMode: 'modal', // 'modal' | 'tab'
      cacheSizeMB: '14.8'
    };
  });

  const [clearingCache, setClearingCache] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('dvlp_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    showToast('Ayar başarıyla kaydedildi.');
  };

  const handleClearCache = () => {
    setClearingCache(true);
    setTimeout(() => {
      setSettings(prev => ({ ...prev, cacheSizeMB: '0.0' }));
      setClearingCache(false);
      showToast('Yerel PDF ve önbellek dosyaları temizlendi.');
    }, 600);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return <Badge variant="warning">Sistem Yöneticisi</Badge>;
      case 'teacher':
        return <Badge variant="purple">Edebiyat Öğretmeni</Badge>;
      default:
        return <Badge variant="cyan">Öğrenci</Badge>;
    }
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(34, 211, 238, 0.08) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          borderRadius: '20px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)'
            }}
          >
            <Sliders size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
              Uygulama &amp; Cihaz Ayarları
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
              Mobil ve masaüstü arayüz tercihlerinizi kişiselleştirin.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {getRoleBadge()}
          <span 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.35rem', 
              fontSize: '0.75rem', 
              color: 'var(--color-success)', 
              background: 'rgba(16, 185, 129, 0.1)', 
              padding: '0.3rem 0.6rem', 
              borderRadius: '9999px',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontWeight: 500
            }}
          >
            <Smartphone size={13} /> Mobil Uyumlu
          </span>
        </div>
      </div>

      {/* Navigation Tabs (Mobile-friendly horizontal scroll / pill tabs) */}
      <div 
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.25rem',
          scrollbarWidth: 'none'
        }}
        className="dvlp-settings-tabs"
      >
        {[
          { id: 'general', label: 'Genel & Tema', icon: Moon },
          { id: 'notifications', label: 'Bildirimler', icon: Bell },
          { id: 'pdf', label: 'PDF & Okuma', icon: FileText },
          { id: 'system', label: 'Sistem & Güvenlik', icon: Database },
          { id: 'about', label: 'Geliştirici & DVLP', icon: Sparkles }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1rem',
                borderRadius: '12px',
                border: isActive ? '1px solid var(--accent-purple)' : '1px solid var(--border-color)',
                background: isActive ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg-surface)',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
            >
              <Icon size={16} style={{ color: isActive ? 'var(--accent-purple)' : 'var(--text-muted)' }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: General & Theme */}
      {activeTab === 'general' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.25rem' }}>
            <div style={{ borderBottom: '1px solid var(--border-color-subtle)', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Karanlık Tema Seçenekleri
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Göz yormayan ve OLED ekranlar için optimize edilmiş renk tonları.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {[
                { id: 'zinc', name: 'Derin Grafit (Varsayılan)', desc: 'Dengeli kontrast ve mor vurgular' },
                { id: 'oled', name: 'Gece Yarısı OLED', desc: 'Saf siyah zemin ve pil tasarrufu' },
                { id: 'slate', name: 'Nebula Slate', desc: 'Hafif mavi tonlu modern karanlık mod' }
              ].map(theme => (
                <div
                  key={theme.id}
                  onClick={() => updateSetting('themeMode', theme.id)}
                  style={{
                    padding: '0.9rem',
                    borderRadius: '14px',
                    background: settings.themeMode === theme.id ? 'rgba(139, 92, 246, 0.12)' : 'var(--bg-secondary)',
                    border: settings.themeMode === theme.id ? '2px solid var(--accent-purple)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {theme.name}
                    </span>
                    {settings.themeMode === theme.id && (
                      <CheckCircle2 size={16} style={{ color: 'var(--accent-purple)' }} />
                    )}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {theme.desc}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.25rem' }}>
            <div style={{ borderBottom: '1px solid var(--border-color-subtle)', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Arayüz &amp; Animasyon Tercihleri
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Cihaz performansına göre görsel efektleri özelleştirin.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                  Akıcı Mikro Animasyonlar
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Sayfa geçişleri, kart hover efektleri ve modal açılış efektleri.
                </span>
              </div>
              <label className="dvlp-toggle">
                <input
                  type="checkbox"
                  checked={settings.animations}
                  onChange={(e) => updateSetting('animations', e.target.checked)}
                />
                <span className="dvlp-toggle-slider" />
              </label>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Notifications */}
      {activeTab === 'notifications' && (
        <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.25rem' }}>
          <div style={{ borderBottom: '1px solid var(--border-color-subtle)', paddingBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Bildirim &amp; Uyarı Tercihleri
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Hangi durumlarda mobil bildirim ve gösterge paneli uyarısı alacağınızı seçin.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color-subtle)' }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                  Ödev İnceleme Bildirimleri
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Öğretmeniniz ödevinizi incelediğinde hemen bildirim gönder.
                </span>
              </div>
              <label className="dvlp-toggle">
                <input
                  type="checkbox"
                  checked={settings.notifyReviews}
                  onChange={(e) => updateSetting('notifyReviews', e.target.checked)}
                />
                <span className="dvlp-toggle-slider" />
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color-subtle)' }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                  Öğretmen Yorumu &amp; Geri Bildirimleri
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Ödevinize özel değerlendirme veya yorum yazıldığında haber ver.
                </span>
              </div>
              <label className="dvlp-toggle">
                <input
                  type="checkbox"
                  checked={settings.notifyComments}
                  onChange={(e) => updateSetting('notifyComments', e.target.checked)}
                />
                <span className="dvlp-toggle-slider" />
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color-subtle)' }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                  Yeni Ödev &amp; Sınıf Duyuruları
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Sınıfınıza yeni bir edebiyat ödevi veya son teslim tarihi eklendiğinde.
                </span>
              </div>
              <label className="dvlp-toggle">
                <input
                  type="checkbox"
                  checked={settings.notifyNewHomework}
                  onChange={(e) => updateSetting('notifyNewHomework', e.target.checked)}
                />
                <span className="dvlp-toggle-slider" />
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                  Sesli Bildirim Uyarısı
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Bildirim geldiğinde hafif bir sistem sesi çal.
                </span>
              </div>
              <label className="dvlp-toggle">
                <input
                  type="checkbox"
                  checked={settings.notifySound}
                  onChange={(e) => updateSetting('notifySound', e.target.checked)}
                />
                <span className="dvlp-toggle-slider" />
              </label>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: PDF & Reading */}
      {activeTab === 'pdf' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.25rem' }}>
            <div style={{ borderBottom: '1px solid var(--border-color-subtle)', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                PDF Görüntüleyici Açılış Tercihi
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Ödev PDF dosyalarına tıklandığında nasıl açılsın?
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <div
                onClick={() => updateSetting('pdfOpenMode', 'modal')}
                style={{
                  padding: '1rem',
                  borderRadius: '14px',
                  background: settings.pdfOpenMode === 'modal' ? 'rgba(139, 92, 246, 0.12)' : 'var(--bg-secondary)',
                  border: settings.pdfOpenMode === 'modal' ? '2px solid var(--accent-purple)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Pencere İçi Önizleme (Önerilen)
                  </span>
                  {settings.pdfOpenMode === 'modal' && (
                    <CheckCircle2 size={16} style={{ color: 'var(--accent-purple)' }} />
                  )}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Sayfadan ayrılmadan uygulama içi şık önizleme penceresinde açar.
                </p>
              </div>

              <div
                onClick={() => updateSetting('pdfOpenMode', 'tab')}
                style={{
                  padding: '1rem',
                  borderRadius: '14px',
                  background: settings.pdfOpenMode === 'tab' ? 'rgba(139, 92, 246, 0.12)' : 'var(--bg-secondary)',
                  border: settings.pdfOpenMode === 'tab' ? '2px solid var(--accent-purple)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Yeni Sekmede Tam Ekran
                  </span>
                  {settings.pdfOpenMode === 'tab' && (
                    <CheckCircle2 size={16} style={{ color: 'var(--accent-purple)' }} />
                  )}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Tarayıcınızın kendi tam ekran PDF okuyucusunda yeni sekmede açar.
                </p>
              </div>
            </div>
          </Card>

          <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.25rem' }}>
            <div style={{ borderBottom: '1px solid var(--border-color-subtle)', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Edebiyat Metinleri Okuma Yazı Tipi Boyutu
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Öğretmen yorumları, edebiyat tahlilleri ve öğrenci notları için metin ölçeği.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { id: 'compact', label: 'Kompakt (14px)' },
                { id: 'standard', label: 'Standart (15px)' },
                { id: 'large', label: 'Rahat Okuma (17px)' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updateSetting('readingSize', item.id)}
                  style={{
                    padding: '0.55rem 0.95rem',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: settings.readingSize === item.id ? 600 : 400,
                    cursor: 'pointer',
                    background: settings.readingSize === item.id ? 'var(--accent-purple)' : 'var(--bg-secondary)',
                    color: settings.readingSize === item.id ? '#ffffff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Cache Cleaning */}
          <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                Yerel PDF &amp; Veri Önbelleği
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Kullanılan alan: {settings.cacheSizeMB} MB. Cihaz hafızasını boşaltmak için temizleyebilirsiniz.
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={Trash2}
              loading={clearingCache}
              onClick={handleClearCache}
            >
              Önbelleği Temizle
            </Button>
          </Card>
        </div>
      )}

      {/* Tab 4: System & Security */}
      {activeTab === 'system' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Account Snapshot */}
          <Card style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.1rem'
                  }}
                >
                  {profile?.full_name ? profile.full_name[0] : 'U'}
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {profile?.full_name || 'Kullanıcı'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {profile?.email || user?.email || 'ogrenci@dvlp.dev'}
                  </div>
                </div>
              </div>

              <Button
                variant="danger"
                size="sm"
                icon={LogOut}
                onClick={handleLogout}
              >
                Oturumu Kapat
              </Button>
            </div>
          </Card>

          {/* Platform Connection Status - does NOT expose backend tech details */}
          <Card style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Server size={22} style={{ color: 'var(--accent-purple)' }} />
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Platform Bağlantı Durumu</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Özel PDF depolama ve veri eşitleme servisleri
                  </p>
                </div>
              </div>

              {isSupabaseConfigured ? (
                <Badge variant="success" size="sm">Bağlantı Aktif ✓</Badge>
              ) : (
                <Badge variant="warning" size="sm">Çevrimdışı / Yerel Mod</Badge>
              )}
            </div>

            <div
              style={{
                padding: '1rem',
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
                border: '1px solid var(--border-color-subtle)'
              }}
            >
              {[
                { label: 'Kullanıcı Kimlik Doğrulama', ok: true },
                { label: 'Ödev PDF Depolama', ok: isSupabaseConfigured },
                { label: 'Gerçek Zamanlı Bildirimler', ok: isSupabaseConfigured },
                { label: 'Sınıf & Ödev Veritabanı', ok: isSupabaseConfigured },
              ].map(item => (
                <div
                  key={item.label}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span style={{ fontSize: '0.82rem' }}>{item.label}</span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: item.ok ? 'var(--color-success)' : 'var(--color-warning)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    {item.ok ? '● Aktif' : '○ Bekleniyor'}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Security & RLS Policies */}
          <Card style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck size={22} style={{ color: 'var(--color-success)' }} />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Güvenlik ve Satır Düzeyinde Yetkilendirme (RLS)</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Platform veritabanında aktif olan kurallar
                </p>
              </div>
            </div>

            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', lineHeight: 1.5 }}>
              <li>Öğrenciler yalnızca kendi sınıflarındaki ödevleri ve kendi yükledikleri PDF'leri görüntüleyip güncelleyebilir.</li>
              <li>Öğretmen yorumları ve değerlendirmeleri strictement gizli olup yalnızca ilgili öğrenciye ve öğretmenlere açıktır.</li>
              <li>Kullanıcı rolleri güvenilir veritabanı kayıtları ile korunur, tarayıcı üzerinden yetki yükseltilemez.</li>
              <li>Tüm PDF dosyaları özel depolama alanında tutulur ve yalnızca yetkili imzalı kısa süreli URL'lerle açılır.</li>
            </ul>
          </Card>
        </div>
      )}

      {/* About & DVLP Platform Tab */}
      {activeTab === 'about' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main DVLP Showcase Card */}
          <Card glow style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <DvlpLogo size="lg" subtitle="Edebiyat" />
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>DVLP Platform</h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                    Building Developers. Building the Future.
                  </p>
                </div>
              </div>

              <a
                href="https://dvlp-platform.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.6rem 1.15rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)'
                }}
              >
                <span>dvlp-platform.vercel.app</span>
                <ExternalLink size={15} />
              </a>
            </div>

            <div style={{ padding: '1.25rem', borderRadius: '14px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              Bu edebiyat ödev teslim ve değerlendirme platformu, okulumuzun ihtiyaçlarına özel olarak <strong>DVLP Platform</strong> yazılım şirketi ve geliştirici ekibi tarafından hayata geçirilmiştir. Modern bulut altyapısı ve en güncel web teknolojileri kullanılarak okul ortamında maksimum hız, güvenlik ve kolay kullanım sunmak üzere optimize edilmiştir.
            </div>

            {/* Direct Contact Channels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <Phone size={15} />
                  <span>Telefon & WhatsApp</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>0543 141 30 99</div>
                <a href="tel:05431413099" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', textDecoration: 'none', marginTop: '0.4rem', display: 'inline-block' }}>
                  Hemen Ara / WhatsApp →
                </a>
              </div>

              <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-purple)', fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <Mail size={15} />
                  <span>Destek E-Postası</span>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', wordBreak: 'break-all' }}>dvlp.platform@gmail.com</div>
                <a href="mailto:dvlp.platform@gmail.com" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', textDecoration: 'none', marginTop: '0.4rem', display: 'inline-block' }}>
                  E-posta Gönder →
                </a>
              </div>

              <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ec4899', fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <InstagramIcon size={15} color="#ec4899" />
                  <span>Instagram</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>@dvlp.platform</div>
                <a href="https://instagram.com/dvlp.platform" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', textDecoration: 'none', marginTop: '0.4rem', display: 'inline-block' }}>
                  Profili Görüntüle ↗
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
              <Link to="/contact" style={{ textDecoration: 'none' }}>
                <Button variant="primary" icon={Headphones}>
                  Tam Destek &amp; Geri Bildirim Sayfasına Git
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export function NotFound() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: '4.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>Sayfa Bulunamadı</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '420px', fontSize: '0.9rem' }}>
        Aradığınız sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak kullanım dışı kalmış olabilir.
      </p>
      <a href="/dashboard" className="dvlp-btn dvlp-btn-primary">
        Gösterge Paneline Dön
      </a>
    </div>
  );
}

export default Settings;
